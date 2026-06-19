-- Migration: Security Cleanup - RLS Policies
-- Addresses Supabase Database Linter warnings:
--   - rls_policy_always_true (notifications table INSERT policy)
-- Note: extension_in_public warnings are intentionally ignored -
-- moving extensions (unaccent, pg_trgm) would break existing functions
-- Created: 2026-04-08

-- ==========================================
-- 1. FIX OVERLY PERMISSIVE RLS POLICY ON NOTIFICATIONS
-- ==========================================

-- Drop the overly permissive policy (WITH CHECK true allows any data)
DROP POLICY IF EXISTS "Service role can insert notifications" ON public.notifications;

-- Recreate with proper security validation
-- Service role can insert notifications but validates required fields
CREATE POLICY "Service role can insert notifications" ON public.notifications
    FOR INSERT WITH CHECK (
        (select auth.role()) = 'service_role' AND
        user_id IS NOT NULL AND
        type IS NOT NULL AND
        title IS NOT NULL AND
        message IS NOT NULL
    );

-- ==========================================
-- 2. VERIFICATION
-- ==========================================

DO $$
DECLARE
    policy_fixed INTEGER := 0;
BEGIN
    -- Check policy is fixed (no longer has unconditional WITH CHECK)
    SELECT COUNT(*) INTO policy_fixed
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'notifications'
      AND policyname = 'Service role can insert notifications'
      AND (with_check IS NULL OR with_check NOT ILIKE '%true%');

    RAISE NOTICE 'Security cleanup completed:';
    RAISE NOTICE '  - RLS policy fixed on notifications: %', policy_fixed;
    RAISE NOTICE '  - Note: extension_in_public warnings for unaccent/pg_trgm are intentionally benign';
END $$;

-- Log migration completion
INSERT INTO schema_migrations (version) VALUES ('034_security_cleanup')
ON CONFLICT (version) DO NOTHING;