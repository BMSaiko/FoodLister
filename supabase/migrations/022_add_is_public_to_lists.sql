-- Migration: Add is_public column to lists table
-- Date: 2026-04-03
-- Purpose: Enable public/private list visibility

-- Add is_public column with default true (existing lists remain public)
ALTER TABLE public.lists
ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT true;

-- Add index for filtering public lists
CREATE INDEX IF NOT EXISTS idx_lists_is_public ON public.lists(is_public);

-- Update RLS policies to respect is_public
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Lists are viewable by everyone" ON public.lists;
DROP POLICY IF EXISTS "Users can create their own lists" ON public.lists;
DROP POLICY IF EXISTS "Users can update their own lists" ON public.lists;
DROP POLICY IF EXISTS "Users can delete their own lists" ON public.lists;

-- Enable RLS on lists table
ALTER TABLE public.lists ENABLE ROW LEVEL SECURITY;

-- Public lists are viewable by everyone, private lists only by creator
CREATE POLICY "Lists are viewable by everyone" ON public.lists
  FOR SELECT
  USING (
    is_public = true OR creator_id = auth.uid()
  );

-- Users can create their own lists
CREATE POLICY "Users can create their own lists" ON public.lists
  FOR INSERT
  WITH CHECK (
    creator_id = auth.uid()
  );

-- Users can update their own lists
CREATE POLICY "Users can update their own lists" ON public.lists
  FOR UPDATE
  USING (
    creator_id = auth.uid()
  );

-- Users can delete their own lists
CREATE POLICY "Users can delete their own lists" ON public.lists
  FOR DELETE
  USING (
    creator_id = auth.uid()
  );