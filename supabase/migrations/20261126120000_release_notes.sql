-- Notas de release publicadas na webapp («Novidades»).
-- Leitura pública (anon + authenticated); escrita só via service_role (pipeline de release).

CREATE TABLE IF NOT EXISTS public.release_notes (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  version     text        NOT NULL,
  released_at date        NOT NULL,
  title       text        NOT NULL,
  items       jsonb       NOT NULL DEFAULT '{"novo": [], "melhorado": [], "corrigido": []}'::jsonb,
  created_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT release_notes_version_semver CHECK (version ~ '^\d+\.\d+\.\d+$'),
  CONSTRAINT release_notes_version_key UNIQUE (version),
  CONSTRAINT release_notes_items_shape CHECK (
    jsonb_typeof(items) = 'object'
    AND items ?& ARRAY['novo', 'melhorado', 'corrigido']
    AND jsonb_typeof(items -> 'novo') = 'array'
    AND jsonb_typeof(items -> 'melhorado') = 'array'
    AND jsonb_typeof(items -> 'corrigido') = 'array'
  )
);

COMMENT ON TABLE public.release_notes IS 'Notas de release (PT) mostradas em /novidades; fonte: CHANGELOG.md.';

CREATE INDEX IF NOT EXISTS release_notes_released_at_idx
  ON public.release_notes (released_at DESC);

ALTER TABLE public.release_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "release_notes_select_public" ON public.release_notes;
CREATE POLICY "release_notes_select_public"
  ON public.release_notes
  FOR SELECT
  TO anon, authenticated
  USING (true);

REVOKE ALL ON public.release_notes FROM anon, authenticated;
GRANT SELECT ON public.release_notes TO anon, authenticated;
GRANT ALL ON public.release_notes TO service_role;
