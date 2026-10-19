

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pgsodium";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pg_trgm" WITH SCHEMA "public";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "unaccent" WITH SCHEMA "public";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."can_access_list"("p_list_id" "uuid", "p_user_id" "uuid") RETURNS boolean
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.lists
    WHERE id = p_list_id
      AND (
        is_public = true
        OR creator_id = p_user_id
        OR EXISTS (
          SELECT 1 FROM public.list_collaborators
          WHERE list_id = p_list_id
            AND user_id = p_user_id
        )
      )
  );
$$;


ALTER FUNCTION "public"."can_access_list"("p_list_id" "uuid", "p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."can_edit_list"("p_list_id" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.list_collaborators
    WHERE list_id = p_list_id
      AND user_id = auth.uid()
      AND role = 'editor'
  );
$$;


ALTER FUNCTION "public"."can_edit_list"("p_list_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_list_ownership"("check_list_id" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.lists
    WHERE lists.id = check_list_id
    AND lists.creator_id = auth.uid()
  );
$$;


ALTER FUNCTION "public"."check_list_ownership"("check_list_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_notification_preferences"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$BEGIN
  INSERT INTO public.notification_preferences (user_id) VALUES (NEW.id);
  RETURN NEW;
END;$$;


ALTER FUNCTION "public"."create_notification_preferences"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_verified_users_table"() RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog, pg_temp'
    AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS verified_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username TEXT NOT NULL UNIQUE,
    verification_token TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
  );
  
  RETURN 'Tabela verified_users criada com sucesso';
END;
$$;


ALTER FUNCTION "public"."create_verified_users_table"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."current_user_is_admin"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'pg_catalog, pg_temp'
    AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM public.profiles WHERE user_id = auth.uid()),
    false
  );
$$;


ALTER FUNCTION "public"."current_user_is_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."exec_sql"("sql" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog, pg_temp'
    AS $$
BEGIN
  EXECUTE sql;
END;
$$;


ALTER FUNCTION "public"."exec_sql"("sql" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."exec_sql"("sql" "text") IS 'Execute dynamic SQL statements (SECURITY DEFINER)';



CREATE OR REPLACE FUNCTION "public"."generate_user_id_code"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    next_id INTEGER;
    user_code VARCHAR(10);
BEGIN
    SELECT nextval('public.user_id_sequence') INTO next_id;
    user_code := 'FL' || LPAD(next_id::TEXT, 6, '0');
    NEW.user_id_code := user_code;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."generate_user_id_code"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_created_at_from_id"("restaurant_id" "uuid") RETURNS timestamp with time zone
    LANGUAGE "plpgsql" STABLE
    SET "search_path" TO 'pg_catalog, pg_temp'
    AS $$
BEGIN
    RETURN (SELECT created_at FROM restaurants WHERE id = restaurant_id);
END;
$$;


ALTER FUNCTION "public"."get_created_at_from_id"("restaurant_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_restaurant_review_count"("restaurant_id_param" "uuid") RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog, pg_temp'
    AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM reviews WHERE restaurant_id = restaurant_id_param)::INTEGER;
END;
$$;


ALTER FUNCTION "public"."get_restaurant_review_count"("restaurant_id_param" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_restaurant_review_count"("restaurant_id_param" "uuid") IS 'Returns the total number of reviews for a given restaurant';



CREATE OR REPLACE FUNCTION "public"."get_reviews_with_users"("restaurant_id_param" "uuid") RETURNS TABLE("id" "uuid", "restaurant_id" "uuid", "user_id" "uuid", "rating" integer, "comment" "text", "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "user_name" "text", "user_email" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT
        r.id,
        r.restaurant_id,
        r.user_id,
        r.rating,
        r.comment,
        r.created_at,
        r.updated_at,
        COALESCE(
            au.raw_user_meta_data->>'name',
            au.raw_user_meta_data->>'full_name',
            au.email,
            'Anonymous User'
        )::TEXT as user_name,
        au.email as user_email
    FROM reviews r
    LEFT JOIN auth.users au ON r.user_id = au.id
    WHERE r.restaurant_id = restaurant_id_param
    ORDER BY r.created_at DESC;
END;
$$;


ALTER FUNCTION "public"."get_reviews_with_users"("restaurant_id_param" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_reviews_with_users"("restaurant_id_param" "uuid") IS 'Returns reviews for a restaurant with user names from auth.users';



CREATE OR REPLACE FUNCTION "public"."get_user_display_name"("user_uuid" "uuid") RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog, pg_temp'
    AS $$
DECLARE
  profile_name text;
  auth_name text;
BEGIN
  -- First try to get from profiles table
  SELECT display_name INTO profile_name
  FROM public.profiles
  WHERE user_id = user_uuid;

  IF profile_name IS NOT NULL THEN
    RETURN profile_name;
  END IF;

  -- Fallback to auth metadata
  SELECT COALESCE(raw_user_meta_data->>'name', raw_user_meta_data->>'full_name', email)
  INTO auth_name
  FROM auth.users
  WHERE id = user_uuid;

  RETURN auth_name;
END;
$$;


ALTER FUNCTION "public"."get_user_display_name"("user_uuid" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_profiles"("user_ids" "uuid"[]) RETURNS TABLE("user_id" "uuid", "display_name" "text", "avatar_url" "text")
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog, pg_temp'
    AS $$
          SELECT p.user_id, p.display_name, p.avatar_url
          FROM public.profiles p
          WHERE p.user_id = ANY(user_ids);
        $$;


ALTER FUNCTION "public"."get_user_profiles"("user_ids" "uuid"[]) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_restaurants_paginated"("p_user_id" "uuid", "p_limit" integer DEFAULT 12, "p_cursor" "uuid" DEFAULT NULL::"uuid") RETURNS TABLE("id" "uuid", "name" "text", "description" "text", "image_url" "text", "price_per_person" numeric, "rating" numeric, "location" "text", "source_url" "text", "creator" "text", "menu_url" "text", "visited" boolean, "phone_numbers" "text"[], "creator_id" "uuid", "creator_name" "text", "created_at" timestamp with time zone, "images" "text"[], "display_image_index" integer, "menu_links" "text"[], "menu_images" "text"[], "latitude" numeric, "longitude" numeric, "cuisine_types" "text"[], "dietary_options" "text"[], "features" "text"[], "total_count" bigint, "next_cursor" "uuid")
    LANGUAGE "plpgsql" STABLE
    SET "search_path" TO 'pg_catalog, pg_temp'
    AS $$
BEGIN
    -- Return paginated results with cursor-based pagination
    RETURN QUERY
    WITH restaurant_data AS (
        SELECT 
            rdv.*,
            COUNT(*) OVER() as total_count,
            -- Get the next cursor (ID of the last item in current page)
            LEAD(rdv.id) OVER (ORDER BY rdv.created_at DESC, rdv.id DESC) as next_cursor_id
        FROM restaurant_data_view rdv
        WHERE rdv.creator_id = p_user_id
        AND (
            p_cursor IS NULL 
            OR rdv.created_at < (
                SELECT r.created_at FROM restaurants r WHERE r.id = p_cursor
            ) 
            OR (
                rdv.created_at = (
                    SELECT r.created_at FROM restaurants r WHERE r.id = p_cursor
                )
                AND rdv.id < p_cursor
            )
        )
        ORDER BY rdv.created_at DESC, rdv.id DESC
        LIMIT p_limit
    )
    SELECT 
        rd.id,
        rd.name,
        rd.description,
        rd.image_url,
        rd.price_per_person,
        rd.rating,
        rd.location,
        rd.source_url,
        rd.creator,
        rd.menu_url,
        rd.visited,
        rd.phone_numbers,
        rd.creator_id,
        rd.creator_name,
        rd.created_at,
        rd.images,
        rd.display_image_index,
        rd.menu_links,
        rd.menu_images,
        rd.latitude,
        rd.longitude,
        rd.cuisine_types,
        rd.dietary_options,
        rd.features,
        rd.total_count,
        rd.next_cursor_id
    FROM restaurant_data rd;
END;
$$;


ALTER FUNCTION "public"."get_user_restaurants_paginated"("p_user_id" "uuid", "p_limit" integer, "p_cursor" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    INSERT INTO public.profiles (user_id, display_name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)))
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."immutable_unaccent"("input_text" "text") RETURNS "text"
    LANGUAGE "sql" IMMUTABLE PARALLEL SAFE
    SET "search_path" TO 'pg_catalog, pg_temp'
    AS $$
  SELECT unaccent(input_text);
$$;


ALTER FUNCTION "public"."immutable_unaccent"("input_text" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."increment_visit_count"("p_user_id" "uuid", "p_restaurant_id" "uuid") RETURNS TABLE("visit_count" integer)
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  result INTEGER;
BEGIN
  -- Try to INSERT a new row
  INSERT INTO user_restaurant_visits (user_id, restaurant_id, visited, visit_count)
  VALUES (p_user_id, p_restaurant_id, true, 1)
  ON CONFLICT (user_id, restaurant_id) DO UPDATE
    SET visit_count = user_restaurant_visits.visit_count + 1,
        visited = true,
        updated_at = now()
  RETURNING user_restaurant_visits.visit_count INTO result;
  
  RETURN QUERY SELECT result;
END;
$$;


ALTER FUNCTION "public"."increment_visit_count"("p_user_id" "uuid", "p_restaurant_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."insert_filter_preset"("p_name" "text", "p_filters" "jsonb", "p_user_id" "uuid") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog, pg_temp'
    AS $$
DECLARE
  preset_id UUID;
BEGIN
  INSERT INTO filter_presets (name, filters, user_id)
  VALUES (p_name, p_filters, p_user_id)
  RETURNING id INTO preset_id;
  
  RETURN preset_id;
END;
$$;


ALTER FUNCTION "public"."insert_filter_preset"("p_name" "text", "p_filters" "jsonb", "p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_list_collaborator"("p_list_id" "uuid", "p_user_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.list_collaborators lc
    WHERE lc.list_id = p_list_id
    AND lc.user_id = p_user_id
  );
END;
$$;


ALTER FUNCTION "public"."is_list_collaborator"("p_list_id" "uuid", "p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_token_valid"("token" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM verified_users
    WHERE verification_token = token
    AND expires_at > now()
  );
END;
$$;


ALTER FUNCTION "public"."is_token_valid"("token" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_creator_fields"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog, pg_temp'
    AS $$
BEGIN
  -- Set creator_id to current user if not provided
  IF NEW.creator_id IS NULL THEN
    NEW.creator_id := auth.uid();
  END IF;

  -- Set creator_name from auth.users metadata if not provided
  IF NEW.creator_name IS NULL THEN
    SELECT COALESCE(raw_user_meta_data->>'name', raw_user_meta_data->>'full_name', email)
    INTO NEW.creator_name
    FROM auth.users
    WHERE id = NEW.creator_id;
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_creator_fields"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_slug_if_null"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $_$
DECLARE base text; cand text; n int := 2; exist bigint;
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    base := lower(regexp_replace(regexp_replace(trim(coalesce(NEW.name,'')), '[^a-zA-Z0-9]+', '-', 'g'), '^-+|-+$', '', 'g'));
    IF base = '' THEN base := 'item'; END IF;
    cand := base;
    EXECUTE format('SELECT count(*) FROM %I WHERE slug = %L', TG_TABLE_NAME, cand) INTO exist;
    WHILE exist > 0 LOOP
      cand := base || '-' || n; n := n + 1;
      EXECUTE format('SELECT count(*) FROM %I WHERE slug = %L', TG_TABLE_NAME, cand) INTO exist;
    END LOOP;
    NEW.slug := cand;
  END IF;
  RETURN NEW;
END $_$;


ALTER FUNCTION "public"."set_slug_if_null"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_filter_presets_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'pg_catalog, pg_temp'
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_filter_presets_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_list_restaurant_positions"("p_list_id" "uuid", "p_restaurant_ids" "uuid"[]) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- Update positions for all restaurants in the list using array index
  UPDATE list_restaurants lr
  SET position = idx - 1
  FROM unnest(p_restaurant_ids) WITH ORDINALITY AS t(restaurant_id, idx)
  WHERE lr.list_id = p_list_id
    AND lr.restaurant_id = t.restaurant_id;
END;
$$;


ALTER FUNCTION "public"."update_list_restaurant_positions"("p_list_id" "uuid", "p_restaurant_ids" "uuid"[]) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_marketing_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_marketing_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_notifications_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'pg_catalog, pg_temp'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_notifications_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_profile_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'pg_catalog, pg_temp'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_profile_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_restaurant_city_name"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'pg_catalog, pg_temp'
    AS $$
BEGIN
    -- This function will be called by a trigger to update city_name
    -- Implementation will be in application code using OpenStreetMap API
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_restaurant_city_name"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_restaurant_rating"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."update_restaurant_rating"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_restaurant_review_count"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    restaurant_id_to_update UUID;
BEGIN
    -- Determine which restaurant to update based on the operation
    IF TG_OP = 'DELETE' THEN
        restaurant_id_to_update := OLD.restaurant_id;
    ELSE
        restaurant_id_to_update := NEW.restaurant_id;
    END IF;

    -- Update the review count for the restaurant
    UPDATE public.restaurants SET
        review_count = (
            SELECT COUNT(*) FROM public.reviews 
            WHERE restaurant_id = restaurant_id_to_update
        )
    WHERE id = restaurant_id_to_update;

    -- Return appropriate row based on operation
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$;


ALTER FUNCTION "public"."update_restaurant_review_count"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_scheduled_meals_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'pg_catalog, pg_temp'
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_scheduled_meals_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'pg_catalog, pg_temp'
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_user_restaurant_visits_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_user_restaurant_visits_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_user_search_index"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog, pg_temp'
    AS $$
BEGIN
    -- Delete existing index entry if updating
    DELETE FROM public.user_search_index WHERE user_id = NEW.user_id;
    
    -- Insert new search index entry
    INSERT INTO public.user_search_index (
        user_id,
        display_name,
        location,
        bio,
        search_vector
    ) VALUES (
        NEW.user_id,
        NEW.display_name,
        NEW.location,
        NEW.bio,
        to_tsvector('portuguese', 
            COALESCE(NEW.display_name, '') || ' ' || 
            COALESCE(NEW.location, '') || ' ' || 
            COALESCE(NEW.bio, '')
        )
    );
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_user_search_index"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_user_stats"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
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
$$;


ALTER FUNCTION "public"."update_user_stats"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_user_stats_delete"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
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
$$;


ALTER FUNCTION "public"."update_user_stats_delete"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_user_subscriptions_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_user_subscriptions_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_visits_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_visits_updated_at"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."admin_roles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "admin_roles_role_check" CHECK (("role" = ANY (ARRAY['super_admin'::"text", 'moderator'::"text", 'viewer'::"text"])))
);


ALTER TABLE "public"."admin_roles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ai_workflows" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "trigger_type" "text" NOT NULL,
    "is_active" boolean DEFAULT true,
    "platform" "text" NOT NULL,
    "prompt_template" "text" NOT NULL,
    "schedule_cron" "text",
    "last_run_at" timestamp with time zone,
    "created_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone,
    CONSTRAINT "ai_workflows_trigger_type_check" CHECK (("trigger_type" = ANY (ARRAY['new_restaurant'::"text", 'new_review'::"text", 'weekly_digest'::"text", 'top_rated'::"text", 'manual'::"text"])))
);


ALTER TABLE "public"."ai_workflows" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."content_generation_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "workflow_id" "uuid",
    "post_id" "uuid",
    "prompt" "text" NOT NULL,
    "ai_response" "text",
    "status" "text" DEFAULT 'pending'::"text",
    "error_message" "text",
    "tokens_used" integer,
    "model_used" "text" DEFAULT 'gpt-4'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "content_generation_logs_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'success'::"text", 'failed'::"text"])))
);


ALTER TABLE "public"."content_generation_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."cuisine_types" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "icon" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."cuisine_types" OWNER TO "postgres";


COMMENT ON TABLE "public"."cuisine_types" IS 'Types of cuisine (Italian, Portuguese, etc.)';



COMMENT ON COLUMN "public"."cuisine_types"."name" IS 'Nome da categoria culinária';



COMMENT ON COLUMN "public"."cuisine_types"."description" IS 'Descrição opcional da categoria';



COMMENT ON COLUMN "public"."cuisine_types"."icon" IS 'Nome do ícone ou URL para ícone da categoria (opcional)';



CREATE TABLE IF NOT EXISTS "public"."filter_presets" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "filters" "jsonb" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."filter_presets" OWNER TO "postgres";


COMMENT ON TABLE "public"."filter_presets" IS 'User saved filter presets for restaurant filtering';



COMMENT ON COLUMN "public"."filter_presets"."name" IS 'Name of the filter preset';



COMMENT ON COLUMN "public"."filter_presets"."filters" IS 'JSON object containing the filter configuration';



COMMENT ON COLUMN "public"."filter_presets"."user_id" IS 'User who owns this preset';



COMMENT ON COLUMN "public"."filter_presets"."created_at" IS 'When the preset was created';



COMMENT ON COLUMN "public"."filter_presets"."updated_at" IS 'When the preset was last updated';



CREATE TABLE IF NOT EXISTS "public"."list_activities" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "list_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "action" "text" NOT NULL,
    "details" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "list_activities_action_check" CHECK (("action" = ANY (ARRAY['restaurant_added'::"text", 'restaurant_removed'::"text", 'list_updated'::"text", 'collaborator_added'::"text", 'collaborator_removed'::"text", 'list_duplicated'::"text"])))
);


ALTER TABLE "public"."list_activities" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."list_collaborators" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "list_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role" "text" DEFAULT 'editor'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "list_collaborators_role_check" CHECK (("role" = ANY (ARRAY['editor'::"text", 'viewer'::"text"])))
);


ALTER TABLE "public"."list_collaborators" OWNER TO "postgres";


COMMENT ON TABLE "public"."list_collaborators" IS 'Collaborators on lists with role-based access (RLS fixed in migration 053)';



CREATE TABLE IF NOT EXISTS "public"."list_comments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "list_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "comment" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."list_comments" OWNER TO "postgres";


COMMENT ON TABLE "public"."list_comments" IS 'Comments on public lists';



CREATE TABLE IF NOT EXISTS "public"."list_likes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "list_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."list_likes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."list_restaurants" (
    "list_id" "uuid" NOT NULL,
    "restaurant_id" "uuid" NOT NULL,
    "position" integer DEFAULT 0 NOT NULL
);


ALTER TABLE "public"."list_restaurants" OWNER TO "postgres";


COMMENT ON TABLE "public"."list_restaurants" IS 'Junction table linking lists to restaurants';



COMMENT ON COLUMN "public"."list_restaurants"."position" IS 'Custom ordering position within a list';



CREATE TABLE IF NOT EXISTS "public"."lists" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "created_at" timestamp without time zone DEFAULT "now"(),
    "creator" "text",
    "creator_id" "uuid",
    "creator_name" "text",
    "filters" "jsonb",
    "is_public" boolean DEFAULT true NOT NULL,
    "tags" "text"[] DEFAULT '{}'::"text"[],
    "cover_image_url" "text",
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "slug" "text"
);


ALTER TABLE "public"."lists" OWNER TO "postgres";


COMMENT ON TABLE "public"."lists" IS 'User-created lists of restaurants';



COMMENT ON COLUMN "public"."lists"."creator_id" IS 'UUID of the authenticated user who created this list';



COMMENT ON COLUMN "public"."lists"."creator_name" IS 'Cached name of the creator for performance';



COMMENT ON COLUMN "public"."lists"."filters" IS 'JSON object containing the filter configuration for this list';



COMMENT ON COLUMN "public"."lists"."tags" IS 'Array of tags for categorizing lists';



COMMENT ON COLUMN "public"."lists"."cover_image_url" IS 'URL for custom list cover image';



CREATE TABLE IF NOT EXISTS "public"."marketing_campaigns" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "status" "text" DEFAULT 'draft'::"text",
    "start_date" timestamp with time zone,
    "end_date" timestamp with time zone,
    "budget" numeric,
    "target_platforms" "text"[],
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone,
    CONSTRAINT "marketing_campaigns_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'active'::"text", 'paused'::"text", 'completed'::"text"])))
);


ALTER TABLE "public"."marketing_campaigns" OWNER TO "postgres";


COMMENT ON TABLE "public"."marketing_campaigns" IS 'Marketing campaigns for social media automation';



CREATE TABLE IF NOT EXISTS "public"."meal_participants" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "scheduled_meal_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "status" character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "chk_participant_status" CHECK ((("status")::"text" = ANY ((ARRAY['pending'::character varying, 'accepted'::character varying, 'declined'::character varying])::"text"[])))
);


