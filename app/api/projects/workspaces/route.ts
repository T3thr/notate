// app/api/workspaces/route.ts
import { NextResponse } from 'next/server'
import { db } from '@/db'
import { eq, or } from 'drizzle-orm'
import { getServerSession } from 'next-auth'
import { workspaces, workspaceMembers, users } from '@/db/schema'
import { slugify } from '@/lib/utils'
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const userWorkspaces = await db.query.workspaces.findMany({
      where: (workspaces, { eq, or }) => or(
        eq(workspaces.ownerId, session.user.id), // Correct usage of `eq` function
        eq(workspaceMembers.userId, session.user.id)
      ),
      with: {
        projects: true
      },
      orderBy: workspaces.createdAt
    })

    // Include additional fields for the workspace data in the response
    return NextResponse.json(userWorkspaces)
  } catch (error) {
    console.error('Error fetching workspaces:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { name } = await req.json()
    if (!name) {
      return new NextResponse('Name is required', { status: 400 })
    }

    const slug = slugify(name)

    // Default settings and plan for the new workspace
    const defaultSettings = {
      features: {
        tasks: true,
        wiki: true,
        files: true,
        calendar: true,
        timeTracking: true,
        automation: false, // Assuming automation is off by default
      },
      branding: {
        colors: {
          primary: '#1f1f1f', // Default primary color
          secondary: '#f4f4f4', // Default secondary color
          accent: '#007bff', // Default accent color
        },
      },
      security: {
        mfa: false, // Default MFA setting
        sso: false, // Default SSO setting
        passwordPolicy: {
          minLength: 8, // Default password minimum length
          requireSpecialChars: true, // Require special characters by default
        },
      },
    }

    const defaultPlan = 'free' // Assuming 'free' is the default plan from your enum
    
    // Generate a unique id (UUID) for the workspace
    const workspaceId = uuidv4()

    // Create the workspace with default settings and plan
    const workspace = await db.insert(workspaces).values({
      id: workspaceId,
      name,
      slug,
      ownerId: session.user.id,
      settings: defaultSettings, // Default settings
      plan: defaultPlan, // Default plan
    }).returning()

    return NextResponse.json(workspace[0]) // Return the created workspace
  } catch (error) {
    console.error('Error creating workspace:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
