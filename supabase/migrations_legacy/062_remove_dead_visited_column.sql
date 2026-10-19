-- Migration 062: Remove dead total_restaurants_visited reference from trigger functions
-- The column was dropped with the user_restaurant_visits feature (migrations 009/010).
-- Migration 057 rewrote the trigger functions but left a SET total_restaurants_visited = 0
-- which references a non-existent column on profiles -> 42703 on every review/list/restaurant
-- write. This migration removes the dead reference from both trigger functions.

-- Fix update_user_stats() trigger function
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
    total_lists = (SELECT COUNT(*) FROM public.lists WHERE creator_id = user_id_to_update),
    total_restaurants_added = (SELECT COUNT(*) FROM public.restaurants WHERE creator_id = user_id_to_update)
  WHERE user_id = user_id_to_update;

  IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
END;
$$ LANGUAGE plpgsql;

-- Fix update_user_stats_delete() trigger function
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
    total_lists = (SELECT COUNT(*) FROM public.lists WHERE creator_id = user_id_to_update),
    total_restaurants_added = (SELECT COUNT(*) FROM public.restaurants WHERE creator_id = user_id_to_update)
  WHERE user_id = user_id_to_update;

  IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
END;
$$ LANGUAGE plpgsql;
