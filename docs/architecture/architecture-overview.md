# Architecture Overview

This document provides a comprehensive overview of the FoodLister application's architecture, design patterns, and technical decisions.

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FoodLister Application                   │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐  │
│  │   Frontend      │  │   Backend       │  │  External   │  │
│  │   (Next.js)     │  │   (Supabase)    │  │  Services   │  │
│  └─────────────────┘  └─────────────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Detailed Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Browser                           │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              Next.js Application (App Router)          │ │
│  ├─────────────────────────────────────────────────────────┤ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐│ │
│  │  │  Pages      │  │ Components  │  │  Context API    ││ │
│  │  │  (Routes)   │  │  (UI)       │  │  (State Mgmt)   ││ │
│  │  └─────────────┘  └─────────────┘  └─────────────────┘│ │
│  ├─────────────────────────────────────────────────────────┤ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐│ │
│  │  │  Hooks      │  │  Utils      │  │  Libraries      ││ │
│  │  │  (Logic)    │  │  (Helpers)   │  │  (Supabase)     ││ │
│  │  └─────────────┘  └─────────────┘  └─────────────────┘│ │
│  └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                Supabase Backend                         │ │
│  ├─────────────────────────────────────────────────────────┤ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐│ │
│  │  │ PostgreSQL  │  │  Auth       │  │  Real-time      ││ │
│  │  │  Database   │  │  Service    │  │  Engine         ││ │
│  │  └─────────────┘  └─────────────┘  └─────────────────┘│ │
│  └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              External Integrations                      │ │
│  ├─────────────────────────────────────────────────────────┤ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐│ │
│  │  │ Google Maps │  │ Cloudinary  │  │  Future APIs    ││ │
│  │  │  Parsing    │  │   Upload    │  │  (Analytics)    ││ │
│  │  └─────────────┘  └─────────────┘  └─────────────────┘│ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend Framework
- **Next.js 13+**: React framework with App Router for server-side rendering and routing
- **React 18**: UI library with modern features and performance optimizations
- **TypeScript**: Type safety and better developer experience

### Styling & UI
- **Tailwind CSS 3**: Utility-first CSS framework with CSS variables (design system)
- **Lucide React**: Modern icon library
- **Custom Design System**: Standardized CSS variables for theming

### Backend & Database
- **Supabase**: Open-source Firebase alternative
  - PostgreSQL database with custom schemas
  - Real-time subscriptions
  - Authentication with user profiles
  - Row Level Security (RLS) policies
  - Automatic profile creation on signup

### Development Tools
- **ESLint**: Code linting with custom config (`eslint.config.mjs`)
- **Jest**: Testing framework with jsdom environment
- **Next.js TurboPack**: Fast development bundler

### External Services
- **Cloudinary**: Image upload and hosting with transformation support
- **Google Maps**: URL parsing for restaurant location data

## Application Structure

### Directory Structure

