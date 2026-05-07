# Prompt Templates - FoodLister

Pre-built prompt templates for common tasks when working with Cline on the FoodLister project.

---

## How to Use

Copy a template and fill in the `[brackets]` with your specific details.

---

## Component Creation

### Basic Component
```
Create a new [Server/Client] component called [ComponentName] that:
- Displays [description]
- Accepts props: [list props]
- Uses Tailwind CSS 3 with CSS variables for styling
- Is placed in components/[category]/
- Include a test in __tests__/components/
```

### Component with Data Fetching
```
Create a component called [ComponentName] that:
- Fetches data from [API endpoint/Supabase table]
- Uses custom hook pattern (useRestaurants, useReviews, etc.)
- Shows loading state with skeleton
- Shows error state with retry button
- Displays [description of content]
- Uses the use[HookName] hook pattern
```

### Form Component
```
Create a form component called [FormName] that:
- Uses useForm hook from hooks/forms/useForm.ts
- Validates: [list validation rules]
- Submits to [API endpoint]
- Shows success/error toasts via react-toastify
- Fields: [list fields with types]
- Uses BaseForm component from components/ui/BaseForm.tsx
```

---

## API Route Creation

### CRUD Endpoints
```
Create API routes for [resource] with:
- GET /api/[resource] - List with pagination and filters
- GET /api/[resource]/[id] - Get single with related data
- POST /api/[resource] - Create (authenticated)
- PUT /api/[resource]/[id] - Update (owner only)
- DELETE /api/[resource]/[id] - Delete (owner only)

The resource has these fields: [list fields]
It relates to: [list relations]
Use libs/apiClient.ts for database operations
```

### Search Endpoint
```
Create a search endpoint at GET /api/[resource]/search that:
- Accepts query parameter `q`
- Searches by: [list searchable fields]
- Supports filters: [list filter params]
- Returns paginated results with count
- Uses Supabase .ilike() for text search
```

### API with Auth
```
Create an API route at [endpoint] that:
- Requires authentication (check session)
- Returns 401 if not authenticated
- Returns 403 if not authorized
- Uses createClient() from libs/supabase/server.ts
- Includes rate limiting via middleware/rateLimiter.ts
```

---

## Database Migration

### New Table
```
Create a migration for a new table called [table_name] with:
- Fields: [list fields with types]
- Foreign keys to: [list relations]
- RLS policies: [describe access rules]
- Indexes on: [list indexed columns]
- Seed data: [initial data if any]
- Junction tables if many-to-many: [list junction tables]
```

### Alter Table
```
Create a migration to add/modify [column(s)] to [table_name]:
- Add column: [name, type, constraints]
- Add index on: [column]
- Update existing data: [describe]
- Maintain backward compatibility
```

### Seed Data
```
Create a seed script for [table_name] that:
- Inserts initial data: [list records]
- Uses INSERT INTO with ON CONFLICT DO NOTHING
- Can be run multiple times safely
- Includes cuisine_types, dietary_options, and features data
```

---

## Feature Implementation

### Filter Feature
```
Add a filter feature for [resource] that:
- Uses FilterPanel component from components/ui/Filters/FilterPanel.tsx
- Filters by: [list filter criteria]
- Uses useDebounce hook for search input
- Updates URL params via useRouter
- Works with existing pagination
- Shows active filter chips with counts
- Mobile-responsive design
```

### Upload Feature
```
Add image upload for [resource] that:
- Uses useImageUpload hook from hooks/forms/useImageUpload.ts
- Uploads to Cloudinary via utils/cloudinaryConverter.ts
- Shows progress indicator
- Validates: [size, type, dimensions]
- Stores URL in [table.column]
- Supports multiple images (menu_images array)
```

### Authentication Feature
```
Add [feature] that requires authentication:
- Check user session via useSession hook
- Redirect if not authenticated
- Show user-specific data
- Handle RLS policies in Supabase
- Use useAuthActions for login/signup
```

### List Feature
```
Implement [list feature] that:
- Uses useLists hook from hooks/data/useLists.ts
- Supports create/edit via useListForm hook
- Implements share functionality (Web Share API + clipboard)
- Shows list statistics (restaurant count, avg rating)
- Supports export (JSON, CSV, ICS)
- Includes duplicate list functionality
```

---

## Bug Fix

### Database Error
```
Fix the following database error:
- Endpoint: [API route]
- Error: [error message/code]
- Expected: [expected behavior]
- Current: [current behavior]

Check:
- RLS policies in docs/database/database-schema.md
- Schema in docs/database/database-schema-reference.md
- Supabase client setup in libs/supabase/
```

### Frontend Error
```
Fix the following frontend error:
- Component: [component name]
- Error: [error message]
- When: [describe scenario]

Check:
- Props interface in component file
- Hook dependencies in custom hooks
- API response format in libs/api.ts
- Error handling in utils/logger.ts
```

