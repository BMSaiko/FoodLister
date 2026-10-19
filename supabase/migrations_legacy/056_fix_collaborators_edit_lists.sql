-- Migration: Fix collaborators edit lists RLS policies
-- Date: 2026-06-27
-- Allows editors to update list details and add/remove restaurants

-- ==========================================
-- FIX LISTS TABLE POLICIES
-- ==========================================

DROP POLICY IF EXISTS "lists_update_policy" ON public.lists;
CREATE POLICY "lists_update_policy" ON public.lists
FOR UPDATE USING (
  (select auth.uid()) = creator_id
  OR EXISTS (
    SELECT 1 FROM public.list_collaborators
    WHERE list_id = id AND user_id = (select auth.uid()) AND role = 'editor'
  )
);

DROP POLICY IF EXISTS "lists_delete_policy" ON public.lists;
CREATE POLICY "lists_delete_policy" ON public.lists
FOR DELETE USING (
  (select auth.uid()) = creator_id
  OR EXISTS (
    SELECT 1 FROM public.list_collaborators
    WHERE list_id = id AND user_id = (select auth.uid()) AND role = 'editor'
  )
);

-- ==========================================
-- FIX LIST_RESTAURANTS TABLE POLICIES
-- ==========================================

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

COMMENT ON POLICY "lists_update_policy" ON public.lists IS 'Editors can update lists they collaborate on';
COMMENT ON POLICY "lists_delete_policy" ON public.lists IS 'Editors can delete lists they collaborate on';
COMMENT ON POLICY "list_restaurants_own_lists" ON public.list_restaurants IS 'Editors can manage restaurants in lists they collaborate on';
