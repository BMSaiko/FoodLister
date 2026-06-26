-- ============================================================
-- Marketing AI Workflows - Database Schema
-- ============================================================

-- Marketing Campaigns
CREATE TABLE IF NOT EXISTS public.marketing_campaigns (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  budget numeric,
  target_platforms text[],
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone,
  CONSTRAINT marketing_campaigns_pkey PRIMARY KEY (id)
);

COMMENT ON TABLE public.marketing_campaigns IS 'Marketing campaigns for social media automation';

-- Social Media Posts
CREATE TABLE IF NOT EXISTS public.social_media_posts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES public.marketing_campaigns(id) ON DELETE CASCADE,
  restaurant_id uuid REFERENCES public.restaurants(id) ON DELETE SET NULL,
  list_id uuid REFERENCES public.lists(id) ON DELETE SET NULL,
  content text NOT NULL,
  platform text NOT NULL CHECK (platform IN ('twitter', 'instagram', 'facebook', 'linkedin', 'tiktok', 'youtube')),
  post_type text DEFAULT 'restaurant_promo' CHECK (post_type IN ('restaurant_promo', 'list_digest', 'review_highlight', 'general')),
  media_urls text[],
  scheduled_for timestamp with time zone,
  published_at timestamp with time zone,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'publishing', 'published', 'failed')),
  external_post_id text,
  engagement_data jsonb DEFAULT '{}'::jsonb,
  ai_generated boolean DEFAULT false,
  ai_prompt text,
  created_by uuid NOT NULL REFERENCES public.profiles(user_id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone,
  CONSTRAINT social_media_posts_pkey PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_social_media_posts_campaign ON public.social_media_posts(campaign_id);
CREATE INDEX IF NOT EXISTS idx_social_media_posts_scheduled ON public.social_media_posts(scheduled_for) WHERE status = 'scheduled';
CREATE INDEX IF NOT EXISTS idx_social_media_posts_status ON public.social_media_posts(status);
CREATE INDEX IF NOT EXISTS idx_social_media_posts_created_by ON public.social_media_posts(created_by);

-- AI Workflows
CREATE TABLE IF NOT EXISTS public.ai_workflows (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  trigger_type text NOT NULL CHECK (trigger_type IN ('new_restaurant', 'new_review', 'weekly_digest', 'top_rated', 'manual')),
  is_active boolean DEFAULT true,
  platform text NOT NULL,
  prompt_template text NOT NULL,
  schedule_cron text,
  last_run_at timestamp with time zone,
  created_by uuid NOT NULL REFERENCES public.profiles(user_id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone,
  CONSTRAINT ai_workflows_pkey PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_ai_workflows_created_by ON public.ai_workflows(created_by);
CREATE INDEX IF NOT EXISTS idx_ai_workflows_trigger ON public.ai_workflows(trigger_type) WHERE is_active = true;

-- Content Generation Logs
CREATE TABLE IF NOT EXISTS public.content_generation_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  workflow_id uuid REFERENCES public.ai_workflows(id) ON DELETE SET NULL,
  post_id uuid REFERENCES public.social_media_posts(id) ON DELETE SET NULL,
  prompt text NOT NULL,
  ai_response text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed')),
  error_message text,
  tokens_used integer,
  model_used text DEFAULT 'gpt-4',
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT content_generation_logs_pkey PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_content_gen_logs_workflow ON content_generation_logs(workflow_id);
CREATE INDEX IF NOT EXISTS idx_content_gen_logs_post ON content_generation_logs(post_id);

-- Enable RLS
ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_media_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_generation_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage own campaigns" ON public.marketing_campaigns FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own posts" ON public.social_media_posts FOR ALL USING (auth.uid() = created_by);
CREATE POLICY "Users can manage own workflows" ON public.ai_workflows FOR ALL USING (auth.uid() = created_by);
CREATE POLICY "Users can view own generation logs" ON public.content_generation_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.ai_workflows WHERE id = content_generation_logs.workflow_id AND created_by = auth.uid())
);

-- Update trigger
CREATE OR REPLACE FUNCTION update_marketing_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_marketing_campaigns_updated_at
  BEFORE UPDATE ON public.marketing_campaigns
  FOR EACH ROW EXECUTE FUNCTION update_marketing_updated_at();

CREATE TRIGGER update_social_media_posts_updated_at
  BEFORE UPDATE ON public.social_media_posts
  FOR EACH ROW EXECUTE FUNCTION update_marketing_updated_at();

CREATE TRIGGER update_ai_workflows_updated_at
  BEFORE UPDATE ON public.ai_workflows
  FOR EACH ROW EXECUTE FUNCTION update_marketing_updated_at();
