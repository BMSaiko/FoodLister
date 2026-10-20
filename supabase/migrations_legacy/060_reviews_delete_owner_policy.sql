-- Migration 060: Allow review owners to delete their own reviews
-- Replaces the admin-only delete policy from migration 059 with a policy
-- that allows both owners and admins to delete reviews.
-- RLS is enforced by Supabase — no service role bypass needed.
-- Idempotent: drops all existing delete policies before recreating.

DO $$ BEGIN
  DROP POLICY IF EXISTS "Admins can delete reviews" ON public.reviews;
  DROP POLICY IF EXISTS "Admins can delete any review" ON public.reviews;
  DROP POLICY IF EXISTS "Users can delete own reviews" ON public.reviews;
  DROP POLICY IF EXISTS "reviews_delete_policy" ON public.reviews;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Allow owners to delete their own reviews
CREATE POLICY "Users can delete own reviews"
  ON public.reviews FOR DELETE
  USING (auth.uid() = user_id);

-- Allow admins to delete any review
CREATE POLICY "Admins can delete any review"
  ON public.reviews FOR DELETE
  USING (public.current_user_is_admin());
