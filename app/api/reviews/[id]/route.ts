// app/api/reviews/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getClient } from '@/libs/supabase/client';
import { getServerClient } from '@/libs/supabase/server';
import { ensureUserProfileExists } from '@/libs/auth';

// Helper function to update restaurant rating based on reviews
async function updateRestaurantRating(restaurantId: string) {
  const supabase = getClient();

  if (!supabase) {
    console.error('Supabase client is not available');
    return;
  }

  try {
    // Calculate average rating from all reviews for this restaurant
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('rating')
      .eq('restaurant_id', restaurantId);

    if (reviewsError) {
      console.error('Error fetching reviews for rating calculation:', reviewsError);
      return;
    }

    let averageRating = 0;
    if (reviews && reviews.length > 0) {
      const totalRating = (reviews as any[]).reduce((sum, review) => sum + review.rating, 0);
      averageRating = totalRating / reviews.length;
    }

    // Update the restaurant's rating
    const { error: updateError } = await (supabase as any)
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
async function getUserProfileData(supabase: any, userId: string) {
  if (!supabase) {
    return { displayName: null, avatarUrl: null, email: null, userIdCode: null };
  }

  try {
    // Get profile data including user_id_code
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('display_name, avatar_url, user_id_code')
      .eq('user_id', userId)
      .single();

    // Get user email
    const { data: userData, error: userError } = await supabase
      .from('auth.users')
      .select('email')
      .eq('id', userId)
      .single();

    const displayName = (!profileError && (profileData as any)?.display_name) 
      ? (profileData as any).display_name 
      : null;
    
    const avatarUrl = (!profileError && (profileData as any)?.avatar_url) 
      ? (profileData as any).avatar_url 
      : null;
    
    const email = (!userError && (userData as any)?.email) 
      ? (userData as any).email 
      : null;
    
    const userIdCode = (!profileError && (profileData as any)?.user_id_code) 
      ? (profileData as any).user_id_code 
      : null;

    return { displayName, avatarUrl, email, userIdCode };
  } catch (error) {
    console.error(`Error fetching profile for user ${userId}:`, error);
    return { displayName: null, avatarUrl: null, email: null, userIdCode: null };
  }
}

// Helper function to transform review data with consistent user information
function transformReviewData(review: any, userProfile: { displayName: string | null; avatarUrl: string | null; email: string | null; userIdCode: string | null }) {
  // Check if review is null or undefined
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

    const { data, error } = await (supabase as any)
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

    // Check if data is null
    if (!data) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    // Ensure profile exists for the user who wrote this review
    if (supabase) {
      try {
        // Get user email for profile creation
        const { data: userData, error: userError } = await supabase
          .from('auth.users')
          .select('email')
          .eq('id', (data as any).user_id)
          .single();

        const userEmail = (!userError && (userData as any)?.email) ? (userData as any).email : null;
        
        // Ensure profile exists for this user
        await ensureUserProfileExists(supabase, (data as any).user_id, userEmail);
      } catch (error) {
        console.error(`Error ensuring profile exists for user ${(data as any).user_id}:`, error);
      }
    }

    // Get user profile data consistently using the review's user_id
    const userProfile = await getUserProfileData(supabase, (data as any).user_id);
    
    // Transform review data with consistent user information
    const processedData = transformReviewData(data as any, userProfile);

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
    const supabase = await getServerClient(request, response);
    const resolvedParams = await params;
    const reviewId = resolvedParams.id;
    const body = await request.json();
    const { rating, comment, amount_spent } = body;

    if (!rating) {
      return NextResponse.json({ error: 'Rating is required' }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    if (amount_spent !== undefined && (amount_spent <= 0 || isNaN(amount_spent))) {
      return NextResponse.json(
        { error: 'Amount spent must be greater than 0' },
        { status: 400 }
      );
    }

    // Get current user
    if (!supabase) {
      return NextResponse.json({ error: 'Failed to initialize database connection' }, { status: 500 });
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Check if the review exists and belongs to the current user
    const { data: existingReview, error: fetchError } = await (supabase as any)
      .from('reviews')
      .select('restaurant_id')
      .eq('id', reviewId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !existingReview) {
      return NextResponse.json({ error: 'Review not found or access denied' }, { status: 404 });
    }

    // Update the review
    const { data, error } = await (supabase as any)
      .from('reviews')
      .update({
        rating,
        comment: comment || null,
        amount_spent: amount_spent || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', reviewId)
      .eq('user_id', user.id)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating review:', error);
      return NextResponse.json({ error: 'Failed to update review' }, { status: 500 });
    }

    // Check if the update was successful and data is not null
    if (!data) {
      console.error('Review update returned null data');
      return NextResponse.json({ error: 'Failed to update review - no data returned' }, { status: 500 });
    }

    // Update restaurant rating after successful review update
    await updateRestaurantRating((existingReview as any).restaurant_id);

    // Ensure profile exists for the authenticated user
    if (supabase) {
      try {
        // Get user email for profile creation
        const { data: userData, error: userError } = await supabase
          .from('auth.users')
          .select('email')
          .eq('id', user.id)
          .single();

        const userEmail = (!userError && (userData as any)?.email) ? (userData as any).email : null;
        
        // Ensure profile exists for this user
        await ensureUserProfileExists(supabase, user.id, userEmail);
      } catch (error) {
        console.error(`Error ensuring profile exists for user ${user.id}:`, error);
      }
    }

    // Get user profile data consistently using the authenticated user's ID
    const userProfile = await getUserProfileData(supabase, user.id);
    
    // Transform review data with consistent user information
    const processedData = transformReviewData(data as any, userProfile);

    // Return the updated review with fresh data
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

    // Get current user
    if (!supabase) {
      return NextResponse.json({ error: 'Failed to initialize database connection' }, { status: 500 });
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Check if the review exists and belongs to the current user
    const { data: existingReview, error: fetchError } = await (supabase as any)
      .from('reviews')
      .select('restaurant_id')
      .eq('id', reviewId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !existingReview) {
      return NextResponse.json({ error: 'Review not found or access denied' }, { status: 404 });
    }

    // Delete the review
    const { error } = await (supabase as any)
      .from('reviews')
      .delete()
      .eq('id', reviewId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting review:', error);
      return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 });
    }

    // Update restaurant rating after successful review deletion
    if (supabase) {
      await updateRestaurantRating((existingReview as any).restaurant_id);
    }

    return NextResponse.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
