export function validateFiscalDocument(type, docNumber, businessName) {
  if (!docNumber || typeof docNumber !== 'string') {
    return { valid: false, error: 'El número de documento es obligatorio.' };
  }

  const cleanDoc = docNumber.trim().replace(/\s+/g, '');

  if (type === 'boleta') {
    if (!/^\d{8}$/.test(cleanDoc)) {
      return {
        valid: false,
        error: 'El DNI para emisión de boleta debe contener exactamente 8 dígitos numéricos.',
      };
    }
    return { valid: true, normalizedDocNumber: cleanDoc };
  }

  if (type === 'factura') {
    if (!/^\d{11}$/.test(cleanDoc)) {
      return {
        valid: false,
        error: 'El RUC para factura debe contener exactamente 11 dígitos numéricos.',
      };
    }

    const prefix = cleanDoc.substring(0, 2);
    if (!['10', '15', '17', '20'].includes(prefix)) {
      return {
        valid: false,
        error: 'El RUC debe comenzar con 10, 15, 17 o 20 según las normas de SUNAT.',
      };
    }

    if (!businessName || businessName.trim().length < 3) {
      return {
        valid: false,
        error: 'La Razón Social es obligatoria para emitir Factura.',
      };
    }

    return { valid: true, normalizedDocNumber: cleanDoc };
  }

  return { valid: false, error: 'Tipo de comprobante no reconocido.' };
}

export function calculateTaxBreakdown(params) {
  const { subtotal, discount, shipping } = params;
  const netBeforeTax = Math.max(0, subtotal - discount + shipping);

  const taxableAmount = Math.round((netBeforeTax / 1.18) * 100) / 100;
  const igvAmount = Math.round((netBeforeTax - taxableAmount) * 100) / 100;

  return {
    subtotal,
    discount,
    shipping,
    taxableAmount,
    igvAmount,
    totalAmount: netBeforeTax,
  };
}

export function generateProvisionalFiscalReceipt(params) {
  const { type, orderNumber, docNumber, businessName, taxBreakdown } = params;
  const isInvoice = type === 'factura';
  const serie = isInvoice ? 'F001' : 'B001';
  const numericPart = orderNumber.replace(/\D/g, '').slice(-6).padStart(6, '0');
  const numero = `${serie}-${numericPart || '000001'}`;

  return {
    tipo: isInvoice ? 'FACTURA' : 'BOLETA',
    serie,
    numero,
    estado: 'pendiente',
    datosReceptor: {
      docType: isInvoice ? 'RUC' : 'DNI',
      docNumber,
      businessName: businessName || 'Cliente Particular',
    },
    ...taxBreakdown,
    observacion:
      'Comprobante preparado para firma digital con certificado tributario. Envío a SUNAT en cola.',
  };
}

/**
 * Emite e inserta de forma idempotente el comprobante fiscal en public.documentos_fiscales
 * cuando un pedido ha sido pagado (usado por /api/payments/charge y webhook de Culqi - Issue #29).
 */
export async function emitFiscalDocumentForOrder({ order, supabaseClient }) {
  if (!order || !order.id || !supabaseClient) {
    return { success: false, error: 'Parámetros insuficientes para emitir comprobante.' };
  }

  try {
    // 1. Idempotencia: Verificar si ya existe documento fiscal para este pedido
    const { data: existingDoc } = await supabaseClient
      .from('documentos_fiscales')
      .select('id_documento, tipo, serie, numero, estado')
      .eq('id_pedido', order.id)
      .maybeSingle();

    if (existingDoc) {
      return {
        success: true,
        document: existingDoc,
        alreadyExisted: true,
      };
    }

    // 2. Calcular desglose tributario SUNAT
    const taxBreakdown = calculateTaxBreakdown({
      subtotal: order.subtotal || 0,
      discount: order.discount || 0,
      shipping: order.shippingCost || 0,
    });

    // 3. Generar comprobante según SUNAT (B001 para Boleta, F001 para Factura)
    const provisionalDoc = generateProvisionalFiscalReceipt({
      type: order.invoiceType || 'boleta',
      orderNumber: order.orderNumber,
      docNumber: order.docNumber,
      businessName: order.docBusinessName || undefined,
      taxBreakdown,
    });

    const { data: inserted, error: insertError } = await supabaseClient
      .from('documentos_fiscales')
      .insert({
        id_pedido: order.id,
        tipo: provisionalDoc.tipo,
        serie: provisionalDoc.serie,
        numero: provisionalDoc.numero,
        estado: 'listo',
        datos_receptor: provisionalDoc.datosReceptor,
        total_gravada: provisionalDoc.taxableAmount,
        total_igv: provisionalDoc.igvAmount,
        total_comprobante: provisionalDoc.totalAmount,
        observaciones: provisionalDoc.observacion,
      })
      .select()
      .maybeSingle();

    if (insertError) {
      console.error('[MOTOSERVICE Facturación] Error al insertar en documentos_fiscales:', insertError.message);
      return { success: false, error: insertError.message };
    }

    return {
      success: true,
      document: inserted || provisionalDoc,
      alreadyExisted: false,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error al emitir comprobante fiscal';
    console.error(`[MOTOSERVICE Facturación] Excepción al emitir comprobante para pedido ${order.id}:`, message);
    return { success: false, error: message };
  }
}
