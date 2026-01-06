// utils/googleMapsExtractor.ts

/**
 * Extrai informações de um link do Google Maps
 * Suporta vários formatos de URLs do Google Maps
 */
export interface GoogleMapsData {
  name?: string;
  address?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  source_url: string;
}

export function extractGoogleMapsData(url: string): GoogleMapsData {
  const result: GoogleMapsData = {
    source_url: url
  };

  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const searchParams = urlObj.searchParams;

    // Formato: https://www.google.com/maps/place/{name}/{data}/
    // ou https://www.google.com/maps/@{lat},{lng},{zoom}z
    
    // Tenta extrair latitude e longitude
    const coordsMatch = pathname.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (coordsMatch) {
      result.latitude = parseFloat(coordsMatch[1]);
      result.longitude = parseFloat(coordsMatch[2]);
      result.location = `${result.latitude}, ${result.longitude}`;
    }

    // Tenta extrair o parâmetro 'q' (query)
    if (searchParams.has('q')) {
      const query = searchParams.get('q') || '';
      result.address = query;
      result.location = result.location || query;
    }

    // Tenta extrair o nome e endereço do pathname
    if (pathname.includes('/place/')) {
      const placeMatch = pathname.match(/\/place\/([^/]+)/);
      if (placeMatch) {
        const placeName = decodeURIComponent(placeMatch[1]);
        // Remove caracteres especiais que o Google Maps adiciona
        result.name = placeName.split('/')[0].trim();
      }
    }

    // Tenta extrair usando data-embed ou outros formatos
    if (searchParams.has('pb')) {
      // Formato embed do Google Maps (mais difícil de extrair)
      // Tenta extrair o texto após o ?
      const urlString = url.split('?')[0];
      const parts = urlString.split('/');
      if (parts.length > 0) {
        const lastPart = parts[parts.length - 1];
        if (lastPart && !lastPart.match(/^\d+/)) {
          result.name = decodeURIComponent(lastPart);
        }
      }
    }

    return result;
  } catch (error) {
    console.error('Erro ao extrair dados do Google Maps:', error);
    return result;
  }
}

/**
 * Valida se uma URL é um link válido do Google Maps
 */
export function isValidGoogleMapsUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    
    return hostname.includes('google.com') && 
           (urlObj.pathname.includes('/maps') || 
            urlObj.pathname.includes('/place'));
  } catch {
    return false;
  }
}

/**
 * Formata a string de localização para ser usada no formulário
 */
export function formatLocationString(data: GoogleMapsData): string {
  if (data.latitude && data.longitude) {
    return `${data.latitude}, ${data.longitude}`;
  }
  if (data.address) {
    return data.address;
  }
  return '';
}
