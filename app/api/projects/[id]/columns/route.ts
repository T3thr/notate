// app/api/projects/[id]/columns/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { kanbanColumns, tasks } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { options } from '@/app/api/auth/[...nextauth]/options';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(options);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const columns = await db.query.kanbanColumns.findMany({
      where: eq(kanbanColumns.projectId, parseInt(params.id)),
      with: {
        tasks: {
          with: {
            assignee: true,
          },
        },
      },
      orderBy: kanbanColumns.position,
    });

    return NextResponse.json({ columns });
  } catch (error) {
    console.error('Error fetching kanban columns:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}