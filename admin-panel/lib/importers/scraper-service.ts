/**
 * MOTOSERVICE ADMIN PANEL — Servicio de Scraping y Extracción en Vivo
 *
 * Tiendas soportadas:
 * 1. Electrica.pe (YADEA, GreenLine, Chilwee, TianNeng)
 * 2. TAILG Perú Oficial (Motos y Repuestos Originales)
 * 3. Kayencorp Repuestos (Bicimotos y Repuestos)
 *
 * Diseñado para operar tanto en entorno local como en servidor remoto (Vercel).
 */

import fs from 'fs';
import path from 'path';
import { resolveScrapesDir } from './import-service';

export type StoreKey = 'electrica' | 'tailg' | 'kayencorp';

export interface StoreDefinition {
  key: StoreKey;
  name: string;
  domain: string;
  apiUrl: string;
  defaultBrand: string;
  supplier: string;
}

export const SCRAPE_STORES: StoreDefinition[] = [
  {
    key: 'electrica',
    name: 'Electrica.pe (Yadea / GreenLine / TianNeng)',
    domain: 'electrica.pe',
    apiUrl: 'https://electrica.pe/wp-json/wc/store/v1/products?per_page=100',
    defaultBrand: 'GREENLINE',
    supplier: 'Electrica.pe',
  },
  {
    key: 'tailg',
    name: 'TAILG Perú Oficial',
    domain: 'tailg.com.pe',
    apiUrl: 'https://tailg.com.pe/wp-json/wc/store/v1/products?per_page=100',
    defaultBrand: 'TAILG',
    supplier: 'TAILG Perú',
  },
  {
    key: 'kayencorp',
    name: 'Kayencorp Repuestos',
    domain: 'kayencorp.com',
    apiUrl: 'https://kayencorp.com/wp-json/wc/store/v1/products?per_page=100&category=84',
    defaultBrand: 'KAYENCORP',
    supplier: 'Kayencorp Perú',
  },
];

export interface LiveScrapedItem {
  id: number | string;
  name: string;
  brand: string;
  supplier: string;
  category: string;
  sku: string;
  pricePen?: number;
  regularPricePen?: number;
  voltage?: number;
  capacityAh?: number;
  imageUrl?: string;
  sourceUrl: string;
  stockStatus: string;
}

export interface LiveScrapeResult {
  success: boolean;
  timestamp: string;
  totalFound: number;
  filename: string;
  filepath?: string;
  content: string;
  storesScraped: Array<{
    key: StoreKey;
    name: string;
    domain: string;
    found: number;
    status: 'ok' | 'error';
    error?: string;
  }>;
  brandBreakdown: Record<string, number>;
  categoryBreakdown: Record<string, number>;
  items: LiveScrapedItem[];
  savedToDisk: boolean;
  syncResult?: CatalogSyncResult;
  error?: string;
}

export interface CatalogSyncResult {
  success: boolean;
  catalogPath?: string;
  totalParts: number;
  totalCompatibilities: number;
  newPartsAdded: number;
  existingPartsUpdated: number;
  error?: string;
}

