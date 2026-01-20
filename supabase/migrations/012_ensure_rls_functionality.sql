-- Migration: Ensure RLS functionality for user_restaurant_visits
-- This migration ensures that RLS is properly configured and working

-- Check if RLS is enabled, if not enable it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'user_restaurant_visits'
        AND n.nspname = 'public'
        AND c.relrowsecurity = true
    ) THEN
        ALTER TABLE public.user_restaurant_visits ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS enabled for user_restaurant_visits table';
    ELSE
        RAISE NOTICE 'RLS already enabled for user_restaurant_visits table';
    END IF;
END $$;

-- Drop all existing policies to ensure clean state
DROP POLICY IF EXISTS "Users can manage their own visits" ON public.user_restaurant_visits;
DROP POLICY IF EXISTS "Service role can manage all visits" ON public.user_restaurant_visits;
DROP POLICY IF EXISTS "Users can view their own visits" ON public.user_restaurant_visits;
DROP POLICY IF EXISTS "Users can insert their own visits" ON public.user_restaurant_visits;
DROP POLICY IF EXISTS "Users can update their own visits" ON public.user_restaurant_visits;
DROP POLICY IF EXISTS "Users can delete their own visits" ON public.user_restaurant_visits;

-- Recreate policies with explicit names to ensure they exist
CREATE POLICY "users_view_own_visits" ON public.user_restaurant_visits
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_insert_own_visits" ON public.user_restaurant_visits
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_update_own_visits" ON public.user_restaurant_visits
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_delete_own_visits" ON public.user_restaurant_visits
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "service_role_manage_all_visits" ON public.user_restaurant_visits
    FOR ALL USING (auth.role() = 'service_role');

-- Verify the policies were created
DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE tablename = 'user_restaurant_visits' AND schemaname = 'public';

    RAISE NOTICE 'Created % policies for user_restaurant_visits table', policy_count;
END $$;
