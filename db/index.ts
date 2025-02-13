// db/index.ts
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';
import { config } from 'dotenv';
import { desc, eq } from 'drizzle-orm';

config({ path: '.env' });

const sql = neon(process.env.DATABASE_URL!);

// Create db instance with schema
export const db = drizzle(sql, { schema });

// Helper functions for common database operations
export async function findUserByEmail(email: string) {
  return await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, email.toLowerCase()))
    .limit(1)
    .then(rows => rows[0] || null);
}

export async function findUserByUsername(username: string) {
  return await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.username, username.toLowerCase()))
    .limit(1)
    .then(rows => rows[0] || null);
}

export async function validateUserCredentials({ 
  email, 
  username, 
  password 
}: { 
  email?: string; 
  username?: string; 
  password?: string;
}) {
  if (!password || !(email || username)) {
    throw new Error("Invalid credentials");
  }

  const user = email 
    ? await findUserByEmail(email)
    : await findUserByUsername(username!);

  if (!user) {
    throw new Error("User not found");
  }

  return user;
}