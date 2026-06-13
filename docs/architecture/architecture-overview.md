# Architecture Overview

Comprehensive overview of the FoodLister application architecture, design patterns, and technical decisions.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      Client Browser                              │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              Next.js 15 (App Router)                      │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐  │  │
│  │  │  Pages      │  │ Components  │  │  Context API     │  │  │
│  │  │  (Routes)   │  │  (UI)       │  │  (State Mgmt)    │  │  │
│  │  └─────────────┘  └─────────────┘  └──────────────────┘  │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐  │  │
│  │  │  Hooks      │  │  Libs       │  │  Service Worker  │  │  │
│  │  │  (Logic)    │  │  (Stripe,   │  │  (PWA + Push)    │  │  │
│  │  │             │  │   AI, Cache)│  │                  │  │  │
│  │  └─────────────┘  └─────────────┘  └──────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    API Routes (/api/*)                     │  │
│  │  Auth │ Restaurants │ Lists │ Reviews │ Users │ Meals     │  │
│  │  Notifications │ Subscriptions │ Marketing │ Admin         │  │
│  └───────────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    Supabase Backend                        │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐  │  │
│  │  │ PostgreSQL  │  │  Auth       │  │  Real-time       │  │  │
│  │  │  (RLS)      │  │  (JWT)      │  │  Subscriptions   │  │  │
│  │  └─────────────┘  └─────────────┘  └──────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│  External Services                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │
│  │Cloudinary│  │ Stripe   │  │ OpenAI   │  │ VAPID (Push)  │  │
│  │ (Images) │  │ (Payments)│  │ (AI)     │  │ (Web Push)    │  │
│  └──────────┘  └──────────┘  └──────────┘  └───────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Technology Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 15 (App Router) |
| **UI** | React 19, TypeScript 5.8.2 |
| **Styling** | TailwindCSS 3, CSS Variables (design system) |
| **Database** | PostgreSQL 15+ via Supabase |
| **Auth** | Supabase Auth (JWT, email/password, OAuth) |
| **Storage** | Cloudinary (images), Supabase Storage |
| **Payments** | Stripe (Checkout + Webhooks) |
| **AI** | OpenAI GPT-4o-mini (content generation) |
| **Push** | Web Push API + VAPID |
| **PWA** | next-pwa (Service Worker, offline, install) |
| **Testing** | Jest 30, React Testing Library, Storybook |
| **Deployment** | Vercel |

## Application Structure

```
foodlister/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes (35+ endpoints)
│   │   ├── admin/                # Admin dashboard APIs
│   │   ├── auth/                 # Session management
│   │   ├── lists/                # Lists CRUD + restaurants + collaborators + comments + activities
│   │   ├── marketing/            # Campaigns, posts, AI workflows
│   │   ├── meals/                # Scheduled meals + participants
│   │   ├── notifications/        # In-app, email, push
│   │   ├── restaurants/          # CRUD + visits + nearby
│   │   ├── reviews/              # CRUD
│   │   ├── stripe/webhook/       # Stripe webhook handler
│   │   ├── subscriptions/        # Subscription management
│   │   └── users/                # Profile, settings, stats
│   ├── marketing/                # Marketing AI dashboard
│   ├── notifications/            # Notifications page
│   ├── pricing/                  # Pricing page
│   ├── subscribe/                # Checkout success/cancel
│   └── users/settings/           # Settings + notification preferences
├── components/
│   ├── subscription/             # PricingCard, FeatureGate
│   └── ui/                       # 55+ reusable components
├── contexts/                     # AuthContext, FiltersContext, ModalContext
├── hooks/
│   ├── auth/                     # useAuth, useApiClient
│   ├── data/                     # useRestaurants, useNotifications, etc.
│   ├── marketing/                # useMarketing
│   ├── notifications/            # usePushNotifications
│   └── subscription/             # useSubscription
├── libs/
│   ├── ai.ts                     # OpenAI content generation
│   ├── cache.ts                  # TTL in-memory cache
│   ├── stripe.ts                 # Stripe SDK + utilities
│   └── subscription.ts           # Feature gate config + tier hierarchy
├── supabase/migrations/          # 47 migrations
├── types/                        # Database + API types
├── __tests__/                    # 57 test files
└── docs/                         # Architecture, API, guides, ADRs
```

## Database Schema (20+ Tables)

### Core Tables
- **profiles** — User profiles with subscription_tier, is_admin
- **restaurants** — Restaurant data with location, ratings, menus
- **lists** — User-created restaurant lists (public/private)
- **list_restaurants** — Many-to-many junction with positioning
- **reviews** — Restaurant ratings and comments
- **cuisine_types** / **restaurant_cuisine_types** — Categorization
- **restaurant_features** / **restaurant_restaurant_features** — Amenities
- **restaurant_dietary_options** / **restaurant_dietary_options_junction** — Dietary info

### Social & Collaboration
- **list_collaborators** — Multi-user list access (editor/viewer)
- **list_comments** — Comments on lists
- **list_activities** — Activity feed (change tracking)
- **user_restaurant_visits** — Visit tracking

### Meals
- **scheduled_meals** — Group meal planning
- **meal_participants** — Participant management with status

### Notifications
- **notifications** — In-app notification system
- **notification_preferences** — Per-user settings + push_subscription

### Subscriptions & Payments
- **subscription_plans** — Free, Premium, Pro plans
- **user_subscriptions** — Stripe subscription tracking
- **admin_roles** — Admin role management

### Marketing AI
- **marketing_campaigns** — Social media campaigns
- **social_media_posts** — Scheduled/published posts (6 platforms)
- **ai_workflows** — Automated content generation workflows
- **content_generation_logs** — AI generation audit trail

## Key Design Patterns

### Server/Client Component Split
- **Server Components by default** — Better performance, SEO, reduced bundle
- **Client Components** — Only when interactivity, hooks, or browser APIs needed
- **Clear marking** — `'use client'` directive at top of file

### Feature Gating
```typescript
// Tier hierarchy: free < premium < pro
<FeatureGate feature="marketing_dashboard" currentTier={tier}>
  <MarketingDashboard />
</FeatureGate>
```

### Subscription State
- Stripe webhooks drive subscription status
- `subscription_tier` on profiles for quick access checks
- Feature gate map in `libs/subscription.ts`

### Caching Strategy
- **In-memory cache** (`libs/cache.ts`) — TTL-based with prefix invalidation
- **API caching** — Applied to features, dietary-options (5-min TTL)
- **HTTP caching** — Cache-Control headers on API responses
- **Client-side** — apiClient with request deduplication

### Notification Flow
1. Event triggers in-app notification creation
2. Notification preferences checked per user
3. In-app: real-time via Supabase
4. Email: API endpoint (requires external service)
5. Push: Service Worker + VAPID

### AI Content Generation
1. User creates post with `aiGenerate: true`
2. System fetches restaurant data
3. OpenAI GPT-4o-mini generates platform-aware content
4. Post created as draft for review
5. User can edit, schedule, or publish

## Security

- **RLS** enabled on all 20+ tables (consolidated in migration 044)
- **JWT auth** via Supabase with session cookies
- **API rate limiting** — middleware + client-side (10 req/s)
- **Stripe webhooks** — Signature verification
- **Input validation** — Client + server + database constraints

## Testing

- **57 test files** — API, components, hooks, libs
- **387 tests passing** (93% pass rate)
- **Mock pattern** — Function-based NextResponse mock (see mistake log)
- **Storybook** — Component stories for subscription UI

## Deployment

- **Vercel** — Frontend + API routes
- **Supabase** — Database + Auth + Storage
- **Environment variables** — See `.env.local.example` (12 required vars)
- **Build** — `npm run build` (Next.js + TypeScript)
- **CI/CD** — GitHub Actions (lint + build + test)

## Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase public key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Admin operations |
| `CLOUDINARY_*` | Optional | Image hosting |
| `STRIPE_SECRET_KEY` | Optional | Payments |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Optional | Payments |
| `STRIPE_WEBHOOK_SECRET` | Optional | Webhook verification |
| `OPENAI_API_KEY` | Optional | AI content generation |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Optional | Push notifications |
| `VAPID_PRIVATE_KEY` | Optional | Push notifications |
| `NEXT_PUBLIC_APP_URL` | Recommended | App URL for webhooks |
