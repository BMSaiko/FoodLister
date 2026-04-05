-- Migration: Add tags and cover_image_url to lists table
-- Date: 2026-04-04

-- Add tags column (text array with empty array default)
ALTER TABLE public.lists
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';

-- Add cover_image_url column
ALTER TABLE public.lists
ADD COLUMN IF NOT EXISTS cover_image_url text;

-- Add index for tag searching with GIN
CREATE INDEX IF NOT EXISTS idx_lists_tags ON public.lists USING GIN (tags);

COMMENT ON COLUMN public.lists.tags IS 'Array of tags for categorizing lists';
COMMENT ON COLUMN public.lists.cover_image_url IS 'URL for custom list cover image';