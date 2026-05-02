import { createClient } from '@sanity/client';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const client = createClient({
  projectId: 'c4ogf9zt',
  dataset: 'production',
  apiVersion: '2024-05-02',
  useCdn: false,
  token: process.env.SANITY_WRITE_TOKEN, // Make sure this is in your .env.local
});

const MIGRATION_PATH = path.resolve(process.cwd(), '..', 'ganya-gotchi', 'public', 'data', 'projects.json');

async function migrate() {
  try {
    console.log('Reading local data...');
    const data = await fs.readFile(MIGRATION_PATH, 'utf-8');
    const projects = JSON.parse(data);

    console.log(`Found ${projects.length} projects. Starting migration...`);

    for (const project of projects) {
      console.log(`Migrating: ${project.name}...`);
      
      const doc = {
        _type: 'project',
        _id: `project-${project.id}`, // Maintain consistent ID
        projectId: project.id,
        name: project.name,
        cat: project.cat,
        client: project.client,
        year: project.year,
        roles: project.roles,
        status: project.status,
        size: project.size,
        desc: project.desc,
        outcomes: project.outcomes,
        meta: project.meta,
        thumbnail: project.thumbnail || '',
      };

      await client.createOrReplace(doc);
      console.log(`Successfully migrated: ${project.name}`);
    }

    console.log('MIGRATION COMPLETE!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

migrate();
