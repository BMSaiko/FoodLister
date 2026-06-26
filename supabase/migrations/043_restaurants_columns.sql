-- Migration: Add missing columns to restaurants and lists tables
-- Added: opening_hours, updated_at to restaurants; updated_at to lists

ALTER TABLE public.restaurants
  ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now(),
  ADD COLUMN IF NOT EXISTS opening_hours jsonb;

ALTER TABLE public.lists
  ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();
