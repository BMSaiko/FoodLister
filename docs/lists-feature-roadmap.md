# Lists Feature Roadmap

This document outlines the current state of the Lists feature in FoodList and identifies missing functionality for future development.

---

## Current State (Implemented)

### ✅ Core CRUD Operations

| Feature | Status | Notes |
|---------|--------|-------|
| Create List | ✅ Implemented | Name, description, visibility (public/private), filter-based restaurant selection |
| Read List | ✅ Implemented | View list details with restaurants, cuisine types, features, dietary options |
| Update List | ✅ Implemented | Edit name, description, visibility, add/remove restaurants |
| Delete List | ⚠️ Partial | RLS policy exists, but no API endpoint or UI button |

### ✅ Privacy & Security

| Feature | Status | Notes |
|---------|--------|-------|
| Public/Private Lists | ✅ Implemented | `is_public` column with RLS policies |
| Owner-only Edit/Delete | ✅ Implemented | RLS policies enforce `creator_id = auth.uid()` |
| Public List Discovery | ✅ Implemented | Unauthenticated users can see public lists |

### ✅ Restaurant Management

| Feature | Status | Notes |
|---------|--------|-------|
| Manual Restaurant Search | ✅ Implemented | Search and add restaurants to list |
| Filter-based Selection | ✅ Implemented | `TabbedRestaurantFilters` integration |
| Remove from List | ✅ Implemented | During edit mode |

### ✅ API Endpoints

| Endpoint | Method | Status | Notes |
|----------|--------|--------|-------|
| `/api/lists` | GET | ✅ Implemented | Lists with search, restaurant counts, auth-aware |
| `/api/lists/[id]` | GET | ✅ Implemented | Full list details with restaurants |
| `/api/lists` | POST | ❌ Missing | Lists are created via Supabase client directly |
| `/api/lists/[id]` | PUT/PATCH | ❌ Missing | Updates done via Supabase client directly |
| `/api/lists/[id]` | DELETE | ❌ Missing | No endpoint exists |

### ✅ UI Components

| Component | Status | Notes |
|-----------|--------|-------|
| Lists Page (`/lists`) | ✅ Implemented | Search, loading skeletons, empty states |
| List Detail (`/lists/[id]`) | ✅ Implemented | Restaurants grid, privacy badge, roulette |
| Create List (`/lists/create`) | ✅ Implemented | Form with visibility toggle, restaurant selection |
| Edit List (`/lists/[id]/edit`) | ✅ Implemented | Pre-populated form, sync changes |

### ✅ Additional Features

| Feature | Status | Notes |
|---------|--------|-------|
| Roulette | ✅ Implemented | Random restaurant picker from list |
| Restaurant Count | ✅ Implemented | Displayed on list cards |

---

## Missing Features (Roadmap)

### 🔴 High Priority

#### 1. Delete List Functionality

**Description:** Users cannot delete lists from the UI. The RLS policy exists but there's no API endpoint or button.

**Acceptance Criteria:**
- [ ] Create `DELETE /api/lists/[id]` endpoint
- [ ] Add delete button to list detail page (owner only)
- [ ] Add delete button to `UserListsSection` component
- [ ] Confirmation dialog before deletion
- [ ] Toast notification on success/failure
- [ ] Remove list from local state on success

**Files to Create/Modify:**
- `app/api/lists/[id]/route.ts` - Add DELETE method
- `app/lists/[id]/page.tsx` - Add delete button
- `components/ui/profile/sections/lists/UserListsSection.tsx` - Add delete handler

---

#### 2. Share List Functionality

**Description:** Users cannot share lists with others. The `onShare` handler is empty in list components.

**Acceptance Criteria:**
- [ ] Add share button to list cards and detail page
- [ ] Implement Web Share API for supported browsers
- [ ] Fallback to clipboard copy for unsupported browsers
- [ ] Share URL format: `/lists/{id}`
- [ ] Include list name in share title
- [ ] Toast notification on successful share/copy

**Files to Modify:**
- `components/ui/profile/sections/lists/UserListsSection.tsx`
- `app/lists/[id]/page.tsx`
- Consider creating a shared `useShare` hook

---

#### 3. Duplicate List

**Description:** Users cannot duplicate an existing list to create a new one with the same restaurants.

**Acceptance Criteria:**
- [ ] Add "Duplicate" button to list detail page (owner only)
- [ ] Copy all restaurants from original list
- [ ] Pre-fill create form with copied data + " (Copy)" suffix
- [ ] Allow user to modify before saving
- [ ] Toast notification on success

**Files to Create/Modify:**
- `app/lists/[id]/page.tsx` - Add duplicate button
- `app/lists/create/page.tsx` - Accept pre-filled data via URL params
- `components/pages/CreateList.jsx` - Handle pre-filled state

---

### 🟡 Medium Priority

#### 4. Reorder Restaurants in List

**Description:** Users cannot change the order of restaurants within a list.

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
- `supabase/migrations/024_add_list_restaurant_position.sql` - New migration
- `app/lists/[id]/edit/page.tsx` - Add drag-and-drop UI
- `app/api/lists/[id]/route.ts` - Return ordered restaurants

---

#### 5. List Statistics

**Description:** No statistics are shown for lists (total restaurants, average rating, cuisine distribution, etc.)

