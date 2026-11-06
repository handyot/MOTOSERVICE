/**
 * MOTOSERVICE / NERO Electric Motors - Motor de Búsqueda Global de Catálogo
 * Permite buscar repuestos y motos eléctricas por SKU, nombre, marca, categoría, voltaje y potencia.
 */

import { isProductVisibleInCatalog, canPurchaseProduct } from './product-status-core.mjs';

/**
 * Normaliza texto para búsqueda insensible a mayúsculas y tildes/diacríticos.
 * @param {unknown} value
 * @returns {string}
 */
export function normalizeSearchText(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * @param {{ query: string; parts?: any[]; motos?: any[] }} options
 */
export function searchCatalogItems({ query, parts = [], motos = [] }) {
  if (!query || typeof query !== 'string' || !query.trim()) {
    return { query: '', totalMatches: 0, parts: [], motos: [] };
  }

  const cleanQuery = query.trim();
  const q = normalizeSearchText(cleanQuery);
  const tokens = q.split(/\s+/).filter(Boolean);

  // 1. Filtrado de repuestos
  const matchedParts = [];
  for (const part of parts) {
    const dataStatus = part.dataStatus || part.status || 'ACTIVO';
    const isVisible = isProductVisibleInCatalog(dataStatus, true);
    if (!isVisible) continue;

    const text = normalizeSearchText(
      [
        part.sku,
        part.partKey,
        part.name,
        part.category || part.categoryName,
        part.brand,
        part.description || part.notes,
        part.connectorOrFit,
        part.chemistry,
        part.voltage ? `${part.voltage}v` : '',
        part.electricalVoltageV ? `${part.electricalVoltageV}v` : '',
        part.outputVoltageV ? `${part.outputVoltageV}v` : '',
        part.powerW ? `${part.powerW}w` : '',
      ]
        .filter(Boolean)
        .join(' ')
    );

    const matches = tokens.every((token) => text.includes(token));
    if (matches) {
      const targetSkuOrKey = part.sku || part.partKey || part.name;
      matchedParts.push({
        type: 'part',
        id: part.sku || part.partKey || part.id,
        sku: part.sku || part.partKey,
        name: part.name,
        category: part.category || part.categoryName || 'Repuesto EV',
        brand: part.brand || 'NERO Electric',
        price: part.pricePen || part.price || 0,
        currency: part.currency || 'PEN',
        imageUrl: part.imageUrl || '/branding/nero-electric-motors-optimized.png',
        voltage: part.voltage || part.electricalVoltageV || part.outputVoltageV,
        powerW: part.powerW,
        status: dataStatus,
        canPurchase:
          canPurchaseProduct(dataStatus, true) &&
          part.inStock !== false &&
          part.stockStatus !== 'AGOTADO_EN_PAGINA',
        url: `/repuestos?q=${encodeURIComponent(targetSkuOrKey)}`,
      });
    }
  }

  // 2. Filtrado de motos
  const matchedMotos = [];
  for (const moto of motos) {
    const motorPower = moto.motorPowerW || moto.motorNominalW;
    const text = normalizeSearchText(
      [
        moto.brand,
        moto.model,
        moto.slug,
        moto.vehicleType,
        moto.motorType,
        moto.batteryChemistry,
        moto.notes,
        moto.batteryVoltageV ? `${moto.batteryVoltageV}v` : '',
        motorPower ? `${motorPower}w` : '',
      ]
        .filter(Boolean)
        .join(' ')
    );

    const matches = tokens.every((token) => text.includes(token));
    if (matches) {
      matchedMotos.push({
        type: 'moto',
        id: moto.id || moto.slug,
        slug: moto.slug,
        name: `${moto.brand} ${moto.model}`,
        brand: moto.brand,
        model: moto.model,
        vehicleType: moto.vehicleType || 'Moto Eléctrica',
        voltage: moto.batteryVoltageV,
        powerW: motorPower,
        imageUrl: moto.imageUrl,
        url: `/motos?modelo=${encodeURIComponent(moto.slug)}`,
      });
    }
  }

  return {
    query: cleanQuery,
    totalMatches: matchedParts.length + matchedMotos.length,
    parts: matchedParts,
    motos: matchedMotos,
  };
}
