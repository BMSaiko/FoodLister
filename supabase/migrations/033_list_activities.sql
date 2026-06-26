-- Migration: Add list_activities table for activity feed
-- Tracks all changes made to lists (restaurants added/removed, list updates, collaborator changes)

CREATE TABLE IF NOT EXISTS public.list_activities (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  list_id uuid NOT NULL,
  user_id uuid NOT NULL,
  action text NOT NULL CHECK (action IN ('restaurant_added', 'restaurant_removed', 'list_updated', 'collaborator_added', 'collaborator_removed', 'list_duplicated')),
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT list_activities_pkey PRIMARY KEY (id),
  CONSTRAINT list_activities_list_id_fkey FOREIGN KEY (list_id) REFERENCES public.lists(id) ON DELETE CASCADE,
  CONSTRAINT list_activities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Index for efficient querying by list_id and created_at
CREATE INDEX IF NOT EXISTS idx_list_activities_list_id_created_at ON public.list_activities (list_id, created_at DESC);

-- Enable RLS
ALTER TABLE public.list_activities ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view activities for lists they own or collaborate on
CREATE POLICY "Users can view list activities" ON public.list_activities
  FOR SELECT
  USING (
    list_id IN (
      SELECT id FROM public.lists WHERE creator_id = auth.uid()
      UNION
      SELECT list_id FROM public.list_collaborators WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can insert activities for lists they own or collaborate on
CREATE POLICY "Users can insert list activities" ON public.list_activities
  FOR INSERT
  WITH CHECK (
    list_id IN (
      SELECT id FROM public.lists WHERE creator_id = auth.uid()
      UNION
      SELECT list_id FROM public.list_collaborators WHERE user_id = auth.uid()
    )
  );