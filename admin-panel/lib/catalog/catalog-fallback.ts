import fs from 'fs';
import path from 'path';
import type {
  AdminBrandRecord,
  AdminModelRecord,
  AdminPartRecord,
  AdminCompatibilityRecord,
} from '../../components/admin/AdminDashboardView';

export interface CatalogMasterData {
  brands: AdminBrandRecord[];
  models: AdminModelRecord[];
  parts: AdminPartRecord[];
  compatibilities: AdminCompatibilityRecord[];
  stats: {
    totalMarcas: number;
    totalModelos: number;
    totalRepuestos: number;
    totalCompatibilidades: number;
  };
}

export function getCatalogMasterData(): CatalogMasterData | null {
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

    if (!catalogPath) return null;

    const content = fs.readFileSync(/*turbopackIgnore: true*/ catalogPath, 'utf8');

    const bMatch = content.match(
      /export const OFFICIAL_BRANDS: OfficialBrand\[\] = (\[[\s\S]*?\]);\n\nexport const OFFICIAL_SUPPLIERS/
    );
    const mMatch = content.match(
      /export const OFFICIAL_MOTOS: MotoModel\[\] = (\[[\s\S]*?\]);\n\nexport const OFFICIAL_PARTS/
    );
    const pMatch = content.match(
      /export const OFFICIAL_PARTS: SupplierPart\[\] = (\[[\s\S]*?\]);\n\nexport const OFFICIAL_COMPATIBILITIES/
    );
    const cMatch = content.match(
      /export const OFFICIAL_COMPATIBILITIES: PublishedCompatibility\[\] = (\[[\s\S]*?\]);\n\n\/\*\*/
    );

    if (!bMatch || !mMatch || !pMatch || !cMatch) {
      return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawBrands: any[] = new Function(`return ${bMatch[1]}`)();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawMotos: any[] = JSON.parse(mMatch[1]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawParts: any[] = JSON.parse(pMatch[1]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawComps: any[] = JSON.parse(cMatch[1]);

    const brandMap = new Map<string, number>();
    const brands: AdminBrandRecord[] = rawBrands.map((b, idx) => {
      const id = idx + 1;
      brandMap.set(String(b.name).toUpperCase().trim(), id);
      return {
        id_marca: id,
        nombre: String(b.name).trim(),
        pais_origen: 'Perú / Importada',
        estado: true,
      };
    });

    const modelMap = new Map<string, number>();
    const models: AdminModelRecord[] = rawMotos.map((m, idx) => {
      const id = idx + 1;
      const brandId = brandMap.get(String(m.brand).toUpperCase().trim()) || 1;
      const key = `${brandId}:::${String(m.model).toLowerCase().trim()}`;
      modelMap.set(key, id);
      return {
        id_modelo: id,
        id_marca: brandId,
        nombre: String(m.model).trim(),
        voltaje_nominal_v: m.batteryVoltageV || null,
        potencia_motor_w: m.motorNominalW || null,
        imagen_url: m.imageUrl || null,
        estado: true,
      };
    });

    const partMap = new Map<string, number>();
    const parts: AdminPartRecord[] = rawParts.map((p, idx) => {
      const id = idx + 1;
      partMap.set(String(p.partKey).trim(), id);
      return {
        id_repuesto: id,
        id_categoria: 1,
        codigo_sku: String(p.sku || `SKU-${id}`).trim(),
        nombre: String(p.name).trim(),
        precio: typeof p.pricePen === 'number' ? p.pricePen : 0,
        moneda: 'PEN',
        imagen_url: p.imageUrl || null,
        estado: true,
      };
    });

    const compatibilities: AdminCompatibilityRecord[] = rawComps.map((c, idx) => {
      const id = idx + 1;
      const partId = partMap.get(String(c.partKey).trim()) || 1;
      const brandId = brandMap.get(String(c.brand).toUpperCase().trim()) || 1;
      const modelId = modelMap.get(`${brandId}:::${String(c.model).toLowerCase().trim()}`) || 1;

      return {
        id_compatibilidad: id,
        id_repuesto: partId,
        id_modelo: modelId,
        es_compatible: true,
        nivel_verificacion: c.compatibilityStatus || 'CONFIRMADA_EN_FUENTE',
        notas_tecnicas: c.evidenceNote || null,
      };
    });

    return {
      brands,
      models,
      parts,
      compatibilities,
      stats: {
        totalMarcas: brands.length,
        totalModelos: models.length,
        totalRepuestos: parts.length,
        totalCompatibilidades: compatibilities.length,
      },
    };
  } catch {
    return null;
  }
}

export interface MergedCatalogResult {
  brands: AdminBrandRecord[];
  models: AdminModelRecord[];
  parts: AdminPartRecord[];
  compatibilities: AdminCompatibilityRecord[];
  stats: {
    totalMarcas: number;
    totalModelos: number;
    totalRepuestos: number;
    totalCompatibilidades: number;
  };
}

export function mergeCatalogWithMaster(
  dbBrands: AdminBrandRecord[] | null | undefined,
  dbModels: AdminModelRecord[] | null | undefined,
  dbParts: AdminPartRecord[] | null | undefined,
  dbCompatibilities: AdminCompatibilityRecord[] | null | undefined,
  rawCounts?: {
    marcas?: number | null;
    modelos?: number | null;
    repuestos?: number | null;
    compat?: number | null;
  }
): MergedCatalogResult {
  const masterData = getCatalogMasterData();

  // 1. Marcas
  const mergedBrands: AdminBrandRecord[] = [...(dbBrands || [])];
  const brandNameSet = new Set(mergedBrands.map((b) => b.nombre.trim().toUpperCase()));
  const brandIdMap = new Map<string, number>();
  let nextBrandId = mergedBrands.reduce((max, b) => Math.max(max, b.id_marca), 0) + 1;
  mergedBrands.forEach((b) => brandIdMap.set(b.nombre.trim().toUpperCase(), b.id_marca));

  if (masterData) {
    for (const mb of masterData.brands) {
      const upper = mb.nombre.trim().toUpperCase();
      if (!brandNameSet.has(upper)) {
        const newRecord: AdminBrandRecord = {
          ...mb,
          id_marca: nextBrandId++,
        };
        mergedBrands.push(newRecord);
        brandNameSet.add(upper);
        brandIdMap.set(upper, newRecord.id_marca);
      }
    }
  }

  // 2. Modelos
  const mergedModels: AdminModelRecord[] = [...(dbModels || [])];
  const modelKeySet = new Set(
    mergedModels.map((m) => `${m.id_marca}:::${m.nombre.trim().toLowerCase()}`)
  );
  let nextModelId = mergedModels.reduce((max, m) => Math.max(max, m.id_modelo), 0) + 1;

  if (masterData) {
    for (const mm of masterData.models) {
      const masterBrand = masterData.brands.find((b) => b.id_marca === mm.id_marca);
      const targetBrandId = masterBrand
        ? (brandIdMap.get(masterBrand.nombre.trim().toUpperCase()) || mm.id_marca)
        : mm.id_marca;
      const key = `${targetBrandId}:::${mm.nombre.trim().toLowerCase()}`;

      if (!modelKeySet.has(key)) {
        mergedModels.push({
          ...mm,
          id_modelo: nextModelId++,
          id_marca: targetBrandId,
        });
        modelKeySet.add(key);
      }
    }
  }

  // 3. Repuestos
  const mergedParts: AdminPartRecord[] = [...(dbParts || [])];
  const skuSet = new Set(mergedParts.map((p) => p.codigo_sku.trim().toUpperCase()));
  let nextPartId = mergedParts.reduce((max, p) => Math.max(max, p.id_repuesto), 0) + 1;

  if (masterData) {
    for (const mp of masterData.parts) {
      const skuUpper = mp.codigo_sku.trim().toUpperCase();
      if (!skuSet.has(skuUpper)) {
        mergedParts.push({
          ...mp,
          id_repuesto: nextPartId++,
        });
        skuSet.add(skuUpper);
      }
    }
  }

  // 4. Compatibilidades
  const mergedCompatibilities: AdminCompatibilityRecord[] = [...(dbCompatibilities || [])];
  if (masterData && (dbCompatibilities?.length || 0) < masterData.compatibilities.length) {
    const compKeySet = new Set(
      mergedCompatibilities.map((c) => `${c.id_repuesto}:::${c.id_modelo}`)
    );
    let nextCompId =
      mergedCompatibilities.reduce((max, c) => Math.max(max, c.id_compatibilidad), 0) + 1;

    for (const mc of masterData.compatibilities) {
      const key = `${mc.id_repuesto}:::${mc.id_modelo}`;
      if (!compKeySet.has(key)) {
        mergedCompatibilities.push({
          ...mc,
          id_compatibilidad: nextCompId++,
        });
        compKeySet.add(key);
      }
    }
  }

  return {
    brands: mergedBrands,
    models: mergedModels,
    parts: mergedParts,
    compatibilities: mergedCompatibilities,
    stats: {
      totalMarcas: Math.max(rawCounts?.marcas ?? 0, mergedBrands.length),
      totalModelos: Math.max(rawCounts?.modelos ?? 0, mergedModels.length),
      totalRepuestos: Math.max(rawCounts?.repuestos ?? 0, mergedParts.length),
      totalCompatibilidades: Math.max(rawCounts?.compat ?? 0, mergedCompatibilities.length),
    },
  };
}
