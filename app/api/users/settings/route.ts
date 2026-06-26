import { NextRequest, NextResponse } from 'next/server';
import { getServerClient } from '@/libs/supabase/server';
import { getErrorMessage } from '@/types/api';
import type { ApiErrorType } from '@/types/api';

export async function GET(request: NextRequest) {
  try {
    const response = new NextResponse();
    const supabase = await getServerClient(request, response) as any;

    if (!supabase) {
      const errorType = 'AUTHENTICATION_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 401 }
      );
    }

    // Get the authenticated user
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      const errorType = 'AUTHENTICATION_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 401 }
      );
    }

    // Get profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error fetching profile:', profileError);
      const errorType = 'DATABASE_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 500 }
      );
    }

    // If no profile exists, return default structure
    if (!profile) {
      return NextResponse.json({
        id: null,
        user_id: user.id,
        user_id_code: null,
        name: user.user_metadata?.display_name || user.user_metadata?.name || user.user_metadata?.full_name || '',
        bio: user.user_metadata?.bio || user.user_metadata?.description || '',
        profileImage: user.user_metadata?.avatar_url || user.user_metadata?.profile_image || '',
        website: null,
        location: null,
        phoneNumber: user.user_metadata?.phone_number || user.user_metadata?.phone || '',
        publicProfile: true,
        totalReviews: 0,
        totalLists: 0,
        createdAt: user.created_at,
        updatedAt: user.created_at,
        joinedDate: user.created_at
      });
    }

    return NextResponse.json({
      id: profile.id,
      userId: profile.user_id,
      userIdCode: profile.user_id_code,
      name: profile.display_name,
      bio: profile.bio,
      profileImage: profile.avatar_url,
      website: profile.website,
      location: profile.location,
      phoneNumber: profile.phone_number,
      publicProfile: profile.public_profile,
      totalReviews: profile.total_reviews || 0,
      totalLists: profile.total_lists || 0,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
      joinedDate: profile.created_at
    });

  } catch (error) {
    console.error('Error in settings profile GET:', error);
    const errorType = 'INTERNAL_ERROR' as ApiErrorType;
    return NextResponse.json(
      { error: getErrorMessage(errorType), code: errorType },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const response = new NextResponse();
    const supabase = await getServerClient(request, response) as any;

    if (!supabase) {
      const errorType = 'AUTHENTICATION_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 401 }
      );
    }

    // Get the authenticated user
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      const errorType = 'AUTHENTICATION_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate required fields
    if (!body.display_name || body.display_name.trim() === '') {
      const errorType = 'VALIDATION_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 400 }
      );
    }

    // Validate website format if provided
    if (body.website && body.website.trim() !== '') {
      try {
        new URL(body.website);
      } catch {
        const errorType = 'VALIDATION_ERROR' as ApiErrorType;
        return NextResponse.json(
          { error: getErrorMessage(errorType), code: errorType },
          { status: 400 }
        );
      }
    }

    // Validate public_profile field if provided
    if (body.public_profile !== undefined && typeof body.public_profile !== 'boolean') {
      const errorType = 'VALIDATION_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
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
      console.error('Error checking existing profile:', checkError);
      const errorType = 'DATABASE_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
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
          display_name: body.display_name !== undefined ? body.display_name : existingProfile.display_name,
          bio: body.bio !== undefined ? body.bio : existingProfile.bio,
          avatar_url: body.avatar_url !== undefined ? body.avatar_url : existingProfile.avatar_url,
          phone_number: body.phone_number !== undefined ? body.phone_number : existingProfile.phone_number,
          website: body.website !== undefined ? body.website : existingProfile.website,
          location: body.location !== undefined ? body.location : existingProfile.location,
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
      const errorType = 'DATABASE_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
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

    return NextResponse.json({
      message: 'Profile updated successfully',
      profile: {
        id: profileData.id,
        userId: profileData.user_id,
        userIdCode: profileData.user_id_code,
        name: profileData.display_name,
        bio: profileData.bio,
        profileImage: profileData.avatar_url,
        website: profileData.website,
        location: profileData.location,
        phoneNumber: profileData.phone_number,
        publicProfile: profileData.public_profile,
        totalReviews: profileData.total_reviews || 0,
        totalLists: profileData.total_lists || 0,
        createdAt: profileData.created_at,
        updatedAt: profileData.updated_at
      }
    });

  } catch (error) {
    console.error('Error in settings profile PUT:', error);
    const errorType = 'INTERNAL_ERROR' as ApiErrorType;
    return NextResponse.json(
      { error: getErrorMessage(errorType), code: errorType },
      { status: 500 }
    );
  }
}