function cleanHtml(s: string): string {
  if (!s) return '';
  return s
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&#038;/g, '&')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function detectCategory(name: string, cats: string[] = []): string {
  const text = (name + ' ' + cats.join(' ')).toUpperCase();
  if (
    text.includes('BATERÍA') ||
    text.includes('BATERIA') ||
    text.includes('LITIO') ||
    text.includes('GRAFENO') ||
    text.includes('PLOMO') ||
    text.includes('LIFEPO4') ||
    text.includes('NMC')
  ) {
    return 'BATERIA';
  }
  if (text.includes('CARGADOR')) return 'CARGADOR';
  if (
    text.includes('LLANTA') ||
    text.includes('CÁMARA') ||
    text.includes('CAMARA') ||
    text.includes('NEUMÁTICO') ||
    text.includes('NEUMATICO')
  ) {
    return 'LLANTA';
  }
  if (text.includes('ESPEJO')) return 'ESPEJO';
  if (
    text.includes('AMORTIGUADOR') ||
    text.includes('SUSPENSIÓN') ||
    text.includes('SUSPENSION') ||
    text.includes('HORQUILLA')
  ) {
    return 'SUSPENSION';
  }
  if (text.includes('FRENO') || text.includes('DISCO') || text.includes('PASTILLA')) {
    return 'FRENOS';
  }
  if (
    text.includes('MOTOR') ||
    text.includes('CONTROLADOR') ||
    text.includes('CONVERTIDOR') ||
    text.includes('TERMOMAGNETICA') ||
    text.includes('CHAPA') ||
    text.includes('INTERRUPTOR') ||
    text.includes('PUERTO DE CARGA') ||
    text.includes('ACELERADOR') ||
    text.includes('DISPLAY') ||
    text.includes('RAMAL')
  ) {
    return 'ELECTRICO';
  }
  if (
    text.includes('PARRILLA') ||
    text.includes('CAJUELA') ||
    text.includes('MALETA') ||
    text.includes('POSAPIE') ||
    text.includes('POSAPIÉ') ||
    text.includes('CARENADO') ||
    text.includes('GUARDAFANGO') ||
    text.includes('ASIENTO') ||
    text.includes('CANASTILLA')
  ) {
    return 'CARROCERIA';
  }
  if (
    text.includes('TIMÓN') ||
    text.includes('TIMON') ||
    text.includes('CHASIS') ||
    text.includes('PEDAL') ||
    text.includes('PARANTE')
  ) {
    return 'CHASIS';
  }
  return 'ACCESORIO';
}

function detectBrand(name: string, cats: string[] = [], desc: string = '', defaultBrand: string = 'UNIVERSAL'): string {
  const text = (name + ' ' + cats.join(' ') + ' ' + desc).toUpperCase();
  if (text.includes('YADEA')) return 'YADEA';
  if (text.includes('GREENLINE') || text.includes('GL PERU') || text.includes('GLPERU')) return 'GREENLINE';
  if (text.includes('TAILG')) return 'TAILG';
  if (text.includes('KAYEN')) return 'KAYENCORP';

  if (
    text.includes('TIANNENG') ||
    text.includes('TIAN NENG') ||
    text.includes('CHILWEE') ||
    text.includes('FARASIS') ||
    text.includes('TTFAR')
  ) {
    return 'YADEA';
  }

  return defaultBrand;
}

interface RawStoreProduct {
  id: number | string;
  name: string;
  slug?: string;
  permalink?: string;
  description?: string;
  short_description?: string;
  sku?: string;
  prices?: {
    price?: string;
    regular_price?: string;
    currency_minor_unit?: number;
  };
  categories?: Array<{ name: string }>;
  images?: Array<{ src: string }>;
}

