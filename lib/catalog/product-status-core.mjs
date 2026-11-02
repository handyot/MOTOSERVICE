/**
 * MOTOSERVICE / NERO Electric Motors - Reglas de Ciclo de Vida y Estados de Producto
 * Estados comerciales: ACTIVO, PAUSADO, BLOQUEADO, OCULTO, ARCHIVADO
 */

export const PRODUCT_STATUSES = {
  ACTIVO: 'ACTIVO',
  PAUSADO: 'PAUSADO',
  BLOQUEADO: 'BLOQUEADO',
  OCULTO: 'OCULTO',
  ARCHIVADO: 'ARCHIVADO',
};

const NON_VISIBLE_STATUSES = new Set([
  PRODUCT_STATUSES.BLOQUEADO,
  PRODUCT_STATUSES.OCULTO,
  PRODUCT_STATUSES.ARCHIVADO,
]);

const NON_PURCHASABLE_STATUSES = new Set([
  PRODUCT_STATUSES.PAUSADO,
  PRODUCT_STATUSES.BLOQUEADO,
  PRODUCT_STATUSES.OCULTO,
  PRODUCT_STATUSES.ARCHIVADO,
]);

/**
 * Determina si un producto es apto para compra en carrito y pasarela de pago.
 */
export function canPurchaseProduct(dataStatus, estado = true) {
  if (estado === false) return false;
  const status = String(dataStatus || 'ACTIVO').toUpperCase();
  return !NON_PURCHASABLE_STATUSES.has(status);
}

/**
 * Determina si un producto debe aparecer en búsquedas, filtros y listados del catálogo público.
 */
export function isProductVisibleInCatalog(dataStatus, estado = true) {
  if (estado === false) return false;
  const status = String(dataStatus || 'ACTIVO').toUpperCase();
  return !NON_VISIBLE_STATUSES.has(status);
}

/**
 * Determina si VoltIA puede recomendar el producto en diagnósticos técnicos.
 */
export function canRecommendInVoltIA(dataStatus, estado = true) {
  if (estado === false) return false;
  const status = String(dataStatus || 'ACTIVO').toUpperCase();
  return !NON_PURCHASABLE_STATUSES.has(status);
}

/**
 * Valida la transición de estado solicitada desde el panel administrativo.
 */
export function validateProductAction(currentStatus, action, payload = {}) {
  const current = String(currentStatus || 'ACTIVO').toUpperCase();
  const act = String(action || '').toUpperCase();

  switch (act) {
    case 'ACTIVAR': {
      if (current === PRODUCT_STATUSES.BLOQUEADO && !payload.confirmedUnlock) {
        return {
          allowed: false,
          error: 'Un producto bloqueado requiere confirmación explícita de desbloqueo administrativo.',
        };
      }
      if (payload.price !== undefined && Number(payload.price) <= 0) {
        return {
          allowed: false,
          error: 'Para activar el producto se requiere un precio unitario mayor a cero.',
        };
      }
      if (payload.name !== undefined && String(payload.name).trim().length < 3) {
        return {
          allowed: false,
          error: 'El producto debe tener un nombre comercial descriptivo para ser publicado.',
        };
      }
      return {
        allowed: true,
        targetStatus: PRODUCT_STATUSES.ACTIVO,
        targetEstado: true,
      };
    }

    case 'PAUSAR': {
      if (current === PRODUCT_STATUSES.ARCHIVADO) {
        return {
          allowed: false,
          error: 'Un producto archivado no puede pausarse directamente; debe reactivarse primero.',
        };
      }
      return {
        allowed: true,
        targetStatus: PRODUCT_STATUSES.PAUSADO,
        targetEstado: true,
      };
    }

    case 'BLOQUEAR': {
      const motivo = String(payload.motivoBloqueo || '').trim();
      if (!motivo || motivo.length < 5) {
        return {
          allowed: false,
          error: 'El motivo de bloqueo administrativo es obligatorio (mínimo 5 caracteres).',
        };
      }
      return {
        allowed: true,
        targetStatus: PRODUCT_STATUSES.BLOQUEADO,
        targetEstado: false,
        motivoBloqueo: motivo,
      };
    }

    case 'DESBLOQUEAR': {
      if (current !== PRODUCT_STATUSES.BLOQUEADO) {
        return {
          allowed: false,
          error: 'Solo se pueden desbloquear productos que se encuentren actualmente bloqueados.',
        };
      }
      return {
        allowed: true,
        targetStatus: PRODUCT_STATUSES.PAUSADO,
        targetEstado: true,
      };
    }

    case 'OCULTAR': {
      return {
        allowed: true,
        targetStatus: PRODUCT_STATUSES.OCULTO,
        targetEstado: false,
      };
    }

    case 'PUBLICAR': {
      return {
        allowed: true,
        targetStatus: PRODUCT_STATUSES.ACTIVO,
        targetEstado: true,
      };
    }

    case 'ELIMINAR':
    case 'ARCHIVAR': {
      return {
        allowed: true,
        targetStatus: PRODUCT_STATUSES.ARCHIVADO,
        targetEstado: false,
      };
    }

    default:
      return {
        allowed: false,
        error: `Acción comercial «${action}» no reconocida.`,
      };
  }
}

