import {
  validateFiscalDocument as coreValidateFiscalDocument,
  calculateTaxBreakdown as coreCalculateTaxBreakdown,
  generateProvisionalFiscalReceipt as coreGenerateProvisionalFiscalReceipt,
} from './fiscal-core.mjs';
import { InvoiceType } from '@/types';

export interface TaxValidationResult {
  valid: boolean;
  error?: string;
  normalizedDocNumber?: string;
}

export interface TaxBreakdown {
  subtotal: number;
  discount: number;
  shipping: number;
  taxableAmount: number;
  igvAmount: number;
  totalAmount: number;
}

export const validateFiscalDocument = coreValidateFiscalDocument as (
  type: InvoiceType,
  docNumber: string,
  businessName?: string
) => TaxValidationResult;

export const calculateTaxBreakdown = coreCalculateTaxBreakdown as (params: {
  subtotal: number;
  discount: number;
  shipping: number;
}) => TaxBreakdown;

export const generateProvisionalFiscalReceipt = coreGenerateProvisionalFiscalReceipt as (params: {
  type: InvoiceType;
  orderNumber: string;
  docNumber: string;
  businessName?: string;
  taxBreakdown: TaxBreakdown;
}) => Record<string, unknown>;
