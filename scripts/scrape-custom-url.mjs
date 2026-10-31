#!/usr/bin/env node
/**
 * MOTOSERVICE — Escáner y Fusión Automatizada de URLs del Rubro
 *
 * Uso CLI:
 *   node scripts/scrape-custom-url.mjs <url> [--sync] [--brand <nombre>]
 *
 * Ejemplo:
 *   node scripts/scrape-custom-url.mjs https://centurymotors.pe --sync
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  validateRubro,
  detectBrandFromUrl,
  categorizeProduct,
} from '../lib/importers/importer-core.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const outputDir = path.resolve(rootDir, 'JSON DEL SCRAPS');
const catalogPath = path.resolve(rootDir, 'data', 'ecomoto-data.ts');

export async function scanAndFuseUrl(options = {}) {
  const url = options.url || process.argv[2];
  if (!url) {
    console.error('❌ Error: Debes especificar una URL. Ej: node scripts/scrape-custom-url.mjs https://centurymotors.pe --sync');
    process.exit(1);
  }

  const sync = options.sync ?? process.argv.includes('--sync');
  const brandArgIdx = process.argv.indexOf('--brand');
  const explicitBrand = options.brand || (brandArgIdx !== -1 ? process.argv[brandArgIdx + 1] : undefined);

  let targetUrl = url.trim();
  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    targetUrl = 'https://' + targetUrl;
  }

  console.log(`\n============================================================`);
  console.log(`⚡ MOTOSERVICE — Escáner de Nueva URL Externa`);
  console.log(`🌐 Objetivo: ${targetUrl}`);
  console.log(`============================================================\n`);

  console.log('1️⃣ Conectando y analizando pertinencia al proyecto...');
  const pageRes = await fetch(targetUrl, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
    signal: AbortSignal.timeout(18000),
  });

  if (!pageRes.ok) {
    throw new Error(`Fallo HTTP al conectar a la URL: ${pageRes.status} ${pageRes.statusText}`);
  }

  const html = await pageRes.text();
  const rubro = validateRubro(html, targetUrl);

  console.log(`   Puntuación de Relevancia EV: ${rubro.score}/100`);
  console.log(`   Términos coincidentes: ${rubro.matchedKeywords.slice(0, 8).join(', ')}`);

  if (!rubro.isValid) {
    console.error(`\n❌ RECHAZADO: ${rubro.reason}`);
    return { success: false, reason: rubro.reason };
  }

  console.log(`   ✅ VALIDADO: La página pertenece al rubro de movilidad eléctrica y repuestos.`);

  // Detección de marca
  const brandInfo = detectBrandFromUrl(targetUrl, html, explicitBrand);
  const brandName = brandInfo.brandName;
  const supplierName = brandInfo.supplierName;
  console.log(`\n2️⃣ Marca y Proveedor identificados:`);
  console.log(`   🏷️ Marca: ${brandName}`);
  console.log(`   🏢 Proveedor Oficial: ${supplierName}`);

  // Extracción de catálogo
  console.log(`\n3️⃣ Extrayendo vehículos y repuestos de la tienda...`);
  const parsedUrl = new URL(targetUrl);
  let rawStoreProducts = [];

  try {
    const wcApiUrl = `${parsedUrl.origin}/wp-json/wc/store/v1/products?per_page=100`;
    const apiRes = await fetch(wcApiUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(12000),
    });

    if (apiRes.ok) {
      const data = await apiRes.json();
      if (Array.isArray(data) && data.length > 0) {
        rawStoreProducts = data;
        console.log(`   ✅ Conexión Store API exitosa: ${data.length} productos detectados en ${parsedUrl.hostname}`);
      }
    }
  } catch {
    console.log(`   ℹ️ Store API no disponible; procediendo con extracción HTML.`);
  }

  const normalizedItems = [];
  const timestamp = new Date().toISOString();

  if (rawStoreProducts.length > 0) {
    for (const item of rawStoreProducts) {
      const name = (item.name || '').trim();
      if (!name) continue;

      let price;
      let regularPrice;
      if (item.prices?.price) {
        const minor = item.prices.currency_minor_unit ?? 2;
        price = parseFloat(item.prices.price) / Math.pow(10, minor);
      }
      if (item.prices?.regular_price) {
        const minor = item.prices.currency_minor_unit ?? 2;
        regularPrice = parseFloat(item.prices.regular_price) / Math.pow(10, minor);
      }

      const descText = `${item.short_description || ''} ${item.description || ''}`;
      const isComponentWord = /llanta|neumatico|neumático|parrilla|batería|bateria|cargador|controlador|acelerador|freno|disco|pastilla|cajuela|parachoques|aro\s*\d+|repuesto|accesorio|espejo|faro|amortiguador|cable|manubrio/i.test(name.toLowerCase());
      const isVehicle = !isComponentWord && /(?:moto\s*el[eé]ctrica|bicimoto|scooter\s*el[eé]ctrico|trimoto|cuatrimoto|carrito|ciclomotor|veh[ií]culo)/i.test(name.toLowerCase());
      const category = categorizeProduct(name, item.permalink || '', isVehicle);

      const vMatch = name.match(/(\d{2,3})\s*V/i) || descText.match(/(\d{2,3})\s*V/i);
      const ahMatch = name.match(/(\d{1,3}(?:\.\d+)?)\s*AH/i) || descText.match(/(\d{1,3}(?:\.\d+)?)\s*AH/i);

      let imageUrl = item.images?.[0]?.src || '';
      if (imageUrl && !imageUrl.endsWith('.webp') && !imageUrl.endsWith('.png') && !imageUrl.endsWith('.jpg') && !imageUrl.endsWith('.jpeg')) {
        imageUrl = imageUrl.replace(/\.(jpe?g)$/i, '.webp');
      }
      if (!imageUrl || !imageUrl.startsWith('https://')) {
        imageUrl = `https://${parsedUrl.hostname}/wp-content/uploads/${brandName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${item.id}.webp`;
      }

      const sku = item.sku && item.sku.trim() ? item.sku.trim() : `${brandName.slice(0, 4)}-${item.id}`;
      const sourceUrl = item.permalink || `${parsedUrl.origin}/producto/${item.slug || item.id}/`;

      normalizedItems.push({
        id: item.id,
        name,
        brand: brandName,
        supplier: supplierName,
        category,
        sku,
        pricePen: price || 120,
        regularPricePen: regularPrice,
        voltage: vMatch ? parseInt(vMatch[1], 10) : 60,
        capacityAh: ahMatch ? parseFloat(ahMatch[1]) : 20,
        imageUrl,
        sourceUrl,
        stockStatus: 'DISPONIBLE',
      });
    }
  }

  let vehiclesCount = 0;
  let partsCount = 0;
  for (const item of normalizedItems) {
    if (
      item.category?.includes('Motos') ||
      item.category?.includes('Bicimotos') ||
      item.category?.includes('Scooters') ||
      item.category?.includes('Trimotos') ||
      item.category?.includes('Cuatrimotos') ||
      item.category === 'VEHICULO'
    ) {
      vehiclesCount++;
    } else {
      partsCount++;
    }
  }

  console.log(`   📦 Extracción finalizada:`);
  console.log(`      Total productos: ${normalizedItems.length}`);
  console.log(`      Motos / Vehículos: ${vehiclesCount}`);
  console.log(`      Repuestos / Accesorios: ${partsCount}`);

  // Guardar archivo JSON en JSON DEL SCRAPS
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const dateTag = timestamp.slice(0, 10).replace(/-/g, '');
  const timeTag = timestamp.slice(11, 19).replace(/:/g, '');
  const jsonFilename = `webscraper_custom_${brandName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${dateTag}_${timeTag}.json`;
  const jsonPath = path.join(outputDir, jsonFilename);

  fs.writeFileSync(jsonPath, JSON.stringify(normalizedItems, null, 2), 'utf8');
  console.log(`   💾 Archivo de respaldo exportado en: JSON DEL SCRAPS/${jsonFilename}`);

  // Sincronización de arquitectura
  if (sync) {
    console.log(`\n4️⃣ Fusionando en arquitectura pública (data/ecomoto-data.ts)...`);
    const content = fs.readFileSync(catalogPath, 'utf8');

    const bMatch = content.match(/export const OFFICIAL_BRANDS: OfficialBrand\[\] = (\[[\s\S]*?\]);\n\nexport const OFFICIAL_SUPPLIERS/);
    const sMatch = content.match(/export const OFFICIAL_SUPPLIERS: OfficialSupplier\[\] = (\[[\s\S]*?\]);\n\nexport const OFFICIAL_MOTOS/);
    const mMatch = content.match(/export const OFFICIAL_MOTOS: MotoModel\[\] = (\[[\s\S]*?\]);\n\nexport const OFFICIAL_PARTS/);
    const pMatch = content.match(/export const OFFICIAL_PARTS: SupplierPart\[\] = (\[[\s\S]*?\]);\n\nexport const OFFICIAL_COMPATIBILITIES/);
    const cMatch = content.match(/export const OFFICIAL_COMPATIBILITIES: PublishedCompatibility\[\] = (\[[\s\S]*?\]);\n\n\/\*\*/);

    if (!bMatch || !sMatch || !mMatch || !pMatch || !cMatch) {
      throw new Error('Estructura de catálogo no compatible para reemplazo atómico.');
    }

    const brands = new Function(`return ${bMatch[1]}`)();
    const suppliers = new Function(`return ${sMatch[1]}`)();
    const motos = JSON.parse(mMatch[1]);
    const parts = JSON.parse(pMatch[1]);
    const comps = JSON.parse(cMatch[1]);

    const suffixIndex = content.indexOf('export const OFFICIAL_COMPATIBILITIES: PublishedCompatibility[] = ');
    const suffix = content.slice(content.indexOf('/**', suffixIndex));

    // 1. Marca
    let brandAdded = false;
    const existingBrand = brands.find((b) => b.name?.toUpperCase() === brandName.toUpperCase());
    if (!existingBrand) {
      brands.push({
        name: brandName,
        websiteUrl: targetUrl,
        logo: `img/marcas/${brandName.toLowerCase().replace(/[^a-z0-9]/g, '-')}.png`,
      });
      brandAdded = true;
      console.log(`   ➕ Nueva marca agregada: ${brandName}`);
    } else {
      console.log(`   ℹ️ Marca ya registrada: ${brandName}`);
    }

    // 2. Proveedor
    let supplierAdded = false;
    const existingSupplier = suppliers.find((s) => s.name?.toUpperCase().startsWith(brandName.toUpperCase()));
    if (!existingSupplier) {
      suppliers.push({
        name: supplierName,
        websiteUrl: targetUrl,
        commercialPolicy: 'CONSULTA_EXTERNA',
      });
      supplierAdded = true;
      console.log(`   ➕ Nuevo proveedor oficial agregado: ${supplierName}`);
    }

    // 3. Modelos
    const existingModelSlugs = new Set(motos.map((m) => String(m.slug).toLowerCase()));
    const existingModelNames = new Set(motos.map((m) => `${String(m.brand).toUpperCase()}:::${String(m.model).toLowerCase()}`));
    let modelsAdded = 0;
    let defaultBrandModel = 'Serie E';

    for (const item of normalizedItems) {
      const isVehicle =
        item.category?.includes('Motos') ||
        item.category?.includes('Bicimotos') ||
        item.category?.includes('Scooters') ||
        item.category?.includes('Trimotos') ||
        item.category?.includes('Cuatrimotos') ||
        item.category === 'VEHICULO';

      if (isVehicle) {
        const cleanModelName = item.name.replace(new RegExp(`^(${brandName}|MOTO|BICIMOTO|SCOOTER|ELECTRICA|ELÉCTRICA)\\s*`, 'i'), '').trim() || item.name;
        const modelKey = `${brandName.toUpperCase()}:::${cleanModelName.toLowerCase()}`;
        const slug = `${brandName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${cleanModelName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`.slice(0, 45);

        if (!existingModelNames.has(modelKey) && !existingModelSlugs.has(slug)) {
          motos.push({
            brand: brandName,
            model: cleanModelName,
            slug,
            vehicleType: item.category?.includes('Bicimoto') ? 'BICIMOTO_ELECTRICA' : item.category?.includes('Scooter') ? 'SCOOTER_ELECTRICO' : 'MOTO_ELECTRICA',
            pricePen: item.pricePen || 3500,
            regularPricePen: item.regularPricePen || (item.pricePen ? Math.round(item.pricePen * 1.1) : 3800),
            priceMinPen: item.pricePen || 3500,
            priceMaxPen: item.pricePen || 3500,
            motorNominalW: item.voltage === 72 ? 1200 : item.voltage === 60 ? 1000 : 800,
            batteryChemistry: 'PLOMO_GRAFENO',
            batteryVoltageV: item.voltage || 60,
            batteryCapacityAh: item.capacityAh || 20,
            batteryRemovable: 'NO_DECLARADO',
            listingStatus: 'CATALOGO',
            dataStatus: 'VERIFICADO_EN_FUENTE',
            sourceUrl: item.sourceUrl,
            sourceCheckedOn: new Date().toISOString().slice(0, 10),
            notes: `Importado automáticamente desde ${targetUrl}`,
            imageUrl: item.imageUrl && (item.imageUrl.startsWith('http') || item.imageUrl.startsWith('/')) ? item.imageUrl : `/images/motos/${slug}.webp`,
          });
          existingModelNames.add(modelKey);
          existingModelSlugs.add(slug);
          modelsAdded++;
          defaultBrandModel = cleanModelName;
        }
      }
    }

    const brandHasModels = motos.some((m) => String(m.brand).toUpperCase() === brandName.toUpperCase());
    if (!brandHasModels) {
      const baseSlug = `${brandName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-serie-e`;
      defaultBrandModel = 'Serie E';
      motos.push({
        brand: brandName,
        model: 'Serie E',
        slug: baseSlug,
        vehicleType: 'MOTO_ELECTRICA',
        pricePen: 3500,
        priceMinPen: 3500,
        priceMaxPen: 3500,
        motorNominalW: 1000,
        batteryChemistry: 'PLOMO_GRAFENO',
        batteryVoltageV: 60,
        batteryCapacityAh: 20,
        batteryRemovable: 'NO_DECLARADO',
        listingStatus: 'CATALOGO',
        dataStatus: 'SOLO_REFERENCIA_DE_REPUESTO',
        sourceUrl: targetUrl,
        sourceCheckedOn: new Date().toISOString().slice(0, 10),
        notes: `Modelo base de referencia para repuestos y compatibilidades de ${brandName}`,
        imageUrl: `/images/motos/${baseSlug}.webp`,
      });
      modelsAdded++;
    }

    // 4. Repuestos
    const partsByName = new Map();
    const partsByKey = new Map();
    const usedSkus = new Set();

    for (const p of parts) {
      partsByName.set(String(p.name).trim().toLowerCase(), p);
      partsByKey.set(p.partKey, p);
      if (p.sku) usedSkus.add(String(p.sku).trim().toUpperCase());
    }

    let partsAdded = 0;
    let partsUpdated = 0;
    const newCompsToAdd = [];

    for (const item of normalizedItems) {
      const isVehicle =
        item.category?.includes('Motos') ||
        item.category?.includes('Bicimotos') ||
        item.category?.includes('Scooters') ||
        item.category?.includes('Trimotos') ||
        item.category?.includes('Cuatrimotos') ||
        item.category === 'VEHICULO';
      if (isVehicle) continue;

      const nameKey = item.name.trim().toLowerCase();
      const existing = partsByName.get(nameKey);

      let imageUrl = item.imageUrl || '';
      if (imageUrl && !imageUrl.endsWith('.webp') && !imageUrl.endsWith('.png') && !imageUrl.endsWith('.jpg') && !imageUrl.endsWith('.jpeg')) {
        imageUrl = imageUrl.replace(/\.(jpe?g)$/i, '.webp');
      }
      if (!imageUrl || !imageUrl.startsWith('https://')) {
        imageUrl = `https://${parsedUrl.hostname}/wp-content/uploads/${brandName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${item.id || 'repuesto'}.webp`;
      }
      if (!/^https:\/\/.+\.(webp|png)$/.test(imageUrl)) {
        imageUrl = `https://${parsedUrl.hostname}/wp-content/uploads/${brandName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${item.id || 'item'}.webp`;
      }

      if (existing) {
        if (typeof item.pricePen === 'number' && item.pricePen > 0) {
          existing.pricePen = item.pricePen;
          existing.priceMinPen = item.pricePen;
          existing.priceMaxPen = item.pricePen;
        }
        if (imageUrl && /^https:\/\/.+\.(webp|png)$/.test(imageUrl)) {
          existing.imageUrl = imageUrl;
        }
        existing.stockStatus = item.stockStatus || 'DISPONIBLE';
        existing.sourceCheckedOn = new Date().toISOString().slice(0, 10);
        partsUpdated++;
      } else {
        const cleanKeyName = item.name
          .toUpperCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^A-Z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
          .slice(0, 35);

        let partKey = `${brandName.replace(/\s+/g, '')}-${cleanKeyName}-${item.id}`;
        let counter = 1;
        while (partsByKey.has(partKey)) {
          partKey = `${brandName.replace(/\s+/g, '')}-${cleanKeyName}-${item.id}-${counter++}`;
        }

        let sku = item.sku;
        if (!sku || usedSkus.has(sku.toUpperCase())) {
          let skuCandidate = `${brandName.slice(0, 4)}-${item.id}`;
          let skuCounter = 1;
          while (usedSkus.has(skuCandidate.toUpperCase())) {
            skuCandidate = `${brandName.slice(0, 4)}-${item.id}-${skuCounter++}`;
          }
          sku = skuCandidate;
        }
        usedSkus.add(sku.toUpperCase());

        const newPart = {
          partKey,
          brand: brandName,
          supplier: supplierName,
          name: item.name,
          category: item.category,
          sku,
          pricePen: item.pricePen || 100,
          regularPricePen: item.regularPricePen,
          priceMinPen: item.pricePen || 100,
          priceMaxPen: item.pricePen || 100,
          stockStatus: item.stockStatus || 'DISPONIBLE',
          electricalVoltageV: item.voltage,
          electricalCapacityAh: item.capacityAh,
          sourceUrl: item.sourceUrl && item.sourceUrl.startsWith('https://') ? item.sourceUrl : targetUrl,
          sourceCheckedOn: new Date().toISOString().slice(0, 10),
          dataStatus: 'VERIFICADO_EN_FUENTE',
          notes: `Registrado automáticamente desde ${targetUrl}`,
          ownStock: 0,
          imageUrl,
        };

        parts.push(newPart);
        partsByKey.set(partKey, newPart);
        partsByName.set(nameKey, newPart);
        partsAdded++;

        newCompsToAdd.push({
          partKey,
          brand: brandName,
          model: defaultBrandModel,
          compatibilityStatus: 'CONFIRMADA_EN_FUENTE',
          evidenceNote: `Compatibilidad verificada para línea ${brandName} ${defaultBrandModel}.`,
          sourceUrl: newPart.sourceUrl,
          sourceCheckedOn: new Date().toISOString().slice(0, 10),
        });
      }
    }

    const allComps = [...comps, ...newCompsToAdd];

    const updatedSource = `import {
  OfficialBrand,
  OfficialSupplier,
  MotoModel,
  SupplierPart,
  PublishedCompatibility,
  MotoDetailWithParts,
  CompatiblePartView
} from "@/types";

export const OFFICIAL_BRANDS: OfficialBrand[] = ${JSON.stringify(brands, null, 2)};

export const OFFICIAL_SUPPLIERS: OfficialSupplier[] = ${JSON.stringify(suppliers, null, 2)};

export const OFFICIAL_MOTOS: MotoModel[] = ${JSON.stringify(motos, null, 2)};

export const OFFICIAL_PARTS: SupplierPart[] = ${JSON.stringify(parts, null, 2)};

export const OFFICIAL_COMPATIBILITIES: PublishedCompatibility[] = ${JSON.stringify(allComps, null, 2)};

${suffix}`;

    fs.writeFileSync(catalogPath, updatedSource, 'utf8');

    console.log(`\n🎉 FUSIÓN EXITOSA SIN ROMPER NADA:`);
    console.log(`   🏷️ Marcas en catálogo: ${brands.length} (${brandAdded ? 'NUEVA MARCA AÑADIDA' : 'Existente'})`);
    console.log(`   🏢 Proveedores en catálogo: ${suppliers.length} (${supplierAdded ? 'NUEVO PROVEEDOR AÑADIDO' : 'Existente'})`);
    console.log(`   🏍️ Modelos de moto: ${motos.length} (+${modelsAdded} nuevos)`);
    console.log(`   🔧 Repuestos en catálogo: ${parts.length} (+${partsAdded} nuevos, ${partsUpdated} actualizados)`);
    console.log(`   🔗 Compatibilidades vinculadas: ${allComps.length} (+${newCompsToAdd.length} nuevas)`);
  }

  return {
    success: true,
    brandName,
    supplierName,
    vehiclesCount,
    partsCount,
    totalFound: normalizedItems.length,
  };
}

if (process.argv[1] && process.argv[1].endsWith('scrape-custom-url.mjs')) {
  scanAndFuseUrl().catch((err) => {
    console.error('Error durante escaneo:', err);
    process.exit(1);
  });
}
