-- Migration: Add review_count column to restaurants table and create triggers

-- Add review_count column to restaurants table
ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;

-- Create function to update restaurant review count
CREATE OR REPLACE FUNCTION update_restaurant_review_count()
RETURNS TRIGGER AS $$
DECLARE
    restaurant_id_to_update UUID;
BEGIN
    -- Determine which restaurant to update based on the operation
    IF TG_OP = 'DELETE' THEN
        restaurant_id_to_update := OLD.restaurant_id;
    ELSE
        restaurant_id_to_update := NEW.restaurant_id;
    END IF;

    -- Update the review count for the restaurant
    UPDATE public.restaurants SET
        review_count = (
            SELECT COUNT(*) FROM public.reviews 
            WHERE restaurant_id = restaurant_id_to_update
        )
    WHERE id = restaurant_id_to_update;

    -- Return appropriate row based on operation
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_update_restaurant_review_count ON public.reviews;

-- Create trigger for reviews table to update review_count
CREATE TRIGGER trigger_update_restaurant_review_count
    AFTER INSERT OR UPDATE OR DELETE ON public.reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_restaurant_review_count();

-- Update existing restaurants with correct review counts
UPDATE public.restaurants SET
    review_count = (
        SELECT COUNT(*) FROM public.reviews 
        WHERE restaurant_id = restaurants.id
    );

-- Grant permissions
GRANT ALL ON FUNCTION update_restaurant_review_count() TO authenticated;