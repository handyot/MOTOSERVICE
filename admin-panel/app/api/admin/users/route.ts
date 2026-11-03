import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/auth/server';
import { createCatalogWriteClient } from '@/lib/supabase/server';
import {
  listAdminUsers,
  setUserRole,
  toggleUserBan,
  resetUserPassword,
  createAdminUser,
} from '@/lib/users/user-service';
import { validateUserAction } from '@/lib/users/user-core.mjs';

export const dynamic = 'force-dynamic';

export async function GET() {
  const auth = await requireAdminApi();
  if (!auth.authorized) {
    return NextResponse.json(
      { success: false, error: auth.error },
      { status: auth.status }
    );
  }

  const supabase = await createCatalogWriteClient();
  const result = await listAdminUsers(supabase);

  if (!result.success) {
    return NextResponse.json(
      { success: false, error: result.error || 'Error al listar usuarios' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    users: result.users,
    total: result.users?.length || 0,
  });
}

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if (!auth.authorized) {
    return NextResponse.json(
      { success: false, error: auth.error },
      { status: auth.status }
    );
  }

  const currentAdminId = auth.account.id;
  const supabase = await createCatalogWriteClient();

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Cuerpo JSON inválido' }, { status: 400 });
  }

  const action = String(body.action || '').trim();
  const validation = validateUserAction(action, body, currentAdminId);

  if (!validation.valid) {
    return NextResponse.json({ success: false, error: validation.error }, { status: 400 });
  }

  if (action === 'set_role') {
    const userId = String(body.userId);
    const role = body.role as 'admin' | 'customer';
    const result = await setUserRole(supabase, userId, role);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Rol asignado correctamente como ${role}.`,
      userId,
      role,
    });
  }

  if (action === 'toggle_ban') {
    const userId = String(body.userId);
    const isBanned = Boolean(body.isBanned);
    const result = await toggleUserBan(supabase, userId, isBanned);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: isBanned ? 'Acceso bloqueado satisfactoriamente.' : 'Acceso restaurado con éxito.',
      userId,
      isBanned,
      bannedUntil: result.bannedUntil,
    });
  }

  if (action === 'reset_password') {
    const userId = String(body.userId);
    const mode = (body.mode || 'link') as 'direct' | 'link';
    const email = body.email ? String(body.email).trim() : undefined;
    const password = body.password ? String(body.password) : undefined;

    const result = await resetUserPassword(supabase, {
      userId,
      mode,
      email,
      password,
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message:
        mode === 'direct'
          ? 'Contraseña actualizada correctamente.'
          : 'Enlace de restablecimiento generado.',
      recoveryLink: result.recoveryLink,
    });
  }

  if (action === 'create_user') {
    const email = String(body.email).trim();
    const password = String(body.password);
    const fullName = String(body.fullName).trim();
    const phone = body.phone ? String(body.phone).trim() : undefined;
    const role = (body.role || 'customer') as 'admin' | 'customer';

    const result = await createAdminUser(supabase, {
      email,
      password,
      fullName,
      phone,
      role,
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Usuario ${fullName} creado exitosamente con rol ${role}.`,
      user: result.user,
    });
  }

  return NextResponse.json({ success: false, error: 'Acción no reconocida' }, { status: 400 });
}
