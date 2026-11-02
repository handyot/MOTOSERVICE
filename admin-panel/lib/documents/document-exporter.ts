/**
 * MOTOSERVICE / NERO Electric Motors - Generador de Comprobantes Fiscales y Guías de Remisión
 * 
 * Implementa:
 * 1. Generación de PDF A4 (estándar de página completa para archivo e impresión comercial).
 * 2. Generación de PDF Térmico 80 mm (formato compacto para ticketeras y POS).
 * 3. Generación de XML UBL 2.1 (especificación OASIS y normativa SUNAT para Facturas, Boletas y GRE).
 * 
 * Generador nativo puro sin dependencias externas binarias, compatible 100% con Vercel Serverless.
 */

export interface DocumentItemData {
  sku?: string;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  unidad?: string;
  pesoKg?: number;
}

export interface DocumentFiscalData {
  id?: string;
  tipo: 'BOLETA' | 'FACTURA' | 'GUIA_REMISION';
  serie: string;
  numero: string;
  fechaEmision?: string;
  moneda?: string;
  datosReceptor: {
    docType: 'DNI' | 'RUC';
    docNumber: string;
    businessName: string;
    direccion?: string;
    departamento?: string;
    provincia?: string;
    distrito?: string;
  };
  totalGravada: number;
  totalIgv: number;
  totalComprobante: number;
  descuento?: number;
  costoEnvio?: number;
  numeroPedido?: string;
  items: DocumentItemData[];
  observaciones?: string;
  // Campos específicos de Guía de Remisión (GRE)
  greData?: {
    motivoTraslado: string; // ej. "VENTA", "TRASLADO_ENTRE_ESTABLECIMIENTOS"
    modalidadTransporte: 'PRIVADO' | 'PUBLICO';
    fechaInicioTraslado: string;
    puntoPartida: string;
    puntoLlegada: string;
    pesoBrutoTotalKg: number;
    // Si modalidad == 'PRIVADO'
    conductor?: {
      nombre: string;
      docType: 'DNI';
      docNumber: string;
      licencia: string;
      placaVehiculo: string;
      marcaVehiculo?: string;
    };
    // Si modalidad == 'PUBLICO'
    transportista?: {
      razonSocial: string;
      ruc: string;
    };
    comprobanteAsociado?: {
      tipo: string;
      serieNumero: string;
    };
  };
}

// ==============================================================================
// 1. MOTOR NATIVO DE PDF 1.4
// ==============================================================================

class SimplePdfBuilder {
  private width: number;
  private height: number;
  private streamContent: string = '';

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  private sanitizeText(text: string): string {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/\(/g, '\\(')
      .replace(/\)/g, '\\)')
      // Reemplazo de caracteres con tilde para fuentes estándar Type 1 Helvetica
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

  drawText(
    text: string,
    x: number,
    y: number,
    fontSize: number = 10,
    font: 'F1' | 'F2' | 'F3' = 'F1',
    rgb: [number, number, number] = [0.1, 0.1, 0.1]
  ) {
    const clean = this.sanitizeText(text);
    this.streamContent += `q\n${rgb[0]} ${rgb[1]} ${rgb[2]} rg\nBT\n/${font} ${fontSize} Tf\n1 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)} Tm\n(${clean}) Tj\nET\nQ\n`;
  }

  drawCenteredText(
    text: string,
    y: number,
    fontSize: number = 10,
    font: 'F1' | 'F2' | 'F3' = 'F1',
    rgb: [number, number, number] = [0.1, 0.1, 0.1]
  ) {
    // Estimación de ancho promedio de caracter ~0.55 * fontSize
    const approxWidth = text.length * fontSize * 0.52;
    const x = Math.max(10, (this.width - approxWidth) / 2);
    this.drawText(text, x, y, fontSize, font, rgb);
  }

  drawRightText(
    text: string,
    rightX: number,
    y: number,
    fontSize: number = 10,
    font: 'F1' | 'F2' | 'F3' = 'F1',
    rgb: [number, number, number] = [0.1, 0.1, 0.1]
  ) {
    const approxWidth = text.length * fontSize * 0.52;
    const x = Math.max(10, rightX - approxWidth);
    this.drawText(text, x, y, fontSize, font, rgb);
  }

