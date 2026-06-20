import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// Routes that require admin access
const ADMIN_ROUTES = ['/admin'];

// Routes that are public (no auth required)
const PUBLIC_ROUTES = ['/', '/auth', '/api/health'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Create a response object for cookie manipulation
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

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

  // API routes handle their own auth/admin checks internally — skip middleware
  const isApiRoute = pathname.startsWith('/api');
  if (isApiRoute) {
    return response;
  }

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
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - public assets (svg, png, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

