import { NextRequest, NextResponse } from 'next/server';
import { getServerClient } from '@/libs/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.next();
    const supabase = await getServerClient(request, response);

    const body = await request.json();
    const { restaurantIds } = body;

    if (!Array.isArray(restaurantIds) || restaurantIds.length === 0) {
      return NextResponse.json({ error: 'restaurantIds array is required' }, { status: 400 });
    }

    if (!supabase) {
      return NextResponse.json({ error: 'Failed to initialize database connection' }, { status: 500 });
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (!user?.id) {
      console.error('❌ No authenticated user found!');
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    // Get visit records for all restaurants for this user
    const { data: visitData, error: visitError } = await supabase
      .from('user_restaurant_visits')
      .select('*')
      .eq('user_id', user.id)
      .in('restaurant_id', restaurantIds);

    if (visitError) {
      console.error('Error fetching visit data:', visitError);
      return NextResponse.json({ error: 'Failed to fetch visit data' }, { status: 500 });
    }

    // Create a map of restaurant_id -> visit data
    // Count visits per restaurant (table has one row per visit)
    const visitsMap: { [key: string]: { visited: boolean; visit_count: number } } = {};
    
    if (visitData) {
      // Group visits by restaurant_id
      const visitGroups: { [key: string]: any[] } = {};
      visitData.forEach((visit: any) => {
        if (!visitGroups[visit.restaurant_id]) {
          visitGroups[visit.restaurant_id] = [];
        }
        visitGroups[visit.restaurant_id].push(visit);
      });
      
      // Calculate visited and visit_count for each restaurant
      Object.keys(visitGroups).forEach(restaurantId => {
        const visits = visitGroups[restaurantId];
        visitsMap[restaurantId] = {
          visited: visits.length > 0,
          visit_count: visits.length
        };
      });
    }

    // Fill in missing restaurants with default values
    restaurantIds.forEach(id => {
      if (!visitsMap[id]) {
        visitsMap[id] = {
          visited: false,
          visit_count: 0
        };
      }
    });

    return NextResponse.json(visitsMap);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}