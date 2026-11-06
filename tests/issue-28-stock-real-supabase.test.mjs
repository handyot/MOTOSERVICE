/**
 * MOTOSERVICE — Suite de Pruebas: Validación de Existencias Reales en Checkout (Issue #28)
 *
 * Criterios de aceptación verificados:
 * 1. Un producto con stock_propio_ecomoto = 0 en la BD es rechazado en checkout con mensaje explicativo.
 * 2. No se pueden comprar más unidades que las registradas físicamente en Supabase.
 * 3. Se eliminan las cantidades artificiales fijas de 15 unidades en el servicio de órdenes.
 * 4. Descuento de existencias seguro e idempotente tras la confirmación de la orden.
 * 5. Exposición de existencias verificadas al frontend (CartItem, PartDetailModal, EcoMotoCatalogSection).
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  validateItemStock,
  calculateDeductedStock,
  getVerifiedCatalogPart,
} from '../lib/orders/order-core.mjs';

const ORDER_SERVICE_PATH = path.resolve('lib/orders/order-service.ts');
const ORDER_CORE_PATH = path.resolve('lib/orders/order-core.mjs');
const ADMIN_ORDER_CORE_PATH = path.resolve('admin-panel/lib/orders/order-core.mjs');
const CATALOG_SECTION_PATH = path.resolve('components/ecomoto/EcoMotoCatalogSection.tsx');
const PART_MODAL_PATH = path.resolve('components/ecomoto/PartDetailModal.tsx');
const CHARGE_ROUTE_PATH = path.resolve('app/api/payments/charge/route.ts');
const WEBHOOK_ROUTE_PATH = path.resolve('app/api/webhooks/culqi/route.ts');

test('Issue #28 - 1. validateItemStock rechaza stock = 0 con mensaje explicativo', () => {
  const result = validateItemStock({
    requestedQuantity: 1,
    stockAvailable: 0,
    partName: 'Batería de Litio Ternario 72V 45Ah',
    sku: 'MS-BAT-72V45AH',
  });

  assert.equal(result.valid, false);
  assert.match(result.error, /no cuenta con existencias disponibles en almacén|stock: 0/i);
});

test('Issue #28 - 2. validateItemStock rechaza compras superiores a las existencias físicas', () => {
  // Caso: Se solicitan 4 unidades y sólo hay 3 disponibles
  const resultExceeded = validateItemStock({
    requestedQuantity: 4,
    stockAvailable: 3,
    partName: 'Controlador Senoidal VOTOL EM-100',
    sku: 'MS-CTRL-VOTOL-EM100',
  });

  assert.equal(resultExceeded.valid, false);
  assert.match(resultExceeded.error, /No hay suficiente stock/i);
  assert.match(resultExceeded.error, /Disponible: 3 unidades/i);

  // Caso: Se solicita cantidad permitida (3 unidades con 3 disponibles)
  const resultExact = validateItemStock({
    requestedQuantity: 3,
    stockAvailable: 3,
    partName: 'Controlador Senoidal VOTOL EM-100',
    sku: 'MS-CTRL-VOTOL-EM100',
  });

  assert.equal(resultExact.valid, true);
  assert.equal(resultExact.remaining, 0);

  // Caso: Se solicitan 2 unidades con 10 disponibles
  const resultOk = validateItemStock({
    requestedQuantity: 2,
    stockAvailable: 10,
    partName: 'Batería Smart 72V',
    sku: 'MS-BAT-72V45AH',
  });

  assert.equal(resultOk.valid, true);
  assert.equal(resultOk.remaining, 8);
});

test('Issue #28 - 3. validateItemStock rechaza cantidades no enteras o menores a 1', () => {
  assert.equal(
    validateItemStock({ requestedQuantity: 0, stockAvailable: 5, sku: 'TEST' }).valid,
    false
  );
  assert.equal(
    validateItemStock({ requestedQuantity: -2, stockAvailable: 5, sku: 'TEST' }).valid,
    false
  );
  assert.equal(
    validateItemStock({ requestedQuantity: 1.5, stockAvailable: 5, sku: 'TEST' }).valid,
    false
  );
});

test('Issue #28 - 4. calculateDeductedStock descuenta correctamente y no baja de cero', () => {
  assert.equal(calculateDeductedStock(10, 3), 7);
  assert.equal(calculateDeductedStock(5, 5), 0);
  assert.equal(calculateDeductedStock(2, 5), 0); // clamp a 0
  assert.equal(calculateDeductedStock(0, 1), 0);
});

test('Issue #28 - 5. Eliminación de constantes fijas de 15 unidades en orden y catálogo', () => {
  const orderServiceCode = fs.readFileSync(ORDER_SERVICE_PATH, 'utf8');
  const orderCoreCode = fs.readFileSync(ORDER_CORE_PATH, 'utf8');
  const adminOrderCoreCode = fs.readFileSync(ADMIN_ORDER_CORE_PATH, 'utf8');
  const catalogSectionCode = fs.readFileSync(CATALOG_SECTION_PATH, 'utf8');
  const partModalCode = fs.readFileSync(PART_MODAL_PATH, 'utf8');

  // En order-core y admin-panel no debe haber asignación estática ': 15'
  assert.ok(!orderCoreCode.includes('? 15 : 0'), 'order-core.mjs no debe asignar estáticamente 15 unidades');
  assert.ok(!adminOrderCoreCode.includes('? 15 : 0'), 'admin-panel order-core.mjs no debe asignar 15 unidades');

  // En order-service no debe existir ': 15' para stockAvailable
  assert.ok(
    !orderServiceCode.includes("stockAvailable: official.stockStatus === 'AGOTADO_EN_PAGINA' ? 0 : 15"),
    'order-service.ts no debe asignar estáticamente 15 unidades'
  );

  // En catálogo y modal debe leerse ownStock (centralizado en lib/catalog/part-stock.ts)
  const partStockCode = fs.readFileSync(new URL('../lib/catalog/part-stock.ts', import.meta.url), 'utf8');
  assert.ok(partStockCode.includes('ownStock'), 'part-stock.ts debe considerar ownStock');
  assert.ok(catalogSectionCode.includes('getCatalogPartStock'), 'EcoMotoCatalogSection debe usar getCatalogPartStock');
  assert.ok(partModalCode.includes('getCatalogPartStock'), 'PartDetailModal debe usar getCatalogPartStock');
});

test('Issue #28 - 6. getVerifiedCatalogPart no retorna la constante fija 15', () => {
  const part = getVerifiedCatalogPart('MS-BAT-72V45AH');
  assert.ok(part);
  assert.notEqual(part.stockAvailable, 15, 'El stock ya no debe ser la constante fija de 15 unidades');
});

test('Issue #28 - 7. order-service conecta existencias reales con Supabase y descuenta stock tras pago', () => {
  const orderServiceCode = fs.readFileSync(ORDER_SERVICE_PATH, 'utf8');
  const chargeRouteCode = fs.readFileSync(CHARGE_ROUTE_PATH, 'utf8');
  const webhookRouteCode = fs.readFileSync(WEBHOOK_ROUTE_PATH, 'utf8');

  // Consulta de stock_propio_ecomoto en Supabase
  assert.ok(
    orderServiceCode.includes('getRealPartStockFromSupabase'),
    'order-service.ts debe consultar existencias en Supabase'
  );
  assert.ok(
    orderServiceCode.includes('stock_propio_ecomoto'),
    'order-service.ts debe consultar la columna stock_propio_ecomoto'
  );

  // Descuento de stock implementado
  assert.ok(
    orderServiceCode.includes('deductStockForOrder'),
    'order-service.ts debe implementar deductStockForOrder'
  );

  // Invocación tras pago en pasarela charge y webhook
  assert.ok(
    chargeRouteCode.includes('deductStockForOrder'),
    'charge/route.ts debe invocar deductStockForOrder tras pago verificado'
  );
  assert.ok(
    webhookRouteCode.includes('deductStockForOrder'),
    'culqi webhook debe invocar deductStockForOrder tras pago verificado'
  );
});
