export interface MotorcycleBrand {
  id: string;
  name: string;
  country: string;
}

export interface MotorcycleModel {
  id: string;
  brandId: string;
  name: string;
  voltage: number; // e.g. 60, 72
  motorPowerW: number; // e.g. 1500, 3000
  batteryType: string; // e.g. "Lithium-ion", "Lead-acid"
  years: number[];
}

export interface PartCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconName: string;
  itemCount: number;
}

export interface PartItem {
  id: string;
  sku: string;
  name: string;
  categorySlug: string;
  price: number;
  currency: string;
  voltage?: number;
  powerW?: number;
  capacityAh?: number;
  shortDescription: string;
  compatibleModelIds: string[]; // List of compatible MotorcycleModel IDs or 'ALL'
  inStock: boolean;
  isPopular?: boolean;
  warrantyMonths: number;
}

export interface FeaturedPartItem {
  id: string;
  sku: string;
  name: string;
  shortDescription: string;
  price: number;
  currency: string;
  imageUrl?: string | null;
  categoryName?: string | null;
  voltage?: number;
  powerW?: number;
  capacityAh?: number;
  isPopular?: boolean;
}

export interface CompatibilityCheckResult {
  isCompatible: boolean;
  confidenceScore: number; // 0 - 100
  status: "verified" | "requires_adaptation" | "incompatible";
  message: string;
  notes: string[];
}

// Tipos incorporados desde el catálogo MOTOSERVICE.

/**
 * MOTOSERVICE - Modelos de Dominio y Tipos
 * Arquitectura limpia preparada para Supabase y Culqi 3DS
 */

export type ProductVoltage = '48V' | '60V' | '72V' | '84V' | '96V' | 'Universal';

export type ProductCategory =
  | 'baterias-bms'
  | 'motores-controladores'
  | 'frenos-regenerativos'
  | 'electronica-display'
  | 'cargadores-rapidos'
  | 'accesorios-chasis';

export interface ProductSpec {
  name: string;
  value: string;
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  price: number;
  originalPrice?: number;
  currency: 'PEN' | 'USD';
  category: ProductCategory;
  voltage?: ProductVoltage;
  brandCompatibility: string[];
  stock: number;
  sku: string;
  rating: number;
  reviewsCount: number;
  badge?: 'Destacado' | 'Nuevo' | 'Bestseller' | 'Oferta' | 'Alta Potencia';
  specs: ProductSpec[];
  warrantyMonths: number;
  imageUrl: string;
  isAvailable: boolean;
}

export interface CategoryInfo {
  id: ProductCategory;
  name: string;
  description: string;
  iconName: string;
  itemCount: number;
  featuredImageUrl: string;
}

export interface CompatibilityFilterState {
  brand: string;
  voltage: string;
  category: string;
}

// ===================================================
// Tipos preparados para futura integración con Supabase
// ===================================================
export interface SupabaseUserProfile {
  id: string;
  email: string;
  fullName?: string;
  phone?: string;
  createdAt: string;
}

export interface SupabaseOrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
}

// ===================================================
// Tipos preparados para futura integración con Culqi 3DS
// ===================================================
export interface CulqiCheckoutOptions {
  title: string;
  currency: 'PEN' | 'USD';
  description: string;
  amount: number; // en céntimos para Culqi (ej: 100.00 PEN -> 10000)
}

export interface CulqiTokenResponse {
  id: string;
  type: string;
  email: string;
  cardNumber: string;
  lastFour: string;
  client: {
    ip: string;
    browser: string;
    deviceType: string;
  };
}

export interface CulqiChargeRequest {
  tokenId: string;
  email: string;
  amount: number;
  currencyCode: 'PEN' | 'USD';
  description: string;
  orderId: string;
  deviceFingerprint?: string; // Requerido para 3DS 2.0
}

// ===================================================
// Tipos de Dominio Oficial EcoMoto Perú (Datos Reales)
// ===================================================

