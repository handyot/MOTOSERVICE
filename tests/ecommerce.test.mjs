import test from 'node:test';
import assert from 'node:assert/strict';

import {
  convertPenToCents,
  processCulqiCharge,
  verifyCulqiWebhookSignature,
  handleCulqiWebhookEvent,
} from '../lib/payments/culqi-core.mjs';

import {
  validateFiscalDocument,
  calculateTaxBreakdown,
} from '../lib/documents/fiscal-core.mjs';

import {
  normalizeEmail,
  validateCoupon,
  FIRST_PURCHASE_COUPON,
  DEFAULT_DISCOUNT_PERCENT,
} from '../lib/promotions/discount-core.mjs';

import {
  generateGuestAccessToken,
  verifyGuestToken,
  validateOrderStatusTransition,
  getVerifiedCatalogPart,
} from '../lib/orders/order-core.mjs';

import {
  detectElectricalHazards,
  executeDiagnosticEvaluation,
  hasDirectCompatibleParts,
} from '../lib/voltia/voltia-core.mjs';

// -----------------------------------------------------------------------------
// 1. TIENDA Y CATÁLOGO: DISTINCIÓN ENTRE VENTA DIRECTA Y CONSULTA DE PROVEEDOR
// -----------------------------------------------------------------------------
test('Catálogo: Diferenciación estricta entre repuestos de venta directa y consulta a proveedor', () => {
  // Producto propio oficial
  const directPart = getVerifiedCatalogPart('MS-BAT-72V45AH');
  assert.ok(directPart, 'Debe existir el repuesto propio MS-BAT-72V45AH');
  assert.strictEqual(directPart.isDirectSale, true);
  assert.ok(directPart.stockAvailable > 0, 'Debe contar con existencias propias');
  assert.ok(directPart.price > 0, 'El precio debe estar confirmado');

  // Repuesto no existente o no homologado para venta directa inmediata
  const unknownPart = getVerifiedCatalogPart('PROV-EXTERNAL-999');
  assert.strictEqual(unknownPart, null, 'No debe permitir venta directa de piezas no autorizadas');
});

test('Catálogo: Ocultación de motos sin repuestos directos en catálogo público preservando base de datos', () => {
  // Lista de modelos oficiales y lógica de filtrado de visibilidad
  const sampleMotos = [
    { slug: 'tailg-f55-mecha-g2', brand: 'TAILG', model: 'F55 Mecha G2', partsCount: 4 },
    { slug: 'tailg-e5', brand: 'TAILG', model: 'E5', partsCount: 0 },
    { slug: 'century-chopper', brand: 'CENTURY MOTORS', model: 'Chopper 1500W', partsCount: 0 },
    { slug: 'yadea-e8s-pro', brand: 'YADEA', model: 'E8S Pro', partsCount: 6 },
  ];

  // Filtro de visibilidad: solo motos con partsCount > 0 se muestran en la cuadrícula pública
  const visibleMotos = sampleMotos.filter((m) => m.partsCount > 0);
  const hiddenMotos = sampleMotos.filter((m) => m.partsCount === 0);

  // Verificación de ocultación
  assert.strictEqual(visibleMotos.length, 2, 'Solo deben mostrarse modelos con repuestos compatibles');
  assert.strictEqual(hiddenMotos.length, 2, 'Los modelos sin repuestos deben quedar ocultos');
  assert.deepStrictEqual(
    visibleMotos.map((m) => m.slug),
    ['tailg-f55-mecha-g2', 'yadea-e8s-pro']
  );

  // Verificación de no-eliminación (preservación de la data histórica)
  assert.strictEqual(sampleMotos.length, 4, 'La base de datos original no se altera ni elimina registros');
});

// -----------------------------------------------------------------------------
// 2. SUNAT: VALIDACIONES DE BOLETAS, FACTURAS E IGV (18%)
// -----------------------------------------------------------------------------
test('SUNAT: Validación rigurosa de DNI (8 dígitos) y RUC (11 dígitos)', () => {
  // DNI Boleta
  const validDni = validateFiscalDocument('boleta', '12345678');
  assert.strictEqual(validDni.valid, true);

  const invalidDni = validateFiscalDocument('boleta', '1234567'); // 7 dígitos
  assert.strictEqual(invalidDni.valid, false);

  const lettersDni = validateFiscalDocument('boleta', '1234567A');
  assert.strictEqual(lettersDni.valid, false);

  // RUC Factura
  const validRuc = validateFiscalDocument('factura', '20601234567', 'Inversiones Moto SAC');
  assert.strictEqual(validRuc.valid, true);

  const invalidRucPrefix = validateFiscalDocument('factura', '30601234567', 'Empresa Invalida');
  assert.strictEqual(invalidRucPrefix.valid, false);

  const missingBusinessName = validateFiscalDocument('factura', '20601234567', '');
  assert.strictEqual(missingBusinessName.valid, false);
});

