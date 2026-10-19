-- Migration 027: Lock privileged columns on profiles (privesc fix)
-- Root cause: "Users can update their own profile" had FOR UPDATE USING (auth.uid()=user_id)
-- but NO WITH CHECK. Any authenticated user could UPDATE profiles SET is_admin=true on their
-- own row; middleware admin gate runs with anon key and would then trust the promoted flag.
-- Fix: split UPDATE into USING + WITH CHECK that forbids mutating privileged columns unless
-- the current user is already admin. Uses a SECURITY DEFINER helper to avoid self-referential
-- RLS recursion (42P17) warned about in 035_admin_rls.sql.

-- Helper: read caller's admin status without triggering RLS on profiles.
CREATE OR REPLACE FUNCTION public.current_user_is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'pg_catalog, pg_temp'
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM public.profiles WHERE user_id = auth.uid()),
    false
  );
$$;

-- Privileged columns that a non-admin must never set/change on their own (or any) row.
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND (
      public.current_user_is_admin()
      OR (
        is_admin IS NOT DISTINCT FROM (SELECT is_admin FROM public.profiles WHERE user_id = auth.uid())
        AND is_verified IS NOT DISTINCT FROM (SELECT is_verified FROM public.profiles WHERE user_id = auth.uid())
        AND verification_method IS NOT DISTINCT FROM (SELECT verification_method FROM public.profiles WHERE user_id = auth.uid())
        AND verified_at IS NOT DISTINCT FROM (SELECT verified_at FROM public.profiles WHERE user_id = auth.uid())
      )
    )
  );

-- INSERT: a freshly created profile must never self-grant admin/verified.
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND (is_admin IS NOT DISTINCT FROM false OR public.current_user_is_admin())
    AND (is_verified IS NOT DISTINCT FROM false OR public.current_user_is_admin())
  );
