-- Migration 068: Add images to reviews (T42) — up to 5 per review, stored as URL array
ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}' NOT NULL;

COMMENT ON COLUMN public.reviews.images IS 'Review experience photos (URLs, Cloudinary). Max 5 enforced in UI.';