export type EcoMotoBrand = 'TAILG' | 'YADEA' | 'KAYENCORP' | 'GREENLINE' | string;
export type VehicleType = 'MOTO_ELECTRICA' | 'VMP_BICIMOTO' | 'MOTO_SCOOTER' | 'BICIMOTO' | string;
export type ListingStatus = 'CATALOGO' | 'SOLO_COMPATIBILIDAD';
export type DataStatus =
  | 'VERIFICADO_EN_FICHA'
  | 'VERIFICADO_EN_FUENTE'
  | 'PARCIAL'
  | 'REVISION_DISCREPANCIA'
  | 'VERIFICADO_CON_CONDICIONES'
  | 'VERIFICAR_VARIANTE'
  | 'SOLO_REFERENCIA_DE_REPUESTO'
  | 'PENDIENTE_DE_COMPATIBILIDAD'
  | 'REVISAR_FUENTE'
  | string;

export type CompatibilityStatus =
  | 'CONFIRMADA_EN_FUENTE'
  | 'CONDICIONAL_FUENTE'
  | 'PENDIENTE_DE_COMPATIBILIDAD'
  | 'REVISAR_FUENTE'
  | 'NO_COMPATIBLE';

export type SupplierStockStatus =
  | 'CONSULTAR_STOCK'
  | 'AGOTADO_EN_PAGINA'
  | 'CONSULTAR_PRECIO_Y_STOCK'
  | 'EN_STOCK'
  | string;

export interface OfficialBrand {
  name: EcoMotoBrand;
  websiteUrl: string;
  logo?: string;
  country?: string;
}

export interface OfficialSupplier {
  name: string;
  websiteUrl: string;
  supportContact?: string;
  commercialPolicy: string;
}

export interface MotoModel {
  brand: EcoMotoBrand;
  model: string;
  slug: string;
  vehicleType: VehicleType;
  pricePen?: number;
  regularPricePen?: number;
  priceMinPen?: number;
  priceMaxPen?: number;
  motorNominalW?: number;
  motorMaxW?: number;
  batteryChemistry?: string;
  batteryVoltageV?: number;
  batteryCapacityAh?: number;
  batteryRemovable?: 'SI' | 'NO' | 'NO_DECLARADO' | string;
  maxSpeedKmh?: number;
  rangeMinKm?: number;
  rangeMaxKm?: number;
  listingStatus: ListingStatus;
  dataStatus: DataStatus;
  sourceUrl?: string;
  sourceCheckedOn?: string;
  notes?: string;
  imageUrl?: string;
}

export interface SupplierPart {
  partKey: string;
  brand: EcoMotoBrand;
  supplier: string;
  name: string;
  category: string;
  sku?: string;
  pricePen?: number;
  regularPricePen?: number;
  priceMinPen?: number;
  priceMaxPen?: number;
  stockStatus: SupplierStockStatus;
  electricalVoltageV?: number;
  electricalCapacityAh?: number;
  chemistry?: string;
  outputVoltageV?: number;
  outputCurrentA?: number;
  connectorOrFit?: string;
  sourceUrl?: string;
  sourceCheckedOn?: string;
  dataStatus: DataStatus;
  notes?: string;
  ownStock?: number;
  ownPricePen?: number;
}

export interface PublishedCompatibility {
  partKey: string;
  brand: EcoMotoBrand;
  model: string;
  compatibilityStatus: CompatibilityStatus;
  sourceUrl?: string;
  sourceCheckedOn?: string;
  evidenceNote?: string;
  verifiedAt?: string;
  verifiedBy?: string;
}

export interface CompatiblePartView {
  part: SupplierPart;
  compatibilityStatus: CompatibilityStatus;
  evidenceNote?: string;
  sourceUrl?: string;
  sourceCheckedOn?: string;
  requiresVariantConfirmation: boolean;
}

export interface MotoDetailWithParts extends MotoModel {
  compatibleParts: CompatiblePartView[];
}

