# Error Handling Guide - FoodLister

Comprehensive guide for handling errors across the FoodLister application.

---

## Supabase Errors

### Database Query Errors

```typescript
const { data, error } = await supabase
  .from('restaurants')
  .select('*');

if (error) {
  // Check error code
  if (error.code === 'PGRST116') {
    // Not found
    return NextResponse.json(
      { error: 'Resource not found' },
      { status: 404 }
    );
  } else if (error.code === '23505') {
    // Unique violation
    return NextResponse.json(
      { error: 'Duplicate entry' },
      { status: 400 }
    );
  } else if (error.code === '23503') {
    // Foreign key violation
    return NextResponse.json(
      { error: 'Referenced resource does not exist' },
      { status: 400 }
    );
  } else if (error.code === '42501') {
    // RLS violation (insufficient_privilege)
    return NextResponse.json(
      { error: 'Permission denied' },
      { status: 403 }
    );
  } else if (error.code === '42P01') {
    // Table does not exist
    console.error('Database schema error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
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
| `42P01` | Table does not exist | Return 500 (server error) |
| `PGRST301` | JWT expired | Redirect to login |

### Auth Errors

```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
});

if (error) {
  if (error.message.includes('Invalid login credentials')) {
    return NextResponse.json(
      { error: 'Invalid email or password' },
      { status: 401 }
    );
  } else if (error.message.includes('Email not confirmed')) {
    return NextResponse.json(
      { error: 'Please confirm your email before logging in' },
      { status: 403 }
    );
  } else if (error.message.includes('Too many requests')) {
    return NextResponse.json(
      { error: 'Too many login attempts. Please try again later.' },
      { status: 429 }
    );
  }
}
```

### Supabase Client Error Handling

```typescript
// libs/supabase/client.ts
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/utils/logger';

