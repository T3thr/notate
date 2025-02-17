// app/api/projects/personal/route.ts
import { NextResponse } from 'next/server'
import { db } from '@/db'
import { eq } from 'drizzle-orm'
import { getServerSession } from 'next-auth'
import { projects } from '@/db/schema'

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const personalProjects = await db.query.projects.findMany({
      where: (projects, { eq, and }) => and(
        eq(projects.ownerId, session.user.id),
        eq(projects.isPersonal, true)
      ),
      orderBy: projects.createdAt
    })

    return NextResponse.json(personalProjects)
  } catch (error) {
    console.error('Error fetching personal projects:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}