/**
 * MOTOSERVICE - Tipos del Sistema de Autenticación, Perfiles y Roles
 */

export type AppRole = 'customer' | 'admin';

export interface UserProfile {
  id: string;
  fullName: string;
  phone?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserRoleRecord {
  userId: string;
  role: AppRole;
  createdAt: string;
}

export interface AuthAccount {
  id: string;
  email: string;
  fullName: string;
  phone?: string | null;
  role: AppRole;
  createdAt: string;
}

// ===================================================
// Tipos del Sistema Ecommerce, Carrito y Pedidos
// ===================================================

export type OrderStatus =
  | 'pendiente_pago'
  | 'confirmado'
  | 'en_preparacion'
  | 'despachado'
  | 'entregado'
  | 'cancelado';

export type PaymentStatus =
  | 'pendiente'
  | 'en_proceso'
  | 'pagado'
  | 'rechazado'
  | 'cancelado'
  | 'reembolsado';

export type FiscalDocumentStatus =
  | 'pendiente'
  | 'listo'
  | 'emitido'
  | 'rechazado'
  | 'anulado';

export type DispatchStatus =
  | 'pendiente'
  | 'preparado'
  | 'despachado'
  | 'entregado'
  | 'incidencia';

export type DeliveryMethod = 'envio_domicilio' | 'recojo_tienda';
export type InvoiceType = 'boleta' | 'factura';

export interface CartItem {
  id: string;
  sku: string;
  partKey?: string;
  name: string;
  price: number;
  currency: string;
  imageUrl?: string | null;
  categoryName?: string | null;
  isDirectSale: boolean;
  stockAvailable: number;
  quantity: number;
  voltage?: number;
}

export interface OrderItemRecord {
  id: string;
  orderId: string;
  partId?: number | null;
  partKey?: string | null;
  sku: string;
  name: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  details?: Record<string, unknown>;
}

export interface OrderRecord {
  id: string;
  orderNumber: string;
  userId?: string | null;
  isGuest: boolean;
  guestAccessTokenHash?: string | null;
  customerEmail: string;
  customerName: string;
  customerPhone?: string | null;
  shippingAddress?: string | null;
  department: string;
  province: string;
  district: string;
  deliveryMethod: DeliveryMethod;
  invoiceType: InvoiceType;
  docNumber: string;
  docBusinessName?: string | null;
  subtotal: number;
  discount: number;
  shippingCost: number;
  total: number;
  currency: string;
  couponCode?: string | null;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  documentStatus: FiscalDocumentStatus;
  dispatchStatus: DispatchStatus;
  customerNotes?: string | null;
  adminNotes?: string | null;
  createdAt: string;
  updatedAt: string;
  items?: OrderItemRecord[];
}

export interface GuestCheckoutInput {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress: string;
  department?: string;
  province?: string;
  district?: string;
  deliveryMethod: DeliveryMethod;
  invoiceType: InvoiceType;
  docNumber: string;
  docBusinessName?: string;
  couponCode?: string;
  subscribeNewsletter?: boolean;
  items: {
    sku: string;
    quantity: number;
  }[];
}

// ===================================================
// Tipos de VoltIA (Asistente Técnico & Diagnóstico)
// ===================================================

export type DiagnosticSymptom =
  | 'no-enciende'
  | 'perdida-potencia'
  | 'bateria-descarga-rapido'
  | 'cargador-no-carga'
  | 'fallo-intermitente'
  | 'compatibilidad-duda';

export type DiagnosticCertainty = 'CONFIRMADO' | 'PROBABLE' | 'NO_CONCLUYENTE';

export type SafetyHazardLevel = 'SEGURO' | 'PRECAUCION' | 'PELIGRO_ELECTRICO_CRITICO';

export interface VoltIASafetyAlert {
  level: SafetyHazardLevel;
  title: string;
  warning: string;
  immediateActions: string[];
  referToTechnician: boolean;
}

export interface VoltIARecommendedPart {
  sku: string;
  name: string;
  category: string;
  price: number;
  currency: string;
  inStock: boolean;
  isDirectSale: boolean;
  rationale: string;
}

export interface VoltIADiagnosisResult {
  symptom: string;
  reportedVehicle?: string;
  hypotheses: {
    cause: string;
    description: string;
    probability: 'ALTA' | 'MEDIA' | 'BAJA';
  }[];
  safeChecksPerformed: string[];
  certainty: DiagnosticCertainty;
  recommendedAction: string;
  safetyAlert?: VoltIASafetyAlert;
  recommendedParts: VoltIARecommendedPart[];
  referToTechnician: boolean;
  referralReason?: string;
}

export interface VoltIAMessageItem {
  id: string;
  sender: 'usuario' | 'voltia' | 'asesor';
  content: string;
  createdAt: string;
  diagnosis?: VoltIADiagnosisResult;
  recommendedParts?: VoltIARecommendedPart[];
  safetyAlert?: VoltIASafetyAlert;
}

export interface VoltIASession {
  id: string;
  userId?: string | null;
  sessionToken: string;
  title: string;
  status: 'activa' | 'derivada' | 'cerrada';
  primarySymptom?: string;
  vehicleInfo?: Record<string, unknown>;
  diagnosisSummary?: VoltIADiagnosisResult;
  createdAt: string;
  updatedAt: string;
  messages: VoltIAMessageItem[];
}

export interface AssistanceRequest {
  id: string;
  conversationId?: string | null;
  userId?: string | null;
  contactName: string;
  contactEmail: string;
  contactPhone?: string | null;
  requestType:
    | 'cotizacion_repuesto'
    | 'diagnostico_no_concluyente'
    | 'riesgo_electrico'
    | 'soporte_instalacion'
    | 'consulta_tecnica';
  status: 'pendiente' | 'en_atencion' | 'resuelta' | 'rechazada';
  description: string;
  technicalDetails?: Record<string, unknown>;
  adminNotes?: string | null;
  createdAt: string;
  updatedAt: string;
}

// ===================================================
// Tipos de Vehículos de Clientes Registrados
// ===================================================

export interface CustomerVehicle {
  id: string;
  userId: string;
  brand: string;
  model: string;
  year?: number | null;
  nominalVoltageV?: number | null;
  batteryChemistry?: string | null;
  capacityAh?: number | null;
  notes?: string | null;
  createdAt: string;
}

// ===================================================
// Tipos de Facturación y Guías Electrónicas
// ===================================================

export type FiscalDocumentType = 'BOLETA' | 'FACTURA' | 'GUIA_REMISION';

export interface FiscalDocumentRecord {
  id: string;
  orderId: string;
  type: FiscalDocumentType;
  series?: string | null;
  number?: string | null;
  status: FiscalDocumentStatus;
  receiverData: {
    docType: 'DNI' | 'RUC';
    docNumber: string;
    businessName: string;
    address?: string;
  };
  totalTaxable: number;
  totalIgv: number;
  totalDocument: number;
  cdrHash?: string | null;
  pdfUrl?: string | null;
  xmlUrl?: string | null;
  sunatResponse?: Record<string, unknown>;
  observations?: string | null;
  createdAt: string;
  updatedAt: string;
}

// ===================================================
// Tipos de Promociones y Newsletter
// ===================================================

export interface NewsletterSubscriptionRecord {
  id: string;
  email: string;
  commercialConsent: boolean;
  consentVersion: string;
  consentDate: string;
  origin: string;
  isActive: boolean;
  unsubscribeToken?: string;
  createdAt: string;
}

export interface DiscountCouponRecord {
  id: string;
  code: string;
  type: 'porcentaje' | 'fijo';
  value: number;
  minimumAmount: number;
  maxUses: number;
  currentUses: number;
  isActive: boolean;
  startDate: string;
  endDate?: string | null;
}
