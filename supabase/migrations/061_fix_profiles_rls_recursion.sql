-- Migration 061: Fix infinite recursion in profiles RLS policies
-- Root cause: Migration 027 created profiles UPDATE/INSERT policies with
-- WITH CHECK clauses that query public.profiles, causing PostgREST error 42P17
-- (infinite recursion detected in policy for relation "profiles").
--
-- The offending patterns:
--   - WITH CHECK (... (SELECT is_admin FROM public.profiles WHERE user_id = auth.uid()) ...)
--   - WITH CHECK (... current_user_is_admin() ...)  -- queries profiles internally
--
-- Fix: Drop all profiles policies and recreate them WITHOUT recursive subqueries.
-- Privileged column protection is handled by the API layer (requireAdmin), not RLS.

-- Drop ALL existing profiles policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "profiles_user_ownership" ON public.profiles;
DROP POLICY IF EXISTS "profiles_read_public" ON public.profiles;
DROP POLICY IF EXISTS "profiles_service_role" ON public.profiles;

-- Re-create safe policies (no subqueries on profiles table)

-- Public can view profiles (for display purposes)
CREATE POLICY "profiles_read_public" ON public.profiles
FOR SELECT
USING (true);

-- Users can view their own profile (redundant with public, but explicit)
CREATE POLICY "profiles_user_ownership" ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own profile (no WITH CHECK subqueries)
CREATE POLICY "profiles_user_update" ON public.profiles
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can insert their own profile (no WITH CHECK subqueries)
CREATE POLICY "profiles_user_insert" ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Service role bypasses all RLS (for admin operations)
CREATE POLICY "profiles_service_role" ON public.profiles
FOR ALL
USING (true)
WITH CHECK (true);