```
foodlister/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── auth/session/         # Session management
│   │   ├── cuisine-types/        # Reference data endpoints
│   │   ├── dietary-options/      # Reference data endpoints
│   │   ├── features/             # Reference data endpoints
│   │   ├── health/               # Health check endpoint
│   │   ├── lists/                # Lists CRUD + restaurants management
│   │   ├── restaurants/          # Restaurants CRUD + visits
│   │   ├── reviews/              # Reviews CRUD
│   │   └── users/                # User profile + stats
│   ├── auth/                     # Authentication pages (login, signup)
│   ├── lists/                    # Lists pages (create, edit, view)
│   ├── meals/                    # Meals scheduling pages
│   ├── notifications/            # Notifications page
│   ├── restaurants/              # Restaurants pages (create, edit, view)
│   ├── users/                    # User profile pages
│   ├── globals.css               # Global styles with CSS variables
│   ├── layout.js                 # Root layout with fonts
│   └── page.js                   # Homepage
├── components/                   # React components
│   ├── layouts/                  # Layout components (ClientLayout, Navbar)
│   ├── lists/                    # List-related components
│   ├── pages/                    # Page-specific components
│   ├── restaurant/               # Restaurant-related components
│   └── ui/                      # Reusable UI components
├── contexts/                     # React contexts
│   ├── AuthContext.tsx            # Authentication state
│   ├── FiltersContext.tsx         # Filters state
│   └── ModalContext.tsx          # Modal state
├── hooks/                        # Custom React hooks
│   ├── auth/                     # Authentication hooks (useAuth, useApiClient)
│   ├── data/                     # Data fetching hooks (useRestaurants, useUserData)
│   ├── forms/                    # Form hooks (useListForm, useRestaurantForm)
│   ├── lists/                    # List-related hooks (useListFilters)
│   ├── navigation/               # Navigation hooks
│   ├── ui/                       # UI hooks (useImagePreview, useInfiniteScroll)
│   └── utilities/                # Utility hooks
├── libs/                         # External service integrations
│   ├── api.ts                    # API endpoint definitions
│   ├── apiClient.ts              # Centralized API client with caching
│   ├── auth.ts                   # Auth utilities
│   └── supabase/                 # Supabase client setup (server + client)
├── middleware/                    # Middleware
│   └── rateLimiter.ts            # Rate limiting middleware
├── public/                       # Static assets
│   └── workers/                  # Web workers (if any)
├── scripts/                       # Utility scripts
├── utils/                        # Utility functions
│   ├── analytics.ts              # Analytics utilities
│   ├── apiMonitor.ts             # API monitoring
│   ├── auth.ts                   # Auth utilities (AuthLogger)
│   ├── cloudinaryConverter.ts     # Cloudinary image management
│   ├── dbMonitor.ts              # Database monitoring
│   ├── filters.ts                # Filter logic
│   ├── formatters.ts             # Data formatters
│   ├── googleMapsExtractor.ts    # Google Maps integration
│   ├── listExport.ts             # List export (ICS calendar)
│   ├── logger.ts                 # Logging utilities
│   ├── performanceMonitor.ts      # Performance monitoring
│   └── search.ts                 # Search functionality
├── types/                        # TypeScript definitions
│   └── database.ts               # Database type definitions
├── __tests__/                    # Test files (mirroring app/, components/, hooks/)
├── supabase/                     # Supabase related files
│   ├── migrations/               # Database migrations
│   └── *.sql                    # SQL scripts
└── memory-bank/                  # Project memory files
```

### Component Architecture

#### Page Components (in `app/`)
- **Server Components by default**: Better performance and SEO
- **Client Components when needed**: Interactivity, hooks, browser APIs
- **Route-based**: Each page in `/app` directory corresponds to a route

#### UI Components (in `components/`)
- **Atomic Design**: Small, reusable components
- **Composition**: Components composed from smaller components
- **Props Interface**: Well-defined TypeScript interfaces
- **Client/Server distinction**: Clear marking with 'use client' directive

#### Layout Components (in `components/layouts/`)
- **ClientLayout**: Root layout wrapper with context providers
- **Navbar**: Navigation bar
- **Responsive**: Mobile-first design approach

## State Management

### Context API (Global State)
The application uses React Context API for global state management:

#### AuthContext
- **Purpose**: Manages authentication state
- **Provides**: User, session, loading state, sign in/out functions
- **Usage**: `useAuth()` hook

#### FiltersContext
- **Purpose**: Manages restaurant/list filters
- **Provides**: Filters state, setFilters function
- **Usage**: `useFilters()` hook

#### ModalContext
- **Purpose**: Manages modal dialogs (MapSelector, etc.)
- **Provides**: Modal state, open/close functions
- **Usage**: `useModal()` hook

### Local State
```javascript
// Component-level state with useState
const [restaurants, setRestaurants] = useState([]);

// Form state with custom hooks
const { formData, handleChange, resetForm } = useForm(initialValues);
```

### Custom Hooks (Derived State)
```javascript
// Data fetching hook
function useRestaurants(filters) {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRestaurants();
  }, [filters]);

  const fetchRestaurants = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('restaurants')
      .select('*');
    setRestaurants(data);
    setLoading(false);
  };

  return { restaurants, loading, refetch: fetchRestaurants };
}
```

## Data Flow

### Server-Side Data Fetching
```javascript
// In Server Components (when needed)
async function getRestaurants() {
  const supabase = createClient();
  const { data } = await supabase.from('restaurants').select('*');
  return data;
}

// Usage in page component
export default async function RestaurantsPage() {
  const restaurants = await getRestaurants();
  return <RestaurantList restaurants={restaurants} />;
}
```

### Client-Side Data Fetching
```javascript
// In Client Components
useEffect(() => {
  const fetchRestaurants = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('restaurants')
      .select('*');

    if (error) {
      console.error('Error fetching restaurants:', error);
      return;
    }

    setRestaurants(data);
  };

  fetchRestaurants();
}, []);
```

