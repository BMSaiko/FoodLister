-- Migration: Create core application tables
-- This migration creates all the main tables for the foodlist application
-- Run this first before any other migrations

-- Create cuisine_types table
CREATE TABLE IF NOT EXISTS public.cuisine_types (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL UNIQUE,
  description text,
  icon text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT cuisine_types_pkey PRIMARY KEY (id)
);

-- Create lists table
CREATE TABLE IF NOT EXISTS public.lists (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  created_at timestamp without time zone DEFAULT now(),
  creator text,
  creator_id uuid,
  creator_name text,
  CONSTRAINT lists_pkey PRIMARY KEY (id),
  CONSTRAINT lists_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES auth.users(id)
);

-- Create restaurants table
CREATE TABLE IF NOT EXISTS public.restaurants (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
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
  CONSTRAINT restaurants_pkey PRIMARY KEY (id),
  CONSTRAINT restaurants_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES auth.users(id)
);

-- Create profiles table
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
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- Create restaurant_cuisine_types junction table
CREATE TABLE IF NOT EXISTS public.restaurant_cuisine_types (
  restaurant_id uuid NOT NULL,
  cuisine_type_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT restaurant_cuisine_types_pkey PRIMARY KEY (restaurant_id, cuisine_type_id),
  CONSTRAINT restaurant_cuisine_types_cuisine_type_id_fkey FOREIGN KEY (cuisine_type_id) REFERENCES public.cuisine_types(id),
  CONSTRAINT restaurant_cuisine_types_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id)
);

-- Create list_restaurants junction table
CREATE TABLE IF NOT EXISTS public.list_restaurants (
  list_id uuid NOT NULL,
  restaurant_id uuid NOT NULL,
  CONSTRAINT list_restaurants_pkey PRIMARY KEY (list_id, restaurant_id),
  CONSTRAINT list_restaurants_list_id_fkey FOREIGN KEY (list_id) REFERENCES public.lists(id),
  CONSTRAINT list_restaurants_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id)
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL,
  user_id uuid NOT NULL,
  rating numeric NOT NULL CHECK (rating >= 0.5 AND rating <= 5.0),
  comment text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  user_name text NOT NULL DEFAULT 'Anonymous User'::text,
  CONSTRAINT reviews_pkey PRIMARY KEY (id),
  CONSTRAINT reviews_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id),
  CONSTRAINT reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- Create user_restaurant_visits table
CREATE TABLE IF NOT EXISTS public.user_restaurant_visits (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  restaurant_id uuid NOT NULL,
  visit_count integer NOT NULL DEFAULT 0,
  visited boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT user_restaurant_visits_pkey PRIMARY KEY (id),
  CONSTRAINT user_restaurant_visits_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT user_restaurant_visits_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_restaurants_creator_id ON restaurants(creator_id);
CREATE INDEX IF NOT EXISTS idx_lists_creator_id ON lists(creator_id);
CREATE INDEX IF NOT EXISTS idx_reviews_restaurant_id ON reviews(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);

-- Add comments for documentation
COMMENT ON TABLE cuisine_types IS 'Types of cuisine (Italian, Portuguese, etc.)';
COMMENT ON TABLE lists IS 'User-created lists of restaurants';
COMMENT ON TABLE restaurants IS 'Restaurant information and details';
COMMENT ON TABLE profiles IS 'User profile information';
COMMENT ON TABLE restaurant_cuisine_types IS 'Junction table linking restaurants to cuisine types';
COMMENT ON TABLE list_restaurants IS 'Junction table linking lists to restaurants';
COMMENT ON TABLE reviews IS 'User reviews of restaurants';
COMMENT ON TABLE user_restaurant_visits IS 'Tracks user visits to restaurants';
