-- Migration: Backfill restaurants.image_url into images[] (T65)
-- Purpose: image_url is the legacy cover fallback (display_image_index: -1 = image_url,
--          0+ = index in images[]). Every restaurant edited via useRestaurantForm has
--          image_url = '/placeholder-restaurant.jpg' (form always writes it, L239).
--          This backfill moves the real legacy image_urls into images[0] + display_image_index=0
--          so the fallback can be removed (Fase 1-4 do DP plans/2026-08-13-t65-remove-image-url-dp.md).
-- Idempotent: only touches rows w/ a real image_url AND no usable images[] yet.
-- 2026-08-13 DI: 166 rows had real image_url; 162 depend on the fallback (132 empty images, 162 dindex<0).

-- Move real legacy image_url into images[0] (only when images[] has nothing usable yet)
UPDATE public.restaurants
SET images = ARRAY[image_url],
    display_image_index = 0
WHERE image_url IS NOT NULL
  AND image_url <> ''
  AND image_url <> '/placeholder-restaurant.jpg'
  AND (images IS NULL OR cardinality(images) = 0);

-- Rows that already had images[] but dindex was still -1 -> point to first image
UPDATE public.restaurants
SET display_image_index = 0
WHERE image_url IS NOT NULL
  AND image_url <> ''
  AND image_url <> '/placeholder-restaurant.jpg'
  AND images IS NOT NULL
  AND cardinality(images) > 0
  AND display_image_index < 0;
