import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/libs/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await getAuthenticatedClient(request);

    const body = await request.json();
    const { restaurantIds } = body;

    if (!Array.isArray(restaurantIds) || restaurantIds.length === 0) {
      return NextResponse.json({ error: 'restaurantIds array is required' }, { status: 400 });
    }

    // Get visit records for all restaurants for this user
    // RLS will automatically filter by authenticated user
    const { data: visitData, error: visitError } = await supabase
      .from('user_restaurant_visits')
      .select('*')
      .in('restaurant_id', restaurantIds);

    if (visitError) {
      console.error('Error fetching visit data:', visitError);
      return NextResponse.json({ error: 'Failed to fetch visit data' }, { status: 500 });
    }

    // Create a map of restaurant_id -> visit data
    const visitsMap: { [key: string]: { visited: boolean; visitCount: number } } = {};
    if (visitData) {
      visitData.forEach((visit: any) => {
        visitsMap[visit.restaurant_id] = {
          visited: visit.visited,
          visitCount: visit.visit_count
        };
      });
    }

    // Fill in missing restaurants with default values
    restaurantIds.forEach(id => {
      if (!visitsMap[id]) {
        visitsMap[id] = {
          visited: false,
          visitCount: 0
        };
      }
    });

    return NextResponse.json(visitsMap);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
