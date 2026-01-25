// app/api/reviews/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getClient } from '@/libs/supabase/client';
import { getServerClient } from '@/libs/supabase/server';

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
        user:user_id (
          id,
          raw_user_meta_data
        ),
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

    // Get user profile data and email from database
    let userDisplayName = null;
    let userProfileImage = null;
    let userEmail = null;

    if (supabase) {
      try {
        // Get profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('display_name, avatar_url')
          .eq('user_id', (data as any).user.id)
          .single();

        if (!profileError && profileData) {
          userDisplayName = (profileData as any).display_name || null;
          userProfileImage = (profileData as any).avatar_url || null;
        }

        // Get user email
        const { data: userData, error: userError } = await supabase
          .from('auth.users')
          .select('email')
          .eq('id', (data as any).user.id)
          .single();

        if (!userError && userData) {
          userEmail = (userData as any).email || null;
        }
      } catch (error) {
        console.error(`Error fetching profile for user ${(data as any).user.id}:`, error);
      }
    }

    // Create email name (part before @)
    const emailName = userEmail ? userEmail.split('@')[0] : null;

    // Transform user data using display_name from profiles table with email fallback
    const processedData = {
      ...(data as any),
      user: {
        id: (data as any).user.id,
        name: userDisplayName || (data as any).user_name || emailName,
        profileImage: userProfileImage
      }
    };

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
      .select(`
        *,
        user:user_id (
          id,
          raw_user_meta_data
        )
      `)
      .single();

    if (error) {
      console.error('Error updating review:', error);
      return NextResponse.json({ error: 'Failed to update review' }, { status: 500 });
    }

    // Update restaurant rating after successful review update
    await updateRestaurantRating((existingReview as any).restaurant_id);

    // Get user profile data and email from database
    let userDisplayName = null;
    let userProfileImage = null;
    let userEmail = null;

    if (supabase) {
      try {
        // Get profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('display_name, avatar_url')
          .eq('user_id', (data as any).user.id)
          .single();

        if (!profileError && profileData) {
          userDisplayName = (profileData as any).display_name || null;
          userProfileImage = (profileData as any).avatar_url || null;
        }

        // Get user email
        const { data: userData, error: userError } = await supabase
          .from('auth.users')
          .select('email')
          .eq('id', (data as any).user.id)
          .single();

        if (!userError && userData) {
          userEmail = (userData as any).email || null;
        }
      } catch (error) {
        console.error(`Error fetching profile for user ${(data as any).user.id}:`, error);
      }
    }

    // Create email name (part before @)
    const emailName = userEmail ? userEmail.split('@')[0] : null;

    // Transform user data using display_name from profiles table with email fallback
    const processedData = {
      ...(data as any),
      user: {
        id: (data as any).user.id,
        name: userDisplayName || (data as any).user_name || emailName || 'Anonymous User',
        profileImage: userProfileImage
      }
    };

    return NextResponse.json({ review: processedData });
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
