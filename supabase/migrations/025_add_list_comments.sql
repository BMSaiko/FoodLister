-- Migration: Add list comments functionality
-- Date: 2026-04-04

-- Create list_comments table
CREATE TABLE IF NOT EXISTS public.list_comments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  list_id uuid NOT NULL REFERENCES public.lists(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  comment text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT list_comments_pkey PRIMARY KEY (id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_list_comments_list_id ON public.list_comments(list_id);
CREATE INDEX IF NOT EXISTS idx_list_comments_user_id ON public.list_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_list_comments_created_at ON public.list_comments(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.list_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Anyone can read comments on public lists
CREATE POLICY "list_comments_select_public" ON public.list_comments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.lists 
      WHERE lists.id = list_comments.list_id 
      AND lists.is_public = true
    )
    OR 
    auth.uid() = list_comments.user_id
  );

-- Authenticated users can create comments on public lists
CREATE POLICY "list_comments_insert_policy" ON public.list_comments
  FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND
    EXISTS (
      SELECT 1 FROM public.lists 
      WHERE lists.id = list_comments.list_id 
      AND lists.is_public = true
    )
  );

-- Users can update their own comments
CREATE POLICY "list_comments_update_policy" ON public.list_comments
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "list_comments_delete_policy" ON public.list_comments
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add comment count to lists (optional, for performance)
-- ALTER TABLE public.lists ADD COLUMN IF NOT EXISTS comment_count integer NOT NULL DEFAULT 0;

COMMENT ON TABLE public.list_comments IS 'Comments on public lists';