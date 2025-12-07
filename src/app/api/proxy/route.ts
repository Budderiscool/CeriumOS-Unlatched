import { type NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return new NextResponse('URL parameter is required', { status: 400 });
  }

  let fullUrl: URL;
  try {
    fullUrl = new URL(url);
  } catch (error) {
     return new NextResponse('Invalid URL provided', { status: 400 });
  }

  try {
    const response = await fetch(fullUrl.toString(), {
      headers: {
        'User-Agent': request.headers.get('user-agent') || 'CeriumOS/1.0 Browser',
      },
      // Vercel enables caching for fetch requests by default.
      // We disable it to get the freshest content.
      cache: 'no-store',
    });
    
    // Create a new response, streaming the body
    const { readable, writable } = new TransformStream();
    response.body?.pipeTo(writable);

    const headers = new Headers(response.headers);
    // Remove headers that can cause issues
    headers.delete('Content-Security-Policy');
    headers.delete('X-Frame-Options');
    
    return new NextResponse(readable, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  } catch (error) {
    console.error('Proxy error:', error);
    if (error instanceof Error) {
        return new NextResponse(`Failed to fetch the requested URL: ${error.message}`, { status: 500 });
    }
    return new NextResponse('An unknown error occurred while fetching the URL.', { status: 500 });
  }
}
