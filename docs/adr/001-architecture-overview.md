# ADR-001: FoodLister Architecture Overview

## Status
Accepted

## Date
2026-06-13

## Context
FoodLister is a restaurant discovery and list management web application. The architecture needs to support real-time collaboration, subscription-based monetization, and scalable data management.

## Decision

### Tech Stack
- **Frontend**: Next.js 15 (App Router) + React 18 + Tailwind CSS 3
- **Backend**: Next.js API Routes + Supabase
- **Database**: PostgreSQL (Supabase)
- **Auth**: Supabase Auth (email/password + OAuth)
- **Storage**: Supabase Storage + Cloudinary (images)
- **Payments**: Stripe (subscriptions)
- **Deployment**: Vercel (frontend) + Supabase (backend)

### Architecture Pattern
- **Server Components by default** — use `'use client'` only when needed (interactivity, hooks, browser APIs)
- **Client Components** — forms, modals, interactive UI
- **API Routes** — `/app/api/` for all backend endpoints
- **Hooks** — custom hooks for data fetching and state management
- **Contexts** — AuthContext, FiltersContext for global state

### Database Design Principles
- UUID primary keys for all tables
- Row Level Security (RLS) enabled on all user-facing tables
- Migrations in `supabase/migrations/` with sequential naming
- Junction tables for many-to-many relationships

## Consequences
- ✅ Type-safe database operations via generated types
- ✅ Secure by default with RLS policies
- ✅ Scalable serverless architecture
- ⚠️ Requires Supabase service role key for admin operations
- ⚠️ Stripe webhook requires public URL for production

## Related
- ADR-002: Subscription System Design
- ADR-003: Notification System Architecture
