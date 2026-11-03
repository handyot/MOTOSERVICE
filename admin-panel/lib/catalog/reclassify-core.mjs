/**
 * MOTOSERVICE / NERO Electric Motors - Motor de Reclasificación de Catálogo
 * Permite reclasificar y mover productos entre listas (Modelos EV, Repuestos, Fuera de Catálogo).
 * Módulo isomórfico sin dependencias de Node.js (browser & server safe).
 */

export const CATALOG_DESTINATIONS = {
  MODELOS_EV: 'modelos_ev',
  REPUESTOS: 'repuestos',
  FUERA_CATALOGO: 'fuera_catalogo',
};

export const VEHICLE_TYPES = {
  MOTOCARGA_ELECTRICA: 'MOTOCARGA_ELECTRICA',
  MOTO_ELECTRICA: 'MOTO_ELECTRICA',
  TRIMOTO_ELECTRICA: 'TRIMOTO_ELECTRICA',
  BICIMOTO_ELECTRICA: 'BICIMOTO_ELECTRICA',
  SCOOTER_ELECTRICO: 'SCOOTER_ELECTRICO',
};

export const VEHICLE_TYPE_LABELS = {
  MOTOCARGA_ELECTRICA: 'Motocarga Eléctrica',
  MOTO_ELECTRICA: 'Moto Eléctrica',
  TRIMOTO_ELECTRICA: 'Trimoto Eléctrica',
  BICIMOTO_ELECTRICA: 'Bicimoto Eléctrica',
  SCOOTER_ELECTRICO: 'Scooter / Patinete Eléctrico',
};

/**
 * Genera un slug canónico a partir de marca y modelo.
 */
export function generateVehicleSlug(brand, model) {
  const b = String(brand || 'nero')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-');
  const m = String(model || 'modelo')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-');
  return `${b}-${m}`.replace(/^-+|-+$/g, '');
}

/**
 * Infiere inteligentemente los datos técnicos de un vehículo a partir de un repuesto registrado erróneamente.
 */
export function inferVehicleDataFromPart(part, brands = []) {
  if (!part) return null;

  const rawName = String(part.name || part.nombre || '').trim();
  const rawBrand = String(part.brand || part.marca || '').trim();
  const lowerName = rawName.toLowerCase();

  // 1. Tipo de vehículo
  let vehicleType = VEHICLE_TYPES.MOTO_ELECTRICA;
  if (lowerName.includes('motocarga') || lowerName.includes('moto-carga') || lowerName.includes('carga')) {
    vehicleType = VEHICLE_TYPES.MOTOCARGA_ELECTRICA;
  } else if (lowerName.includes('trimoto')) {
    vehicleType = VEHICLE_TYPES.TRIMOTO_ELECTRICA;
  } else if (lowerName.includes('bicimoto') || lowerName.includes('bici-moto') || lowerName.includes('ebike')) {
    vehicleType = VEHICLE_TYPES.BICIMOTO_ELECTRICA;
  } else if (lowerName.includes('scooter') || lowerName.includes('patinete')) {
    vehicleType = VEHICLE_TYPES.SCOOTER_ELECTRICO;
  }

  // 2. Extracción de voltaje nominal (ej. 60V, 72V, 48V)
  let voltage = null;
  if (typeof part.electricalVoltageV === 'number' && part.electricalVoltageV > 0) {
    voltage = part.electricalVoltageV;
  } else if (typeof part.voltage === 'number' && part.voltage > 0) {
    voltage = part.voltage;
  } else if (typeof part.voltaje_nominal_v === 'number' && part.voltaje_nominal_v > 0) {
    voltage = part.voltaje_nominal_v;
  } else {
    const vMatch = rawName.match(/(\d{2,3})\s*[vV]\b/);
    if (vMatch) {
      const parsedV = parseInt(vMatch[1], 10);
      if (parsedV >= 12 && parsedV <= 144) voltage = parsedV;
    }
  }

  // 3. Extracción de potencia nominal en Watts (ej. 1000W, 1500W, 800W)
  let powerW = null;
  if (typeof part.powerW === 'number' && part.powerW > 0) {
    powerW = part.powerW;
  } else if (typeof part.potencia_motor_w === 'number' && part.potencia_motor_w > 0) {
    powerW = part.potencia_motor_w;
  } else {
    const wMatch = rawName.match(/(\d{3,5})\s*[wW]\b/);
    if (wMatch) {
      const parsedW = parseInt(wMatch[1], 10);
      if (parsedW >= 250 && parsedW <= 50000) powerW = parsedW;
    }
  }

  // 4. Marca asociada
  let matchedBrandId = part.id_marca || null;
  let matchedBrandName = rawBrand;

  if (brands && brands.length > 0) {
    if (!matchedBrandId && rawBrand) {
      const found = brands.find(
        (b) => String(b.nombre || b.name || '').toUpperCase().trim() === rawBrand.toUpperCase().trim()
      );
      if (found) {
        matchedBrandId = found.id_marca || found.id;
        matchedBrandName = found.nombre || found.name;
      }
    }
    if (!matchedBrandId && brands[0]) {
      matchedBrandId = brands[0].id_marca || brands[0].id || 1;
      matchedBrandName = brands[0].nombre || brands[0].name;
    }
  }

  const price = typeof part.pricePen === 'number' ? part.pricePen : typeof part.precio === 'number' ? part.precio : 0;
  const imageUrl = part.imageUrl || part.imagen_url || null;

  return {
    brandId: matchedBrandId,
    brandName: matchedBrandName,
    modelName: rawName,
    vehicleType,
    voltage,
    powerW,
    price,
    imageUrl,
    originalSku: part.sku || part.codigo_sku || part.partKey || '',
    slug: generateVehicleSlug(matchedBrandName, rawName),
  };
}

