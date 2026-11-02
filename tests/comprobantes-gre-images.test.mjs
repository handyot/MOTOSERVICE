process.env.NODE_ENV = 'test';

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  generatePdfA4,
  generatePdf80mm,
  generateUbl21Xml,
  getDocumentFileName,
  resolveCenturyMotorsImageUrl,
} from '../admin-panel/lib/documents/document-exporter-core.mjs';

import {
  validateGreInput,
  buildGreFiscalDocument,
} from '../admin-panel/lib/documents/gre-core.mjs';

// ==============================================================================
// 1. ISSUE #6: DESCARGA DE COMPROBANTES EN PDF A4, PDF 80 MM Y XML UBL 2.1
// ==============================================================================

test('Issue #6 - Nombres Canónicos de Archivo (A4, 80mm, XML)', () => {
  // Verificación de los ejemplos canónicos exigidos en la especificación
  assert.equal(getDocumentFileName('B001', '660064', 'a4'), 'B001-660064-A4.pdf');
  assert.equal(getDocumentFileName('B001', '660064', '80mm'), 'B001-660064-80mm.pdf');
  assert.equal(getDocumentFileName('B001', '660064', 'xml'), 'B001-660064.xml');

  // Facturas y Guías de Remisión
  assert.equal(getDocumentFileName('F001', '42', 'a4'), 'F001-000042-A4.pdf');
  assert.equal(getDocumentFileName('F001', '000042', '80mm'), 'F001-000042-80mm.pdf');
  assert.equal(getDocumentFileName('F001', '000042', 'xml'), 'F001-000042.xml');
  assert.equal(getDocumentFileName('T001', '1', 'a4'), 'T001-000001-A4.pdf');
  assert.equal(getDocumentFileName('T001', '1', 'xml'), 'T001-000001.xml');
});

test('Issue #6 - Generación de PDF A4 estructurado con desglose SUNAT', () => {
  const mockBoleta = {
    tipo: 'BOLETA',
    serie: 'B001',
    numero: '660064',
    fechaEmision: '2026-11-01T15:30:00Z',
    moneda: 'PEN',
    datosReceptor: {
      docType: 'DNI',
      docNumber: '72458912',
      businessName: 'Juan Perez Flores',
      direccion: 'Av. Arequipa 2450, Lince, Lima',
    },
    totalGravada: 1000.0,
    totalIgv: 180.0,
    totalComprobante: 1180.0,
    numeroPedido: 'MS-2026-9901',
    items: [
      {
        sku: 'BAT-60V-20AH',
        nombre: 'Batería de Litio Ternario 60V 20Ah',
        cantidad: 1,
        precioUnitario: 1180.0,
        subtotal: 1180.0,
        unidad: 'NIU',
      },
    ],
  };

  const bufferA4 = generatePdfA4(mockBoleta);
  assert.ok(Buffer.isBuffer(bufferA4), 'Debe retornar un Buffer binario de Node.js');
  assert.ok(bufferA4.length > 500, 'El archivo PDF A4 debe tener un tamaño razonable');

  const content = bufferA4.toString('utf8');
  assert.ok(content.startsWith('%PDF-1.4'), 'Debe iniciar con cabecera estándar %PDF-1.4');
  assert.ok(content.includes('NERO ELECTRIC MOTORS S.A.C.'), 'Debe contener la razón social del emisor');
  assert.ok(content.includes('20613074342'), 'Debe contener el RUC del emisor');
  assert.ok(content.includes('BOLETA DE VENTA ELECTRONICA'), 'Debe indicar el título oficial');
  assert.ok(content.includes('B001-660064'), 'Debe contener la serie y correlativo');
  assert.ok(content.includes('72458912'), 'Debe contener el documento del cliente');
  assert.ok(content.includes('180.00'), 'Debe contener el IGV calculado');
  assert.ok(content.includes('1180.00'), 'Debe contener el total comprobante');
  assert.ok(content.includes('%%EOF'), 'Debe finalizar con %%EOF');
});

