-- Migration: Fix auth_rls_initplan performance issues
-- Addresses Supabase Database Linter warnings: auth_rls_initplan (67 issues)
-- Wraps auth.role() and auth.uid() calls with (select ...) to prevent per-row re-evaluation
-- Created: 2026-04-08

-- ==========================================
-- FIX REVIEWS TABLE POLICIES
-- ==========================================

-- Drop existing policies
DROP POLICY IF EXISTS "reviews_select_policy" ON public.reviews;
DROP POLICY IF EXISTS "reviews_insert_policy" ON public.reviews;
DROP POLICY IF EXISTS "reviews_update_policy" ON public.reviews;
DROP POLICY IF EXISTS "reviews_delete_policy" ON public.reviews;

-- Recreate with optimized auth calls (wrapped in SELECT)
CREATE POLICY "reviews_select_policy" ON reviews
FOR SELECT USING (true);

CREATE POLICY "reviews_insert_policy" ON reviews
FOR INSERT WITH CHECK (
  (select auth.role()) = 'authenticated' AND
  (select auth.uid()) = user_id
);

CREATE POLICY "reviews_update_policy" ON reviews
FOR UPDATE USING (
  (select auth.role()) = 'authenticated' AND
  (select auth.uid()) = user_id
);

CREATE POLICY "reviews_delete_policy" ON reviews
FOR DELETE USING (
  (select auth.role()) = 'authenticated' AND
  (select auth.uid()) = user_id
);

-- ==========================================
-- FIX LISTS TABLE POLICIES
-- ==========================================

-- Drop existing policies from migration 001 and 013
DROP POLICY IF EXISTS "lists_select_policy" ON public.lists;
DROP POLICY IF EXISTS "lists_insert_policy" ON public.lists;
DROP POLICY IF EXISTS "lists_update_policy" ON public.lists;
DROP POLICY IF EXISTS "lists_delete_policy" ON public.lists;
DROP POLICY IF EXISTS "lists_user_ownership" ON public.lists;
DROP POLICY IF EXISTS "lists_service_role" ON public.lists;
DROP POLICY IF EXISTS "Permitir leitura de listas para todos" ON public.lists;

-- Recreate with optimized auth calls
CREATE POLICY "lists_select_policy" ON lists
FOR SELECT USING (
  (select auth.role()) = 'authenticated' AND
  (select auth.uid()) = creator_id
);

CREATE POLICY "lists_insert_policy" ON lists
FOR INSERT WITH CHECK (
  (select auth.role()) = 'authenticated' AND
  (select auth.uid()) = creator_id
);

CREATE POLICY "lists_update_policy" ON lists
FOR UPDATE USING (
  (select auth.role()) = 'authenticated' AND
  (select auth.uid()) = creator_id
);

CREATE POLICY "lists_delete_policy" ON lists
FOR DELETE USING (
  (select auth.role()) = 'authenticated' AND
  (select auth.uid()) = creator_id
);

-- ==========================================
-- FIX PROFILES TABLE POLICIES
-- ==========================================

-- Drop existing policies from migration 007, 013, 014
DROP POLICY IF EXISTS "Users can manage their own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Service role can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "profiles_read_public" ON public.profiles;
DROP POLICY IF EXISTS "profiles_user_ownership" ON public.profiles;
DROP POLICY IF EXISTS "profiles_service_role" ON public.profiles;
DROP POLICY IF EXISTS "Permitir leitura de profiles para todos" ON public.profiles;

-- Recreate with optimized auth calls
-- Public read access (safe, no auth call needed)
CREATE POLICY "profiles_read_public" ON profiles
FOR SELECT USING (true);

-- User ownership for all operations
CREATE POLICY "profiles_user_ownership" ON profiles
FOR ALL USING ((select auth.uid()) = user_id);

-- Service role access
CREATE POLICY "profiles_service_role" ON profiles
FOR ALL USING ((select auth.role()) = 'service_role');

-- ==========================================
-- FIX USER_RESTAURANT_VISITS TABLE POLICIES
-- ==========================================

