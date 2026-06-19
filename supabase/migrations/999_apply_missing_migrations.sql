-- ============================================================================
-- CONSOLIDATED MIGRATION: Apply all missing columns from migrations 020, 037, 050
-- Run this in Supabase SQL Editor if any of the migrations were not applied.
-- Safe to run multiple times (IF NOT EXISTS / DO blocks handle idempotency).
-- ============================================================================

-- Migration 020: Add review_count to restaurants (computed via reviews table)
-- Note: review_count is better computed on-the-fly, but if your app expects it:
-- ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS review_count integer DEFAULT 0;

-- Migration 037: Create list_activities table
CREATE TABLE IF NOT EXISTS list_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id uuid REFERENCES lists(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  action text NOT NULL,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE list_activities ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'list_activities' AND policyname = 'Users can read list activities') THEN
    CREATE POLICY "Users can read list activities" ON list_activities FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'list_activities' AND policyname = 'Users can insert own activities') THEN
    CREATE POLICY "Users can insert own activities" ON list_activities FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Migration 050: Add missing columns to restaurants and lists
DO $$
BEGIN
  -- restaurants.updated_at
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'restaurants' AND column_name = 'updated_at') THEN
    ALTER TABLE restaurants ADD COLUMN updated_at timestamptz;
  END IF;
  -- restaurants.opening_hours
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'restaurants' AND column_name = 'opening_hours') THEN
    ALTER TABLE restaurants ADD COLUMN opening_hours text;
  END IF;
  -- restaurants.review_count (if not already added by migration 020)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'restaurants' AND column_name = 'review_count') THEN
    ALTER TABLE restaurants ADD COLUMN review_count integer DEFAULT 0;
  END IF;
  -- lists.updated_at
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lists' AND column_name = 'updated_at') THEN
    ALTER TABLE lists ADD COLUMN updated_at timestamptz;
  END IF;
END $$;

-- Backfill: set updated_at = created_at for existing rows
UPDATE restaurants SET updated_at = created_at WHERE updated_at IS NULL;
UPDATE lists SET updated_at = created_at WHERE updated_at IS NULL;
