// app/api/auth/[...nextauth]/options.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { validateUserCredentials } from "@/db";
import bcrypt from "bcrypt";
import * as crypto from 'crypto';
import { DefaultSession, DefaultUser } from "next-auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

// Enhanced types for better type safety
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: string;
      username?: string;
      isVerified?: boolean;
      avatar?: {
        url: string;
      isVerified: string
      };
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role: string;
    username?: string;
    isVerified?: boolean;
  }
}

export const options: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: "openid email profile https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/spreadsheets.readonly",
        },
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        type: { label: "Type", type: "text" }, // Add type field to distinguish between admin and user
        email: { label: "Email", type: "text" },
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials) {
            throw new Error("No credentials provided");
          }

          // Admin authentication
          if (credentials.type === 'admin') {
            if (
              credentials.email === process.env.ADMIN_EMAIL &&
              credentials.password === process.env.ADMIN_PASSWORD
            ) {
              return {
                id: "admin",
                email: process.env.ADMIN_EMAIL,
                name: "admin",
                username: "Admin",
                role: "admin",
                isVerified: true,
              };
            }
            throw new Error("Invalid admin credentials");
          }

          // Regular user authentication
          if (!credentials.email && !credentials.username) {
            throw new Error("Email or username is required");
          }

          const user = await validateUserCredentials({
            email: credentials.email,
            username: credentials.username,
            password: credentials.password,
          });

          if (!user) {
            throw new Error("User not found");
          }

          const isValidPassword = await bcrypt.compare(
            credentials.password || "",
            user.password
          );

          if (!isValidPassword) {
            throw new Error("Invalid password");
          }

          if (!user.isVerified) {
            throw new Error("Please verify your email before signing in");
          }

          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name,
            username: user.username,
            role: user.role,
            avatar: user.image,
            isVerified: user.isVerified,
          };
        } catch (error: any) {
          throw new Error(error.message || "Authentication failed");
        }
      },
    }),
  ],
  pages: {
    signIn: "/signin",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          const existingUser = await db
            .select()
            .from(users)
            .where(eq(users.email, user.email!))
            .limit(1)
            .then(rows => rows[0]);

          if (!existingUser) {
            const randomPassword = crypto.randomBytes(32).toString("hex");
            const hashedPassword = await bcrypt.hash(randomPassword, 10);
            const username = `user_${crypto.randomBytes(6).toString("hex")}`;

            const [newUser] = await db
              .insert(users)
              .values({
                email: user.email!,
                name: user.name!,
                username,
                avatar: user.image,
                role: "user",
                password: hashedPassword,
                isVerified: true, // Google users are automatically verified
              })
              .returning();

            if (!newUser) {
              return false;
            }
          }
          return true;
        } catch (error) {
          console.error("Error during Google sign in:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.username = user.username;
        token.isVerified = user.isVerified;
      }
      if (account?.provider === "google") {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
      }
      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          role: token.role,
          username: token.username,
          isVerified: token.isVerified,
        },
      };
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default options;