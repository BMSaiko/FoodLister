-- Migration: Add phone_number column to profiles table
-- Created: 2026-01-18

ALTER TABLE public.profiles
ADD COLUMN phone_number text;

-- Add comment to the column
COMMENT ON COLUMN public.profiles.phone_number IS 'User phone number for contact purposes';
