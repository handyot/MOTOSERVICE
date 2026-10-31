import { createClient } from '../supabase/server';
import {
  FIRST_PURCHASE_COUPON,
  DEFAULT_DISCOUNT_PERCENT,
  normalizeEmail,
  validateCoupon as coreValidateCoupon,
  recordCouponRedemptionCore,
  registerCommercialSubscriptionCore,
} from './discount-core.mjs';

export interface DiscountValidationInput {
  email: string;
  code: string;
  subtotal: number;
}

export interface DiscountValidationResult {
  valid: boolean;
  code?: string;
  discountPercentage?: number;
  discountAmount: number;
  newTotal: number;
  error?: string;
}

export { FIRST_PURCHASE_COUPON, DEFAULT_DISCOUNT_PERCENT, normalizeEmail };

export async function registerCommercialSubscription(params: {
  email: string;
  origin?: string;
  consentVersion?: string;
}): Promise<{ success: boolean; couponCode: string; message: string }> {
  const { email, origin = 'tienda', consentVersion = 'v1.0' } = params;
  const result = registerCommercialSubscriptionCore(email, origin, consentVersion);

  try {
    const supabase = await createClient();
    await supabase.from('suscripciones_newsletter').upsert(
      {
        email: normalizeEmail(email),
        consentimiento_comercial: true,
        version_consentimiento: consentVersion,
        fecha_consentimiento: new Date().toISOString(),
        origen: origin,
        activo: true,
      },
      { onConflict: 'email' }
    );
  } catch {
    // Memoria ya actualizada
  }

  return result;
}

export async function validateCoupon(
  input: DiscountValidationInput
): Promise<DiscountValidationResult> {
  const result = coreValidateCoupon(input);
  if (!result.valid) return result;

  // Comprobar adicionalmente en Supabase si está disponible
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('cupon_redenciones')
      .select('id_redencion')
      .eq('email_normalizado', normalizeEmail(input.email))
      .maybeSingle();

    if (data) {
      return {
        valid: false,
        discountAmount: 0,
        newTotal: input.subtotal,
        error: 'Este cupón de bienvenida ya ha sido utilizado para este correo electrónico.',
      };
    }
  } catch {
    // Si la DB falla, el resultado de memoria se mantiene
  }

  return result;
}

export async function recordCouponRedemption(params: {
  code: string;
  email: string;
  orderId: string;
  discountAmount: number;
}): Promise<void> {
  const { code, email, orderId, discountAmount } = params;
  recordCouponRedemptionCore(code, email);

  try {
    const supabase = await createClient();
    const { data: coupon } = await supabase
      .from('cupones_descuento')
      .select('id_cupon')
      .eq('codigo', code.trim().toUpperCase())
      .maybeSingle();

    if (coupon) {
      await supabase.from('cupon_redenciones').insert({
        id_cupon: coupon.id_cupon,
        id_pedido: orderId,
        email_normalizado: normalizeEmail(email),
        monto_descontado: discountAmount,
      });
    }
  } catch {
    // Memoria registrada
  }
}
