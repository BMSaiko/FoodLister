-- Migration: T32 user_events — search + filter tracking for admin analytics
-- Separate table from user_activities (that one is social-activity, drift-managed
-- FKs auth.users, content NOT NULL — wrong shape for analytics). Admin reads via
-- service-role RPC in /api/admin/stats; app only ever inserts own rows.
CREATE TABLE IF NOT EXISTS public.user_events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  event text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT user_events_pkey PRIMARY KEY (id),
  CONSTRAINT user_events_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- analytics queries: by event over time
CREATE INDEX IF NOT EXISTS idx_user_events_event_created
  ON public.user_events (event, created_at DESC);

ALTER TABLE public.user_events ENABLE ROW LEVEL SECURITY;

-- App only inserts; users may not read each other's events
CREATE POLICY "Users can insert own events"
  ON public.user_events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can select own events"
  ON public.user_events FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
