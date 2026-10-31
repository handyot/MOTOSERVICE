/**
 * EcoMoto Perú - Servicio de Dominio Oficial
 *
 * Centraliza la lógica de negocio, filtros técnicos, matrices de compatibilidad N:M
 * y derivación a fuentes de proveedores para motos eléctricas y repuestos.
 */

import {
  MotoModel,
  SupplierPart,
  MotoDetailWithParts,
  CompatiblePartView,
  EcoMotoBrand
} from '@/types';
import {
  OFFICIAL_MOTOS,
  OFFICIAL_PARTS,
  OFFICIAL_COMPATIBILITIES,
  OFFICIAL_BRANDS,
  OFFICIAL_SUPPLIERS,
  getPublicCatalogMotos,
  getMotoWithCompatibleParts,
  getPartWithCompatibleMotos
} from '@/data/ecomoto-data';

export interface MotoFilters {
  brand?: EcoMotoBrand | 'todas';
  vehicleType?: string | 'todos';
  maxPrice?: number;
  voltage?: number | 'todos';
  search?: string;
}

export interface PartFilters {
  category?: string | 'todas';
  brand?: string | 'todas';
  supplier?: string | 'todos';
  search?: string;
  voltage?: number | 'todos';
}

export class EcoMotoService {
  /**
   * Obtiene las marcas oficiales soportadas
   */
  static getBrands() {
    return OFFICIAL_BRANDS;
  }

  /**
   * Obtiene los proveedores oficiales investigados
   */
  static getSuppliers() {
    return OFFICIAL_SUPPLIERS;
  }

  /**
   * Obtiene las motos aptas para el catálogo público y comparador.
   * Regla 7: Excluye modelos con listing_status === 'SOLO_COMPATIBILIDAD'
   */
  static getCatalogMotos(filters?: MotoFilters): MotoModel[] {
    let list = getPublicCatalogMotos();

    if (!filters) return list;

    if (filters.brand && filters.brand !== 'todas') {
      const bUpper = filters.brand.toUpperCase();
      list = list.filter((m) => m.brand.toUpperCase() === bUpper);
    }

    if (filters.vehicleType && filters.vehicleType !== 'todos') {
      list = list.filter((m) => m.vehicleType === filters.vehicleType);
    }

    if (filters.voltage && filters.voltage !== 'todos') {
      const v = Number(filters.voltage);
      list = list.filter((m) => m.batteryVoltageV === v);
    }

    if (filters.maxPrice && filters.maxPrice > 0) {
      list = list.filter((m) => !m.pricePen || m.pricePen <= filters.maxPrice!);
    }

    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        (m) =>
          m.model.toLowerCase().includes(q) ||
          m.brand.toLowerCase().includes(q) ||
          (m.vehicleType && m.vehicleType.toLowerCase().includes(q))
      );
    }

    return list;
  }

  /**
   * Retorna una moto con su listado de repuestos compatibles verificados.
   * Reglas 4, 5 y 6: Solo muestra repuestos con compatibilidad publicada o condicional.
   */
  static getMotoDetail(slug: string): MotoDetailWithParts | null {
    return getMotoWithCompatibleParts(slug);
  }

  /**
   * Obtiene todas las piezas / repuestos de proveedores investigados
   */
  static getSupplierParts(filters?: PartFilters): SupplierPart[] {
    let list = [...OFFICIAL_PARTS];

    if (!filters) return list;

    if (filters.category && filters.category !== 'todas') {
      const cat = filters.category.toUpperCase();
      list = list.filter((p) => p.category.toUpperCase() === cat);
    }

    if (filters.brand && filters.brand !== 'todas') {
      const b = filters.brand.toUpperCase();
      list = list.filter((p) => p.brand.toUpperCase() === b);
    }

    if (filters.supplier && filters.supplier !== 'todos') {
      list = list.filter((p) => p.supplier.toLowerCase().includes(filters.supplier!.toLowerCase()));
    }

    if (filters.voltage && filters.voltage !== 'todos') {
      const v = Number(filters.voltage);
      list = list.filter((p) => p.electricalVoltageV === v || p.outputVoltageV === v);
    }

    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.partKey.toLowerCase().includes(q) ||
          (p.sku && p.sku.toLowerCase().includes(q)) ||
          p.supplier.toLowerCase().includes(q) ||
          (p.connectorOrFit && p.connectorOrFit.toLowerCase().includes(q))
      );
    }

    return list;
  }

  /**
   * Obtiene la ficha de un repuesto con su lista de motos compatibles y enlace a proveedor
   */
  static getPartDetail(partKey: string) {
    return getPartWithCompatibleMotos(partKey);
  }

  /**
   * Obtiene los repuestos compatibles de una moto específica por marca y modelo
   */
  static getCompatiblePartsForModel(brand: string, model: string): CompatiblePartView[] {
    const motoSlug = `${brand}-${model}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const moto = getMotoWithCompatibleParts(motoSlug);
    return moto ? moto.compatibleParts : [];
  }

  /**
   * Compara hasta 4 modelos de motocicletas lado a lado.
   * Regla 13: Muestra precio, motor nominal, batería, velocidad, autonomía y clase.
   */
  static compareModels(slugs: string[]): MotoModel[] {
    if (!slugs || slugs.length === 0) return [];
    const validSlugs = slugs.slice(0, 4);
    return validSlugs
      .map((slug) => OFFICIAL_MOTOS.find((m) => m.slug === slug))
      .filter((m): m is MotoModel => Boolean(m));
  }

  /**
   * Métricas y estadísticas para el panel técnico de EcoMoto
   */
  static getCatalogMetrics() {
    const totalMotos = OFFICIAL_MOTOS.length;
    const catalogMotos = OFFICIAL_MOTOS.filter((m) => m.listingStatus === 'CATALOGO').length;
    const soloCompatibilidadMotos = OFFICIAL_MOTOS.filter((m) => m.listingStatus === 'SOLO_COMPATIBILIDAD').length;
    const totalParts = OFFICIAL_PARTS.length;
    const totalCompatibilities = OFFICIAL_COMPATIBILITIES.length;
    const confirmedComps = OFFICIAL_COMPATIBILITIES.filter((c) => c.compatibilityStatus === 'CONFIRMADA_EN_FUENTE').length;
    const conditionalComps = OFFICIAL_COMPATIBILITIES.filter((c) => c.compatibilityStatus === 'CONDICIONAL_FUENTE').length;

    return {
      totalMotos,
      catalogMotos,
      soloCompatibilidadMotos,
      totalParts,
      totalCompatibilities,
      confirmedComps,
      conditionalComps,
      researchDate: '2026-10-30',
    };
  }
}
