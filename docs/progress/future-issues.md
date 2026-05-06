# Future Issues - FoodList

This document contains a list of potential improvements and features to be implemented in the FoodList application. Each item is formatted as a GitHub issue template for easy creation.

---

## 🔧 Bug Fixes & Improvements

### 1. Implement Delete Restaurant Functionality

**Priority:** Medium  
**Labels:** `enhancement`, `user-profile`, `restaurants`

**Description:**
The `onDelete` handler in `UserRestaurantsSection.tsx` is currently empty. Users should be able to delete restaurants from their profile.

**Current State:**
```tsx
onDelete={() => {
  // Handle delete functionality
}}
```

**Acceptance Criteria:**
- [ ] Add confirmation dialog before deletion
- [ ] Call DELETE API endpoint `/api/restaurants/{id}`
- [ ] Remove restaurant from local state on success
- [ ] Show success/error toast notifications
- [ ] Handle edge cases (restaurant with reviews, lists, etc.)
- [ ] Add loading state during deletion

**Files to Modify:**
- `components/ui/profile/sections/restaurants/UserRestaurantsSection.tsx`
- `app/api/restaurants/[id]/route.ts` (verify/create endpoint)

---

### 2. Implement Delete List Functionality

**Priority:** Medium  
**Labels:** `enhancement`, `user-profile`, `lists`

**Description:**
Users should be able to delete lists from their profile. Currently, the delete functionality is not implemented in the UserListsSection.

**Acceptance Criteria:**
- [ ] Add delete button to list cards (only for own profile)
- [ ] Add confirmation dialog before deletion
- [ ] Call DELETE API endpoint `/api/lists/{id}`
- [ ] Remove list from local state on success
- [ ] Show success/error toast notifications
- [ ] Handle edge cases (list with restaurants)

**Files to Modify:**
- `components/ui/profile/sections/lists/UserListsSection.tsx`
- `app/api/lists/[id]/route.ts` (verify/create endpoint)

---

### 3. Implement Share Functionality for Restaurants

**Priority:** Low  
**Labels:** `enhancement`, `user-profile`, `social`

**Description:**
The `onShare` handler in `UserRestaurantsSection.tsx` is currently empty. Users should be able to share restaurants via Web Share API or clipboard.

**Acceptance Criteria:**
- [ ] Implement Web Share API for supported browsers
- [ ] Fallback to clipboard copy for unsupported browsers
- [ ] Share URL format: `/restaurants/{id}`
- [ ] Include restaurant name in share title
- [ ] Show toast notification on successful share/copy

**Files to Modify:**
- `components/ui/profile/sections/restaurants/UserRestaurantsSection.tsx`
- Consider creating a shared `useShare` hook

---

### 4. Implement Share Functionality for Lists

**Priority:** Low  
**Labels:** `enhancement`, `user-profile`, `social`

**Description:**
Users should be able to share their restaurant lists with others via Web Share API or clipboard.

**Acceptance Criteria:**
- [ ] Add share button to list cards
- [ ] Implement Web Share API for supported browsers
- [ ] Fallback to clipboard copy
- [ ] Share URL format: `/lists/{id}`
- [ ] Include list name in share title

**Files to Modify:**
- `components/ui/profile/sections/lists/UserListsSection.tsx`

---

## 🧪 Testing

### 5. Add Unit Tests for Profile Components

**Priority:** Medium  
**Labels:** `testing`, `user-profile`

**Description:**
Add comprehensive unit tests for all profile-related components to ensure reliability and prevent regressions.

**Components to Test:**
- [ ] `ProfileCard.tsx`
- [ ] `RestaurantCard.tsx` (profile version)
- [ ] `RestaurantCardFooter.tsx` (profile version)
- [ ] `RestaurantCardActions.tsx` (profile version)
- [ ] `ReviewCard.tsx`
- [ ] `ReviewCardFooter.tsx`
- [ ] `ReviewCardActions.tsx`
- [ ] `SkeletonLoader.tsx`
- [ ] `TouchButton.tsx`
- [ ] `EmptyState.tsx`

**Test Cases:**
- [ ] Render without crashing
- [ ] Display correct data (name, rating, date, etc.)
- [ ] Handle missing/optional data gracefully
- [ ] Click handlers fire correctly
- [ ] Keyboard navigation works
- [ ] Responsive rendering at different breakpoints

