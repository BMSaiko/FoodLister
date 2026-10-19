-- T32: remove stale event CHECK constraint (208) — the whitelist
-- in utils/analytics.ts is the real catalog; a duplicated DB CHECK rotted
-- (DB had 'search'/'filter'; app sends 'search_performed'/'filter_applied')
-- and rejected every insert with a silent 500. Idempotent drop by name.
-- Constraint auto-named by Postgres from the 208 inline CHECK.
ALTER TABLE public.user_events DROP CONSTRAINT IF EXISTS user_events_event_check;
