import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getSafeRedirectUrl } from './lib/auth/validations';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Bloquear cualquier intento de invocar APIs administrativas en el dominio público
  if (pathname.startsWith('/api/admin')) {
    return NextResponse.json(
      {
        success: false,
        error: 'Las operaciones administrativas están deshabilitadas en la tienda pública y operan en un dominio independiente.',
      },
      { status: 404 }
    );
  }

  // Si alguien intenta acceder a /admin en la tienda pública y existe URL del portal independiente, redirigir
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    const externalAdminUrl = process.env.NEXT_PUBLIC_ADMIN_PANEL_URL;
    if (externalAdminUrl && externalAdminUrl.startsWith('http')) {
      return NextResponse.redirect(new URL(externalAdminUrl));
    }
    return new NextResponse('Recurso no disponible en la tienda pública (404).', {
      status: 404,
      headers: { 'content-type': 'text/plain; charset=utf-8' },
    });
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // Renovación de tokens de sesión con getUser()
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirección preliminar: rutas privadas de cliente (/cuenta) requieren sesión
  const isProtectedPath = pathname.startsWith('/cuenta');

  if (isProtectedPath && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('redirectTo', pathname);

    const redirectResponse = NextResponse.redirect(loginUrl);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });
    return redirectResponse;
  }

  // Redirección preliminar: si ya está autenticado, no requiere visitar login o registro
  const isAuthEntryPath = pathname === '/login' || pathname === '/registro';
  if (isAuthEntryPath && user) {
    const rawRedirect = request.nextUrl.searchParams.get('redirectTo');
    const safeTarget = getSafeRedirectUrl(rawRedirect, '/cuenta');
    const targetUrl = new URL(safeTarget, request.nextUrl.origin);

    const redirectResponse = NextResponse.redirect(targetUrl);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });
    return redirectResponse;
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