test('Issue #6 - Generación de PDF Térmico 80 mm para impresión de tickets', () => {
  const mockFactura = {
    tipo: 'FACTURA',
    serie: 'F001',
    numero: '000885',
    fechaEmision: '2026-11-01T16:00:00Z',
    moneda: 'PEN',
    datosReceptor: {
      docType: 'RUC',
      docNumber: '20556677889',
      businessName: 'LOGISTICA VERDE DEL PERU S.A.C.',
      direccion: 'Av. Elmer Faucett 120, Callao',
    },
    totalGravada: 2500.0,
    totalIgv: 450.0,
    totalComprobante: 2950.0,
    numeroPedido: 'MS-2026-9902',
    items: [
      {
        sku: 'CTRL-72V-80A',
        nombre: 'Controlador Inteligente Votol EM100 72V',
        cantidad: 2,
        precioUnitario: 1475.0,
        subtotal: 2950.0,
        unidad: 'NIU',
      },
    ],
  };

  const buffer80mm = generatePdf80mm(mockFactura);
  assert.ok(Buffer.isBuffer(buffer80mm), 'Debe retornar un Buffer binario');
  const content = buffer80mm.toString('utf8');
  assert.ok(content.startsWith('%PDF-1.4'));
  assert.ok(content.includes('FACTURA ELECTRONICA'));
  assert.ok(content.includes('F001-000885'));
  assert.ok(content.includes('20556677889'));
  assert.ok(content.includes('2950.00'));
  assert.ok(content.includes('MediaBox [0 0 226.77'), 'Debe fijar el ancho en 80 mm (226.77 pt)');
});

test('Issue #6 - Generación de XML UBL 2.1 estructurado para Boletas y Facturas', () => {
  const mockDoc = {
    tipo: 'FACTURA',
    serie: 'F001',
    numero: '000123',
    fechaEmision: '2026-11-01T12:00:00Z',
    moneda: 'PEN',
    datosReceptor: {
      docType: 'RUC',
      docNumber: '20100070970',
      businessName: 'SUPERMERCADOS PERUANOS S.A.',
      direccion: 'Calle Morelli 181, San Borja',
    },
    totalGravada: 500.0,
    totalIgv: 90.0,
    totalComprobante: 590.0,
    items: [
      {
        sku: 'REP-CARG-60V',
        nombre: 'Cargador Inteligente Litio 60V 5A',
        cantidad: 1,
        precioUnitario: 590.0,
        subtotal: 590.0,
      },
    ],
  };

  const xml = generateUbl21Xml(mockDoc);
  assert.ok(xml.includes('<?xml version="1.0" encoding="UTF-8"?>'), 'Debe incluir prólogo XML');
  assert.ok(xml.includes('<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"'), 'Namespace UBL 2.1');
  assert.ok(xml.includes('<cbc:UBLVersionID>2.1</cbc:UBLVersionID>'), 'Versión UBL');
  assert.ok(xml.includes('<cbc:ID>F001-000123</cbc:ID>'), 'ID de Comprobante');
  assert.ok(xml.includes('<cbc:InvoiceTypeCode listAgencyName="PE:SUNAT" listName="Tipo de Documento">01</cbc:InvoiceTypeCode>'), 'Tipo 01 para Factura');
  assert.ok(xml.includes('20613074342'), 'RUC del emisor');
  assert.ok(xml.includes('20100070970'), 'RUC del receptor');
  assert.ok(xml.includes('<cbc:ID schemeAgencyName="PE:SUNAT" schemeID="UN/ECE 5153" schemeName="Codigo de tributos">1000</cbc:ID>'), 'Código tributo 1000 IGV');
  assert.ok(xml.includes('<cbc:TaxAmount currencyID="PEN">90.00</cbc:TaxAmount>'), 'Monto IGV');
  assert.ok(xml.includes('<cbc:PayableAmount currencyID="PEN">590.00</cbc:PayableAmount>'), 'Total a pagar');
});

// ==============================================================================
// 2. ISSUE #7: FLUJO LOGÍSTICO Y GUÍAS DE REMISIÓN REMITENTE (GRE SERIE T001)
// ==============================================================================

