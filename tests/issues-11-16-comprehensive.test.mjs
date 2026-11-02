/**
 * MOTOSERVICE — Suite de Pruebas Automatizadas para Issues #11 a #16
 *
 * Cobertura:
 * - Issue #11: Registro de vehículos del cliente (catálogo autocompletado + personalizado con validación técnica y aislamiento).
 * - Issue #12: Generación automática de username ('ANDY OR.', 'CARLOS ME.', colisiones y saludo personalizado).
 * - Issue #13: Autocompletado en checkout y separación estricta de comprador vs destinatario.
 * - Issue #14: Botón de conversación en tarjetas de compatibilidad conectado con VoltIA (sin redirección a WhatsApp).
 * - Issue #15: Búsqueda funcional de catálogo (repuestos, SKU, motos, respeto a ciclo de vida y estado comercial).
 * - Issue #16: Rutas y páginas independientes (/repuestos, /motos, /compatibilidad) con navegación activa.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  generateUsername,
  normalizeNameString,
  formatPersonalizedGreeting,
} from '../lib/auth/username-core.mjs';

import {
  searchCatalogItems,
} from '../lib/catalog/search-core.mjs';

import {
  isProductVisibleInCatalog,
  canPurchaseProduct,
} from '../lib/catalog/product-status-core.mjs';

import {
  validateCustomerVehicleInput,
} from '../lib/vehicles/vehicle-core.mjs';

const ROOT_DIR = process.cwd();

// ============================================================================
// ISSUE #12: GENERACIÓN DE NOMBRE DE USUARIO Y SALUDO PERSONALIZADO
// ============================================================================

test('Issue #12: Normalización de nombres con tildes, mayúsculas y espacios múltiples', () => {
  assert.strictEqual(normalizeNameString('  andy   steven  '), 'ANDY STEVEN');
  assert.strictEqual(normalizeNameString('MARÍA   FERNANDA'), 'MARÍA FERNANDA');
  assert.strictEqual(normalizeNameString('carlos  mendoza  pérez'), 'CARLOS MENDOZA PÉREZ');
});

test('Issue #12: Generación de username según la regla oficial (PrimerNombre + espacio + 2LetrasApellido + .)', () => {
  // Casos especificados explícitamente en el requerimiento del usuario:
  assert.strictEqual(generateUsername('Andy Steven Ortiz Trujillo'), 'ANDY OR.');
  assert.strictEqual(generateUsername('Carlos Mendoza Pérez'), 'CARLOS ME.');
  assert.strictEqual(generateUsername('María Fernanda López Torres'), 'MARÍA LÓ.');
  assert.strictEqual(generateUsername('José Ramírez Díaz'), 'JOSÉ RA.');
});

test('Issue #12: Resolución de colisiones determinística para clientes con nombres idénticos', () => {
  const baseUsername = generateUsername('Carlos Mendoza Pérez', 0);
  assert.strictEqual(baseUsername, 'CARLOS ME.');

  const collision1 = generateUsername('Carlos Mendoza Pérez', 1);
  assert.strictEqual(collision1, 'CARLOS ME.2');

  const collision2 = generateUsername('Carlos Mendoza Pérez', 2);
  assert.strictEqual(collision2, 'CARLOS ME.3');
});

test('Issue #12: Generación robusta ante un solo nombre o apellido corto', () => {
  assert.strictEqual(generateUsername('Carlos'), 'CARLOS.');
  assert.strictEqual(generateUsername('Ana Li'), 'ANA LI.');
});

test('Issue #12: Formato de saludo personalizado en interfaces de la tienda', () => {
  assert.strictEqual(formatPersonalizedGreeting('ANDY OR.'), 'Hola, ANDY OR.');
  assert.strictEqual(formatPersonalizedGreeting(null, 'Carlos Mendoza'), 'Hola, CARLOS ME.');
  assert.strictEqual(formatPersonalizedGreeting(null, null), 'Hola, Cliente');
});

// ============================================================================
// ISSUE #11: REGISTRO DE VEHÍCULOS DEL CLIENTE (CATÁLOGO + PERSONALIZADO)
// ============================================================================

test('Issue #11: Modalidad Catálogo valida y autocompleta marca y modelo válidos', () => {
  const input = {
    origin: 'CATALOGO',
    vehicleType: 'MOTO_ELECTRICA',
    brand: 'TAILG',
    model: 'TAILG Lion',
    nominalVoltageV: 72,
    motorPowerW: 2500,
    batteryType: 'Litio NMC',
  };

  const validation = validateCustomerVehicleInput(input);
  assert.strictEqual(validation.valid, true);
  assert.strictEqual(validation.cleaned.origin, 'CATALOGO');
  assert.strictEqual(validation.cleaned.nominalVoltageV, 72);
  assert.strictEqual(validation.cleaned.motorPowerW, 2500);
});

test('Issue #11: Modalidad Personalizada valida rangos técnicos seguros (12-144V, 100-50,000W)', () => {
  // Voltaje fuera de rango (< 12V)
  const invalidVoltage = validateCustomerVehicleInput({
    origin: 'PERSONALIZADO',
    brand: 'CustomEV',
    model: 'Prototipo 1',
    nominalVoltageV: 6,
  });
  assert.strictEqual(invalidVoltage.valid, false);
  assert.ok(invalidVoltage.error.includes('12V y 144V'));

  // Potencia fuera de rango (> 50,000W)
  const invalidPower = validateCustomerVehicleInput({
    origin: 'PERSONALIZADO',
    brand: 'CustomEV',
    model: 'Prototipo 1',
    nominalVoltageV: 72,
    motorPowerW: 60000,
  });
  assert.strictEqual(invalidPower.valid, false);
  assert.ok(invalidPower.error.includes('50,000 W'));

  // Personalizado válido con especificaciones completas
  const validCustom = validateCustomerVehicleInput({
    origin: 'PERSONALIZADO',
    vehicleType: 'MOTO_ELECTRICA',
    brand: 'Conversión Propia',
    model: 'Tracker EV',
    nominalVoltageV: 72,
    motorPowerW: 3000,
    capacityAh: 40,
    controllerModel: 'VOTOL EM-100',
    controllerAmps: 100,
    notes: 'Batería ensamblada con celdas NMC y BMS Bluetooth ANT.',
  });
  assert.strictEqual(validCustom.valid, true);
  assert.strictEqual(validCustom.cleaned.controllerModel, 'VOTOL EM-100');
  assert.strictEqual(validCustom.cleaned.capacityAh, 40);
});

test('Issue #11: Aislamiento estricto de usuario por userId en operaciones de vehículos', () => {
  const serviceFile = fs.readFileSync(path.join(ROOT_DIR, 'lib/vehicles/vehicle-service.ts'), 'utf8');
  assert.ok(
    serviceFile.includes('.eq(\'user_id\', userId)'),
    'Las consultas de actualización y eliminación de vehículos deben filtrar obligatoriamente por user_id'
  );
  assert.ok(
    serviceFile.includes('deleteCustomerVehicle'),
    'Debe existir la función de eliminación de vehículo con control de usuario'
  );
});

// ============================================================================
// ISSUE #13: CHECKOUT - AUTOCOMPLETADO Y SEPARACIÓN DE DESTINATARIO
// ============================================================================

test('Issue #13: Validación estricta cuando recipientType es "other"', () => {
  const orderServiceFile = fs.readFileSync(path.join(ROOT_DIR, 'lib/orders/order-service.ts'), 'utf8');

  assert.ok(
    orderServiceFile.includes("recipientType === 'other'"),
    'order-service debe validar recipientType === other'
  );
  assert.ok(
    orderServiceFile.includes('recipientName'),
    'order-service debe validar y almacenar recipientName'
  );
  assert.ok(
    orderServiceFile.includes('recipientPhone'),
    'order-service debe validar y almacenar recipientPhone'
  );
});

test('Issue #13: El checkout en UI incluye la sección "¿Quién recibirá el pedido?" y autocompletado', () => {
  const checkoutFile = fs.readFileSync(path.join(ROOT_DIR, 'app/checkout/page.tsx'), 'utf8');

  assert.ok(
    checkoutFile.includes('¿Quién recibirá el pedido?'),
    'El checkout debe incluir la sección visual "¿Quién recibirá el pedido?"'
  );
  assert.ok(
    checkoutFile.includes('Yo recibiré el pedido'),
    'El checkout debe permitir elegir "Yo recibiré el pedido"'
  );
  assert.ok(
    checkoutFile.includes('Otra persona recibirá el pedido'),
    'El checkout debe permitir elegir "Otra persona recibirá el pedido"'
  );
  assert.ok(
    checkoutFile.includes('loadUserProfile'),
    'El checkout debe cargar y autocompletar los datos del usuario autenticado'
  );
  assert.ok(
    checkoutFile.includes('Autocompletado con tu cuenta NERO'),
    'El checkout debe mostrar badge de confirmación de autocompletado'
  );
});

// ============================================================================
// ISSUE #14: CONEXIÓN DE CONVERSACIÓN CON VOLTIA EN LUGAR DE WHATSAPP
// ============================================================================

test('Issue #14: El botón de conversación en tarjetas de motos invoca VoltIA in-place y no WhatsApp', () => {
  const ecoMotoFile = fs.readFileSync(path.join(ROOT_DIR, 'components/ecomoto/EcoMotoCatalogSection.tsx'), 'utf8');

  // Asegurar que el botón secundario en las tarjetas de motos usa openVoltIAChat
  assert.ok(
    ecoMotoFile.includes('openVoltIAChat({'),
    'El botón de conversación debe llamar a openVoltIAChat con el contexto del modelo'
  );
  assert.ok(
    ecoMotoFile.includes('<MessageCircle className="w-3.5 h-3.5" />'),
    'El botón de conversación debe usar el componente MessageCircle para abrir VoltIA'
  );
  const motosSection = ecoMotoFile.split("activeTab === 'repuestos'")[0];
  assert.strictEqual(
    motosSection.includes('https://wa.me/'),
    false,
    'Las tarjetas de motos no deben enlazar a wa.me externo'
  );

  // Asegurar que el widget VoltIA maneja el evento open-voltia
  const voltiaWidgetFile = fs.readFileSync(path.join(ROOT_DIR, 'components/voltia/VoltIAWidget.tsx'), 'utf8');
  assert.ok(
    voltiaWidgetFile.includes("'open-voltia'"),
    'VoltIAWidget debe escuchar el evento open-voltia para abrirse directamente sin salir de la tienda'
  );
});

// ============================================================================
// ISSUE #15: BÚSQUEDA FUNCIONAL DE PRODUCTOS, REPUESTOS Y MOTOS
// ============================================================================

test('Issue #15: searchCatalogItems encuentra repuestos por SKU exacto o parcial', () => {
  const mockParts = [
    {
      sku: 'MS-BAT-72V45AH',
      name: 'Pack Batería Litio Smart NMC 72V 45Ah',
      category: 'BATERIAS',
      brand: 'NERO Electric',
      price: 3450,
      voltage: 72,
      dataStatus: 'ACTIVO',
    },
    {
      sku: 'MS-CTRL-VOTOL-EM100',
      name: 'Controlador Senoidal VOTOL EM-100/2 72V',
      category: 'CONTROLADORES',
      brand: 'VOTOL',
      price: 680,
      voltage: 72,
      dataStatus: 'ACTIVO',
    },
  ];

  const res1 = searchCatalogItems({ query: 'MS-BAT', parts: mockParts, motos: [] });
  assert.strictEqual(res1.parts.length, 1);
  assert.strictEqual(res1.parts[0].sku, 'MS-BAT-72V45AH');

  const res2 = searchCatalogItems({ query: 'VOTOL', parts: mockParts, motos: [] });
  assert.strictEqual(res2.parts.length, 1);
  assert.strictEqual(res2.parts[0].sku, 'MS-CTRL-VOTOL-EM100');
});

test('Issue #15: searchCatalogItems excluye productos con estado BLOQUEADO u OCULTO', () => {
  const mockParts = [
    {
      sku: 'PART-ACTIVA',
      name: 'Cargador 72V Activo',
      dataStatus: 'ACTIVO',
    },
    {
      sku: 'PART-BLOQUEADA',
      name: 'Cargador 72V Bloqueado',
      dataStatus: 'BLOQUEADO',
    },
    {
      sku: 'PART-OCULTA',
      name: 'Cargador 72V Oculto',
      dataStatus: 'OCULTO',
    },
  ];

  const res = searchCatalogItems({ query: 'Cargador 72V', parts: mockParts, motos: [] });
  assert.strictEqual(res.parts.length, 1);
  assert.strictEqual(res.parts[0].sku, 'PART-ACTIVA');
});

test('Issue #15: isProductVisibleInCatalog incluye repuestos de catálogo verificados y preserva exclusión de bloqueados', () => {
  // Los estados de verificación de origen de catálogo deben ser visibles
  const verifiedStatuses = [
    'VERIFICADO_EN_FUENTE',
    'VERIFICADO_CON_CONDICIONES',
    'PARCIAL',
    'PENDIENTE_DE_COMPATIBILIDAD',
    'VERIFICAR_VARIANTE',
    'ACTIVO',
    'PAUSADO',
  ];
  for (const st of verifiedStatuses) {
    assert.strictEqual(
      isProductVisibleInCatalog(st, true),
      true,
      `El estado ${st} debe ser visible en el catálogo público`
    );
  }

  // Estados comerciales restrictivos deben ser excluidos
  assert.strictEqual(isProductVisibleInCatalog('BLOQUEADO', true), false);
  assert.strictEqual(isProductVisibleInCatalog('OCULTO', true), false);
  assert.strictEqual(isProductVisibleInCatalog('ARCHIVADO', true), false);
  assert.strictEqual(isProductVisibleInCatalog('VERIFICADO_EN_FUENTE', false), false);
});

test('Issue #15: searchCatalogItems encuentra motos eléctricas por marca, modelo y voltaje', () => {
  const mockMotos = [
    {
      brand: 'TAILG',
      model: 'Lion E5',
      slug: 'tailg-lion-e5',
      vehicleType: 'MOTO_ELECTRICA',
      batteryVoltageV: 72,
      motorPowerW: 2500,
    },
    {
      brand: 'YADEA',
      model: 'M6 Pro',
      slug: 'yadea-m6-pro',
      vehicleType: 'MOTO_SCOOTER',
      batteryVoltageV: 60,
      motorPowerW: 1500,
    },
  ];

  const resTailg = searchCatalogItems({ query: 'TAILG', parts: [], motos: mockMotos });
  assert.strictEqual(resTailg.motos.length, 1);
  assert.strictEqual(resTailg.motos[0].model, 'Lion E5');

  const resVolt = searchCatalogItems({ query: '72v', parts: [], motos: mockMotos });
  assert.strictEqual(resVolt.motos.length, 1);
  assert.strictEqual(resVolt.motos[0].brand, 'TAILG');
});

test('Issue #15: Endpoint /api/catalog/search y barra de búsqueda con debounce en Navbar', () => {
  assert.ok(
    fs.existsSync(path.join(ROOT_DIR, 'app/api/catalog/search/route.ts')),
    'La ruta de API /api/catalog/search debe existir'
  );

  const navbarFile = fs.readFileSync(path.join(ROOT_DIR, 'components/layout/Navbar.jsx'), 'utf8');
  assert.ok(
    navbarFile.includes('/api/catalog/search'),
    'Navbar debe consultar /api/catalog/search dinámicamente'
  );
  assert.ok(
    navbarFile.includes('isDropdownOpen'),
    'Navbar debe gestionar el menú flotante de resultados en vivo'
  );
});

// ============================================================================
// ISSUE #16: SEPARACIÓN DE PÁGINAS INDEPENDIENTES Y NAVEGACIÓN
// ============================================================================

test('Issue #16: Existencia de las páginas independientes /repuestos, /motos y /compatibilidad', () => {
  const pages = [
    'app/repuestos/page.tsx',
    'app/motos/page.tsx',
    'app/compatibilidad/page.tsx',
  ];

  for (const pagePath of pages) {
    assert.ok(
      fs.existsSync(path.join(ROOT_DIR, pagePath)),
      `La página independiente ${pagePath} debe existir`
    );
  }
});

test('Issue #16: Barra de navegación superior enlaza a rutas independientes con estado activo', () => {
  const navbarFile = fs.readFileSync(path.join(ROOT_DIR, 'components/layout/Navbar.jsx'), 'utf8');

  // Enlaces a rutas canónicas
  assert.ok(navbarFile.includes('href="/repuestos"'), 'Navbar debe enlazar a /repuestos');
  assert.ok(navbarFile.includes('href="/motos"'), 'Navbar debe enlazar a /motos');
  assert.ok(navbarFile.includes('href="/compatibilidad"'), 'Navbar debe enlazar a /compatibilidad');

  // Detección de ruta activa con usePathname
  assert.ok(navbarFile.includes('usePathname'), 'Navbar debe importar y usar usePathname');
  assert.ok(navbarFile.includes('isRepuestosActive'), 'Navbar debe evaluar si /repuestos está activo');
  assert.ok(navbarFile.includes('isMotosActive'), 'Navbar debe evaluar si /motos está activo');
  assert.ok(navbarFile.includes('isCompatibilidadActive'), 'Navbar debe evaluar si /compatibilidad está activo');
});
