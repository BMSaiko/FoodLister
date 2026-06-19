-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.cuisine_types (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL UNIQUE,
  description text,
  icon text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT cuisine_types_pkey PRIMARY KEY (id)
);
CREATE TABLE public.filter_presets (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  filters jsonb NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT filter_presets_pkey PRIMARY KEY (id),
  CONSTRAINT filter_presets_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.list_collaborators (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  list_id uuid NOT NULL,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'editor'::text CHECK (role = ANY (ARRAY['editor'::text, 'viewer'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT list_collaborators_pkey PRIMARY KEY (id),
  CONSTRAINT list_collaborators_list_id_fkey FOREIGN KEY (list_id) REFERENCES public.lists(id),
  CONSTRAINT list_collaborators_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.list_comments (
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
CREATE TABLE public.list_restaurants (
  list_id uuid NOT NULL,
  restaurant_id uuid NOT NULL,
  position integer NOT NULL DEFAULT 0,
  CONSTRAINT list_restaurants_pkey PRIMARY KEY (list_id, restaurant_id),
  CONSTRAINT list_restaurants_list_id_fkey FOREIGN KEY (list_id) REFERENCES public.lists(id),
  CONSTRAINT list_restaurants_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id)
);
CREATE TABLE public.lists (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  created_at timestamp without time zone DEFAULT now(),
  creator text,
  creator_id uuid,
  creator_name text,
  filters jsonb,
  is_public boolean NOT NULL DEFAULT true,
  tags ARRAY DEFAULT '{}'::text[],
  cover_image_url text,
  CONSTRAINT lists_pkey PRIMARY KEY (id),
  CONSTRAINT lists_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES auth.users(id)
);
CREATE TABLE public.meal_participants (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  scheduled_meal_id uuid NOT NULL,
  user_id uuid NOT NULL,
  status character varying NOT NULL DEFAULT 'pending'::character varying CHECK (status::text = ANY (ARRAY['pending'::character varying, 'accepted'::character varying, 'declined'::character varying]::text[])),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT meal_participants_pkey PRIMARY KEY (id),
  CONSTRAINT meal_participants_scheduled_meal_id_fkey FOREIGN KEY (scheduled_meal_id) REFERENCES public.scheduled_meals(id),
  CONSTRAINT meal_participants_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(user_id)
);
CREATE TABLE public.notifications (
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
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.profiles (
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
  total_restaurants_visited integer DEFAULT 0,
  total_reviews integer DEFAULT 0,
  total_lists integer DEFAULT 0,
  total_restaurants_added integer DEFAULT 0,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.restaurant_cuisine_types (
  restaurant_id uuid NOT NULL,
  cuisine_type_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT restaurant_cuisine_types_pkey PRIMARY KEY (restaurant_id, cuisine_type_id),
  CONSTRAINT restaurant_cuisine_types_cuisine_type_id_fkey FOREIGN KEY (cuisine_type_id) REFERENCES public.cuisine_types(id),
  CONSTRAINT restaurant_cuisine_types_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id)
);
CREATE TABLE public.restaurant_dietary_options (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  icon text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT restaurant_dietary_options_pkey PRIMARY KEY (id)
);
CREATE TABLE public.restaurant_dietary_options_junction (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL,
  dietary_option_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT restaurant_dietary_options_junction_pkey PRIMARY KEY (id),
  CONSTRAINT restaurant_dietary_options_junction_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id),
  CONSTRAINT restaurant_dietary_options_junction_dietary_option_id_fkey FOREIGN KEY (dietary_option_id) REFERENCES public.restaurant_dietary_options(id)
);
CREATE TABLE public.restaurant_features (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  icon text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT restaurant_features_pkey PRIMARY KEY (id)
);
CREATE TABLE public.restaurant_restaurant_features (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL,
  feature_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT restaurant_restaurant_features_pkey PRIMARY KEY (id),
  CONSTRAINT restaurant_restaurant_features_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id),
  CONSTRAINT restaurant_restaurant_features_feature_id_fkey FOREIGN KEY (feature_id) REFERENCES public.restaurant_features(id)
);
CREATE TABLE public.restaurants (
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
  phone_numbers ARRAY DEFAULT '{}'::text[],
  creator_id uuid,
  creator_name text,
  created_at timestamp with time zone DEFAULT now(),
  images ARRAY DEFAULT '{}'::text[],
  display_image_index integer DEFAULT '-1'::integer CHECK (display_image_index >= '-1'::integer),
  menu_links ARRAY DEFAULT '{}'::text[] CHECK (array_length(menu_links, 1) <= 5),
  menu_images ARRAY DEFAULT '{}'::text[] CHECK (array_length(menu_images, 1) <= 10),
  latitude numeric CHECK (latitude IS NULL OR latitude >= '-90'::integer::numeric AND latitude <= 90::numeric),
  longitude numeric CHECK (longitude IS NULL OR longitude >= '-180'::integer::numeric AND longitude <= 180::numeric),
  review_count integer DEFAULT 0,
  CONSTRAINT restaurants_pkey PRIMARY KEY (id),
  CONSTRAINT restaurants_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES auth.users(id)
);
CREATE TABLE public.reviews (
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
  CONSTRAINT reviews_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id),
  CONSTRAINT reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.scheduled_meals (
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
CREATE TABLE public.schema_migrations (
  version text NOT NULL,
  description text,
  installed_at timestamp with time zone DEFAULT now(),
  success boolean DEFAULT true,
  CONSTRAINT schema_migrations_pkey PRIMARY KEY (version)
);
CREATE TABLE public.user_activities (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL CHECK (type = ANY (ARRAY['recommendation'::text, 'visit'::text, 'review'::text, 'list_create'::text])),
  content text NOT NULL,
  restaurant_id uuid,
  list_id uuid,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_activities_pkey PRIMARY KEY (id),
  CONSTRAINT user_activities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT user_activities_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id),
  CONSTRAINT user_activities_list_id_fkey FOREIGN KEY (list_id) REFERENCES public.lists(id)
);
CREATE TABLE public.user_cuisine_types (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_cuisine_types_pkey PRIMARY KEY (id),
  CONSTRAINT user_cuisine_types_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.user_restaurant_visits (
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
CREATE TABLE public.user_search_index (
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