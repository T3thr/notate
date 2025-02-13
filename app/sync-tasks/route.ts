import { db } from '@/db/index';
import { tasks } from '@/db/schema';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const offlineTasks = await req.json();
    await db.insert(tasks).values(offlineTasks);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to sync tasks' }, { status: 500 });
  }
}