**Acceptance Criteria:**
- [ ] Show total restaurants count
- [ ] Show average rating of all restaurants in list
- [ ] Show cuisine type distribution (pie chart or bar)
- [ ] Show price range distribution
- [ ] Show visited vs unvisited count
- [ ] Display on list detail page

**Files to Modify:**
- `app/lists/[id]/page.tsx` - Add stats section
- `app/api/lists/[id]/route.ts` - Add stats computation

---

#### 6. Export List

**Description:** Users cannot export their lists to share outside the app.

**Acceptance Criteria:**
- [ ] Export as JSON
- [ ] Export as CSV (restaurant name, location, rating, cuisine types)
- [ ] Export as PDF (formatted with images)
- [ ] Download file triggered from list detail page

**Files to Create:**
- `utils/listExport.ts` - Export utility functions
- `app/lists/[id]/page.tsx` - Add export button

---

#### 7. List Comments

**Description:** Users cannot add comments or notes to lists.

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

**Files to Create:**
- `supabase/migrations/025_add_list_comments.sql` - New migration
- `components/ui/lists/ListComments.tsx` - Comments component
- `app/api/lists/[id]/comments/route.ts` - Comments API

---

#### 8. Collaborative Lists

**Description:** Lists cannot be edited by multiple users.

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
  role text NOT NULL DEFAULT 'editor', -- 'editor' or 'viewer'
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT list_collaborators_pkey PRIMARY KEY (id),
  CONSTRAINT list_collaborators_list_id_fkey FOREIGN KEY (list_id) REFERENCES public.lists(id) ON DELETE CASCADE,
  CONSTRAINT list_collaborators_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT list_collaborators_unique UNIQUE (list_id, user_id)
);
```

---

### 🟢 Low Priority

#### 9. List Categories/Tags

**Description:** Users cannot organize lists into categories or add tags.

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

#### 10. List Cover Image

**Description:** Lists don't have a visual cover image.

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

#### 11. List Activity Feed

**Description:** No history of changes made to a list.

**Acceptance Criteria:**
- [ ] Log when restaurants are added/removed
- [ ] Show who made the change (for collaborative lists)
- [ ] Display on list detail page

---

#### 12. Smart List Suggestions

**Description:** No AI-powered suggestions for restaurants to add to lists.

**Acceptance Criteria:**
- [ ] Suggest restaurants based on existing list cuisine types
- [ ] Suggest restaurants based on user's visit history
- [ ] "You might also like" section on list detail page

---

#### 13. List Templates

**Description:** Users cannot create or use templates for common list types.

**Acceptance Criteria:**
- [ ] Pre-built templates (e.g., "Best Italian", "Date Night Spots")
- [ ] User can save their own lists as templates
- [ ] Template marketplace

---

#### 14. List Notifications

**Description:** No notifications for changes to shared/collaborative lists.

**Acceptance Criteria:**
- [ ] Notify when someone adds a restaurant to your list
- [ ] Notify when a collaborative list is updated
- [ ] Email digest option

---

#### 15. List Import

**Description:** Users cannot import lists from external sources.

**Acceptance Criteria:**
- [ ] Import from JSON file
- [ ] Import from CSV
- [ ] Import from Google Maps (saved places)
- [ ] Import from TripAdvisor

---

## Database Schema Changes Summary

| Migration | Purpose | Priority |
|-----------|---------|----------|
| `024_add_list_restaurant_position.sql` | Add position column for ordering | Medium |
| `025_add_list_comments.sql` | Add comments table | Medium |
| `026_add_list_collaborators.sql` | Add collaborators table | Medium |
| `027_add_list_tags.sql` | Add tags column | Low |
| `028_add_list_cover_image.sql` | Add cover image column | Low |

---

## API Endpoints to Create

| Endpoint | Method | Purpose | Priority |
|----------|--------|---------|----------|
| `/api/lists/[id]` | DELETE | Delete a list | High |
| `/api/lists/[id]/comments` | GET | Get list comments | Medium |
| `/api/lists/[id]/comments` | POST | Add comment | Medium |
| `/api/lists/[id]/comments/[commentId]` | PUT | Update comment | Medium |
| `/api/lists/[id]/comments/[commentId]` | DELETE | Delete comment | Medium |
| `/api/lists/[id]/collaborators` | GET | Get collaborators | Medium |
| `/api/lists/[id]/collaborators` | POST | Add collaborator | Medium |
| `/api/lists/[id]/collaborators/[userId]` | DELETE | Remove collaborator | Medium |

---

## Files Reference

### Current List-Related Files

| File | Purpose |
|------|---------|
| `app/lists/page.js` | Lists overview page |
| `app/lists/[id]/page.tsx` | List detail page |
| `app/lists/create/page.tsx` | Create list page |
| `app/lists/[id]/edit/page.tsx` | Edit list page |
| `app/api/lists/route.ts` | GET lists API |
| `app/api/lists/[id]/route.ts` | GET single list API |
| `components/pages/CreateList.jsx` | Create list form component |
| `components/pages/EditList.jsx` | Edit list form component |
| `hooks/lists/useListFilterLogic.ts` | List filtering hook |
| `hooks/lists/useListFilters.ts` | List filters state hook |
| `supabase/migrations/022_add_is_public_to_lists.sql` | Privacy migration |
| `supabase/migrations/023_fix_list_privacy.sql` | Privacy fix migration |

---

*Last updated: 2026-04-03*