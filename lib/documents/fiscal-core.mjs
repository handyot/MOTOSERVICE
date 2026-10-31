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
