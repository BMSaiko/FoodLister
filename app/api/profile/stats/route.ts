import { NextRequest, NextResponse } from 'next/server';
import { getServerClient } from '@/libs/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const response = NextResponse.next();
    const supabase = await getServerClient(request, response);

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Get user statistics using the function
    const { data: statsData, error: statsError } = await supabase
      .rpc('get_user_stats', { user_uuid: user.id });

    if (statsError) {
      console.error('Error fetching user stats:', statsError);
      return NextResponse.json({ error: 'Failed to fetch user statistics' }, { status: 500 });
    }

    // If no stats found, return zeros (user has no data yet)
    const stats = statsData && statsData.length > 0 ? statsData[0] : {
      user_id: user.id,
      restaurant_count: 0,
      review_count: 0,
      visited_count: 0
    };

    return NextResponse.json({
      restaurants: stats.restaurant_count || 0,
      reviews: stats.review_count || 0,
      visited: stats.visited_count || 0
    });

  } catch (error) {
    console.error('Unexpected error in profile stats API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}