ALTER TABLE "public"."meal_participants" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notification_preferences" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "email_notifications" boolean DEFAULT true NOT NULL,
    "push_notifications" boolean DEFAULT false NOT NULL,
    "meal_invitations" boolean DEFAULT true NOT NULL,
    "collaborator_updates" boolean DEFAULT true NOT NULL,
    "list_activity" boolean DEFAULT true NOT NULL,
    "system_updates" boolean DEFAULT true NOT NULL,
    "weekly_digest" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."notification_preferences" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "type" "text" NOT NULL,
    "title" "text" NOT NULL,
    "message" "text" NOT NULL,
    "link" "text",
    "read" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."notifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "display_name" "text",
    "bio" "text",
    "avatar_url" "text",
    "website" "text",
    "location" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "phone_number" "text",
    "user_id_code" character varying(10),
    "public_profile" boolean DEFAULT true,
    "total_reviews" integer DEFAULT 0,
    "total_lists" integer DEFAULT 0,
    "total_restaurants_added" integer DEFAULT 0,
    "is_admin" boolean DEFAULT false,
    "is_verified" boolean DEFAULT false,
    "verified_at" timestamp with time zone,
    "verification_method" character varying(50),
    "login_attempts" integer DEFAULT 0,
    "locked_until" timestamp with time zone,
    "subscription_tier" "text" DEFAULT 'free'::"text",
    "subscription_expires_at" timestamp with time zone,
    "is_active" boolean DEFAULT true,
    CONSTRAINT "profiles_subscription_tier_check" CHECK (("subscription_tier" = ANY (ARRAY['free'::"text", 'premium'::"text", 'pro'::"text"])))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


COMMENT ON TABLE "public"."profiles" IS 'User profile information';



COMMENT ON COLUMN "public"."profiles"."display_name" IS 'User display name that can be customized';



COMMENT ON COLUMN "public"."profiles"."bio" IS 'User biography or description';



COMMENT ON COLUMN "public"."profiles"."avatar_url" IS 'URL to user avatar image';



COMMENT ON COLUMN "public"."profiles"."website" IS 'User website URL';



COMMENT ON COLUMN "public"."profiles"."location" IS 'User location information';



COMMENT ON COLUMN "public"."profiles"."phone_number" IS 'User phone number for contact purposes';



COMMENT ON COLUMN "public"."profiles"."is_admin" IS 'Indicates if user has admin privileges';



COMMENT ON COLUMN "public"."profiles"."is_verified" IS 'Whether the user has verified their email address';



COMMENT ON COLUMN "public"."profiles"."verified_at" IS 'Timestamp when the user verified their email';



COMMENT ON COLUMN "public"."profiles"."verification_method" IS 'Method used for verification (e.g., email)';



COMMENT ON COLUMN "public"."profiles"."login_attempts" IS 'Number of consecutive failed login attempts';



COMMENT ON COLUMN "public"."profiles"."locked_until" IS 'Timestamp until which the account is locked due to failed login attempts';



COMMENT ON COLUMN "public"."profiles"."is_active" IS 'Soft delete flag: false = deactivated user';



CREATE OR REPLACE VIEW "public"."public_profiles" AS
 SELECT "profiles"."user_id",
    "profiles"."display_name",
    "profiles"."avatar_url",
    "profiles"."user_id_code",
    "profiles"."public_profile",
    "profiles"."bio",
    "profiles"."location",
    "profiles"."total_reviews",
    "profiles"."total_lists",
    "profiles"."total_restaurants_added"
   FROM "public"."profiles"
  WHERE ("profiles"."public_profile" = true);


