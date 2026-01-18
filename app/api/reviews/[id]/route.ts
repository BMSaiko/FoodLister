// app/api/reviews/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getClient } from '@/libs/supabase/client';

// Helper function to update restaurant rating based on reviews
async function updateRestaurantRating(restaurantId: string) {
  const supabase = getClient();

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
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      averageRating = totalRating / reviews.length;
    }

    // Update the restaurant's rating
    const { error: updateError } = await supabase
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
    const supabase = getClient();
    const resolvedParams = await params;
    const reviewId = resolvedParams.id;

    const { data, error } = await supabase
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

    // Transform user data using stored user_name
    const processedData = {
      ...data,
      user: {
        id: data.user.id,
        name: data.user_name || 'Anonymous User'
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
    const supabase = getClient();
    const resolvedParams = await params;
    const reviewId = resolvedParams.id;
    const body = await request.json();
    const { rating, comment } = body;

    if (!rating) {
      return NextResponse.json({ error: 'Rating is required' }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Check if the review exists and belongs to the current user
    const { data: existingReview, error: fetchError } = await supabase
      .from('reviews')
      .select('id, restaurant_id')
      .eq('id', reviewId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !existingReview) {
      return NextResponse.json({ error: 'Review not found or access denied' }, { status: 404 });
    }

    // Update the review
    const { data, error } = await supabase
      .from('reviews')
      .update({
        rating,
        comment: comment || null,
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
    await updateRestaurantRating(existingReview.restaurant_id);

    // Transform user data using stored user_name
    const processedData = {
      ...data,
      user: {
        id: data.user.id,
        name: data.user_name || 'Anonymous User'
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
    const supabase = getClient();
    const resolvedParams = await params;
    const reviewId = resolvedParams.id;

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Check if the review exists and belongs to the current user
    const { data: existingReview, error: fetchError } = await supabase
      .from('reviews')
      .select('id, restaurant_id')
      .eq('id', reviewId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !existingReview) {
      return NextResponse.json({ error: 'Review not found or access denied' }, { status: 404 });
    }

    // Delete the review
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting review:', error);
      return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 });
    }

    // Update restaurant rating after successful review deletion
    await updateRestaurantRating(existingReview.restaurant_id);

    return NextResponse.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
