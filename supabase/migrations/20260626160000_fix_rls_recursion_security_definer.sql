-- ============================================================
-- Migration: Fix RLS infinite recursion on lists and list_collaborators
-- Date: 2026-06-26
--
-- Root cause: After migrations 053/20260626152402/20260626155852,
-- the list_collaborators policies reference lists, and the lists
-- "Users can view shared lists" policy references list_collaborators.
-- PostgreSQL sees circular RLS evaluation -> 42P17.
--
-- Fix: Rewrite list_collaborators policies to use the existing
-- can_access_list() SECURITY DEFINER function instead of direct
-- subqueries on lists. SECURITY DEFINER runs as the function owner
-- (bypasses RLS), breaking the cycle.
-- ============================================================

BEGIN;

-- Step 1: Drop all problematic list_collaborators policies
DROP POLICY IF EXISTS "list_collaborators_select_policy" ON public.list_collaborators;
DROP POLICY IF EXISTS "list_collaborators_insert_policy" ON public.list_collaborators;
DROP POLICY IF EXISTS "list_collaborators_update_policy" ON public.list_collaborators;
DROP POLICY IF EXISTS "list_collaborators_delete_policy" ON public.list_collaborators;

-- Step 2: Also drop the lists policy that references list_collaborators
DROP POLICY IF EXISTS "Users can view shared lists" ON public.lists;
DROP POLICY IF EXISTS "lists_select_policy" ON public.lists;

-- Step 3: Recreate ALL policies using SECURITY DEFINER functions only
-- This ensures NO direct cross-table subqueries in RLS policies.

-- lists SELECT: uses can_access_list (SECURITY DEFINER) for collaborator check
CREATE POLICY "lists_select_policy"
  ON public.lists FOR SELECT
  USING (
    is_public = true
    OR auth.uid() = creator_id
    OR public.can_access_list(id, auth.uid())
  );

-- lists: insert/update/delete (unchanged, no cross-reference)
CREATE POLICY "lists_insert_policy"
  ON public.lists FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "lists_update_policy"
  ON public.lists FOR UPDATE
  USING (auth.uid() = creator_id);

CREATE POLICY "lists_delete_policy"
  ON public.lists FOR DELETE
  USING (auth.uid() = creator_id);

-- list_collaborators SELECT: uses can_access_list (SECURITY DEFINER)
-- No direct subquery on lists -> no cycle
CREATE POLICY "list_collaborators_select_policy"
  ON public.list_collaborators FOR SELECT
  USING (
    user_id = auth.uid()
    OR public.can_access_list(list_id, auth.uid())
  );

-- list_collaborators INSERT: only owner (via SECURITY DEFINER)
CREATE POLICY "list_collaborators_insert_policy"
  ON public.list_collaborators FOR INSERT
  WITH CHECK (
    public.can_access_list(list_id, auth.uid())
  );

-- list_collaborators UPDATE: only owner (via SECURITY DEFINER)
CREATE POLICY "list_collaborators_update_policy"
  ON public.list_collaborators FOR UPDATE
  USING (
    public.can_access_list(list_id, auth.uid())
  );

-- list_collaborators DELETE: only owner (via SECURITY DEFINER)
CREATE POLICY "list_collaborators_delete_policy"
  ON public.list_collaborators FOR DELETE
  USING (
    public.can_access_list(list_id, auth.uid())
  );

COMMIT;
