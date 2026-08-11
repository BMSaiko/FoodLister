-- Migration 066: Allow any authenticated user to create their own review
-- T58. Reverts the INSERT restriction from migration 059 (admin-only) back
-- to any authenticated user inserting their OWN review.
-- Keeps UPDATE/DELETE restrictions intact (059/060).
-- Idempotent: drops any prior insert policy before recreating.

DO $$ BEGIN
  DROP POLICY IF EXISTS "Admins can create reviews" ON public.reviews;
  DROP POLICY IF EXISTS "Authenticated users can create reviews" ON public.reviews;
  DROP POLICY IF EXISTS "reviews_insert_policy" ON public.reviews;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Any authenticated user can insert their own review (user_id must match)
CREATE POLICY "Authenticated users can create reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);
