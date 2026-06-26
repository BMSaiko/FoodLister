-- ============================================================================
-- FoodLister — Canonical Database Schema
-- Generated: 2026-06-26
-- Source: complete-setup-idempotent.sql (renamed during organisational cleanup)
-- This is the idempotent setup script. For migration history, see migrations/.
-- ============================================================================

-- ============================================
-- FoodLister Complete Database Setup (IDEMPOTENT)
-- Safe to run multiple times - uses IF EXISTS / IF NOT EXISTS
-- ============================================

-- Enable required extensions (idempotent)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search

-- ============================================
-- CORE TABLES (CREATE IF NOT EXISTS)
-- ============================================

-- Cuisine Types
CREATE TABLE IF NOT EXISTS public.cuisine_types (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  icon text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT cuisine_types_pkey PRIMARY KEY (id)
);

-- Restaurant Features
CREATE TABLE IF NOT EXISTS public.restaurant_features (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  icon text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT restaurant_features_pkey PRIMARY KEY (id)
);

-- Dietary Options
CREATE TABLE IF NOT EXISTS public.restaurant_dietary_options (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  icon text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT restaurant_dietary_options_pkey PRIMARY KEY (id)
);

-- Profiles (fix amount_spent issue - that column goes in REVIEWS, not profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL UNIQUE,
  display_name text,
  bio text,
  avatar_url text,
  website text,
  location text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  phone_number text,
  user_id_code character varying UNIQUE,
  public_profile boolean DEFAULT true,
  total_reviews integer DEFAULT 0,
  total_lists integer DEFAULT 0,
  total_restaurants_added integer DEFAULT 0,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- Restaurants
CREATE TABLE IF NOT EXISTS public.restaurants (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  image_url text,
  price_per_person numeric,
  rating numeric CHECK (rating >= 0::numeric AND rating <= 5::numeric),
  location text,
  source_url text,
  creator text,
  menu_url text,
  visited boolean DEFAULT false,
  phone_numbers text[] DEFAULT '{}'::text[],
  creator_id uuid,
  creator_name text,
  created_at timestamp with time zone DEFAULT now(),
  images text[] DEFAULT '{}'::text[],
  display_image_index integer DEFAULT '-1'::integer CHECK (display_image_index >= '-1'::integer),
  menu_links text[] DEFAULT '{}'::text[] CHECK (array_length(menu_links, 1) <= 5),
  menu_images text[] DEFAULT '{}'::text[] CHECK (array_length(menu_images, 1) <= 10),
  latitude numeric CHECK (latitude IS NULL OR latitude >= '-90'::integer::numeric AND latitude <= 90::numeric),
  longitude numeric CHECK (longitude IS NULL OR longitude >= '-180'::integer::numeric AND longitude <= 180::numeric),
  review_count integer DEFAULT 0,
  CONSTRAINT restaurants_pkey PRIMARY KEY (id),
  CONSTRAINT restaurants_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES auth.users(id)
);

-- Restaurant Cuisine Types Junction
CREATE TABLE IF NOT EXISTS public.restaurant_cuisine_types (
  restaurant_id uuid NOT NULL,
  cuisine_type_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT restaurant_cuisine_types_pkey PRIMARY KEY (restaurant_id, cuisine_type_id),
  CONSTRAINT restaurant_cuisine_types_cuisine_type_id_fkey FOREIGN KEY (cuisine_type_id) REFERENCES public.cuisine_types(id),
  CONSTRAINT restaurant_cuisine_types_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id)
);

-- Restaurant Dietary Options Junction
CREATE TABLE IF NOT EXISTS public.restaurant_dietary_options_junction (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL,
  dietary_option_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT restaurant_dietary_options_junction_pkey PRIMARY KEY (id),
  CONSTRAINT restaurant_dietary_options_junction_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id),
  CONSTRAINT restaurant_dietary_options_junction_dietary_option_id_fkey FOREIGN KEY (dietary_option_id) REFERENCES public.restaurant_dietary_options(id)
);

