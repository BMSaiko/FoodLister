-- Migration: Add user_name column to reviews table for persistence
-- This migration adds a user_name column to store reviewer names persistently

-- Add user_name column to reviews table
ALTER TABLE reviews ADD COLUMN user_name TEXT;

-- Create an index for potential queries on user_name
CREATE INDEX IF NOT EXISTS idx_reviews_user_name ON reviews(user_name);

-- Add a comment to the column
COMMENT ON COLUMN reviews.user_name IS 'Cached user name for persistent display of reviewer names';

-- Create a function to populate user_name for existing reviews
CREATE OR REPLACE FUNCTION populate_existing_review_user_names()
RETURNS VOID AS $$
DECLARE
    review_record RECORD;
    user_name_val TEXT;
BEGIN
    -- Loop through all reviews that don't have user_name set
    FOR review_record IN
        SELECT r.id, r.user_id
        FROM reviews r
        WHERE r.user_name IS NULL
    LOOP
        -- Try to get the user name from auth.users metadata
        SELECT
            COALESCE(
                raw_user_meta_data->>'name',
                raw_user_meta_data->>'full_name',
                raw_user_meta_data->>'email',
                'Anonymous User'
            )
        INTO user_name_val
        FROM auth.users
        WHERE id = review_record.user_id;

        -- Update the review with the user name
        UPDATE reviews
        SET user_name = user_name_val
        WHERE id = review_record.id;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Execute the function to populate existing reviews
SELECT populate_existing_review_user_names();

-- Drop the function after use
DROP FUNCTION populate_existing_review_user_names();

-- Make user_name NOT NULL with a default for future reviews
ALTER TABLE reviews ALTER COLUMN user_name SET DEFAULT 'Anonymous User';
ALTER TABLE reviews ALTER COLUMN user_name SET NOT NULL;
