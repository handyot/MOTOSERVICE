/**
 * MOTOSERVICE / NERO Electric Motors - Wrapper TypeScript de VoltIA AI V1
 */

import {
  processVoltIAChat as coreProcessVoltIAChat,
  VOLTIA_SYSTEM_PROMPT,
  VOLTIA_TOOLS,
} from './voltia-ai-core.mjs';
import {
  executeSearchCatalog as coreExecuteSearchCatalog,
  executeCheckCompatibility as coreExecuteCheckCompatibility,
  executeTrackOrder as coreExecuteTrackOrder,
} from './voltia-ai-tools-core.mjs';
import { OFFICIAL_PARTS, getPublicCatalogMotos } from '../../data/ecomoto-data';
import { getOrderSecurely } from '../orders/order-service';

export { VOLTIA_SYSTEM_PROMPT, VOLTIA_TOOLS };

export interface VoltIAChatRequest {
  message: string;
  history?: Array<{ sender: 'user' | 'voltia'; text: string }>;
  context?: {
    brand?: string;
    model?: string;
    voltage?: number | string;
    power?: number | string;
    pagePath?: string;
    guestToken?: string;
  };
}

export interface VoltIAChatResponse {
  success: boolean;
  message: string;
  safetyAlert?: any;
  recommendedProducts?: any[];
  suggestedQuestions?: string[];
  toolCallsExecuted?: string[];
  error?: string;
  isAiEnabled: boolean;
}

export interface ToolSecurityContext {
  authenticatedUserId?: string | null;
  isAdmin?: boolean;
}

export async function processVoltIAChat(
  req: VoltIAChatRequest,
  securityContext: ToolSecurityContext = {},
  customFetch: typeof fetch = fetch
): Promise<VoltIAChatResponse> {
  const toolOptions = {
    parts: OFFICIAL_PARTS,
    motos: getPublicCatalogMotos(),
  };

  const fullSecurityContext = {
    ...securityContext,
    getOrderSecurely,
  };

  return (coreProcessVoltIAChat as any)(req, fullSecurityContext, customFetch, toolOptions);
}

export const executeSearchCatalog = coreExecuteSearchCatalog;
export const executeCheckCompatibility = coreExecuteCheckCompatibility;
export const executeTrackOrder = coreExecuteTrackOrder;
