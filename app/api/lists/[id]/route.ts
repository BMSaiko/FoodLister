// app/api/lists/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerClient, getPublicServerClient } from '@/libs/supabase/server';
import { getErrorMessage } from '@/types/api';
import { logActivity } from '@/libs/activity';
import type { ApiErrorType } from '@/types/api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      const errorType = 'VALIDATION_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 400 }
      );
    }

    // Try authenticated access first, fall back to public client for unauthenticated users
    const supabase = await getServerClient(request, new NextResponse());
    const client = supabase || (await getPublicServerClient());

    if (!client) {
      const errorType = 'INTERNAL_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 500 }
      );
    }

    // Step 1: Fetch the list details (with fallback for missing updated_at)
    let { data: listData, error: listError } = await client
      .from('lists')
      .select('id, name, description, creator_id, creator_name, is_public, filters, tags, cover_image_url, created_at, updated_at')
      .eq('id', id)
      .single();
    if (listError && listError.code === '42703') {
      console.warn('Missing column in lists (migration 050 not applied):', listError.message);
      const fallback = await client.from('lists')
        .select('id, name, description, creator_id, creator_name, is_public, filters, tags, cover_image_url, created_at')
        .eq('id', id)
        .single();
      listData = fallback.data ? { ...fallback.data, updated_at: fallback.data.created_at } : null;
      listError = fallback.error;
    }

    if (listError) {
      console.error('Error fetching list:', listError);
      if (listError.code === 'PGRST116') {
        const errorType = 'NOT_FOUND' as ApiErrorType;
        return NextResponse.json(
          { error: getErrorMessage(errorType), code: errorType },
          { status: 404 }
        );
      }
      const errorType = 'DATABASE_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 500 }
      );
    }

    if (!listData) {
      const errorType = 'NOT_FOUND' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 404 }
      );
    }

    // Step 2: Fetch restaurant IDs from list_restaurants (ordered by position)
    const { data: listRestaurants, error: listRestaurantsError } = await client
      .from('list_restaurants')
      .select('restaurant_id, position')
      .eq('list_id', id)
      .order('position', { ascending: true }) as { data: { restaurant_id: string; position: number }[] | null; error: any };

    if (listRestaurantsError) {
      console.error('Error fetching list restaurants:', listRestaurantsError);
      // Continue with empty restaurants array instead of failing
      const response = NextResponse.json({ 
        list: { 
          ...(listData as any), 
          restaurants: [] 
        } 
      });
      response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
      return response;
    }

    // Step 3: Fetch restaurant details with relationships
    let restaurants: any[] = [];
    if (listRestaurants && listRestaurants.length > 0) {
      const restaurantIds = listRestaurants.map((lr: { restaurant_id: string }) => lr.restaurant_id);
      
      const listRestaurantColumns = `id, name, description, image_url, price_per_person, rating,
          location, source_url, creator, menu_url, menu_links, menu_images,
          phone_numbers, created_at, updated_at, creator_id,
          creator_name, latitude, longitude, images, display_image_index,
          restaurant_restaurant_features(restaurant_features(id, name, icon)),
          restaurant_dietary_options_junction(restaurant_dietary_options(id, name, icon)),
          restaurant_cuisine_types(cuisine_types(id, name, icon))`;
      const listRestaurantColumnsFallback = `id, name, description, image_url, price_per_person, rating,
          location, source_url, creator, menu_url, menu_links, menu_images,
          phone_numbers, created_at, creator_id,
          creator_name, latitude, longitude, images, display_image_index,
          restaurant_restaurant_features(restaurant_features(id, name, icon)),
          restaurant_dietary_options_junction(restaurant_dietary_options(id, name, icon)),
          restaurant_cuisine_types(cuisine_types(id, name, icon))`;
      let { data: restaurantData, error: restaurantError } = await client
        .from('restaurants')
        .select(listRestaurantColumns)
        .in('id', restaurantIds);
      if (restaurantError && restaurantError.code === '42703') {
        console.warn('lists/[id]: updated_at missing on restaurants (migration 050 not applied):', restaurantError.message);
        const fallback = await client.from('restaurants').select(listRestaurantColumnsFallback).in('id', restaurantIds);
        restaurantData = fallback.data?.map((r: any) => ({ ...r, updated_at: r.created_at })) || null;
        restaurantError = fallback.error;
      }
      if (restaurantError) {
        console.error('Error fetching restaurants:', restaurantError);
      } else if (restaurantData) {
        restaurants = restaurantData;
      }
    }

    // Build response
    const responseData = {
      ...(listData as any),
      restaurants
    };

    // Add caching headers for better performance
    const response = NextResponse.json({ list: responseData });
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
    return response;
  } catch (error) {
    console.error('Unexpected error:', error);
    const errorType = 'INTERNAL_ERROR' as ApiErrorType;
    return NextResponse.json(
      { error: getErrorMessage(errorType), code: errorType },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await getServerClient();
    if (!supabase) {
      const errorType = 'AUTHENTICATION_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 401 }
      );
    }
    const { id } = await params;

    if (!id) {
      const errorType = 'VALIDATION_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 400 }
      );
    }

    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      const errorType = 'AUTHENTICATION_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 401 }
      );
    }

    // Fetch the list to check ownership
    const { data: listData, error: listError } = await supabase
      .from('lists')
      .select('creator_id')
      .eq('id', id)
      .single();

    if (listError) {
      console.error('Error fetching list for deletion:', listError);
      if (listError.code === 'PGRST116') {
        const errorType = 'NOT_FOUND' as ApiErrorType;
        return NextResponse.json(
          { error: getErrorMessage(errorType), code: errorType },
          { status: 404 }
        );
      }
      const errorType = 'DATABASE_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 500 }
      );
    }

    // Check if user is the creator
    if (listData.creator_id !== user.id) {
      const errorType = 'AUTHORIZATION_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 403 }
      );
    }

    // Delete the list (cascade will handle list_restaurants)
    const { error: deleteError } = await supabase
      .from('lists')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting list:', deleteError);
      const errorType = 'DATABASE_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'List deleted successfully' 
    });
  } catch (_error: unknown) {
    const errorType = 'INTERNAL_ERROR' as ApiErrorType;
    return NextResponse.json(
      { error: getErrorMessage(errorType), code: errorType },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await getServerClient();
    if (!supabase) {
      const errorType = 'AUTHENTICATION_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 401 }
      );
    }
    const { id } = await params;

    if (!id) {
      const errorType = 'VALIDATION_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 400 }
      );
    }

    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      const errorType = 'AUTHENTICATION_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 401 }
      );
    }

    // Fetch the list to check ownership
    const { data: listData, error: listError } = await supabase
      .from('lists')
      .select('creator_id')
      .eq('id', id)
      .single();

    if (listError || !listData) {
      const errorType = 'NOT_FOUND' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 404 }
      );
    }

    if (listData.creator_id !== user.id) {
      const errorType = 'AUTHORIZATION_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { restaurantOrder, ...listUpdates } = body;

    // Update list fields if provided
    if (Object.keys(listUpdates).length > 0) {
      const { error: updateError } = await supabase
        .from('lists')
        .update({ ...listUpdates, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (updateError) {
        console.error('Error updating list:', updateError);
        const errorType = 'DATABASE_ERROR' as ApiErrorType;
        return NextResponse.json(
          { error: getErrorMessage(errorType), code: errorType },
          { status: 500 }
        );
      }
    }

    // Update restaurant order if provided
    if (restaurantOrder && Array.isArray(restaurantOrder)) {
      for (let i = 0; i < restaurantOrder.length; i++) {
        const { error: orderError } = await supabase
          .from('list_restaurants')
          .update({ position: i })
          .eq('list_id', id)
          .eq('restaurant_id', restaurantOrder[i]);

        if (orderError) {
          console.error('Error updating restaurant order:', orderError);
        }
      }
    }

    // Log activity
    if (user) {
      await logActivity(supabase, id, user.id, 'list_updated', {});
    }

    return NextResponse.json({ 
      success: true, 
      message: 'List updated successfully' 
    });
  } catch (_error: unknown) {
    const errorType = 'INTERNAL_ERROR' as ApiErrorType;
    return NextResponse.json(
      { error: getErrorMessage(errorType), code: errorType },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await getServerClient();
    if (!supabase) {
      const errorType = 'AUTHENTICATION_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 401 }
      );
    }
    const { id } = await params;

    if (!id) {
      const errorType = 'VALIDATION_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 400 }
      );
    }

    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      const errorType = 'AUTHENTICATION_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 401 }
      );
    }

    // Fetch the original list (with fallback for missing updated_at)
    let { data: originalList, error: listError } = await supabase
      .from('lists')
      .select('id, name, description, creator_id, creator_name, is_public, filters, tags, cover_image_url, created_at, updated_at')
      .eq('id', id)
      .single();
    if (listError && listError.code === '42703') {
      console.warn('lists/[id] PATCH: updated_at missing (migration 050 not applied):', listError.message);
      const fallback = await supabase.from('lists')
        .select('id, name, description, creator_id, creator_name, is_public, filters, tags, cover_image_url, created_at')
        .eq('id', id)
        .single();
      originalList = fallback.data ? { ...fallback.data, updated_at: fallback.data.created_at } : null;
      listError = fallback.error;
    }

    if (listError || !originalList) {
      const errorType = 'NOT_FOUND' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name } = body;

    // Create new list (duplicate)
    const { data: newList, error: createError } = await supabase
      .from('lists')
      .insert({
        name: name || `${originalList.name} (Cópia)`,
        description: originalList.description,
        creator_id: user.id,
        creator_name: originalList.creator_name,
        is_public: originalList.is_public,
        filters: originalList.filters,
      })
      .select()
      .single();

    if (createError || !newList) {
      console.error('Error duplicating list:', createError);
      const errorType = 'DATABASE_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 500 }
      );
    }

    // Copy restaurants from original list
    const { data: originalRestaurants, error: fetchError } = await supabase
      .from('list_restaurants')
      .select('restaurant_id, position')
      .eq('list_id', id)
      .order('position', { ascending: true });

    if (!fetchError && originalRestaurants && originalRestaurants.length > 0) {
      const inserts = originalRestaurants.map((lr) => ({
        list_id: newList.id,
        restaurant_id: lr.restaurant_id,
        position: lr.position,
      }));

      const { error: insertError } = await supabase
        .from('list_restaurants')
        .insert(inserts);

      if (insertError) {
        console.error('Error copying restaurants:', insertError);
      }
    }

    // Log activity
    if (user && newList) {
      await logActivity(supabase, newList.id, user.id, 'list_duplicated', {
        original_list_id: id,
      });
    }

    return NextResponse.json({ 
      success: true, 
      list: newList,
      message: 'List duplicated successfully'
    });
  } catch (_error: unknown) {
    const errorType = 'INTERNAL_ERROR' as ApiErrorType;
    return NextResponse.json(
      { error: getErrorMessage(errorType), code: errorType },
      { status: 500 }
    );
  }
}