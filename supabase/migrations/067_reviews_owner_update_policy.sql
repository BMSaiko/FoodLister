-- Migration 067: Allow review owners to update their own reviews
-- T52/T58. Reverts UPDATE restriction from migration 059 (admin-only) to
-- owner-or-admin. Keeps INSERT (066) and DELETE (060) policies intact.
-- Idempotent: drops any prior update policy before recreating.

DO $$ BEGIN
  DROP POLICY IF EXISTS "Admins can update reviews" ON public.reviews;
  DROP POLICY IF EXISTS "Authenticated users can update reviews" ON public.reviews;
  DROP POLICY IF EXISTS "Users can update own reviews" ON public.reviews;
  DROP POLICY IF EXISTS "reviews_update_policy" ON public.reviews;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Owners can update their own reviews; admins can update any
CREATE POLICY "Users can update own reviews"
  ON public.reviews FOR UPDATE
  USING (auth.uid() = user_id OR public.current_user_is_admin())
  WITH CHECK (auth.uid() = user_id OR public.current_user_is_admin());
