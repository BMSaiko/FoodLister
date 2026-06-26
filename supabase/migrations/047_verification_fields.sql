-- Migration: Add verification and security fields to profiles table

-- Add verification fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE NULL,
ADD COLUMN IF NOT EXISTS verification_method VARCHAR(50) NULL,
ADD COLUMN IF NOT EXISTS login_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP WITH TIME ZONE NULL;

-- Add comments to describe the new columns
COMMENT ON COLUMN public.profiles.is_verified IS 'Whether the user has verified their email address';
COMMENT ON COLUMN public.profiles.verified_at IS 'Timestamp when the user verified their email';
COMMENT ON COLUMN public.profiles.verification_method IS 'Method used for verification (e.g., email)';
COMMENT ON COLUMN public.profiles.login_attempts IS 'Number of consecutive failed login attempts';
COMMENT ON COLUMN public.profiles.locked_until IS 'Timestamp until which the account is locked due to failed login attempts';