/**
 * MOTOSERVICE / NERO Electric Motors - Generador Core de Comprobantes Fiscales y Guías de Remisión
 * Formatos: PDF A4, PDF Térmico 80 mm y XML UBL 2.1 (OASIS / SUNAT)
 */

export class SimplePdfBuilder {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.streamContent = '';
  }

  sanitizeText(text) {
    return String(text || '')
      .replace(/\\/g, '\\\\')
      .replace(/\(/g, '\\(')
      .replace(/\)/g, '\\)')
      .replace(/á/g, 'a')
      .replace(/é/g, 'e')
      .replace(/í/g, 'i')
      .replace(/ó/g, 'o')
      .replace(/ú/g, 'u')
      .replace(/ñ/g, 'n')
      .replace(/Á/g, 'A')
      .replace(/É/g, 'E')
      .replace(/Í/g, 'I')
      .replace(/Ó/g, 'O')
      .replace(/Ú/g, 'U')
      .replace(/Ñ/g, 'N')
      .replace(/°/g, 'o')
      .replace(/[^\x20-\x7E]/g, ' ');
  }

  drawText(text, x, y, fontSize = 10, font = 'F1', rgb = [0.1, 0.1, 0.1]) {
    const clean = this.sanitizeText(text);
    this.streamContent += `q\n${rgb[0]} ${rgb[1]} ${rgb[2]} rg\nBT\n/${font} ${fontSize} Tf\n1 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)} Tm\n(${clean}) Tj\nET\nQ\n`;
  }

  drawCenteredText(text, y, fontSize = 10, font = 'F1', rgb = [0.1, 0.1, 0.1]) {
    const approxWidth = String(text || '').length * fontSize * 0.52;
    const x = Math.max(10, (this.width - approxWidth) / 2);
    this.drawText(text, x, y, fontSize, font, rgb);
  }

  drawRightText(text, rightX, y, fontSize = 10, font = 'F1', rgb = [0.1, 0.1, 0.1]) {
    const approxWidth = String(text || '').length * fontSize * 0.52;
    const x = Math.max(10, rightX - approxWidth);
    this.drawText(text, x, y, fontSize, font, rgb);
  }

  drawRect(x, y, w, h, strokeRgb = [0.8, 0.8, 0.8], fillRgb = null, lineWidth = 1) {
    this.streamContent += `q\n${lineWidth} w\n${strokeRgb[0]} ${strokeRgb[1]} ${strokeRgb[2]} RG\n`;
    if (fillRgb) {
      this.streamContent += `${fillRgb[0]} ${fillRgb[1]} ${fillRgb[2]} rg\n`;
      this.streamContent += `${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re B\n`;
    } else {
      this.streamContent += `${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re S\n`;
    }
    this.streamContent += `Q\n`;
  }

  drawLine(x1, y1, x2, y2, strokeRgb = [0.8, 0.8, 0.8], lineWidth = 1) {
    this.streamContent += `q\n${lineWidth} w\n${strokeRgb[0]} ${strokeRgb[1]} ${strokeRgb[2]} RG\n${x1.toFixed(2)} ${y1.toFixed(2)} m\n${x2.toFixed(2)} ${y2.toFixed(2)} l S\nQ\n`;
  }

  buildBuffer() {
    const streamLen = Buffer.byteLength(this.streamContent, 'utf8');

    const objects = [];
    objects.push(`1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`);
    objects.push(`2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n`);
    objects.push(
      `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${this.width.toFixed(2)} ${this.height.toFixed(2)}] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R /F3 7 0 R >> >> >>\nendobj\n`
    );
    objects.push(`4 0 obj\n<< /Length ${streamLen} >>\nstream\n${this.streamContent}\nendstream\nendobj\n`);
    objects.push(`5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`);
    objects.push(`6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n`);
    objects.push(`7 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>\nendobj\n`);

    let body = '%PDF-1.4\n';
    const xref = [0];

    for (let i = 0; i < objects.length; i++) {
      xref.push(body.length);
      body += objects[i];
    }

    const startxref = body.length;
    body += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    for (let i = 1; i <= objects.length; i++) {
      body += String(xref[i]).padStart(10, '0') + ' 00000 n \n';
    }

    body += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${startxref}\n%%EOF\n`;
    return Buffer.from(body, 'utf8');
  }
}

/**
 * Genera la representación impresa en PDF A4 de un Comprobante Fiscal o Guía de Remisión.
 */
export function generatePdfA4(doc) {
  const width = 595.28;
  const height = 841.89;
  const pdf = new SimplePdfBuilder(width, height);

  const isGre = doc.tipo === 'GUIA_REMISION';
  const tipoTitulo = isGre
    ? 'GUIA DE REMISION ELECTRONICA'
    : doc.tipo === 'FACTURA'
    ? 'FACTURA ELECTRONICA'
    : 'BOLETA DE VENTA ELECTRONICA';

  const fullSerieNumero = `${doc.serie || (isGre ? 'T001' : 'B001')}-${String(doc.numero || '000001').replace(/^.*-/, '').padStart(6, '0')}`;

  // 1. Cabecera Emisor (Izquierda)
  pdf.drawText('NERO ELECTRIC MOTORS S.A.C.', 45, height - 55, 14, 'F2', [0.05, 0.1, 0.2]);
  pdf.drawText('RUC: 20613074342', 45, height - 70, 9, 'F2', [0.3, 0.3, 0.3]);
  pdf.drawText('Principal: Av. Cesar Canevaro 1332, Lince, Lima - Peru', 45, height - 83, 8.5, 'F1', [0.4, 0.4, 0.4]);
  pdf.drawText('Tel: +51 962 250 280  |  Web: www.neroelectricmotors.com', 45, height - 95, 8.5, 'F1', [0.4, 0.4, 0.4]);
  pdf.drawText('Especialistas en Movilidad Electrica y Repuestos Certificados', 45, height - 107, 8, 'F1', [0.5, 0.5, 0.5]);

  // 2. Recuadro Tributario Oficial (Derecha)
  const boxX = 350;
  const boxY = height - 118;
  const boxW = 200;
  const boxH = 75;
  pdf.drawRect(boxX, boxY, boxW, boxH, [0.05, 0.1, 0.2], [0.97, 0.98, 1.0], 1.5);
  pdf.drawCenteredText('R.U.C. 20613074342', boxY + 54, 11, 'F2', [0.05, 0.1, 0.2]);
  pdf.drawCenteredText(tipoTitulo, boxY + 36, 9.5, 'F2', [0.05, 0.1, 0.2]);
  pdf.drawCenteredText(fullSerieNumero, boxY + 16, 12, 'F2', [0.8, 0.1, 0.1]);

  pdf.drawLine(45, height - 128, 550, height - 128, [0.85, 0.85, 0.88], 1);

  // 3. Datos del Receptor / Destinatario
  const recY = height - 145;
  pdf.drawRect(45, recY - 65, 505, 65, [0.88, 0.88, 0.9], [0.98, 0.98, 0.99], 1);

  const receptor = doc.datosReceptor || {};
  const docTypeLabel = receptor.docType === 'RUC' ? 'RUC' : 'DNI';
  const fechaStr = doc.fechaEmision
    ? new Date(doc.fechaEmision).toLocaleDateString('es-PE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
    : new Date().toLocaleDateString('es-PE');

  pdf.drawText(`${isGre ? 'DESTINATARIO' : 'CLIENTE'}:`, 55, recY - 18, 8.5, 'F2', [0.2, 0.2, 0.2]);
  pdf.drawText(receptor.businessName || 'Cliente Particular', 140, recY - 18, 9, 'F2', [0.1, 0.1, 0.1]);

  pdf.drawText(`NUM. ${docTypeLabel}:`, 55, recY - 32, 8.5, 'F2', [0.2, 0.2, 0.2]);
  pdf.drawText(receptor.docNumber || '00000000', 140, recY - 32, 9, 'F3', [0.1, 0.1, 0.1]);

  pdf.drawText('DIRECCION:', 55, recY - 46, 8.5, 'F2', [0.2, 0.2, 0.2]);
  pdf.drawText(receptor.direccion || 'Lima, Peru', 140, recY - 46, 8.5, 'F1', [0.3, 0.3, 0.3]);

  // Columna lateral derecha de datos
  pdf.drawText('FECHA EMISION:', 360, recY - 18, 8.5, 'F2', [0.2, 0.2, 0.2]);
  pdf.drawText(fechaStr, 450, recY - 18, 9, 'F1', [0.1, 0.1, 0.1]);

  pdf.drawText('MONEDA:', 360, recY - 32, 8.5, 'F2', [0.2, 0.2, 0.2]);
  pdf.drawText(doc.moneda || 'SOLES (PEN)', 450, recY - 32, 8.5, 'F1', [0.1, 0.1, 0.1]);

  if (doc.numeroPedido) {
    pdf.drawText('PEDIDO REF:', 360, recY - 46, 8.5, 'F2', [0.2, 0.2, 0.2]);
    pdf.drawText(doc.numeroPedido, 450, recY - 46, 8.5, 'F3', [0.1, 0.1, 0.1]);
  }

  // 4. Si es GRE, agregar sección de Datos del Traslado y Transporte
  let tableStartY = recY - 80;

  if (isGre && doc.greData) {
    const gre = doc.greData;
    const greBoxY = tableStartY - 80;
    pdf.drawRect(45, greBoxY, 505, 75, [0.2, 0.4, 0.7], [0.95, 0.97, 1.0], 1);

    pdf.drawText('DATOS DEL TRASLADO Y TRANSPORTE (NORMATIVA SUNAT)', 55, greBoxY + 58, 8.5, 'F2', [0.1, 0.25, 0.5]);

    pdf.drawText('Motivo Traslado:', 55, greBoxY + 42, 8, 'F2', [0.3, 0.3, 0.3]);
    pdf.drawText(gre.motivoTraslado || 'VENTA', 140, greBoxY + 42, 8, 'F1', [0.1, 0.1, 0.1]);

    pdf.drawText('Modalidad:', 280, greBoxY + 42, 8, 'F2', [0.3, 0.3, 0.3]);
    pdf.drawText(gre.modalidadTransporte === 'PRIVADO' ? '01 - Transporte Privado' : '02 - Transporte Publico', 340, greBoxY + 42, 8, 'F1', [0.1, 0.1, 0.1]);

    pdf.drawText('Punto Partida:', 55, greBoxY + 28, 8, 'F2', [0.3, 0.3, 0.3]);
    pdf.drawText(gre.puntoPartida || 'Av. Cesar Canevaro 1332, Lince, Lima', 140, greBoxY + 28, 8, 'F1', [0.2, 0.2, 0.2]);

    pdf.drawText('Punto Llegada:', 55, greBoxY + 14, 8, 'F2', [0.3, 0.3, 0.3]);
    pdf.drawText(gre.puntoLlegada || receptor.direccion || 'Lima', 140, greBoxY + 14, 8, 'F1', [0.2, 0.2, 0.2]);

    if (gre.modalidadTransporte === 'PRIVADO' && gre.conductor) {
      pdf.drawText(`Conductor: ${gre.conductor.nombre} (DNI ${gre.conductor.docNumber}) - Licencia: ${gre.conductor.licencia} - Placa: ${gre.conductor.placaVehiculo}`, 55, greBoxY + 2, 7.5, 'F1', [0.2, 0.2, 0.2]);
    } else if (gre.modalidadTransporte === 'PUBLICO' && gre.transportista) {
      pdf.drawText(`Transportista: ${gre.transportista.razonSocial} - RUC: ${gre.transportista.ruc}`, 55, greBoxY + 2, 7.5, 'F1', [0.2, 0.2, 0.2]);
    }

    tableStartY = greBoxY - 15;
  }

  // 5. Tabla de Productos y Líneas de Detalle
  const thY = tableStartY - 18;
  pdf.drawRect(45, thY - 4, 505, 18, [0.1, 0.15, 0.25], [0.12, 0.18, 0.28], 1);
  pdf.drawText('ITEM', 52, thY + 2, 7.5, 'F2', [1, 1, 1]);
  pdf.drawText('CANT', 80, thY + 2, 7.5, 'F2', [1, 1, 1]);
  pdf.drawText('UM', 115, thY + 2, 7.5, 'F2', [1, 1, 1]);
  pdf.drawText('DESCRIPCION DE BIENES / COMPONENTES EV', 145, thY + 2, 7.5, 'F2', [1, 1, 1]);
  if (!isGre) {
    pdf.drawText('P. UNIT', 435, thY + 2, 7.5, 'F2', [1, 1, 1]);
    pdf.drawText('IMPORTE', 500, thY + 2, 7.5, 'F2', [1, 1, 1]);
  } else {
    pdf.drawText('PESO (KG)', 485, thY + 2, 7.5, 'F2', [1, 1, 1]);
  }

  let rowY = thY - 18;
  const items = doc.items && doc.items.length > 0
    ? doc.items
    : [{ sku: 'EV-ITEM', nombre: 'Bien o repuesto electrico', cantidad: 1, precioUnitario: Number(doc.totalComprobante || 0), subtotal: Number(doc.totalComprobante || 0) }];

  items.forEach((it, idx) => {
    const isEven = idx % 2 === 0;
    if (isEven) {
      pdf.drawRect(45, rowY - 4, 505, 16, [0.93, 0.93, 0.95], [0.97, 0.97, 0.98], 0.5);
    }

    pdf.drawText(String(idx + 1).padStart(2, '0'), 55, rowY + 1, 8, 'F1', [0.4, 0.4, 0.4]);
    pdf.drawText(String(it.cantidad || 1), 85, rowY + 1, 8.5, 'F2', [0.1, 0.1, 0.1]);
    pdf.drawText(it.unidad || 'NIU', 115, rowY + 1, 8, 'F1', [0.4, 0.4, 0.4]);

    const desc = (it.nombre || 'Producto EV').substring(0, 52);
    pdf.drawText(desc, 145, rowY + 1, 8.5, 'F1', [0.15, 0.15, 0.15]);

    if (!isGre) {
      pdf.drawRightText((Number(it.precioUnitario) || 0).toFixed(2), 475, rowY + 1, 8.5, 'F1', [0.2, 0.2, 0.2]);
      pdf.drawRightText((Number(it.subtotal) || 0).toFixed(2), 540, rowY + 1, 8.5, 'F2', [0.1, 0.1, 0.1]);
    } else {
      const peso = it.pesoKg ? it.pesoKg.toFixed(2) : ((it.cantidad || 1) * 2.5).toFixed(2);
      pdf.drawRightText(`${peso} KG`, 540, rowY + 1, 8.5, 'F1', [0.2, 0.2, 0.2]);
    }

    rowY -= 17;
  });

  // 6. Totales y Leyendas Tributarias
  const totalsBoxY = Math.max(140, rowY - 20);

  if (!isGre) {
    const totX = 360;
    pdf.drawRect(totX, totalsBoxY - 75, 190, 75, [0.85, 0.85, 0.88], [0.98, 0.98, 0.99], 1);

    pdf.drawText('OP. GRAVADA (PEN):', totX + 12, totalsBoxY - 20, 8.5, 'F1', [0.3, 0.3, 0.3]);
    pdf.drawRightText((Number(doc.totalGravada) || 0).toFixed(2), totX + 175, totalsBoxY - 20, 9, 'F1', [0.1, 0.1, 0.1]);

    pdf.drawText('I.G.V. (18%):', totX + 12, totalsBoxY - 37, 8.5, 'F1', [0.3, 0.3, 0.3]);
    pdf.drawRightText((Number(doc.totalIgv) || 0).toFixed(2), totX + 175, totalsBoxY - 37, 9, 'F1', [0.1, 0.1, 0.1]);

    pdf.drawLine(totX + 10, totalsBoxY - 45, totX + 180, totalsBoxY - 45, [0.8, 0.8, 0.8], 1);

    pdf.drawText('TOTAL A PAGAR:', totX + 12, totalsBoxY - 63, 10, 'F2', [0.05, 0.1, 0.2]);
    pdf.drawRightText(`S/ ${(Number(doc.totalComprobante) || 0).toFixed(2)}`, totX + 175, totalsBoxY - 63, 11, 'F2', [0.8, 0.1, 0.1]);
  } else {
    const totX = 340;
    const totalPeso = doc.greData?.pesoBrutoTotalKg || items.reduce((acc, it) => acc + (it.pesoKg || it.cantidad * 2.5), 0);
    pdf.drawRect(totX, totalsBoxY - 50, 210, 50, [0.2, 0.4, 0.7], [0.95, 0.97, 1.0], 1);

    pdf.drawText('PESO BRUTO TOTAL:', totX + 15, totalsBoxY - 22, 9, 'F2', [0.1, 0.25, 0.5]);
    pdf.drawRightText(`${Number(totalPeso).toFixed(2)} KG`, totX + 195, totalsBoxY - 22, 11, 'F2', [0.1, 0.1, 0.1]);

    pdf.drawText('TOTAL BULTOS/PAQUETES:', totX + 15, totalsBoxY - 40, 8.5, 'F1', [0.3, 0.3, 0.3]);
    pdf.drawRightText(String(items.length), totX + 195, totalsBoxY - 40, 9, 'F2', [0.1, 0.1, 0.1]);
  }

  // 7. Pie de Página con Representación Impresa y Resguardo Legal
  const footY = 85;
  pdf.drawLine(45, footY + 25, 550, footY + 25, [0.85, 0.85, 0.88], 1);
  pdf.drawCenteredText(
    `Representacion impresa de la ${tipoTitulo}.`,
    footY + 12,
    7.5,
    'F2',
    [0.4, 0.4, 0.4]
  );
  pdf.drawCenteredText(
    'Consulte la validez de este documento en el portal de SUNAT o en https://www.neroelectricmotors.com',
    footY,
    7,
    'F1',
    [0.5, 0.5, 0.5]
  );
  pdf.drawCenteredText(
    'Autorizado mediante Resolucion de Superintendencia SUNAT N° 000123-2022/SUNAT y normas conexas.',
    footY - 12,
    6.5,
    'F1',
    [0.6, 0.6, 0.6]
  );

  return pdf.buildBuffer();
}

/**
 * Genera la representación impresa en PDF Térmico de 80 mm para impresoras de tickets.
 */
export function generatePdf80mm(doc) {
  const width = 226.77; // 80 mm
  const itemsCount = doc.items ? doc.items.length : 1;
  const isGre = doc.tipo === 'GUIA_REMISION';
  const approxHeight = Math.max(500, 360 + itemsCount * 30 + (isGre ? 90 : 0));
  const pdf = new SimplePdfBuilder(width, approxHeight);

  let y = approxHeight - 25;

  pdf.drawCenteredText('NERO ELECTRIC MOTORS S.A.C.', y, 9, 'F2', [0.1, 0.1, 0.1]);
  y -= 13;
  pdf.drawCenteredText('RUC: 20613074342', y, 8, 'F2', [0.2, 0.2, 0.2]);
  y -= 12;
  pdf.drawCenteredText('Av. Cesar Canevaro 1332, Lince', y, 7.5, 'F1', [0.3, 0.3, 0.3]);
  y -= 11;
  pdf.drawCenteredText('Lima - Peru  |  Tel: +51 962 250 280', y, 7, 'F1', [0.4, 0.4, 0.4]);
  y -= 14;

  pdf.drawLine(10, y, width - 10, y, [0.7, 0.7, 0.7], 1);
  y -= 14;

  const tipoTitulo = isGre
    ? 'GUIA REMISION ELECTRONICA'
    : doc.tipo === 'FACTURA'
    ? 'FACTURA ELECTRONICA'
    : 'BOLETA DE VENTA';

  const fullSerieNumero = `${doc.serie || (isGre ? 'T001' : 'B001')}-${String(doc.numero || '000001').replace(/^.*-/, '').padStart(6, '0')}`;

  pdf.drawCenteredText(tipoTitulo, y, 9, 'F2', [0.05, 0.1, 0.2]);
  y -= 13;
  pdf.drawCenteredText(fullSerieNumero, y, 10, 'F2', [0.8, 0.1, 0.1]);
  y -= 15;

  pdf.drawLine(10, y, width - 10, y, [0.85, 0.85, 0.85], 0.5);
  y -= 12;

  const receptor = doc.datosReceptor || {};
  const docTypeLabel = receptor.docType === 'RUC' ? 'RUC' : 'DNI';
  const fechaStr = doc.fechaEmision
    ? new Date(doc.fechaEmision).toLocaleDateString('es-PE')
    : new Date().toLocaleDateString('es-PE');

  pdf.drawText(`Fecha: ${fechaStr}`, 12, y, 7.5, 'F1', [0.2, 0.2, 0.2]);
  y -= 11;
  pdf.drawText(`Cliente: ${(receptor.businessName || 'Cliente').substring(0, 26)}`, 12, y, 7.5, 'F2', [0.1, 0.1, 0.1]);
  y -= 11;
  pdf.drawText(`${docTypeLabel}: ${receptor.docNumber || '00000000'}`, 12, y, 7.5, 'F3', [0.2, 0.2, 0.2]);
  y -= 11;

  if (doc.numeroPedido) {
    pdf.drawText(`Pedido: ${doc.numeroPedido}`, 12, y, 7.5, 'F1', [0.3, 0.3, 0.3]);
    y -= 11;
  }

  if (isGre && doc.greData) {
    const gre = doc.greData;
    pdf.drawText(`Traslado: ${gre.motivoTraslado || 'VENTA'} (${gre.modalidadTransporte})`, 12, y, 7, 'F2', [0.1, 0.3, 0.6]);
    y -= 10;
    pdf.drawText(`Llegada: ${(gre.puntoLlegada || '').substring(0, 30)}`, 12, y, 6.5, 'F1', [0.3, 0.3, 0.3]);
    y -= 10;
    if (gre.conductor) {
      pdf.drawText(`Placa: ${gre.conductor.placaVehiculo} | Brevete: ${gre.conductor.licencia}`, 12, y, 6.5, 'F1', [0.2, 0.2, 0.2]);
      y -= 10;
    }
  }

  y -= 4;
  pdf.drawLine(10, y, width - 10, y, [0.7, 0.7, 0.7], 1);
  y -= 12;

  pdf.drawText('Cant  Descripcion', 12, y, 7.5, 'F2', [0.1, 0.1, 0.1]);
  if (!isGre) {
    pdf.drawRightText('Total', width - 12, y, 7.5, 'F2', [0.1, 0.1, 0.1]);
  } else {
    pdf.drawRightText('Peso', width - 12, y, 7.5, 'F2', [0.1, 0.1, 0.1]);
  }
  y -= 11;

  const items = doc.items && doc.items.length > 0
    ? doc.items
    : [{ sku: 'EV-ITEM', nombre: 'Bien o repuesto electrico', cantidad: 1, precioUnitario: Number(doc.totalComprobante || 0), subtotal: Number(doc.totalComprobante || 0) }];

  items.forEach((it) => {
    pdf.drawText(`${it.cantidad}x ${(it.nombre || 'Item').substring(0, 22)}`, 12, y, 7, 'F1', [0.15, 0.15, 0.15]);
    if (!isGre) {
      pdf.drawRightText((Number(it.subtotal) || 0).toFixed(2), width - 12, y, 7, 'F2', [0.1, 0.1, 0.1]);
    } else {
      const peso = it.pesoKg ? it.pesoKg.toFixed(1) : ((it.cantidad || 1) * 2.5).toFixed(1);
      pdf.drawRightText(`${peso}k`, width - 12, y, 7, 'F1', [0.2, 0.2, 0.2]);
    }
    y -= 11;
  });

  y -= 4;
  pdf.drawLine(10, y, width - 10, y, [0.85, 0.85, 0.85], 0.5);
  y -= 12;

  if (!isGre) {
    pdf.drawText('Op. Gravada:', 12, y, 7.5, 'F1', [0.3, 0.3, 0.3]);
    pdf.drawRightText(`S/ ${(Number(doc.totalGravada) || 0).toFixed(2)}`, width - 12, y, 7.5, 'F1', [0.1, 0.1, 0.1]);
    y -= 11;

    pdf.drawText('IGV (18%):', 12, y, 7.5, 'F1', [0.3, 0.3, 0.3]);
    pdf.drawRightText(`S/ ${(Number(doc.totalIgv) || 0).toFixed(2)}`, width - 12, y, 7.5, 'F1', [0.1, 0.1, 0.1]);
    y -= 13;

    pdf.drawText('TOTAL:', 12, y, 9, 'F2', [0.05, 0.1, 0.2]);
    pdf.drawRightText(`S/ ${(Number(doc.totalComprobante) || 0).toFixed(2)}`, width - 12, y, 9.5, 'F2', [0.8, 0.1, 0.1]);
    y -= 16;
  } else {
    const totalPeso = doc.greData?.pesoBrutoTotalKg || items.reduce((acc, it) => acc + (it.pesoKg || it.cantidad * 2.5), 0);
    pdf.drawText('PESO TOTAL:', 12, y, 8, 'F2', [0.1, 0.1, 0.1]);
    pdf.drawRightText(`${Number(totalPeso).toFixed(2)} KG`, width - 12, y, 8, 'F2', [0.1, 0.1, 0.1]);
    y -= 14;
  }

  pdf.drawLine(10, y, width - 10, y, [0.7, 0.7, 0.7], 1);
  y -= 12;
  pdf.drawCenteredText('¡Gracias por impulsar la movilidad electrica!', y, 7, 'F2', [0.3, 0.3, 0.3]);
  y -= 10;
  pdf.drawCenteredText('Comprobante emitido conforme normativa SUNAT', y, 6, 'F1', [0.5, 0.5, 0.5]);

  return pdf.buildBuffer();
}

/**
 * Genera el XML UBL 2.1 estructurado de acuerdo a las especificaciones OASIS y SUNAT.
 */
export function generateUbl21Xml(doc) {
  const isGre = doc.tipo === 'GUIA_REMISION';
  const cleanSerie = (doc.serie || (isGre ? 'T001' : 'B001')).trim().toUpperCase();
  const cleanNum = String(doc.numero || '000001').replace(/^.*-/, '').padStart(6, '0');
  const fullId = `${cleanSerie}-${cleanNum}`;
  const fecha = doc.fechaEmision ? doc.fechaEmision.split('T')[0] : new Date().toISOString().split('T')[0];
  const hora = doc.fechaEmision && doc.fechaEmision.includes('T')
    ? doc.fechaEmision.split('T')[1].substring(0, 8)
    : '12:00:00';

  const customerDocScheme = doc.datosReceptor?.docType === 'RUC' ? '6' : '1';
  const invoiceTypeCode = doc.tipo === 'FACTURA' ? '01' : '03';

  const items = doc.items && doc.items.length > 0
    ? doc.items
    : [{
        sku: 'EV-ITEM',
        nombre: 'Repuesto o Servicio Tecnico de Traccion',
        cantidad: 1,
        precioUnitario: Number(doc.totalComprobante || 0),
        subtotal: Number(doc.totalComprobante || 0),
        pesoKg: 2.5,
      }];

  if (isGre) {
    const gre = doc.greData || {};
    const totalPeso = gre.pesoBrutoTotalKg || items.reduce((acc, it) => acc + (it.pesoKg || it.cantidad * 2.5), 0);

    return `<?xml version="1.0" encoding="UTF-8"?>
<DespatchAdvice xmlns="urn:oasis:names:specification:ubl:schema:xsd:DespatchAdvice-2"
  xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
  xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
  xmlns:ds="http://www.w3.org/2000/09/xmldsig#"
  xmlns:ext="urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2">
  <ext:UBLExtensions>
    <ext:UBLExtension>
      <ext:ExtensionContent />
    </ext:UBLExtension>
  </ext:UBLExtensions>
  <cbc:UBLVersionID>2.1</cbc:UBLVersionID>
  <cbc:CustomizationID>2.0</cbc:CustomizationID>
  <cbc:ID>${fullId}</cbc:ID>
  <cbc:IssueDate>${fecha}</cbc:IssueDate>
  <cbc:IssueTime>${hora}</cbc:IssueTime>
  <cbc:DespatchAdviceTypeCode listAgencyName="PE:SUNAT" listName="Tipo de Guia">09</cbc:DespatchAdviceTypeCode>

  <!-- Remitente (NERO ELECTRIC MOTORS S.A.C.) -->
  <cac:DespatchSupplierParty>
    <cac:Party>
      <cac:PartyIdentification>
        <cbc:ID schemeAgencyName="PE:SUNAT" schemeID="6" schemeName="Documento de Identidad">20613074342</cbc:ID>
      </cac:PartyIdentification>
      <cac:PartyLegalEntity>
        <cbc:RegistrationName><![CDATA[NERO ELECTRIC MOTORS S.A.C.]]></cbc:RegistrationName>
      </cac:PartyLegalEntity>
    </cac:Party>
  </cac:DespatchSupplierParty>

  <!-- Destinatario -->
  <cac:DeliveryCustomerParty>
    <cac:Party>
      <cac:PartyIdentification>
        <cbc:ID schemeAgencyName="PE:SUNAT" schemeID="${customerDocScheme}" schemeName="Documento de Identidad">${escapeXml(doc.datosReceptor?.docNumber || '00000000')}</cbc:ID>
      </cac:PartyIdentification>
      <cac:PartyLegalEntity>
        <cbc:RegistrationName><![CDATA[${escapeXml(doc.datosReceptor?.businessName || 'Destinatario')}]]></cbc:RegistrationName>
      </cac:PartyLegalEntity>
    </cac:Party>
  </cac:DeliveryCustomerParty>

  <!-- Tramo de Traslado -->
  <cac:Shipment>
    <cbc:ID>1</cbc:ID>
    <cbc:HandlingCode listAgencyName="PE:SUNAT" listName="Motivo de Traslado">${gre.motivoTraslado === 'COMPRA' ? '02' : '01'}</cbc:HandlingCode>
    <cbc:GrossWeightMeasure unitCode="KGM">${Number(totalPeso).toFixed(2)}</cbc:GrossWeightMeasure>
    <cac:ShipmentStage>
      <cbc:TransportModeCode listAgencyName="PE:SUNAT" listName="Modalidad de Transporte">${gre.modalidadTransporte === 'PUBLICO' ? '01' : '02'}</cbc:TransportModeCode>
      <cac:TransitPeriod>
        <cbc:StartDate>${gre.fechaInicioTraslado || fecha}</cbc:StartDate>
      </cac:TransitPeriod>
      ${gre.modalidadTransporte === 'PRIVADO' && gre.conductor ? `
      <cac:DriverPerson>
        <cbc:ID schemeAgencyName="PE:SUNAT" schemeID="1">${escapeXml(gre.conductor.docNumber)}</cbc:ID>
        <cbc:FirstName>${escapeXml(gre.conductor.nombre)}</cbc:FirstName>
        <cac:IdentityDocumentReference>
          <cbc:ID>${escapeXml(gre.conductor.licencia)}</cbc:ID>
        </cac:IdentityDocumentReference>
      </cac:DriverPerson>` : ''}
    </cac:ShipmentStage>
    <cac:DeliveryAddress>
      <cbc:StreetName><![CDATA[${escapeXml(gre.puntoLlegada || doc.datosReceptor?.direccion || 'Destino final')}]]></cbc:StreetName>
    </cac:DeliveryAddress>
    <cac:OriginAddress>
      <cbc:StreetName><![CDATA[${escapeXml(gre.puntoPartida || 'Av. Cesar Canevaro 1332, Lince, Lima')}]]></cbc:StreetName>
    </cac:OriginAddress>
  </cac:Shipment>

  <!-- Líneas de Detalle -->
  ${items.map((it, idx) => `
  <cac:DespatchLine>
    <cbc:ID>${idx + 1}</cbc:ID>
    <cbc:DeliveredQuantity unitCode="NIU">${it.cantidad}</cbc:DeliveredQuantity>
    <cac:OrderLineReference>
      <cbc:LineID>${idx + 1}</cbc:LineID>
    </cac:OrderLineReference>
    <cac:Item>
      <cbc:Description><![CDATA[${escapeXml(it.nombre)}]]></cbc:Description>
      <cac:SellersItemIdentification>
        <cbc:ID>${escapeXml(it.sku || `ITEM-${idx + 1}`)}</cbc:ID>
      </cac:SellersItemIdentification>
    </cac:Item>
  </cac:DespatchLine>`).join('')}
</DespatchAdvice>`;
  }

  // Si es Boleta o Factura
  return `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
  xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
  xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
  xmlns:ds="http://www.w3.org/2000/09/xmldsig#"
  xmlns:ext="urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2">
  <ext:UBLExtensions>
    <ext:UBLExtension>
      <ext:ExtensionContent />
    </ext:UBLExtension>
  </ext:UBLExtensions>
  <cbc:UBLVersionID>2.1</cbc:UBLVersionID>
  <cbc:CustomizationID>2.0</cbc:CustomizationID>
  <cbc:ID>${fullId}</cbc:ID>
  <cbc:IssueDate>${fecha}</cbc:IssueDate>
  <cbc:IssueTime>${hora}</cbc:IssueTime>
  <cbc:InvoiceTypeCode listAgencyName="PE:SUNAT" listName="Tipo de Documento">${invoiceTypeCode}</cbc:InvoiceTypeCode>
  <cbc:DocumentCurrencyCode listAgencyName="ISO 4217" listName="Moneda">PEN</cbc:DocumentCurrencyCode>

  <!-- Emisor -->
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyIdentification>
        <cbc:ID schemeAgencyName="PE:SUNAT" schemeID="6" schemeName="Documento de Identidad">20613074342</cbc:ID>
      </cac:PartyIdentification>
      <cac:PartyName>
        <cbc:Name><![CDATA[NERO ELECTRIC MOTORS]]></cbc:Name>
      </cac:PartyName>
      <cac:PartyLegalEntity>
        <cbc:RegistrationName><![CDATA[NERO ELECTRIC MOTORS S.A.C.]]></cbc:RegistrationName>
        <cac:RegistrationAddress>
          <cbc:AddressLine>
            <cbc:Line><![CDATA[Av. Cesar Canevaro 1332, Lince, Lima - Peru]]></cbc:Line>
          </cbc:AddressLine>
        </cac:RegistrationAddress>
      </cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingSupplierParty>

  <!-- Receptor / Cliente -->
  <cac:AccountingCustomerParty>
    <cac:Party>
      <cac:PartyIdentification>
        <cbc:ID schemeAgencyName="PE:SUNAT" schemeID="${customerDocScheme}" schemeName="Documento de Identidad">${escapeXml(doc.datosReceptor?.docNumber || '00000000')}</cbc:ID>
      </cac:PartyIdentification>
      <cac:PartyLegalEntity>
        <cbc:RegistrationName><![CDATA[${escapeXml(doc.datosReceptor?.businessName || 'Cliente Particular')}]]></cbc:RegistrationName>
      </cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingCustomerParty>

  <!-- Desglose de Tributos (IGV 18%) -->
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="PEN">${Number(doc.totalIgv || 0).toFixed(2)}</cbc:TaxAmount>
    <cac:TaxSubtotal>
      <cbc:TaxableAmount currencyID="PEN">${Number(doc.totalGravada || 0).toFixed(2)}</cbc:TaxableAmount>
      <cbc:TaxAmount currencyID="PEN">${Number(doc.totalIgv || 0).toFixed(2)}</cbc:TaxAmount>
      <cac:TaxCategory>
        <cac:TaxScheme>
          <cbc:ID schemeAgencyName="PE:SUNAT" schemeID="UN/ECE 5153" schemeName="Codigo de tributos">1000</cbc:ID>
          <cbc:Name>IGV</cbc:Name>
          <cbc:TaxTypeCode>VAT</cbc:TaxTypeCode>
        </cac:TaxScheme>
      </cac:TaxCategory>
    </cac:TaxSubtotal>
  </cac:TaxTotal>

  <!-- Importes Totales -->
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="PEN">${Number(doc.totalGravada || 0).toFixed(2)}</cbc:LineExtensionAmount>
    <cbc:TaxInclusiveAmount currencyID="PEN">${Number(doc.totalComprobante || 0).toFixed(2)}</cbc:TaxInclusiveAmount>
    <cbc:PayableAmount currencyID="PEN">${Number(doc.totalComprobante || 0).toFixed(2)}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>

  <!-- Líneas de Detalle -->
  ${items.map((it, idx) => `
  <cac:InvoiceLine>
    <cbc:ID>${idx + 1}</cbc:ID>
    <cbc:InvoicedQuantity unitCode="NIU">${it.cantidad}</cbc:InvoicedQuantity>
    <cbc:LineExtensionAmount currencyID="PEN">${(it.subtotal / 1.18).toFixed(2)}</cbc:LineExtensionAmount>
    <cac:PricingReference>
      <cac:AlternativeConditionPrice>
        <cbc:PriceAmount currencyID="PEN">${Number(it.precioUnitario).toFixed(2)}</cbc:PriceAmount>
        <cbc:PriceTypeCode listAgencyName="PE:SUNAT" listName="Tipo de Precio">01</cbc:PriceTypeCode>
      </cac:AlternativeConditionPrice>
    </cac:PricingReference>
    <cac:TaxTotal>
      <cbc:TaxAmount currencyID="PEN">${(it.subtotal - (it.subtotal / 1.18)).toFixed(2)}</cbc:TaxAmount>
      <cac:TaxSubtotal>
        <cbc:TaxableAmount currencyID="PEN">${(it.subtotal / 1.18).toFixed(2)}</cbc:TaxableAmount>
        <cbc:TaxAmount currencyID="PEN">${(it.subtotal - (it.subtotal / 1.18)).toFixed(2)}</cbc:TaxAmount>
        <cac:TaxCategory>
          <cbc:Percent>18.00</cbc:Percent>
          <cbc:TaxExemptionReasonCode listAgencyName="PE:SUNAT" listName="Afectacion del IGV">10</cbc:TaxExemptionReasonCode>
          <cac:TaxScheme>
            <cbc:ID>1000</cbc:ID>
            <cbc:Name>IGV</cbc:Name>
            <cbc:TaxTypeCode>VAT</cbc:TaxTypeCode>
          </cac:TaxScheme>
        </cac:TaxCategory>
      </cac:TaxSubtotal>
    </cac:TaxTotal>
    <cac:Item>
      <cbc:Description><![CDATA[${escapeXml(it.nombre)}]]></cbc:Description>
      <cac:SellersItemIdentification>
        <cbc:ID>${escapeXml(it.sku || `ITEM-${idx + 1}`)}</cbc:ID>
      </cac:SellersItemIdentification>
    </cac:Item>
    <cac:Price>
      <cbc:PriceAmount currencyID="PEN">${(it.precioUnitario / 1.18).toFixed(2)}</cbc:PriceAmount>
    </cac:Price>
  </cac:InvoiceLine>`).join('')}
</Invoice>`;
}

function escapeXml(unsafe) {
  return String(unsafe || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Obtiene el nombre canónico de archivo para exportación.
 * Ejemplos:
 * - B001-660064-A4.pdf
 * - B001-660064-80mm.pdf
 * - B001-660064.xml
 */
export function getDocumentFileName(serie, numero, format) {
  const cleanSerie = (serie || 'DOC').trim().toUpperCase();
  const cleanNum = String(numero || '000001').replace(/^.*-/, '').padStart(6, '0');
  const base = `${cleanSerie}-${cleanNum}`;

  switch (format) {
    case 'a4':
      return `${base}-A4.pdf`;
    case '80mm':
      return `${base}-80mm.pdf`;
    case 'xml':
      return `${base}.xml`;
    default:
      return `${base}.${format}`;
  }
}

/**
 * Corrige URLs de imágenes de Century Motors que devuelven 404 con .webp a .jpg
 */
export function resolveCenturyMotorsImageUrl(url) {
  if (!url || typeof url !== 'string') return null;
  if (url.includes('centurymotors.pe') && url.endsWith('.webp')) {
    return url.replace(/\.webp$/, '.jpg');
  }
  return url;
}
