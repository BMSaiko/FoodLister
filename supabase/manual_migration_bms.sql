-- Manual migration script: Associate BMS user data
-- Execute this in Supabase SQL Editor after user creation

-- Step 1: Find the BMS user ID
SELECT id, email, raw_user_meta_data FROM auth.users WHERE email = '1221514@isep.ipp.pt';

-- Step 2: Update user display name to "BMS"
-- Replace USER_ID_HERE with the actual user ID from step 1
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{name}',
    '"BMS"'
)
WHERE id = 'USER_ID_HERE';

-- Step 3: Migrate restaurants created by "BMS"
UPDATE restaurants
SET creator_id = 'USER_ID_HERE',
    creator_name = 'BMS'
WHERE creator = 'BMS';

-- Step 4: Migrate lists created by "BMS"
UPDATE lists
SET creator_id = 'USER_ID_HERE',
    creator_name = 'BMS'
WHERE creator = 'BMS';

-- Verification queries:
SELECT COUNT(*) as restaurants_associated FROM restaurants WHERE creator_id = 'USER_ID_HERE';
SELECT COUNT(*) as lists_associated FROM lists WHERE creator_id = 'USER_ID_HERE';

-- Check if migration was complete:
SELECT COUNT(*) as unmigrated_restaurants FROM restaurants WHERE creator = 'BMS' AND creator_id IS NULL;
SELECT COUNT(*) as unmigrated_lists FROM lists WHERE creator = 'BMS' AND creator_id IS NULL;
