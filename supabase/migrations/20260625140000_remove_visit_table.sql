-- Migration: Remove user_restaurant_visits table
-- Created: 2026-06-25

-- Step 1: Drop triggers that reference user_restaurant_visits
DROP TRIGGER IF EXISTS trigger_update_user_stats_visits ON public.user_restaurant_visits;
DROP TRIGGER IF EXISTS trigger_update_user_stats_delete_visits ON public.user_restaurant_visits;

-- Step 2: Drop functions
DROP FUNCTION IF EXISTS update_user_stats_on_visits();
DROP FUNCTION IF EXISTS update_user_stats_on_visits_delete();

-- Step 3: Drop user_stats view (references visits)
DROP VIEW IF EXISTS public.user_stats;

-- Step 4: Drop the table
DROP TABLE IF EXISTS public.user_restaurant_visits;

-- ROLLBACK:
-- Ver migration 000_create_core_tables.sql para recriar tabela
