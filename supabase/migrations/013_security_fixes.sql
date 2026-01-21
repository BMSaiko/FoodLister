-- Migration: Security fixes for function search paths and RLS policies
-- Addresses Supabase database linter security warnings
-- Created: 2026-01-21

-- ==========================================
-- CREATE PROFILES TABLE (if not exists)
-- ==========================================

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL UNIQUE,
  display_name text,
  bio text,
  avatar_url text,
  website text,
  location text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  phone_number text,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create the get_user_profiles function after ensuring the table exists
DO $$
BEGIN
    -- Only create the function if the profiles table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
        -- Function to get user profiles for reviews (runs with service role to bypass RLS)
        CREATE OR REPLACE FUNCTION get_user_profiles(user_ids uuid[])
        RETURNS TABLE(user_id uuid, display_name text, avatar_url text)
        LANGUAGE sql
        SECURITY DEFINER
        SET search_path = 'pg_catalog, pg_temp'
        AS $func$
          SELECT p.user_id, p.display_name, p.avatar_url
          FROM public.profiles p
          WHERE p.user_id = ANY(user_ids);
        $func$;

        RAISE NOTICE 'Created get_user_profiles function';
    ELSE
        RAISE NOTICE 'Profiles table does not exist, skipping get_user_profiles function creation';
    END IF;
END $$;

-- ==========================================
-- FIX FUNCTION SEARCH PATHS
-- ==========================================

-- Fix search_path for existing functions found in migrations
CREATE OR REPLACE FUNCTION update_restaurant_rating()
RETURNS TRIGGER AS $$
BEGIN
    -- Set secure search path to prevent search path attacks
    SET search_path = 'pg_catalog, pg_temp';

    -- Update the restaurant's rating based on average of all reviews
    UPDATE restaurants
    SET rating = (
        SELECT AVG(rating)::numeric(3,2)
        FROM reviews
        WHERE restaurant_id = COALESCE(NEW.restaurant_id, OLD.restaurant_id)
    )
    WHERE id = COALESCE(NEW.restaurant_id, OLD.restaurant_id);

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION set_creator_fields()
RETURNS TRIGGER AS $$
BEGIN
    -- Set secure search path to prevent search path attacks
    SET search_path = 'pg_catalog, pg_temp';

    -- Set creator_id to current user if not provided
    IF NEW.creator_id IS NULL THEN
        NEW.creator_id := auth.uid();
    END IF;

    -- Set creator_name from auth.users metadata if not provided
    IF NEW.creator_name IS NULL THEN
        SELECT COALESCE(raw_user_meta_data->>'name', raw_user_meta_data->>'full_name', email)
        INTO NEW.creator_name
        FROM auth.users
        WHERE id = NEW.creator_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix search_path for functions detected by linter (may be created via dashboard)
-- These functions exist in the database but definitions not found in codebase

