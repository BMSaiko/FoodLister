# Error Handling Guide - FoodList

Comprehensive guide for handling errors across the application.

---

## Supabase Errors

### Database Query Errors
```tsx
const { data, error } = await supabase
  .from('restaurants')
  .select('*');

if (error) {
  // Check error code
  if (error.code === 'PGRST116') {
    // Not found
  } else if (error.code === '23505') {
    // Unique violation
  } else if (error.code === '23503') {
    // Foreign key violation
  } else if (error.code === '42501') {
    // RLS violation (insufficient_privilege)
  }
}
```

### Common Supabase Error Codes

| Code | Meaning | Action |
|------|---------|--------|
| `PGRST116` | Result not found | Return 404 |
| `23505` | Unique violation | Return 400 with message |
| `23503` | Foreign key violation | Return 400 |
| `42501` | Insufficient privilege | Return 403 |
| `22P02` | Invalid input syntax | Return 400 |
| `23502` | Not null violation | Return 400 |

### Auth Errors
```tsx
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
});

if (error) {
  if (error.message.includes('Invalid login credentials')) {
    // Wrong email/password
  } else if (error.message.includes('Email not confirmed')) {
    // Email not verified
  }
}
```

---

## API Route Errors

### Standard Error Response
```tsx
export async function POST(request: NextRequest) {
  try {
    // ... logic
  } catch (error) {
    console.error('API Error:', error);
    
    // Check for known error types
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Validation Errors
```tsx
if (!body.name || body.name.length < 3) {
  return NextResponse.json(
    { 
      error: 'Validation failed',
      details: { name: 'Name must be at least 3 characters' }
    },
    { status: 400 }
  );
}
```

---

## Frontend Errors

### Error Boundary
```tsx
// components/ui/ErrorBoundary.tsx
'use client';

import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 text-center">
          <h2>Something went wrong</h2>
          <p className="text-gray-500">{this.state.error?.message}</p>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
```

### Error Component
```tsx
// components/ui/Error.tsx
interface ErrorProps {
  title?: string;
  message: string;
  retry?: () => void;
  code?: number;
}

export default function Error({ 
  title = 'Error', 
  message, 
  retry,
  code 
}: ErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="text-error text-4xl mb-4">
        {code === 404 ? '🔍' : code === 403 ? '🔒' : '⚠️'}
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-gray-500 text-center">{message}</p>
      {retry && (
        <button onClick={retry} className="mt-4 px-4 py-2 bg-primary text-white rounded">
          Try Again
        </button>
      )}
    </div>
  );
}
```

---

## Hook Error Pattern

```tsx
// hooks/data/useRestaurants.ts
export function useRestaurants() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetch() {
      try {
        setLoading(true);
        setError(null);
        const { data, error } = await supabase
          .from('restaurants')
          .select('*');
        
        if (error) throw error;
        setData(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, []);

  return { data, loading, error, refetch: fetch };
}
```

---

## Toast Notifications

```tsx
import { toast } from 'react-toastify';

// Success
toast.success('Restaurant created successfully!');

// Error
toast.error('Failed to create restaurant. Please try again.');

// Warning
toast.warn('You have unsaved changes.');

// Info
toast.info('This feature is coming soon.');

// Custom
toast.error('Error details', {
  position: 'top-right',
  autoClose: 5000,
  hideProgressBar: false,
});
```

---

## Retry Pattern

```tsx
async function fetchWithRetry(fn: () => Promise<any>, retries = 3): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
```

---

## Common Error Scenarios

### Image Upload Failure
```tsx
try {
  const result = await uploadImage(file);
} catch (error) {
  if (error.message?.includes('quota')) {
    toast.error('Storage quota exceeded');
  } else if (error.message?.includes('network')) {
    toast.error('Network error. Check your connection.');
  } else {
    toast.error('Failed to upload image');
  }
}
```

### Form Submission Failure
```tsx
const handleSubmit = async (data: FormData) => {
  try {
    const response = await fetch('/api/restaurants', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to submit');
    }
    
    toast.success('Created successfully!');
  } catch (error) {
    toast.error(error.message);
  }
};
```

---

## Logging

```tsx
// utils/logger.ts
export const logger = {
  info: (message: string, data?: any) => {
    console.log(`[INFO] ${message}`, data);
  },
  warn: (message: string, data?: any) => {
    console.warn(`[WARN] ${message}`, data);
  },
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${message}`, error);
    // Send to error tracking service
  },
};
```

---

*Last updated: 2026-04-05*