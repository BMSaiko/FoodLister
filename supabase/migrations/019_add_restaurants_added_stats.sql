-- Migration: Add restaurants added stats and triggers

-- Add total_restaurants_added column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_restaurants_added INTEGER DEFAULT 0;

-- Create function to update user statistics
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
DECLARE
    user_id_to_update UUID;
BEGIN
    -- Determine which user to update based on the table
    IF TG_TABLE_NAME = 'reviews' THEN
        user_id_to_update := NEW.user_id;
    ELSIF TG_TABLE_NAME = 'user_restaurant_visits' THEN
        user_id_to_update := NEW.user_id;
    ELSIF TG_TABLE_NAME = 'lists' THEN
        user_id_to_update := NEW.creator_id;
    ELSIF TG_TABLE_NAME = 'restaurants' THEN
        user_id_to_update := NEW.creator_id;
    END IF;

    -- Update statistics
    UPDATE public.profiles SET
        total_reviews = (
            SELECT COUNT(*) FROM public.reviews 
            WHERE user_id = user_id_to_update
        ),
        total_restaurants_visited = (
            SELECT COUNT(*) FROM public.user_restaurant_visits 
            WHERE user_id = user_id_to_update AND visited = true
        ),
        total_lists = (
            SELECT COUNT(*) FROM public.lists 
            WHERE creator_id = user_id_to_update
        ),
        total_restaurants_added = (
            SELECT COUNT(*) FROM public.restaurants 
            WHERE creator_id = user_id_to_update
        )
    WHERE user_id = user_id_to_update;

    -- Return appropriate row based on operation
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create function to update stats on delete
CREATE OR REPLACE FUNCTION update_user_stats_delete()
RETURNS TRIGGER AS $$
DECLARE
    user_id_to_update UUID;
BEGIN
    -- Determine which user to update based on the table
    IF TG_TABLE_NAME = 'reviews' THEN
        user_id_to_update := OLD.user_id;
    ELSIF TG_TABLE_NAME = 'user_restaurant_visits' THEN
        user_id_to_update := OLD.user_id;
    ELSIF TG_TABLE_NAME = 'lists' THEN
        user_id_to_update := OLD.creator_id;
    ELSIF TG_TABLE_NAME = 'restaurants' THEN
        user_id_to_update := OLD.creator_id;
    END IF;

    -- Update statistics
    UPDATE public.profiles SET
        total_reviews = (
            SELECT COUNT(*) FROM public.reviews 
            WHERE user_id = user_id_to_update
        ),
        total_restaurants_visited = (
            SELECT COUNT(*) FROM public.user_restaurant_visits 
            WHERE user_id = user_id_to_update AND visited = true
        ),
        total_lists = (
            SELECT COUNT(*) FROM public.lists 
            WHERE creator_id = user_id_to_update
        ),
        total_restaurants_added = (
            SELECT COUNT(*) FROM public.restaurants 
            WHERE creator_id = user_id_to_update
        )
    WHERE user_id = user_id_to_update;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS trigger_update_user_stats_reviews ON public.reviews;
DROP TRIGGER IF EXISTS trigger_update_user_stats_visits ON public.user_restaurant_visits;
DROP TRIGGER IF EXISTS trigger_update_user_stats_lists ON public.lists;
DROP TRIGGER IF EXISTS trigger_update_user_stats_restaurants ON public.restaurants;
DROP TRIGGER IF EXISTS trigger_update_user_stats_delete_reviews ON public.reviews;
DROP TRIGGER IF EXISTS trigger_update_user_stats_delete_visits ON public.user_restaurant_visits;
DROP TRIGGER IF EXISTS trigger_update_user_stats_delete_lists ON public.lists;
DROP TRIGGER IF EXISTS trigger_update_user_stats_delete_restaurants ON public.restaurants;

-- Create triggers for reviews table
CREATE TRIGGER trigger_update_user_stats_reviews
    AFTER INSERT OR UPDATE ON public.reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_user_stats();

CREATE TRIGGER trigger_update_user_stats_delete_reviews
    AFTER DELETE ON public.reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_user_stats_delete();

-- Create triggers for user_restaurant_visits table
CREATE TRIGGER trigger_update_user_stats_visits
    AFTER INSERT OR UPDATE ON public.user_restaurant_visits
    FOR EACH ROW
    EXECUTE FUNCTION update_user_stats();

CREATE TRIGGER trigger_update_user_stats_delete_visits
    AFTER DELETE ON public.user_restaurant_visits
    FOR EACH ROW
    EXECUTE FUNCTION update_user_stats_delete();

-- Create triggers for lists table
CREATE TRIGGER trigger_update_user_stats_lists
    AFTER INSERT OR UPDATE ON public.lists
    FOR EACH ROW
    EXECUTE FUNCTION update_user_stats();

CREATE TRIGGER trigger_update_user_stats_delete_lists
    AFTER DELETE ON public.lists
    FOR EACH ROW
    EXECUTE FUNCTION update_user_stats_delete();

-- Create triggers for restaurants table
CREATE TRIGGER trigger_update_user_stats_restaurants
    AFTER INSERT OR UPDATE ON public.restaurants
    FOR EACH ROW
    EXECUTE FUNCTION update_user_stats();

CREATE TRIGGER trigger_update_user_stats_delete_restaurants
    AFTER DELETE ON public.restaurants
    FOR EACH ROW
    EXECUTE FUNCTION update_user_stats_delete();

-- Update existing profiles with correct statistics
UPDATE public.profiles SET
    total_reviews = (
        SELECT COUNT(*) FROM public.reviews 
        WHERE user_id = profiles.user_id
    ),
    total_restaurants_visited = (
        SELECT COUNT(*) FROM public.user_restaurant_visits 
        WHERE user_id = profiles.user_id AND visited = true
    ),
    total_lists = (
        SELECT COUNT(*) FROM public.lists 
        WHERE creator_id = profiles.user_id
    ),
    total_restaurants_added = (
        SELECT COUNT(*) FROM public.restaurants 
        WHERE creator_id = profiles.user_id
    );

-- Grant permissions
GRANT ALL ON FUNCTION update_user_stats() TO authenticated;
GRANT ALL ON FUNCTION update_user_stats_delete() TO authenticated;