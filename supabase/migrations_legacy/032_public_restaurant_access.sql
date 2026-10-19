-- Migration: Allow public (anon and authenticated) access to restaurants
-- This enables unlogged users to see all restaurants
-- Created: 2026-05-05

-- Drop the existing restrictive SELECT policy
DROP POLICY IF EXISTS "restaurants_select_policy" ON public.restaurants;

-- Create new policy allowing everyone (anon + authenticated) to read restaurants
CREATE POLICY "restaurants_select_policy" ON public.restaurants
FOR SELECT USING (true);

-- Log migration
INSERT INTO schema_migrations (version, description, installed_at, success)
VALUES ('036_public_restaurant_access', 'Allow public read access to restaurants', now(), true)
ON CONFLICT (version) DO NOTHING;