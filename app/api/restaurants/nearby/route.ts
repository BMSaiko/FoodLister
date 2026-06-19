import { NextRequest, NextResponse } from 'next/server';
import { getPublicServerClient } from '@/libs/supabase/server';
import { getErrorMessage } from '@/types/api';
import type { ApiErrorType } from '@/types/api';
import {
  haversineDistance,
  isValidCoordinates,
} from '@/libs/search';
import type { Database } from '@/types/database';

type DbRestaurant = Database['public']['Tables']['restaurants']['Row'];

interface RestaurantWithDistance {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  price_per_person: number | null;
  rating: number | null;
  location: string | null;
  source_url: string | null;
  creator: string | null;
  menu_url: string | null;
  visited: boolean;
  phone_numbers: string[];
  creator_id: string | null;
  creator_name: string | null;
  created_at: string;
  updated_at: string;
  images: string[];
  display_image_index: number;
  menu_links: string[];
  menu_images: string[];
  latitude: number | null;
  longitude: number | null;
  review_count: number;
  opening_hours: string | null;
  distance: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get('lat') || '');
    const lng = parseFloat(searchParams.get('lng') || '');
    const radius = parseFloat(searchParams.get('radius') || '10');
    const sortBy = searchParams.get('sort_by') || 'distance';
    const sortDirection = searchParams.get('sort_direction') || 'asc';

    // Validate coordinates
    if (isNaN(lat) || isNaN(lng) || !isValidCoordinates(lat, lng)) {
      const errorType = 'VALIDATION_ERROR' as ApiErrorType;
      return NextResponse.json(
        {
          error: 'Invalid coordinates. lat must be [-90, 90], lng must be [-180, 180].',
          code: errorType,
        },
        { status: 400 }
      );
    }

    const effectiveRadius = isNaN(radius) || radius <= 0 ? 10 : Math.min(radius, 100);

    // Use public client for nearby search
    const client = await getPublicServerClient();
    if (!client) {
      const errorType = 'INTERNAL_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 500 }
      );
    }

    // Fetch all restaurants with valid coordinates (with fallback for missing columns)
    const nearbyColumns = 'id, name, description, image_url, price_per_person, rating, location, source_url, creator, menu_url, visited, phone_numbers, creator_id, creator_name, created_at, updated_at, images, display_image_index, menu_links, menu_images, latitude, longitude, review_count, opening_hours';
    const nearbyColumnsFallback = 'id, name, description, image_url, price_per_person, rating, location, source_url, creator, menu_url, visited, phone_numbers, creator_id, creator_name, created_at, images, display_image_index, menu_links, menu_images, latitude, longitude';
    let { data: restaurantsData, error: dbError } = await client
      .from('restaurants')
      .select(nearbyColumns)
      .not('latitude', 'is', null)
      .not('longitude', 'is', null);
    if (dbError && dbError.code === '42703') {
      console.warn('nearby: missing column (migration 020/050 not applied):', dbError.message);
      const fallback = await client.from('restaurants').select(nearbyColumnsFallback).not('latitude', 'is', null).not('longitude', 'is', null);
      restaurantsData = fallback.data;
      dbError = fallback.error;
    }
    if (dbError) {
      console.error('Error fetching restaurants for nearby search:', dbError);
      const errorType = 'DATABASE_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 500 }
      );
    }

    // Calculate distances and filter by radius
    const restaurantsWithDistance: RestaurantWithDistance[] = (
      (restaurantsData as DbRestaurant[]) || []
    )
      .filter((r) => r.latitude != null && r.longitude != null)
      .map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        image_url: r.image_url,
        price_per_person: r.price_per_person,
        rating: r.rating,
        location: r.location,
        source_url: r.source_url,
        creator: r.creator,
        menu_url: r.menu_url,
        visited: r.visited,
        phone_numbers: r.phone_numbers || [],
        creator_id: r.creator_id,
        creator_name: r.creator_name,
        created_at: r.created_at,
        updated_at: r.updated_at || r.created_at,
        images: r.images || [],
        display_image_index: r.display_image_index ?? -1,
        menu_links: r.menu_links || [],
        menu_images: r.menu_images || [],
        latitude: r.latitude,
        longitude: r.longitude,
        review_count: r.review_count || 0,
        opening_hours: r.opening_hours || null,
        distance: haversineDistance(lat, lng, r.latitude!, r.longitude!),
      }))
      .filter((r) => r.distance <= effectiveRadius);

    // Sort results
    const direction = sortDirection === 'desc' ? -1 : 1;
    restaurantsWithDistance.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return direction * ((a.price_per_person ?? 0) - (b.price_per_person ?? 0));
        case 'rating':
          return direction * ((b.rating ?? 0) - (a.rating ?? 0)); // Higher rating first by default
        case 'name':
          return direction * a.name.localeCompare(b.name);
        case 'distance':
        default:
          return direction * (a.distance - b.distance);
      }
    });

    return NextResponse.json(
      {
        restaurants: restaurantsWithDistance,
        meta: {
          count: restaurantsWithDistance.length,
          center: { lat, lng },
          radius_km: effectiveRadius,
          sort_by: sortBy,
          sort_direction: sortDirection,
        },
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      }
    );
  } catch (error) {
    console.error('Unexpected error in nearby restaurants API:', error);
    const errorType = 'INTERNAL_ERROR' as ApiErrorType;
    return NextResponse.json(
      { error: getErrorMessage(errorType), code: errorType },
      { status: 500 }
    );
  }
}

