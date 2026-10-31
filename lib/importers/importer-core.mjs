/**
 * MOTOSERVICE — Módulo Central del Importador de Catálogos (CSV / JSON)
 *
 * Implementa de manera agnóstica a la plataforma:
 * 1. Detección y parseo tolerante de CSV y JSON (UTF-8, BOM, comillas, multilínea, delimitadores).
 * 2. Clasificación técnica de vehículos (modelos_moto) y repuestos (repuestos).
 * 3. Identificación precisa de marcas: TAILG, KAYENCORP, YADEA y GREENLINE.
 * 4. Extracción de especificaciones (voltaje, batería, motor, velocidad, autonomía).
 * 5. Deduplicación inteligente y fusión de atributos complementarios entre CSV y JSON.
 * 6. Generación de vista previa estadística y operaciones propuestas para PostgreSQL.
 */

import fs from 'fs';
import path from 'path';

export const OFFICIAL_BRANDS = ['TAILG', 'KAYENCORP', 'YADEA', 'GREENLINE'];

const NON_PRODUCT_URL_PATTERNS = [
  /\/carrito\/?/i,
  /\/cart\/?/i,
  /\/checkout\/?/i,
  /\?add-to-cart=/i,
  /\/mi-cuenta\/?/i,
  /\/my-account\/?/i,
  /\/libro-?(de-)?reclamaciones\/?/i,
  /\/politica-?privacidad\/?/i,
  /\/manuales-de-uso\/?/i,
  /\/contacto\/?/i,
  /\/trabaja-con-nosotros\/?/i,
  /\/login-?cliente\/?/i,
  /\/comparar\/?/i,
  /\/preguntas-frecuentes\/?/i,
  /\/blog\/?/i,
  /\/tips\/?/i,
  /\/novedades\//i,
  /\/distribuidor\/?/i,
  /\/sedes\/?/i,
  /\/expochina\/?/i,
];

/**
 * Detecta el delimitador más probable evaluando la cabecera.
 */
export function detectCsvDelimiter(sampleLine) {
  const delimiters = [',', ';', '\t'];
  let bestDelimiter = ',';
  let maxCount = -1;

  for (const delim of delimiters) {
    let inQuotes = false;
    let count = 0;
    for (let i = 0; i < sampleLine.length; i++) {
      const char = sampleLine[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === delim && !inQuotes) {
        count++;
      }
    }
    if (count > maxCount) {
      maxCount = count;
      bestDelimiter = delim;
    }
  }

  return bestDelimiter;
}

/**
 * Parsea un texto CSV respetando comillas dobles, comas/puntos y coma internos,
 * saltos de línea dentro de campos y eliminación de BOM.
 */
export function parseCsvText(content) {
  let cleanContent = content;
  if (cleanContent.charCodeAt(0) === 0xfeff) {
    cleanContent = cleanContent.slice(1);
  }

  if (!cleanContent.trim()) {
    return [];
  }

  const firstNewline = cleanContent.indexOf('\n');
  const headerLine = firstNewline !== -1 ? cleanContent.slice(0, firstNewline) : cleanContent;
  const delimiter = detectCsvDelimiter(headerLine);

  const rows = [];
  let currentRow = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < cleanContent.length; i++) {
    const char = cleanContent[i];
    const nextChar = i + 1 < cleanContent.length ? cleanContent[i + 1] : '';

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          currentField += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === delimiter) {
        currentRow.push(currentField);
        currentField = '';
      } else if (char === '\r') {
        if (nextChar === '\n') {
          i++;
        }
        currentRow.push(currentField);
        currentField = '';
        rows.push(currentRow);
        currentRow = [];
      } else if (char === '\n') {
        currentRow.push(currentField);
        currentField = '';
        rows.push(currentRow);
        currentRow = [];
      } else {
        currentField += char;
      }
    }
  }

  if (currentField !== '' || currentRow.length > 0) {
    currentRow.push(currentField);
    rows.push(currentRow);
  }

  if (rows.length === 0) {
    return [];
  }

  const rawHeaders = rows[0].map((h) => h.trim());
  const headers = rawHeaders.map((h) => (h.startsWith('\uFEFF') ? h.slice(1) : h));
  const records = [];

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (row.length === 1 && row[0].trim() === '') {
      continue;
    }

    const rec = {};
    for (let c = 0; c < headers.length; c++) {
      const headerName = headers[c];
      const val = c < row.length ? row[c] : '';
      rec[headerName] = val;
    }

    if (rec.headings_json && typeof rec.headings_json === 'string') {
      try {
        rec.headings = JSON.parse(rec.headings_json);
      } catch {
        rec.headings = [];
      }
    }
    if (rec.links_json && typeof rec.links_json === 'string') {
      try {
        rec.links = JSON.parse(rec.links_json);
      } catch {
        rec.links = [];
      }
    }
    if (rec.images_json && typeof rec.images_json === 'string') {
      try {
        rec.images = JSON.parse(rec.images_json);
      } catch {
        rec.images = [];
      }
    }
    if (rec.meta_json && typeof rec.meta_json === 'string') {
      try {
        rec.meta = JSON.parse(rec.meta_json);
      } catch {
        rec.meta = {};
      }
    }

    records.push(rec);
  }

  return records;
}

