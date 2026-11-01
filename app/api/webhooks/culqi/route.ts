import { NextResponse } from 'next/server';
import {
  verifyCulqiWebhookSignature,
  handleCulqiWebhookEvent,
  CulqiWebhookPayload,
} from '@/lib/payments/culqi';
import { createClient, createOrderAdminClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-culqi-signature');
    const webhookSecret = process.env.CULQI_WEBHOOK_SECRET;

    // 1. Validar autenticidad de la firma
    const isValid = verifyCulqiWebhookSignature(rawBody, signature, webhookSecret);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Firma de webhook Culqi inválida o no autenticada.' },
        { status: 401 }
      );
    }

    const payload: CulqiWebhookPayload = JSON.parse(rawBody);

    // 2. Procesamiento idempotente
    const result = await handleCulqiWebhookEvent(payload);

    if (result.alreadyProcessed) {
      return NextResponse.json({
        received: true,
        message: 'Evento ya procesado previamente (idempotente).',
      });
    }

    // 3. Si el evento afecta a un pedido, actualizarlo en Supabase
    if (result.orderId && result.status) {
      try {
        const supabase = createOrderAdminClient() || (await createClient());
        await supabase
          .from('pedidos')
          .update({
            estado_pago: result.status,
            estado_pedido: result.status === 'pagado' ? 'confirmado' : 'pendiente_pago',
            updated_at: new Date().toISOString(),
          })
          .eq('id_pedido', result.orderId);
      } catch (dbErr) {
        console.warn('[MOTOSERVICE Webhook] No se pudo actualizar DB:', dbErr);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error en webhook Culqi';
    console.error('[MOTOSERVICE Culqi Webhook] Error:', message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
