import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getSafeRedirectUrl } from './lib/auth/validations.mjs';

export async function proxy(request: NextRequest) {
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Rutas públicas de autenticación del portal administrativo
  const isPublicAuthPath =
    pathname === '/login' ||
    pathname === '/recuperar-contrasena' ||
    pathname === '/actualizar-contrasena' ||
    pathname.startsWith('/auth/');

  // Protección preliminar de APIs administrativas
  if (pathname.startsWith('/api/admin')) {
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'No autenticado. Inicia sesión en el portal administrativo.',
        },
        { status: 401 }
      );
    }
    return supabaseResponse;
  }

  // Cualquier ruta operativa del panel requiere sesión activa
  if (!isPublicAuthPath && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    if (pathname !== '/') {
      loginUrl.searchParams.set('redirectTo', pathname);
    }

    const redirectResponse = NextResponse.redirect(loginUrl);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });
    return redirectResponse;
  }

  // Si ya tiene sesión y visita /login, redirigir al tablero raíz (que verificará el rol admin)
  if (pathname === '/login' && user) {
    const rawRedirect = request.nextUrl.searchParams.get('redirectTo');
    const safeTarget = getSafeRedirectUrl(rawRedirect, '/');
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
