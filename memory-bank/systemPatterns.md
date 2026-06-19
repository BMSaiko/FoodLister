# FoodLister - System Patterns

## Architecture Overview

FoodLister uses **Next.js 15 App Router** with a hybrid rendering approach (Server/Client Components) and **Supabase** as the backend-as-a-service (PostgreSQL, Auth, Realtime, Storage).

```
┌─────────────────────────────────────────────────────────────┐
│                    FoodLister Application                    │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌───────────┐  │
│  │   Frontend      │  │   Backend       │  │  External  │  │
│  │   (Next.js)     │◄─┼──(Supabase)    │  │  Services  │  │
│  └─────────────────┘  └─────────────────┘  └───────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Key Design Patterns

### 1. App Router with Server/Client Components

**Pattern**: Next.js 15 App Router with strategic Server/Client Component separation

**Implementation**:
- **Server Components** (default): Used for data fetching, SEO-critical pages
  - `app/lists/page.tsx` - Server-side list fetching
  - `app/restaurants/page.tsx` - Restaurant data with filters
  - `app/users/[id]/page.tsx` - User profile data

- **Client Components**: Used for interactivity, hooks, browser APIs
  - Forms (RestaurantForm, ListForm)
  - Components with useState/useEffect
  - Components using custom hooks

**Benefits**: Reduced bundle size, faster initial loads, better SEO

### 2. Context API for State Management

**Pattern**: React Context API with Provider pattern for global state

**Contexts**:
```typescript
// contexts/AuthContext.tsx
AuthContext → user, session, loading, signIn, signUp, signOut

// contexts/FiltersContext.tsx  
FiltersContext → filters, setFilters, resetFilters

// contexts/ModalContext.tsx
ModalContext → isOpen, openModal, closeModal, modalContent

// contexts/index.tsx → Combined providers
```

**Provider Hierarchy** (in `components/layouts/ClientLayout.jsx`):
```
App
└── AuthProvider
    └── FiltersProvider
        └── ModalProvider
            └── {children}
```

### 3. Custom Hooks for Reusable Logic

**Pattern**: Encapsulate data fetching, form logic, and UI state in custom hooks

**Hook Categories**:

#### Data Hooks (`hooks/data/`)
- `useRestaurants.ts` - Fetch/ filter restaurants
- `useLists.ts` - List data management
- `useReviews.ts` - Review data with pagination
- `useVisitsData.ts` - Restaurant visit tracking

#### Auth Hooks (`hooks/auth/`)
- `useAuth.ts` - Authentication state
- `useSession.ts` - Session management
- `useSecureApi.ts` - Authenticated API calls

#### Form Hooks (`hooks/forms/`)
- `useListForm.ts` - List creation/editing
- `useRestaurantForm.ts` - Restaurant form logic
- `useReviewForm.ts` - Review submission

#### UI Hooks (`hooks/ui/`)
- `useFiltersLogic.ts` - Filter state management
- `usePagination.ts` - Pagination logic
- `useInfiniteScroll.ts` - Infinite scroll detection

#### Utility Hooks (`hooks/utilities/`)
- `useDebounce.ts` - Debounced values
- `useLocalStorage.ts` - LocalStorage persistence
- `useMediaQuery.ts` - Responsive breakpoints

### 4. Component Composition Pattern

**Pattern**: Build complex UIs from small, reusable components

**Example Structure**:
```
components/
├── ui/                      # Atomic UI components
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Modal.tsx
│   ├── Badge.tsx
│   └── SkeletonLoader.tsx
├── layouts/                 # Layout components
│   ├── ClientLayout.jsx
│   ├── Navbar.tsx
│   └── Footer.tsx
├── pages/                   # Page-specific components
│   ├── CreateList.jsx
│   ├── EditList.jsx
│   └── RestaurantForm.tsx
├── lists/                   # List-related components
│   ├── ListCard.tsx
│   ├── ListsGrid.tsx
│   └── ListForm.tsx
├── restaurant/              # Restaurant components
│   ├── RestaurantCard.tsx
│   ├── RestaurantGrid.tsx
│   └── RestaurantForm.tsx
└── filters/                 # Filter components
    ├── TabbedRestaurantFilters.tsx
    ├── CuisineSelector.tsx
    └── DietaryOptionsSelector.tsx
