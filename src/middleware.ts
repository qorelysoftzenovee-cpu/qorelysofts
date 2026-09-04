import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Let public routes pass without invoking Supabase auth
  const isAdminRoute = pathname.startsWith('/admin') && !pathname.startsWith('/admin/login');

  if (!isAdminRoute) {
    return NextResponse.next();
  }

  // Admin route protection
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If Supabase env vars are missing on host, safely redirect to login
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Middleware: Supabase environment variables are missing.');
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/admin/login';
    return NextResponse.redirect(loginUrl);
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  try {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            request.cookies.set({ name, value, ...options });
            response = NextResponse.next({
              request: { headers: request.headers },
            });
            response.cookies.set({ name, value, ...options });
          } catch {
            // Ignore cookie modification failures in middleware
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            request.cookies.set({ name, value: '', ...options });
            response = NextResponse.next({
              request: { headers: request.headers },
            });
            response.cookies.set({ name, value: '', ...options });
          } catch {
            // Ignore cookie modification failures in middleware
          }
        },
      },
    });

    const { data: { user }, error } = await supabase.auth.getUser();
    const adminEmail = process.env.ADMIN_EMAIL;

    if (error || !user || !adminEmail || user.email !== adminEmail) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/admin/login';
      return NextResponse.redirect(loginUrl);
    }
  } catch (err) {
    console.error('Middleware error in admin check:', err);
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/admin/login';
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match admin routes that require protection.
     * Prevents middleware from executing unnecessarily on public pages,
     * assets, webhooks, and static files.
     */
    '/admin/:path*',
  ],
};
