# Prompt Templates - FoodList

Pre-built prompt templates for common tasks when working with Cline on the FoodList project.

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
- Uses [Tailwind/Framer Motion] for styling
- Is placed in components/[category]/
- Include a test in __tests__/components/
```

### Component with Data Fetching
```
Create a component called [ComponentName] that:
- Fetches data from [API endpoint/Supabase table]
- Shows loading state with skeleton
- Shows error state with retry button
- Displays [description of content]
- Uses the use[HookName] hook pattern
```

### Form Component
```
Create a form component called [FormName] that:
- Uses React Hook Form
- Validates: [list validation rules]
- Submits to [API endpoint]
- Shows success/error toasts
- Fields: [list fields with types]
```

---

## API Route Creation

### CRUD Endpoints
```
Create API routes for [resource] with:
- GET /api/[resource] - List with pagination
- GET /api/[resource]/[id] - Get single
- POST /api/[resource] - Create (authenticated)
- PUT /api/[resource]/[id] - Update (owner only)
- DELETE /api/[resource]/[id] - Delete (owner only)

The resource has these fields: [list fields]
It relates to: [list relations]
```

### Search Endpoint
```
Create a search endpoint at GET /api/[resource]/search that:
- Accepts query parameter `q`
- Searches by: [list searchable fields]
- Supports filters: [list filter params]
- Returns paginated results
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
```

### Alter Table
```
Create a migration to add/modify [column(s)] to [table_name]:
- Add column: [name, type, constraints]
- Add index on: [column]
- Update existing data: [describe]
```

---

## Feature Implementation

### Filter Feature
```
Add a filter feature for [resource] that:
- Filters by: [list filter criteria]
- Uses [dropdown/checkbox/slider] UI
- Updates URL params
- Works with existing pagination
- Saves as preset option
```

### Upload Feature
```
Add image upload for [resource] that:
- Uses react-dropzone
- Uploads to Cloudinary
- Shows progress indicator
- Validates: [size, type, dimensions]
- Stores URL in [table.column]
```

### Authentication Feature
```
Add [feature] that requires authentication:
- Check user session
- Redirect if not authenticated
- Show user-specific data
- Handle RLS policies
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
- RLS policies in agents/database-agent.md
- Schema in docs/database-schema-reference.md
```

### Frontend Error
```
Fix the following frontend error:
- Component: [component name]
- Error: [error message]
- When: [describe scenario]

Check:
- Props interface
- Hook dependencies
- API response format
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
- Accessibility checks
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
  - Image optimization
```

### Database Query
```
Optimize the query for [operation]:
- Current query: [describe or paste]
- Issue: [slow/missing index/N+1]
- Target: [expected performance]
```

---

## Quick Tasks

### Small Changes
```
[Task description]

Reference:
- Component: components/[path]
- API: app/api/[path]
- Database: docs/database-schema-reference.md
- Patterns: agents/[relevant-agent].md
```

### Code Review
```
Review the code in [file/path] for:
- TypeScript strict mode compliance
- Accessibility issues
- Performance concerns
- Error handling gaps
- Consistency with project patterns
```

---

## Tips for Better Prompts

1. **Be specific** - Include exact field names and types
2. **Reference existing code** - Point to similar implementations
3. **Define acceptance criteria** - What does "done" look like?
4. **Mention constraints** - Any limitations or requirements
5. **Link to documentation** - Relevant schema, API docs, agents

---

*Last updated: 2026-04-05*