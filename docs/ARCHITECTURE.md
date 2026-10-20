# Architecture

## System Overview

FoodLister é uma aplicação web full-stack construída com **Next.js 15 App Router** (Server/Client Components híbridos) e **Supabase** como Backend-as-a-Service (PostgreSQL, Auth, Realtime, RLS). A aplicação é mobile-first, PWA-capable, com tema dark-only e um sistema de design baseado em "glass" effect como identidade visual distintiva. **~585 ficheiros .ts/.tsx, 160+ componentes, 54 hooks, 21 libs, 81 migrações (000-211).**

```
┌─────────────────────────────────────────────────────────────────┐
│                    FoodLister Application                        │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐  │
│  │   Frontend      │  │   Backend       │  │  External    │  │
│  │   (Next.js 15)  │◄─┼──(Supabase)    │  │  Services    │  │
│  │   App Router    │  │   PG+Auth+RT   │  │              │  │
│  │   RSC + RCC     │  │   RLS policies  │  │  Stripe      │  │
│  └─────────────────┘  │   Realtime      │  │  OpenAI      │  │
│                        └─────────────────┘  │  Cloudinary  │  │
│                                             │  Leaflet     │  │
│                                             └──────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Tech Stack

| Layer | Technology | Version | Rationale |
|-------|-----------|---------|-----------|
| **Framework** | Next.js | 15.5.19 | App Router, SSR/SSG, RSC/RCC |
| **UI Library** | React | 19.0.0 | Server Components, concurrent features |
| **Language** | TypeScript | 5.8.2 strict | Type safety, strict mode |
| **Styling** | TailwindCSS | ^3.4.19 | Utility-first, CSS variables, dark mode |
| **Styling PostCSS** | autoprefixer | ^10.5.0 | Tailwind postcss plugin |
| **Backend** | Supabase | ^2.49.1 | PostgreSQL, Auth, Realtime, RLS |
| **Backend SSR** | @supabase/ssr | ^0.8.0 | Server-side Supabase client |
| **Database** | PostgreSQL | 15+ | 20+ tabelas, 81+ migrações (000-211) |
| **Animations** | Framer Motion ^12.27.5 + motion ^12.40.0 | | UI animations, gesture-based |
| **Icons** | Lucide React ^0.482.0, React Icons ^5.5.0 | | Icon libraries |
| **Maps** | Leaflet ^1.9.4, react-leaflet ^5.0.0, react-leaflet-cluster ^4.1.3, dlv ^1.1.3 | | OpenStreetMap tiles, no API key |
| **Forms** | React Hook Form ^7.54.2, react-phone-number-input ^3.4.14, react-dropzone ^14.3.8 | | Declarative form handling |
| **Payments** | Stripe ^22.2.1, @stripe/stripe-js ^9.8.0 | | Checkout, Webhooks, subscriptions |
| **AI** | OpenAI ^6.42.0 | | GPT-4o-mini para conteúdo marketing |
| **Images** | Cloudinary ^2.9.0, @cloudinary/url-gen ^1.22.0 | | Image hosting, signed uploads |
| **UI Components** | Headless UI, @radix-ui/react-tooltip ^1.2.10 | | Unstyled accessible components |
| **Testing** | Jest 29.7.0 + ts-jest 29.2.5 + jest-environment-jsdom | | Unit/integration tests |
| **Testing RTL** | React Testing Library ^16.1.0, @testing-library/dom ^10.4.1 | | Component testing |
| **Testing E2E** | Playwright ^1.60.0, @playwright/test | | End-to-end testing |
| **Testing Alt** | Vitest ^4.1.8, @vitest/browser-playwright, @vitest/coverage-v8 | | Alternative test runner |
| **PWA** | next-pwa ^5.6.0, web-push ^3.6.7 | | Service Worker, offline, VAPID |
| **Charts** | Recharts ^2.15.1 | | Performance dashboard |
| **Fonts** | Geist, Geist Mono (next/font/google) | | Primary/mono fonts |
| **Linting** | ESLint 9.39.2 (flat config) | Code quality |
| **Build** | Turbopack (dev) / Next.js (prod) | | Dev bundler, production build |
| **CI/CD** | GitHub Actions, Semantic-release | | CI/CD pipeline |
| **Deploy** | Vercel | | Serverless deployment |

## Folder Structure

```
code/                              # Repositório principal (BMSaiko/FoodLister)
├── app/                           # Next.js App Router (585+ .ts/.tsx)
│   ├── (auth)/                    # Login, signup, verify
│   ├── api/                       # 21 subdirs (admin, analytics, cuisine-types,
│   │                              # dietary-options, features, feed, health, home,
│   │                              # lists, marketing, meals, notifications, osm,
│   │                              # reports, resolve-google-maps-url, restaurants,
│   │                              # reviews, stripe, subscriptions, upload, users)
│   ├── admin/                     # Admin dashboard (gated)
│   ├── auth/                      # Auth pages
│   ├── feed/                      # Feed page
│   ├── lists/                     # List pages (detail, create, edit)
│   ├── map/                       # Map view page
│   ├── marketing/                 # Marketing AI dashboard (Pro gated)
│   ├── meals/                     # Meal scheduling page
│   ├── notifications/             # Notifications page
│   ├── page.js                    # Landing page (use client, dynamic=force-dynamic)
│   ├── pricing/                   # Stripe pricing page
│   ├── restaurants/               # Restaurant pages
│   ├── roulette/                  # Restaurant roulette page
│   ├── subscribe/                 # Subscription page
│   ├── unauthorized/              # Unauthorized page
│   ├── users/                     # Public profiles
│   ├── layout.js                  # Root layout (Server Component)
│   └── globals.css                # CSS variables, theme, animations
├── components/                    # 160+ components (.tsx)
│   ├── admin/                     # Admin dashboard components
│   ├── auth/                      # Auth components (signin, signup)
│   ├── landing/                   # Landing page components
│   ├── layouts/                   # ClientLayout, AuthLayout
│   ├── lists/                     # List-specific components
│   ├── loading/                   # Loading components (separate from ui/)
│   ├── navigation/                # Navbar components (in ui/navigation/)
│   ├── pages/                     # Page-specific components
│   ├── profile/                   # Profile components (in ui/profile/)
│   ├── restaurant/                # Restaurant components (Card, Details, Grid)
│   ├── subscription/              # FeatureGate, PricingCard
│   ├── ui/                        # Atomic UI components
│   │   ├── BaseForm.tsx           # Form wrapper with sticky submit
│   │   ├── Card.tsx               # default/elevated/outlined
│   │   ├── Container.tsx          # Max-width container
│   │   ├── ErrorBoundary.tsx      # Global error boundary
│   │   ├── FormField.tsx          # Field wrapper
│   │   ├── GlobalSearch.tsx       # ⌘K command palette (10.9KB)
│   │   ├── LazyImage.tsx          # Image with skeleton + lazy loading
│   │   ├── Modal.tsx              # dialog/bottom-sheet/full-screen (5.6KB)
│   │   ├── PageHeader.tsx         # Page title + actions
│   │   ├── Skeleton.tsx           # Loading skeleton
│   │   ├── Tooltip.tsx            # Radix UI tooltip
│   │   ├── common/                # 15+ helpers (FAQSection, EmptyState,
│   │   │                            # PerformanceDashboard, PriceLevelDisplay,
│   │   │                            # ReportButton, ScrollToTopButton,
│   │   │                            # TruncateText, MentionInput/Text,
│   │   │                            # MultiplePhoneInput, CreatorLink,
│   │   │                            # FormActions, FormSection, ErrorBoundary)
│   │   ├── Filters/               # 9 filter components
│   │   │                            # (CuisineSelector, DualRangeSlider,
│   │   │                            # FeaturesSelector, DietaryOptionsSelector,
│   │   │                            # FilterPanel, FilterStats,
│   │   │                            # RestaurantFilters, RouletteFilters 40KB,
│   │   │                            # TabbedRestaurantFilters 53KB)
│   │   ├── navigation/            # Navbar(17KB), Searchbar, NotificationsDropdown(14KB),
│   │   │                            # ProfileStickyNavbar, LanguageCombobox
│   │   ├── notifications/         # 4 notification components
│   │   ├── lists/                 # 15 list components
│   │   ├── profile/               # 6 profile components
│   │   ├── RestaurantCard/        # 6 sub-components
│   │   ├── RestaurantDetails/     # 20 sub-components
│   │   ├── RestaurantGrid.jsx     # Masonry grid
│   │   ├── RestaurantMap/         # Leaflet map component
│   │   ├── RestaurantRoulette.tsx # Roulette feature
│   │   └── Nearby/                # Nearby restaurants
│   ├── auth/                      # Auth components
│   ├── landing/                   # Landing components
│   └── index.ts                   # Barrel exports
├── hooks/                         # 54+ custom hooks (12 subdirs)
│   ├── admin/                     # Admin hooks
│   ├── auth/                      # useAuthUser, useSession
│   ├── data/                      # useRestaurants, useLists, useReviews
│   ├── forms/                     # useRestaurantForm, useListForm, useReviewForm
│   ├── lists/                     # List management hooks
│   ├── marketing/                 # Marketing AI hooks (useMarketing)
│   ├── navigation/                # Navigation hooks
│   ├── notifications/             # Notification hooks
│   ├── restaurants/               # Restaurant hooks (useNearbyRestaurants)
│   ├── subscription/              # Subscription hooks (useSubscription)
│   ├── ui/                        # useFiltersLogic, usePagination, useModal
│   └── utilities/                 # useDebounce, useLocalStorage, useMediaQuery,
│                                  # usePageTitle, useInfiniteScroll
├── contexts/                      # 5 providers
│   ├── AuthContext.tsx            # user, session, loading, signIn, signUp, signOut
│   ├── FiltersContext.tsx         # filters, setFilters, resetFilters
│   ├── LanguageContext.tsx        # PT/EN language switching
│   ├── ModalContext.tsx           # isOpen, openModal, closeModal, modalContent
│   ├── index.tsx                  # Combined providers (App)
│   └── MOC.md
├── libs/                          # 21 shared libraries (.ts) + __tests__/
│   ├── activity.ts                # Activity logging (list changes)
│   ├── admin.ts                   # Admin utilities
│   ├── ai.ts                      # OpenAI content generation (GPT-4o-mini)
│   ├── api.ts                     # Domain API types + helpers
│   ├── apiClient.ts               # API client utilities
│   ├── auth.ts                    # Auth utilities (validateProfileAccess, getUserData)
│   ├── cache.ts                   # TTL in-memory cache (cacheGet/cacheSet/cacheOrSet)
│   ├── creatorCodes.ts            # Creator link/FL-id utilities (attachCreatorCodes)
│   ├── export.ts                  # PDF/CSV export functionality
│   ├── feed.ts                    # Feed utilities
│   ├── ics-generator.ts           # ICS export for meal scheduling
│   ├── languages.ts               # Language utilities (PT/EN)
│   ├── lists/                     # List-specific libraries
│   ├── marketing.ts               # Marketing campaign utilities
│   ├── meals/                     # Meal scheduling libraries
│   ├── mentions.ts                # @mention utilities
│   ├── notifications/             # Notification service (createNotification)
│   ├── rate-limit.ts              # Rate limiting utilities
│   ├── search.ts                  # Search utilities
│   ├── slug.ts                    # URL slug utilities
│   ├── stripe.ts                  # Stripe SDK + utilities
│   ├── subscription.ts            # FeatureGate config + tier hierarchy (free<premium<pro)
│   ├── supabase/                  # Supabase clients (client/server/admin)
│   ├── types.ts                   # Domain types (Restaurant, List, Review, etc.)
│   ├── utils/                     # Utility helpers
│   ├── verification.ts            # Verification utilities
│   └── MOC.md
├── middleware/                    # Next.js middleware
│   ├── rateLimiter.ts             # Rate limiting middleware
│   └── MOC.md
├── types/                         # Type definitions (5 files)
│   ├── api.ts                     # ApiErrorType, getErrorMessage
│   ├── database.ts                # Supabase generated + explicit Insert/Update types
│   ├── loading.ts                 # Loading state types
│   ├── notification.ts            # NotificationType union + NOTIFICATION_TYPE_CONFIG
│   └── react-dom.d.ts             # React DOM type declarations
├── utils/                         # 18+ pure helper functions
│   ├── analytics.ts               # Analytics utilities
│   ├── apiMonitor.ts              # API monitoring
│   ├── auth.ts                    # Auth utilities
│   ├── authUtils.js               # Auth helpers
│   ├── cloudinaryConverter.ts     # Cloudinary URL conversion + image upload
│   ├── dbMonitor.ts               # DB query monitoring
│   ├── error-messages.ts          # Error message helpers
│   ├── filters.ts                 # Filtering utilities
│   ├── formatters.ts              # Date/number formatting (Intl API)
│   ├── googleCalendar.ts          # Google Calendar integration
│   ├── googleMapsBatchExtractor.ts # Batch Google Maps extraction
│   ├── googleMapsExtractor.ts     # Google Maps URL parsing
│   ├── index.ts                   # Barrel exports
│   ├── listExport.ts              # List export utilities
│   ├── logger.ts                  # Logging with SENSITIVE_KEYS sanitization
│   ├── passwordValidation.js      # Password strength validation
│   ├── performanceMonitor.ts      # Performance metrics
│   ├── random.ts                  # Seeded PRNG (FNV-1a + mulberry32, user+day)
│   ├── scrollLock.ts              # Body scroll lock
│   └── search.ts                  # Search utilities
├── __tests__/                     # 52 test files (mirror source structure)
│   ├── api/                   # API route tests (collaborators, cuisine, export,
│   │                            # health, lists, resolve-google-maps-url,
│   │                            # restaurants, restaurants_batch_dedup,
│   │                            # restaurants_nearby, ...)
│   ├── components/            # Component tests
│   ├── contexts/              # Context provider tests
│   ├── hooks/                 # Hook tests
│   ├── libs/                  # Library tests (activity, api, cache, ai, ...)
│   └── utils/                 # Utility tests
├── public/                        # Static assets (PWA)
│   ├── icons/                     # PWA icons (72x72 to 512x512, 8 sizes)
│   │   ├── icon-72x72.png, icon-96x96.png, icon-128x128.png, icon-144x144.png
│   │   ├── icon-152x152.png, icon-192x192.png, icon-384x384.png, icon-512x512.png
│   ├── logo.svg                   # Brand logo (talheres)
│   ├── manifest.json              # PWA manifest
│   ├── sw.js                      # Service Worker
│   ├── workbox-*.js               # Workbox PWA assets
│   ├── workers/                   # search-worker.js
│   ├── placeholder-restaurant.jpg
│   ├── health.json
│   └── file.svg, globe.svg, next.svg, window.svg
├── supabase/
│   ├── migrations/                # 81+ migrations (000-211)
│   ├── seed/                      # Seed data
│   ├── database.sql               # Schema baseline
│   └── functions/                 # Edge functions
├── docs/                          # Documentation (29+ markdown files)
│   ├── api/                       # API documentation, endpoints reference
│   ├── architecture/              # Architecture overview, ADRs (001, 002)
│   ├── database/                  # Database schema docs
│   ├── features/                  # Feature roadmaps, create pipeline
│   ├── guides/                    # Development, deployment, error handling,
│   │                              # contribution, advanced filters, refactoring
│   ├── progress/                  # Progress tracker, future issues, session report
│   ├── reference/                 # Project skills, prompt templates, subagents rule
│   ├── setup/                     # GitHub secrets setup
│   ├── tasks/                     # Task tracking
│   ├── security/                  # Security findings
│   └── FEATURES-WORKFLOW.md
├── memory-bank/                   # Project context (6 files)
│   ├── projectbrief.md
│   ├── productContext.md
│   ├── activeContext.md
│   ├── systemPatterns.md
│   ├── techContext.md
│   └── progress.md
├── tasks/                         # Task files (T1-T16+)
├── plans/                         # DR+DP planning docs
├── research/                      # Research briefs
├── decisions/                     # Decision records (2 ADRs)
├── sessions/                      # Session notes (33+)
├── scripts/                       # Python scripts, scrapers, test generators
│   ├── scrap-city-links.mjs       # Google Maps city scraping
│   ├── scrap-maps-places.py       # Google Maps places scraper
│   ├── apply_changes.py           # Apply DB changes
│   ├── gen_tests.py               # Generate test files
│   ├── write_files.py             # Write project files
│   ├── cities.json, subzones.json # Scraping data
│   └── MOC.md
├── .env.example                   # Environment template (all secrets)
├── .env.local                     # Local env (gitignored) ← NUNCA commitar
├── .gitignore                     # Git ignore rules
├── .gitattributes                 # LFS rules (⚠️ SVG in LFS = broken on Vercel)
├── next.config.mjs                # Next.js config (CSP, image patterns, optimizePackageImports)
├── tailwind.config.js             # Tailwind config (borderRadius→CSS vars, animations)
├── tsconfig.json                  # TypeScript (paths @/*, types array, strict)
├── jest.config.js                 # Jest config (moduleNameMapper, mock setup)
├── jest.setup.ts                  # Jest setup file
├── eslint.config.mjs              # ESLint flat config (@next, @typescript-eslint)
├── playwright.config.ts           # Playwright config
├── vitest.config.ts               # Vitest config
├── package.json                   # Dependencies (585+ files)
├── package-lock.json              # Lock file
├── CHANGELOG.md                   # Change log
├── vercel.json                    # Vercel configuration
├── .lighthouserc.json             # Lighthouse config
├── README.md                      # Project readme
└── MOC.md
```

## Data Flow

### Request Flow Típico
```
Client Component (use client)
  → custom hook (useRestaurants)
    → fetch API route OR direct Supabase query
      → rate limiter (100 req/15min API, 10 req/15min auth)
        → auth check (JWT)
          → RLS policy (auth.uid() check)
            → PostgreSQL query
              → response → state update → re-render
