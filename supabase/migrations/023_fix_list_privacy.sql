-- Migration: Fix List Privacy RLS Policies
-- Date: 2026-04-03
-- Purpose: Ensure private lists are only visible to their creators

-- Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Lists are viewable by everyone" ON public.lists;
DROP POLICY IF EXISTS "Users can create their own lists" ON public.lists;
DROP POLICY IF EXISTS "Users can update their own lists" ON public.lists;
DROP POLICY IF EXISTS "Users can delete their own lists" ON public.lists;
DROP POLICY IF EXISTS "lists_select_policy" ON public.lists;
DROP POLICY IF EXISTS "lists_insert_policy" ON public.lists;
DROP POLICY IF EXISTS "lists_update_policy" ON public.lists;
DROP POLICY IF EXISTS "lists_delete_policy" ON public.lists;
DROP POLICY IF EXISTS "lists_user_ownership" ON public.lists;
DROP POLICY IF EXISTS "lists_service_role" ON public.lists;

-- Ensure RLS is enabled
ALTER TABLE public.lists ENABLE ROW LEVEL SECURITY;

-- SELECT policy: 
-- - Public lists (is_public = true) are visible to everyone (including anonymous)
-- - Private lists (is_public = false) are only visible to their creator
CREATE POLICY "lists_select_policy" ON public.lists
  FOR SELECT
  USING (
    is_public = true OR creator_id = auth.uid()
  );

-- INSERT policy: Only authenticated users can create their own lists
CREATE POLICY "lists_insert_policy" ON public.lists
  FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' AND creator_id = auth.uid()
  );

-- UPDATE policy: Only the creator can update their lists
CREATE POLICY "lists_update_policy" ON public.lists
  FOR UPDATE
  USING (
    auth.role() = 'authenticated' AND creator_id = auth.uid()
  );

-- DELETE policy: Only the creator can delete their lists
CREATE POLICY "lists_delete_policy" ON public.lists
  FOR DELETE
  USING (
    auth.role() = 'authenticated' AND creator_id = auth.uid()
  );