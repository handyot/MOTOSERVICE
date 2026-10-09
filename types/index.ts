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
