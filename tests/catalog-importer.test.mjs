/**
 * MOTOSERVICE — Suite de Pruebas Automatizadas del Importador de Catálogos
 *
 * Valida parseo de CSV (BOM, separadores, multilínea), JSON (arrays, wrappers),
 * clasificación técnica, detección de marcas (TAILG, Kayencorp, YADEA, GreenLine),
 * deduplicación, fusión cruzada, detección de conflictos e idempotencia.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  parseCsvText,
  parseJsonText,
  detectCsvDelimiter,
  detectBrandFromRecord,
  isNonProductUrl,
  parseTableSpecifications,
  categorizeProduct,
  normalizeRecord,
  deduplicateItems,
  generateImportPreview,
  validateRubro,
  detectBrandFromUrl,
} from '../lib/importers/importer-core.mjs';

test('1. CSV: Soporte de UTF-8 con BOM, separadores (, ;) y celdas multilínea entre comillas', () => {
  // Archivo con BOM (\uFEFF) y punto y coma
  const csvWithBom = '\uFEFFid;title;price\n101;"Batería 48V\nLitio";"1,200.50"\n102;"Controlador 60V";"350.00"';
  const records = parseCsvText(csvWithBom);

  assert.equal(records.length, 2, 'Debe parsear exactamente 2 registros');
  assert.equal(records[0].id, '101');
  assert.equal(records[0].title, 'Batería 48V\nLitio', 'Debe conservar salto de línea dentro de comillas');
  assert.equal(records[0].price, '1,200.50');
  assert.equal(records[1].id, '102');
  assert.equal(records[1].title, 'Controlador 60V');
});

test('2. CSV: Detección automática de delimitador (coma, punto y coma, tabulador)', () => {
  assert.equal(detectCsvDelimiter('id,job_id,url,title,price'), ',');
  assert.equal(detectCsvDelimiter('id;nombre;sku;precio;voltaje'), ';');
  assert.equal(detectCsvDelimiter('id\tnombre\tsku\tprecio'), '\t');
});

test('3. JSON: Parseo tolerante de estructura envuelta { results: [...] }, array puro y objeto individual', () => {
  const wrappedJson = JSON.stringify({
    total_exported: 2,
    results: [
      { url: 'https://tailg.com.pe/producto/repuestos/parrilla/', title: 'Parrilla TAILG' },
      { url: 'https://tailg.com.pe/producto/repuestos/llanta/', title: 'Llanta CST' },
    ],
  });
  const parsedWrapped = parseJsonText(wrappedJson);
  assert.equal(parsedWrapped.length, 2);

  const arrayJson = JSON.stringify([{ id: 1, name: 'Item 1' }]);
  const parsedArray = parseJsonText(arrayJson);
  assert.equal(parsedArray.length, 1);

  const singleObjJson = JSON.stringify({ id: 99, name: 'Single Item' });
  const parsedSingle = parseJsonText(singleObjJson);
  assert.equal(parsedSingle.length, 1);
});

test('4. Detección de Marcas: Identificación exacta de las 4 marcas oficiales', () => {
  // TAILG por origen y URL
  const tailgRec = { origin: 'https://tailg.com.pe', url: 'https://tailg.com.pe/producto/parrilla/' };
  assert.equal(detectBrandFromRecord(tailgRec), 'TAILG');

  // KAYENCORP por origen
  const kayenRec = { origin: 'https://kayencorp.com', job_name: 'MAPING DE REPUESTOS DE KAYENCORP' };
  assert.equal(detectBrandFromRecord(kayenRec), 'KAYENCORP');

  // GREENLINE por origen
  const greenlineRec = { origin: 'https://www.glperu.com', job_name: 'maping de GL peru' };
  assert.equal(detectBrandFromRecord(greenlineRec), 'GREENLINE');

  // YADEA por mención en título dentro de fuente multimarca
  const yadeaRec = {
    origin: 'https://electrica.pe',
    title: 'Batería Plomo Acido con GRAFENO de 12v 38Ah YADEA – TTFAR 6-EVF-38',
  };
  assert.equal(detectBrandFromRecord(yadeaRec), 'YADEA');

  // GREENLINE por descripción de modelo T16 dentro de fuente multimarca
  const greenlineInMultibrand = {
    origin: 'https://electrica.pe',
    title: '48V16AH Batería de litio – Eléctrica',
    json_ld: [{ '@type': 'Product', name: '48V16AH Batería de litio', description: 'Modelo GreenLine T16' }],
  };
  assert.equal(detectBrandFromRecord(greenlineInMultibrand), 'GREENLINE');
});

test('5. Filtrado: Exclusión estricta de páginas no comerciales (carritos, blogs, sedes, consultas)', () => {
  // URLs de carritos y query params
  assert.equal(isNonProductUrl('https://tailg.com.pe/motos/?add-to-cart=28517').isNonProduct, true);
  assert.equal(isNonProductUrl('https://electrica.pe/carrito/').isNonProduct, true);
  assert.equal(isNonProductUrl('https://electrica.pe/mi-cuenta/').isNonProduct, true);

  // Blogs y noticias de GreenLine
  assert.equal(isNonProductUrl('https://www.glperu.com/novedades/cumbre-peru-sostenible').isNonProduct, true);
  assert.equal(isNonProductUrl('https://www.glperu.com/politica-privacidad').isNonProduct, true);

  // Ficha de producto válida
  assert.equal(isNonProductUrl('https://tailg.com.pe/producto/repuestos/parrilla-tailg-f52/').isNonProduct, false);
  assert.equal(isNonProductUrl('https://kayencorp.com/producto/bicimoto-vmp-ztt/').isNonProduct, false);
});

test('6. Normalización Técnica: Extracción precisa de tablas (Kayencorp: motor, velocidad, batería, autonomía)', () => {
  const kayenTables = [
    [
      ['Autonomía:', '60 – 80 km'],
      ['Velocidad Máxima:', '25 km/h'],
      ['Motor:', '600 W – Motor con refrigeración líquida'],
      ['Batería:', '48 V 24 AH (Litio NCM – Extraíble)'],
      ['Garantía:', 'Motor: ✓ 7 años | Batería: ✓ 24 meses'],
    ],
  ];

  const specs = parseTableSpecifications(kayenTables);
  assert.equal(specs.rangeMinKm, 60);
  assert.equal(specs.rangeMaxKm, 80);
  assert.equal(specs.maxSpeedKmh, 25);
  assert.equal(specs.motorPowerW, 600);
  assert.equal(specs.voltageV, 48);
  assert.equal(specs.batteryCapacityAh, 24);
  assert.equal(specs.batteryType, 'LITIO_NCM');
  assert.equal(specs.batteryRemovable, 'SI');
});

test('7. Clasificación: Distinción entre vehículos completos y repuestos/accesorios', () => {
  // Una llanta para bicimoto NO debe clasificarse como vehículo, sino como repuesto
  assert.equal(categorizeProduct('Llanta Bicimoto Eléctrica 14 x 2.5 Vmp', 'https://tailg.com.pe/producto/...', false), 'Llantas y neumáticos');

  // Bicimoto completa es un vehículo
  assert.equal(categorizeProduct('BICIMOTO VMP ZTT Eléctrica', 'https://kayencorp.com/producto/...', true), 'Bicimotos Eléctricas');

  // Parrilla es carrocería/accesorios
  assert.equal(categorizeProduct('Parrilla de cajuela para TAILG F52', 'https://tailg.com.pe/producto/...', false), 'Accesorios y carrocería');

  // Batería es categoría Baterías
  assert.equal(categorizeProduct('48V16AH Batería de litio', 'https://electrica.pe/producto/...', false), 'Baterías');
});

test('8. Deduplicación y Fusión Cruzada: Fusión no destructiva de registro JSON y registro CSV', () => {
  const jsonRecord = {
    url: 'https://tailg.com.pe/producto/repuestos/parrilla-tailg-f52/',
    title: 'Parrilla de cajuela para TAILG F52 | TAILG Motos Eléctricas',
    json_ld: [
      {
        '@type': 'Product',
        name: 'Parrilla de cajuela para TAILG F52',
        sku: '28074',
        offers: [{ price: '80', priceCurrency: 'PEN' }],
        description: 'Parrilla original metálica reforzada',
      },
    ],
  };

  const csvRecord = {
    url: 'https://tailg.com.pe/producto/repuestos/parrilla-tailg-f52/',
    title: 'Parrilla de cajuela para TAILG F52',
    scraped_at: '2026-10-31 05:02:18',
    response_time_ms: 350,
  };

  const normJson = normalizeRecord(jsonRecord, 'job1.json').item;
  const normCsv = normalizeRecord(csvRecord, 'job1.csv').item;

  assert.ok(normJson);
  assert.ok(normCsv);

  const { deduplicated, duplicatesCount } = deduplicateItems([normJson, normCsv]);

  assert.equal(deduplicated.length, 1, 'Debe consolidar ambos registros en uno solo');
  assert.equal(duplicatesCount, 1, 'Debe registrar 1 duplicado fusionado');
  assert.equal(deduplicated[0].sku, '28074', 'Debe conservar el SKU del JSON');
  assert.equal(deduplicated[0].pricePen, 80, 'Debe conservar el precio del Schema');
  assert.equal(deduplicated[0].description, 'Parrilla original metálica reforzada');
  assert.ok(deduplicated[0].notes.includes('job1.csv'), 'Debe documentar la trazabilidad de ambos archivos');
});

test('9. Detección de Conflictos: Alerta ante discrepancias de precios entre fuentes', () => {
  const itemA = {
    id: 'TAILG_28074',
    brand: 'TAILG',
    name: 'Parrilla F52',
    sourceUrl: 'https://tailg.com.pe/producto/parrilla-f52/',
    pricePen: 80,
    specs: {},
  };

  const itemB = {
    id: 'TAILG_28074_B',
    brand: 'TAILG',
    name: 'Parrilla F52',
    sourceUrl: 'https://tailg.com.pe/producto/parrilla-f52/',
    pricePen: 110, // Precio discrepante
    specs: {},
  };

  const { deduplicated, conflicts } = deduplicateItems([itemA, itemB]);
  assert.equal(deduplicated.length, 1);
  assert.equal(conflicts.length, 1);
  assert.equal(conflicts[0].type, 'PRICE_DISCREPANCY');
  assert.equal(deduplicated[0].pricePen, 80, 'Debe conservar el precio original hasta revisión');
});

test('10. Idempotencia: Procesar dos veces el mismo catálogo produce exactamente el mismo resultado sin duplicar', () => {
  const rawList = [
    {
      url: 'https://kayencorp.com/producto/moto-scooter-hawk/',
      title: 'MOTO SCOOTER HAWK - Kayencorp',
      tables: [
        [
          ['Autonomía:', '70 km'],
          ['Velocidad Máxima:', '45 km/h'],
          ['Motor:', '1000 W'],
          ['Batería:', '72 V 20 AH'],
        ],
      ],
    },
  ];

  const item1 = normalizeRecord(rawList[0], 'file1.json').item;
  const item2 = normalizeRecord(rawList[0], 'file1.json').item;

  const run1 = deduplicateItems([item1]);
  const run2 = deduplicateItems([item1, item2]);

  assert.equal(run1.deduplicated.length, 1);
  assert.equal(run2.deduplicated.length, 1, 'No debe crear registros duplicados al ejecutar nuevamente');
  assert.equal(run2.duplicatesCount, 1);
});

test('11. Simulación Dry-Run sobre los 8 archivos reales de scraping de MOTOSERVICE', () => {
  const sampleFiles = [
    { filename: 'job1.json', filepath: 'JSON DEL SCRAPS/webscraper_resultados_job1_20261031_050149.json' },
    { filename: 'job1.csv', filepath: 'JSON DEL SCRAPS/webscraper_resultados_job1_20261031_050218.csv' },
    { filename: 'job2.csv', filepath: 'JSON DEL SCRAPS/webscraper_resultados_job2_20261031_054009.csv' },
    { filename: 'job2.json', filepath: 'JSON DEL SCRAPS/webscraper_resultados_job2_20261031_054012.json' },
    { filename: 'job3.json', filepath: 'JSON DEL SCRAPS/webscraper_resultados_job3_20261031_053838.json' },
    { filename: 'job3.csv', filepath: 'JSON DEL SCRAPS/webscraper_resultados_job3_20261031_053840.csv' },
    { filename: 'job4.json', filepath: 'JSON DEL SCRAPS/webscraper_resultados_job4_20261031_054232.json' },
    { filename: 'job4.csv', filepath: 'JSON DEL SCRAPS/webscraper_resultados_job4_20261031_054233.csv' },
  ];

  const preview = generateImportPreview(sampleFiles);

  assert.equal(preview.totalFiles, 8, 'Debe procesar los 8 archivos de entrada');
  assert.equal(preview.totalRawRecords, 400, 'Debe leer exactamente los 400 registros brutos');
  assert.equal(preview.validProducts, 27, 'Debe consolidar exactamente 27 productos válidos');
  assert.equal(preview.vehiclesCount, 7, 'Debe identificar 7 modelos de vehículos completos (Kayencorp)');
  assert.equal(preview.partsCount, 20, 'Debe identificar 20 repuestos y componentes verificados');
  assert.equal(preview.duplicatesIdentified, 27, 'Debe fusionar los 27 pares idénticos CSV/JSON');
  assert.equal(preview.conflicts.length, 0, 'No debe haber discrepancias no resueltas');

  // Comprobar presencia de las marcas
  assert.equal(preview.productsByBrand.TAILG, 7);
  assert.equal(preview.productsByBrand.KAYENCORP, 7);
  assert.equal(preview.productsByBrand.YADEA, 11);
  assert.equal(preview.productsByBrand.GREENLINE, 2);

  // Comprobar que se generan operaciones propuestas para PostgreSQL
  assert.equal(preview.proposedOperations.length, 27);
  assert.equal(preview.proposedOperations.filter((o) => o.entity === 'modelos_moto').length, 7);
  assert.equal(preview.proposedOperations.filter((o) => o.entity === 'repuestos').length, 20);
});

test('12. Integridad referencial y normalización de marcas en seed SQL EcoMoto (52 modelos, 19 repuestos, 46 compatibilidades)', () => {
  const sql = fs.readFileSync('supabase/migrations/20261030140100_seed_ecomoto_datos_reales.sql', 'utf8');

  // Simular marcas preexistentes en producción con nombres TitleCase
  const dbMarcas = new Map([
    ['Tailg', 1],
    ['Yadea', 2],
    ['GreenLine', 3],
  ]);

  const seedBrands = [
    ['Tailg', 'TAILG'],
    ['Yadea', 'YADEA'],
    ['Kayencorp', 'KAYENCORP'],
    ['GreenLine', 'GREENLINE'],
  ];

  let nextMarcaId = 4;
  for (const [display, norm] of seedBrands) {
    let exists = false;
    for (const [existingName] of dbMarcas) {
      if (existingName.trim().toUpperCase() === norm) {
        exists = true;
        break;
      }
    }
    if (!exists) {
      dbMarcas.set(display, nextMarcaId++);
    }
  }

  assert.equal(dbMarcas.size, 4, 'No debe duplicar las marcas existentes');

  function resolveMarcaId(normName) {
    for (const [k, id] of dbMarcas) {
      if (k.trim().toUpperCase() === normName.trim().toUpperCase()) return id;
    }
    return null;
  }

  // Verificar los 52 modelos
  const modelBlocks = sql.split('INSERT INTO modelos_moto').slice(1);
  assert.equal(modelBlocks.length, 52, 'Debe contener exactamente 52 sentencias de modelos_moto');

  const dbModelos = new Map();
  let nextModeloId = 100;
  for (const block of modelBlocks) {
    const brandMatch = block.match(/UPPER\(TRIM\(nombre\)\)\s*=\s*'([^']+)'/);
    assert.ok(brandMatch, 'Toda subconsulta de marca en modelos_moto debe usar UPPER(TRIM(nombre))');
    const idMarca = resolveMarcaId(brandMatch[1]);
    assert.ok(idMarca, `id_marca debe resolverse para ${brandMatch[1]}`);
    const afterBrand = block.split('LIMIT 1),')[1];
    const modelName = afterBrand.match(/^\s*'([^']+)'/)[1];
    dbModelos.set(`${idMarca}:::${modelName.trim()}`, nextModeloId++);
  }
  assert.equal(dbModelos.size, 52, 'Los 52 modelos deben ser únicos por (id_marca, nombre)');

  // Verificar los 19 repuestos
  const repBlocks = sql.split('INSERT INTO repuestos').slice(1);
  assert.equal(repBlocks.length, 19, 'Debe contener exactamente 19 sentencias de repuestos');

  const dbRepuestos = new Map();
  let nextRepId = 500;
  for (const block of repBlocks) {
    const brandMatch = block.match(/UPPER\(TRIM\(nombre\)\)\s*=\s*'([^']+)' LIMIT 1\),\s*\n\s*'([^']+)'/);
    assert.ok(brandMatch, 'Toda subconsulta de marca en repuestos debe usar UPPER(TRIM(nombre))');
    const idMarca = resolveMarcaId(brandMatch[1]);
    assert.ok(idMarca, `id_marca debe resolverse en repuesto para ${brandMatch[1]}`);
    dbRepuestos.set(brandMatch[2].trim(), nextRepId++);
  }
  assert.equal(dbRepuestos.size, 19, 'Los 19 repuestos deben tener part_key único');

  // Verificar las 46 compatibilidades
  const compBlocks = sql.split('INSERT INTO compatibilidades').slice(1);
  assert.equal(compBlocks.length, 46, 'Debe contener exactamente 46 sentencias de compatibilidades');

  compBlocks.forEach((block, idx) => {
    const pkMatch = block.match(/WHERE TRIM\(part_key\)\s*=\s*'([^']+)'/);
    const modMatch = block.match(/WHERE UPPER\(TRIM\(ma\.nombre\)\)\s*=\s*'([^']+)'\s+AND\s+TRIM\(m\.nombre\)\s*=\s*'([^']+)'/);
    assert.ok(pkMatch, `Compatibilidad #${idx + 1} debe usar TRIM(part_key)`);
    assert.ok(modMatch, `Compatibilidad #${idx + 1} debe usar UPPER(TRIM(ma.nombre)) y TRIM(m.nombre)`);

    const pk = pkMatch[1].trim();
    const brand = modMatch[1].trim();
    const model = modMatch[2].trim();

    const idRep = dbRepuestos.get(pk);
    const idMarca = resolveMarcaId(brand);
    const idMod = dbModelos.get(`${idMarca}:::${model}`);

    assert.ok(idRep, `Compatibilidad #${idx + 1}: id_repuesto no nulo para part_key="${pk}"`);
    assert.ok(idMod, `Compatibilidad #${idx + 1}: id_modelo no nulo para marca="${brand}", modelo="${model}"`);
  });
});

test('13. Cobertura del 100% de imágenes reales en los 52 modelos, 173 repuestos y operaciones del importador', () => {
  const ecomotoSrc = fs.readFileSync('data/ecomoto-data.ts', 'utf8');
  const motosMatch = ecomotoSrc.match(/export const OFFICIAL_MOTOS: MotoModel\[\] = (\[[\s\S]*?\]);\n\nexport const OFFICIAL_PARTS/);
  const partsMatch = ecomotoSrc.match(/export const OFFICIAL_PARTS: SupplierPart\[\] = (\[[\s\S]*?\]);\n\nexport const OFFICIAL_COMPATIBILITIES/);

  assert.ok(motosMatch, 'Debe existir OFFICIAL_MOTOS en data/ecomoto-data.ts');
  assert.ok(partsMatch, 'Debe existir OFFICIAL_PARTS en data/ecomoto-data.ts');

  const motos = JSON.parse(motosMatch[1]);
  const parts = JSON.parse(partsMatch[1]);

  assert.ok(motos.length >= 52, 'Debe haber al menos 52 modelos oficiales');
  assert.ok(parts.length >= 173, 'Debe haber al menos 173 repuestos oficiales');
  assert.equal(new Set(parts.map((p) => p.partKey)).size, parts.length, 'partKey único en OFFICIAL_PARTS');
  assert.equal(new Set(parts.map((p) => p.sku)).size, parts.length, 'sku único en OFFICIAL_PARTS');

  for (const m of motos) {
    assert.ok(
      typeof m.imageUrl === 'string' && (m.imageUrl.includes('.webp') || m.imageUrl.includes('.png')),
      `El modelo ${m.slug} debe tener una URL de imagen real (.webp o .png)`
    );
  }

  for (const p of parts) {
    assert.ok(
      typeof p.imageUrl === 'string' && /^https:\/\/.+\.(webp|png)$/.test(p.imageUrl),
      `El repuesto ${p.partKey} debe tener una URL de imagen real (webp/png) del proveedor`
    );
    assert.ok(p.sourceUrl && p.sourceUrl.startsWith('https://'), `El repuesto ${p.partKey} debe tener URL de origen`);
  }

  const migrationSql = fs.readFileSync(
    'supabase/migrations/20261031150000_modelos_y_repuestos_imagenes_reales.sql',
    'utf8'
  );
  assert.ok(
    migrationSql.includes('ADD COLUMN IF NOT EXISTS imagen_url TEXT'),
    'La migración debe añadir imagen_url a public.modelos_moto'
  );
});

test('14. Migración de ampliación de repuestos: integridad con OFFICIAL_PARTS y modelos del seed', () => {
  const ecomotoSrc = fs.readFileSync('data/ecomoto-data.ts', 'utf8');
  const parts = JSON.parse(
    ecomotoSrc.match(/export const OFFICIAL_PARTS: SupplierPart\[\] = (\[[\s\S]*?\]);\n\nexport const OFFICIAL_COMPATIBILITIES/)[1]
  );
  const comps = JSON.parse(
    ecomotoSrc.match(/export const OFFICIAL_COMPATIBILITIES: PublishedCompatibility\[\] = (\[[\s\S]*?\]);\n\n\/\*\*/)[1]
  );
  const partKeys = new Set(parts.map((p) => p.partKey));
  for (const c of comps) {
    assert.ok(partKeys.has(c.partKey), `Compatibilidad con partKey inexistente: ${c.partKey}`);
  }

  const seed = fs.readFileSync('supabase/migrations/20261030140100_seed_ecomoto_datos_reales.sql', 'utf8');
  const seedModels = new Set();
  for (const block of seed.split('INSERT INTO modelos_moto').slice(1)) {
    const brand = block.match(/UPPER\(TRIM\(nombre\)\)\s*=\s*'([^']+)'/)[1];
    const model = block.split('LIMIT 1),')[1].match(/^\s*'([^']+)'/)[1];
    seedModels.add(`${brand.toUpperCase()}:::${model.trim()}`);
  }

  const sql = fs.readFileSync('supabase/migrations/20261031160000_ampliar_catalogo_repuestos_proveedores.sql', 'utf8');
  const repBlocks = sql.split('INSERT INTO repuestos').slice(1);
  assert.equal(repBlocks.length, 88, 'Debe insertar 88 repuestos nuevos');
  for (const block of repBlocks) {
    const pk = block.match(/LIMIT 1\),\s*\n\s*'([^']+)',\s*\n/)[1];
    assert.ok(partKeys.has(pk), `part_key de la migración debe existir en OFFICIAL_PARTS: ${pk}`);
    assert.match(block, /ON CONFLICT \(part_key\) DO UPDATE/);
  }

  const compBlocks = sql.split('INSERT INTO compatibilidades').slice(1);
  assert.equal(compBlocks.length, 12, 'Debe insertar 12 compatibilidades nuevas');
  for (const block of compBlocks) {
    const pk = block.match(/WHERE TRIM\(part_key\)\s*=\s*'([^']+)'/)[1];
    const [, brand, model] = block.match(/UPPER\(TRIM\(ma\.nombre\)\)\s*=\s*'([^']+)'\s+AND\s+TRIM\(m\.nombre\)\s*=\s*'([^']+)'/);
    assert.ok(partKeys.has(pk), `part_key inexistente en compatibilidad: ${pk}`);
    assert.ok(seedModels.has(`${brand}:::${model}`), `Modelo inexistente en seed: ${brand} ${model}`);
  }
  assert.ok(!/DELETE|DROP TABLE|TRUNCATE/i.test(sql), 'La migración debe ser aditiva');
});

