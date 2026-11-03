/**
 * MOTOSERVICE — Servicio Transaccional de Reclasificación de Catálogo
 * Permite mover productos entre Modelos EV, Repuestos y Fuera de Catálogo Comercial.
 */

import fs from 'fs';
import path from 'path';
import {
  CATALOG_DESTINATIONS,
  inferVehicleDataFromPart,
  validateReclassification,
  generateVehicleSlug,
} from './reclassify-core.mjs';

export {
  CATALOG_DESTINATIONS,
  inferVehicleDataFromPart,
  validateReclassification,
  generateVehicleSlug,
};

export interface ReclassifyOptions {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase?: any;
  sourceEntity: 'repuestos' | 'modelos_moto';
  sourceId: number | string;
  targetList: 'modelos_ev' | 'repuestos' | 'fuera_catalogo';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sourceItem?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any;
  adminUser?: string;
  syncDataFile?: boolean;
}

export interface ReclassifyResult {
  success: boolean;
  message: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  targetModel?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  targetPart?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  originalRecord?: any;
  error?: string;
}

/**
 * Sincroniza la reclasificación en el archivo público data/ecomoto-data.ts si existe.
 */
export function syncDataFileReclassification({
  sku,
  partKey,
  targetList,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  modelData,
}: {
  sku?: string;
  partKey?: string;
  targetList: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  modelData?: any;
}): boolean {
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
    if (!catalogPath) return false;

    const content = fs.readFileSync(/*turbopackIgnore: true*/ catalogPath, 'utf8');

    const mMatch = content.match(
      /export const OFFICIAL_MOTOS: MotoModel\[\] = (\[[\s\S]*?\]);\n\nexport const OFFICIAL_PARTS/
    );
    const pMatch = content.match(
      /export const OFFICIAL_PARTS: SupplierPart\[\] = (\[[\s\S]*?\]);\n\nexport const OFFICIAL_COMPATIBILITIES/
    );

    if (!mMatch || !pMatch) return false;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const motos: any[] = JSON.parse(mMatch[1]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parts: any[] = JSON.parse(pMatch[1]);

    let modified = false;

    // 1. Encontrar el repuesto por SKU o partKey
    const targetPart = parts.find(
      (p) =>
        (sku && String(p.sku).toUpperCase() === String(sku).toUpperCase()) ||
        (partKey && String(p.partKey).toUpperCase() === String(partKey).toUpperCase())
    );

    if (targetPart) {
      if (targetList === CATALOG_DESTINATIONS.MODELOS_EV || targetList === CATALOG_DESTINATIONS.FUERA_CATALOGO) {
        targetPart.dataStatus = 'ARCHIVADO';
        targetPart.notes =
          targetList === CATALOG_DESTINATIONS.MODELOS_EV
            ? `[RECLASIFICADO A MODELO EV ${new Date().toISOString().split('T')[0]}]`
            : `[EXCLUIDO DEL CATÁLOGO COMERCIAL ${new Date().toISOString().split('T')[0]}]`;
        modified = true;
      }
    }

    // 2. Si el destino es modelos_ev, añadir a OFFICIAL_MOTOS si no existe ya
    if (targetList === CATALOG_DESTINATIONS.MODELOS_EV && modelData) {
      const slug = modelData.slug || generateVehicleSlug(modelData.brandName, modelData.nombre);
      const exists = motos.some(
        (m) =>
          m.slug === slug ||
          (String(m.brand).toUpperCase() === String(modelData.brandName || '').toUpperCase() &&
            String(m.model).toLowerCase() === String(modelData.nombre || '').toLowerCase())
      );

      if (!exists) {
        motos.push({
          brand: modelData.brandName || 'CENTURY MOTORS',
          model: modelData.nombre,
          slug,
          vehicleType: modelData.vehicleType || 'MOTO_ELECTRICA',
          pricePen: modelData.precio || (targetPart ? targetPart.pricePen : 0),
          regularPricePen: targetPart?.regularPricePen || (modelData.precio ? Math.round(modelData.precio * 1.1) : 0),
          priceMinPen: modelData.precio || (targetPart ? targetPart.priceMinPen : 0),
          priceMaxPen: modelData.precio || (targetPart ? targetPart.priceMaxPen : 0),
          motorNominalW: modelData.potencia_motor_w || (targetPart ? targetPart.powerW : 1000) || 1000,
          batteryChemistry: 'PLOMO_GRAFENO',
          batteryVoltageV: modelData.voltaje_nominal_v || (targetPart ? targetPart.electricalVoltageV : 60) || 60,
          batteryCapacityAh: targetPart?.electricalCapacityAh || 20,
          batteryRemovable: 'NO_DECLARADO',
          listingStatus: 'CATALOGO',
          dataStatus: 'VERIFICADO_EN_FUENTE',
          sourceUrl: targetPart?.sourceUrl || 'https://centurymotors.pe',
          sourceCheckedOn: new Date().toISOString().split('T')[0],
          notes: `Reclasificado desde repuestos (SKU: ${sku || targetPart?.sku || 'N/A'})`,
          imageUrl: modelData.imagen_url || targetPart?.imageUrl || '/branding/nero-electric-motors-optimized.png',
        });
        modified = true;
      }
    }

    if (modified) {
      const prefixMotos = content.slice(0, content.indexOf(mMatch[1]));
      const betweenMotosParts = content.slice(
        content.indexOf(mMatch[1]) + mMatch[1].length,
        content.indexOf(pMatch[1])
      );
      const afterParts = content.slice(content.indexOf(pMatch[1]) + pMatch[1].length);

      const newContent = `${prefixMotos}${JSON.stringify(motos, null, 2)}${betweenMotosParts}${JSON.stringify(
        parts,
        null,
        2
      )}${afterParts}`;
      fs.writeFileSync(/*turbopackIgnore: true*/ catalogPath, newContent, 'utf8');
      return true;
    }
  } catch (err) {
    console.warn('Advertencia actualizando data/ecomoto-data.ts durante reclasificación:', err);
  }
  return false;
}