/**
 * Parsea un contenido JSON tolerando formatos:
 * - { total_exported: 50, results: [...] }
 * - [...]
 * - {...}
 */
export function parseJsonText(content, filename = 'document.json') {
  let cleanContent = content;
  if (cleanContent.charCodeAt(0) === 0xfeff) {
    cleanContent = cleanContent.slice(1);
  }

  if (!cleanContent.trim()) {
    return [];
  }

  let parsed;
  try {
    parsed = JSON.parse(cleanContent);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error de sintaxis JSON';
    throw new Error(`Error al parsear el archivo ${filename}: ${msg}`);
  }

  if (Array.isArray(parsed)) {
    return parsed;
  }

  if (parsed && typeof parsed === 'object') {
    if (Array.isArray(parsed.results)) {
      return parsed.results;
    }
    if (Array.isArray(parsed.items)) {
      return parsed.items;
    }
    if (Array.isArray(parsed.data)) {
      return parsed.data;
    }
    return [parsed];
  }

  return [];
}

/**
 * Normaliza nombres de marca.
 */
export function normalizeBrandName(rawBrand) {
  if (!rawBrand) return null;
  const b = String(rawBrand).trim().toUpperCase();
  if (b.includes('TAILG')) return 'TAILG';
  if (b.includes('KAYEN') || b.includes('KAYENCORP')) return 'KAYENCORP';
  if (b.includes('YADEA')) return 'YADEA';
  if (b.includes('GREENLINE') || b.includes('GLPERU') || b.includes('GL PERU') || b.includes('GREEN LINE')) return 'GREENLINE';
  return null;
}

/**
 * Identifica la marca a partir de múltiples señales del registro.
 */
export function detectBrandFromRecord(rec, brandOverride) {
  if (brandOverride) {
    const n = normalizeBrandName(brandOverride);
    if (n) return n;
  }

  // 1. Extraer datos de schema si existen
  const schema = extractSchemaProduct(rec.json_ld);
  const schemaText = `${schema?.name || ''} ${schema?.description || ''} ${typeof schema?.image === 'string' ? schema.image : ''}`;

  // 2. Origen / dominio
  const origin = (rec.origin || rec.url || '').toLowerCase();
  if (origin.includes('tailg.com.pe')) return 'TAILG';
  if (origin.includes('kayencorp.com')) return 'KAYENCORP';
  if (origin.includes('glperu.com')) return 'GREENLINE';
  if (origin.includes('yadea.pe')) return 'YADEA';

  // 3. Nombre de job
  const job = (rec.job_name || '').toUpperCase();
  if (job.includes('TAILG')) return 'TAILG';
  if (job.includes('KAYENCORP')) return 'KAYENCORP';
  if (job.includes('GL PERU') || job.includes('GREENLINE')) return 'GREENLINE';
  if (job.includes('YADEA')) return 'YADEA';

  // 4. Texto completo de producto (título, descripción, schema, URL)
  const fullText = `${schemaText} ${rec.title || ''} ${rec.description || ''} ${rec.url || ''}`.toUpperCase();
  if (fullText.includes('GREENLINE') || fullText.includes('GREEN LINE') || fullText.includes('GLPERU')) return 'GREENLINE';
  if (fullText.includes('TAILG')) return 'TAILG';
  if (fullText.includes('YADEA')) return 'YADEA';
  if (fullText.includes('KAYENCORP')) return 'KAYENCORP';

  if (origin.includes('electrica.pe')) {
    if (fullText.includes('GREENLINE') || fullText.includes('T16')) return 'GREENLINE';
    return 'YADEA';
  }

  return 'TAILG';
}

