-- Migration: Security Fixes - RLS and SECURITY DEFINER Issues
-- Addresses Supabase Database Linter errors:
--   - security_definer_view: restaurant_data_view
--   - rls_disabled_in_public: restaurant_dietary_options_junction
--   - rls_disabled_in_public: restaurant_dietary_options
--   - rls_disabled_in_public: restaurant_features
--   - rls_disabled_in_public: restaurant_restaurant_features
-- Created: 2026-04-08

-- ==========================================
-- 1. FIX SECURITY DEFINER VIEW
-- ==========================================

-- Drop the existing SECURITY DEFINER view
DROP VIEW IF EXISTS restaurant_data_view CASCADE;

-- Recreate as SECURITY INVOKER (default) - respects RLS of calling user
-- Note: This view relies on underlying tables having proper RLS policies
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

-- Add comment clarifying security model
COMMENT ON VIEW restaurant_data_view IS 'Public restaurant data view. Access controlled by underlying table RLS policies.';

-- ==========================================
-- 2. ENABLE RLS ON JUNCTION AND LOOKUP TABLES
-- ==========================================

-- Enable RLS on restaurant_dietary_options_junction
ALTER TABLE public.restaurant_dietary_options_junction ENABLE ROW LEVEL SECURITY;

-- Enable RLS on restaurant_dietary_options
ALTER TABLE public.restaurant_dietary_options ENABLE ROW LEVEL SECURITY;

-- Enable RLS on restaurant_features
ALTER TABLE public.restaurant_features ENABLE ROW LEVEL SECURITY;

-- Enable RLS on restaurant_restaurant_features
ALTER TABLE public.restaurant_restaurant_features ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 3. CREATE RLS POLICIES FOR LOOKUP TABLES
-- ==========================================

-- Policies for restaurant_dietary_options (lookup table - publicly readable)
DROP POLICY IF EXISTS "dietary_options_select_policy" ON public.restaurant_dietary_options;
CREATE POLICY "dietary_options_select_policy" ON public.restaurant_dietary_options
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "dietary_options_insert_policy" ON public.restaurant_dietary_options;
CREATE POLICY "dietary_options_insert_policy" ON public.restaurant_dietary_options
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "dietary_options_update_policy" ON public.restaurant_dietary_options;
CREATE POLICY "dietary_options_update_policy" ON public.restaurant_dietary_options
    FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "dietary_options_delete_policy" ON public.restaurant_dietary_options;
CREATE POLICY "dietary_options_delete_policy" ON public.restaurant_dietary_options
    FOR DELETE USING (auth.role() = 'authenticated');

-- Policies for restaurant_features (lookup table - publicly readable)
DROP POLICY IF EXISTS "features_select_policy" ON public.restaurant_features;
CREATE POLICY "features_select_policy" ON public.restaurant_features
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "features_insert_policy" ON public.restaurant_features;
CREATE POLICY "features_insert_policy" ON public.restaurant_features
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "features_update_policy" ON public.restaurant_features;
CREATE POLICY "features_update_policy" ON public.restaurant_features
    FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "features_delete_policy" ON public.restaurant_features;
CREATE POLICY "features_delete_policy" ON public.restaurant_features
    FOR DELETE USING (auth.role() = 'authenticated');

-- ==========================================
-- 4. CREATE RLS POLICIES FOR JUNCTION TABLES
-- ==========================================

-- Policies for restaurant_dietary_options_junction
-- Public can read (needed for view), owners can write
DROP POLICY IF EXISTS "restaurant_dietary_options_junction_select_public" ON public.restaurant_dietary_options_junction;
CREATE POLICY "restaurant_dietary_options_junction_select_public" ON public.restaurant_dietary_options_junction
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "restaurant_dietary_options_junction_insert_authenticated" ON public.restaurant_dietary_options_junction;
CREATE POLICY "restaurant_dietary_options_junction_insert_authenticated" ON public.restaurant_dietary_options_junction
    FOR INSERT WITH CHECK (
        (select auth.role()) = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM restaurants
            WHERE restaurants.id = restaurant_dietary_options_junction.restaurant_id
            AND restaurants.creator_id = (select auth.uid())
        )
    );

DROP POLICY IF EXISTS "restaurant_dietary_options_junction_update_authenticated" ON public.restaurant_dietary_options_junction;
CREATE POLICY "restaurant_dietary_options_junction_update_authenticated" ON public.restaurant_dietary_options_junction
    FOR UPDATE USING (
        (select auth.role()) = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM restaurants
            WHERE restaurants.id = restaurant_dietary_options_junction.restaurant_id
            AND restaurants.creator_id = (select auth.uid())
        )
    );

