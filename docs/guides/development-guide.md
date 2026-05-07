# Development Guide#

This guide provides detailed instructions for developers working on the FoodLister application, including setup, development workflows, coding standards, and best practices.

## Getting Started#

### Prerequisites#

Before starting development, ensure you have the following installed:

- **Node.js**: Version 18.0 or higher
- **npm**: Version 8.0 or higher
- **Git**: Version control system
- **Supabase Account**: For database and authentication
- **Code Editor**: VS Code recommended with extensions:
  - ES7+ React/Redux/React-Native snippets
  - Prettier - Code formatter
  - ESLint
  - TypeScript Importer

### Environment Setup#

1. **Clone the repository**
   ```bash
   git clone https://github.com/BMSaiko/FoodLister.git
   cd foodlister
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory (see `.env.local.example` for template):
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

   # NextAuth Configuration (optional)
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret

   # Cloudinary Configuration
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

4. **Set up Supabase database**

   - Create a new Supabase project at [supabase.com](https://supabase.com)
   - Copy your project URL and anon key to the environment variables
   - Run the SQL migrations in your Supabase SQL editor (see `docs/database/database-schema.md`)

## Development Workflow#

### Starting the Development Server#

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

### Available Scripts#

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run Jest tests
- `npm run test:watch` - Run tests in watch mode

### Development with Turbopack#

The project uses Next.js Turbopack for fast development builds. Key benefits:
- **Faster builds**: Significantly faster than Webpack
- **Hot reloading**: Instant updates on file changes
- **Better DX**: Improved developer experience

## Project Structure#

### Directory Organization#

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
├── memory-bank/                  # Project memory files
└── docs/                         # Documentation
```

### Component Organization#

#### Page Components (`app/`)
- Use **Server Components** by default for better performance
- Add `'use client'` directive only when client-side interactivity is needed
- Keep pages focused on data fetching and layout

#### UI Components (`components/`)
- Small, reusable components
- Follow atomic design principles
- Use TypeScript interfaces for props
- Implement responsive design with Tailwind classes
- Use CSS variables for theming (see `globals.css`)

#### Custom Hooks (`hooks/`)
- Extract complex logic from components
- Follow naming convention: `use[Feature]`
- Handle side effects and data fetching
- Use barrel exports (`index.ts`) for clean imports

## Coding Standards#

### TypeScript Guidelines#

#### Type Definitions#
```typescript
// Good: Explicit interface definitions
interface Restaurant {
  id: string;
  name: string;
  description?: string;
  rating: number;
}

// Bad: Using 'any'
function processData(data: any) {
  // ...
}
```

#### Generic Types#
```typescript
// Use generics for reusable components
interface SelectProps<T> {
  options: T[];
  value: T | null;
  onChange: (value: T) => void;
}
```

### React Best Practices#

#### Component Structure#
```jsx
// Good: Clear component structure
function RestaurantCard({ restaurant }) {
  return (
    <div className="restaurant-card">
      <h3>{restaurant.name}</h3>
      <p>{restaurant.description}</p>
      <RestaurantActions restaurant={restaurant} />
    </div>
  );
}

// Bad: Large, complex components
function RestaurantCard({ restaurant }) {
  // 200+ lines of JSX and logic
}
```

#### State Management#
```jsx
// Good: Local state for component-specific data
function SearchComponent() {
  const [query, setQuery] = useState('');

  // Component logic
}

// Use Context for app-wide state
function App() {
  return (
    <AuthProvider>
      <FiltersProvider>
        {/* App content */}
      </FiltersProvider>
    </AuthProvider>
  );
}
```

### Styling Guidelines#

#### Tailwind CSS with CSS Variables#
```jsx
// Good: Semantic class names and responsive design
<div className="bg-white rounded-lg shadow-md p-4 md:p-6 hover:shadow-lg transition-shadow">
  <h3 className="text-lg font-semibold text-gray-900 mb-2">
    Restaurant Name
  </h3>
</div>

// Bad: Inline styles and non-responsive
<div style={{ backgroundColor: 'white', padding: '16px' }}>
  <h3>Restaurant Name</h3>
</div>
```

