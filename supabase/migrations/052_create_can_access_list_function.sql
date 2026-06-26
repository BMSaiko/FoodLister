-- Migration: Create can_access_list function to break RLS recursion
-- Date: 2026-06-26
-- Depends on: 20260626160000_fix_rls_recursion_security_definer.sql

-- SECURITY DEFINER function that checks list access without triggering RLS
-- on list_collaborators (which would reference lists again → infinite recursion)
CREATE OR REPLACE FUNCTION public.can_access_list(p_list_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.lists
    WHERE id = p_list_id
      AND (
        is_public = true
        OR creator_id = p_user_id
        OR EXISTS (
          SELECT 1 FROM public.list_collaborators
          WHERE list_id = p_list_id
            AND user_id = p_user_id
        )
      )
  );
$$;

-- Grant execute to authenticated and anon roles
GRANT EXECUTE ON FUNCTION public.can_access_list(uuid, uuid) TO authenticated, anon;
