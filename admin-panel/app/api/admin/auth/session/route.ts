import { NextResponse } from 'next/server';
import { getAuthenticatedAccount } from '@/lib/auth/server';

export async function GET() {
  const account = await getAuthenticatedAccount();

  if (!account) {
    return NextResponse.json(
      { authenticated: false, authorized: false, error: 'Sin sesión activa.' },
      { status: 401 }
    );
  }

  if (account.role !== 'admin') {
    return NextResponse.json(
      {
        authenticated: true,
        authorized: false,
        role: account.role,
        email: account.email,
        error: 'Acceso denegado: Tu cuenta tiene rol de cliente (customer) y no posee permisos administrativos.',
      },
      { status: 403 }
    );
  }

  return NextResponse.json({
    authenticated: true,
    authorized: true,
    role: account.role,
    account,
  });
}
