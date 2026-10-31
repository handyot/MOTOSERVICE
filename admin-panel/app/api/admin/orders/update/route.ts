import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/auth/server';
import { updateOrderStatus } from '@/lib/orders/order-service';
import type { OrderStatus } from '@/types';

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if (!auth.authorized) {
    return NextResponse.json(
      { success: false, error: auth.error },
      { status: auth.status }
    );
  }

  try {
    const body = await request.json();
    const { orderId, targetStatus, adminNotes } = body;

    if (!orderId || !targetStatus) {
      return NextResponse.json(
        { success: false, error: 'Se requiere orderId y targetStatus.' },
        { status: 400 }
      );
    }

    const result = await updateOrderStatus(
      String(orderId),
      targetStatus as OrderStatus,
      adminNotes ? String(adminNotes) : undefined
    );

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Estado del pedido actualizado a ${targetStatus}.`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al procesar solicitud';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
