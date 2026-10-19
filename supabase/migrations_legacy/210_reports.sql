-- 210_reports.sql — T48 Reportar restaurante/review/lista/perfil
DO $$ BEGIN
  DROP POLICY IF EXISTS "reports_insert_own" ON public.reports;
  DROP POLICY IF EXISTS "reports_select_own_or_admin" ON public.reports;
  DROP POLICY IF EXISTS "reports_update_admin" ON public.reports;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.reports (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type text NOT NULL CHECK (target_type IN ('restaurant','review','list','profile')),
  target_id   uuid NOT NULL,
  reporter_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason      text NOT NULL CHECK (reason IN ('closed','wrong_data','prices','other','spam','offensive')),
  details     text,
  status      text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','resolved','dismissed')),
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Dedup anti-spam: 1 report pendente por (reporter, alvo). Parcial -> permite re-report apos resolve/dismiss.
CREATE UNIQUE INDEX IF NOT EXISTS reports_pending_dedup_idx
  ON public.reports (reporter_id, target_type, target_id)
  WHERE status = 'pending';

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reports_insert_own" ON public.reports
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "reports_select_own_or_admin" ON public.reports
  FOR SELECT TO authenticated
  USING (auth.uid() = reporter_id OR public.current_user_is_admin());

CREATE POLICY "reports_update_admin" ON public.reports
  FOR UPDATE TO authenticated
  USING (public.current_user_is_admin());
