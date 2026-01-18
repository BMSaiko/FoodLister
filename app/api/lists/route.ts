// app/api/lists/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getClient } from '@/libs/supabase/client';

export async function GET(request: NextRequest) {
  try {
    const supabase = getClient();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    // Get lists with search filter if provided
    let listsQuery = supabase
      .from('lists')
      .select('*');

    if (search) {
      listsQuery = listsQuery.ilike('name', `%${search}%`);
    }

    const { data: listsData, error: listsError } = await listsQuery;

    if (listsError) {
      console.error('Error fetching lists:', listsError);
      return NextResponse.json({ error: 'Failed to fetch lists' }, { status: 500 });
    }

    if (!listsData) {
      return NextResponse.json({ lists: [] });
    }

    // Fetch individual counts for each list
    const processedData = await Promise.all(
      listsData.map(async (list: any) => {
        const { count, error } = await supabase
          .from('list_restaurants')
          .select('*', { count: 'exact', head: true })
          .eq('list_id', list.id);

        if (error) {
          console.error('Error fetching count for list:', list.id, error);
        }

        return {
          ...list,
          restaurantCount: count || 0
        };
      })
    );

    // Add caching headers for better performance
    const response = NextResponse.json({ lists: processedData });
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
    return response;
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
