// app/api/restaurants/[id]/rating/route.ts
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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const response = NextResponse.next();
    const supabase = await getServerClient(request, response);
    const resolvedParams = await params;
    const restaurantId = resolvedParams.id;

    if (!restaurantId) {
      return NextResponse.json({ error: 'Restaurant ID is required' }, { status: 400 });
    }

    // Get current user to ensure they're authenticated
    if (!supabase) {
      return NextResponse.json({ error: 'Failed to initialize database connection' }, { status: 500 });
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Check if the restaurant exists
    const { data: restaurant, error: restaurantError } = await (supabase as any)
      .from('restaurants')
      .select('id')
      .eq('id', restaurantId)
      .single();

    if (restaurantError || !restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
    }

    // Update restaurant rating based on all reviews
    await updateRestaurantRating(restaurantId);

    // Fetch the updated restaurant data
    let { data: updatedRestaurant, error: fetchError } = await (supabase as any)
      .from('restaurants')
      .select('id, name, rating, review_count')
      .eq('id', restaurantId)
      .single();

    // If review_count column doesn't exist, fetch without it and calculate manually
    if (fetchError && fetchError.code === '42703' && fetchError.message.includes('review_count')) {
      const { data: restaurantData, error: restaurantError } = await (supabase as any)
        .from('restaurants')
        .select('id, name, rating')
        .eq('id', restaurantId)
        .single();

      if (restaurantError) {
        console.error('Error fetching restaurant data:', restaurantError);
        return NextResponse.json({ error: 'Failed to fetch restaurant data' }, { status: 500 });
      }

      // Calculate review count manually
      const { data: reviewCountData, error: reviewCountError } = await (supabase as any)
        .from('reviews')
        .select('id', { count: 'exact' })
        .eq('restaurant_id', restaurantId);

      if (reviewCountError) {
        console.error('Error fetching review count:', reviewCountError);
        return NextResponse.json({ error: 'Failed to fetch review count' }, { status: 500 });
      }

      updatedRestaurant = {
        ...restaurantData,
        review_count: reviewCountData ? reviewCountData.length : 0
      };
    } else if (fetchError) {
      console.error('Error fetching updated restaurant:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch updated restaurant data' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Restaurant rating updated successfully',
      restaurant: updatedRestaurant
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}