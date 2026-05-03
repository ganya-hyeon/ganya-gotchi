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
    
    if (!process.env.SANITY_WRITE_TOKEN) {
      console.error('SANITY_WRITE_TOKEN is missing in environment variables');
      return NextResponse.json({ error: 'Server configuration error: missing token' }, { status: 500 });
    }

    const newMessage = {
      _type: 'message',
      id: Date.now().toString(),
      role: body.role || 'Explorer',
      content: body.content,
      timestamp: new Date().toISOString(),
      status: 'unread'
    };
    
    console.log('Attempting to create message in Sanity:', newMessage.id);
    const result = await client.create(newMessage);
    console.log('Message created successfully:', result._id);
    
    return NextResponse.json({ success: true, message: result });
  } catch (error) {
    console.error('CRITICAL: Failed to save message to Sanity:', error);
    const err = error as { message?: string, response?: { body?: unknown } };
    return NextResponse.json({ 
      error: err.message || 'Failed to save message',
      details: err.response?.body || undefined
    }, { status: 500 });
  }
}

// Netlify/Production environments don't support file system writes,
// so we've migrated to Sanity CMS for data persistence.
