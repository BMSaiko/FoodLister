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
