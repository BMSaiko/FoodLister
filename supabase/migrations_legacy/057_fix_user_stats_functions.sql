-- Migration: Fix user stats functions after user_restaurant_visits was dropped
-- Date: 2026-06-27
-- Migrations 009/010 dropped the user_restaurant_visits table, but:
--   * get_user_stats() still joined it -> 42P01 on every call
--   * update_user_stats() / update_user_stats_delete() (fired by reviews/lists/restaurants
--     triggers) still queried it for total_restaurants_visited -> aborted core CRUD mutations.
-- Fix: rewrite the two stats functions to stop reading the dropped table, and drop the
--      orphaned get_user_stats() + user_stats view. The visits-table triggers were already
--      removed with the table in 009/010, so there is nothing to DROP here.

-- Rewrite update_user_stats(): stop reading user_restaurant_visits (visits feature removed)
CREATE OR REPLACE FUNCTION public.update_user_stats()
RETURNS TRIGGER AS $$
DECLARE
  user_id_to_update UUID;
BEGIN
  IF TG_TABLE_NAME = 'reviews' THEN
    user_id_to_update := NEW.user_id;
  ELSIF TG_TABLE_NAME = 'lists' THEN
    user_id_to_update := NEW.creator_id;
  ELSIF TG_TABLE_NAME = 'restaurants' THEN
    user_id_to_update := NEW.creator_id;
  END IF;

  UPDATE public.profiles SET
    total_reviews = (SELECT COUNT(*) FROM public.reviews WHERE user_id = user_id_to_update),
    total_restaurants_visited = 0,  -- ponytail: visits feature removed (user_restaurant_visits dropped)
    total_lists = (SELECT COUNT(*) FROM public.lists WHERE creator_id = user_id_to_update),
    total_restaurants_added = (SELECT COUNT(*) FROM public.restaurants WHERE creator_id = user_id_to_update)
  WHERE user_id = user_id_to_update;

  IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
END;
$$ LANGUAGE plpgsql;

-- Rewrite update_user_stats_delete() the same way
CREATE OR REPLACE FUNCTION public.update_user_stats_delete()
RETURNS TRIGGER AS $$
DECLARE
  user_id_to_update UUID;
BEGIN
  IF TG_TABLE_NAME = 'reviews' THEN
    user_id_to_update := OLD.user_id;
  ELSIF TG_TABLE_NAME = 'lists' THEN
    user_id_to_update := OLD.creator_id;
  ELSIF TG_TABLE_NAME = 'restaurants' THEN
    user_id_to_update := OLD.creator_id;
  END IF;

  UPDATE public.profiles SET
    total_reviews = (SELECT COUNT(*) FROM public.reviews WHERE user_id = user_id_to_update),
    total_restaurants_visited = 0,  -- ponytail: visits feature removed
    total_lists = (SELECT COUNT(*) FROM public.lists WHERE creator_id = user_id_to_update),
    total_restaurants_added = (SELECT COUNT(*) FROM public.restaurants WHERE creator_id = user_id_to_update)
  WHERE user_id = user_id_to_update;

  IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
END;
$$ LANGUAGE plpgsql;

-- Drop orphaned get_user_stats() + user_stats view (only used by the removed /api/users/me/stats RPC)
DROP FUNCTION IF EXISTS public.get_user_stats(uuid);
DROP VIEW IF EXISTS public.user_stats;