ALTER TABLE "public"."public_profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."reports" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "target_type" "text" NOT NULL,
    "target_id" "uuid" NOT NULL,
    "reporter_id" "uuid" NOT NULL,
    "reason" "text" NOT NULL,
    "details" "text",
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "reports_reason_check" CHECK (("reason" = ANY (ARRAY['closed'::"text", 'wrong_data'::"text", 'prices'::"text", 'other'::"text", 'spam'::"text", 'offensive'::"text"]))),
    CONSTRAINT "reports_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'resolved'::"text", 'dismissed'::"text"]))),
    CONSTRAINT "reports_target_type_check" CHECK (("target_type" = ANY (ARRAY['restaurant'::"text", 'review'::"text", 'list'::"text", 'profile'::"text"])))
);


ALTER TABLE "public"."reports" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."restaurant_cuisine_types" (
    "restaurant_id" "uuid" NOT NULL,
    "cuisine_type_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."restaurant_cuisine_types" OWNER TO "postgres";


COMMENT ON TABLE "public"."restaurant_cuisine_types" IS 'Junction table linking restaurants to cuisine types';



CREATE TABLE IF NOT EXISTS "public"."restaurant_dietary_options" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "icon" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."restaurant_dietary_options" OWNER TO "postgres";


COMMENT ON TABLE "public"."restaurant_dietary_options" IS 'Dietary options like vegetarian, vegan, gluten-free, etc.';



CREATE TABLE IF NOT EXISTS "public"."restaurant_dietary_options_junction" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "restaurant_id" "uuid" NOT NULL,
    "dietary_option_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."restaurant_dietary_options_junction" OWNER TO "postgres";


COMMENT ON TABLE "public"."restaurant_dietary_options_junction" IS 'Junction table linking restaurants to their dietary options';



CREATE TABLE IF NOT EXISTS "public"."restaurant_features" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "icon" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."restaurant_features" OWNER TO "postgres";


COMMENT ON TABLE "public"."restaurant_features" IS 'Restaurant features including payment methods like multibanco and cash-only';



CREATE TABLE IF NOT EXISTS "public"."restaurant_restaurant_features" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "restaurant_id" "uuid" NOT NULL,
    "feature_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."restaurant_restaurant_features" OWNER TO "postgres";


COMMENT ON TABLE "public"."restaurant_restaurant_features" IS 'Junction table linking restaurants to their features';



CREATE TABLE IF NOT EXISTS "public"."restaurants" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "price_per_person" numeric(10,2),
    "rating" numeric(3,2),
    "location" "text",
    "source_url" "text",
    "creator" "text",
    "menu_url" "text",
    "phone_numbers" "text"[] DEFAULT '{}'::"text"[],
    "creator_id" "uuid",
    "creator_name" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "images" "text"[] DEFAULT '{}'::"text"[],
    "display_image_index" integer DEFAULT '-1'::integer,
    "menu_links" "text"[] DEFAULT '{}'::"text"[],
    "menu_images" "text"[] DEFAULT '{}'::"text"[],
    "latitude" numeric,
    "longitude" numeric,
    "review_count" integer DEFAULT 0,
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "opening_hours" "jsonb",
    "slug" "text",
    CONSTRAINT "check_display_image_index_valid" CHECK (("display_image_index" >= '-1'::integer)),
    CONSTRAINT "check_latitude_valid" CHECK ((("latitude" IS NULL) OR (("latitude" >= ('-90'::integer)::numeric) AND ("latitude" <= (90)::numeric)))),
    CONSTRAINT "check_longitude_valid" CHECK ((("longitude" IS NULL) OR (("longitude" >= ('-180'::integer)::numeric) AND ("longitude" <= (180)::numeric)))),
    CONSTRAINT "check_menu_images_limit" CHECK (("array_length"("menu_images", 1) <= 10)),
    CONSTRAINT "check_menu_links_limit" CHECK (("array_length"("menu_links", 1) <= 5)),
    CONSTRAINT "restaurants_rating_check" CHECK ((("rating" >= (0)::numeric) AND ("rating" <= (5)::numeric)))
);


ALTER TABLE "public"."restaurants" OWNER TO "postgres";


COMMENT ON TABLE "public"."restaurants" IS 'Restaurant information and details';



COMMENT ON COLUMN "public"."restaurants"."location" IS 'Location field for both address and city-based filtering. Supports both text addresses and coordinates (lat, lon format). Coordinates are automatically geocoded to city names for filtering.';



COMMENT ON COLUMN "public"."restaurants"."creator_id" IS 'UUID of the authenticated user who created this restaurant';



COMMENT ON COLUMN "public"."restaurants"."creator_name" IS 'Cached name of the creator for performance';



COMMENT ON COLUMN "public"."restaurants"."created_at" IS 'Timestamp when the restaurant was created';



COMMENT ON COLUMN "public"."restaurants"."images" IS 'Array of restaurant image URLs uploaded to Cloudinary';



COMMENT ON COLUMN "public"."restaurants"."display_image_index" IS 'Index of the main display image in the images array (-1 means use legacy image_url)';



COMMENT ON COLUMN "public"."restaurants"."menu_links" IS 'Array of external menu URLs (max 5)';



COMMENT ON COLUMN "public"."restaurants"."menu_images" IS 'Array of menu image URLs uploaded to Cloudinary (max 10)';



COMMENT ON COLUMN "public"."restaurants"."latitude" IS 'Latitude coordinate extracted from Google Maps URL for precise location mapping';



COMMENT ON COLUMN "public"."restaurants"."longitude" IS 'Longitude coordinate extracted from Google Maps URL for precise location mapping';



CREATE TABLE IF NOT EXISTS "public"."reviews" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "restaurant_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "rating" numeric(3,1) NOT NULL,
    "comment" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "user_name" "text" DEFAULT 'Anonymous User'::"text" NOT NULL,
    "amount_spent" numeric,
    "images" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    CONSTRAINT "reviews_rating_check" CHECK ((("rating" >= 0.5) AND ("rating" <= 5.0)))
);


ALTER TABLE "public"."reviews" OWNER TO "postgres";


COMMENT ON TABLE "public"."reviews" IS 'User reviews of restaurants';



COMMENT ON COLUMN "public"."reviews"."restaurant_id" IS 'Reference to the restaurant being reviewed';



COMMENT ON COLUMN "public"."reviews"."user_id" IS 'Reference to the user who wrote the review';



COMMENT ON COLUMN "public"."reviews"."rating" IS 'Rating from 0.5 to 5 stars';



COMMENT ON COLUMN "public"."reviews"."comment" IS 'Optional text comment for the review';



COMMENT ON COLUMN "public"."reviews"."user_name" IS 'Display name of the user who wrote the review';



COMMENT ON COLUMN "public"."reviews"."amount_spent" IS 'Amount spent on the meal in the review (optional)';



COMMENT ON COLUMN "public"."reviews"."images" IS 'Review experience photos (URLs, Cloudinary). Max 5 enforced in UI.';



CREATE TABLE IF NOT EXISTS "public"."scheduled_meals" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "restaurant_id" "uuid" NOT NULL,
    "organizer_id" "uuid" NOT NULL,
    "meal_date" "date" NOT NULL,
    "meal_time" time without time zone NOT NULL,
    "meal_type" character varying(50) NOT NULL,
    "duration_minutes" integer DEFAULT 120 NOT NULL,
    "google_calendar_link" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."scheduled_meals" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."schema_migrations" (
    "version" "text" NOT NULL,
    "description" "text",
    "installed_at" timestamp with time zone DEFAULT "now"(),
    "success" boolean DEFAULT true
);


ALTER TABLE "public"."schema_migrations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."social_media_posts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "campaign_id" "uuid",
    "restaurant_id" "uuid",
    "list_id" "uuid",
    "content" "text" NOT NULL,
    "platform" "text" NOT NULL,
    "post_type" "text" DEFAULT 'restaurant_promo'::"text",
    "media_urls" "text"[],
    "scheduled_for" timestamp with time zone,
    "published_at" timestamp with time zone,
    "status" "text" DEFAULT 'draft'::"text",
    "external_post_id" "text",
    "engagement_data" "jsonb" DEFAULT '{}'::"jsonb",
    "ai_generated" boolean DEFAULT false,
    "ai_prompt" "text",
    "created_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone,
    CONSTRAINT "social_media_posts_platform_check" CHECK (("platform" = ANY (ARRAY['twitter'::"text", 'instagram'::"text", 'facebook'::"text", 'linkedin'::"text", 'tiktok'::"text", 'youtube'::"text"]))),
    CONSTRAINT "social_media_posts_post_type_check" CHECK (("post_type" = ANY (ARRAY['restaurant_promo'::"text", 'list_digest'::"text", 'review_highlight'::"text", 'general'::"text"]))),
    CONSTRAINT "social_media_posts_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'scheduled'::"text", 'publishing'::"text", 'published'::"text", 'failed'::"text"])))
);


ALTER TABLE "public"."social_media_posts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."subscription_plans" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "price_monthly" numeric NOT NULL,
    "price_yearly" numeric,
    "currency" "text" DEFAULT 'EUR'::"text",
    "features" "text"[],
    "stripe_price_monthly_id" "text",
    "stripe_price_yearly_id" "text",
    "is_active" boolean DEFAULT true,
    "sort_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."subscription_plans" OWNER TO "postgres";


COMMENT ON TABLE "public"."subscription_plans" IS 'Available subscription plans';



CREATE TABLE IF NOT EXISTS "public"."user_activities" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "type" "text" NOT NULL,
    "content" "text" NOT NULL,
    "restaurant_id" "uuid",
    "list_id" "uuid",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "user_activities_type_check" CHECK (("type" = ANY (ARRAY['recommendation'::"text", 'visit'::"text", 'review'::"text", 'list_create'::"text"])))
);


ALTER TABLE "public"."user_activities" OWNER TO "postgres";


COMMENT ON TABLE "public"."user_activities" IS 'User activity feed for recommendations and social features';



CREATE TABLE IF NOT EXISTS "public"."user_cuisine_types" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_cuisine_types" OWNER TO "postgres";


COMMENT ON TABLE "public"."user_cuisine_types" IS 'User-defined custom cuisine type categories';



CREATE TABLE IF NOT EXISTS "public"."user_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "event" "text" NOT NULL,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."user_events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_follows" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "follower_id" "uuid" NOT NULL,
    "following_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."user_follows" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."user_id_sequence"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."user_id_sequence" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_search_index" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "display_name" "text",
    "location" "text",
    "bio" "text",
    "search_vector" "tsvector",
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_search_index" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_subscriptions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "plan_id" "uuid" NOT NULL,
    "status" "text" NOT NULL,
    "stripe_subscription_id" "text",
    "stripe_customer_id" "text",
    "current_period_start" timestamp with time zone,
    "current_period_end" timestamp with time zone,
    "cancel_at_period_end" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone,
    CONSTRAINT "user_subscriptions_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'canceled'::"text", 'past_due'::"text", 'trialing'::"text"])))
);


ALTER TABLE "public"."user_subscriptions" OWNER TO "postgres";


ALTER TABLE ONLY "public"."admin_roles"
    ADD CONSTRAINT "admin_roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."admin_roles"
    ADD CONSTRAINT "admin_roles_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."ai_workflows"
    ADD CONSTRAINT "ai_workflows_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."content_generation_logs"
    ADD CONSTRAINT "content_generation_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."cuisine_types"
    ADD CONSTRAINT "cuisine_types_name_unique" UNIQUE ("name");



ALTER TABLE ONLY "public"."cuisine_types"
    ADD CONSTRAINT "cuisine_types_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."filter_presets"
    ADD CONSTRAINT "filter_presets_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."list_activities"
    ADD CONSTRAINT "list_activities_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."list_collaborators"
    ADD CONSTRAINT "list_collaborators_list_id_user_id_key" UNIQUE ("list_id", "user_id");



ALTER TABLE ONLY "public"."list_collaborators"
    ADD CONSTRAINT "list_collaborators_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."list_comments"
    ADD CONSTRAINT "list_comments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."list_likes"
    ADD CONSTRAINT "list_likes_list_id_user_id_key" UNIQUE ("list_id", "user_id");