/**
 * Ejecuta la reclasificación completa de un ítem con validaciones, prevención de duplicados,
 * trazabilidad de identificadores y compensación en caso de fallo.
 */
export async function executeReclassify(options: ReclassifyOptions): Promise<ReclassifyResult> {
  const {
    supabase,
    sourceEntity,
    sourceId,
    targetList,
    sourceItem,
    payload = {},
    adminUser = 'Operador Administrador',
    syncDataFile = true,
  } = options;

  const todayStr = new Date().toISOString().split('T')[0];

  // 1. Obtener el ítem origen
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let currentRecord: any = sourceItem;

  if (!currentRecord && supabase) {
    const table = sourceEntity === 'repuestos' ? 'repuestos' : 'modelos_moto';
    const idCol = sourceEntity === 'repuestos' ? 'id_repuesto' : 'id_modelo';
    const { data, error } = await supabase.from(table).select('*').eq(idCol, sourceId).maybeSingle();
    if (error || !data) {
      return {
        success: false,
        message: 'No se encontró el registro original a reclasificar.',
        error: error?.message || 'Registro no encontrado en base de datos.',
      };
    }
    currentRecord = data;
  }

  // 2. Validación de la operación
  const validation = validateReclassification({
    sourceEntity,
    targetList,
    sourceItem: currentRecord,
    payload,
  });

  if (!validation.valid || !validation.sanitizedData) {
    return {
      success: false,
      message: validation.error || 'Validación de reclasificación fallida.',
      error: validation.error,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sanitized: any = validation.sanitizedData;

  // 3. Caso A: De Repuestos a Modelos EV
  if (sourceEntity === 'repuestos' && targetList === CATALOG_DESTINATIONS.MODELOS_EV) {
    if (supabase) {
      // a) Comprobar duplicados en Modelos EV
      let brandId = sanitized.id_marca;
      if (!brandId && sanitized.brandName) {
        const { data: bData } = await supabase
          .from('marcas')
          .select('id_marca')
          .ilike('nombre', sanitized.brandName.trim())
          .maybeSingle();
        if (bData) brandId = bData.id_marca;
      }
      if (!brandId) brandId = currentRecord?.id_marca || 1;

      const { data: existingModel } = await supabase
        .from('modelos_moto')
        .select('id_modelo, nombre, estado, listing_status')
        .eq('id_marca', brandId)
        .ilike('nombre', sanitized.nombre.trim())
        .maybeSingle();

      if (existingModel) {
        return {
          success: false,
          message: `El modelo «${sanitized.nombre}» ya existe registrado en la marca seleccionada dentro de Modelos EV. Para evitar duplicados, no se insertó nuevamente.`,
          error: 'MODELO_DUPLICADO',
        };
      }

      // b) Insertar en modelos_moto
      const { data: newModel, error: insertError } = await supabase
        .from('modelos_moto')
        .insert({
          id_marca: brandId,
          nombre: sanitized.nombre.trim(),
          slug: sanitized.slug,
          vehicle_type: sanitized.vehicleType,
          voltaje_nominal_v: sanitized.voltaje_nominal_v,
          potencia_motor_w: sanitized.potencia_motor_w,
          precio_referencial_pen: sanitized.precio,
          imagen_url: sanitized.imagen_url,
          estado: true,
          listing_status: 'CATALOGO',
          data_status: 'VERIFICADO_EN_FUENTE',
          notas: `[RECLASIFICADO DESDE REPUESTOS ${todayStr} por ${adminUser}] SKU original: ${currentRecord.codigo_sku || sanitized.originalSku}.`,
        })
        .select('*')
        .single();

      if (insertError) {
        return {
          success: false,
          message: `Error al crear el modelo en Modelos EV: ${insertError.message}`,
          error: insertError.message,
        };
      }

      // c) Actualizar repuestos original (desactivar y archivar para conservar trazabilidad de pedidos)
      const { error: updatePartError } = await supabase
        .from('repuestos')
        .update({
          estado: false,
          data_status: 'ARCHIVADO',
          notas: `[RECLASIFICADO A MODELOS EV ${todayStr} por ${adminUser}] Trasladado a catálogo de vehículos como «${sanitized.nombre}» (Modelo #${newModel.id_modelo}).`,
        })
        .eq('id_repuesto', currentRecord.id_repuesto || sourceId);

      if (updatePartError) {
        // Compensación transaccional: revertir inserción en modelos_moto
        await supabase.from('modelos_moto').delete().eq('id_modelo', newModel.id_modelo);
        return {
          success: false,
          message: `Fallo al archivar el repuesto original (${updatePartError.message}). Operación revertida por seguridad comercial.`,
          error: updatePartError.message,
        };
      }

      // d) Sincronizar archivo local si aplica
      if (syncDataFile) {
        syncDataFileReclassification({
          sku: currentRecord.codigo_sku || sanitized.originalSku,
          partKey: currentRecord.part_key,
          targetList: CATALOG_DESTINATIONS.MODELOS_EV,
          modelData: {
            ...sanitized,
            id_marca: brandId,
          },
        });
      }

      return {
        success: true,
        message: `El producto «${sanitized.nombre}» (SKU ${currentRecord.codigo_sku || sanitized.originalSku}) fue reclasificado exitosamente a Modelos EV.`,
        targetModel: newModel,
        originalRecord: currentRecord,
      };
    } else {
      // Modo sin conexión directa a Supabase (offline / filesystem sync)
      if (syncDataFile) {
        syncDataFileReclassification({
          sku: currentRecord?.codigo_sku || sanitized.originalSku,
          partKey: currentRecord?.partKey || currentRecord?.part_key,
          targetList: CATALOG_DESTINATIONS.MODELOS_EV,
          modelData: sanitized,
        });
      }
      return {
        success: true,
        message: `El producto «${sanitized.nombre}» fue reclasificado exitosamente a Modelos EV en la arquitectura de catálogo.`,
        targetModel: sanitized,
        originalRecord: currentRecord,
      };
    }
  }

  // 4. Caso B: A Fuera de Catálogo Comercial (Otros productos / Juguetes)
  if (targetList === CATALOG_DESTINATIONS.FUERA_CATALOGO) {
    const reasonText = sanitized.reason || 'Artículo fuera de catálogo comercial NERO';

    if (supabase) {
      const table = sourceEntity === 'repuestos' ? 'repuestos' : 'modelos_moto';
      const idCol = sourceEntity === 'repuestos' ? 'id_repuesto' : 'id_modelo';

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updatePayload: Record<string, any> = {
        estado: false,
        data_status: 'ARCHIVADO',
        notas: `[EXCLUIDO DEL CATÁLOGO COMERCIAL ${todayStr} por ${adminUser}] ${reasonText}.`,
      };

      if (sourceEntity === 'modelos_moto') {
        updatePayload.listing_status = 'ARCHIVADO';
      }

      const { error: updateErr } = await supabase
        .from(table)
        .update(updatePayload)
        .eq(idCol, sourceId);

      if (updateErr) {
        return {
          success: false,
          message: `Error al excluir el producto: ${updateErr.message}`,
          error: updateErr.message,
        };
      }
    }

    if (syncDataFile) {
      syncDataFileReclassification({
        sku: currentRecord?.codigo_sku || currentRecord?.sku,
        partKey: currentRecord?.part_key || currentRecord?.partKey,
        targetList: CATALOG_DESTINATIONS.FUERA_CATALOGO,
      });
    }

    return {
      success: true,
      message: `El registro «${currentRecord?.nombre || currentRecord?.name}» fue excluido del catálogo comercial y archivado, conservando sus datos y trazabilidad histórica.`,
      originalRecord: currentRecord,
    };
  }

  // 5. Caso C: De Modelos EV a Repuestos
  if (sourceEntity === 'modelos_moto' && targetList === CATALOG_DESTINATIONS.REPUESTOS) {
    if (supabase) {
      // Comprobar SKU duplicado
      const sku = sanitized.codigo_sku;
      const { data: existingPart } = await supabase
        .from('repuestos')
        .select('id_repuesto, codigo_sku')
        .eq('codigo_sku', sku)
        .maybeSingle();

      if (existingPart) {
        return {
          success: false,
          message: `Ya existe un repuesto con el SKU «${sku}» en la lista de Repuestos.`,
          error: 'SKU_DUPLICADO',
        };
      }

      const { data: newPart, error: insPartErr } = await supabase
        .from('repuestos')
        .insert({
          id_categoria: sanitized.id_categoria || 1,
          codigo_sku: sku,
          nombre: sanitized.nombre,
          precio: sanitized.precio,
          moneda: 'PEN',
          imagen_url: sanitized.imagen_url,
          estado: true,
          data_status: 'ACTIVO',
          notas: `[RECLASIFICADO DESDE MODELOS EV ${todayStr} por ${adminUser}] Modelo ID #${sourceId}.`,
        })
        .select('*')
        .single();

      if (insPartErr) {
        return {
          success: false,
          message: `Error al crear repuesto: ${insPartErr.message}`,
          error: insPartErr.message,
        };
      }

      const { error: updModelErr } = await supabase
        .from('modelos_moto')
        .update({
          estado: false,
          listing_status: 'ARCHIVADO',
          notas: `[RECLASIFICADO A REPUESTOS ${todayStr} por ${adminUser}] Trasladado a repuestos como «${sanitized.nombre}» (SKU ${sku}).`,
        })
        .eq('id_modelo', sourceId);

      if (updModelErr) {
        await supabase.from('repuestos').delete().eq('id_repuesto', newPart.id_repuesto);
        return {
          success: false,
          message: `Fallo al actualizar el modelo original (${updModelErr.message}). Operación revertida por seguridad.`,
          error: updModelErr.message,
        };
      }

      return {
        success: true,
        message: `El registro «${sanitized.nombre}» fue reclasificado a la lista de Repuestos con SKU «${sku}».`,
        targetPart: newPart,
        originalRecord: currentRecord,
      };
    }
  }

  return {
    success: false,
    message: 'Flujo de reclasificación no implementado para esta combinación.',
    error: 'FLUJO_NO_SOPORTADO',
  };
}