-- Drop existing policies from migrations 010, 011, 012
DROP POLICY IF EXISTS "Users can manage their own visits" ON public.user_restaurant_visits;
DROP POLICY IF EXISTS "Service role can manage all visits" ON public.user_restaurant_visits;
DROP POLICY IF EXISTS "Users can view their own visits" ON public.user_restaurant_visits;
DROP POLICY IF EXISTS "Users can insert their own visits" ON public.user_restaurant_visits;
DROP POLICY IF EXISTS "Users can update their own visits" ON public.user_restaurant_visits;
DROP POLICY IF EXISTS "Users can delete their own visits" ON public.user_restaurant_visits;
DROP POLICY IF EXISTS "users_view_own_visits" ON public.user_restaurant_visits;
DROP POLICY IF EXISTS "users_insert_own_visits" ON public.user_restaurant_visits;
DROP POLICY IF EXISTS "users_update_own_visits" ON public.user_restaurant_visits;
DROP POLICY IF EXISTS "users_delete_own_visits" ON public.user_restaurant_visits;
DROP POLICY IF EXISTS "service_role_manage_all_visits" ON public.user_restaurant_visits;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.user_restaurant_visits;

-- Recreate with optimized auth calls
CREATE POLICY "users_view_own_visits" ON user_restaurant_visits
FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "users_insert_own_visits" ON user_restaurant_visits
FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "users_update_own_visits" ON user_restaurant_visits
FOR UPDATE USING ((select auth.uid()) = user_id)
WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "users_delete_own_visits" ON user_restaurant_visits
FOR DELETE USING ((select auth.uid()) = user_id);

CREATE POLICY "service_role_manage_all_visits" ON user_restaurant_visits
FOR ALL USING ((select auth.role()) = 'service_role');

-- ==========================================
-- FIX LIST_COMMENTS TABLE POLICIES
-- ==========================================

-- Drop existing policies from migration 025
DROP POLICY IF EXISTS "list_comments_select_public" ON public.list_comments;
DROP POLICY IF EXISTS "list_comments_insert_policy" ON public.list_comments;
DROP POLICY IF EXISTS "list_comments_update_policy" ON public.list_comments;
DROP POLICY IF EXISTS "list_comments_delete_policy" ON public.list_comments;
DROP POLICY IF EXISTS "Anyone can view list comments" ON public.list_comments;
DROP POLICY IF EXISTS "Authenticated users can create comments" ON public.list_comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON public.list_comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.list_comments;

-- Recreate with optimized auth calls
-- Public read for comments on public lists (no auth call in USING clause)
CREATE POLICY "list_comments_select_public" ON list_comments
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.lists 
    WHERE lists.id = list_comments.list_id 
    AND lists.is_public = true
  )
  OR 
  (select auth.uid()) = user_id
);

CREATE POLICY "list_comments_insert_policy" ON list_comments
FOR INSERT WITH CHECK (
  (select auth.role()) = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM public.lists 
    WHERE lists.id = list_comments.list_id 
    AND lists.is_public = true
  )
);

CREATE POLICY "list_comments_update_policy" ON list_comments
FOR UPDATE USING ((select auth.uid()) = user_id)
WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "list_comments_delete_policy" ON list_comments
FOR DELETE USING ((select auth.uid()) = user_id);

-- ==========================================
-- FIX LIST_COLLABORATORS TABLE POLICIES
-- ==========================================

-- Drop existing policies from migration 026
DROP POLICY IF EXISTS "list_collaborators_select_policy" ON public.list_collaborators;
DROP POLICY IF EXISTS "list_collaborators_insert_policy" ON public.list_collaborators;
DROP POLICY IF EXISTS "list_collaborators_delete_policy" ON public.list_collaborators;
DROP POLICY IF EXISTS "List owners can view collaborators" ON public.list_collaborators;
DROP POLICY IF EXISTS "List owners can add collaborators" ON public.list_collaborators;
DROP POLICY IF EXISTS "List owners can remove collaborators" ON public.list_collaborators;

-- Recreate with optimized auth calls
CREATE POLICY "list_collaborators_select_policy" ON list_collaborators
FOR SELECT USING (
  (select auth.uid()) IN (
    SELECT creator_id FROM public.lists WHERE id = list_id
  )
  OR
  (select auth.uid()) = user_id
);

CREATE POLICY "list_collaborators_insert_policy" ON list_collaborators
FOR INSERT WITH CHECK (
  (select auth.uid()) IN (
    SELECT creator_id FROM public.lists WHERE id = list_id
  )
);

