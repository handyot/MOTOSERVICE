/**
 * MOTOSERVICE ADMIN PANEL — Servicio Central de Importación de Catálogos (CSV / JSON)
 *
 * Soporta:
 * 1. Subida directa de archivos CSV/JSON desde el navegador (compatible con Vercel remoto).
 * 2. Escaneo de carpeta local 'JSON DEL SCRAPS' cuando está disponible en entorno local.
 * 3. Persistencia idempotente en marcas, modelos_moto y repuestos + auditoría en catalogo_importaciones.
 */

import fs from 'fs';
import path from 'path';
import type { EcoMotoBrand } from '@/types';
import type {
  ScrapedFileDescriptor,
  ImportPreviewResult,
  ImportExecutionResult,
} from './types';
import {
  discoverScrapedFiles as coreDiscoverFiles,
  generateImportPreview as coreGeneratePreview,
} from './importer-core.mjs';
import { createClient, createCatalogWriteClient } from '../supabase/server';

export function resolveScrapesDir(): string {
  const candidates = [
    path.resolve(process.cwd(), 'JSON DEL SCRAPS'),
    path.resolve(process.cwd(), '..', 'JSON DEL SCRAPS'),
  ];
  for (const dir of candidates) {
    if (fs.existsSync(/*turbopackIgnore: true*/ dir)) {
      return dir;
    }
  }
  return candidates[0];
}

export function discoverScrapedFiles(targetDir?: string): ScrapedFileDescriptor[] {
  const resolved = targetDir || resolveScrapesDir();
  return coreDiscoverFiles(resolved) as ScrapedFileDescriptor[];
}

export async function generateImportPreview(
  files: Array<{ filename: string; content?: string; filepath?: string; brandOverride?: EcoMotoBrand }>
): Promise<ImportPreviewResult> {
  return coreGeneratePreview(files) as unknown as ImportPreviewResult;
}

