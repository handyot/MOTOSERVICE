import type { SupabaseClient } from '@supabase/supabase-js';
import type { AdminUserRecord } from '../../types';

export interface ListUsersResult {
  success: boolean;
  users?: AdminUserRecord[];
  error?: string;
}

export async function listAdminUsers(supabase: SupabaseClient): Promise<ListUsersResult> {
  try {
    const [authRes, rolesRes, profilesRes] = await Promise.all([
      supabase.auth.admin.listUsers({ page: 1, perPage: 200 }),
      supabase.from('user_roles').select('*'),
      supabase.from('profiles').select('*'),
    ]);

    if (authRes.error) {
      return { success: false, error: authRes.error.message };
    }

    const rolesMap = new Map<string, 'admin' | 'customer'>();
    for (const r of rolesRes.data || []) {
      rolesMap.set(r.user_id, r.role as 'admin' | 'customer');
    }

    const profilesMap = new Map<string, { full_name: string; phone?: string | null }>();
    for (const p of profilesRes.data || []) {
      profilesMap.set(p.id, { full_name: p.full_name, phone: p.phone });
    }

    const now = new Date();
    const users: AdminUserRecord[] = (authRes.data?.users || []).map((u) => {
      const profile = profilesMap.get(u.id);
      const isBanned = Boolean(u.banned_until && new Date(u.banned_until) > now);

      return {
        id: u.id,
        email: u.email || 'Sin correo',
        fullName: profile?.full_name || (u.user_metadata?.full_name as string) || (u.email ? u.email.split('@')[0] : 'Usuario'),
        phone: profile?.phone || (u.user_metadata?.phone as string) || u.phone || null,
        role: rolesMap.get(u.id) || 'customer',
        isBanned,
        bannedUntil: u.banned_until || null,
        createdAt: u.created_at,
        lastSignInAt: u.last_sign_in_at || null,
      };
    });

    // Ordenar por fecha de creación descendente
    users.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return { success: true, users };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error desconocido al listar usuarios';
    return { success: false, error: msg };
  }
}

export async function setUserRole(
  supabase: SupabaseClient,
  userId: string,
  role: 'admin' | 'customer'
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('user_roles').upsert(
      { user_id: userId, role },
      { onConflict: 'user_id' }
    );

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Error al actualizar rol' };
  }
}

export async function toggleUserBan(
  supabase: SupabaseClient,
  userId: string,
  isBanned: boolean
): Promise<{ success: boolean; error?: string; bannedUntil?: string | null }> {
  try {
    const banDuration = isBanned ? '876000h' : 'none';
    const { data, error } = await supabase.auth.admin.updateUserById(userId, {
      ban_duration: banDuration,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      bannedUntil: data?.user?.banned_until || null,
    };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Error al modificar estado de acceso' };
  }
}

export async function resetUserPassword(
  supabase: SupabaseClient,
  payload: {
    userId: string;
    email?: string;
    mode: 'direct' | 'link';
    password?: string;
  }
): Promise<{ success: boolean; recoveryLink?: string; error?: string }> {
  try {
    if (payload.mode === 'direct' && payload.password) {
      const { error } = await supabase.auth.admin.updateUserById(payload.userId, {
        password: payload.password,
      });

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    }

    if (payload.mode === 'link' && payload.email) {
      const { data, error } = await supabase.auth.admin.generateLink({
        type: 'recovery',
        email: payload.email,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return {
        success: true,
        recoveryLink: data?.properties?.action_link || undefined,
      };
    }

    return { success: false, error: 'Parámetros insuficientes para restablecer contraseña' };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Error al procesar contraseña' };
  }
}

export async function createAdminUser(
  supabase: SupabaseClient,
  payload: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    role: 'admin' | 'customer';
  }
): Promise<{ success: boolean; user?: AdminUserRecord; error?: string }> {
  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email: payload.email,
      password: payload.password,
      email_confirm: true,
      user_metadata: {
        full_name: payload.fullName,
        phone: payload.phone || null,
      },
    });

    if (error || !data.user) {
      return { success: false, error: error?.message || 'No se pudo crear la cuenta' };
    }

    const userId = data.user.id;

    // Crear o actualizar en profiles
    await supabase.from('profiles').upsert(
      {
        id: userId,
        full_name: payload.fullName,
        phone: payload.phone || null,
      },
      { onConflict: 'id' }
    );

    // Asignar rol
    await supabase.from('user_roles').upsert(
      {
        user_id: userId,
        role: payload.role,
      },
      { onConflict: 'user_id' }
    );

    const newUser: AdminUserRecord = {
      id: userId,
      email: payload.email,
      fullName: payload.fullName,
      phone: payload.phone || null,
      role: payload.role,
      isBanned: false,
      bannedUntil: null,
      createdAt: data.user.created_at,
      lastSignInAt: null,
    };

    return { success: true, user: newUser };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Error al crear usuario' };
  }
}