**Files to Create:**
- `components/ui/profile/sections/shared/__tests__/ProfileCard.test.tsx`
- `components/ui/profile/sections/restaurants/__tests__/RestaurantCard.test.tsx`
- `components/ui/profile/sections/reviews/__tests__/ReviewCard.test.tsx`
- `components/ui/profile/sections/shared/__tests__/TouchButton.test.tsx`
- `components/ui/profile/sections/shared/__tests__/SkeletonLoader.test.tsx`

---

### 6. Add Integration Tests for User Profile Page

**Priority:** Medium  
**Labels:** `testing`, `user-profile`, `integration`

**Description:**
Add integration tests for the user profile page to verify the complete user flow.

**Test Scenarios:**
- [ ] Load profile page with data
- [ ] Switch between tabs (Reviews, Restaurants, Lists)
- [ ] Load more items via pagination
- [ ] View another user's profile
- [ ] Edit own content (review, restaurant)
- [ ] Empty states display correctly

**Files to Create:**
- `app/users/[id]/__tests__/page.test.tsx`

---

## ⚡ Performance

### 7. Implement Virtual Scrolling for Large Lists

**Priority:** Low  
**Labels:** `performance`, `user-profile`

**Description:**
For users with many reviews, restaurants, or lists, implement virtual scrolling to improve rendering performance.

**Current Issue:**
All items are rendered at once, which can cause performance issues with large datasets (100+ items).

**Proposed Solution:**
- Use `react-window` or `@tanstack/virtual` for virtualization
- Only render visible items + buffer
- Maintain scroll position on navigation

**Acceptance Criteria:**
- [ ] Smooth scrolling with 500+ items
- [ ] Memory usage stays constant regardless of total items
- [ ] Load more functionality still works
- [ ] Scroll position preserved on tab switch

**Files to Modify:**
- `components/ui/profile/sections/reviews/UserReviewsSection.tsx`
- `components/ui/profile/sections/restaurants/UserRestaurantsSection.tsx`
- `components/ui/profile/sections/lists/UserListsSection.tsx`

---

### 8. Optimize Image Loading with Lazy Loading

**Priority:** Low  
**Labels:** `performance`, `images`

**Description:**
Implement proper lazy loading for restaurant images in cards to improve initial page load time.

**Acceptance Criteria:**
- [ ] Images below the fold are lazy loaded
- [ ] Placeholder shown while loading
- [ ] Smooth transition when image loads
- [ ] Use Next.js Image component where possible

---

## 🎨 UI/UX Improvements

### 9. Add Skeleton Loading for Profile Header

**Priority:** Low  
**Labels:** `ui`, `user-profile`

**Description:**
Add skeleton loading state for the UserProfileHeader component while user data is being fetched.

**Acceptance Criteria:**
- [ ] Skeleton matches final layout structure
- [ ] Shows user avatar, name, and stats placeholders
- [ ] Smooth transition to actual content

**Files to Modify:**
- `components/ui/profile/UserProfileHeader.tsx`
- `app/users/[id]/page.tsx`

---

### 10. Add Pull-to-Refresh on Mobile

**Priority:** Low  
**Labels:** `ui`, `mobile`, `user-profile`

**Description:**
Implement pull-to-refresh functionality on mobile devices for profile pages.

**Acceptance Criteria:**
- [ ] Pull gesture triggers data refresh
- [ ] Visual feedback during refresh
- [ ] Works on all profile tabs
- [ ] Only enabled on mobile devices

---

### 11. Add Filter/Sort Options for Reviews and Restaurants

**Priority:** Medium  
**Labels:** `enhancement`, `user-profile`, `filters`

**Description:**
Allow users to filter and sort reviews and restaurants on other users' profiles.

**Proposed Filters:**
- **Reviews:** By rating (highest/lowest), by date (newest/oldest), by restaurant
- **Restaurants:** By rating, by date added, by cuisine type, by location

**Acceptance Criteria:**
- [ ] Filter UI matches design system
- [ ] Filters persist across page reloads (URL params)
- [ ] Clear filters button available
- [ ] Results update without full page reload

---

## 🔐 Security & Validation

### 12. Add Rate Limiting for Profile API Endpoints

**Priority:** Medium  
**Labels:** `security`, `api`