### Performance Issue
```
Fix the following performance issue:
- Page/Component: [name]
- Issue: [slow render/large bundle/high memory]
- Current metrics: [load time, bundle size, etc.]

Consider:
- React.memo for list items
- useMemo for expensive calculations
- useCallback for event handlers
- Virtual scrolling for large lists (react-window)
- Image optimization with next/image
- Bundle analysis with @next/bundle-analyzer
```

---

## Testing

### Component Test
```
Write tests for [ComponentName] that cover:
- Renders correctly with default props
- Renders with custom props: [list]
- Handles user interaction: [describe]
- Shows loading state
- Shows error state
- Accessibility checks (ARIA labels, keyboard nav)
- Responsive rendering at different breakpoints
```

### API Test
```
Write tests for [API endpoint] that cover:
- Returns correct data format
- Handles pagination
- Returns 401 when not authenticated
- Returns 403 when not authorized
- Returns 400 with invalid input
- Returns 201 on successful creation
- Returns 404 when resource not found
- Rate limiting returns 429
```

### Hook Test
```
Write tests for [useHookName] hook that cover:
- Initial state is correct
- Loading state during fetch
- Error state on failure
- Success state with data
- Refetch functionality
- Cleanup on unmount
```

---

## Optimization

### Performance
```
Optimize [component/page] for performance:
- Current issue: [describe]
- Consider:
  - React.memo for list items
  - useMemo for expensive calculations
  - useCallback for event handlers
  - Virtual scrolling for long lists
  - Image optimization with next/image
  - Lazy loading with dynamic imports
  - Bundle splitting analysis
```

### Database Query
```
Optimize the query for [operation]:
- Current query: [describe or paste]
- Issue: [slow/missing index/N+1]
- Target: [expected performance]
- Use: [indexes, joins, RPC calls]
- Check: docs/database/database-schema.md for best practices
```

---

## Quick Tasks

### Small Changes
```
[Task description]

Reference:
- Component: components/[path]
- API: app/api/[path]
- Database: docs/database/database-schema-reference.md
- Patterns: docs/guides/refactoring-guide.md
```

### Code Review
```
Review the code in [file/path] for:
- TypeScript strict mode compliance
- Accessibility issues (a11y)
- Performance concerns (re-renders, memoization)
- Error handling gaps
- Consistency with project patterns
- Mobile responsiveness
```

### Refactoring
```
Refactor [file/component] to:
- Extract logic into custom hook: use[HookName]
- Use shared components (BaseForm, FilterPanel, etc.)
- Follow patterns in docs/guides/refactoring-guide.md
- Maintain backward compatibility
- Add tests for refactored code
```

---

## Hooks & Utilities

### Create Custom Hook
```
Create a custom hook called use[HookName] that:
- Purpose: [describe what it does]
- Uses: [list dependencies like useState, useEffect, etc.]
- Returns: [list returned values/functions]
- Handles: [loading, error states]
- Follows patterns in hooks/ directory
```

### Create Utility Function
```
Create a utility function in utils/[filename].ts that:
- Does: [describe functionality]
- Accepts: [parameters with types]
- Returns: [return type]
- Handles: [edge cases, errors]
- Exported from utils/index.ts
```

---

## Documentation

### Update Docs
```
Update [doc file] to reflect:
- Current implementation of [feature/component]
- New endpoints: [list API routes]
- Changed behavior: [describe changes]
- Add examples with current code patterns
- Update status (✅/🚧/📋)
- Follow format in docs/ directory
```

### Create README
```
Create a README.md for [package/component] that:
- Describes purpose and usage
- Includes props/API documentation
- Shows examples with current patterns
- Lists dependencies
- Links to related docs
```

---

## Tips for Better Prompts

1. **Be specific** - Include exact field names, types, and table names
2. **Reference existing code** - Point to similar implementations in the codebase
3. **Define acceptance criteria** - What does "done" look like?
4. **Mention constraints** - Any limitations or requirements
5. **Link to documentation** - Relevant schema, API docs, guides
6. **Specify project patterns** - Server Components, 'use client', custom hooks, etc.
7. **Include file paths** - Where should code be created/modified

---

## Common Patterns to Reference

### Component Patterns
- **Server Components by default**: Add 'use client' only when needed
- **Custom Hooks**: Extract logic into hooks/ directory
- **Barrel Exports**: Use index.ts files for clean imports
- **TypeScript Interfaces**: Define props with proper types

### Database Patterns
- **RLS Policies**: Always enable Row Level Security
- **Junction Tables**: Use for many-to-many relationships
- **Array Types**: Leverage PostgreSQL arrays (menu_links[], menu_images[])
- **Triggers**: Use for maintaining derived data (user_stats)

### API Patterns
- **Centralized Client**: Use libs/apiClient.ts for API calls
- **Error Handling**: Always handle errors with user-friendly messages
- **Rate Limiting**: Protect endpoints with middleware
- **Caching**: Implement client-side caching with TTL

### Styling Patterns
- **Tailwind CSS 3**: Primary styling with utility classes
- **CSS Variables**: Use for design system values
- **Responsive Design**: Mobile-first with breakpoints
- **Touch Targets**: Minimum 44px for mobile UX

---

*Last updated: 2026-05-07*