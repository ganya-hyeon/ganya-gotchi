import { NextResponse } from 'next/server';
import { client } from '@/lib/sanity';

export async function GET() {
  try {
    const query = `*[_type == "message"] | order(timestamp desc)`;
    const messages = await client.fetch(query);
    return NextResponse.json(messages);
  } catch (error) {
    console.error('Failed to fetch messages:', error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const newMessage = {
      _type: 'message',
      id: Date.now().toString(),
      role: body.role || 'Explorer',
      content: body.content,
      timestamp: new Date().toISOString(),
      status: 'unread'
    };
    
    const result = await client.create(newMessage);
    
    return NextResponse.json({ success: true, message: result });
  } catch (error: any) {
    console.error('Failed to save message to Sanity:', error);
    return NextResponse.json({ error: error.message || 'Failed to save message' }, { status: 500 });
  }
}

// Netlify/Production environments don't support file system writes,
// so we've migrated to Sanity CMS for data persistence.
