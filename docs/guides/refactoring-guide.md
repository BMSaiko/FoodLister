# Refactoring Guide - FoodLister

## Overview

This document describes the comprehensive refactoring performed on the FoodLister application to achieve clean, reusable, and maintainable code.

## Date: 2026-05-07 (Updated)

---

## Phase 1: Hooks Specialization ✅

### New Hooks Created

#### Auth Hooks
| Hook | File | Purpose |
|------|------|---------|
| `useSession` | `hooks/auth/useSession.ts` | Session state management only |
| `useAuthActions` | `hooks/auth/useAuthActions.ts` | Auth actions (signIn, signUp, signOut, resetPassword) |
| `useApiClient` | `hooks/auth/useApiClient.ts` | API client with auth token management |
| `useAuth` | `hooks/auth/index.ts` | Combined auth hook (session + actions) |

#### Data Hooks
| Hook | File | Purpose |
|------|------|---------|
| `useUserData` | `hooks/data/useUserData.ts` | **Consolidated** - replaces useUserData, useUserDataOptimized, useUserDataV2 |
| `useApiMutation` | `hooks/data/useApiMutation.ts` | Generic API mutation operations with loading/error states |
| `useRestaurants` | `hooks/data/useRestaurants.ts` | Fetch restaurants with filters |
| `useRestaurant` | `hooks/data/useRestaurant.ts` | Fetch single restaurant by ID |
| `useReviews` | `hooks/data/useReviews.ts` | Fetch reviews for restaurant |
| `useLists` | `hooks/data/useLists.ts` | Fetch user's lists |
| `useUserStats` | `hooks/data/useUserStats.ts` | Fetch user statistics |

#### Form Hooks
| Hook | File | Purpose |
|------|------|---------|
| `useForm` | `hooks/forms/useForm.ts` | Generic form state management with validation |
| `useImageUpload` | `hooks/forms/useImageUpload.ts` | Image upload to Cloudinary with preview |
| `useRestaurantForm` | `hooks/forms/useRestaurantForm.ts` | Restaurant-specific form logic (create/edit) |
| `useListForm` | `hooks/forms/useListForm.ts` | List-specific form logic (create/edit with restaurant selection) |

#### UI Hooks
| Hook | File | Purpose |
|------|------|---------|
| `useImagePreview` | `hooks/ui/useImagePreview.ts` | Image preview with modal viewer |
| `useInfiniteScroll` | `hooks/ui/useInfiniteScroll.ts` | Infinite scroll for lists |

#### Utility Hooks
| Hook | File | Purpose |
|------|------|---------|
| `useLocalStorage` | `hooks/utilities/useLocalStorage.ts` | Type-safe localStorage operations with TTL |
| `useDebounce` | `hooks/utilities/useDebounce.ts` | Value and callback debouncing |
| `useUserCache` | `hooks/utilities/useUserCache.ts` | Cache invalidation for user data |

### Hooks Removed (Consolidated)
- `hooks/data/useUserDataOptimized.ts` - Merged into `useUserData.ts`
- `hooks/data/useUserDataV2.ts` - Merged into `useUserData.ts`

---

## Phase 2: Page Component Refactoring ✅

### Restaurant Pages
| Page | Before | After | Reduction |
|------|--------|-------|-----------|
| CreateRestaurant.jsx | 682 lines | ~45 lines | 93% |
| EditRestaurant.jsx | 812 lines | ~70 lines | 91% |

### List Pages
| Page | Before | After | Reduction |
|------|--------|-------|-----------|
| CreateList.jsx | 276 lines | ~90 lines | 67% |
| EditList.jsx | 396 lines | ~110 lines | 72% |

### Shared Components Created
| Component | File | Purpose |
|-----------|------|---------|
| `RestaurantForm` | `components/restaurant/RestaurantForm.tsx` | Shared form for create/edit restaurant |
| `ListForm` | `components/lists/ListForm.tsx` | Shared form for create/edit list |

---

## Phase 3: Utils Organization ✅

