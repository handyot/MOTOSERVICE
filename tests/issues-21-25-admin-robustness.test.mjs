import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();

test('Issue #21 - Manejo defensivo en descarga de comprobantes fiscales', async (t) => {
  const downloadRoutePath = path.join(
    projectRoot,
    'admin-panel',
    'app',
    'api',
    'admin',
    'documents',
    '[id]',
    'download',
    'route.ts'
  );

  assert.ok(fs.existsSync(downloadRoutePath), 'El endpoint de descarga debe existir');
  const code = fs.readFileSync(downloadRoutePath, 'utf8');

  await t.test('Verifica UUID antes de consultar id_documento o id_pedido', () => {
    assert.match(code, /UUID_REGEX/);
    assert.match(code, /UUID_REGEX\.test/);
  });

  await t.test('Permite búsqueda alternativa por serie y número ante IDs no-UUID', () => {
    assert.match(code, /rawId\.split\(.*-.*\)/);
    assert.match(code, /\.eq\('serie',/);
    assert.match(code, /\.eq\('numero',/);
  });

  await t.test('Maneja docError diferenciando error de base de datos de 404', () => {
    assert.match(code, /error\.code !== 'PGRST116'/);
    assert.match(code, /status:\s*500/);
    assert.match(code, /status:\s*404/);
  });

  await t.test('Protege generación de buffers PDF y XML con try/catch defensivo', () => {
    assert.match(code, /try\s*\{\s*if\s*\(format === 'xml'\)/);
    assert.match(code, /catch\s*\(genError/);
  });

  await t.test('Sanitiza nombre de archivo en Content-Disposition', () => {
    assert.match(code, /safeFilename/);
  });
});

test('Issue #22 - No reportar éxito cuando falla la persistencia de importación', async (t) => {
  const importRoutePath = path.join(
    projectRoot,
    'admin-panel',
    'app',
    'api',
    'admin',
    'catalog',
    'import',
    'route.ts'
  );

  assert.ok(fs.existsSync(importRoutePath), 'El endpoint del importador debe existir');
  const code = fs.readFileSync(importRoutePath, 'utf8');

  await t.test('Diferencia fases en scrape_live y retorna error si syncDatabase falla', () => {
    assert.match(code, /action === 'scrape_live'/);
    assert.match(code, /dbExecutionError/);
    assert.match(code, /phase:\s*'database_sync_failed'/);
    assert.match(code, /status:\s*422/);
  });

  await t.test('Diferencia fases en scrape_custom_url y retorna error si syncDatabase falla', () => {
    assert.match(code, /action === 'scrape_custom_url'/);
    assert.match(code, /syncDatabase && dbExecutionError/);
  });

  await t.test('Preserva preview para reintentar persistencia sin volver a extraer', () => {
    assert.match(code, /preview,\s*dbExecution/);
  });

  const importerViewPath = path.join(
    projectRoot,
    'admin-panel',
    'components',
    'admin',
    'CatalogImporterView.tsx'
  );
  const viewCode = fs.readFileSync(importerViewPath, 'utf8');

  await t.test('La UI preserva preview y archivos cuando falla la persistencia', () => {
    assert.match(viewCode, /setPreview\(data\.preview\)/);
    assert.match(viewCode, /setSelectedFiles/);
  });
});

test('Issue #23 - Validación estricta de precios en gestión de catálogo', async (t) => {
  const manageRoutePath = path.join(
    projectRoot,
    'admin-panel',
    'app',
    'api',
    'admin',
    'catalog',
    'manage',
    'route.ts'
  );

  assert.ok(fs.existsSync(manageRoutePath), 'El endpoint de gestión debe existir');
  const code = fs.readFileSync(manageRoutePath, 'utf8');

  await t.test('Contiene función de validación validatePriceInput', () => {
    assert.match(code, /export function validatePriceInput/);
  });

  await t.test('Rechaza precios faltantes, NaN, cadenas vacías y negativos en la creación', () => {
    assert.match(code, /priceValidation\.valid/);
    assert.match(code, /priceValidation\.error/);
    assert.match(code, /status:\s*400/);
  });

  await t.test('Permite precio cero únicamente si está explícitamente autorizado', () => {
    assert.match(code, /allowZero/);
    assert.match(code, /allow_zero_price/);
  });

  await t.test('Soporta actualización de precio (update_price) con la misma validación', () => {
    assert.match(code, /operation === 'update_price'/);
  });
});

test('Issue #24 - Detección y presentación honesta de errores de consulta en Dashboard', async (t) => {
  const pagePath = path.join(projectRoot, 'admin-panel', 'app', 'page.tsx');
  assert.ok(fs.existsSync(pagePath), 'admin-panel/app/page.tsx debe existir');
  const pageCode = fs.readFileSync(pagePath, 'utf8');

  await t.test('Inspecciona error de cada consulta a Supabase y llena queryErrors', () => {
    assert.match(pageCode, /queryErrors:\s*Record<string,\s*string>/);
    assert.match(pageCode, /resMarcas\.error/);
    assert.match(pageCode, /resRepuestos\.error/);
    assert.match(pageCode, /resOrders\.error/);
    assert.match(pageCode, /resDocs\.error/);
    assert.match(pageCode, /resAssistance\.error/);
  });

  await t.test('Pasa initialPersistedParts, persistedPartsError y queryErrors al dashboard', () => {
    assert.match(pageCode, /initialPersistedParts=\{resRepuestos\.data \|\| \[\]\}/);
    assert.match(pageCode, /persistedPartsError=\{resRepuestos\.error/);
    assert.match(pageCode, /queryErrors=\{queryErrors\}/);
  });

  const fallbackPath = path.join(
    projectRoot,
    'admin-panel',
    'lib',
    'catalog',
    'catalog-fallback.ts'
  );
  const fallbackCode = fs.readFileSync(fallbackPath, 'utf8');

  await t.test('Etiqueta registros con isFallback: true para datos no persistidos', () => {
    assert.match(fallbackCode, /isFallback:\s*false/);
    assert.match(fallbackCode, /isFallback:\s*true/);
  });

  const viewPath = path.join(
    projectRoot,
    'admin-panel',
    'components',
    'admin',
    'AdminDashboardView.tsx'
  );
  const viewCode = fs.readFileSync(viewPath, 'utf8');

  await t.test('Muestra banner de advertencia si existen fuentes con error', () => {
    assert.match(viewCode, /queryErrors && Object\.keys\(queryErrors\)\.length > 0/);
    assert.match(viewCode, /queryErrors\?\.pedidos/);
    assert.match(viewCode, /queryErrors\?\.documentos/);
    assert.match(viewCode, /queryErrors\?\.asistencia/);
  });
});

test('Issue #25 - Inventario propio vs proveedor con datos reales de Supabase', async (t) => {
  const viewPath = path.join(
    projectRoot,
    'admin-panel',
    'components',
    'admin',
    'AdminDashboardView.tsx'
  );
  assert.ok(fs.existsSync(viewPath), 'AdminDashboardView.tsx debe existir');
  const viewCode = fs.readFileSync(viewPath, 'utf8');

  await t.test('Eliminó completamente FEATURED_PARTS y stock simulado de 15 unidades', () => {
    assert.doesNotMatch(viewCode, /import\s*\{\s*FEATURED_PARTS\s*\}\s*from/);
    assert.doesNotMatch(viewCode, /FEATURED_PARTS\.map/);
    assert.doesNotMatch(viewCode, /ownStock:\s*15/);
  });

  await t.test('Eliminó política de despacho fija 24h-48h', () => {
    assert.doesNotMatch(viewCode, /24h\s*–\s*48h/);
    assert.match(viewCode, /Consultar según destino y disponibilidad/);
  });

  await t.test('Utiliza stock_propio_ecomoto para calcular venta directa', () => {
    assert.match(viewCode, /stock_propio_ecomoto/);
    assert.match(viewCode, /directSaleCount/);
  });

  await t.test('Diferencia catálogo de proveedor y maneja CONSULTAR_STOCK como texto', () => {
    assert.match(viewCode, /stock_proveedor/);
    assert.match(viewCode, /providerPartsCount/);
    assert.match(viewCode, /CONSULTAR_STOCK/);
    assert.match(viewCode, /Consultar stock/);
  });

  await t.test('Garantía no verificada se muestra como No registrada', () => {
    assert.match(viewCode, /No registrada/);
    assert.doesNotMatch(viewCode, /\{p\.warrantyMonths\}\s*meses/);
  });

  await t.test('Presenta filtros de modalidad (Todos, Venta Directa, Proveedor)', () => {
    assert.match(viewCode, /inventoryModeFilter/);
    assert.match(viewCode, /Todos \(\{persistedParts\.length\}\)/);
    assert.match(viewCode, /Venta Directa \(\{directSaleCount\}\)/);
  });

  await t.test('Muestra estado vacío honesto cuando venta directa es 0 SKU', () => {
    assert.match(viewCode, /0 SKU de venta directa/);
  });

  await t.test('Muestra alerta explícita ante persistedPartsError', () => {
    assert.match(viewCode, /persistedPartsError &&/);
  });
});
