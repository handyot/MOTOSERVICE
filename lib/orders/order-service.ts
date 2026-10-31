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
import { createClient } from '../supabase/server';
import { validateCoupon, recordCouponRedemption } from '../promotions/discount-service';
import { calculateTaxBreakdown, validateFiscalDocument } from '../documents/fiscal-service';
import {
  generateGuestAccessToken,
  verifyGuestToken,
  getVerifiedCatalogPart,
  validateOrderStatusTransition,
} from './order-core.mjs';
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
    const verifiedPart = getVerifiedCatalogPart(item.sku);

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
    const supabase = await createClient();
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

  let order: OrderRecord | null = memoryOrders.get(orderId) || null;

  if (!order) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('pedidos')
        .select(`
          *,
          pedido_items (*)
        `)
        .eq('id_pedido', orderId)
        .maybeSingle();

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
    const supabase = await createClient();
    await supabase
      .from('pedidos')
      .update({
        estado_pedido: targetStatus,
        notas_admin: adminNotes || order.adminNotes,
        updated_at: order.updatedAt,
      })
      .eq('id_pedido', orderId);
  } catch {
    // Memoria ya actualizada
  }

  return { success: true };
}