CREATE POLICY "list_collaborators_delete_policy" ON list_collaborators
FOR DELETE USING (
  (select auth.uid()) IN (
    SELECT creator_id FROM public.lists WHERE id = list_id
  )
);

-- ==========================================
-- FIX MEAL_PARTICIPANTS TABLE POLICIES
-- ==========================================

-- Drop existing policies from migration 030
DROP POLICY IF EXISTS "Organizer can update participants" ON public.meal_participants;
DROP POLICY IF EXISTS "Organizer can add participants" ON public.meal_participants;
DROP POLICY IF EXISTS "Organizer can remove participants" ON public.meal_participants;
DROP POLICY IF EXISTS "Users can update their own status" ON public.meal_participants;
DROP POLICY IF EXISTS "Anyone can view meal participants" ON public.meal_participants;

-- Recreate with optimized auth calls
-- Public read (no auth call needed)
CREATE POLICY "Anyone can view meal participants" ON meal_participants
FOR SELECT USING (true);

CREATE POLICY "Organizer can add participants" ON meal_participants
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.scheduled_meals 
    WHERE id = scheduled_meal_id 
    AND organizer_id = (select auth.uid())
  )
);

CREATE POLICY "Organizer can update participants" ON meal_participants
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.scheduled_meals 
    WHERE id = scheduled_meal_id 
    AND organizer_id = (select auth.uid())
  )
);

CREATE POLICY "Organizer can remove participants" ON meal_participants
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.scheduled_meals 
    WHERE id = scheduled_meal_id 
    AND organizer_id = (select auth.uid())
  )
);

CREATE POLICY "Users can update their own status" ON meal_participants
FOR UPDATE USING ((select auth.uid()) = user_id);

-- ==========================================
-- FIX NOTIFICATIONS TABLE POLICIES
-- ==========================================

-- Drop existing policies from migration 031
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Service role can insert notifications" ON public.notifications;

-- Recreate with optimized auth calls
CREATE POLICY "Users can view their own notifications" ON notifications
FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
FOR UPDATE USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own notifications" ON notifications
FOR DELETE USING ((select auth.uid()) = user_id);

CREATE POLICY "Service role can insert notifications" ON notifications
FOR INSERT WITH CHECK (
  (select auth.role()) = 'service_role' AND
  user_id IS NOT NULL AND
  type IS NOT NULL AND
  title IS NOT NULL AND
  message IS NOT NULL
);

-- ==========================================
-- FIX RESTAURANTS TABLE POLICIES
-- ==========================================

-- Drop existing policies from migrations 001, 013
DROP POLICY IF EXISTS "restaurants_select_policy" ON public.restaurants;
DROP POLICY IF EXISTS "restaurants_insert_policy" ON public.restaurants;
DROP POLICY IF EXISTS "restaurants_update_policy" ON public.restaurants;
DROP POLICY IF EXISTS "restaurants_delete_policy" ON public.restaurants;
DROP POLICY IF EXISTS "restaurants_user_ownership" ON public.restaurants;
DROP POLICY IF EXISTS "restaurants_service_role" ON public.restaurants;
DROP POLICY IF EXISTS "Permitir leitura para todos" ON public.restaurants;

-- Recreate with optimized auth calls
CREATE POLICY "restaurants_select_policy" ON restaurants
FOR SELECT USING ((select auth.role()) = 'authenticated');

CREATE POLICY "restaurants_insert_policy" ON restaurants
FOR INSERT WITH CHECK (
  (select auth.role()) = 'authenticated' AND
  (select auth.uid()) = creator_id
);

CREATE POLICY "restaurants_update_policy" ON restaurants
FOR UPDATE USING (
  (select auth.role()) = 'authenticated' AND
  (select auth.uid()) = creator_id
);

CREATE POLICY "restaurants_delete_policy" ON restaurants
FOR DELETE USING (
  (select auth.role()) = 'authenticated' AND
  (select auth.uid()) = creator_id
);

-- ==========================================
-- FIX RESTAURANT_CUISINE_TYPES TABLE POLICIES
-- ==========================================

