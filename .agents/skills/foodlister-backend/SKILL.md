---
name: foodlister-backend
description: FoodLister backend development patterns. Use when creating API routes, Supabase server integrations, Cloudinary uploads, authentication flows, or middleware in the FoodLister project. Covers API route handlers, rate limiting, server-side Supabase patterns, and error handling conventions. Triggers when working with app/api/, libs/supabase/server, middleware/, or server-side data operations in the FoodLister project.
---

# FoodLister Backend Patterns

Project-specific backend patterns for FoodLister (Next.js 15 API Routes + Supabase).

## Core Rules

### API Route Structure
```
app/api/
├── auth/              # Authentication endpoints
├── restaurants/       # Restaurant CRUD
├── lists/             # User list management
├── meals/             # Meal management
├── users/             # User profile/settings
└── upload/            # Image upload (Cloudinary)
```

### Language
- **All API responses in English** — error messages, success messages, validation
- Error format: `{ error: 'Message here' }`
- Success format: `{ data: {...}, message: 'Operation successful' }`

### Route Handler Pattern
```tsx
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/libs/supabase/server';
import { rateLimiter } from '@/middleware/rateLimiter';

export async function GET(request: NextRequest) {
  // Rate limiting
  const rateLimit = await rateLimiter(request);
  if (rateLimit.limited) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .order('name');

    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validation
    if (!body.name || !body.location) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('restaurants')
      .insert(body)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

## Supabase Server Client

```tsx
// libs/supabase/server.ts
import { createServerClient as createSupabaseServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createServerClient() {
  const cookieStore = await cookies();
  
  return createSupabaseServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
}
```

## Rate Limiting

```tsx
// middleware/rateLimiter.ts
import { NextRequest } from 'next/server';

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const MAX_REQUESTS = 100;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export async function rateLimiter(request: NextRequest) {
  const ip = request.ip ?? '127.0.0.1';
  const now = Date.now();
  const limit = rateLimitMap.get(ip);
  
  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + WINDOW_MS });
    return { limited: false };
  }
  
  if (limit.count >= MAX_REQUESTS) {
    return { limited: true };
  }
  
  limit.count++;
  return { limited: false };
}
```

## Cloudinary Upload

```tsx
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(file: File, folder: string = 'foodlist') {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    ).end(buffer);
  });
}
```

## Status Codes

| Code | Usage |
|------|-------|
| 200 | GET/PUT/PATCH success |
| 201 | POST success (resource created) |
| 204 | DELETE success |
| 400 | Bad request / Validation error |
| 401 | Not authenticated |
| 403 | Not authorized |
| 404 | Resource not found |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

## Checklist for New API Routes

- [ ] Create folder in `app/api/[resource]/`
- [ ] Implement route.ts with GET/POST/PUT/DELETE
- [ ] Add rate limiting
- [ ] Validate input data
- [ ] Check authentication when needed
- [ ] Return correct status codes
- [ ] Handle errors with try/catch
- [ ] Use createServerClient for Supabase SSR
- [ ] Document endpoint in `docs/api-documentation.md`

## Common Errors to Avoid

1. Not checking authentication on protected routes
2. Returning internal errors directly to the client
3. Not validating input before database insert
4. Forgetting rate limiting on public endpoints
5. Using createBrowserClient in server components
6. Not handling Supabase errors correctly
7. Hardcoded credentials — always use environment variables