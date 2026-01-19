# Architecture Overview

This document provides a comprehensive overview of the FoodList application's architecture, design patterns, and technical decisions.

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FoodList Application                     │
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
│  │              Next.js Application                       │ │
│  ├─────────────────────────────────────────────────────────┤ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │ │
│  │  │  Pages      │  │ Components  │  │  Context API    │  │ │
│  │  │  (Routes)   │  │  (UI)       │  │  (State Mgmt)   │  │ │
│  │  └─────────────┘  └─────────────┘  └─────────────────┘  │ │
│  ├─────────────────────────────────────────────────────────┤ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │ │
│  │  │  Hooks      │  │  Utils      │  │  Libraries      │  │ │
│  │  │  (Logic)    │  │  (Helpers)   │  │  (Supabase)     │  │ │
│  │  └─────────────┘  └─────────────┘  └─────────────────┘  │ │
│  └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                Supabase Backend                         │ │
│  ├─────────────────────────────────────────────────────────┤ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │ │
│  │  │ PostgreSQL  │  │  Auth       │  │  Real-time      │  │ │
│  │  │  Database   │  │  Service    │  │  Engine         │  │ │
│  │  └─────────────┘  └─────────────┘  └─────────────────┘  │ │
│  └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              External Integrations                      │ │
│  ├─────────────────────────────────────────────────────────┤ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │ │
│  │  │ Google Maps │  │   Imgur     │  │  Future APIs    │  │ │
│  │  │  Parsing    │  │   Upload    │  │  (Analytics)    │  │ │
│  │  └─────────────┘  └─────────────┘  └─────────────────┘  │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend Framework
- **Next.js 15**: React framework with App Router for server-side rendering and routing
- **React 19**: UI library with modern features and performance optimizations
- **TypeScript**: Type safety and better developer experience

### Styling & UI
- **Tailwind CSS 4**: Utility-first CSS framework for responsive design
- **Lucide React**: Modern icon library
- **Headless UI**: Unstyled UI components for accessibility

### Backend & Database
- **Supabase**: Open-source Firebase alternative
  - PostgreSQL database with custom schemas
  - Real-time subscriptions
  - Authentication with user profiles
  - Row Level Security (RLS) policies
  - Automatic profile creation on signup

### Development Tools
- **ESLint**: Code linting
- **Prettier**: Code formatting (implied)
- **Next.js Turbopack**: Fast development bundler

### External Services
- **Cloudinary**: Image upload and hosting
- **Google Maps**: URL parsing for restaurant location data

## Application Structure

### Directory Structure

```
foodlist/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes (minimal)
│   ├── globals.css               # Global styles
│   ├── layout.js                 # Root layout
│   └── page.js                   # Home page
├── components/                   # React components
│   ├── layouts/                  # Layout components
│   ├── pages/                    # Page-specific components
│   ├── providers/                # Context providers
│   └── ui/                       # Reusable UI components
├── contexts/                     # React contexts
├── hooks/                        # Custom React hooks
├── libs/                         # External service integrations
│   └── supabase/                 # Supabase client setup
├── public/                       # Static assets
├── utils/                        # Utility functions
│   ├── filters.ts                # Filter logic
│   ├── formatters.ts             # Data formatters
│   ├── googleMapsExtractor.ts    # Google Maps integration
│   └── search.ts                 # Search functionality
└── types.ts                      # TypeScript definitions
```

### Component Architecture

#### Page Components
- **Route-based**: Each page in `/app` directory corresponds to a route
- **Server Components**: Default for better performance and SEO
- **Client Components**: Used when interactivity is needed

#### UI Components
- **Atomic Design**: Small, reusable components
- **Composition**: Components composed from smaller components
- **Props Interface**: Well-defined TypeScript interfaces

#### Layout Components
- **Shared Layouts**: Navbar, footer components
- **Responsive**: Mobile-first design approach

## Data Flow

### State Management

#### Local State
```javascript
// Component-level state with useState
const [restaurants, setRestaurants] = useState([]);

// Form state with react-hook-form
const { register, handleSubmit } = useForm();
```

