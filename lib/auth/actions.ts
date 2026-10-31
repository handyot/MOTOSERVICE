'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '../supabase/server';
import { validateFullName, validatePhone } from './validations';

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

  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      full_name: fullName,
      phone: phone || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  if (updateError) {
    return {
      success: false,
      error: `No se pudo actualizar el perfil: ${updateError.message}`,
    };
  }

  revalidatePath('/cuenta');
  revalidatePath('/admin');

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
