# FoodLister - Technical Context

## Technology Stack

### Frontend Framework
- **Next.js 15.3.1** (App Router)
  - React 18.3.1 / React DOM 18.3.1
  - Server Components (default) and Client Components
  - Turbopack for development bundling
  - Image optimization with `next/image`
  - Force dynamic rendering for runtime environment variables

### Programming Language
- **TypeScript 5.8.2**
  - Strict mode enabled
  - Target: ES2020
  - Module: esnext with bundler resolution
  - Path aliases: `@/*` maps to `./*`

### Styling & UI
- **TailwindCSS 3.4.17** ✅ (Downgraded from v4 - see design system standardization)
  - PostCSS integration (`@tailwindcss/postcss`)
  - Dark mode support (class strategy via `next-themes`)
  - Custom theme extensions in `tailwind.config.js`
- **Headless UI**: Unstyled accessible components
- **Framer Motion 12.9.2**: Animations and transitions
- **Lucide React 0.487.0**: Icon library
- **React Hook Form 7.56.4**: Form state management and validation

### Backend & Database
- **Supabase**
  - `@supabase/ssr 0.6.1`: Server-side rendering support
  - `supabase-js 2.49.4`: Client library
  - **PostgreSQL**: Relational database with 15+ tables
  - **Auth**: JWT-based authentication with `auth.users` integration
  - **Realtime**: Postgres changes subscriptions
  - **Storage**: Not directly used (images via Cloudinary)
  - **Row Level Security (RLS)**: Database-level authorization

### External Services
- **Cloudinary**: Image upload and hosting
  - `cloudinary 2.6.1` (server-side SDK)
  - Client-side uploads via signed presets
- **Google Maps**: URL parsing for restaurant location data (no API key required)

### Utilities & Libraries
- **Data Fetching**: Native `fetch` API, Supabase client
- **Form Handling**: React Hook Form with resolver support
- **Phone Input**: `react-phone-number-input 3.4.12`
- **File Upload**: `react-dropzone 14.3.8`
- **Notifications**: `react-toastify 11.0.5`
- **Charts**: `recharts 2.15.3` (for performance dashboard)
- **Date Handling**: Native Date object, ICS generation for meal scheduling
- **Scroll Lock**: `body-scroll-lock 4.0.0-beta.2`

### Testing Stack
- **Jest 30.0.2**: Test runner
  - `ts-jest 29.3.2`: TypeScript support
  - `jest-environment-jsdom 30.0.2`: Browser-like test environment
- **React Testing Library**: `@testing-library/react 16.3.0`, `@testing-library/jest-dom 6.8.2`
- **Setup**: `jest.setup.ts` with global matchers
- **Configuration**: `jest.config.js` with module name mapper for `@/*` aliases

### Development Tools
- **ESLint 9.39.2**
  - `eslint-config-next 15.3.1`: Next.js rules
  - `@eslint/eslintrc 3.3.1`: Legacy config support
  - `eslint-plugin-react-hooks 5.2.3`: Hooks rules
- **PostCSS**: Autoprefixer + TailwindCSS plugin
- **Node.js**: v18+ required
- **Package Manager**: npm (package-lock.json)

## Development Environment Setup

### Prerequisites
- Node.js 18 or higher
- npm or yarn
- Supabase account (for backend services)
- Cloudinary account (for image uploads)

### Environment Variables (`.env.local`)
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### Installation & Running
```bash
# Install dependencies
npm install

# Run development server (with Turbopack)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test
npm run test:watch
npm run test:coverage

# Linting
npm run lint
npm run lint:fix
```

### IDE Configuration
- **jsconfig.json**: Path aliases for IntelliSense
- **TypeScript**: Strict mode with incremental compilation
- **ESLint**: Integrated with Next.js and React Hooks rules

## Technical Constraints

### Database Constraints
- **Row Level Security (RLS)**: All user data tables have RLS enabled
- **Foreign Key Relationships**: `profiles` linked to `auth.users`, cascade deletes
- **Array Fields**: `menu_links` (max 5), `menu_images` (max 10), `phone_numbers`
- **Check Constraints**: Rating ranges, positive amounts, valid URLs

