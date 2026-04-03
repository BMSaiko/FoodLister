import { NextRequest, NextResponse } from 'next/server';
import { getServerClient, getPublicServerClient } from '@/libs/supabase/server';

// Helper function to handle public requests (unauthenticated)
async function handlePublicRequest(request: NextRequest, supabase: any, params: { id: string }) {
  try {
    const { id: userId } = params;

    // Parse query parameters
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '12');
    const cursor = url.searchParams.get('cursor'); // For cursor-based pagination

    // Check if the ID is a user_id_code (format FL000001) or a UUID
    const isUserCode = /^[A-Z]{2}\d{6}$/.test(userId);

    // Get the user profile to check if it's public
    let profileQuery = supabase
      .from('profiles')
      .select('user_id, public_profile');

    if (isUserCode) {
      profileQuery = profileQuery.eq('user_id_code', userId);
    } else {
      profileQuery = profileQuery.eq('user_id', userId);
    }

    const { data: profileData, error: profileError } = await profileQuery.single();

    if (profileError || !profileData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // For public requests, only allow access to public profiles
    if (!profileData.public_profile) {
      return NextResponse.json(
        { error: 'Profile is private' },
        { status: 404 }
      );
    }

    const targetUserId = profileData.user_id;

    // Use optimized database view for better performance
    let restaurantsQuery;
    let totalCountQuery;

    if (cursor) {
      // Cursor-based pagination (more efficient for large datasets)
      restaurantsQuery = supabase
        .from('restaurant_data_view')
        .select(`
          id,
          name,
          description,
          image_url,
          price_per_person,
          rating,
          location,
          source_url,
          creator,
          menu_url,
          visited,
          phone_numbers,
          creator_id,
          creator_name,
          created_at,
          images,
          display_image_index,
          menu_links,
          menu_images,
          latitude,
          longitude,
          cuisine_types,
          dietary_options,
          features
        `)
        .eq('creator_id', targetUserId)
        .lt('created_at', supabase.rpc('get_created_at_from_id', { restaurant_id: cursor }))
        .order('created_at', { ascending: false })
        .limit(limit);
    } else {
      // Standard pagination with optimized query
      restaurantsQuery = supabase
        .from('restaurant_data_view')
        .select(`
          id,
          name,
          description,
          image_url,
          price_per_person,
          rating,
          location,
          source_url,
          creator,
          menu_url,
          visited,
          phone_numbers,
          creator_id,
          creator_name,
          created_at,
          images,
          display_image_index,
          menu_links,
          menu_images,
          latitude,
          longitude,
          cuisine_types,
          dietary_options,
          features
        `)
        .eq('creator_id', targetUserId)
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);
    }

    // Get total count efficiently
    totalCountQuery = supabase
      .from('restaurants')
      .select('id', { count: 'exact', head: true })
      .eq('creator_id', targetUserId);

    const [restaurantsResult, countResult] = await Promise.all([
      restaurantsQuery,
      totalCountQuery
    ]);

    const { data: restaurantsData, error: restaurantsError } = restaurantsResult;
    const { count: totalCount, error: countError } = countResult;

    if (restaurantsError) {
      console.error('Error fetching user restaurants:', restaurantsError);
      return NextResponse.json(
        { error: 'Failed to fetch user restaurants' },
        { status: 500 }
      );
    }

    if (countError) {
      console.error('Error fetching total count:', countError);
      return NextResponse.json(
        { error: 'Failed to fetch total count' },
        { status: 500 }
      );
    }

    // Calculate pagination info
    const total = totalCount || 0;
    const hasMore = total > (page * limit);
    const nextPage = hasMore ? page + 1 : null;
    const nextCursor = restaurantsData && restaurantsData.length > 0 ? restaurantsData[restaurantsData.length - 1].id : null;

    return NextResponse.json({
      data: restaurantsData || [],
      total: total,
      page,
      limit,
      hasMore,
      nextPage,
      nextCursor,
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=600' // Cache for 5 minutes
      }
    });

  } catch (error) {
    console.error('Error in public user restaurants GET:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const response = new NextResponse();
    const supabase = await getServerClient(request, response) as any;
    
    // If no supabase client (unauthenticated), create a public client
    if (!supabase) {
      const publicSupabase = await getPublicServerClient();
      if (!publicSupabase) {
        return NextResponse.json(
          { error: 'Unable to connect to database' },
          { status: 500 }
        );
      }
      // Use public client for read-only access to public profiles
      return await handlePublicRequest(request, publicSupabase, await params);
    }
    
    // Get the authenticated user (optional for public profiles)
    let user = null;
    let authError = null;
    
    try {
      const authResult = await supabase.auth.getUser();
      user = authResult.data?.user;
      authError = authResult.error;
    } catch (error) {
      console.warn('Authentication check failed:', error);
    }

    const { id: userId } = await params;

    // Parse query parameters
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '12');
    const cursor = url.searchParams.get('cursor'); // For cursor-based pagination

    // Check if the ID is a user_id_code (format FL000001) or a UUID
    const isUserCode = /^[A-Z]{2}\d{6}$/.test(userId);

    // Get the user profile to check if it's public
    let profileQuery = supabase
      .from('profiles')
      .select('user_id, public_profile');

    if (isUserCode) {
      profileQuery = profileQuery.eq('user_id_code', userId);
    } else {
      profileQuery = profileQuery.eq('user_id', userId);
    }

    const { data: profileData, error: profileError } = await profileQuery.single();

    if (profileError || !profileData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if the current user is viewing their own profile
    const isOwnProfile = profileData.user_id === user?.id;

    // Simple access control:
    // - Users can always view their own profiles
    // - Users can view public profiles of others
    // - Private profiles of others are not accessible
    if (!isOwnProfile && !profileData.public_profile) {
      return NextResponse.json(
        { error: 'Profile is private' },
        { status: 404 }
      );
    }

    const targetUserId = profileData.user_id;

    // Use optimized database view for better performance
    let restaurantsQuery;
    let totalCountQuery;

    if (cursor) {
      // Cursor-based pagination (more efficient for large datasets)
      restaurantsQuery = supabase
        .from('restaurant_data_view')
        .select(`
          id,
          name,
          description,
          image_url,
          price_per_person,
          rating,
          location,
          source_url,
          creator,
          menu_url,
          visited,
          phone_numbers,
          creator_id,
          creator_name,
          created_at,
          images,
          display_image_index,
          menu_links,
          menu_images,
          latitude,
          longitude,
          cuisine_types,
          dietary_options,
          features
        `)
        .eq('creator_id', targetUserId)
        .lt('created_at', supabase.rpc('get_created_at_from_id', { restaurant_id: cursor }))
        .order('created_at', { ascending: false })
        .limit(limit);
    } else {
      // Standard pagination with optimized query
      restaurantsQuery = supabase
        .from('restaurant_data_view')
        .select(`
          id,
          name,
          description,
          image_url,
          price_per_person,
          rating,
          location,
          source_url,
          creator,
          menu_url,
          visited,
          phone_numbers,
          creator_id,
          creator_name,
          created_at,
          images,
          display_image_index,
          menu_links,
          menu_images,
          latitude,
          longitude,
          cuisine_types,
          dietary_options,
          features
        `)
        .eq('creator_id', targetUserId)
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);
    }

    // Get total count efficiently
    totalCountQuery = supabase
      .from('restaurants')
      .select('id', { count: 'exact', head: true })
      .eq('creator_id', targetUserId);

    const [restaurantsResult, countResult] = await Promise.all([
      restaurantsQuery,
      totalCountQuery
    ]);

    const { data: restaurantsData, error: restaurantsError } = restaurantsResult;
    const { count: totalCount, error: countError } = countResult;

    if (restaurantsError) {
      console.error('Error fetching user restaurants:', restaurantsError);
      return NextResponse.json(
        { error: 'Failed to fetch user restaurants' },
        { status: 500 }
      );
    }

    if (countError) {
      console.error('Error fetching total count:', countError);
      return NextResponse.json(
        { error: 'Failed to fetch total count' },
        { status: 500 }
      );
    }

    // Calculate pagination info
    const total = totalCount || 0;
    const hasMore = total > (page * limit);
    const nextPage = hasMore ? page + 1 : null;
    const nextCursor = restaurantsData && restaurantsData.length > 0 ? restaurantsData[restaurantsData.length - 1].id : null;

    return NextResponse.json({
      data: restaurantsData || [],
      total: total,
      page,
      limit,
      hasMore,
      nextPage,
      nextCursor,
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=600' // Cache for 5 minutes
      }
    });

  } catch (error) {
    console.error('Error in user restaurants GET:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}