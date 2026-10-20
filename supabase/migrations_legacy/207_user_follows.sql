-- Migration 207: user follows (social). Mirror of 065_list_likes. ponytail: follow-only, no blocking.
CREATE TABLE IF NOT EXISTS user_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (follower_id, following_id)
);

ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;

-- anyone reads count; user inserts/deletes own follow edge
CREATE POLICY "user_follows_select" ON public.user_follows FOR SELECT USING (true);
CREATE POLICY "user_follows_insert" ON public.user_follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "user_follows_delete" ON public.user_follows FOR DELETE
  USING (auth.uid() = follower_id);
