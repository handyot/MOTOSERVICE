/**
 * MOTOSERVICE - Servicio Transaccional de Pedidos y Checkout
 *
 * Reglas de negocio:
 * 1. El navegador NUNCA es la fuente de verdad de precios, stock ni totales.
 * 2. Validación estricta en el servidor antes de guardar el pedido.
 * 3. Compra como invitado sin forzar registro en Supabase Auth.
 * 4. Seguridad de acceso al pedido invitado mediante Token de Alta Entropía (SHA-256),
 *    impidiendo ataques IDOR o enumeración por ID secuencial o email.
 * 5. Bloqueo de repuestos de proveedores que tengan estado 'CONSULTAR_STOCK' o stock propio 0.
 * 6. Máquina de estados explícita con transiciones auditadas y validadas.
 */

import crypto from 'crypto';
import { createClient, createOrderAdminClient } from '../supabase/server';
import { validateCoupon, recordCouponRedemption } from '../promotions/discount-service';
import { calculateTaxBreakdown, validateFiscalDocument } from '../documents/fiscal-service';
import {
  generateGuestAccessToken,
  verifyGuestToken,
  getVerifiedCatalogPart,
  validateOrderStatusTransition,
  maskEmail,
  maskName,
  maskAddress,
} from './order-core.mjs';
import { OFFICIAL_PARTS } from '../../data/ecomoto-data';
import {
  GuestCheckoutInput,
  OrderRecord,
  OrderItemRecord,
  OrderStatus,
} from '@/types';

export {
  generateGuestAccessToken,
  verifyGuestToken,
  getVerifiedCatalogPart,
  validateOrderStatusTransition,
};

const memoryOrders = new Map<string, OrderRecord>();
const memoryTokens = new Map<string, string>();

/**
 * Crea un pedido en el servidor recalculando precios y verificando stock.
 */