```

### 5. API Route Pattern

**Pattern**: Next.js API routes with middleware for rate limiting

**Structure**:
```
app/api/
├── lists/
│   ├── route.ts          # GET (list), POST (create)
│   └── [id]/
│       ├── route.ts      # GET, PUT, DELETE
│       ├── restaurants/
│       │   └── route.ts  # POST (add restaurant to list)
│       ├── comments/
│       │   └── route.ts  # GET, POST comments
│       └── collaborators/
│           └── route.ts  # GET, POST collaborators
├── restaurants/
│   ├── route.ts          # GET (with filters), POST
│   └── [id]/
│       └── route.ts      # GET, PUT, DELETE
├── reviews/
│   ├── route.ts          # GET, POST
│   └── [id]/
│       └── route.ts      # PUT, DELETE
└── upload/
    └── route.ts          # POST (Cloudinary upload)
```

**API Request Flow**:
```
Client → API Route → Supabase Client → PostgreSQL
                ↓
         Rate Limiter (middleware/rateLimiter.ts)
                ↓
         Authentication Check (useSecureApi)
                ↓
         Row Level Security (database level)
```

### 6. Supabase Integration Patterns

**Client Setup** (`libs/supabase/`):
```typescript
// Client for browser (Client Components)
createClientComponentClient()

// Client for server (Server Components, API routes)
createServerComponentClient()

// Admin client (service role, server-side only)
createAdminClient()
```

**Real-time Subscriptions**:
```typescript
const subscription = supabase
  .channel('restaurants')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'restaurants' }, 
    (payload) => updateRestaurants(payload)
  )
  .subscribe();
```

**Row Level Security (RLS)**:
- Users can only edit/delete their own content
- Public lists visible to all authenticated users
- Private lists visible only to owner and collaborators
- Policies defined in `supabase/migrations/` (007, 009-014, 032, 035)

### 7. Form Handling Pattern

**Pattern**: React Hook Form with custom form hooks

**Implementation**:
```typescript
// hooks/forms/useRestaurantForm.ts
const useRestaurantForm = (restaurantId?) => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  
  const onSubmit = async (data) => {
    // API call to create/update restaurant
  };
  
  return { register, handleSubmit, errors, onSubmit };
};
```

**Form Components**:
- `RestaurantForm.tsx` - Uses `useRestaurantForm`
- `ListForm.tsx` - Uses `useListForm`
- `ReviewForm.tsx` - Uses `useReviewForm`

### 8. Performance Optimization Patterns

**Code Splitting**: Automatic via Next.js App Router

**Image Optimization**:
```jsx
import Image from 'next/image';
<Image src={restaurant.image} width={400} height={300} alt={name} />
```

**Debounced Search**:
```typescript
// hooks/utilities/useDebounce.ts
const debouncedSearch = useDebounce(searchQuery, 300);
```

**Web Worker for Search** (`public/workers/search-worker.js`):
- Offloads filtering to background thread
- Tracks performance metrics (search count, duration)

**Performance Dashboard** (`components/ui/common/PerformanceDashboard.tsx`):
- Real-time metrics: FPS, memory usage, filter time
- Development tool for optimization

### 9. Error Handling Pattern

**API Routes**:
```typescript
try {
  const { data, error } = await supabase.from('table').select();
  if (error) throw error;
  return NextResponse.json({ data });
} catch (error) {
  console.error('API Error:', error);
  return NextResponse.json({ error: error.message }, { status: 500 });
}
```

**Client Components**:
```typescript
const [error, setError] = useState(null);
try {
  await fetchData();
} catch (err) {
  setError(err.message);
}
```

**Error Boundaries**: Implemented via error.tsx files in App Router

### 10. Testing Patterns

**Unit Tests** (`__tests__/`):
- `__tests__/components/` - Component rendering and interaction
- `__tests__/hooks/` - Hook logic and state changes
- `__tests__/api/` - API route responses and errors

**Testing Stack**:
- Jest 30.0.2 (test runner)
- React Testing Library (component testing)
- ts-jest (TypeScript support)

**Example Test**:
```typescript
import { render, screen } from '@testing-library/react';
import RestaurantCard from '@/components/restaurant/RestaurantCard';

