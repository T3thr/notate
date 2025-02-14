// app/api/tasks/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { tasks } from '@/db/schema';
import { getServerSession } from 'next-auth';
import { options } from '@/app/api/auth/[...nextauth]/options';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(options);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, description, projectId, kanbanColumnId, dueDate, priority, assigneeId } = await req.json();

    const [newTask] = await db
      .insert(tasks)
      .values({
        title,
        description,
        projectId,
        kanbanColumnId,
        dueDate: dueDate ? new Date(dueDate) : null,
        priority,
        assigneeId,
      })
      .returning();

    return NextResponse.json(newTask);
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}