#### CSS Custom Properties (Design System)#
```css
/* globals.css */
:root {
  --color-primary: #f59e0b;
  --color-secondary: #374151;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
}
```

### Database Operations#

#### Supabase Client Usage#
```javascript
// Good: Proper error handling
const { data, error } = await supabase
  .from('restaurants')
  .select('*')
  .eq('id', restaurantId);

if (error) {
  console.error('Error fetching restaurant:', error);
  throw new Error('Failed to fetch restaurant');
}

return data;
```

#### Query Optimization#
```javascript
// Good: Selective field selection
const { data } = await supabase
  .from('restaurants')
  .select('id, name, rating, price_per_person')
  .limit(20);

// Bad: Select all fields
const { data } = await supabase
  .from('restaurants')
  .select('*');
```

## Testing Guidelines#

### Unit Testing#

```javascript
// Example test with Jest/React Testing Library
import { render, screen } from '@testing-library/react';
import RestaurantCard from '@/components/ui/RestaurantCard';

describe('RestaurantCard', () => {
  it('displays restaurant name', () => {
    const restaurant = { id: '1', name: 'Test Restaurant' };
    render(<RestaurantCard restaurant={restaurant} />);

    expect(screen.getByText('Test Restaurant')).toBeInTheDocument();
  });
});
```

### Integration Testing#

```javascript
// Test component with Supabase mock
import { createClient } from '@supabase/supabase-js';

jest.mock('@supabase/supabase-js');

describe('RestaurantList', () => {
  it('fetches and displays restaurants', async () => {
    // Mock Supabase client
    const mockSupabase = createClient.mockReturnValue({
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue({
          data: [{ id: '1', name: 'Test Restaurant' }],
          error: null
        })
      })
    });

    // Test implementation
  });
});
```

### Test Structure#

```
__tests__/
├── api/                         # API route tests
│   ├── lists.test.js
│   ├── restaurants.test.js
│   └── reviews.test.js
├── components/                   # Component tests
│   ├── RestaurantCard.test.jsx
│   ├── ListForm.test.jsx
│   └── ReviewCard.test.jsx
└── hooks/                        # Custom hooks tests
    ├── useRestaurantForm.test.js
    ├── useListForm.test.js
    └── useAuth.test.js
```

## Git Workflow#

### Branch Naming#
```bash
# Feature branches
git checkout -b feature/restaurant-filters

# Bug fixes
git checkout -b fix/restaurant-card-layout

# Documentation
git checkout -b docs/api-documentation
```

### Commit Messages#