ALTER TABLE ONLY "public"."list_likes"
    ADD CONSTRAINT "list_likes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."list_restaurants"
    ADD CONSTRAINT "list_restaurants_pkey" PRIMARY KEY ("list_id", "restaurant_id");



ALTER TABLE ONLY "public"."lists"
    ADD CONSTRAINT "lists_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."marketing_campaigns"
    ADD CONSTRAINT "marketing_campaigns_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."meal_participants"
    ADD CONSTRAINT "meal_participants_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."meal_participants"
    ADD CONSTRAINT "meal_participants_scheduled_meal_id_user_id_key" UNIQUE ("scheduled_meal_id", "user_id");



ALTER TABLE ONLY "public"."notification_preferences"
    ADD CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notification_preferences"
    ADD CONSTRAINT "notification_preferences_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_user_id_code_key" UNIQUE ("user_id_code");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."reports"
    ADD CONSTRAINT "reports_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."restaurant_cuisine_types"
    ADD CONSTRAINT "restaurant_cuisine_types_pkey" PRIMARY KEY ("restaurant_id", "cuisine_type_id");



ALTER TABLE ONLY "public"."restaurant_dietary_options_junction"
    ADD CONSTRAINT "restaurant_dietary_options_junction_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."restaurant_dietary_options"
    ADD CONSTRAINT "restaurant_dietary_options_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."restaurant_features"
    ADD CONSTRAINT "restaurant_features_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."restaurant_restaurant_features"
    ADD CONSTRAINT "restaurant_restaurant_features_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."restaurants"
    ADD CONSTRAINT "restaurants_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_restaurant_id_user_id_key" UNIQUE ("restaurant_id", "user_id");



ALTER TABLE ONLY "public"."scheduled_meals"
    ADD CONSTRAINT "scheduled_meals_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."schema_migrations"
    ADD CONSTRAINT "schema_migrations_pkey" PRIMARY KEY ("version");



ALTER TABLE ONLY "public"."social_media_posts"
    ADD CONSTRAINT "social_media_posts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."subscription_plans"
    ADD CONSTRAINT "subscription_plans_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_activities"
    ADD CONSTRAINT "user_activities_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_cuisine_types"
    ADD CONSTRAINT "user_cuisine_types_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_cuisine_types"
    ADD CONSTRAINT "user_cuisine_types_user_id_name_key" UNIQUE ("user_id", "name");



ALTER TABLE ONLY "public"."user_events"
    ADD CONSTRAINT "user_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_follows"
    ADD CONSTRAINT "user_follows_follower_id_following_id_key" UNIQUE ("follower_id", "following_id");



ALTER TABLE ONLY "public"."user_follows"
    ADD CONSTRAINT "user_follows_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_search_index"
    ADD CONSTRAINT "user_search_index_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_search_index"
    ADD CONSTRAINT "user_search_index_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."user_subscriptions"
    ADD CONSTRAINT "user_subscriptions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_subscriptions"
    ADD CONSTRAINT "user_subscriptions_stripe_subscription_id_key" UNIQUE ("stripe_subscription_id");



CREATE INDEX "idx_ai_workflows_created_by" ON "public"."ai_workflows" USING "btree" ("created_by");



CREATE INDEX "idx_ai_workflows_trigger" ON "public"."ai_workflows" USING "btree" ("trigger_type") WHERE ("is_active" = true);



CREATE INDEX "idx_content_gen_logs_post" ON "public"."content_generation_logs" USING "btree" ("post_id");



CREATE INDEX "idx_content_gen_logs_workflow" ON "public"."content_generation_logs" USING "btree" ("workflow_id");



CREATE INDEX "idx_cuisine_types_name" ON "public"."cuisine_types" USING "btree" ("name");



CREATE INDEX "idx_filter_presets_user_id" ON "public"."filter_presets" USING "btree" ("user_id");



CREATE INDEX "idx_list_activities_list_id_created" ON "public"."list_activities" USING "btree" ("list_id", "created_at" DESC);



CREATE INDEX "idx_list_activities_list_id_created_at" ON "public"."list_activities" USING "btree" ("list_id", "created_at" DESC);



CREATE INDEX "idx_list_activities_user_id" ON "public"."list_activities" USING "btree" ("user_id");



CREATE INDEX "idx_list_collaborators_list" ON "public"."list_collaborators" USING "btree" ("list_id");



CREATE INDEX "idx_list_collaborators_list_id" ON "public"."list_collaborators" USING "btree" ("list_id");



CREATE INDEX "idx_list_collaborators_list_user" ON "public"."list_collaborators" USING "btree" ("list_id", "user_id");



CREATE INDEX "idx_list_collaborators_user_id" ON "public"."list_collaborators" USING "btree" ("user_id");



CREATE INDEX "idx_list_comments_created_at" ON "public"."list_comments" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_list_comments_list" ON "public"."list_comments" USING "btree" ("list_id", "created_at" DESC);



CREATE INDEX "idx_list_comments_list_id" ON "public"."list_comments" USING "btree" ("list_id");



CREATE INDEX "idx_list_comments_user_id" ON "public"."list_comments" USING "btree" ("user_id");



CREATE INDEX "idx_list_restaurants_list_id" ON "public"."list_restaurants" USING "btree" ("list_id");



CREATE INDEX "idx_list_restaurants_list_id_position" ON "public"."list_restaurants" USING "btree" ("list_id", "position");



CREATE INDEX "idx_list_restaurants_list_position" ON "public"."list_restaurants" USING "btree" ("list_id", "position");



CREATE INDEX "idx_list_restaurants_position" ON "public"."list_restaurants" USING "btree" ("list_id", "position");



CREATE INDEX "idx_list_restaurants_restaurant_id" ON "public"."list_restaurants" USING "btree" ("restaurant_id");



CREATE INDEX "idx_lists_creator" ON "public"."lists" USING "btree" ("creator_id");



CREATE INDEX "idx_lists_creator_id" ON "public"."lists" USING "btree" ("creator_id");



CREATE INDEX "idx_lists_creator_public" ON "public"."lists" USING "btree" ("creator_id", "is_public") WHERE ("creator_id" IS NOT NULL);



CREATE INDEX "idx_lists_filters" ON "public"."lists" USING "gin" ("filters");



CREATE INDEX "idx_lists_is_public" ON "public"."lists" USING "btree" ("is_public");



CREATE INDEX "idx_lists_name_btree" ON "public"."lists" USING "btree" ("lower"("name"));



CREATE INDEX "idx_lists_name_gin" ON "public"."lists" USING "gin" ("to_tsvector"('"simple"'::"regconfig", "name"));



CREATE INDEX "idx_lists_tags" ON "public"."lists" USING "gin" ("tags");



CREATE INDEX "idx_meal_participants_meal" ON "public"."meal_participants" USING "btree" ("scheduled_meal_id");



CREATE INDEX "idx_meal_participants_meal_id" ON "public"."meal_participants" USING "btree" ("scheduled_meal_id");



CREATE INDEX "idx_meal_participants_scheduled_meal_id" ON "public"."meal_participants" USING "btree" ("scheduled_meal_id");



CREATE INDEX "idx_meal_participants_status" ON "public"."meal_participants" USING "btree" ("status");



CREATE INDEX "idx_meal_participants_user" ON "public"."meal_participants" USING "btree" ("user_id");



CREATE INDEX "idx_meal_participants_user_id" ON "public"."meal_participants" USING "btree" ("user_id");



CREATE INDEX "idx_notifications_created_at" ON "public"."notifications" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_notifications_read" ON "public"."notifications" USING "btree" ("read");



CREATE INDEX "idx_notifications_user_created" ON "public"."notifications" USING "btree" ("user_id", "created_at" DESC);



CREATE INDEX "idx_notifications_user_id" ON "public"."notifications" USING "btree" ("user_id");



CREATE INDEX "idx_notifications_user_id_read" ON "public"."notifications" USING "btree" ("user_id", "read");



CREATE INDEX "idx_notifications_user_unread" ON "public"."notifications" USING "btree" ("user_id", "read", "created_at" DESC) WHERE ("read" = false);



CREATE INDEX "idx_profiles_is_active" ON "public"."profiles" USING "btree" ("is_active");



CREATE INDEX "idx_profiles_is_admin" ON "public"."profiles" USING "btree" ("is_admin") WHERE ("is_admin" = true);



CREATE INDEX "idx_profiles_public" ON "public"."profiles" USING "btree" ("public_profile") WHERE ("public_profile" = true);



CREATE INDEX "idx_profiles_user_id" ON "public"."profiles" USING "btree" ("user_id");



CREATE INDEX "idx_profiles_user_id_code" ON "public"."profiles" USING "btree" ("user_id_code");



CREATE INDEX "idx_restaurant_cuisine_types_cuisine_type_id" ON "public"."restaurant_cuisine_types" USING "btree" ("cuisine_type_id");



CREATE INDEX "idx_restaurant_cuisine_types_restaurant_id" ON "public"."restaurant_cuisine_types" USING "btree" ("restaurant_id");



CREATE INDEX "idx_restaurant_dietary_junction_restaurant_id" ON "public"."restaurant_dietary_options_junction" USING "btree" ("restaurant_id");



CREATE INDEX "idx_restaurant_dietary_options_junction_dietary_option_id" ON "public"."restaurant_dietary_options_junction" USING "btree" ("dietary_option_id");



CREATE INDEX "idx_restaurant_dietary_options_junction_option_id" ON "public"."restaurant_dietary_options_junction" USING "btree" ("dietary_option_id");



CREATE INDEX "idx_restaurant_dietary_options_junction_restaurant_id" ON "public"."restaurant_dietary_options_junction" USING "btree" ("restaurant_id");



CREATE INDEX "idx_restaurant_dietary_options_name" ON "public"."restaurant_dietary_options" USING "btree" ("name");



CREATE INDEX "idx_restaurant_dietary_restaurant" ON "public"."restaurant_dietary_options_junction" USING "btree" ("restaurant_id");



CREATE INDEX "idx_restaurant_features_junction_restaurant_id" ON "public"."restaurant_restaurant_features" USING "btree" ("restaurant_id");



CREATE INDEX "idx_restaurant_features_name" ON "public"."restaurant_features" USING "btree" ("name");



CREATE INDEX "idx_restaurant_features_restaurant" ON "public"."restaurant_restaurant_features" USING "btree" ("restaurant_id");



CREATE INDEX "idx_restaurant_restaurant_features_feature_id" ON "public"."restaurant_restaurant_features" USING "btree" ("feature_id");



CREATE INDEX "idx_restaurant_restaurant_features_restaurant_id" ON "public"."restaurant_restaurant_features" USING "btree" ("restaurant_id");



CREATE INDEX "idx_restaurants_coordinates" ON "public"."restaurants" USING "btree" ("latitude", "longitude");



CREATE INDEX "idx_restaurants_created_at" ON "public"."restaurants" USING "btree" ("created_at");



CREATE INDEX "idx_restaurants_creator" ON "public"."restaurants" USING "btree" ("creator_id", "created_at" DESC);



CREATE INDEX "idx_restaurants_creator_created_at" ON "public"."restaurants" USING "btree" ("creator_id", "created_at" DESC);



CREATE INDEX "idx_restaurants_creator_id" ON "public"."restaurants" USING "btree" ("creator_id");



CREATE INDEX "idx_restaurants_cuisine" ON "public"."restaurant_cuisine_types" USING "btree" ("cuisine_type_id");



CREATE INDEX "idx_restaurants_description_gin" ON "public"."restaurants" USING "gin" ("to_tsvector"('"simple"'::"regconfig", "description"));



CREATE INDEX "idx_restaurants_display_image_index" ON "public"."restaurants" USING "btree" ("display_image_index");



CREATE INDEX "idx_restaurants_images" ON "public"."restaurants" USING "gin" ("images");



CREATE INDEX "idx_restaurants_location" ON "public"."restaurants" USING "btree" ("location");



CREATE INDEX "idx_restaurants_location_gin" ON "public"."restaurants" USING "gin" ("to_tsvector"('"simple"'::"regconfig", "location"));



CREATE INDEX "idx_restaurants_location_lower" ON "public"."restaurants" USING "btree" ("lower"("location"));



