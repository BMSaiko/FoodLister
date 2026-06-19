-- Migration: Fix RLS policies for user_restaurant_visits table
-- Created: 2026-01-20

-- First, ensure the table exists
CREATE TABLE IF NOT EXISTS public.user_restaurant_visits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    restaurant_id UUID NOT NULL,
    visit_count INTEGER DEFAULT 0,
    visited BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, restaurant_id)
);

-- Enable Row Level Security
ALTER TABLE public.user_restaurant_visits ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can manage their own visits" ON public.user_restaurant_visits;
DROP POLICY IF EXISTS "Service role can manage all visits" ON public.user_restaurant_visits;
DROP POLICY IF EXISTS "Users can view their own visits" ON public.user_restaurant_visits;
DROP POLICY IF EXISTS "Users can insert their own visits" ON public.user_restaurant_visits;
DROP POLICY IF EXISTS "Users can update their own visits" ON public.user_restaurant_visits;
DROP POLICY IF EXISTS "Users can delete their own visits" ON public.user_restaurant_visits;

-- Create separate policies for different operations
-- SELECT policy: users can view their own visits
CREATE POLICY "Users can view their own visits" ON public.user_restaurant_visits
    FOR SELECT USING (auth.uid() = user_id);

-- INSERT policy: users can insert visits with their own user_id
CREATE POLICY "Users can insert their own visits" ON public.user_restaurant_visits
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- UPDATE policy: users can update their own visits
CREATE POLICY "Users can update their own visits" ON public.user_restaurant_visits
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- DELETE policy: users can delete their own visits
CREATE POLICY "Users can delete their own visits" ON public.user_restaurant_visits
    FOR DELETE USING (auth.uid() = user_id);

-- Allow service role to do everything (for admin operations)
CREATE POLICY "Service role can manage all visits" ON public.user_restaurant_visits
    FOR ALL USING (auth.role() = 'service_role');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_restaurant_visits_user_id ON public.user_restaurant_visits(user_id);
CREATE INDEX IF NOT EXISTS idx_user_restaurant_visits_restaurant_id ON public.user_restaurant_visits(restaurant_id);