#### Global State
```javascript
// Context API for shared state
const FiltersContext = createContext();

// Provider pattern
function FiltersProvider({ children }) {
  const [filters, setFilters] = useState(defaultFilters);

  return (
    <FiltersContext.Provider value={{ filters, setFilters }}>
      {children}
    </FiltersContext.Provider>
  );
}
```

### Data Fetching

#### Server-Side Data Fetching
```javascript
// In Server Components
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

#### Client-Side Data Fetching
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

## Key Design Patterns

### Custom Hooks
```javascript
// Custom hook for data fetching
function useRestaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    // Implementation
  };

  return { restaurants, loading, refetch: fetchRestaurants };
}
```

### Provider Pattern
```javascript
// Context provider for theme/app settings
function AppProvider({ children }) {
  const [theme, setTheme] = useState('light');

  const value = useMemo(() => ({
    theme,
    setTheme,
  }), [theme]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}
```

### Component Composition
```javascript
// Higher-order component for data loading
function withDataLoading(WrappedComponent) {
  return function DataLoadingComponent(props) {
    const { data, loading, error } = useData();

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorMessage error={error} />;

    return <WrappedComponent {...props} data={data} />;
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

### Frontend Optimizations
- **Code Splitting**: Automatic code splitting by Next.js
- **Lazy Loading**: Components loaded on demand
- **Memoization**: React.memo for expensive components
- **Virtual Scrolling**: For large lists (potential future enhancement)

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

### Data Validation
- **Client-side**: Form validation with react-hook-form
- **Database-level**: Constraints and triggers
- **Type Safety**: TypeScript interfaces

## Real-time Features

### Supabase Real-time
```javascript
// Real-time subscriptions
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
}
```

### Image Upload (Imgur)
```javascript
// Client-side image upload
async function uploadToImgur(file) {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch('https://api.imgur.com/3/image', {
    method: 'POST',
    headers: {
      Authorization: `Client-ID ${process.env.IMGUR_CLIENT_ID}`
    },
    body: formData
  });

  return response.json();
}
```

## Deployment Architecture

### Development
- **Local Development**: `npm run dev` with hot reloading
- **Environment Variables**: Local `.env.local` file
- **Database**: Local Supabase instance or cloud development database

### Production
- **Vercel**: Recommended deployment platform
- **Environment Variables**: Set in Vercel dashboard
- **Database**: Supabase production instance
- **CDN**: Vercel Edge Network for global distribution

### CI/CD Pipeline
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Git Push  │───►│   Build     │───►│  Deploy     │
│             │    │  (Vercel)   │    │  (Vercel)   │
└─────────────┘    └─────────────┘    └─────────────┘
                      │
                      ▼
               ┌─────────────┐
               │   Tests     │
               │  (Optional) │
               └─────────────┘
```

## Monitoring & Analytics

### Error Tracking
- **Client-side**: Console logging and error boundaries
- **Server-side**: Supabase logs and error reporting

### Performance Monitoring
- **Core Web Vitals**: Next.js built-in metrics
- **Database Performance**: Supabase query performance
- **User Experience**: Real user monitoring (future)

## Scalability Considerations

### Database Scaling
- **Supabase**: Automatic scaling based on usage
- **Read Replicas**: For high-read applications
- **Caching**: Redis integration (future enhancement)

### Frontend Scaling
- **CDN**: Global content delivery
- **Code Splitting**: Automatic chunk optimization
- **Image Optimization**: Next.js automatic optimization

### API Scaling
- **Edge Functions**: Supabase Edge Functions for global APIs
- **Rate Limiting**: Built-in Supabase rate limiting
- **Caching**: HTTP caching and CDN caching

## Future Architecture Enhancements

### Potential Improvements
- **GraphQL API**: More efficient data fetching
- **Microservices**: Separate services for different features
- **Progressive Web App**: Offline functionality and installability
- **Advanced Caching**: Redis for session and data caching
- **Analytics**: User behavior tracking and insights

### Technology Migration Path
- **React Server Components**: Further adoption for performance
- **Next.js 15 Features**: Bleeding-edge features adoption
- **Database Migration**: Potential migration to other PostgreSQL providers
- **Multi-region**: Global deployment with data replication

This architecture provides a solid foundation for the FoodList application with room for future enhancements and scaling.
