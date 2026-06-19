-- Migration: Add menu_links and menu_images arrays to restaurants table
-- This migration adds support for multiple menu links and images per restaurant
-- Created: 2026-01-23

-- Add new columns for multiple menu links and images
ALTER TABLE public.restaurants
ADD COLUMN IF NOT EXISTS menu_links text[] DEFAULT '{}'::text[],
ADD COLUMN IF NOT EXISTS menu_images text[] DEFAULT '{}'::text[];

-- Add comments for documentation
COMMENT ON COLUMN public.restaurants.menu_links IS 'Array of external menu URLs (max 5)';
COMMENT ON COLUMN public.restaurants.menu_images IS 'Array of menu image URLs uploaded to Cloudinary (max 10)';

-- Create indexes for better query performance on array operations
CREATE INDEX IF NOT EXISTS idx_restaurants_menu_links ON restaurants USING GIN (menu_links);
CREATE INDEX IF NOT EXISTS idx_restaurants_menu_images ON restaurants USING GIN (menu_images);

-- Add check constraints to enforce maximum limits
ALTER TABLE public.restaurants
ADD CONSTRAINT check_menu_links_limit CHECK (array_length(menu_links, 1) <= 5),
ADD CONSTRAINT check_menu_images_limit CHECK (array_length(menu_images, 1) <= 10);

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'Migration completed: Added menu_links and menu_images arrays to restaurants table';
    RAISE NOTICE 'Maximum limits enforced: 5 links, 10 images per restaurant';
END $$;