export async function executeCatalogImport(
  preview: ImportPreviewResult,
  options: { dryRun?: boolean; adminEmail?: string } = {}
): Promise<ImportExecutionResult> {
  const isDryRun = Boolean(options.dryRun);
  const timestamp = new Date().toISOString();

  if (isDryRun) {
    return {
      success: true,
      dryRun: true,
      timestamp,
      preview,
      insertedCount: preview.validProducts,
      updatedCount: 0,
      skippedCount: 0,
      errorCount: 0,
      errors: [],
    };
  }

  let insertedCount = 0;
  const updatedCount = 0;
  let skippedCount = 0;
  const errors: string[] = [];

  try {
    const supabase = await createCatalogWriteClient();
    const sessionClient = await createClient();

    // 1. Obtener marcas existentes (normalizadas con UPPER(TRIM(...)))
    const { data: existingMarcas, error: marcasError } = await supabase
      .from('marcas')
      .select('id_marca, nombre');

    if (marcasError) {
      throw new Error(`Error al consultar marcas en Supabase: ${marcasError.message}`);
    }

    const brandMap = new Map<string, number>();
    for (const m of existingMarcas || []) {
      brandMap.set(String(m.nombre).trim().toUpperCase(), m.id_marca);
    }

    // 2. Obtener categorías existentes
    const { data: existingCategorias, error: catError } = await supabase
      .from('categorias')
      .select('id_categoria, nombre');

    if (catError) {
      throw new Error(`Error al consultar categorias en Supabase: ${catError.message}`);
    }

    const catMap = new Map<string, number>();
    for (const c of existingCategorias || []) {
      catMap.set(String(c.nombre).trim().toLowerCase(), c.id_categoria);
    }

    const defaultCatId =
      existingCategorias && existingCategorias.length > 0
        ? existingCategorias[0].id_categoria
        : 1;

    // 3. Obtener repuestos existentes (evitar duplicados)
    const { data: existingParts } = await supabase
      .from('repuestos')
      .select('id_repuesto, codigo_sku, nombre');

    const existingSkuSet = new Set<string>();
    for (const p of existingParts || []) {
      if (p.codigo_sku) existingSkuSet.add(String(p.codigo_sku).trim().toUpperCase());
    }

    // 4. Obtener modelos existentes
    const { data: existingModels } = await supabase
      .from('modelos_moto')
      .select('id_modelo, id_marca, nombre');

    const existingModelSet = new Set<string>();
    for (const m of existingModels || []) {
      existingModelSet.add(`${m.id_marca}:${String(m.nombre).trim().toUpperCase()}`);
    }

    // 5. Aplicar operaciones de base de datos
    for (const op of preview.proposedOperations) {
      try {
        const d = op.data as Record<string, unknown>;
        const marcaStr = String(d.marca || '').trim();
        const nombreStr = String(d.nombre || '').trim();
        const skuStr = d.codigo_sku ? String(d.codigo_sku).trim() : null;
        const catStr = String(d.categoria || '').trim();

        if (op.entity === 'modelos_moto') {
          const brandId = brandMap.get(marcaStr.toUpperCase()) || 1;
          const modelKey = `${brandId}:${nombreStr.toUpperCase()}`;

          if (existingModelSet.has(modelKey)) {
            skippedCount++;
            continue;
          }

          const { error: insErr } = await supabase.from('modelos_moto').insert({
            id_marca: brandId,
            nombre: nombreStr,
            voltaje_nominal_v: typeof d.voltaje_nominal_v === 'number' ? d.voltaje_nominal_v : null,
            potencia_motor_w: typeof d.potencia_motor_w === 'number' ? d.potencia_motor_w : null,
            estado: true,
          });

          if (insErr) {
            errors.push(`Error al insertar modelo ${nombreStr}: ${insErr.message}`);
          } else {
            insertedCount++;
            existingModelSet.add(modelKey);
          }
        } else if (op.entity === 'repuestos') {
          const skuUpper = skuStr ? skuStr.toUpperCase() : null;

          if (skuUpper && existingSkuSet.has(skuUpper)) {
            skippedCount++;
            continue;
          }

          const catId = catMap.get(catStr.toLowerCase()) || defaultCatId;

          const { error: insPartErr } = await supabase.from('repuestos').insert({
            id_categoria: catId,
            codigo_sku: skuStr || `SKU-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            nombre: nombreStr.slice(0, 150),
            descripcion: typeof d.descripcion === 'string' ? d.descripcion : null,
            precio: typeof d.precio === 'number' ? d.precio : 0,
            moneda: typeof d.moneda === 'string' ? d.moneda : 'PEN',
            imagen_url: typeof d.imagen_url === 'string' ? d.imagen_url : null,
            estado: true,
          });

          if (insPartErr) {
            errors.push(`Error al insertar repuesto ${nombreStr}: ${insPartErr.message}`);
          } else {
            insertedCount++;
            if (skuUpper) existingSkuSet.add(skuUpper);
          }
        }
      } catch (itemErr: unknown) {
        const msg = itemErr instanceof Error ? itemErr.message : 'Error al persistir registro';
        errors.push(`${op.identifier}: ${msg}`);
      }
    }

    // 6. Registrar auditoría en public.catalogo_importaciones
    try {
      await sessionClient.from('catalogo_importaciones').insert({
        modo: 'EXECUTE',
        total_archivos: preview.totalFiles ?? 0,
        total_registros_brutos: preview.totalRawRecords ?? 0,
        productos_validos: preview.validProducts ?? 0,
        motos_procesadas: preview.vehiclesCount ?? 0,
        repuestos_procesados: preview.partsCount ?? 0,
        duplicados_fusionados: preview.duplicatesIdentified ?? 0,
        conflictos_detectados: Array.isArray(preview.conflicts) ? preview.conflicts.length : 0,
        registros_omitidos: skippedCount,
        marcas_involucradas: preview.productsByBrand ?? {},
        archivos_procesados: (preview.filesProcessed || []).map((f) => f.filename),
        detalles_operaciones: {
          insertedCount,
          skippedCount,
          errorCount: errors.length,
        },
        admin_email: options.adminEmail || null,
      });
    } catch {
      // No interrumpir si falla el log secundario
    }

    return {
      success: errors.length === 0,
      dryRun: false,
      timestamp,
      preview,
      insertedCount,
      updatedCount,
      skippedCount,
      errorCount: errors.length,
      errors,
    };
  } catch (globalErr: unknown) {
    const msg = globalErr instanceof Error ? globalErr.message : 'Error general en persistencia';
    return {
      success: false,
      dryRun: false,
      timestamp,
      preview,
      insertedCount,
      updatedCount,
      skippedCount,
      errorCount: 1,
      errors: [msg],
    };
  }
}
