import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { db } from '@/db'; // Assuming you have a db client setup
import { projects } from '@/db/schema'; // Import the projects table from your schema
import { eq } from 'drizzle-orm';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { workspaceId } = req.query;

  if (!workspaceId) {
    return res.status(400).json({ error: 'Workspace ID is required' });
  }

  try {
    // Fetch projects associated with the specified workspace
    const workspaceProjects = await db
      .select()
      .from(projects)
      .where(eq(projects.workspaceId, parseInt(workspaceId as string, 10)));

    return res.status(200).json({ projects: workspaceProjects });
  } catch (error) {
    console.error('Error fetching workspace projects:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}