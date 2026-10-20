-- Migration: T75 admin can add to ANY list
-- The app-side POST/DELETE routes now treat admin as owner-equivalent,
-- so admin must also SEE every list in the add-to-list dropdown. Extend
-- lists_select_policy with the existing current_user_is_admin() (mig 027/059).
DROP POLICY IF EXISTS "lists_select_policy" ON public.lists;
CREATE POLICY "lists_select_policy"
  ON public.lists FOR SELECT
  USING (
    is_public = true
    OR auth.uid() = creator_id
    OR public.can_access_list(id, auth.uid())
    OR public.current_user_is_admin()
  );