test('renders restaurant name', () => {
  render(<RestaurantCard restaurant={{ name: 'Test Restaurant' }} />);
  expect(screen.getByText('Test Restaurant')).toBeInTheDocument();
});
```

## Data Flow Patterns

### Server-Side Data Fetching
```
Server Component → createServerComponentClient() → 
Supabase Query → Data → Pass to Client Component as Props
```

### Client-Side Data Fetching
```
Client Component → useState/useEffect → 
useRestaurants() hook → Supabase Query → 
setState → Re-render
```

### Form Submission Flow
```
Form Component → handleSubmit → 
API Route → Supabase Insert/Update → 
Revalidation (revalidatePath) → 
Redirect/Update UI
```

## Database Schema Patterns

### Core Tables (in `supabase/database.sql`)
- `profiles` - User profiles (linked to auth.users)
- `restaurants` - Restaurant entries with JSON arrays (menu_links, menu_images, phone_numbers)
- `lists` - Curated lists with collaboration support
- `list_restaurants` - Junction table for list-restaurant relationships
- `reviews` - Restaurant reviews with ratings and amount_spent
- `list_comments` - Comments on lists
- `list_collaborators` - Collaboration management with roles
- `user_restaurant_visits` - Visit tracking
- `cuisine_types`, `features`, `dietary_options` - Filter categories
- `restaurant_cuisine_types`, `restaurant_features`, `restaurant_dietary_options_junction` - Junction tables

### Migration Pattern
- Sequential numbering (000-037)
- Each migration is atomic (single feature/change)
- Rollback not supported (Supabase convention)
- Seed files separate from migrations

## Security Patterns

### Authentication
- Supabase Auth with JWT tokens
- Server-side session validation
- useSecureApi hook for authenticated requests

### Authorization
- Row Level Security (RLS) on all user data tables
- Policies check `auth.uid()` against `creator_id` or collaboration roles
- Service role key for admin operations (server-side only)

### Rate Limiting
- In-memory rate limiter (`middleware/rateLimiter.ts`)
- API routes: 100 requests/15 minutes
- Auth routes: 10 requests/15 minutes
- TTL-based cleanup every minute

### Input Validation
- Client-side: React Hook Form validation
- Server-side: API route validation
- Database: Constraints and check constraints

## File Naming Conventions

- **Components**: PascalCase (e.g., `RestaurantCard.tsx`)
- **Hooks**: camelCase with "use" prefix (e.g., `useRestaurants.ts`)
- **API Routes**: `route.ts` (Next.js convention)
- **Utilities**: camelCase (e.g., `filters.ts`, `formatters.ts`)
- **Types**: kebab-case (e.g., `database.ts`)
- **Migrations**: Sequential numbers (e.g., `024_add_list_comments.sql`)

## Documentation Organization Pattern

### Memory Bank Structure
- **Location**: `memory-bank/` folder in project root
- **Purpose**: Project context, progress tracking, and technical decisions
- **Files** (6 total):
  - `projectbrief.md` - Project overview and objectives
  - `productContext.md` - Product context and user needs
  - `activeContext.md` - Current session state and recent changes
  - `systemPatterns.md` - Architecture and design patterns (this file)
  - `techContext.md` - Technology stack and environment
  - `progress.md` - Progress tracking and milestones

### Documentation Structure (`docs/`)
- **Purpose**: User guides, API docs, and technical documentation
- **Subdirectories** (8 total):
  - `api/` - API documentation and endpoint references
  - `architecture/` - System architecture and design documents
  - `database/` - Database schema and references
  - `features/` - Feature roadmaps and implementation guides
  - `guides/` - Development, deployment, and user guides
  - `progress/` - Progress tracking and session reports
  - `reference/` - Skills, templates, and references
  - `setup/` - Setup and configuration guides
  - `tasks/` - Task tracking and planning documents

### Benefits
- **Clear Separation**: Memory bank for project context, docs/ for documentation
- **Logical Grouping**: Related documents organized in dedicated folders
- **Scalability**: Easy to add new documents in appropriate categories
- **Discoverability**: Consistent structure makes finding documents intuitive

## Summary

FoodLister follows modern React/Next.js patterns with clear separation of concerns:
- **Server Components** for data fetching and SEO
- **Client Components** for interactivity
- **Context API** for global state
- **Custom Hooks** for reusable logic
- **Supabase** for backend (database, auth, realtime)
- **Component Composition** for UI reusability
- **RLS Policies** for security
- **Jest/RTL** for testing