-- ============================================================
-- Migration: Fix RLS infinite recursion on lists and list_collaborators
-- Date: 2026-06-26
--
-- Root cause: After migration 20260626155852, both tables have
-- policies that reference each other:
--   lists."Users can view shared lists" -> subquery on list_collaborators
--   list_collaborators."select_policy" -> subquery on lists
-- PostgreSQL detects circular reference -> 42P17 error.
--
-- Fix: Use a SECURITY DEFINER function for the ownership check
-- in list_collaborators RLS. SECURITY DEFINER runs as the function
-- owner (postgres), bypassing RLS policies on the lists table,
-- which breaks the cycle.
-- ============================================================

BEGIN;

-- Step 1: Create security definer function for list ownership check
-- This bypasses RLS because it runs as the function owner role.
CREATE OR REPLACE FUNCTION public.check_list_ownership(check_list_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.lists
    WHERE lists.id = check_list_id
    AND lists.creator_id = auth.uid()
  );
$$;

-- Step 2: Recreate list_collaborators policies using the security definer function
-- This avoids the circular RLS evaluation.

DROP POLICY IF EXISTS "list_collaborators_select_policy" ON public.list_collaborators;
DROP POLICY IF EXISTS "list_collaborators_insert_policy" ON public.list_collaborators;
DROP POLICY IF EXISTS "list_collaborators_delete_policy" ON public.list_collaborators;

-- SELECT: user is the collaborator OR user owns the list (via SECURITY DEFINER function)
CREATE POLICY "list_collaborators_select_policy"
  ON public.list_collaborators FOR SELECT
  USING (
    user_id = auth.uid()
    OR public.check_list_ownership(list_id)
  );

-- INSERT: only list owner can add collaborators
CREATE POLICY "list_collaborators_insert_policy"
  ON public.list_collaborators FOR INSERT
  WITH CHECK (
    public.check_list_ownership(list_id)
  );

-- DELETE: only list owner can remove collaborators
CREATE POLICY "list_collaborators_delete_policy"
  ON public.list_collaborators FOR DELETE
  USING (
    public.check_list_ownership(list_id)
  );

-- Step 3: Grant execute to authenticated role
GRANT EXECUTE ON FUNCTION public.check_list_ownership(UUID) TO authenticated;

COMMIT;