### API Constraints
- **Rate Limiting** (`middleware/rateLimiter.ts`):
  - API routes: 100 requests per 15 minutes per IP
  - Auth routes: 10 requests per 15 minutes per IP
  - In-memory storage with TTL-based cleanup (60-second intervals)
- **Request Size**: Next.js default limits (1MB for API routes)
- **Authentication**: All mutations require valid JWT token

### Frontend Constraints
- **Browser Support**: Modern browsers (ES2020+)
- **Mobile-First**: Minimum touch targets 44px
- **Image Optimization**: Remote patterns configured for allowed image hosts (Unsplash, Imgur, Cloudinary, etc.)
- **Bundle Size**: Code splitting via Next.js App Router

### External Service Limits
- **Cloudinary**: Free tier limits (10GB storage, 25GB bandwidth/month)
- **Supabase**: Free tier limits (500MB database, 1GB bandwidth/month)
- **Google Maps**: No API key needed (URL parsing only)

## Dependencies (Key Packages)

### Production Dependencies
```json
{
  "next": "15.3.1",
  "react": "18.3.1",
  "react-dom": "18.3.1",
  "typescript": "5.8.2",
  "@supabase/ssr": "^0.6.1",
  "@supabase/supabase-js": "^2.49.4",
  "tailwindcss": "^3.4.17",
  "@tailwindcss/postcss": "^4.1.4",
  "framer-motion": "^12.9.2",
  "lucide-react": "^0.487.0",
  "react-hook-form": "^7.56.4",
  "cloudinary": "^2.6.1",
  "react-phone-number-input": "^3.4.12",
  "react-dropzone": "^14.3.8",
  "react-toastify": "^11.0.5",
  "recharts": "^2.15.3",
  "next-themes": "^0.4.6"
}
```

### Development Dependencies
```json
{
  "jest": "^30.0.2",
  "ts-jest": "^29.3.2",
  "@testing-library/react": "^16.3.0",
  "@testing-library/jest-dom": "^6.8.2",
  "eslint": "^9.39.2",
  "eslint-config-next": "^15.3.1",
  "@eslint/eslintrc": "^3.3.1",
  "eslint-plugin-react-hooks": "^5.2.3",
  "jest-environment-jsdom": "^30.0.2"
}
```

## Build & Deployment

### Build Process
- **Turbopack**: Fast development bundler (enabled by default in `npm run dev`)
- **Production Build**: `next build` with static generation and server-side rendering
- **Type Checking**: TypeScript compilation during build

### Deployment Target
- **Platform**: Vercel (recommended)
  - Automatic deployments from GitHub
  - Environment variables configured in dashboard
  - Edge network for global CDN
- **Alternative**: Any Node.js hosting (Vercel, Netlify, AWS, etc.)

### CI/CD Pipeline
- **GitHub Actions**: Configured in `.github/` directory
- **Scripts**: `scripts/setup-github-secrets.js` for secret configuration
- **Workflow**: Git push → Build (Vercel) → Deploy (Vercel)

## Configuration Files

### `tsconfig.json`
- Target: ES2020, module: esnext, moduleResolution: bundler
- Strict mode, noEmit, incremental
- Path alias: `@/*` → `./*`
- Types: jest, node
- Excludes: node_modules, jest.setup.ts, __tests__, snippets, instructions, scripts

### `next.config.mjs`
- Image remote patterns for external image hosts
- React strict mode enabled
- No additional webpack configuration (Turbopack handles most cases)

### `tailwind.config.js`
- Content paths: `./app/**/*.{js,ts,jsx,tsx}` and `./components/**/*.{js,ts,jsx,tsx}`
- Dark mode: class strategy
- Theme extensions: Custom colors, fonts, animations

### `eslint.config.mjs`
- Next.js core web vitals preset
- TypeScript parser with project reference
- React Hooks plugin enabled
- Ignores: `supabase/migrations/`, `scripts/`, `__tests__/`