COMMENT ON INDEX "public"."idx_restaurants_location_lower" IS 'Index for case-insensitive location search';



CREATE INDEX "idx_restaurants_location_pattern" ON "public"."restaurants" USING "btree" ("location" "varchar_pattern_ops");



COMMENT ON INDEX "public"."idx_restaurants_location_pattern" IS 'Index for pattern matching on location field';



CREATE INDEX "idx_restaurants_location_text" ON "public"."restaurants" USING "gin" ("to_tsvector"('"portuguese"'::"regconfig", "location"));



COMMENT ON INDEX "public"."idx_restaurants_location_text" IS 'Index for full-text search on location field';



CREATE INDEX "idx_restaurants_menu_images" ON "public"."restaurants" USING "gin" ("menu_images");



CREATE INDEX "idx_restaurants_menu_links" ON "public"."restaurants" USING "gin" ("menu_links");



CREATE INDEX "idx_restaurants_name" ON "public"."restaurants" USING "gin" ("to_tsvector"('"english"'::"regconfig", "name"));



CREATE INDEX "idx_restaurants_name_btree" ON "public"."restaurants" USING "btree" ("lower"("name"));



CREATE INDEX "idx_restaurants_name_gin" ON "public"."restaurants" USING "gin" ("to_tsvector"('"simple"'::"regconfig", "name"));



CREATE INDEX "idx_restaurants_price" ON "public"."restaurants" USING "btree" ("price_per_person");



CREATE INDEX "idx_restaurants_price_per_person" ON "public"."restaurants" USING "btree" ("price_per_person") WHERE ("price_per_person" IS NOT NULL);



CREATE INDEX "idx_restaurants_rating" ON "public"."restaurants" USING "btree" ("rating");



CREATE INDEX "idx_restaurants_rating_created" ON "public"."restaurants" USING "btree" ("rating" DESC NULLS LAST, "created_at" DESC);



CREATE INDEX "idx_restaurants_rating_desc" ON "public"."restaurants" USING "btree" ("rating" DESC NULLS LAST);



CREATE INDEX "idx_reviews_created_at" ON "public"."reviews" USING "btree" ("created_at");



CREATE INDEX "idx_reviews_created_at_desc" ON "public"."reviews" USING "btree" ("created_at" DESC);



COMMENT ON INDEX "public"."idx_reviews_created_at_desc" IS 'Optimizes review ordering by creation date';



CREATE INDEX "idx_reviews_rating" ON "public"."reviews" USING "btree" ("rating");



CREATE INDEX "idx_reviews_restaurant_id" ON "public"."reviews" USING "btree" ("restaurant_id");



CREATE INDEX "idx_reviews_restaurant_id_created" ON "public"."reviews" USING "btree" ("restaurant_id", "created_at" DESC);



CREATE INDEX "idx_reviews_restaurant_rating" ON "public"."reviews" USING "btree" ("restaurant_id", "rating");



CREATE INDEX "idx_reviews_restaurant_user_unique" ON "public"."reviews" USING "btree" ("restaurant_id", "user_id");



COMMENT ON INDEX "public"."idx_reviews_restaurant_user_unique" IS 'Ensures one review per user per restaurant';



CREATE INDEX "idx_reviews_user_id" ON "public"."reviews" USING "btree" ("user_id");



CREATE INDEX "idx_reviews_user_id_created" ON "public"."reviews" USING "btree" ("user_id", "created_at" DESC);



CREATE INDEX "idx_reviews_user_name" ON "public"."reviews" USING "btree" ("user_name");



CREATE INDEX "idx_reviews_user_restaurant" ON "public"."reviews" USING "btree" ("user_id", "restaurant_id");



CREATE INDEX "idx_scheduled_meals_date" ON "public"."scheduled_meals" USING "btree" ("meal_date");



CREATE INDEX "idx_scheduled_meals_date_range" ON "public"."scheduled_meals" USING "btree" ("meal_date", "meal_time");



CREATE INDEX "idx_scheduled_meals_meal_date" ON "public"."scheduled_meals" USING "btree" ("meal_date");



CREATE INDEX "idx_scheduled_meals_organizer" ON "public"."scheduled_meals" USING "btree" ("organizer_id");



CREATE INDEX "idx_scheduled_meals_organizer_id" ON "public"."scheduled_meals" USING "btree" ("organizer_id");



CREATE INDEX "idx_scheduled_meals_restaurant" ON "public"."scheduled_meals" USING "btree" ("restaurant_id");



CREATE INDEX "idx_scheduled_meals_restaurant_id" ON "public"."scheduled_meals" USING "btree" ("restaurant_id");



CREATE INDEX "idx_social_media_posts_campaign" ON "public"."social_media_posts" USING "btree" ("campaign_id");



CREATE INDEX "idx_social_media_posts_created_by" ON "public"."social_media_posts" USING "btree" ("created_by");



CREATE INDEX "idx_social_media_posts_scheduled" ON "public"."social_media_posts" USING "btree" ("scheduled_for") WHERE ("status" = 'scheduled'::"text");



CREATE INDEX "idx_social_media_posts_status" ON "public"."social_media_posts" USING "btree" ("status");



CREATE INDEX "idx_user_activities_created_at" ON "public"."user_activities" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_user_activities_type" ON "public"."user_activities" USING "btree" ("type");



CREATE INDEX "idx_user_activities_user_id" ON "public"."user_activities" USING "btree" ("user_id");



CREATE INDEX "idx_user_cuisine_types_user_id" ON "public"."user_cuisine_types" USING "btree" ("user_id");



CREATE INDEX "idx_user_events_event_created" ON "public"."user_events" USING "btree" ("event", "created_at" DESC);



CREATE INDEX "idx_user_search_index_display_name" ON "public"."user_search_index" USING "btree" ("display_name");



CREATE INDEX "idx_user_search_index_location" ON "public"."user_search_index" USING "btree" ("location");



CREATE INDEX "idx_user_search_index_search_vector" ON "public"."user_search_index" USING "gin" ("search_vector");



CREATE INDEX "idx_user_subscriptions_status" ON "public"."user_subscriptions" USING "btree" ("status");



CREATE INDEX "idx_user_subscriptions_status_period" ON "public"."user_subscriptions" USING "btree" ("status", "current_period_end") WHERE ("status" = 'active'::"text");



CREATE INDEX "idx_user_subscriptions_stripe_customer_id" ON "public"."user_subscriptions" USING "btree" ("stripe_customer_id") WHERE ("stripe_customer_id" IS NOT NULL);



CREATE INDEX "idx_user_subscriptions_stripe_subscription_id" ON "public"."user_subscriptions" USING "btree" ("stripe_subscription_id") WHERE ("stripe_subscription_id" IS NOT NULL);



CREATE INDEX "idx_user_subscriptions_user_id" ON "public"."user_subscriptions" USING "btree" ("user_id");



CREATE UNIQUE INDEX "lists_slug_key" ON "public"."lists" USING "btree" ("slug");



CREATE UNIQUE INDEX "reports_pending_dedup_idx" ON "public"."reports" USING "btree" ("reporter_id", "target_type", "target_id") WHERE ("status" = 'pending'::"text");



CREATE INDEX "restaurant_cuisine_types_cuisine_type_id_idx" ON "public"."restaurant_cuisine_types" USING "btree" ("cuisine_type_id");



CREATE INDEX "restaurant_cuisine_types_restaurant_id_idx" ON "public"."restaurant_cuisine_types" USING "btree" ("restaurant_id");



CREATE UNIQUE INDEX "restaurants_slug_key" ON "public"."restaurants" USING "btree" ("slug");



CREATE OR REPLACE TRIGGER "set_list_creator_fields" BEFORE INSERT ON "public"."lists" FOR EACH ROW EXECUTE FUNCTION "public"."set_creator_fields"();



CREATE OR REPLACE TRIGGER "set_restaurant_creator_fields" BEFORE INSERT ON "public"."restaurants" FOR EACH ROW EXECUTE FUNCTION "public"."set_creator_fields"();



CREATE OR REPLACE TRIGGER "trg_lists_slug" BEFORE INSERT ON "public"."lists" FOR EACH ROW EXECUTE FUNCTION "public"."set_slug_if_null"();



CREATE OR REPLACE TRIGGER "trg_restaurants_slug" BEFORE INSERT ON "public"."restaurants" FOR EACH ROW EXECUTE FUNCTION "public"."set_slug_if_null"();



CREATE OR REPLACE TRIGGER "trigger_generate_user_id_code" BEFORE INSERT ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."generate_user_id_code"();



CREATE OR REPLACE TRIGGER "trigger_update_restaurant_city_name" BEFORE INSERT OR UPDATE ON "public"."restaurants" FOR EACH ROW EXECUTE FUNCTION "public"."update_restaurant_city_name"();



CREATE OR REPLACE TRIGGER "trigger_update_restaurant_review_count" AFTER INSERT OR DELETE OR UPDATE ON "public"."reviews" FOR EACH ROW EXECUTE FUNCTION "public"."update_restaurant_review_count"();



CREATE OR REPLACE TRIGGER "trigger_update_scheduled_meals_updated_at" BEFORE UPDATE ON "public"."scheduled_meals" FOR EACH ROW EXECUTE FUNCTION "public"."update_scheduled_meals_updated_at"();



CREATE OR REPLACE TRIGGER "trigger_update_user_search_index" AFTER INSERT OR UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_user_search_index"();



CREATE OR REPLACE TRIGGER "trigger_update_user_stats_delete_lists" AFTER DELETE ON "public"."lists" FOR EACH ROW EXECUTE FUNCTION "public"."update_user_stats_delete"();



CREATE OR REPLACE TRIGGER "trigger_update_user_stats_delete_reviews" AFTER DELETE ON "public"."reviews" FOR EACH ROW EXECUTE FUNCTION "public"."update_user_stats_delete"();



CREATE OR REPLACE TRIGGER "update_ai_workflows_updated_at" BEFORE UPDATE ON "public"."ai_workflows" FOR EACH ROW EXECUTE FUNCTION "public"."update_marketing_updated_at"();



CREATE OR REPLACE TRIGGER "update_filter_presets_updated_at" BEFORE UPDATE ON "public"."filter_presets" FOR EACH ROW EXECUTE FUNCTION "public"."update_filter_presets_updated_at"();



CREATE OR REPLACE TRIGGER "update_marketing_campaigns_updated_at" BEFORE UPDATE ON "public"."marketing_campaigns" FOR EACH ROW EXECUTE FUNCTION "public"."update_marketing_updated_at"();



CREATE OR REPLACE TRIGGER "update_notifications_updated_at" BEFORE UPDATE ON "public"."notifications" FOR EACH ROW EXECUTE FUNCTION "public"."update_notifications_updated_at"();



CREATE OR REPLACE TRIGGER "update_profile_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_profile_updated_at"();



CREATE OR REPLACE TRIGGER "update_restaurant_rating_on_delete" AFTER DELETE ON "public"."reviews" FOR EACH ROW EXECUTE FUNCTION "public"."update_restaurant_rating"();



CREATE OR REPLACE TRIGGER "update_restaurant_rating_on_insert" AFTER INSERT ON "public"."reviews" FOR EACH ROW EXECUTE FUNCTION "public"."update_restaurant_rating"();



CREATE OR REPLACE TRIGGER "update_restaurant_rating_on_update" AFTER UPDATE ON "public"."reviews" FOR EACH ROW EXECUTE FUNCTION "public"."update_restaurant_rating"();



CREATE OR REPLACE TRIGGER "update_social_media_posts_updated_at" BEFORE UPDATE ON "public"."social_media_posts" FOR EACH ROW EXECUTE FUNCTION "public"."update_marketing_updated_at"();



CREATE OR REPLACE TRIGGER "update_user_subscriptions_updated_at" BEFORE UPDATE ON "public"."user_subscriptions" FOR EACH ROW EXECUTE FUNCTION "public"."update_user_subscriptions_updated_at"();



ALTER TABLE ONLY "public"."admin_roles"
    ADD CONSTRAINT "admin_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ai_workflows"
    ADD CONSTRAINT "ai_workflows_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("user_id");