export async function createOrder(
  input: GuestCheckoutInput,
  authenticatedUserId?: string | null
): Promise<{ order: OrderRecord; guestToken?: string }> {
  const {
    customerName,
    customerEmail,
    customerPhone,
    shippingAddress,
    department = 'Lima',
    province = 'Lima',
    district = 'Lima',
    deliveryMethod,
    invoiceType,
    docNumber,
    docBusinessName,
    couponCode,
    items,
  } = input;

  if (!items || items.length === 0) {
    throw new Error('El carrito no contiene productos.');
  }

  // 1. Validar comprobante según SUNAT
  const taxCheck = validateFiscalDocument(invoiceType, docNumber, docBusinessName);
  if (!taxCheck.valid) {
    throw new Error(taxCheck.error || 'Documento tributario inválido.');
  }

  // 2. Recalcular items estrictamente en el servidor
  let subtotal = 0;
  const verifiedItems: OrderItemRecord[] = [];

  for (const item of items) {
    let verifiedPart = getVerifiedCatalogPart(item.sku);

    if (!verifiedPart) {
      const normalizedItemSku = item.sku.trim().toUpperCase();
      const official = OFFICIAL_PARTS.find(
        (p) =>
          (p.sku && p.sku.trim().toUpperCase() === normalizedItemSku) ||
          (p.partKey && p.partKey.trim().toUpperCase() === normalizedItemSku)
      );
      if (official && typeof official.pricePen === 'number' && official.pricePen > 0) {
        verifiedPart = {
          sku: official.sku || official.partKey,
          name: official.name,
          price: official.pricePen,
          currency: 'PEN',
          category: official.category,
          isDirectSale: true,
          stockAvailable: official.stockStatus === 'AGOTADO_EN_PAGINA' ? 0 : 15,
        };
      }
    }

    if (!verifiedPart) {
      throw new Error(`El repuesto con SKU ${item.sku} no fue encontrado en el catálogo oficial.`);
    }

    if (!verifiedPart.isDirectSale || verifiedPart.stockAvailable <= 0) {
      throw new Error(
        `El repuesto «${verifiedPart.name}» requiere consultar disponibilidad con proveedor y no puede comprarse directamente.`
      );
    }

    if (item.quantity <= 0 || !Number.isInteger(item.quantity)) {
      throw new Error(`Cantidad inválida para el producto ${verifiedPart.name}.`);
    }

    if (item.quantity > verifiedPart.stockAvailable) {
      throw new Error(
        `No hay suficiente stock para «${verifiedPart.name}». Disponible: ${verifiedPart.stockAvailable} unidades.`
      );
    }

    const itemSubtotal = Math.round(verifiedPart.price * item.quantity * 100) / 100;
    subtotal += itemSubtotal;

    verifiedItems.push({
      id: crypto.randomUUID(),
      orderId: '',
      sku: verifiedPart.sku,
      name: verifiedPart.name,
      unitPrice: verifiedPart.price,
      quantity: item.quantity,
      subtotal: itemSubtotal,
    });
  }

  subtotal = Math.round(subtotal * 100) / 100;

  // 3. Aplicar descuento de cupón en el servidor si existe
  let discount = 0;
  let validatedCouponCode: string | null = null;

  if (couponCode) {
    const couponResult = await validateCoupon({
      email: customerEmail,
      code: couponCode,
      subtotal,
    });

    if (couponResult.valid) {
      discount = couponResult.discountAmount;
      validatedCouponCode = couponResult.code || couponCode;
    }
  }

  // 4. Costo de despacho según modalidad
  let shippingCost = 0;
  if (deliveryMethod === 'envio_domicilio') {
    shippingCost = department.toLowerCase().includes('lima') ? 15.0 : 25.0;
  }

  const taxBreakdown = calculateTaxBreakdown({
    subtotal,
    discount,
    shipping: shippingCost,
  });

  const total = taxBreakdown.totalAmount;

  // 5. Generar identificadores y token de seguridad para invitado
  const orderId = crypto.randomUUID();
  const orderNumber = `MS-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
  const isGuest = !authenticatedUserId;

  let guestToken: string | undefined;
  let guestAccessTokenHash: string | null = null;

  if (isGuest) {
    const generated = generateGuestAccessToken();
    guestToken = generated.token;
    guestAccessTokenHash = generated.tokenHash;
    memoryTokens.set(generated.tokenHash, orderId);
  }

  const orderRecord: OrderRecord = {
    id: orderId,
    orderNumber,
    userId: authenticatedUserId || null,
    isGuest,
    guestAccessTokenHash,
    customerEmail,
    customerName,
    customerPhone: customerPhone || null,
    shippingAddress: shippingAddress || null,
    department,
    province,
    district,
    deliveryMethod,
    invoiceType,
    docNumber: taxCheck.normalizedDocNumber || docNumber,
    docBusinessName: docBusinessName || null,
    subtotal,
    discount,
    shippingCost,
    total,
    currency: 'PEN',
    couponCode: validatedCouponCode,
    orderStatus: 'pendiente_pago',
    paymentStatus: 'pendiente',
    documentStatus: 'pendiente',
    dispatchStatus: 'pendiente',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    items: verifiedItems.map((item) => ({ ...item, orderId })),
  };

  // 6. Persistir en base de datos o fallback en memoria
  try {
    const supabase = createOrderAdminClient() || (await createClient());
    const { error: orderError } = await supabase.from('pedidos').insert({
      id_pedido: orderId,
      numero_pedido: orderNumber,
      user_id: authenticatedUserId || null,
      es_invitado: isGuest,
      guest_access_token_hash: guestAccessTokenHash,
      cliente_email: customerEmail,
      cliente_nombre: customerName,
      cliente_telefono: customerPhone || null,
      direccion_envio: shippingAddress || null,
      departamento: department,
      provincia: province,
      distrito: district,
      modalidad_entrega: deliveryMethod,
      tipo_comprobante: invoiceType,
      doc_numero: taxCheck.normalizedDocNumber || docNumber,
      doc_razon_social: docBusinessName || null,
      subtotal,
      descuento: discount,
      costo_envio: shippingCost,
      total,
      moneda: 'PEN',
      cupon_codigo: validatedCouponCode,
      estado_pedido: 'pendiente_pago',
      estado_pago: 'pendiente',
      estado_comprobante: 'pendiente',
      estado_despacho: 'pendiente',
    });

    if (orderError) {
      console.warn('[MOTOSERVICE] Guardando pedido en memoria por error en Supabase:', orderError.message);
      memoryOrders.set(orderId, orderRecord);
    } else {
      // Insertar items
      const itemsPayload = verifiedItems.map((item) => ({
        id_item: item.id,
        id_pedido: orderId,
        sku: item.sku,
        nombre: item.name,
        precio_unitario: item.unitPrice,
        cantidad: item.quantity,
        subtotal: item.subtotal,
      }));
      await supabase.from('pedido_items').insert(itemsPayload);
      memoryOrders.set(orderId, orderRecord);
    }
  } catch (err) {
    console.warn('[MOTOSERVICE] Error conectando a DB, usando memoria:', err);
    memoryOrders.set(orderId, orderRecord);
  }

  // Si se aplicó un cupón, registrar redención
  if (validatedCouponCode && discount > 0) {
    await recordCouponRedemption({
      code: validatedCouponCode,
      email: customerEmail,
      orderId,
      discountAmount: discount,
    });
  }

  return { order: orderRecord, guestToken };
}

export function recordOrderPaymentInMemory(orderId: string, chargeId?: string) {
  let order = memoryOrders.get(orderId);
  if (!order) {
    for (const o of memoryOrders.values()) {
      if (o.id === orderId || o.orderNumber.toUpperCase() === orderId.toUpperCase()) {
        order = o;
        break;
      }
    }
  }

  if (order) {
    order.paymentStatus = 'pagado';
    order.orderStatus = 'confirmado';
    order.documentStatus = 'listo';
    order.updatedAt = new Date().toISOString();
    if (chargeId) {
      order.adminNotes = `Pago confirmado Culqi chargeId: ${chargeId}`;
    }
    memoryOrders.set(order.id, order);
  }
}

/**
 * Obtiene un pedido de forma segura.
 * Solo autoriza si:
 * 1. Es el usuario autenticado dueño del pedido.
 * 2. O es un invitado que proporciona el `guestToken` válido que coincide con el hash guardado.
 * 3. O es un administrador autenticado.
 */
export async function getOrderSecurely(params: {
  orderId: string;
  guestToken?: string | null;
  authenticatedUserId?: string | null;
  isAdmin?: boolean;
}): Promise<OrderRecord | null> {
  const { orderId, guestToken, authenticatedUserId, isAdmin } = params;
  const cleanId = (orderId || '').trim();

  let order: OrderRecord | null = memoryOrders.get(cleanId) || null;

  if (!order) {
    for (const o of memoryOrders.values()) {
      if (o.id === cleanId || o.orderNumber.toUpperCase() === cleanId.toUpperCase()) {
        order = o;
        break;
      }
    }
  }

  if (!order) {
    try {
      const supabase = createOrderAdminClient() || (await createClient());
      const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const isUuid = UUID_REGEX.test(cleanId);

      let queryBuilder = supabase
        .from('pedidos')
        .select(`
          *,
          pedido_items (*)
        `);

      if (isUuid) {
        queryBuilder = queryBuilder.or(`id_pedido.eq.${cleanId},numero_pedido.eq.${cleanId}`);
      } else {
        queryBuilder = queryBuilder.eq('numero_pedido', cleanId);
      }

      const { data, error } = await queryBuilder.maybeSingle();

      if (data && !error) {
        order = {
          id: data.id_pedido,
          orderNumber: data.numero_pedido,
          userId: data.user_id,
          isGuest: data.es_invitado,
          guestAccessTokenHash: data.guest_access_token_hash,
          customerEmail: data.cliente_email,
          customerName: data.cliente_nombre,
          customerPhone: data.cliente_telefono,
          shippingAddress: data.direccion_envio,
          department: data.departamento,
          province: data.provincia,
          district: data.distrito,
          deliveryMethod: data.modalidad_entrega,
          invoiceType: data.tipo_comprobante,
          docNumber: data.doc_numero,
          docBusinessName: data.doc_razon_social,
          subtotal: Number(data.subtotal),
          discount: Number(data.descuento),
          shippingCost: Number(data.costo_envio),
          total: Number(data.total),
          currency: data.moneda,
          couponCode: data.cupon_codigo,
          orderStatus: data.estado_pedido,
          paymentStatus: data.estado_pago,
          documentStatus: data.estado_comprobante,
          dispatchStatus: data.estado_despacho,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          items: (data.pedido_items || []).map((i: Record<string, unknown>) => ({
            id: String(i.id_item),
            orderId: String(i.id_pedido),
            sku: String(i.sku),
            name: String(i.nombre),
            unitPrice: Number(i.precio_unitario),
            quantity: Number(i.cantidad),
            subtotal: Number(i.subtotal),
          })),
        };
      }
    } catch {
      // Ignorar fallo de red
    }
  }

  if (!order) return null;

  // Comprobación de autorización
  if (isAdmin) return order;

  if (authenticatedUserId && order.userId === authenticatedUserId) {
    return order;
  }

  if (order.isGuest && guestToken && order.guestAccessTokenHash) {
    const isValid = verifyGuestToken(guestToken, order.guestAccessTokenHash);
    if (isValid) return order;
  }

  // Denegar acceso si no cumple ninguna condición
  return null;
}

export interface PublicOrderTracking {
  id: string;
  orderNumber: string;
  orderStatus: OrderStatus;
  paymentStatus: string;
  dispatchStatus: string;
  deliveryMethod: string;
  customerNameMasked: string;
  customerEmailMasked: string;
  shippingAddressMasked: string;
  department: string;
  province: string;
  district: string;
  total: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
  items: Array<{
    sku: string;
    name: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }>;
  timelineSteps: Array<{
    key: string;
    label: string;
    description: string;
    status: 'completed' | 'current' | 'upcoming';
  }>;
  supportWhatsAppUrl: string;
}

/**
 * Consulta pública y segura del estado de un pedido por número de orden o identificador.
 * Enmascara datos privados (DNI/RUC, teléfono, dirección completa) para consulta pública
 * en `/carrito` o `/pedido/[id]`.
 */
export async function trackOrderPublicly(params: {
  query: string;
  customerEmail?: string | null;
}): Promise<PublicOrderTracking | null> {
  const cleanQuery = (params.query || '').trim();
  const sanitizedQuery = cleanQuery.replace(/[%_,;]/g, '').trim();

  // Validación estricta anti-enumeración: mínimo 4 caracteres
  if (!sanitizedQuery || sanitizedQuery.length < 4) {
    return null;
  }

  // 1. Buscar en memoria
  let found: OrderRecord | null = null;
  const upperQuery = sanitizedQuery.toUpperCase();

  for (const o of memoryOrders.values()) {
    if (
      o.id.toUpperCase() === upperQuery ||
      o.orderNumber.toUpperCase() === upperQuery ||
      o.customerEmail.toLowerCase() === sanitizedQuery.toLowerCase() ||
      (params.customerEmail && o.customerEmail.toLowerCase() === params.customerEmail.trim().toLowerCase())
    ) {
      found = o;
      break;
    }
  }

  // 2. Si no está en memoria, buscar en Supabase
  if (!found) {
    try {
      const supabase = createOrderAdminClient() || (await createClient());
      let queryBuilder = supabase
        .from('pedidos')
        .select(`
          *,
          pedido_items (*)
        `);

      const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const isUuid = UUID_REGEX.test(sanitizedQuery);

      if (sanitizedQuery.includes('@')) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(sanitizedQuery)) return null;

        queryBuilder = queryBuilder
          .eq('cliente_email', sanitizedQuery.toLowerCase())
          .order('created_at', { ascending: false })
          .limit(1);
      } else if (isUuid) {
        queryBuilder = queryBuilder.or(`id_pedido.eq.${sanitizedQuery},numero_pedido.eq.${sanitizedQuery}`);
      } else {
        const normalizedOrder = sanitizedQuery.toUpperCase().startsWith('MS-')
          ? sanitizedQuery.toUpperCase()
          : `MS-2026-${sanitizedQuery.toUpperCase()}`;
        queryBuilder = queryBuilder.or(`numero_pedido.eq.${sanitizedQuery.toUpperCase()},numero_pedido.eq.${normalizedOrder}`);
      }

      const { data, error } = await queryBuilder.maybeSingle();

      if (data && !error) {
        found = {
          id: data.id_pedido,
          orderNumber: data.numero_pedido,
          userId: data.user_id,
          isGuest: data.es_invitado,
          guestAccessTokenHash: data.guest_access_token_hash,
          customerEmail: data.cliente_email,
          customerName: data.cliente_nombre,
          customerPhone: data.cliente_telefono,
          shippingAddress: data.direccion_envio,
          department: data.departamento,
          province: data.provincia,
          district: data.distrito,
          deliveryMethod: data.modalidad_entrega,
          invoiceType: data.tipo_comprobante,
          docNumber: data.doc_numero,
          docBusinessName: data.doc_razon_social,
          subtotal: Number(data.subtotal),
          discount: Number(data.descuento),
          shippingCost: Number(data.costo_envio),
          total: Number(data.total),
          currency: data.moneda,
          couponCode: data.cupon_codigo,
          orderStatus: data.estado_pedido,
          paymentStatus: data.estado_pago,
          documentStatus: data.estado_comprobante,
          dispatchStatus: data.estado_despacho,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          items: (data.pedido_items || []).map((i: Record<string, unknown>) => ({
            id: String(i.id_item),
            orderId: String(i.id_pedido),
            sku: String(i.sku),
            name: String(i.nombre),
            unitPrice: Number(i.precio_unitario),
            quantity: Number(i.cantidad),
            subtotal: Number(i.subtotal),
          })),
        };
      }
    } catch {
      // Ignorar fallo de conexión
    }
  }

  if (!found) return null;

  // Determinar progreso de línea de tiempo
  const statusOrder: OrderStatus[] = [
    'pendiente_pago',
    'confirmado',
    'en_preparacion',
    'despachado',
    'entregado',
  ];

  const currentIdx = statusOrder.indexOf(found.orderStatus);

  const stepsConfig = [
    {
      key: 'confirmado',
      label: 'Pago Confirmado',
      description: 'El cobro con Culqi ha sido verificado satisfactoriamente.',
      idx: 1,
    },
    {
      key: 'en_preparacion',
      label: 'En Preparación',
      description: 'Componentes validados, empaquetados y en control de calidad de almacén.',
      idx: 2,
    },
    {
      key: 'despachado',
      label: found.deliveryMethod === 'recojo_tienda' ? 'Listo para Recojo' : 'En Tránsito',
      description:
        found.deliveryMethod === 'recojo_tienda'
          ? 'Disponible para retiro en almacén central de Lima.'
          : 'Motorizado en trayecto de entrega hacia tu dirección.',
      idx: 3,
    },
    {
      key: 'entregado',
      label: 'Completado / Entregado',
      description: 'Repuesto entregado con conformidad y garantía oficial activada.',
      idx: 4,
    },
  ];

  const timelineSteps = stepsConfig.map((s) => {
    let stepStatus: 'completed' | 'current' | 'upcoming' = 'upcoming';
    if (currentIdx >= s.idx) {
      stepStatus = currentIdx === s.idx ? 'current' : 'completed';
    }
    return {
      key: s.key,
      label: s.label,
      description: s.description,
      status: stepStatus,
    };
  });

  const waText = encodeURIComponent(
    `Hola NeroElectric Motors, deseo consultar el estado de mi pedido ${found.orderNumber} por un total de S/ ${found.total.toFixed(2)}.`
  );
  const supportWhatsAppUrl = `https://wa.me/51987654321?text=${waText}`;

  return {
    id: found.id,
    orderNumber: found.orderNumber,
    orderStatus: found.orderStatus,
    paymentStatus: found.paymentStatus,
    dispatchStatus: found.dispatchStatus,
    deliveryMethod: found.deliveryMethod,
    customerNameMasked: maskName(found.customerName || ''),
    customerEmailMasked: maskEmail(found.customerEmail || ''),
    shippingAddressMasked: maskAddress(found.shippingAddress || ''),
    department: found.department || 'Lima',
    province: found.province || 'Lima',
    district: found.district || '',
    total: found.total,
    currency: found.currency,
    createdAt: found.createdAt,
    updatedAt: found.updatedAt,
    items: (found.items || []).map((i) => ({
      sku: i.sku,
      name: i.name,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      subtotal: i.subtotal,
    })),
    timelineSteps,
    supportWhatsAppUrl,
  };
}

