import { NextRequest, NextResponse } from 'next/server';
import { getServerClient } from '@/libs/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const response = new NextResponse();
    const supabase = await getServerClient(request, response) as any;
    
    // Get the authenticated user
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse query parameters
    const url = new URL(request.url);
    const search = url.searchParams.get('q') || '';
    const location = url.searchParams.get('location') || '';
    const minReviews = url.searchParams.get('minReviews') ? parseInt(url.searchParams.get('minReviews')!) : undefined;
    const maxReviews = url.searchParams.get('maxReviews') ? parseInt(url.searchParams.get('maxReviews')!) : undefined;
    const minLists = url.searchParams.get('minLists') ? parseInt(url.searchParams.get('minLists')!) : undefined;
    const maxLists = url.searchParams.get('maxLists') ? parseInt(url.searchParams.get('maxLists')!) : undefined;
    const joinedAfter = url.searchParams.get('joinedAfter') || '';
    const joinedBefore = url.searchParams.get('joinedBefore') || '';
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Check if search is a user_id_code (FL000001 format)
    const isUserIdCode = /^FL\d{6}$/i.test(search);

    // Build base query
    let query = supabase
      .from('profiles')
      .select(`
        user_id,
        user_id_code,
        display_name,
        avatar_url,
        location,
        bio,
        public_profile,
        total_restaurants_visited,
        total_reviews,
        total_lists,
        created_at
      `, { count: 'exact' })
      .eq('public_profile', true);

    // Apply search filters - search by user_id_code, display_name, or email
    if (search) {
      if (isUserIdCode) {
        // Exact match for user_id_code
        query = query.eq('user_id_code', search.toUpperCase());
      } else {
        // Text search on display_name
        query = query.ilike('display_name', `%${search}%`);
      }
    }

    if (location) {
      query = query.ilike('location', `%${location}%`);
    }

    // Apply numeric filters
    if (minReviews !== undefined) {
      query = query.gte('total_reviews', minReviews);
    }

    if (maxReviews !== undefined) {
      query = query.lte('total_reviews', maxReviews);
    }

    if (minLists !== undefined) {
      query = query.gte('total_lists', minLists);
    }

    if (maxLists !== undefined) {
      query = query.lte('total_lists', maxLists);
    }

    // Apply date filters
    if (joinedAfter) {
      query = query.gte('created_at', joinedAfter);
    }

    if (joinedBefore) {
      query = query.lte('created_at', joinedBefore);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    // Execute query
    const { data, error, count } = await query;

    if (error) {
      console.error('Error searching users:', error);
      return NextResponse.json(
        { error: 'Failed to search users' },
        { status: 500 }
      );
    }

    // Transform data to match expected format
    const users = data?.map((item: any) => ({
      id: item.user_id,
      name: item.display_name,
      profileImage: item.avatar_url,
      userIdCode: item.user_id_code,
      location: item.location,
      bio: item.bio,
      publicProfile: item.public_profile,
      totalRestaurantsVisited: item.total_restaurants_visited,
      totalReviews: item.total_reviews,
      totalLists: item.total_lists,
      createdAt: item.created_at
    })) || [];

    return NextResponse.json({
      data: users,
      total: count || 0,
      page,
      limit,
      hasMore: count ? count > (offset + limit) : false
    });

  } catch (error) {
    console.error('Error in user search:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
