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
