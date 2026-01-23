-- Migration: Add amount_spent to reviews and update average calculation
-- This migration adds the amount_spent column to reviews and modifies the rating update function

-- Add amount_spent column to reviews table
ALTER TABLE reviews ADD COLUMN amount_spent numeric;

-- Add comment for documentation
COMMENT ON COLUMN reviews.amount_spent IS 'Amount spent on the meal in the review (optional)';

-- Modify the update_restaurant_rating function to also update price_per_person
CREATE OR REPLACE FUNCTION update_restaurant_rating()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the restaurant's rating based on average of all reviews
    UPDATE restaurants
    SET rating = (
        SELECT COALESCE(AVG(rating)::numeric(3,2), 0)
        FROM reviews
        WHERE restaurant_id = COALESCE(NEW.restaurant_id, OLD.restaurant_id)
    ),
    price_per_person = (
        SELECT COALESCE(AVG(amount_spent)::numeric, NULL)
        FROM reviews
        WHERE restaurant_id = COALESCE(NEW.restaurant_id, OLD.restaurant_id)
        AND amount_spent IS NOT NULL
    )
    WHERE id = COALESCE(NEW.restaurant_id, OLD.restaurant_id);

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;