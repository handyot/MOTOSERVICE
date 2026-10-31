import { NextResponse } from 'next/server';
import { registerCommercialSubscription } from '@/lib/promotions/discount-service';

export async function POST(request: Request) {
  try {
    const { email, origin, consentVersion } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'El correo electrónico es obligatorio.' },
        { status: 400 }
      );
    }

    const result = await registerCommercialSubscription({
      email,
      origin: origin || 'checkout',
      consentVersion: consentVersion || 'v1.0',
    });

    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al registrar suscripción.';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
