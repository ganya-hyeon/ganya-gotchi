import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const ANALYTICS_PATH = path.resolve(process.cwd(), '..', 'ganya-gotchi', 'public', 'data', 'analytics.json');

export async function GET() {
  try {
    const data = await fs.readFile(ANALYTICS_PATH, 'utf-8');
    return NextResponse.json(JSON.parse(data));
  } catch {
    return NextResponse.json({ error: 'Failed to read analytics' }, { status: 500 });
  }
}
