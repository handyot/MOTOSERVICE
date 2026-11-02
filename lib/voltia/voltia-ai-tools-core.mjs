/**
 * MOTOSERVICE / NERO Electric Motors - Motor de Herramientas de VoltIA (Core ESM)
 */

import { searchCatalogItems } from '../catalog/search-core.mjs';
import { isProductVisibleInCatalog, canPurchaseProduct } from '../catalog/product-status-core.mjs';
import { FEATURED_PARTS } from '../constants.js';
import { hasDirectCompatibleParts } from './voltia-core.mjs';

/**
 * Herramienta: search_catalog
 */
export async function executeSearchCatalog(params, options = {}) {
  const query = (params.query || '').trim();
  if (!query) {
    return {
      success: false,
      message: 'Debes proporcionar un término de búsqueda para consultar el catálogo.',
      items: [],
    };
  }

  // Fuentes de catálogo
  const partsPool = options.parts || FEATURED_PARTS.map((p) => ({
    ...p,
    partKey: p.sku,
    category: p.categorySlug,
    brand: 'NERO Electric',
    pricePen: p.price,
    dataStatus: 'ACTIVO',
    estado: true,
  }));

  const motosPool = options.motos || [];

  const searchResult = searchCatalogItems({
    query,
    parts: partsPool,
    motos: motosPool,
  });

  let matchedParts = searchResult.parts;
  if (params.category && params.category !== 'todas') {
    const cat = params.category.toLowerCase();
    matchedParts = matchedParts.filter(
      (p) =>
        (p.category && p.category.toLowerCase().includes(cat)) ||
        (p.id && p.id.toLowerCase().includes(cat))
    );
  }
  if (params.brand && params.brand !== 'todas') {
    const b = params.brand.toLowerCase();
    matchedParts = matchedParts.filter((p) => p.brand && p.brand.toLowerCase().includes(b));
  }
  if (params.voltage) {
    matchedParts = matchedParts.filter((p) => p.voltage === params.voltage || !p.voltage);
  }

  const safeParts = matchedParts.slice(0, 6).map((p) => {
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
      stockConfirmed: false,
      imageUrl: p.imageUrl,
      url: p.url,
      verificationNote: p.status === 'VERIFICADO_EN_FUENTE'
        ? 'Especificación contrastada con ficha de proveedor'
        : 'Repuesto estándar de taller',
    };
  });

  const safeMotos = searchResult.motos.slice(0, 4).map((m) => ({
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
 */
export async function executeCheckCompatibility(params, options = {}) {
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

  const hasDirect = hasDirectCompatibleParts(brand, model);
  const motos = options.motos || [];
  const matchedMoto = motos.find(
    (m) =>
      m.brand &&
      m.brand.toLowerCase() === brand.toLowerCase() &&
      m.model &&
      (m.model.toLowerCase().includes(model.toLowerCase()) ||
        model.toLowerCase().includes(m.model.toLowerCase()))
  );

  // Incompatibilidad por voltaje evidente
  if (params.voltage && matchedMoto?.batteryVoltageV && params.voltage !== matchedMoto.batteryVoltageV) {
    return {
      success: true,
      verdict: 'INCOMPATIBLE',
      vehicle: { brand: matchedMoto.brand, model: matchedMoto.model, systemVoltageV: matchedMoto.batteryVoltageV },
      technicalReason: `Incompatible eléctricamente: el vehículo opera a ${matchedMoto.batteryVoltageV}V nominales, mientras que el componente solicitado es de ${params.voltage}V. Conectar voltajes dispares causará daños irreversibles en el controlador o sobretensión.`,
      evidenceLevel: 'PARAMETRO_ELECTRICO_DISCORDANTE',
    };
  }

  // Modelos con compatibilidad conocida
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
 */
export async function executeTrackOrder(params, context = {}) {
  const orderNumber = (params.orderNumber || '').trim().toUpperCase();

  if (!orderNumber || orderNumber.length < 4) {
    return {
      authorized: false,
      message: 'Debes proporcionar un número de pedido válido (ejemplo: MS-2026-10001).',
    };
  }

  // Si se provee la función getOrderSecurely en contexto
  if (context.getOrderSecurely) {
    const order = await context.getOrderSecurely({
      orderId: orderNumber,
      guestToken: params.guestToken,
      authenticatedUserId: context.authenticatedUserId,
      isAdmin: context.isAdmin,
    });

    if (!order) {
      return {
        authorized: false,
        orderNumber,
        message:
          'Por motivos de privacidad y seguridad, no es posible consultar los datos de este pedido sin autorización. Si eres el titular, inicia sesión en la tienda o accede desde el enlace seguro enviado a tu correo.',
      };
    }

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

  // Comportamiento estricto si no hay credenciales autorizadas
  if (!context.authenticatedUserId && !params.guestToken && !context.isAdmin) {
    return {
      authorized: false,
      orderNumber,
      message:
        'Por motivos de privacidad y seguridad, no es posible consultar los datos de este pedido sin autorización. Si eres el titular, inicia sesión en la tienda o accede desde el enlace seguro enviado a tu correo.',
    };
  }

  return {
    authorized: false,
    orderNumber,
    message: 'Consulta no autorizada para este pedido.',
  };
}
