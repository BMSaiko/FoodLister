import { NextRequest, NextResponse } from 'next/server';
import { getServerClient, getPublicServerClient } from '@/libs/supabase/server';
import {
  validateProfileAccess,
  getUserProfileData,
  getUserReviewsData,
  getUserListsData
} from '@/libs/auth';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: userId } = await params;

    if (!userId) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    // Try authenticated client first
    const response = new NextResponse();
    let supabase = await getServerClient(request, response) as any;

    // If no auth, use public client for public profiles
    if (!supabase) {
      supabase = await getPublicServerClient();
      if (!supabase) {
        return NextResponse.json(
          { error: 'Service unavailable' },
          { status: 503 }
        );
      }
    }

    // Get the authenticated user (optional for public profiles)
    let currentUserId = null;
    try {
      const authResult = await supabase.auth.getUser();
      if (authResult.data?.user) {
        currentUserId = authResult.data.user.id;
      }
    } catch (error) {
      // Ignore auth errors for public access
    }

    // 1. Validate profile access
    const accessValidation = await validateProfileAccess(
      supabase,
      userId,
      currentUserId
    );

    if (!accessValidation.canAccess) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const { targetUserId, accessLevel } = accessValidation;

    if (!targetUserId || accessLevel === 'NONE') {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // 2. Get profile data
    const profileData = await getUserProfileData(
      supabase,
      targetUserId,
      accessLevel as 'OWNER' | 'PUBLIC' | 'PRIVATE'
    );

    if (!profileData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // 3. Get additional data based on access level
    const [reviewsData, listsData] = await Promise.all([
      getUserReviewsData(supabase, targetUserId, accessLevel as 'OWNER' | 'PUBLIC' | 'PRIVATE', 1, 12),
      getUserListsData(supabase, targetUserId, accessLevel as 'OWNER' | 'PUBLIC' | 'PRIVATE', 1, 12)
    ]);

    // 4. Count created restaurants (always public)
    const { count: restaurantsCount } = await supabase
      .from('restaurants')
      .select('id', { count: 'exact', head: true })
      .eq('creator_id', targetUserId);

    // 5. Build response — filter sensitive fields for public access
    const isPublicAccess = accessLevel === 'PUBLIC' || accessLevel === 'PRIVATE';
    const userProfile = {
      id: profileData.user_id,
      userIdCode: profileData.user_id_code,
      name: profileData.display_name,
      profileImage: profileData.avatar_url,
      location: isPublicAccess ? undefined : profileData.location,
      bio: profileData.bio,
      website: isPublicAccess ? undefined : profileData.website,
      phoneNumber: isPublicAccess ? undefined : profileData.phone_number,
      publicProfile: profileData.public_profile,
      createdAt: isPublicAccess ? undefined : profileData.created_at,
      updatedAt: isPublicAccess ? undefined : profileData.updated_at,
      stats: {
        totalReviews: profileData.total_reviews || 0,
        totalLists: profileData.total_lists || 0,
        totalRestaurantsAdded: restaurantsCount || 0,
        joinedDate: profileData.created_at
      },
      recentReviews: reviewsData.data,
      recentLists: listsData.data,
      accessLevel,
      isOwnProfile: accessLevel === 'OWNER'
    };

    // Remove undefined fields from response
    const cleanProfile = Object.fromEntries(
      Object.entries(userProfile).filter(([, v]) => v !== undefined)
    ) as Record<string, unknown>;

    return NextResponse.json(cleanProfile);

  } catch (error) {
    console.error('Error in user profile GET:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
