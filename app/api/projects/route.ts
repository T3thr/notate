// app/api/projects/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { projects, tasks, kanbanColumns, workspaces, projectMembers } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { options } from '@/app/api/auth/[...nextauth]/options';

export async function GET() {
    try {
        const session = await getServerSession(options);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userProjects = await db.query.projects.findMany({
            where: (projects, { eq, or, and }) => or(
              eq(projects.createdById, parseInt(session.user.id)),
              and(
                eq(projectMembers.projectId, projects.id), // ✅ ใช้ `projects.id` แทน `projects.project_id`
                eq(projectMembers.userId, parseInt(session.user.id))
              )
            ),
            with: {
              members: {
                with: {
                  user: true,
                },
              },
              pages: true,
            },
          });
          

        return NextResponse.json({ projects: userProjects });
    } catch (error) {
        console.error('Error fetching projects:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
  
export async function POST(req: Request) {
  try {
    const session = await getServerSession(options);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description, type, workspaceId } = await req.json();

    // First create the project   
    const [newProject] = await db
      .insert(projects)
      .values({
        name,
        description,
        type,
        workspaceId,
        createdById: parseInt(session.user.id),
      })
      .returning();

    // Then create default kanban columns
    const defaultColumns = ['To Do', 'In Progress', 'Done'];
    await Promise.all(
      defaultColumns.map((name, index) =>
        db.insert(kanbanColumns).values({
          projectId: newProject.id,
          name,
          position: index,
        })
      )
    );

    // Add creator as project member with owner role
    await db.insert(projectMembers).values({
        projectId: newProject.id,
        userId: parseInt(session.user.id),
        role: 'owner',
    });

    return NextResponse.json(newProject);
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}