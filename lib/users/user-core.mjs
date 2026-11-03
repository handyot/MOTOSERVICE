/**
 * MOTOSERVICE — Lógica pura y validaciones de Gestión de Usuarios y Accesos
 * Compatible con Node.js ESM y navegadores.
 */

export const ALLOWED_USER_ROLES = ['admin', 'customer'];

/**
 * @param {string} action
 * @param {Record<string, any>} [payload]
 * @param {string | null} [currentAdminId]
 * @returns {{ valid: boolean; error?: string }}
 */
export function validateUserAction(action, payload = {}, currentAdminId = null) {
  if (!action) {
    return { valid: false, error: 'Acción no especificada.' };
  }

  const { userId, role, isBanned, mode, password, email, fullName } = payload;

  if (action === 'set_role') {
    if (!userId || typeof userId !== 'string') {
      return { valid: false, error: 'Identificador de usuario inválido.' };
    }
    if (!ALLOWED_USER_ROLES.includes(role)) {
      return { valid: false, error: `Rol inválido. Roles permitidos: ${ALLOWED_USER_ROLES.join(', ')}` };
    }
    if (userId === currentAdminId && role !== 'admin') {
      return {
        valid: false,
        error: 'Por seguridad, no puedes revocar tu propio rol de administrador mientras estás en sesión.',
      };
    }
    return { valid: true };
  }

  if (action === 'toggle_ban') {
    if (!userId || typeof userId !== 'string') {
      return { valid: false, error: 'Identificador de usuario inválido.' };
    }
    if (typeof isBanned !== 'boolean') {
      return { valid: false, error: 'El estado de bloqueo (isBanned) debe ser booleano.' };
    }
    if (userId === currentAdminId && isBanned) {
      return {
        valid: false,
        error: 'Por seguridad, no puedes bloquear tu propia cuenta de administrador en sesión.',
      };
    }
    return { valid: true };
  }

  if (action === 'reset_password') {
    if (!userId || typeof userId !== 'string') {
      return { valid: false, error: 'Identificador de usuario inválido.' };
    }
    const resetMode = mode || 'link';
    if (resetMode === 'direct') {
      if (!password || typeof password !== 'string' || password.trim().length < 8) {
        return { valid: false, error: 'La nueva contraseña debe contener al menos 8 caracteres.' };
      }
    } else if (resetMode === 'link') {
      if (!email || !email.includes('@')) {
        return { valid: false, error: 'Correo electrónico inválido para generar enlace de recuperación.' };
      }
    } else {
      return { valid: false, error: 'Modalidad de restablecimiento desconocida. Use direct o link.' };
    }
    return { valid: true };
  }

  if (action === 'create_user') {
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return { valid: false, error: 'Correo electrónico inválido.' };
    }
    if (!password || typeof password !== 'string' || password.trim().length < 8) {
      return { valid: false, error: 'La contraseña inicial debe tener un mínimo de 8 caracteres.' };
    }
    if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
      return { valid: false, error: 'El nombre completo debe tener al menos 2 caracteres.' };
    }
    const userRole = role || 'customer';
    if (!ALLOWED_USER_ROLES.includes(userRole)) {
      return { valid: false, error: `Rol inválido: ${userRole}.` };
    }
    return { valid: true };
  }

  return { valid: false, error: `Acción no soportada: ${action}` };
}

export function filterUsers(users = [], { search = '', role = 'ALL', status = 'ALL' } = {}) {
  const query = (search || '').trim().toLowerCase();

  return (users || []).filter((u) => {
    // Filtro por rol
    if (role !== 'ALL' && u.role !== role) {
      return false;
    }

    // Filtro por estado
    if (status === 'active' && u.isBanned) return false;
    if (status === 'banned' && !u.isBanned) return false;

    // Búsqueda textual
    if (!query) return true;

    const emailMatch = (u.email || '').toLowerCase().includes(query);
    const nameMatch = (u.fullName || '').toLowerCase().includes(query);
    const phoneMatch = (u.phone || '').toLowerCase().includes(query);
    const idMatch = (u.id || '').toLowerCase().includes(query);

    return emailMatch || nameMatch || phoneMatch || idMatch;
  });
}

export function formatUserStatus(user) {
  if (user?.isBanned) {
    return {
      label: 'Bloqueado',
      badgeClass: 'bg-rose-950/80 text-rose-300 border border-rose-800',
      dotClass: 'bg-rose-500',
    };
  }
  return {
    label: 'Activo',
    badgeClass: 'bg-emerald-950/80 text-emerald-300 border border-emerald-800',
    dotClass: 'bg-emerald-500',
  };
}
