import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '../../../lib/supabase/server';
import { getSafeRedirectUrl } from '../../../lib/auth/validations';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next');
  const safeNext = getSafeRedirectUrl(next, '/cuenta');

  if (code) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (!error) {
        return NextResponse.redirect(new URL(safeNext, requestUrl.origin));
      }

      console.error('[MOTOSERVICE Auth Callback] Error exchanging code:', error.message);
    } catch (err) {
      console.error('[MOTOSERVICE Auth Callback] Unexpected error:', err);
    }
  }

  // Si no hay código o hubo un error en el canje, redirigir al login con mensaje amigable
  return NextResponse.redirect(
    new URL('/login?error=callback_failed', requestUrl.origin)
  );
}
