-- Migration 065: list likes (popularity). ponytail: like-only, no downvote.
CREATE TABLE IF NOT EXISTS list_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID NOT NULL REFERENCES public.lists(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (list_id, user_id)
);

ALTER TABLE list_likes ENABLE ROW LEVEL SECURITY;

-- users can insert/delete their own like; anyone authenticated can read count
CREATE POLICY "list_likes_select" ON public.list_likes FOR SELECT USING (true);
CREATE POLICY "list_likes_insert" ON public.list_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "list_likes_delete" ON public.list_likes FOR DELETE
  USING (auth.uid() = user_id);