**Description:**
Implement rate limiting for user profile API endpoints to prevent abuse.

**Endpoints to Protect:**
- `/api/users/[id]/reviews`
- `/api/users/[id]/restaurants`
- `/api/users/[id]/lists`

**Acceptance Criteria:**
- [ ] Rate limit: 100 requests per minute per IP
- [ ] Return 429 status when limit exceeded
- [ ] Include rate limit headers in response

---

## 📱 Mobile-Specific

### 13. Add Bottom Sheet for Restaurant/Review Actions on Mobile

**Priority:** Low  
**Labels:** `ui`, `mobile`, `user-profile`

**Description:**
Replace dropdown menus with bottom sheets for action buttons on mobile devices.

**Acceptance Criteria:**
- [ ] Edit/Delete/Share actions shown in bottom sheet
- [ ] Swipe up to open, swipe down to close
- [ ] Backdrop tap closes sheet
- [ ] Smooth animations

---

## 📝 Documentation

### 14. Add JSDoc Comments to All Profile Components

**Priority:** Low  
**Labels:** `documentation`

**Description:**
Add comprehensive JSDoc comments to all profile-related components for better developer experience.

**Components:**
- [ ] All components in `components/ui/profile/`
- [ ] All hooks in `hooks/data/` related to user profiles
- [ ] All API routes in `app/api/users/`

---

## 🗑️ Technical Debt

### 15. Remove Duplicate Code Between RestaurantCard Components

**Priority:** Low  
**Labels:** `refactor`, `technical-debt`

**Description:**
There are two RestaurantCard implementations:
- `components/ui/profile/sections/restaurants/RestaurantCard.tsx` (profile-specific)
- `components/ui/RestaurantCard/index.tsx` (main restaurant grid)

Consider consolidating or sharing common logic between them.

**Acceptance Criteria:**
- [ ] Identify shared logic (rating styles, price categorization, etc.)
- [ ] Extract to shared utilities or base component
- [ ] Maintain separate UI where needed
- [ ] No regression in functionality

---

## 📋 Lists Feature Enhancements

### 16. Duplicate List Functionality

**Priority:** Medium  
**Labels:** `enhancement`, `lists`

**Description:**
Allow users to duplicate an existing list to create a new one with the same restaurants.

**Acceptance Criteria:**
- [ ] Add "Duplicate" button to list detail page (owner only)
- [ ] Copy all restaurants from original list
- [ ] Pre-fill create form with copied data + " (Copy)" suffix
- [ ] Allow user to modify before saving
- [ ] Toast notification on success

**Files to Modify:**
- `app/lists/[id]/page.tsx`
- `app/lists/create/page.tsx`
- `components/pages/CreateList.jsx`

---

### 17. Reorder Restaurants in List

**Priority:** Medium  
**Labels:** `enhancement`, `lists`, `ui`

**Description:**
Allow users to change the order of restaurants within a list using drag-and-drop.

**Acceptance Criteria:**
- [ ] Add drag-and-drop reordering in edit mode
- [ ] Store order in `list_restaurants` table (add `position` column)
- [ ] Persist order on save
- [ ] Display restaurants in saved order on detail page
- [ ] Mobile-friendly touch support

**Database Changes Required:**
```sql
ALTER TABLE public.list_restaurants
ADD COLUMN IF NOT EXISTS position integer NOT NULL DEFAULT 0;
```

**Files to Modify:**
- `supabase/migrations/024_add_list_restaurant_position.sql`
- `app/lists/[id]/edit/page.tsx`
- `app/api/lists/[id]/route.ts`

---

### 18. List Statistics Dashboard

**Priority:** Medium  
**Labels:** `enhancement`, `lists`, `ui`

**Description:**
Show statistics for a list including average rating, cuisine distribution, and visited count.

**Acceptance Criteria:**
- [ ] Show total restaurants count
- [ ] Show average rating of all restaurants in list
- [ ] Show cuisine type distribution (chart)
- [ ] Show price range distribution
- [ ] Show visited vs unvisited count

**Files to Modify:**
- `app/lists/[id]/page.tsx`
- `app/api/lists/[id]/route.ts`

---

### 19. Export List Data

**Priority:** Medium  
**Labels:** `enhancement`, `lists`

**Description:**
Allow users to export their lists as JSON, CSV, or PDF.

