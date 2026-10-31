import { NextResponse } from 'next/server';
import { processCulqiCharge } from '@/lib/payments/culqi';
import { getOrderSecurely } from '@/lib/orders/order-service';
import { createClient } from '@/lib/supabase/server';
import { generateProvisionalFiscalReceipt, calculateTaxBreakdown } from '@/lib/documents/fiscal-service';

export async function POST(request: Request) {
  try {
    const { orderId, tokenId, guestToken } = await request.json();

    if (!orderId || !tokenId) {
      return NextResponse.json(
        { success: false, error: 'Identificador de pedido y token de pago son obligatorios.' },
        { status: 400 }
      );
    }

    // Obtener pedido autorizado para verificar monto real del servidor
    const order = await getOrderSecurely({ orderId, guestToken, isAdmin: true });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Pedido no encontrado o no autorizado.' },
        { status: 404 }
      );
    }

    if (order.paymentStatus === 'pagado') {
      return NextResponse.json({
        success: true,
        message: 'Este pedido ya cuenta con un pago confirmado previamente.',
        status: 'pagado',
      });
    }

    // Ejecutar cobro mediante el adaptador de Culqi
    const chargeResult = await processCulqiCharge({
      orderId: order.id,
      orderNumber: order.orderNumber,
      amountPen: order.total,
      customerEmail: order.customerEmail,
      tokenId,
    });

    if (!chargeResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: chargeResult.errorMessage || 'El cobro no pudo ser procesado.',
          status: 'rechazado',
        },
        { status: 402 }
      );
    }

    // Registrar pago y actualizar estados del pedido en base de datos
    try {
      const supabase = await createClient();

      await supabase.from('pagos_intentos').insert({
        id_pedido: order.id,
        proveedor: 'culqi',
        referencia_externa: chargeResult.chargeId,
        monto: order.total,
        moneda: 'PEN',
        estado: 'pagado',
        metadatos: {
          authorizationCode: chargeResult.authorizationCode,
          isMock: chargeResult.isMock,
        },
      });

      await supabase
        .from('pedidos')
        .update({
          estado_pago: 'pagado',
          estado_pedido: 'confirmado',
          estado_comprobante: 'listo',
          updated_at: new Date().toISOString(),
        })
        .eq('id_pedido', order.id);

      // Generar registro de comprobante fiscal en estado listo
      const taxBreakdown = calculateTaxBreakdown({
        subtotal: order.subtotal,
        discount: order.discount,
        shipping: order.shippingCost,
      });

      const provisionalDoc = generateProvisionalFiscalReceipt({
        type: order.invoiceType,
        orderNumber: order.orderNumber,
        docNumber: order.docNumber,
        businessName: order.docBusinessName || undefined,
        taxBreakdown,
      });

      await supabase.from('documentos_fiscales').insert({
        id_pedido: order.id,
        tipo: provisionalDoc.tipo,
        serie: provisionalDoc.serie,
        numero: provisionalDoc.numero,
        estado: 'listo',
        datos_receptor: provisionalDoc.datosReceptor,
        total_gravada: provisionalDoc.taxableAmount,
        total_igv: provisionalDoc.igvAmount,
        total_comprobante: provisionalDoc.totalAmount,
        observaciones: provisionalDoc.observacion,
      });
    } catch (dbErr) {
      console.warn('[MOTOSERVICE] Advertencia al persistir pago en DB:', dbErr);
    }

    return NextResponse.json({
      success: true,
      chargeId: chargeResult.chargeId,
      status: 'pagado',
      authorizationCode: chargeResult.authorizationCode,
      isMock: chargeResult.isMock,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al procesar pago.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
