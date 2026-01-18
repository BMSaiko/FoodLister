// app/api/restaurants/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getClient } from '@/libs/supabase/client';

export async function GET(request: NextRequest) {
  try {
    const supabase = getClient();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    // First, fetch restaurants
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

    const { data: restaurantsData, error: restaurantsError } = await query;

    if (restaurantsError) {
      console.error('Error fetching restaurants:', restaurantsError);
      return NextResponse.json({ error: 'Failed to fetch restaurants' }, { status: 500 });
    }

    if (!restaurantsData || restaurantsData.length === 0) {
      return NextResponse.json({ restaurants: [] });
    }

    // Get review counts for all restaurants
    const restaurantIds = restaurantsData.map((r: any) => r.id);
    const { data: reviewCounts, error: reviewError } = await supabase
      .from('reviews')
      .select('restaurant_id')
      .in('restaurant_id', restaurantIds);

    if (reviewError) {
      console.error('Error fetching review counts:', reviewError);
      // Continue without review counts if there's an error
    }

    // Count reviews per restaurant
    const countMap: { [key: string]: number } = {};
    if (reviewCounts) {
      reviewCounts.forEach((review: any) => {
        countMap[review.restaurant_id] = (countMap[review.restaurant_id] || 0) + 1;
      });
    }

    // Transform data for easier client consumption
    const processedData = restaurantsData.map((restaurant: any) => ({
      ...restaurant,
      cuisine_types: restaurant.cuisine_types
        ? restaurant.cuisine_types.map((relation: any) => relation.cuisine_type)
        : [],
      review_count: countMap[restaurant.id] || 0
    }));

    return NextResponse.json({ restaurants: processedData });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
