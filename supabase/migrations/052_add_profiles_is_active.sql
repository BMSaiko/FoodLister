-- Add is_active column to profiles table (for soft delete)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON profiles(is_active);

-- Update existing rows to be active
UPDATE profiles SET is_active = true WHERE is_active IS NULL;

-- Add comment
COMMENT ON COLUMN profiles.is_active IS 'Soft delete flag: false = deactivated user';
