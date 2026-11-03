/**
 * MOTOSERVICE - Test Suite: Reclasificación y Movimiento de Productos de Catálogo
 * Valida la acción «Mover a catálogo», reglas de negocio, prevención de duplicados,
 * integridad transaccional y reflejo en tienda pública y VoltIA.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  CATALOG_DESTINATIONS,
  VEHICLE_TYPES,
  inferVehicleDataFromPart,
  validateReclassification,
  generateVehicleSlug,
  executeReclassify,
} from '../lib/catalog/reclassify-core.mjs';

import { searchCatalogItems } from '../lib/catalog/search-core.mjs';
import { isProductVisibleInCatalog } from '../lib/catalog/product-status-core.mjs';
import { executeSearchCatalog } from '../lib/voltia/voltia-ai-tools-core.mjs';

const ROOT_DIR = process.cwd();

test('1. Inferencia técnica inteligente de vehículos a partir de repuestos mal clasificados', () => {
  const motocargaPart = {
    id_repuesto: 101,
    id_marca: 5,
    brand: 'CENTURY MOTORS',
    name: 'Motocarga Eléctrica 1000w',
    sku: 'CENT-2926',
    pricePen: 7700,
    electricalVoltageV: 60,
    imageUrl: 'https://centurymotors.pe/wp-content/uploads/2022/06/motocargas-electricas-800w.png',
  };

  const inferred = inferVehicleDataFromPart(motocargaPart, [
    { id_marca: 5, nombre: 'CENTURY MOTORS' },
  ]);

  assert.ok(inferred, 'Debe inferir datos de vehículo');
  assert.equal(inferred.vehicleType, VEHICLE_TYPES.MOTOCARGA_ELECTRICA, 'Debe clasificar como MOTOCARGA_ELECTRICA');
  assert.equal(inferred.voltage, 60, 'Debe extraer voltaje 60V');
  assert.equal(inferred.powerW, 1000, 'Debe extraer potencia 1000W del nombre');
  assert.equal(inferred.price, 7700, 'Debe conservar precio de 7700 PEN');
  assert.equal(inferred.originalSku, 'CENT-2926', 'Debe conservar SKU original');
  assert.equal(inferred.slug, 'century-motors-motocarga-electrica-1000w');
});

test('2. Validación de reglas de reclasificación: movimientos válidos e inválidos', () => {
  // Movimiento válido a Modelos EV
  const validModelRes = validateReclassification({
    sourceEntity: 'repuestos',
    targetList: CATALOG_DESTINATIONS.MODELOS_EV,
    sourceItem: { nombre: 'Motocarga Eléctrica 1000w', codigo_sku: 'CENT-2926', id_marca: 5 },
    payload: {
      nombre: 'Motocarga Eléctrica 1000w',
      id_marca: 5,
      brandName: 'CENTURY MOTORS',
      vehicleType: VEHICLE_TYPES.MOTOCARGA_ELECTRICA,
      voltaje_nominal_v: 60,
      potencia_motor_w: 1000,
      precio: 7700,
    },
  });
  assert.equal(validModelRes.valid, true, 'Debe validar exitosamente movimiento válido a Modelos EV');
  assert.equal(validModelRes.sanitizedData.vehicleType, VEHICLE_TYPES.MOTOCARGA_ELECTRICA);

  // Movimiento inválido: falta de nombre
  const invalidNameRes = validateReclassification({
    sourceEntity: 'repuestos',
    targetList: CATALOG_DESTINATIONS.MODELOS_EV,
    sourceItem: { nombre: '' },
    payload: { nombre: '  ' },
  });
  assert.equal(invalidNameRes.valid, false);
  assert.ok(invalidNameRes.error.includes('al menos 3 caracteres'));

  // Movimiento inválido: voltaje fuera de rango
  const invalidVoltageRes = validateReclassification({
    sourceEntity: 'repuestos',
    targetList: CATALOG_DESTINATIONS.MODELOS_EV,
    sourceItem: { nombre: 'Moto Test', id_marca: 1 },
    payload: {
      nombre: 'Moto Test',
      id_marca: 1,
      voltaje_nominal_v: 500, // Imposible para motos eléctricas
    },
  });
  assert.equal(invalidVoltageRes.valid, false);
  assert.ok(invalidVoltageRes.error.includes('voltaje'));

  // Movimiento inválido: mover a la misma lista sin cambios
  const sameListRes = validateReclassification({
    sourceEntity: 'repuestos',
    targetList: CATALOG_DESTINATIONS.REPUESTOS,
    sourceItem: { nombre: 'Batería 72V', id_categoria: 1 },
    payload: {},
  });
  assert.equal(sameListRes.valid, false);
  assert.ok(sameListRes.error.includes('ya se encuentra en la lista'));
});

test('3. Prevención de modelos duplicados en destino', async () => {
  // Mock de Supabase que reporta un modelo existente
  const mockSupabaseWithDuplicate = {
    from: (table) => {
      if (table === 'modelos_moto') {
        return {
          select: () => ({
            eq: () => ({
              ilike: () => ({
                maybeSingle: async () => ({
                  data: { id_modelo: 99, nombre: 'Motocarga Eléctrica 1000w', estado: true },
                  error: null,
                }),
              }),
            }),
          }),
        };
      }
      return {};
    },
  };

  const duplicateResult = await executeReclassify({
    supabase: mockSupabaseWithDuplicate,
    sourceEntity: 'repuestos',
    sourceId: 50,
    sourceItem: {
      id_repuesto: 50,
      codigo_sku: 'CENT-2926',
      nombre: 'Motocarga Eléctrica 1000w',
      id_marca: 5,
    },
    targetList: CATALOG_DESTINATIONS.MODELOS_EV,
    payload: {
      nombre: 'Motocarga Eléctrica 1000w',
      id_marca: 5,
      brandName: 'CENTURY MOTORS',
    },
    syncDataFile: false,
  });

  assert.equal(duplicateResult.success, false, 'No debe permitir insertar duplicados');
  assert.equal(duplicateResult.error, 'MODELO_DUPLICADO');
  assert.ok(duplicateResult.message.includes('ya existe registrado'));
});

test('4. Transaccionalidad y compensación segura ante fallos de persistencia', async () => {
  let modelInserted = false;
  let modelRolledBack = false;

  // Mock que falla en la actualización de repuestos para provocar rollback
  const mockSupabaseFailing = {
    from: (table) => {
      if (table === 'modelos_moto') {
        return {
          select: () => ({
            eq: () => ({
              ilike: () => ({
                maybeSingle: async () => ({ data: null, error: null }),
              }),
            }),
          }),
          insert: () => {
            modelInserted = true;
            return {
              select: () => ({
                single: async () => ({
                  data: { id_modelo: 888, nombre: 'Motocarga Eléctrica 1000w' },
                  error: null,
                }),
              }),
            };
          },
          delete: () => ({
            eq: async () => {
              modelRolledBack = true;
              return { error: null };
            },
          }),
        };
      }
      if (table === 'repuestos') {
        return {
          update: () => ({
            eq: async () => ({
              error: new Error('Error de conexión o violación de integridad foránea'),
            }),
          }),
        };
      }
      return {};
    },
  };

  const rollbackResult = await executeReclassify({
    supabase: mockSupabaseFailing,
    sourceEntity: 'repuestos',
    sourceId: 77,
    sourceItem: {
      id_repuesto: 77,
      codigo_sku: 'CENT-2926',
      nombre: 'Motocarga Eléctrica 1000w',
      id_marca: 5,
    },
    targetList: CATALOG_DESTINATIONS.MODELOS_EV,
    payload: {
      nombre: 'Motocarga Eléctrica 1000w',
      id_marca: 5,
      brandName: 'CENTURY MOTORS',
    },
    syncDataFile: false,
  });

  assert.equal(rollbackResult.success, false, 'La operación debe reportar fallo');
  assert.equal(modelInserted, true, 'El modelo intentó insertarse');
  assert.equal(modelRolledBack, true, 'El modelo insertado debe haberse eliminado por compensación');
  assert.ok(rollbackResult.message.includes('Operación revertida por seguridad'));
});

test('5. Reclasificación exitosa y exclusión de artículos fuera de catálogo (juguetes)', async () => {
  let partUpdated = false;

  const mockSupabaseSuccess = {
    from: (table) => {
      if (table === 'repuestos') {
        return {
          update: (payload) => {
            assert.equal(payload.estado, false, 'Debe desactivar el estado');
            assert.equal(payload.data_status, 'ARCHIVADO', 'Debe marcar data_status como ARCHIVADO');
            assert.ok(payload.notas.includes('EXCLUIDO DEL CATÁLOGO COMERCIAL'));
            return {
              eq: async () => {
                partUpdated = true;
                return { error: null };
              },
            };
          },
        };
      }
      return {};
    },
  };

  const toyPart = {
    id_repuesto: 102,
    codigo_sku: 'CENT-2912',
    nombre: 'Nave Espacial Interestelar 12v 360º',
    precio: 499,
  };

  const excludeResult = await executeReclassify({
    supabase: mockSupabaseSuccess,
    sourceEntity: 'repuestos',
    sourceId: toyPart.id_repuesto,
    sourceItem: toyPart,
    targetList: CATALOG_DESTINATIONS.FUERA_CATALOGO,
    payload: {
      reason: 'Juguete infantil eléctrico no comercializado por NERO',
    },
    syncDataFile: false,
  });

  assert.equal(excludeResult.success, true);
  assert.equal(partUpdated, true);
  assert.ok(excludeResult.message.includes('fue excluido del catálogo comercial y archivado'));
});

test('6. Reflejo en la tienda pública y motor de búsqueda tras la reclasificación', () => {
  // Simular catálogo con:
  // - Motocarga reclasificada en motos
  // - Motocarga antigua archivada en repuestos
  // - Juguete archivado en repuestos
  const simulatedMotos = [
    {
      brand: 'CENTURY MOTORS',
      model: 'Motocarga Eléctrica 1000w',
      slug: 'century-motors-motocarga-electrica-1000w',
      vehicleType: 'MOTOCARGA_ELECTRICA',
      batteryVoltageV: 60,
      motorPowerW: 1000,
      listingStatus: 'CATALOGO',
    },
  ];

  const simulatedParts = [
    {
      sku: 'CENT-2926',
      name: 'Motocarga Eléctrica 1000w',
      category: 'Motores eléctricos',
      dataStatus: 'ARCHIVADO', // Reclasificado
    },
    {
      sku: 'CENT-2912',
      name: 'Nave Espacial Interestelar 12v 360º',
      category: 'Juguetes',
      dataStatus: 'ARCHIVADO', // Excluido
    },
    {
      sku: 'MS-BAT-72V45AH',
      name: 'Pack Batería Litio Smart NMC 72V 45Ah',
      category: 'baterias-bms',
      dataStatus: 'ACTIVO',
    },
  ];

  // Búsqueda de "Motocarga"
  const searchResult = searchCatalogItems({
    query: 'motocarga',
    parts: simulatedParts,
    motos: simulatedMotos,
  });

  // La Motocarga debe aparecer en motos
  assert.equal(searchResult.motos.length, 1, 'Debe encontrar la Motocarga en vehículos/motos');
  assert.equal(searchResult.motos[0].model, 'Motocarga Eléctrica 1000w');

  // La Motocarga antigua NO debe aparecer en repuestos activos
  assert.equal(searchResult.parts.length, 0, 'No debe aparecer como repuesto comercial activo');

  // Búsqueda de "Nave Espacial" (excluido / archivado)
  const toySearchResult = searchCatalogItems({
    query: 'nave espacial',
    parts: simulatedParts,
    motos: simulatedMotos,
  });
  assert.equal(toySearchResult.totalMatches, 0, 'El producto archivado fuera de catálogo no debe ser visible');

  // Verificación de función de visibilidad
  assert.equal(isProductVisibleInCatalog('ARCHIVADO', true), false);
  assert.equal(isProductVisibleInCatalog('ACTIVO', true), true);
});

test('7. VoltIA identifica la Motocarga como vehículo y no recomienda repuestos archivados', async () => {
  const simulatedMotos = [
    {
      brand: 'CENTURY MOTORS',
      model: 'Motocarga Eléctrica 1000w',
      slug: 'century-motors-motocarga-electrica-1000w',
      vehicleType: 'MOTOCARGA_ELECTRICA',
      batteryVoltageV: 60,
      motorPowerW: 1000,
    },
  ];

  const simulatedParts = [
    {
      sku: 'CENT-2926',
      name: 'Motocarga Eléctrica 1000w',
      dataStatus: 'ARCHIVADO',
      status: 'ARCHIVADO',
    },
    {
      sku: 'MS-BAT-60V',
      name: 'Batería 60V para Motocarga',
      dataStatus: 'ACTIVO',
      status: 'ACTIVO',
    },
  ];

  const voltiaResult = await executeSearchCatalog(
    { query: 'motocarga' },
    { parts: simulatedParts, motos: simulatedMotos }
  );

  // VoltIA debe obtener resultados de catálogo
  assert.equal(voltiaResult.success, true);
  // Las motos encontradas contienen la motocarga
  assert.ok(
    voltiaResult.motos.some((m) => m.model.includes('Motocarga')),
    'VoltIA debe listar la Motocarga como modelo de vehículo'
  );
  // No debe contener la versión como repuesto archivado
  assert.ok(
    !voltiaResult.parts.some((p) => p.sku === 'CENT-2926'),
    'VoltIA no debe listar la Motocarga archivada como repuesto comprable'
  );
});

test('8. Inspección de UI y componentes del panel administrativo', () => {
  const adminViewPath = path.join(ROOT_DIR, 'admin-panel/components/admin/AdminDashboardView.tsx');
  const content = fs.readFileSync(adminViewPath, 'utf8');

  // Menú contextual de tres puntos incorpora acción
  assert.ok(
    content.includes('Mover a catálogo...') || content.includes('Mover a catálogo / Reclasificar'),
    'El menú de tres puntos debe incluir la acción de Mover a catálogo'
  );

  // Modal de reclasificación
  assert.ok(
    content.includes('reclassifyModalItem') && content.includes('reclassifyTargetList'),
    'Debe existir estado y lógica para el modal de reclasificación'
  );

  // Destinos requeridos
  assert.ok(content.includes('modelos_ev'), 'Debe contemplar destino Modelos EV');
  assert.ok(content.includes('repuestos'), 'Debe contemplar destino Repuestos');
  assert.ok(content.includes('fuera_catalogo'), 'Debe contemplar destino Fuera de Catálogo Comercial');

  // Trazabilidad y no duplicados
  assert.ok(content.includes('Garantías de integridad comercial'), 'Debe incluir garantías de trazabilidad');
  assert.ok(content.includes('handleConfirmReclassify'), 'Debe existir la función de confirmación');
});

test('9. Integridad del endpoint /api/admin/catalog/manage para la operación reclassify', () => {
  const routePath = path.join(ROOT_DIR, 'admin-panel/app/api/admin/catalog/manage/route.ts');
  const routeContent = fs.readFileSync(routePath, 'utf8');

  assert.ok(
    routeContent.includes("operation === 'reclassify'"),
    'La ruta administrativa debe soportar operation reclassify'
  );
  assert.ok(
    routeContent.includes('executeReclassify'),
    'La ruta administrativa debe invocar executeReclassify'
  );
  assert.ok(
    routeContent.includes('requireAdminApi'),
    'La ruta administrativa debe estar estrictamente protegida por requireAdminApi'
  );
});
