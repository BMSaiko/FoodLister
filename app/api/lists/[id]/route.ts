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

    // Single optimized query that gets list with all its restaurants
    const { data, error } = await supabase
      .from('lists')
      .select(`
        *,
        list_restaurants(
          restaurants(*)
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching list details:', error);
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'List not found' }, { status: 404 });
      }
      return NextResponse.json({ error: 'Failed to fetch list details' }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'List not found' }, { status: 404 });
    }

    // Transform data for easier client consumption
    const processedData = {
      ...data,
      restaurants: data.list_restaurants?.map((lr: any) => lr.restaurants).filter(Boolean) || []
    };

    // Remove the intermediate table data
    delete processedData.list_restaurants;

    // Add caching headers for better performance
    const response = NextResponse.json({ list: processedData });
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
    return response;
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