/**
 * Filtro de URLs no comerciales o que no corresponden a un producto individual.
 */
export function isNonProductUrl(url, title) {
  if (!url) {
    return { isNonProduct: true, reason: 'URL vacía o no disponible' };
  }

  // Las fichas de productos individuales en WooCommerce usan la ruta /producto/
  if (!/\/producto\//i.test(url)) {
    return { isNonProduct: true, reason: 'URL no corresponde a una ficha de producto (/producto/)' };
  }

  for (const pattern of NON_PRODUCT_URL_PATTERNS) {
    if (pattern.test(url)) {
      return { isNonProduct: true, reason: `URL descartada por coincidir con patrón no comercial: ${pattern.source}` };
    }
  }

  const cleanTitle = (title || '').trim().toLowerCase();
  if (cleanTitle.startsWith('cart |') || cleanTitle.startsWith('carrito') || cleanTitle === 'mi cuenta – eléctrica') {
    return { isNonProduct: true, reason: 'Página de sistema/carrito identificada por título' };
  }

  return { isNonProduct: false };
}

/**
 * Extrae especificaciones técnicas de tablas HTML.
 */
export function parseTableSpecifications(tables) {
  const specs = {
    batteryRemovable: 'NO_DECLARADO',
  };

  if (!tables || !Array.isArray(tables) || tables.length === 0) {
    return specs;
  }

  for (const table of tables) {
    if (!Array.isArray(table)) continue;
    for (const row of table) {
      if (!Array.isArray(row) || row.length < 2) continue;
      const key = String(row[0] || '').trim().toLowerCase();
      const val = String(row[1] || '').trim();

      if (key.includes('autonomía') || key.includes('autonomia')) {
        const rangeMatch = val.match(/(\d+)\s*(?:–|-)\s*(\d+)\s*km/i);
        if (rangeMatch) {
          specs.rangeMinKm = parseInt(rangeMatch[1], 10);
          specs.rangeMaxKm = parseInt(rangeMatch[2], 10);
        } else {
          const singleMatch = val.match(/(\d+)\s*km/i);
          if (singleMatch) {
            specs.rangeMinKm = parseInt(singleMatch[1], 10);
            specs.rangeMaxKm = parseInt(singleMatch[1], 10);
          }
        }
      } else if (key.includes('velocidad')) {
        const speedMatch = val.match(/(\d+)\s*km\/h/i);
        if (speedMatch) {
          specs.maxSpeedKmh = parseInt(speedMatch[1], 10);
        }
      } else if (key.includes('motor')) {
        const motorMatch = val.match(/(\d+)\s*w/i);
        if (motorMatch) {
          specs.motorPowerW = parseInt(motorMatch[1], 10);
        }
      } else if (key.includes('batería') || key.includes('bateria')) {
        const vMatch = val.match(/(\d+)\s*v/i);
        if (vMatch) {
          specs.voltageV = parseInt(vMatch[1], 10);
        }
        const ahMatch = val.match(/(\d+)\s*ah/i);
        if (ahMatch) {
          specs.batteryCapacityAh = parseInt(ahMatch[1], 10);
        }
        if (/extraíble|extraible/i.test(val)) {
          specs.batteryRemovable = 'SI';
        } else if (/no extraíble|no extraible/i.test(val)) {
          specs.batteryRemovable = 'NO';
        }
        if (/litio\s*ncm/i.test(val)) {
          specs.batteryType = 'LITIO_NCM';
        } else if (/lifepo4/i.test(val)) {
          specs.batteryType = 'LIFEPO4';
        } else if (/plomo|grafeno/i.test(val)) {
          specs.batteryType = 'PLOMO_GRAFENO';
        }
      } else if (key.includes('garantía') || key.includes('garantia')) {
        specs.warranty = val;
      }
    }
  }

  return specs;
}

