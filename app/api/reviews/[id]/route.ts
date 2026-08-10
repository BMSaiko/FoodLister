// app/api/reviews/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/libs/supabase/admin';
import { getServerClient, requireAdmin } from '@/libs/supabase/server';
import { ensureUserProfileExists } from '@/libs/auth';
import type { SupabaseClient } from '@supabase/supabase-js';

type ReviewRow = any;
type ProfileRow = any;

interface UserProfileData {
  displayName: string | null;
  avatarUrl: string | null;
  email: string | null;
  userIdCode: string | null;
}

// Helper function to update restaurant rating based on reviews
async function updateRestaurantRating(adminClient: SupabaseClient, restaurantId: string) {
  if (!adminClient) {
    console.error('Admin client is not available');
    return;
  }

  try {
    const { data: reviews, error: reviewsError } = await adminClient
      .from('reviews')
      .select('rating')
      .eq('restaurant_id', restaurantId);

    if (reviewsError) {
      console.error('Error fetching reviews for rating calculation:', reviewsError);
      return;
    }

    let averageRating = 0;
    if (reviews && reviews.length > 0) {
      const totalRating = reviews.reduce((sum: number, review: any) => sum + review.rating, 0);
      averageRating = totalRating / reviews.length;
    }

    const { error: updateError } = await adminClient
      .from('restaurants')
      .update({ rating: averageRating })
      .eq('id', restaurantId);

    if (updateError) {
      console.error('Error updating restaurant rating:', updateError);
    }
  } catch (error) {
    console.error('Error in updateRestaurantRating:', error);
  }
}

// Helper function to get user profile data consistently
async function getUserProfileData(supabase: SupabaseClient | null, userId: string): Promise<UserProfileData> {
  if (!supabase) {
    return { displayName: null, avatarUrl: null, email: null, userIdCode: null };
  }

  try {
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('display_name, avatar_url, user_id_code')
      .eq('user_id', userId)
      .single();

    const { data: userData, error: userError } = await supabase
      .from('auth.users')
      .select('email')
      .eq('id', userId)
      .single();

    const displayName = (!profileError && profileData !== null)
      ? (profileData as ProfileRow).display_name
      : null;

    const avatarUrl = (!profileError && profileData !== null)
      ? (profileData as ProfileRow).avatar_url
      : null;

    const email = (!userError && userData !== null)
      ? (userData as { email: string }).email
      : null;

    const userIdCode = (!profileError && profileData !== null)
      ? (profileData as ProfileRow).user_id_code
      : null;

    return { displayName, avatarUrl, email, userIdCode };
  } catch (error) {
    console.error(`Error fetching profile for user ${userId}:`, error);
    return { displayName: null, avatarUrl: null, email: null, userIdCode: null };
  }
}

