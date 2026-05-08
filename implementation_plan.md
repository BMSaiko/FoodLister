# Implementation Plan

## [Overview]
Complete all pending tasks from `docs/tasks/TASKS_5HOURS.md` to bring the FoodLister project to 100% completion.

The FoodLister project is currently at ~85% completion with most core features implemented. This plan addresses the remaining tasks from the 5-hour task list: TypeScript type improvements, error handling standardization, performance optimizations, UX improvements (empty states, error messages, accessibility), analytics integration, and production preparation. The plan follows the project's established patterns: Server Components by default, Context API for state management, TailwindCSS 3 with CSS variables, and Supabase for backend services.

## [Types]
Enhance TypeScript type safety by replacing `any` types with proper type definitions.

### Current State
- 287 instances of `any` type found across the codebase
- `types/database.ts` exists with Database interface but not fully utilized
- API responses use generic `ApiResponse<T>` but many functions still use `any`

### Required Changes
1. **Generate Supabase types**: Use Supabase CLI to generate types from database schema
   ```bash
   supabase gen types typescript --local > types/supabase-generated.ts
   ```

2. **Update libs/types.ts**:
   - Replace `any` in Auth interface methods with proper error/response types
   - Create specific error response types
   - Add proper request/response types for API calls

3. **Create shared type definitions**:
   ```typescript
   // types/api.ts
   export interface ApiError {
     error: string;
     details?: string;
     code?: string;
   }
   
   export interface ApiSuccess<T> {
     data: T;
     message?: string;
   }
   
   export type ApiResponse<T> = ApiSuccess<T> | ApiError;
   ```

4. **Update function signatures** in:
   - `hooks/data/*.ts` - Replace `any` in data fetching functions
   - `hooks/forms/*.ts` - Type form data properly
   - `utils/*.ts` - Type utility function parameters
   - `contexts/*.tsx` - Type context values properly

5. **Remove `noImplicitAny: false`** from tsconfig.json (currently not present - verified)

## [Files]
Modify existing files and create new ones to complete pending tasks.

### New Files to Create
- `types/supabase-generated.ts` - Auto-generated Supabase types (if Supabase CLI available)
- `types/api.ts` - Shared API response types
- `components/ui/lists/ListCardBadge.tsx` - Collaborator count badge component
- `utils/error-messages.ts` - Standardized user-friendly error messages
- `hooks/ui/useRetry.ts` - Retry logic hook for failed network requests

### Files to Modify

#### TypeScript Improvements
- `libs/types.ts` - Replace `any` types with proper interfaces
- `libs/api.ts` - Type API client methods properly
- `hooks/data/useRestaurants.ts` - Type restaurant data
- `hooks/data/useLists.ts` - Type list data
- `hooks/data/useReviews.ts` - Type review data
- `hooks/data/useUserData.ts` - Type user data
- `hooks/forms/useRestaurantForm.ts` - Type form data
- `hooks/forms/useListForm.ts` - Type form data
- `hooks/forms/useProfileForm.ts` - Type form data
- `contexts/AuthContext.tsx` - Type context properly

#### Error Handling Standardization
- `app/api/lists/route.ts` - Standardize error responses
- `app/api/lists/[id]/route.ts` - Standardize error responses
- `app/api/restaurants/route.ts` - Already has good patterns
- `app/api/restaurants/[id]/route.ts` - Standardize error responses
- `app/api/reviews/route.ts` - Standardize error responses
- `app/api/reviews/[id]/route.ts` - Standardize error responses
- `utils/error-messages.ts` (new) - Create user-friendly error messages

#### UX Improvements
- `components/ui/lists/ListCard.tsx` - Add collaborator count badge
- `components/ui/lists/ListCollaborators.tsx` - Already has good implementation
- `app/lists/page.js` - Already has empty states (good)
- `components/ui/common/EmptyState.tsx` - Already exists (good)
- Various components - Add aria-labels and improve accessibility

#### Analytics & Monitoring
- `utils/analytics.ts` - Already exists with basic tracking
- `utils/apiMonitor.ts` - Already exists with performance monitoring
- `components/ui/common/PerformanceDashboard.tsx` - Already exists (dev only)
- Need to: Integrate analytics tracking in key user flows

#### Production Preparation
- `next.config.mjs` - Verify configuration
- `eslint.config.mjs` - Ensure no errors
- `tsconfig.json` - Verify strict mode enabled

### Files to Delete
- None identified

## [Functions]
Update and create functions to support the pending tasks.

### New Functions

