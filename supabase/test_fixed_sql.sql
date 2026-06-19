-- Test script to verify the fixed SQL works correctly
-- This tests the view creation and basic functionality

-- Test 1: Check if the view can be created without errors
DROP VIEW IF EXISTS restaurant_data_view_test CASCADE;

CREATE VIEW restaurant_data_view_test AS
SELECT 
    r.id,
    r.name,
    r.description,
    r.image_url,
    r.price_per_person,
    r.rating,
    r.location,
    r.source_url,
    r.creator,
    r.menu_url,
    r.visited,
    r.phone_numbers,
    r.creator_id,
    r.creator_name,
    r.created_at,
    r.images,
    r.display_image_index,
    r.menu_links,
    r.menu_images,
    r.latitude,
    r.longitude,
    -- Aggregate cuisine types as array
    COALESCE(
        ARRAY_AGG(DISTINCT ct.name) FILTER (WHERE ct.name IS NOT NULL),
        ARRAY[]::text[]
    ) AS cuisine_types,
    -- Aggregate dietary options as array
    COALESCE(
        ARRAY_AGG(DISTINCT dietary.name) FILTER (WHERE dietary.name IS NOT NULL),
        ARRAY[]::text[]
    ) AS dietary_options,
    -- Aggregate features as array
    COALESCE(
        ARRAY_AGG(DISTINCT rf.name) FILTER (WHERE rf.name IS NOT NULL),
        ARRAY[]::text[]
    ) AS features
FROM restaurants r
LEFT JOIN restaurant_cuisine_types rct ON r.id = rct.restaurant_id
LEFT JOIN cuisine_types ct ON rct.cuisine_type_id = ct.id
LEFT JOIN restaurant_dietary_options_junction rdoj ON r.id = rdoj.restaurant_id
LEFT JOIN restaurant_dietary_options dietary ON rdoj.dietary_option_id = dietary.id
LEFT JOIN restaurant_restaurant_features rrf ON r.id = rrf.restaurant_id
LEFT JOIN restaurant_features rf ON rrf.feature_id = rf.id
GROUP BY 
    r.id,
    r.name,
    r.description,
    r.image_url,
    r.price_per_person,
    r.rating,
    r.location,
    r.source_url,
    r.creator,
    r.menu_url,
    r.visited,
    r.phone_numbers,
    r.creator_id,
    r.creator_name,
    r.created_at,
    r.images,
    r.display_image_index,
    r.menu_links,
    r.menu_images,
    r.latitude,
    r.longitude;

-- Test 2: Verify the view returns data (limit to 3 rows for testing)
SELECT 
    id,
    name,
    creator_id,
    created_at,
    array_length(cuisine_types, 1) as cuisine_count,
    array_length(dietary_options, 1) as dietary_count,
    array_length(features, 1) as features_count
FROM restaurant_data_view_test 
LIMIT 3;

-- Test 3: Check that no updated_at column is referenced
-- This query should work without any "column does not exist" errors
SELECT 
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'restaurants' 
AND column_name IN ('created_at', 'updated_at')
ORDER BY column_name;

-- Test 4: Clean up test view
DROP VIEW IF EXISTS restaurant_data_view_test CASCADE;

-- If all tests pass, the SQL is ready to run!
-- The view should now work correctly without the "column r.updated_at does not exist" error