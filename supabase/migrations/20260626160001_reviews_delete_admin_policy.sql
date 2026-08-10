-- Migration: Fix reviews delete policy to allow admins to delete any review
-- Fixes: admins could not delete other users' reviews through the public DELETE endpoint
-- because RLS policy reviews_delete_policy restricted deletion to review owners only.

-- Step 1: Drop the existing delete policy (IF EXISTS prevents error if already dropped)
DROP POLICY IF EXISTS "reviews_delete_policy" ON public.reviews;

-- Step 2: Create updated delete policy that allows admins to delete any review
CREATE POLICY "reviews_delete_policy" ON public.reviews
FOR DELETE TO authenticated
USING (
  auth.role() = 'authenticated'
  AND (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid()
      AND is_admin = true
    )
  )
);
