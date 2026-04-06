---
name: foodlister-testing
description: FoodLister testing patterns. Use when writing Jest tests, component tests, API tests, or mocking Supabase in the FoodLister project. Covers React Testing Library patterns, mock strategies, test structure, and coverage configuration. Triggers when working with __tests__/, writing test files, mocking Supabase, or configuring Jest in the FoodLister project.
---

# FoodLister Testing Patterns

Project-specific testing patterns for FoodLister (Jest + React Testing Library).

## Test Structure

```
__tests__/
├── api/              # API route tests
├── components/       # Component tests
├── hooks/            # Custom hook tests
└── utils/            # Utility function tests
```

## Naming Conventions
- **Files**: `[name].test.ts` or `[name].test.tsx`
- **Describe blocks**: `describe('[ComponentName]', ...)`
- **Test cases**: `it('should [expected behavior]', ...)`

## Component Testing

### Basic Component Test
```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '@/components/ui/Button';

describe('Button', () => {
  it('should render with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('should call onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### Test with Provider/Context
```tsx
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider } from '@/contexts/AuthContext';
import RestaurantList from '@/components/restaurant/RestaurantList';

// Mock Supabase
jest.mock('@/libs/supabase/client', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        order: jest.fn(() => ({
          data: [{ id: '1', name: 'Test Restaurant' }],
          error: null,
        })),
      })),
    })),
  },
}));

function renderWithProviders(component: React.ReactElement) {
  return render(<AuthProvider>{component}</AuthProvider>);
}

describe('RestaurantList', () => {
  it('should display loading state initially', () => {
    renderWithProviders(<RestaurantList />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should display restaurants after loading', async () => {
    renderWithProviders(<RestaurantList />);
    await waitFor(() => {
      expect(screen.getByText('Test Restaurant')).toBeInTheDocument();
    });
  });
});
```

## Hook Testing

```tsx
import { renderHook, waitFor } from '@testing-library/react';
import { useAuth } from '@/hooks/auth/useAuth';
import { AuthProvider } from '@/contexts/AuthContext';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('useAuth', () => {
  it('should return user when authenticated', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => {
      expect(result.current.user).toBeDefined();
    });
  });

  it('should return null when not authenticated', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => {
      expect(result.current.user).toBeNull();
    });
  });
});
```

## API Testing

```tsx
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/restaurants/route';

// Mock Supabase server client
jest.mock('@/libs/supabase/server', () => ({
  createServerClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        order: jest.fn(() => ({
          data: [{ id: '1', name: 'Test' }],
          error: null,
        })),
      })),
    })),
  })),
}));

describe('RESTAURANTS API', () => {
  describe('GET /api/restaurants', () => {
    it('should return restaurants list', async () => {
      const request = new NextRequest('http://localhost/api/restaurants');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toHaveLength(1);
      expect(data.data[0].name).toBe('Test');
    });
  });
});
```

## Mock Patterns

### Mock Entire Module
```tsx
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
}));
```

### Mock Supabase
```tsx
const mockSupabase = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn().mockResolvedValue({ data: null, error: null }),
};

jest.mock('@/libs/supabase/client', () => ({
  supabase: mockSupabase,
}));
```

## Checklist for New Tests

- [ ] Create file in `__tests__/[category]/`
- [ ] Use Arrange-Act-Assert pattern
- [ ] Mock Supabase and external APIs
- [ ] Test happy path
- [ ] Test error cases
- [ ] Test edge cases (empty state, loading, etc.)
- [ ] Check accessibility (aria attributes)
- [ ] Run `npm test` to validate
- [ ] Check coverage with `npm run test:coverage`

## Commands

```bash
npm test                 # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # With coverage report
npm test -- --verbose    # Detailed output
npm test -- [pattern]    # Run specific tests
```

## Common Errors to Avoid

1. Not mocking Supabase — tests fail without connection
2. Testing implementation instead of behavior
3. Multiple assertions in a single test
4. Not testing error cases — only happy path
5. Dependent tests — each test should be independent
6. Not cleaning mocks between tests — use `beforeEach`/`afterEach`
7. Ignoring accessibility in component tests