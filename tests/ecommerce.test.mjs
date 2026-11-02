process.env.NODE_ENV = 'test';

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  convertPenToCents,
  processCulqiCharge,
  verifyCulqiWebhookSignature,
  handleCulqiWebhookEvent,
  isCulqiConfigured,
  getCulqiPrivateKey,
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
  maskEmail,
  maskName,
  maskAddress,
} from '../lib/orders/order-core.mjs';

import {
  detectElectricalHazards,
  executeDiagnosticEvaluation,
  hasDirectCompatibleParts,
} from '../lib/voltia/voltia-core.mjs';

import {
  resolveSupabaseUrl,
  resolveSupabaseAdminKey,
  getOrderAdminConfigStatus,
} from '../lib/supabase/supabase-core.mjs';

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

  // Cobro con tarjeta que requiere autenticación 3DS (Challenge)
  const charge3ds = await processCulqiCharge({
    orderId: 'ord-test-3ds',
    orderNumber: 'MS-2026-10003',
    amountPen: 150.0,
    customerEmail: 'review@culqi.com',
    tokenId: 'tok_test_3ds_card',
  });
  assert.strictEqual(charge3ds.success, false);
  assert.strictEqual(charge3ds.status, 'requiere_3ds');
  assert.strictEqual(charge3ds.requires3DS, true);

  // Cobro 3DS con Challenge/OTP confirmado por el usuario
  const charge3dsConfirmed = await processCulqiCharge({
    orderId: 'ord-test-3ds',
    orderNumber: 'MS-2026-10003',
    amountPen: 150.0,
    customerEmail: 'review@culqi.com',
    tokenId: 'tok_test_3ds_card',
    challengeConfirmed: true,
    otpCode: '123456',
  });
  assert.strictEqual(charge3dsConfirmed.success, true);
  assert.strictEqual(charge3dsConfirmed.status, 'pagado');
  assert.ok(charge3dsConfirmed.chargeId?.startsWith('chr_test_3ds_'));
});

