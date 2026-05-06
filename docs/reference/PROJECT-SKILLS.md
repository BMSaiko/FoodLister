# FoodLister - Required Skills & Competencies

This document outlines all technical skills and competencies required for developing and maintaining the FoodLister project.

---

## 1. Core Frontend Skills

### 1.1 Next.js (v15)
- **App Router**: Understanding of file-based routing with `app/` directory
- **Server Components vs Client Components**: Knowing when to use each
- **Server Actions**: Handling form submissions and mutations server-side
- **Dynamic Routes**: Working with `[id]` and catch-all routes
- **Layouts & Templates**: Creating shared UI layouts
- **Metadata API**: SEO optimization with dynamic metadata
- **Image Optimization**: Using `next/image` for performance
- **Streaming & Suspense**: Progressive loading patterns

### 1.2 React (v19)
- **Hooks**: `useState`, `useEffect`, `useContext`, `useMemo`, `useCallback`, `useRef`
- **Custom Hooks**: Creating reusable logic hooks
- **Context API**: Global state management
- **Component Composition**: Building reusable component hierarchies
- **Error Boundaries**: Graceful error handling
- **React Server Components**: Understanding server-side rendering patterns
- **Concurrent Features**: `useTransition`, `useDeferredValue`

### 1.3 TypeScript
- **Type Definitions**: Interfaces, types, generics
- **Type Narrowing**: Type guards and assertions
- **Utility Types**: `Partial`, `Pick`, `Omit`, `Record`
- **Module Augmentation**: Extending third-party types
- **Strict Mode**: Working with `strictNullChecks`, `noImplicitAny`

### 1.4 Tailwind CSS (v4)
- **Utility Classes**: Responsive design with utility-first approach
- **Custom Configuration**: Extending theme, plugins, variants
- **Responsive Design**: Mobile-first breakpoints
- **Dark Mode**: Implementing theme switching
- **Component Variants**: Using `cva` or similar patterns
- **PostCSS Integration**: Configuring with PostCSS

### 1.5 JavaScript (ES2024+)
- **Async/Await**: Promise handling and error catching
- **Destructuring**: Object and array destructuring
- **Modules**: ES modules and CommonJS interoperability
- **Array Methods**: `map`, `filter`, `reduce`, `find`, `some`, `every`
- **Optional Chaining & Nullish Coalescing**: Safe property access

---

## 2. Backend & Database Skills

### 2.1 Supabase
- **Client Setup**: Configuring Supabase client for browser and server
- **SSR Integration**: Using `@supabase/ssr` for server-side rendering
- **Authentication**: Email/password, OAuth, magic links
- **Row Level Security (RLS)**: Creating and managing security policies
- **Real-time Subscriptions**: Listening to database changes
- **Edge Functions**: Serverless function deployment
- **Storage**: File upload and management

### 2.2 PostgreSQL
- **SQL Queries**: SELECT, INSERT, UPDATE, DELETE, JOINs
- **Database Schema Design**: Tables, relationships, constraints
- **Indexes**: Creating and optimizing indexes for performance
- **Triggers & Functions**: Automated database operations
- **Migrations**: Managing schema changes over time
- **JSON/JSONB**: Working with JSON data types
- **Arrays**: PostgreSQL array types and operations
- **Full-Text Search**: Implementing search functionality
- **Views & Materialized Views**: Query optimization

### 2.3 Database Migrations
- **Migration Scripts**: Writing and applying migrations
- **Seed Data**: Populating database with initial data
- **Rollback Strategies**: Reverting failed migrations
- **Data Integrity**: Constraints, foreign keys, cascading deletes

---

## 3. State Management Skills

### 3.1 React State Patterns
- **Local State**: `useState` for component-level state
- **Lifting State Up**: Sharing state between components
- **State Colocation**: Keeping state close to where it's used

### 3.2 Context API
- **Provider Pattern**: Creating and consuming contexts
- **Performance Optimization**: Avoiding unnecessary re-renders
- **Multiple Contexts**: Managing multiple global states

### 3.3 Form State Management
- **React Hook Form**: Form validation, submission, error handling
- **Controlled vs Uncontrolled**: When to use each approach
- **Form Validation**: Client-side validation with custom rules
- **File Upload Forms**: Handling multipart form data

