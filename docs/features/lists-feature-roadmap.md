# Lists Feature Roadmap

This document outlines the current state of the Lists feature in FoodLister and identifies missing functionality for future development.

---

## Current State (Implemented)

### ✅ Core CRUD Operations

| Feature | Status | Notes |
|---------|--------|-------|
| Create List | ✅ Implemented | Name, description, visibility (public/private), filter-based restaurant selection |
| Read List | ✅ Implemented | View list details with restaurants, cuisine types, features, dietary options |
| Update List | ✅ Implemented | Edit name, description, visibility, add/remove restaurants |
| Delete List | ✅ Implemented | API endpoint + UI button in list detail and user profile |

### ✅ Privacy & Security

| Feature | Status | Notes |
|---------|--------|-------|
| Public/Private Lists | ✅ Implemented | `is_public` column with RLS policies |
| Owner-only Edit/Delete | ✅ Implemented | RLS policies enforce `creator_id = auth.uid()` |
| Public List Discovery | ✅ Implemented | Authenticated users can see public lists |

### ✅ Restaurant Management

| Feature | Status | Notes |
|---------|--------|-------|
| Manual Restaurant Search | ✅ Implemented | Search and add restaurants to list |
| Filter-based Selection | ✅ Implemented | Integration with filters |
| Add Restaurant to List | ✅ Implemented | Via API `POST /api/lists/[id]/restaurants` |
| Remove from List | ✅ Implemented | Via API `DELETE /api/lists/[id]/restaurants/[restaurantId]` |

### ✅ API Endpoints

| Endpoint | Method | Status | Notes |
|----------|--------|--------|-------|
| `/api/lists` | GET | ✅ Implemented | Lists with search, restaurant counts, auth-aware |
| `/api/lists` | POST | ✅ Implemented | Create new list |
| `/api/lists/[id]` | GET | ✅ Implemented | Full list details with restaurants |
| `/api/lists/[id]` | PUT | ✅ Implemented | Update list details |
| `/api/lists/[id]` | PATCH | ✅ Implemented | Partial update |
| `/api/lists/[id]` | DELETE | ✅ Implemented | Delete list and associations |
| `/api/lists/[id]/restaurants` | GET | ✅ Implemented | Get restaurants in list |
| `/api/lists/[id]/restaurants` | POST | ✅ Implemented | Add restaurant to list |
| `/api/lists/[id]/restaurants/[id]` | DELETE | ✅ Implemented | Remove restaurant from list |
| `/api/lists/[id]/share` | POST | ✅ Implemented | Share list functionality |

### ✅ UI Components

| Component | Status | Notes |
|-----------|--------|-------|
| Lists Page (`/lists`) | ✅ Implemented | Search, loading skeletons, empty states |
| List Detail (`/lists/[id]`) | ✅ Implemented | Restaurants grid, privacy badge, roulette |
| Create List (`/lists/create`) | ✅ Implemented | Form with visibility toggle, restaurant selection |
| Edit List (`/lists/[id]/edit`) | ✅ Implemented | Pre-populated form, sync changes |
| UserListsSection | ✅ Implemented | In user profile with delete button |

### ✅ Additional Features

| Feature | Status | Notes |
|---------|--------|-------|
| Roulette | ✅ Implemented | Random restaurant picker from list |
| Restaurant Count | ✅ Implemented | Displayed on list cards |
| Share List | ✅ Implemented | Web Share API + clipboard fallback |
| List Stats | ✅ Implemented | Restaurants count, average rating in user stats |

---

## Missing Features (Roadmap)

### 🔴 High Priority

#### 1. Duplicate List

**Description:** Users cannot duplicate an existing list to create a new one with the same restaurants.

**Acceptance Criteria:**
- [ ] Add "Duplicate" button to list detail page (owner only)
- [ ] Copy all restaurants from original list
- [ ] Pre-fill create form with copied data + "(Copy)" suffix
- [ ] Allow user to modify before saving
- [ ] Toast notification on success

**Files to Create/Modify:**
- `app/lists/[id]/page.jsx` - Add duplicate button
- `app/lists/create/page.jsx` - Accept pre-filled data via state
- `components/pages/CreateList.jsx` - Handle pre-filled state

---

### 🟡 Medium Priority

#### 2. Reorder Restaurants in List

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
- `supabase/migrations/` - New migration
- `app/lists/[id]/edit/page.jsx` - Add drag-and-drop UI
- `app/api/lists/[id]/route.ts` - Return ordered restaurants

---

#### 3. List Statistics (Enhanced)

**Description:** More detailed statistics for lists.

**Acceptance Criteria:**
- [x] Show total restaurants count
- [x] Show average rating of all restaurants in list
- [ ] Show cuisine type distribution (pie chart or bar)
- [ ] Show price range distribution
- [ ] Show visited vs unvisited count
- [x] Display on list detail page

**Files to Modify:**
- `app/lists/[id]/page.jsx` - Add enhanced stats section
- `app/api/lists/[id]/route.ts` - Add stats computation

---

#### 4. Export List

**Description:** Users cannot export their lists to share outside the app.

**Acceptance Criteria:**
- [x] Export as JSON
- [ ] Export as CSV (restaurant name, location, rating, cuisine types)
- [ ] Export as PDF (formatted with images)
- [ ] Download file triggered from list detail page
- [x] Export as ICS calendar (for scheduled meals)

