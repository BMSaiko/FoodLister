-- Migration 028: Hide privileged columns from anon reads (Finding 2)
-- profiles policy "Public profiles are viewable by everyone" USING (public_profile=true) still
-- exposes is_admin, is_verified, phone_number, website to anon via the client bundle.
-- Postgres RLS has no column-level granularity, so expose a SECURITY DEFINER view with only
-- public-safe columns. App public reads should switch from `profiles` to `public_profiles`.

CREATE OR REPLACE VIEW public.public_profiles AS
  SELECT
    user_id,
    display_name,
    avatar_url,
    user_id_code,
    public_profile,
    bio,
    location,
    total_reviews,
    total_lists,
    total_restaurants_added
  FROM public.profiles
  WHERE public_profile = true;

-- Anon/client reads only the view; RLS on the base table no longer matters for these columns.
GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- ponytail: column hiding is opt-in -- app must query public_profiles instead of profiles for
-- public author data. No RLS change needed on base table; this is additive.