```

### Server Component Data Fetching
```
Server Component → createServerComponentClient()
  → Supabase Query → Data → Pass to Client Component as Props
```

### Real-time Data Flow
```
Supabase Realtime (postgres_changes channel)
  → subscription callback → state update → re-render
```

### Form Submission Flow
```
Form Component → handleSubmit → API Route → Supabase Insert/Update
  → Revalidation (revalidatePath) → Redirect/Update UI
```

### API Route Pattern
```
Next.js API Route (app/api/[resource]/route.ts)
  → rateLimiter.check (IP-based)
  → requireUser / requireAdmin (auth/role check)
  → Supabase query with RLS
  → response (explicit Insert/Update types)
```

## API Design

### REST Endpoints Structure

| Resource | Endpoints | Description |
|----------|-----------|-------------|
| `GET /api/restaurants` | List + filter | Search with cuisine, features, dietary, price, rating |
| `POST /api/restaurants` | Create | Auth user creates restaurant |
| `GET /api/restaurants/[id]` | Detail | Restaurant with reviews, menu |
| `PUT /api/restaurants/[id]` | Update | Edit restaurant |
| `DELETE /api/restaurants/[id]` | Delete | Remove restaurant |
| `GET /api/restaurants/nearby` | Nearby | Haversine distance search |
| `GET /api/restaurants/batch` | Batch import | Google Maps batch creation |
| `GET /api/restaurants/random` | Random | Seeded random restaurant pick |
| `GET /api/home/stats` | Public stats | Landing page stats (anon-readable) |
| `GET/POST /api/lists` | Lists | User's lists (public/private) |
| `POST /api/lists` | Create list | New curated list |
| `GET/PUT/DELETE /api/lists/[id]` | List CRUD | Full list management |
| `POST /api/lists/[id]/restaurants` | Add restaurant | Add to list with activity logging |
| `DELETE /api/lists/[id]/restaurants/[rid]` | Remove restaurant | Remove from list with activity logging |
| `GET/POST /api/lists/[id]/comments` | Comments | List comments |
| `GET/POST /api/lists/[id]/collaborators` | Collaborators | Role management |
| `GET /api/lists/[id]/activities` | Activity feed | List activity history |
| `GET /api/lists/[id]/export` | Export | PDF/CSV export |
| `GET/POST /api/reviews` | Reviews | Create and list reviews |
| `POST /api/upload` | Cloudinary upload | Image upload with rate limiting |
| `POST /api/auth/session` | Session tokens | Returns access/refresh tokens |
| `GET /api/reports` | Reports | Report restaurant/review |
| `GET/POST /api/marketing/campaigns` | Campaigns | AI marketing campaigns (Pro) |
| `GET/POST /api/marketing/posts` | Posts | AI generated posts (Pro) |
| `GET/POST /api/marketing/workflows` | Workflows | AI workflow automation (Pro) |
| `GET/POST /api/meals` | Meal scheduling | Scheduled meals + participants |
| `GET /api/osm` | OSM | OpenStreetMap reverse geocoding |
| `POST /api/resolve-google-maps-url` | Google Maps | Resolve shortlinks |
| `GET/POST /api/stripe/checkout` | Stripe checkout | Subscription creation |
| `POST /api/stripe/webhook` | Webhook | Stripe events |
| `GET/POST /api/subscriptions` | Subscriptions | Subscription management |
| `GET /api/notifications` | Notifications | User notifications |
| `GET/POST /api/notifications/preferences` | Preferences | Per-user notification toggles |
| `GET /api/admin/stats` | Admin stats | Aggregate stats (admin-only) |
| `GET /api/admin/reports` | Admin reports | Report moderation queue |
| `GET /api/analytics` | Analytics | Performance analytics |
| `GET /api/health` | Health check | Service health |
| `GET /api/cuisine-types` | Cuisine types | Reference data |
| `GET /api/dietary-options` | Dietary options | Reference data |
| `GET /api/features` | Features | Reference data |
| `GET /api/feed` | Feed | User activity feed |
| `GET /api/users/[id]` | User profile | Public profile data |

### Authentication
- **Mechanism:** Supabase Auth with JWT (1h expiry)
- **Methods:** Email/password + OAuth
- **Client:** `createClientComponentClient()` for browser, `createServerComponentClient()` for server
- **Admin:** `createAdminClient()` for server-side RLS bypass (service role only)
- **Session:** `libs/supabase/client.ts` uses localStorage (default, no custom cookie storage)
- **Server:** `getServerClient()` uses `@supabase/ssr` with `getAll`/`setAll` (handles chunked cookies)
- **Public access:** Restaurants and reviews readable by unauthenticated users (migration 032/039)
- **Rate limiting:** 100 req/15min API routes, 10 req/15min auth routes

### RLS (Row Level Security)
- Enabled on ALL user-facing tables (consolidated in migration 044)
- Policies check `auth.uid()` against `creator_id` or collaboration roles
- Public tables have `SELECT USING (true)` for anon access
- Service role key is server-side ONLY, never exposed to client

## Key Design Patterns (feature gating, subscriptions, notifications, AI)

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

## Scalability & Future Considerations

- **Horizontal Scaling:** Vercel serverless functions auto-scale. Supabase handles DB scaling.
- **Caching Strategy:** `libs/cache.ts` (TTL in-memory: cacheGet/cacheSet/cacheOrSet/cacheInvalidatePrefix). 300s default for admin stats, 0s for dynamic data. Current gap: most routes don't use caching (server-side caching minimal). `app/api/restaurants/route.ts` batch loop IGNORES `limit` parameter.
- **Database:** PostgreSQL com 20+ tabelas, 81+ migrações sequenciais (000-211). Constraints em ratings, amounts, URLs válidas. Array field limits. Indexes em colunas quentes.
- **Service Decomposition:** Monolith Next.js with API routes. Future microservices considered for AI/ML workloads.
- **Performance Targets:** 52 test files, 404/404 passing (target 80% coverage). Code splitting via App Router. `next/image` com WebP/AVIF. 300ms debounce em search. Web Worker para filtering pesado.
- **CDN:** Vercel edge network for static assets. Supabase edge functions for dynamic content.

## Deployment

### Environment Strategy
| Environment | Platform | Config |
|-------------|----------|--------|
| Development | Local (Vite/Turbopack) | `.env.local` |
| Staging | Vercel | Preview deployments |
| Production | Vercel | Production deployment |

### Environment Variables (from .env.example)
```env
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY (server-side only)