---

## 4. UI/UX Development Skills

### 4.1 Component Development
- **Atomic Design**: Building components from atoms to organisms
- **Props Interface**: Defining clear TypeScript interfaces
- **Component Variants**: Creating flexible, reusable components
- **Accessibility (a11y)**: ARIA attributes, keyboard navigation, screen reader support
- **Responsive Components**: Components that adapt to screen sizes

### 4.2 Animation & Transitions
- **Framer Motion**: Declarative animations and gestures
- **CSS Transitions**: Smooth state changes
- **Page Transitions**: Route change animations
- **Loading States**: Skeleton loaders and spinners
- **Micro-interactions**: Button hover effects, feedback animations

### 4.3 Icon Systems
- **Lucide React**: Using and customizing icons
- **React Icons**: Accessing multiple icon libraries
- **SVG Optimization**: Working with vector graphics

### 4.4 Touch & Mobile UX
- **Touch Targets**: Minimum 44px touch targets
- **Swipe Gestures**: Touch-based interactions
- **Mobile-First Design**: Responsive layouts for mobile

---

## 5. API Development Skills

### 5.1 RESTful API Design
- **Route Handlers**: Next.js API routes (`route.ts`)
- **HTTP Methods**: GET, POST, PUT, PATCH, DELETE
- **Request/Response**: Parsing and formatting data
- **Error Handling**: Proper HTTP status codes and error messages
- **Input Validation**: Validating request bodies and parameters

### 5.2 Rate Limiting
- **Middleware Implementation**: Creating rate limiting middleware
- **Token Bucket Algorithm**: Implementing rate limiting logic
- **IP-based Limiting**: Limiting by client IP address

### 5.3 External API Integration
- **Google Maps API**: URL parsing and location extraction
- **Cloudinary API**: Image upload, transformation, management
- **Fetch API**: Making HTTP requests
- **Error Handling**: Network errors, timeouts, retries

---

## 6. Authentication & Security Skills

### 6.1 Authentication
- **Supabase Auth**: Email/password, OAuth providers
- **Session Management**: Handling user sessions
- **Protected Routes**: Route guards and middleware
- **Token Management**: JWT handling and refresh tokens
- **Password Validation**: Strength requirements and hashing

### 6.2 Authorization
- **Row Level Security**: Database-level access control
- **Role-based Access**: Different permissions for different roles
- **Ownership Verification**: Users can only modify their own data

### 6.3 Security Best Practices
- **XSS Prevention**: Sanitizing user input
- **CSRF Protection**: Cross-site request forgery prevention
- **CORS Configuration**: Proper cross-origin resource sharing
- **Environment Variables**: Secure secret management
- **HTTPS Enforcement**: Secure communication

---

## 7. Testing Skills

### 7.1 Unit Testing
- **Jest**: Test framework configuration and execution
- **React Testing Library**: Component testing
- **Mocking**: Functions, modules, and API calls
- **Test Coverage**: Measuring and improving coverage

### 7.2 Integration Testing
- **API Testing**: Testing API endpoints
- **Database Testing**: Testing database operations
- **Hook Testing**: Testing custom hooks

### 7.3 Test Organization
- **Test Structure**: Arrange-Act-Assert pattern
- **Test Data**: Creating and managing test fixtures
- **Snapshot Testing**: Component snapshot testing

---

## 8. Performance Optimization Skills

### 8.1 Frontend Performance
- **Code Splitting**: Dynamic imports and lazy loading
- **Bundle Analysis**: Analyzing and reducing bundle size
- **Image Optimization**: Next.js image optimization
- **Memoization**: `React.memo`, `useMemo`, `useCallback`
- **Virtual Scrolling**: Rendering large lists efficiently

### 8.2 Database Performance
- **Query Optimization**: Writing efficient queries
- **Indexing Strategies**: Creating appropriate indexes
- **Connection Pooling**: Managing database connections
- **Caching**: Query result caching

### 8.3 Network Performance
- **CDN Usage**: Content delivery network optimization
- **Caching Headers**: HTTP caching strategies
- **Compression**: Gzip/Brotli compression