DO $$
BEGIN
    -- update_user_restaurant_visits_updated_at
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_user_restaurant_visits_updated_at' AND pronargs = 0) THEN
        EXECUTE 'ALTER FUNCTION update_user_restaurant_visits_updated_at() SET search_path = ''pg_catalog, pg_temp''';
        RAISE NOTICE 'Fixed search_path for update_user_restaurant_visits_updated_at';
    END IF;

    -- get_reviews_with_users
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_reviews_with_users' AND pronargs = 0) THEN
        EXECUTE 'ALTER FUNCTION get_reviews_with_users() SET search_path = ''pg_catalog, pg_temp''';
        RAISE NOTICE 'Fixed search_path for get_reviews_with_users';
    END IF;

    -- get_restaurant_review_count
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_restaurant_review_count' AND pronargs = 0) THEN
        EXECUTE 'ALTER FUNCTION get_restaurant_review_count() SET search_path = ''pg_catalog, pg_temp''';
        RAISE NOTICE 'Fixed search_path for get_restaurant_review_count';
    END IF;

    -- get_user_display_name
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_user_display_name' AND pronargs = 0) THEN
        EXECUTE 'ALTER FUNCTION get_user_display_name() SET search_path = ''pg_catalog, pg_temp''';
        RAISE NOTICE 'Fixed search_path for get_user_display_name';
    END IF;

    -- handle_new_user
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user' AND pronargs = 0) THEN
        EXECUTE 'ALTER FUNCTION handle_new_user() SET search_path = ''pg_catalog, pg_temp''';
        RAISE NOTICE 'Fixed search_path for handle_new_user';
    END IF;

    -- update_profile_updated_at
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_profile_updated_at' AND pronargs = 0) THEN
        EXECUTE 'ALTER FUNCTION update_profile_updated_at() SET search_path = ''pg_catalog, pg_temp''';
        RAISE NOTICE 'Fixed search_path for update_profile_updated_at';
    END IF;

    -- update_updated_at_column
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column' AND pronargs = 0) THEN
        EXECUTE 'ALTER FUNCTION update_updated_at_column() SET search_path = ''pg_catalog, pg_temp''';
        RAISE NOTICE 'Fixed search_path for update_updated_at_column';
    END IF;

    -- create_verified_users_table
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'create_verified_users_table' AND pronargs = 0) THEN
        EXECUTE 'ALTER FUNCTION create_verified_users_table() SET search_path = ''pg_catalog, pg_temp''';
        RAISE NOTICE 'Fixed search_path for create_verified_users_table';
    END IF;

    -- is_token_valid
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_token_valid' AND pronargs = 0) THEN
        EXECUTE 'ALTER FUNCTION is_token_valid() SET search_path = ''pg_catalog, pg_temp''';
        RAISE NOTICE 'Fixed search_path for is_token_valid';
    END IF;
END $$;

-- ==========================================
-- FIX OVERLY PERMISSIVE RLS POLICIES
-- ==========================================

-- Drop and recreate policies for cuisine_types table
DROP POLICY IF EXISTS "Permitir atualização de cuisine_types para usuários verifica" ON public.cuisine_types;
DROP POLICY IF EXISTS "Permitir exclusão de cuisine_types para usuários verificados" ON public.cuisine_types;
DROP POLICY IF EXISTS "Permitir inserção de cuisine_types para usuários verificados" ON public.cuisine_types;
DROP POLICY IF EXISTS "cuisine_types_authenticated_users" ON public.cuisine_types;
DROP POLICY IF EXISTS "cuisine_types_service_role" ON public.cuisine_types;

-- Allow authenticated users to manage cuisine types (for admin purposes)
CREATE POLICY "cuisine_types_authenticated_users" ON public.cuisine_types
    FOR ALL USING (auth.role() = 'authenticated' AND auth.uid() IS NOT NULL);

-- Service role can do everything
CREATE POLICY "cuisine_types_service_role" ON public.cuisine_types
    FOR ALL USING (auth.role() = 'service_role');

-- Drop and recreate policies for list_restaurants table
DROP POLICY IF EXISTS "Permitir atualização de list_restaurants para usuários verif" ON public.list_restaurants;
DROP POLICY IF EXISTS "Permitir exclusão de list_restaurants para usuários verificad" ON public.list_restaurants;
DROP POLICY IF EXISTS "Permitir inserção de list_restaurants para usuários verifica" ON public.list_restaurants;
DROP POLICY IF EXISTS "list_restaurants_own_lists" ON public.list_restaurants;
DROP POLICY IF EXISTS "list_restaurants_service_role" ON public.list_restaurants;

-- Users can manage list_restaurants entries for their own lists
CREATE POLICY "list_restaurants_own_lists" ON public.list_restaurants
    FOR ALL USING (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM lists
            WHERE lists.id = list_restaurants.list_id
            AND lists.creator_id = auth.uid()
        )
    );

-- Service role can do everything
CREATE POLICY "list_restaurants_service_role" ON public.list_restaurants
    FOR ALL USING (auth.role() = 'service_role');