## Documentation Structure

### Memory Bank (`memory-bank/`)
- **Purpose**: Project context, progress tracking, and technical decisions
- **Files** (6 total):
  - `projectbrief.md` - Project overview and objectives
  - `productContext.md` - Product context and user needs
  - `activeContext.md` - Current session state and recent changes
  - `systemPatterns.md` - Architecture and design patterns
  - `techContext.md` - Technology stack and environment (this file)
  - `progress.md` - Progress tracking and milestones

### Documentation (`docs/`)
- **Purpose**: User guides, API docs, and technical documentation
- **Subdirectories** (9 total):
  - `api/` - API documentation and endpoint references
  - `architecture/` - System architecture and design documents
  - `database/` - Database schema and references
  - `features/` - Feature roadmaps and implementation guides
  - `guides/` - Development, deployment, and user guides
  - `progress/` - Progress tracking and session reports
  - `reference/` - Skills, templates, and references
  - `setup/` - Setup and configuration guides
  - `tasks/` - Task tracking and planning documents

### Documentation Tools
- **Markdown**: All documentation in Markdown format
- **Diagrams**: ASCII art and code blocks for architecture visualization
- **Cross-references**: Links between related documentation files

## Performance Considerations

### Frontend
- **Code Splitting**: Automatic via Next.js App Router
- **Image Optimization**: `next/image` with lazy loading and WebP/AVIF conversion
- **Debouncing**: Search queries debounced (300ms) via `useDebounce` hook
- **Web Worker**: Background search operations (`public/workers/search-worker.js`)
- **Memoization**: React.memo for expensive components (where needed)

### Backend
- **Database Indexes**: On frequently queried columns (restaurant names, user IDs)
- **Connection Pooling**: Handled by Supabase
- **Query Optimization**: Selective column fetching, proper joins
- **Rate Limiting**: Prevents abuse and ensures availability

### Monitoring
- **Performance Dashboard**: Real-time metrics (FPS, memory usage, filter time)
- **Auth Logger**: Tracks authentication events (last 100 events)
- **API Monitor**: Tracks API request performance
- **DB Monitor**: Tracks database query performance

## Security Configuration

### Authentication
- **Supabase Auth**: JWT tokens with 1-hour expiry
- **Session Management**: Server-side session validation
- **Password Validation**: Client-side and server-side checks (`utils/passwordValidation.js`)

### Authorization
- **Row Level Security**: Database-level policies check `auth.uid()`
- **API Authentication**: All mutation endpoints validate JWT
- **Service Role**: Server-side only, never exposed to client

### Input Validation
- **Client-Side**: React Hook Form validation with resolvers
- **Server-Side**: API route validation for all inputs
- **Database**: Constraints, check constraints, foreign key validation

### Rate Limiting
- **In-Memory Limiter**: `middleware/rateLimiter.ts`
- **TTL Cleanup**: Automatic cleanup every 60 seconds
- **Configurable**: Factory function for custom limiters

## Design System Standardization (Completed ✅)

### Issue Resolved
- **Problem**: Tailwind CSS v4 syntax was being used with v3 installation
- **Solution**: Downgraded to Tailwind CSS v3.4.17 and fixed all CSS syntax
- **CSS Variables**: Added all necessary CSS variables to `app/globals.css`
- **Build Status**: ✅ `npm run build` succeeds

### Files Fixed
- `postcss.config.mjs` - Updated to use v3 plugin
- `app/globals.css` - Rewrote with valid v3 syntax and CSS variables
- `tailwind.config.js` - Standardized border radius values
- 45+ components - Fixed hardcoded colors to use CSS variables
- 36+ files - Fixed remaining ~256 hardcoded color instances

### CSS Variables Added
- `--primary`, `--primary-light`, `--primary-dark`
- `--gray-50` through `--gray-900`
- `--amber-50` through `--amber-900`
- `--error-50`, `--error-100`, `--error-500`, etc.
- `--warning`, `--warning-light`
- `--white`, `--black`
- `--blue-500` (for Google Maps button)