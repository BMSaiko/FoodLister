# FoodLister - Active Context

## Current Project State

**Latest Commit**: `1a8a7205c45fffdb9c94bcf9e6c779a6fa564adb`
**Branch**: Main (default)
**Repository**: https://github.com/BMSaiko/FoodLister.git

## Recent Fixes (Current Session)

### Build & Configuration Fixes
- ✅ **Next.js Build Fix**: Set `outputFileTracingRoot: process.cwd()` in `next.config.mjs` to fix lockfile detection issue
- ✅ **Favicon Fix**: Removed duplicate `app/favicon.ico` (kept `public/favicon.ico`) to fix prerender error
- ✅ **Build Status**: `npm run build` now succeeds with all routes generating properly

### RLS Policy Fix (Critical)
- ✅ **Infinite Recursion Fixed**: Created `supabase/fix-rls-recursion-final.sql` with SECURITY DEFINER functions
- ✅ **Root Cause**: Lists and list_collaborators policies were causing infinite recursion
- ✅ **Solution**: Created `can_access_list()` and `is_list_collaborator()` SECURITY DEFINER functions to bypass RLS recursion
- ✅ **Applied**: Run `supabase/fix-rls-recursion-final.sql` in Supabase Dashboard SQL Editor

### Lists API Fix (Current Session)
- ✅ **404 Not Found Error Fixed**: Fixed `app/api/lists/[id]/route.ts` GET handler
- ✅ **Root Cause**: GET handler was using `getClient()` (browser-side client) which doesn't work in server-side API routes
- ✅ **Solution**: Changed to use `getServerClient()` with request/response for authenticated access, with fallback to `getPublicServerClient()` for unauthenticated users
- ✅ **Result**: RLS policies now correctly evaluate `auth.uid()` for authenticated users, fixing 404 errors on list detail pages
- ✅ **Build Verified**: `npm run build` succeeds with the fix applied

### Error Handling Fixes
- ✅ **Logger Fix**: Updated `utils/logger.ts` with try-catch around `JSON.stringify()` to handle circular references
- ✅ **ReviewForm Fix**: Improved error handling in `components/ui/RestaurantDetails/ReviewForm.tsx` to handle different error response formats
- ✅ **Restaurant Details Fix**: Fixed error handling in `app/restaurants/[id]/page.tsx` to safely extract error messages

### Database Migration
- ✅ **SQL Files Created**: 
  - `supabase/run-in-sql-editor.sql` - Complete database setup
  - `supabase/fix-rls-recursion-final.sql` - RLS recursion fix

## Recently Applied Features

### Database Migrations (38 total)
- **Core Tables**: restaurants, profiles, lists, reviews, list_restaurants
- **Junction Tables**: restaurant_cuisine_types, restaurant_features, restaurant_dietary_options_junction
- **Collaboration**: list_collaborators (with roles: editor/viewer)
- **Social Features**: list_comments, user_restaurant_visits
- **Advanced**: filter_presets, user_search_index, scheduled_meals
- **Menu System**: menu_links (max 5), menu_images (max 10), menu_url (deprecated)
- **User Stats**: review_count on profiles with auto-update triggers
- **Public Access**: Migration 036 allows public (unlogged) users to read restaurants

### Key Features Implemented

#### Core Functionality
- ✅ User authentication (Supabase Auth with auto profile creation)
- ✅ Restaurant CRUD with advanced filtering
- ✅ List management (create, edit, delete, duplicate)
- ✅ Restaurant reviews with ratings and amount spent
- ✅ Search across restaurant names, descriptions, locations

#### Advanced Features
- ✅ **List Collaboration**: Invite collaborators with editor/viewer roles
- ✅ **List Comments**: Add comments to lists for discussions
- ✅ **Restaurant Roulette**: Random restaurant picker with filters
- ✅ **Meal Scheduling**: Schedule meals with ICS calendar export
- ✅ **Menu System**: Multiple menu links (5 max) + uploaded images (10 max)
- ✅ **User Profiles**: Public/private profiles with stats (reviews, restaurants, lists)
- ✅ **Visit Tracking**: Track restaurant visits with notes
- ✅ **Filter Presets**: Save and load filter configurations
- ✅ **Dark Mode**: Full dark mode support via next-themes