-- Drop and recreate policies for lists table
DROP POLICY IF EXISTS "Permitir atualização de listas para usuários verificados" ON public.lists;
DROP POLICY IF EXISTS "Permitir exclusão de listas para usuários verificados" ON public.lists;
DROP POLICY IF EXISTS "Permitir inserção de listas para usuários verificados" ON public.lists;
DROP POLICY IF EXISTS "lists_user_ownership" ON public.lists;
DROP POLICY IF EXISTS "lists_service_role" ON public.lists;

-- Users can manage their own lists
CREATE POLICY "lists_user_ownership" ON public.lists
    FOR ALL USING (auth.role() = 'authenticated' AND auth.uid() = creator_id);

-- Service role can do everything
CREATE POLICY "lists_service_role" ON public.lists
    FOR ALL USING (auth.role() = 'service_role');

-- Drop and recreate policies for restaurant_cuisine_types table
DROP POLICY IF EXISTS "Permitir atualização de restaurant_cuisine_types para usuári" ON public.restaurant_cuisine_types;
DROP POLICY IF EXISTS "Permitir exclusão de restaurant_cuisine_types para usuários v" ON public.restaurant_cuisine_types;
DROP POLICY IF EXISTS "Permitir inserção de restaurant_cuisine_types para usuários " ON public.restaurant_cuisine_types;
DROP POLICY IF EXISTS "restaurant_cuisine_types_own_restaurants" ON public.restaurant_cuisine_types;
DROP POLICY IF EXISTS "restaurant_cuisine_types_service_role" ON public.restaurant_cuisine_types;

-- Users can manage restaurant_cuisine_types for their own restaurants
CREATE POLICY "restaurant_cuisine_types_own_restaurants" ON public.restaurant_cuisine_types
    FOR ALL USING (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM restaurants
            WHERE restaurants.id = restaurant_cuisine_types.restaurant_id
            AND restaurants.creator_id = auth.uid()
        )
    );

-- Service role can do everything
CREATE POLICY "restaurant_cuisine_types_service_role" ON public.restaurant_cuisine_types
    FOR ALL USING (auth.role() = 'service_role');

-- Drop and recreate policies for restaurants table
DROP POLICY IF EXISTS "Permitir atualização para usuários verificados" ON public.restaurants;
DROP POLICY IF EXISTS "Permitir exclusão para usuários verificados" ON public.restaurants;
DROP POLICY IF EXISTS "Permitir inserção para usuários verificados" ON public.restaurants;
DROP POLICY IF EXISTS "restaurants_user_ownership" ON public.restaurants;
DROP POLICY IF EXISTS "restaurants_service_role" ON public.restaurants;

-- Users can manage their own restaurants
CREATE POLICY "restaurants_user_ownership" ON public.restaurants
    FOR ALL USING (auth.role() = 'authenticated' AND auth.uid() = creator_id);

-- Service role can do everything
CREATE POLICY "restaurants_service_role" ON public.restaurants
    FOR ALL USING (auth.role() = 'service_role');

-- Fix the profiles table policy (it already has proper policies, but ensure they're correct)
DROP POLICY IF EXISTS "allow_all_for_now" ON public.profiles;

-- Recreate with proper user ownership (should already exist from migration 007, but ensure it's correct)
DROP POLICY IF EXISTS "Users can manage their own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Service role can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "profiles_read_public" ON public.profiles;
DROP POLICY IF EXISTS "profiles_user_ownership" ON public.profiles;
DROP POLICY IF EXISTS "profiles_service_role" ON public.profiles;

-- Allow authenticated users to read public profile information (display_name, avatar_url)
CREATE POLICY "profiles_read_public" ON public.profiles
    FOR SELECT USING (auth.role() = 'authenticated');

-- Users can manage their own profiles
CREATE POLICY "profiles_user_ownership" ON public.profiles
    FOR ALL USING (auth.uid() = user_id);

-- Service role can manage all profiles
CREATE POLICY "profiles_service_role" ON public.profiles
    FOR ALL USING (auth.role() = 'service_role');

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'Security migration completed successfully';
    RAISE NOTICE 'Fixed function search paths and replaced overly permissive RLS policies';
END $$;
