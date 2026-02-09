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