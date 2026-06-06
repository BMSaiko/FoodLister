# Implementation Plan

[Overview]
Implement a List Activity Feed feature that tracks and displays all changes made to a list (restaurants added/removed, list details updated, collaborators added/removed). This provides transparency and accountability for list owners and collaborators, especially useful for collaborative lists where multiple users can make changes.

[Types]
New TypeScript interfaces and database types for the activity feed system.

New interfaces in libs/types.ts:
- ListActivity: { id: string; list_id: string; user_id: string; action: 'restaurant_added' | 'restaurant_removed' | 'list_updated' | 'collaborator_added' | 'collaborator_removed' | 'list_duplicated'; details: Record<string, any>; created_at: string }
- ListActivityWithUser extends ListActivity: { profiles: { display_name: string | null; avatar_url: string | null } | null }

New database table in types/database.ts:
- list_activities: { id: uuid; list_id: uuid; user_id: uuid; action: text; details: jsonb; created_at: timestamptz }

[Files]
New files to create:
1. supabase/migrations/039_add_list_activities.sql - Migration creating list_activities table with RLS policies
2. app/api/lists/[id]/activities/route.ts - GET endpoint for fetching list activities
3. components/ui/lists/ListActivityFeed.tsx - Activity feed UI component
4. hooks/lists/useListActivities.ts - Custom hook for fetching and managing activity data
5. libs/activity.ts - Shared utility for logging activities
6. __tests__/api/lists/activities.test.ts - API route tests
7. __tests__/components/ui/lists/ListActivityFeed.test.tsx - Component tests
8. __tests__/hooks/lists/useListActivities.test.ts - Hook tests
9. __tests__/libs/activity.test.ts - Utility function tests

Existing files to modify:
1. libs/types.ts - Add ListActivity and ListActivityWithUser interfaces
2. types/database.ts - Add list_activities table definition
3. app/api/lists/[id]/restaurants/route.ts - Add activity logging on POST (add restaurant)
4. app/api/lists/[id]/restaurants/[id]/route.ts - Add activity logging on DELETE (remove restaurant)
5. app/api/lists/[id]/route.ts - Add activity logging on PUT (update list) and POST (duplicate list)
6. app/api/lists/[id]/collaborators/route.ts - Add activity logging on POST (add collaborator) and DELETE (remove collaborator)
7. app/lists/[id]/page.tsx - Add ListActivityFeed component to list detail page

[Functions]
New functions:
1. logActivity(supabase, listId, userId, action, details) in libs/activity.ts - Shared utility to insert activity records
2. useListActivities(listId) hook in hooks/lists/useListActivities.ts - Returns { activities, loading, error, refetch }
3. GET handler in app/api/lists/[id]/activities/route.ts - Fetches activities with user profiles, ordered by created_at DESC, with pagination

Modified functions:
1. POST handler in app/api/lists/[id]/restaurants/route.ts - After successful insert, call logActivity with action 'restaurant_added'
2. DELETE handler in app/api/lists/[id]/restaurants/[id]/route.ts - Call logActivity with action 'restaurant_removed'
3. PUT handler in app/api/lists/[id]/route.ts - After successful update, call logActivity with action 'list_updated'
4. POST handler in app/api/lists/[id]/route.ts (duplicate) - After successful duplication, call logActivity with action 'list_duplicated'
5. POST handler in app/api/lists/[id]/collaborators/route.ts - After successful insert, call logActivity with action 'collaborator_added'
6. DELETE handler in collaborators route - Call logActivity with action 'collaborator_removed'

[Classes]
No new or modified classes (project uses functional components and hooks throughout).

[Dependencies]
No new packages required. Uses existing dependencies: @supabase/supabase-js, react-toastify, lucide-react, native Date for timestamps.

[Testing]
New test files:
1. __tests__/api/lists/activities.test.ts - Test GET endpoint (auth, pagination, ordering)
2. __tests__/components/ui/lists/ListActivityFeed.test.tsx - Test component (renders, empty state, loading)
3. __tests__/hooks/lists/useListActivities.test.ts - Test hook (fetch, loading, error)
4. __tests__/libs/activity.test.ts - Test logActivity utility

Test scenarios:
- Activity feed displays in reverse chronological order
- Shows user display name and avatar for each activity
- Handles empty state gracefully
- Activity logging fires on restaurant add/remove
- Activity logging fires on list update/duplicate
- Activity logging fires on collaborator add/remove
- API returns 401 for unauthenticated users
- API returns 403 for non-owner/non-collaborator users
- Pagination works correctly (default limit 20, max 100)

[Implementation Order]
1. Create database migration: supabase/migrations/039_add_list_activities.sql
2. Update types/database.ts with list_activities table definition
3. Update libs/types.ts with ListActivity and ListActivityWithUser interfaces
4. Create libs/activity.ts with logActivity utility function
5. Create app/api/lists/[id]/activities/route.ts GET endpoint
6. Modify app/api/lists/[id]/restaurants/route.ts POST to log activities
7. Modify app/api/lists/[id]/restaurants/[id]/route.ts DELETE to log activities
8. Modify app/api/lists/[id]/route.ts PUT to log list update activities
9. Modify app/api/lists/[id]/route.ts POST to log list duplicate activities
10. Modify app/api/lists/[id]/collaborators/route.ts to log collaborator activities
11. Create hooks/lists/useListActivities.ts custom hook
12. Create components/ui/lists/ListActivityFeed.tsx UI component
13. Integrate ListActivityFeed into app/lists/[id]/page.tsx
14. Write all test files
15. Run lint, build, and test suite to verify implementation