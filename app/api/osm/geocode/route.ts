import { NextRequest, NextResponse } from 'next/server';
import { OSMService } from '@/utils/googleMapsExtractor';

/**
 * Server-side proxy para o Nominatim (reverse + forward geocode).
 * O browser nao pode impor o header 'User-Agent' (forbidden header), e o
 * Nominatim/Cloudflare bloqueia sessions sem UA proprio -> "Failed to fetch"
 * client-side. Correr o fetch aqui (Node) deixa impor o UA FoodLister.
 * Mesmo padrao do resolve-google-maps-url.
 */
export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const lat = sp.get('lat');
  const lon = sp.get('lon');
  const q = sp.get('q');

  try {
    // Reverse geocode: lat+lon -> address
    if (lat !== null && lon !== null) {
      const address = await OSMService.reverseGeocode(
        parseFloat(lat),
        parseFloat(lon)
      );
      return NextResponse.json({ address });
    }

    // Forward geocode: query -> { latitude, longitude, display_name }
    if (q) {
      const result = await OSMService.forwardGeocode(q);
      return NextResponse.json({ result });
    }

    return NextResponse.json(
      { error: 'Params necessarios: lat+lon OU q' },
      { status: 400 }
    );
  } catch (error) {
    console.error('OSM geocode error:', error);
    return NextResponse.json({ error: 'Failed to geocode' }, { status: 500 });
  }
}
