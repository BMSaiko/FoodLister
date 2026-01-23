# Development Guide

This guide provides detailed instructions for developers working on the FoodList application, including setup, development workflows, coding standards, and best practices.

## Getting Started

### Prerequisites

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

### Environment Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/BMSaiko/FoodLister.git
   cd foodlist
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:

   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

   # NextAuth Configuration (optional)
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret

   # Cloudinary Configuration (optional)
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   ```

4. **Set up Supabase database**

   - Create a new Supabase project at [supabase.com](https://supabase.com)
   - Copy your project URL and anon key to the environment variables
   - Run the SQL migrations in your Supabase SQL editor (see Database Schema documentation)

## Development Workflow

### Starting the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Development with Turbopack

The project uses Next.js Turbopack for fast development builds. Key benefits:
- **Faster builds**: Significantly faster than Webpack
- **Hot reloading**: Instant updates on file changes
- **Better DX**: Improved developer experience

## Project Structure

### Directory Organization

```
foodlist/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   ├── restaurants/              # Restaurant pages
│   ├── lists/                    # List management pages
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
├── libs/                         # External libraries setup
├── public/                       # Static assets
├── utils/                        # Utility functions
└── docs/                         # Documentation
```

### Component Organization

#### Page Components (`/app`)
- Use **Server Components** by default for better performance
- Add `'use client'` directive only when client-side interactivity is needed
- Keep pages focused on data fetching and layout

#### UI Components (`/components/ui`)
- Small, reusable components
- Follow atomic design principles
- Use TypeScript interfaces for props
- Implement responsive design with Tailwind classes

#### Custom Hooks (`/hooks`)
- Extract complex logic from components
- Follow naming convention: `use[Feature]`
- Handle side effects and data fetching

## Coding Standards

### TypeScript Guidelines

#### Type Definitions
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

#### Generic Types
```typescript
// Use generics for reusable components
interface SelectProps<T> {
  options: T[];
  value: T | null;
  onChange: (value: T) => void;
}
```

### React Best Practices

#### Component Structure
```javascript
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

#### State Management
```javascript
// Good: Local state for component-specific data
function SearchComponent() {
  const [query, setQuery] = useState('');

  // Component logic
}

// Use Context for app-wide state
function App() {
  return (
    <FiltersProvider>
      <RestaurantProvider>
        {/* App content */}
      </RestaurantProvider>
    </FiltersProvider>
  );
}
```

### Styling Guidelines

#### Tailwind CSS
```javascript
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

#### CSS Custom Properties
```css
/* globals.css */
:root {
  --color-primary: #f59e0b;
  --color-secondary: #374151;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
}
```

### Database Operations

#### Supabase Client Usage
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

#### Query Optimization
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

## Testing Guidelines

### Unit Testing
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

### Integration Testing
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

## Git Workflow

### Branch Naming
```bash
# Feature branches
git checkout -b feature/restaurant-filters

# Bug fixes
git checkout -b fix/restaurant-card-layout

# Documentation
git checkout -b docs/api-documentation
```

### Commit Messages
```bash
# Good commit messages
git commit -m "feat: add restaurant filtering by cuisine type"

git commit -m "fix: resolve mobile layout issue on restaurant cards"

git commit -m "docs: update API documentation for v2.0"

# Bad commit messages
git commit -m "fix stuff"

git commit -m "update"
```

### Pull Request Process
1. Create a feature branch from `main`
2. Make your changes
3. Test thoroughly (unit tests, integration tests, manual testing)
4. Update documentation if needed
5. Create a pull request with:
   - Clear description of changes
   - Screenshots for UI changes
   - Reference to related issues
6. Code review and approval
7. Merge to `main`

## Performance Optimization

### Component Optimization
```javascript
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

### Image Optimization
```javascript
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

### Bundle Analysis
```bash
# Analyze bundle size
npm install --save-dev @next/bundle-analyzer

# Add to package.json scripts
"analyze": "ANALYZE=true npm run build"
```

## Debugging

### Browser DevTools
- Use React DevTools for component inspection
- Network tab for API call debugging
- Console for error logging

### Supabase Debugging
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

### Common Issues

#### Database Connection Issues
```bash
# Check environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# Test Supabase connection
curl -X GET 'https://your-project.supabase.co/rest/v1/restaurants' \
  -H 'apikey: your-anon-key'
```

#### Build Issues
```bash
# Clear Next.js cache
rm -rf .next
npm run build

# Check for TypeScript errors
npx tsc --noEmit
```

## Deployment

### Local Testing
```bash
# Build for production
npm run build

# Test production build locally
npm run start
```

### Environment Variables
Ensure all production environment variables are set in your deployment platform:

- Vercel: Project settings > Environment Variables
- Netlify: Site settings > Environment variables
- Railway: Project variables

### Database Migrations
```sql
-- Run these in Supabase SQL editor for production
-- (See docs/database-schema.md for full migration scripts)
```

## Security Checklist

### Before Deployment
- [ ] Remove console.log statements
- [ ] Validate environment variables
- [ ] Test authentication flows
- [ ] Verify RLS policies are active
- [ ] Check for sensitive data exposure
- [ ] Test input validation
- [ ] Verify HTTPS everywhere

### Code Security
```javascript
// Good: Sanitize user input
const sanitizedName = DOMPurify.sanitize(userInput);

