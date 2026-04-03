-- Database Cleanup Script to Fix Duplicate Review IDs and Restaurant Creator Issues
-- Run this in your Supabase SQL Editor

-- 1. Check for duplicate review IDs
SELECT id, COUNT(*) as duplicate_count
FROM reviews 
GROUP BY id 
HAVING COUNT(*) > 1;

-- 2. Check for reviews with duplicate restaurant_id + user_id combinations
SELECT restaurant_id, user_id, COUNT(*) as duplicate_count
FROM reviews 
GROUP BY restaurant_id, user_id 
HAVING COUNT(*) > 1;

-- 3. Check restaurant records for missing creator_id
SELECT id, name, creator_id, creator_name 
FROM restaurants 
WHERE creator_id IS NULL;

-- 4. Fix duplicate review IDs by deleting duplicates and keeping the most recent one
WITH duplicates AS (
    SELECT id, restaurant_id, user_id, created_at,
           ROW_NUMBER() OVER (PARTITION BY restaurant_id, user_id ORDER BY created_at DESC) as rn
    FROM reviews
)
DELETE FROM reviews 
WHERE id IN (
    SELECT id FROM duplicates WHERE rn > 1
);

-- 5. Add proper unique constraint if it doesn't exist (using DO block for safety)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE c.contype = 'u'
      AND t.relname = 'reviews'
      AND n.nspname = 'public'
      AND (SELECT array_agg(att.attname ORDER BY s.attnum)::text[]
           FROM unnest(c.conkey) WITH ORDINALITY AS s(attnum, ord)
           JOIN pg_attribute att ON att.attrelid = t.oid AND att.attnum = s.attnum
          ) = ARRAY['restaurant_id','user_id']::text[]
  ) THEN
    ALTER TABLE public.reviews
      ADD CONSTRAINT reviews_unique_user_restaurant UNIQUE (restaurant_id, user_id);
  END IF;
END$$;

-- 6. Check current user ID (replace with actual user ID)
-- SELECT auth.uid();

-- 7. Update restaurant creator_id if needed (replace 'YOUR_RESTAURANT_ID' and 'YOUR_USER_ID')
-- UPDATE restaurants 
-- SET creator_id = 'YOUR_USER_ID', creator_name = 'Your Display Name'
-- WHERE id = 'YOUR_RESTAURANT_ID' AND (creator_id IS NULL OR creator_id = '');

-- 8. Verify the fixes
SELECT 'Reviews after cleanup:' as status, COUNT(*) as total_reviews FROM reviews;
SELECT 'Unique restaurant-user combinations:' as status, COUNT(*) as unique_combinations FROM (SELECT DISTINCT restaurant_id, user_id FROM reviews) as unique_reviews;
SELECT 'Restaurants with creator_id:' as status, COUNT(*) as with_creator FROM restaurants WHERE creator_id IS NOT NULL;