-- Restaurant Features Junction
CREATE TABLE IF NOT EXISTS public.restaurant_restaurant_features (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL,
  feature_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT restaurant_restaurant_features_pkey PRIMARY KEY (id),
  CONSTRAINT restaurant_restaurant_features_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id),
  CONSTRAINT restaurant_restaurant_features_feature_id_fkey FOREIGN KEY (feature_id) REFERENCES public.restaurant_features(id)
);

-- Lists
CREATE TABLE IF NOT EXISTS public.lists (
  id uuid NOT NULL DEFAULT gen_random_v4(),
  name text NOT NULL,
  description text,
  created_at timestamp without time zone DEFAULT now(),
  creator text,
  creator_id uuid,
  creator_name text,
  filters jsonb,
  is_public boolean NOT NULL DEFAULT true,
  tags text[] DEFAULT '{}'::text[],
  cover_image_url text,
  CONSTRAINT lists_pkey PRIMARY KEY (id),
  CONSTRAINT lists_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES auth.users(id)
);

-- List Restaurants Junction
CREATE TABLE IF NOT EXISTS public.list_restaurants (
  list_id uuid NOT NULL,
  restaurant_id uuid NOT NULL,
  position integer NOT NULL DEFAULT 0,
  CONSTRAINT list_restaurants_pkey PRIMARY KEY (list_id, restaurant_id),
  CONSTRAINT list_restaurants_list_id_fkey FOREIGN KEY (list_id) REFERENCES public.lists(id),
  CONSTRAINT list_restaurants_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id)
);

-- List Collaborators
CREATE TABLE IF NOT EXISTS public.list_collaborators (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  list_id uuid NOT NULL,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'editor'::text CHECK (role = ANY (ARRAY['editor'::text, 'viewer'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT list_collaborators_pkey PRIMARY KEY (id),
  CONSTRAINT list_collaborators_list_id_fkey FOREIGN KEY (list_id) REFERENCES public.lists(id),
  CONSTRAINT list_collaborators_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- List Comments
CREATE TABLE IF NOT EXISTS public.list_comments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  list_id uuid NOT NULL,
  user_id uuid NOT NULL,
  comment text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT list_comments_pkey PRIMARY KEY (id),
  CONSTRAINT list_comments_list_id_fkey FOREIGN KEY (list_id) REFERENCES public.lists(id),
  CONSTRAINT list_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- Reviews (FIXED - amount_spent is here, not in profiles)
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL,
  user_id uuid NOT NULL,
  rating numeric NOT NULL CHECK (rating >= 0.5 AND rating <= 5.0),
  comment text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  user_name text NOT NULL DEFAULT 'Anonymous User'::text,
  amount_spent numeric,
  CONSTRAINT reviews_pkey PRIMARY KEY (id),
  CONSTRAINT reviews_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE,
  CONSTRAINT reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT reviews_unique_user_restaurant UNIQUE (restaurant_id, user_id)
);

-- User Restaurant Visits
CREATE TABLE IF NOT EXISTS public.user_restaurant_visits (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  restaurant_id uuid NOT NULL,
  visit_count integer NOT NULL DEFAULT 0,
  visited boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT user_restaurant_visits_pkey PRIMARY KEY (id),
  CONSTRAINT user_restaurant_visits_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(user_id),
  CONSTRAINT user_restaurant_visits_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id)
);

-- Scheduled Meals
CREATE TABLE IF NOT EXISTS public.scheduled_meals (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL,
  organizer_id uuid NOT NULL,
  meal_date date NOT NULL,
  meal_time time without time zone NOT NULL,
  meal_type character varying NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 120,
  google_calendar_link text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT scheduled_meals_pkey PRIMARY KEY (id),
  CONSTRAINT scheduled_meals_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id),
  CONSTRAINT scheduled_meals_organizer_id_fkey FOREIGN KEY (organizer_id) REFERENCES public.profiles(user_id)
);

-- Meal Participants
CREATE TABLE IF NOT EXISTS public.meal_participants (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  scheduled_meal_id uuid NOT NULL,
  user_id uuid NOT NULL,
  status character varying NOT NULL DEFAULT 'pending'::character varying CHECK (status::text = ANY (ARRAY['pending'::character varying, 'accepted'::character varying, 'declined'::character varying]::text[])),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT meal_participants_pkey PRIMARY KEY (id),
  CONSTRAINT meal_participants_scheduled_meal_id_fkey FOREIGN KEY (scheduled_meal_id) REFERENCES public.scheduled_meals(id),
  CONSTRAINT meal_participants_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(user_id)
);

-- Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  link text,
  read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(user_id)
);

