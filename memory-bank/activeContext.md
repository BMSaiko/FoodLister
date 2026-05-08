# FoodLister - Active Context

## Current Project State

**Latest Commit**: 7f67e39 (after standardizing API error handling)
**Branch**: dev
**Repository**: https://github.com/BMSaiko/FoodLister.git

## Recently Completed (2026-05-08)

### 5-Hour Task Plan - COMPLETED ✅
- ✅ **Step 1**: Fix TypeScript `any` types (types/api.ts, libs/api.ts, libs/auth.ts, utils/analytics.ts, utils/authLogger.ts)
- ✅ **Step 2**: Standardize API Error Handling (15+ routes updated with getErrorMessage() and ApiErrorType)
  - ✅ auth/session, lists/[id], lists/[id]/collaborators, lists/[id]/comments
  - ✅ meals/schedule, meals/scheduled, meals/[id], meals/[id]/ics
  - ✅ notifications, notifications/create, restaurants/[id]/visits
  - ✅ cuisine-types, dietary-options, features, meals/participants
  - ✅ users/me
- ✅ **Step 3**: Add Empty States to Components (RestaurantGrid.jsx, RestaurantList/RestaurantGrid.tsx)
- ✅ **Step 4**: Improve Accessibility (RestaurantCard/index.tsx - aria-label, keyboard nav)
- ✅ **Step 5**: Create Contribution Guide (docs/guides/contribution-guide.md)
- ✅ **Step 6**: Enhance User Error Messages (utils/error-messages.ts - fixed any type, added ENHANCED_ERROR_MESSAGES)
- ✅ **Step 7**: Production Preparation (build ✅, lint ✅ 0 errors, tests ✅ 84 passing)
- ✅ **Step 8**: Final Verification (all checks passed)

### Files Modified/Created:
1. `types/database.ts` - Added missing columns (opening_hours, website, phone, menu, updated_at)
2. `types/api.ts` - Fixed isApiError() parameter type, added ERROR_MESSAGES mapping
3. `libs/api.ts` - Typed buildQueryString() params
4. `libs/auth.ts` - Fixed all callback parameter types
5. `utils/analytics.ts` - Typed event properties
6. `utils/authLogger.ts` - Fixed details parameter type
7. `utils/error-messages.ts` - Fixed any type, added ENHANCED_ERROR_MESSAGES
8. `app/api/reviews/route.ts` - Standardized error handling
9. `app/api/lists/[id]/route.ts` - Standardized error handling
10. `app/api/restaurants/[id]/route.ts` - Standardized error handling
11. `app/api/auth/session/route.ts` - Standardized error handling
12. `app/api/lists/[id]/collaborators/route.ts` - Standardized error handling
13. `app/api/lists/[id]/comments/route.ts` - Standardized error handling
14. `app/api/meals/schedule/route.ts` - Standardized error handling
15. `app/api/meals/scheduled/route.ts` - Standardized error handling
16. `app/api/meals/[id]/route.ts` - Standardized error handling
17. `app/api/meals/[id]/ics/route.ts` - Standardized error handling
18. `app/api/notifications/route.ts` - Standardized error handling
19. `app/api/restaurants/[id]/visits/route.ts` - Standardized error handling
20. `app/api/cuisine-types/route.ts` - Standardized error handling
21. `app/api/dietary-options/route.ts` - Standardized error handling
22. `app/api/features/route.ts` - Standardized error handling
23. `app/api/meals/participants/route.ts` - Standardized error handling
24. `app/api/users/me/route.ts` - Standardized error handling
25. `components/ui/RestaurantGrid.jsx` - Added empty state
26. `components/ui/RestaurantList/RestaurantGrid.tsx` - Added empty state
27. `components/ui/RestaurantCard/index.tsx` - Added accessibility features
28. `docs/guides/contribution-guide.md` - Created new file

## Recent Fixes (Current Session)

### Documentation Update Session (2026-05-07)
- ✅ **Complete Documentation Update**: Updated all 18+ documentation files in `docs/` directory
- ✅ **README.md Updated**: Reflected current project state (~85% completion)
- ✅ **New Cline Rule**: Created `.clinerules/docs-command.md` for `/docs` command

