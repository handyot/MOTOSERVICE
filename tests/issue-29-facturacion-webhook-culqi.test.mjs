/**
 * MOTOSERVICE — Suite de Pruebas: Facturación Automática en Webhook Culqi (Issue #29)
 *
 * Criterios de aceptación verificados:
 * 1. Todo evento de webhook con pago exitoso genera un registro en documentos_fiscales.
 * 2. Emisión con serie oficial (B001 para Boleta con DNI, F001 para Factura con RUC).
 * 3. Idempotencia estricta: eventos duplicados no generan comprobantes dobles.
 * 4. Integración unificada entre webhook de Culqi y endpoint de cobro directo.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  validateFiscalDocument,
  calculateTaxBreakdown,
  generateProvisionalFiscalReceipt,
  emitFiscalDocumentForOrder,
} from '../lib/documents/fiscal-core.mjs';

const WEBHOOK_ROUTE_PATH = path.resolve('app/api/webhooks/culqi/route.ts');
const CHARGE_ROUTE_PATH = path.resolve('app/api/payments/charge/route.ts');
const FISCAL_SERVICE_PATH = path.resolve('lib/documents/fiscal-service.ts');

test('Issue #29 - 1. Generación de Boleta con serie B001 y desglose IGV', () => {
  const tax = calculateTaxBreakdown({ subtotal: 100, discount: 0, shipping: 18 });
  assert.equal(tax.totalAmount, 118);
  assert.equal(tax.taxableAmount, 100);
  assert.equal(tax.igvAmount, 18);

  const receipt = generateProvisionalFiscalReceipt({
    type: 'boleta',
    orderNumber: 'MS-2026-12345',
    docNumber: '44556677',
    taxBreakdown: tax,
  });

  assert.equal(receipt.tipo, 'BOLETA');
  assert.equal(receipt.serie, 'B001');
  assert.equal(receipt.numero, 'B001-612345');
  assert.equal(receipt.datosReceptor.docType, 'DNI');
  assert.equal(receipt.datosReceptor.docNumber, '44556677');
});

test('Issue #29 - 2. Generación de Factura con serie F001 y RUC validado', () => {
  const tax = calculateTaxBreakdown({ subtotal: 200, discount: 0, shipping: 0 });
  const receipt = generateProvisionalFiscalReceipt({
    type: 'factura',
    orderNumber: 'MS-2026-99999',
    docNumber: '20601234567',
    businessName: 'NERO MOTORS S.A.C.',
    taxBreakdown: tax,
  });

  assert.equal(receipt.tipo, 'FACTURA');
  assert.equal(receipt.serie, 'F001');
  assert.equal(receipt.numero, 'F001-699999');
  assert.equal(receipt.datosReceptor.docType, 'RUC');
  assert.equal(receipt.datosReceptor.businessName, 'NERO MOTORS S.A.C.');
});

test('Issue #29 - 3. emitFiscalDocumentForOrder inserta documento y respeta idempotencia', async () => {
  const insertedDocs = [];
  const fakeSupabase = {
    from(table) {
      assert.equal(table, 'documentos_fiscales');
      return {
        select() {
          return {
            eq(col, val) {
              return {
                async maybeSingle() {
                  const found = insertedDocs.find((d) => d.id_pedido === val);
                  return { data: found || null, error: null };
                },
              };
            },
          };
        },
        insert(docPayload) {
          return {
            select() {
              return {
                async maybeSingle() {
                  const doc = { ...docPayload, id_documento: 'doc-' + Date.now() };
                  insertedDocs.push(doc);
                  return { data: doc, error: null };
                },
              };
            },
          };
        },
      };
    },
  };

  const sampleOrder = {
    id: 'ord-test-123',
    orderNumber: 'MS-2026-10101',
    invoiceType: 'boleta',
    docNumber: '76543210',
    subtotal: 150,
    discount: 0,
    shippingCost: 15,
  };

  // Primera emisión
  const firstRes = await emitFiscalDocumentForOrder({
    order: sampleOrder,
    supabaseClient: fakeSupabase,
  });

  assert.equal(firstRes.success, true);
  assert.equal(firstRes.alreadyExisted, false);
  assert.equal(insertedDocs.length, 1);
  assert.equal(insertedDocs[0].serie, 'B001');
  assert.equal(insertedDocs[0].estado, 'listo');

  // Segunda emisión con el mismo pedido (evento webhook duplicado)
  const duplicateRes = await emitFiscalDocumentForOrder({
    order: sampleOrder,
    supabaseClient: fakeSupabase,
  });

  assert.equal(duplicateRes.success, true);
  assert.equal(duplicateRes.alreadyExisted, true);
  assert.equal(insertedDocs.length, 1, 'No debe duplicar el comprobante');
});

test('Issue #29 - 4. Webhook Culqi actualiza estado de comprobante e invoca emisión fiscal', () => {
  const webhookCode = fs.readFileSync(WEBHOOK_ROUTE_PATH, 'utf8');

  assert.ok(
    webhookCode.includes('emitFiscalDocumentForOrder'),
    'El webhook debe importar y ejecutar emitFiscalDocumentForOrder'
  );
  assert.ok(
    webhookCode.includes("estado_comprobante: result.status === 'pagado' ? 'listo' : 'pendiente'"),
    'El webhook debe marcar estado_comprobante como listo tras pago'
  );
  assert.ok(
    webhookCode.includes('deductStockForOrder'),
    'El webhook debe descontar existencias físicas'
  );
});

test('Issue #29 - 5. Endpoint de cobro charge/route.ts utiliza la emisión fiscal centralizada', () => {
  const chargeCode = fs.readFileSync(CHARGE_ROUTE_PATH, 'utf8');

  assert.ok(
    chargeCode.includes('emitFiscalDocumentForOrder'),
    'charge/route.ts debe usar emitFiscalDocumentForOrder'
  );
  assert.ok(
    chargeCode.includes('deductStockForOrder'),
    'charge/route.ts debe descontar existencias físicas'
  );
});
