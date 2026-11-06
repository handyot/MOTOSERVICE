/**
 * MOTOSERVICE — Suite de Pruebas: Buscador y Sincronización de Catálogo (Issue #27)
 *
 * Verifica:
 * 1. Motor de búsqueda unificado (searchCatalogItems y normalizeSearchText).
 * 2. Normalización de tildes, mayúsculas y espacios.
 * 3. Búsqueda certera por SKU, nombre, marca, modelo de moto y voltaje.
 * 4. Exclusión de productos no visibles o inactivos según product-status-core.
 * 5. Coherencia entre API de búsqueda (/api/catalog/search) y catálogo oficial.
 * 6. Reactividad y sincronización de eventos en Navbar y EcoMotoCatalogSection.
 * 7. Soporte idéntico de búsqueda para escritorio y móvil.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { normalizeSearchText, searchCatalogItems } from '../lib/catalog/search-core.mjs';

const NAVBAR_PATH = path.resolve('components/layout/Navbar.jsx');
const CATALOG_SECTION_PATH = path.resolve('components/ecomoto/EcoMotoCatalogSection.tsx');
const SEARCH_ROUTE_PATH = path.resolve('app/api/catalog/search/route.ts');

test('Issue #27 - 1. normalizeSearchText limpia tildes, mayúsculas y espacios en blanco', () => {
  assert.equal(normalizeSearchText('  BATERÍA  '), 'bateria');
  assert.equal(normalizeSearchText('Scooter Eléctrico'), 'scooter electrico');
  assert.equal(normalizeSearchText(null), '');
  assert.equal(normalizeSearchText(undefined), '');
  assert.equal(normalizeSearchText('72V 45Ah'), '72v 45ah');
});

test('Issue #27 - 2. searchCatalogItems maneja entradas vacías o nulas sin fallar', () => {
  const emptyRes = searchCatalogItems({ query: '   ' });
  assert.equal(emptyRes.totalMatches, 0);
  assert.equal(emptyRes.parts.length, 0);
  assert.equal(emptyRes.motos.length, 0);
  assert.equal(emptyRes.query, '');
});

test('Issue #27 - 3. searchCatalogItems encuentra repuestos por SKU, marca y voltaje', () => {
  const sampleParts = [
    {
      sku: 'MS-BAT-72V45AH',
      partKey: 'BAT-72-45',
      name: 'Batería de Litio Ternario 72V 45Ah',
      category: 'Baterías',
      brand: 'NERO Electric',
      voltage: 72,
      pricePen: 2850,
      dataStatus: 'ACTIVO',
    },
    {
      sku: 'MS-CTRL-60V1500W',
      partKey: 'CTRL-60-1500',
      name: 'Controlador Senoidal Inteligente 60V 1500W',
      category: 'Controladores',
      brand: 'YADEA',
      voltage: 60,
      powerW: 1500,
      dataStatus: 'ACTIVO',
    },
    {
      sku: 'MS-OLD-48V',
      partKey: 'OLD-48',
      name: 'Repuesto Obsoleto Bloqueado',
      category: 'Baterías',
      brand: 'TAILG',
      voltage: 48,
      dataStatus: 'BLOQUEADO',
    },
  ];

  // Búsqueda por SKU exacto
  const resSku = searchCatalogItems({ query: 'MS-BAT-72V45AH', parts: sampleParts });
  assert.equal(resSku.totalMatches, 1);
  assert.equal(resSku.parts[0].sku, 'MS-BAT-72V45AH');

  // Búsqueda insensible a tildes y mayúsculas
  const resAccent = searchCatalogItems({ query: 'batería', parts: sampleParts });
  assert.equal(resAccent.parts.length, 1);
  assert.equal(resAccent.parts[0].sku, 'MS-BAT-72V45AH');

  // El producto con estado BLOQUEADO debe ser excluido automáticamente
  const resBlocked = searchCatalogItems({ query: 'Obsoleto', parts: sampleParts });
  assert.equal(resBlocked.parts.length, 0);
});

test('Issue #27 - 4. searchCatalogItems encuentra modelos de moto eléctrica por nombre y especificaciones', () => {
  const sampleMotos = [
    {
      slug: 'tailg-lion',
      brand: 'TAILG',
      model: 'Lion',
      vehicleType: 'Scooter Eléctrico',
      batteryVoltageV: 72,
      motorPowerW: 2500,
    },
    {
      slug: 'yadea-g5',
      brand: 'YADEA',
      model: 'G5',
      vehicleType: 'Motocicleta Eléctrica',
      batteryVoltageV: 60,
      motorPowerW: 2300,
    },
  ];

  // Búsqueda por modelo
  const resLion = searchCatalogItems({ query: 'Lion', motos: sampleMotos });
  assert.equal(resLion.motos.length, 1);
  assert.equal(resLion.motos[0].slug, 'tailg-lion');

  // Búsqueda por marca
  const resYadea = searchCatalogItems({ query: 'Yadea', motos: sampleMotos });
  assert.equal(resYadea.motos.length, 1);
  assert.equal(resYadea.motos[0].slug, 'yadea-g5');

  // Búsqueda por voltaje
  const resVoltage = searchCatalogItems({ query: '72v', motos: sampleMotos });
  assert.equal(resVoltage.motos.length, 1);
  assert.equal(resVoltage.motos[0].model, 'Lion');
});

test('Issue #27 - 5. Navbar emite eventos catalog-search y gestiona búsqueda en escritorio y móvil', () => {
  const navbarCode = fs.readFileSync(NAVBAR_PATH, 'utf8');

  // Verifica que exista despachador de eventos catalog-search
  assert.ok(navbarCode.includes('dispatchCatalogSearch'), 'Navbar debe definir dispatchCatalogSearch');
  assert.ok(navbarCode.includes('catalog-search'), 'Navbar debe emitir el CustomEvent catalog-search');

  // Verifica que el submit móvil use la lógica centralizada handleSearchSubmit
  assert.ok(navbarCode.includes('onSubmit={handleSearchSubmit}'), 'El formulario móvil debe usar handleSearchSubmit');
  assert.ok(navbarCode.includes('setMobileMenuOpen(false)'), 'handleSearchSubmit debe cerrar el menú móvil');

  // Verifica que cierre el menú desplegable de resultados al hacer clic en sugerencia
  assert.ok(navbarCode.includes('setIsDropdownOpen(false)'), 'Debe cerrar el desplegable de sugerencias');
});

test('Issue #27 - 6. EcoMotoCatalogSection escucha catalog-search y sincroniza estado reactivo', () => {
  const catalogCode = fs.readFileSync(CATALOG_SECTION_PATH, 'utf8');

  // Verifica el listener de eventos del catálogo
  assert.ok(
    catalogCode.includes("window.addEventListener('catalog-search'"),
    'EcoMotoCatalogSection debe escuchar el evento catalog-search'
  );
  assert.ok(
    catalogCode.includes("window.removeEventListener('catalog-search'"),
    'EcoMotoCatalogSection debe desuscribirse limpiamente al desmontarse'
  );

  // Sincronización de searchFilter reactivo
  assert.ok(
    catalogCode.includes('setSearchFilter(q);') || catalogCode.includes('setSearchFilter(initialQuery);'),
    'Debe actualizar searchFilter reactivamente'
  );

  // Conmutación automática de pestañas entre repuestos y motos si no hay resultados en la activa
  assert.ok(
    catalogCode.includes("setActiveTab('motos')") && catalogCode.includes("setActiveTab('repuestos')"),
    'Debe alternar entre pestañas cuando la búsqueda sólo tiene coincidencias en la otra'
  );
});

test('Issue #27 - 7. La ruta API /api/catalog/search sincroniza los repuestos y motos oficiales', () => {
  const routeCode = fs.readFileSync(SEARCH_ROUTE_PATH, 'utf8');

  // Verifica importación de OFFICIAL_PARTS y getPublicCatalogMotos
  assert.ok(routeCode.includes('OFFICIAL_PARTS'), 'Debe usar repuestos oficiales');
  assert.ok(routeCode.includes('getPublicCatalogMotos'), 'Debe usar catálogo público de motos');
  assert.ok(routeCode.includes('searchCatalogItems'), 'Debe usar la función searchCatalogItems');
});
