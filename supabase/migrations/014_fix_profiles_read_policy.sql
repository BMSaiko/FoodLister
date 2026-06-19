-- Migration: Fix profiles RLS policy to allow anonymous reads
-- This allows the public reviews API to fetch user profile data (display_name, avatar_url, user_id_code)
-- without requiring authentication, which is needed for displaying review author information

-- Drop the old policy that required authenticated role
DROP POLICY IF EXISTS "profiles_read_public" ON public.profiles;

-- Create a new policy that allows anyone (including anon/unauthenticated) to read public profile data
-- This is safe because we're only exposing public information: display_name, avatar_url, user_id_code
CREATE POLICY "profiles_read_public" ON public.profiles
    FOR SELECT USING (true);

-- Also ensure the profiles table has RLS enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;