/**
 * Metadatos visuales y descriptivos para etiquetas de estado en la UI.
 */
export function getProductStatusBadge(dataStatus, estado = true) {
  if (estado === false && (!dataStatus || dataStatus === 'ACTIVO')) {
    return {
      status: PRODUCT_STATUSES.OCULTO,
      label: 'Oculto',
      bgColor: 'bg-slate-100',
      textColor: 'text-slate-700',
      borderColor: 'border-slate-300',
      description: 'Retirado de catálogo público',
    };
  }

  const status = String(dataStatus || 'ACTIVO').toUpperCase();

  switch (status) {
    case PRODUCT_STATUSES.ACTIVO:
      return {
        status: PRODUCT_STATUSES.ACTIVO,
        label: 'Activo / En venta',
        bgColor: 'bg-emerald-50',
        textColor: 'text-emerald-800',
        borderColor: 'border-emerald-200',
        description: 'Visible y disponible para compra',
      };

    case PRODUCT_STATUSES.PAUSADO:
      return {
        status: PRODUCT_STATUSES.PAUSADO,
        label: 'Pausado',
        bgColor: 'bg-amber-50',
        textColor: 'text-amber-800',
        borderColor: 'border-amber-200',
        description: 'Venta temporalmente suspendida',
      };

    case PRODUCT_STATUSES.BLOQUEADO:
      return {
        status: PRODUCT_STATUSES.BLOQUEADO,
        label: 'Bloqueado',
        bgColor: 'bg-red-50',
        textColor: 'text-red-800',
        borderColor: 'border-red-200',
        description: 'Bloqueo administrativo/seguridad',
      };

    case PRODUCT_STATUSES.OCULTO:
      return {
        status: PRODUCT_STATUSES.OCULTO,
        label: 'Oculto',
        bgColor: 'bg-slate-100',
        textColor: 'text-slate-700',
        borderColor: 'border-slate-300',
        description: 'No visible en catálogo público',
      };

    case PRODUCT_STATUSES.ARCHIVADO:
      return {
        status: PRODUCT_STATUSES.ARCHIVADO,
        label: 'Archivado (Baja)',
        bgColor: 'bg-zinc-100',
        textColor: 'text-zinc-600',
        borderColor: 'border-zinc-300',
        description: 'Dado de baja lógica',
      };

    default:
      return {
        status: PRODUCT_STATUSES.ACTIVO,
        label: 'Activo',
        bgColor: 'bg-emerald-50',
        textColor: 'text-emerald-800',
        borderColor: 'border-emerald-200',
        description: 'Estado estándar',
      };
  }
}
