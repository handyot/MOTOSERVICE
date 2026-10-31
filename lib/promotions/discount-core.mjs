import { validateEmail } from '../auth/validations.mjs';

export const FIRST_PURCHASE_COUPON = 'BIENVENIDO5';
export const DEFAULT_DISCOUNT_PERCENT = 5;

const memorySubscriptions = new Map();
const memoryRedemptions = new Set();

export function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

export function validateCoupon(input) {
  const { email, code, subtotal } = input;

  if (!code || typeof code !== 'string') {
    return { valid: false, discountAmount: 0, newTotal: subtotal, error: 'Código de cupón requerido.' };
  }

  if (subtotal <= 0) {
    return { valid: false, discountAmount: 0, newTotal: 0, error: 'El subtotal debe ser mayor a cero.' };
  }

  const normalizedCode = code.trim().toUpperCase();
  const normalizedEmail = normalizeEmail(email);

  if (normalizedCode === FIRST_PURCHASE_COUPON) {
    const alreadyRedeemed = memoryRedemptions.has(`${normalizedCode}:${normalizedEmail}`);

    if (alreadyRedeemed) {
      return {
        valid: false,
        discountAmount: 0,
        newTotal: subtotal,
        error: 'Este cupón de bienvenida ya ha sido utilizado para este correo electrónico.',
      };
    }

    const discountAmount = Math.round(subtotal * (DEFAULT_DISCOUNT_PERCENT / 100) * 100) / 100;
    const newTotal = Math.max(0, Math.round((subtotal - discountAmount) * 100) / 100);

    return {
      valid: true,
      code: FIRST_PURCHASE_COUPON,
      discountPercentage: DEFAULT_DISCOUNT_PERCENT,
      discountAmount,
      newTotal,
    };
  }

  return {
    valid: false,
    discountAmount: 0,
    newTotal: subtotal,
    error: 'El cupón ingresado no es válido o ha expirado.',
  };
}

export function recordCouponRedemptionCore(code, email) {
  const normalizedCode = code.trim().toUpperCase();
  const normalizedEmail = normalizeEmail(email);
  memoryRedemptions.add(`${normalizedCode}:${normalizedEmail}`);
}

export function registerCommercialSubscriptionCore(email, origin = 'tienda', consentVersion = 'v1.0') {
  const emailCheck = validateEmail(email);
  if (!emailCheck.valid) {
    throw new Error(emailCheck.error || 'Correo electrónico inválido.');
  }

  const normalized = normalizeEmail(email);
  const now = new Date().toISOString();
  memorySubscriptions.set(normalized, { consentDate: now, consentVersion, origin });

  return {
    success: true,
    couponCode: FIRST_PURCHASE_COUPON,
    message: '¡Te has suscrito con éxito! Tu cupón del 5% de descuento es BIENVENIDO5.',
  };
}