### Files Updated in Documentation:
- ✅ `docs/api/api-documentation.md` - Updated with current API structure (20+ endpoints)
- ✅ `docs/api/api-endpoints-reference.md` - Complete endpoint reference
- ✅ `docs/architecture/architecture-overview.md` - Updated (Tailwind 3, all tables, components)
- ✅ `docs/database/database-schema.md` - Complete schema with all tables
- ✅ `docs/database/database-schema-reference.md` - Technical reference updated
- ✅ `docs/features/feature-create-pipeline.md` - Pipeline documentation
- ✅ `docs/features/lists-feature-roadmap.md` - Roadmap updated
- ✅ `docs/guides/development-guide.md` - Development guide updated
- ✅ `docs/guides/advanced-filters-guide.md` - Advanced filters guide
- ✅ `docs/guides/deployment-guide.md` - Deployment guide (Vercel, Netlify, Railway, Docker)
- ✅ `docs/guides/error-handling-guide.md` - Error handling guide
- ✅ `docs/guides/fix-review-count-error.md` - Review count error fix guide
- ✅ `docs/guides/refactoring-guide.md` - Refactoring guide
- ✅ `docs/progress/progress-tracker.md` - Progress tracker updated
- ✅ `docs/progress/future-issues.md` - Future issues updated
- ✅ `docs/progress/SESSION-REPORT.md` - Session report created
- ✅ `docs/reference/PROJECT-SKILLS.md` - Skills documentation updated
- ✅ `docs/reference/prompt-templates.md` - Prompt templates updated
- ✅ `docs/reference/subagents-repetitive-task-rule.md` - Subagents rule documented
- ✅ `docs/setup/github-secrets-setup.md` - GitHub secrets setup updated
- ✅ `docs/tasks/TASKS_5HOURS.md` - Task list updated
- ✅ `README.md` - Root README updated

### Documentation Update Process:
1. **Read Codebase**: Used subagents to parallelize reading of all directories
2. **Update Docs**: All 18+ files in `docs/` updated to reflect current state
3. **Update README**: Root README.md updated with current features and progress
4. **Create Rule**: New `.clinerules/docs-command.md` created

### Key Changes Made:
- **Project Name**: Corrected "FoodList" to "FoodLister" throughout all docs
- **Progress**: Updated to ~85% completion
- **API Endpoints**: Documented all 20+ endpoints
- **Database**: Updated with all 12 tables
- **Features**: Documented all implemented features (menus, user profiles, advanced filters)
- **Tech Stack**: Updated to reflect current versions (Next.js 15, React 18, TailwindCSS 3)

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

### Sticky Submit Buttons (COMPLETED ✅)
   - ✅ **FormActions Component**: Modified to use fixed positioning on mobile (`fixed bottom-0 left-0 right-0`) and right-aligned on desktop (`md:fixed md:bottom-4 md:right-4 md:left-auto md:w-auto md:rounded-xl md:border md:shadow-xl`)
   - ✅ **ListForm.tsx**: Replaced inline buttons with shared FormActions component
   - ✅ **RestaurantForm.tsx**: Already using FormActions with proper bottom padding (`pb-24 md:pb-8`)
   - ✅ **RestaurantRoulette.tsx**: Made spin button sticky with fixed container (`fixed bottom-4 left-4 right-4 z-[9999]`) and right-aligned on desktop
   - ✅ **Settings Page**: Replaced SettingsStickyNavbar with FormActions component, deleted unused SettingsStickyNavbar.tsx
   - ✅ **Mobile-Friendly**: All buttons have 44px minimum touch targets
   - ✅ **Responsive Design**: Maintained the existing design system (amber/orange colors, rounded-full for spin button)
   - ✅ **Build Verified**: `npm run build` succeeds with all changes
   - ✅ **Test File Created**: `__tests__/pages/settings.test.tsx` (note: has pre-existing infinite loop bug in component)

### Container Margin Fix (COMPLETED ✅)
   - ✅ **Issue**: Restaurant grid on `/restaurants` page was stuck to page edges (no margins like the banner)
   - ✅ **Root Cause**: `Container.tsx` and `RestaurantsList.jsx` used non-existent `container-main` CSS class
   - ✅ **Solution**: Updated to use proper Tailwind classes (`container mx-auto px-3 sm:px-4 lg:px-6`)
   - ✅ **Files Fixed**: `components/ui/Container.tsx`, `components/RestaurantsList.jsx`
   - ✅ **Result**: Grid now has consistent padding matching the `RouletteBanner` component

### Map Modal Design Improvement (COMPLETED ✅)
   - ✅ **Google Maps Button Fix**: Added missing `--blue-500` CSS variable to `app/globals.css`
   - ✅ **Root Cause**: Button appeared white when not hovering because `--blue-500` was not defined
   - ✅ **Solution**: Added `--blue-500: #3b82f6` to CSS variables
   - ✅ **Modal Design Improved**: Enhanced `components/ui/RestaurantManagement/MapSelectorModal.tsx`
   - Added prominent location display with icon
   - Improved button styling with better padding, borders, and hover effects
   - Added Cancel button with outline style
   - Improved header with MapPin icon
   - Better spacing and typography
   - Added transition animations
   - ✅ **Build Verified**: `npm run build` succeeds with all changes

