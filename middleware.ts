import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// Routes that require admin access
const ADMIN_ROUTES = ['/admin'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const response = NextResponse.next({
    request: { headers: request.headers },
  });

  // Só /admin exige sessão: as restantes rotas não pagam getUser() nem a query a profiles.
  const isAdminRoute = ADMIN_ROUTES.some(route => pathname.startsWith(route));

  if (isAdminRoute) {
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

    // getUser() valida o JWT no servidor (getSession só lê o cookie)
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      const redirectUrl = new URL('/auth/signin', request.url);
      redirectUrl.searchParams.set('redirect', pathname);
      redirectUrl.searchParams.set('reason', 'auth_required');
      return NextResponse.redirect(redirectUrl);
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error || !profile || !profile.is_admin) {
      const redirectUrl = new URL('/unauthorized', request.url);
      redirectUrl.searchParams.set('reason', 'admin_required');
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Add CORS headers for API routes
  if (pathname.startsWith('/api/')) {
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Max-Age', '86400');

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 204, headers: response.headers });
    }
  }

  return response;
}

export const config = {
  // Só /admin (auth) e /api (CORS/preflight); páginas públicas ficam sem middleware.
  matcher: ['/admin/:path*', '/api/:path*'],
};
