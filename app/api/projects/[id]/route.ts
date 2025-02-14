// app/api/projects/[id]/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { projects, projectMembers } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
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

    const project = await db.query.projects.findFirst({
      where: eq(projects.id, parseInt(params.id)),
      with: {
        workspace: true,
        creator: true,
        members: {
          with: {
            user: true,
          },
        },
      },
    }) as {
      id: number;
      name: string;
      createdAt: Date;
      updatedAt: Date;
      workspaceId: number;
      description: string | null;
      type: string | null;
      isPersonal: boolean;
      createdById: number | null;
      members: {
        userId: number;
        user: {
          id: number;
          email: string;
          name: string;
        };
      }[];
    } | undefined;

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Check if user is a member of the project
    const isMember = project.members.some(
      (member) => member.userId === parseInt(session.user.id)
    );
    if (!isMember) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(options);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is project owner
    const projectMember = await db.query.projectMembers.findFirst({
      where: and(
        eq(projectMembers.projectId, parseInt(params.id)),
        eq(projectMembers.userId, parseInt(session.user.id)),
        eq(projectMembers.role, 'owner')
      ),
    });

    if (!projectMember) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await db.delete(projects).where(eq(projects.id, parseInt(params.id)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}