// app/api/restaurants/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getClient } from '@/libs/supabase/client';

export async function GET(request: NextRequest) {
  try {
    const supabase = getClient();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    // Single optimized query with joins
    let query = supabase
      .from('restaurants')
      .select(`
        *,
        cuisine_types:restaurant_cuisine_types(
          cuisine_type:cuisine_types(*)
        )
      `);

    // Add search filter if provided
    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching restaurants:', error);
      return NextResponse.json({ error: 'Failed to fetch restaurants' }, { status: 500 });
    }

    // Transform data for easier client consumption
    const processedData = data?.map((restaurant: any) => ({
      ...restaurant,
      cuisine_types: restaurant.cuisine_types
        ? restaurant.cuisine_types.map((relation: any) => relation.cuisine_type)
        : []
    })) || [];

    return NextResponse.json({ restaurants: processedData });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
