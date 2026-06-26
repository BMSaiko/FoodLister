import { NextRequest, NextResponse } from 'next/server';
import { getServerClient } from '@/libs/supabase/server';
import { createAdminClient } from '@/libs/supabase/admin';
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


export async function PUT(
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

    // Check if current user is admin
    const { data: adminProfile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('user_id', user.id)
      .single();

    if (!adminProfile?.is_admin) {
      const errorType = 'AUTHORIZATION_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 403 }
      );
    }

    const { id: userId } = await params;
    const body = await request.json();

    if (typeof body.is_admin !== 'boolean') {
      const errorType = 'VALIDATION_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 400 }
      );
    }

    // Use admin client to bypass RLS for updating other users
    const admin = createAdminClient();
    if (!admin) {
      const errorType = 'SERVICE_ROLE_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: 'Admin client not configured', code: errorType },
        { status: 500 }
      );
    }

    const { error: updateError } = await admin
      .from('profiles')
      .update({ is_admin: body.is_admin, updated_at: new Date().toISOString() })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Error updating user admin status:', updateError);
      const errorType = 'DATABASE_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: `User admin status updated to ${body.is_admin ? 'admin' : 'regular user'}`,
      userId,
      isAdmin: body.is_admin,
    });

  } catch (error) {
    console.error('Error updating user admin status:', error);
    const errorType = 'INTERNAL_ERROR' as ApiErrorType;
    return NextResponse.json(
      { error: getErrorMessage(errorType), code: errorType },
      { status: 500 }
    );
  }
}
