-- T64 Fase 2: slugs amigáveis para restaurants e lists.
-- URL antigas com UUID continuam a funcionar (resolver slug-or-uuid no app).
ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE public.lists ADD COLUMN IF NOT EXISTS slug text;

-- Trigger BEFORE INSERT gera slug quando NULL (cobre route, batch, form, duplicate — 1 sítio).
CREATE OR REPLACE FUNCTION public.set_slug_if_null()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE base text; cand text; n int := 2; exist bigint;
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    base := lower(regexp_replace(regexp_replace(trim(coalesce(NEW.name,'')), '[^a-zA-Z0-9]+', '-', 'g'), '^-+|-+$', '', 'g'));
    IF base = '' THEN base := 'item'; END IF;
    cand := base;
    EXECUTE format('SELECT count(*) FROM %I WHERE slug = %L', TG_TABLE_NAME, cand) INTO exist;
    WHILE exist > 0 LOOP
      cand := base || '-' || n; n := n + 1;
      EXECUTE format('SELECT count(*) FROM %I WHERE slug = %L', TG_TABLE_NAME, cand) INTO exist;
    END LOOP;
    NEW.slug := cand;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_restaurants_slug ON public.restaurants;
CREATE TRIGGER trg_restaurants_slug BEFORE INSERT ON public.restaurants
  FOR EACH ROW EXECUTE FUNCTION public.set_slug_if_null();

DROP TRIGGER IF EXISTS trg_lists_slug ON public.lists;
CREATE TRIGGER trg_lists_slug BEFORE INSERT ON public.lists
  FOR EACH ROW EXECUTE FUNCTION public.set_slug_if_null();

-- Backfill existentes com dedup por -2, -3, ...
DO $bk$
DECLARE r RECORD; base text; cand text; n int; exist int;
BEGIN
  FOR r IN SELECT id, name FROM public.restaurants WHERE slug IS NULL OR slug = '' LOOP
    base := lower(regexp_replace(regexp_replace(trim(coalesce(r.name,'')), '[^a-zA-Z0-9]+', '-', 'g'), '^-+|-+$', '', 'g'));
    IF base = '' THEN base := 'restaurant'; END IF;
    cand := base; n := 2;
    LOOP
      SELECT count(*) INTO exist FROM public.restaurants WHERE slug = cand;
      IF exist = 0 THEN EXIT; END IF;
      cand := base || '-' || n; n := n + 1;
    END LOOP;
    UPDATE public.restaurants SET slug = cand WHERE id = r.id;
  END LOOP;
END $bk$;

DO $bk2$
DECLARE r RECORD; base text; cand text; n int; exist int;
BEGIN
  FOR r IN SELECT id, name FROM public.lists WHERE slug IS NULL OR slug = '' LOOP
    base := lower(regexp_replace(regexp_replace(trim(coalesce(r.name,'')), '[^a-zA-Z0-9]+', '-', 'g'), '^-+|-+$', '', 'g'));
    IF base = '' THEN base := 'lista'; END IF;
    cand := base; n := 2;
    LOOP
      SELECT count(*) INTO exist FROM public.lists WHERE slug = cand;
      IF exist = 0 THEN EXIT; END IF;
      cand := base || '-' || n; n := n + 1;
    END LOOP;
    UPDATE public.lists SET slug = cand WHERE id = r.id;
  END LOOP;
END $bk2$;

CREATE UNIQUE INDEX IF NOT EXISTS restaurants_slug_key ON public.restaurants(slug);
CREATE UNIQUE INDEX IF NOT EXISTS lists_slug_key ON public.lists(slug);
