-- Migration: Fix signup 500 "Database error saving new user"
-- generate_user_id_code() (mig 013) was hardened (migs 007/029) with
--   SET search_path TO 'pg_catalog, pg_temp'   (no 'public')
-- but calls nextval('user_id_sequence') UNQUALIFIED. The sequence lives in
-- public, so it's invisible under that search_path -> trigger
-- trigger_generate_user_id_code aborts -> the whole auth.users INSERT fails
-- -> every signup 500'd. Fully-qualify the sequence (and drop pg_temp).

CREATE OR REPLACE FUNCTION public.generate_user_id_code()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $function$
DECLARE
    next_id INTEGER;
    user_code VARCHAR(10);
BEGIN
    SELECT nextval('public.user_id_sequence') INTO next_id;
    user_code := 'FL' || LPAD(next_id::TEXT, 6, '0');
    NEW.user_id_code := user_code;
    RETURN NEW;
END;
$function$;
