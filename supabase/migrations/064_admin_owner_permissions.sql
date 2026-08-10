-- Migration 064: Permission matrix — any authenticated user creates restaurants;
-- owners+admins edit; only admins delete restaurants. Admins can edit/delete any list.
-- Restores list_collaborators management to owners (059 broke it).

BEGIN;

-- Idempotent drops (re-runnable)
DO $$ BEGIN
  DROP POLICY IF EXISTS "Admins can create restaurants" ON public.restaurants;
  DROP POLICY IF EXISTS "Admins can update restaurants" ON public.restaurants;
  DROP POLICY IF EXISTS "restaurants_insert_policy" ON public.restaurants;
  DROP POLICY IF EXISTS "restaurants_update_policy" ON public.restaurants;
  DROP POLICY IF EXISTS "lists_update_policy" ON public.lists;
  DROP POLICY IF EXISTS "lists_delete_policy" ON public.lists;
  DROP POLICY IF EXISTS "list_collaborators_select_policy" ON public.list_collaborators;
  DROP POLICY IF EXISTS "list_collaborators_insert_policy" ON public.list_collaborators;
  DROP POLICY IF EXISTS "list_collaborators_update_policy" ON public.list_collaborators;
  DROP POLICY IF EXISTS "list_collaborators_delete_policy" ON public.list_collaborators;
  DROP POLICY IF EXISTS "list_restaurants_own_lists" ON public.list_restaurants;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- ============================================
-- Restaurants: any authenticated user can create;
-- owner OR admin can update; ONLY admin can delete.
-- ============================================
CREATE POLICY "restaurants_insert_policy" ON public.restaurants
FOR INSERT WITH CHECK ((select auth.role()) = 'authenticated');

CREATE POLICY "restaurants_update_policy" ON public.restaurants
FOR UPDATE USING (
  (select auth.uid()) = creator_id
  OR public.current_user_is_admin()
);

-- DELETE stays admin-only: "Admins can delete restaurants" (from 059) is unchanged.

-- ============================================
-- Lists: owner OR editor OR admin can update; owner OR admin can delete.
-- ============================================
CREATE POLICY "lists_update_policy" ON public.lists
FOR UPDATE USING (
  (select auth.uid()) = creator_id
  OR public.can_edit_list(id)
  OR public.current_user_is_admin()
);

CREATE POLICY "lists_delete_policy" ON public.lists
FOR DELETE USING (
  (select auth.uid()) = creator_id
  OR public.current_user_is_admin()
);

-- ============================================
-- list_collaborators: owners manage; admins can too (restore 059 break).
-- ============================================
CREATE POLICY "list_collaborators_select_policy"
  ON public.list_collaborators FOR SELECT
  USING (user_id = auth.uid() OR public.check_list_ownership(list_id));

CREATE POLICY "list_collaborators_insert_policy"
  ON public.list_collaborators FOR INSERT
  WITH CHECK (public.check_list_ownership(list_id) OR public.current_user_is_admin());

CREATE POLICY "list_collaborators_update_policy"
  ON public.list_collaborators FOR UPDATE
  USING (public.check_list_ownership(list_id) OR public.current_user_is_admin());

CREATE POLICY "list_collaborators_delete_policy"
  ON public.list_collaborators FOR DELETE
  USING (public.check_list_ownership(list_id) OR public.current_user_is_admin());

-- ============================================
-- list_restaurants: owners/editors, plus admins (admin edits any list's contents).
-- ============================================
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
    OR public.current_user_is_admin()
  )
);

COMMIT;
