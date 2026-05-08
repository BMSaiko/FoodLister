// app/api/restaurants/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getClient } from '@/libs/supabase/client';
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

    // Fetch restaurant details with features and dietary options
    const { data: restaurant, error: restaurantError } = await supabase
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
        )
      `)
      .eq('id', id)
      .single();

    if (restaurantError) {
      console.error('Error fetching restaurant:', restaurantError);

      // Check if the table doesn't exist (migration not run)
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

    // Handle different update actions
    if (body.action === 'toggle_visited') {
      // Toggle visited status
      const { data: visitData, error: visitError } = await supabase
        .from('user_restaurant_visits')
        .select('id')
        .eq('user_id', user.id)
        .eq('restaurant_id', id)
        .single();

    if (visitError && visitError.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error checking visit status:', visitError);
        const errorType = 'DATABASE_ERROR' as ApiErrorType;
        return NextResponse.json(
          { error: getErrorMessage(errorType), code: errorType },
          { status: 500 }
        );
      }

      if (visitData) {
        // Remove visit
        const { error: deleteError } = await supabase
          .from('user_restaurant_visits')
          .delete()
          .eq('user_id', user.id)
          .eq('restaurant_id', id);

        if (deleteError) {
          console.error('Error removing visit:', deleteError);
          const errorType = 'DATABASE_ERROR' as ApiErrorType;
          return NextResponse.json(
            { error: getErrorMessage(errorType), code: errorType },
            { status: 500 }
          );
        }

        // Check if user has any visits left for this restaurant
        const { data: remainingVisits, error: remainingError } = await supabase
          .from('user_restaurant_visits')
          .select('id')
          .eq('user_id', user.id)
          .eq('restaurant_id', id);

        if (remainingError) {
          console.error('Error checking remaining visits:', remainingError);
          const errorType = 'DATABASE_ERROR' as ApiErrorType;
          return NextResponse.json(
            { error: getErrorMessage(errorType), code: errorType },
            { status: 500 }
          );
        }

        const visitCount = remainingVisits ? remainingVisits.length : 0;
        const visited = visitCount > 0;

        return NextResponse.json({ visited, visit_count: visitCount });
      } else {
        // Add visit
        const { error: insertError } = await supabase
          .from('user_restaurant_visits')
          .insert({
            user_id: user.id,
            restaurant_id: id
          });

        if (insertError) {
          console.error('Error adding visit:', insertError);
          const errorType = 'DATABASE_ERROR' as ApiErrorType;
          return NextResponse.json(
            { error: getErrorMessage(errorType), code: errorType },
            { status: 500 }
          );
        }

        return NextResponse.json({ visited: true, visit_count: 1 });
      }
    } else if (body.action === 'remove_visit') {
      // Remove visit
      const { error: deleteError } = await supabase
        .from('user_restaurant_visits')
        .delete()
        .eq('user_id', user.id)
        .eq('restaurant_id', id);

        if (deleteError) {
          console.error('Error removing visit:', deleteError);
          const errorType = 'DATABASE_ERROR' as ApiErrorType;
          return NextResponse.json(
            { error: getErrorMessage(errorType), code: errorType },
            { status: 500 }
          );
        }
        
        // Check if user has any visits left for this restaurant
        const { data: remainingVisits, error: remainingError } = await supabase
          .from('user_restaurant_visits')
          .select('id')
          .eq('user_id', user.id)
          .eq('restaurant_id', id);
        
        if (remainingError) {
          console.error('Error checking remaining visits:', remainingError);
          const errorType = 'DATABASE_ERROR' as ApiErrorType;
          return NextResponse.json(
            { error: getErrorMessage(errorType), code: errorType },
            { status: 500 }
          );
        }

        const visitCount = remainingVisits ? remainingVisits.length : 0;
        const visited = visitCount > 0;

        return NextResponse.json({ visited, visit_count: visitCount });
      } else if (body.action === 'add_visit') {
        // Add visit
        const { error: insertError } = await supabase
          .from('user_restaurant_visits')
          .insert({
            user_id: user.id,
            restaurant_id: id
          });

        if (insertError) {
          console.error('Error adding visit:', insertError);
          const errorType = 'DATABASE_ERROR' as ApiErrorType;
          return NextResponse.json(
            { error: getErrorMessage(errorType), code: errorType },
            { status: 500 }
          );
        }

        return NextResponse.json({ visited: true, visit_count: 1 });
      } else {
      // Regular restaurant data update
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
    }
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
