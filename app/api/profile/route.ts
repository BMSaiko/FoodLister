import { NextRequest, NextResponse } from 'next/server';
import { getServerClient } from '@/libs/supabase/server';
import { Database } from '@/libs/supabase/client';

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

    // Get profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error fetching profile:', profileError);
      return NextResponse.json(
        { error: 'Failed to fetch profile' },
        { status: 500 }
      );
    }

    // If no profile exists, return default structure
    if (!profile) {
      return NextResponse.json({
        id: null,
        user_id: user.id,
        display_name: user.user_metadata?.display_name || user.user_metadata?.name || user.user_metadata?.full_name || '',
        bio: user.user_metadata?.bio || user.user_metadata?.description || '',
        avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.profile_image || '',
        website: null,
        location: null,
        phone_number: user.user_metadata?.phone_number || user.user_metadata?.phone || '',
        created_at: user.created_at,
        updated_at: user.created_at
      });
    }

    return NextResponse.json({
      id: profile.id,
      user_id: profile.user_id,
      display_name: profile.display_name,
      bio: profile.bio,
      avatar_url: profile.avatar_url,
      website: profile.website,
      location: profile.location,
      phone_number: profile.phone_number,
      created_at: profile.created_at,
      updated_at: profile.updated_at
    });

  } catch (error) {
    console.error('Error in profile GET:', error);
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
          location: body.location || null
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
    const { error: restaurantsError } = await supabase
      .from('restaurants')
      .update({ creator_name: body.display_name })
      .eq('creator_id', user.id);

    if (restaurantsError) {
      console.error('Error updating restaurant creator names:', restaurantsError);
      // Don't return error as profile was updated successfully
    }

    // Update creator_name in lists where user is the creator
    const { error: listsError } = await supabase
      .from('lists')
      .update({ creator_name: body.display_name })
      .eq('creator_id', user.id);

    if (listsError) {
      console.error('Error updating list creator names:', listsError);
      // Don't return error as profile was updated successfully
    }

    // Update user metadata for consistency
    const { error: metadataError } = await supabase.auth.updateUser({
      data: {
        display_name: body.display_name,
        phone_number: body.phone_number,
        bio: body.bio,
        profile_image: body.avatar_url
      }
    });

    if (metadataError) {
      console.error('Error updating metadata:', metadataError);
      // Don't return error as profile was updated successfully
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
      profile: {
        id: profileData.id,
        user_id: profileData.user_id,
        display_name: profileData.display_name,
        bio: profileData.bio,
        avatar_url: profileData.avatar_url,
        website: profileData.website,
        location: profileData.location,
        phone_number: profileData.phone_number,
        created_at: profileData.created_at,
        updated_at: profileData.updated_at
      }
    });

  } catch (error) {
    console.error('Error in profile PUT:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}