ALTER TABLE ONLY "public"."content_generation_logs"
    ADD CONSTRAINT "content_generation_logs_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."social_media_posts"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."content_generation_logs"
    ADD CONSTRAINT "content_generation_logs_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "public"."ai_workflows"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."filter_presets"
    ADD CONSTRAINT "filter_presets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."list_activities"
    ADD CONSTRAINT "list_activities_list_id_fkey" FOREIGN KEY ("list_id") REFERENCES "public"."lists"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."list_activities"
    ADD CONSTRAINT "list_activities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."list_collaborators"
    ADD CONSTRAINT "list_collaborators_list_id_fkey" FOREIGN KEY ("list_id") REFERENCES "public"."lists"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."list_collaborators"
    ADD CONSTRAINT "list_collaborators_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."list_comments"
    ADD CONSTRAINT "list_comments_list_id_fkey" FOREIGN KEY ("list_id") REFERENCES "public"."lists"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."list_comments"
    ADD CONSTRAINT "list_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."list_likes"
    ADD CONSTRAINT "list_likes_list_id_fkey" FOREIGN KEY ("list_id") REFERENCES "public"."lists"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."list_likes"
    ADD CONSTRAINT "list_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."list_restaurants"
    ADD CONSTRAINT "list_restaurants_list_id_fkey" FOREIGN KEY ("list_id") REFERENCES "public"."lists"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."list_restaurants"
    ADD CONSTRAINT "list_restaurants_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."lists"
    ADD CONSTRAINT "lists_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."marketing_campaigns"
    ADD CONSTRAINT "marketing_campaigns_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."meal_participants"
    ADD CONSTRAINT "meal_participants_scheduled_meal_id_fkey" FOREIGN KEY ("scheduled_meal_id") REFERENCES "public"."scheduled_meals"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."meal_participants"
    ADD CONSTRAINT "meal_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notification_preferences"
    ADD CONSTRAINT "notification_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reports"
    ADD CONSTRAINT "reports_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."restaurant_cuisine_types"
    ADD CONSTRAINT "restaurant_cuisine_types_cuisine_type_id_fkey" FOREIGN KEY ("cuisine_type_id") REFERENCES "public"."cuisine_types"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."restaurant_cuisine_types"
    ADD CONSTRAINT "restaurant_cuisine_types_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."restaurant_dietary_options_junction"
    ADD CONSTRAINT "restaurant_dietary_options_junction_dietary_option_id_fkey" FOREIGN KEY ("dietary_option_id") REFERENCES "public"."restaurant_dietary_options"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."restaurant_dietary_options_junction"
    ADD CONSTRAINT "restaurant_dietary_options_junction_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."restaurant_restaurant_features"
    ADD CONSTRAINT "restaurant_restaurant_features_feature_id_fkey" FOREIGN KEY ("feature_id") REFERENCES "public"."restaurant_features"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."restaurant_restaurant_features"
    ADD CONSTRAINT "restaurant_restaurant_features_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."restaurants"
    ADD CONSTRAINT "restaurants_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."scheduled_meals"
    ADD CONSTRAINT "scheduled_meals_organizer_id_fkey" FOREIGN KEY ("organizer_id") REFERENCES "public"."profiles"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."scheduled_meals"
    ADD CONSTRAINT "scheduled_meals_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."social_media_posts"
    ADD CONSTRAINT "social_media_posts_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "public"."marketing_campaigns"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."social_media_posts"
    ADD CONSTRAINT "social_media_posts_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("user_id");



ALTER TABLE ONLY "public"."social_media_posts"
    ADD CONSTRAINT "social_media_posts_list_id_fkey" FOREIGN KEY ("list_id") REFERENCES "public"."lists"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."social_media_posts"
    ADD CONSTRAINT "social_media_posts_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurants"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."user_activities"
    ADD CONSTRAINT "user_activities_list_id_fkey" FOREIGN KEY ("list_id") REFERENCES "public"."lists"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."user_activities"
    ADD CONSTRAINT "user_activities_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurants"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."user_activities"
    ADD CONSTRAINT "user_activities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_cuisine_types"
    ADD CONSTRAINT "user_cuisine_types_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_events"
    ADD CONSTRAINT "user_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_follows"
    ADD CONSTRAINT "user_follows_follower_id_fkey" FOREIGN KEY ("follower_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_follows"
    ADD CONSTRAINT "user_follows_following_id_fkey" FOREIGN KEY ("following_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_search_index"
    ADD CONSTRAINT "user_search_index_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_subscriptions"
    ADD CONSTRAINT "user_subscriptions_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "public"."subscription_plans"("id");



ALTER TABLE ONLY "public"."user_subscriptions"
    ADD CONSTRAINT "user_subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE CASCADE;



CREATE POLICY "Admins can delete any review" ON "public"."reviews" FOR DELETE USING ("public"."current_user_is_admin"());



CREATE POLICY "Admins can delete restaurants" ON "public"."restaurants" FOR DELETE USING ("public"."current_user_is_admin"());



CREATE POLICY "Anyone can view active subscription plans" ON "public"."subscription_plans" FOR SELECT USING (("is_active" = true));



CREATE POLICY "Anyone can view meal participants" ON "public"."meal_participants" FOR SELECT USING (true);



CREATE POLICY "Anyone can view scheduled meals" ON "public"."scheduled_meals" FOR SELECT USING (true);



CREATE POLICY "Authenticated users can create reviews" ON "public"."reviews" FOR INSERT WITH CHECK ((("auth"."role"() = 'authenticated'::"text") AND ("auth"."uid"() = "user_id")));



CREATE POLICY "List owners can update collaborators" ON "public"."list_collaborators" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."lists" "l"
  WHERE (("l"."id" = "list_collaborators"."list_id") AND ("l"."creator_id" = "auth"."uid"())))));



CREATE POLICY "Only super admins can manage admin roles" ON "public"."admin_roles" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."user_id" = "auth"."uid"()) AND ("profiles"."is_admin" = true)))));



CREATE POLICY "Organizer can add participants" ON "public"."meal_participants" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."scheduled_meals"
  WHERE (("scheduled_meals"."id" = "meal_participants"."scheduled_meal_id") AND ("scheduled_meals"."organizer_id" = ( SELECT "auth"."uid"() AS "uid"))))));



CREATE POLICY "Organizer can delete their own meals" ON "public"."scheduled_meals" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "organizer_id"));



CREATE POLICY "Organizer can remove participants" ON "public"."meal_participants" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."scheduled_meals"
  WHERE (("scheduled_meals"."id" = "meal_participants"."scheduled_meal_id") AND ("scheduled_meals"."organizer_id" = ( SELECT "auth"."uid"() AS "uid"))))));



CREATE POLICY "Organizer can update participants" ON "public"."meal_participants" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."scheduled_meals"
  WHERE (("scheduled_meals"."id" = "meal_participants"."scheduled_meal_id") AND ("scheduled_meals"."organizer_id" = ( SELECT "auth"."uid"() AS "uid"))))));



CREATE POLICY "Organizer can update their own meals" ON "public"."scheduled_meals" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "organizer_id"));



CREATE POLICY "Permitir leitura de cuisine_types para todos" ON "public"."cuisine_types" FOR SELECT USING (true);



CREATE POLICY "Permitir leitura de list_restaurants para todos" ON "public"."list_restaurants" FOR SELECT USING (true);



CREATE POLICY "Permitir leitura de restaurant_cuisine_types para todos" ON "public"."restaurant_cuisine_types" FOR SELECT USING (true);



CREATE POLICY "Public lists are viewable by everyone" ON "public"."lists" FOR SELECT USING (("is_public" = true));



CREATE POLICY "Reviews are viewable by everyone" ON "public"."reviews" FOR SELECT USING (true);



CREATE POLICY "Service role can insert notifications" ON "public"."notifications" FOR INSERT WITH CHECK (((( SELECT "auth"."role"() AS "role") = 'service_role'::"text") AND ("user_id" IS NOT NULL) AND ("type" IS NOT NULL) AND ("title" IS NOT NULL) AND ("message" IS NOT NULL)));



CREATE POLICY "Users can create own activities" ON "public"."user_activities" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can create own cuisine types" ON "public"."user_cuisine_types" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can create scheduled meals" ON "public"."scheduled_meals" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "organizer_id"));



CREATE POLICY "Users can delete own activities" ON "public"."user_activities" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete own cuisine types" ON "public"."user_cuisine_types" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete own reviews" ON "public"."reviews" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own notifications" ON "public"."notifications" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can insert list activities" ON "public"."list_activities" FOR INSERT WITH CHECK (("list_id" IN ( SELECT "lists"."id"
   FROM "public"."lists"
  WHERE ("lists"."creator_id" = "auth"."uid"())
UNION
 SELECT "list_collaborators"."list_id"
   FROM "public"."list_collaborators"
  WHERE ("list_collaborators"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can insert own events" ON "public"."user_events" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own subscriptions" ON "public"."user_subscriptions" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage own campaigns" ON "public"."marketing_campaigns" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage own posts" ON "public"."social_media_posts" USING (("auth"."uid"() = "created_by"));



CREATE POLICY "Users can manage own workflows" ON "public"."ai_workflows" USING (("auth"."uid"() = "created_by"));



CREATE POLICY "Users can read search index" ON "public"."user_search_index" FOR SELECT USING (true);



CREATE POLICY "Users can read their own admin role" ON "public"."admin_roles" FOR SELECT USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can select own events" ON "public"."user_events" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own activities" ON "public"."user_activities" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own cuisine types" ON "public"."user_cuisine_types" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own reviews" ON "public"."reviews" FOR UPDATE USING ((("auth"."uid"() = "user_id") OR "public"."current_user_is_admin"())) WITH CHECK ((("auth"."uid"() = "user_id") OR "public"."current_user_is_admin"()));



CREATE POLICY "Users can update their own notifications" ON "public"."notifications" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can update their own status" ON "public"."meal_participants" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can update their own subscriptions" ON "public"."user_subscriptions" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view activities" ON "public"."user_activities" FOR SELECT USING ((("auth"."uid"() = "user_id") OR (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."user_id" = "user_activities"."user_id") AND ("profiles"."public_profile" = true))))));



CREATE POLICY "Users can view list activities" ON "public"."list_activities" FOR SELECT USING (("list_id" IN ( SELECT "lists"."id"
   FROM "public"."lists"
  WHERE ("lists"."creator_id" = "auth"."uid"())
UNION
 SELECT "list_collaborators"."list_id"
   FROM "public"."list_collaborators"
  WHERE ("list_collaborators"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can view own cuisine types" ON "public"."user_cuisine_types" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own generation logs" ON "public"."content_generation_logs" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."ai_workflows"
  WHERE (("ai_workflows"."id" = "content_generation_logs"."workflow_id") AND ("ai_workflows"."created_by" = "auth"."uid"())))));



CREATE POLICY "Users can view own lists" ON "public"."lists" FOR SELECT USING (("auth"."uid"() = "creator_id"));



CREATE POLICY "Users can view shared lists" ON "public"."lists" FOR SELECT USING (("auth"."uid"() IN ( SELECT "list_collaborators"."user_id"
   FROM "public"."list_collaborators"
  WHERE ("list_collaborators"."list_id" = "lists"."id"))));



CREATE POLICY "Users can view their own notifications" ON "public"."notifications" FOR SELECT USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can view their own subscriptions" ON "public"."user_subscriptions" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users cannot modify search index" ON "public"."user_search_index" USING ((( SELECT "auth"."role"() AS "role") = 'authenticated'::"text"));



ALTER TABLE "public"."admin_roles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ai_workflows" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."content_generation_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cuisine_types" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "cuisine_types_delete_policy" ON "public"."cuisine_types" FOR DELETE USING ((( SELECT "auth"."role"() AS "role") = 'authenticated'::"text"));



CREATE POLICY "cuisine_types_insert_policy" ON "public"."cuisine_types" FOR INSERT WITH CHECK ((( SELECT "auth"."role"() AS "role") = 'authenticated'::"text"));



CREATE POLICY "cuisine_types_select_policy" ON "public"."cuisine_types" FOR SELECT USING (true);



CREATE POLICY "cuisine_types_update_policy" ON "public"."cuisine_types" FOR UPDATE USING ((( SELECT "auth"."role"() AS "role") = 'authenticated'::"text"));



CREATE POLICY "dietary_options_delete_policy" ON "public"."restaurant_dietary_options" FOR DELETE USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "dietary_options_insert_policy" ON "public"."restaurant_dietary_options" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "dietary_options_select_policy" ON "public"."restaurant_dietary_options" FOR SELECT USING (true);



CREATE POLICY "dietary_options_update_policy" ON "public"."restaurant_dietary_options" FOR UPDATE USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "features_delete_policy" ON "public"."restaurant_features" FOR DELETE USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "features_insert_policy" ON "public"."restaurant_features" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "features_select_policy" ON "public"."restaurant_features" FOR SELECT USING (true);



CREATE POLICY "features_update_policy" ON "public"."restaurant_features" FOR UPDATE USING (("auth"."role"() = 'authenticated'::"text"));



ALTER TABLE "public"."filter_presets" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."list_activities" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."list_collaborators" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "list_collaborators_delete_policy" ON "public"."list_collaborators" FOR DELETE USING (("public"."check_list_ownership"("list_id") OR "public"."current_user_is_admin"()));



CREATE POLICY "list_collaborators_insert_policy" ON "public"."list_collaborators" FOR INSERT WITH CHECK (("public"."check_list_ownership"("list_id") OR "public"."current_user_is_admin"()));



CREATE POLICY "list_collaborators_select_policy" ON "public"."list_collaborators" FOR SELECT USING ((("user_id" = "auth"."uid"()) OR "public"."check_list_ownership"("list_id")));



CREATE POLICY "list_collaborators_update_policy" ON "public"."list_collaborators" FOR UPDATE USING (("public"."check_list_ownership"("list_id") OR "public"."current_user_is_admin"()));



ALTER TABLE "public"."list_comments" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "list_comments_delete_policy" ON "public"."list_comments" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "list_comments_insert_policy" ON "public"."list_comments" FOR INSERT WITH CHECK (((( SELECT "auth"."role"() AS "role") = 'authenticated'::"text") AND (EXISTS ( SELECT 1
   FROM "public"."lists"
  WHERE (("lists"."id" = "list_comments"."list_id") AND ("lists"."is_public" = true))))));



CREATE POLICY "list_comments_select_public" ON "public"."list_comments" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."lists"
  WHERE (("lists"."id" = "list_comments"."list_id") AND ("lists"."is_public" = true)))) OR (( SELECT "auth"."uid"() AS "uid") = "user_id")));



CREATE POLICY "list_comments_update_policy" ON "public"."list_comments" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



ALTER TABLE "public"."list_likes" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "list_likes_delete" ON "public"."list_likes" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "list_likes_insert" ON "public"."list_likes" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "list_likes_select" ON "public"."list_likes" FOR SELECT USING (true);



ALTER TABLE "public"."list_restaurants" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "list_restaurants_own_lists" ON "public"."list_restaurants" USING (((( SELECT "auth"."role"() AS "role") = 'authenticated'::"text") AND ((( SELECT "auth"."uid"() AS "uid") = ( SELECT "lists"."creator_id"
   FROM "public"."lists"
  WHERE ("lists"."id" = "list_restaurants"."list_id"))) OR (EXISTS ( SELECT 1
   FROM "public"."list_collaborators"
  WHERE (("list_collaborators"."list_id" = "list_restaurants"."list_id") AND ("list_collaborators"."user_id" = ( SELECT "auth"."uid"() AS "uid")) AND ("list_collaborators"."role" = 'editor'::"text")))) OR "public"."current_user_is_admin"())));



CREATE POLICY "list_restaurants_service_role" ON "public"."list_restaurants" USING ((( SELECT "auth"."role"() AS "role") = 'service_role'::"text"));



ALTER TABLE "public"."lists" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "lists_delete_policy" ON "public"."lists" FOR DELETE USING (((( SELECT "auth"."uid"() AS "uid") = "creator_id") OR "public"."current_user_is_admin"()));



CREATE POLICY "lists_insert_policy" ON "public"."lists" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "creator_id"));



