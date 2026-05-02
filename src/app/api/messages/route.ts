import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const MESSAGES_PATH = path.resolve(process.cwd(), 'public', 'data', 'messages.json');

export async function GET() {
  try {
    const data = await fs.readFile(MESSAGES_PATH, 'utf-8');
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    let messages = [];
    try {
      const data = await fs.readFile(MESSAGES_PATH, 'utf-8');
      messages = JSON.parse(data);
    } catch (readError) {
      console.error('Read error (starting fresh):', readError);
      messages = [];
    }
    
    const newMessage = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      role: body.role,
      content: body.content,
      status: 'unread'
    };
    
    messages.unshift(newMessage);
    await fs.writeFile(MESSAGES_PATH, JSON.stringify(messages, null, 2));
    
    return NextResponse.json({ success: true, message: newMessage });
  } catch (error: any) {
    console.error('Failed to save message:', error);
    return NextResponse.json({ 
      error: 'Failed to save message', 
      details: error.message,
      path: MESSAGES_PATH 
    }, { status: 500 });
  }
}
