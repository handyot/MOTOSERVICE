/**
 * MOTOSERVICE ADMIN PANEL — Gestión Directa de Marcas, Modelos, Repuestos y Compatibilidades
 *
 * Protegido en servidor mediante requireAdminApi().
 */

import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/auth/server';
import { createCatalogWriteClient } from '@/lib/supabase/server';
import { mergeCatalogWithMaster } from '@/lib/catalog/catalog-fallback';
import { validateProductAction } from '@/lib/catalog/product-status-core.mjs';

export async function GET() {
  const auth = await requireAdminApi();
  if (!auth.authorized) {
    return NextResponse.json(
      { success: false, error: auth.error },
      { status: auth.status }
    );
  }

  try {
    const supabase = await createCatalogWriteClient();
    const [
      { count: countMarcas, data: brandsData },
      { count: countModelos, data: modelsData },
      { count: countRepuestos, data: partsData },
      { count: countCompat, data: compatData },
    ] = await Promise.all([
      supabase
        .from('marcas')
        .select('id_marca, nombre, pais_origen, estado', { count: 'exact' })
        .order('id_marca', { ascending: true }),
      supabase
        .from('modelos_moto')
        .select('id_modelo, id_marca, nombre, voltaje_nominal_v, potencia_motor_w, imagen_url, estado', { count: 'exact' })
        .order('id_modelo', { ascending: false })
        .limit(100),
      supabase
        .from('repuestos')
        .select('id_repuesto, id_categoria, codigo_sku, nombre, precio, moneda, imagen_url, estado, data_status, notas', { count: 'exact' })
        .order('id_repuesto', { ascending: false })
        .limit(100),
      supabase
        .from('compatibilidades')
        .select('id_compatibilidad, id_repuesto, id_modelo, nivel_verificacion, observaciones, status, evidence_note', { count: 'exact' })
        .order('id_compatibilidad', { ascending: false })
        .limit(100),
    ]);

    const normalizedCompatibilities = (compatData || []).map((c) => ({
      id_compatibilidad: c.id_compatibilidad,
      id_repuesto: c.id_repuesto,
      id_modelo: c.id_modelo,
      es_compatible: c.status !== 'NO_COMPATIBLE',
      nivel_verificacion: c.nivel_verificacion || c.status || 'CONFIRMADA',
      notas_tecnicas: c.evidence_note || c.observaciones || null,
    }));

    const merged = mergeCatalogWithMaster(
      brandsData,
      modelsData,
      partsData,
      normalizedCompatibilities,
      {
        marcas: countMarcas,
        modelos: countModelos,
        repuestos: countRepuestos,
        compat: countCompat,
      }
    );

    return NextResponse.json({
      success: true,
      brands: merged.brands,
      models: merged.models,
      parts: merged.parts,
      compatibilities: merged.compatibilities,
      stats: merged.stats,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al consultar catálogo';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
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
    const body = await request.json();
    const { entity, operation, payload } = body;
    const supabase = await createCatalogWriteClient();

    if (entity === 'marcas' && operation === 'create') {
      const nombre = String(payload?.nombre || '').trim();
      const paisOrigen = String(payload?.pais_origen || 'China').trim();
      if (!nombre) {
        return NextResponse.json(
          { success: false, error: 'El nombre de la marca es obligatorio.' },
          { status: 400 }
        );
      }
      const { data, error } = await supabase
        .from('marcas')
        .insert({ nombre, pais_origen: paisOrigen, estado: true })
        .select('*')
        .single();
      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
      }
      return NextResponse.json({ success: true, record: data });
    }

    if (entity === 'modelos_moto' && operation === 'create') {
      const idMarca = Number(payload?.id_marca);
      const nombre = String(payload?.nombre || '').trim();
      const voltaje = payload?.voltaje_nominal_v ? Number(payload.voltaje_nominal_v) : null;
      const potencia = payload?.potencia_motor_w ? Number(payload.potencia_motor_w) : null;
      const imagenUrl = payload?.imagen_url ? String(payload.imagen_url).trim() : null;

      if (!idMarca || !nombre) {
        return NextResponse.json(
          { success: false, error: 'Marca y nombre de modelo son obligatorios.' },
          { status: 400 }
        );
      }

      const { data, error } = await supabase
        .from('modelos_moto')
        .insert({
          id_marca: idMarca,
          nombre,
          voltaje_nominal_v: voltaje,
          potencia_motor_w: potencia,
          imagen_url: imagenUrl,
          estado: true,
        })
        .select('*')
        .single();

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
      }
      return NextResponse.json({ success: true, record: data });
    }

    if (entity === 'repuestos' && operation === 'create') {
      const idCategoria = Number(payload?.id_categoria || 1);
      const codigoSku = String(payload?.codigo_sku || '').trim();
      const nombre = String(payload?.nombre || '').trim();
      const precio = Number(payload?.precio || 0);
      const imagenUrl = payload?.imagen_url ? String(payload.imagen_url).trim() : null;

      if (!codigoSku || !nombre) {
        return NextResponse.json(
          { success: false, error: 'SKU y nombre del repuesto son obligatorios.' },
          { status: 400 }
        );
      }

      const { data, error } = await supabase
        .from('repuestos')
        .insert({
          id_categoria: idCategoria,
          codigo_sku: codigoSku,
          nombre,
          precio: precio >= 0 ? precio : 0,
          moneda: 'PEN',
          imagen_url: imagenUrl,
          estado: true,
          data_status: 'ACTIVO',
        })
        .select('*')
        .single();

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
      }
      return NextResponse.json({ success: true, record: data });
    }

    if (entity === 'repuestos' && operation === 'update_status') {
      const idRepuesto = Number(payload?.id_repuesto);
      const action = String(payload?.action || '').toUpperCase();
      const motivoBloqueo = payload?.motivo_bloqueo ? String(payload.motivo_bloqueo).trim() : '';

      if (!idRepuesto) {
        return NextResponse.json(
          { success: false, error: 'ID de repuesto no especificado.' },
          { status: 400 }
        );
      }

      // Obtener el registro actual
      const { data: currentPart, error: fetchError } = await supabase
        .from('repuestos')
        .select('*')
        .eq('id_repuesto', idRepuesto)
        .maybeSingle();

      if (fetchError || !currentPart) {
        return NextResponse.json(
          { success: false, error: 'No se encontró el repuesto solicitado en la base de datos.' },
          { status: 404 }
        );
      }

      const validation = validateProductAction(
        currentPart.data_status || (currentPart.estado ? 'ACTIVO' : 'OCULTO'),
        action,
        {
          motivoBloqueo,
          confirmedUnlock: payload?.confirmed_unlock === true,
          price: currentPart.precio,
          name: currentPart.nombre,
        }
      );

      if (!validation.allowed) {
        return NextResponse.json(
          { success: false, error: validation.error },
          { status: 400 }
        );
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updatePayload: Record<string, any> = {
        estado: validation.targetEstado,
        data_status: validation.targetStatus,
      };

      if (validation.motivoBloqueo) {
        updatePayload.notas = `[BLOQUEO ${new Date().toISOString().split('T')[0]}] ${validation.motivoBloqueo}`;
      } else if (action === 'ACTIVAR' || action === 'DESBLOQUEAR') {
        updatePayload.notas = null;
      }

      const { data: updatedPart, error: updateError } = await supabase
        .from('repuestos')
        .update(updatePayload)
        .eq('id_repuesto', idRepuesto)
        .select('*')
        .single();

      if (updateError) {
        return NextResponse.json(
          { success: false, error: updateError.message },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message: `Estado de producto actualizado a ${validation.targetStatus} exitosamente.`,
        record: updatedPart,
      });
    }

    if (entity === 'repuestos' && operation === 'delete') {
      const idRepuesto = Number(payload?.id_repuesto);
      if (!idRepuesto) {
        return NextResponse.json(
          { success: false, error: 'ID de repuesto no especificado para eliminación.' },
          { status: 400 }
        );
      }

      const { data: part, error: fetchErr } = await supabase
        .from('repuestos')
        .select('id_repuesto, codigo_sku, nombre')
        .eq('id_repuesto', idRepuesto)
        .maybeSingle();

      if (fetchErr || !part) {
        return NextResponse.json(
          { success: false, error: 'El repuesto a eliminar no fue encontrado.' },
          { status: 404 }
        );
      }

      // Verificar si tiene referencias históricas en ventas o pedidos
      let hasHistory = false;
      if (part.codigo_sku) {
        const { count } = await supabase
          .from('pedido_items')
          .select('id', { count: 'exact', head: true })
          .eq('sku', part.codigo_sku);
        if (count && count > 0) hasHistory = true;
      }

      if (hasHistory) {
        // Protección de integridad comercial: BAJA LÓGICA / ARCHIVADO
        const { error: archiveErr } = await supabase
          .from('repuestos')
          .update({
            estado: false,
            data_status: 'ARCHIVADO',
            notas: `[ARCHIVADO ${new Date().toISOString().split('T')[0]}] Baja lógica automática para preservar trazabilidad de pedidos históricos.`,
          })
          .eq('id_repuesto', idRepuesto);

        if (archiveErr) {
          return NextResponse.json(
            { success: false, error: archiveErr.message },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          archived: true,
          message: `El repuesto «${part.nombre}» cuenta con pedidos registrados. Ha sido archivado (baja lógica) para proteger la trazabilidad comercial.`,
        });
      }

      // Si no tiene historial de ventas, eliminar de compatibilidades y luego de repuestos
      await supabase.from('compatibilidades').delete().eq('id_repuesto', idRepuesto);
      const { error: deleteErr } = await supabase
        .from('repuestos')
        .delete()
        .eq('id_repuesto', idRepuesto);

      if (deleteErr) {
        return NextResponse.json(
          { success: false, error: deleteErr.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        deleted: true,
        message: `El repuesto «${part.nombre}» (SKU ${part.codigo_sku}) fue eliminado permanentemente sin relaciones residuales.`,
      });
    }

    if (entity === 'compatibilidades' && operation === 'create') {
      const idRepuesto = Number(payload?.id_repuesto);
      const idModelo = Number(payload?.id_modelo);
      const nivelVerificacion = String(payload?.nivel_verificacion || 'CONFIRMADA').trim();
      const notasTecnicas = payload?.notas_tecnicas ? String(payload.notas_tecnicas).trim() : null;

      if (!idRepuesto || !idModelo) {
        return NextResponse.json(
          { success: false, error: 'Se requiere seleccionar repuesto y modelo de moto.' },
          { status: 400 }
        );
      }

      const { data, error } = await supabase
        .from('compatibilidades')
        .insert({
          id_repuesto: idRepuesto,
          id_modelo: idModelo,
          nivel_verificacion: nivelVerificacion,
          observaciones: notasTecnicas,
        })
        .select('*')
        .single();

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
      }
      return NextResponse.json({
        success: true,
        record: {
          ...data,
          es_compatible: nivelVerificacion !== 'NO_COMPATIBLE',
          notas_tecnicas: data.observaciones || notasTecnicas,
        },
      });
    }

    return NextResponse.json(
      { success: false, error: 'Operación de catálogo no reconocida.' },
      { status: 400 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error interno gestionando catálogo';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
