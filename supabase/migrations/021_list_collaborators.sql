-- Migration: Add list collaborators functionality
-- Date: 2026-04-04

-- Create list_collaborators table
CREATE TABLE IF NOT EXISTS public.list_collaborators (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  list_id uuid NOT NULL REFERENCES public.lists(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'editor' CHECK (role IN ('editor', 'viewer')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT list_collaborators_pkey PRIMARY KEY (id),
  CONSTRAINT list_collaborators_list_id_user_id_key UNIQUE (list_id, user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_list_collaborators_list_id ON public.list_collaborators(list_id);
CREATE INDEX IF NOT EXISTS idx_list_collaborators_user_id ON public.list_collaborators(user_id);

-- Enable Row Level Security
ALTER TABLE public.list_collaborators ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- List owner can manage collaborators
CREATE POLICY "list_collaborators_select_policy" ON public.list_collaborators
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT creator_id FROM public.lists WHERE id = list_id
    )
    OR
    auth.uid() = user_id
  );

-- List owner can add collaborators
CREATE POLICY "list_collaborators_insert_policy" ON public.list_collaborators
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT creator_id FROM public.lists WHERE id = list_id
    )
  );

-- List owner can remove collaborators
CREATE POLICY "list_collaborators_delete_policy" ON public.list_collaborators
  FOR DELETE
  USING (
    auth.uid() IN (
      SELECT creator_id FROM public.lists WHERE id = list_id
    )
  );

COMMENT ON TABLE public.list_collaborators IS 'Collaborators on lists with role-based access';