-- 212_restaurant_booking_urls.sql — T26: links de reserva externa por restaurante
-- OpenTable (reserva) + Yelp (avaliacoes) — opcionais, gerados/inseridos manualmente.
ALTER TABLE public.restaurants
  ADD COLUMN IF NOT EXISTS opentable_url text,
  ADD COLUMN IF NOT EXISTS yelp_url     text;