#### Technical Implementations
- ✅ Server/Client Component architecture (Next.js 15 App Router)
- ✅ Row Level Security (RLS) on all user data tables
- ✅ Real-time subscriptions for collaborative features
- ✅ Rate limiting on API routes (in-memory, TTL-based)
- ✅ Image upload via Cloudinary integration
- ✅ Google Maps URL parsing (no API key required)
- ✅ Performance monitoring dashboard
- ✅ Web Worker for background search operations
- ✅ Responsive design with 44px minimum touch targets

## Active Work in Progress

### Design System Standardization (COMPLETED ✅)
 - ✅ **Root Cause Fixed**: Tailwind CSS v4 → v3 (postcss.config.mjs updated)
 - ✅ **CSS Syntax Fixed**: globals.css rewritten with valid syntax and proper CSS variables
 - ✅ **Phase 1 Complete**: Fixed 45+ components (RestaurantRoulette, ErrorBoundary, EmptyState, Navbar, BaseForm, Card, FilterPanel, TabbedRestaurantFilters, List components, Profile components, etc.)
 - ✅ **Phase 2 Complete**: Fixed remaining ~256 hardcoded color instances in 36+ files
 - ✅ **Build Verified**: `npm run build` succeeds with all fixes applied
 - ✅ **CSS Variables Added**: All necessary color variables (--error-50, --error-100, --green-500, --red-500, --warning, --warning-light, --white, --black, --amber-700, etc.)
 - ✅ **Border Radius Standardized**: Updated tailwind.config.js with consistent radius values
 - ✅ **Typography Conflicts Resolved**: Fixed font family conflicts
 - ✅ **Syntax Errors Fixed**: Unterminated template literals, JSX errors

### Container Margin Fix (COMPLETED ✅)
 - ✅ **Issue**: Restaurant grid on `/restaurants` page was stuck to page edges (no margins like the banner)
 - ✅ **Root Cause**: `Container.tsx` and `RestaurantsList.jsx` used non-existent `container-main` CSS class
 - ✅ **Solution**: Updated to use proper Tailwind classes (`container mx-auto px-3 sm:px-4 lg:px-6`)
 - ✅ **Files Fixed**: `components/ui/Container.tsx`, `components/RestaurantsList.jsx`
 - ✅ **Result**: Grid now has consistent padding matching the `RouletteBanner` component

### From TASKS_5HOURS.md
1. **Performance Optimization**
   - Database query optimization (indexes, query restructuring)
   - Frontend bundle size analysis
   - Image lazy loading improvements

2. **Test Coverage Expansion**
   - Currently 30+ test files in `__tests__/`
   - Focus areas: API routes, hooks, component interactions
   - Target: Increase coverage percentage

3. **List Export Feature**
   - ICS export for meal scheduling (partially implemented)
   - Need: PDF export, CSV export for restaurant lists

4. **Analytics Integration**
   - Performance dashboard exists (dev tool)
   - Need: User behavior tracking, popular restaurants lists

## Immediate Next Steps

### High Priority
1. **Verify Lists Fix**: Test list detail page at `/lists/[id]` (logged in and logged out)
   - Ensure `supabase/fix-rls-recursion-final.sql` has been applied
   - Verify lists load correctly without 404 errors

2. **Apply Migration 036** (Pending user action)
   - Run `supabase/migrations/036_public_restaurant_access.sql` in Supabase SQL Editor
   - Verify unlogged users can access `/restaurants` and `/restaurants/[id]`
   - Verify logged-in users can create/edit restaurants and post reviews
   - Verify review authors' public data is visible

