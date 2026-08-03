// utils/googleMapsBatchExtractor.ts

import {
  extractGoogleMapsData,
  isValidGoogleMapsUrl,
  GoogleMapsData,
  OSMService,
} from './googleMapsExtractor';

const MAX_URLS = 50;

/**
 * Resolves a Google Maps shortlink (maps.app.goo.gl / goo.gl)
 * to its final URL via the existing resolve API.
 */
async function resolveShortUrl(url: string): Promise<string> {
  try {
    const res = await fetch(
      `/api/resolve-google-maps-url?url=${encodeURIComponent(url)}`,
      { headers: { "User-Agent": "FoodLister/1.0" } }
    );
    if (!res.ok) return url;
    const data = await res.json();
    return data.finalUrl || url;
  } catch {
    return url;
  }
}

/**
 * Checks if a URL is a Google Maps shortlink.
 */
function isShortUrl(url: string): boolean {
  try {
    const hostname = new URL(url).hostname;
    return hostname === "maps.app.goo.gl" || hostname === "goo.gl";
  } catch {
    return false;
  }
}

export interface BatchExtractionResult {
  data: GoogleMapsData;
  status: 'ready' | 'error';
  error?: string;
}

export interface BatchExtractionInput {
  urls: string[];
}

/**
 * Parses raw text (one URL per line), CSV content, or a JSON array string
 * into an array of Google Maps URLs.
 */
export function parseUrlInput(input: string): string[] {
  const trimmed = input.trim();
  if (!trimmed) return [];

  // Try JSON array first
  if (trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed
          .filter((item: unknown) => typeof item === 'string')
          .map((item: string) => item.trim())
          .filter(Boolean);
      }
    } catch {
      // Not valid JSON, fall through to text/CSV parsing
    }
  }

  // CSV: split by newlines, first row may be headers
  const lines = trimmed.split('\n').map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return [];

  // Check if first line looks like a URL or a CSV header
  const firstLine = lines[0];
  if (firstLine.includes(',') && !firstLine.startsWith('http')) {
    // CSV format — skip header, take first column (or column named "url")
    const headers = firstLine.split(',').map((h) => h.trim().toLowerCase());
    const urlColIndex = headers.findIndex(
      (h) => h === 'url' || h === 'link' || h === 'google_maps_url'
    );

    return lines
      .slice(1)
      .map((line) => {
        const cols = line.split(',');
        const idx = urlColIndex >= 0 ? urlColIndex : 0;
        return (cols[idx] || '').trim();
      })
      .filter(Boolean);
  }

  // Plain text — one URL per line
  return lines.filter((line) => isValidGoogleMapsUrl(line));
}

/**
 * Deduplicates GoogleMapsData entries by place_id first,
 * then by (latitude, longitude) proximity (< 0.001 degrees ≈ 100m).
 */
function deduplicate(results: GoogleMapsData[]): GoogleMapsData[] {
  const seen = new Set<string>();
  const unique: GoogleMapsData[] = [];

  for (const item of results) {
    // Dedup by place_id
    if (item.place_id) {
      const key = `place:${item.place_id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      unique.push(item);
      continue;
    }

    // Dedup by coordinates proximity
    if (item.latitude && item.longitude) {
      const latKey = Math.round(item.latitude * 1000) / 1000;
      const lngKey = Math.round(item.longitude * 1000) / 1000;
      const coordKey = `${latKey},${lngKey}`;
      if (seen.has(coordKey)) continue;
      seen.add(coordKey);
      unique.push(item);
      continue;
    }

    // Dedup by source_url
    if (item.source_url) {
      const key = `url:${item.source_url}`;
      if (seen.has(key)) continue;
      seen.add(key);
      unique.push(item);
      continue;
    }

    // No dedup key — keep it
    unique.push(item);
  }

  return unique;
}

/**
 * Extracts Google Maps data from an array of URLs with rate-limited
 * reverse geocoding. Returns one result per URL with status.
 */
export async function extractBatch(
  urls: string[]
): Promise<BatchExtractionResult[]> {
  // Enforce limit
  const limited = urls.slice(0, MAX_URLS);

  // Step 1: Resolve shortlinks, then extract data from each URL
  const extracted: GoogleMapsData[] = [];
  for (const url of limited) {
    try {
      const resolvedUrl = isShortUrl(url) ? await resolveShortUrl(url) : url;
      const data = extractGoogleMapsData(resolvedUrl);
      if (data.name || data.latitude) {
        extracted.push(data);
      } else {
        extracted.push({ ...data, source_url: url });
      }
    } catch {
      extracted.push({
        source_url: url,
        name: url,
      });
    }
  }

  // Step 2: Reverse geocode entries that have coords but no address
  // Rate-limited: 1 request per second (Nominatim policy)
  for (const item of extracted) {
    if (item.latitude && item.longitude && !item.address) {
      try {
        const address = await OSMService.getStreetAddress(
          item.latitude,
          item.longitude
        );
        if (address) {
          item.address = address;
          item.location = address;
        }
      } catch {
        // Silently skip geocoding failures
      }
    }
    // Rate limit delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  // Step 3: Deduplicate
  const deduped = deduplicate(extracted);

  // Step 4: Build results with status
  return deduped.map((data) => {
    if (!data.name && !data.address && !data.latitude) {
      return {
        data,
        status: 'error' as const,
        error: 'Não foi possível extrair dados desta URL',
      };
    }
    return { data, status: 'ready' as const };
  });
}
