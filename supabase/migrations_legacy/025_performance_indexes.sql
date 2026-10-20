-- Migration: Performance optimizations - indexes
-- Date: 2026-04-04

-- Index for cuisine type lookups
CREATE INDEX IF NOT EXISTS idx_restaurants_cuisine
ON public.restaurant_cuisine_types(cuisine_type_id);

-- Index for reviews by restaurant and rating (for rating calculations)
CREATE INDEX IF NOT EXISTS idx_reviews_restaurant_rating
ON public.reviews(restaurant_id, rating);

-- Index for restaurant features lookups
CREATE INDEX IF NOT EXISTS idx_restaurant_features_restaurant
ON public.restaurant_restaurant_features(restaurant_id);

-- Index for dietary options lookups
CREATE INDEX IF NOT EXISTS idx_restaurant_dietary_restaurant
ON public.restaurant_dietary_options_junction(restaurant_id);

-- Index for list restaurants by position
CREATE INDEX IF NOT EXISTS idx_list_restaurants_position
ON public.list_restaurants(list_id, position);

-- Index for list comments by list
CREATE INDEX IF NOT EXISTS idx_list_comments_list
ON public.list_comments(list_id, created_at DESC);

-- Index for list collaborators by list
CREATE INDEX IF NOT EXISTS idx_list_collaborators_list
ON public.list_collaborators(list_id);

-- Index for lists by creator
CREATE INDEX IF NOT EXISTS idx_lists_creator
ON public.lists(creator_id, created_at DESC);

-- Index for restaurants by creator
CREATE INDEX IF NOT EXISTS idx_restaurants_creator
ON public.restaurants(creator_id, created_at DESC);
