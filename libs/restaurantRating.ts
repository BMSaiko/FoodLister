import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Recalculates a restaurant's rating as the average of its reviews.
 */
export async function updateRestaurantRating(supabase: SupabaseClient, restaurantId: string): Promise<void> {
  if (!supabase) {
    console.error('Supabase client is not available');
    return;
  }

  try {
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
      const totalRating = (reviews as { rating: number }[]).reduce((sum, review) => sum + review.rating, 0);
      averageRating = totalRating / reviews.length;
    }

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