-- User Search Index
CREATE TABLE IF NOT EXISTS public.user_search_index (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  display_name text,
  location text,
  bio text,
  search_vector tsvector,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_search_index_pkey PRIMARY KEY (id),
  CONSTRAINT user_search_index_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(user_id)
);

-- ============================================
-- INDEXES (IF NOT EXISTS)
-- ============================================

CREATE INDEX IF NOT EXISTS idx_restaurants_name ON restaurants USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_restaurants_creator ON restaurants(creator_id);
CREATE INDEX IF NOT EXISTS idx_restaurants_visited ON restaurants(visited);
CREATE INDEX IF NOT EXISTS idx_restaurants_rating ON restaurants(rating);
CREATE INDEX IF NOT EXISTS idx_restaurants_price ON restaurants(price_per_person);
CREATE INDEX IF NOT EXISTS idx_restaurants_location ON restaurants(location);

CREATE INDEX IF NOT EXISTS idx_cuisine_types_name ON cuisine_types(name);

CREATE INDEX IF NOT EXISTS idx_restaurant_cuisine_types_restaurant_id ON restaurant_cuisine_types(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_cuisine_types_cuisine_type_id ON restaurant_cuisine_types(cuisine_type_id);

CREATE INDEX IF NOT EXISTS idx_list_restaurants_list_id ON list_restaurants(list_id);
CREATE INDEX IF NOT EXISTS idx_list_restaurants_restaurant_id ON list_restaurants(restaurant_id);

CREATE INDEX IF NOT EXISTS idx_reviews_restaurant_id ON reviews(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at);

CREATE INDEX IF NOT EXISTS idx_user_restaurant_visits_user_id ON user_restaurant_visits(user_id);
CREATE INDEX IF NOT EXISTS idx_user_restaurant_visits_restaurant_id ON user_restaurant_visits(restaurant_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

CREATE INDEX IF NOT EXISTS idx_scheduled_meals_restaurant_id ON scheduled_meals(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_meals_organizer_id ON scheduled_meals(organizer_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_meals_meal_date ON scheduled_meals(meal_date);

CREATE INDEX IF NOT EXISTS idx_meal_participants_scheduled_meal_id ON meal_participants(scheduled_meal_id);
CREATE INDEX IF NOT EXISTS idx_meal_participants_user_id ON meal_participants(user_id);

CREATE INDEX IF NOT EXISTS idx_user_search_index_search_vector ON user_search_index USING gin(search_vector);

-- ============================================
-- ROW LEVEL SECURITY (Fixed for user_id ambiguity)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cuisine_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_cuisine_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_dietary_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_dietary_options_junction ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_restaurant_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.list_restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.list_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.list_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_restaurant_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_search_index ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies to avoid conflicts
DROP POLICY IF EXISTS "restaurants_select_policy" ON public.restaurants;
DROP POLICY IF EXISTS "restaurants_insert_policy" ON public.restaurants;
DROP POLICY IF EXISTS "restaurants_update_policy" ON public.restaurants;
DROP POLICY IF EXISTS "restaurants_delete_policy" ON public.restaurants;

DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;

DROP POLICY IF EXISTS "reviews_select_policy" ON public.reviews;
DROP POLICY IF EXISTS "reviews_insert_policy" ON public.reviews;
DROP POLICY IF EXISTS "reviews_update_policy" ON public.reviews;
DROP POLICY IF EXISTS "reviews_delete_policy" ON public.reviews;

DROP POLICY IF EXISTS "lists_select_policy" ON public.lists;
DROP POLICY IF EXISTS "lists_insert_policy" ON public.lists;
DROP POLICY IF EXISTS "lists_update_policy" ON public.lists;
DROP POLICY IF EXISTS "lists_delete_policy" ON public.lists;

DROP POLICY IF EXISTS "list_collaborators_select_policy" ON public.list_collaborators;
DROP POLICY IF EXISTS "list_collaborators_insert_policy" ON public.list_collaborators;
DROP POLICY IF EXISTS "list_collaborators_update_policy" ON public.list_collaborators;
DROP POLICY IF EXISTS "list_collaborators_delete_policy" ON public.list_collaborators;

-- Drop existing functions to recreate with fixed parameter names
DROP FUNCTION IF EXISTS public.can_access_list(uuid, uuid) CASCADE;
DROP FUNCTION IF EXISTS public.is_list_collaborator(uuid, uuid) CASCADE;

-- Create function with p_ prefix to avoid "user_id is ambiguous" error
CREATE OR REPLACE FUNCTION public.can_access_list(p_list_id uuid, p_user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.lists l
    WHERE l.id = p_list_id
    AND (
      l.is_public = true 
      OR l.creator_id = p_user_id
      OR EXISTS (
        SELECT 1 FROM public.list_collaborators lc
        WHERE lc.list_id = l.id
        AND lc.user_id = p_user_id
      )
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- Create helper function with non-conflicting parameter names
CREATE OR REPLACE FUNCTION public.is_list_collaborator(p_list_id uuid, p_user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.list_collaborators lc
    WHERE lc.list_id = p_list_id
    AND lc.user_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- Create RLS policies using the fixed functions
CREATE POLICY "restaurants_select_policy" ON public.restaurants FOR SELECT USING (true);
CREATE POLICY "restaurants_insert_policy" ON public.restaurants FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "restaurants_update_policy" ON public.restaurants FOR UPDATE USING (auth.uid() = creator_id);
CREATE POLICY "restaurants_delete_policy" ON public.restaurants FOR DELETE USING (auth.uid() = creator_id);

CREATE POLICY "profiles_select_policy" ON public.profiles FOR SELECT USING (
  auth.uid() = user_id OR public_profile = true
);
CREATE POLICY "profiles_update_policy" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "reviews_select_policy" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "reviews_insert_policy" ON public.reviews FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);
CREATE POLICY "reviews_update_policy" ON public.reviews FOR UPDATE USING (auth.role() = 'authenticated' AND auth.uid() = user_id);
CREATE POLICY "reviews_delete_policy" ON public.reviews FOR DELETE USING (auth.role() = 'authenticated' AND auth.uid() = user_id);

CREATE POLICY "lists_select_policy" ON public.lists FOR SELECT USING (
  is_public = true 
  OR auth.uid() = creator_id 
  OR public.can_access_list(id, auth.uid())
);
CREATE POLICY "lists_insert_policy" ON public.lists FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "lists_update_policy" ON public.lists FOR UPDATE USING (auth.uid() = creator_id);
CREATE POLICY "lists_delete_policy" ON public.lists FOR DELETE USING (auth.uid() = creator_id);

CREATE POLICY "list_collaborators_select_policy" ON public.list_collaborators FOR SELECT USING (
  user_id = auth.uid()
  OR public.can_access_list(list_id, auth.uid())
);
CREATE POLICY "list_collaborators_insert_policy" ON public.list_collaborators FOR INSERT WITH CHECK (
  public.can_access_list(list_id, auth.uid())
);
CREATE POLICY "list_collaborators_update_policy" ON public.list_collaborators FOR UPDATE USING (
  public.can_access_list(list_id, auth.uid())
);
CREATE POLICY "list_collaborators_delete_policy" ON public.list_collaborators FOR DELETE USING (
  public.can_access_list(list_id, auth.uid())
);

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.can_access_list(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_list_collaborator(uuid, uuid) TO authenticated;

-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to update restaurant rating and price_per_person
CREATE OR REPLACE FUNCTION public.update_restaurant_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.restaurants
    SET rating = (
        SELECT COALESCE(AVG(rating)::numeric(3,2), 0)
        FROM public.reviews
        WHERE restaurant_id = COALESCE(NEW.restaurant_id, OLD.restaurant_id)
    ),
    price_per_person = (
        SELECT COALESCE(AVG(amount_spent)::numeric, NULL)
        FROM public.reviews
        WHERE restaurant_id = COALESCE(NEW.restaurant_id, OLD.restaurant_id)
        AND amount_spent IS NOT NULL
    )
    WHERE id = COALESCE(NEW.restaurant_id, OLD.restaurant_id);

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing triggers
DROP TRIGGER IF EXISTS update_restaurant_rating_on_insert ON public.reviews;
DROP TRIGGER IF EXISTS update_restaurant_rating_on_update ON public.reviews;
DROP TRIGGER IF EXISTS update_restaurant_rating_on_delete ON public.reviews;

-- Create triggers
CREATE TRIGGER update_restaurant_rating_on_insert
    AFTER INSERT ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION public.update_restaurant_rating();

CREATE TRIGGER update_restaurant_rating_on_update
    AFTER UPDATE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION public.update_restaurant_rating();

CREATE TRIGGER update_restaurant_rating_on_delete
    AFTER DELETE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION public.update_restaurant_rating();

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, display_name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)))
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- SEED DATA (Optional - IF NOT EXISTS)
-- ============================================

-- Insert common cuisine types
INSERT INTO public.cuisine_types (name, description, icon) VALUES
('Italian', 'Italian cuisine', '🍝'),
('Chinese', 'Chinese cuisine', '🥡'),
('Japanese', 'Japanese cuisine', '🍱'),
('Mexican', 'Mexican cuisine', '🌮'),
('French', 'French cuisine', '🥖'),
('Indian', 'Indian cuisine', '🍛'),
('American', 'American cuisine', '🍔'),
('Mediterranean', 'Mediterranean cuisine', '🥗'),
('Portuguese', 'Portuguese cuisine', '🇵🇹')
ON CONFLICT (name) DO NOTHING;

-- Insert common features
INSERT INTO public.restaurant_features (name, description, icon) VALUES
('Wi-Fi', 'Free Wi-Fi available', '📶'),
('Parking', 'Parking available', '🅿️'),
('Outdoor Seating', 'Outdoor seating available', '🌳'),
('Delivery', 'Delivery service available', '🛵️'),
('Takeout', 'Takeout available', '🥡'),
('Reservations', 'Reservations accepted', '📅'),
('Wheelchair Accessible', 'Wheelchair accessible', '♿'),
('Kids Friendly', 'Kids friendly environment', '👶')
ON CONFLICT DO NOTHING;

-- Insert common dietary options
INSERT INTO public.restaurant_dietary_options (name, description, icon) VALUES
('Vegetarian Options', 'Has vegetarian options', '🥬'),
('Vegan Options', 'Has vegan options', '🌱'),
('Gluten-Free Options', 'Has gluten-free options', '🌾'),
('Halal', 'Halal food available', '☪️'),
('Kosher', 'Kosher food available', '✡️'),
('Nut-Free Options', 'Has nut-free options', '🥜')
ON CONFLICT DO NOTHING;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

SELECT 'FoodLister database setup completed successfully!' as status;