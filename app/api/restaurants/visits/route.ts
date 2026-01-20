import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(request: NextRequest) {
  try {
    // Get JWT token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Create a Supabase client and verify the token
    const supabase = createSupabaseClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { restaurantIds } = body;

    if (!Array.isArray(restaurantIds) || restaurantIds.length === 0) {
      return NextResponse.json({ error: 'restaurantIds array is required' }, { status: 400 });
    }

    // Get visit records for all restaurants for this user
    // Since RLS is disabled, we filter by user_id at application level
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
    const visitsMap = {};
    if (visitData) {
      visitData.forEach(visit => {
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
