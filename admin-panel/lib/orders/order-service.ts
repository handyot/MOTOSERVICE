/**
 * MOTOSERVICE ADMIN PANEL — Servicio Administrativo de Pedidos
 *
 * Aplica la máquina de estados verificada (validateOrderStatusTransition)
 * sobre los pedidos en public.pedidos.
 */

import { createClient, createCatalogWriteClient } from '../supabase/server';
import { validateOrderStatusTransition } from './order-core.mjs';
import type { OrderStatus } from '@/types';

export { validateOrderStatusTransition };

export async function updateOrderStatus(
  orderId: string,
  targetStatus: OrderStatus,
  adminNotes?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = (await createCatalogWriteClient()) || (await createClient());

    const { data: orderData, error: fetchError } = await supabase
      .from('pedidos')
      .select('id_pedido, estado_pedido, estado_pago, notas_admin')
      .eq('id_pedido', orderId)
      .maybeSingle();

    if (fetchError || !orderData) {
      return {
        success: false,
        error: fetchError?.message || 'Pedido no encontrado en la base de datos.',
      };
    }

    const check = validateOrderStatusTransition(
      orderData.estado_pedido,
      targetStatus,
      orderData.estado_pago
    );

    if (!check.allowed) {
      return { success: false, error: check.reason };
    }

    const updatedAt = new Date().toISOString();
    const dispatchStatusMap: Record<string, string> = {
      en_preparacion: 'preparado',
      despachado: 'despachado',
      entregado: 'entregado',
    };
    const targetDispatch = dispatchStatusMap[targetStatus];

    const updatePayload: Record<string, unknown> = {
      estado_pedido: targetStatus,
      notas_admin: adminNotes || orderData.notas_admin || null,
      updated_at: updatedAt,
    };
    if (targetDispatch) {
      updatePayload.estado_despacho = targetDispatch;
    }

    const { error: updateError } = await supabase
      .from('pedidos')
      .update(updatePayload)
      .eq('id_pedido', orderId);

    if (updateError) {
      return {
        success: false,
        error: `No se pudo actualizar el pedido: ${updateError.message}`,
      };
    }

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error interno al actualizar pedido';
    return { success: false, error: message };
  }
}