### API Client Usage
```javascript
// Using the centralized apiClient
import { apiClient } from '@/libs/apiClient';

// GET request
const data = await apiClient.get('/api/restaurants');

// POST request with auth
const data = await apiClient.post('/api/lists', {
  name: 'My List',
  is_public: true
}, { requireAuth: true });
```

## Key Design Patterns

### Custom Hooks Pattern
```javascript
// Custom hook for API client with auth
function useApiClient() {
  const [apiCall, setApiCall] = useState(null);
  const [get, setGet] = useState(null);
  const [post, setPost] = useState(null);

  // Implementation with token caching, session handling
  // Returns: { apiCall, get, post, put, patch, del, clearAuth }

  return { apiCall, get, post, put, patch, del, clearAuth };
}
```

### Provider Pattern
```javascript
// Context provider for filters
function FiltersProvider({ children }) {
  const [filters, setFilters] = useState(defaultFilters);

  const value = useMemo(() => ({
    filters,
    setFilters,
  }), [filters]);

  return (
    <FiltersContext.Provider value={value}>
      {children}
    </FiltersContext.Provider>
  );
}
```

### Component Composition
```javascript
// Higher-order component for auth guard
function withAuthGuard(WrappedComponent) {
  return function AuthGuardedComponent(props) {
    const { user, loading } = useAuth();

    if (loading) return <LoadingSpinner />;
    if (!user) return <Navigate to="/auth/login" />;

    return <WrappedComponent {...props} />;
  };
}
```

## Performance Optimizations

### Next.js Optimizations
- **App Router**: Improved performance and developer experience
- **Server Components**: Reduced bundle size and faster initial renders
- **Streaming**: Progressive loading of page content
- **Image Optimization**: Automatic image optimization with next/image

### Database Optimizations
- **Indexes**: Proper indexing on frequently queried columns
- **Row Level Security**: Efficient permission checks
- **Connection Pooling**: Supabase handles connection pooling
- **Query Optimization**: Proper use of Supabase select with relations

### Frontend Optimizations
- **Code Splitting**: Automatic code splitting by Next.js
- **Lazy Loading**: Components loaded on demand
- **Memoization**: React.memo for expensive components
- **Client-side Caching**: apiClient with TTL support (5 minutes default)
- **Request Deduplication**: Avoid duplicate simultaneous requests

## Security Architecture

### Authentication
```javascript
// Supabase Auth integration
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password
});
```

### Authorization
- **Row Level Security (RLS)**: Database-level access control
- **Policy-based**: Policies define what data users can access
- **User-based**: Creator field tracks ownership
- **API-level checks**: Additional checks in API routes

### Data Validation
- **Client-side**: Form validation with custom hooks
- **Server-side**: API route validation
- **Database-level**: Constraints and triggers
- **Type Safety**: TypeScript interfaces

## Real-time Features

### Supabase Real-time
```javascript
// Real-time subscriptions (available but not heavily used currently)
const subscription = supabase
  .channel('restaurants')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'restaurants'
  }, (payload) => {
    // Handle real-time updates
    updateRestaurants(payload);
  })
  .subscribe();
```

## External Integrations

### Google Maps Integration
```javascript
// URL parsing without API keys
function extractGoogleMapsData(url) {
  // Parse URL parameters to extract location data
  // No external API calls required
  return { name, location, url };
}
```

### Image Upload (Cloudinary)
```javascript
// Client-side image upload with retry logic
import { uploadToCloudinary } from '@/utils/cloudinaryConverter';

const imageUrl = await uploadToCloudinary(imageFile, {
  maxRetries: 3,
  delay: 1000
});
```

Features:
- Automatic URL optimization with transformations
- Retry logic with progressive delay
- Validation of Cloudinary URLs
- Public ID extraction for management

## Menu System

The FoodLister application includes a comprehensive menu system allowing restaurants to have multiple external links and uploaded images.

### Menu Fields in Restaurant Objects

When retrieving restaurants, the following menu-related fields are included:

- **`menu_links`**: Array of external URLs (max 5 links)
- **`menu_images`**: Array of Cloudinary image URLs (max 10 images)
- **`menu_url`**: Deprecated single URL field (for backward compatibility)

### Menu Validation Rules

#### Menu Links
- **Maximum**: 5 external links per restaurant
- **Format**: Must be valid HTTP/HTTPS URLs
- **Uniqueness**: Duplicate links within the same restaurant are not allowed
- **Purpose**: PDFs, websites, menu pages

