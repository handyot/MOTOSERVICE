/**
 * MOTOSERVICE ADMIN PANEL — Gestión Directa de Marcas, Modelos, Repuestos y Compatibilidades
 *
 * Protegido en servidor mediante requireAdminApi().
 */

import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/auth/server';
import { createCatalogWriteClient } from '@/lib/supabase/server';

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
        })
        .select('*')
        .single();

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
      }
      return NextResponse.json({ success: true, record: data });
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
