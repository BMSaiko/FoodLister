-- Migration: Enable RLS and set policies for user_restaurant_visits table
-- Created: 2026-01-20

-- Enable Row Level Security (if not already enabled)
ALTER TABLE public.user_restaurant_visits ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies (in case any were created)
DROP POLICY IF EXISTS "Users can manage their own visits" ON public.user_restaurant_visits;
DROP POLICY IF EXISTS "Service role can manage all visits" ON public.user_restaurant_visits;
DROP POLICY IF EXISTS "Users can view their own visits" ON public.user_restaurant_visits;
DROP POLICY IF EXISTS "Users can insert their own visits" ON public.user_restaurant_visits;
DROP POLICY IF EXISTS "Users can update their own visits" ON public.user_restaurant_visits;
DROP POLICY IF EXISTS "Users can delete their own visits" ON public.user_restaurant_visits;

-- Create a single comprehensive policy for users to manage their own visits
CREATE POLICY "Users can manage their own visits" ON public.user_restaurant_visits
    FOR ALL USING (auth.uid() = user_id);

-- Allow service role to do everything (for admin operations)
CREATE POLICY "Service role can manage all visits" ON public.user_restaurant_visits
    FOR ALL USING (auth.role() = 'service_role');
