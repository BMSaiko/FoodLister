-- Migration: Redirect list_comments and list_activities FK from auth.users to profiles
-- Created: 2026-06-26
-- Purpose: Resolves PostgREST PGRST200 error "Could not find a relationship between
-- 'list_comments'/'list_activities' and 'profiles'" — the API queries use
-- .select('*, profiles(...)') which requires a direct FK from user_id to profiles(user_id).

-- Step 1: Fix list_comments FK
ALTER TABLE IF EXISTS public.list_comments
  DROP CONSTRAINT IF EXISTS list_comments_user_id_fkey;

ALTER TABLE IF EXISTS public.list_comments
  ADD CONSTRAINT list_comments_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- Step 2: Fix list_activities FK
ALTER TABLE IF EXISTS public.list_activities
  DROP CONSTRAINT IF EXISTS list_activities_user_id_fkey;

ALTER TABLE IF EXISTS public.list_activities
  ADD CONSTRAINT list_activities_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- ROLLBACK:
-- ALTER TABLE public.list_comments
--   DROP CONSTRAINT list_comments_user_id_fkey,
--   ADD CONSTRAINT list_comments_user_id_fkey
--     FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
-- ALTER TABLE public.list_activities
--   DROP CONSTRAINT list_activities_user_id_fkey,
--   ADD CONSTRAINT list_activities_user_id_fkey
--     FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