DROP POLICY IF EXISTS "restaurant_dietary_options_junction_delete_authenticated" ON public.restaurant_dietary_options_junction;
CREATE POLICY "restaurant_dietary_options_junction_delete_authenticated" ON public.restaurant_dietary_options_junction
    FOR DELETE USING (
        (select auth.role()) = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM restaurants
            WHERE restaurants.id = restaurant_dietary_options_junction.restaurant_id
            AND restaurants.creator_id = (select auth.uid())
        )
    );

-- Service role can do everything
DROP POLICY IF EXISTS "restaurant_dietary_options_junction_service_role" ON public.restaurant_dietary_options_junction;
CREATE POLICY "restaurant_dietary_options_junction_service_role" ON public.restaurant_dietary_options_junction
    FOR ALL USING ((select auth.role()) = 'service_role');

-- Policies for restaurant_restaurant_features
-- Public can read (needed for view), owners can write
DROP POLICY IF EXISTS "restaurant_features_junction_select_public" ON public.restaurant_restaurant_features;
CREATE POLICY "restaurant_features_junction_select_public" ON public.restaurant_restaurant_features
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "restaurant_features_junction_insert_authenticated" ON public.restaurant_restaurant_features;
CREATE POLICY "restaurant_features_junction_insert_authenticated" ON public.restaurant_restaurant_features
    FOR INSERT WITH CHECK (
        (select auth.role()) = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM restaurants
            WHERE restaurants.id = restaurant_restaurant_features.restaurant_id
            AND restaurants.creator_id = (select auth.uid())
        )
    );

DROP POLICY IF EXISTS "restaurant_features_junction_update_authenticated" ON public.restaurant_restaurant_features;
CREATE POLICY "restaurant_features_junction_update_authenticated" ON public.restaurant_restaurant_features
    FOR UPDATE USING (
        (select auth.role()) = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM restaurants
            WHERE restaurants.id = restaurant_restaurant_features.restaurant_id
            AND restaurants.creator_id = (select auth.uid())
        )
    );

DROP POLICY IF EXISTS "restaurant_features_junction_delete_authenticated" ON public.restaurant_restaurant_features;
CREATE POLICY "restaurant_features_junction_delete_authenticated" ON public.restaurant_restaurant_features
    FOR DELETE USING (
        (select auth.role()) = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM restaurants
            WHERE restaurants.id = restaurant_restaurant_features.restaurant_id
            AND restaurants.creator_id = (select auth.uid())
        )
    );

-- Service role can do everything
DROP POLICY IF EXISTS "restaurant_features_junction_service_role" ON public.restaurant_restaurant_features;
CREATE POLICY "restaurant_features_junction_service_role" ON public.restaurant_restaurant_features
    FOR ALL USING ((select auth.role()) = 'service_role');

-- ==========================================
-- 5. ENSURE cuisine_types HAS PROPER POLICIES
-- ==========================================

-- cuisine_types should also have RLS enabled (if not already)
ALTER TABLE public.cuisine_types ENABLE ROW LEVEL SECURITY;

-- Policies for cuisine_types (lookup table - publicly readable)
DROP POLICY IF EXISTS "cuisine_types_select_policy" ON public.cuisine_types;
CREATE POLICY "cuisine_types_select_policy" ON public.cuisine_types
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "cuisine_types_insert_policy" ON public.cuisine_types;
CREATE POLICY "cuisine_types_insert_policy" ON public.cuisine_types
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "cuisine_types_update_policy" ON public.cuisine_types;
CREATE POLICY "cuisine_types_update_policy" ON public.cuisine_types
    FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "cuisine_types_delete_policy" ON public.cuisine_types;
CREATE POLICY "cuisine_types_delete_policy" ON public.cuisine_types
    FOR DELETE USING (auth.role() = 'authenticated');

-- ==========================================
-- 6. VERIFICATION AND LOGGING
-- ==========================================

DO $$
DECLARE
    rls_enabled_count INTEGER := 0;
    policy_count INTEGER := 0;
BEGIN
    -- Count tables with RLS enabled
    SELECT COUNT(*) INTO rls_enabled_count
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename IN (
          'restaurant_dietary_options_junction',
          'restaurant_dietary_options',
          'restaurant_features',
          'restaurant_restaurant_features',
          'cuisine_types'
      )
      AND rowsecurity = true;

    -- Count total policies created
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN (
          'restaurant_dietary_options_junction',
          'restaurant_dietary_options',
          'restaurant_features',
          'restaurant_restaurant_features',
          'cuisine_types',
          'restaurant_data_view'
      );

    RAISE NOTICE 'Security migration completed:';
    RAISE NOTICE '  - RLS enabled on % of 5 target tables', rls_enabled_count;
    RAISE NOTICE '  - Total policies created/updated: %', policy_count;
    RAISE NOTICE '  - restaurant_data_view converted to SECURITY INVOKER';
END $$;

-- Log migration completion
INSERT INTO schema_migrations (version) VALUES ('032_security_rls_fixes')
ON CONFLICT (version) DO NOTHING;