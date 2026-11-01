import crypto from 'crypto';

/**
 * MOTOSERVICE - Motor Central de Pagos Culqi 3DS v2
 * Adaptador seguro conforme al contrato oficial de API de Culqi.
 *
 * Variables de entorno de credenciales:
 * - CULQI_PRIVATE_KEY: Nombre canónico documentado en .env.example
 * - CULQI_SECRET_KEY: Nombre alternativo compatible según nomenclaturas estándar
 */

export function convertPenToCents(amountPen) {
  if (typeof amountPen !== 'number' || isNaN(amountPen) || amountPen <= 0) {
    throw new Error('El monto a cobrar debe ser un número positivo válido.');
  }
  return Math.round(amountPen * 100);
}

/**
 * Obtiene la clave secreta/privada de Culqi de forma canónica y compatible.
 */
export function getCulqiPrivateKey() {
  const key = process.env.CULQI_PRIVATE_KEY || process.env.CULQI_SECRET_KEY;
  return key && typeof key === 'string' && key.trim() !== '' ? key.trim() : null;
}

export function isTestEnvironment() {
  return process.env.NODE_ENV === 'test';
}

export function isCulqiConfigured() {
  return Boolean(getCulqiPrivateKey());
}

export async function processCulqiCharge(input) {
  const { orderId, amountPen, customerEmail, tokenId, orderNumber, challengeConfirmed, otpCode } = input;
  const amountCents = convertPenToCents(amountPen);

  if (!tokenId || typeof tokenId !== 'string') {
    return {
      success: false,
      orderId,
      status: 'rechazado',
      amountCents,
      currency: 'PEN',
      errorMessage: 'Token de pago de Culqi inválido o ausente.',
      isMock: false,
    };
  }

  // MODO ADAPTADOR EXCLUSIVO PARA PRUEBAS UNITARIAS OFFLINE CONTROLADAS (isTestEnvironment())
  const isSyntheticToken =
    tokenId === 'tok_test_valid_card' ||
    tokenId.includes('tok_test_declined') ||
    tokenId.includes('tok_test_3ds') ||
    tokenId.includes('rechazo');

  if (isSyntheticToken && isTestEnvironment()) {
    if (tokenId.includes('tok_test_3ds')) {
      if (challengeConfirmed && (otpCode === '123456' || otpCode === 'challenge_ok')) {
        const mock3dsChargeId = `chr_test_3ds_${crypto.randomBytes(8).toString('hex')}`;
        const mock3dsAuth = `3DS_OK_${Math.floor(100000 + Math.random() * 900000)}`;

        return {
          success: true,
          chargeId: mock3dsChargeId,
          orderId,
          status: 'pagado',
          amountCents,
          currency: 'PEN',
          authorizationCode: mock3dsAuth,
          referenceCode: `REF-${mock3dsChargeId}`,
          isMock: true,
        };
      }

      return {
        success: false,
        orderId,
        status: 'requiere_3ds',
        requires3DS: true,
        amountCents,
        currency: 'PEN',
        errorMessage: 'La tarjeta requiere autenticación adicional 3DS con su banco emisor (Challenge). Para pruebas directas, utiliza las tarjetas de Venta Exitosa autorizadas por Culqi.',
        actionCode: 'REVIEW',
        isMock: true,
      };
    }

    if (tokenId.includes('tok_test_declined') || tokenId.includes('rechazo')) {
      return {
        success: false,
        orderId,
        status: 'rechazado',
        amountCents,
        currency: 'PEN',
        errorMessage: 'Tarjeta declinada por la entidad emisora (Prueba Culqi 3DS).',
        isMock: true,
      };
    }

    const mockChargeId = `chr_test_${crypto.randomBytes(8).toString('hex')}`;
    const mockAuthCode = `AUTH_${Math.floor(100000 + Math.random() * 900000)}`;

    return {
      success: true,
      chargeId: mockChargeId,
      orderId,
      status: 'pagado',
      amountCents,
      currency: 'PEN',
      authorizationCode: mockAuthCode,
      referenceCode: `REF-${mockChargeId}`,
      isMock: true,
    };
  }

  // Si no hay credenciales configuradas en el servidor, FALLAR DE FORMA CERRADA
  // Jamás simular una aprobación ante un token real si no se puede ejecutar el cargo auténtico
  if (!isCulqiConfigured()) {
    return {
      success: false,
      orderId,
      status: 'rechazado',
      amountCents,
      currency: 'PEN',
      errorMessage: 'Configuración de pasarela incompleta: CULQI_PRIVATE_KEY o CULQI_SECRET_KEY no está configurada en el servidor. Transacción rechazada de forma segura.',
      isMock: false,
    };
  }

  try {
    const chargeBody = {
      amount: amountCents,
      currency_code: 'PEN',
      email: customerEmail,
      source_id: tokenId,
      description: `MOTOSERVICE - Pedido ${orderNumber}`,
      metadata: { orderId, orderNumber },
      antifraud_details: {
        first_name: input.customerFirstName || 'Cliente',
        last_name: input.customerLastName || 'NeroElectric',
        phone_number: input.customerPhone || '987654321',
        device_finger_print_id: input.deviceFingerprint || '8019959c-fab1-49eb-bbbe-b846d308d8df',
      },
    };

    if (input.authentication3DS) {
      chargeBody.authentication_3DS = input.authentication3DS;
    }

    const privateKey = getCulqiPrivateKey();
    const response = await fetch('https://api.culqi.com/v2/charges', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${privateKey}`,
      },
      body: JSON.stringify(chargeBody),
    });

    const data = await response.json();

    // HTTP 201: Cargo creado exitosamente por Culqi
    if (response.status === 201 && data.object === 'charge' && data.id) {
      if (data.outcome && data.outcome.type && data.outcome.type !== 'venta_exitosa') {
        return {
          success: false,
          orderId,
          status: 'rechazado',
          amountCents,
          currency: 'PEN',
          actionCode: data.outcome.code,
          errorMessage: data.outcome.user_message || 'Transacción no autorizada por el emisor.',
          isMock: false,
        };
      }

      return {
        success: true,
        chargeId: data.id,
        orderId,
        status: 'pagado',
        amountCents,
        currency: 'PEN',
        authorizationCode: data.outcome?.code || 'AUT0000',
        referenceCode: data.reference_code || data.id,
        isMock: false,
      };
    }

    // HTTP 200: Reto de Autenticación 3DS o Decisión Antifraude (Culqi 3DS v2)
    if (response.status === 200) {
      if (data.action_code === 'REVIEW') {
        return {
          success: false,
          orderId,
          status: 'requiere_3ds',
          requires3DS: true,
          actionCode: 'REVIEW',
          amountCents,
          currency: 'PEN',
          errorMessage: data.user_message || 'Autenticación 3DS requerida con su banco emisor.',
          isMock: false,
        };
      }

      if (data.action_code === 'DENIED') {
        return {
          success: false,
          orderId,
          status: 'rechazado',
          requires3DS: false,
          actionCode: 'DENIED',
          amountCents,
          currency: 'PEN',
          errorMessage: data.user_message || 'Transacción denegada por reglas de prevención de fraude.',
          isMock: false,
        };
      }

      return {
        success: false,
        orderId,
        status: 'rechazado',
        amountCents,
        currency: 'PEN',
        errorMessage: data.user_message || 'Operación no autorizada.',
        isMock: false,
      };
    }

    // HTTP 4xx o 5xx: Rechazos por emisor o errores de pasarela
    return {
      success: false,
      orderId,
      status: 'rechazado',
      amountCents,
      currency: 'PEN',
      actionCode: data.code || data.decline_code,
      errorMessage: data.user_message || data.merchant_message || data.message || 'Error al procesar el pago con Culqi.',
      isMock: false,
    };
  } catch {
    return {
      success: false,
      orderId,
      status: 'rechazado',
      amountCents,
      currency: 'PEN',
      errorMessage: 'Error de conexión con la pasarela de pagos Culqi.',
      isMock: false,
    };
  }
}

export function verifyCulqiWebhookSignature(rawBody, signatureHeader, webhookSecret) {
  const secret = webhookSecret || process.env.CULQI_WEBHOOK_SECRET;
  if (!signatureHeader || !secret) {
    return isTestEnvironment();
  }

  try {
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signatureHeader, 'utf-8'),
      Buffer.from(expectedSignature, 'utf-8')
    );
  } catch {
    return false;
  }
}

const processedWebhookEvents = new Set();

export async function handleCulqiWebhookEvent(payload) {
  const eventId = payload.id;
  if (!eventId) {
    throw new Error('El evento de webhook no contiene un identificador único.');
  }

  if (processedWebhookEvents.has(eventId)) {
    return {
      processed: true,
      alreadyProcessed: true,
      orderId: payload.data?.metadata?.orderId,
    };
  }

  const eventType = payload.type;
  const orderId = payload.data?.metadata?.orderId;

  let newPaymentStatus = 'en_proceso';
  if (eventType === 'charge.creation.succeeded' || eventType === 'order.status.paid') {
    newPaymentStatus = 'pagado';
  } else if (
    eventType === 'charge.creation.failed' ||
    eventType === 'order.status.expired'
  ) {
    newPaymentStatus = 'rechazado';
  }

  processedWebhookEvents.add(eventId);

  return {
    processed: true,
    alreadyProcessed: false,
    orderId,
    status: newPaymentStatus,
  };
}