test('15. Verificación de Rubro y Detección de Marca para escaneo de URLs externas', () => {
  // 1. Caso positivo: Tienda de movilidad eléctrica (motos, bicimotos, repuestos, litio)
  const evHtml = `
    <!DOCTYPE html>
    <html>
      <head><title>Motos Eléctricas Perú | Repuestos y Baterías de Litio</title></head>
      <body>
        <h1>Catálogo de Motos Eléctricas y Bicimotos</h1>
        <p>Batería de litio 60V 20Ah, cargador inteligente y repuestos originales.</p>
      </body>
    </html>
  `;
  const evValidation = validateRubro(evHtml, 'https://super-soco.pe/tienda');
  assert.equal(evValidation.isValid, true, 'Debe validar positivamente tienda de movilidad eléctrica');
  assert.ok(evValidation.score >= 6, 'Puntuación debe ser suficiente para certificar rubro');
  assert.ok(evValidation.matchedKeywords.length >= 3, 'Debe encontrar múltiples palabras clave del rubro');

  // 2. Caso negativo: Sitio de ropa/moda o farmacia
  const fashionHtml = `
    <!DOCTYPE html>
    <html>
      <head><title>Boutique de Vestidos y Ropa de Mujer</title></head>
      <body>
        <h1>Vestidos de fiesta, zapatos y carteras elegantes</h1>
      </body>
    </html>
  `;
  const fashionValidation = validateRubro(fashionHtml, 'https://modaboutique.pe');
  assert.equal(fashionValidation.isValid, false, 'Debe rechazar sitios ajenos al rubro');
  assert.equal(fashionValidation.score, 0, 'Sitio ajeno debe tener score 0 o insuficiente');

  // 3. Detección de marca desde URL y metadata
  const detected1 = detectBrandFromUrl('https://super-soco.pe/productos/', '<meta property="og:site_name" content="Super Soco Perú">');
  assert.equal(detected1.brandName, 'SUPER SOCO');
  assert.equal(detected1.supplierName, 'SUPER SOCO Perú');

  const detected2 = detectBrandFromUrl('https://niu.pe/motos/', '<title>NIU Oficial - Movilidad Eléctrica</title>');
  assert.equal(detected2.brandName, 'NIU');

  const detected3 = detectBrandFromUrl('https://otra-tienda.pe', '', 'SUR-RON');
  assert.equal(detected3.brandName, 'SUR-RON');
});