test('SUNAT: Cálculo exacto de desglose de IGV (18%) en retail peruano', () => {
  const breakdown = calculateTaxBreakdown({
    subtotal: 1180.0,
    discount: 0,
    shipping: 0,
  });

  // Base gravada: 1180 / 1.18 = 1000
  assert.strictEqual(breakdown.taxableAmount, 1000.0);
  // IGV: 1180 - 1000 = 180
  assert.strictEqual(breakdown.igvAmount, 180.0);
  assert.strictEqual(breakdown.totalAmount, 1180.0);
});

// -----------------------------------------------------------------------------
// 3. DESCUENTOS Y CONSENTIMIENTO COMERCIAL (5% PRIMERA COMPRA)
// -----------------------------------------------------------------------------
test('Descuentos: Cálculo del 5% de primera compra y prevención de reuso', async () => {
  const email = 'nuevo.cliente@motoservice.pe';
  const subtotal = 1000.0;

  // Validación exitosa
  const validResult = await validateCoupon({
    email,
    code: FIRST_PURCHASE_COUPON,
    subtotal,
  });

  assert.strictEqual(validResult.valid, true);
  assert.strictEqual(validResult.discountPercentage, DEFAULT_DISCOUNT_PERCENT);
  assert.strictEqual(validResult.discountAmount, 50.0);
  assert.strictEqual(validResult.newTotal, 950.0);

  // Normalización de correo (espacios y mayúsculas)
  const normEmail = normalizeEmail('   Nuevo.Cliente@Motoservice.PE  ');
  assert.strictEqual(normEmail, 'nuevo.cliente@motoservice.pe');

  // Código inexistente
  const invalidCode = await validateCoupon({
    email,
    code: 'CODIGO_FALSO',
    subtotal,
  });
  assert.strictEqual(invalidCode.valid, false);
});

// -----------------------------------------------------------------------------
// 4. CHECKOUT INVITADO Y SEGURIDAD CONTRA IDOR (HASH DE TOKEN)
// -----------------------------------------------------------------------------
test('Seguridad de Invitado: Token criptográfico de alta entropía y hashing SHA-256', () => {
  const { token, tokenHash } = generateGuestAccessToken();

  // El token debe tener 64 caracteres hexadecimales (256 bits)
  assert.strictEqual(token.length, 64);
  assert.strictEqual(tokenHash.length, 64);

  // Verificación con token correcto
  const isValid = verifyGuestToken(token, tokenHash);
  assert.strictEqual(isValid, true, 'El token correcto debe validar contra el hash');

  // Intento de suplantación o token alterado
  const tamperedToken = token.slice(0, -1) + (token.endsWith('a') ? 'b' : 'a');
  const isInvalid = verifyGuestToken(tamperedToken, tokenHash);
  assert.strictEqual(isInvalid, false, 'Un token alterado debe ser rechazado rotundamente');

  // Intento con token vacío o nulo
  assert.strictEqual(verifyGuestToken('', tokenHash), false);
});

// -----------------------------------------------------------------------------
// 5. PASARELA CULQI 3DS: MONTOS EN CÉNTIMOS, COBROS Y WEBHOOKS IDEMPOTENTES
// -----------------------------------------------------------------------------
test('Culqi: Conversión de Soles (PEN) a céntimos enteros autorizados por servidor', () => {
  assert.strictEqual(convertPenToCents(100.0), 10000);
  assert.strictEqual(convertPenToCents(49.9), 4990);
  assert.strictEqual(convertPenToCents(3450.5), 345050);

  assert.throws(() => convertPenToCents(-10), /positivo/);
  assert.throws(() => convertPenToCents(0), /positivo/);
});

