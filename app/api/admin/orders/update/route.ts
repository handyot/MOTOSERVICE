import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/server';
import { updateOrderStatus } from '@/lib/orders/order-service';
import { OrderStatus } from '@/types';

export async function POST(request: Request) {
  try {
    // Validar autorización de administrador en el servidor
    await requireAdmin();

    const { orderId, targetStatus, adminNotes } = await request.json();

    if (!orderId || !targetStatus) {
      return NextResponse.json(
        { success: false, error: 'orderId y targetStatus son obligatorios.' },
        { status: 400 }
      );
    }

    const result = await updateOrderStatus(orderId, targetStatus as OrderStatus, adminNotes);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Estado actualizado correctamente.' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'No autorizado o error del servidor.';
    return NextResponse.json({ success: false, error: message }, { status: 403 });
  }
}
