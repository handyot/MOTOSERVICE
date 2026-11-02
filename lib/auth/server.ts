import { redirect } from 'next/navigation';
import { createClient } from '../supabase/server';
import type { AppRole, AuthAccount, UserProfile } from '../../types';
import { generateUsername } from './username-core.mjs';

export interface ServerUserResult {
  user: {
    id: string;
    email?: string;
    user_metadata?: Record<string, unknown>;
  } | null;
  error?: string | null;
}

/**
 * Obtiene el usuario autenticado desde la sesión segura de Supabase.
 * Utiliza supabase.auth.getUser() validado en el servidor.
 */
export async function getServerAuthUser(): Promise<ServerUserResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return { user: null, error: error?.message || null };
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        user_metadata: user.user_metadata,
      },
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al consultar sesión de usuario';
    return { user: null, error: message };
  }
}

/**
 * Obtiene el perfil de un usuario desde la tabla public.profiles.
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, username, phone, created_at, updated_at')
      .eq('id', userId)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return {
      id: data.id,
      fullName: data.full_name,
      username: data.username || generateUsername(data.full_name),
      phone: data.phone,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  } catch (err) {
    console.error('[MOTOSERVICE] Error al obtener perfil:', err);
    return null;
  }
}

/**
 * Verifica si un correo está explícitamente configurado como administrador del sistema
 * mediante variables de entorno del servidor (fallback para mantenimiento o migración).
 */
export function isConfiguredAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const adminEmailsEnv = process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || '';
  if (!adminEmailsEnv.trim()) return false;
  const adminList = adminEmailsEnv
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return adminList.includes(email.trim().toLowerCase());
}

/**
 * Obtiene de forma confiable el rol del usuario desde la tabla public.user_roles.
 * Nunca confía en metadatos del cliente ni cookies no firmadas.
 */
export async function getUserRole(userId: string, userEmail?: string | null): Promise<AppRole | null> {
  // Verificación preliminar por variable de entorno de administrador del sistema
  if (isConfiguredAdminEmail(userEmail)) {
    return 'admin';
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.warn(
        `[MOTOSERVICE Auth Warning] No se pudo consultar la tabla user_roles para userId ${userId}: [${error.code}] ${error.message}`
      );
      return null;
    }

    if (!data) {
      return null;
    }

    if (data.role === 'admin' || data.role === 'customer') {
      return data.role;
    }

    return 'customer';
  } catch (err) {
    console.error('[MOTOSERVICE] Error al obtener rol:', err);
    return null;
  }
}

/**
 * Obtiene la cuenta completa del usuario autenticado (identidad + perfil + rol verificado).
 */
export async function getAuthenticatedAccount(): Promise<AuthAccount | null> {
  const { user } = await getServerAuthUser();
  if (!user) {
    return null;
  }

  const [profile, role] = await Promise.all([
    getUserProfile(user.id),
    getUserRole(user.id, user.email),
  ]);

  const metaFullName =
    typeof user.user_metadata?.full_name === 'string' && user.user_metadata.full_name.trim()
      ? (user.user_metadata.full_name.trim() as string)
      : null;
  const metaPhone =
    typeof user.user_metadata?.phone === 'string' && user.user_metadata.phone.trim()
      ? (user.user_metadata.phone.trim() as string)
      : null;
  const metaUsername =
    typeof user.user_metadata?.username === 'string' && user.user_metadata.username.trim()
      ? (user.user_metadata.username.trim() as string)
      : null;

  const resolvedFullName = profile?.fullName || metaFullName || user.email?.split('@')[0] || 'Cliente';
  const resolvedUsername = profile?.username || metaUsername || generateUsername(resolvedFullName);
  const resolvedRole = role || (isConfiguredAdminEmail(user.email) ? 'admin' : 'customer');

  return {
    id: user.id,
    email: user.email || '',
    fullName: resolvedFullName,
    username: resolvedUsername,
    phone: profile?.phone || metaPhone || null,
    role: resolvedRole,
    createdAt: profile?.createdAt || new Date().toISOString(),
  };
}

/**
 * Guardián de servidor para rutas de clientes (/cuenta).
 * Redirige a /login si no existe una sesión válida.
 */
export async function requireAuth(redirectTo = '/cuenta'): Promise<AuthAccount> {
  const account = await getAuthenticatedAccount();
  if (!account) {
    redirect(`/login?redirectTo=${encodeURIComponent(redirectTo)}`);
  }
  return account;
}

/**
 * Verifica permisos de administrador en el servidor (para comprobaciones internas como visualización de pedidos).
 */
export async function requireAdmin(): Promise<AuthAccount> {
  const account = await getAuthenticatedAccount();
  if (!account) {
    redirect('/login');
  }

  if (account.role !== 'admin') {
    redirect('/cuenta?error=unauthorized');
  }

  return account;
}
