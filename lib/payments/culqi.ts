/**
 * MOTOSERVICE - Adaptador Oficial de Pagos Culqi 3DS
 */

import {
  convertPenToCents as coreConvertPenToCents,
  isCulqiConfigured as coreIsCulqiConfigured,
  processCulqiCharge as coreProcessCulqiCharge,
  verifyCulqiWebhookSignature as coreVerifyCulqiWebhookSignature,
  handleCulqiWebhookEvent as coreHandleCulqiWebhookEvent,
} from './culqi-core.mjs';

export interface CulqiPaymentInput {
  orderId: string;
  orderNumber: string;
  amountPen: number;
  customerEmail: string;
  customerFirstName?: string;
  customerLastName?: string;
  customerPhone?: string;
  tokenId: string;
  deviceFingerprint?: string;
  challengeConfirmed?: boolean;
  otpCode?: string;
}

export interface CulqiPaymentResponse {
  success: boolean;
  chargeId?: string;
  orderId: string;
  status: 'pagado' | 'en_proceso' | 'rechazado' | 'requiere_3ds';
  actionCode?: string;
  requires3DS?: boolean;
  amountCents: number;
  currency: 'PEN';
  authorizationCode?: string;
  referenceCode?: string;
  errorMessage?: string;
  isMock: boolean;
}

export interface CulqiWebhookPayload {
  id: string;
  type: string;
  data: {
    id: string;
    amount: number;
    currency_code: string;
    email: string;
    metadata?: {
      orderId?: string;
      orderNumber?: string;
    };
    outcome?: {
      type: string;
      code?: string;
      user_message?: string;
    };
  };
}

export const convertPenToCents = coreConvertPenToCents;
export const isCulqiConfigured = coreIsCulqiConfigured;
export const processCulqiCharge = coreProcessCulqiCharge as (input: CulqiPaymentInput) => Promise<CulqiPaymentResponse>;
export const verifyCulqiWebhookSignature = coreVerifyCulqiWebhookSignature;
export const handleCulqiWebhookEvent = coreHandleCulqiWebhookEvent as (payload: CulqiWebhookPayload) => Promise<{
  processed: boolean;
  alreadyProcessed?: boolean;
  orderId?: string;
  status?: string;
}>;
