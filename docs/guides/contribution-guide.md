# FoodLister Contribution Guide

## Introduction

Thank you for your interest in contributing to FoodLister! This guide will help you get started with the development process and understand the project's coding standards.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Coding Standards](#coding-standards)
5. [Commit Messages](#commit-messages)
6. [Pull Request Process](#pull-request-process)
7. [Testing](#testing)
8. [Documentation](#documentation)

---

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

---

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn
- Git
- A Supabase account (for backend services)

### Initial Setup

1. **Fork the repository**
   ```bash
   # Click the "Fork" button on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/FoodLister.git
   cd FoodLister
   ```

2. **Add the upstream repository**
   ```bash
   git remote add upstream https://github.com/BMSaiko/FoodLister.git
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Edit `.env.local` and fill in your Supabase credentials:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (for admin operations)

5. **Run the development server**
   ```bash
   npm run dev
   ```
   
   The app will be available at `http://localhost:3000`

6. **Set up the database**
   - Go to your Supabase project dashboard
   - Run the migrations in `supabase/migrations/` in order
   - Or use the Supabase CLI if configured

---

## Development Workflow

### 1. Create a new branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### 2. Make your changes

Follow the coding standards outlined below.

### 3. Keep your branch updated

```bash
git fetch upstream
git rebase upstream/main
```

### 4. Test your changes

```bash
npm test
npm run lint
npm run build
```

### 5. Submit a Pull Request

Push your branch and create a PR on GitHub.

---

## Coding Standards

### TypeScript

- Use **TypeScript** for all new code
- **Avoid `any` type** - use proper type definitions
- Generate Supabase types: `supabase gen types typescript --local > types/supabase.ts`
- Use types from `types/database.ts` and `types/api.ts`

**Example:**
```typescript
// Good
interface RestaurantData {
  id: string;
  name: string;
  rating?: number;
}

// Avoid
const data: any = response.json();
```

### Component Patterns

FoodLister uses **Next.js 15 App Router** with the following patterns:

#### Server Components (Default)
```typescript
// app/page.tsx - Server Component by default
export default async function Page() {
  const data = await fetchData();
  return <div>{data.name}</div>;
}
```

#### Client Components
Only add `'use client'` when you need:
- Event listeners (`onClick`, `onChange`, etc.)
- Hooks (`useState`, `useEffect`, `useRouter`, etc.)
- Browser APIs

```typescript
'use client';

import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

### Styling

We use **TailwindCSS 3** with **CSS variables** for theming:

```typescript
// Good - Use CSS variables
<div className="bg-[var(--primary)] text-[var(--foreground)]">
  Content
</div>

// Avoid - Hardcoded colors
<div className="bg-blue-500 text-gray-900">
  Content
</div>
```

**Design System Colors:**
- Primary: `var(--primary)`, `var(--primary-hover)`, `var(--primary-foreground)`
- Foreground: `var(--foreground)`, `var(--foreground-muted)`, `var(--foreground-secondary)`
- Background: `var(--background)`
- Error: `var(--error-50)`, `var(--error-100)`, `var(--error-500)`
- Success: `var(--green-500)`
- Warning: `var(--warning)`, `var(--warning-light)`

See `app/globals.css` for the complete list of CSS variables.

### State Management

- **Context API** for global state:
  - `contexts/AuthContext.tsx` - Authentication state
  - `contexts/FiltersContext.tsx` - Restaurant filters
  - `contexts/ModalContext.tsx` - Modal state

- **Custom Hooks** for reusable logic:
  - `hooks/data/` - Data fetching hooks
  - `hooks/forms/` - Form handling hooks
  - `hooks/ui/` - UI-related hooks

### File Structure

```
components/
├── ui/              # Reusable UI components
│   ├── common/      # Shared components (EmptyState, ErrorBoundary, etc.)
│   ├── RestaurantCard.tsx
│   └── ...
├── layouts/         # Layout components
├── pages/           # Page-specific components
└── lists/           # List-related components

hooks/
├── index.ts          # Hook exports
├── auth/             # Authentication hooks
├── data/             # Data fetching hooks
└── ui/               # UI-related hooks

libs/
├── api.ts            # API utilities and types
├── auth.ts           # Authentication utilities
└── supabase/         # Supabase client configurations
```

---

## Commit Messages

We follow **Conventional Commits**:

### Format
```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Formatting, missing semicolons, etc.
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Build process, dependencies, config files
- `perf`: Performance improvements
- `migrate`: Database migrations

### Scopes
- `api` - API routes
- `auth` - Authentication
- `restaurants` - Restaurant features
- `lists` - List features
- `reviews` - Review features
- `ui` - UI components
- `docs` - Documentation
- `db` - Database
- `config` - Configuration
- `tests` - Tests

### Examples
```bash
feat(lists): add collaboration feature with role-based access

fix(api): resolve 404 error in lists/[id] route

docs(guides): update contribution guide

migrate(db): add user_stats table and triggers

chore(deps): update supabase-js to 2.49.4
```

---

## Pull Request Process

### 1. Update your branch
```bash
git fetch upstream
git rebase upstream/main
```

### 2. Run checks locally
```bash
npm run lint        # ESLint checks
npm test             # Run tests
npm run build       # Production build
```

### 3. Push your changes
```bash
git push origin feature/your-feature
```

### 4. Create Pull Request

- Use a clear, descriptive title
- Reference any related issues: "Closes #123"
- Fill in the PR template (if available)
- Add screenshots for UI changes
- Ensure all checks pass

### 5. PR Review

- Address reviewer feedback
- Keep discussions respectful and constructive
- Make requested changes in new commits (or amend if requested)

---

## Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

### Writing Tests

We use **Jest** and **React Testing Library**:

```typescript
// __tests__/components/RestaurantCard.test.tsx
import { render, screen } from '@testing-library/react';
import RestaurantCard from '@/components/ui/RestaurantCard';

describe('RestaurantCard', () => {
  it('renders restaurant name', () => {
    const restaurant = {
      id: '1',
      name: 'Test Restaurant',
      rating: 4.5,
    };
    
    render(<RestaurantCard restaurant={restaurant} />);
    expect(screen.getByText('Test Restaurant')).toBeInTheDocument();
  });
});
```

### Test Structure
```
__tests__/
├── api/              # API route tests
│   ├── lists.test.ts
│   └── restaurants.test.ts
├── components/      # Component tests
│   ├── RestaurantCard.test.tsx
│   └── ...
├── hooks/            # Hook tests
│   ├── useRestaurants.test.tsx
│   └── ...
└── pages/            # Page tests
    ├── home.test.tsx
    └── ...
```

---

## Documentation

### When to Update Documentation

- New features are added
- API endpoints change
- Database schema changes
- Configuration changes

### Documentation Files

- `README.md` - Project overview and quick start
- `docs/api/` - API documentation
- `docs/architecture/` - Architecture overview
- `docs/database/` - Database schema
- `docs/guides/` - Development guides
- `docs/progress/` - Progress tracking

### Using the `/docs` Command

If you have access to Cline, use the `/docs` command to automatically update all documentation based on the current codebase state.

---

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

---

## Questions?

If you have questions or need help:
- Open an issue on GitHub
- Review existing issues and PRs
- Check the `docs/` folder for relevant guides

Thank you for contributing to FoodLister! 🍴