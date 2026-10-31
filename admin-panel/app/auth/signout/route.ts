import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '../../../lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch (err) {
    console.error('[MOTOSERVICE ADMIN SignOut] Error al cerrar sesión:', err);
  }

  const origin = new URL(request.url).origin;
  return NextResponse.redirect(new URL('/login?message=logged_out', origin), {
    status: 303,
  });
}

export async function GET(request: NextRequest) {
  return POST(request);
}
