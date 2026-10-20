-- Combined Migration: Apply all pending migrations + optimizations
-- Date: 2026-04-04
-- This script combines migrations 024-027 plus index optimizations

-- =============================================
-- Migration 024: Add position column to list_restaurants
-- =============================================
ALTER TABLE public.list_restaurants
ADD COLUMN IF NOT EXISTS position integer DEFAULT 0;

-- Index for position ordering
CREATE INDEX IF NOT EXISTS idx_list_restaurants_list_position ON public.list_restaurants(list_id, position);

-- Backfill existing records with sequential positions
DO $$
DECLARE
  list_record RECORD;
  pos integer := 0;
BEGIN
  FOR list_record IN SELECT DISTINCT list_id FROM public.list_restaurants LOOP
    pos := 0;
    UPDATE public.list_restaurants
    SET position = pos
    WHERE list_id = list_record.list_id;
    -- Update each row with incrementing position
    WITH numbered AS (
      SELECT list_id, restaurant_id, ROW_NUMBER() OVER (ORDER BY restaurant_id) - 1 as new_pos
      FROM public.list_restaurants
      WHERE list_id = list_record.list_id
    )
    UPDATE public.list_restaurants lr
    SET position = n.new_pos
    FROM numbered n
    WHERE lr.list_id = n.list_id AND lr.restaurant_id = n.restaurant_id;
  END LOOP;
END $$;

COMMENT ON COLUMN public.list_restaurants.position IS 'Custom ordering position within a list';

-- =============================================
-- Migration 025: Add list_comments table
-- =============================================
CREATE TABLE IF NOT EXISTS public.list_comments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  list_id uuid NOT NULL,
  user_id uuid NOT NULL,
  comment text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT list_comments_pkey PRIMARY KEY (id),
  CONSTRAINT list_comments_list_id_fkey FOREIGN KEY (list_id) REFERENCES public.lists(id) ON DELETE CASCADE,
  CONSTRAINT list_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- Indexes for list_comments
CREATE INDEX IF NOT EXISTS idx_list_comments_list_id ON public.list_comments(list_id);
CREATE INDEX IF NOT EXISTS idx_list_comments_user_id ON public.list_comments(user_id);

-- RLS for list_comments
ALTER TABLE public.list_comments ENABLE ROW LEVEL SECURITY;

-- Everyone can read comments
DROP POLICY IF EXISTS "Anyone can view list comments" ON public.list_comments;
CREATE POLICY "Anyone can view list comments" ON public.list_comments
  FOR SELECT USING (true);

-- Authenticated users can create comments
DROP POLICY IF EXISTS "Authenticated users can create comments" ON public.list_comments;
CREATE POLICY "Authenticated users can create comments" ON public.list_comments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Users can update their own comments
DROP POLICY IF EXISTS "Users can update their own comments" ON public.list_comments;
CREATE POLICY "Users can update their own comments" ON public.list_comments
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own comments
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.list_comments;
CREATE POLICY "Users can delete their own comments" ON public.list_comments
  FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- Migration 026: Add list_collaborators table
-- =============================================
CREATE TABLE IF NOT EXISTS public.list_collaborators (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  list_id uuid NOT NULL,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'viewer' CHECK (role IN ('editor', 'viewer')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT list_collaborators_pkey PRIMARY KEY (id),
  CONSTRAINT list_collaborators_list_id_fkey FOREIGN KEY (list_id) REFERENCES public.lists(id) ON DELETE CASCADE,
  CONSTRAINT list_collaborators_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT list_collaborators_list_user_unique UNIQUE (list_id, user_id)
);

-- Indexes for list_collaborators
CREATE INDEX IF NOT EXISTS idx_list_collaborators_list_id ON public.list_collaborators(list_id);
CREATE INDEX IF NOT EXISTS idx_list_collaborators_user_id ON public.list_collaborators(user_id);

-- RLS for list_collaborators
ALTER TABLE public.list_collaborators ENABLE ROW LEVEL SECURITY;

-- List owners can manage collaborators
DROP POLICY IF EXISTS "List owners can view collaborators" ON public.list_collaborators;
CREATE POLICY "List owners can view collaborators" ON public.list_collaborators
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.lists l
      WHERE l.id = list_collaborators.list_id AND l.creator_id = auth.uid()
    )
  );

-- List owners can add collaborators
DROP POLICY IF EXISTS "List owners can add collaborators" ON public.list_collaborators;
CREATE POLICY "List owners can add collaborators" ON public.list_collaborators
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.lists l
      WHERE l.id = list_collaborators.list_id AND l.creator_id = auth.uid()
    )
  );

-- List owners can update collaborators
DROP POLICY IF EXISTS "List owners can update collaborators" ON public.list_collaborators;
CREATE POLICY "List owners can update collaborators" ON public.list_collaborators
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.lists l
      WHERE l.id = list_collaborators.list_id AND l.creator_id = auth.uid()
    )
  );

-- List owners can remove collaborators
DROP POLICY IF EXISTS "List owners can remove collaborators" ON public.list_collaborators;
CREATE POLICY "List owners can remove collaborators" ON public.list_collaborators
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.lists l
      WHERE l.id = list_collaborators.list_id AND l.creator_id = auth.uid()
    )
  );

-- =============================================
-- Migration 027: Add tags and cover_image to lists
-- =============================================
ALTER TABLE public.lists
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';

ALTER TABLE public.lists
ADD COLUMN IF NOT EXISTS cover_image_url text;

-- GIN index for tag searching
CREATE INDEX IF NOT EXISTS idx_lists_tags ON public.lists USING GIN (tags);

COMMENT ON COLUMN public.lists.tags IS 'Array of tags for categorizing lists';
COMMENT ON COLUMN public.lists.cover_image_url IS 'URL for custom list cover image';

-- =============================================
-- Performance Optimizations: Additional indexes
-- =============================================

-- Index for reviews by restaurant and rating
CREATE INDEX IF NOT EXISTS idx_reviews_restaurant_rating ON public.reviews(restaurant_id, rating);

-- Index for restaurants by name (search)
CREATE INDEX IF NOT EXISTS idx_restaurants_name ON public.restaurants USING gin(to_tsvector('english', name));

-- Index for lists by creator
CREATE INDEX IF NOT EXISTS idx_lists_creator ON public.lists(creator_id);

-- Index for lists by is_public
CREATE INDEX IF NOT EXISTS idx_lists_is_public ON public.lists(is_public);

-- =============================================
-- exec_sql function for future migrations
-- =============================================
CREATE OR REPLACE FUNCTION public.exec_sql(sql text)
RETURNS void
AS $$
BEGIN
  EXECUTE sql;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Restrict exec_sql to authenticated users only
REVOKE ALL ON FUNCTION public.exec_sql(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO authenticated;

COMMENT ON FUNCTION public.exec_sql IS 'Execute dynamic SQL (restricted to authenticated users only)';