// app/api/restaurants/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerClient, getPublicServerClient } from '@/libs/supabase/server';
import { getErrorMessage } from '@/types/api';
import type { ApiErrorType } from '@/types/api';
import type { Database } from '@/types/database';
type DbRestaurant = Database['public']['Tables']['restaurants']['Row'];
type DbCuisineType = Database['public']['Tables']['cuisine_types']['Row'];
type DbRestaurantFeature = Database['public']['Tables']['restaurant_features']['Row'];
type DbDietaryOption = Database['public']['Tables']['restaurant_dietary_options']['Row'];

interface Restaurant {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  price_per_person?: number;
  rating?: number;
  location?: string;
  source_url?: string;
  creator?: string;
  menu_url?: string;
  menu_links?: string[];
  menu_images?: string[];
  phone_numbers?: string[];
  visited: boolean;
  created_at: string;
  updated_at: string;
  creator_id?: string;
  creator_name?: string;
  cuisine_types?: Array<{ id: string; name: string; icon?: string }>;
  features?: Array<{ id: string; name: string; icon?: string }>;
  dietary_options?: Array<{ id: string; name: string }>;
  review_count?: number;
  latitude?: number;
  longitude?: number;
}

// Valida se as coordenadas são válidas
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

export async function GET(request: NextRequest) {
  const response = NextResponse.next();
  try {
    const supabase = await getServerClient(request, response);
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    // For unauthenticated requests, use public client that can access all restaurants
    let client = supabase;
    if (!supabase) {
      // Create a public client for unauthenticated access
      const publicClient = await getPublicServerClient();
      if (!publicClient) {
        const errorType = 'INTERNAL_ERROR' as ApiErrorType;
        return NextResponse.json(
          { error: getErrorMessage(errorType), code: errorType },
          { status: 500 }
        );
      }
      client = publicClient;
    }

    if (!client) {
      const errorType = 'INTERNAL_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 500 }
      );
    }

    let query = client
      .from('restaurants')
      .select(`
        *,
        cuisine_types:restaurant_cuisine_types(
          cuisine_type:cuisine_types(*)
        ),
        features:restaurant_restaurant_features(
          feature:restaurant_features(*)
        ),
        dietary_options:restaurant_dietary_options_junction(
          dietary_option:restaurant_dietary_options(*)
        ),
        reviews:reviews(count)
      `, { count: 'exact' })
      .order('rating', { ascending: false })
      .order('created_at', { ascending: false });

    // Add search filter if provided
    if (search && search.trim()) {
      query = query.ilike('name', `%${search.trim()}%`);
    }

    const { data: restaurantsData, error: restaurantsError, count: totalCount } = await query;

    if (restaurantsError) {
      console.error('Error fetching restaurants:', restaurantsError);
      const errorType = 'DATABASE_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 500 }
      );
    }

    // Transform data for easier client consumption
    const restaurants: Restaurant[] = (restaurantsData || []).map((restaurant: any) => ({
      id: restaurant.id,
      name: restaurant.name,
      description: restaurant.description,
      image_url: restaurant.image_url,
      price_per_person: restaurant.price_per_person,
      rating: restaurant.rating,
      location: restaurant.location,
      source_url: restaurant.source_url,
      creator: restaurant.creator,
      menu_url: restaurant.menu_url,
      menu_links: restaurant.menu_links || [],
      menu_images: restaurant.menu_images || [],
      phone_numbers: restaurant.phone_numbers || [],
      visited: restaurant.visited,
      created_at: restaurant.created_at,
      updated_at: restaurant.updated_at,
      creator_id: restaurant.creator_id,
      creator_name: restaurant.creator_name,
      cuisine_types: restaurant.cuisine_types?.map((relation: any) => relation.cuisine_type).filter(Boolean) || [],
      features: restaurant.features?.map((relation: any) => relation.feature).filter(Boolean) || [],
      dietary_options: restaurant.dietary_options?.map((relation: any) => relation.dietary_option).filter(Boolean) || [],
      review_count: restaurant.reviews?.[0]?.count || 0,
      latitude: restaurant.latitude,
      longitude: restaurant.longitude,
      images: restaurant.images,
      display_image_index: restaurant.display_image_index
    }));

    return NextResponse.json(
      {
        restaurants
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (error) {
    console.error('Unexpected error in restaurants API:', error);
    const errorType = 'INTERNAL_ERROR' as ApiErrorType;
    return NextResponse.json(
      { error: getErrorMessage(errorType), code: errorType },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const response = NextResponse.next();
  try {
    const supabase = await getServerClient(request, response);

    if (!supabase) {
      const errorType = 'INTERNAL_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 500 }
      );
    }

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      const errorType = 'AUTHENTICATION_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      name,
      description,
      image_url,
      images,
      display_image_index,
      location,
      source_url,
      menu_links,
      menu_images,
      phone_numbers,
      latitude,
      longitude
    } = body;

    // Basic validation
    if (!name || name.trim().length === 0) {
      const errorType = 'VALIDATION_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 400 }
      );
    }

    // Validate coordinates if provided
    let validatedLatitude = null;
    let validatedLongitude = null;

    if (latitude !== undefined && longitude !== undefined) {
      if (!isValidCoordinates(latitude, longitude)) {
        const errorType = 'VALIDATION_ERROR' as ApiErrorType;
        return NextResponse.json(
          { error: getErrorMessage(errorType), code: errorType },
          { status: 400 }
        );
      }
      validatedLatitude = latitude;
      validatedLongitude = longitude;
    } else if (latitude !== undefined || longitude !== undefined) {
      const errorType = 'VALIDATION_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 400 }
      );
    }

    // Get user display name from profiles table or email
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('user_id', user.id)
      .single();

    const displayName = (!profileError && profileData?.display_name) ? profileData.display_name : user.email;

    // Create the restaurant with coordinates validation
    const { data: restaurantData, error: restaurantError } = await supabase
      .from('restaurants')
      .insert({
        name: name.trim(),
        description: description || null,
        image_url: image_url || null,
        images: images || [],
        display_image_index: display_image_index || -1,
        location: location || null,
        source_url: source_url || null,
        menu_links: menu_links || [],
        menu_images: menu_images || [],
        phone_numbers: phone_numbers || [],
        latitude: validatedLatitude,
        longitude: validatedLongitude,
        creator_id: user.id,
        creator_name: displayName
      })
      .select()
      .single();

    if (restaurantError) {
      console.error('Error creating restaurant:', restaurantError);
      const errorType = 'DATABASE_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 500 }
      );
    }

    return NextResponse.json({ restaurant: restaurantData }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error in restaurant creation:', error);
    const errorType = 'INTERNAL_ERROR' as ApiErrorType;
    return NextResponse.json(
      { error: getErrorMessage(errorType), code: errorType },
      { status: 500 }
    );
  }
}