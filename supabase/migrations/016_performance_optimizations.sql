
-- === From: 021_performance_optimizations.sql ===
-- Migration: Performance Optimizations for FoodLister API
-- This migration adds indexes, views, and functions to improve API response times
-- Run this migration after the existing database setup

-- ============================================================================
-- 1. ADD MISSING INDEXES FOR PERFORMANCE
-- ============================================================================

-- Index for efficient user restaurant queries (creator_id + created_at)
-- This is the most critical index for the slow API endpoint
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_restaurants_creator_created_at 
ON restaurants(creator_id, created_at DESC);

-- Index for efficient user restaurant queries by ID (creator_id + id)
-- Used for cursor-based pagination
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_restaurants_creator_id 
ON restaurants(creator_id, id);

-- Index for cuisine types lookup (frequently joined table)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cuisine_types_name 
ON cuisine_types(name);

-- Index for dietary options lookup
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_restaurant_dietary_options_name 
ON restaurant_dietary_options(name);

-- Index for restaurant features lookup
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_restaurant_features_name 
ON restaurant_features(name);

-- Index for junction tables to improve JOIN performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_restaurant_cuisine_types_restaurant_id 
ON restaurant_cuisine_types(restaurant_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_restaurant_dietary_junction_restaurant_id 
ON restaurant_dietary_options_junction(restaurant_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_restaurant_features_junction_restaurant_id 
ON restaurant_restaurant_features(restaurant_id);

-- Index for user profile queries (user_id_code lookup)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_user_id_code 
ON profiles(user_id_code);

-- Index for user authentication (user_id lookup)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_user_id 
ON profiles(user_id);

-- ============================================================================
-- 2. CREATE OPTIMIZED VIEW FOR RESTAURANT DATA
-- ============================================================================

-- Drop existing view if it exists
DROP VIEW IF EXISTS restaurant_data_view CASCADE;

-- Create optimized view that pre-joins all restaurant data
-- This eliminates the N+1 query problem in the API
CREATE VIEW restaurant_data_view AS
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
    r.updated_at,
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
    r.updated_at,
    r.images,
    r.display_image_index,
    r.menu_links,
    r.menu_images,
    r.latitude,
    r.longitude;

-- ============================================================================
-- 3. CREATE FUNCTION FOR CURSOR-BASED PAGINATION
-- ============================================================================

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS get_user_restaurants_paginated(uuid, integer, uuid);

-- Create optimized function for cursor-based pagination
-- This eliminates the performance issues with OFFSET/LIMIT
CREATE OR REPLACE FUNCTION get_user_restaurants_paginated(
    p_user_id uuid,
    p_limit integer DEFAULT 12,
    p_cursor uuid DEFAULT NULL
)
RETURNS TABLE (
    id uuid,
    name text,
    description text,
    image_url text,
    price_per_person numeric,
    rating numeric,
    location text,
    source_url text,
    creator text,
    menu_url text,
    visited boolean,
    phone_numbers text[],
    creator_id uuid,
    creator_name text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    images text[],
    display_image_index integer,
    menu_links text[],
    menu_images text[],
    latitude numeric,
    longitude numeric,
    cuisine_types text[],
    dietary_options text[],
    features text[],
    total_count bigint,
    next_cursor uuid
) AS $$
BEGIN
    -- Return paginated results with cursor-based pagination
    RETURN QUERY
    WITH restaurant_data AS (
        SELECT 
            rdv.*,
            COUNT(*) OVER() as total_count,
            -- Get the next cursor (ID of the last item in current page)
            LEAD(rdv.id) OVER (ORDER BY rdv.created_at DESC, rdv.id DESC) as next_cursor_id
        FROM restaurant_data_view rdv
        WHERE rdv.creator_id = p_user_id
        AND (
            p_cursor IS NULL 
            OR rdv.created_at < (
                SELECT created_at FROM restaurants WHERE id = p_cursor
            ) 
            OR (
                rdv.created_at = (
                    SELECT created_at FROM restaurants WHERE id = p_cursor
                )
                AND rdv.id < p_cursor
            )
        )
        ORDER BY rdv.created_at DESC, rdv.id DESC
        LIMIT p_limit
    )
    SELECT 
        rd.id,
        rd.name,
        rd.description,
        rd.image_url,
        rd.price_per_person,
        rd.rating,
        rd.location,
        rd.source_url,
        rd.creator,
        rd.menu_url,
        rd.visited,
        rd.phone_numbers,
        rd.creator_id,
        rd.creator_name,
        rd.created_at,
        rd.updated_at,
        rd.images,
        rd.display_image_index,
        rd.menu_links,
        rd.menu_images,
        rd.latitude,
        rd.longitude,
        rd.cuisine_types,
        rd.dietary_options,
        rd.features,
        rd.total_count,
        rd.next_cursor_id
    FROM restaurant_data rd;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- 4. CREATE MATERIALIZED VIEW FOR FURTHER OPTIMIZATION
-- ============================================================================

-- Create materialized view for even better performance on frequently accessed data
-- This should be refreshed periodically (e.g., daily or hourly)
DROP MATERIALIZED VIEW IF EXISTS restaurant_data_materialized;

CREATE MATERIALIZED VIEW restaurant_data_materialized AS
SELECT * FROM restaurant_data_view;

-- Create index on materialized view for faster queries
CREATE INDEX idx_restaurant_data_materialized_creator_created_at 
ON restaurant_data_materialized(creator_id, created_at DESC);

-- ============================================================================
-- 5. ANALYZE TABLES FOR OPTIMIZED QUERY PLANS
-- ============================================================================

-- Update table statistics for the query planner
ANALYZE restaurants;
ANALYZE cuisine_types;
ANALYZE restaurant_cuisine_types;
ANALYZE restaurant_dietary_options;
ANALYZE restaurant_dietary_options_junction;
ANALYZE restaurant_features;
ANALYZE restaurant_restaurant_features;
ANALYZE profiles;

-- ============================================================================
-- 6. PERFORMANCE MONITORING SETUP
-- ============================================================================

-- Enable pg_stat_statements if not already enabled (requires restart)
-- This helps monitor query performance
-- CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Create a function to get restaurant created_at from ID (for cursor pagination)
CREATE OR REPLACE FUNCTION get_created_at_from_id(restaurant_id uuid)
RETURNS timestamp with time zone AS $$
BEGIN
    RETURN (SELECT created_at FROM restaurants WHERE id = restaurant_id);
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- USAGE NOTES:
-- ============================================================================

-- 1. To use the optimized view in your API:
--    SELECT * FROM restaurant_data_view WHERE creator_id = 'user-id' ORDER BY created_at DESC LIMIT 12;

-- 2. To use the cursor-based pagination function:
--    SELECT * FROM get_user_restaurants_paginated('user-id', 12, 'cursor-id');

-- 3. To refresh the materialized view (run this periodically):
--    REFRESH MATERIALIZED VIEW restaurant_data_materialized;

-- 4. Monitor performance with:
--    EXPLAIN ANALYZE SELECT * FROM restaurant_data_view WHERE creator_id = 'user-id' LIMIT 12;

-- 5. Check index usage:
--    SELECT * FROM pg_stat_user_indexes WHERE tablename = 'restaurants';

-- This optimization should reduce API response times from 2-3 seconds to under 500ms

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Log the migration completion
INSERT INTO schema_migrations (version) VALUES ('021_performance_optimizations') 
ON CONFLICT (version) DO NOTHING;

-- === From: 021_performance_optimizations_indexes.sql ===
-- Migration: Performance Optimizations - Indexes Only
-- This file contains only the CREATE INDEX CONCURRENTLY statements
-- Run each statement individually in Supabase SQL editor to avoid transaction block errors

-- Index for efficient user restaurant queries (creator_id + created_at)
-- This is the most critical index for the slow API endpoint
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_restaurants_creator_created_at 
ON restaurants(creator_id, created_at DESC);

-- Index for efficient user restaurant queries by ID (creator_id + id)
-- Used for cursor-based pagination
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_restaurants_creator_id 
ON restaurants(creator_id, id);

-- Index for cuisine types lookup (frequently joined table)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cuisine_types_name 
ON cuisine_types(name);

-- Index for dietary options lookup
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_restaurant_dietary_options_name 
ON restaurant_dietary_options(name);

-- Index for restaurant features lookup
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_restaurant_features_name 
ON restaurant_features(name);

-- Index for junction tables to improve JOIN performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_restaurant_cuisine_types_restaurant_id 
ON restaurant_cuisine_types(restaurant_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_restaurant_dietary_junction_restaurant_id 
ON restaurant_dietary_options_junction(restaurant_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_restaurant_features_junction_restaurant_id 
ON restaurant_restaurant_features(restaurant_id);

-- Index for user profile queries (user_id_code lookup)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_user_id_code 
ON profiles(user_id_code);

-- Index for user authentication (user_id lookup)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_user_id 
ON profiles(user_id);

-- === From: 021_performance_optimizations_objects.sql ===
-- Migration: Performance Optimizations - Views, Functions, and Objects
-- This file contains all non-index objects that can be run as a single transaction
-- Run this file AFTER all indexes have been created successfully

-- ============================================================================

-- Drop existing view if it exists
DROP VIEW IF EXISTS restaurant_data_view CASCADE;

-- Create optimized view that pre-joins all restaurant data
-- This eliminates the N+1 query problem in the API
CREATE VIEW restaurant_data_view AS
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

-- ============================================================================

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS get_user_restaurants_paginated(uuid, integer, uuid);

-- Create optimized function for cursor-based pagination
-- This eliminates the performance issues with OFFSET/LIMIT
CREATE OR REPLACE FUNCTION get_user_restaurants_paginated(
    p_user_id uuid,
    p_limit integer DEFAULT 12,
    p_cursor uuid DEFAULT NULL
)
RETURNS TABLE (
    id uuid,
    name text,
    description text,
    image_url text,
    price_per_person numeric,
    rating numeric,
    location text,
    source_url text,
    creator text,
    menu_url text,
    visited boolean,
    phone_numbers text[],
    creator_id uuid,
    creator_name text,
    created_at timestamp with time zone,
    images text[],
    display_image_index integer,
    menu_links text[],
    menu_images text[],
    latitude numeric,
    longitude numeric,
    cuisine_types text[],
    dietary_options text[],
    features text[],
    total_count bigint,
    next_cursor uuid
) AS $$
BEGIN
    -- Return paginated results with cursor-based pagination
    RETURN QUERY
    WITH restaurant_data AS (
        SELECT 
            rdv.*,
            COUNT(*) OVER() as total_count,
            -- Get the next cursor (ID of the last item in current page)
            LEAD(rdv.id) OVER (ORDER BY rdv.created_at DESC, rdv.id DESC) as next_cursor_id
        FROM restaurant_data_view rdv
        WHERE rdv.creator_id = p_user_id
        AND (
            p_cursor IS NULL 
            OR rdv.created_at < (
                SELECT r.created_at FROM restaurants r WHERE r.id = p_cursor
            ) 
            OR (
                rdv.created_at = (
                    SELECT r.created_at FROM restaurants r WHERE r.id = p_cursor
                )
                AND rdv.id < p_cursor
            )
        )
        ORDER BY rdv.created_at DESC, rdv.id DESC
        LIMIT p_limit
    )
    SELECT 
        rd.id,
        rd.name,
        rd.description,
        rd.image_url,
        rd.price_per_person,
        rd.rating,
        rd.location,
        rd.source_url,
        rd.creator,
        rd.menu_url,
        rd.visited,
        rd.phone_numbers,
        rd.creator_id,
        rd.creator_name,
        rd.created_at,
        rd.images,
        rd.display_image_index,
        rd.menu_links,
        rd.menu_images,
        rd.latitude,
        rd.longitude,
        rd.cuisine_types,
        rd.dietary_options,
        rd.features,
        rd.total_count,
        rd.next_cursor_id
    FROM restaurant_data rd;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================

-- Create materialized view for even better performance on frequently accessed data
-- This should be refreshed periodically (e.g., daily or hourly)
DROP MATERIALIZED VIEW IF EXISTS restaurant_data_materialized;

CREATE MATERIALIZED VIEW restaurant_data_materialized AS
SELECT * FROM restaurant_data_view;

-- Create index on materialized view for faster queries
CREATE INDEX idx_restaurant_data_materialized_creator_created_at 
ON restaurant_data_materialized(creator_id, created_at DESC);

-- ============================================================================

-- Update table statistics for the query planner
ANALYZE restaurants;
ANALYZE cuisine_types;
ANALYZE restaurant_cuisine_types;
ANALYZE restaurant_dietary_options;
ANALYZE restaurant_dietary_options_junction;
ANALYZE restaurant_features;
ANALYZE restaurant_restaurant_features;
ANALYZE profiles;

-- ============================================================================

-- Create a function to get restaurant created_at from ID (for cursor pagination)
CREATE OR REPLACE FUNCTION get_created_at_from_id(restaurant_id uuid)
RETURNS timestamp with time zone AS $$
BEGIN
    RETURN (SELECT created_at FROM restaurants WHERE id = restaurant_id);
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================

-- Create optimized function for user lists pagination
-- This eliminates the performance issues with OFFSET/LIMIT for lists
CREATE OR REPLACE FUNCTION get_user_lists_paginated(
    p_user_id uuid,
    p_limit integer DEFAULT 12,
    p_cursor uuid DEFAULT NULL
)
RETURNS TABLE (
    id uuid,
    name text,
    description text,
    creator text,
    creator_id uuid,
    creator_name text,
    filters jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    restaurant_count bigint,
    total_count bigint,
    next_cursor uuid
) AS $$
BEGIN
    -- Return paginated results with cursor-based pagination
    RETURN QUERY
    WITH list_data AS (
        SELECT 
            l.*,
            COUNT(lr.restaurant_id) as restaurant_count,
            COUNT(*) OVER() as total_count,
            -- Get the next cursor (ID of the last item in current page)
            LEAD(l.id) OVER (ORDER BY l.created_at DESC, l.id DESC) as next_cursor_id
        FROM lists l
        LEFT JOIN list_restaurants lr ON l.id = lr.list_id
        WHERE l.creator_id = p_user_id
        AND (
            p_cursor IS NULL 
            OR l.created_at < (
                SELECT created_at FROM lists WHERE id = p_cursor
            ) 
            OR (
                l.created_at = (
                    SELECT created_at FROM lists WHERE id = p_cursor
                )
                AND l.id < p_cursor
            )
        )
        GROUP BY l.id, l.name, l.description, l.creator, l.creator_id, l.creator_name, l.filters, l.created_at, l.updated_at
        ORDER BY l.created_at DESC, l.id DESC
        LIMIT p_limit
    )
    SELECT 
        ld.id,
        ld.name,
        ld.description,
        ld.creator,
        ld.creator_id,
        ld.creator_name,
        ld.filters,
        ld.created_at,
        ld.updated_at,
        ld.restaurant_count,
        ld.total_count,
        ld.next_cursor_id
    FROM list_data ld;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================

-- Create schema_migrations table if it doesn't exist (for migration tracking)
-- This table tracks which migrations have been run to prevent duplicate execution
CREATE TABLE IF NOT EXISTS schema_migrations (
    version text PRIMARY KEY,
    description text,
    installed_at timestamptz DEFAULT now(),
    success boolean DEFAULT true
);

-- Log the migration completion
INSERT INTO schema_migrations (version, description) 
VALUES ('021_performance_optimizations', 'Performance optimizations: indexes, views, and pagination functions') 
ON CONFLICT (version) DO UPDATE SET installed_at = now();

-- ============================================================================

-- Migration Complete
-- 
-- USAGE NOTES:
-- 1. To use the optimized view in your API:
--    SELECT * FROM restaurant_data_view WHERE creator_id = 'user-id' ORDER BY created_at DESC LIMIT 12;
--
-- 2. To use the cursor-based pagination function for restaurants:
--    SELECT * FROM get_user_restaurants_paginated('user-id', 12, 'cursor-id');
--
-- 3. To use the cursor-based pagination function for lists:
--    SELECT * FROM get_user_lists_paginated('user-id', 12, 'cursor-id');
--
-- 4. To refresh the materialized view (run this periodically):
--    REFRESH MATERIALIZED VIEW restaurant_data_materialized;
--
-- 5. Monitor performance with:
--    EXPLAIN ANALYZE SELECT * FROM restaurant_data_view WHERE creator_id = 'user-id' LIMIT 12;
--
-- 6. Check index usage:
--    SELECT * FROM pg_stat_user_indexes WHERE tablename = 'restaurants';
--
-- This optimization should reduce API response times from 2-3 seconds to under 500ms


-- === From: 021_performance_verification.sql ===
-- Performance Verification and Monitoring Script
-- Run this after completing the migration to verify everything is working correctly

-- ============================================================================

-- 1. VERIFY INDEXES WERE CREATED SUCCESSFULLY
-- Check that all indexes exist and are properly configured
SELECT 
    indexname as "Index Name",
    tablename as "Table Name",
    indexdef as "Index Definition"
FROM pg_indexes 
WHERE indexname LIKE 'idx_%'
AND tablename IN ('restaurants', 'cuisine_types', 'restaurant_cuisine_types', 
                 'restaurant_dietary_options', 'restaurant_dietary_options_junction',
                 'restaurant_features', 'restaurant_restaurant_features', 'profiles')
ORDER BY tablename, indexname;

-- ============================================================================

-- 2. VERIFY VIEWS AND FUNCTIONS WERE CREATED
-- Check that the view and function exist
SELECT 
    'restaurant_data_view' as object_name,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'restaurant_data_view') 
         THEN 'EXISTS' ELSE 'MISSING' END as status
UNION ALL
SELECT 
    'restaurant_data_materialized' as object_name,
    CASE WHEN EXISTS (SELECT 1 FROM pg_matviews WHERE matviewname = 'restaurant_data_materialized') 
         THEN 'EXISTS' ELSE 'MISSING' END as status
UNION ALL
SELECT 
    'get_user_restaurants_paginated' as object_name,
    CASE WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_user_restaurants_paginated') 
         THEN 'EXISTS' ELSE 'MISSING' END as status
UNION ALL
SELECT 
    'get_created_at_from_id' as object_name,
    CASE WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_created_at_from_id') 
         THEN 'EXISTS' ELSE 'MISSING' END as status;

-- ============================================================================

-- 3. TEST THE OPTIMIZED VIEW
-- Verify the view returns data correctly (limit to 5 rows for testing)
SELECT 
    id,
    name,
    creator_id,
    created_at,
    array_length(cuisine_types, 1) as cuisine_count,
    array_length(dietary_options, 1) as dietary_count,
    array_length(features, 1) as features_count
FROM restaurant_data_view 
LIMIT 5;

-- ============================================================================

-- 4. TEST THE PAGINATION FUNCTION
-- Test the pagination function (replace 'your-user-id-here' with an actual user ID)
-- Note: This will fail if no user exists, but shows the function structure
-- SELECT * FROM get_user_restaurants_paginated('your-user-id-here', 5) LIMIT 5;

-- ============================================================================

-- 5. PERFORMANCE TESTING QUERIES
-- Test query performance with EXPLAIN ANALYZE (these are examples, uncomment to run)

-- Test basic view query performance:
-- EXPLAIN ANALYZE SELECT * FROM restaurant_data_view WHERE creator_id = 'your-user-id-here' ORDER BY created_at DESC LIMIT 12;

-- Test index usage:
-- EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM restaurants WHERE creator_id = 'your-user-id-here' ORDER BY created_at DESC LIMIT 12;

-- ============================================================================

-- 6. INDEX USAGE MONITORING
-- Check if indexes are being used (requires pg_stat_statements extension)
-- Uncomment if pg_stat_statements is available:
-- SELECT 
--     schemaname,
--     tablename,
--     indexname,
--     idx_tup_read,
--     idx_tup_fetch,
--     idx_tup_read + idx_tup_fetch as total_usage
-- FROM pg_stat_user_indexes 
-- WHERE tablename IN ('restaurants', 'cuisine_types', 'profiles')
-- ORDER BY total_usage DESC;

-- ============================================================================

-- 7. TABLE STATISTICS
-- Check table sizes and row counts
SELECT 
    schemaname,
    relname as tablename,
    n_tup_ins as inserts,
    n_tup_upd as updates,
    n_tup_del as deletes,
    n_live_tup as live_tuples,
    n_dead_tup as dead_tuples
FROM pg_stat_user_tables 
WHERE relname IN ('restaurants', 'cuisine_types', 'restaurant_cuisine_types', 
                   'restaurant_dietary_options', 'restaurant_dietary_options_junction',
                   'restaurant_features', 'restaurant_restaurant_features', 'profiles')
ORDER BY n_live_tup DESC;

-- ============================================================================

-- 8. MIGRATION STATUS CHECK
-- Verify the migration was logged correctly
SELECT 
    version,
    description,
    installed_at,
    success
FROM schema_migrations 
WHERE version = '021_performance_optimizations'
ORDER BY installed_at DESC;

-- ============================================================================

-- 9. PERFORMANCE RECOMMENDATIONS
-- This query helps identify potential performance issues
SELECT 
    'Check if indexes are being used effectively' as recommendation,
    'Run: SELECT * FROM pg_stat_user_indexes WHERE idx_tup_read = 0 AND idx_tup_fetch = 0;' as action
UNION ALL
SELECT 
    'Monitor slow queries',
    'Enable pg_stat_statements and check queries with high mean_time'
UNION ALL
SELECT 
    'Consider refreshing materialized view',
    'Run: REFRESH MATERIALIZED VIEW restaurant_data_materialized; (schedule daily)'
UNION ALL
SELECT 
    'Check for table bloat',
    'Monitor n_dead_tup vs n_live_tup ratios in pg_stat_user_tables';

-- ============================================================================

-- 10. MANUAL MAINTENANCE COMMANDS
-- Run these commands separately (outside of transactions) for optimal performance:
-- VACUUM ANALYZE restaurants;
-- VACUUM ANALYZE cuisine_types;
-- VACUUM ANALYZE restaurant_cuisine_types;
-- VACUUM ANALYZE restaurant_dietary_options;
-- VACUUM ANALYZE restaurant_dietary_options_junction;
-- VACUUM ANALYZE restaurant_features;
-- VACUUM ANALYZE restaurant_restaurant_features;
-- VACUUM ANALYZE profiles;

-- ============================================================================

-- MIGRATION VERIFICATION COMPLETE
-- 
-- If all checks pass, your performance optimization migration is complete!
-- 
-- Expected improvements:
-- - API response times: 2-3 seconds → under 500ms
-- - Eliminated N+1 query problems
-- - Efficient cursor-based pagination
-- - Improved JOIN performance