/**
 * Extrae especificaciones desde texto o títulos con regex.
 */
export function extractSpecsFromText(text, existing = {}) {
  const specs = { ...existing };

  if (!specs.voltageV) {
    const vMatch = text.match(/\b(36|48|60|72|84|96)\s*[vV]\b/);
    if (vMatch) {
      specs.voltageV = parseInt(vMatch[1], 10);
    }
  }

  if (!specs.batteryCapacityAh) {
    const ahMatch = text.match(/\b(\d+(?:\.\d+)?)\s*[aA][hH]\b/);
    if (ahMatch) {
      specs.batteryCapacityAh = parseFloat(ahMatch[1]);
    }
  }

  if (!specs.motorPowerW) {
    const wMatch = text.match(/\b(350|500|600|800|1000|1200|1500|2000|3000)\s*[wW]\b/);
    if (wMatch) {
      specs.motorPowerW = parseInt(wMatch[1], 10);
    }
  }

  if (!specs.batteryType) {
    if (/grafeno/i.test(text)) {
      specs.batteryType = 'PLOMO_GRAFENO';
    } else if (/litio|lithium/i.test(text)) {
      specs.batteryType = 'LITIO';
    } else if (/plomo\s*acido|plomo-acido|plomo\s*ácido/i.test(text)) {
      specs.batteryType = 'PLOMO_ACIDO';
    }
  }

  return specs;
}

/**
 * Busca el objeto Schema.org Product dentro de json_ld.
 */
export function extractSchemaProduct(jsonLd) {
  if (!jsonLd) return null;

  const items = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
  for (const item of items) {
    if (!item || typeof item !== 'object') continue;
    if (item['@graph'] && Array.isArray(item['@graph'])) {
      for (const node of item['@graph']) {
        if (String(node?.['@type']).toLowerCase() === 'product') {
          return node;
        }
      }
    }
    if (String(item['@type']).toLowerCase() === 'product') {
      return item;
    }
  }
  return null;
}

/**
 * Limpia y parsea precios numéricos.
 */
export function parseNumericPrice(val) {
  if (val === undefined || val === null || val === '') return null;
  if (typeof val === 'number') return isNaN(val) ? null : val;

  const s = String(val).trim().replace(/[^0-9.,]/g, '');
  if (!s) return null;

  let normalized = s;
  if (normalized.includes(',') && normalized.includes('.')) {
    normalized = normalized.replace(/,/g, '');
  } else if (normalized.includes(',')) {
    normalized = normalized.replace(',', '.');
  }

  const num = parseFloat(normalized);
  return isNaN(num) ? null : num;
}

/**
 * Deduce categoría de catálogo.
 */
export function categorizeProduct(title, url, isVehicle) {
  if (isVehicle) {
    if (/bicimoto|vmp/i.test(title) || /bicimoto/i.test(url)) return 'Bicimotos Eléctricas';
    if (/scooter/i.test(title) || /scooter/i.test(url)) return 'Scooters Eléctricas';
    if (/cuatrimoto/i.test(title)) return 'Cuatrimotos Eléctricas';
    if (/trimoto/i.test(title)) return 'Trimotos Eléctricas';
    return 'Motos Eléctricas';
  }

  const combined = `${title} ${url}`.toLowerCase();
  if (combined.includes('batería') || combined.includes('bateria') || combined.includes('kit 60v') || combined.includes('kit 48v')) {
    return 'Baterías';
  }
  if (combined.includes('cargador')) {
    return 'Cargadores';
  }
  if (combined.includes('controlador')) {
    return 'Controladores';
  }
  if (combined.includes('motor')) {
    return 'Motores eléctricos';
  }
  if (combined.includes('freno') || combined.includes('pastilla') || combined.includes('disco')) {
    return 'Frenos';
  }
  if (combined.includes('acelerador')) {
    return 'Aceleradores';
  }
  if (combined.includes('llanta') || combined.includes('neumatico') || combined.includes('neumático')) {
    return 'Llantas y neumáticos';
  }
  if (combined.includes('parrilla') || combined.includes('cajuela') || combined.includes('parachoques')) {
    return 'Accesorios y carrocería';
  }

  return 'Componentes y Repuestos';
}

