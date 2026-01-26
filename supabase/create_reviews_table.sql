-- Idempotent SQL to create/update the reviews table in Supabase
-- This handles cases where the table/policies already exist
-- Run this in your Supabase Dashboard SQL Editor

-- Create reviews table (won't fail if it exists)
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL,
  user_id uuid NOT NULL,
  rating numeric NOT NULL CHECK (rating >= 0.5 AND rating <= 5.0),
  comment text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  user_name text NOT NULL DEFAULT 'Anonymous User'::text,
  CONSTRAINT reviews_pkey PRIMARY KEY (id),
  CONSTRAINT reviews_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE,
  CONSTRAINT reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT reviews_unique_user_restaurant UNIQUE (restaurant_id, user_id)
);

-- Create indexes (won't fail if they exist)
CREATE INDEX IF NOT EXISTS idx_reviews_restaurant_id ON reviews(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at);

-- Enable Row Level Security (won't fail if already enabled)
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then recreate them
DROP POLICY IF EXISTS "reviews_select_policy" ON reviews;
DROP POLICY IF EXISTS "reviews_insert_policy" ON reviews;
DROP POLICY IF EXISTS "reviews_update_policy" ON reviews;
DROP POLICY IF EXISTS "reviews_delete_policy" ON reviews;

-- Create RLS policies
CREATE POLICY "reviews_select_policy" ON reviews
FOR SELECT USING (true);

CREATE POLICY "reviews_insert_policy" ON reviews
FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

CREATE POLICY "reviews_update_policy" ON reviews
FOR UPDATE USING (auth.role() = 'authenticated' AND auth.uid() = user_id);

CREATE POLICY "reviews_delete_policy" ON reviews
FOR DELETE USING (auth.role() = 'authenticated' AND auth.uid() = user_id);

-- Create or replace function (handles existing function)
CREATE OR REPLACE FUNCTION update_restaurant_rating()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the restaurant's rating based on average of all reviews
    UPDATE restaurants
    SET rating = (
        SELECT AVG(rating)::numeric(3,2)
        FROM reviews
        WHERE restaurant_id = COALESCE(NEW.restaurant_id, OLD.restaurant_id)
    )
    WHERE id = COALESCE(NEW.restaurant_id, OLD.restaurant_id);

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate triggers (to ensure they're properly set up)
DROP TRIGGER IF EXISTS update_restaurant_rating_on_insert ON reviews;
DROP TRIGGER IF EXISTS update_restaurant_rating_on_update ON reviews;
DROP TRIGGER IF EXISTS update_restaurant_rating_on_delete ON reviews;

CREATE TRIGGER update_restaurant_rating_on_insert
    AFTER INSERT ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_restaurant_rating();

CREATE TRIGGER update_restaurant_rating_on_update
    AFTER UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_restaurant_rating();

CREATE TRIGGER update_restaurant_rating_on_delete
    AFTER DELETE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_restaurant_rating();

-- Add comments for documentation
COMMENT ON TABLE reviews IS 'User reviews of restaurants';
COMMENT ON COLUMN reviews.restaurant_id IS 'Reference to the restaurant being reviewed';
COMMENT ON COLUMN reviews.user_id IS 'Reference to the user who wrote the review';
COMMENT ON COLUMN reviews.rating IS 'Rating from 0.5 to 5 stars';
COMMENT ON COLUMN reviews.comment IS 'Optional text comment for the review';
COMMENT ON COLUMN reviews.user_name IS 'Display name of the user who wrote the review';
