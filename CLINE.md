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

## Specialized Agents

This project uses specialized agent files for task-specific guidance. **Always read the relevant agent file before starting work on a task.**

### Agent Files Location: `agents/`

| Agent File | When to Use |
|------------|-------------|
| `agents/frontend-agent.md` | Creating React components, hooks, pages, or working with Next.js features |
| `agents/backend-agent.md` | Creating API routes, Supabase integration, Cloudinary upload, or authentication |
| `agents/database-agent.md` | Creating database tables, migrations, RLS policies, or SQL queries |
| `agents/testing-agent.md` | Writing Jest tests, component tests, API tests, or mocking |
| `agents/ui-ux-agent.md` | Creating UI components, animations with Framer Motion, or improving accessibility |
| `agents/devops-agent.md` | Setting up CI/CD, deploying to Vercel, ESLint config, or performance monitoring |

### How to Use Agents

1. **Identify the task type** (frontend, backend, database, testing, UI/UX, devops)
2. **Read the corresponding agent file** in `agents/`
3. **Follow the checklist** in the agent file
4. **Use the code examples** as reference
5. **Avoid the common errors** listed in each agent

### Agent Selection Guide

| Task | Primary Agent | Secondary Agent |
|------|---------------|-----------------|
| New React component | `frontend-agent.md` | `ui-ux-agent.md` |
| New API endpoint | `backend-agent.md` | `database-agent.md` |
| Database migration | `database-agent.md` | `backend-agent.md` |
| Write tests | `testing-agent.md` | - |
| UI component with animations | `ui-ux-agent.md` | `frontend-agent.md` |
| Deploy or CI/CD | `devops-agent.md` | - |
| Form with validation | `frontend-agent.md` | `ui-ux-agent.md` |
| Image upload feature | `backend-agent.md` | `ui-ux-agent.md` |

---

## Reference Documentation

Quick access to project-specific documentation:

| Document | Location | Purpose |
|----------|----------|---------|
| Database Schema | `docs/database-schema-reference.md` | All tables, columns, relationships, and indexes |
| API Endpoints | `docs/api-endpoints-reference.md` | All API routes, request/response formats |
| Error Handling | `docs/error-handling-guide.md` | How to handle Supabase, API, and frontend errors |
| Prompt Templates | `docs/prompt-templates.md` | Pre-built prompts for common tasks |
| Skills & Competencies | `docs/PROJECT-SKILLS.md` | Complete list of required skills |

---

## Task Instructions

Step-by-step guides for common tasks in `instructions/`:

| Instruction | File |
|-------------|------|
| Create Component | `instructions/create-component.md` |
| Create API Route | `instructions/create-api-route.md` |
| Create Database Migration | `instructions/create-migration.md` |

---

## Code Snippets

Reusable code templates in `snippets/`:

| Snippet | File |
|---------|------|
| Component Templates | `snippets/component-template.tsx` |
| Hook Templates | `snippets/hook-template.ts` |

---

## Workflow Rules

### ALL Modes - ALWAYS Use Subagents

**Both Planning AND Acting modes MUST use subagents** for all tasks.

#### Planning Mode - Subagents for Analysis
Use subagents to explore and understand before acting:

| When | What Subagents Do |
|------|-------------------|
| Analyzing impact | Check all files affected by a change |
| Searching patterns | Find all occurrences of a pattern |
| Exploring features | Map all components, hooks, and APIs involved |
| Validating approach | Cross-reference with existing code and docs |

**Rule:** Launch 2-5 subagents in parallel to cover different aspects.

#### Acting Mode - Subagents for Execution + Parallel Tasks
Use subagents to **execute tasks** and run **multiple tasks in parallel**:

| Scenario | Subagent 1 | Subagent 2 | Subagent 3 |
|----------|------------|------------|------------|
| Create feature | Create component | Create hook | Create test |
| Add API endpoint | Create route | Update docs | Add validation |
| Database change | Write migration | Update types | Update schema docs |
| Refactor | Update component | Update tests | Update hooks |

**Rule:** If there are 2+ tasks, distribute them across subagents and execute in parallel.

### Parallel Execution Guidelines

1. **Always use subagents** - Both planning AND acting require subagents
2. **Identify parallelizable tasks** - Split work across 2-5 subagents
3. **Batch independent operations** - Group tasks that don't depend on each other
4. **Execute simultaneously** - Launch all subagents at once for independent tasks

### Task Distribution Examples

**Task: "Create a restaurant review component"**
- Subagent 1: Create `ReviewCard.tsx` component
- Subagent 2: Create `ReviewCard.test.tsx` test
- Subagent 3: Update `components/index.ts` exports

**Task: "Add rating filter to restaurant list"**
- Subagent 1: Add UI filter component
- Subagent 2: Update API endpoint with filter param
- Subagent 3: Update filter hook logic

**Task: "Create database migration for new table"**
- Subagent 1: Write SQL migration
- Subagent 2: Update TypeScript types
- Subagent 3: Update database schema docs

### Execution Checklist

Before completing any task:
- [ ] Used subagents for planning/analysis
- [ ] Used subagents for execution (acting mode)
- [ ] Distributed 2+ tasks across parallel subagents
- [ ] Ran linting (`npm run lint`)
- [ ] Ran tests (`npm test`)
- [ ] Updated relevant documentation
- [ ] Verified all files were created successfully

---

## Important Notes

- Always check `docs/PROJECT-SKILLS.md` for detailed skill requirements
- Follow the architecture described in `docs/architecture-overview.md`
- Use the existing API client in `libs/apiClient.ts` for Supabase calls
- Authentication is handled via `contexts/AuthContext.tsx`
- Database schema is defined in `supabase/database.sql`
- **Read relevant agent files before starting any task**
- **ALWAYS use subagents for planning, parallel execution for acting**

---

*Generated: 2026-04-05*