/**
 * Normaliza un registro bruto.
 */
export function normalizeRecord(rec, sourceFilename, brandOverride) {
  const url = rec.final_url || rec.url || '';
  const title = (rec.title || '').trim();

  const filterCheck = isNonProductUrl(url, title);
  if (filterCheck.isNonProduct) {
    return { item: null, skippedReason: filterCheck.reason };
  }

  const schema = extractSchemaProduct(rec.json_ld);
  const titleLower = title.toLowerCase();

  const isComponentWord = /llanta|neumatico|neumático|parrilla|batería|bateria|cargador|controlador|acelerador|freno|disco|pastilla|cajuela|parachoques|aro\s*\d+|repuesto|accesorio/i.test(titleLower);

  const hasVehicleSpecs = Array.isArray(rec.tables) && rec.tables.length > 0 && /autonomía|velocidad\s*máxima|motor.*w/i.test(JSON.stringify(rec.tables));

  const isVehiclePage =
    !isComponentWord &&
    (hasVehicleSpecs ||
     (/^▷?\s*(?:bicimoto|moto scooter|scooter|cuatrimoto|trimoto|moto eléctrica)/i.test(titleLower) && !/repuesto|accesorio/i.test(titleLower)));

  const entityType = isVehiclePage ? 'VEHICULO' : 'REPUESTO';

  const brand = detectBrandFromRecord(rec, brandOverride);

  const schemaName = schema?.name ? String(schema.name).trim() : null;
  const rawName = schemaName || title.replace(/\s*\|\s*TAILG.*$/i, '').replace(/\s*–\s*Eléctrica.*$/i, '').replace(/\s*-\s*Kayencorp.*$/i, '').replace(/^▷\s*/, '').replace(/✔️/g, '').trim();
  const name = rawName || 'Producto sin nombre';

  let sku = schema?.sku ? String(schema.sku).trim() : null;
  if (!sku) {
    const matchSlug = url.match(/\/producto\/([^/?#]+)/i);
    if (matchSlug) {
      sku = `${brand.substring(0, 3)}-${matchSlug[1].slice(0, 25).toUpperCase()}`;
    }
  }

  let pricePen = null;
  let currency = 'PEN';

  if (schema?.offers) {
    const offers = Array.isArray(schema.offers) ? schema.offers[0] : schema.offers;
    if (offers) {
      pricePen = parseNumericPrice(offers.price);
      if (offers.priceCurrency) {
        currency = String(offers.priceCurrency).trim().toUpperCase();
      }
    }
  }

  let imageUrl = null;
  const galleryImages = [];

  if (schema?.image) {
    if (typeof schema.image === 'string') {
      imageUrl = schema.image;
    } else if (schema.image['@id']) {
      imageUrl = schema.image['@id'];
    } else if (schema.image.url) {
      imageUrl = schema.image.url;
    }
  }

  if (!imageUrl && Array.isArray(rec.images)) {
    for (const img of rec.images) {
      const src = typeof img === 'string' ? img : img?.src || img?.url;
      if (src && !src.includes('logo') && !src.includes('icon') && !src.endsWith('.svg')) {
        if (!imageUrl) {
          imageUrl = src;
        } else if (!galleryImages.includes(src)) {
          galleryImages.push(src);
        }
      }
    }
  }

  let specs = parseTableSpecifications(rec.tables);
  specs = extractSpecsFromText(`${title} ${rec.description || ''}`, specs);

  const category = categorizeProduct(name, url, isVehiclePage);
  const id = `${brand}_${sku || name.replace(/\s+/g, '_').toLowerCase()}`;

  const item = {
    id,
    entityType,
    sourceFile: sourceFilename,
    sourceUrl: url,
    canonicalUrl: rec.canonical_url || url,
    brand,
    name,
    sku,
    partKey: sku ? `${brand}-${sku}` : null,
    category,
    pricePen,
    regularPricePen: pricePen,
    currency,
    inStock: true,
    stockStatus: 'CONSULTAR_STOCK',
    description: schema?.description ? String(schema.description).trim() : rec.description || null,
    imageUrl,
    galleryImages: galleryImages.slice(0, 5),
    specs,
    scrapedAt: rec.scraped_at,
    dataStatus: specs.voltageV || pricePen ? 'VERIFICADO' : 'PARCIAL',
    notes: `Importado de ${sourceFilename}. Origen: ${url}`,
    rawMetadata: {
      origin: rec.origin,
      job_name: rec.job_name,
      http_status: rec.http_status,
      response_time_ms: rec.response_time_ms,
    },
  };

  return { item };
}

/**
 * Clave de deduplicación estable.
 */
export function getItemDeduplicationKey(item) {
  // 1. URL canónica o de origen normalizada (identificador más estable entre scraping JSON y CSV)
  const rawUrl = item.canonicalUrl || item.sourceUrl;
  if (rawUrl) {
    try {
      const u = new URL(rawUrl);
      const pathname = u.pathname.replace(/\/$/, '').toLowerCase();
      if (pathname.length > 3) {
        return `url:${u.hostname}:${pathname}`;
      }
    } catch {
      // Ignorar URL inválida
    }
  }

  // 2. SKU explícito
  if (item.sku && item.sku.length > 2) {
    return `sku:${item.brand.toUpperCase()}:${item.sku.trim().toUpperCase()}`;
  }

  // 3. Clave compuesta: Marca + Nombre normalizado
  const normName = item.name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 40);
  return `name:${item.brand.toUpperCase()}:${normName}`;
}

/**
 * Fusión de registros complementarios.
 */
export function mergeComplementaryItems(base, incoming) {
  const conflicts = [];

  if (
    base.pricePen !== null &&
    incoming.pricePen !== null &&
    base.pricePen !== incoming.pricePen
  ) {
    conflicts.push({
      id: `price-mismatch-${base.id}`,
      type: 'PRICE_DISCREPANCY',
      field: 'pricePen',
      itemA: base,
      itemB: incoming,
      valueA: base.pricePen,
      valueB: incoming.pricePen,
      resolution: `Se conserva el precio existente (PEN ${base.pricePen}) frente a PEN ${incoming.pricePen}. Requiere revisión manual.`,
    });
  }

  // Preferir SKU real sobre SKU sintetizado
  const isSynthesizedSku = (s) => !s || /^[A-Z]{3}-[A-Z0-9-]+$/i.test(s);
  let bestSku = base.sku;
  if (isSynthesizedSku(base.sku) && incoming.sku && !isSynthesizedSku(incoming.sku)) {
    bestSku = incoming.sku;
  } else if (!base.sku && incoming.sku) {
    bestSku = incoming.sku;
  }

  const merged = {
    ...base,
    sku: bestSku,
    partKey: bestSku ? `${base.brand}-${bestSku}` : base.partKey,
    description:
      incoming.description && incoming.description.length > (base.description?.length || 0)
        ? incoming.description
        : base.description,
    imageUrl: base.imageUrl || incoming.imageUrl,
    galleryImages: Array.from(new Set([...(base.galleryImages || []), ...(incoming.galleryImages || [])])),
    pricePen: base.pricePen !== null ? base.pricePen : incoming.pricePen,
    regularPricePen: base.regularPricePen !== null ? base.regularPricePen : incoming.regularPricePen,
    specs: {
      voltageV: base.specs.voltageV || incoming.specs.voltageV || null,
      motorPowerW: base.specs.motorPowerW || incoming.specs.motorPowerW || null,
      batteryType: base.specs.batteryType || incoming.specs.batteryType || null,
      batteryCapacityAh: base.specs.batteryCapacityAh || incoming.specs.batteryCapacityAh || null,
      batteryRemovable:
        base.specs.batteryRemovable !== 'NO_DECLARADO'
          ? base.specs.batteryRemovable
          : incoming.specs.batteryRemovable,
      maxSpeedKmh: base.specs.maxSpeedKmh || incoming.specs.maxSpeedKmh || null,
      rangeMinKm: base.specs.rangeMinKm || incoming.specs.rangeMinKm || null,
      rangeMaxKm: base.specs.rangeMaxKm || incoming.specs.rangeMaxKm || null,
      warranty: base.specs.warranty || incoming.specs.warranty || null,
      outputVoltageV: base.specs.outputVoltageV || incoming.specs.outputVoltageV || null,
      outputCurrentA: base.specs.outputCurrentA || incoming.specs.outputCurrentA || null,
      connectorOrFit: base.specs.connectorOrFit || incoming.specs.connectorOrFit || null,
    },
    notes: `${base.notes || ''} | Fusionado con ${incoming.sourceFile}`,
  };

  return { merged, conflicts };
}

/**
 * Deduplica lista de ítems.
 */
export function deduplicateItems(items) {
  const map = new Map();
  const conflicts = [];
  let duplicatesCount = 0;

  for (const item of items) {
    const key = getItemDeduplicationKey(item);
    if (map.has(key)) {
      duplicatesCount++;
      const existing = map.get(key);
      const { merged, conflicts: mergeConflicts } = mergeComplementaryItems(existing, item);
      map.set(key, merged);
      conflicts.push(...mergeConflicts);
    } else {
      map.set(key, item);
    }
  }

  return {
    deduplicated: Array.from(map.values()),
    duplicatesCount,
    conflicts,
  };
}

/**
 * Descubrimiento de archivos recursivo en disco.
 */
export function discoverScrapedFiles(targetDir) {
  if (!fs.existsSync(targetDir)) {
    return [];
  }

  const descriptors = [];

  function scan(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        scan(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (ext === '.csv' || ext === '.json') {
          const stats = fs.statSync(fullPath);
          const format = ext === '.csv' ? 'csv' : 'json';
          descriptors.push({
            path: fullPath,
            filename: entry.name,
            sizeBytes: stats.size,
            format,
            detectedBrand: 'DESCONOCIDA',
            recordCount: 0,
            status: 'PENDIENTE',
          });
        }
      }
    }
  }

  scan(targetDir);
  return descriptors.sort((a, b) => a.filename.localeCompare(b.filename));
}

/**
 * Genera vista previa completa (Dry-Run).
 */
export function generateImportPreview(files) {
  const fileDescriptors = [];
  const allNormalizedItems = [];
  const invalidOrSkippedRecords = [];
  let totalRawRecords = 0;

  for (const file of files) {
    let content = file.content;
    const filepath = file.filepath || file.filename;
    const ext = path.extname(file.filename).toLowerCase();
    const format = ext === '.csv' ? 'csv' : 'json';

    if (!content && filepath && fs.existsSync(filepath)) {
      content = fs.readFileSync(filepath, 'utf-8');
    }

    if (!content) {
      fileDescriptors.push({
        path: filepath,
        filename: file.filename,
        sizeBytes: 0,
        format,
        detectedBrand: 'DESCONOCIDA',
        recordCount: 0,
        status: 'ERROR',
        errorMessage: 'El contenido del archivo no pudo ser leído o está vacío.',
      });
      continue;
    }

    let records = [];
    let detectedBrand = file.brandOverride || 'DESCONOCIDA';

    try {
      if (format === 'csv') {
        records = parseCsvText(content, file.filename);
      } else {
        records = parseJsonText(content, file.filename);
      }

      totalRawRecords += records.length;

      if (detectedBrand === 'DESCONOCIDA' && records.length > 0) {
        detectedBrand = detectBrandFromRecord(records[0]);
      }

      for (const rec of records) {
        const { item, skippedReason } = normalizeRecord(
          rec,
          file.filename,
          file.brandOverride
        );

        if (item) {
          allNormalizedItems.push(item);
        } else if (skippedReason) {
          invalidOrSkippedRecords.push({
            url: rec.url || rec.final_url,
            reason: skippedReason,
            sourceFile: file.filename,
          });
        }
      }

      fileDescriptors.push({
        path: filepath,
        filename: file.filename,
        sizeBytes: Buffer.byteLength(content, 'utf-8'),
        format,
        detectedBrand,
        recordCount: records.length,
        status: 'PROCESADO',
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error desconocido al procesar archivo';
      fileDescriptors.push({
        path: filepath,
        filename: file.filename,
        sizeBytes: Buffer.byteLength(content, 'utf-8'),
        format,
        detectedBrand: 'DESCONOCIDA',
        recordCount: 0,
        status: 'ERROR',
        errorMessage: msg,
      });
    }
  }

  const { deduplicated, duplicatesCount, conflicts } = deduplicateItems(allNormalizedItems);

  const productsByBrand = {
    TAILG: 0,
    KAYENCORP: 0,
    YADEA: 0,
    GREENLINE: 0,
  };

  let vehiclesCount = 0;
  let partsCount = 0;

  for (const item of deduplicated) {
    productsByBrand[item.brand] = (productsByBrand[item.brand] || 0) + 1;
    if (item.entityType === 'VEHICULO') {
      vehiclesCount++;
    } else {
      partsCount++;
    }
  }

  const proposedOperations = deduplicated.map((item) => {
    if (item.entityType === 'VEHICULO') {
      return {
        action: 'INSERT',
        entity: 'modelos_moto',
        identifier: `${item.brand} ${item.name}`,
        summary: `Modelo: ${item.name} (${item.specs.voltageV || 'N/D'}V, ${item.specs.motorPowerW || 'N/D'}W, ${item.specs.maxSpeedKmh || 'N/D'} km/h)`,
        data: {
          nombre: item.name,
          marca: item.brand,
          voltaje_nominal_v: item.specs.voltageV || null,
          potencia_motor_w: item.specs.motorPowerW || null,
          autonomia_km: item.specs.rangeMaxKm || null,
          velocidad_max_kmh: item.specs.maxSpeedKmh || null,
          bateria_quimica: item.specs.batteryType || null,
          bateria_capacidad_ah: item.specs.batteryCapacityAh || null,
          imagen_url: item.imageUrl || null,
          source_url: item.sourceUrl,
          estado: true,
        },
      };
    } else {
      return {
        action: 'INSERT',
        entity: 'repuestos',
        identifier: item.sku || item.name,
        summary: `Repuesto: ${item.name} [SKU: ${item.sku || 'S/N'}] - ${item.pricePen ? `PEN ${item.pricePen}` : 'Precio no publicado'}`,
        data: {
          nombre: item.name,
          marca: item.brand,
          codigo_sku: item.sku,
          categoria: item.category,
          precio: item.pricePen || 0,
          moneda: item.currency || 'PEN',
          imagen_url: item.imageUrl,
          descripcion: item.description,
          source_url: item.sourceUrl,
          estado: true,
        },
      };
    }
  });

  return {
    totalFiles: fileDescriptors.length,
    filesProcessed: fileDescriptors,
    totalRawRecords,
    validProducts: deduplicated.length,
    vehiclesCount,
    partsCount,
    productsByBrand,
    potentialNew: deduplicated.length,
    existingUnchanged: 0,
    potentialUpdates: 0,
    duplicatesIdentified: duplicatesCount,
    conflicts,
    invalidOrSkippedRecords,
    sampleItems: deduplicated.slice(0, 15),
    proposedOperations,
    unrecognizedFields: ['headings_json', 'links_json'],
    missingFields: ['precio_compra', 'costo_envio'],
  };
}