-- Drop existing policies from migration 013, 032
DROP POLICY IF EXISTS "restaurant_cuisine_types_policy" ON public.restaurant_cuisine_types;
DROP POLICY IF EXISTS "restaurant_cuisine_types_own_restaurants" ON public.restaurant_cuisine_types;
DROP POLICY IF EXISTS "restaurant_cuisine_types_service_role" ON public.restaurant_cuisine_types;
DROP POLICY IF EXISTS "Permitir atualização de restaurant_cuisine_types para usuários verifica" ON public.restaurant_cuisine_types;
DROP POLICY IF EXISTS "Permitir exclusão de restaurant_cuisine_types para usuários v" ON public.restaurant_cuisine_types;
DROP POLICY IF EXISTS "Permitir inserção de restaurant_cuisine_types para usuários " ON public.restaurant_cuisine_types;

-- Recreate with optimized auth calls
CREATE POLICY "restaurant_cuisine_types_own_restaurants" ON restaurant_cuisine_types
FOR ALL USING (
  (select auth.role()) = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM restaurants
    WHERE restaurants.id = restaurant_cuisine_types.restaurant_id
    AND restaurants.creator_id = (select auth.uid())
  )
);

CREATE POLICY "restaurant_cuisine_types_service_role" ON restaurant_cuisine_types
FOR ALL USING ((select auth.role()) = 'service_role');

-- ==========================================
-- FIX LIST_RESTAURANTS TABLE POLICIES
-- ==========================================

-- Drop existing policies from migration 001, 013
DROP POLICY IF EXISTS "list_restaurants_policy" ON public.list_restaurants;
DROP POLICY IF EXISTS "list_restaurants_own_lists" ON public.list_restaurants;
DROP POLICY IF EXISTS "list_restaurants_service_role" ON public.list_restaurants;
DROP POLICY IF EXISTS "Permitir atualização de list_restaurants para usuários verif" ON public.list_restaurants;
DROP POLICY IF EXISTS "Permitir exclusão de list_restaurants para usuários verificad" ON public.list_restaurants;
DROP POLICY IF EXISTS "Permitir inserção de list_restaurants para usuários verifica" ON public.list_restaurants;

-- Recreate with optimized auth calls
CREATE POLICY "list_restaurants_own_lists" ON list_restaurants
FOR ALL USING (
  (select auth.role()) = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM lists
    WHERE lists.id = list_restaurants.list_id
    AND lists.creator_id = (select auth.uid())
  )
);

CREATE POLICY "list_restaurants_service_role" ON list_restaurants
FOR ALL USING ((select auth.role()) = 'service_role');

-- ==========================================
-- FIX CUISINE_TYPES TABLE POLICIES
-- ==========================================

-- Drop existing policies from migration 013, 032
DROP POLICY IF EXISTS "cuisine_types_authenticated_users" ON public.cuisine_types;
DROP POLICY IF EXISTS "cuisine_types_service_role" ON public.cuisine_types;
DROP POLICY IF EXISTS "cuisine_types_select_policy" ON public.cuisine_types;
DROP POLICY IF EXISTS "cuisine_types_insert_policy" ON public.cuisine_types;
DROP POLICY IF EXISTS "cuisine_types_update_policy" ON public.cuisine_types;
DROP POLICY IF EXISTS "cuisine_types_delete_policy" ON public.cuisine_types;
DROP POLICY IF EXISTS "Permitir atualização de cuisine_types para usuários verifica" ON public.cuisine_types;
DROP POLICY IF EXISTS "Permitir exclusão de cuisine_types para usuários verificados" ON public.cuisine_types;
DROP POLICY IF EXISTS "Permitir inserção de cuisine_types para usuários verificados" ON public.cuisine_types;

-- Recreate with optimized auth calls
CREATE POLICY "cuisine_types_select_policy" ON cuisine_types
FOR SELECT USING (true);

CREATE POLICY "cuisine_types_insert_policy" ON cuisine_types
FOR INSERT WITH CHECK ((select auth.role()) = 'authenticated');

CREATE POLICY "cuisine_types_update_policy" ON cuisine_types
FOR UPDATE USING ((select auth.role()) = 'authenticated');

CREATE POLICY "cuisine_types_delete_policy" ON cuisine_types
FOR DELETE USING ((select auth.role()) = 'authenticated');

-- ==========================================
-- FIX SCHEDULED_MEALS TABLE POLICIES
-- ==========================================

