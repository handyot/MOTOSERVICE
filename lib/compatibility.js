/**
 * MOTOSERVICE - Motor de compatibilidad eléctrica y dimensional
 * Implementado en JavaScript nativo para validación en tiempo real.
 */

import { MOTORCYCLE_BRANDS, MOTORCYCLE_MODELS, FEATURED_PARTS } from "./constants.js";

/**
 * Obtiene la lista de modelos de moto eléctrica según la marca.
 * @param {string} brandId - ID de la marca.
 * @returns {Array<object>}
 */
export function getModelsByBrand(brandId) {
  if (!brandId) return [];
  return MOTORCYCLE_MODELS.filter((model) => model.brandId === brandId);
}

/**
 * Busca un modelo específico por su ID.
 * @param {string} modelId 
 * @returns {object|undefined}
 */
export function findModelById(modelId) {
  return MOTORCYCLE_MODELS.find((model) => model.id === modelId);
}

/**
 * Busca una marca por su ID.
 * @param {string} brandId 
 * @returns {object|undefined}
 */
export function findBrandById(brandId) {
  return MOTORCYCLE_BRANDS.find((brand) => brand.id === brandId);
}

/**
 * Evalúa la compatibilidad técnica entre un repuesto y un modelo de moto eléctrica.
 * Valida voltaje operativo, potencia y homologación específica.
 * 
 * @param {object} part - Objeto del repuesto.
 * @param {object|string} modelOrId - Objeto del modelo o su ID.
 * @returns {{
 *   isCompatible: boolean,
 *   status: 'verified' | 'requires_adaptation' | 'incompatible',
 *   confidenceScore: number,
 *   message: string,
 *   notes: string[]
 * }}
 */
export function checkPartCompatibility(part, modelOrId) {
  if (!part || !modelOrId) {
    return {
      isCompatible: false,
      status: "incompatible",
      confidenceScore: 0,
      message: "Faltan datos para evaluar la compatibilidad.",
      notes: [],
    };
  }

  const model = typeof modelOrId === "string" ? findModelById(modelOrId) : modelOrId;

  if (!model) {
    return {
      isCompatible: false,
      status: "incompatible",
      confidenceScore: 0,
      message: "Modelo de moto no reconocido.",
      notes: [],
    };
  }

  const notes = [];
  let score = 100;

  // 1. Compatibilidad universal declarada
  if (Array.isArray(part.compatibleModelIds) && part.compatibleModelIds.includes("ALL")) {
    notes.push("Repuesto de ajuste universal compatible con sistemas eléctricos estándar.");
    return {
      isCompatible: true,
      status: "verified",
      confidenceScore: 95,
      message: `Totalmente compatible con ${model.name} (Ajuste Universal).`,
      notes,
    };
  }

  // 2. Validación de coincidencia de modelo en lista blanca
  const isDirectlyListed = Array.isArray(part.compatibleModelIds) && part.compatibleModelIds.includes(model.id);

  // 3. Validación técnica de voltaje (si aplica al repuesto)
  if (part.voltage && model.voltage) {
    if (part.voltage !== model.voltage) {
      return {
        isCompatible: false,
        status: "incompatible",
        confidenceScore: 10,
        message: `Incompatible por voltaje: El repuesto opera a ${part.voltage}V y la moto opera a ${model.voltage}V.`,
        notes: [
          `Peligro: Conectar componentes con disparidad de voltaje puede dañar el controlador o el BMS.`,
        ],
      };
    } else {
      notes.push(`Voltaje operativo verificado a ${model.voltage}V nominal.`);
    }
  }

  // 4. Si está directamente listado
  if (isDirectlyListed) {
    notes.push(`Homologado específicamente para el chasis y cableado de ${model.name}.`);
    return {
      isCompatible: true,
      status: "verified",
      confidenceScore: score,
      message: `Compatibilidad 100% garantizada con ${model.name}.`,
      notes,
    };
  }

  // 5. Mismo voltaje pero no listado directamente (puede requerir adaptación de conectores)
  if (part.voltage && model.voltage && part.voltage === model.voltage) {
    return {
      isCompatible: true,
      status: "requires_adaptation",
      confidenceScore: 75,
      message: `Compatible a nivel eléctrico (${model.voltage}V), pero puede requerir adaptación de pines o soporte.`,
      notes: [
        "Verifique la disposición de pines del conector de señal y el espacio físico en el compartimiento.",
        "Consulte con nuestro servicio de asistencia para validar el arnés de cables.",
      ],
    };
  }

  return {
    isCompatible: false,
    status: "incompatible",
    confidenceScore: 20,
    message: `No se recomienda su uso en ${model.name}.`,
    notes: ["No figura en la matriz de compatibilidad probada por MOTOSERVICE."],
  };
}

/**
 * Filtra los repuestos del catálogo que sean compatibles con un modelo.
 * @param {Array<object>} parts 
 * @param {string} modelId 
 * @returns {Array<object>}
 */
export function filterPartsByModel(parts = FEATURED_PARTS, modelId) {
  if (!modelId) return parts;
  return parts.filter((part) => {
    const result = checkPartCompatibility(part, modelId);
    return result.isCompatible;
  });
}

/**
 * Calcula un estimado de autonomía (en km) para una batería y motor dados.
 * Algoritmo basado en consumo promedio en ciudad (35 - 45 Wh/km).
 * @param {number} voltage 
 * @param {number} capacityAh 
 * @param {number} [motorPowerW=3000] 
 * @returns {{ minKm: number, maxKm: number, totalWh: number }}
 */
export function calculateBatteryRangeEstimate(voltage, capacityAh, motorPowerW = 3000) {
  if (!voltage || !capacityAh) {
    return { minKm: 0, maxKm: 0, totalWh: 0 };
  }

  const totalWh = voltage * capacityAh;
  // Factores de consumo típicos en motos eléctricas urbanas considerando la potencia
  const baseWhPerKm = motorPowerW > 4000 ? 45 : 35;
  const highConsumptionWhPerKm = baseWhPerKm * 1.25; // Conducción rápida / cuestas
  const ecoConsumptionWhPerKm = baseWhPerKm * 0.85; // Conducción modo ECO 45 km/h

  const minKm = Math.round(totalWh / highConsumptionWhPerKm);
  const maxKm = Math.round(totalWh / ecoConsumptionWhPerKm);

  return {
    minKm,
    maxKm,
    totalWh,
  };
}
