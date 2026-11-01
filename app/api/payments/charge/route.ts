import { NextResponse } from 'next/server';
import { processCulqiCharge, isCulqiConfigured } from '@/lib/payments/culqi';
import { getOrderSecurely, recordOrderPaymentInMemory } from '@/lib/orders/order-service';
import { createClient, createOrderAdminClient } from '@/lib/supabase/server';
import { generateProvisionalFiscalReceipt, calculateTaxBreakdown } from '@/lib/documents/fiscal-service';

export async function POST(request: Request) {
  try {
    const {
      orderId,
      tokenId,
      guestToken,
      challengeConfirmed,
      otpCode,
      deviceFingerprint,
      authentication3DS,
    } = await request.json();

    if (!orderId || !tokenId) {
      return NextResponse.json(
        { success: false, error: 'Identificador de pedido y token de pago son obligatorios.' },
        { status: 400 }
      );
    }

    const isTestEnv = process.env.NODE_ENV === 'test';

    // 1. Validar que la infraestructura de persistencia esté lista antes de cobrar
    const adminClient = createOrderAdminClient();
    if (!adminClient && !isTestEnv) {
      return NextResponse.json(
        {
          success: false,
          error: 'Servicio de persistencia no configurado en el servidor (SUPABASE_SECRET_KEY requerida). No se puede cobrar de forma segura.',
        },
        { status: 503 }
      );
    }

    // 2. Obtener pedido verificado desde Supabase
    const order = await getOrderSecurely({ orderId, guestToken, isAdmin: true });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Pedido no encontrado en la base de datos o no autorizado.' },
        { status: 404 }
      );
    }

    // 3. Protección de idempotencia y prevención de doble cobro
    if (order.paymentStatus === 'pagado') {
      return NextResponse.json({
        success: true,
        message: 'Este pedido ya cuenta con un pago confirmado previamente.',
        status: 'pagado',
      });
    }

    if (adminClient) {
      const { data: existingPaid } = await adminClient
        .from('pagos_intentos')
        .select('referencia_externa, estado')
        .eq('id_pedido', order.id)
        .eq('estado', 'pagado')
        .maybeSingle();

      if (existingPaid) {
        return NextResponse.json({
          success: true,
          message: 'Pago previamente confirmado para este pedido (Idempotencia).',
          chargeId: existingPaid.referencia_externa,
          status: 'pagado',
        });
      }
    }

    // 4. Validar configuración de pasarela antes de enviar cobro
    if (!isCulqiConfigured() && !isTestEnv) {
      return NextResponse.json(
        {
          success: false,
          error: 'Pasarela de pagos Culqi no configurada en el servidor (CULQI_PRIVATE_KEY o CULQI_SECRET_KEY requerida).',
        },
        { status: 503 }
      );
    }

    // 5. Ejecutar cobro mediante el adaptador de Culqi
    const nameParts = (order.customerName || 'Cliente').trim().split(/\s+/);
    const customerFirstName = nameParts[0] || 'Cliente';
    const customerLastName = nameParts.slice(1).join(' ') || 'NeroElectric';

    const chargeResult = await processCulqiCharge({
      orderId: order.id,
      orderNumber: order.orderNumber,
      amountPen: order.total,
      customerEmail: order.customerEmail,
      customerFirstName,
      customerLastName,
      customerPhone: order.customerPhone || '987654321',
      tokenId,
      deviceFingerprint: deviceFingerprint ? String(deviceFingerprint) : undefined,
      challengeConfirmed: Boolean(challengeConfirmed),
      otpCode: otpCode ? String(otpCode) : undefined,
      authentication3DS: authentication3DS && typeof authentication3DS === 'object' ? authentication3DS : undefined,
    });

    // 6. Rechazar aprobaciones simuladas en entornos fuera de pruebas unitarias
    if (chargeResult.isMock && !isTestEnv) {
      return NextResponse.json(
        {
          success: false,
          error: 'El cobro no pudo ser validado contra la pasarela oficial (respuesta simulada no permitida).',
          status: 'rechazado',
        },
        { status: 402 }
      );
    }

    if (!chargeResult.success) {
      if (chargeResult.status === 'requiere_3ds') {
        return NextResponse.json(
          {
            success: false,
            requires3DS: true,
            actionCode: chargeResult.actionCode || 'REVIEW',
            status: 'requiere_3ds',
            error: chargeResult.errorMessage || 'Autenticación 3DS requerida con su banco emisor.',
          },
          { status: 200 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: chargeResult.errorMessage || 'El cobro no pudo ser procesado.',
          status: chargeResult.status || 'rechazado',
          actionCode: chargeResult.actionCode,
        },
        { status: 402 }
      );
    }

    // 7. Si el cobro fue exitoso, verificar que exista un chargeId válido
    if (!chargeResult.chargeId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Respuesta inválida de la pasarela: identificador de cargo ausente.',
          status: 'rechazado',
        },
        { status: 502 }
      );
    }

    if (isTestEnv) {
      recordOrderPaymentInMemory(order.id, chargeResult.chargeId);
    }

    // 8. Registrar pago y actualizar estados del pedido en base de datos
    let dbSuccess = false;
    try {
      const supabase = adminClient || (await createClient());

      await supabase.from('pagos_intentos').insert({
        id_pedido: order.id,
        proveedor: 'culqi',
        referencia_externa: chargeResult.chargeId,
        idempotency_key: `pay_${order.id}_${chargeResult.chargeId}`,
        monto: order.total,
        moneda: 'PEN',
        estado: 'pagado',
        metadatos: {
          authorizationCode: chargeResult.authorizationCode,
          isMock: chargeResult.isMock,
          actionCode: chargeResult.actionCode,
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
        .eq('id_pedido', order.id)
        .neq('estado_pago', 'pagado');

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

      dbSuccess = true;
    } catch (dbErr) {
      console.error(
        `[MOTOSERVICE CRÍTICO] Cobro exitoso en Culqi (${chargeResult.chargeId}) para pedido ${order.id}, pero falló sincronización en base de datos:`,
        dbErr
      );
    }

    return NextResponse.json({
      success: true,
      chargeId: chargeResult.chargeId,
      status: 'pagado',
      authorizationCode: chargeResult.authorizationCode,
      isMock: chargeResult.isMock,
      persistedInDb: dbSuccess,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al procesar pago.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
