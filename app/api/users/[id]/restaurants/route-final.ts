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

    // Use optimized database function for best performance
    let result;
    if (cursor) {
      // Cursor-based pagination using the optimized function
      const { data, error } = await supabase
        .rpc('get_user_restaurants_paginated', {
          p_user_id: targetUserId,
          p_limit: limit,
          p_cursor: cursor
        });

      if (error) {
        console.error('Error fetching user restaurants with cursor:', error);
        return NextResponse.json(
          { error: 'Failed to fetch user restaurants' },
          { status: 500 }
        );
      }

      result = data;
    } else {
      // Standard pagination using the optimized function
      const { data, error } = await supabase
        .rpc('get_user_restaurants_paginated', {
          p_user_id: targetUserId,
          p_limit: limit,
          p_cursor: null
        });

      if (error) {
        console.error('Error fetching user restaurants:', error);
        return NextResponse.json(
          { error: 'Failed to fetch user restaurants' },
          { status: 500 }
        );
      }

      result = data;
    }

    if (!result || result.length === 0) {
      return NextResponse.json({
        data: [],
        total: 0,
        page,
        limit,
        hasMore: false,
        nextPage: null,
        nextCursor: null,
        timestamp: new Date().toISOString()
      }, {
        headers: {
          'Cache-Control': 'public, max-age=300, stale-while-revalidate=600' // Cache for 5 minutes
        }
      });
    }

    // Extract pagination info from the first row (since it's the same for all rows in the result)
    const firstRow = result[0];
    const total = firstRow.total_count || 0;
    const nextCursor = firstRow.next_cursor || null;
    const hasMore = nextCursor !== null;
    const nextPage = hasMore ? page + 1 : null;

    // Transform the result to match the expected API response format
    const restaurants = result.map((row: any) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      imageUrl: row.image_url,
      priceLevel: row.price_per_person,
      rating: row.rating,
      location: row.location,
      sourceUrl: row.source_url,
      creator: row.creator,
      menuUrl: row.menu_url,
      visited: row.visited,
      phoneNumbers: row.phone_numbers,
      creatorId: row.creator_id,
      creatorName: row.creator_name,
      createdAt: row.created_at,
      images: row.images,
      displayImageIndex: row.display_image_index,
      menuLinks: row.menu_links,
      menuImages: row.menu_images,
      latitude: row.latitude,
      longitude: row.longitude,
      cuisineTypes: row.cuisine_types || [],
      dietaryOptions: row.dietary_options || [],
      features: row.features || []
    }));

    return NextResponse.json({
      data: restaurants,
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

    // Use optimized database function for best performance
    let result;
    if (cursor) {
      // Cursor-based pagination using the optimized function
      const { data, error } = await supabase
        .rpc('get_user_restaurants_paginated', {
          p_user_id: targetUserId,
          p_limit: limit,
          p_cursor: cursor
        });

      if (error) {
        console.error('Error fetching user restaurants with cursor:', error);
        return NextResponse.json(
          { error: 'Failed to fetch user restaurants' },
          { status: 500 }
        );
      }

      result = data;
    } else {
      // Standard pagination using the optimized function
      const { data, error } = await supabase
        .rpc('get_user_restaurants_paginated', {
          p_user_id: targetUserId,
          p_limit: limit,
          p_cursor: null
        });

      if (error) {
        console.error('Error fetching user restaurants:', error);
        return NextResponse.json(
          { error: 'Failed to fetch user restaurants' },
          { status: 500 }
        );
      }

      result = data;
    }

    if (!result || result.length === 0) {
      return NextResponse.json({
        data: [],
        total: 0,
        page,
        limit,
        hasMore: false,
        nextPage: null,
        nextCursor: null,
        timestamp: new Date().toISOString()
      }, {
        headers: {
          'Cache-Control': 'public, max-age=300, stale-while-revalidate=600' // Cache for 5 minutes
        }
      });
    }

    // Extract pagination info from the first row (since it's the same for all rows in the result)
    const firstRow = result[0];
    const total = firstRow.total_count || 0;
    const nextCursor = firstRow.next_cursor || null;
    const hasMore = nextCursor !== null;
    const nextPage = hasMore ? page + 1 : null;

    // Transform the result to match the expected API response format
    const restaurants = result.map((row: any) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      imageUrl: row.image_url,
      priceLevel: row.price_per_person,
      rating: row.rating,
      location: row.location,
      sourceUrl: row.source_url,
      creator: row.creator,
      menuUrl: row.menu_url,
      visited: row.visited,
      phoneNumbers: row.phone_numbers,
      creatorId: row.creator_id,
      creatorName: row.creator_name,
      createdAt: row.created_at,
      images: row.images,
      displayImageIndex: row.display_image_index,
      menuLinks: row.menu_links,
      menuImages: row.menu_images,
      latitude: row.latitude,
      longitude: row.longitude,
      cuisineTypes: row.cuisine_types || [],
      dietaryOptions: row.dietary_options || [],
      features: row.features || []
    }));

    return NextResponse.json({
      data: restaurants,
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