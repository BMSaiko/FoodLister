-- Pesquisa por texto (ilike '%termo%') sem scan sequencial.
-- Medido em volume sintético (100k restaurantes, 50k perfis, 50k listas):
-- restaurants.name 169 ms -> 0.3 ms; profiles.display_name 74 -> 0.2 ms; lists.name 59 -> 0.2 ms.
-- Reversão: DROP INDEX IF EXISTS idx_restaurants_name_trgm, idx_profiles_display_name_trgm, idx_lists_name_trgm;
CREATE INDEX IF NOT EXISTS idx_restaurants_name_trgm ON public.restaurants USING gin (name public.gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_profiles_display_name_trgm ON public.profiles USING gin (display_name public.gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_lists_name_trgm ON public.lists USING gin (name public.gin_trgm_ops);
