/**
 * MOTOSERVICE / NERO Electric Motors - Reglas de Negocio y Validación GRE SUNAT
 * Conforme a la R.S. N° 000123-2022/SUNAT
 */

export function validateGreInput(input) {
  const errors = [];

  if (!input) {
    return { valid: false, errors: ['Los datos de la guía son requeridos.'] };
  }

  if (!input.orderId || !input.orderNumber) {
    errors.push('El pedido asociado es obligatorio.');
  }

  if (!input.motivoTraslado || String(input.motivoTraslado).trim().length === 0) {
    errors.push('El motivo de traslado es obligatorio (ej. Venta).');
  }

  if (!input.fechaInicioTraslado) {
    errors.push('La fecha de inicio del traslado es obligatoria.');
  }

  if (!input.puntoPartida || String(input.puntoPartida).trim().length < 5) {
    errors.push('La dirección del punto de partida debe ser específica y completa.');
  }

  if (!input.puntoLlegada || String(input.puntoLlegada).trim().length < 5) {
    errors.push('La dirección del punto de llegada debe ser específica y completa.');
  }

  if (!input.destinatario || !input.destinatario.docNumber) {
    errors.push('El documento del destinatario es obligatorio.');
  } else {
    const cleanDoc = String(input.destinatario.docNumber).trim();
    if (input.destinatario.docType === 'DNI' && !/^\d{8}$/.test(cleanDoc)) {
      errors.push('El DNI del destinatario debe contener exactamente 8 dígitos.');
    } else if (input.destinatario.docType === 'RUC') {
      if (!/^\d{11}$/.test(cleanDoc)) {
        errors.push('El RUC del destinatario debe contener exactamente 11 dígitos.');
      } else if (!['10', '15', '17', '20'].includes(cleanDoc.substring(0, 2))) {
        errors.push('El RUC del destinatario debe iniciar con 10, 15, 17 o 20.');
      }
    }
  }

  if (!input.destinatario?.nombre || String(input.destinatario.nombre).trim().length < 3) {
    errors.push('El nombre o razón social del destinatario es obligatorio.');
  }

  // Validación de Modalidad de Transporte
  if (input.modalidadTransporte === 'PRIVADO') {
    if (!input.conductor) {
      errors.push('Para transporte privado se deben ingresar los datos del vehículo y conductor.');
    } else {
      if (!input.conductor.nombre || String(input.conductor.nombre).trim().length < 3) {
        errors.push('El nombre del conductor es obligatorio.');
      }
      if (!input.conductor.docNumber || !/^\d{8}$/.test(String(input.conductor.docNumber).trim())) {
        errors.push('El DNI del conductor debe contener 8 dígitos.');
      }
      if (!input.conductor.licencia || String(input.conductor.licencia).trim().length < 6) {
        errors.push('El número de licencia de conducir MTC es obligatorio.');
      }
      if (!input.conductor.placaVehiculo || !/^[A-Z0-9-]{6,8}$/i.test(String(input.conductor.placaVehiculo).trim())) {
        errors.push('La placa del vehículo es obligatoria y debe ser válida (ej. ABC-123 o 1234-5X).');
      }
    }
  } else if (input.modalidadTransporte === 'PUBLICO') {
    if (!input.transportista) {
      errors.push('Para transporte público se deben ingresar los datos de la empresa transportista.');
    } else {
      if (!input.transportista.razonSocial || String(input.transportista.razonSocial).trim().length < 3) {
        errors.push('La razón social de la empresa transportista es obligatoria.');
      }
      const ruc = input.transportista.ruc ? String(input.transportista.ruc).trim() : '';
      if (!/^\d{11}$/.test(ruc) || !['10', '20'].includes(ruc.substring(0, 2))) {
        errors.push('El RUC del transportista debe ser válido de 11 dígitos (iniciar con 10 o 20).');
      }
    }
  } else {
    errors.push('Modalidad de transporte no válida (debe ser PRIVADO o PUBLICO).');
  }

  // Validación de Carga y Bienes
  if (!input.pesoBrutoTotalKg || Number(input.pesoBrutoTotalKg) <= 0) {
    errors.push('El peso bruto total debe ser mayor a 0 KG.');
  }

  if (!input.items || input.items.length === 0) {
    errors.push('La guía debe incluir al menos un bien o producto para transportar.');
  } else {
    input.items.forEach((it, idx) => {
      if (!it.nombre || String(it.nombre).trim().length === 0) {
        errors.push(`El producto en la línea ${idx + 1} no tiene descripción.`);
      }
      if (!it.cantidad || Number(it.cantidad) <= 0) {
        errors.push(`La cantidad del producto en la línea ${idx + 1} debe ser mayor a cero.`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function buildGreFiscalDocument(input, correlativeNumber) {
  const serie = 'T001';
  const numero = `${serie}-${String(correlativeNumber).padStart(6, '0')}`;

  return {
    tipo: 'GUIA_REMISION',
    serie,
    numero,
    fechaEmision: new Date().toISOString(),
    moneda: 'PEN',
    datosReceptor: {
      docType: input.destinatario.docType,
      docNumber: input.destinatario.docNumber,
      businessName: input.destinatario.nombre,
      direccion: input.puntoLlegada,
      departamento: input.destinatario.departamento,
      provincia: input.destinatario.provincia,
      distrito: input.destinatario.distrito,
    },
    totalGravada: 0,
    totalIgv: 0,
    totalComprobante: 0,
    numeroPedido: input.orderNumber,
    items: input.items.map((it) => ({
      sku: it.sku || 'MS-ITEM',
      nombre: it.nombre,
      cantidad: it.cantidad,
      precioUnitario: 0,
      subtotal: 0,
      unidad: it.unidad || 'NIU',
      pesoKg: it.pesoKg || it.cantidad * 2.5,
    })),
    greData: {
      motivoTraslado: input.motivoTraslado,
      modalidadTransporte: input.modalidadTransporte,
      fechaInicioTraslado: input.fechaInicioTraslado,
      puntoPartida: input.puntoPartida,
      puntoLlegada: input.puntoLlegada,
      pesoBrutoTotalKg: input.pesoBrutoTotalKg,
      conductor: input.conductor
        ? {
            nombre: input.conductor.nombre,
            docType: 'DNI',
            docNumber: input.conductor.docNumber,
            licencia: input.conductor.licencia,
            placaVehiculo: input.conductor.placaVehiculo,
            marcaVehiculo: input.conductor.marcaVehiculo,
          }
        : undefined,
      transportista: input.transportista,
      comprobanteAsociado: input.comprobanteAsociado,
    },
    observaciones: `Guía de Remisión Electrónica vinculada al pedido ${input.orderNumber}${
      input.comprobanteAsociado ? ` y comprobante ${input.comprobanteAsociado.serieNumero}` : ''
    }.`,
  };
}