**Files to Create:**
- `utils/listExport.ts` - Export utility functions (✅ implemented)
- `app/lists/[id]/page.jsx` - Add export button

---

#### 5. List Comments

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
- `supabase/migrations/` - New migration
- `components/lists/ListComments.tsx` - Comments component
- `app/api/lists/[id]/comments/route.ts` - Comments API

---

#### 6. Collaborative Lists

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

#### 7. List Categories/Tags

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

#### 8. List Cover Image

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

#### 9. List Activity Feed

**Description:** No history of changes made to a list.

**Acceptance Criteria:**
- [ ] Log when restaurants are added/removed
- [ ] Show who made the change (for collaborative lists)
- [ ] Display on list detail page

---

#### 10. Smart List Suggestions

**Description:** No AI-powered suggestions for restaurants to add to lists.

**Acceptance Criteria:**
- [ ] Suggest restaurants based on existing list cuisine types
- [ ] Suggest restaurants based on user's visit history
- [ ] "You might also like" section on list detail page

---

#### 11. List Templates

**Description:** Users cannot create or use templates for common list types.

**Acceptance Criteria:**
- [ ] Pre-built templates (e.g., "Best Italian", "Date Night Spots")
- [ ] User can save their own lists as templates
- [ ] Template marketplace

---

#### 12. List Notifications

**Description:** No notifications for changes to shared/collaborative lists.

**Acceptance Criteria:**
- [x] Notification system exists in database
- [ ] Notify when someone adds a restaurant to your list
- [ ] Notify when a collaborative list is updated
- [ ] Email digest option

---

#### 13. List Import

**Description:** Users cannot import lists from external sources.

**Acceptance Criteria:**
- [ ] Import from JSON file
- [ ] Import from CSV
- [ ] Import from Google Maps (saved places)
- [ ] Import from TripAdvisor

---

## Database Schema Changes Summary

| Migration | Purpose | Priority | Status |
|-----------|---------|----------|-------|
| `add_list_restaurant_position.sql` | Add position column for ordering | Medium | ❌ Not Started |
| `add_list_comments.sql` | Add comments table | Medium | ❌ Not Started |
| `add_list_collaborators.sql` | Add collaborators table | Medium | ❌ Not Started |
| `add_list_tags.sql` | Add tags column | Low | ❌ Not Started |
| `add_list_cover_image.sql` | Add cover image column | Low | ❌ Not Started |

---

## API Endpoints to Create

| Endpoint | Method | Purpose | Priority | Status |
|----------|--------|---------|----------|-------|
| `/api/lists/[id]/comments` | GET | Get list comments | Medium | ❌ Not Started |
| `/api/lists/[id]/comments` | POST | Add comment | Medium | ❌ Not Started |
| `/api/lists/[id]/comments/[commentId]` | PUT | Update comment | Medium | ❌ Not Started |
| `/api/lists/[id]/comments/[commentId]` | DELETE | Delete comment | Medium | ❌ Not Started |
| `/api/lists/[id]/collaborators` | GET | Get collaborators | Medium | ❌ Not Started |
| `/api/lists/[id]/collaborators` | POST | Add collaborator | Medium | ❌ Not Started |
| `/api/lists/[id]/collaborators/[userId]` | DELETE | Remove collaborator | Medium | ❌ Not Started |

---

## Files Reference

### Current List-Related Files

| File | Purpose | Status |
|------|---------|-------|
| `app/lists/page.jsx` | Lists overview page | ✅ Implemented |
| `app/lists/[id]/page.jsx` | List detail page | ✅ Implemented |
| `app/lists/create/page.jsx` | Create list page | ✅ Implemented |
| `app/lists/[id]/edit/page.jsx` | Edit list page | ✅ Implemented |
| `app/api/lists/route.ts` | GET/POST lists API | ✅ Implemented |
| `app/api/lists/[id]/route.ts` | GET/PUT/PATCH/DELETE list API | ✅ Implemented |
| `app/api/lists/[id]/restaurants/route.ts` | GET/POST restaurants in list | ✅ Implemented |
| `app/api/lists/[id]/restaurants/[id]/route.ts` | DELETE restaurant from list | ✅ Implemented |
| `app/api/lists/[id]/share/route.ts` | POST share list | ✅ Implemented |
| `components/pages/CreateList.jsx` | Create list form component | ✅ Implemented |
| `components/pages/EditList.jsx` | Edit list form component | ✅ Implemented |
| `components/lists/ListForm.tsx` | Reusable list form | ✅ Implemented |
| `hooks/lists/useListFilterLogic.ts` | List filtering logic | ✅ Implemented |
| `hooks/lists/useListFilters.ts` | List filters state | ✅ Implemented |
| `utils/listExport.ts` | Export utility (JSON, ICS) | ✅ Implemented |
| `contexts/AuthContext.tsx` | Auth state for lists | ✅ Implemented |

---

## Testing Status

| Test Type | Coverage | Notes |
|----------|---------|-------|
| Unit Tests | ✅ Partial | Hooks and utils tested |
| Component Tests | ✅ Partial | Form components tested |
| API Tests | ❌ Missing | API routes need test coverage |
| E2E Tests | ❌ Missing | Full user flows need testing |

---

*Last updated: 2026-05-07*