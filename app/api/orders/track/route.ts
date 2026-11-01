import { NextResponse } from 'next/server';
import { trackOrderPublicly } from '@/lib/orders/order-service';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || searchParams.get('orderNumber') || '';
    const email = searchParams.get('email') || undefined;

    if (!query.trim()) {
      return NextResponse.json(
        { success: false, error: 'Ingresa un número de pedido (Ej: MS-2026-10001).' },
        { status: 400 }
      );
    }

    const tracking = await trackOrderPublicly({ query, customerEmail: email });

    if (!tracking) {
      return NextResponse.json(
        {
          success: false,
          error: `No encontramos ningún pedido asociado al código «${query.trim()}». Revisa que el código coincida con el de tu comprobante.`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, tracking });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al consultar pedido.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const query = body.query || body.orderNumber || '';
    const email = body.email || undefined;

    if (!query || typeof query !== 'string' || !query.trim()) {
      return NextResponse.json(
        { success: false, error: 'Ingresa un número de pedido o código válido.' },
        { status: 400 }
      );
    }

    const tracking = await trackOrderPublicly({ query, customerEmail: email });

    if (!tracking) {
      return NextResponse.json(
        {
          success: false,
          error: `No encontramos ningún pedido registrado con el código «${query.trim()}».`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, tracking });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al consultar pedido.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