### New Utils Created
| Utility | File | Purpose |
|---------|------|---------|
| `search.ts` | `utils/search.ts` | Search parameter building and text highlighting |
| `apiMonitor.ts` | `utils/apiMonitor.ts` | API performance monitoring (split from performanceMonitor) |
| `dbMonitor.ts` | `utils/dbMonitor.ts` | Database performance monitoring (split from performanceMonitor) |
| `auth.ts` | `utils/auth.ts` | Consolidated auth utilities (logging + redirects + storage) |
| `logger.ts` | `utils/logger.ts` | General logging utility |
| `cloudinaryConverter.ts` | `utils/cloudinaryConverter.ts` | Cloudinary image management |
| `listExport.ts` | `utils/listExport.ts` | List export (ICS calendar, JSON) |
| `googleMapsExtractor.ts` | `utils/googleMapsExtractor.ts` | Google Maps URL parsing |
| `formatters.ts` | `utils/formatters.ts` | Data formatting utilities |
| `filters.ts` | `utils/filters.ts` | Filter logic and utilities |
| `analytics.ts` | `utils/analytics.ts` | Analytics utilities |
| `performanceMonitor.ts` | `utils/performanceMonitor.ts` | Re-exports from apiMonitor + dbMonitor |

### Utils Refactored
| Utility | Before | After | Notes |
|---------|--------|-------|-------|
| `performanceMonitor.ts` | 385 lines | ~50 lines | Now re-exports from apiMonitor + dbMonitor |
| `authLogger.ts` | 148 lines | Legacy | Consolidated into `auth.ts` |
| `authUtils.js` | 80 lines | Legacy | Consolidated into `auth.ts` |

---

## Phase 4: Components UI - DRY ✅

### New UI Components
| Component | File | Purpose |
|-----------|------|---------|
| `BaseForm` | `components/ui/BaseForm.tsx` | Generic form wrapper with consistent styling |
| `FormField` | `components/ui/BaseForm.tsx` | Form field wrapper with label and error |
| `FormInput` | `components/ui/BaseForm.tsx` | Standard text input |
| `FormTextarea` | `components/ui/BaseForm.tsx` | Textarea component |
| `FormSelect` | `components/ui/BaseForm.tsx` | Select dropdown |
| `FilterPanel` | `components/ui/Filters/FilterPanel.tsx` | Collapsible filter panel with chips |
| `FilterSection` | `components/ui/Filters/FilterPanel.tsx` | Filter group section |
| `FilterChip` | `components/ui/Filters/FilterPanel.tsx` | Standalone filter chip |
| `MenuCarousel` | `components/ui/MenuCarousel.tsx` | Restaurant menu images carousel |
| `MenuManager` | `components/ui/MenuManager.tsx` | Menu links and images manager |
| `ImageUploader` | `components/ui/ImageUploader.tsx` | Image upload with progress |
| `ErrorBoundary` | `components/ui/ErrorBoundary.tsx` | React error boundary |
| `ErrorDisplay` | `components/ui/ErrorDisplay.tsx` | Error display component |

---

## Phase 5: Types and Contracts ✅

### API Types
| File | Purpose |
|------|---------|
| `libs/api.ts` | API endpoints, request/response types, helper functions |
| `types/database.ts` | Database type definitions (Supabase) |

### Types Included
- `API_ENDPOINTS` - Centralized endpoint definitions
- `HTTP_METHODS` - HTTP method constants
- `ApiRequestOptions` - Request configuration
- `CreateRestaurantRequest` / `UpdateRestaurantRequest` - Restaurant CRUD
- `CreateListRequest` / `UpdateListRequest` - List CRUD
- `CreateReviewRequest` / `UpdateReviewRequest` - Review CRUD
- `UpdateProfileRequest` - Profile updates
- `SearchRequest` / `SearchResponse` - Search operations
- Helper functions: `createAuthHeaders`, `buildQueryString`, `buildRestaurantFilterParams`, `isAuthError`, `isRateLimitError`, `fetchWithRetry`

---

## Architecture Overview