CREATE POLICY "lists_select_policy" ON "public"."lists" FOR SELECT USING ((("is_public" = true) OR ("auth"."uid"() = "creator_id") OR "public"."can_access_list"("id", "auth"."uid"()) OR "public"."current_user_is_admin"()));



CREATE POLICY "lists_update_policy" ON "public"."lists" FOR UPDATE USING (((( SELECT "auth"."uid"() AS "uid") = "creator_id") OR "public"."can_edit_list"("id") OR "public"."current_user_is_admin"()));



ALTER TABLE "public"."marketing_campaigns" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."meal_participants" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notification_preferences" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "profiles_delete_policy" ON "public"."profiles" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "profiles_insert_policy" ON "public"."profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "profiles_read_public" ON "public"."profiles" FOR SELECT USING (true);



CREATE POLICY "profiles_select_policy" ON "public"."profiles" FOR SELECT USING ((("auth"."uid"() = "user_id") OR ("public_profile" = true)));



CREATE POLICY "profiles_service_role" ON "public"."profiles" USING (true) WITH CHECK (true);



CREATE POLICY "profiles_update_policy" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "profiles_user_insert" ON "public"."profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "profiles_user_ownership" ON "public"."profiles" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "profiles_user_update" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."reports" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "reports_insert_own" ON "public"."reports" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "reporter_id"));



CREATE POLICY "reports_select_own_or_admin" ON "public"."reports" FOR SELECT TO "authenticated" USING ((("auth"."uid"() = "reporter_id") OR "public"."current_user_is_admin"()));



CREATE POLICY "reports_update_admin" ON "public"."reports" FOR UPDATE TO "authenticated" USING ("public"."current_user_is_admin"());



ALTER TABLE "public"."restaurant_cuisine_types" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "restaurant_cuisine_types_own_restaurants" ON "public"."restaurant_cuisine_types" USING (((( SELECT "auth"."role"() AS "role") = 'authenticated'::"text") AND (EXISTS ( SELECT 1
   FROM "public"."restaurants"
  WHERE (("restaurants"."id" = "restaurant_cuisine_types"."restaurant_id") AND ("restaurants"."creator_id" = ( SELECT "auth"."uid"() AS "uid")))))));



CREATE POLICY "restaurant_cuisine_types_service_role" ON "public"."restaurant_cuisine_types" USING ((( SELECT "auth"."role"() AS "role") = 'service_role'::"text"));



ALTER TABLE "public"."restaurant_dietary_options" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."restaurant_dietary_options_junction" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "restaurant_dietary_options_junction_delete_authenticated" ON "public"."restaurant_dietary_options_junction" FOR DELETE USING (((( SELECT "auth"."role"() AS "role") = 'authenticated'::"text") AND (EXISTS ( SELECT 1
   FROM "public"."restaurants"
  WHERE (("restaurants"."id" = "restaurant_dietary_options_junction"."restaurant_id") AND ("restaurants"."creator_id" = ( SELECT "auth"."uid"() AS "uid")))))));



CREATE POLICY "restaurant_dietary_options_junction_insert_authenticated" ON "public"."restaurant_dietary_options_junction" FOR INSERT WITH CHECK (((( SELECT "auth"."role"() AS "role") = 'authenticated'::"text") AND (EXISTS ( SELECT 1
   FROM "public"."restaurants"
  WHERE (("restaurants"."id" = "restaurant_dietary_options_junction"."restaurant_id") AND ("restaurants"."creator_id" = ( SELECT "auth"."uid"() AS "uid")))))));



CREATE POLICY "restaurant_dietary_options_junction_select_public" ON "public"."restaurant_dietary_options_junction" FOR SELECT USING (true);



CREATE POLICY "restaurant_dietary_options_junction_service_role" ON "public"."restaurant_dietary_options_junction" USING ((( SELECT "auth"."role"() AS "role") = 'service_role'::"text"));



CREATE POLICY "restaurant_dietary_options_junction_update_authenticated" ON "public"."restaurant_dietary_options_junction" FOR UPDATE USING (((( SELECT "auth"."role"() AS "role") = 'authenticated'::"text") AND (EXISTS ( SELECT 1
   FROM "public"."restaurants"
  WHERE (("restaurants"."id" = "restaurant_dietary_options_junction"."restaurant_id") AND ("restaurants"."creator_id" = ( SELECT "auth"."uid"() AS "uid")))))));



ALTER TABLE "public"."restaurant_features" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "restaurant_features_junction_delete_authenticated" ON "public"."restaurant_restaurant_features" FOR DELETE USING (((( SELECT "auth"."role"() AS "role") = 'authenticated'::"text") AND (EXISTS ( SELECT 1
   FROM "public"."restaurants"
  WHERE (("restaurants"."id" = "restaurant_restaurant_features"."restaurant_id") AND ("restaurants"."creator_id" = ( SELECT "auth"."uid"() AS "uid")))))));



CREATE POLICY "restaurant_features_junction_insert_authenticated" ON "public"."restaurant_restaurant_features" FOR INSERT WITH CHECK (((( SELECT "auth"."role"() AS "role") = 'authenticated'::"text") AND (EXISTS ( SELECT 1
   FROM "public"."restaurants"
  WHERE (("restaurants"."id" = "restaurant_restaurant_features"."restaurant_id") AND ("restaurants"."creator_id" = ( SELECT "auth"."uid"() AS "uid")))))));



CREATE POLICY "restaurant_features_junction_select_public" ON "public"."restaurant_restaurant_features" FOR SELECT USING (true);



CREATE POLICY "restaurant_features_junction_service_role" ON "public"."restaurant_restaurant_features" USING ((( SELECT "auth"."role"() AS "role") = 'service_role'::"text"));



CREATE POLICY "restaurant_features_junction_update_authenticated" ON "public"."restaurant_restaurant_features" FOR UPDATE USING (((( SELECT "auth"."role"() AS "role") = 'authenticated'::"text") AND (EXISTS ( SELECT 1
   FROM "public"."restaurants"
  WHERE (("restaurants"."id" = "restaurant_restaurant_features"."restaurant_id") AND ("restaurants"."creator_id" = ( SELECT "auth"."uid"() AS "uid")))))));



ALTER TABLE "public"."restaurant_restaurant_features" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."restaurants" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "restaurants_insert_policy" ON "public"."restaurants" FOR INSERT WITH CHECK ((( SELECT "auth"."role"() AS "role") = 'authenticated'::"text"));



CREATE POLICY "restaurants_select_policy" ON "public"."restaurants" FOR SELECT USING (true);



CREATE POLICY "restaurants_update_policy" ON "public"."restaurants" FOR UPDATE USING (((( SELECT "auth"."uid"() AS "uid") = "creator_id") OR "public"."current_user_is_admin"()));



ALTER TABLE "public"."reviews" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "reviews_select_policy" ON "public"."reviews" FOR SELECT USING (true);



ALTER TABLE "public"."scheduled_meals" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."schema_migrations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."social_media_posts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."subscription_plans" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_activities" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_cuisine_types" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_follows" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "user_follows_delete" ON "public"."user_follows" FOR DELETE USING (("auth"."uid"() = "follower_id"));



CREATE POLICY "user_follows_insert" ON "public"."user_follows" FOR INSERT WITH CHECK (("auth"."uid"() = "follower_id"));



CREATE POLICY "user_follows_select" ON "public"."user_follows" FOR SELECT USING (true);



ALTER TABLE "public"."user_search_index" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_subscriptions" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "service_role";

















































































































































































