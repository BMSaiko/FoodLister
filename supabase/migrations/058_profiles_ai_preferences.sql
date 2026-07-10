-- Add ai_preferences column to profiles (AI marketing content generation preferences)
-- ponytail: jsonb prefs blob, no consumer yet; typed `any` in database.ts to match
--          the marketing feature's existing `engagement_data: any` convention.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ai_preferences jsonb DEFAULT '{}'::jsonb;

COMMENT ON COLUMN profiles.ai_preferences IS
  'User preferences for AI marketing content generation (tone, style, default platforms, etc.)';
