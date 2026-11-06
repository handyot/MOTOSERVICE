import type { SupplierPart } from '@/types';

/** Stock imaginario (demo) asignado a cada repuesto del catálogo para permitir añadirlo al carrito. */
export const DEFAULT_CATALOG_STOCK = 20;

/**
 * Stock disponible estimado en el cliente para un repuesto del catálogo estático.
 *
 * `ownStock: 0` en `data/ecomoto-data.ts` es un valor de relleno del scraper (no un conteo real),
 * por lo que solo se respeta cuando es positivo; en otro caso se asigna el stock imaginario de demo
 * (incluso para repuestos marcados como agotados en la página del proveedor). Las existencias físicas reales se validan
 * en servidor contra Supabase (`stock_propio_ecomoto`) al crear el pedido (Issue #28).
 */
export function getCatalogPartStock(part: Pick<SupplierPart, 'ownStock'>): number {
  if (typeof part.ownStock === 'number' && part.ownStock > 0) return part.ownStock;
  return DEFAULT_CATALOG_STOCK;
}
