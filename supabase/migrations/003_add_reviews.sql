-- Migration: Add reviews functionality
-- This migration adds the reviews table and related functionality

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(restaurant_id, user_id) -- One review per user per restaurant
);

-- Create indexes for performance
CREATE INDEX idx_reviews_restaurant_id ON reviews(restaurant_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_created_at ON reviews(created_at);

-- Enable Row Level Security
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Allow anyone to read reviews (for public display)
CREATE POLICY "reviews_select_policy" ON reviews
FOR SELECT USING (true);

-- Allow authenticated users to insert their own reviews
CREATE POLICY "reviews_insert_policy" ON reviews
FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

-- Allow users to update their own reviews
CREATE POLICY "reviews_update_policy" ON reviews
FOR UPDATE USING (auth.role() = 'authenticated' AND auth.uid() = user_id);

-- Allow users to delete their own reviews
CREATE POLICY "reviews_delete_policy" ON reviews
FOR DELETE USING (auth.role() = 'authenticated' AND auth.uid() = user_id);

-- Create function to update restaurant average rating
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

-- Create triggers to automatically update restaurant ratings
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
COMMENT ON TABLE reviews IS 'User reviews for restaurants';
COMMENT ON COLUMN reviews.restaurant_id IS 'Reference to the restaurant being reviewed';
COMMENT ON COLUMN reviews.user_id IS 'Reference to the user who wrote the review';
COMMENT ON COLUMN reviews.rating IS 'Rating from 1 to 5 stars';
COMMENT ON COLUMN reviews.comment IS 'Optional text comment for the review';
