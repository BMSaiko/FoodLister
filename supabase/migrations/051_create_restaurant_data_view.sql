-- Migration: Create restaurant_data_view for optimized user restaurant queries
-- This view joins restaurants with creator profile data for efficient listing

CREATE OR REPLACE VIEW public.restaurant_data_view AS
SELECT
  r.id,
  r.name,
  r.description,
  r.image_url,
  r.price_per_person,
  r.rating,
  r.location,
  r.source_url,
  r.creator_id,
  p.display_name AS creator_name,
  r.created_at,
  r.updated_at,
  r.images,
  r.display_image_index,
  r.menu_links,
  r.menu_images,
  r.latitude,
  r.longitude,
  r.cuisine_types,
  r.dietary_options,
  r.features,
  r.phone_numbers,
  r.menu_url,
  r.visited
FROM public.restaurants r
LEFT JOIN public.profiles p ON p.user_id = r.creator_id;

-- Grant access to anon and authenticated roles
GRANT SELECT ON public.restaurant_data_view TO anon, authenticated;
