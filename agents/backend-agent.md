# Backend Agent - FoodList

## Especialidade
Supabase, API Routes, Rate Limiting, Cloudinary Integration, Authentication

---

## Tech Stack Obrigatória

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| @supabase/supabase-js | 2.49.x | Client principal |
| @supabase/ssr | 0.8.x | Server-side rendering |
| Next.js API Routes | 15.x | Route handlers |
| Cloudinary | 2.9.x | Image upload/management |
| libphonenumber-js | 1.12.x | Phone validation |

---

## Padrões do Projeto

### Estrutura de API Routes
```
app/api/
├── auth/              # Endpoints de autenticação
├── restaurants/       # CRUD de restaurantes
├── lists/             # Gestão de listas
├── meals/             # Gestão de refeições
├── users/             # Gestão de utilizadores
└── upload/            # Upload de imagens
```

### Route Handler Pattern
```tsx
// app/api/restaurants/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/libs/supabase/server';
import { rateLimiter } from '@/middleware/rateLimiter';

export async function GET(request: NextRequest) {
  // Rate limiting
  const rateLimit = await rateLimiter(request);
  if (rateLimit.limited) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
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
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validação
    if (!body.name || !body.location) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
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
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## Checklist para Nova API Route

- [ ] Criar pasta em `app/api/[resource]/`
- [ ] Implementar route.ts com GET/POST/PUT/DELETE
- [ ] Adicionar rate limiting
- [ ] Validar input data
- [ ] Verificar autenticação quando necessário
- [ ] Retornar status codes corretos
- [ ] Tratar erros com try/catch
- [ ] Usar createServerClient para Supabase SSR
- [ ] Documentar endpoint em `docs/api-documentation.md`

---

## Supabase Client Patterns

### Server Client (API Routes, Server Components)
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

### Browser Client (Client Components)
```tsx
// libs/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

---

## Cloudinary Integration

### Upload de Imagem
```tsx
// libs/apiClient.ts - Cloudinary upload
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

---

## Rate Limiting

### Middleware Pattern
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
    rateLimitMap.set(ip, {
      count: 1,
      resetTime: now + WINDOW_MS,
    });
    return { limited: false };
  }
  
  if (limit.count >= MAX_REQUESTS) {
    return { limited: true };
  }
  
  limit.count++;
  return { limited: false };
}
```

---

## Erros Comuns a Evitar

1. **Não verificar autenticação** em rotas protegidas
2. **Retornar erros internos** diretamente ao cliente
3. **Não validar input** antes de inserir na base de dados
4. **Esquecer rate limiting** em endpoints públicos
5. **Usar createBrowserClient** em server components
6. **Não tratar erros do Supabase** corretamente
7. **Hardcoded credentials** - usar sempre environment variables

---

## Response Format Padrão

```tsx
// Sucesso
{
  "data": { ... },
  "message": "Operation successful"
}

// Erro
{
  "error": "Error message",
  "details": "Optional details"
}
```

---

## Status Codes

| Código | Uso |
|--------|-----|
| 200 | GET/PUT/PATCH sucesso |
| 201 | POST sucesso (recurso criado) |
| 204 | DELETE sucesso |
| 400 | Bad request / Validation error |
| 401 | Não autenticado |
| 403 | Não autorizado |
| 404 | Recurso não encontrado |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

---

*Last updated: 2026-04-05*