// Good: Use parameterized queries (handled by Supabase)
// Bad: SQL injection vulnerable
const query = `SELECT * FROM restaurants WHERE name = '${userInput}'`;
```

## Menu System Components

The FoodList application includes advanced menu management components that allow restaurants to have multiple external links and uploaded images.

### MenuCarousel Component

**Location**: `components/ui/MenuCarousel.jsx`

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

**Props**:
- `images` (array): Array of image URLs to display
- `className` (string, optional): Additional CSS classes

**Mobile Behavior**:
- Shows 1 image per row
- First click shows icon indicator
- Second click opens modal
- Swipe gestures for navigation

**Desktop Behavior**:
- Shows 2-3 images per row
- Hover shows icon indicator
- Click directly opens modal
- Dots navigation for sets

### MenuManager Component

**Location**: `components/ui/MenuManager.jsx`

**Purpose**: Form component for managing restaurant menu links and images during creation/editing.

**Features**:
- **Tabbed interface**: Separate tabs for "Links Externos" and "Imagens do Menu"
- **Link management**: Add/remove external menu URLs (max 5)
- **Image management**: Upload and manage menu images (max 10)
- **Validation**: URL validation and duplicate checking
- **Progress indicators**: Visual feedback on limits reached

**Usage**:
```jsx
import MenuManager from '@/components/ui/MenuManager';

function RestaurantForm({ formData, onMenuLinksChange, onMenuImagesChange }) {
  return (
    <div>
      <MenuManager
        menuLinks={formData.menu_links}
        menuImages={formData.menu_images}
        onMenuLinksChange={onMenuLinksChange}
        onMenuImagesChange={onMenuImagesChange}
        disabled={loading}
      />
    </div>
  );
}
```

**Props**:
- `menuLinks` (array): Current menu links
- `menuImages` (array): Current menu images
- `onMenuLinksChange` (function): Callback for link updates
- `onMenuImagesChange` (function): Callback for image updates
- `disabled` (boolean): Disable form when submitting

### ImageUploader Component

**Location**: `components/ui/ImageUploader.jsx`

**Purpose**: Handles image uploads to Cloudinary with progress feedback.

**Features**:
- **Multiple file selection**: Select multiple images at once
- **Sequential uploads**: Upload images one by one to prevent overload
- **Progress feedback**: Shows upload progress for multiple files
- **Error handling**: Individual error handling per image
- **Responsive design**: Optimized for mobile and desktop

**Usage**:
```jsx
import ImageUploader from '@/components/ui/ImageUploader';

function ImageUploadSection({ onImageUploaded, maxFiles }) {
  return (
    <ImageUploader
      onImageUploaded={onImageUploaded}
      maxFiles={maxFiles}
    />
  );
}
```

**Props**:
- `onImageUploaded` (function): Callback when image is uploaded
- `className` (string, optional): Additional CSS classes
- `disabled` (boolean): Disable uploader
- `maxFiles` (number): Maximum files allowed (default: 10)

### Menu Data Structure

**Menu Links**:
```javascript
// Array of strings (URLs)
const menuLinks = [
  "https://restaurant.com/menu",
  "https://menu.pdf"
];
```

**Menu Images**:
```javascript
// Array of strings (Cloudinary URLs)
const menuImages = [
  "https://cloudinary.com/image1.jpg",
  "https://cloudinary.com/image2.png"
];
```

### Database Integration

**Creating restaurant with menu**:
```javascript
const { data, error } = await supabase
  .from('restaurants')
  .insert({
    name: 'Restaurant Name',
    menu_links: ['https://menu.pdf'],
    menu_images: ['https://cloudinary.com/image1.jpg'],
    // ... other fields
  });
```

**Updating menu data**:
```javascript
const { data, error } = await supabase
  .from('restaurants')
  .update({
    menu_links: [...existingLinks, 'https://new-menu.pdf'],
    menu_images: [...existingImages, 'https://cloudinary.com/new-image.jpg']
  })
  .eq('id', restaurantId);
```

### Best Practices

#### Component Integration
```jsx
// Good: Proper state management
function RestaurantForm() {
  const [menuLinks, setMenuLinks] = useState([]);
  const [menuImages, setMenuImages] = useState([]);

  return (
    <MenuManager
      menuLinks={menuLinks}
      menuImages={menuImages}
      onMenuLinksChange={setMenuLinks}
      onMenuImagesChange={setMenuImages}
    />
  );
}
```

#### Performance Considerations
- **Lazy loading**: Images are loaded as needed
- **Progressive enhancement**: Works without JavaScript
- **Memory management**: Proper cleanup of event listeners
- **Bundle optimization**: Components are tree-shakable

#### Accessibility
- **Keyboard navigation**: Full keyboard support
- **Screen readers**: Proper ARIA labels
- **Focus management**: Logical tab order
- **Color contrast**: WCAG compliant colors

#### Error Handling
```jsx
// Proper error handling for uploads
const handleImageUpload = async (imageUrl) => {
  try {
    setMenuImages(prev => [...prev, imageUrl]);
  } catch (error) {
    console.error('Upload failed:', error);
    // Show user-friendly error message
  }
};
```

## Contributing

### Code Review Guidelines
- Review for code quality and adherence to standards
- Test functionality thoroughly
- Check for performance implications
- Verify responsive design
- Ensure accessibility compliance

### Documentation Updates
- Update README.md for new features
- Add JSDoc comments for new functions
- Update API documentation
- Create migration guides for breaking changes

This development guide should be updated as the project evolves and new patterns emerge.
