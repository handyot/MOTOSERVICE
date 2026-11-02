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
      stockAvailable: found.inStock ? 15 : 0,
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
