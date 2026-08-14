import { NextResponse } from 'next/server';
import { getPublicServerClient } from '@/libs/supabase/server';

export const dynamic = 'force-dynamic';

const cols = 'id, name, rating, review_count, price_per_person, location, images, display_image_index';

export async function GET() {
  try {
    const supabase = await getPublicServerClient();
    if (!supabase) {
      return NextResponse.json({ error: 'backend unavailable', code: 'INTERNAL_ERROR' }, { status: 500 });
    }
    const [re, rv, pr, ratings, top] = await Promise.all([
      supabase.from('restaurants').select('id', { count: 'exact', head: true }),
      supabase.from('reviews').select('id', { count: 'exact', head: true }),
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('restaurants').select('rating').not('rating', 'is', null).gt('review_count', 0),
      supabase.from('restaurants')
        .select(cols)
        .order('review_count', { ascending: false })
        .limit(20),
    ]);
    const ratingsList = ratings.data || [];
    const avg = ratingsList.length
      ? Math.round((ratingsList.reduce((s, r) => s + (r.rating || 0), 0) / ratingsList.length) * 10) / 10
      : 0;
    const topRestaurants = (top.data || []).map((r) => ({
      id: r.id,
      name: r.name,
      rating: r.rating || 0,
      review_count: r.review_count || 0,
      price_per_person: r.price_per_person || 0,
      location: r.location || '',
      images: r.images || [],
      display_image_index: r.display_image_index,
    }));
    return NextResponse.json({
      data: {
        restaurants: re.count || 0,
        users: pr.count || 0,
        reviews: rv.count || 0,
        avgRating: avg,
        topRestaurants,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'internal', code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
