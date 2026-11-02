/**
 * MOTOSERVICE / NERO Electric Motors - Herramientas Oficiales de VoltIA
 * Implementa las funciones que la IA puede invocar contra el catálogo,
 * la matriz de compatibilidad y el sistema de pedidos.
 */

import { searchCatalogItems } from '../catalog/search-core.mjs';
import { isProductVisibleInCatalog, canPurchaseProduct } from '../catalog/product-status-core.mjs';
import { OFFICIAL_PARTS, getPublicCatalogMotos, getMotoWithCompatibleParts } from '../../data/ecomoto-data';
import { FEATURED_PARTS } from '../constants.js';
import { getOrderSecurely } from '../orders/order-service';
import { hasDirectCompatibleParts } from './voltia-core.mjs';

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
}

/**
 * Herramienta: search_catalog
 * Recupera únicamente repuestos y motos reales existentes en el sistema.
 */
export async function executeSearchCatalog(params: ToolCatalogSearchParams) {
  const query = (params.query || '').trim();
  if (!query) {
    return {
      success: false,
      message: 'Debes proporcionar un término de búsqueda para consultar el catálogo.',
      items: [],
    };
  }

  // Unificar catálogo oficial de repuestos
  const combinedParts: any[] = [
    ...FEATURED_PARTS.map((p) => ({
      ...p,
      partKey: p.sku,
      category: p.categorySlug,
      brand: 'NERO Electric',
      pricePen: p.price,
      dataStatus: 'ACTIVO',
      estado: true,
    })),
    ...OFFICIAL_PARTS.map((p) => ({
      ...p,
      dataStatus: (p as any).dataStatus || 'ACTIVO',
      estado: (p as any).estado !== undefined ? (p as any).estado : true,
    })),
  ];

  const motos = getPublicCatalogMotos();

  const searchResult = (searchCatalogItems as any)({
    query,
    parts: combinedParts,
    motos,
  });

  // Aplicar filtros adicionales si fueron suministrados
  let matchedParts = searchResult.parts;
  if (params.category && params.category !== 'todas') {
    const cat = params.category.toLowerCase();
    matchedParts = matchedParts.filter(
      (p: any) =>
        (p.category && p.category.toLowerCase().includes(cat)) ||
        (p.id && p.id.toLowerCase().includes(cat))
    );
  }
  if (params.brand && params.brand !== 'todas') {
    const b = params.brand.toLowerCase();
    matchedParts = matchedParts.filter((p: any) => p.brand && p.brand.toLowerCase().includes(b));
  }
  if (params.voltage) {
    matchedParts = matchedParts.filter((p: any) => p.voltage === params.voltage || !p.voltage);
  }

  // Sanitizar salida con metadatos reales
  const safeParts = matchedParts.slice(0, 6).map((p: any) => {
    const isVisible = isProductVisibleInCatalog(p.status, true);
    const purchasable = isVisible && canPurchaseProduct(p.status, true) && p.canPurchase !== false;

    return {
      type: 'part',
      sku: p.sku,
      name: p.name,
      brand: p.brand,
      category: p.category,
      pricePen: p.price,
      currency: p.currency || 'PEN',
      voltageV: p.voltage || null,
      powerW: p.powerW || null,
      canPurchase: purchasable,
      status: p.status,
      stockConfirmed: false, // Stock en tiempo real no inventado; requiere confirmación en almacén
      imageUrl: p.imageUrl,
      url: p.url,
      verificationNote: p.status === 'VERIFICADO_EN_FUENTE'
        ? 'Especificación contrastada con ficha de proveedor'
        : 'Repuesto estándar de taller',
    };
  });

  const safeMotos = searchResult.motos.slice(0, 4).map((m: any) => ({
    type: 'moto',
    brand: m.brand,
    model: m.model,
    slug: m.slug,
    vehicleType: m.vehicleType,
    voltageV: m.batteryVoltageV || null,
    powerW: m.motorNominalW || null,
    pricePen: m.pricePen || null,
    imageUrl: m.imageUrl,
    url: `/motos?q=${encodeURIComponent(m.model)}`,
  }));

  return {
    success: true,
    totalFound: safeParts.length + safeMotos.length,
    parts: safeParts,
    motos: safeMotos,
  };
}

/**
 * Herramienta: check_compatibility
 * Evalúa rigurosamente compatibilidad sin inferir coincidencia solo por voltaje.
 */
