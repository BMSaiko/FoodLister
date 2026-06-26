// app/api/restaurants/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerClient, getPublicServerClient } from '@/libs/supabase/server';
import { getErrorMessage } from '@/types/api';
import type { ApiErrorType } from '@/types/api';

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

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    if (!id) {
      const errorType = 'VALIDATION_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 400 }
      );
    }

    // Use public client for unauthenticated access to restaurant details
    const supabase = await getPublicServerClient();
    
    if (!supabase) {
      const errorType = 'INTERNAL_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 500 }
      );
    }

    // Fetch restaurant details with features and dietary options (with fallback for missing updated_at)
    const restaurantColumns = `id, name, description, image_url, price_per_person, rating,
        location, source_url, creator, menu_url, menu_links, menu_images,
        phone_numbers, created_at, updated_at, creator_id,
        creator_name, latitude, longitude, images, display_image_index,
        review_count:reviews(count),
        cuisine_types:restaurant_cuisine_types(
          cuisine_type:cuisine_types(id, name, icon)
        ),
        features:restaurant_restaurant_features(
          feature:restaurant_features(id, name, icon)
        ),
        dietary_options:restaurant_dietary_options_junction(
          dietary_option:restaurant_dietary_options(id, name, icon)
        ),
        lists:list_restaurants(
          list:lists(id, name, is_public, creator_name, created_at)
        )`;
    const restaurantColumnsFallback = `id, name, description, image_url, price_per_person, rating,
        location, source_url, creator, menu_url, menu_links, menu_images,
        phone_numbers, created_at, creator_id,
        creator_name, latitude, longitude, images, display_image_index,
        review_count:reviews(count),
        cuisine_types:restaurant_cuisine_types(
          cuisine_type:cuisine_types(id, name, icon)
        ),
        features:restaurant_restaurant_features(
          feature:restaurant_features(id, name, icon)
        ),
        dietary_options:restaurant_dietary_options_junction(
          dietary_option:restaurant_dietary_options(id, name, icon)
        ),
        lists:list_restaurants(
          list:lists(id, name, is_public, creator_name, created_at)
        )`;
    let { data: restaurant, error: restaurantError } = await supabase
      .from('restaurants')
      .select(restaurantColumns)
      .eq('id', id)
      .single();
    if (restaurantError && restaurantError.code === '42703') {
      console.warn('restaurants/[id]: updated_at missing (migration 050 not applied):', restaurantError.message);
      const fallback = await supabase.from('restaurants').select(restaurantColumnsFallback).eq('id', id).single();
      restaurant = fallback.data ? { ...fallback.data, updated_at: fallback.data.created_at } : null;
      restaurantError = fallback.error;
    }
    if (restaurantError) {
      console.error('Error fetching restaurant:', restaurantError);
      if (restaurantError.code === '42P01') {
        const errorType = 'DATABASE_ERROR' as ApiErrorType;
        return NextResponse.json({
          error: getErrorMessage(errorType),
          code: errorType,
          details: 'Execute supabase/migrations/000_create_core_tables.sql in your Supabase SQL Editor'
        }, { status: 500 });
      }
      const errorType = 'DATABASE_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 500 }
      );
    }

    if (!restaurant) {
      const errorType = 'NOT_FOUND' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 404 }
      );
    }

    // Normalize review_count (Supabase returns array for count)
    if (restaurant) {
      if (Array.isArray(restaurant.review_count)) {
        (restaurant as any).review_count = restaurant.review_count[0]?.count ?? 0;
      } else if (restaurant.review_count && typeof restaurant.review_count === 'object') {
        (restaurant as any).review_count = (restaurant.review_count as any).count ?? 0;
      }
    }

    // Normalize lists (extract from nested list_restaurants)
    if (restaurant && restaurant.lists) {
      restaurant.lists = restaurant.lists
        .map((lr: any) => lr.list)
        .filter(Boolean);
    }

    return NextResponse.json({ restaurant });
    } catch (error) {
      console.error('Unexpected error:', error);
      const errorType = 'INTERNAL_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 500 }
      );
    }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const response = NextResponse.next();
    const supabase = await getServerClient(request, response);
    const { id } = await params;
    const body = await request.json();

    if (!id) {
      const errorType = 'VALIDATION_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 400 }
      );
    }
    
    // Get current user
    if (!supabase) {
      const errorType = 'INTERNAL_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 500 }
      );
    }
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      const errorType = 'AUTHENTICATION_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 401 }
      );
    }

    // Check if user owns the restaurant or is an admin
    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurants')
      .select('creator_id')
      .eq('id', id)
      .single();

    if (restaurantError) {
      console.error('Error checking restaurant ownership:', restaurantError);
      const errorType = 'DATABASE_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 500 }
      );
    }
    
    if (!restaurant) {
      const errorType = 'NOT_FOUND' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 404 }
      );
    }
    
    // Only allow the creator to edit the restaurant
    if (restaurant.creator_id !== user.id) {
      const errorType = 'AUTHORIZATION_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 403 }
      );
    }

    // Prepare update data
    const updateData: any = {};

    // Visit system removed (migration 20260625150000_drop_user_restaurant_visits)
    if (body.action && ['toggle_visited', 'remove_visit', 'add_visit'].includes(body.action)) {
      return NextResponse.json(
        { error: 'Visit system has been removed', code: 'GONE' },
        { status: 410 }
      );
    }

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
      longitude,
      rating
    } = body;

    // Validate coordinates if provided
    let validatedLatitude = null;
    let validatedLongitude = null;

    if (latitude !== undefined && longitude !== undefined) {
      if (!isValidCoordinates(latitude, longitude)) {
        return NextResponse.json({ error: 'Invalid coordinates provided' }, { status: 400 });
      }
      validatedLatitude = latitude;
      validatedLongitude = longitude;
    } else if (latitude !== undefined || longitude !== undefined) {
      return NextResponse.json({ error: 'Both latitude and longitude must be provided together' }, { status: 400 });
    }

    // Build update object
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description || null;
    if (image_url !== undefined) updateData.image_url = image_url || null;
    if (images !== undefined) updateData.images = images || [];
    if (display_image_index !== undefined) updateData.display_image_index = display_image_index || -1;
    if (location !== undefined) updateData.location = location || null;
    if (source_url !== undefined) updateData.source_url = source_url || null;
    if (menu_links !== undefined) updateData.menu_links = menu_links || [];
    if (menu_images !== undefined) updateData.menu_images = menu_images || [];
    if (phone_numbers !== undefined) updateData.phone_numbers = phone_numbers || [];
    if (validatedLatitude !== null) updateData.latitude = validatedLatitude;
    if (validatedLongitude !== null) updateData.longitude = validatedLongitude;
    if (rating !== undefined) updateData.rating = rating;

    // Only update if there are fields to update
    if (Object.keys(updateData).length === 0) {
      const errorType = 'VALIDATION_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('restaurants')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating restaurant:', error);
      const errorType = 'DATABASE_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 500 }
      );
    }

    return NextResponse.json({ restaurant: data });
    } catch (error) {
      console.error('Unexpected error:', error);
      const errorType = 'INTERNAL_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 500 }
      );
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const response = NextResponse.next();
    const supabase = await getServerClient(request, response);
    const { id } = await params;

    if (!id) {
      const errorType = 'VALIDATION_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 400 }
      );
    }
    
    // Get current user
    if (!supabase) {
      const errorType = 'INTERNAL_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 500 }
      );
    }
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      const errorType = 'AUTHENTICATION_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 401 }
      );
    }
    
    // Check if user owns the restaurant or is an admin
    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurants')
      .select('creator_id')
      .eq('id', id)
      .single();
    
    if (restaurantError) {
      console.error('Error checking restaurant ownership:', restaurantError);
      const errorType = 'DATABASE_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 500 }
      );
    }
    
    if (!restaurant) {
      const errorType = 'NOT_FOUND' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 404 }
      );
    }
    
    // Only allow the creator to delete the restaurant
    if (restaurant.creator_id !== user.id) {
      const errorType = 'AUTHORIZATION_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 403 }
      );
    }

    // Delete the restaurant
    const { error } = await supabase
      .from('restaurants')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting restaurant:', error);
      const errorType = 'DATABASE_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ message: 'Restaurant deleted successfully' });
  } catch (error) {
    console.error('Unexpected error:', error);
    const errorType = 'INTERNAL_ERROR' as ApiErrorType;
    return NextResponse.json(
      { error: getErrorMessage(errorType), code: errorType },
      { status: 500 }
    );
  }
}
