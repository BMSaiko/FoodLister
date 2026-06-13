# Database Schema

FoodLister uses Supabase (PostgreSQL) with 20+ tables, 47 migrations, and Row Level Security (RLS) on all user-facing tables.

## Entity Relationship Diagram

```
┌──────────────┐     ┌───────────────────┐     ┌──────────────┐
│   profiles   │     │    restaurants     │     │ cuisine_types│
├──────────────┤     ├───────────────────┤     ├──────────────┤
│ id           │     │ id                │     │ id           │
│ user_id      │     │ name              │     │ name         │
│ display_name │     │ description       │     │ icon         │
│ avatar_url   │     │ rating            │     └──────┬───────┘
│ is_admin     │     │ location          │            │
│ subscription_│     │ latitude          │     ┌──────┴───────┐
│  tier        │     │ longitude         │     │restaurant_   │
└──────┬───────┘     │ price_per_person  │     │cuisine_types │
       │             └─────────┬─────────┘     └──────────────┘
       │                       │
       │    ┌──────────────────┼──────────────────┐
       │    │                  │                  │
       ▼    ▼                  ▼                  ▼
┌──────────────┐  ┌────────────────┐  ┌──────────────────┐
│    lists     │  │    reviews     │  │  restaurant_     │
├──────────────┤  ├────────────────┤  │  features        │
│ id           │  │ id             │  ├──────────────────┤
│ name         │  │ restaurant_id  │  │ id               │
│ creator_id   │  │ user_id        │  │ restaurant_id    │
│ is_public    │  │ rating         │  │ feature_id       │
└──────┬───────┘  │ comment        │  └──────────────────┘
       │          └────────────────┘
       │
       ├──► list_restaurants (junction)
       ├──► list_collaborators
       ├──► list_comments
       ├──► list_activities
       │
       ▼
┌──────────────────┐     ┌──────────────────┐
│ scheduled_meals  │     │meal_participants │
├──────────────────┤     ├──────────────────┤
│ id               │     │ id               │
│ restaurant_id    │     │ scheduled_meal_id│
│ organizer_id     │     │ user_id          │
│ meal_date        │     │ status           │
│ meal_time        │     └──────────────────┘
└──────────────────┘

┌──────────────────┐     ┌──────────────────┐
│  notifications   │     │notification_     │
├──────────────────┤     │preferences       │
│ id               │     ├──────────────────┤
│ user_id          │     │ id               │
│ type             │     │ user_id          │
│ title            │     │ email_notifications│
│ message          │     │ push_notifications│
│ read             │     │ push_subscription│
└──────────────────┘     └──────────────────┘

┌──────────────────┐     ┌──────────────────┐
│subscription_plans│     │user_subscriptions│
├──────────────────┤     ├──────────────────┤
│ id               │     │ id               │
│ name             │     │ user_id          │
│ price_monthly    │     │ plan_id          │
│ price_yearly     │     │ status           │
│ stripe_price_*   │     │ stripe_subscription_id│
└──────────────────┘     └──────────────────┘

┌──────────────────┐     ┌──────────────────┐
│marketing_        │     │social_media_     │
│campaigns         │     │posts             │
├──────────────────┤     ├──────────────────┤
│ id               │     │ id               │
│ user_id          │     │ campaign_id      │
│ name             │     │ restaurant_id    │
│ status           │     │ content          │
│ target_platforms │     │ platform         │
└──────────────────┘     │ status           │
                         │ ai_generated     │
┌──────────────────┐     └──────────────────┐
│  ai_workflows    │     ┌──────────────────┤
├──────────────────┤     │content_generation│
│ id               │     │_logs             │
│ name             │     ├──────────────────┤
│ trigger_type     │     │ id               │
│ prompt_template  │     │ workflow_id      │
│ is_active        │     │ post_id          │
└──────────────────┘     │ status           │
                         │ tokens_used      │
                         └──────────────────┘
```

## Tables Summary