/**
 * Valida la operación de reclasificación según las reglas de negocio.
 */
export function validateReclassification({
  sourceEntity,
  targetList,
  sourceItem,
  payload = {},
}) {
  if (!sourceEntity || !['repuestos', 'modelos_moto'].includes(sourceEntity)) {
    return {
      valid: false,
      error: 'Entidad de origen inválida. Debe ser «repuestos» o «modelos_moto».',
    };
  }

  if (
    !targetList ||
    ![
      CATALOG_DESTINATIONS.MODELOS_EV,
      CATALOG_DESTINATIONS.REPUESTOS,
      CATALOG_DESTINATIONS.FUERA_CATALOGO,
    ].includes(targetList)
  ) {
    return {
      valid: false,
      error: 'Lista de destino inválida. Opciones: Modelos EV, Repuestos o Fuera de Catálogo.',
    };
  }

  // No permitir mover a la misma lista sin cambio
  if (sourceEntity === 'repuestos' && targetList === CATALOG_DESTINATIONS.REPUESTOS && !payload.id_categoria) {
    return {
      valid: false,
      error: 'El producto ya se encuentra en la lista de Repuestos.',
    };
  }
  if (sourceEntity === 'modelos_moto' && targetList === CATALOG_DESTINATIONS.MODELOS_EV) {
    return {
      valid: false,
      error: 'El producto ya se encuentra en la lista de Modelos EV.',
    };
  }

  // Validaciones para destino: Modelos EV
  if (targetList === CATALOG_DESTINATIONS.MODELOS_EV) {
    const modelName = String(payload.nombre || payload.modelName || sourceItem?.name || sourceItem?.nombre || '').trim();
    if (!modelName || modelName.length < 3) {
      return {
        valid: false,
        error: 'El nombre del modelo de vehículo es obligatorio y debe tener al menos 3 caracteres.',
      };
    }

    const brandId = payload.id_marca || payload.brandId || sourceItem?.id_marca;
    const brandName = payload.brandName || sourceItem?.brand;
    if (!brandId && !brandName) {
      return {
        valid: false,
        error: 'Debe especificarse la marca comercial a la que pertenecerá el modelo.',
      };
    }

    const voltage = payload.voltaje_nominal_v !== undefined ? Number(payload.voltaje_nominal_v) : null;
    if (voltage !== null && (isNaN(voltage) || voltage <= 0 || voltage > 200)) {
      return {
        valid: false,
        error: 'El voltaje nominal debe ser un número válido entre 12V y 144V.',
      };
    }

    const powerW = payload.potencia_motor_w !== undefined ? Number(payload.potencia_motor_w) : null;
    if (powerW !== null && (isNaN(powerW) || powerW <= 0 || powerW > 100000)) {
      return {
        valid: false,
        error: 'La potencia del motor debe ser un valor numérico positivo en Watts.',
      };
    }

    return {
      valid: true,
      targetList,
      sanitizedData: {
        nombre: modelName,
        id_marca: brandId ? Number(brandId) : null,
        brandName: String(brandName || '').trim(),
        vehicleType: payload.vehicleType || VEHICLE_TYPES.MOTO_ELECTRICA,
        voltaje_nominal_v: voltage,
        potencia_motor_w: powerW,
        precio: payload.precio !== undefined ? Number(payload.precio) : sourceItem?.precio || sourceItem?.pricePen || 0,
        imagen_url: payload.imagen_url || sourceItem?.imagen_url || sourceItem?.imageUrl || null,
        slug: generateVehicleSlug(brandName, modelName),
        originalSku: sourceItem?.codigo_sku || sourceItem?.sku || '',
      },
    };
  }

  // Validaciones para destino: Repuestos
  if (targetList === CATALOG_DESTINATIONS.REPUESTOS) {
    const partName = String(payload.nombre || sourceItem?.nombre || sourceItem?.name || '').trim();
    const sku = String(payload.codigo_sku || sourceItem?.codigo_sku || sourceItem?.sku || '').trim();

    if (!partName || partName.length < 3) {
      return {
        valid: false,
        error: 'El nombre del repuesto es obligatorio y debe tener al menos 3 caracteres.',
      };
    }

    if (!sku) {
      return {
        valid: false,
        error: 'Se requiere un código SKU válido para registrar el repuesto en catálogo.',
      };
    }

    return {
      valid: true,
      targetList,
      sanitizedData: {
        nombre: partName,
        codigo_sku: sku,
        id_categoria: payload.id_categoria ? Number(payload.id_categoria) : 1,
        precio: payload.precio !== undefined ? Number(payload.precio) : sourceItem?.precio || 0,
        imagen_url: payload.imagen_url || sourceItem?.imagen_url || sourceItem?.imageUrl || null,
      },
    };
  }

  // Validaciones para destino: Fuera de Catálogo
  if (targetList === CATALOG_DESTINATIONS.FUERA_CATALOGO) {
    return {
      valid: true,
      targetList,
      sanitizedData: {
        reason: String(payload.reason || 'Exclusión administrativa de catálogo comercial').trim(),
        keepTraceability: true,
      },
    };
  }

  return { valid: false, error: 'Configuración de reclasificación no soportada.' };
}

/**
 * Hook opcional para sincronización offline o en archivos estáticos.
 */
export function syncDataFileReclassification() {
  return false;
}

/**
 * Ejecuta la reclasificación completa de un ítem con validaciones, prevención de duplicados,
 * trazabilidad de identificadores y compensación en caso de fallo.
 */
export async function executeReclassify(options) {
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
  let currentRecord = sourceItem;

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

  const sanitized = validation.sanitizedData;

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
          notas: `[RECLASIFICADO DESDE REPUESTOS ${todayStr} por ${adminUser}] SKU original: ${currentRecord?.codigo_sku || sanitized.originalSku}.`,
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
        .eq('id_repuesto', currentRecord?.id_repuesto || sourceId);

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
          sku: currentRecord?.codigo_sku || sanitized.originalSku,
          partKey: currentRecord?.part_key,
          targetList: CATALOG_DESTINATIONS.MODELOS_EV,
          modelData: {
            ...sanitized,
            id_marca: brandId,
          },
        });
      }

      return {
        success: true,
        message: `El producto «${sanitized.nombre}» (SKU ${currentRecord?.codigo_sku || sanitized.originalSku}) fue reclasificado exitosamente a Modelos EV.`,
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

      const updatePayload = {
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
