// app/api/projects/route.ts
import { NextResponse } from 'next/server'
import { db } from '@/db'
import { getServerSession } from 'next-auth'
import { projects, workspaces, workspaceMembers } from '@/db/schema'

export async function POST(req: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { name, workspaceId, isPersonal } = await req.json()
    if (!name) {
      return new NextResponse('Name is required', { status: 400 })
    }

    // If workspace project, verify user has access to workspace
    if (workspaceId) {
      const workspace = await db.query.workspaces.findFirst({
        where: (workspaces, { eq, or }) => or(
          eq(workspaces.id, workspaceId),
          eq(workspaceMembers.workspaceId, workspaceId)
        )
      })

      if (!workspace) {
        return new NextResponse('Workspace not found or access denied', { status: 404 })
      }
    }

    const project = await db.insert(projects).values({
      name,
      workspaceId: workspaceId || null,
      isPersonal: isPersonal || false,
      ownerId: session.user.id
    }).returning()

    return NextResponse.json(project[0])
  } catch (error) {
    console.error('Error creating project:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}