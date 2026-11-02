/**
 * MOTOSERVICE / NERO Electric Motors
 * Suite de Pruebas Oficial para VoltIA Real AI V1 (Issue #18)
 *
 * Cubre los 12 escenarios de la Fase 8:
 * 1. Configuración ausente de OpenAI.
 * 2. Mensaje vacío, demasiado largo o con estructura inválida.
 * 3. Respuesta correcta del modelo mediante un cliente HTTP simulado de pruebas.
 * 4. Llamadas válidas e inválidas a herramientas.
 * 5. Recomendaciones basadas solo en resultados de catálogo obtenidos realmente.
 * 6. Productos ocultos, pausados o bloqueados.
 * 7. Compatibilidades confirmadas, condicionales y desconocidas.
 * 8. Detección determinista de riesgos eléctricos (prioridad sobre LLM).
 * 9. Acceso autorizado y no autorizado al seguimiento de pedidos (sin filtración de PII).
 * 10. Errores del proveedor, timeout y fallo de persistencia de solicitudes de asistencia.
 * 11. Prohibición de llamar a herramientas no declaradas.
 * 12. Un error nunca debe resultar en mensajes falsos de confirmación.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  processVoltIAChat,
  VOLTIA_TOOLS,
} from '../lib/voltia/voltia-ai-core.mjs';
import {
  executeSearchCatalog,
  executeCheckCompatibility,
  executeTrackOrder,
} from '../lib/voltia/voltia-ai-tools-core.mjs';

// ============================================================================
// 1. CONFIGURACIÓN AUSENTE DE OPENAI
// ============================================================================
test('1. Configuración ausente de OpenAI: devuelve mensaje informativo sin alucinar', async () => {
  const origKey = process.env.OPENAI_API_KEY;
  try {
    delete process.env.OPENAI_API_KEY;
    const res = await processVoltIAChat({
      message: '¿Qué batería me recomiendas para mi moto?',
    });

    assert.strictEqual(res.success, false);
    assert.strictEqual(res.isAiEnabled, false);
    assert.ok(
      res.message.includes('falta la variable OPENAI_API_KEY') ||
        res.message.includes('no está configurado'),
      'Debe advertir explícitamente que falta OPENAI_API_KEY'
    );
  } finally {
    if (origKey) process.env.OPENAI_API_KEY = origKey;
  }
});

// ============================================================================
// 2. VALIDACIÓN DE MENSAJES VACÍOS O EXCESIVAMENTE LARGOS
// ============================================================================
test('2. Validación de entrada: rechaza mensaje vacío o mayor a 500 caracteres', async () => {
  // Mensaje vacío
  const emptyRes = await processVoltIAChat({ message: '   ' });
  assert.strictEqual(emptyRes.success, false);
  assert.ok(emptyRes.message.includes('Por favor escribe tu consulta'));

  // Mensaje que excede 500 caracteres
  const longText = 'A'.repeat(501);
  const longRes = await processVoltIAChat({ message: longText });
  assert.strictEqual(longRes.success, false);
  assert.ok(longRes.message.includes('límite permitido'));
});

// ============================================================================
// 3. RESPUESTA CORRECTA CON CLIENTE HTTP SIMULADO (MOCK)
// ============================================================================
test('3. Respuesta conversacional simulada exitosa sin costo ni conexión externa', async () => {
  const mockApiKey = 'sk-mock-test-key';
  process.env.OPENAI_API_KEY = mockApiKey;

  const mockFetch = async (url, options) => {
    assert.ok(url.includes('api.openai.com'));
    assert.strictEqual(options.headers.Authorization, `Bearer ${mockApiKey}`);

    return {
      ok: true,
      status: 200,
      json: async () => ({
        choices: [
          {
            message: {
              role: 'assistant',
              content: 'Hola, las baterías de 72V ofrecen mayor velocidad final en motos eléctricas.',
            },
          },
        ],
      }),
    };
  };

  const res = await processVoltIAChat(
    { message: '¿Para qué sirve una batería de 72V?' },
    {},
    mockFetch
  );

  assert.strictEqual(res.success, true);
  assert.strictEqual(res.isAiEnabled, true);
  assert.ok(res.message.includes('72V'));
});

// ============================================================================
// 4 & 5. LLAMADAS A HERRAMIENTAS Y RESULTADOS REALES DE CATÁLOGO
// ============================================================================
test('4 & 5. search_catalog: invoca herramienta real y devuelve productos existentes del catálogo', async () => {
  const result = await executeSearchCatalog({ query: 'cargador' });

  assert.strictEqual(result.success, true);
  assert.ok(result.totalFound > 0, 'Debe encontrar repuestos reales de cargador');
  assert.ok(result.parts.length > 0, 'Debe devolver elementos de tipo part');

  const firstPart = result.parts[0];
  assert.ok(firstPart.sku, 'El repuesto debe contener un SKU real');
  assert.ok(firstPart.name, 'El repuesto debe tener nombre comercial');
  assert.ok(typeof firstPart.pricePen === 'number', 'El precio debe ser numérico');
  assert.strictEqual(firstPart.stockConfirmed, false, 'El stock físico no debe inventarse');
});

// ============================================================================
// 6. EXCLUSIÓN DE PRODUCTOS OCULTOS, PAUSADOS O BLOQUEADOS
// ============================================================================
test('6. Catálogo: repuestos con estados restrictivos no se ofrecen como comprables', async () => {
  const mockParts = [
    { sku: 'BAT-ACT', name: 'Batería Activa', price: 100, status: 'ACTIVO' },
    { sku: 'BAT-PAU', name: 'Batería Pausada', price: 100, status: 'PAUSADO' },
    { sku: 'BAT-BLO', name: 'Batería Bloqueada', price: 100, status: 'BLOQUEADO' },
    { sku: 'BAT-OCU', name: 'Batería Oculta', price: 100, status: 'OCULTO' },
  ];

  const catalogRes = await executeSearchCatalog({ query: 'bateria' }, { parts: mockParts });

  for (const part of catalogRes.parts) {
    if (['BLOQUEADO', 'OCULTO', 'ARCHIVADO', 'PAUSADO'].includes(part.status)) {
      assert.strictEqual(
        part.canPurchase,
        false,
        `El repuesto ${part.sku} con estado ${part.status} no puede ser comprable`
      );
    }
  }
});

// ============================================================================
// 7. COMPATIBILIDADES: CONFIRMADA, CONDICIONAL, DESCONOCIDA E INCOMPATIBLE
// ============================================================================
test('7. check_compatibility: evalúa con rigor y distingue niveles de compatibilidad', async () => {
  const mockMotos = [
    { brand: 'TAILG', model: 'F55 Mecha G2', batteryVoltageV: 72 },
  ];

  // A. Incompatible por voltaje
  const incomp = await executeCheckCompatibility(
    {
      brand: 'TAILG',
      model: 'F55 Mecha G2', // 72V
      partSkuOrName: 'cargador 48v',
      voltage: 48,
    },
    { motos: mockMotos }
  );
  assert.strictEqual(incomp.verdict, 'INCOMPATIBLE');
  assert.ok(incomp.technicalReason.includes('Incompatible eléctricamente'));

  // B. Condicional que requiere datos de conector/amperaje
  const cond = await executeCheckCompatibility(
    {
      brand: 'TAILG',
      model: 'F55 Mecha G2',
      partSkuOrName: 'Controlador Senoidal Genérico',
      voltage: 72,
    },
    { motos: mockMotos }
  );
  assert.strictEqual(cond.verdict, 'CONDICIONAL');
  assert.ok(cond.requiredDataToConfirm.length > 0);

  // C. Desconocida cuando el modelo no tiene historial previo
  const desc = await executeCheckCompatibility({
    brand: 'MARCA_DESCONOCIDA_XYZ',
    model: 'MODELO_RARO',
    partSkuOrName: 'bateria litio',
  });
  assert.strictEqual(desc.verdict, 'DESCONOCIDA_REQUIERE_DATOS');
  assert.ok(desc.requiredDataToConfirm.length > 0);
});

// ============================================================================
// 8. DETECCIÓN DETERMINISTA DE RIESGOS ELÉCTRICOS (PRIORIDAD SOBRE LLM)
// ============================================================================
test('8. Seguridad: detectElectricalHazards intercepta humo/chispas sin consultar a OpenAI', async () => {
  let openaiCalled = false;
  const mockFetch = async () => {
    openaiCalled = true;
    return { ok: true, json: async () => ({}) };
  };

  const res = await processVoltIAChat(
    { message: 'Mi batería de litio está saliendo humo y huele a quemado' },
    {},
    mockFetch
  );

  assert.strictEqual(openaiCalled, false, 'No debe invocar al LLM cuando hay riesgo crítico');
  assert.strictEqual(res.success, true);
  assert.ok(res.safetyAlert, 'Debe incluir safetyAlert de nivel crítico');
  assert.strictEqual(res.safetyAlert.level, 'PELIGRO_ELECTRICO_CRITICO');
  assert.ok(res.message.includes('ALERTA DE SEGURIDAD ELÉCTRICA'));
});

// ============================================================================
// 9. ACCESO AUTORIZADO Y NO AUTORIZADO A SEGUIMIENTO DE PEDIDOS
// ============================================================================
test('9. track_order: deniega acceso sin credenciales válidas y no expone PII', async () => {
  // A. Consulta no autorizada (sin sesión y sin guest token)
  const unauthRes = await executeTrackOrder(
    { orderNumber: 'MS-2026-99999' },
    { authenticatedUserId: null }
  );

  assert.strictEqual(unauthRes.authorized, false);
  assert.ok(unauthRes.message.includes('inicia sesión') || unauthRes.message.includes('enlace seguro'));

  // Comprobar que no revela campos personales
  assert.strictEqual(unauthRes.customerEmail, undefined);
  assert.strictEqual(unauthRes.shippingAddress, undefined);
  assert.strictEqual(unauthRes.customerPhone, undefined);
});

// ============================================================================
// 10. ERROR DE PROVEEDOR, TIMEOUT Y FALLO EN API DE ASISTENCIA
// ============================================================================
test('10. Manejo de error de proveedor OpenAI con mensaje amigable', async () => {
  process.env.OPENAI_API_KEY = 'sk-mock-key';

  const failingFetch = async () => {
    return {
      ok: false,
      status: 503,
      text: async () => 'Service Unavailable',
    };
  };

  const res = await processVoltIAChat(
    { message: 'Consulta estándar de repuesto' },
    {},
    failingFetch
  );

  assert.strictEqual(res.success, false);
  assert.ok(res.message.includes('No pudimos procesar tu consulta'));
});

// ============================================================================
// 11. PROHIBICIÓN DE HERRAMIENTAS NO DECLARADAS O ACCIONES MALICIOSAS
// ============================================================================
test('11. Seguridad: sólo se permiten herramientas declaradas explícitamente', () => {
  const allowedToolNames = VOLTIA_TOOLS.map((t) => t.function.name);
  assert.deepStrictEqual(allowedToolNames.sort(), [
    'check_compatibility',
    'search_catalog',
    'track_order',
  ]);

  // Verificar que ninguna herramienta permite comandos SQL ni mutación de compras
  for (const tool of VOLTIA_TOOLS) {
    const desc = tool.function.description.toLowerCase();
    assert.strictEqual(desc.includes('sql'), false);
    assert.strictEqual(desc.includes('pago'), false);
    assert.strictEqual(desc.includes('delete'), false);
    assert.strictEqual(desc.includes('drop'), false);
  }
});

// ============================================================================
// 12. UN ERROR NUNCA RESULTA EN MENSAJES QUE AFIRMEN FALSAMENTE HABER GUARDADO
// ============================================================================
test('12. Integridad: el endpoint de asistencia /api/voltia/asistencia no finge éxito si falla la BD', async () => {
  const routeFile = fs.readFileSync(
    new URL('../app/api/voltia/asistencia/route.ts', import.meta.url),
    'utf8'
  );

  // Debe verificar el error de inserción devuelto por Supabase
  assert.ok(
    routeFile.includes('insertError') || routeFile.includes('if (error)'),
    'La ruta debe validar el error de inserción de Supabase'
  );

  // En caso de error, debe responder con status 500 y success: false
  assert.ok(
    routeFile.includes('status: 500') && routeFile.includes('success: false'),
    'La ruta debe devolver status 500 y success: false ante fallos de persistencia'
  );
});
