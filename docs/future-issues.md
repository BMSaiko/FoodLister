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

*Last updated: 2026-04-03*