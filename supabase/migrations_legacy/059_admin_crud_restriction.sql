-- Migration 059: Restrict CRUD operations to admin users only
-- Only users with profiles.is_admin = true can INSERT/UPDATE/DELETE
-- restaurants, lists, reviews, and related junction/utility tables.
-- SELECT (read) remains open to all authenticated users.
-- Idempotent: drop any existing admin policies from prior runs
-- (handles re-runs and partial prior applications)
DO $$ BEGIN
  DROP POLICY IF EXISTS "Admins can create restaurants" ON public.restaurants;
  DROP POLICY IF EXISTS "Admins can update restaurants" ON public.restaurants;
  DROP POLICY IF EXISTS "Admins can delete restaurants" ON public.restaurants;
  DROP POLICY IF EXISTS "Admins can create lists" ON public.lists;
  DROP POLICY IF EXISTS "Admins can update lists" ON public.lists;
  DROP POLICY IF EXISTS "Admins can delete lists" ON public.lists;
  DROP POLICY IF EXISTS "Admins can create reviews" ON public.reviews;
  DROP POLICY IF EXISTS "Admins can update reviews" ON public.reviews;
  DROP POLICY IF EXISTS "Admins can delete reviews" ON public.reviews;
  DROP POLICY IF EXISTS "list_collaborators_select_policy" ON public.list_collaborators;
  DROP POLICY IF EXISTS "list_collaborators_insert_policy" ON public.list_collaborators;
  DROP POLICY IF EXISTS "list_collaborators_update_policy" ON public.list_collaborators;
  DROP POLICY IF EXISTS "list_collaborators_delete_policy" ON public.list_collaborators;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;


-- ============================================================
-- Restaurants: replace owner-only CRUD with admin-only CRUD
-- ============================================================

DROP POLICY IF EXISTS "Authenticated users can create restaurants" ON public.restaurants;
DROP POLICY IF EXISTS "Users can update own restaurants" ON public.restaurants;
DROP POLICY IF EXISTS "Users can delete own restaurants" ON public.restaurants;

CREATE POLICY "Admins can create restaurants"
  ON public.restaurants FOR INSERT
  WITH CHECK (public.current_user_is_admin());

CREATE POLICY "Admins can update restaurants"
  ON public.restaurants FOR UPDATE
  USING (public.current_user_is_admin());

CREATE POLICY "Admins can delete restaurants"
  ON public.restaurants FOR DELETE
  USING (public.current_user_is_admin());

-- ============================================================
-- Lists: replace owner-only CRUD with admin-only CRUD
-- ============================================================

DROP POLICY IF EXISTS "Public lists are viewable by everyone" ON public.lists;
DROP POLICY IF EXISTS "Users can view own lists" ON public.lists;
DROP POLICY IF EXISTS "Users can view shared lists" ON public.lists;
DROP POLICY IF EXISTS "Authenticated users can create lists" ON public.lists;
DROP POLICY IF EXISTS "Users can update own lists" ON public.lists;
DROP POLICY IF EXISTS "Users can delete own lists" ON public.lists;

-- SELECT stays open (public + own + shared) — read access unchanged
CREATE POLICY "Public lists are viewable by everyone"
  ON public.lists FOR SELECT
  USING (is_public = true);

CREATE POLICY "Users can view own lists"
  ON public.lists FOR SELECT
  USING (auth.uid() = creator_id);

CREATE POLICY "Users can view shared lists"
  ON public.lists FOR SELECT
  USING (
    auth.uid() = user_id
  );

CREATE POLICY "Admins can create lists"
  ON public.lists FOR INSERT
  WITH CHECK (public.current_user_is_admin());

CREATE POLICY "Admins can update lists"
  ON public.lists FOR UPDATE
  USING (public.current_user_is_admin());

CREATE POLICY "Admins can delete lists"
  ON public.lists FOR DELETE
  USING (public.current_user_is_admin());

-- ============================================================
-- Reviews: replace owner-only CRUD with admin-only CRUD
-- ============================================================

DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON public.reviews;
DROP POLICY IF EXISTS "Authenticated users can create reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can update own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can delete own reviews" ON public.reviews;

-- SELECT stays open (public read)
CREATE POLICY "Reviews are viewable by everyone"
  ON public.reviews FOR SELECT
  USING (true);

CREATE POLICY "Admins can create reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (public.current_user_is_admin());

CREATE POLICY "Admins can update reviews"
  ON public.reviews FOR UPDATE
  USING (public.current_user_is_admin());

CREATE POLICY "Admins can delete reviews"
  ON public.reviews FOR DELETE
  USING (public.current_user_is_admin());

-- ============================================================
-- Collaborator management: admins only
-- ============================================================

DROP POLICY IF EXISTS "list_collaborators_select_policy" ON public.list_collaborators;
DROP POLICY IF EXISTS "list_collaborators_insert_policy" ON public.list_collaborators;
DROP POLICY IF EXISTS "list_collaborators_update_policy" ON public.list_collaborators;
DROP POLICY IF EXISTS "list_collaborators_delete_policy" ON public.list_collaborators;

-- Anyone can read collaborators for lists they can see
-- Admin-only mutation
CREATE POLICY "list_collaborators_select_policy"
  ON public.list_collaborators FOR SELECT
  USING (auth.uid() = user_id OR public.current_user_is_admin());

CREATE POLICY "list_collaborators_insert_policy"
  ON public.list_collaborators FOR INSERT
  WITH CHECK (public.current_user_is_admin());

CREATE POLICY "list_collaborators_update_policy"
  ON public.list_collaborators FOR UPDATE
  USING (public.current_user_is_admin());

CREATE POLICY "list_collaborators_delete_policy"
  ON public.list_collaborators FOR DELETE
  USING (public.current_user_is_admin());