### Final Structure
```
foodlister/
├── hooks/
│   ├── auth/
│   │   ├── useSession.ts          # Session state
│   │   ├── useAuthActions.ts      # Auth actions
│   │   ├── useApiClient.ts        # API client with auth
│   │   └── index.ts                # Combined exports
│   ├── data/
│   │   ├── useUserData.ts         # Consolidated user data
│   │   ├── useApiMutation.ts      # Generic mutations
│   │   ├── useRestaurants.ts      # Restaurant data fetching
│   │   ├── useRestaurant.ts      # Single restaurant
│   │   ├── useReviews.ts          # Reviews data
│   │   ├── useLists.ts            # Lists data
│   │   ├── useUserStats.ts        # User statistics
│   │   └── ...
│   ├── forms/
│   │   ├── useForm.ts             # Generic form hook
│   │   ├── useImageUpload.ts      # Image uploads
│   │   ├── useRestaurantForm.ts   # Restaurant form logic
│   │   └── useListForm.ts         # List form logic
│   ├── ui/
│   │   ├── useImagePreview.ts     # Image preview
│   │   └── useInfiniteScroll.ts  # Infinite scroll
│   └── utilities/
│       ├── useLocalStorage.ts     # localStorage with TTL
│       ├── useDebounce.ts         # Debouncing
│       └── useUserCache.ts        # Cache invalidation
├── components/
│   ├── lists/
│   │   └── ListForm.tsx           # Shared list form
│   ├── restaurant/
│   │   └── RestaurantForm.tsx     # Shared restaurant form
│   └── ui/
│       ├── BaseForm.tsx           # Generic form wrapper
│       ├── MenuCarousel.tsx       # Menu carousel
│       ├── MenuManager.tsx        # Menu manager
│       ├── ImageUploader.tsx      # Image uploader
│       ├── ErrorBoundary.tsx      # Error boundary
│       ├── ErrorDisplay.tsx       # Error display
│       └── Filters/
│           └── FilterPanel.tsx    # Generic filter panel
├── utils/
│   ├── auth.ts                    # Consolidated auth utils
│   ├── apiMonitor.ts              # API performance
│   ├── dbMonitor.ts               # DB performance
│   ├── performanceMonitor.ts      # Re-exports (backward compat)
│   ├── logger.ts                 # General logging
│   ├── cloudinaryConverter.ts     # Cloudinary management
│   ├── listExport.ts             # List export
│   ├── search.ts                  # Search utilities
│   ├── filters.ts                # Filter logic
│   ├── formatters.ts             # Data formatters
│   ├── googleMapsExtractor.ts    # Google Maps integration
│   └── analytics.ts              # Analytics utilities
└── libs/
    ├── api.ts                    # API endpoint definitions
    ├── apiClient.ts              # Centralized API client
    ├── auth.ts                   # Auth utilities
    └── supabase/                 # Supabase client setup
```

---

## Benefits

### Code Reusability
- Restaurant form logic shared between Create and Edit
- List form logic shared between Create and Edit
- Generic `useForm` hook usable for any form
- `useApiMutation` for all CRUD operations
- `BaseForm` component for consistent form layouts
- `FilterPanel` component for all filter UIs

### Maintainability
- Single source of truth for restaurant forms
- Single source of truth for list forms
- Easier to add new features (just update shared component)
- Clear separation of concerns
- Consistent error handling patterns

### Testability
- Hooks can be tested in isolation
- Components are smaller and more focused
- Less mocking required in tests
- Clear patterns for testing custom hooks

### Performance
- Reduced re-renders with stable callbacks
- Request deduplication in data hooks
- Proper caching with TTL
- Split performance monitors for focused tracking
- Optimized bundle with tree-shaking

---

## Migration Guide

### Using the new hooks

```typescript
// User data (consolidated)
import { useUserData } from '@/hooks';

const { profile, reviews, lists, loading } = useUserData({
  userId: 'xxx',
  enableReviews: true,
  enableLists: true,
  enableRestaurants: false
});

// Restaurant forms
import { useRestaurantForm } from '@/hooks/forms/useRestaurantForm';

const { formData, saveRestaurant, loading } = useRestaurantForm({
  restaurantId: 'xxx', // omit for create
  onSuccess: (restaurant) => router.push(`/restaurants/${restaurant.id}`)
});

// List forms
import { useListForm } from '@/hooks/forms/useListForm';

const { formData, selectedRestaurants, saveList } = useListForm({
  listId: 'xxx', // omit for create
  onSuccess: (listId) => router.push(`/lists/${listId}`)
});

// Generic forms
import { useForm } from '@/hooks/forms/useForm';

const { values, errors, handleSubmit, getFieldProps } = useForm({
  initialValues: { name: '', email: '' },
  validation: {
    name: { required: true },
    email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ }
  },
  onSubmit: async (values) => { /* submit logic */ }
});
```

### Using BaseForm component

```tsx
import BaseForm, { FormInput, FormTextarea } from '@/components/ui/BaseForm';

function MyForm() {
  const handleSubmit = (e) => { /* handle submit */ };
  
  return (
    <BaseForm
      onSubmit={handleSubmit}
      error={error}
      loading={loading}
      header={{ title: 'Create Item', subtitle: 'Fill in the details' }}
      actions={{
        cancelText: 'Cancel',
        submitText: 'Create',
        onCancel: () => router.back()
      }}
    >
      <FormInput
        label="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <FormTextarea
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
    </BaseForm>
  );
}
```