export function createClient() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      global: {
        fetch: async (url, options = {}) => {
          try {
            const response = await fetch(url, options);
            if (!response.ok) {
              logger.warn('Supabase fetch warning', {
                url,
                status: response.status,
              });
            }
            return response;
          } catch (error) {
            logger.error('Supabase fetch error', { url, error });
            throw error;
          }
        },
      },
    }
  );

  return supabase;
}
```

---

## API Route Errors

### Standard Error Response

```typescript
// app/api/restaurants/route.ts
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    if (!body.name || body.name.length < 2) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: { name: 'Name must be at least 2 characters' }
        },
        { status: 400 }
      );
    }

    const supabase = createClient();
    const { data, error } = await supabase
      .from('restaurants')
      .insert(body)
      .select()
      .single();

    if (error) {
      logger.error('Failed to create restaurant', { error, body });
      return NextResponse.json(
        { error: 'Failed to create restaurant' },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    logger.error('API Error:', error);
    
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

```typescript
// utils/validators.ts
export function validateRestaurant(data: any) {
  const errors: Record<string, string> = {};

  if (!data.name || data.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters';
  }

  if (data.price_per_person && data.price_per_person <= 0) {
    errors.price_per_person = 'Price must be positive';
  }

  if (data.rating && (data.rating < 0 || data.rating > 5)) {
    errors.rating = 'Rating must be between 0 and 5';
  }

  if (data.menu_links && data.menu_links.length > 5) {
    errors.menu_links = 'Maximum 5 menu links allowed';
  }

  if (data.menu_images && data.menu_images.length > 10) {
    errors.menu_images = 'Maximum 10 menu images allowed';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

// Usage in API route
const validation = validateRestaurant(body);
if (!validation.isValid) {
  return NextResponse.json(
    { 
      error: 'Validation failed',
      details: validation.errors 
    },
    { status: 400 }
  );
}
```

### Rate Limiting Errors

```typescript
// middleware/rateLimiter.ts
import { NextResponse } from 'next/server';

const RATE_LIMIT = 10; // requests per second
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function rateLimiter(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const now = Date.now();
  
  const record = requestCounts.get(ip) || { count: 0, resetTime: now + 1000 };
  
  if (now > record.resetTime) {
    record.count = 0;
    record.resetTime = now + 1000;
  }
  
  record.count++;
  requestCounts.set(ip, record);
  
  if (record.count > RATE_LIMIT) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please try again later.' },
      { status: 429 }
    );
  }
  
  return null; // Continue
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
    logger.error('React Error Boundary', { error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 text-center">
          <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
          <p className="text-gray-500 mb-4">{this.state.error?.message}</p>
          <button 
            onClick={() => this.setState({ hasError: false })}
            className="px-4 py-2 bg-amber-500 text-white rounded hover:bg-amber-600"
          >
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
// components/ui/ErrorDisplay.tsx
'use client';

interface ErrorProps {
  title?: string;
  message: string;
  retry?: () => void;
  code?: number;
}

export default function ErrorDisplay({ 
  title = 'Error', 
  message, 
  retry,
  code 
}: ErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 min-h-[200px]">
      <div className="text-red-500 text-4xl mb-4">
        {code === 404 ? '🔍' : code === 403 ? '🔒' : '⚠️'}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-500 text-center mb-4">{message}</p>
      {retry && (
        <button 
          onClick={retry} 
          className="px-4 py-2 bg-amber-500 text-white rounded hover:bg-amber-600 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
```

### API Client Error Handling

```typescript
// libs/apiClient.ts
export class ApiClient {
  private baseUrl: string;
  private cache: Map<string, { data: any; timestamp: number }>;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.baseUrl = window.location.origin;
    this.cache = new Map();
  }

  async get(endpoint: string, options?: { cache?: boolean }) {
    const cacheKey = endpoint;
    
    if (options?.cache) {
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
        return cached.data;
      }
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      
      if (options?.cache) {
        this.cache.set(cacheKey, { data, timestamp: Date.now() });
      }

      return data;
    } catch (error) {
      logger.error('API GET error', { endpoint, error });
      throw error;
    }
  }

  async post(endpoint: string, body: any, options?: { requireAuth?: boolean }) {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        
        if (response.status === 401 && options?.requireAuth) {
          // Redirect to login
          window.location.href = '/auth/login';
          throw new Error('Authentication required');
        }
        
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      logger.error('API POST error', { endpoint, error });
      throw error;
    }
  }

  clearCache() {
    this.cache.clear();
  }
}

export const apiClient = new ApiClient();
```

---

## Hook Error Pattern

```typescript
// hooks/data/useRestaurants.ts
import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/libs/supabase/client';
import { logger } from '@/utils/logger';

export function useRestaurants(filters?: any) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const supabase = createClient();
      let query = supabase
        .from('restaurants')
        .select('*, cuisine_types(*), dietary_options(*), features(*)');

      // Apply filters
      if (filters?.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      if (filters?.minRating) {
        query = query.gte('rating', filters.minRating);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      setData(data || []);
    } catch (err: any) {
      logger.error('Failed to fetch restaurants', { error: err, filters });
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
```

---

## Toast Notifications

```typescript
// Using react-toastify
import { toast } from 'react-toastify';

// Success
toast.success('Restaurant created successfully!');

// Error
toast.error('Failed to create restaurant. Please try again.');

// Warning
toast.warn('You have unsaved changes.');

// Info
toast.info('This feature is coming soon.');

// Custom with auto-close
toast.error('Error details', {
  position: 'top-right',
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
});

// Promise-based toast
toast.promise(
  createRestaurant(data),
  {
    pending: 'Creating restaurant...',
    success: 'Restaurant created!',
    error: 'Failed to create restaurant'
  }
);
```

---

## Retry Pattern

```typescript
// utils/retry.ts
export async function fetchWithRetry<T>(
  fn: () => Promise<T>, 
  options?: { 
    retries?: number; 
    delay?: number;
    backoff?: boolean;
  }
): Promise<T> {
  const { retries = 3, delay = 1000, backoff = true } = options || {};

  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      
      const waitTime = backoff ? delay * Math.pow(2, i) : delay;
      logger.warn(`Retry attempt ${i + 1} failed, retrying in ${waitTime}ms`, { error });
      
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  throw new Error('All retry attempts failed');
}

// Usage
try {
  const data = await fetchWithRetry(
    () => apiClient.get('/api/restaurants'),
    { retries: 3, delay: 1000, backoff: true }
  );
} catch (error) {
  toast.error('Failed to load restaurants after multiple attempts');
}
```

---

## Common Error Scenarios

### Image Upload Failure

```typescript
// utils/cloudinaryConverter.ts
export async function uploadToCloudinary(
  file: File, 
  options?: { maxRetries?: number; delay?: number }
): Promise<string> {
  const { maxRetries = 3, delay = 1000 } = options || {};

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Upload failed');
      }

      const data = await response.json();
      return data.secure_url;
    } catch (error: any) {
      if (error.message?.includes('quota')) {
        toast.error('Storage quota exceeded');
        throw error;
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        toast.error('Network error. Check your connection.');
        if (attempt === maxRetries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, delay * (attempt + 1)));
      } else {
        toast.error('Failed to upload image');
        throw error;
      }
    }
  }
  
  throw new Error('Upload failed after retries');
}
```

### Form Submission Failure

```typescript
// components/restaurant/RestaurantForm.tsx
const handleSubmit = async (formData: any) => {
  try {
    setIsSubmitting(true);
    
    const response = await fetch('/api/restaurants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to submit');
    }

    const data = await response.json();
    toast.success('Created successfully!');
    router.push(`/restaurants/${data.id}`);
  } catch (error: any) {
    logger.error('Form submission error', { error });
    toast.error(error.message || 'An unexpected error occurred');
  } finally {
    setIsSubmitting(false);
  }
};
```

### Authentication Error Handling

```typescript
// contexts/AuthContext.tsx
const handleAuthError = (error: any) => {
  if (error.message?.includes('Invalid login credentials')) {
    toast.error('Invalid email or password');
  } else if (error.message?.includes('Email not confirmed')) {
    toast.error('Please confirm your email before logging in');
  } else if (error.message?.includes('Too many requests')) {
    toast.error('Too many attempts. Please try again later.');
  } else if (error.message?.includes('User already registered')) {
    toast.error('An account with this email already exists');
  } else {
    toast.error('An authentication error occurred');
  }
};
```

---

## Logging

```typescript
// utils/logger.ts
type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogData {
  [key: string]: any;
}

class Logger {
  private isDev = process.env.NODE_ENV === 'development';

  private formatMessage(message: string, data?: LogData): string {
    return this.isDev ? `[${message}] ${JSON.stringify(data)}` : message;
  }

  info(message: string, data?: LogData) {
    if (this.isDev) {
      console.log(`[INFO] ${message}`, data);
    }
  }

  warn(message: string, data?: LogData) {
    console.warn(`[WARN] ${message}`, data);
  }

  error(message: string, error?: any) {
    console.error(`[ERROR] ${message}`, error);
    
    // In production, send to error tracking service
    if (!this.isDev) {
      // Example: Sentry.captureException(error, { extra: { message } });
    }
  }

  debug(message: string, data?: LogData) {
    if (this.isDev) {
      console.debug(`[DEBUG] ${message}`, data);
    }
  }
}

export const logger = new Logger();
```

---

## Monitoring & Error Tracking

### API Monitoring

```typescript
// utils/apiMonitor.ts
export class ApiMonitor {
  static trackRequest(endpoint: string, method: string, duration: number, status: number) {
    const logData = {
      endpoint,
      method,
      duration,
      status,
      timestamp: new Date().toISOString(),
    };

    if (status >= 400) {
      logger.error('API Request Failed', logData);
    } else if (duration > 2000) {
      logger.warn('Slow API Request', logData);
    } else {
      logger.debug('API Request', logData);
    }
  }
}
```

### Database Monitoring

```typescript
// utils/dbMonitor.ts
export class DbMonitor {
  static trackQuery(table: string, operation: string, duration: number, error?: any) {
    const logData = {
      table,
      operation,
      duration,
      timestamp: new Date().toISOString(),
    };

    if (error) {
      logger.error('Database Query Failed', { ...logData, error });
    } else if (duration > 1000) {
      logger.warn('Slow Database Query', logData);
    }
  }
}
```

---

## Best Practices

### 1. Always Handle Errors

```typescript
// ❌ Bad: No error handling
const { data } = await supabase.from('restaurants').select('*');

// ✅ Good: Proper error handling
const { data, error } = await supabase.from('restaurants').select('*');
if (error) {
  logger.error('Failed to fetch restaurants', { error });
  throw error;
}
```

### 2. Use Appropriate Status Codes

| Scenario | Status Code |
|----------|-------------|
| Success | 200 |
| Created | 201 |
| Bad Request (validation) | 400 |
| Unauthorized | 401 |
| Forbidden | 403 |
| Not Found | 404 |
| Conflict (duplicate) | 409 |
| Rate Limited | 429 |
| Server Error | 500 |

### 3. Provide User-Friendly Messages

```typescript
// ❌ Bad: Technical error message
toast.error('PGRST116: Result not found');

// ✅ Good: User-friendly message
toast.error('The restaurant you are looking for does not exist');
```

### 4. Log Errors with Context

```typescript
// ❌ Bad: No context
logger.error('Error occurred');

// ✅ Good: With context
logger.error('Failed to create restaurant', { 
  error, 
  userId: user.id,
  restaurantName: formData.name 
});
```

### 5. Implement Retry Logic for Transient Failures

```typescript
// Network errors, timeouts should be retried
// Validation errors, 4xx errors should not be retried
```

---

*Last updated: 2026-05-07*