| Table | Purpose | RLS |
|-------|---------|-----|
| **profiles** | User profiles + subscription tier + admin | ✅ |
| **restaurants** | Restaurant data with location, ratings, menus | ✅ |
| **lists** | User-created restaurant lists | ✅ |
| **list_restaurants** | Junction: lists ↔ restaurants | ✅ |
| **list_collaborators** | List sharing (editor/viewer) | ✅ |
| **list_comments** | Comments on lists | ✅ |
| **list_activities** | Activity feed per list | ✅ |
| **reviews** | Restaurant ratings and comments | ✅ |
| **cuisine_types** | Cuisine categories | Read: public |
| **restaurant_cuisine_types** | Junction | ✅ |
| **restaurant_features** | Amenity categories | Read: public |
| **restaurant_restaurant_features** | Junction | ✅ |
| **restaurant_dietary_options** | Dietary categories | Read: public |
| **restaurant_dietary_options_junction** | Junction | ✅ |
| **scheduled_meals** | Group meal planning | ✅ |
| **meal_participants** | Meal participants | ✅ |
| **user_restaurant_visits** | Visit tracking | ✅ |
| **notifications** | In-app notifications | ✅ |
| **notification_preferences** | Per-user notification settings | ✅ |
| **subscription_plans** | Free/Premium/Pro plans | Read: public |
| **user_subscriptions** | Stripe subscription tracking | ✅ |
| **admin_roles** | Admin role management | ✅ |
| **marketing_campaigns** | Social media campaigns | ✅ |
| **social_media_posts** | Scheduled/published posts | ✅ |
| **ai_workflows** | AI content generation workflows | ✅ |
| **content_generation_logs** | AI generation audit trail | ✅ |

## Key Indexes (47 total)

| Table | Index | Purpose |
|-------|-------|---------|
| restaurants | `idx_restaurants_rating_desc` | Sort by rating |
| restaurants | `idx_restaurants_price_per_person` | Price range filter |
| restaurants | `idx_restaurants_creator_id` | User's restaurants |
| restaurants | `idx_restaurants_rating_created` | Combined sort |
| lists | `idx_lists_creator_id` | User's lists |
| lists | `idx_lists_creator_public` | Public lists by creator |
| list_restaurants | `idx_list_restaurants_list_id_position` | Ordered list items |
| reviews | `idx_reviews_restaurant_id_created` | Restaurant reviews |
| reviews | `idx_reviews_user_id_created` | User's reviews |
| notifications | `idx_notifications_user_created` | User notifications |
| notifications | `idx_notifications_user_unread` | Unread count |
| social_media_posts | `idx_social_media_posts_scheduled` | Scheduled posts |
| ai_workflows | `idx_ai_workflows_trigger` | Active workflows by trigger |
| user_subscriptions | `idx_user_subscriptions_status_period` | Active subscriptions |
| profiles | `idx_profiles_user_id_code` | User code lookup |
| profiles | `idx_profiles_public` | Public profiles |

## Migrations

47 migrations in `supabase/migrations/`:

| Range | Focus |
|-------|-------|
| 001–010 | Core schema (profiles, restaurants, lists, reviews) |
| 011–020 | Security, RLS, visits, fixes |
| 021–030 | Lists features, meals, notifications |
| 031–040 | Notifications, security cleanup, performance indexes |
| 041 | Performance indexes (restaurants, lists, reviews) |
| 042 | Notification preferences |
| 043 | Subscription system (plans, subscriptions) |
| 044 | RLS policy consolidation |
| 045 | Missing indexes (activities, collaborators, meals, visits) |
| 046 | Push notification subscription |
| 047 | Marketing AI (campaigns, posts, workflows, logs) |

## Row Level Security

All user-facing tables have RLS enabled. Policies follow these patterns:

- **Public read:** Reference data (cuisine_types, features, dietary_options, subscription_plans)
- **Owner-only:** User data (profiles, lists, reviews, notifications, subscriptions)
- **Creator-based:** Content ownership (restaurants, marketing_campaigns, social_media_posts)
- **Collaborator access:** Shared resources (list_collaborators → lists)

Migration `044_consolidate_rls_policies.sql` contains all policies in one place.
