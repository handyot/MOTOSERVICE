import { redirect } from 'next/navigation';
import { createClient } from '../supabase/server';
import type { AppRole, AuthAccount, UserProfile } from '../../types';

export interface ServerUserResult {
  user: {
    id: string;
    email?: string;
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
      .select('id, full_name, phone, created_at, updated_at')
      .eq('id', userId)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return {
      id: data.id,
      fullName: data.full_name,
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
 * Obtiene de forma confiable el rol del usuario desde la tabla public.user_roles.
 * Nunca confía en metadatos del cliente ni cookies no firmadas.
 */
export async function getUserRole(userId: string): Promise<AppRole | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !data) {
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
    getUserRole(user.id),
  ]);

  return {
    id: user.id,
    email: user.email || '',
    fullName: profile?.fullName || user.email?.split('@')[0] || 'Cliente',
    phone: profile?.phone || null,
    role: role || 'customer',
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
 * Guardián de servidor para rutas administrativas (/admin).
 * Redirige a /login si no hay sesión, o a /cuenta?error=unauthorized si no es admin.
 */
export async function requireAdmin(): Promise<AuthAccount> {
  const account = await getAuthenticatedAccount();
  if (!account) {
    redirect('/login?redirectTo=/admin');
  }

  if (account.role !== 'admin') {
    redirect('/cuenta?error=unauthorized');
  }

  return account;
}
