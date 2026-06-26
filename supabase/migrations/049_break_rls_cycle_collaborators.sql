-- ============================================================
-- Migration: Break RLS infinite recursion cycle (42P17)
-- Date: 2026-06-26
--
-- Root cause: After migration 053 (EXISTS fix), the RLS policies on
-- `lists` and `list_collaborators` still form a circular reference:
--
--   lists.policy → EXISTS(SELECT FROM list_collaborators WHERE list_id = lists.id)
--   list_collaborators.policy → EXISTS(SELECT FROM lists WHERE id = list_id)
--
-- PostgreSQL RLS evaluation walks BOTH policies, creating a cycle that
-- throws "infinite recursion detected in policy for relation 'lists'".
--
-- Fix: The list_collaborators SELECT policy does NOT need to check
-- the `lists` table for ownership — the `lists` "Users can view shared
-- lists" policy already covers that case (owner access is checked at the
-- lists layer). So list_collaborators only needs to verify the current
-- user is the row's user_id. This makes references ONE-WAY only:
-- lists → list_collaborators (never back).
-- ============================================================

BEGIN;

-- Drop the policy that references back to lists (creates the cycle)
DROP POLICY IF EXISTS "list_collaborators_select_policy" ON public.list_collaborators;

-- Recreate with simple user check only — no subquery on lists
CREATE POLICY "list_collaborators_select_policy"
  ON public.list_collaborators FOR SELECT
  USING (user_id = auth.uid());

COMMIT;
