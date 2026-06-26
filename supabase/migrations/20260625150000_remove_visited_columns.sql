-- Migration: Remove visited column from restaurants and total_restaurants_visited from profiles
-- Created: 2026-06-25

-- Step 1: Drop dependent view first
DROP VIEW IF EXISTS public.restaurant_data_view;

-- Step 2: Remove visited column from restaurants table
ALTER TABLE public.restaurants DROP COLUMN IF EXISTS visited;

-- Step 3: Remove total_restaurants_visited column from profiles table
ALTER TABLE public.profiles DROP COLUMN IF EXISTS total_restaurants_visited;

-- ROLLBACK:
-- ALTER TABLE public.restaurants ADD COLUMN visited boolean DEFAULT false;
-- ALTER TABLE public.profiles ADD COLUMN total_restaurants_visited integer DEFAULT 0;
-- CREATE VIEW restaurant_data_view AS ... (ver definição original)
