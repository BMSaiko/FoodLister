// app/api/restaurants/batch/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/libs/supabase/server';
import { getErrorMessage } from '@/types/api';
import type { ApiErrorType } from '@/types/api';
import { cacheInvalidatePrefix } from '@/libs/cache';


interface BatchRestaurant {
  name: string;
  description?: string;
  location?: string;
  source_url?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  place_id?: string;
}

// ponytail: dedup profunda em memoria — place_id (estavel entre formatos de URL) +
// fallback coords-proximity+nome. source_url literal falha: scrape e DB tem formatos diferentes.
export function normName(name: string): string {
  return (name || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

// ponytail: dedup por nome + source_url + place_id. o place_id identifica o MESMO sitio
// no Google mesmo quando o restaurante mudou de nome (nome/coords/morada davam falsos positivos).
function extractPlaceId(sourceUrl?: string): string | null {
  if (!sourceUrl) return null;
  const m = sourceUrl.match(/!1s([^!]+)/);
  return m ? m[1] : null;
}

export function isDuplicate(
  restaurant: { name?: string; source_url?: string },
  existing: Array<{ source_url?: string | null; name?: string | null }>
): boolean {
  if (restaurant.source_url && existing.some((e) => e.source_url === restaurant.source_url)) return true;
  const pid = extractPlaceId(restaurant.source_url);
  if (pid && existing.some((e) => extractPlaceId(e.source_url ?? undefined) === pid)) return true;
  const nm = normName(restaurant.name ?? '');
  if (nm && existing.some((e) => nm === normName(e.name ?? ''))) return true;
  return false;
}

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

export async function POST(request: NextRequest) {
  const response = NextResponse.next();
  try {
    const auth = await requireAdmin(request, response);
    if (!auth.ok) return auth.response;
    const supabase = auth.supabase;
    const user = auth.user;

    const body = await request.json();
    const { restaurants } = body as { restaurants?: BatchRestaurant[] };

    if (!restaurants || !Array.isArray(restaurants) || restaurants.length === 0) {
      const errorType = 'VALIDATION_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 400 }
      );
    }

    if (restaurants.length > 150) {
      const errorType = 'VALIDATION_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType, max: 150 },
        { status: 400 }
      );
    }

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('user_id', user.id)
      .single();
    const displayName = (!profileError && profileData?.display_name)
      ? profileData.display_name
      : user.email;

    // ponytail: buscar uma vez os existentes para dedup em memoria (sem 150 queries)
    const { data: existingRows } = await supabase
      .from('restaurants')
      .select('id, source_url, name');
    const existing = existingRows || [];

    const results: Array<{
      name: string;
      status: 'created' | 'failed' | 'duplicate';
      id?: string;
      error?: string;
    }> = [];

    for (const restaurant of restaurants) {
      const name = restaurant.name?.trim();
      if (!name || name.length === 0) {
        results.push({
          name: restaurant.name || '(sem nome)',
          status: 'failed',
          error: 'Nome obrigatório',
        });
        continue;
      }

      let validatedLatitude = null;
      let validatedLongitude = null;
      if (
        restaurant.latitude !== undefined &&
        restaurant.longitude !== undefined
      ) {
        if (!isValidCoordinates(restaurant.latitude, restaurant.longitude)) {
          results.push({
            name,
            status: 'failed',
            error: 'Coordenadas inválidas',
          });
          continue;
        }
        validatedLatitude = restaurant.latitude;
        validatedLongitude = restaurant.longitude;
      } else if (
        restaurant.latitude !== undefined ||
        restaurant.longitude !== undefined
      ) {
        results.push({
          name,
          status: 'failed',
          error: 'Latitude e longitude devem ser fornecidas em conjunto',
        });
        continue;
      }

      if (isDuplicate(restaurant, existing)) {
        results.push({
          name,
          status: 'duplicate',
          error: 'Já existe na app',
        });
        continue;
      }

      const { data: restaurantData, error: restaurantError } = await supabase
        .from('restaurants')
        .insert({
          name,
          description: restaurant.description || null,
          location: restaurant.location || restaurant.address || null,
          source_url: restaurant.source_url || null,
          latitude: validatedLatitude,
          longitude: validatedLongitude,
          creator_id: user.id,
          creator_name: displayName,
        })
        .select()
        .single();

      if (restaurantError) {
        console.error('Error creating restaurant:', restaurantError);
        results.push({
          name,
          status: 'failed',
          error: 'Erro ao criar restaurante',
        });
        continue;
      }

      results.push({
        name,
        status: 'created',
        id: restaurantData.id,
      });
    }

    cacheInvalidatePrefix('restaurants:');

    const created = results.filter((r) => r.status === 'created').length;
    const failed = results.filter((r) => r.status === 'failed').length;

    return NextResponse.json(
      {
        results,
        summary: {
          total: results.length,
          created,
          failed,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Unexpected error in batch restaurant creation:', error);
    const errorType = 'INTERNAL_ERROR' as ApiErrorType;
    return NextResponse.json(
      { error: getErrorMessage(errorType), code: errorType },
      { status: 500 }
    );
  }
}
