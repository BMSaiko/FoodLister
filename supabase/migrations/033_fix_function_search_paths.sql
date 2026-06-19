-- Migration: Fix Function Search Path Security
-- Addresses Supabase Database Linter warnings:
--   - function_search_path_mutable (19 functions)
-- Created: 2026-04-08

-- ==========================================
-- FIX SEARCH PATH FOR ALL FUNCTIONS
-- ==========================================

-- Use DO blocks to safely update search_path only if function exists
DO $$
BEGIN
    -- 1. update_filter_presets_updated_at (filter_presets table trigger)
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_filter_presets_updated_at' AND pronargs = 0) THEN
        EXECUTE 'ALTER FUNCTION public.update_filter_presets_updated_at() SET search_path = ''pg_catalog, pg_temp''';
        RAISE NOTICE 'Fixed search_path for update_filter_presets_updated_at';
    END IF;

    -- 2. exec_sql (migration 028)
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'exec_sql' AND pronargs = 1) THEN
        EXECUTE 'ALTER FUNCTION public.exec_sql(text) SET search_path = ''pg_catalog, pg_temp''';
        RAISE NOTICE 'Fixed search_path for exec_sql';
    END IF;

    -- 3. update_scheduled_meals_updated_at (migration 030)
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_scheduled_meals_updated_at' AND pronargs = 0) THEN
        EXECUTE 'ALTER FUNCTION public.update_scheduled_meals_updated_at() SET search_path = ''pg_catalog, pg_temp''';
        RAISE NOTICE 'Fixed search_path for update_scheduled_meals_updated_at';
    END IF;

    -- 4. get_reviews_with_users (migration 013)
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_reviews_with_users' AND pronargs = 0) THEN
        EXECUTE 'ALTER FUNCTION public.get_reviews_with_users() SET search_path = ''pg_catalog, pg_temp''';
        RAISE NOTICE 'Fixed search_path for get_reviews_with_users';
    END IF;

    -- 5. update_restaurant_city_name (may be created via dashboard)
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_restaurant_city_name' AND pronargs = 0) THEN
        EXECUTE 'ALTER FUNCTION public.update_restaurant_city_name() SET search_path = ''pg_catalog, pg_temp''';
        RAISE NOTICE 'Fixed search_path for update_restaurant_city_name';
    END IF;

    -- 6. update_notifications_updated_at (migration 031)
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_notifications_updated_at' AND pronargs = 0) THEN
        EXECUTE 'ALTER FUNCTION public.update_notifications_updated_at() SET search_path = ''pg_catalog, pg_temp''';
        RAISE NOTICE 'Fixed search_path for update_notifications_updated_at';
    END IF;

    -- 7. generate_user_id_code (migration 018)
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'generate_user_id_code' AND pronargs = 0) THEN
        EXECUTE 'ALTER FUNCTION public.generate_user_id_code() SET search_path = ''pg_catalog, pg_temp''';
        RAISE NOTICE 'Fixed search_path for generate_user_id_code';
    END IF;

    -- 8. get_user_stats(migration 017)
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_user_stats' AND pronargs = 1) THEN
        EXECUTE 'ALTER FUNCTION public.get_user_stats(user_uuid uuid) SET search_path = ''pg_catalog, pg_temp''';
        RAISE NOTICE 'Fixed search_path for get_user_stats';
    END IF;

    -- 9. update_user_stats_delete (migration 019)
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_user_stats_delete' AND pronargs = 0) THEN
        EXECUTE 'ALTER FUNCTION public.update_user_stats_delete() SET search_path = ''pg_catalog, pg_temp''';
        RAISE NOTICE 'Fixed search_path for update_user_stats_delete';
    END IF;

    -- 10. get_restaurant_review_count (migration 013)
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_restaurant_review_count' AND pronargs = 1) THEN
        EXECUTE 'ALTER FUNCTION public.get_restaurant_review_count(p_restaurant_id uuid) SET search_path = ''pg_catalog, pg_temp''';
        RAISE NOTICE 'Fixed search_path for get_restaurant_review_count';
    END IF;

    -- 11. update_restaurant_rating (migration 003 & 013)
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_restaurant_rating' AND pronargs = 0) THEN
        EXECUTE 'ALTER FUNCTION public.update_restaurant_rating() SET search_path = ''pg_catalog, pg_temp''';
        RAISE NOTICE 'Fixed search_path for update_restaurant_rating';
    END IF;

    -- 12. get_user_display_name (migration 013)
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_user_display_name' AND pronargs = 1) THEN
        EXECUTE 'ALTER FUNCTION public.get_user_display_name(p_user_id uuid) SET search_path = ''pg_catalog, pg_temp''';
        RAISE NOTICE 'Fixed search_path for get_user_display_name';
    END IF;

    -- 13. set_creator_fields (migration 001)
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'set_creator_fields' AND pronargs = 0) THEN
        EXECUTE 'ALTER FUNCTION public.set_creator_fields() SET search_path = ''pg_catalog, pg_temp''';
        RAISE NOTICE 'Fixed search_path for set_creator_fields';
    END IF;

    -- 14. is_token_valid (migration 013)
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_token_valid' AND pronargs = 0) THEN
        EXECUTE 'ALTER FUNCTION public.is_token_valid() SET search_path = ''pg_catalog, pg_temp''';
        RAISE NOTICE 'Fixed search_path for is_token_valid';
    END IF;

    -- 15. update_user_stats (migration 019)
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_user_stats' AND pronargs = 0) THEN
        EXECUTE 'ALTER FUNCTION public.update_user_stats() SET search_path = ''pg_catalog, pg_temp''';
        RAISE NOTICE 'Fixed search_path for update_user_stats';
    END IF;

    -- 16. update_user_search_index (migration 018)
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_user_search_index' AND pronargs = 0) THEN
        EXECUTE 'ALTER FUNCTION public.update_user_search_index() SET search_path = ''pg_catalog, pg_temp''';
        RAISE NOTICE 'Fixed search_path for update_user_search_index';
    END IF;

    -- 17. get_created_at_from_id (migration 021)
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_created_at_from_id' AND pronargs = 1) THEN
        EXECUTE 'ALTER FUNCTION public.get_created_at_from_id(restaurant_id uuid) SET search_path = ''pg_catalog, pg_temp''';
        RAISE NOTICE 'Fixed search_path for get_created_at_from_id';
    END IF;

    -- 18. get_user_restaurants_paginated (migration 021)
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_user_restaurants_paginated' AND pronargs BETWEEN 1 AND 3) THEN
        EXECUTE 'ALTER FUNCTION public.get_user_restaurants_paginated(uuid, integer, uuid) SET search_path = ''pg_catalog, pg_temp''';
        RAISE NOTICE 'Fixed search_path for get_user_restaurants_paginated';
    END IF;

    -- 19. insert_filter_preset (listed in linter)
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'insert_filter_preset' AND pronargs = 3) THEN
        EXECUTE 'ALTER FUNCTION public.insert_filter_preset(text, jsonb, uuid) SET search_path = ''pg_catalog, pg_temp''';
        RAISE NOTICE 'Fixed search_path for insert_filter_preset';
    END IF;

    -- 20. immutable_unaccent (pg_trgm extension function)
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'immutable_unaccent' AND pronargs = 1) THEN
        EXECUTE 'ALTER FUNCTION public.immutable_unaccent(text) SET search_path = ''pg_catalog, pg_temp''';
        RAISE NOTICE 'Fixed search_path for immutable_unaccent';
    END IF;

    RAISE NOTICE 'All available function search paths fixed (20 functions checked)';
END $$;

-- Log migration completion
INSERT INTO schema_migrations (version) VALUES ('033_fix_function_search_paths')
ON CONFLICT (version) DO NOTHING;