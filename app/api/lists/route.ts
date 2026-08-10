// app/api/lists/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerClient } from '@/libs/supabase/server';
import { getErrorMessage } from '@/types/api';
import type { ApiErrorType } from '@/types/api';
import type { Database } from '@/types/database';
import { parsePaginationFromRequest } from '@/libs/utils/pagination';
type DbList = Database['public']['Tables']['lists']['Row'];

export async function GET(request: NextRequest) {
  try {
    const responseObj = NextResponse.next();
    const supabase = await getServerClient(request, responseObj);
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const { page, limit, from, to } = parsePaginationFromRequest(request, { defaultLimit: 50 });

    let listsQuery;
    let currentUserId: string | null = null;

    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
      currentUserId = user?.id ?? null;

      if (user) {
        // ponytail: RLS handles visibility (public, own, collaborator)
        listsQuery = supabase
          .from('lists')
          .select('id, name, description, creator, creator_id, creator_name, is_public, filters, tags, cover_image_url, created_at, updated_at');
      } else {
        listsQuery = supabase
          .from('lists')
          .select('id, name, description, creator, creator_id, creator_name, is_public, filters, tags, cover_image_url, created_at, updated_at')
          .eq('is_public', true);
      }
    } else {
      const { createClient } = await import('@supabase/supabase-js');
      const publicSupabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      );
      listsQuery = publicSupabase
        .from('lists')
        .select('id, name, description, creator, creator_id, creator_name, is_public, filters, tags, cover_image_url, created_at, updated_at')
        .eq('is_public', true);
    }

    if (search) {
      listsQuery = listsQuery.ilike('name', `%${search}%`);
    }

    let { data: listsData, error: listsError } = await listsQuery.range(from, to);
    if (listsError && listsError.code === '42703') {
      console.warn('lists: updated_at missing (migration 050 not applied):', listsError.message);
      let fallbackClient = supabase;
      if (!fallbackClient) {
        const { createClient } = await import('@supabase/supabase-js');
        fallbackClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');
      }
      let fallbackQuery = fallbackClient.from('lists')
        .select('id, name, description, creator, creator_id, creator_name, is_public, filters, tags, cover_image_url, created_at, updated_at');
      if (supabase) {
        const { data: { user } } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
        currentUserId = user?.id ?? null;
        if (user) fallbackQuery = fallbackQuery;
        else fallbackQuery = fallbackQuery.eq('is_public', true);
      } else {
        fallbackQuery = fallbackQuery.eq('is_public', true);
      }
      if (search) fallbackQuery = fallbackQuery.ilike('name', `%${search}%`);
      const fallback = await fallbackQuery.range(from, to);
      const fallbackData = fallback.data?.map((l: any) => ({ ...l, creator: l.creator ?? l.creator_name ?? null })) || null;
      listsData = fallbackData as unknown as typeof listsData;
      listsError = fallback.error;
    }
    if (listsError) {
      console.error('Error fetching lists:', listsError);
      const errorType = 'DATABASE_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 500 }
      );
    }

    if (!listsData) {
      return NextResponse.json({ lists: [] });
    }

    // Fetch collaborator role map for the current user
    let roleMap = new Map<string, string>();
    if (currentUserId && listsData.length > 0) {
      const supabaseForCollab = supabase;
      if (supabaseForCollab) {
        const { data: collabs } = await supabaseForCollab
          .from('list_collaborators')
          .select('list_id, role')
          .eq('user_id', currentUserId)
          .in('list_id', listsData.map(l => l.id));
        for (const c of collabs || []) {
          roleMap.set(c.list_id, c.role);
        }
      }
    }

    // Fetch all list restaurant counts in a single query to avoid N+1 pattern
    let resolvedCountClient = supabase;
    if (!resolvedCountClient) {
      const { createClient } = await import('@supabase/supabase-js');
      resolvedCountClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      );
    }

    const listIds = listsData.map((list: DbList) => list.id);
    const countsMap = new Map<string, number>();

    if (listIds.length > 0) {
      const { data: allListRestaurants } = await resolvedCountClient
        .from('list_restaurants')
        .select('list_id')
        .in('list_id', listIds);

      if (allListRestaurants) {
        allListRestaurants.forEach((lr: { list_id: string }) => {
          countsMap.set(lr.list_id, (countsMap.get(lr.list_id) || 0) + 1);
        });
      }
    }

    const processedData = listsData.map((list: DbList) => ({
      ...list,
      restaurantCount: countsMap.get(list.id) || 0,
      userRole: roleMap.get(list.id) || (list.creator_id === currentUserId ? 'owner' : 'none'),
    }));

    const response = NextResponse.json({
      lists: processedData,
      pagination: { page, limit, returned: processedData.length, hasNext: processedData.length === limit },
    });
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
    return response;
    } catch (error) {
      console.error('Unexpected error:', error);
      const errorType = 'INTERNAL_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 500 }
      );
    }
}
