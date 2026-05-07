// app/api/resolve-google-maps-url/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { isValidGoogleMapsUrl } from '@/utils/googleMapsExtractor';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  
  if (!url) {
    return NextResponse.json(
      { error: 'Missing url parameter' },
      { status: 400 }
    );
  }
  
  if (!isValidGoogleMapsUrl(url)) {
    return NextResponse.json(
      { error: 'Invalid Google Maps URL' },
      { status: 400 }
    );
  }
  
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const finalUrl = response.url;
    
    if (!finalUrl) {
      throw new Error('No final URL obtained after redirects');
    }
    
    if (!isValidGoogleMapsUrl(finalUrl)) {
      return NextResponse.json(
        { error: 'Resolved URL is not a valid Google Maps URL' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ finalUrl });
  } catch (error) {
    console.error('Error resolving Google Maps URL:', error);
    return NextResponse.json(
      { error: 'Failed to resolve URL' },
      { status: 500 }
    );
  }
}