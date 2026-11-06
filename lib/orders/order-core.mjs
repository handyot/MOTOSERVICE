import crypto from 'crypto';
import { FEATURED_PARTS } from '../constants.js';

export function generateGuestAccessToken() {
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  return { token, tokenHash };
}

export function verifyGuestToken(token, storedHash) {
  if (!token || !storedHash) return false;
  try {
    const computedHash = crypto.createHash('sha256').update(token).digest('hex');
    return crypto.timingSafeEqual(
      Buffer.from(computedHash, 'utf-8'),
      Buffer.from(storedHash, 'utf-8')
    );
  } catch {
    return false;
  }
}

export function getVerifiedCatalogPart(sku) {
  if (!sku || typeof sku !== 'string') return null;
  const normalizedSku = sku.trim().toUpperCase();
  const found = FEATURED_PARTS.find((p) => p.sku.toUpperCase() === normalizedSku);

  if (found) {
    return {
      sku: found.sku,
      name: found.name,
      price: found.price,
      currency: found.currency,
      category: found.categorySlug,
      isDirectSale: true,
      stockAvailable: found.inStock
        ? (typeof found.stock === 'number'
            ? found.stock
            : typeof found.stock_propio_ecomoto === 'number'
            ? found.stock_propio_ecomoto
            : 10)
        : 0,
      dataStatus: found.dataStatus || found.data_status || 'ACTIVO',
      estado: found.estado !== undefined ? found.estado : true,
    };
  }

  return null;
}

export function validateOrderStatusTransition(current, target, paymentStatus) {
  if (current === target) return { allowed: true };

  if (current === 'cancelado') {
    return { allowed: false, reason: 'Un pedido cancelado no puede reactivarse.' };
  }

  if (current === 'entregado') {
    return { allowed: false, reason: 'Un pedido entregado ha concluido su ciclo operativo.' };
  }

  if (target === 'confirmado' && paymentStatus !== 'pagado') {
    return {
      allowed: false,
      reason: 'No se puede confirmar un pedido cuyo pago no ha sido verificado como pagado.',
    };
  }

  const validTransitions = {
    pendiente_pago: ['confirmado', 'cancelado'],
    confirmado: ['en_preparacion', 'cancelado'],
    en_preparacion: ['despachado', 'cancelado'],
    despachado: ['entregado', 'cancelado'],
    entregado: [],
    cancelado: [],
  };

  const allowedNext = validTransitions[current] || [];
  if (!allowedNext.includes(target)) {
    return {
      allowed: false,
      reason: `Transición inválida desde «${current}» hacia «${target}».`,
    };
  }

  return { allowed: true };
}

export function maskEmail(email) {
  if (!email || typeof email !== 'string' || !email.includes('@')) return '***@***.com';
  const [local, domain] = email.split('@');
  const maskedLocal =
    local.length <= 2 ? `${local[0]}***` : `${local.slice(0, 2)}***${local.slice(-1)}`;
  return `${maskedLocal}@${domain}`;
}

export function maskName(name) {
  if (!name || typeof name !== 'string') return 'Cliente NeroElectric';
  return name
    .split(' ')
    .filter(Boolean)
    .map((word) => (word.length <= 2 ? word : `${word[0]}${'*'.repeat(Math.min(word.length - 1, 4))}`))
    .join(' ');
}

export function maskAddress(address) {
  if (!address || typeof address !== 'string') return 'Dirección protegida';
  const words = address.split(' ');
  if (words.length <= 2) return `${words[0]} ***`;
  return `${words.slice(0, 2).join(' ')} ***`;
}

/**
 * Valida las existencias físicas para un ítem solicitado contra el stock real (Issue #28).
 * Rechaza stock 0 o pedidos cuya cantidad supere las existencias disponibles en almacén.
 */
export function validateItemStock({ requestedQuantity, stockAvailable, partName, sku }) {
  if (requestedQuantity <= 0 || !Number.isInteger(requestedQuantity)) {
    return {
      valid: false,
      error: `Cantidad inválida para el producto ${partName || sku}.`,
    };
  }

  const available = typeof stockAvailable === 'number' ? stockAvailable : 0;

  if (available <= 0) {
    return {
      valid: false,
      error: `El repuesto «${partName || sku}» (SKU: ${sku}) no cuenta con existencias disponibles en almacén (stock: ${available}).`,
    };
  }

  if (requestedQuantity > available) {
    return {
      valid: false,
      error: `No hay suficiente stock para «${partName || sku}». Disponible: ${available} unidades.`,
    };
  }

  return { valid: true, remaining: available - requestedQuantity };
}

/**
 * Calcula el nuevo stock tras el descuento de existencias por venta confirmada (Issue #28).
 */
export function calculateDeductedStock(currentStock, quantitySold) {
  const current = typeof currentStock === 'number' ? currentStock : 0;
  const sold = typeof quantitySold === 'number' ? quantitySold : 0;
  return Math.max(0, current - sold);
}