---

## 9. DevOps & Deployment Skills

### 9.1 Version Control
- **Git**: Branching, merging, rebasing
- **GitHub**: Pull requests, code reviews, actions
- **Git Flow**: Feature branch workflow

### 9.2 CI/CD
- **GitHub Actions**: Automated testing and deployment
- **Vercel Deployment**: Next.js deployment platform
- **Environment Management**: Development, staging, production

### 9.3 Monitoring & Logging
- **Error Tracking**: Client and server error monitoring
- **Performance Monitoring**: Core Web Vitals tracking
- **Database Monitoring**: Query performance tracking
- **Logging**: Structured logging with levels

---

## 10. Utility & Helper Skills

### 10.1 Data Formatting
- **Date Formatting**: Localized date display
- **Number Formatting**: Currency, percentages
- **String Manipulation**: Truncation, sanitization
- **URL Handling**: URL validation and parsing

### 10.2 Search & Filtering
- **Full-Text Search**: Database search implementation
- **Client-side Filtering**: Array filtering and sorting
- **Advanced Filters**: Multi-criteria filtering
- **Debouncing**: Search input optimization

### 10.3 File Handling
- **Image Upload**: Drag-and-drop, file selection
- **File Validation**: Type, size, dimension validation
- **Cloudinary Integration**: Cloud image management

### 10.4 Phone Number Handling
- **libphonenumber-js**: Phone number validation and formatting
- **React Phone Number Input**: Phone input component

---

## 11. Charting & Analytics Skills

### 11.1 Data Visualization
- **Recharts**: Creating charts and graphs
- **Data Transformation**: Preparing data for visualization
- **Responsive Charts**: Charts that adapt to container size

### 11.2 Analytics
- **User Tracking**: Page views, events, conversions
- **Performance Metrics**: Loading times, interaction metrics
- **Custom Dashboards**: Building analytics dashboards

---

## 12. Code Quality & Best Practices

### 12.1 Linting & Formatting
- **ESLint**: Configuring and fixing linting errors
- **TypeScript Rules**: Strict type checking
- **React Rules**: React-specific linting rules
- **Code Formatting**: Consistent code style

### 12.2 Code Organization
- **Folder Structure**: Logical file organization
- **Import Organization**: Grouping and sorting imports
- **Barrel Exports**: Using `index.ts` for clean exports
- **Naming Conventions**: Consistent naming patterns

### 12.3 Documentation
- **Code Comments**: Meaningful inline comments
- **README Files**: Project documentation
- **API Documentation**: Endpoint documentation
- **Architecture Documentation**: System design documentation

---

## 13. Soft Skills

### 13.1 Problem Solving
- **Debugging**: Systematic issue investigation
- **Root Cause Analysis**: Finding underlying problems
- **Solution Design**: Evaluating multiple approaches

### 13.2 Communication
- **Code Reviews**: Providing constructive feedback
- **Documentation Writing**: Clear technical documentation
- **Issue Reporting**: Detailed bug reports

### 13.3 Time Management
- **Task Estimation**: Accurate time estimates
- **Prioritization**: Focusing on high-impact work
- **Progress Tracking**: Monitoring task completion

---

## Skill Level Requirements

| Skill Category | Junior | Mid-Level | Senior |
|---------------|--------|-----------|--------|
| Next.js | Basic routing | SSR/SSG, API routes | Advanced patterns, optimization |
| React | Components, hooks | State management, context | Performance, architecture |
| TypeScript | Basic types | Interfaces, generics | Advanced types, utilities |
| Tailwind CSS | Utility classes | Responsive design | Custom configuration |
| Supabase | Basic queries | Auth, RLS | Edge functions, real-time |
| PostgreSQL | Basic SQL | Joins, indexes | Optimization, migrations |
| Testing | Writing tests | Test coverage | Test architecture |
| Performance | Basic optimization | Bundle analysis | Full-stack optimization |

---

## Learning Resources

### Official Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs)

### Recommended Courses
- Next.js App Router course
- React patterns and best practices
- TypeScript advanced types
- Supabase authentication and RLS
- PostgreSQL performance tuning

---

*Last updated: 2026-04-05*