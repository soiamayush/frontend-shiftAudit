import { NextResponse } from 'next/server';
import { API_ROUTES } from '@/config';


export async function POST(request: Request) {
  try {
    const { website } = await request.json();

    if (!website) {
      return NextResponse.json(
        { error: 'Website URL is required' },
        { status: 400 }
      );
    }

    // Forward the request to backend
    const response = await fetch(API_ROUTES.ANALYZE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: website }),
    });

    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error forwarding request:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}