### Settings Page Sticky Buttons (COMPLETED ✅)
   - ✅ **Replaced SettingsStickyNavbar**: Updated `app/users/settings/page.tsx` to use FormActions component
   - ✅ **Deleted SettingsStickyNavbar.tsx**: Removed unused component from `components/ui/navigation/`
   - ✅ **Added FormActions**: With props onCancel, onSubmit, submitText="Salvar Alterações", loading
   - ✅ **Page Padding**: Added `pb-24 md:pb-8` to page container for mobile button spacing
   - ✅ **Removed Unused Code**: Removed handleSave function and desktop-only action div
   - ✅ **Build Verified**: `npm run build` succeeds
   - ✅ **Test File Created**: `__tests__/pages/settings.test.tsx` (note: has pre-existing infinite loop bug in component)

### Visit Status Button Fix (COMPLETED ✅)
   - ✅ **Problem**: Visit status buttons on restaurant cards in individual list pages showed "not visited" incorrectly
   - ✅ **Root Cause**: `app/api/restaurants/visits/route.ts` was trying to access `visit.visit_count` column that doesn't exist in `user_restaurant_visits` table
   - ✅ **Solution**: Updated API to properly count visits by grouping rows by `restaurant_id` and calculating `visit_count` as the number of rows per restaurant
   - ✅ **Files Fixed**: `app/api/restaurants/visits/route.ts`
   - ✅ **Build Verified**: `npm run build` succeeds with the fix

### Google Maps Modal Button CSS Fix (COMPLETED ✅)
   - ✅ **Problem**: "Usar estas informações" button appeared completely white
   - ✅ **Root Cause**: Incorrect CSS variable syntax `from-[--green-600]` instead of `from-[var(--green-600)]`
   - ✅ **Solution**: Fixed CSS in `components/ui/RestaurantDetails/GoogleMapsModal.tsx` line 362
   - ✅ **Build Verified**: `npm run build` succeeds

### Map Links Logic Fix (COMPLETED ✅)
   - ✅ **Problem**: Map links were using location string for all map services
   - ✅ **Solution**: Updated `components/ui/RestaurantManagement/MapSelectorModal.tsx`:
   - Google Maps now uses `source_url` (extracted Google Maps URL from creation)
   - Waze and Apple Maps use only coordinates (no location string)
   - ✅ **Build Verified**: `npm run build` succeeds

### Navbar Verification (COMPLETED ✅)
   - ✅ **Problem**: User reported navbar disappears when editing a list at `/lists/[id]/edit`
   - ✅ **Verification**: Confirmed Navbar is present in `components/pages/EditList.jsx` (lines 90, 107) and `app/lists/[id]/edit/page.tsx`
   - ✅ **Status**: No fix needed - Navbar is properly included

## From TASKS_5HOURS.md

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

### Recently Completed
- ✅ **Sticky Submit Buttons**: Made submit buttons sticky on pages with create, edit, or spin actions (FormActions, ListForm, RestaurantForm, RestaurantRoulette, Settings)
- ✅ **Settings Page**: Implemented sticky submit buttons with FormActions component
- ✅ **Visit Status Fix**: Fixed API to properly count visits per restaurant
- ✅ **Google Maps Button CSS**: Fixed incorrect CSS variable syntax
- ✅ **Map Links Logic**: Google Maps uses source_url, others use coordinates only
- ✅ **Navbar Verification**: Confirmed present in EditList page
- ✅ **Documentation Update**: All 18+ docs updated, README updated, new Cline rule created

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
1. **Always check**: Latest commit hash is `7f67e39` (branch: `dev`)
2. **Database changes**: Use `supabase/migrations/` with sequential numbering
3. **Component type**: Default to Server Components, add 'use client' only when needed
4. **State management**: Use Context API (Auth, Filters, Modal) + custom hooks
5. **Testing**: Add tests in `__tests__/` mirroring the source structure
6. **Styling**: TailwindCSS 3 with dark mode support (class strategy) - **v4 conflict fixed**
7. **Environment**: Never commit `.env.local`, use `.env.local.example`
8. **Design System**: ✅ COMPLETED - All hardcoded colors replaced with CSS variables
9. **Sticky Buttons**: Submit buttons use fixed positioning on mobile, right-aligned on desktop via FormActions component
10. **/update Command**: Follow rules in `.clinerules/update-command.md` for memory bank updates, commits, and push
11. **/docs Command**: Follow rules in `.clinerules/docs-command.md` for documentation updates
12. **Type Safety**: Use types from `types/api.ts` and `libs/types.ts`, avoid `any` types
13. **Error Handling**: Use `ApiErrorType` and `getErrorMessage()` from `types/api.ts` in API routes (15+ routes completed)