**Acceptance Criteria:**
- [ ] Export as JSON
- [ ] Export as CSV (restaurant name, location, rating, cuisine types)
- [ ] Export as PDF (formatted with images)
- [ ] Download file triggered from list detail page

**Files to Create:**
- `utils/listExport.ts`

**Files to Modify:**
- `app/lists/[id]/page.tsx`

---

### 20. List Comments System

**Priority:** Low  
**Labels:** `enhancement`, `lists`, `social`

**Description:**
Allow users to add comments/notes to lists.

**Acceptance Criteria:**
- [ ] Add comments section to list detail page
- [ ] Only list owner can comment (or public for public lists)
- [ ] Edit/delete own comments
- [ ] Timestamps on comments
- [ ] Pagination for many comments

**Database Changes Required:**
```sql
CREATE TABLE public.list_comments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  list_id uuid NOT NULL,
  user_id uuid NOT NULL,
  comment text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT list_comments_pkey PRIMARY KEY (id),
  CONSTRAINT list_comments_list_id_fkey FOREIGN KEY (list_id) REFERENCES public.lists(id) ON DELETE CASCADE,
  CONSTRAINT list_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
```

---

### 21. Collaborative Lists

**Priority:** Low  
**Labels:** `enhancement`, `lists`, `social`

**Description:**
Allow multiple users to edit the same list.

**Acceptance Criteria:**
- [ ] Add "collaborators" feature (invite users by email/username)
- [ ] Collaborators can add/remove restaurants
- [ ] Owner can remove collaborators
- [ ] Activity log showing who added/removed what

**Database Changes Required:**
```sql
CREATE TABLE public.list_collaborators (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  list_id uuid NOT NULL,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'editor',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT list_collaborators_pkey PRIMARY KEY (id),
  CONSTRAINT list_collaborators_list_id_fkey FOREIGN KEY (list_id) REFERENCES public.lists(id) ON DELETE CASCADE,
  CONSTRAINT list_collaborators_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT list_collaborators_unique UNIQUE (list_id, user_id)
);
```

---

### 22. List Tags/Categories

**Priority:** Low  
**Labels:** `enhancement`, `lists`

**Description:**
Allow users to organize lists with tags or categories.

**Acceptance Criteria:**
- [ ] Add tags array to lists table
- [ ] Filter lists by tags on `/lists` page
- [ ] Suggest common tags (e.g., "Date Night", "Family", "Work Lunch")

**Database Changes Required:**
```sql
ALTER TABLE public.lists
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';
```

---

### 23. List Cover Image

**Priority:** Low  
**Labels:** `enhancement`, `lists`, `ui`

**Description:**
Allow users to set a cover image for their lists.

**Acceptance Criteria:**
- [ ] Allow uploading a cover image for list
- [ ] Auto-generate from first restaurant's image if not set
- [ ] Display cover on list cards

**Database Changes Required:**
```sql
ALTER TABLE public.lists
ADD COLUMN IF NOT EXISTS cover_image_url text;
```

---

### 24. Smart Restaurant Suggestions for Lists

**Priority:** Low  
**Labels:** `enhancement`, `lists`, `ai`

**Description:**
Suggest restaurants to add to lists based on existing cuisine types and user history.

**Acceptance Criteria:**
- [ ] Suggest restaurants based on existing list cuisine types
- [ ] Suggest restaurants based on user's visit history
- [ ] "You might also like" section on list detail page

---

### 25. List Import from External Sources

**Priority:** Low  
**Labels:** `enhancement`, `lists`

**Description:**
Allow users to import lists from external sources like JSON, CSV, Google Maps, or TripAdvisor.

**Acceptance Criteria:**
- [ ] Import from JSON file
- [ ] Import from CSV
- [ ] Import from Google Maps (saved places)
- [ ] Import from TripAdvisor

---

## 🚀 CI/CD & DevOps

### 26. Add Automated Testing to CI Pipeline

**Priority:** High  
**Labels:** `ci-cd`, `testing`, `devops`

**Description:**
The CI pipeline currently only runs linting and build. Add automated tests to catch regressions before they reach production.

**Current State:**
- CI runs: `npm run lint` → `npm run build`
- No tests are executed

**Acceptance Criteria:**
- [ ] Add `npm test` step to CI pipeline
- [ ] Configure test coverage thresholds (e.g., 80%)
- [ ] Fail PRs that don't meet coverage requirements
- [ ] Add coverage report as PR comment