Use [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Good commit messages
git commit -m "feat: add restaurant filtering by cuisine type"

git commit -m "fix: resolve mobile layout issue on restaurant cards"

git commit -m "docs: update API documentation for v2.0"

# Bad commit messages
git commit -m "fix stuff"

git commit -m "update"
```

### Pull Request Process#

1. Create a feature branch from `main`
2. Make your changes
3. Test thoroughly (unit tests, integration tests, manual testing)
4. Update documentation if needed (use `/docs` command)
5. Create a pull request with:
   - Clear description of changes
   - Screenshots for UI changes
   - Reference to related issues
6. Code review and approval
7. Merge to `main`

## Performance Optimization#

### Component Optimization#
```jsx
// Use React.memo for expensive components
const RestaurantCard = React.memo(function RestaurantCard({ restaurant }) {
  return (
    // Component implementation
  );
});

// Use useMemo for expensive calculations
const filteredRestaurants = useMemo(() => {
  return restaurants.filter(restaurant =>
    restaurant.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
}, [restaurants, searchQuery]);
```

### Image Optimization#
```jsx
// Use Next.js Image component
import Image from 'next/image';

<Image
  src={restaurant.imageUrl}
  alt={restaurant.name}
  width={400}
  height={300}
  className="rounded-lg"
/>
```

### Bundle Analysis#
```bash
# Analyze bundle size
npm install --save-dev @next/bundle-analyzer

# Add to package.json scripts
"analyze": "ANALYZE=true npm run build"
```

## Debugging#

### Browser DevTools#

- Use React DevTools for component inspection
- Network tab for API call debugging
- Console for error logging

### Supabase Debugging#
```javascript
// Enable query logging
const supabase = createClient(url, key, {
  db: {
    schema: 'public'
  },
  global: {
    logger: console
  }
});
```

### Common Issues#

#### Database Connection Issues#
```bash
# Check environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# Test Supabase connection
curl -X GET 'https://your-project.supabase.co/rest/v1/restaurants' \
  -H 'apikey: your-anon-key'
```

#### Build Issues#
```bash
# Clear Next.js cache
rm -rf .next
npm run build

# Check for TypeScript errors
npx tsc --noEmit
```

## Deployment#

### Local Testing#
```bash
# Build for production
npm run build

# Test production build locally
npm run start
```

### Environment Variables#

Ensure all production environment variables are set in your deployment platform:

- **Vercel**: Project settings > Environment Variables
- **Netlify**: Site settings > Environment variables
- **Railway**: Project variables

Required variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

### Database Migrations#

```sql
-- Run these in Supabase SQL editor for production
-- (See docs/database/database-schema.md for full migration scripts)
```

## Security Checklist#

### Before Deployment#

- [ ] Remove console.log statements
- [ ] Validate environment variables
- [ ] Test authentication flows
- [ ] Verify RLS policies are active
- [ ] Check for sensitive data exposure
- [ ] Test input validation
- [ ] Verify HTTPS everywhere

### Code Security#
```javascript
// Good: Sanitize user input
const sanitizedName = DOMPurify.sanitize(userInput);

// Good: Use parameterized queries (handled by Supabase)
// Bad: SQL injection vulnerable
const query = `SELECT * FROM restaurants WHERE name = '${userInput}'`;
```

## Menu System Components#

The FoodLister application includes advanced menu management components that allow restaurants to have multiple external links and uploaded images.

### MenuCarousel Component#

**Location**: `components/ui/MenuCarousel.tsx`

**Purpose**: Displays restaurant menu images in an interactive carousel with modal viewer.

**Features**:
- **Responsive grid layout**: 1-3 images per row based on screen size
- **Side-by-side display**: Shows multiple images simultaneously
- **Modal viewer**: Full-screen image viewer with navigation
- **Auto-play**: Optional automatic advancement (desktop only)
- **Touch gestures**: Swipe navigation on mobile
- **Keyboard navigation**: Arrow keys and ESC in modal
- **Image numbering**: Visual indicators for each image

**Usage**:
```jsx
import MenuCarousel from '@/components/ui/MenuCarousel';

function RestaurantPage({ restaurant }) {
  return (
    <div>
      <MenuCarousel images={restaurant.menu_images} />
    </div>
  );
}
```

### MenuManager Component#

**Location**: `components/ui/MenuManager.tsx`

**Purpose**: Form component for managing restaurant menu links and images during creation/editing.

**Features**:
- **Tabbed interface**: Separate tabs for "Links Externos" and "Imagens do Menu"
- **Link management**: Add/remove external menu URLs (max 5)
- **Image management**: Upload and manage menu images (max 10)
- **Validation**: URL validation and duplicate checking
- **Progress indicators**: Visual feedback on limits reached

### ImageUploader Component#

**Location**: `components/ui/ImageUploader.tsx`

**Purpose**: Handles image uploads to Cloudinary with progress feedback.

**Features**:
- **Multiple file selection**: Select multiple images at once
- **Sequential uploads**: Upload images one by one to prevent overload
- **Progress feedback**: Shows upload progress for multiple files
- **Error handling**: Individual error handling per image
- **Responsive design**: Optimized for mobile and desktop

## User Profile Components#

The application includes a comprehensive user profile system that allows users to view and manage their reviews, restaurants, and lists, as well as view other users' profiles.

### Profile Component Architecture#

```
components/ui/profile/
├── UserProfileHeader.tsx          # Profile header with user info and stats
├── ProfileTabs.tsx                # Tab navigation (Reviews, Restaurants, Lists)
├── ProfileActions.tsx             # Profile action buttons (Edit, Follow, etc.)
├── PrivacyToggle.tsx              # Privacy settings toggle
└── sections/
    ├── shared/
    │   ├── ProfileCard.tsx        # Base card component for all profile items
    │   ├── TouchButton.tsx        # Touch-optimized button component
    │   ├── SkeletonLoader.tsx     # Loading skeleton for all content types
    │   └── index.ts               # Shared exports
    ├── reviews/
    │   ├── ReviewCard.tsx         # Review card with edit/delete functionality
    │   ├── ReviewCardHeader.tsx   # Review card header with restaurant image
    │   ├── ReviewCardFooter.tsx   # Review card footer with metadata badges
    │   ├── ReviewCardActions.tsx  # Review action buttons
    │   └── UserReviewsSection.tsx # Reviews list with pagination
    ├── restaurants/
    │   ├── RestaurantCard.tsx     # Restaurant card for profile view
    │   ├── RestaurantCardHeader.tsx
    │   ├── RestaurantCardContent.tsx
    │   ├── RestaurantCardFooter.tsx
    │   ├── RestaurantCardActions.tsx
    │   ├── RestaurantSkeletonLoader.tsx
    │   └── UserRestaurantsSection.tsx
    └── lists/
        └── UserListsSection.tsx   # Lists grid with pagination
```

### Design Patterns#

#### Card Component Structure#

All profile cards follow a consistent structure:
1. **Header**: Image/visual element with rating badge and action buttons
2. **Content**: Description, comments, or main information
3. **Footer**: Metadata badges (rating, price, date, location, tags)
4. **Actions**: Edit, delete, share buttons (positioned over header image)

#### Responsive Grid Layout#
```tsx
// Standard grid pattern used across all sections
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
```

#### Touch-Optimized Components#

- Minimum touch target: 44px (TouchButton min size)
- Touch feedback with active states
- Swipe gestures for mobile (future enhancement)

### State Management#

Profile sections use a combination of:
- **Local state**: For UI state (editing, loading more)
- **useSecureApiClient hook**: For authenticated API calls
- **useUserCache hook**: For cache invalidation after mutations

### API Endpoints#

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/users/[id]` | GET | Fetch user profile with stats |
| `/api/users/me` | GET | Fetch current user profile |
| `/api/users/me/stats` | GET | Fetch user statistics |
| `/api/users/[id]/reviews` | GET | Fetch user's reviews with pagination |
| `/api/users/[id]/restaurants` | GET | Fetch user's restaurants with pagination |
| `/api/users/[id]/lists` | GET | Fetch user's lists with pagination |

### Accessibility#

- Keyboard navigation (Enter, Space for card interaction)
- ARIA labels on all interactive elements
- Focus management for modals and dropdowns
- `prefers-reduced-motion` support for animations
- Screen reader friendly badge descriptions

## Monitoring & Analytics#

### Monitoring Utilities#

- **apiMonitor.ts**: API call monitoring and logging
- **dbMonitor.ts**: Database query performance monitoring
- **performanceMonitor.ts**: Frontend performance monitoring
- **analytics.ts**: User behavior analytics
- **logger.ts**: General logging utilities

### Error Tracking#

- **Client-side**: Console logging and error boundaries
- **Server-side**: Supabase logs and error reporting
- **AuthLogger**: Session event logging (session start/refresh/expire)

## Contributing#

### Code Review Guidelines#

- Review for code quality and adherence to standards
- Test functionality thoroughly
- Check for performance implications
- Verify responsive design
- Ensure accessibility compliance

### Documentation Updates#

- Update README.md for new features
- Add JSDoc comments for new functions
- Update API documentation (use `/docs` command)
- Create migration guides for breaking changes

This development guide should be updated as the project evolves and new patterns emerge. Use the `/docs` command to automatically update all documentation.