test('Issue #7 - Validación de GRE: Obligatoriedad de datos de transporte privado', () => {
  const invalidPrivate = {
    orderId: 'ord-1',
    orderNumber: 'MS-2026-101',
    motivoTraslado: 'VENTA',
    modalidadTransporte: 'PRIVADO',
    fechaInicioTraslado: '2026-11-02',
    puntoPartida: 'Av. Canevaro 1332, Lince',
    puntoLlegada: 'Av. Salaverry 1500, Jesus Maria',
    destinatario: {
      docType: 'DNI',
      docNumber: '44556677',
      nombre: 'Pedro Castillo',
    },
    pesoBrutoTotalKg: 5,
    items: [{ sku: 'SKU-1', nombre: 'Motor HUB 1500W', cantidad: 1 }],
    // conductor ausente
  };

  const res1 = validateGreInput(invalidPrivate);
  assert.equal(res1.valid, false);
  assert.ok(res1.errors.some((e) => e.includes('datos del vehículo y conductor')));

  // Conductor con datos incompletos
  invalidPrivate.conductor = {
    nombre: 'Ca', // Demasiado corto
    docNumber: '123', // No tiene 8 dígitos
    licencia: '',
    placaVehiculo: 'XYZ', // Placa inválida
  };

  const res2 = validateGreInput(invalidPrivate);
  assert.equal(res2.valid, false);
  assert.ok(res2.errors.some((e) => e.includes('DNI del conductor debe contener 8 dígitos')));
  assert.ok(res2.errors.some((e) => e.includes('licencia de conducir MTC')));
  assert.ok(res2.errors.some((e) => e.includes('placa del vehículo')));

  // Conductor con datos válidos
  invalidPrivate.conductor = {
    nombre: 'Carlos Ramos Quispe',
    docNumber: '45892134',
    licencia: 'Q45892134',
    placaVehiculo: 'B12-890',
  };

  const res3 = validateGreInput(invalidPrivate);
  assert.equal(res3.valid, true, `Debe ser válida pero tuvo errores: ${res3.errors.join(', ')}`);
});

test('Issue #7 - Validación de GRE: Obligatoriedad de datos de transporte público (Courier)', () => {
  const invalidPublic = {
    orderId: 'ord-2',
    orderNumber: 'MS-2026-102',
    motivoTraslado: 'VENTA',
    modalidadTransporte: 'PUBLICO',
    fechaInicioTraslado: '2026-11-02',
    puntoPartida: 'Av. Canevaro 1332, Lince',
    puntoLlegada: 'Av. Larco 400, Trujillo',
    destinatario: {
      docType: 'RUC',
      docNumber: '20601234567',
      nombre: 'MOTO CLUB NORTE S.A.C.',
    },
    pesoBrutoTotalKg: 15,
    items: [{ sku: 'SKU-2', nombre: 'Pack Celdas 18650', cantidad: 4 }],
    // transportista ausente
  };

  const res1 = validateGreInput(invalidPublic);
  assert.equal(res1.valid, false);
  assert.ok(res1.errors.some((e) => e.includes('empresa transportista')));

  // Transportista con RUC inválido
  invalidPublic.transportista = {
    razonSocial: 'OLVA COURIER S.A.C.',
    ruc: '12345678901', // No empieza con 10 o 20
  };

  const res2 = validateGreInput(invalidPublic);
  assert.equal(res2.valid, false);
  assert.ok(res2.errors.some((e) => e.includes('RUC del transportista')));

  // Transportista válido
  invalidPublic.transportista.ruc = '20100686814'; // RUC real Olva Courier
  const res3 = validateGreInput(invalidPublic);
  assert.equal(res3.valid, true, `Debe ser válida pero tuvo errores: ${res3.errors.join(', ')}`);
});

test('Issue #7 - Generación y Estructura Fiscal de Guía de Remisión (Serie T001)', () => {
  const input = {
    orderId: 'ord-99',
    orderNumber: 'MS-2026-8800',
    motivoTraslado: 'VENTA',
    modalidadTransporte: 'PRIVADO',
    fechaInicioTraslado: '2026-11-03',
    puntoPartida: 'Av. Cesar Canevaro 1332, Lince, Lima',
    puntoLlegada: 'Av. Javier Prado Este 2200, San Borja, Lima',
    destinatario: {
      docType: 'DNI',
      docNumber: '44558899',
      nombre: 'Maria Fernanda Rojas',
    },
    conductor: {
      nombre: 'Carlos Ramos Quispe',
      docNumber: '45892134',
      licencia: 'Q45892134',
      placaVehiculo: 'B12-890',
    },
    pesoBrutoTotalKg: 8.5,
    items: [
      { sku: 'BAT-LIT-72V', nombre: 'Bateria Litio 72V 35Ah', cantidad: 1, pesoKg: 8.5 },
    ],
    comprobanteAsociado: {
      tipo: 'BOLETA',
      serieNumero: 'B001-660064',
    },
  };

  const greDoc = buildGreFiscalDocument(input, 1);
  assert.equal(greDoc.tipo, 'GUIA_REMISION');
  assert.equal(greDoc.serie, 'T001');
  assert.equal(greDoc.numero, 'T001-000001');
  assert.equal(greDoc.numeroPedido, 'MS-2026-8800');
  assert.ok(greDoc.observaciones.includes('B001-660064'), 'Debe vincular comprobante en observaciones');

  // Comprobar exportación a XML UBL 2.1 DespatchAdvice
  const greXml = generateUbl21Xml(greDoc);
  assert.ok(greXml.includes('<DespatchAdvice xmlns="urn:oasis:names:specification:ubl:schema:xsd:DespatchAdvice-2"'));
  assert.ok(greXml.includes('<cbc:ID>T001-000001</cbc:ID>'));
  assert.ok(greXml.includes('<cbc:DespatchAdviceTypeCode listAgencyName="PE:SUNAT" listName="Tipo de Guia">09</cbc:DespatchAdviceTypeCode>'));
  assert.ok(greXml.includes('<cbc:GrossWeightMeasure unitCode="KGM">8.50</cbc:GrossWeightMeasure>'));
  assert.ok(greXml.includes('Q45892134'), 'Debe incluir brevete del conductor');
  assert.ok(greXml.includes('Carlos Ramos Quispe'), 'Debe incluir nombre del conductor');

  // Comprobar exportación a PDF A4 de Guía
  const grePdfA4 = generatePdfA4(greDoc);
  assert.ok(Buffer.isBuffer(grePdfA4));
  const pdfContent = grePdfA4.toString('utf8');
  assert.ok(pdfContent.includes('GUIA DE REMISION ELECTRONICA'));
  assert.ok(pdfContent.includes('T001-000001'));
  assert.ok(pdfContent.includes('8.50 KG'));
});

