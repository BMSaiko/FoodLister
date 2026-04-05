# Cline - Project Context & Skills Configuration

This file tells Cline (AI coding assistant) about the project's tech stack, conventions, and best practices.

---

## Project Overview

**FoodList** - A restaurant and food listing web application built with Next.js 15, React 19, TypeScript, and Supabase.

---

## Tech Stack (Always Use These)

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Library**: React 19
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **Icons**: Lucide React + React Icons
- **Forms**: React Hook Form
- **Phone Input**: react-phone-number-input + libphonenumber-js
- **File Upload**: react-dropzone
- **Notifications**: react-toastify
- **Charts**: Recharts

### Backend & Database
- **BaaS**: Supabase (@supabase/ssr, @supabase/supabase-js)
- **Database**: PostgreSQL
- **Image Storage**: Cloudinary (@cloudinary/url-gen, cloudinary)

### Testing & Quality
- **Framework**: Jest + ts-jest
- **Library**: @testing-library/react
- **Linting**: ESLint + @typescript-eslint

---

## Coding Conventions

### File Organization
```
app/          - Next.js App Router pages and API routes
components/   - Reusable React components
contexts/     - React Context providers
hooks/        - Custom React hooks
libs/         - Utility libraries and API clients
utils/        - Helper functions
supabase/     - Database migrations and SQL files
__tests__/    - Test files
```

### TypeScript Rules
- Always use strict mode
- Define interfaces for props, API responses, and database types
- Use utility types: `Partial`, `Pick`, `Omit`, `Record`
- Avoid `any` - use `unknown` when type is uncertain

### React Patterns
- Prefer Server Components by default, use `'use client'` only when needed
- Use custom hooks for reusable logic
- Context API for global state (Auth, Filters, Modal)
- React Hook Form for all forms

### Styling
- Use Tailwind CSS utility classes exclusively
- Extend theme in `tailwind.config.js` if needed
- Mobile-first responsive design

### Database
- All SQL queries should be in `supabase/` directory
- Use Row Level Security (RLS) policies
- Write migrations for schema changes
- Prefer parameterized queries to prevent SQL injection

### API
- Use Next.js API routes (`app/api/*/route.ts`)
- Implement rate limiting for public endpoints
- Return consistent JSON responses with error handling
- Validate all input data

---

## Common Tasks

### Adding a New Feature
1. Create components in `components/` with proper TypeScript interfaces
2. Add hooks in `hooks/` for reusable logic
3. Create API routes in `app/api/` if needed
4. Add database migrations in `supabase/migrations/`
5. Write tests in `__tests__/`
6. Update documentation in `docs/`

### Database Changes
1. Create migration file in `supabase/migrations/`
2. Add RLS policies for new tables
3. Update TypeScript types in `types/database.ts`
4. Test with Supabase CLI or manually

### Adding Tests
- Place tests next to source files or in `__tests__/`
- Use React Testing Library for components
- Mock Supabase calls in unit tests
- Run `npm test` to execute tests

---

## Scripts

```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
npm test             # Run Jest tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage
```

---

## Important Notes

- Always check `docs/PROJECT-SKILLS.md` for detailed skill requirements
- Follow the architecture described in `docs/architecture-overview.md`
- Use the existing API client in `libs/apiClient.ts` for Supabase calls
- Authentication is handled via `contexts/AuthContext.tsx`
- Database schema is defined in `supabase/database.sql`

---

*Generated: 2026-04-05*