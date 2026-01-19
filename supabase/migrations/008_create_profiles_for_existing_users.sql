-- Migration: Create profile entries for specific existing users
-- Creates profiles for the specified user IDs
-- Created: 2026-01-18

-- Insert profiles for the specified existing users (only if they don't exist)
INSERT INTO public.profiles (user_id, display_name, bio, avatar_url, website, location, phone_number)
SELECT
    u.id as user_id,
    COALESCE(u.raw_user_meta_data->>'display_name', u.raw_user_meta_data->>'name', u.raw_user_meta_data->>'full_name') as display_name,
    COALESCE(u.raw_user_meta_data->>'description', u.raw_user_meta_data->>'bio') as bio,
    COALESCE(u.raw_user_meta_data->>'profile_image', u.raw_user_meta_data->>'avatar_url') as avatar_url,
    u.raw_user_meta_data->>'website' as website,
    u.raw_user_meta_data->>'location' as location,
    COALESCE(u.raw_user_meta_data->>'phone_number', u.raw_user_meta_data->>'phone') as phone_number
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.user_id
WHERE p.user_id IS NULL
  AND u.id IN (
    'bd7ed8d8-3d08-4357-813d-88266e6f867c',
    'b3ef4a72-4f34-4da5-9385-ab2d9130f11c',
    '69b03c84-56db-4570-b5a5-9d74a37b18f8'
  );

-- Add comment to the migration
COMMENT ON DATABASE CURRENT_DATABASE IS 'Migration 008: Created profile entries for specific existing users';
