// utils/googleMapsExtractor.ts

import { logError } from './logger';

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
  price_level?: number;
  place_id?: string;
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

    // Tenta extrair latitude e longitude de vários formatos
    const coordsMatch = extractCoordinates(url);
    if (coordsMatch) {
      result.latitude = coordsMatch.latitude;
      result.longitude = coordsMatch.longitude;
      result.location = `${result.latitude}, ${result.longitude}`;
    }

    // Tenta extrair o parâmetro 'q' (query) - pode conter endereço ou coordenadas
    if (searchParams.has('q')) {
      const query = searchParams.get('q') || '';
      // Converte + para espaços no query
      const decodedQuery = query.replace(/\+/g, ' ');
      result.address = decodedQuery;
      result.location = result.location || decodedQuery;

      // Tenta extrair nome da rua do parâmetro q
      if (!result.name && decodedQuery) {
        // Remove possíveis números de coordenadas e tenta extrair nome da rua
        const streetMatch = decodedQuery.replace(/-?\d+\.\d+/g, '').trim();
        if (streetMatch && streetMatch.length > 2) {
          result.name = streetMatch;
        }
      }
    }

    // Tenta extrair o nome e endereço do pathname
    if (pathname.includes('/place/')) {
      const placeMatch = pathname.match(/\/place\/([^/]+)/);
      if (placeMatch) {
        const placeName = decodeURIComponent(placeMatch[1]);
        // Remove caracteres especiais que o Google Maps adiciona e converte + para espaços
        result.name = placeName.split('/')[0].replace(/\+/g, ' ').trim();

        // Tenta extrair nome da rua do pathname
        if (!result.name || result.name.length < 3) {
          // Remove possíveis IDs e tenta extrair nome da rua
          const streetName = placeName
            .replace(/@[^@]*$/, '') // Remove coordenadas no final
            .replace(/,.*$/, '') // Remove tudo após vírgula
            .replace(/_/g, ' ') // Substitui underscores por espaços
            .trim();

          if (streetName && streetName.length > 2 && !streetName.match(/^\d+$/)) {
            result.name = streetName;
          }
        }
      }
    }

    // Tenta extrair informações do parâmetro data= (formato Google Maps)
    // Estrutura: !{segment_id}{type_id}{sub_id}!...
    // !1s = place_id, !2e = price_level, !3d = lat, !4d = lng
    const dataParam = searchParams.get('data') || extractDataFromPath(pathname);
    if (dataParam) {
      // Extrair place_id: !1s{place_id}
      const placeIdMatch = dataParam.match(/!1s([^!]+)/);
      if (placeIdMatch) {
        result.place_id = placeIdMatch[1];
      }

      // Extrair price_level: !2e{N} (1=€, 2=€€, 3=€€€)
      const priceMatch = dataParam.match(/!2e(\d+)/);
      if (priceMatch) {
        result.price_level = parseInt(priceMatch[1], 10);
      }

      // Extrair coordenadas do data=: !3d{lat}!4d{lng}
      const dataCoordsMatch = dataParam.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
      if (dataCoordsMatch && !result.latitude) {
        result.latitude = parseFloat(dataCoordsMatch[1]);
        result.longitude = parseFloat(dataCoordsMatch[2]);
        result.location = `${result.latitude}, ${result.longitude}`;
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
          result.name = decodeURIComponent(lastPart).replace(/\+/g, ' ');
        }
      }
    }

    // Tenta extrair informações de parâmetros de pesquisa avançada
    if (searchParams.has('ftid')) {
      // Google Maps pode usar ftid para identificar lugares específicos
      result.address = result.address || 'Localização identificada via Google Maps';
    }

    return result;
  } catch (error) {
    logError('Erro ao extrair dados do Google Maps', error);
    return result;
  }
}

/**
 * Extrai coordenadas de vários formatos de URLs do Google Maps
 */