GRANT ALL ON FUNCTION "public"."can_access_list"("p_list_id" "uuid", "p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."can_access_list"("p_list_id" "uuid", "p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."can_access_list"("p_list_id" "uuid", "p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."can_edit_list"("p_list_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."can_edit_list"("p_list_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."can_edit_list"("p_list_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."check_list_ownership"("check_list_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."check_list_ownership"("check_list_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_list_ownership"("check_list_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_notification_preferences"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_notification_preferences"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_notification_preferences"() TO "service_role";



GRANT ALL ON FUNCTION "public"."create_verified_users_table"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_verified_users_table"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_verified_users_table"() TO "service_role";



GRANT ALL ON FUNCTION "public"."current_user_is_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."current_user_is_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."current_user_is_admin"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."exec_sql"("sql" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."exec_sql"("sql" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."exec_sql"("sql" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."exec_sql"("sql" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_user_id_code"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_user_id_code"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_user_id_code"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_created_at_from_id"("restaurant_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_created_at_from_id"("restaurant_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_created_at_from_id"("restaurant_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_restaurant_review_count"("restaurant_id_param" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_restaurant_review_count"("restaurant_id_param" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_restaurant_review_count"("restaurant_id_param" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_reviews_with_users"("restaurant_id_param" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_reviews_with_users"("restaurant_id_param" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_reviews_with_users"("restaurant_id_param" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_display_name"("user_uuid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_display_name"("user_uuid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_display_name"("user_uuid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_profiles"("user_ids" "uuid"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_profiles"("user_ids" "uuid"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_profiles"("user_ids" "uuid"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_restaurants_paginated"("p_user_id" "uuid", "p_limit" integer, "p_cursor" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_restaurants_paginated"("p_user_id" "uuid", "p_limit" integer, "p_cursor" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_restaurants_paginated"("p_user_id" "uuid", "p_limit" integer, "p_cursor" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."immutable_unaccent"("input_text" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."immutable_unaccent"("input_text" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."immutable_unaccent"("input_text" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."increment_visit_count"("p_user_id" "uuid", "p_restaurant_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."increment_visit_count"("p_user_id" "uuid", "p_restaurant_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."increment_visit_count"("p_user_id" "uuid", "p_restaurant_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."insert_filter_preset"("p_name" "text", "p_filters" "jsonb", "p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."insert_filter_preset"("p_name" "text", "p_filters" "jsonb", "p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."insert_filter_preset"("p_name" "text", "p_filters" "jsonb", "p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_list_collaborator"("p_list_id" "uuid", "p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_list_collaborator"("p_list_id" "uuid", "p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_list_collaborator"("p_list_id" "uuid", "p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_token_valid"("token" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."is_token_valid"("token" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_token_valid"("token" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."set_creator_fields"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_creator_fields"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_creator_fields"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "postgres";
GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "anon";
GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "service_role";



GRANT ALL ON FUNCTION "public"."set_slug_if_null"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_slug_if_null"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_slug_if_null"() TO "service_role";



GRANT ALL ON FUNCTION "public"."show_limit"() TO "postgres";
GRANT ALL ON FUNCTION "public"."show_limit"() TO "anon";
GRANT ALL ON FUNCTION "public"."show_limit"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."show_limit"() TO "service_role";



GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "postgres";
GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "anon";
GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "service_role";



GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."unaccent"("text") TO "postgres";
GRANT ALL ON FUNCTION "public"."unaccent"("text") TO "anon";
GRANT ALL ON FUNCTION "public"."unaccent"("text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."unaccent"("text") TO "service_role";



GRANT ALL ON FUNCTION "public"."unaccent"("regdictionary", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."unaccent"("regdictionary", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."unaccent"("regdictionary", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."unaccent"("regdictionary", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."unaccent_init"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."unaccent_init"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."unaccent_init"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."unaccent_init"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."unaccent_lexize"("internal", "internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."unaccent_lexize"("internal", "internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."unaccent_lexize"("internal", "internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."unaccent_lexize"("internal", "internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_filter_presets_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_filter_presets_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_filter_presets_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_list_restaurant_positions"("p_list_id" "uuid", "p_restaurant_ids" "uuid"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."update_list_restaurant_positions"("p_list_id" "uuid", "p_restaurant_ids" "uuid"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_list_restaurant_positions"("p_list_id" "uuid", "p_restaurant_ids" "uuid"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."update_marketing_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_marketing_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_marketing_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_notifications_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_notifications_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_notifications_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_profile_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_profile_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_profile_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_restaurant_city_name"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_restaurant_city_name"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_restaurant_city_name"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_restaurant_rating"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_restaurant_rating"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_restaurant_rating"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_restaurant_review_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_restaurant_review_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_restaurant_review_count"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_scheduled_meals_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_scheduled_meals_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_scheduled_meals_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_user_restaurant_visits_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_user_restaurant_visits_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_user_restaurant_visits_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_user_search_index"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_user_search_index"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_user_search_index"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_user_stats"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_user_stats"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_user_stats"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_user_stats_delete"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_user_stats_delete"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_user_stats_delete"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_user_subscriptions_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_user_subscriptions_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_user_subscriptions_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_visits_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_visits_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_visits_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "service_role";



























GRANT ALL ON TABLE "public"."admin_roles" TO "anon";
GRANT ALL ON TABLE "public"."admin_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_roles" TO "service_role";



GRANT ALL ON TABLE "public"."ai_workflows" TO "anon";
GRANT ALL ON TABLE "public"."ai_workflows" TO "authenticated";
GRANT ALL ON TABLE "public"."ai_workflows" TO "service_role";



GRANT ALL ON TABLE "public"."content_generation_logs" TO "anon";
GRANT ALL ON TABLE "public"."content_generation_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."content_generation_logs" TO "service_role";



GRANT ALL ON TABLE "public"."cuisine_types" TO "anon";
GRANT ALL ON TABLE "public"."cuisine_types" TO "authenticated";
GRANT ALL ON TABLE "public"."cuisine_types" TO "service_role";



GRANT ALL ON TABLE "public"."filter_presets" TO "anon";
GRANT ALL ON TABLE "public"."filter_presets" TO "authenticated";
GRANT ALL ON TABLE "public"."filter_presets" TO "service_role";



GRANT ALL ON TABLE "public"."list_activities" TO "anon";
GRANT ALL ON TABLE "public"."list_activities" TO "authenticated";
GRANT ALL ON TABLE "public"."list_activities" TO "service_role";



GRANT ALL ON TABLE "public"."list_collaborators" TO "anon";
GRANT ALL ON TABLE "public"."list_collaborators" TO "authenticated";
GRANT ALL ON TABLE "public"."list_collaborators" TO "service_role";



GRANT ALL ON TABLE "public"."list_comments" TO "anon";
GRANT ALL ON TABLE "public"."list_comments" TO "authenticated";
GRANT ALL ON TABLE "public"."list_comments" TO "service_role";



GRANT ALL ON TABLE "public"."list_likes" TO "anon";
GRANT ALL ON TABLE "public"."list_likes" TO "authenticated";
GRANT ALL ON TABLE "public"."list_likes" TO "service_role";



GRANT ALL ON TABLE "public"."list_restaurants" TO "anon";
GRANT ALL ON TABLE "public"."list_restaurants" TO "authenticated";
GRANT ALL ON TABLE "public"."list_restaurants" TO "service_role";



GRANT ALL ON TABLE "public"."lists" TO "anon";
GRANT ALL ON TABLE "public"."lists" TO "authenticated";
GRANT ALL ON TABLE "public"."lists" TO "service_role";



GRANT ALL ON TABLE "public"."marketing_campaigns" TO "anon";
GRANT ALL ON TABLE "public"."marketing_campaigns" TO "authenticated";
GRANT ALL ON TABLE "public"."marketing_campaigns" TO "service_role";



GRANT ALL ON TABLE "public"."meal_participants" TO "anon";
GRANT ALL ON TABLE "public"."meal_participants" TO "authenticated";
GRANT ALL ON TABLE "public"."meal_participants" TO "service_role";



GRANT ALL ON TABLE "public"."notification_preferences" TO "anon";
GRANT ALL ON TABLE "public"."notification_preferences" TO "authenticated";
GRANT ALL ON TABLE "public"."notification_preferences" TO "service_role";



GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."public_profiles" TO "anon";
GRANT ALL ON TABLE "public"."public_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."public_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."reports" TO "anon";
GRANT ALL ON TABLE "public"."reports" TO "authenticated";
GRANT ALL ON TABLE "public"."reports" TO "service_role";



GRANT ALL ON TABLE "public"."restaurant_cuisine_types" TO "anon";
GRANT ALL ON TABLE "public"."restaurant_cuisine_types" TO "authenticated";
GRANT ALL ON TABLE "public"."restaurant_cuisine_types" TO "service_role";



GRANT ALL ON TABLE "public"."restaurant_dietary_options" TO "anon";
GRANT ALL ON TABLE "public"."restaurant_dietary_options" TO "authenticated";
GRANT ALL ON TABLE "public"."restaurant_dietary_options" TO "service_role";



GRANT ALL ON TABLE "public"."restaurant_dietary_options_junction" TO "anon";
GRANT ALL ON TABLE "public"."restaurant_dietary_options_junction" TO "authenticated";
GRANT ALL ON TABLE "public"."restaurant_dietary_options_junction" TO "service_role";



GRANT ALL ON TABLE "public"."restaurant_features" TO "anon";
GRANT ALL ON TABLE "public"."restaurant_features" TO "authenticated";
GRANT ALL ON TABLE "public"."restaurant_features" TO "service_role";



GRANT ALL ON TABLE "public"."restaurant_restaurant_features" TO "anon";
GRANT ALL ON TABLE "public"."restaurant_restaurant_features" TO "authenticated";
GRANT ALL ON TABLE "public"."restaurant_restaurant_features" TO "service_role";



GRANT ALL ON TABLE "public"."restaurants" TO "anon";
GRANT ALL ON TABLE "public"."restaurants" TO "authenticated";
GRANT ALL ON TABLE "public"."restaurants" TO "service_role";



GRANT ALL ON TABLE "public"."reviews" TO "anon";
GRANT ALL ON TABLE "public"."reviews" TO "authenticated";
GRANT ALL ON TABLE "public"."reviews" TO "service_role";



GRANT ALL ON TABLE "public"."scheduled_meals" TO "anon";
GRANT ALL ON TABLE "public"."scheduled_meals" TO "authenticated";
GRANT ALL ON TABLE "public"."scheduled_meals" TO "service_role";



GRANT ALL ON TABLE "public"."schema_migrations" TO "anon";
GRANT ALL ON TABLE "public"."schema_migrations" TO "authenticated";
GRANT ALL ON TABLE "public"."schema_migrations" TO "service_role";



GRANT ALL ON TABLE "public"."social_media_posts" TO "anon";
GRANT ALL ON TABLE "public"."social_media_posts" TO "authenticated";
GRANT ALL ON TABLE "public"."social_media_posts" TO "service_role";



GRANT ALL ON TABLE "public"."subscription_plans" TO "anon";
GRANT ALL ON TABLE "public"."subscription_plans" TO "authenticated";
GRANT ALL ON TABLE "public"."subscription_plans" TO "service_role";



GRANT ALL ON TABLE "public"."user_activities" TO "anon";
GRANT ALL ON TABLE "public"."user_activities" TO "authenticated";
GRANT ALL ON TABLE "public"."user_activities" TO "service_role";



GRANT ALL ON TABLE "public"."user_cuisine_types" TO "anon";
GRANT ALL ON TABLE "public"."user_cuisine_types" TO "authenticated";
GRANT ALL ON TABLE "public"."user_cuisine_types" TO "service_role";



GRANT ALL ON TABLE "public"."user_events" TO "anon";
GRANT ALL ON TABLE "public"."user_events" TO "authenticated";
GRANT ALL ON TABLE "public"."user_events" TO "service_role";



GRANT ALL ON TABLE "public"."user_follows" TO "anon";
GRANT ALL ON TABLE "public"."user_follows" TO "authenticated";
GRANT ALL ON TABLE "public"."user_follows" TO "service_role";



GRANT ALL ON SEQUENCE "public"."user_id_sequence" TO "anon";
GRANT ALL ON SEQUENCE "public"."user_id_sequence" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."user_id_sequence" TO "service_role";



GRANT ALL ON TABLE "public"."user_search_index" TO "anon";
GRANT ALL ON TABLE "public"."user_search_index" TO "authenticated";
GRANT ALL ON TABLE "public"."user_search_index" TO "service_role";



GRANT ALL ON TABLE "public"."user_subscriptions" TO "anon";
GRANT ALL ON TABLE "public"."user_subscriptions" TO "authenticated";
GRANT ALL ON TABLE "public"."user_subscriptions" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";































-- repor o search_path (o dump fixa-o a vazio e afetaria os seeds)
SELECT pg_catalog.set_config('search_path', '"$user", public, extensions', false);
