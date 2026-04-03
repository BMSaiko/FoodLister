// app/api/lists/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerClient } from '@/libs/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const responseObj = NextResponse.next();
    const supabase = await getServerClient(request, responseObj);
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    // Get lists with search filter if provided
    // RLS policies will automatically filter based on is_public and user ownership
    // If user is not authenticated, supabase will be null, so we need to handle that
    let listsQuery;
    
    if (supabase) {
      // User is authenticated, use authenticated client
      listsQuery = supabase
        .from('lists')
        .select('*');
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
        .select('*')
        .eq('is_public', true);
    }

    if (search) {
      listsQuery = listsQuery.ilike('name', `%${search}%`);
    }

    const { data: listsData, error: listsError } = await listsQuery;

    if (listsError) {
      console.error('Error fetching lists:', listsError);
      return NextResponse.json({ error: 'Failed to fetch lists' }, { status: 500 });
    }

    if (!listsData) {
      return NextResponse.json({ lists: [] });
    }

    // Fetch individual counts for each list
    // Use the appropriate client based on whether user is authenticated
    const countClient = supabase || (async () => {
      const { createClient } = await import('@supabase/supabase-js');
      return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      );
    })();
    
    const resolvedCountClient = typeof countClient === 'object' ? countClient : await countClient;
    
    const processedData = await Promise.all(
      listsData.map(async (list: any) => {
        const { count, error } = await resolvedCountClient
          .from('list_restaurants')
          .select('*', { count: 'exact', head: true })
          .eq('list_id', list.id);

        if (error) {
          console.error('Error fetching count for list:', list.id, error);
        }

        return {
          ...list,
          restaurantCount: count || 0
        };
      })
    );

    // Add caching headers for better performance
    const response = NextResponse.json({ lists: processedData });
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
    return response;
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
