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

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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
  const rawId = String(id || '').trim();

  if (!rawId) {
    return NextResponse.json(
      { success: false, error: 'Identificador de comprobante no proporcionado.' },
      { status: 400 }
    );
  }

  const { searchParams } = new URL(request.url);
  const format = (searchParams.get('format') || 'a4').toLowerCase();

  if (!['a4', '80mm', 'xml'].includes(format)) {
    return NextResponse.json(
      { success: false, error: 'Formato no soportado. Elija a4, 80mm o xml.' },
      { status: 400 }
    );
  }

  const supabase = (await createCatalogWriteClient()) || (await createClient());

  // 1. Buscar el documento fiscal en Supabase con manejo defensivo de UUID vs serie-número
  let doc = null;
  const isUuid = UUID_REGEX.test(rawId);

  try {
    if (isUuid) {
      const { data, error } = await supabase
        .from('documentos_fiscales')
        .select('*')
        .or(`id_documento.eq.${rawId},id_pedido.eq.${rawId}`)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        return NextResponse.json(
          {
            success: false,
            error: `Error al consultar comprobante en base de datos: ${error.message}`,
          },
          { status: 500 }
        );
      }
      doc = data;
    } else {
      // Si contiene guión (ej: B001-000001 o F001-000012)
      const parts = rawId.split('-');
      if (parts.length === 2 && parts[0].length <= 10 && parts[1].length <= 20) {
        const { data, error } = await supabase
          .from('documentos_fiscales')
          .select('*')
          .eq('serie', parts[0].toUpperCase())
          .eq('numero', parts[1])
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          return NextResponse.json(
            {
              success: false,
              error: `Error al consultar comprobante por serie y número: ${error.message}`,
            },
            { status: 500 }
          );
        }
        doc = data;
      }

      if (!doc) {
        const { data, error } = await supabase
          .from('documentos_fiscales')
          .select('*')
          .eq('numero', rawId)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          return NextResponse.json(
            {
              success: false,
              error: `Error al consultar comprobante por número: ${error.message}`,
            },
            { status: 500 }
          );
        }
        doc = data;
      }
    }
  } catch (dbErr: unknown) {
    const message = dbErr instanceof Error ? dbErr.message : 'Error inesperado de base de datos';
    return NextResponse.json(
      { success: false, error: `Fallo al recuperar comprobante: ${message}` },
      { status: 500 }
    );
  }

  if (!doc) {
    return NextResponse.json(
      {
        success: false,
        error: `El comprobante solicitado (${rawId}) no fue encontrado en la base de datos.`,
      },
      { status: 404 }
    );
  }

  // 2. Recuperar items reales del pedido si está vinculado
  let items: DocumentItemData[] = [];
  let orderNumber: string | undefined;

  if (doc.id_pedido) {
    try {
      const [{ data: order }, { data: orderItems }] = await Promise.all([
        supabase
          .from('pedidos')
          .select('numero_pedido, total, subtotal, cliente_nombre, doc_numero')
          .eq('id_pedido', doc.id_pedido)
          .maybeSingle(),
        supabase.from('pedido_items').select('*').eq('id_pedido', doc.id_pedido),
      ]);

      if (order) {
        orderNumber = order.numero_pedido;
      }

      if (orderItems && orderItems.length > 0) {
        items = orderItems.map((oi) => ({
          sku: oi.sku || 'MS-ITEM',
          nombre: oi.nombre || 'Repuesto de Movilidad Eléctrica',
          cantidad: Math.max(1, Number(oi.cantidad) || 1),
          precioUnitario: Number(oi.precio_unitario) || 0,
          subtotal: Number(oi.subtotal) || 0,
          unidad: 'NIU',
        }));
      }
    } catch (orderErr) {
      console.warn('[DOC DOWNLOAD] Error recuperando detalles del pedido asociado:', orderErr);
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
    id: doc.id_documento || rawId,
    tipo: (doc.tipo as 'BOLETA' | 'FACTURA' | 'GUIA_REMISION') || 'BOLETA',
    serie: doc.serie || (doc.tipo === 'GUIA_REMISION' ? 'T001' : doc.tipo === 'FACTURA' ? 'F001' : 'B001'),
    numero: doc.numero || '000001',
    fechaEmision: doc.created_at || new Date().toISOString(),
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
    observaciones: doc.observaciones || undefined,
    greData: doc.metadatos?.greData || undefined,
  };

  const rawFilename = getDocumentFileName(
    fiscalData.serie,
    fiscalData.numero,
    format as 'a4' | '80mm' | 'xml'
  );
  const safeFilename = rawFilename.replace(/[^a-zA-Z0-9._-]/g, '_');

  try {
    if (format === 'xml') {
      const xml = generateUbl21Xml(fiscalData);
      return new NextResponse(xml, {
        status: 200,
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
          'Content-Disposition': `attachment; filename="${safeFilename}"`,
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
        'Content-Disposition': `attachment; filename="${safeFilename}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (genError: unknown) {
    const msg = genError instanceof Error ? genError.message : 'Error inesperado generando archivo';
    console.error('[DOC DOWNLOAD ERROR]', genError);
    return NextResponse.json(
      {
        success: false,
        error: `Fallo al generar el archivo del comprobante (${format}): ${msg}`,
      },
      { status: 500 }
    );
  }
}