#### Menu Images
- **Maximum**: 10 uploaded images per restaurant
- **Format**: Cloudinary URLs pointing to valid image files
- **Size**: Individual images limited by Cloudinary upload limits
- **Purpose**: Scanned menus, photos of menu boards

## User Profile Architecture

The FoodLister application includes a comprehensive user profile system that enables users to:
- View their own and other users' profiles
- Manage reviews, restaurants, and lists
- Interact with content through edit, delete, and share actions

### Profile Page Architecture

```
app/users/[id]/page.jsx (Client Component)
├── UserProfileHeader
│   ├── User avatar and display name
│   ├── Stats (reviews count, restaurants count, lists count)
│   └── Privacy indicator
├── ProfileTabs
│   ├── Reviews tab
│   ├── Restaurants tab
│   └── Lists tab
└── Tab Content
    ├── UserReviewsSection
    │   └── ReviewCard[] (with pagination)
    ├── UserRestaurantsSection
    │   └── RestaurantCard[] (with pagination)
    └── UserListsSection
        └── ProfileCard[] (with pagination)
```

### Data Flow

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Profile Page   │────►│  API Routes      │────►│  Supabase       │
│  (Client)       │     │  /api/users/*    │     │  Database       │
└─────────────────┘     └──────────────────┘     └─────────────────┘
         │                        │                       │
         │                        │                       │
         ▼                        ▼                       ▼
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Local State    │     │  Auth Check      │     │  RLS Policies   │
│  (useState)     │◄────│  (useAuth)       │◄────│  (Row Level)    │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

## Monitoring & Analytics

### Monitoring Utilities
- **apiMonitor.ts**: API call monitoring and logging
- **dbMonitor.ts**: Database query performance monitoring
- **performanceMonitor.ts**: Frontend performance monitoring
- **analytics.ts**: User behavior analytics

### Error Tracking
- **Client-side**: Console logging and error boundaries
- **Server-side**: Supabase logs and error reporting
- **AuthLogger**: Session event logging (session start/refresh/expiry)

## Deployment Architecture

### Development
- **Local Development**: `npm run dev` with hot reloading (TurboPack)
- **Environment Variables**: Local `.env.local` file (see `.env.local.example`)
- **Database**: Supabase cloud development database

### Production
- **Vercel**: Recommended deployment platform
- **Environment Variables**: Set in Vercel dashboard
- **Database**: Supabase production instance
- **CDN**: Vercel Edge Network for global distribution

### Build Process
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Git Push  │───►│   Build     │───►│  Deploy     │
│             │    │  (Vercel)   │    │  (Vercel)   │
└─────────────┘    └─────────────┘    └─────────────┘
                      │
                      ▼
               ┌─────────────┐
               │   Tests     │
               │  (npm test)  │
               └─────────────┘
```

## Testing Architecture

### Test Structure
```
__tests__/
├── api/                         # API route tests
├── components/                   # Component tests
└── hooks/                        # Custom hooks tests
```

### Testing Tools
- **Jest**: Test runner with jsdom environment
- **Testing Library**: React component testing
- **Mock Supabase**: Mocked Supabase client for tests

## Scalability Considerations

### Database Scaling
- **Supabase**: Automatic scaling based on usage
- **Read Replicas**: For high-read applications (future)
- **Caching**: HTTP caching and CDN caching

### Frontend Scaling
- **CDN**: Global content delivery
- **Code Splitting**: Automatic chunk optimization
- **Image Optimization**: Next.js automatic optimization

### API Scaling
- **Rate Limiting**: Middleware rate limiter (`middleware/rateLimiter.ts`)
- **Client-side Rate Limiting**: apiClient with max 10 requests/second
- **Caching**: HTTP caching and client-side caching

## Future Architecture Enhancements

### Potential Improvements
- **Edge Functions**: Supabase Edge Functions for global APIs
- **Advanced Caching**: Redis for session and data caching (future)
- **Progressive Web App**: Offline functionality and installability
- **Advanced Analytics**: User behavior tracking and insights
- **Real-time Features**: More extensive use of Supabase real-time

### Technology Migration Path
- **React Server Components**: Further adoption for performance
- **Next.js Features**: Adoption of new App Router features
- **Database Migration**: Potential migration to other PostgreSQL providers
- **Multi-region**: Global deployment with data replication

This architecture provides a solid foundation for the FoodLister application with room for future enhancements and scaling.