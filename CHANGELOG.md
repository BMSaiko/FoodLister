# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Global Search (Cmd+K)** — Real-time search across restaurants and public lists with keyboard shortcut
- **List Export** — Export lists as CSV, JSON, or formatted text
- **Error Boundary** — Graceful error handling with reset and home navigation
- **Accessibility (a11y)** — ARIA labels on all interactive elements in Navbar and SignIn
- **Bundle Optimization** — `optimizePackageImports` for lucide-react and supabase-js
- **CI/CD Pipeline** — GitHub Actions for test, build, typecheck, and lint

### Fixed
- **API Routes** — Added null checks after `getServerClient()` in 8 routes to prevent 500 errors
- **Middleware** — Fixed redirect from `/auth/login` to `/auth/signin`
- **Tests** — Fixed 11 test failures across auth, hooks, and API tests

### Changed
- **Test Coverage** — Improved from 387 to 414 passing tests (100% pass rate)
- **Bundle Size** — Optimized shared bundle to 102kB

## [0.1.0] — 2026-06-13

### Added
- **Core Features** — Restaurant discovery, list management, reviews, user profiles
- **Authentication** — Supabase Auth with email/password, email verification, account lockout
- **Social** — Collaboration, comments, activity feed, meal scheduling
- **Subscriptions** — Stripe checkout with 3 tiers (Free, Premium, Pro)
- **Notifications** — In-app, email, push notifications with preferences
- **Marketing AI** — OpenAI GPT-4o-mini content generation
- **PWA** — Service Worker, offline fallback, install prompt
- **Admin Dashboard** — Stats, user management, content moderation
- **Testing** — 57 test files with Jest + React Testing Library
- **Storybook** — Component development environment