#### `types/api.ts`
- `isApiError(response: any): response is ApiError` - Type guard for API errors
- `getErrorMessage(error: unknown): string` - Extract user-friendly error message

#### `utils/error-messages.ts`
- `getUserFriendlyError(error: any, context?: string): string` - Convert technical errors to user-friendly messages
- `getAuthErrorMessage(error: any): string` - Specific auth error messages
- `getValidationErrorMessage(field: string): string` - Form validation messages

#### `hooks/ui/useRetry.ts`
- `useRetry<T>(fn: () => Promise<T>, options?: { maxRetries?: number; delay?: number }): { execute: () => Promise<T>; loading: boolean; error: Error | null }` - Retry logic for failed requests

### Functions to Modify

#### API Routes (Standardize Error Responses)
- `GET` in `app/api/lists/route.ts` - Ensure consistent error format `{ error: string; details?: string }`
- `POST` in `app/api/restaurants/route.ts` - Already has good error handling
- All API routes - Add proper HTTP status codes and error structure

#### Analytics Tracking
- Add `trackEvent()` calls in:
  - `hooks/forms/useRestaurantForm.ts` - Track restaurant creation/editing
  - `hooks/forms/useListForm.ts` - Track list creation/editing
  - `hooks/data/useReviews.ts` - Track review creation/deletion
  - `components/ui/lists/ListCollaborators.tsx` - Track collaborator changes
  - `components/ui/lists/ListComments.tsx` - Track comment additions

### Functions to Remove
- None identified

## [Classes]
No class-based changes required. Project uses functional components and hooks.

### New Classes
- None

### Modified Classes
- None

### Removed Classes
- None

## [Dependencies]
No new dependencies required. All needed functionality is already available.

### Current Dependencies (Relevant)
- `typescript: 5.8.2` - Already at latest
- `@supabase/supabase-js: ^2.49.1` - For potential type generation
- `react-toastify: ^11.0.5` - For user error notifications

### Potential Additions (Optional)
- `@supabase/cli` (devDependency) - For type generation (if not using npx)

## [Testing]
Test the changes to ensure no regressions.

### Test Files to Create/Update
- Update existing test files if function signatures change
- `__tests__/utils/error-messages.test.ts` - Test error message generation
- `__tests__/hooks/useRetry.test.tsx` - Test retry logic

### Testing Strategy
- Run existing test suite: `npm test`
- Ensure all 84 tests still pass after TypeScript changes
- Manual testing of:
  - Error handling (trigger API errors)
  - Empty states display
  - Analytics events fire correctly
  - Collaborator badges display

## [Implementation Order]
Execute changes in this order to minimize conflicts and ensure successful integration.

1. **TypeScript Type Improvements** (Priority: High)
   - Create `types/api.ts` with shared types
   - Create `utils/error-messages.ts` with user-friendly messages
   - Update `libs/types.ts` to remove `any` types
   - Update `libs/api.ts` with proper typing
   - Update hooks in `hooks/data/` with proper types
   - Update hooks in `hooks/forms/` with proper types
   - Verify build passes: `npm run build`

2. **Error Handling Standardization** (Priority: High)
   - Update API routes to use consistent error response format
   - Integrate `getUserFriendlyError()` in API error responses
   - Add proper HTTP status codes
   - Test error scenarios

3. **UX Improvements** (Priority: Medium)
   - Create `components/ui/lists/ListCardBadge.tsx` for collaborator count
   - Update `components/ui/RestaurantManagement/ListCard.tsx` to show collaborator badge
   - Review empty states (already mostly implemented)
   - Add aria-labels for accessibility improvements
   - Create `hooks/ui/useRetry.ts` for network error recovery

4. **Analytics Integration** (Priority: Medium)
   - Integrate `trackEvent()` calls in key user flows
   - Test analytics in development mode
   - Document analytics events in `docs/guides/analytics-guide.md`

5. **Production Preparation** (Priority: Low)
   - Run `npm run lint` and fix any new errors
   - Run `npm run build` and verify no warnings
   - Verify environment variables documentation
   - Update `README.md` if needed

6. **Final Verification**
   - Run full test suite: `npm test`
   - Run lint: `npm run lint`
   - Run build: `npm run build`
   - Manual testing of all changed features
   - Update `memory-bank/progress.md` with completed tasks
   - Update `docs/tasks/TASKS_5HOURS.md` marking completed items

---

## Notes
- Follow existing patterns: Server Components by default, 'use client' only when necessary
- Use CSS variables for styling (not hardcoded colors)
- Maintain Context API for state management
- Use TailwindCSS 3 with the existing design system
- Ensure all changes pass build and lint before committing