### Using FilterPanel component

```tsx
import FilterPanel, { FilterChip } from '@/components/ui/Filters/FilterPanel';

function MyFilters() {
  const activeFilters = [
    { id: 'cuisine', label: 'Italian', onRemove: () => removeFilter('cuisine') }
  ];
  
  return (
    <FilterPanel
      activeFilters={activeFilters}
      onClearAll={clearAllFilters}
      title="Restaurant Filters"
    >
      {/* Filter content */}
      <CuisineSelector ... />
      <PriceRangeSlider ... />
    </FilterPanel>
  );
}
```

### Using API types

```typescript
import { 
  API_ENDPOINTS, 
  createAuthHeaders, 
  buildRestaurantFilterParams,
  fetchWithRetry 
} from '@/libs/api';

// Make API call with retry
const response = await fetchWithRetry(
  API_ENDPOINTS.restaurants + buildQueryString(buildRestaurantFilterParams(filters)),
  { token: await getAccessToken() }
);
```

---

## Completed Tasks ✅

- [x] Split useAuth into useSession + useAuthActions + useApiClient
- [x] Consolidate useUserData hooks
- [x] Create useLocalStorage hook
- [x] Create useDebounce hook
- [x] Create useForm hook
- [x] Create useImageUpload hook
- [x] Create useApiMutation hook
- [x] Create useRestaurantForm hook
- [x] Create useListForm hook
- [x] Refactor CreateRestaurant.jsx (682 → 45 lines)
- [x] Refactor EditRestaurant.jsx (812 → 70 lines)
- [x] Refactor CreateList.jsx (276 → 90 lines)
- [x] Refactor EditList.jsx (396 → 110 lines)
- [x] Create shared RestaurantForm component
- [x] Create shared ListForm component
- [x] Split performanceMonitor.ts into apiMonitor.ts + dbMonitor.ts
- [x] Consolidate auth utilities into auth.ts
- [x] Create BaseForm component
- [x] Create FilterPanel component
- [x] Create libs/api.ts with API types
- [x] Update hooks/index.ts exports
- [x] Update utils/index.ts exports
- [x] Create MenuCarousel component
- [x] Create MenuManager component
- [x] Create ImageUploader component
- [x] Create ErrorBoundary and ErrorDisplay components
- [x] Create useImagePreview and useInfiniteScroll hooks
- [x] Create useUserCache hook

---

## Remaining Tasks

### Low Priority
- [ ] Add Storybook documentation for components
- [ ] Migrate remaining pages to use BaseForm component (auth, profile, review forms)
- [ ] Migrate remaining filters to use FilterPanel component
- [ ] Add comprehensive unit tests for all hooks
- [ ] Add E2E tests with Playwright or Cypress

---

## Completed Low Priority Tasks

### Dead Code Removal
- Deleted `utils/performanceOptimizer.js` (496 lines) - exported but never imported anywhere
- Updated `utils/index.ts` to remove dead export
- Added `@deprecated` notices to `utils/authLogger.ts` and `utils/authUtils.js`

### Unit Tests Created
- `utils/__tests__/apiMonitor.test.ts` - 12 test cases covering:
  - logApiResponse, getStats, measureFunction
  - generateRecommendations, clearMetrics, exportMetrics
- `utils/__tests__/dbMonitor.test.ts` - 11 test cases covering:
  - logDatabaseQuery, getStats, measureDatabaseQuery
  - generateRecommendations, clearMetrics, exportMetrics
- `__tests__/hooks/forms/useRestaurantForm.test.ts` - Form validation tests
- `__tests__/hooks/forms/useListForm.test.ts` - Form validation tests
- `__tests__/components/restaurant/RestaurantForm.test.tsx` - Component tests

---

## Code Quality Improvements

### TypeScript Strictness
- Enabled stricter TypeScript checks
- Added proper type definitions for all hooks
- Eliminated `any` types where possible
- Added generics for reusable components

### Error Handling
- Consistent error handling patterns across all hooks
- Proper error boundaries in UI
- Toast notifications for user feedback
- Retry logic for transient failures

### Performance Optimizations
- Memoized callbacks to prevent re-renders
- Debounced search inputs
- Request deduplication in API client
- Proper cleanup in useEffect hooks
- Lazy loading for heavy components

---

*Last updated: 2026-05-07*