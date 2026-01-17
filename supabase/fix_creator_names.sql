-- Query to fix creator_name from email to "BMS"
-- Execute this in Supabase SQL Editor

-- Find user ID first
SELECT id, email FROM auth.users WHERE email = '1221514@isep.ipp.pt';

-- Replace USER_ID_HERE with the actual user ID from above query
-- Then execute the updates:

UPDATE restaurants
SET creator_name = 'BMS'
WHERE creator_id = 'USER_ID_HERE' AND creator_name = '1221514@isep.ipp.pt';

UPDATE lists
SET creator_name = 'BMS'
WHERE creator_id = 'USER_ID_HERE' AND creator_name = '1221514@isep.ipp.pt';

-- Verification
SELECT 'restaurants_fixed' as table_name, COUNT(*) as count
FROM restaurants
WHERE creator_id = 'USER_ID_HERE' AND creator_name = 'BMS'

UNION ALL

SELECT 'lists_fixed' as table_name, COUNT(*) as count
FROM lists
WHERE creator_id = 'USER_ID_HERE' AND creator_name = 'BMS';

-- Check if any still have the old name
SELECT 'restaurants_remaining' as table_name, COUNT(*) as count
FROM restaurants
WHERE creator_name = '1221514@isep.ipp.pt'

UNION ALL

SELECT 'lists_remaining' as table_name, COUNT(*) as count
FROM lists
WHERE creator_name = '1221514@isep.ipp.pt';
