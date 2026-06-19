# Issue #280: Feature - Marketing Strategy and Autonomous AI Workflows for Social Media

**Issue Link**: https://github.com/BMSaiko/FoodLister/issues/280  
**Status**: Pending  
**Priority**: High  
**Type**: Feature

---

## Overview:

Create a comprehensive marketing strategy module with autonomous AI workflows to generate, schedule, and publish social media content for FoodLister. This feature will enable automated content creation (using AI models like OpenAI) tailored to restaurants, lists, and reviews, manage marketing campaigns, schedule posts across supported social platforms, and track engagement metrics. The system will integrate with existing social media profile links (from Issue #255) and leverage FoodLister's core data (restaurants, reviews, lists) to generate relevant, high-quality content with minimal manual input.

---

## Goals:

1. Design and implement database schema for marketing campaigns, social media posts, AI workflows, and content generation logs
2. Integrate AI providers (initially OpenAI) for automated social media content generation
3. Build autonomous workflow engine to trigger content generation based on predefined rules (e.g., new restaurant added, weekly digest, top-rated lists)
4. Create scheduling system for social media posts across platforms (Twitter/X, Instagram, Facebook, LinkedIn, TikTok)
5. Implement engagement tracking and analytics dashboard for marketing performance
6. Build UI for managing marketing campaigns, viewing scheduled posts, and monitoring AI-generated content
7. Integrate with existing social media links (Issue #255) for publishing to connected accounts

---

## Types:

### Database Schema Changes:

#### 1.1 Create Marketing Campaigns Table:

```sql
CREATE TABLE IF NOT EXISTS public.marketing_campaigns (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  budget numeric,
  target_platforms text[], -- ['twitter', 'instagram', 'facebook', etc.]
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone,
  CONSTRAINT marketing_campaigns_pkey PRIMARY KEY (id)
);

COMMENT ON TABLE public.marketing_campaigns IS 'Marketing campaigns for social media automation';
```

#### 1.2 Create Social Media Posts Table:

```sql
CREATE TABLE IF NOT EXISTS public.social_media_posts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES public.marketing_campaigns(id) ON DELETE CASCADE,
  restaurant_id uuid REFERENCES public.restaurants(id) ON DELETE SET NULL,
  list_id uuid REFERENCES public.lists(id) ON DELETE SET NULL,
  content text NOT NULL,
  platform text NOT NULL CHECK (platform IN ('twitter', 'instagram', 'facebook', 'linkedin', 'tiktok', 'youtube')),
  post_type text DEFAULT 'restaurant_promo' CHECK (post_type IN ('restaurant_promo', 'list_digest', 'review_highlight', 'general')),
  media_urls text[], -- array of image URLs
  scheduled_for timestamp with time zone,
  published_at timestamp with time zone,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'publishing', 'published', 'failed')),
  external_post_id text, -- ID from platform API
  engagement_data jsonb DEFAULT '{}'::jsonb, -- likes, shares, comments counts
  ai_generated boolean DEFAULT false,
  ai_prompt text, -- prompt used for generation
  created_by uuid NOT NULL REFERENCES public.profiles(user_id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone,
  CONSTRAINT social_media_posts_pkey PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_social_media_posts_campaign ON public.social_media_posts(campaign_id);
CREATE INDEX IF NOT EXISTS idx_social_media_posts_scheduled ON public.social_media_posts(scheduled_for) WHERE status = 'scheduled';
CREATE INDEX IF NOT EXISTS idx_social_media_posts_status ON public.social_media_posts(status);
```

#### 1.3 Create AI Workflows Table:

```sql
CREATE TABLE IF NOT EXISTS public.ai_workflows (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  trigger_type text NOT NULL CHECK (trigger_type IN ('new_restaurant', 'new_review', 'weekly_digest', 'top_rated', 'manual')),
  is_active boolean DEFAULT true,
  platform text NOT NULL,
  prompt_template text NOT NULL, -- template with variables like {{restaurant_name}}, {{rating}}
  schedule_cron text, -- cron expression for recurring workflows
  last_run_at timestamp with time zone,
  created_by uuid NOT NULL REFERENCES public.profiles(user_id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone,
  CONSTRAINT ai_workflows_pkey PRIMARY KEY (id)
);

COMMENT ON TABLE public.ai_workflows IS 'AI workflow definitions for autonomous content generation';
```

#### 1.4 Create Content Generation Logs Table:

```sql
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
```

#### 1.5 Row Level Security (RLS):

```sql
ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_media_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_generation_logs ENABLE ROW LEVEL SECURITY;

-- Policies: Users can manage their own campaigns and posts
CREATE POLICY "Users can manage own campaigns" ON public.marketing_campaigns FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own posts" ON public.social_media_posts FOR ALL USING (auth.uid() = created_by);
CREATE POLICY "Users can manage own workflows" ON public.ai_workflows FOR ALL USING (auth.uid() = created_by);
CREATE POLICY "Users can view own generation logs" ON public.content_generation_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.ai_workflows WHERE id = workflow_id AND created_by = auth.uid())
);
```

### TypeScript Type Updates:

**File**: `types/database.ts`

```typescript
// New tables
marketing_campaigns: {
  Row: {
    id: string;
    user_id: string;
    name: string;
    description: string | null;
    status: 'draft' | 'active' | 'paused' | 'completed';
    start_date: string | null;
    end_date: string | null;
    budget: number | null;
    target_platforms: string[] | null;
    created_at: string;
    updated_at: string | null;
  };
  Insert: { /* ... */ };
  Update: { /* ... */ };
}

social_media_posts: {
  Row: {
    id: string;
    campaign_id: string | null;
    restaurant_id: string | null;
    list_id: string | null;
    content: string;
    platform: 'twitter' | 'instagram' | 'facebook' | 'linkedin' | 'tiktok' | 'youtube';
    post_type: 'restaurant_promo' | 'list_digest' | 'review_highlight' | 'general';
    media_urls: string[] | null;
    scheduled_for: string | null;
    published_at: string | null;
    status: 'draft' | 'scheduled' | 'publishing' | 'published' | 'failed';
    external_post_id: string | null;
    engagement_data: any; // jsonb
    ai_generated: boolean | null;
    ai_prompt: string | null;
    created_by: string;
    created_at: string;
    updated_at: string | null;
  };
  Insert: { /* ... */ };
  Update: { /* ... */ };
}

ai_workflows: {
  Row: {
    id: string;
    name: string;
    description: string | null;
    trigger_type: 'new_restaurant' | 'new_review' | 'weekly_digest' | 'top_rated' | 'manual';
    is_active: boolean | null;
    platform: string;
    prompt_template: string;
    schedule_cron: string | null;
    last_run_at: string | null;
    created_by: string;
    created_at: string;
    updated_at: string | null;
  };
  Insert: { /* ... */ };
  Update: { /* ... */ };
}
```

### New Type Definitions (libs/types.ts):

```typescript
export type SocialPlatform = 'twitter' | 'instagram' | 'facebook' | 'linkedin' | 'tiktok' | 'youtube';

export type WorkflowTrigger = 'new_restaurant' | 'new_review' | 'weekly_digest' | 'top_rated' | 'manual';

export interface MarketingCampaign {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  status: 'draft' | 'active' | 'paused' | 'completed';
  startDate: string | null;
  endDate: string | null;
  budget: number | null;
  targetPlatforms: SocialPlatform[];
  createdAt: string;
  updatedAt: string | null;
}

export interface SocialMediaPost {
  id: string;
  campaignId: string | null;
  restaurantId: string | null;
  listId: string | null;
  content: string;
  platform: SocialPlatform;
  postType: 'restaurant_promo' | 'list_digest' | 'review_highlight' | 'general';
  mediaUrls: string[] | null;
  scheduledFor: string | null;
  publishedAt: string | null;
  status: 'draft' | 'scheduled' | 'publishing' | 'published' | 'failed';
  engagementData: {
    likes?: number;
    shares?: number;
    comments?: number;
  };
  aiGenerated: boolean;
  aiPrompt: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface AIWorkflow {
  id: string;
  name: string;
  description: string | null;
  triggerType: WorkflowTrigger;
  isActive: boolean;
  platform: SocialPlatform;
  promptTemplate: string;
  scheduleCron: string | null;
  lastRunAt: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface ContentGenerationResult {
  content: string;
  mediaUrls?: string[];
  tokensUsed: number;
  model: string;
}
```

---

## Files:

### New Files to Create:

1. **`supabase/migrations/YYYYMMDDHHMMSS_create_marketing_tables.sql`** - Migration for marketing tables
2. **`app/marketing/layout.tsx`** - Marketing section layout
3. **`app/marketing/page.tsx`** - Marketing dashboard main page
4. **`app/marketing/campaigns/page.tsx`** - Campaigns management page
5. **`app/marketing/campaigns/new/page.tsx`** - Create new campaign
6. **`app/marketing/campaigns/[id]/page.tsx`** - Campaign details
7. **`app/marketing/posts/page.tsx`** - Scheduled posts page
8. **`app/marketing/workflows/page.tsx`** - AI workflows management
9. **`app/marketing/analytics/page.tsx`** - Analytics dashboard
10. **`components/marketing/CampaignCard.tsx`** - Campaign card component
11. **`components/marketing/PostScheduler.tsx`** - Post scheduling component
12. **`components/marketing/AIWorkflowEditor.tsx`** - Workflow editor component
13. **`components/marketing/PlatformSelector.tsx`** - Social platform selector
14. **`components/marketing/EngagementChart.tsx`** - Engagement metrics chart
15. **`hooks/marketing/useCampaigns.ts`** - Campaigns management hook
16. **`hooks/marketing/usePosts.ts`** - Posts management hook
17. **`hooks/marketing/useAIWorkflows.ts`** - AI workflows hook
18. **`libs/ai.ts`** - AI content generation utilities (OpenAI integration)
19. **`libs/marketing.ts`** - Marketing utilities and API functions
20. **`libs/social-publisher.ts`** - Social media publishing utilities
21. **`__tests__/api/marketing.test.ts`** - API tests
22. **`__tests__/components/marketing/CampaignCard.test.tsx`** - Component tests
23. **`__tests__/libs/ai.test.ts`** - AI utilities tests
24. **`__tests__/hooks/marketing/useCampaigns.test.ts`** - Hook tests

### Existing Files to Modify:

1. **`libs/api.ts`**
   - Add functions: `getCampaigns()`, `createCampaign()`, `updateCampaign()`, `deleteCampaign()`
   - Add functions: `getPosts()`, `schedulePost()`, `publishPost()`, `deletePost()`
   - Add functions: `getAIWorkflows()`, `createWorkflow()`, `updateWorkflow()`, `triggerWorkflow()`

2. **`components/layouts/Navbar.jsx`**
   - Add link to `/marketing` if user has admin/marketing role

3. **`types/database.ts`**
   - Add new tables: `marketing_campaigns`, `social_media_posts`, `ai_workflows`, `content_generation_logs`

4. **`libs/types.ts`**
   - Add interfaces: `MarketingCampaign`, `SocialMediaPost`, `AIWorkflow`, etc.

5. **`.env.local.example`**
   - Add: `OPENAI_API_KEY=sk-...`
   - Add: `TWITTER_API_KEY=...` (optional, for direct publishing)

### Files to Delete:
- None

---

## Functions:

### New Functions:

1. **`GET /api/marketing/campaigns`** - List user's campaigns
   - Location: `app/api/marketing/campaigns/route.ts`
   - Returns: `MarketingCampaign[]`

2. **`POST /api/marketing/campaigns`** - Create new campaign
   - Location: `app/api/marketing/campaigns/route.ts`
   - Body: `{ name, description, target_platforms, etc. }`
   - Returns: `MarketingCampaign`

3. **`GET /api/marketing/posts`** - List scheduled posts
   - Location: `app/api/marketing/posts/route.ts`
   - Query params: `campaign_id`, `status`, `scheduled_for`
   - Returns: `SocialMediaPost[]`

4. **`POST /api/marketing/posts`** - Schedule new post
   - Location: `app/api/marketing/posts/route.ts`
   - Body: `{ content, platform, scheduled_for, campaign_id, etc. }`
   - Returns: `SocialMediaPost`

5. **`POST /api/marketing/ai/generate`** - Generate content with AI
   - Location: `app/api/marketing/ai/route.ts`
   - Body: `{ prompt, platform, post_type, context_data }`
   - Returns: `ContentGenerationResult`

6. **`GET /api/marketing/workflows`** - List AI workflows
   - Location: `app/api/marketing/workflows/route.ts`
   - Returns: `AIWorkflow[]`

7. **`generateAIContent(prompt: string, context: any): Promise<ContentGenerationResult>`**
   - Location: `libs/ai.ts`
   - Purpose: Generate social media content using OpenAI
   - Returns: Promise with generated content and metadata

8. **`publishToSocialMedia(post: SocialMediaPost): Promise<{ success: boolean; externalId?: string }>`**
   - Location: `libs/social-publisher.ts`
   - Purpose: Publish post to platform API
   - Returns: Promise with success status

9. **`useCampaigns(): { campaigns, loading, error, createCampaign, updateCampaign, deleteCampaign }`**
   - Location: `hooks/marketing/useCampaigns.ts`
   - Purpose: Hook for managing campaigns
   - Returns: Object with campaigns and CRUD functions

10. **`useAIWorkflows(): { workflows, loading, error, createWorkflow, updateWorkflow, triggerWorkflow }`**
    - Location: `hooks/marketing/useAIWorkflows.ts`
    - Purpose: Hook for managing AI workflows
    - Returns: Object with workflows and CRUD functions

### Modified Functions:

1. **`libs/api.ts`**
   - Modify: Add all marketing-related API functions
   - Add: Import and re-export from `libs/marketing.ts` and `libs/ai.ts`

---

## Classes:
- None (using hooks and functional components following project pattern)

---

## Dependencies:

### New Packages:
- **`openai`**: `npm install openai`
- **`@types/openai`**: `npm install -D @types/openai`
- **`node-cron`** (for scheduling workflows): `npm install node-cron`
- **`recharts`** (for analytics charts): `npm install recharts`

### Environment Variables (`.env.local.example`):
```
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4
TWITTER_API_KEY=...
TWITTER_API_SECRET=...
INSTAGRAM_ACCESS_TOKEN=...
FACEBOOK_ACCESS_TOKEN=...
LINKEDIN_ACCESS_TOKEN=...
```

### Version Changes:
- No mandatory version changes for existing packages

---

## Testing:

### New Test Files:

1. **`__tests__/api/marketing.test.ts`**
   - Test GET/POST/PUT/DELETE for campaigns
   - Test post scheduling and publishing
   - Test AI content generation endpoint
   - Mock OpenAI SDK

2. **`__tests__/components/marketing/CampaignCard.test.tsx`**
   - Test campaign card rendering
   - Test status badges (draft, active, paused)
   - Test action buttons (edit, delete, view)

3. **`__tests__/libs/ai.test.ts`**
   - Test `generateAIContent` function
   - Mock OpenAI API responses
   - Test prompt template variable substitution
   - Test error handling

4. **`__tests__/hooks/marketing/useCampaigns.test.ts`**
   - Test hook with campaigns data
   - Test CRUD operations
   - Mock API calls

### Existing Test Modifications:
- Update Navbar tests if marketing link added
- Update types/database tests if new tables added

---

## Implementation Order:

1. **Database Migration**
   - Create migration `supabase/migrations/YYYYMMDDHHMMSS_create_marketing_tables.sql`
   - Create `marketing_campaigns`, `social_media_posts`, `ai_workflows`, `content_generation_logs` tables
   - Add RLS policies
   - Run migration on Supabase

2. **Update Types**
   - Update `types/database.ts` with new tables
   - Add interfaces to `libs/types.ts`
   - Verify types with `npm run build`

3. **Setup AI Provider**
   - Create OpenAI account
   - Add `OPENAI_API_KEY` to `.env.local.example`
   - Create `libs/ai.ts` with content generation logic
   - Test in isolation

4. **Create API Routes**
   - Create `app/api/marketing/campaigns/route.ts`
   - Create `app/api/marketing/posts/route.ts`
   - Create `app/api/marketing/ai/route.ts`
   - Create `app/api/marketing/workflows/route.ts`
   - Implement authentication and authorization
   - Test in isolation

5. **Create Marketing Utilities**
   - Create `libs/marketing.ts` with API functions
   - Create `libs/social-publisher.ts` for publishing
   - Follow pattern of existing functions in `libs/api.ts`
   - Test in isolation

6. **Create Custom Hooks**
   - Create `hooks/marketing/useCampaigns.ts`
   - Create `hooks/marketing/usePosts.ts`
   - Create `hooks/marketing/useAIWorkflows.ts`
   - Follow pattern of existing hooks
   - Test hooks in isolation

7. **Create UI Components**
   - Create `CampaignCard.tsx` (campaign display)
   - Create `PostScheduler.tsx` (scheduling interface)
   - Create `AIWorkflowEditor.tsx` (workflow configuration)
   - Create `PlatformSelector.tsx` (platform selection)
   - Create `EngagementChart.tsx` (analytics charts)
   - Use Tailwind CSS and design system

8. **Create Marketing Pages**
   - Create `app/marketing/layout.tsx` (layout with nav)
   - Create `app/marketing/page.tsx` (dashboard)
   - Create `app/marketing/campaigns/page.tsx`
   - Create `app/marketing/posts/page.tsx`
   - Create `app/marketing/workflows/page.tsx`
   - Create `app/marketing/analytics/page.tsx`
   - Add meta tags SEO

9. **Implement AI Workflow Engine**
   - Create background job processor (using cron or similar)
   - Implement trigger logic (new restaurant, new review, etc.)
   - Generate content using `libs/ai.ts`
   - Auto-schedule posts based on workflow config
   - Log generation attempts to `content_generation_logs`

10. **Update Navigation**
    - Modify `components/layouts/Navbar.jsx`
    - Add link to `/marketing` for authorized users
    - Icon: 📢 or marketing icon

11. **Testing**
    - Create tests for API routes
    - Create tests for new components
    - Create tests for hooks
    - Create tests for AI utilities
    - Update existing tests
    - Run `npm test`

12. **Final Validation**
    - Run `npm run lint` - 0 errors
    - Run `npm run build` - exit code 0
    - Run `npm test` - all tests pass
    - Commit: `feat(marketing): add AI-powered social media marketing automation`

---

## Marketing Strategy Workflow Examples:

### Workflow 1: New Restaurant Promotion
- **Trigger**: New restaurant added to FoodLister
- **Action**: Generate Instagram/Twitter post with restaurant details, cuisine type, features
- **Prompt Template**: "Create a {{platform}} post promoting {{restaurant_name}}, a {{cuisine_type}} restaurant in {{location}}. Highlight: {{features}}. Rating: {{average_rating}}/5. #FoodLister #RestaurantDiscovery"

### Workflow 2: Weekly Digest
- **Trigger**: Cron job (every Monday)
- **Action**: Generate Facebook/LinkedIn post with top 5 restaurants of the week
- **Prompt Template**: "Create a weekly digest post for {{platform}} highlighting the top 5 restaurants added to FoodLister this week: {{restaurant_list}}. Include ratings and cuisines. #WeeklyDigest #FoodLister"

### Workflow 3: Review Highlight
- **Trigger**: New 5-star review posted
- **Action**: Generate Twitter post quoting the review
- **Prompt Template**: "Share this amazing 5-star review on {{platform}}: '{{review_comment}}' - Review for {{restaurant_name}}. Join FoodLister to discover great restaurants! #FoodLister #RestaurantReview"

---

## Analytics Dashboard Design:

### Metrics to Track:
- **Posts Published**: Total, by platform, by campaign
- **Engagement**: Likes, shares, comments, click-throughs
- **AI Performance**: Tokens used, generation success rate, average rating
- **Campaign Performance**: ROI (if budget set), reach, conversions
- **Top Performing Content**: By engagement, by platform

### Charts (using recharts):
- **Line Chart**: Posts over time
- **Bar Chart**: Engagement by platform
- **Pie Chart**: Content type distribution
- **Area Chart**: Cumulative reach

---

## Acceptance Criteria Checklist:

- [ ] Marketing tables created in database with RLS policies
- [ ] OpenAI integration functional for content generation
- [ ] AI workflow engine triggers content generation automatically
- [ ] Post scheduling system working (cron-based)
- [ ] Publishing to social platforms (Twitter, Instagram, etc.)
- [ ] Marketing campaigns management UI created
- [ ] AI workflows editor created (`/marketing/workflows`)
- [ ] Analytics dashboard with engagement metrics (`/marketing/analytics`)
- [ ] Integration with existing social media links (Issue #255)
- [ ] Content generation logs for audit trail
- [ ] Design responsive (mobile and desktop)
- [ ] Unit tests for new functionalities
- [ ] Documentation updated (memory-bank/)

---

## Security Considerations:

1. **API Keys**: Store OpenAI and social media API keys in environment variables (never in code)
2. **RLS**: Ensure users can only access their own campaigns, posts, and workflows
3. **Rate Limiting**: Implement rate limiting for AI generation (prevent abuse)
4. **Content Moderation**: Optional AI content filtering before publishing
5. **Audit Logs**: Keep logs of all AI generations and published posts