// Helper function to transform review data with consistent user information
function transformReviewData(review: ReviewRow, userProfile: UserProfileData) {
  if (!review) {
    throw new Error('Review data is null or undefined');
  }

  const { displayName, avatarUrl, email, userIdCode } = userProfile;
  const emailName = email ? email.split('@')[0] : null;

  return {
    ...review,
    user: {
      id: review.user_id,
      name: displayName || review.user_name || emailName || 'Anonymous User',
      profileImage: avatarUrl,
      userIdCode: userIdCode
    }
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const response = NextResponse.next();
    const supabase = await getServerClient(request, response);
    const { id: reviewId } = await params;

    if (!supabase) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        restaurant:restaurant_id (
          id,
          name
        )
      `)
      .eq('id', reviewId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Review not found' }, { status: 404 });
      }
      console.error('Error fetching review:', error);
      return NextResponse.json({ error: 'Failed to fetch review' }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    const reviewData = data as ReviewRow;

    if (supabase) {
      try {
        const { data: userData, error: userError } = await supabase
          .from('auth.users')
          .select('email')
          .eq('id', reviewData.user_id)
          .single();

        const userEmail = (!userError && userData !== null)
          ? (userData as { email: string }).email
          : null;

        await ensureUserProfileExists(supabase, reviewData.user_id, userEmail ?? undefined);
      } catch (ensureError) {
        console.error(`Error ensuring profile exists for user ${reviewData.user_id}:`, ensureError);
      }
    }

    const userProfile = await getUserProfileData(supabase, reviewData.user_id);
    const processedData = transformReviewData(reviewData, userProfile);

    return NextResponse.json({ review: processedData });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const response = NextResponse.next();
    const auth = await requireAdmin(request, response);
    if (!auth.ok) return auth.response;
    const supabase = auth.supabase;
    const user = auth.user;
    const resolvedParams = await params;
    const reviewId = resolvedParams.id;
    const body: Record<string, unknown> = await request.json();

    console.log('PUT review request:', {
      reviewId,
      body,
      timestamp: new Date().toISOString()
    });

    const rating = body.rating as number | undefined;
    const comment = body.comment as string | undefined;
    const amount_spent = body.amount_spent as number | undefined;

    if (!rating) {
      return NextResponse.json({ error: 'Rating is required' }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    if (amount_spent !== undefined && amount_spent !== null && (amount_spent <= 0 || isNaN(amount_spent))) {
      return NextResponse.json(
        { error: 'Amount spent must be greater than 0' },
        { status: 400 }
      );
    }

    if (!supabase) {
      return NextResponse.json({ error: 'Failed to initialize database connection' }, { status: 500 });
    }

    const { data: existingReview, error: fetchError } = await supabase
      .from('reviews')
      .select('restaurant_id')
      .eq('id', reviewId)
      .single();

    if (fetchError || !existingReview) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    const existingReviewData = existingReview as { restaurant_id: string };

    // Use admin client (service role key) for update — bypasses RLS
    const admin = createAdminClient();
    if (!admin) {
      return NextResponse.json({ error: 'Service role key not configured' }, { status: 500 });
    }

    const { data, error } = await admin
      .from('reviews')
      .update({
        rating,
        comment: comment || null,
        amount_spent: amount_spent || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', reviewId)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating review:', error);
      return NextResponse.json({ error: 'Failed to update review' }, { status: 500 });
    }

    if (!data) {
      console.error('Review update returned null data');
      return NextResponse.json({ error: 'Failed to update review - no data returned' }, { status: 500 });
    }

    console.log('Review successfully updated:', {
      reviewId,
      updatedFields: { rating, comment, amount_spent },
      updatedData: data,
      timestamp: new Date().toISOString()
    });

    await updateRestaurantRating(admin, existingReviewData.restaurant_id);

    if (supabase) {
      try {
        const { data: userData, error: userError } = await supabase
          .from('auth.users')
          .select('email')
          .eq('id', user.id)
          .single();

        const userEmail = (!userError && userData !== null)
          ? (userData as { email: string }).email
          : null;

        await ensureUserProfileExists(supabase, user.id, userEmail ?? undefined);
      } catch (ensureError) {
        console.error(`Error ensuring profile exists for user ${user.id}:`, ensureError);
      }
    }

    const updatedReviewData = data as ReviewRow;
    const reviewUserProfile = await getUserProfileData(supabase, updatedReviewData.user_id);
    const processedData = transformReviewData(updatedReviewData, reviewUserProfile);

    return NextResponse.json({
      review: processedData,
      message: 'Review updated successfully'
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const response = NextResponse.next();
    const supabase = await getServerClient(request, response);
    const resolvedParams = await params;
    const reviewId = resolvedParams.id;

    if (!supabase) {
      return NextResponse.json({ error: 'Failed to initialize database connection' }, { status: 500 });
    }

    const auth = await requireAdmin(request, response);
    if (!auth.ok) return auth.response;

    // Use admin client (service role key) for all data operations — bypasses RLS
    const admin = createAdminClient();
    if (!admin) {
      return NextResponse.json({ error: 'Service role key not configured' }, { status: 500 });
    }

    // Fetch review to get restaurant_id
    const { data: existingReview, error: fetchError } = await admin
      .from('reviews')
      .select('restaurant_id')
      .eq('id', reviewId)
      .single();

    if (fetchError || !existingReview) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    const existingReviewData = existingReview as { restaurant_id: string };

    // Delete the review using admin client (bypasses RLS) — no user_id filter needed,
    // RLS policy 'Admins can delete any review' handles authorization
    const { error } = await admin.from('reviews').delete().eq('id', reviewId);
    if (error) {
      console.error('Error deleting review:', error);
      return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 });
    }

    // Update restaurant rating using admin client (bypasses RLS)
    await updateRestaurantRating(admin, existingReviewData.restaurant_id);

    return NextResponse.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