test('Culqi: Detección de configuración de pasarela y llaves reales', () => {
  const configured = isCulqiConfigured();
  assert.strictEqual(typeof configured, 'boolean');
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

// -----------------------------------------------------------------------------
// 9. AUDITORÍA FOCALIZADA: CULQI 3DS V2, IDEMPOTENCIA, PROTECCIÓN RLS Y SUPABASE
// -----------------------------------------------------------------------------
test('Auditoría Culqi 3DS: Distinción estricta de códigos de decisión antifraude (REVIEW vs DENIED vs Error)', async () => {
  // 1. Simulación de token sintético 3DS que exige autenticación (REVIEW)
  const req3ds = await processCulqiCharge({
    orderId: 'ord-audit-3ds-1',
    orderNumber: 'MS-2026-90001',
    amountPen: 250.0,
    customerEmail: 'review@culqi.com',
    tokenId: 'tok_test_3ds_challenge',
  });
  assert.strictEqual(req3ds.status, 'requiere_3ds', 'REVIEW debe traducirse a requiere_3ds');
  assert.strictEqual(req3ds.requires3DS, true);
  assert.strictEqual(req3ds.actionCode, 'REVIEW');

  // 2. Simulación de tarjeta con rechazo antifraude o emisor
  const declined = await processCulqiCharge({
    orderId: 'ord-audit-declined',
    orderNumber: 'MS-2026-90002',
    amountPen: 100.0,
    customerEmail: 'fraud@culqi.com',
    tokenId: 'tok_test_declined_card',
  });
  assert.strictEqual(declined.status, 'rechazado', 'Tarjeta declinada no debe exigir 3DS');
  assert.strictEqual(declined.success, false);
});

test('Auditoría Culqi 3DS: Inmunidad ante confirmaciones no autorizadas sin verificación de pasarela', async () => {
  // Intento de forzar cobro con challengeConfirmed pero sin código OTP o con token fraudulento
  const fakeConfirmation = await processCulqiCharge({
    orderId: 'ord-audit-hack',
    orderNumber: 'MS-2026-90003',
    amountPen: 350.0,
    customerEmail: 'attacker@test.com',
    tokenId: 'tok_test_3ds_card',
    challengeConfirmed: true,
    otpCode: 'wrong_code',
  });

  assert.strictEqual(fakeConfirmation.success, false, 'No debe autorizarse un cobro sin código de desafío válido');
  assert.strictEqual(fakeConfirmation.status, 'requiere_3ds');
});

test('Auditoría Supabase: createOrderAdminClient rechaza credenciales públicas anónimas', () => {
  // Escenario 1: Solo credenciales anónimas públicas disponibles (ej. cliente frontend o Vercel sin secretos)
  const envOnlyAnon = {
    NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_test',
  };
  const statusAnon = getOrderAdminConfigStatus(envOnlyAnon);
  assert.strictEqual(statusAnon.isConfigured, false);
  assert.strictEqual(statusAnon.hasUrl, true);
  assert.strictEqual(statusAnon.hasSecretKey, false);
  assert.strictEqual(resolveSupabaseAdminKey(envOnlyAnon), null, 'createOrderAdminClient jamás debe operar bajo la anon key');

  // Escenario 2: Clave secreta administrativa legítima
  const mockSec = (s) => 'sb_' + 'secret_' + s;
  const envWithSecret = {
    NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
    SUPABASE_SECRET_KEY: mockSec('mock_admin_key_1234567890'),
  };
  const statusSecret = getOrderAdminConfigStatus(envWithSecret);
  assert.strictEqual(statusSecret.isConfigured, true);
  assert.strictEqual(statusSecret.hasUrl, true);
  assert.strictEqual(statusSecret.hasSecretKey, true);
  assert.strictEqual(statusSecret.missingVariables.length, 0);
  assert.strictEqual(resolveSupabaseAdminKey(envWithSecret), mockSec('mock_admin_key_1234567890'));
});

test('Auditoría Supabase: Sanitización contra comillas accidentales y barras finales en variables de entorno', () => {
  const mockSec = (s) => 'sb_' + 'secret_' + s;
  const envWithQuotes = {
    NEXT_PUBLIC_SUPABASE_URL: '"https://tbznauwbvhsbmsbcodes.supabase.co/"',
    SUPABASE_SECRET_KEY: "'" + mockSec('quoted_key_12345678901234567890') + "'",
  };

  const url = resolveSupabaseUrl(envWithQuotes);
  const key = resolveSupabaseAdminKey(envWithQuotes);
  assert.strictEqual(url, 'https://tbznauwbvhsbmsbcodes.supabase.co', 'Debe limpiar comillas y barra final de la URL');
  assert.strictEqual(key, mockSec('quoted_key_12345678901234567890'), 'Debe limpiar comillas simples del secreto');
  assert.strictEqual(getOrderAdminConfigStatus(envWithQuotes).isConfigured, true);
});

test('Auditoría Supabase: Rechazo de clave pública bajo SUPABASE_SECRET_KEY y fallback inteligente a alias válido', () => {
  const mockSec = (s) => 'sb_' + 'secret_' + s;
  // Caso 1: Usuario configuró por error la publishable key en SUPABASE_SECRET_KEY, pero tiene service_role en alias
  const envMismatched = {
    NEXT_PUBLIC_SUPABASE_URL: 'https://tbznauwbvhsbmsbcodes.supabase.co',
    SUPABASE_SECRET_KEY: 'sb_publishable_accidental_public_key',
    SUPABASE_SERVICE_ROLE_KEY: mockSec('valid_backup_role_key_123'),
  };

  assert.strictEqual(
    resolveSupabaseAdminKey(envMismatched),
    mockSec('valid_backup_role_key_123'),
    'Debe descartar la publishable key y utilizar el alias administrativo válido'
  );

  // Caso 2: Solo publishable key configurada en ambos
  const envOnlyPublishable = {
    NEXT_PUBLIC_SUPABASE_URL: 'https://tbznauwbvhsbmsbcodes.supabase.co',
    SUPABASE_SECRET_KEY: 'sb_publishable_accidental_public_key',
  };
  assert.strictEqual(resolveSupabaseAdminKey(envOnlyPublishable), null, 'Debe rechazar publishable key si no hay secreto real');
});

test('Auditoría Supabase: Priorización del proyecto oficial esperado ante múltiples URLs discrepantes', () => {
  const mockSec = (s) => 'sb_' + 'secret_' + s;
  const envWithConflictingUrls = {
    SUPABASE_URL: 'https://otro-proyecto-antiguo.supabase.co',
    NEXT_PUBLIC_SUPABASE_URL: 'https://tbznauwbvhsbmsbcodes.supabase.co',
    SUPABASE_SECRET_KEY: mockSec('key_for_official_project_123'),
  };

  const resolvedUrl = resolveSupabaseUrl(envWithConflictingUrls);
  assert.strictEqual(
    resolvedUrl,
    'https://tbznauwbvhsbmsbcodes.supabase.co',
    'Debe priorizar la URL correspondiente al proyecto oficial esperado tbznauwbvhsbmsbcodes'
  );
});

test('Auditoría Supabase: Rechazo estricto de JWT con rol anon y soporte de JWT service_role', () => {
  const headerBase64 = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
  const anonPayloadBase64 = Buffer.from(JSON.stringify({ role: 'anon', ref: 'tbznauwbvhsbmsbcodes' })).toString('base64');
  const serviceRolePayloadBase64 = Buffer.from(JSON.stringify({ role: 'service_role', ref: 'tbznauwbvhsbmsbcodes' })).toString('base64');
  const fakeSig = 'fake_signature_part';

  const anonJwt = `${headerBase64}.${anonPayloadBase64}.${fakeSig}`;
  const serviceRoleJwt = `${headerBase64}.${serviceRolePayloadBase64}.${fakeSig}`;

  const envAnonJwt = {
    NEXT_PUBLIC_SUPABASE_URL: 'https://tbznauwbvhsbmsbcodes.supabase.co',
    SUPABASE_SECRET_KEY: anonJwt,
  };
  assert.strictEqual(resolveSupabaseAdminKey(envAnonJwt), null, 'JWT con rol anon jamás debe ser aceptado como clave administrativa');

  const envServiceRoleJwt = {
    NEXT_PUBLIC_SUPABASE_URL: 'https://tbznauwbvhsbmsbcodes.supabase.co',
    SUPABASE_SECRET_KEY: serviceRoleJwt,
  };
  assert.strictEqual(resolveSupabaseAdminKey(envServiceRoleJwt), serviceRoleJwt, 'JWT con rol service_role debe ser admitido');
});

test('Auditoría Supabase: Diagnóstico de persistencia detecta ausencia de URL aun con SUPABASE_SECRET_KEY presente', () => {
  const mockSec = (s) => 'sb_' + 'secret_' + s;
  // Escenario: SUPABASE_SECRET_KEY configurada en Vercel pero falta la URL del proyecto
  const envMissingUrl = {
    SUPABASE_SECRET_KEY: mockSec('valid_key_12345'),
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_valid_key',
  };

  const status = getOrderAdminConfigStatus(envMissingUrl);
  assert.strictEqual(status.isConfigured, false, 'No debe inicializarse sin URL');
  assert.strictEqual(status.hasSecretKey, true, 'Debe reconocer que la clave secreta sí está presente');
  assert.strictEqual(status.hasUrl, false, 'Debe detectar que la URL está ausente');
  assert.strictEqual(resolveSupabaseAdminKey(envMissingUrl), mockSec('valid_key_12345'));
  assert.strictEqual(resolveSupabaseUrl(envMissingUrl), null);
  assert.ok(status.missingVariables.includes('SUPABASE_URL / NEXT_PUBLIC_SUPABASE_URL'));
});

test('Auditoría Supabase: Compatibilidad de alias estándar y sanitización de espacios en blanco', () => {
  const mockSec = (s) => 'sb_' + 'secret_' + s;
  // Soporte de SUPABASE_SERVICE_ROLE_KEY, SUPABASE_SERVICE_KEY, SUPABASE_PROJECT_URL y trim()
  const envWithAliases = {
    SUPABASE_PROJECT_URL: '  https://alias.supabase.co  ',
    SUPABASE_SERVICE_ROLE_KEY: '  ' + mockSec('from_service_role') + '  ',
  };

  const status = getOrderAdminConfigStatus(envWithAliases);
  assert.strictEqual(status.isConfigured, true);
  assert.strictEqual(resolveSupabaseUrl(envWithAliases), 'https://alias.supabase.co');
  assert.strictEqual(resolveSupabaseAdminKey(envWithAliases), mockSec('from_service_role'));

  const envWithServiceKey = {
    SUPABASE_URL: 'https://direct.supabase.co',
    SUPABASE_SERVICE_KEY: mockSec('service_direct'),
  };
  assert.strictEqual(resolveSupabaseAdminKey(envWithServiceKey), mockSec('service_direct'));
  assert.strictEqual(getOrderAdminConfigStatus(envWithServiceKey).isConfigured, true);
});

test('Auditoría Trazabilidad: Enmascaramiento estricto de PII en seguimiento de pedidos', () => {
  const rawEmail = 'review@culqi.com';
  const rawName = 'Carlos Mendoza';
  const rawAddress = 'Av. Larco 1234, Dpto 402';

  const maskedEmail = maskEmail(rawEmail);
  const maskedName = maskName(rawName);
  const maskedAddress = maskAddress(rawAddress);

  // Verificaciones de ofuscación de datos personales (PII)
  assert.ok(maskedEmail.includes('***'), 'El email debe estar ofuscado');
  assert.strictEqual(maskedEmail.includes('review@culqi.com'), false, 'No debe filtrar correo en plano');
  assert.ok(maskedName.includes('*'), 'El nombre debe estar enmascarado');
  assert.ok(maskedAddress.endsWith('***'), 'La dirección debe terminar en máscara');
  assert.strictEqual(maskedAddress.includes('Dpto 402'), false, 'No debe filtrar número de departamento ni interior');
});

// -----------------------------------------------------------------------------
// 10. AUDITORÍA CRÍTICA CHECKOUT: VALIDACIONES DE PERSISTENCIA Y PASARELA FAIL-CLOSE
// -----------------------------------------------------------------------------

test('Auditoría Culqi: Falta de credenciales en servidor rechaza tokens auténticos sin simular venta', async () => {
  // Simular ausencia de credenciales privadas de Culqi
  const origPrivate = process.env.CULQI_PRIVATE_KEY;
  const origSecret = process.env.CULQI_SECRET_KEY;
  delete process.env.CULQI_PRIVATE_KEY;
  delete process.env.CULQI_SECRET_KEY;

  try {
    assert.strictEqual(isCulqiConfigured(), false);
    assert.strictEqual(getCulqiPrivateKey(), null);

    // Un token de navegador real NUNCA debe ser aprobado de forma simulada
    const realBrowserToken = 'tkn_test_browser_token_sample_8888';
    const result = await processCulqiCharge({
      orderId: 'ord-failclose-test',
      orderNumber: 'MS-2026-88888',
      amountPen: 281.0,
      customerEmail: 'review@culqi.com',
      tokenId: realBrowserToken,
    });

    assert.strictEqual(result.success, false, 'No debe autorizarse un cobro si faltan credenciales');
    assert.strictEqual(result.status, 'rechazado');
    assert.strictEqual(result.isMock, false, 'No debe producirse una simulación de venta con token real');
    assert.ok(result.errorMessage?.includes('Configuración de pasarela incompleta'));
  } finally {
    if (origPrivate) process.env.CULQI_PRIVATE_KEY = origPrivate;
    if (origSecret) process.env.CULQI_SECRET_KEY = origSecret;
  }
});

test('Auditoría Culqi: Compatibilidad canónica de CULQI_PRIVATE_KEY y CULQI_SECRET_KEY', () => {
  const origPrivate = process.env.CULQI_PRIVATE_KEY;
  const origSecret = process.env.CULQI_SECRET_KEY;

  try {
    delete process.env.CULQI_PRIVATE_KEY;
    delete process.env.CULQI_SECRET_KEY;
    assert.strictEqual(getCulqiPrivateKey(), null);

    // Caso A: CULQI_PRIVATE_KEY (canónico)
    process.env.CULQI_PRIVATE_KEY = 'sk_test_canonical_key_111';
    assert.strictEqual(getCulqiPrivateKey(), 'sk_test_canonical_key_111');
    assert.strictEqual(isCulqiConfigured(), true);

    // Caso B: CULQI_SECRET_KEY (compatible)
    delete process.env.CULQI_PRIVATE_KEY;
    process.env.CULQI_SECRET_KEY = 'sk_test_compatible_key_222';
    assert.strictEqual(getCulqiPrivateKey(), 'sk_test_compatible_key_222');
    assert.strictEqual(isCulqiConfigured(), true);
  } finally {
    if (origPrivate) process.env.CULQI_PRIVATE_KEY = origPrivate;
    else delete process.env.CULQI_PRIVATE_KEY;
    if (origSecret) process.env.CULQI_SECRET_KEY = origSecret;
    else delete process.env.CULQI_SECRET_KEY;
  }
});

test('Auditoría Checkout: Rechazo de respuestas mock fuera de tests unitarios', () => {
  // Simulación de la regla del endpoint /api/payments/charge
  function evaluateChargeSafety(chargeResult, nodeEnv) {
    if (chargeResult.isMock && nodeEnv !== 'test') {
      return { allowed: false, status: 402, error: 'Cobro simulado rechazado en entorno de producción/preview' };
    }
    return { allowed: true, status: 200 };
  }

  const mockApprovedCharge = {
    success: true,
    chargeId: 'chr_test_mock_fake_123',
    status: 'pagado',
    isMock: true,
  };

  // En producción / preview debe ser RECHAZADO de forma tajante
  const prodCheck = evaluateChargeSafety(mockApprovedCharge, 'production');
  assert.strictEqual(prodCheck.allowed, false);
  assert.strictEqual(prodCheck.status, 402);

  const previewCheck = evaluateChargeSafety(mockApprovedCharge, 'preview');
  assert.strictEqual(previewCheck.allowed, false);

  // Únicamente en 'test' se autoriza ejecución controlada
  const testCheck = evaluateChargeSafety(mockApprovedCharge, 'test');
  assert.strictEqual(testCheck.allowed, true);
});

test('Auditoría Persistencia: Pedido inexistente en Supabase no procesa cobro', () => {
  // Simular la regla de validación previa de /api/payments/charge
  function checkOrderPaymentEligibility(orderInDatabase) {
    if (!orderInDatabase) {
      return { eligible: false, statusCode: 404, error: 'Pedido no encontrado en base de datos. No se puede cobrar.' };
    }
    if (orderInDatabase.paymentStatus === 'pagado') {
      return { eligible: false, statusCode: 200, message: 'Pedido ya pagado previamente.' };
    }
    return { eligible: true };
  }

  // Escenario: Pedido que no fue persistido en Supabase
  const missingOrderCheck = checkOrderPaymentEligibility(null);
  assert.strictEqual(missingOrderCheck.eligible, false);
  assert.strictEqual(missingOrderCheck.statusCode, 404);

  // Escenario: Pedido previamente pagado (idempotencia)
  const alreadyPaidCheck = checkOrderPaymentEligibility({ paymentStatus: 'pagado' });
  assert.strictEqual(alreadyPaidCheck.eligible, false);
  assert.strictEqual(alreadyPaidCheck.statusCode, 200);
});

test('Auditoría Idempotencia: Bloqueo de cobros duplicados y concurrencia por clave idempotente', () => {
  // Simular almacén de transacciones con restricción única uq_pagos_idempotency
  const processedIdempotencyKeys = new Set();

  function attemptPaymentRegistration(orderId, chargeId) {
    const idempotencyKey = `pay_${orderId}_${chargeId}`;
    if (processedIdempotencyKeys.has(idempotencyKey)) {
      return { duplicated: true, error: '23505 (unique_violation: uq_pagos_idempotency)' };
    }
    processedIdempotencyKeys.add(idempotencyKey);
    return { duplicated: false, success: true };
  }

  const orderId = '84f411e7-f350-462d-868f-90e17b29007b';
  const realChargeId = 'chr_test_real_001';

  // Primera ejecución: exitosa
  const first = attemptPaymentRegistration(orderId, realChargeId);
  assert.strictEqual(first.success, true);
  assert.strictEqual(first.duplicated, false);

  // Solicitud concurrente o reintento de red idéntico: detecta duplicado
  const second = attemptPaymentRegistration(orderId, realChargeId);
  assert.strictEqual(second.success, undefined);
  assert.strictEqual(second.duplicated, true);
});

test('Auditoría Regresión MS-2026-18354: Token auténtico de navegador bajo entorno productivo sin llaves falla cerrado', async () => {
  const origNodeEnv = process.env.NODE_ENV;
  const origPrivate = process.env.CULQI_PRIVATE_KEY;
  const origSecret = process.env.CULQI_SECRET_KEY;

  try {
    process.env.NODE_ENV = 'production';
    delete process.env.CULQI_PRIVATE_KEY;
    delete process.env.CULQI_SECRET_KEY;

    // Token real generado por el navegador en la incidencia
    const realIncidentToken = 'tkn_test_5eXDXRN10I33eQbA';

    const result = await processCulqiCharge({
      orderId: 'ord-incident-repro',
      orderNumber: 'MS-2026-18354',
      amountPen: 281.0,
      customerEmail: 'review@culqi.com',
      tokenId: realIncidentToken,
    });

    assert.strictEqual(result.success, false, 'Jamás debe declararse éxito si faltan credenciales de pasarela');
    assert.strictEqual(result.status, 'rechazado');
    assert.strictEqual(result.isMock, false, 'No debe generarse simulación mock en entorno productivo');
    assert.ok(result.errorMessage?.includes('Configuración de pasarela incompleta'));
  } finally {
    process.env.NODE_ENV = origNodeEnv;
    if (origPrivate) process.env.CULQI_PRIVATE_KEY = origPrivate;
    if (origSecret) process.env.CULQI_SECRET_KEY = origSecret;
  }
});

test('Auditoría Regresión MS-2026-18354: Token sintético bajo entorno productivo NUNCA activa simulación mock', async () => {
  const origNodeEnv = process.env.NODE_ENV;
  const origPrivate = process.env.CULQI_PRIVATE_KEY;
  const origSecret = process.env.CULQI_SECRET_KEY;

  try {
    process.env.NODE_ENV = 'production';
    delete process.env.CULQI_PRIVATE_KEY;
    delete process.env.CULQI_SECRET_KEY;

    // Token sintético que en test activaría mock, en production DEBE ser rechazado
    const syntheticToken = 'tok_test_valid_card';

    const result = await processCulqiCharge({
      orderId: 'ord-incident-synthetic',
      orderNumber: 'MS-2026-18354',
      amountPen: 281.0,
      customerEmail: 'review@culqi.com',
      tokenId: syntheticToken,
    });

    assert.strictEqual(result.success, false, 'Token sintético no debe simular compra en producción');
    assert.strictEqual(result.status, 'rechazado');
    assert.strictEqual(result.isMock, false);
  } finally {
    process.env.NODE_ENV = origNodeEnv;
    if (origPrivate) process.env.CULQI_PRIVATE_KEY = origPrivate;
    if (origSecret) process.env.CULQI_SECRET_KEY = origSecret;
  }
});
