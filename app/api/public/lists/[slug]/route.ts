// app/api/public/lists/[slug]/route.ts
// T26: embed público read-only de listas. Sem autenticação, só whitelist de campos
// públicos e apenas listas is_public. Nunca expõe emails de creator, colaboradores,
// permissões, filtros nem comentários.
import { NextRequest, NextResponse } from 'next/server';
import { getPublicServerClient } from '@/libs/supabase/server';
import { isUuid } from '@/libs/slug';

const LIST_COLS = 'id, slug, name, description, creator_name, is_public, tags, cover_image_url, created_at';
const RESTAURANT_COLS = `id, slug, name, description, price_per_person, rating, review_count,
  location, source_url, opentable_url, yelp_url, menu_links,
  phone_numbers, created_at, images, latitude, longitude`;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    if (!slug) {
      return NextResponse.json({ error: 'slug required' }, { status: 400 });
    }

    const client = await getPublicServerClient();
    if (!client) {
      return NextResponse.json({ error: 'service unavailable' }, { status: 503 });
    }

    const key = isUuid(slug) ? 'id' : 'slug';

    const { data: list, error: listError } = await client
      .from('lists')
      .select(LIST_COLS)
      .eq(key, slug)
      .single();
    if (listError || !list) {
      return NextResponse.json({ error: 'list not found' }, { status: 404 });
    }
    // Só listas públicas são servidas por esta superfície.
    if (!list.is_public) {
      return NextResponse.json({ error: 'list not found' }, { status: 404 });
    }

    const { data: lr } = await client
      .from('list_restaurants')
      .select('restaurant_id, position')
      .eq('list_id', list.id)
      .order('position', { ascending: true }) as {
      data: { restaurant_id: string; position: number }[] | null;
    };

    let restaurants: any[] = [];
    if (lr && lr.length) {
      const ids = lr.map((r) => r.restaurant_id);
      const { data: rd, error: re } = await client
        .from('restaurants')
        .select(RESTAURANT_COLS)
        .in('id', ids);
      if (!re && rd) {
        const order = lr.reduce<Record<string, number>>((acc, x) => {
          acc[x.restaurant_id] = x.position;
          return acc;
        }, {});
        restaurants = [...(rd as any[])].sort(
          (a, b) => (order[a.id] ?? 0) - (order[b.id] ?? 0)
        );
      }
    }

    return NextResponse.json({
      list: {
        id: list.id,
        slug: list.slug,
        name: list.name,
        description: list.description,
        creator_name: list.creator_name,
        is_public: list.is_public,
        tags: list.tags,
        cover_image_url: list.cover_image_url,
        created_at: list.created_at,
        restaurants,
      },
    });
  } catch (error) {
    console.error('public/lists GET error', error);
    return NextResponse.json({ error: 'internal error' }, { status: 500 });
  }
}