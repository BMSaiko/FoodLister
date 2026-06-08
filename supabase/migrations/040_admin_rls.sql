-- Migration 040: RLS policy for admin read access to all profiles
-- Note: Admin API routes use service role key (bypasses RLS),
-- but this policy ensures direct Supabase client queries also work.

-- Allow admins to read all profiles via regular client
CREATE POLICY "Admins can read all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

-- Allow admins to update any profile via regular client
CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

-- Allow admins to read all reviews
CREATE POLICY "Admins can read all reviews"
  ON public.reviews FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

-- Allow admins to delete reviews (moderation)
CREATE POLICY "Admins can delete any review"
  ON public.reviews FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

-- Allow admins to read all restaurants
CREATE POLICY "Admins can read all restaurants"
  ON public.restaurants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

