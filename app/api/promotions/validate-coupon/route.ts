import { NextResponse } from 'next/server';
import { validateCoupon } from '@/lib/promotions/discount-service';

export async function POST(request: Request) {
  try {
    const { email, code, subtotal } = await request.json();

    if (!code || !email) {
      return NextResponse.json(
        { valid: false, error: 'Código de cupón y correo electrónico son requeridos.' },
        { status: 400 }
      );
    }

    const result = await validateCoupon({
      email,
      code,
      subtotal: Number(subtotal) || 0,
    });

    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al validar cupón.';
    return NextResponse.json({ valid: false, error: message }, { status: 400 });
  }
}