# Stripe (optional)
STRIPE_SECRET_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET

# OpenAI (optional)
OPENAI_API_KEY

# Cloudinary (optional)
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET

# Web Push / VAPID (optional)
NEXT_PUBLIC_VAPID_PUBLIC_KEY
VAPID_PRIVATE_KEY
VAPID_SUBJECT

# App Config
NEXT_PUBLIC_APP_URL
NODE_ENV
```

### Branch Strategy
- **ALL development on `dev` branch** — direct commits to `main` forbidden
- **Workflow:** `git checkout dev` → commit → push → merge `dev → main`
- **Pre-commit gate:** Always verify `git branch --show-current`
- **Post-merge:** Shell left on `main` after merge — always re-verify branch

### CI/CD
- GitHub Actions (`.github/`)
- Pre-push validation (lint, typecheck, test)
- Semantic-release for versioning
- Vercel auto-deployment on push to main
- `.lighthouserc.json` for Lighthouse CI

## Monitoring & Observability

- **Performance Dashboard:** `components/ui/common/PerformanceDashboard.tsx` (dev-only) — FPS, memory, filter time
- **Auth Logger:** Last 100 auth events
- **API Monitor:** Request/response logging (`libs/apiMonitor.ts`)
- **DB Monitor:** Query performance (`libs/dbMonitor.ts`)
- **Error Boundary:** Global `ErrorBoundary.tsx` wrapping layout
- **Performance Monitor:** (`libs/performanceMonitor.ts`)
- **Sentry/LogRocket:** Not configured (potential improvement)
- **Lighthouse:** `.lighthouserc.json` config
- **Vercel Analytics:** Built-in deployment analytics

## Monitoring Targets
- Core Web Vitals (LCP, FID, CLS)
- API response times
- Error rates
- Subscription conversion funnel
- Feature usage analytics
- Marketing AI token usage
