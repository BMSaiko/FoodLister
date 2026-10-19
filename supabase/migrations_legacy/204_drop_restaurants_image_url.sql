-- Migration: Drop restaurants.image_url (T65)
-- image_url was the legacy cover fallback (display_image_index: -1 = image_url, 0+ = images[]).
-- Backfill (203) moved all real legacy image_urls into images[0] + display_image_index=0.
-- All app callers no longer reference image_url (Fase 1-3 done: strip fallback, selects, types).
-- Safe now. 2026-08-13.
ALTER TABLE public.restaurants DROP COLUMN IF EXISTS image_url;
