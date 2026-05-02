import { NextResponse } from 'next/server';
import { client } from '@/lib/sanity';

export async function GET() {
  try {
    const data = await client.fetch(`*[_type == "project"] | order(year desc)`);
    // Ensure ID consistency for the frontend
    const mappedData = data.map((p: any) => ({
      ...p,
      id: p.projectId || p._id
    }));
    return NextResponse.json(mappedData);
  } catch {
    return NextResponse.json({ error: 'Failed to read from Sanity' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // If we receive an array (legacy logic), we might need to handle it differently,
    // but for Sanity we want to handle individual projects.
    if (Array.isArray(body)) {
      // For now, if we get an array, we'll assume we're saving the whole list (not recommended for production Sanity)
      // but to keep the frontend working, we'll process them.
      // Better: Update individual document if ID exists.
      for (const project of body) {
        const doc = {
          _type: 'project',
          _id: `project-${project.id}`,
          ...project,
          projectId: project.id,
        };
        delete doc.id; // Sanity uses _id
        await client.createOrReplace(doc);
      }
    } else {
      // Single project update
      const doc = {
        _type: 'project',
        _id: `project-${body.id}`,
        ...body,
        projectId: body.id,
      };
      delete doc.id;
      await client.createOrReplace(doc);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Sanity Write Error:', error);
    return NextResponse.json({ error: 'Failed to write to Sanity' }, { status: 500 });
  }
}
