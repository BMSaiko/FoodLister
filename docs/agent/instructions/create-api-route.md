# Instructions: Create a New API Route

Follow this step-by-step guide when creating a new API endpoint.

---

## Step 1: Determine the Resource

Identify the resource name (singular, lowercase):
- `restaurants`
- `lists`
- `reviews`
- `users`

---

## Step 2: Create the Route File

```
app/api/[resource]/route.ts          # Collection endpoint
app/api/[resource]/[id]/route.ts     # Single item endpoint
```

---

## Step 3: Write the Route Handler

### Collection Route (GET, POST)
```tsx
// app/api/resource/route.ts
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
      .from('resource')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { error: 'Missing required field: name' },
        { status: 400 }
      );
    }

    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('resource')
      .insert(body)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Single Item Route (GET, PUT, DELETE)
```tsx
// app/api/resource/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/libs/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('resource')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('resource')
      .update(body)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerClient();
    const { error } = await supabase
      .from('resource')
      .delete()
      .eq('id', params.id);

    if (error) {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## Step 4: Checklist

- [ ] Create route file in `app/api/[resource]/`
- [ ] Add rate limiting for public endpoints
- [ ] Validate input data
- [ ] Check authentication for protected routes
- [ ] Return correct status codes
- [ ] Handle errors with try/catch
- [ ] Use `createServerClient` for Supabase
- [ ] Document endpoint in `docs/api-endpoints-reference.md`

---

## Authentication Check

For protected routes, add at the start:
```tsx
import { createServerClient } from '@/libs/supabase/server';

const supabase = await createServerClient();
const { data: { user }, error: authError } = await supabase.auth.getUser();

if (authError || !user) {
  return NextResponse.json(
    { error: 'Unauthorized' },
    { status: 401 }
  );
}
```

---

## Pagination Pattern

```tsx
const searchParams = request.nextUrl.searchParams;
const page = parseInt(searchParams.get('page') || '1');
const limit = parseInt(searchParams.get('limit') || '20');
const offset = (page - 1) * limit;

const { data, error, count } = await supabase
  .from('resource')
  .select('*', { count: 'exact' })
  .range(offset, offset + limit - 1);

return NextResponse.json({
  data,
  pagination: {
    page,
    limit,
    total: count,
    totalPages: Math.ceil(count! / limit),
  },
});
```

---

## Reference Files

- `agents/backend-agent.md` - Backend patterns
- `agents/database-agent.md` - Database schema
- `docs/api-endpoints-reference.md` - API documentation
- `docs/database-schema-reference.md` - Table structures

---

*Last updated: 2026-04-05*