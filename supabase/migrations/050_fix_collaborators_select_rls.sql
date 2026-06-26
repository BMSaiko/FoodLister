-- ============================================================
-- Migration: Fix list_collaborators SELECT RLS + FK for profiles JOIN
-- Date: 2026-06-26
--
-- Bug: GET /api/lists/:id/collaborators returns 500.
-- Two root causes:
--
-- 1. RLS: After migration 20260626152402, the SELECT policy was
--    simplified to `user_id = auth.uid()` only. List OWNERS
--    cannot see collaborators on their own lists (owner is NOT
--    a row in list_collaborators). RLS filters everything → 500.
--
-- 2. FK: list_collaborators.user_id REFERENCES auth.users(id),
--    but the API query uses `.select('*, profiles(...)')` which
--    requires a FK to profiles(user_id) for PostgREST auto-JOIN.
--    Same issue fixed for list_comments/list_activities in
--    migration 20260626052148.
--
-- Fix:
-- - Restore owner visibility via EXISTS (safe: lists owner
--   branch uses creator_id = auth.uid() directly, no recursion).
-- - Redirect FK from auth.users to profiles.
-- ============================================================

BEGIN;

-- === FIX 1: RLS SELECT policy ===

-- Drop the overly restrictive policy
DROP POLICY IF EXISTS "list_collaborators_select_policy" ON public.list_collaborators;

-- Recreate: collaborator can see own row, list owner can see all rows on their list
-- The EXISTS check on lists is safe because lists SELECT policy for owners
-- uses `creator_id = auth.uid()` (no back-reference to list_collaborators).
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

-- === FIX 2: Redirect FK to profiles for PostgREST auto-JOIN ===

ALTER TABLE IF EXISTS public.list_collaborators
  DROP CONSTRAINT IF EXISTS list_collaborators_user_id_fkey;

ALTER TABLE IF EXISTS public.list_collaborators
  ADD CONSTRAINT list_collaborators_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

COMMIT;