function extractCoordinates(url: string): { latitude: number; longitude: number } | null {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const searchParams = urlObj.searchParams;

    // Formato 1: /@{lat},{lng},{zoom}z
    const coordsMatch = pathname.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (coordsMatch) {
      const lat = parseFloat(coordsMatch[1]);
      const lng = parseFloat(coordsMatch[2]);
      if (isValidCoordinates(lat, lng)) {
        return { latitude: lat, longitude: lng };
      }
    }

    // Formato 2: parâmetros de query (ex: ?ll={lat},{lng})
    if (searchParams.has('ll')) {
      const ll = searchParams.get('ll') || '';
      const llMatch = ll.match(/(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (llMatch) {
        const lat = parseFloat(llMatch[1]);
        const lng = parseFloat(llMatch[2]);
        if (isValidCoordinates(lat, lng)) {
          return { latitude: lat, longitude: lng };
        }
      }
    }

    // Formato 3: parâmetro center
    if (searchParams.has('center')) {
      const center = searchParams.get('center') || '';
      const centerMatch = center.match(/(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (centerMatch) {
        const lat = parseFloat(centerMatch[1]);
        const lng = parseFloat(centerMatch[2]);
        if (isValidCoordinates(lat, lng)) {
          return { latitude: lat, longitude: lng };
        }
      }
    }

    // Formato 4: parâmetro query com coordenadas (ex: ?q={lat},{lng})
    if (searchParams.has('q')) {
      const q = searchParams.get('q') || '';
      const qMatch = q.match(/(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (qMatch) {
        const lat = parseFloat(qMatch[1]);
        const lng = parseFloat(qMatch[2]);
        if (isValidCoordinates(lat, lng)) {
          return { latitude: lat, longitude: lng };
        }
      }
    }

    // Formato 5: parâmetro view com coordenadas
    if (searchParams.has('view')) {
      const view = searchParams.get('view') || '';
      const viewMatch = view.match(/(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (viewMatch) {
        const lat = parseFloat(viewMatch[1]);
        const lng = parseFloat(viewMatch[2]);
        if (isValidCoordinates(lat, lng)) {
          return { latitude: lat, longitude: lng };
        }
      }
    }

    return null;
  } catch (error) {
    logError('Erro ao extrair coordenadas do Google Maps', error);
    return null;
  }
}

/**
 * Valida se as coordenadas são válidas
 */
function isValidCoordinates(latitude: number, longitude: number): boolean {
  return (
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    !isNaN(latitude) &&
    !isNaN(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

/**
 * Valida se uma URL é um link válido do Google Maps
 */
export function isValidGoogleMapsUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;

    // Check for short Google Maps URLs (mobile shares)
    if (hostname === 'maps.app.goo.gl' || hostname === 'goo.gl') {
      return true;
    }

    // Check for full Google Maps URLs
    if (hostname.includes('google.com')) {
      return urlObj.pathname.includes('/maps') ||
             urlObj.pathname.includes('/place') ||
             urlObj.pathname.includes('/dir') ||
             urlObj.search.includes('ll=') ||
             urlObj.search.includes('q=');
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Formata a string de localização para ser usada no formulário
 */
export function formatLocationString(data: GoogleMapsData): string {
  if (data.address) {
    return data.address;
  }
  if (data.latitude && data.longitude) {
    return `${data.latitude}, ${data.longitude}`;
  }
  return '';
}

/**
 * Converte price_level numérico para símbolo visual
 */
export function formatPriceLevel(level?: number): string {
  if (!level || level < 1 || level > 4) return '';
  return '€'.repeat(level);
}

/**
 * Extrai o parâmetro data= do pathname
 */
function extractDataFromPath(pathname: string): string | null {
  const dataMatch = pathname.match(/[?&]data=([^&]+)/);
  if (dataMatch) return dataMatch[1];
  const pathDataMatch = pathname.match(/\/data=([^/]+)/);
  if (pathDataMatch) return pathDataMatch[1];
  return null;
}

/**
 * Serviço para integração com OpenStreetMap Nominatim API
 */
export class OSMService {
  private static readonly BASE_URL = 'https://nominatim.openstreetmap.org/reverse';
  private static readonly USER_AGENT = 'FoodLister/1.0 (+https://github.com/BMSaiko/FoodLister)';

  /**
   * Converte coordenadas para endereço usando OpenStreetMap
   */
  static async reverseGeocode(latitude: number, longitude: number): Promise<string | null> {
    try {
      if (!isValidCoordinates(latitude, longitude)) {
        throw new Error('Coordenadas inválidas para geocodificação reversa');
      }

      const params = new URLSearchParams({
        format: 'json',
        lat: latitude.toString(),
        lon: longitude.toString(),
        zoom: '18',
        addressdetails: '1',
        'accept-language': 'pt-BR,pt,en'
      });

      const response = await fetch(`${OSMService.BASE_URL}?${params.toString()}`, {
        headers: {
          'User-Agent': OSMService.USER_AGENT,
          'Accept': 'application/json'
        },
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error(`OSM API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (data && data.address) {
        return this.formatAddress(data.address);
      }

      return null;
    } catch (error) {
      logError('Erro ao obter endereço do OpenStreetMap', error);
      return null;
    }
  }

  /**
   * Formata o endereço a partir dos dados do OSM
   */
  private static formatAddress(address: any): string {
    const parts: string[] = [];
    const seenParts = new Set<string>();

    const addPart = (part: string | undefined) => {
      if (part && part.trim() && !seenParts.has(part.trim())) {
        parts.push(part.trim());
        seenParts.add(part.trim());
      }
    };

    addPart(address.road);
    addPart(address.pedestrian);
    addPart(address.footway);
    addPart(address.path);
    addPart(address.street);
    addPart(address.residential);

    addPart(address.house_number);
    addPart(address.building);

    addPart(address.quarter);
    addPart(address.suburb);
    addPart(address.neighbourhood);
    addPart(address.district);
    addPart(address.city_district);
    addPart(address.subdistrict);
    addPart(address.concelho);

    addPart(address.city);
    addPart(address.town);
    addPart(address.village);
    addPart(address.hamlet);
    addPart(address.municipality);
    addPart(address.locality);
    addPart(address.county);

    addPart(address.postcode);

    addPart(address.state);
    addPart(address.region);
    addPart(address.province);
    addPart(address.administrative);
    addPart(address.state_district);

    addPart(address.country);
    if (address.country_code) addPart(address.country_code.toUpperCase());

    return parts.join(', ');
  }

  /**
   * Busca endereço usando coordenadas com fallback
   */
  static async getStreetAddress(latitude: number, longitude: number): Promise<string | null> {
    try {
      const address = await this.reverseGeocode(latitude, longitude);
      return address;
    } catch (error) {
      logError('Falha ao obter endereço da rua', error);
      return null;
    }
  }

  /**
   * Forward geocoding via OSM Nominatim — converte nome/address em coords
   */
  static async forwardGeocode(query: string): Promise<{ latitude: number; longitude: number; display_name: string } | null> {
    try {
      const params = new URLSearchParams({
        q: query,
        format: 'json',
        limit: '1',
        addressdetails: '1',
        'accept-language': 'pt-BR,pt,en'
      });

      const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
        headers: {
          'User-Agent': OSMService.USER_AGENT,
          'Accept': 'application/json'
        },
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error(`OSM Search API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (data && data.length > 0) {
        return {
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon),
          display_name: data[0].display_name
        };
      }

      return null;
    } catch (error) {
      logError('Erro no forward geocoding', error);
      return null;
    }
  }
}
