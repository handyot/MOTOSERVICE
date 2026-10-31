/**
 * MOTOSERVICE — Tipos del Sistema de Importación de Catálogos (CSV / JSON)
 *
 * Define las estructuras para el descubrimiento, normalización,
 * deduplicación, simulación (dry-run) y persistencia en PostgreSQL.
 */

import type { EcoMotoBrand } from '@/types';

export type SupportedFileFormat = 'csv' | 'json';

export type ProductEntityType = 'VEHICULO' | 'REPUESTO' | 'DESCONOCIDO';

export interface ScrapedFileDescriptor {
  path: string;
  filename: string;
  sizeBytes: number;
  format: SupportedFileFormat;
  detectedBrand: EcoMotoBrand | 'DESCONOCIDA';
  recordCount: number;
  status: 'PENDIENTE' | 'PROCESADO' | 'ERROR';
  errorMessage?: string;
  jobName?: string;
  origin?: string;
}

export interface RawScrapedRecord {
  id?: string | number;
  job_id?: string | number;
  job_name?: string;
  url?: string;
  final_url?: string;
  origin?: string;
  depth?: number | string;
  status?: string;
  http_status?: number | string;
  content_type?: string;
  title?: string;
  description?: string;
  language?: string;
  canonical_url?: string;
  headings_count?: number | string;
  links_count?: number | string;
  images_count?: number | string;
  tables_count?: number | string;
  json_ld_count?: number | string;
  headings?: Array<{ tag?: string; text?: string }> | string;
  links?: Array<{ url?: string; text?: string; rel?: string }> | string;
  images?: Array<{ url?: string; alt?: string; src?: string }> | string;
  tables?: string[][][] | unknown[];
  json_ld?: unknown[] | Record<string, unknown>;
  meta?: Record<string, unknown> | string;
  visible_text?: string;
  response_time_ms?: number | string;
  scraped_at?: string;
  error?: string;
}

export interface TechnicalSpecifications {
  voltageV?: number | null;
  motorPowerW?: number | null;
  batteryType?: string | null;
  batteryCapacityAh?: number | null;
  batteryRemovable?: 'SI' | 'NO' | 'NO_DECLARADO';
  maxSpeedKmh?: number | null;
  rangeMinKm?: number | null;
  rangeMaxKm?: number | null;
  warranty?: string | null;
  outputVoltageV?: number | null;
  outputCurrentA?: number | null;
  connectorOrFit?: string | null;
}

export interface NormalizedItem {
  id: string; // unique hash or identifier
  entityType: ProductEntityType;
  sourceFile: string;
  sourceUrl: string;
  canonicalUrl?: string;
  brand: EcoMotoBrand;
  name: string;
  model?: string;
  sku: string | null;
  partKey: string | null;
  category: string;
  pricePen: number | null;
  regularPricePen: number | null;
  currency: string;
  inStock: boolean;
  stockStatus: string;
  description: string | null;
  imageUrl: string | null;
  galleryImages: string[];
  specs: TechnicalSpecifications;
  scrapedAt?: string;
  dataStatus: 'VERIFICADO' | 'PARCIAL' | 'REVISION_REQUERIDA';
  notes?: string;
  rawMetadata?: Record<string, unknown>;
}

export interface DuplicateConflict {
  id: string;
  type: 'EXACT_MATCH' | 'PRICE_DISCREPANCY' | 'SPEC_DISCREPANCY' | 'CROSS_FORMAT_MERGED';
  field?: string;
  itemA: NormalizedItem;
  itemB: NormalizedItem;
  valueA?: unknown;
  valueB?: unknown;
  resolution: string;
}

export interface ProposedDatabaseOperation {
  action: 'INSERT' | 'UPDATE' | 'SKIP';
  entity: 'marcas' | 'modelos_moto' | 'repuestos' | 'compatibilidades' | 'categorias';
  identifier: string;
  summary: string;
  data: Record<string, unknown>;
}

export interface ImportPreviewResult {
  totalFiles: number;
  filesProcessed: ScrapedFileDescriptor[];
  totalRawRecords: number;
  validProducts: number;
  vehiclesCount: number;
  partsCount: number;
  productsByBrand: Record<string, number>;
  potentialNew: number;
  existingUnchanged: number;
  potentialUpdates: number;
  duplicatesIdentified: number;
  conflicts: DuplicateConflict[];
  invalidOrSkippedRecords: Array<{
    url?: string;
    reason: string;
    sourceFile: string;
  }>;
  sampleItems: NormalizedItem[];
  proposedOperations: ProposedDatabaseOperation[];
  unrecognizedFields: string[];
  missingFields: string[];
}

export interface ImportExecutionResult {
  success: boolean;
  dryRun: boolean;
  timestamp: string;
  preview: ImportPreviewResult;
  insertedCount: number;
  updatedCount: number;
  skippedCount: number;
  errorCount: number;
  errors: string[];
  historyId?: string | number;
}
