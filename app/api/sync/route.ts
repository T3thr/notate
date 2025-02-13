import { db } from "@/db";
import { tasks } from "@/db/schema";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    for (const task of body) {
      await db.insert(tasks).values(task).onConflictDoNothing();
    }
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to sync tasks" }), { status: 500 });
  }
}