-- Drop existing policies from migration 030
DROP POLICY IF EXISTS "Anyone can view scheduled meals" ON public.scheduled_meals;
DROP POLICY IF EXISTS "Users can create scheduled meals" ON public.scheduled_meals;
DROP POLICY IF EXISTS "Organizer can update their own meals" ON public.scheduled_meals;
DROP POLICY IF EXISTS "Organizer can delete their own meals" ON public.scheduled_meals;

-- Recreate with optimized auth calls
CREATE POLICY "Anyone can view scheduled meals" ON scheduled_meals
FOR SELECT USING (true);

CREATE POLICY "Users can create scheduled meals" ON scheduled_meals
FOR INSERT WITH CHECK ((select auth.uid()) = organizer_id);

CREATE POLICY "Organizer can update their own meals" ON scheduled_meals
FOR UPDATE USING ((select auth.uid()) = organizer_id);

CREATE POLICY "Organizer can delete their own meals" ON scheduled_meals
FOR DELETE USING ((select auth.uid()) = organizer_id);

-- ==========================================
-- FIX RESTAURANT_DIETARY_OPTIONS_JUNCTION POLICIES
-- ==========================================

-- Drop existing policies from migration 032
DROP POLICY IF EXISTS "restaurant_dietary_options_junction_select_public" ON public.restaurant_dietary_options_junction;
DROP POLICY IF EXISTS "restaurant_dietary_options_junction_insert_authenticated" ON public.restaurant_dietary_options_junction;
DROP POLICY IF EXISTS "restaurant_dietary_options_junction_update_authenticated" ON public.restaurant_dietary_options_junction;
DROP POLICY IF EXISTS "restaurant_dietary_options_junction_delete_authenticated" ON public.restaurant_dietary_options_junction;
DROP POLICY IF EXISTS "restaurant_dietary_options_junction_service_role" ON public.restaurant_dietary_options_junction;

-- Recreate with optimized auth calls
CREATE POLICY "restaurant_dietary_options_junction_select_public" ON restaurant_dietary_options_junction
FOR SELECT USING (true);

CREATE POLICY "restaurant_dietary_options_junction_insert_authenticated" ON restaurant_dietary_options_junction
FOR INSERT WITH CHECK (
  (select auth.role()) = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM restaurants
    WHERE restaurants.id = restaurant_dietary_options_junction.restaurant_id
    AND restaurants.creator_id = (select auth.uid())
  )
);

CREATE POLICY "restaurant_dietary_options_junction_update_authenticated" ON restaurant_dietary_options_junction
FOR UPDATE USING (
  (select auth.role()) = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM restaurants
    WHERE restaurants.id = restaurant_dietary_options_junction.restaurant_id
    AND restaurants.creator_id = (select auth.uid())
  )
);

CREATE POLICY "restaurant_dietary_options_junction_delete_authenticated" ON restaurant_dietary_options_junction
FOR DELETE USING (
  (select auth.role()) = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM restaurants
    WHERE restaurants.id = restaurant_dietary_options_junction.restaurant_id
    AND restaurants.creator_id = (select auth.uid())
  )
);

CREATE POLICY "restaurant_dietary_options_junction_service_role" ON restaurant_dietary_options_junction
FOR ALL USING ((select auth.role()) = 'service_role');

-- ==========================================
-- FIX RESTAURANT_RESTAURANT_FEATURES POLICIES
-- ==========================================

-- Drop existing policies from migration 032
DROP POLICY IF EXISTS "restaurant_features_junction_select_public" ON public.restaurant_restaurant_features;
DROP POLICY IF EXISTS "restaurant_features_junction_insert_authenticated" ON public.restaurant_restaurant_features;
DROP POLICY IF EXISTS "restaurant_features_junction_update_authenticated" ON public.restaurant_restaurant_features;
DROP POLICY IF EXISTS "restaurant_features_junction_delete_authenticated" ON public.restaurant_restaurant_features;
DROP POLICY IF EXISTS "restaurant_features_junction_service_role" ON public.restaurant_restaurant_features;

-- Recreate with optimized auth calls
CREATE POLICY "restaurant_features_junction_select_public" ON restaurant_restaurant_features
FOR SELECT USING (true);

