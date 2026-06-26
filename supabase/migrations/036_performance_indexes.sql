-- Migration 041: Add performance indexes for frequently queried columns
-- This migration adds indexes to optimize common query patterns across
-- restaurants, lists, reviews, list_restaurants, and notifications tables.

-- ============================================================
-- RESTAURANTS TABLE INDEXES
-- ============================================================

-- Index for filtering/sorting by cuisine type (via junction table)
CREATE INDEX IF NOT EXISTS idx_restaurant_cuisine_types_cuisine_type_id
  ON restaurant_cuisine_types(cuisine_type_id);

-- Index for filtering/sorting by rating (most common sort order)
CREATE INDEX IF NOT EXISTS idx_restaurants_rating_desc
  ON restaurants(rating DESC NULLS LAST);

-- Index for filtering by price range
CREATE INDEX IF NOT EXISTS idx_restaurants_price_per_person
  ON restaurants(price_per_person)
  WHERE price_per_person IS NOT NULL;

-- Index for filtering by creator (user's restaurants)
CREATE INDEX IF NOT EXISTS idx_restaurants_creator_id
  ON restaurants(creator_id)
  WHERE creator_id IS NOT NULL;

-- Composite index for restaurant list queries (rating + created_at ordering)
CREATE INDEX IF NOT EXISTS idx_restaurants_rating_created
  ON restaurants(rating DESC NULLS LAST, created_at DESC);

-- ============================================================
-- LISTS TABLE INDEXES
-- ============================================================

-- Index for filtering lists by creator
CREATE INDEX IF NOT EXISTS idx_lists_creator_id
  ON lists(creator_id)
  WHERE creator_id IS NOT NULL;

-- Composite index for public lists by creator (most common query pattern)
CREATE INDEX IF NOT EXISTS idx_lists_creator_public
  ON lists(creator_id, is_public)
  WHERE creator_id IS NOT NULL;

-- Index for filtering public/private lists
CREATE INDEX IF NOT EXISTS idx_lists_is_public
  ON lists(is_public)
  WHERE is_public = true;

-- ============================================================
-- LIST_RESTAURANTS TABLE INDEXES
-- ============================================================

-- Index for fetching restaurants in a list (ordered by position)
CREATE INDEX IF NOT EXISTS idx_list_restaurants_list_id_position
  ON list_restaurants(list_id, position);

-- Index for finding which lists contain a restaurant
CREATE INDEX IF NOT EXISTS idx_list_restaurants_restaurant_id
  ON list_restaurants(restaurant_id);

-- ============================================================
-- REVIEWS TABLE INDEXES
-- ============================================================

-- Index for fetching reviews by restaurant (with newest first)
CREATE INDEX IF NOT EXISTS idx_reviews_restaurant_id_created
  ON reviews(restaurant_id, created_at DESC);

-- Index for fetching reviews by user (with newest first)
CREATE INDEX IF NOT EXISTS idx_reviews_user_id_created
  ON reviews(user_id, created_at DESC);

-- Composite index for user-restaurant review lookups (unique constraint support)
CREATE INDEX IF NOT EXISTS idx_reviews_user_restaurant
  ON reviews(user_id, restaurant_id);

-- ============================================================
-- NOTIFICATIONS TABLE INDEXES
-- ============================================================

-- Composite index for fetching user notifications (newest first)
CREATE INDEX IF NOT EXISTS idx_notifications_user_created
  ON notifications(user_id, created_at DESC);

-- Composite index for unread notifications count
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON notifications(user_id, read, created_at DESC)
  WHERE read = false;

-- ============================================================
-- RESTAURANT FEATURES / DIETARY OPTIONS JUNCTION TABLES
-- ============================================================

-- Index for restaurant features lookups
CREATE INDEX IF NOT EXISTS idx_restaurant_restaurant_features_feature_id
  ON restaurant_restaurant_features(feature_id);

-- Index for restaurant dietary options lookups
CREATE INDEX IF NOT EXISTS idx_restaurant_dietary_options_junction_option_id
  ON restaurant_dietary_options_junction(dietary_option_id);

-- ============================================================
-- PROFILES TABLE INDEXES
-- ============================================================

-- Index for user_id_code lookups (public profile access)
CREATE INDEX IF NOT EXISTS idx_profiles_user_id_code
  ON profiles(user_id_code)
  WHERE user_id_code IS NOT NULL;

-- Index for public profile filtering
CREATE INDEX IF NOT EXISTS idx_profiles_public
  ON profiles(public_profile)
  WHERE public_profile = true;

