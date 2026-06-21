import { NextRequest, NextResponse } from 'next/server';
import { getServerClient } from '@/libs/supabase/server';
import { getErrorMessage } from '@/types/api';
import type { ApiErrorType } from '@/types/api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // Verify admin access
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

    const { id: userId } = await params;

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (profileError || !profile) {
      const errorType = 'NOT_FOUND' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 404 }
      );
    }

    // Get user stats
    const { count: totalReviews } = await supabase
      .from('reviews')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);

    const { count: totalLists } = await supabase
      .from('lists')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);

    const { count: totalRestaurantsVisited } = await supabase
      .from('user_restaurants')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Get recent reviews
    const { data: recentReviews } = await supabase
      .from('reviews')
      .select('id, rating, comment, created_at, restaurant_id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    // Get recent lists
    const { data: recentLists } = await supabase
      .from('lists')
      .select('id, name, is_public, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    return NextResponse.json({
      user: {
        id: profile.user_id,
        userIdCode: profile.user_id_code,
        name: profile.display_name,
        bio: profile.bio,
        avatarUrl: profile.avatar_url,
        location: profile.location,
        phoneNumber: profile.phone_number,
        website: profile.website,
        isVerified: profile.is_verified,
        isActive: profile.is_active ?? true,
        isAdmin: profile.is_admin,
        createdAt: profile.created_at,
        updatedAt: profile.updated_at,
      },
      stats: {
        totalReviews: totalReviews || 0,
        totalLists: totalLists || 0,
        totalRestaurantsVisited: totalRestaurantsVisited || 0,
      },
      recentReviews: recentReviews || [],
      recentLists: recentLists || [],
    });

  } catch (error) {
    console.error('Error fetching user detail:', error);
    const errorType = 'INTERNAL_ERROR' as ApiErrorType;
    return NextResponse.json(
      { error: getErrorMessage(errorType), code: errorType },
      { status: 500 }
    );
  }
}
