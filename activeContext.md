# FoodLister - Active Context

## Current Project State

**Latest Commit**: `89d5da742a8cd0ee758ec9c34572103151f9584a`

**Branch**: Main (default)
**Repository**: https://github.com/BMSaiko/FoodLister.git

## Recently Applied Features

### Database Migrations (37 total)
- **Core Tables**: restaurants, profiles, lists, reviews, list_restaurants
- **Junction Tables**: restaurant_cuisine_types, restaurant_features, restaurant_dietary_options_junction
- **Collaboration**: list_collaborators (with roles: editor/viewer)
- **Social Features**: list_comments, user_restaurant_visits
- **Advanced**: filter_presets, user_search_index, scheduled_meals
- **Menu System**: menu_links (max 5), menu_images (max 10), menu_url (deprecated)
- **User Stats**: review_count on profiles with auto-update triggers

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

### Recent Code Changes
- Applied review_count migration (scripts/add-review-count-column.sql)
- Fixed database issues (scripts/fix-database-issues.sql)
- Updated TypeScript types (types/database.ts)
- Enhanced filter system with tabbed interface

## Immediate Next Steps

### High Priority
1. **Complete Test Coverage**
   - Add tests for newly implemented features (collaboration, comments, meal scheduling)
   - Achieve 80%+ coverage target

2. **Performance Audit**
   - Run Lighthouse audits on key pages
   - Optimize slow database queries
   - Implement virtual scrolling for large lists (if needed)

3. **Bug Fixes**
   - Monitor auth logger for authentication issues
   - Fix any failing tests in `__tests__/`
   - Address known issues in docs/future-issues.md

### Medium Priority
4. **Feature Polish**
   - Improve error messages and user feedback
   - Add loading skeletons for all async operations
   - Enhance mobile experience

5. **Documentation**
   - Update API documentation (docs/api-documentation.md)
   - Create user guide for collaboration features
   - Document filter preset system

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
1. **Always check**: Latest commit hash is `89d5da742a8cd0ee758ec9c34572103151f9584a`
2. **Database changes**: Use `supabase/migrations/` with sequential numbering
3. **Component type**: Default to Server Components, add 'use client' only when needed
4. **State management**: Use Context API (Auth, Filters, Modal) + custom hooks
5. **Testing**: Add tests in `__tests__/` mirroring the source structure
6. **Styling**: TailwindCSS 4 with dark mode support (class strategy)
7. **Environment**: Never commit `.env.local`, use `.env.local.example`