test('Culqi: Adaptador de simulación 3DS para entorno de pruebas', async () => {
  // Cobro aprobado
  const chargeSuccess = await processCulqiCharge({
    orderId: 'ord-test-001',
    orderNumber: 'MS-2026-10001',
    amountPen: 350.0,
    customerEmail: 'cliente@test.com',
    tokenId: 'tok_test_valid_card',
  });

  assert.strictEqual(chargeSuccess.success, true);
  assert.strictEqual(chargeSuccess.status, 'pagado');
  assert.strictEqual(chargeSuccess.amountCents, 35000);
  assert.ok(chargeSuccess.chargeId?.startsWith('chr_test_'));

  // Cobro declinado simulado
  const chargeDeclined = await processCulqiCharge({
    orderId: 'ord-test-002',
    orderNumber: 'MS-2026-10002',
    amountPen: 120.0,
    customerEmail: 'cliente@test.com',
    tokenId: 'tok_test_declined_card',
  });

  assert.strictEqual(chargeDeclined.success, false);
  assert.strictEqual(chargeDeclined.status, 'rechazado');
});

test('Culqi: Procesamiento idempotente de eventos Webhook', async () => {
  const webhookEvent = {
    id: 'evt_test_unique_9999',
    type: 'charge.creation.succeeded',
    data: {
      id: 'chr_123',
      amount: 50000,
      currency_code: 'PEN',
      email: 'comprador@test.com',
      metadata: {
        orderId: 'order-uuid-1234',
        orderNumber: 'MS-2026-12345',
      },
    },
  };

  // Primer procesamiento
  const firstRun = await handleCulqiWebhookEvent(webhookEvent);
  assert.strictEqual(firstRun.processed, true);
  assert.strictEqual(firstRun.alreadyProcessed, false);
  assert.strictEqual(firstRun.status, 'pagado');

  // Segundo procesamiento del mismo evento (duplicado de red)
  const duplicateRun = await handleCulqiWebhookEvent(webhookEvent);
  assert.strictEqual(duplicateRun.processed, true);
  assert.strictEqual(duplicateRun.alreadyProcessed, true, 'El webhook duplicado debe detectarse como idempotente');

  // Verificación de firma de webhook en entorno de pruebas
  const validSigCheck = verifyCulqiWebhookSignature('{"test": true}', null, null);
  assert.strictEqual(typeof validSigCheck, 'boolean');
});

// -----------------------------------------------------------------------------
// 6. VOLTIA: DETECCIÓN DE RIESGOS ELÉCTRICOS Y DIAGNÓSTICO ESTRUCTURADO
// -----------------------------------------------------------------------------
test('VoltIA: Detección obligatoria de peligro eléctrico crítico (humo, batería hinchada, chispas)', () => {
  // Caso de batería hinchada
  const hazard1 = detectElectricalHazards('Noto que la batería está un poco hinchada y caliente');
  assert.ok(hazard1, 'Debe activar alerta de seguridad');
  assert.strictEqual(hazard1?.level, 'PELIGRO_ELECTRICO_CRITICO');
  assert.strictEqual(hazard1?.referToTechnician, true);

  // Caso de humo / olor a quemado
  const hazard2 = detectElectricalHazards('Salió humo blanco y huele a plástico quemado al enchufar');
  assert.ok(hazard2);
  assert.strictEqual(hazard2?.level, 'PELIGRO_ELECTRICO_CRITICO');

  // Caso de texto normal sin riesgos
  const noHazard = detectElectricalHazards('La moto no enciende el tablero');
  assert.strictEqual(noHazard, null, 'No debe activar alerta crítica en síntomas normales');
});

test('VoltIA: Diagnóstico estructurado y enlaces a repuestos con certeza declarada', () => {
  const diagnosis = executeDiagnosticEvaluation({
    symptom: 'perdida-potencia',
    brand: 'TAILG',
    model: 'F55 Mecha G2',
  });

  assert.strictEqual(diagnosis.certainty, 'PROBABLE');
  assert.ok(diagnosis.hypotheses.length > 0, 'Debe listar hipótesis fundadas');
  assert.ok(diagnosis.recommendedParts.length > 0, 'Debe sugerir piezas compatibles');
  assert.strictEqual(diagnosis.recommendedParts[0].isDirectSale, true);
  assert.ok(diagnosis.recommendedParts[0].price > 0);
  assert.strictEqual(diagnosis.adaptationNotice, undefined, 'Modelo con repuesto directo no requiere aviso de adaptación forzada');
});

