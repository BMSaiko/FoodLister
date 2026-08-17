import { NextRequest, NextResponse } from 'next/server';
import { getServerClient } from '@/libs/supabase/server';
import { buildFeedItems, SOURCE_LIMIT } from '@/libs/feed';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const supabase = await getServerClient(request, new NextResponse());
  if (!supabase) return NextResponse.json({ error: 'Unauthorized', code: 'AUTHENTICATION_ERROR' }, { status: 401 });

  const url = new URL(request.url);
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
  const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') || '15', 10)));
  const offset = (page - 1) * limit;

  const [reviews, lists, follows] = await Promise.all([
    supabase.from('reviews').select('id, user_id, user_name, created_at, restaurants(id, slug, name)')
      .order('created_at', { ascending: false }).limit(SOURCE_LIMIT),
    supabase.from('lists').select('id, creator_id, creator_name, slug, name, created_at')
      .eq('is_public', true).order('created_at', { ascending: false }).limit(SOURCE_LIMIT),
    supabase.from('user_follows').select('id, follower_id, following_id, created_at')
      .order('created_at', { ascending: false }).limit(SOURCE_LIMIT),
  ]);
  if (reviews.error || lists.error || follows.error) {
    return NextResponse.json({ error: 'Failed to load feed' }, { status: 500 });
  }

  const ids = new Set<string>();
  for (const r of reviews.data || []) ids.add(r.user_id);
  for (const l of lists.data || []) ids.add(l.creator_id);
  for (const f of follows.data || []) { ids.add(f.follower_id); ids.add(f.following_id); }
  const { data: profiles } = await supabase
    .from('profiles').select('user_id, display_name, avatar_url, user_id_code, public_profile')
    .in('user_id', [...ids]);

  const { data, total, hasMore } = buildFeedItems(
    reviews.data || [], lists.data || [], follows.data || [], profiles || [], offset, limit
  );

  return NextResponse.json({ data, total, page, limit, hasMore });
}