**Files to Modify:**
- `.github/workflows/ci.yml`
- `jest.config.js` (create if needed)

---

### 27. Add E2E Testing with Playwright

**Priority:** Medium  
**Labels:** `ci-cd`, `testing`, `e2e`

**Description:**
Add end-to-end tests for critical user flows (auth, restaurant search, list creation).

**Critical Flows to Test:**
- [ ] User registration and login
- [ ] Search and filter restaurants
- [ ] Create and edit a list
- [ ] Add restaurant to list
- [ ] Write and edit review
- [ ] View another user's profile

**Files to Create:**
- `e2e/` directory with Playwright tests
- `playwright.config.ts`

**Files to Modify:**
- `.github/workflows/ci.yml` (add e2e job)

---

### 28. Add Preview URL Comment to PRs

**Priority:** Medium  
**Labels:** `ci-cd`, `devops`

**Description:**
When a preview deployment succeeds, automatically comment the preview URL on the PR for easy review.

**Acceptance Criteria:**
- [ ] Deploy preview job outputs the preview URL
- [ ] GitHub Action comments the URL on the PR
- [ ] Only comment on PRs from the same repository (not forks)

**Files to Modify:**
- `.github/workflows/deploy.yml`
- Add `actions/github-script` or `mshick/add-pr-comment` action

---

### 29. Add Database Migration Step to CI/CD

**Priority:** High  
**Labels:** `ci-cd`, `database`, `devops`

**Description:**
Automate Supabase database migrations as part of the deployment pipeline to ensure schema changes are applied before code that depends on them.

**Acceptance Criteria:**
- [ ] Run migrations before deploy on production
- [ ] Verify migration success before proceeding
- [ ] Rollback on failed migrations
- [ ] Log migration output

**Files to Modify:**
- `.github/workflows/deploy.yml`
- Add Supabase CLI step

---

### 30. Add Environment Protection Rules

**Priority:** Medium  
**Labels:** `ci-cd`, `security`, `devops`

**Description:**
Add GitHub environment protection rules to require manual approval for production deployments from PRs.

**Acceptance Criteria:**
- [ ] Create "production" environment in GitHub
- [ ] Require approval from code owners before deploying to production
- [ ] Add environment-specific secrets
- [ ] Log deployment approvals

**Setup Required:**
- GitHub repo settings → Environments → Add "production"
- Configure required reviewers

---

### 31. Add Performance Budget Monitoring

**Priority:** Low  
**Labels:** `ci-cd`, `performance`, `devops`

**Description:**
Monitor bundle size and page load times in CI to prevent performance regressions.

**Acceptance Criteria:**
- [ ] Set max bundle size limits (e.g., main.js < 250KB)
- [ ] Fail CI if bundle exceeds limit
- [ ] Track Lighthouse scores in CI
- [ ] Add performance report to PR comments

**Tools to Consider:**
- `@next/bundle-analyzer`
- `lighthouse-ci`
- `webpack-bundle-analyzer`

**Files to Modify:**
- `.github/workflows/ci.yml`
- `next.config.mjs`

---

### 32. Add Automated Dependency Updates

**Priority:** Low  
**Labels:** `ci-cd`, `maintenance`, `devops`

**Description:**
Set up Dependabot or Renovate to automatically create PRs for dependency updates.

**Acceptance Criteria:**
- [ ] Dependabot configured for npm packages
- [ ] Weekly dependency scan
- [ ] Auto-create PRs for minor/patch updates
- [ ] Group related updates (e.g., all @supabase packages)

**Files to Create:**
- `.github/dependabot.yml`

---

### 33. Add Release Automation with Semantic Versioning

**Priority:** Low  
**Labels:** `ci-cd`, `devops`

**Description:**
Automate version bumping and changelog generation based on commit messages.

**Acceptance Criteria:**
- [ ] Conventional commits format enforced
- [ ] Auto version bump on merge to main
- [ ] Generate changelog from commits
- [ ] Create GitHub release tag

**Tools to Consider:**
- `semantic-release`
- `changesets`
- `commitlint`

**Files to Create:**
- `.github/workflows/release.yml`
- `.releaserc.json` or `changesets` config

---

*Last updated: 2026-04-04*