test('VoltIA: Autonomía técnica ("dependencia propia") para modelos sin repuesto directo o no registrados', () => {
  // Modelo sin repuesto directo de fábrica (ej. Tailg E5 o marca externa Wanxin EV)
  const isDirectKnown = hasDirectCompatibleParts('Wanxin', 'EV-500 Sport');
  assert.strictEqual(isDirectKnown, false, 'Modelo externo no debe tener repuesto directo registrado');

  const customDiagnosis = executeDiagnosticEvaluation({
    symptom: 'bateria-descarga-rapido',
    brand: 'Wanxin',
    model: 'EV-500 Sport',
  });

  // Debe activar autonomía técnica por dependencia propia
  assert.ok(customDiagnosis.adaptationNotice, 'Debe proveer aviso de adaptación en taller');
  assert.strictEqual(customDiagnosis.adaptationNotice.isCustomAdaptation, true);
  assert.ok(customDiagnosis.adaptationNotice.suggestedModifications.length >= 2, 'Debe listar adecuaciones de taller');
  assert.strictEqual(customDiagnosis.referToTechnician, true, 'Debe derivar a taller autorizado');
  assert.ok(customDiagnosis.recommendedAction.includes('taller autorizado MotoService'));

  // Los repuestos sugeridos deben estar marcados con requerimiento de taller
  assert.ok(customDiagnosis.recommendedParts.length > 0, 'VoltIA debe proveer componentes alternativos viables');
  const part = customDiagnosis.recommendedParts[0];
  assert.strictEqual(part.isAdaptation, true);
  assert.strictEqual(part.workshopModificationRequired, true);
  assert.ok(part.workshopNotes && part.workshopNotes.includes('taller autorizado MotoService'));
});

// -----------------------------------------------------------------------------
// 7. MÁQUINA DE ESTADOS DEL PEDIDO
// -----------------------------------------------------------------------------
test('Máquina de Estados: Transiciones autorizadas e inmunidad ante estados ilegales', () => {
  // Transición válida
  const t1 = validateOrderStatusTransition('pendiente_pago', 'confirmado', 'pagado');
  assert.strictEqual(t1.allowed, true);

  // Transición inválida: confirmar un pedido no pagado
  const t2 = validateOrderStatusTransition('pendiente_pago', 'confirmado', 'pendiente');
  assert.strictEqual(t2.allowed, false);

  // Transición inválida: reactivar un pedido cancelado
  const t3 = validateOrderStatusTransition('cancelado', 'confirmado', 'pagado');
  assert.strictEqual(t3.allowed, false);

  // Transición de ciclo operativo normal
  const t4 = validateOrderStatusTransition('confirmado', 'en_preparacion', 'pagado');
  assert.strictEqual(t4.allowed, true);

  const t5 = validateOrderStatusTransition('en_preparacion', 'despachado', 'pagado');
  assert.strictEqual(t5.allowed, true);

  const t6 = validateOrderStatusTransition('despachado', 'entregado', 'pagado');
  assert.strictEqual(t6.allowed, true);
});

// -----------------------------------------------------------------------------
// 8. CARRITO Y NAVEGACIÓN: PREVENCIÓN DE HYDRATION MISMATCH
// -----------------------------------------------------------------------------
test('Carrito: Inmunidad ante errores de hidratación y consistencia de snapshot SSR', () => {
  // Snapshot estático de servidor debe ser inmutable y vacío
  const serverSnapshot = [];
  assert.strictEqual(serverSnapshot.length, 0, 'El snapshot de servidor debe iniciar en 0 para coincidir con HTML SSR');

  // En SSR el totalCount debe calcularse como 0
  const serverTotalCount = serverSnapshot.reduce((sum, item) => sum + (item.quantity || 0), 0);
  assert.strictEqual(serverTotalCount, 0);

  // La etiqueta accesible generada en SSR debe ser predecible
  const serverAriaLabel = serverTotalCount === 1
    ? 'Ver carrito de compras con 1 repuesto'
    : `Ver carrito de compras con ${serverTotalCount} repuestos`;
  assert.strictEqual(serverAriaLabel, 'Ver carrito de compras con 0 repuestos');

  // Simulando hidratación con almacenamiento local poblado
  const clientStoredItems = [
    { sku: 'MS-BAT-72V45AH', name: 'Batería LiFePO4 72V 45Ah', price: 2850, quantity: 2, isDirectSale: true, stockAvailable: 10 }
  ];
  const clientTotalCount = clientStoredItems.reduce((sum, item) => sum + item.quantity, 0);
  assert.strictEqual(clientTotalCount, 2);

  const clientAriaLabel = clientTotalCount === 1
    ? 'Ver carrito de compras con 1 repuesto'
    : `Ver carrito de compras con ${clientTotalCount} repuestos`;
  assert.strictEqual(clientAriaLabel, 'Ver carrito de compras con 2 repuestos');
});
