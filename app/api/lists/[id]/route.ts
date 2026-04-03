// app/api/lists/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getClient } from '@/libs/supabase/client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getClient();
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'List ID is required' }, { status: 400 });
    }

    // Step 1: Fetch the list details
    const { data: listData, error: listError } = await supabase
      .from('lists')
      .select('*')
      .eq('id', id)
      .single();

    if (listError) {
      console.error('Error fetching list:', listError);
      if (listError.code === 'PGRST116') {
        return NextResponse.json({ error: 'List not found' }, { status: 404 });
      }
      return NextResponse.json({ error: 'Failed to fetch list details', details: listError.message }, { status: 500 });
    }

    if (!listData) {
      return NextResponse.json({ error: 'List not found' }, { status: 404 });
    }

    // Step 2: Fetch restaurant IDs from list_restaurants
    const { data: listRestaurants, error: listRestaurantsError } = await supabase
      .from('list_restaurants')
      .select('restaurant_id')
      .eq('list_id', id) as { data: { restaurant_id: string }[] | null; error: any };

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
      
      const { data: restaurantData, error: restaurantError } = await supabase
        .from('restaurants')
        .select(`
          *,
          restaurant_restaurant_features(
            restaurant_features(*)
          ),
          restaurant_dietary_options_junction(
            restaurant_dietary_options(*)
          ),
          restaurant_cuisine_types(
            cuisine_types(*)
          )
        `)
        .in('id', restaurantIds);

      if (restaurantError) {
        console.error('Error fetching restaurants:', restaurantError);
        // Continue with empty restaurants array instead of failing
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
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
