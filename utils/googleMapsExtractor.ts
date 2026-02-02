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

    // Tenta extrair informações de parâmetros específicos do Google Maps
    if (searchParams.has('data')) {
      const data = searchParams.get('data') || '';
      // Extrai possíveis informações de endereço do parâmetro data
      const addressMatch = data.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
      if (addressMatch && !result.latitude) {
        result.latitude = parseFloat(addressMatch[1]);
        result.longitude = parseFloat(addressMatch[2]);
        result.location = `${result.latitude}, ${result.longitude}`;
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
    const seenParts = new Set<string>(); // Para evitar duplicatas

    // Função auxiliar para adicionar partes sem duplicatas
    const addPart = (part: string | undefined) => {
      if (part && part.trim() && !seenParts.has(part.trim())) {
        parts.push(part.trim());
        seenParts.add(part.trim());
      }
    };

    // Prioridade de componentes do endereço - do mais específico para o mais geral
    // 1. Rua/Avenida/Alameda (componente mais importante para identificação)
    addPart(address.road);
    addPart(address.pedestrian); // Ruas pedonais
    addPart(address.footway); // Calçadas
    addPart(address.path); // Caminhos
    addPart(address.street); // Rua (alternativo)
    addPart(address.residential); // Área residencial
    
    // 2. Número da casa/edifício
    addPart(address.house_number);
    addPart(address.building); // Nome do edifício
    
    // 3. Bairro/Distrito/Concelho
    addPart(address.quarter);
    addPart(address.suburb);
    addPart(address.neighbourhood);
    addPart(address.district);
    addPart(address.city_district);
    addPart(address.subdistrict);
    addPart(address.concelho); // Portugal
    
    // 4. Cidade/Localidade
    addPart(address.city);
    addPart(address.town);
    addPart(address.village);
    addPart(address.hamlet);
    addPart(address.municipality);
    addPart(address.locality);
    addPart(address.county);
    
    // 5. Código postal
    addPart(address.postcode);
    
    // 6. Estado/Região
    addPart(address.state);
    addPart(address.region);
    addPart(address.province);
    addPart(address.administrative);
    addPart(address.state_district);
    
    // 7. País
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
}
