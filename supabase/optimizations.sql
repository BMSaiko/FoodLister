-- Database Performance Optimizations for FoodLister
-- This script adds indexes, views, and optimizations to improve API response times

-- ============================================================================
-- 1. ADD MISSING INDEXES FOR PERFORMANCE
-- ============================================================================

-- Index for efficient user restaurant queries (creator_id + created_at)
-- This is the most critical index for the slow API endpoint
CREATE INDEX IF NOT EXISTS idx_restaurants_creator_created_at 
ON restaurants(creator_id, created_at DESC);

-- Index for efficient user restaurant queries by ID (creator_id + id)
-- Used for cursor-based pagination
CREATE INDEX IF NOT EXISTS idx_restaurants_creator_id 
ON restaurants(creator_id, id);

-- Index for cuisine types lookup (frequently joined table)
CREATE INDEX IF NOT EXISTS idx_cuisine_types_name 
ON cuisine_types(name);

-- Index for dietary options lookup
CREATE INDEX IF NOT EXISTS idx_restaurant_dietary_options_name 
ON restaurant_dietary_options(name);

-- Index for restaurant features lookup
CREATE INDEX IF NOT EXISTS idx_restaurant_features_name 
ON restaurant_features(name);

-- Index for junction tables to improve JOIN performance
CREATE INDEX IF NOT EXISTS idx_restaurant_cuisine_types_restaurant_id 
ON restaurant_cuisine_types(restaurant_id);

CREATE INDEX IF NOT EXISTS idx_restaurant_dietary_junction_restaurant_id 
ON restaurant_dietary_options_junction(restaurant_id);

CREATE INDEX IF NOT EXISTS idx_restaurant_features_junction_restaurant_id 
ON restaurant_restaurant_features(restaurant_id);

-- Index for user profile queries (user_id_code lookup)
CREATE INDEX IF NOT EXISTS idx_profiles_user_id_code 
ON profiles(user_id_code);

-- Index for user authentication (user_id lookup)
CREATE INDEX IF NOT EXISTS idx_profiles_user_id 
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
        ARRAY_AGG(DISTINCT do.name) FILTER (WHERE do.name IS NOT NULL),
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
LEFT JOIN restaurant_dietary_options do ON rdoj.dietary_option_id = do.id
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

-- Create index on the view for faster queries (PostgreSQL doesn't support indexes on views directly,
-- but we can create indexes on the underlying tables that the view uses)

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
-- 6. PERFORMANCE MONITORING QUERIES
-- ============================================================================

-- Query to check index usage (run this periodically to verify indexes are being used)
-- SELECT 
--     schemaname,
--     tablename,
--     indexname,
--     idx_tup_read,
--     idx_tup_fetch
-- FROM pg_stat_user_indexes 
-- WHERE tablename IN ('restaurants', 'cuisine_types', 'restaurant_cuisine_types', 
--                     'restaurant_dietary_options', 'restaurant_dietary_options_junction',
--                     'restaurant_features', 'restaurant_restaurant_features', 'profiles')
-- ORDER BY idx_tup_read DESC;

-- Query to check slow queries (add this to your monitoring)
-- SELECT 
--     query,
--     calls,
--     total_time,
--     mean_time,
--     rows
-- FROM pg_stat_statements 
-- WHERE query LIKE '%restaurants%' 
-- ORDER BY mean_time DESC 
-- LIMIT 10;

-- ============================================================================
-- 7. CLEANUP OLD UNUSED INDEXES (if any exist)
-- ============================================================================

-- Remove any duplicate or unused indexes that might be slowing down writes
-- (Only run these if you're sure they're not needed)

-- Example cleanup queries (commented out - review before running):
-- DROP INDEX IF EXISTS idx_restaurants_creator_id_old;
-- DROP INDEX IF EXISTS idx_restaurants_created_at_old;

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