3. **Complete Test Coverage**
   - Add tests for newly implemented features (collaboration, comments, meal scheduling)
   - Achieve 80%+ coverage target

4. **Feature Polish**
   - Improve error messages and user feedback
   - Add loading skeletons for all async operations
   - Enhance mobile experience

### Medium Priority
4. **Documentation**
    - Update API documentation (docs/api/api-documentation.md)
    - Create user guide for collaboration features
    - Document filter preset system
    - Memory bank organized in `memory-bank/` folder
    - Documentation organized in `docs/` subdirectories (api/, architecture/, database/, features/, guides/, progress/, reference/, setup/, tasks/)

## Current Focus Areas

### Code Quality
- **ESLint**: 9.39.2 with Next.js and React Hooks rules
- **TypeScript**: Strict mode enabled, 5.8.2
- **Testing**: Jest 30.0.2 + React Testing Library

### Performance Monitoring
- **Dashboard**: `components/ui/common/PerformanceDashboard.tsx` (dev only)
- **Metrics**: FPS, memory usage, filter time, search count
- **Logging**: Auth events (last 100), API performance, DB query times

### Security
- **RLS Policies**: Active on all user tables
- **Rate Limiting**: 100 req/15min (API), 10 req/15min (auth)
- **Input Validation**: Client + server + database levels

## Environment & Deployment

### Development
- **Command**: `npm run dev` (Turbopack enabled)
- **Environment**: `.env.local` with Supabase + Cloudinary credentials
- **IDE**: Next.js CLI with hot reloading

### Production
- **Platform**: Vercel (recommended)
- **Build**: `npm run build`
- **Environment**: Set in Vercel dashboard

### CI/CD
- **GitHub Actions**: Configured in `.github/`
- **Scripts**: `scripts/setup-github-secrets.js` for secret setup

## Known Issues & Technical Debt

### From docs/future-issues.md
1. **Database**
   - Some duplicate policies need cleanup (migration 032, 035)
   - Consider adding database-level constraints for menu array limits

2. **Frontend**
   - Some components mix Server/Client patterns (needs review)
   - Performance dashboard is dev-only (consider production metrics)
   - **Design**: ✅ COMPLETED - All hardcoded colors replaced with CSS variables

3. **Testing**
   - Some API routes lack comprehensive tests
   - E2E tests not implemented (consider Playwright/Cypress)

4. **Features**
   - PWA capabilities not implemented
   - Advanced analytics missing
   - Offline support not available

## Team & Collaboration

- **Repository**: https://github.com/BMSaiko/FoodLister.git
- **Contribution**: Fork → Feature Branch → PR workflow
- **Documentation**: All docs in `docs/` directory
- **Issue Tracking**: GitHub Issues (implied by repo structure)

## Session Context for AI Assistants

When working on this project:
1. **Always check**: Latest commit hash is `116dd26d6b002f4d18b58e03d9a5e81ab285c1fd` (branch: `76-design-ter-o-msm-design-em-toda-a-webapp`)
2. **Database changes**: Use `supabase/migrations/` with sequential numbering
3. **Component type**: Default to Server Components, add 'use client' only when needed
4. **State management**: Use Context API (Auth, Filters, Modal) + custom hooks
5. **Testing**: Add tests in `__tests__/` mirroring the source structure
6. **Styling**: TailwindCSS 3 with dark mode support (class strategy) - **v4 conflict fixed**
7. **Environment**: Never commit `.env.local`, use `.env.local.example`
8. **Design System**: 🚧 IN PROGRESS - ~70% complete
   - **Fixed**: 45+ components converted to CSS variables
   - **Remaining**: ~100+ instances in 15+ .tsx files
   - **Key files pending**: ListForm.tsx, FilterPanel.tsx, PriceLevelDisplay.tsx, FormSection.tsx, FormField.tsx
   - **Pattern**: Replace `bg-gray-50` → `bg-[var(--gray-50)]`, `text-gray-800` → `text-[var(--gray-800)]`, etc.
