# Refactoring Guide - FoodList

## Overview

This document describes the comprehensive refactoring performed on the FoodList application to achieve clean, reusable, and maintainable code.

## Date: 2026-04-04 (Updated)

---

## Phase 1: Hooks Specialization ✅

### New Hooks Created

#### Auth Hooks
| Hook | File | Purpose |
|------|------|---------|
| `useSession` | `hooks/auth/useSession.ts` | Session state management only |
| `useAuthActions` | `hooks/auth/useAuthActions.ts` | Auth actions (signIn, signUp, signOut, resetPassword) |
| `useAuth` | `hooks/auth/useAuth.ts` | Legacy hook (kept for backward compatibility) |

#### Data Hooks
| Hook | File | Purpose |
|------|------|---------|
| `useUserData` | `hooks/data/useUserData.ts` | **Consolidated** - replaces useUserData, useUserDataOptimized, useUserDataV2 |
| `useApiMutation` | `hooks/data/useApiMutation.ts` | Generic API mutation operations with loading/error states |

#### Form Hooks
| Hook | File | Purpose |
|------|------|---------|
| `useForm` | `hooks/forms/useForm.ts` | Generic form state management with validation |
| `useImageUpload` | `hooks/forms/useImageUpload.ts` | Image upload to Cloudinary with preview |
| `useRestaurantForm` | `hooks/forms/useRestaurantForm.ts` | Restaurant-specific form logic (create/edit) |
| `useListForm` | `hooks/forms/useListForm.ts` | List-specific form logic (create/edit with restaurant selection) |

#### Utility Hooks
| Hook | File | Purpose |
|------|------|---------|
| `useLocalStorage` | `hooks/utilities/useLocalStorage.ts` | Type-safe localStorage operations with TTL |
| `useDebounce` | `hooks/utilities/useDebounce.ts` | Value and callback debouncing |

### Hooks Removed (Consolidated)
- `hooks/data/useUserDataOptimized.ts` - Merged into `useUserData.ts`
- `hooks/data/useUserDataV2.ts` - Merged into `useUserData.ts`

---

## Phase 2: Page Component Refactoring ✅

### Restaurant Pages
| Page | Before | After | Reduction |
|------|--------|-------|-----------|
| CreateRestaurant.jsx | 682 lines | ~40 lines | 94% |
| EditRestaurant.jsx | 812 lines | ~65 lines | 92% |

### List Pages
| Page | Before | After | Reduction |
|------|--------|-------|-----------|
| CreateList.jsx | 276 lines | ~88 lines | 68% |
| EditList.jsx | 396 lines | ~108 lines | 73% |

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

---

## Phase 5: Types and Contracts ✅

### API Types
| File | Purpose |
|------|---------|
| `libs/api.ts` | API endpoints, request/response types, helper functions |

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
foodlist/
├── hooks/
│   ├── auth/
│   │   ├── useSession.ts          # Session state
│   │   ├── useAuthActions.ts      # Auth actions
│   │   └── useAuth.ts             # Legacy (backward compat)
│   ├── data/
│   │   ├── useUserData.ts         # Consolidated user data
│   │   ├── useApiMutation.ts      # Generic mutations
│   │   └── ...
│   ├── forms/
│   │   ├── useForm.ts             # Generic form hook
│   │   ├── useImageUpload.ts      # Image uploads
│   │   ├── useRestaurantForm.ts   # Restaurant form logic
│   │   └── useListForm.ts         # List form logic
│   └── utilities/
│       ├── useLocalStorage.ts     # localStorage with TTL
│       └── useDebounce.ts         # Debouncing
├── components/
│   ├── lists/
│   │   └── ListForm.tsx           # Shared list form
│   ├── restaurant/
│   │   └── RestaurantForm.tsx     # Shared restaurant form
│   └── ui/
│       ├── BaseForm.tsx           # Generic form wrapper
│       └── Filters/
│           └── FilterPanel.tsx    # Generic filter panel
├── utils/
│   ├── auth.ts                    # Consolidated auth utils
│   ├── apiMonitor.ts              # API performance
│   ├── dbMonitor.ts               # DB performance
│   ├── performanceMonitor.ts      # Re-exports (backward compat)
│   └── search.ts                  # Search utilities
└── libs/
    ├── types.ts                   # TypeScript types
    └── api.ts                     # API types and helpers
```

---

## Benefits

### Code Reusability
- Restaurant form logic shared between Create and Edit
- List form logic shared between Create and Edit
- Generic `useForm` hook usable for any form
- `useApiMutation` for all CRUD operations
- `BaseForm` component for consistent form layouts

### Maintainability
- Single source of truth for restaurant forms
- Single source of truth for list forms
- Easier to add new features (just update shared component)
- Clear separation of concerns

### Testability
- Hooks can be tested in isolation
- Components are smaller and more focused
- Less mocking required in tests

### Performance
- Reduced re-renders with stable callbacks
- Request deduplication in data hooks
- Proper caching with TTL
- Split performance monitors for focused tracking

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

- [x] Split useAuth into useSession + useAuthActions
- [x] Consolidate useUserData hooks
- [x] Create useLocalStorage hook
- [x] Create useDebounce hook
- [x] Create useForm hook
- [x] Create useImageUpload hook
- [x] Create useApiMutation hook
- [x] Create useRestaurantForm hook
- [x] Create useListForm hook
- [x] Refactor CreateRestaurant.jsx (682 → 40 lines)
- [x] Refactor EditRestaurant.jsx (812 → 65 lines)
- [x] Refactor CreateList.jsx (276 → 88 lines)
- [x] Refactor EditList.jsx (396 → 108 lines)
- [x] Create shared RestaurantForm component
- [x] Create shared ListForm component
- [x] Split performanceMonitor.ts into apiMonitor.ts + dbMonitor.ts
- [x] Consolidate auth utilities into auth.ts
- [x] Create BaseForm component
- [x] Create FilterPanel component
- [x] Create libs/api.ts with API types
- [x] Update hooks/index.ts exports
- [x] Update utils/index.ts exports

---

## Remaining Tasks

### Low Priority
- [ ] Add Storybook documentation for components
- [ ] Migrate remaining pages to use BaseForm component (auth, profile, review forms)
- [ ] Migrate remaining filters to use FilterPanel component

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