// ==============================================================================
// 3. ISSUE #8: CORRECCIÓN DE IMÁGENES ROTAS DE CENTURY MOTORS
// ==============================================================================

test('Issue #8 - Resolución de URLs rotas de Century Motors (.webp -> .jpg)', () => {
  const brokenWebp = 'https://centurymotors.pe/wp-content/uploads/2024/09/cuatrimoto-nitro-49cc-century-motors.webp';
  const resolved = resolveCenturyMotorsImageUrl(brokenWebp);
  assert.equal(
    resolved,
    'https://centurymotors.pe/wp-content/uploads/2024/09/cuatrimoto-nitro-49cc-century-motors.jpg',
    'Debe sustituir extensión .webp por .jpg para servidores Century Motors'
  );

  // URLs válidas que ya son .jpg no deben alterarse
  const alreadyJpg = 'https://centurymotors.pe/wp-content/uploads/2024/09/electrico-m1-36v.jpg';
  assert.equal(resolveCenturyMotorsImageUrl(alreadyJpg), alreadyJpg);

  // URLs de otras marcas o dominios no deben alterarse
  const greenLineUrl = 'https://greenline.pe/wp-content/uploads/2023/moto.webp';
  assert.equal(resolveCenturyMotorsImageUrl(greenLineUrl), greenLineUrl);

  // Nulos o indefinidos manejados de forma segura
  assert.equal(resolveCenturyMotorsImageUrl(null), null);
  assert.equal(resolveCenturyMotorsImageUrl(undefined), null);
});

test('Issue #8 - Verificación de Integridad en data/ecomoto-data.ts y migraciones SQL', () => {
  const dataPath = path.resolve('data/ecomoto-data.ts');
  const content = fs.readFileSync(dataPath, 'utf8');

  // Modelos críticos mencionados en el issue (verificación case-insensitive)
  const modelosCriticos = [
    'Cuatrimoto Nitro 49cc',
    'Electrico M1 36v',
    'Trimoto BMW Inspired',
    'Trimoto Electrica para Adultos',
    'Excelencia con techo',
  ];

  for (const modelo of modelosCriticos) {
    const found = content.toLowerCase().includes(modelo.toLowerCase());
    assert.ok(found, `El catálogo debe contener el modelo '${modelo}'`);
  }

  // Verificar que en los modelos de OFFICIAL_MOTOS no existan URLs con .webp
  const motosSection = content.split('export const OFFICIAL_PARTS')[0];
  const matchesWebp = motosSection.match(/https:\/\/centurymotors\.pe\/[^\s"']+\.webp/g);
  assert.equal(
    matchesWebp,
    null,
    `No deben quedar URLs .webp de centurymotors.pe en los modelos oficiales de data/ecomoto-data.ts.`
  );

  // Verificar en la migración de Century Motors
  const migrationPath = path.resolve('supabase/migrations/20261031180000_ampliar_catalogo_century_motors.sql');
  const migrationContent = fs.readFileSync(migrationPath, 'utf8');
  const migrationMatchesWebp = migrationContent.match(/https:\/\/centurymotors\.pe\/[^\s"']+\.webp/g);
  assert.equal(
    migrationMatchesWebp,
    null,
    `No deben quedar URLs .webp de centurymotors.pe en la migración SQL. Encontradas: ${JSON.stringify(migrationMatchesWebp)}`
  );
});