  drawRect(
    x: number,
    y: number,
    w: number,
    h: number,
    strokeRgb: [number, number, number] = [0.8, 0.8, 0.8],
    fillRgb?: [number, number, number],
    lineWidth: number = 1
  ) {
    this.streamContent += `q\n${lineWidth} w\n${strokeRgb[0]} ${strokeRgb[1]} ${strokeRgb[2]} RG\n`;
    if (fillRgb) {
      this.streamContent += `${fillRgb[0]} ${fillRgb[1]} ${fillRgb[2]} rg\n`;
      this.streamContent += `${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re B\n`;
    } else {
      this.streamContent += `${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re S\n`;
    }
    this.streamContent += `Q\n`;
  }

  drawLine(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    strokeRgb: [number, number, number] = [0.8, 0.8, 0.8],
    lineWidth: number = 1
  ) {
    this.streamContent += `q\n${lineWidth} w\n${strokeRgb[0]} ${strokeRgb[1]} ${strokeRgb[2]} RG\n${x1.toFixed(2)} ${y1.toFixed(2)} m\n${x2.toFixed(2)} ${y2.toFixed(2)} l S\nQ\n`;
  }

  buildBuffer(): Buffer {
    const streamLen = Buffer.byteLength(this.streamContent, 'utf8');

    const objects: string[] = [];
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
    const xref: number[] = [0];

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

// ==============================================================================
// 2. GENERADORES PDF: FORMATO A4 Y TÉRMICO 80 MM
// ==============================================================================

/**
 * Genera la representación impresa en PDF A4 de un Comprobante Fiscal o Guía de Remisión.
 */
export function generatePdfA4(doc: DocumentFiscalData): Buffer {
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

  // Línea divisoria superior
  pdf.drawLine(45, height - 130, width - 45, height - 130, [0.85, 0.85, 0.88], 1);

  // 3. Bloque de Datos del Receptor / Cliente
  const clientY = height - 150;
  pdf.drawRect(45, clientY - 50, width - 90, 60, [0.88, 0.88, 0.9], [0.98, 0.98, 0.99], 1);

  const receptorNombre = doc.datosReceptor.businessName || 'Cliente Particular';
  const receptorDocType = doc.datosReceptor.docType || (doc.tipo === 'FACTURA' ? 'RUC' : 'DNI');
  const receptorDocNum = doc.datosReceptor.docNumber || 'S/N';
  const fechaStr = doc.fechaEmision ? new Date(doc.fechaEmision).toLocaleDateString('es-PE') : new Date().toLocaleDateString('es-PE');

  pdf.drawText(`Senor(es): ${receptorNombre.slice(0, 50)}`, 55, clientY - 5, 9, 'F2');
  pdf.drawText(`${receptorDocType}: ${receptorDocNum}`, 55, clientY - 20, 9, 'F1');
  if (doc.datosReceptor.direccion) {
    pdf.drawText(`Direccion: ${doc.datosReceptor.direccion.slice(0, 75)}`, 55, clientY - 35, 8.5, 'F1', [0.35, 0.35, 0.35]);
  } else {
    pdf.drawText('Modalidad: Entrega a Domicilio / Recojo en Local', 55, clientY - 35, 8.5, 'F1', [0.4, 0.4, 0.4]);
  }

  pdf.drawText(`Fecha Emision: ${fechaStr}`, 380, clientY - 5, 9, 'F1');
  pdf.drawText(`Moneda: SOLES (PEN)`, 380, clientY - 20, 9, 'F1');
  if (doc.numeroPedido) {
    pdf.drawText(`Pedido Nro: ${doc.numeroPedido}`, 380, clientY - 35, 8.5, 'F2', [0.1, 0.2, 0.5]);
  }

  let tableTopY = clientY - 70;

  // 4. Si es GUIA DE REMISIÓN: Sección de Datos de Traslado y Transporte
  if (isGre && doc.greData) {
    const gre = doc.greData;
    pdf.drawRect(45, tableTopY - 60, width - 90, 65, [0.85, 0.85, 0.88], [0.97, 0.98, 0.99], 1);
    pdf.drawText(`Motivo de Traslado: ${gre.motivoTraslado}`, 55, tableTopY - 12, 8.5, 'F2');
    pdf.drawText(`Modalidad de Transporte: ${gre.modalidadTransporte === 'PRIVADO' ? 'Transporte Privado' : 'Transporte Publico'}`, 240, tableTopY - 12, 8.5, 'F2');
    pdf.drawText(`Inicio de Traslado: ${gre.fechaInicioTraslado}`, 420, tableTopY - 12, 8.5, 'F1');

    pdf.drawText(`Punto de Partida: ${gre.puntoPartida.slice(0, 65)}`, 55, tableTopY - 27, 8, 'F1', [0.3, 0.3, 0.3]);
    pdf.drawText(`Punto de Llegada: ${gre.puntoLlegada.slice(0, 65)}`, 55, tableTopY - 40, 8, 'F1', [0.3, 0.3, 0.3]);

    if (gre.modalidadTransporte === 'PRIVADO' && gre.conductor) {
      pdf.drawText(
        `Vehiculo/Conductor: Placa ${gre.conductor.placaVehiculo} | Licencia ${gre.conductor.licencia} | Chofer: ${gre.conductor.nombre.slice(0, 25)}`,
        55,
        tableTopY - 53,
        8,
        'F1',
        [0.2, 0.4, 0.2]
      );
    } else if (gre.modalidadTransporte === 'PUBLICO' && gre.transportista) {
      pdf.drawText(
        `Transportista: ${gre.transportista.razonSocial.slice(0, 40)} (RUC: ${gre.transportista.ruc})`,
        55,
        tableTopY - 53,
        8,
        'F1',
        [0.2, 0.4, 0.2]
      );
    }
    tableTopY -= 75;
  }

  // 5. Tabla de Items / Bienes Transportados
  pdf.drawRect(45, tableTopY - 18, width - 90, 20, [0.1, 0.15, 0.25], [0.1, 0.15, 0.25]);
  pdf.drawText('ITEM', 55, tableTopY - 13, 8.5, 'F2', [1, 1, 1]);
  pdf.drawText('CODIGO SKU', 85, tableTopY - 13, 8.5, 'F2', [1, 1, 1]);
  pdf.drawText('DESCRIPCION DE PRODUCTO', 170, tableTopY - 13, 8.5, 'F2', [1, 1, 1]);
  pdf.drawText('CANT.', 370, tableTopY - 13, 8.5, 'F2', [1, 1, 1]);
  if (isGre) {
    pdf.drawText('UNIDAD', 430, tableTopY - 13, 8.5, 'F2', [1, 1, 1]);
    pdf.drawText('PESO BRUTO', 490, tableTopY - 13, 8.5, 'F2', [1, 1, 1]);
  } else {
    pdf.drawText('P. UNIT', 420, tableTopY - 13, 8.5, 'F2', [1, 1, 1]);
    pdf.drawText('SUBTOTAL', 490, tableTopY - 13, 8.5, 'F2', [1, 1, 1]);
  }

  let rowY = tableTopY - 35;
  const items = doc.items && doc.items.length > 0 ? doc.items : [
    { sku: 'MS-ITEM', nombre: 'Repuesto o Servicio Tecnico', cantidad: 1, precioUnitario: Number(doc.totalComprobante), subtotal: Number(doc.totalComprobante) }
  ];

  items.slice(0, 15).forEach((item, index) => {
    const isEven = index % 2 === 0;
    if (isEven) {
      pdf.drawRect(45, rowY - 6, width - 90, 18, [0.95, 0.95, 0.95], [0.97, 0.97, 0.98]);
    }
    pdf.drawText(String(index + 1).padStart(2, '0'), 55, rowY, 8.5, 'F1');
    pdf.drawText((item.sku || 'N/A').slice(0, 12), 85, rowY, 8, 'F3');
    pdf.drawText((item.nombre || 'Item').slice(0, 36), 170, rowY, 8.5, 'F1');
    pdf.drawText(String(item.cantidad || 1), 375, rowY, 8.5, 'F1');

    if (isGre) {
      pdf.drawText(item.unidad || 'NIU', 435, rowY, 8.5, 'F1');
      pdf.drawText(`${(item.pesoKg || (item.cantidad * 2.5)).toFixed(1)} KG`, 495, rowY, 8.5, 'F1');
    } else {
      pdf.drawText(`S/ ${Number(item.precioUnitario || 0).toFixed(2)}`, 420, rowY, 8.5, 'F1');
      pdf.drawText(`S/ ${Number(item.subtotal || 0).toFixed(2)}`, 490, rowY, 8.5, 'F2');
    }

    rowY -= 20;
  });

  // Línea de cierre de tabla
  pdf.drawLine(45, rowY + 5, width - 45, rowY + 5, [0.8, 0.8, 0.85], 1);

  // 6. Bloque de Totales y Liquidación Tributaria
  if (!isGre) {
    const totalsX = 360;
    const totalsY = Math.max(120, rowY - 15);

    pdf.drawRect(totalsX, totalsY - 60, width - totalsX - 45, 65, [0.85, 0.85, 0.9], [0.98, 0.98, 1.0], 1);
    pdf.drawText('Op. Gravada (Base IGV):', totalsX + 10, totalsY - 12, 8.5, 'F1');
    pdf.drawRightText(`S/ ${Number(doc.totalGravada || 0).toFixed(2)}`, width - 55, totalsY - 12, 8.5, 'F2');

    pdf.drawText('I.G.V. (18%):', totalsX + 10, totalsY - 26, 8.5, 'F1');
    pdf.drawRightText(`S/ ${Number(doc.totalIgv || 0).toFixed(2)}`, width - 55, totalsY - 26, 8.5, 'F2');

    pdf.drawLine(totalsX + 10, totalsY - 33, width - 55, totalsY - 33, [0.8, 0.8, 0.85]);

    pdf.drawText('IMPORTE TOTAL:', totalsX + 10, totalsY - 48, 10, 'F2', [0.05, 0.1, 0.2]);
    pdf.drawRightText(`S/ ${Number(doc.totalComprobante || 0).toFixed(2)}`, width - 55, totalsY - 48, 11, 'F2', [0.8, 0.1, 0.1]);
  } else {
    // Para Guía de Remisión: Resumen de Carga
    const totalsX = 360;
    const totalsY = Math.max(120, rowY - 15);
    const pesoTotal = doc.greData?.pesoBrutoTotalKg || items.reduce((acc, it) => acc + (it.pesoKg || (it.cantidad * 2.5)), 0);

    pdf.drawRect(totalsX, totalsY - 40, width - totalsX - 45, 45, [0.85, 0.85, 0.9], [0.98, 0.98, 1.0], 1);
    pdf.drawText('Bultos / Paquetes:', totalsX + 10, totalsY - 15, 8.5, 'F1');
    pdf.drawRightText(`${items.length}`, width - 55, totalsY - 15, 9, 'F2');
    pdf.drawText('Peso Bruto Total:', totalsX + 10, totalsY - 30, 9, 'F2');
    pdf.drawRightText(`${pesoTotal.toFixed(1)} KG`, width - 55, totalsY - 30, 10, 'F2', [0.1, 0.4, 0.1]);
  }

  // 7. Pie de Página y Advertencia Normativa
  pdf.drawLine(45, 75, width - 45, 75, [0.85, 0.85, 0.88], 1);
  pdf.drawCenteredText(
    'Representacion impresa del Comprobante de Pago Electronico - NERO Electric Motors',
    60,
    7.5,
    'F1',
    [0.4, 0.4, 0.4]
  );
  pdf.drawCenteredText(
    'Consulte la validez de este documento mediante el sistema SEE-OSE SUNAT o contactando a administracion@neroelectricmotors.com',
    48,
    7,
    'F1',
    [0.5, 0.5, 0.5]
  );

  return pdf.buildBuffer();
}

/**
 * Genera la representación impresa en PDF Térmico de 80 mm (ticket POS).
 */
export function generatePdf80mm(doc: DocumentFiscalData): Buffer {
  const width = 226.77; // ~80 mm a 72 dpi
  const height = 620.0;
  const pdf = new SimplePdfBuilder(width, height);

  const isGre = doc.tipo === 'GUIA_REMISION';
  const tipoTitulo = isGre
    ? 'GUIA DE REMISION'
    : doc.tipo === 'FACTURA'
    ? 'FACTURA ELECTRONICA'
    : 'BOLETA DE VENTA';

  const fullSerieNumero = `${doc.serie || (isGre ? 'T001' : 'B001')}-${String(doc.numero || '000001').replace(/^.*-/, '').padStart(6, '0')}`;

  // Encabezado Ticket
  pdf.drawCenteredText('NERO ELECTRIC MOTORS S.A.C.', height - 30, 10, 'F2');
  pdf.drawCenteredText('RUC: 20613074342', height - 42, 8, 'F2', [0.3, 0.3, 0.3]);
  pdf.drawCenteredText('Av. Cesar Canevaro 1332, Lince', height - 53, 7.5, 'F1', [0.4, 0.4, 0.4]);
  pdf.drawCenteredText('Lima - Peru | Tel: 962 250 280', height - 63, 7.5, 'F1', [0.4, 0.4, 0.4]);

  pdf.drawText('----------------------------------------------------', 10, height - 74, 8, 'F3', [0.7, 0.7, 0.7]);
  pdf.drawCenteredText(tipoTitulo, height - 86, 9, 'F2');
  pdf.drawCenteredText(fullSerieNumero, height - 98, 10, 'F2', [0.8, 0.1, 0.1]);
  pdf.drawText('----------------------------------------------------', 10, height - 108, 8, 'F3', [0.7, 0.7, 0.7]);

  // Datos Cliente / Destinatario
  const fechaStr = doc.fechaEmision ? new Date(doc.fechaEmision).toLocaleDateString('es-PE') : new Date().toLocaleDateString('es-PE');
  pdf.drawText(`Fecha: ${fechaStr}`, 12, height - 120, 7.5, 'F1');
  if (doc.numeroPedido) {
    pdf.drawText(`Pedido: ${doc.numeroPedido}`, 12, height - 131, 7.5, 'F2');
  }
  const receptorNombre = doc.datosReceptor.businessName || 'Cliente Particular';
  pdf.drawText(`Cliente: ${receptorNombre.slice(0, 26)}`, 12, height - 143, 7.5, 'F1');
  pdf.drawText(`${doc.datosReceptor.docType || 'DOC'}: ${doc.datosReceptor.docNumber || 'S/N'}`, 12, height - 154, 7.5, 'F1');

  let curY = height - 166;

  if (isGre && doc.greData) {
    pdf.drawText('----------------------------------------------------', 10, curY, 8, 'F3', [0.7, 0.7, 0.7]);
    curY -= 11;
    pdf.drawText(`Motivo: ${doc.greData.motivoTraslado}`, 12, curY, 7.5, 'F2');
    curY -= 11;
    pdf.drawText(`Destino: ${doc.greData.puntoLlegada.slice(0, 30)}`, 12, curY, 7, 'F1');
    curY -= 11;
    if (doc.greData.conductor) {
      pdf.drawText(`Placa: ${doc.greData.conductor.placaVehiculo} | Lic: ${doc.greData.conductor.licencia}`, 12, curY, 7, 'F1');
      curY -= 11;
    }
  }

  pdf.drawText('----------------------------------------------------', 10, curY, 8, 'F3', [0.7, 0.7, 0.7]);
  curY -= 12;

  // Cabecera Items
  pdf.drawText('CANT  DESCRIPCION                 TOTAL', 12, curY, 7.5, 'F2');
  curY -= 10;
  pdf.drawText('----------------------------------------------------', 10, curY, 8, 'F3', [0.7, 0.7, 0.7]);
  curY -= 12;

  const items = doc.items && doc.items.length > 0 ? doc.items : [
    { sku: 'MS-ITEM', nombre: 'Repuesto / Servicio', cantidad: 1, precioUnitario: Number(doc.totalComprobante), subtotal: Number(doc.totalComprobante) }
  ];

  items.slice(0, 8).forEach((item) => {
    // Línea 1: Nombre de producto
    pdf.drawText(item.nombre.slice(0, 32), 12, curY, 7.5, 'F1');
    curY -= 10;
    // Línea 2: Cantidad x P.Unit y Subtotal
    if (isGre) {
      pdf.drawText(` ${item.cantidad} ${item.unidad || 'NIU'}`, 12, curY, 7, 'F1', [0.4, 0.4, 0.4]);
      pdf.drawRightText(`${(item.pesoKg || (item.cantidad * 2.5)).toFixed(1)} KG`, width - 12, curY, 7.5, 'F2');
    } else {
      pdf.drawText(` ${item.cantidad} x S/ ${Number(item.precioUnitario).toFixed(2)}`, 12, curY, 7, 'F1', [0.4, 0.4, 0.4]);
      pdf.drawRightText(`S/ ${Number(item.subtotal).toFixed(2)}`, width - 12, curY, 7.5, 'F2');
    }
    curY -= 13;
  });

  pdf.drawText('----------------------------------------------------', 10, curY, 8, 'F3', [0.7, 0.7, 0.7]);
  curY -= 14;

  if (!isGre) {
    pdf.drawText('Op. Gravada:', 12, curY, 7.5, 'F1');
    pdf.drawRightText(`S/ ${Number(doc.totalGravada || 0).toFixed(2)}`, width - 12, curY, 8, 'F1');
    curY -= 11;

    pdf.drawText('IGV (18%):', 12, curY, 7.5, 'F1');
    pdf.drawRightText(`S/ ${Number(doc.totalIgv || 0).toFixed(2)}`, width - 12, curY, 8, 'F1');
    curY -= 12;

    pdf.drawText('TOTAL A PAGAR:', 12, curY, 9, 'F2');
    pdf.drawRightText(`S/ ${Number(doc.totalComprobante || 0).toFixed(2)}`, width - 12, curY, 9.5, 'F2', [0.8, 0.1, 0.1]);
    curY -= 16;
  } else {
    const pesoTotal = doc.greData?.pesoBrutoTotalKg || items.reduce((acc, it) => acc + (it.pesoKg || (it.cantidad * 2.5)), 0);
    pdf.drawText('PESO BRUTO TOTAL:', 12, curY, 8, 'F2');
    pdf.drawRightText(`${pesoTotal.toFixed(1)} KG`, width - 12, curY, 8.5, 'F2');
    curY -= 16;
  }

  pdf.drawText('----------------------------------------------------', 10, curY, 8, 'F3', [0.7, 0.7, 0.7]);
  curY -= 14;
  pdf.drawCenteredText('¡Gracias por su preferencia!', curY, 8, 'F2');
  curY -= 10;
  pdf.drawCenteredText('Representacion Impresa Autorizada', curY, 6.5, 'F1', [0.5, 0.5, 0.5]);
  curY -= 9;
  pdf.drawCenteredText('www.neroelectricmotors.com', curY, 6.5, 'F1', [0.5, 0.5, 0.5]);

  return pdf.buildBuffer();
}

// ==============================================================================
// 3. GENERADOR XML: UBL 2.1 ESTÁNDAR SUNAT
// ==============================================================================

/**
 * Genera el documento electrónico XML bajo la especificación OASIS UBL 2.1 y directrices SUNAT.
 */
export function generateUbl21Xml(doc: DocumentFiscalData): string {
  const isGre = doc.tipo === 'GUIA_REMISION';
  const issueDate = doc.fechaEmision ? doc.fechaEmision.split('T')[0] : new Date().toISOString().split('T')[0];
  const issueTime = new Date().toTimeString().split(' ')[0];
  const fullSerieNumero = `${doc.serie || (isGre ? 'T001' : 'B001')}-${String(doc.numero || '000001').replace(/^.*-/, '').padStart(6, '0')}`;

  const items = doc.items && doc.items.length > 0 ? doc.items : [
    { sku: 'MS-ITEM', nombre: 'Repuesto o Servicio Tecnico', cantidad: 1, precioUnitario: Number(doc.totalComprobante), subtotal: Number(doc.totalComprobante) }
  ];

  if (isGre) {
    // Guía de Remisión Electrónica - Remitente (DespatchAdvice UBL 2.1)
    const gre = doc.greData || {
      motivoTraslado: 'VENTA',
      modalidadTransporte: 'PRIVADO' as const,
      fechaInicioTraslado: issueDate,
      puntoPartida: 'Av. Cesar Canevaro 1332, Lince, Lima',
      puntoLlegada: doc.datosReceptor.direccion || 'Lima, Peru',
      pesoBrutoTotalKg: items.reduce((acc, it) => acc + (it.pesoKg || (it.cantidad * 2.5)), 0),
    };

    return `<?xml version="1.0" encoding="UTF-8"?>
<DespatchAdvice xmlns="urn:oasis:names:specification:ubl:schema:xsd:DespatchAdvice-2"
                xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
                xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
                xmlns:ds="http://www.w3.org/2000/09/xmldsig#"
                xmlns:ext="urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2">
  <ext:UBLExtensions>
    <ext:UBLExtension>
      <ext:ExtensionContent>
        <!-- Firma digital UBL preparada para certificado tributario SEE-OSE -->
      </ext:ExtensionContent>
    </ext:UBLExtension>
  </ext:UBLExtensions>
  <cbc:UBLVersionID>2.1</cbc:UBLVersionID>
  <cbc:CustomizationID>2.0</cbc:CustomizationID>
  <cbc:ID>${escapeXml(fullSerieNumero)}</cbc:ID>
  <cbc:IssueDate>${issueDate}</cbc:IssueDate>
  <cbc:IssueTime>${issueTime}</cbc:IssueTime>
  <cbc:DespatchAdviceTypeCode listAgencyName="PE:SUNAT" listName="Tipo de Documento" listURI="urn:pe:gob:sunat:cpe:see:gem:catalogos:catalogo01">09</cbc:DespatchAdviceTypeCode>
  
  <!-- Referencia a Comprobante de Pago Relacionado -->
  ${doc.numeroPedido ? `<cac:AdditionalDocumentReference>
    <cbc:ID>${escapeXml(doc.numeroPedido)}</cbc:ID>
    <cbc:DocumentTypeCode listAgencyName="PE:SUNAT" listName="Documento Relacionado">01</cbc:DocumentTypeCode>
  </cac:AdditionalDocumentReference>` : ''}

  <!-- Datos del Remitente -->
  <cac:DespatchSupplierParty>
    <cac:Party>
      <cac:PartyIdentification>
        <cbc:ID schemeAgencyName="PE:SUNAT" schemeID="6" schemeName="Documento de Identidad" schemeURI="urn:pe:gob:sunat:cpe:see:gem:catalogos:catalogo06">20613074342</cbc:ID>
      </cac:PartyIdentification>
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>NERO ELECTRIC MOTORS S.A.C.</cbc:RegistrationName>
      </cac:PartyLegalEntity>
    </cac:Party>
  </cac:DespatchSupplierParty>

  <!-- Datos del Destinatario -->
  <cac:DeliveryCustomerParty>
    <cac:Party>
      <cac:PartyIdentification>
        <cbc:ID schemeAgencyName="PE:SUNAT" schemeID="${doc.datosReceptor.docType === 'RUC' ? '6' : '1'}" schemeName="Documento de Identidad">${escapeXml(doc.datosReceptor.docNumber || '00000000')}</cbc:ID>
      </cac:PartyIdentification>
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>${escapeXml(doc.datosReceptor.businessName || 'Cliente Particular')}</cbc:RegistrationName>
      </cac:PartyLegalEntity>
    </cac:Party>
  </cac:DeliveryCustomerParty>

  <!-- Datos del Envío y Traslado -->
  <cac:Shipment>
    <cbc:ID>1</cbc:ID>
    <cbc:HandlingCode listAgencyName="PE:SUNAT" listName="Motivo de Traslado">${gre.motivoTraslado === 'VENTA' ? '01' : '13'}</cbc:HandlingCode>
    <cbc:Information>${escapeXml(gre.motivoTraslado)}</cbc:Information>
    <cbc:GrossWeightMeasure unitCode="KGM">${gre.pesoBrutoTotalKg.toFixed(2)}</cbc:GrossWeightMeasure>
    <cac:ShipmentStage>
      <cbc:TransportModeCode listAgencyName="PE:SUNAT" listName="Modalidad de Transporte">${gre.modalidadTransporte === 'PUBLICO' ? '01' : '02'}</cbc:TransportModeCode>
      <cac:TransitPeriod>
        <cbc:StartDate>${gre.fechaInicioTraslado}</cbc:StartDate>
      </cac:TransitPeriod>
      ${gre.modalidadTransporte === 'PUBLICO' && gre.transportista ? `
      <cac:CarrierParty>
        <cac:PartyIdentification>
          <cbc:ID schemeAgencyName="PE:SUNAT" schemeID="6">${escapeXml(gre.transportista.ruc)}</cbc:ID>
        </cac:PartyIdentification>
        <cac:PartyLegalEntity>
          <cbc:RegistrationName>${escapeXml(gre.transportista.razonSocial)}</cbc:RegistrationName>
        </cac:PartyLegalEntity>
      </cac:CarrierParty>` : ''}
      ${gre.modalidadTransporte === 'PRIVADO' && gre.conductor ? `
      <cac:DriverPerson>
        <cbc:ID schemeAgencyName="PE:SUNAT" schemeID="1">${escapeXml(gre.conductor.docNumber)}</cbc:ID>
        <cbc:FirstName>${escapeXml(gre.conductor.nombre)}</cbc:FirstName>
        <cac:IdentityDocumentReference>
          <cbc:ID>${escapeXml(gre.conductor.licencia)}</cbc:ID>
        </cac:IdentityDocumentReference>
      </cac:DriverPerson>` : ''}
    </cac:ShipmentStage>
    <cac:Delivery>
      <cac:DeliveryAddress>
        <cbc:StreetName>${escapeXml(gre.puntoLlegada)}</cbc:StreetName>
      </cac:DeliveryAddress>
    </cac:Delivery>
    <cac:OriginAddress>
      <cbc:StreetName>${escapeXml(gre.puntoPartida)}</cbc:StreetName>
    </cac:OriginAddress>
  </cac:Shipment>

  <!-- Líneas de Bienes Transportados -->
  ${items.map((it, idx) => `
  <cac:DespatchLine>
    <cbc:ID>${idx + 1}</cbc:ID>
    <cbc:DeliveredQuantity unitCode="${escapeXml(it.unidad || 'NIU')}">${it.cantidad}</cbc:DeliveredQuantity>
    <cac:OrderLineReference>
      <cbc:LineID>${idx + 1}</cbc:LineID>
    </cac:OrderLineReference>
    <cac:Item>
      <cbc:Description>${escapeXml(it.nombre)}</cbc:Description>
      <cac:SellersItemIdentification>
        <cbc:ID>${escapeXml(it.sku || `ITEM-${idx + 1}`)}</cbc:ID>
      </cac:SellersItemIdentification>
    </cac:Item>
  </cac:DespatchLine>`).join('')}
</DespatchAdvice>`;
  }

  // Comprobante Tributario (Boleta 03 / Factura 01)
  const sunatDocTypeCode = doc.tipo === 'FACTURA' ? '01' : '03';
  const customerDocScheme = doc.datosReceptor.docType === 'RUC' ? '6' : '1';

  return `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
         xmlns:ds="http://www.w3.org/2000/09/xmldsig#"
         xmlns:ext="urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2">
  <ext:UBLExtensions>
    <ext:UBLExtension>
      <ext:ExtensionContent>
        <!-- Estructura reservada para la firma digital del proveedor de facturacion electronica SEE-OSE -->
      </ext:ExtensionContent>
    </ext:UBLExtension>
  </ext:UBLExtensions>
  <cbc:UBLVersionID>2.1</cbc:UBLVersionID>
  <cbc:CustomizationID>2.0</cbc:CustomizationID>
  <cbc:ID>${escapeXml(fullSerieNumero)}</cbc:ID>
  <cbc:IssueDate>${issueDate}</cbc:IssueDate>
  <cbc:IssueTime>${issueTime}</cbc:IssueTime>
  <cbc:InvoiceTypeCode listAgencyName="PE:SUNAT" listName="Tipo de Documento" listURI="urn:pe:gob:sunat:cpe:see:gem:catalogos:catalogo01">${sunatDocTypeCode}</cbc:InvoiceTypeCode>
  <cbc:DocumentCurrencyCode listAgencyName="United Nations Economic Commission for Europe" listID="ISO 4217 Alpha">PEN</cbc:DocumentCurrencyCode>

  <!-- Datos del Emisor -->
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyIdentification>
        <cbc:ID schemeAgencyName="PE:SUNAT" schemeID="6" schemeName="Documento de Identidad" schemeURI="urn:pe:gob:sunat:cpe:see:gem:catalogos:catalogo06">20613074342</cbc:ID>
      </cac:PartyIdentification>
      <cac:PartyName>
        <cbc:Name>NERO Electric Motors</cbc:Name>
      </cac:PartyName>
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>NERO ELECTRIC MOTORS S.A.C.</cbc:RegistrationName>
        <cac:RegistrationAddress>
          <cbc:AddressLine>
            <cbc:Line>Av. Cesar Canevaro 1332, Lince, Lima</cbc:Line>
          </cbc:AddressLine>
        </cac:RegistrationAddress>
      </cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingSupplierParty>

  <!-- Datos del Receptor -->
  <cac:AccountingCustomerParty>
    <cac:Party>
      <cac:PartyIdentification>
        <cbc:ID schemeAgencyName="PE:SUNAT" schemeID="${customerDocScheme}" schemeName="Documento de Identidad">${escapeXml(doc.datosReceptor.docNumber || '00000000')}</cbc:ID>
      </cac:PartyIdentification>
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>${escapeXml(doc.datosReceptor.businessName || 'Cliente Particular')}</cbc:RegistrationName>
        ${doc.datosReceptor.direccion ? `
        <cac:RegistrationAddress>
          <cbc:AddressLine>
            <cbc:Line>${escapeXml(doc.datosReceptor.direccion)}</cbc:Line>
          </cbc:AddressLine>
        </cac:RegistrationAddress>` : ''}
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
      <cbc:Description>${escapeXml(it.nombre)}</cbc:Description>
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

function escapeXml(unsafe: string): string {
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
export function getDocumentFileName(
  serie: string,
  numero: string,
  format: 'a4' | '80mm' | 'xml'
): string {
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
  }
}