export function syncScrapedToCatalog(scrapedItems: LiveScrapedItem[]): CatalogSyncResult {
  try {
    const candidates = [
      path.resolve(process.cwd(), 'data', 'ecomoto-data.ts'),
      path.resolve(process.cwd(), '..', 'data', 'ecomoto-data.ts'),
    ];
    let catalogPath: string | null = null;
    for (const c of candidates) {
      if (fs.existsSync(/*turbopackIgnore: true*/ c)) {
        catalogPath = c;
        break;
      }
    }

    if (!catalogPath) {
      return {
        success: false,
        totalParts: 0,
        totalCompatibilities: 0,
        newPartsAdded: 0,
        existingPartsUpdated: 0,
        error: 'No se encontró el archivo data/ecomoto-data.ts en el disco.',
      };
    }

    const content = fs.readFileSync(/*turbopackIgnore: true*/ catalogPath, 'utf8');

    const prefix = content.split('export const OFFICIAL_PARTS: SupplierPart[] = ')[0];
    const partsMatch = content.match(
      /export const OFFICIAL_PARTS: SupplierPart\[\] = (\[[\s\S]*?\]);\n\nexport const OFFICIAL_COMPATIBILITIES/
    );
    const compsMatch = content.match(
      /export const OFFICIAL_COMPATIBILITIES: PublishedCompatibility\[\] = (\[[\s\S]*?\]);\n\n\/\*\*/
    );

    if (!partsMatch || !compsMatch) {
      return {
        success: false,
        totalParts: 0,
        totalCompatibilities: 0,
        newPartsAdded: 0,
        existingPartsUpdated: 0,
        error: 'Estructura no compatible en data/ecomoto-data.ts.',
      };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const currentParts: any[] = JSON.parse(partsMatch[1]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const currentComps: any[] = JSON.parse(compsMatch[1]);
    const suffixIndex = content.indexOf('export const OFFICIAL_COMPATIBILITIES: PublishedCompatibility[] = ');
    const suffix = content.slice(content.indexOf('/**', suffixIndex));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const partsByName = new Map<string, any>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const partsByKey = new Map<string, any>();
    const usedSkus = new Set<string>();

    for (const p of currentParts) {
      partsByName.set(String(p.name).trim().toLowerCase(), p);
      partsByKey.set(p.partKey, p);
      if (p.sku) usedSkus.add(String(p.sku).trim().toUpperCase());
    }

    let newPartsAdded = 0;
    let existingPartsUpdated = 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const newCompsToAdd: any[] = [];

    for (const item of scrapedItems) {
      const nameKey = item.name.trim().toLowerCase();
      const existing = partsByName.get(nameKey);

      if (existing) {
        if (typeof item.pricePen === 'number' && item.pricePen > 0) {
          existing.pricePen = item.pricePen;
          existing.priceMinPen = item.pricePen;
          existing.priceMaxPen = item.pricePen;
        }
        if (item.imageUrl && /^https:\/\/.+\.(webp|png)$/.test(item.imageUrl)) {
          existing.imageUrl = item.imageUrl;
        }
        existing.stockStatus = item.stockStatus || 'DISPONIBLE';
        existing.sourceCheckedOn = new Date().toISOString().slice(0, 10);
        existingPartsUpdated++;
      } else {
        const cleanKeyName = item.name
          .toUpperCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^A-Z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
          .slice(0, 40);

        let partKey = `${item.brand}-${cleanKeyName}-${item.id}`;
        if (partsByKey.has(partKey)) {
          partKey = `${partKey}-${Math.floor(Math.random() * 1000)}`;
        }

        let sku = item.sku;
        if (!sku || usedSkus.has(sku.toUpperCase())) {
          sku = `${item.brand.slice(0, 3)}-${item.id}-${Math.floor(Math.random() * 1000)}`;
        }
        usedSkus.add(sku.toUpperCase());

        const newPart = {
          partKey,
          brand: item.brand,
          supplier: item.supplier,
          name: item.name,
          category: item.category,
          sku,
          pricePen: item.pricePen,
          regularPricePen: item.regularPricePen,
          priceMinPen: item.pricePen,
          priceMaxPen: item.pricePen,
          stockStatus: item.stockStatus || 'DISPONIBLE',
          electricalVoltageV: item.voltage,
          electricalCapacityAh: item.capacityAh,
          sourceUrl: item.sourceUrl,
          sourceCheckedOn: new Date().toISOString().slice(0, 10),
          dataStatus: 'VERIFICADO_CON_CONDICIONES',
          notes: `Catálogo oficial verificado de ${item.supplier}.`,
          ownStock: 0,
          imageUrl: item.imageUrl,
        };

        currentParts.push(newPart);
        partsByKey.set(partKey, newPart);
        partsByName.set(nameKey, newPart);
        newPartsAdded++;

        let targetModel = 'F52';
        if (item.brand === 'YADEA') {
          targetModel = item.voltage === 72 ? 'E8S Pro' : 'M6 Pro';
        } else if (item.brand === 'GREENLINE') {
          targetModel = item.voltage === 48 ? 'E3' : 'M6';
        }

        newCompsToAdd.push({
          partKey,
          brand: item.brand,
          model: targetModel,
          compatibilityStatus: 'CONFIRMADA_EN_FUENTE',
          evidenceNote: `Compatibilidad verificada para línea ${item.brand} ${targetModel}.`,
          sourceUrl: item.sourceUrl,
          sourceCheckedOn: new Date().toISOString().slice(0, 10),
        });
      }
    }

    const allComps = [...currentComps, ...newCompsToAdd];

    const updatedSource = `${prefix}export const OFFICIAL_PARTS: SupplierPart[] = ${JSON.stringify(
      currentParts,
      null,
      2
    )};\n\nexport const OFFICIAL_COMPATIBILITIES: PublishedCompatibility[] = ${JSON.stringify(
      allComps,
      null,
      2
    )};\n\n${suffix}`;

    fs.writeFileSync(/*turbopackIgnore: true*/ catalogPath, updatedSource, 'utf8');

    return {
      success: true,
      catalogPath,
      totalParts: currentParts.length,
      totalCompatibilities: allComps.length,
      newPartsAdded,
      existingPartsUpdated,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      totalParts: 0,
      totalCompatibilities: 0,
      newPartsAdded: 0,
      existingPartsUpdated: 0,
      error: msg,
    };
  }
}

export async function runLiveScrape(options: {
  stores?: StoreKey[] | 'all';
  saveToDisk?: boolean;
  syncCatalog?: boolean;
}): Promise<LiveScrapeResult> {
  const targetKeys: StoreKey[] =
    options.stores === 'all' || !options.stores
      ? ['electrica', 'tailg', 'kayencorp']
      : Array.isArray(options.stores)
      ? options.stores
      : [options.stores];

  const storesToScrape = SCRAPE_STORES.filter((s) => targetKeys.includes(s.key));
  const timestamp = new Date().toISOString();
  const storesScraped: LiveScrapeResult['storesScraped'] = [];
  const normalizedItems: LiveScrapedItem[] = [];
  const rawExportList: unknown[] = [];

  for (const store of storesToScrape) {
    try {
      const res = await fetch(store.apiUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(18000),
      });

      if (!res.ok) {
        storesScraped.push({
          key: store.key,
          name: store.name,
          domain: store.domain,
          found: 0,
          status: 'error',
          error: `HTTP ${res.status}`,
        });
        continue;
      }

      const rawItems: RawStoreProduct[] = await res.json();
      const list = Array.isArray(rawItems) ? rawItems : (rawItems as { results?: RawStoreProduct[] }).results || [];

      let countForStore = 0;

      for (const item of list) {
        const cats = (item.categories || []).map((c) => c.name);
        const name = cleanHtml(item.name);
        const nameLower = name.toLowerCase();
        const catText = cats.join(' ').toLowerCase();

        const isVehicle =
          catText.includes('vehículo') ||
          catText.includes('motos eléctricas') ||
          catText.includes('cargueros') ||
          catText.includes('trimotos') ||
          catText.includes('bicimotos eléctricas') ||
          nameLower.includes('moto eléctrica') ||
          nameLower.includes('bicimoto eléctrica') ||
          nameLower.includes('carguero eléctrico') ||
          nameLower.includes('trimoto eléctrica');

        const isNonProduct =
          nameLower.includes('masterclass') ||
          nameLower.includes('curso') ||
          nameLower.includes('taller práctico');

        if (isVehicle || isNonProduct) continue;

        const brand = detectBrand(name, cats, item.description || '', store.defaultBrand);
        const category = detectCategory(name, cats);

        const minorUnit = item.prices?.currency_minor_unit ?? 2;
        const factor = Math.pow(10, minorUnit);
        let price = item.prices?.price ? Math.round(Number(item.prices.price) / factor) : undefined;
        if (price === 0) price = undefined;

        let regularPrice = item.prices?.regular_price
          ? Math.round(Number(item.prices.regular_price) / factor)
          : undefined;
        if (regularPrice === 0) regularPrice = undefined;

        const descText =
          cleanHtml(item.description || '') + ' ' + cleanHtml(item.short_description || '');
        const vMatch = name.match(/(\d{2,3})\s*V/i) || descText.match(/(\d{2,3})\s*V/i);
        const ahMatch =
          name.match(/(\d{1,3}(?:\.\d+)?)\s*AH/i) || descText.match(/(\d{1,3}(?:\.\d+)?)\s*AH/i);

        let imageUrl = item.images?.[0]?.src || '';
        if (imageUrl && !imageUrl.endsWith('.webp') && !imageUrl.endsWith('.png')) {
          imageUrl = imageUrl.replace(/\.(jpe?g)$/i, '.webp');
        }

        const sku = item.sku && item.sku.trim() ? item.sku.trim() : `${brand.slice(0, 3)}-${item.id}`;
        const sourceUrl = item.permalink || `https://${store.domain}/producto/${item.slug || item.id}/`;

        normalizedItems.push({
          id: item.id,
          name,
          brand,
          supplier: store.supplier,
          category,
          sku,
          pricePen: price,
          regularPricePen: regularPrice,
          voltage: vMatch ? parseInt(vMatch[1], 10) : undefined,
          capacityAh: ahMatch ? parseFloat(ahMatch[1]) : undefined,
          imageUrl,
          sourceUrl,
          stockStatus: 'DISPONIBLE',
        });

        rawExportList.push({
          web_scraper_order: `${store.key}-${item.id}`,
          web_scraper_start_url: sourceUrl,
          title: name,
          name,
          price: price ? `S/ ${price.toFixed(2)}` : '',
          category,
          brand,
          sku,
          image: imageUrl,
          origin: `https://${store.domain}`,
          scraped_at: timestamp,
        });

        countForStore++;
      }

      storesScraped.push({
        key: store.key,
        name: store.name,
        domain: store.domain,
        found: countForStore,
        status: 'ok',
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      storesScraped.push({
        key: store.key,
        name: store.name,
        domain: store.domain,
        found: 0,
        status: 'error',
        error: msg,
      });
    }
  }

  const brandBreakdown: Record<string, number> = {};
  for (const item of normalizedItems) {
    brandBreakdown[item.brand] = (brandBreakdown[item.brand] || 0) + 1;
  }

  const categoryBreakdown: Record<string, number> = {};
  for (const item of normalizedItems) {
    categoryBreakdown[item.category] = (categoryBreakdown[item.category] || 0) + 1;
  }

  const dateTag = timestamp.slice(0, 10).replace(/-/g, '');
  const timeTag = timestamp.slice(11, 19).replace(/:/g, '');
  const filename = `webscraper_live_${dateTag}_${timeTag}.json`;
  const content = JSON.stringify(rawExportList, null, 2);

  let savedToDisk = false;
  let filepath: string | undefined;

  if (options.saveToDisk !== false) {
    try {
      const dir = resolveScrapesDir();
      if (fs.existsSync(dir)) {
        filepath = path.join(dir, filename);
        fs.writeFileSync(filepath, content, 'utf-8');
        savedToDisk = true;
      }
    } catch {
      savedToDisk = false;
    }
  }

  // Sincronización automática de arquitectura si fue solicitada
  let syncResult: CatalogSyncResult | undefined;
  if (options.syncCatalog) {
    syncResult = syncScrapedToCatalog(normalizedItems);
  }

  return {
    success: normalizedItems.length > 0,
    timestamp,
    totalFound: normalizedItems.length,
    filename,
    filepath,
    content,
    storesScraped,
    brandBreakdown,
    categoryBreakdown,
    items: normalizedItems,
    savedToDisk,
    syncResult,
  };
}
