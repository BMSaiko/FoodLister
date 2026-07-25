import { NextRequest, NextResponse } from 'next/server';
import { getServerClient } from '@/libs/supabase/server';
import { cacheOrSet } from '@/libs/cache';

export async function GET(request: NextRequest) {
  try {
    const response = NextResponse.next();
    const supabase = await getServerClient(request, response);

    if (!supabase) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const stats = await cacheOrSet(`user-stats:${user.id}`, async () => {
      const [restRes, revRes] = await Promise.all([
        supabase.from('restaurants').select('*', { count: 'exact', head: true }).eq('creator_id', user.id),
        supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      ]);
      if (restRes.error || revRes.error) {
        throw restRes.error || revRes.error;
      }
      return {
        restaurants: restRes.count || 0,
        reviews: revRes.count || 0,
        visited: 0,
      };
    }, 30);

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Unexpected error in profile stats API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