/**
 * Actualiza el estado de un pedido aplicando la máquina de estados.
 */
export async function updateOrderStatus(
  orderId: string,
  targetStatus: OrderStatus,
  adminNotes?: string
): Promise<{ success: boolean; error?: string }> {
  const order = await getOrderSecurely({ orderId, isAdmin: true });
  if (!order) {
    return { success: false, error: 'Pedido no encontrado.' };
  }

  const check = validateOrderStatusTransition(
    order.orderStatus,
    targetStatus,
    order.paymentStatus
  );

  if (!check.allowed) {
    return { success: false, error: check.reason };
  }

  order.orderStatus = targetStatus;
  order.updatedAt = new Date().toISOString();
  if (adminNotes) order.adminNotes = adminNotes;
  memoryOrders.set(orderId, order);

  try {
    const supabase = createOrderAdminClient() || (await createClient());
    await supabase
      .from('pedidos')
      .update({
        estado_pedido: targetStatus,
        estado_despacho:
          targetStatus === 'en_preparacion'
            ? 'preparado'
            : targetStatus === 'despachado'
            ? 'despachado'
            : targetStatus === 'entregado'
            ? 'entregado'
            : 'pendiente',
        notas_admin: adminNotes || order.adminNotes,
        updated_at: order.updatedAt,
      })
      .eq('id_pedido', orderId);
  } catch {
    // Memoria ya actualizada
  }

  return { success: true };
}
