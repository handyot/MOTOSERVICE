'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '../supabase/server';
import { validateFullName, validatePhone } from './validations';
import { generateUsername } from './username-core.mjs';

export interface ActionState {
  success?: boolean;
  error?: string | null;
  message?: string | null;
}

/**
 * Server Action para actualizar el perfil del usuario autenticado.
 * Solo actualiza los campos permitidos (full_name, phone) del usuario en sesión.
 */
export async function updateProfileAction(
  _prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      error: 'Sesión no válida o expirada. Por favor, inicia sesión nuevamente.',
    };
  }

  const fullNameRaw = formData.get('fullName');
  const phoneRaw = formData.get('phone');

  const fullName = typeof fullNameRaw === 'string' ? fullNameRaw.trim() : '';
  const phone = typeof phoneRaw === 'string' ? phoneRaw.trim() : '';

  // Validación de servidor
  const nameValidation = validateFullName(fullName);
  if (!nameValidation.valid) {
    return { success: false, error: nameValidation.error };
  }

  const phoneValidation = validatePhone(phone);
  if (!phoneValidation.valid) {
    return { success: false, error: phoneValidation.error };
  }

  const newUsername = generateUsername(fullName);

  // 1. Sincronizar metadatos en Supabase Auth de forma segura
  try {
    await supabase.auth.updateUser({
      data: {
        full_name: fullName,
        username: newUsername,
        phone: phone || null,
      },
    });
  } catch (authMetaErr) {
    console.warn('[MOTOSERVICE Profile] No se pudo actualizar metadatos de auth:', authMetaErr);
  }

  // 2. Sincronizar en la tabla public.profiles si existe
  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      full_name: fullName,
      username: newUsername,
      phone: phone || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  if (updateError) {
    // Si la tabla profiles aún no existe en el esquema remoto (PGRST205),
    // no bloqueamos la experiencia ya que los datos quedaron preservados en auth.user_metadata
    if (updateError.code === 'PGRST205') {
      console.warn(
        '[MOTOSERVICE Profile Warning] Tabla profiles no existe en el esquema actual. Datos preservados en auth.user_metadata.'
      );
    } else {
      return {
        success: false,
        error: `No se pudo actualizar el perfil en la base de datos: ${updateError.message}`,
      };
    }
  }

  revalidatePath('/cuenta');

  return {
    success: true,
    message: 'Perfil actualizado correctamente.',
  };
}

/**
 * Server Action para cerrar sesión e invalidar tokens de Supabase.
 */
export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/login?message=logged_out');
}
