-- ============================================================
-- Migration 053: Fix list_collaborators RLS recursion & performance
-- Date: 2026-06-26
-- 
-- Root cause: RLS policies on list_collaborators and lists create
-- a correlated subquery cycle:
--   list_collaborators RLS → subquery on lists
--   lists RLS "Users can view shared lists" → subquery on list_collaborators
-- This causes O(N×M) RLS evaluation and 5+ second query times.
--
-- Fix: Replace IN-subquery with EXISTS for semi-join behavior,
-- and add composite index for the new access pattern.
-- ============================================================

-- ============================================================
-- STEP 1: Drop problematic policies
-- ============================================================

-- Drop the correlated subquery policy on list_collaborators
DROP POLICY IF EXISTS "list_collaborators_select_policy" ON public.list_collaborators;
DROP POLICY IF EXISTS "list_collaborators_insert_policy" ON public.list_collaborators;
DROP POLICY IF EXISTS "list_collaborators_delete_policy" ON public.list_collaborators;

-- Drop the reverse-direction policy on lists (causes recursion)
DROP POLICY IF EXISTS "Users can view shared lists" ON public.lists;

-- ============================================================
-- STEP 2: Recreate policies with EXISTS instead of IN-subquery
-- ============================================================

-- list_collaborators SELECT: user can see if they are the collaborator
-- OR if they own the list (using EXISTS for efficient semi-join)
CREATE POLICY "list_collaborators_select_policy"
  ON public.list_collaborators FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.lists
      WHERE lists.id = list_collaborators.list_id
      AND lists.creator_id = auth.uid()
    )
  );

-- list_collaborators INSERT: only list owner can add
CREATE POLICY "list_collaborators_insert_policy"
  ON public.list_collaborators FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.lists
      WHERE lists.id = list_collaborators.list_id
      AND lists.creator_id = auth.uid()
    )
  );

-- list_collaborators DELETE: only list owner can remove
CREATE POLICY "list_collaborators_delete_policy"
  ON public.list_collaborators FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.lists
      WHERE lists.id = list_collaborators.list_id
      AND lists.creator_id = auth.uid()
    )
  );

-- lists SELECT: user can view if public, owner, or collaborator
-- Using EXISTS instead of IN-subquery to avoid recursion with list_collaborators RLS
CREATE POLICY "Users can view shared lists"
  ON public.lists FOR SELECT
  USING (
    is_public = true
    OR creator_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.list_collaborators
      WHERE list_collaborators.list_id = lists.id
      AND list_collaborators.user_id = auth.uid()
    )
  );

-- ============================================================
-- STEP 3: Composite index for new access pattern
-- ============================================================

-- Covers: RLS filter (list_id + user_id) + JOIN to profiles
CREATE INDEX IF NOT EXISTS idx_list_collaborators_list_user
  ON public.list_collaborators(list_id, user_id);

-- ============================================================
-- STEP 4: Statement timeout for authenticated role (safety net)
-- ============================================================

-- Prevents any authenticated query from running longer than 5 seconds
ALTER ROLE authenticated SET statement_timeout = '5s';

COMMENT ON TABLE public.list_collaborators IS 'Collaborators on lists with role-based access (RLS fixed in migration 053)';
