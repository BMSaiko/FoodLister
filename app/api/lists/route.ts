// app/api/lists/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerClient } from '@/libs/supabase/server';
import { getErrorMessage } from '@/types/api';
import type { ApiErrorType } from '@/types/api';
import type { Database } from '@/types/database';
type DbList = Database['public']['Tables']['lists']['Row'];

export async function GET(request: NextRequest) {
  try {
    const responseObj = NextResponse.next();
    const supabase = await getServerClient(request, responseObj);
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    // Get lists with search filter if provided
    // SECURITY: Explicitly filter by is_public and user ownership
    // RLS policies provide additional protection, but we also enforce filtering at the application level
    let listsQuery;
    
    if (supabase) {
      // User is authenticated: fetch their own lists + public lists from others
      // We need to get the user's ID to filter properly
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Fetch lists that are either public OR owned by the current user
        listsQuery = supabase
          .from('lists')
          .select('id, name, description, creator_id, creator_name, is_public, filters, tags, cover_image_url, created_at, updated_at')
          .or(`is_public.eq.true,creator_id.eq.${user.id}`);
      } else {
        // Fallback: if we can't get user, only show public lists
        listsQuery = supabase
          .from('lists')
          .select('id, name, description, creator_id, creator_name, is_public, filters, tags, cover_image_url, created_at, updated_at')
          .eq('is_public', true);
      }
    } else {
      // User is not authenticated, create a public client
      const { createClient } = await import('@supabase/supabase-js');
      const publicSupabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      );
      
      // For unauthenticated users, only fetch public lists
      listsQuery = publicSupabase
        .from('lists')
        .select('id, name, description, creator_id, creator_name, is_public, filters, tags, cover_image_url, created_at, updated_at')
        .eq('is_public', true);
    }

    if (search) {
      listsQuery = listsQuery.ilike('name', `%${search}%`);
    }

    let { data: listsData, error: listsError } = await listsQuery;
    // Fallback: retry without updated_at if migration 050 not applied
    if (listsError && listsError.code === '42703') {
      console.warn('lists: updated_at missing (migration 050 not applied):', listsError.message);
      const fallbackClient = supabase || (() => {
        const { createClient } = await import('@supabase/supabase-js');
        return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');
      })();
      let fallbackQuery = fallbackClient.from('lists')
        .select('id, name, description, creator_id, creator_name, is_public, filters, tags, cover_image_url, created_at');
      if (supabase) {
        const { data: { user } } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
        if (user) fallbackQuery = fallbackQuery.or(`is_public.eq.true,creator_id.eq.${user.id}`);
        else fallbackQuery = fallbackQuery.eq('is_public', true);
      } else {
        fallbackQuery = fallbackQuery.eq('is_public', true);
      }
      if (search) fallbackQuery = fallbackQuery.ilike('name', `%${search}%`);
      const fallback = await fallbackQuery;
      listsData = fallback.data?.map((l: any) => ({ ...l, updated_at: l.created_at })) || null;
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
      restaurantCount: countsMap.get(list.id) || 0
    }));

    // Add caching headers for better performance
    const response = NextResponse.json({ lists: processedData });
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
