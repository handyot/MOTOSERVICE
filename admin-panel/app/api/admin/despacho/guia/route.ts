import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/auth/server';
import { createCatalogWriteClient, createClient } from '@/lib/supabase/server';
import {
  validateGreInput,
  buildGreFiscalDocument,
  GreInputData,
} from '@/lib/documents/gre-service';

export async function GET(request: Request) {
  const auth = await requireAdminApi();
  if (!auth.authorized) {
    return NextResponse.json(
      { success: false, error: auth.error },
      { status: auth.status }
    );
  }

  const supabase = (await createCatalogWriteClient()) || (await createClient());

  const { data: guias, error } = await supabase
    .from('documentos_fiscales')
    .select('*')
    .eq('tipo', 'GUIA_REMISION')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, guias: guias || [] });
}

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if (!auth.authorized) {
    return NextResponse.json(
      { success: false, error: auth.error },
      { status: auth.status }
    );
  }

  try {
    const body: GreInputData = await request.json();

    // 1. Validación exhaustiva según normativa SUNAT
    const validation = validateGreInput(body);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: `Datos de Guía de Remisión incompletos: ${validation.errors.join(' ')}`,
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    const supabase = (await createCatalogWriteClient()) || (await createClient());

    // 2. Obtener correlativo correlativo para serie T001
    const { count } = await supabase
      .from('documentos_fiscales')
      .select('*', { count: 'exact', head: true })
      .eq('tipo', 'GUIA_REMISION')
      .eq('serie', 'T001');

    const nextCorrelative = (count || 0) + 1;
    const greDoc = buildGreFiscalDocument(body, nextCorrelative);

    // 3. Persistir en la tabla documentos_fiscales
    const { data: inserted, error: insertError } = await supabase
      .from('documentos_fiscales')
      .insert({
        id_pedido: body.orderId,
        tipo: 'GUIA_REMISION',
        serie: greDoc.serie,
        numero: greDoc.numero,
        estado: 'listo',
        datos_receptor: greDoc.datosReceptor,
        total_gravada: 0,
        total_igv: 0,
        total_comprobante: 0,
        observaciones: greDoc.observaciones,
        respuesta_sunat: {
          estado: 'BORRADOR_VALIDADO_LOCAL',
          mensaje: 'Guía de Remisión validada localmente según R.S. SUNAT. Lista para envío SEE-OSE o descarga.',
          fechaValidacion: new Date().toISOString(),
        },
      })
      .select()
      .single();

    if (insertError) {
      console.error('[GRE API] Error al guardar Guía de Remisión en Supabase:', insertError);
      return NextResponse.json(
        { success: false, error: `Error al persistir la guía: ${insertError.message}` },
        { status: 500 }
      );
    }

    // 4. Actualizar el pedido asociado: estado de despacho a 'preparado'
    await supabase
      .from('pedidos')
      .update({
        estado_despacho: 'preparado',
        estado_pedido: 'en_preparacion',
        updated_at: new Date().toISOString(),
      })
      .eq('id_pedido', body.orderId);

    return NextResponse.json({
      success: true,
      message: `Guía de Remisión ${greDoc.numero} generada con éxito y vinculada al pedido ${body.orderNumber}.`,
      guia: inserted,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error interno al generar guía';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
