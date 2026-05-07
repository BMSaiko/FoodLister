# FoodLister

A Next.js application for discovering, organizing, and sharing restaurant lists. Built with Supabase for authentication and database management, featuring advanced filtering, collaborative lists, and comprehensive user profiles.

## Features

### ✅ Implemented
- **Restaurant Discovery**: Search and filter restaurants by cuisine, features, dietary options, price range, rating, and location
- **List Management**: Create, edit, and share curated restaurant lists with privacy controls
- **User Profiles**: View own and others' profiles with stats, reviews, restaurants, and lists
- **Advanced Filtering**: Tabbed filter interface with multi-select options and real-time results
- **Menu System**: Restaurant menus with links and images, carousel display
- **Image Upload**: Cloudinary integration for restaurant and list images
- **Authentication**: Secure Supabase authentication with session management
- **Responsive Design**: Mobile-first UI with TailwindCSS 3 and touch-optimized components
- **Monitoring & Analytics**: API, database, and performance monitoring with logging
- **Export Features**: Export lists as JSON, CSV, or ICS calendar format
- **Restaurant Roulette**: Random restaurant picker for indecisive diners
- **Duplicate Lists**: Quickly create copies of existing lists

### 🚧 In Progress
- **Collaborative Lists**: Invite collaborators with editor/viewer roles (UI implemented, backend pending)
- **List Comments**: Add comments to lists for discussion (UI implemented, real-time pending)
- **Real-time Updates**: Live updates for collaborative features

### 📋 Planned
- **List Tags & Categories**: Organize lists with custom tags
- **List Cover Images**: Custom cover images for lists
- **Smart Suggestions**: AI-powered restaurant suggestions
- **Mobile App**: React Native mobile application

## Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 18
- **Language**: TypeScript 5
- **Styling**: TailwindCSS 3 with CSS variables (design system)
- **Icons**: Lucide React
- **Forms**: React Hook Form (via custom useForm hook)
- **Charts**: Recharts (for list statistics)
- **Notifications**: React Toastify
- **Testing**: Jest, React Testing Library

### Backend & Database
- **Database**: Supabase (PostgreSQL 15+)
- **Authentication**: Supabase Auth
- **API**: Next.js API Routes (Route Handlers)
- **ORM/Client**: Supabase JavaScript Client
- **Migrations**: SQL-based migrations in `supabase/migrations/`
- **Row Level Security**: Comprehensive RLS policies

### DevOps & Tools
- **CI/CD**: GitHub Actions
- **Deployment**: Vercel (recommended), Netlify, Railway, or Docker
- **Monitoring**: Custom API/DB monitors, error logging
- **Code Quality**: ESLint, Prettier, TypeScript Strict Mode

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- Cloudinary account (for image uploads)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/BMSaiko/FoodLister.git
   cd foodlister
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.local.example .env.local
   ```
   Edit `.env.local` with your credentials:
   ```env
   # Supabase (Required)
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   
   # NextAuth (Optional)
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secure-secret
   
   # Cloudinary (Required for image uploads)
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

4. **Set up database**:
   - Go to your Supabase Dashboard → SQL Editor
   - Run all migrations in order from `supabase/migrations/` directory
   - Or use Supabase CLI: `npx supabase migration up`

5. **Seed initial data** (optional):
   - Run the seed scripts in `supabase/` directory for cuisine types, dietary options, and features

6. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the app.

## Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm test` - Run test suite (Jest)
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run analyze` - Analyze bundle size (requires @next/bundle-analyzer)

## Project Structure

```
foodlister/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes (20+ endpoints)
│   │   ├── auth/                 # Auth session endpoint
│   │   ├── cuisine-types/         # Cuisine types endpoint
│   │   ├── dietary-options/      # Dietary options endpoint
│   │   ├── features/             # Restaurant features endpoint
│   │   ├── health/               # Health check endpoint
│   │   ├── lists/                # Lists CRUD endpoints
│   │   ├── restaurants/          # Restaurants CRUD endpoints
│   │   ├── reviews/              # Reviews CRUD endpoints
│   │   └── users/                # User profile endpoints
│   ├── auth/                     # Auth pages (login, signup, etc.)
│   ├── lists/                    # List pages (create, edit, detail)
│   ├── meals/                    # Meal scheduling pages
│   ├── notifications/            # Notifications page
│   ├── restaurants/              # Restaurant pages (create, edit, detail)
│   └── users/                    # User profile pages
├── components/                   # React components
│   ├── layouts/                  # Layout components (Navbar, etc.)
│   ├── lists/                    # List-specific components
│   ├── pages/                    # Page-level components
│   ├── restaurant/               # Restaurant-specific components
│   └── ui/                      # Reusable UI components
│       ├── Filters/              # FilterPanel and related components
│       └── profile/             # Profile-specific UI components
├── contexts/                     # React contexts
│   ├── AuthContext.tsx           # Authentication context
│   ├── FiltersContext.tsx        # Filters state context
│   └── ModalContext.tsx          # Modal management context
├── hooks/                        # Custom React hooks
│   ├── auth/                     # Auth hooks (useSession, useAuthActions)
│   ├── data/                     # Data fetching hooks (useRestaurants, useLists)
│   ├── forms/                    # Form hooks (useForm, useRestaurantForm)
│   ├── lists/                    # List-related hooks
│   ├── navigation/               # Navigation hooks
│   ├── ui/                       # UI hooks (useImagePreview, useInfiniteScroll)
│   └── utilities/                # Utility hooks (useLocalStorage, useDebounce)
├── libs/                         # External integrations
│   ├── api.ts                    # API endpoint definitions and types
│   ├── apiClient.ts              # Centralized API client
│   ├── auth.ts                   # Auth utilities
│   └── supabase/                # Supabase client setup (browser/server)
├── middleware/                    # Next.js middleware
│   └── rateLimiter.ts           # API rate limiting
├── utils/                        # Utility functions
│   ├── apiMonitor.ts             # API performance monitoring
│   ├── dbMonitor.ts              # Database performance monitoring
│   ├── logger.ts                 # General logging utility
│   ├── cloudinaryConverter.ts     # Cloudinary image management
│   ├── listExport.ts             # List export (JSON, CSV, ICS)
│   ├── search.ts                 # Search and filter utilities
│   ├── filters.ts                # Filter logic
│   └── formatters.ts            # Data formatting utilities
├── types/                        # TypeScript type definitions
│   └── database.ts              # Supabase database types
├── __tests__/                    # Test files
│   ├── api/                      # API route tests
│   ├── components/               # Component tests
│   └── hooks/                   # Custom hook tests
├── supabase/                     # Supabase files
│   └── migrations/              # SQL migration files (000-029+)
├── memory-bank/                  # Project memory (for AI context)
│   ├── activeContext.md          # Current session context
│   ├── projectbrief.md          # Project overview
│   └── progress.md              # Progress tracking
├── docs/                         # Project documentation
│   ├── api/                      # API documentation
│   ├── architecture/              # Architecture overview
│   ├── database/                 # Database schema docs
│   ├── features/                 # Feature documentation
│   ├── guides/                   # How-to guides
│   ├── progress/                  # Progress tracking
│   ├── reference/                # Technical references
│   ├── setup/                    # Setup instructions
│   └── tasks/                    # Task lists
├── public/                        # Static assets
│   ├── logo.svg                  # FoodLister logo
│   └── workers/                 # Web workers (if any)
└── node_modules/                  # Dependencies
```

## Database Schema

Key tables (see `docs/database/database-schema.md` for full schema):

- **restaurants** - Restaurant entries with menu_links[], menu_images[], phone_numbers[]
- **cuisine_types** - Cuisine categories (Italian, Chinese, etc.)
- **restaurant_cuisine_types** - Junction table (many-to-many)
- **dietary_options** - Dietary options (Vegetarian, Vegan, etc.)
- **restaurant_dietary_options_junction** - Junction table (many-to-many)
- **restaurant_features** - Features (Outdoor Seating, WiFi, etc.)
- **restaurant_restaurant_features** - Junction table (many-to-many)
- **lists** - Curated restaurant lists with is_public, filters JSONB, tags[], cover_image_url
- **list_restaurants** - Junction table with position for ordering
- **reviews** - Restaurant reviews (rating 0.5-5.0, comment, amount_spent)
- **user_stats** - User statistics (restaurants_visited, lists_created, reviews_written)
- **notifications** - User notifications
- **scheduled_meals** - Meal scheduling with participants[]

All tables have Row Level Security (RLS) enabled with appropriate policies.

## API Endpoints

### Core Endpoints (see `docs/api/api-endpoints-reference.md` for full list)

#### Authentication
- `GET /api/auth/session` - Get current session

#### Restaurants
- `GET /api/restaurants` - List with filters and pagination
- `GET /api/restaurants/[id]` - Get single restaurant
- `POST /api/restaurants` - Create restaurant (authenticated)
- `PUT /api/restaurants/[id]` - Update restaurant (owner only)
- `DELETE /api/restaurants/[id]` - Delete restaurant (owner only)
- `POST /api/restaurants/[id]/visits` - Record visit
- `GET /api/restaurants/[id]/rating` - Get rating info

#### Lists
- `GET /api/lists` - List with filters and pagination
- `GET /api/lists/[id]` - Get single list with restaurants
- `POST /api/lists` - Create list (authenticated)
- `PUT /api/lists/[id]` - Update list (owner only)
- `DELETE /api/lists/[id]` - Delete list (owner only)
- `POST /api/lists/[id]/restaurants` - Add restaurant to list
- `DELETE /api/lists/[id]/restaurants/[id]` - Remove restaurant from list
- `POST /api/lists/[id]/share` - Share list (Web Share API + clipboard)
- `POST /api/lists/[id]/duplicate` - Duplicate list

#### Reviews
- `GET /api/reviews` - List reviews with filters
- `GET /api/reviews/[id]` - Get single review
- `POST /api/reviews` - Create review (authenticated)
- `PUT /api/reviews/[id]` - Update review (owner only)
- `DELETE /api/reviews/[id]` - Delete review (owner only)

#### Users
- `GET /api/users/[id]` - Get user profile
- `GET /api/users/me` - Get current user profile
- `GET /api/users/me/stats` - Get current user stats
- `GET /api/users/[id]/reviews` - Get user's reviews
- `GET /api/users/[id]/restaurants` - Get user's restaurants
- `GET /api/users/[id]/lists` - Get user's lists

#### Reference Data
- `GET /api/cuisine-types` - List all cuisine types
- `GET /api/dietary-options` - List all dietary options
- `GET /api/features` - List all restaurant features

#### System
- `GET /api/health` - Health check endpoint

## Contributing

### Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Project-Specific Guidelines
- Read `.clinerules/` directory for project-specific rules
- Update `memory-bank/` files when making significant changes
- Use the `/docs` command to update all documentation before major PRs
- Follow the coding standards in `docs/guides/development-guide.md`
- Run `npm run lint` and `npm test` before committing

## Documentation

Comprehensive documentation is available in the `docs/` directory:

- **API Docs**: `docs/api/` - Endpoint references and documentation
- **Architecture**: `docs/architecture/` - System design and patterns
- **Database**: `docs/database/` - Schema and migration docs
- **Features**: `docs/features/` - Feature documentation and roadmaps
- **Guides**: `docs/guides/` - How-to guides (development, deployment, etc.)
- **Progress**: `docs/progress/` - Progress tracking and session reports
- **Reference**: `docs/reference/` - Technical references and templates

To update all documentation to reflect current codebase state, use the `/docs` command (requires Cline AI assistant).

## Progress

- **Overall Completion**: ~85%
- **Core Features**: 100% (CRUD, auth, filtering)
- **User System**: 100% (profiles, stats, reviews)
- **List Management**: 95% (core done, collaboration pending)
- **UI/UX**: 90% (responsive, accessible)
- **Testing**: 40% (partial coverage)
- **Documentation**: 95% (just updated)

See `docs/progress/progress-tracker.md` for detailed progress tracking.

## License

This project is private and proprietary. All rights reserved.

---

*Last updated: 2026-05-07 17:36*