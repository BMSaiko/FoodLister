// app/api/restaurants/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerClient } from '@/libs/supabase/server';

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
  cuisine_types?: any[];
  review_count?: number;
}

export async function GET(request: NextRequest) {
  const response = NextResponse.next();
  try {
    const supabase = await getServerClient(request, response);
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    // Single optimized query with joins - Load ALL restaurants at once
    let query = supabase
      .from('restaurants')
      .select(`
        *,
        cuisine_types:restaurant_cuisine_types(
          cuisine_type:cuisine_types(*)
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
      return NextResponse.json({ error: 'Failed to fetch restaurants' }, { status: 500 });
    }

    // Transform data for easier client consumption
    const restaurants: Restaurant[] = (restaurantsData || []).map((restaurant: any) => ({
      ...restaurant,
      cuisine_types: restaurant.cuisine_types
        ? restaurant.cuisine_types.map((relation: any) => relation.cuisine_type)
        : [],
      review_count: restaurant.reviews?.[0]?.count || 0
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
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
