import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import {
  checkRateLimitEdge,
  clientIp,
  isOriginAllowed,
  rateLimitBudget,
  CORS_ALLOW_METHODS,
  CORS_ALLOW_HEADERS,
  CORS_MAX_AGE,
} from '@/libs/security';

// Routes that require admin access
const ADMIN_ROUTES = ['/admin'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Universal API rate limiting (Edge-safe, in-memory). Mitigates scraping/abuse with 429.
  // ponytail: per-instance/efémero on serverless — enough for the current threat model;
  // swap for Upstash Ratelimit when multi-region/scale.
  if (pathname.startsWith('/api/')) {
    const budget = rateLimitBudget(pathname);
    const rl = checkRateLimitEdge(clientIp(request.headers), budget.max, budget.windowMs);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Too many requests', code: 'RATE_LIMITED' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfterSec) } }
      );
    }
  }

  // Create a response object for cookie manipulation
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  // CORS for API routes — whitelist only, no more Access-Control-Allow-Origin: *.
  if (pathname.startsWith('/api/')) {
    const origin = request.headers.get('origin');
    const allowed = origin ? isOriginAllowed(origin) : undefined;

    if (allowed && origin) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Methods', CORS_ALLOW_METHODS);
      response.headers.set('Access-Control-Allow-Headers', CORS_ALLOW_HEADERS);
      response.headers.set('Access-Control-Max-Age', CORS_MAX_AGE);
    }

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      // Reject preflight from a disallowed origin (browser will not proceed).
      if (origin && !allowed) {
        return new NextResponse(null, { status: 403 });
      }
      return new NextResponse(null, { status: 204, headers: response.headers });
    }

    if (origin) {
      // Let caches key on the selected origin when it varies.
      response.headers.set('Vary', 'Origin');
    }
  }

  // Create Supabase client for middleware
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  // Refresh session
  const { data: { session } } = await supabase.auth.getSession();

  // Check if route requires admin access
  const isAdminRoute = ADMIN_ROUTES.some(route => pathname.startsWith(route));

  if (isAdminRoute) {
    // Must be authenticated
    if (!session) {
      const redirectUrl = new URL('/auth/signin', request.url);
      redirectUrl.searchParams.set('redirect', pathname);
      redirectUrl.searchParams.set('reason', 'auth_required');
      return NextResponse.redirect(redirectUrl);
    }

    // Check if user is admin by querying profiles
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('user_id', session.user.id)
      .maybeSingle();

    if (error || !profile || !profile.is_admin) {
      // User is not an admin - redirect to unauthorized
      const redirectUrl = new URL('/unauthorized', request.url);
      redirectUrl.searchParams.set('reason', 'admin_required');
      return NextResponse.redirect(redirectUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    // Match all paths EXCEPT:
    // - _next/static, _next/image, favicon.ico, static assets
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