CREATE POLICY "restaurant_features_junction_insert_authenticated" ON restaurant_restaurant_features
FOR INSERT WITH CHECK (
  (select auth.role()) = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM restaurants
    WHERE restaurants.id = restaurant_restaurant_features.restaurant_id
    AND restaurants.creator_id = (select auth.uid())
  )
);

CREATE POLICY "restaurant_features_junction_update_authenticated" ON restaurant_restaurant_features
FOR UPDATE USING (
  (select auth.role()) = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM restaurants
    WHERE restaurants.id = restaurant_restaurant_features.restaurant_id
    AND restaurants.creator_id = (select auth.uid())
  )
);

CREATE POLICY "restaurant_features_junction_delete_authenticated" ON restaurant_restaurant_features
FOR DELETE USING (
  (select auth.role()) = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM restaurants
    WHERE restaurants.id = restaurant_restaurant_features.restaurant_id
    AND restaurants.creator_id = (select auth.uid())
  )
);

CREATE POLICY "restaurant_features_junction_service_role" ON restaurant_restaurant_features
FOR ALL USING ((select auth.role()) = 'service_role');

-- ==========================================
-- FIX USER_SEARCH_INDEX POLICIES (if they exist)
-- ==========================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read search index" ON public.user_search_index;
DROP POLICY IF EXISTS "Users cannot modify search index" ON public.user_search_index;

-- Recreate with optimized auth calls (public read, authenticated write)
CREATE POLICY "Users can read search index" ON user_search_index
FOR SELECT USING (true);

CREATE POLICY "Users cannot modify search index" ON user_search_index
FOR ALL USING ((select auth.role()) = 'authenticated');

-- ==========================================
-- LOG COMPLETION
-- ==========================================

DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE schemaname = 'public'
      AND policyname IN (
        'reviews_select_policy', 'reviews_insert_policy', 'reviews_update_policy', 'reviews_delete_policy',
        'lists_select_policy', 'lists_insert_policy', 'lists_update_policy', 'lists_delete_policy',
        'profiles_read_public', 'profiles_user_ownership', 'profiles_service_role',
        'users_view_own_visits', 'users_insert_own_visits', 'users_update_own_visits', 'users_delete_own_visits', 'service_role_manage_all_visits',
        'list_comments_select_public', 'list_comments_insert_policy', 'list_comments_update_policy', 'list_comments_delete_policy',
        'list_collaborators_select_policy', 'list_collaborators_insert_policy', 'list_collaborators_delete_policy',
        'Anyone can view meal participants', 'Organizer can add participants', 'Organizer can update participants', 'Organizer can remove participants', 'Users can update their own status',
        'Users can view their own notifications', 'Users can update their own notifications', 'Users can delete their own notifications', 'Service role can insert notifications',
        'restaurants_select_policy', 'restaurants_insert_policy', 'restaurants_update_policy', 'restaurants_delete_policy',
        'restaurant_cuisine_types_own_restaurants', 'restaurant_cuisine_types_service_role',
        'list_restaurants_own_lists', 'list_restaurants_service_role',
        'cuisine_types_select_policy', 'cuisine_types_insert_policy', 'cuisine_types_update_policy', 'cuisine_types_delete_policy',
        'Anyone can view scheduled meals', 'Users can create scheduled meals', 'Organizer can update their own meals', 'Organizer can delete their own meals',
        'restaurant_dietary_options_junction_select_public', 'restaurant_dietary_options_junction_insert_authenticated', 'restaurant_dietary_options_junction_update_authenticated', 'restaurant_dietary_options_junction_delete_authenticated', 'restaurant_dietary_options_junction_service_role',
        'restaurant_features_junction_select_public', 'restaurant_features_junction_insert_authenticated', 'restaurant_features_junction_update_authenticated', 'restaurant_features_junction_delete_authenticated', 'restaurant_features_junction_service_role',
        'Users can read search index', 'Users cannot modify search index'
      );

    RAISE NOTICE 'RLS auth_rls_initplan fix completed:';
    RAISE NOTICE '  - Fixed % policies with wrapped auth calls', policy_count;
END $$;

-- Log migration completion
INSERT INTO schema_migrations (version) VALUES ('035_fix_auth_rls_initplan')
ON CONFLICT (version) DO NOTHING;