export async function executeCheckCompatibility(params: ToolCompatibilityParams) {
  const brand = (params.brand || '').trim();
  const model = (params.model || '').trim();
  const partQuery = (params.partSkuOrName || '').trim().toLowerCase();

  if (!brand || !model || !partQuery) {
    return {
      success: false,
      verdict: 'DESCONOCIDA_REQUIERE_DATOS',
      message: 'Se requiere indicar la marca, el modelo exacto del vehículo y el repuesto a evaluar.',
    };
  }

  // 1. Verificar si el modelo cuenta con repuestos directos en matriz oficial
  const hasDirect = hasDirectCompatibleParts(brand, model);

  // 2. Buscar si existe el modelo específico en la base de datos de motos
  const motos = getPublicCatalogMotos();
  const matchedMoto = motos.find(
    (m) =>
      m.brand.toLowerCase() === brand.toLowerCase() &&
      (m.model.toLowerCase().includes(model.toLowerCase()) ||
        model.toLowerCase().includes(m.model.toLowerCase()))
  );

  let directCompatibleParts: any[] = [];
  if (matchedMoto) {
    const detail = getMotoWithCompatibleParts(matchedMoto.slug);
    if (detail && detail.compatibleParts) {
      directCompatibleParts = detail.compatibleParts;
    }
  }

  // 3. Evaluar coincidencia directa en matriz
  const exactPartMatch = directCompatibleParts.find(
    (p: any) =>
      p.sku.toLowerCase() === partQuery ||
      p.name.toLowerCase().includes(partQuery) ||
      partQuery.includes(p.sku.toLowerCase())
  );

  if (exactPartMatch) {
    return {
      success: true,
      verdict: 'CONFIRMADA',
      vehicle: { brand: matchedMoto?.brand || brand, model: matchedMoto?.model || model },
      part: {
        sku: exactPartMatch.sku,
        name: exactPartMatch.name,
        pricePen: exactPartMatch.pricePen,
        canPurchase: true,
      },
      technicalReason: `Compatibilidad verificada y probada para ${brand} ${model}. Es un repuesto plug-and-play sin modificaciones requeridas.`,
      evidenceLevel: 'DOCUMENTADA_EN_CATALOGO',
    };
  }

  // 4. Si el modelo es conocido y no tiene el repuesto en su lista directa
  // Comprobar parámetros eléctricos (voltaje)
  if (matchedMoto && params.voltage && matchedMoto.batteryVoltageV) {
    if (params.voltage !== matchedMoto.batteryVoltageV) {
      return {
        success: true,
        verdict: 'INCOMPATIBLE',
        vehicle: { brand: matchedMoto.brand, model: matchedMoto.model, systemVoltageV: matchedMoto.batteryVoltageV },
        technicalReason: `Incompatible eléctricamente: el vehículo opera a ${matchedMoto.batteryVoltageV}V nominales, mientras que el componente solicitado es de ${params.voltage}V. Conectar voltajes dispares causará daños irreversibles en el controlador o sobretensión.`,
        evidenceLevel: 'PARAMETRO_ELECTRICO_DISCORDANTE',
      };
    }
  }

  // 5. Compatibilidad condicional o desconocida
  if (hasDirect || matchedMoto) {
    return {
      success: true,
      verdict: 'CONDICIONAL',
      vehicle: { brand: matchedMoto?.brand || brand, model: matchedMoto?.model || model },
      technicalReason: `El modelo ${brand} ${model} admite repuestos de esta categoría, pero la variante específica requiere validar dimensiones del alojamiento, conector físico (Anderson/XT60/GX16) y rango de amperaje del controlador.`,
      requiredDataToConfirm: [
        'Fotografía del conector actual',
        'Dimensiones en centímetros del compartimento',
        'Amperaje máximo declarado en la etiqueta del controlador',
      ],
      evidenceLevel: 'REQUIERE_VERIFICACION_VARIANTE',
    };
  }

  return {
    success: true,
    verdict: 'DESCONOCIDA_REQUIERE_DATOS',
    vehicle: { brand, model },
    technicalReason: `El modelo «${brand} ${model}» no figura en la base de compatibilidades directas probadas de fábrica. Para asesorarte con precisión y evitar errores de compra, se requiere confirmar la ficha técnica y fotos de conectores.`,
    requiredDataToConfirm: [
      'Voltaje nominal del paquete de baterías (48V, 60V, 72V)',
      'Química de batería (Litio NMC, LiFePO4 o Plomo Grafeno)',
      'Tipo de conector de carga y descarga',
    ],
    evidenceLevel: 'SIN_HISTORIAL_PREVIO',
  };
}

/**
 * Herramienta: track_order
 * Exclusivamente accesible mediante comprobación de sesión o token de invitado.
 * No expone PII (dirección completa, teléfono, email de otros clientes).
 */
export async function executeTrackOrder(
  params: ToolTrackOrderParams,
  context: ToolSecurityContext = {}
) {
  const orderNumber = (params.orderNumber || '').trim().toUpperCase();

  if (!orderNumber || orderNumber.length < 4) {
    return {
      authorized: false,
      message: 'Debes proporcionar un número de pedido válido (ejemplo: MS-2026-10001).',
    };
  }

  // Consultar de forma segura en el servidor
  const order = await getOrderSecurely({
    orderId: orderNumber,
    guestToken: params.guestToken,
    authenticatedUserId: context.authenticatedUserId,
    isAdmin: context.isAdmin,
  });

  if (!order) {
    // Si no está autorizado con getOrderSecurely, denegar acceso a datos de la orden
    return {
      authorized: false,
      orderNumber,
      message:
        'Por motivos de privacidad y seguridad, no es posible consultar los datos de este pedido sin autorización. Si eres el titular, inicia sesión en la tienda o accede desde el enlace seguro enviado a tu correo.',
    };
  }

  // Devolver únicamente información logística mínima sin PII
  return {
    authorized: true,
    orderNumber: order.orderNumber,
    orderStatus: order.orderStatus,
    paymentStatus: order.paymentStatus,
    dispatchStatus: order.dispatchStatus,
    deliveryMethod: order.deliveryMethod,
    itemsCount: (order.items || []).length,
    registeredAt: order.createdAt,
    trackingUrl: `/pedido/${order.id}${order.isGuest && params.guestToken ? `?token=${params.guestToken}` : ''}`,
    itemsSummary: (order.items || []).map((i) => ({
      name: i.name,
      quantity: i.quantity,
    })),
  };
}
