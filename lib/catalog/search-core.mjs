/**
 * MOTOSERVICE / NERO Electric Motors - Motor de Búsqueda Global de Catálogo
 * Permite buscar repuestos y motos eléctricas por SKU, nombre, marca, categoría, voltaje y potencia.
 */

import { isProductVisibleInCatalog, canPurchaseProduct } from './product-status-core.mjs';

/**
 * @param {{ query: string; parts?: any[]; motos?: any[] }} options
 */
export function searchCatalogItems({ query, parts = [], motos = [] }) {
  if (!query || typeof query !== 'string' || !query.trim()) {
    return { query: '', totalMatches: 0, parts: [], motos: [] };
  }

  const cleanQuery = query.trim();
  const q = cleanQuery.toLowerCase();
  const tokens = q.split(/\s+/).filter(Boolean);

  // 1. Filtrado de repuestos
  const matchedParts = [];
  for (const part of parts) {
    const dataStatus = part.dataStatus || part.status || 'ACTIVO';
    const isVisible = isProductVisibleInCatalog(dataStatus, true);
    if (!isVisible) continue;

    const text = [
      part.sku,
      part.name,
      part.category || part.categoryName,
      part.brand,
      part.description || part.notes,
      part.voltage ? `${part.voltage}v` : '',
      part.electricalVoltageV ? `${part.electricalVoltageV}v` : '',
      part.outputVoltageV ? `${part.outputVoltageV}v` : '',
      part.powerW ? `${part.powerW}w` : '',
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    const matches = tokens.every((token) => text.includes(token));
    if (matches) {
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
        canPurchase: canPurchaseProduct(dataStatus, true) && part.inStock !== false && part.stockStatus !== 'AGOTADO_EN_PAGINA',
        url: `/repuestos?q=${encodeURIComponent(part.sku || part.name)}`,
      });
    }
  }

  // 2. Filtrado de motos
  const matchedMotos = [];
  for (const moto of motos) {
    const text = [
      moto.brand,
      moto.model,
      moto.slug,
      moto.vehicleType,
      moto.motorType,
      moto.batteryChemistry,
      moto.batteryVoltageV ? `${moto.batteryVoltageV}v` : '',
      moto.motorPowerW ? `${moto.motorPowerW}w` : '',
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

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
        powerW: moto.motorPowerW,
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
