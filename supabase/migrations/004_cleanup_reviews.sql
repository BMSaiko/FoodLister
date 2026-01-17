-- Migration: Cleanup unused columns and optimize reviews
-- This migration removes the unused user_name column and adds performance optimizations

-- Remove unused user_name column from reviews table
ALTER TABLE reviews DROP COLUMN IF EXISTS user_name;

-- Add composite index for restaurant-user uniqueness (if not exists)
CREATE INDEX IF NOT EXISTS idx_reviews_restaurant_user_unique ON reviews(restaurant_id, user_id);

-- Add index for created_at ordering (if not exists)
CREATE INDEX IF NOT EXISTS idx_reviews_created_at_desc ON reviews(created_at DESC);

-- Add review count to restaurant queries optimization
-- Add function to get review count for a restaurant
CREATE OR REPLACE FUNCTION get_restaurant_review_count(restaurant_id_param UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM reviews WHERE restaurant_id = restaurant_id_param)::INTEGER;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update comments
COMMENT ON FUNCTION get_restaurant_review_count(UUID) IS 'Returns the total number of reviews for a given restaurant';
COMMENT ON INDEX idx_reviews_restaurant_user_unique IS 'Ensures one review per user per restaurant';
COMMENT ON INDEX idx_reviews_created_at_desc IS 'Optimizes review ordering by creation date';
