import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/auth/server';
import { createCatalogWriteClient, createClient } from '@/lib/supabase/server';
import {
  generatePdfA4,
  generatePdf80mm,
  generateUbl21Xml,
  getDocumentFileName,
  DocumentFiscalData,
  DocumentItemData,
} from '@/lib/documents/document-exporter';

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminApi();
  if (!auth.authorized) {
    return NextResponse.json(
      { success: false, error: auth.error },
      { status: auth.status }
    );
  }

  const { id } = await props.params;
  const { searchParams } = new URL(request.url);
  const format = (searchParams.get('format') || 'a4').toLowerCase();

  if (!['a4', '80mm', 'xml'].includes(format)) {
    return NextResponse.json(
      { success: false, error: 'Formato no soportado. Elija a4, 80mm o xml.' },
      { status: 400 }
    );
  }

  const supabase = (await createCatalogWriteClient()) || (await createClient());

  // 1. Buscar el documento fiscal en Supabase
  let { data: doc, error: docError } = await supabase
    .from('documentos_fiscales')
    .select('*')
    .eq('id_documento', id)
    .maybeSingle();

  // Si no se encuentra por UUID exacto, buscar por serie-número o por id_pedido
  if (!doc) {
    const { data: docAlt } = await supabase
      .from('documentos_fiscales')
      .select('*')
      .or(`numero.eq.${id},id_pedido.eq.${id}`)
      .maybeSingle();
    doc = docAlt;
  }

  if (!doc) {
    return NextResponse.json(
      {
        success: false,
        error: `El comprobante solicitado (${id}) no fue encontrado en la base de datos.`,
      },
      { status: 404 }
    );
  }

  // 2. Recuperar items reales del pedido si está vinculado
  let items: DocumentItemData[] = [];
  let orderNumber: string | undefined;

  if (doc.id_pedido) {
    const [{ data: order }, { data: orderItems }] = await Promise.all([
      supabase.from('pedidos').select('numero_pedido, total, subtotal, cliente_nombre, doc_numero').eq('id_pedido', doc.id_pedido).maybeSingle(),
      supabase.from('pedido_items').select('*').eq('id_pedido', doc.id_pedido),
    ]);

    if (order) {
      orderNumber = order.numero_pedido;
    }

    if (orderItems && orderItems.length > 0) {
      items = orderItems.map((oi) => ({
        sku: oi.sku,
        nombre: oi.nombre,
        cantidad: oi.cantidad,
        precioUnitario: Number(oi.precio_unitario),
        subtotal: Number(oi.subtotal),
        unidad: 'NIU',
      }));
    }
  }

  // Si no tiene items en pedido_items, generar item representativo con el total
  if (items.length === 0) {
    items = [
      {
        sku: 'MS-EV-PART',
        nombre: 'Repuestos / Servicios de Movilidad Eléctrica NERO',
        cantidad: 1,
        precioUnitario: Number(doc.total_comprobante || 0),
        subtotal: Number(doc.total_comprobante || 0),
        unidad: 'NIU',
      },
    ];
  }

  const fiscalData: DocumentFiscalData = {
    id: doc.id_documento,
    tipo: doc.tipo as 'BOLETA' | 'FACTURA' | 'GUIA_REMISION',
    serie: doc.serie || (doc.tipo === 'GUIA_REMISION' ? 'T001' : doc.tipo === 'FACTURA' ? 'F001' : 'B001'),
    numero: doc.numero || '000001',
    fechaEmision: doc.created_at,
    moneda: 'PEN',
    datosReceptor: doc.datos_receptor || {
      docType: doc.tipo === 'FACTURA' ? 'RUC' : 'DNI',
      docNumber: '00000000',
      businessName: 'Cliente Particular',
    },
    totalGravada: Number(doc.total_gravada || 0),
    totalIgv: Number(doc.total_igv || 0),
    totalComprobante: Number(doc.total_comprobante || 0),
    numeroPedido: orderNumber,
    items,
    observaciones: doc.observaciones,
    greData: doc.metadatos?.greData || undefined,
  };

  const filename = getDocumentFileName(
    fiscalData.serie,
    fiscalData.numero,
    format as 'a4' | '80mm' | 'xml'
  );

  if (format === 'xml') {
    const xml = generateUbl21Xml(fiscalData);
    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    });
  }

  const pdfBuffer =
    format === '80mm'
      ? generatePdf80mm(fiscalData)
      : generatePdfA4(fiscalData);

  return new NextResponse(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}
