-- =====================================================
-- FOODLISTER: Remove Visit Count System - Complete Migration
-- Created: 2026-06-25
-- Execute this in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- Migration 1: Fix visits upsert and validation
-- =====================================================

-- Remove any duplicate rows (keep the most recent)
DELETE FROM public.user_restaurant_visits a
USING public.user_restaurant_visits b
WHERE a.user_id = b.user_id
  AND a.restaurant_id = b.restaurant_id
  AND a.created_at < b.created_at;

-- Add FK constraint to restaurants if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'user_restaurant_visits_restaurant_id_fk'
    AND table_name = 'user_restaurant_visits'
  ) THEN
    ALTER TABLE public.user_restaurant_visits
      ADD CONSTRAINT user_restaurant_visits_restaurant_id_fk
      FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add index for efficient upsert lookup (if not exists)
CREATE INDEX IF NOT EXISTS idx_user_restaurant_visits_user_restaurant
  ON public.user_restaurant_visits(user_id, restaurant_id);

-- Add trigger for updated_at (if not exists)
CREATE OR REPLACE FUNCTION update_visits_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_visits_updated_at ON public.user_restaurant_visits;
CREATE TRIGGER trigger_update_visits_updated_at
  BEFORE UPDATE ON public.user_restaurant_visits
  FOR EACH ROW
  EXECUTE FUNCTION update_visits_updated_at();


-- =====================================================
-- Migration 2: Remove visit count system (triggers/view)
-- =====================================================

-- Drop triggers from migration 019
DROP TRIGGER IF EXISTS trigger_update_user_stats_visits ON public.user_restaurant_visits;
DROP TRIGGER IF EXISTS trigger_update_user_stats_delete_visits ON public.user_restaurant_visits;

-- Drop functions from migration 019
DROP FUNCTION IF EXISTS update_user_stats_on_visits();
DROP FUNCTION IF EXISTS update_user_stats_on_visits_delete();

-- Drop user_stats view (migration 017)
DROP VIEW IF EXISTS public.user_stats;


-- =====================================================
-- Migration 3: Remove visit table
-- =====================================================

DROP TABLE IF EXISTS public.user_restaurant_visits;


-- =====================================================
-- Migration 4: Remove visited columns
-- =====================================================

-- Drop dependent view first
DROP VIEW IF EXISTS public.restaurant_data_view;

-- Remove visited column from restaurants table
ALTER TABLE public.restaurants DROP COLUMN IF EXISTS visited;

-- Remove total_restaurants_visited column from profiles table
ALTER TABLE public.profiles DROP COLUMN IF EXISTS total_restaurants_visited;


-- =====================================================
-- Verification (optional - uncomment to check)
-- =====================================================

-- Check that columns are removed
-- SELECT column_name FROM information_schema.columns 
-- WHERE table_name = 'restaurants' AND column_name = 'visited';
-- Expected: 0 rows

-- SELECT column_name FROM information_schema.columns 
-- WHERE table_name = 'profiles' AND column_name = 'total_restaurants_visited';
-- Expected: 0 rows

-- Check that table is removed
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' AND table_name = 'user_restaurant_visits';
-- Expected: 0 rows

-- Check that view is removed
-- SELECT table_name FROM information_schema.views 
-- WHERE table_schema = 'public' AND table_name = 'restaurant_data_view';
-- Expected: 0 rows
