// app/api/auth/signup/route.ts
import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid"; // For generating unique usernames

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

    // Check if user exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate a unique username
    const username = `user_${uuidv4().split("-")[0]}`; // Example: user_1a2b3c

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        email,
        name,
        username, // Provide a unique username
        password: hashedPassword,
        role: "user",
        createdAt: new Date(), // Provide createdAt
        updatedAt: new Date(), // Provide updatedAt
      })
      .returning();

    return NextResponse.json(
      {
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { message: "Error creating user" },
      { status: 500 }
    );
  }
}