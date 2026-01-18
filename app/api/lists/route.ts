// app/api/lists/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getClient } from '@/libs/supabase/client';

export async function GET(request: NextRequest) {
  try {
    const supabase = getClient();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    // Single optimized query that gets lists with restaurant counts
    let query = supabase
      .from('lists')
      .select(`
        *,
        list_restaurants(count)
      `);

    // Add search filter if provided
    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching lists:', error);
      return NextResponse.json({ error: 'Failed to fetch lists' }, { status: 500 });
    }

    // Transform data to include restaurant count
    const processedData = data?.map((list: any) => ({
      ...list,
      restaurantCount: list.list_restaurants?.[0]?.count || 0
    })) || [];

    // Add caching headers for better performance
    const response = NextResponse.json({ lists: processedData });
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
    return response;
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
