// app/api/restaurants/batch/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/libs/supabase/server';
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
    const auth = await requireUser(request, response);
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

    if (restaurants.length > 50) {
      const errorType = 'VALIDATION_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType, max: 50 },
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

    const results: Array<{
      name: string;
      status: 'created' | 'failed';
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

      const { data: existing, error: existingError } = await supabase
        .from('restaurants')
        .select('id')
        .eq('source_url', restaurant.source_url || '')
        .single();

      if (!existingError && existing) {
        results.push({
          name,
          status: 'failed',
          error: 'Restaurante já existe (source_url duplicada)',
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
