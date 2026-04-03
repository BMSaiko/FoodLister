import { NextRequest, NextResponse } from 'next/server';
import { getServerClient } from '@/libs/supabase/server';
import { validateProfileAccess, getUserProfileData, getUserReviewsData, getUserListsData } from '@/libs/auth';

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

    // Validate access to own profile
    const accessValidation = await validateProfileAccess(
      supabase,
      user.id,
      user.id
    );

    if (!accessValidation.canAccess) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Get profile data
    const profileData = await getUserProfileData(
      supabase,
      user.id,
      'OWNER'
    );

    if (!profileData) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Get recent reviews and lists
    const [reviewsData, listsData] = await Promise.all([
      getUserReviewsData(supabase, user.id, 'OWNER', 1, 5),
      getUserListsData(supabase, user.id, 'OWNER', 1, 5)
    ]);

    // Get restaurant count
    const { count: restaurantsCount } = await supabase
      .from('restaurants')
      .select('id', { count: 'exact', head: true })
      .eq('creator_id', user.id);

    // Transform response to match frontend interface
    const userProfile = {
      id: profileData.user_id,
      userIdCode: profileData.user_id_code,
      name: profileData.display_name, // Changed from display_name to name
      profileImage: profileData.avatar_url, // Changed from avatar_url to profileImage
      location: profileData.location,
      bio: profileData.bio,
      website: profileData.website,
      phoneNumber: profileData.phone_number, // Changed from phone_number to phoneNumber
      publicProfile: profileData.public_profile, // Changed from public_profile to publicProfile
      createdAt: profileData.created_at, // Changed from created_at to createdAt
      updatedAt: profileData.updated_at, // Changed from updated_at to updatedAt
      stats: {
        totalRestaurantsVisited: profileData.total_restaurants_visited || 0,
        totalReviews: profileData.total_reviews || 0,
        totalLists: profileData.total_lists || 0,
        totalRestaurantsAdded: restaurantsCount || 0,
        joinedDate: profileData.created_at
      },
      recentReviews: reviewsData.data,
      recentLists: listsData.data,
      accessLevel: 'OWNER',
      isOwnProfile: true
    };

    return NextResponse.json(userProfile);

  } catch (error) {
    console.error('Error in user profile GET:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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

    const body = await request.json();
    
    // Validate required fields
    if (!body.display_name || body.display_name.trim() === '') {
      return NextResponse.json(
        { error: 'Display name is required' },
        { status: 400 }
      );
    }

    // Validate website format if provided
    if (body.website && body.website.trim() !== '') {
      try {
        new URL(body.website);
      } catch {
        return NextResponse.json(
          { error: 'Invalid website URL format' },
          { status: 400 }
        );
      }
    }

    // Validate public_profile field if provided
    if (body.public_profile !== undefined && typeof body.public_profile !== 'boolean') {
      return NextResponse.json(
        { error: 'Public profile must be a boolean value' },
        { status: 400 }
      );
    }

    // Check if profile exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    let profileData;
    let profileError;

    if (checkError && checkError.code !== 'PGRST116') {
      return NextResponse.json(
        { error: 'Failed to check existing profile' },
        { status: 500 }
      );
    } else if (!existingProfile) {
      // Profile doesn't exist, insert it
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          display_name: body.display_name || null,
          bio: body.bio || null,
          avatar_url: body.avatar_url || null,
          phone_number: body.phone_number || null,
          website: body.website || null,
          location: body.location || null,
          public_profile: body.public_profile !== undefined ? body.public_profile : true
        })
        .select()
        .single();
      
      profileData = data;
      profileError = error;
    } else {
      // Profile exists, update it
      const { data, error } = await supabase
        .from('profiles')
        .update({
          display_name: body.display_name || null,
          bio: body.bio || null,
          avatar_url: body.avatar_url || null,
          phone_number: body.phone_number || null,
          website: body.website || null,
          location: body.location || null,
          public_profile: body.public_profile !== undefined ? body.public_profile : existingProfile.public_profile,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single();
      
      profileData = data;
      profileError = error;
    }

    if (profileError) {
      console.error('Error updating profile:', profileError);
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      );
    }

    // Update creator_name in restaurants where user is the creator
    await supabase
      .from('restaurants')
      .update({ creator_name: body.display_name })
      .eq('creator_id', user.id);

    // Update creator_name in lists where user is the creator
    await supabase
      .from('lists')
      .update({ creator_name: body.display_name })
      .eq('creator_id', user.id);

    // Update user metadata for consistency
    await supabase.auth.updateUser({
      data: {
        display_name: body.display_name,
        phone_number: body.phone_number,
        bio: body.bio,
        profile_image: body.avatar_url
      }
    });

    // Return updated profile data
    const updatedProfileData = await getUserProfileData(
      supabase,
      user.id,
      'OWNER'
    );

    if (!updatedProfileData) {
      return NextResponse.json(
        { error: 'Failed to fetch updated profile data' },
        { status: 500 }
      );
    }

    const [reviewsData, listsData] = await Promise.all([
      getUserReviewsData(supabase, user.id, 'OWNER', 1, 5),
      getUserListsData(supabase, user.id, 'OWNER', 1, 5)
    ]);

    const { count: restaurantsCount } = await supabase
      .from('restaurants')
      .select('id', { count: 'exact', head: true })
      .eq('creator_id', user.id);

    const updatedProfile = {
      id: updatedProfileData.user_id,
      userIdCode: updatedProfileData.user_id_code,
      name: updatedProfileData.display_name, // Changed from display_name to name
      profileImage: updatedProfileData.avatar_url, // Changed from avatar_url to profileImage
      location: updatedProfileData.location,
      bio: updatedProfileData.bio,
      website: updatedProfileData.website,
      phoneNumber: updatedProfileData.phone_number, // Changed from phone_number to phoneNumber
      publicProfile: updatedProfileData.public_profile, // Changed from public_profile to publicProfile
      createdAt: updatedProfileData.created_at, // Changed from created_at to createdAt
      updatedAt: updatedProfileData.updated_at, // Changed from updated_at to updatedAt
      stats: {
        totalRestaurantsVisited: updatedProfileData.total_restaurants_visited || 0,
        totalReviews: updatedProfileData.total_reviews || 0,
        totalLists: updatedProfileData.total_lists || 0,
        totalRestaurantsAdded: restaurantsCount || 0,
        joinedDate: updatedProfileData.created_at
      },
      recentReviews: reviewsData.data,
      recentLists: listsData.data,
      accessLevel: 'OWNER',
      isOwnProfile: true
    };

    return NextResponse.json({
      message: 'Profile updated successfully',
      profile: updatedProfile
    });

  } catch (error) {
    console.error('Error in settings profile PUT:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}