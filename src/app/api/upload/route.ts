import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save to main app's public/uploads folder
    const mainUploadDir = path.resolve(process.cwd(), '..', 'ganya-gotchi', 'public', 'uploads');
    const adminUploadDir = path.resolve(process.cwd(), 'public', 'uploads');
    
    // Ensure directories exist
    await fs.mkdir(mainUploadDir, { recursive: true });
    await fs.mkdir(adminUploadDir, { recursive: true });

    const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
    
    await fs.writeFile(path.join(mainUploadDir, fileName), buffer);
    await fs.writeFile(path.join(adminUploadDir, fileName), buffer);

    return NextResponse.json({ 
      success: true, 
      url: `/uploads/${fileName}` 
    });
  } catch {
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
  }
}
