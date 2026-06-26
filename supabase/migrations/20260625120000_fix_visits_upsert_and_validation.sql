-- Migration: Fix user_restaurant_visits upsert and validation
-- Created: 2026-06-25

-- Step 1: Remove any duplicate rows (keep the most recent)
DELETE FROM public.user_restaurant_visits a
USING public.user_restaurant_visits b
WHERE a.user_id = b.user_id
  AND a.restaurant_id = b.restaurant_id
  AND a.created_at < b.created_at;

-- Step 2: Add FK constraint to restaurants if not exists
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

-- Step 3: Add index for efficient upsert lookup (if not exists)
CREATE INDEX IF NOT EXISTS idx_user_restaurant_visits_user_restaurant
  ON public.user_restaurant_visits(user_id, restaurant_id);

-- Step 4: Add trigger for updated_at (if not exists)
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

-- ROLLBACK:
-- DROP TRIGGER IF EXISTS trigger_update_visits_updated_at ON public.user_restaurant_visits;
-- DROP FUNCTION IF EXISTS update_visits_updated_at();
-- ALTER TABLE public.user_restaurant_visits DROP CONSTRAINT IF EXISTS user_restaurant_visits_restaurant_id_fk;
