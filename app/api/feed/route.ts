import { NextRequest, NextResponse } from 'next/server';
import { getServerClient } from '@/libs/supabase/server';
import { buildFeedItems, restaurantImage, LIST_COVERS, SOURCE_LIMIT } from '@/libs/feed';
import { privateNoStore, withCachePolicy } from '@/libs/http-cache';

export const dynamic = 'force-dynamic';

async function loadListCovers(supabase: any, listIds: string[]): Promise<Record<string, string[]>> {
  const listImages: Record<string, string[]> = {};
  if (listIds.length === 0) return listImages;
  const { data: lr } = await supabase
    .from('list_restaurants')
    .select('list_id, position, restaurants(id, images, display_image_index)')
    .in('list_id', listIds).order('position', { ascending: true });
  const seen: Record<string, number> = {};
  for (const row of (lr || []) as any[]) {
    seen[row.list_id] = (seen[row.list_id] || 0) + 1;
    if (seen[row.list_id] > LIST_COVERS) continue;
    const img = restaurantImage(row.restaurants)[0];
    if (img) (listImages[row.list_id] ||= []).push(img);
  }
  return listImages;
}

async function GETHandler(request: NextRequest) {
  const supabase = await getServerClient(request, new NextResponse());
  if (!supabase) return NextResponse.json({ error: 'Unauthorized', code: 'AUTHENTICATION_ERROR' }, { status: 401 });

  const url = new URL(request.url);
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
  const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') || '15', 10)));
  const offset = (page - 1) * limit;

  const [reviews, lists, follows] = await Promise.all([
    supabase.from('reviews').select('id, user_id, user_name, created_at, restaurants(id, slug, name, images, display_image_index)')
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
  const listIds = (lists.data || []).map((l: { id: string }) => l.id);

  // perfis e capas das listas em paralelo; capas numa só consulta (restaurante embutido),
  // fotos dos primeiros restaurantes por position, como /api/lists
  const [{ data: profiles }, listImages] = await Promise.all([
    supabase
      .from('profiles').select('user_id, display_name, avatar_url, user_id_code, public_profile')
      .in('user_id', [...ids]),
    loadListCovers(supabase, listIds),
  ]);

  const { data, total, hasMore } = buildFeedItems(
    reviews.data || [], lists.data || [], follows.data || [], profiles || [], offset, limit, listImages
  );

  return NextResponse.json({ data, total, page, limit, hasMore });
}

export const GET = withCachePolicy(privateNoStore, GETHandler);
