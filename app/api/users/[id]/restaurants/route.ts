import { NextRequest, NextResponse } from 'next/server';
import { getServerClient } from '@/libs/supabase/server';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const response = new NextResponse();
    const supabase = await getServerClient(request, response) as any;
    
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
    const offset = (page - 1) * limit;

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
    const isOwnProfile = profileData.user_id === user.id;

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

    // Get user restaurants with pagination
    const { data: restaurantsData, error: restaurantsError } = await supabase
      .from('restaurants')
      .select(`
        *,
        cuisine_types (
          name
        ),
        restaurant_dietary_options_junction (
          restaurant_dietary_options (
            name
          )
        ),
        restaurant_restaurant_features (
          restaurant_features (
            name
          )
        )
      `)
      .eq('creator_id', targetUserId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Get total count
    const { count } = await supabase
      .from('restaurants')
      .select('id', { count: 'exact', head: true })
      .eq('creator_id', targetUserId);

    if (restaurantsError) {
      console.error('Error fetching user restaurants:', restaurantsError);
      return NextResponse.json(
        { error: 'Failed to fetch user restaurants' },
        { status: 500 }
      );
    }

    // Transform the restaurants data
    const restaurants = restaurantsData?.map((restaurant: any) => ({
      id: restaurant.id,
      name: restaurant.name,
      description: restaurant.description,
      imageUrl: restaurant.image_url,
      location: restaurant.location,
      priceLevel: restaurant.price_level,
      rating: restaurant.rating,
      openingHours: restaurant.opening_hours,
      website: restaurant.website,
      phone: restaurant.phone,
      menu: restaurant.menu,
      createdAt: restaurant.created_at,
      updatedAt: restaurant.updated_at,
      cuisineTypes: restaurant.cuisine_types?.map((ct: any) => ct.name) || [],
      dietaryOptions: restaurant.restaurant_dietary_options_junction?.map((junction: any) => junction.restaurant_dietary_options?.name).filter(Boolean) || [],
      features: restaurant.restaurant_restaurant_features?.map((junction: any) => junction.restaurant_features?.name).filter(Boolean) || []
    })) || [];

    return NextResponse.json({
      data: restaurants,
      total: count || 0,
      page,
      limit,
      hasMore: count ? count > (offset + limit) : false
    });

  } catch (error) {
    console.error('Error in user restaurants GET:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
