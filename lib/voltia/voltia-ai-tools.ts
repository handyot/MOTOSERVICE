/**
 * MOTOSERVICE / NERO Electric Motors - Tipos Oficiales de Herramientas de VoltIA
 */

import {
  executeSearchCatalog as coreExecuteSearchCatalog,
  executeCheckCompatibility as coreExecuteCheckCompatibility,
  executeTrackOrder as coreExecuteTrackOrder,
} from './voltia-ai-tools-core.mjs';

export interface ToolCatalogSearchParams {
  query: string;
  category?: string;
  voltage?: number;
  brand?: string;
}

export interface ToolCompatibilityParams {
  brand: string;
  model: string;
  partSkuOrName: string;
  voltage?: number;
}

export interface ToolTrackOrderParams {
  orderNumber: string;
  guestToken?: string;
}

export interface ToolSecurityContext {
  authenticatedUserId?: string | null;
  isAdmin?: boolean;
  getOrderSecurely?: unknown;
}

export interface VoltIARecommendedProduct {
  type?: 'part' | 'moto';
  sku: string;
  name: string;
  brand: string;
  category: string;
  pricePen?: number;
  price?: number;
  currency?: string;
  voltageV?: number | null;
  powerW?: number | null;
  canPurchase?: boolean;
  status?: string;
  stockConfirmed?: boolean;
  imageUrl?: string;
  url?: string;
  verificationNote?: string;
}

export const executeSearchCatalog = coreExecuteSearchCatalog;
export const executeCheckCompatibility = coreExecuteCheckCompatibility;
export const executeTrackOrder = coreExecuteTrackOrder;
