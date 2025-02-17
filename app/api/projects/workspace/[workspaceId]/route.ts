// app/api/projects/workspace/[workspaceId]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt'; // Use getToken to retrieve session from cookies
import { db } from '@/db'; // Assuming you have a db client setup
import { projects } from '@/db/schema'; // Import the projects table from your schema
import { eq } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  // Retrieve the session using the JWT token from cookies
  const session = await getToken({ req });

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const workspaceId = req.nextUrl.searchParams.get('workspaceId'); // Extract workspaceId from the URL

  if (!workspaceId) {
    return NextResponse.json({ error: 'Workspace ID is required' }, { status: 400 });
  }

  try {
    // Fetch projects associated with the specified workspace
    const workspaceProjects = await db
      .select()
      .from(projects)
      .where(eq(projects.workspaceId, parseInt(workspaceId, 10)));

    return NextResponse.json({ projects: workspaceProjects });
  } catch (error) {
    console.error('Error fetching workspace projects:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
