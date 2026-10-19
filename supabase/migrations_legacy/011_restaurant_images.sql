-- Migration: Add images array and display_image_index to restaurants table
-- This migration adds support for multiple restaurant images and display image selection
-- Created: 2026-01-23

-- Add new columns for multiple restaurant images
ALTER TABLE public.restaurants
ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}'::text[],
ADD COLUMN IF NOT EXISTS display_image_index integer DEFAULT '-1'::integer;

-- Add comments for documentation
COMMENT ON COLUMN public.restaurants.images IS 'Array of restaurant image URLs uploaded to Cloudinary';
COMMENT ON COLUMN public.restaurants.display_image_index IS 'Index of the main display image in the images array (-1 means use legacy image_url)';

-- Create indexes for better query performance on array operations
CREATE INDEX IF NOT EXISTS idx_restaurants_images ON restaurants USING GIN (images);

-- Add check constraint to ensure display_image_index is valid
ALTER TABLE public.restaurants
ADD CONSTRAINT check_display_image_index_valid
CHECK (display_image_index >= -1);

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'Migration completed: Added images array and display_image_index to restaurants table';
    RAISE NOTICE 'display_image_index: -1 = use legacy image_url, 0+ = index in images array';
END $$;