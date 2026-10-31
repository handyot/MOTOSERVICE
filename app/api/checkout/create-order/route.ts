import { NextResponse } from 'next/server';
import { createOrder } from '@/lib/orders/order-service';
import { getServerAuthUser } from '@/lib/auth/server';
import { GuestCheckoutInput } from '@/types';

export async function POST(request: Request) {
  try {
    const body: GuestCheckoutInput = await request.json();

    if (!body || !body.items || body.items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'El carrito no contiene productos válidos.' },
        { status: 400 }
      );
    }

    // Verificar si el comprador tiene una sesión autenticada
    const { user } = await getServerAuthUser();
    const authenticatedUserId = user ? user.id : null;

    // Crear pedido en servidor recalculando precios y existencias
    const { order, guestToken } = await createOrder(body, authenticatedUserId);

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        total: order.total,
        currency: order.currency,
        isGuest: order.isGuest,
      },
      guestToken, // Entregado de forma segura en la respuesta directa para el cliente invitado
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al procesar el pedido.';
    console.error('[MOTOSERVICE Checkout API] Error:', message);
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
