import { NextRequest, NextResponse } from 'next/server';
import { getServerClient } from '@/libs/supabase/server';
import { ensureUserProfileExists } from '@/libs/auth';

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
      // If no profile exists, return empty results instead of error
      // This allows users to have reviews/lists even without a profile
      return NextResponse.json({
        data: [],
        total: 0,
        page: 1,
        limit: limit,
        hasMore: false
      });
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

    // Get user reviews with pagination
    const { data: reviewsData, error: reviewsError } = await supabase
      .from('reviews')
      .select(`
        *,
        restaurants (
          id,
          name,
          image_url,
          rating,
          location
        )
      `)
      .eq('user_id', targetUserId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Get total count
    const { count } = await supabase
      .from('reviews')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', targetUserId);

    if (reviewsError) {
      console.error('Error fetching user reviews:', reviewsError);
      return NextResponse.json(
        { error: 'Failed to fetch user reviews' },
        { status: 500 }
      );
    }

    // Transform the reviews data
    const reviews = reviewsData?.map((review: any) => ({
      id: review.id,
      restaurantId: review.restaurant_id,
      userId: review.user_id,
      rating: review.rating,
      comment: review.comment,
      amountSpent: review.amount_spent,
      createdAt: review.created_at,
      updatedAt: review.updated_at,
      restaurant: {
        id: review.restaurants.id,
        name: review.restaurants.name,
        imageUrl: review.restaurants.image_url,
        rating: review.restaurants.rating,
        location: review.restaurants.location
      }
    })) || [];

    return NextResponse.json({
      data: reviews,
      total: count || 0,
      page,
      limit,
      hasMore: count ? count > (offset + limit) : false
    });

  } catch (error) {
    console.error('Error in user reviews GET:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
