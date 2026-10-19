-- Migration 063: Restore owner and editor list permissions
-- Migration 059 made lists INSERT/UPDATE/DELETE admin-only.
-- Broke: owners can't edit/delete their lists, editors can't update.
-- Uses SECURITY DEFINER functions to avoid RLS recursion.

BEGIN;

CREATE OR REPLACE FUNCTION public.can_edit_list(p_list_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.list_collaborators
    WHERE list_id = p_list_id
      AND user_id = auth.uid()
      AND role = 'editor'
  );
$$;

-- Ensure check_list_ownership exists (may have been dropped by 059 or never created)
CREATE OR REPLACE FUNCTION public.check_list_ownership(check_list_id UUID)
RETURNS boolean
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

DROP POLICY IF EXISTS "Admins can create lists" ON public.lists;
DROP POLICY IF EXISTS "lists_insert_policy" ON public.lists;
CREATE POLICY "lists_insert_policy" ON public.lists
FOR INSERT WITH CHECK ((select auth.uid()) = creator_id);

DROP POLICY IF EXISTS "Admins can update lists" ON public.lists;
DROP POLICY IF EXISTS "lists_update_policy" ON public.lists;
CREATE POLICY "lists_update_policy" ON public.lists
FOR UPDATE USING (
  (select auth.uid()) = creator_id
  OR public.can_edit_list(id)
);

DROP POLICY IF EXISTS "Admins can delete lists" ON public.lists;
DROP POLICY IF EXISTS "lists_delete_policy" ON public.lists;
CREATE POLICY "lists_delete_policy" ON public.lists
FOR DELETE USING ((select auth.uid()) = creator_id);

DROP POLICY IF EXISTS "list_collaborators_select_policy" ON public.list_collaborators;
DROP POLICY IF EXISTS "list_collaborators_insert_policy" ON public.list_collaborators;
DROP POLICY IF EXISTS "list_collaborators_update_policy" ON public.list_collaborators;
DROP POLICY IF EXISTS "list_collaborators_delete_policy" ON public.list_collaborators;

CREATE POLICY "list_collaborators_select_policy"
  ON public.list_collaborators FOR SELECT
  USING (user_id = auth.uid() OR public.check_list_ownership(list_id));

CREATE POLICY "list_collaborators_insert_policy"
  ON public.list_collaborators FOR INSERT
  WITH CHECK (public.check_list_ownership(list_id));

CREATE POLICY "list_collaborators_update_policy"
  ON public.list_collaborators FOR UPDATE
  USING (public.check_list_ownership(list_id));

CREATE POLICY "list_collaborators_delete_policy"
  ON public.list_collaborators FOR DELETE
  USING (public.check_list_ownership(list_id));

DROP POLICY IF EXISTS "list_restaurants_own_lists" ON public.list_restaurants;
CREATE POLICY "list_restaurants_own_lists" ON public.list_restaurants
FOR ALL USING (
  (select auth.role()) = 'authenticated'
  AND (
    (select auth.uid()) = (SELECT creator_id FROM public.lists WHERE id = list_restaurants.list_id)
    OR EXISTS (
      SELECT 1 FROM public.list_collaborators
      WHERE list_id = list_restaurants.list_id
        AND user_id = (select auth.uid())
        AND role = 'editor'
    )
  )
);

COMMIT;
