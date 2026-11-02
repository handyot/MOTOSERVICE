import { NextResponse } from 'next/server';
import { createClient, createOrderAdminClient } from '@/lib/supabase/server';
import { getServerAuthUser } from '@/lib/auth/server';

const VALID_REQUEST_TYPES = new Set([
  'cotizacion_repuesto',
  'diagnostico_no_concluyente',
  'riesgo_electrico',
  'soporte_instalacion',
  'consulta_tecnica',
]);

/**
 * Normaliza el tipo de solicitud para cumplir estrictamente con el CHECK constraint
 * de la base de datos (chk_asistencia_tipo) en todas las instancias y entornos.
 */
function normalizeRequestType(rawType?: string): string {
  if (!rawType) return 'consulta_tecnica';
  const clean = String(rawType).trim().toLowerCase();

  if (VALID_REQUEST_TYPES.has(clean)) {
    return clean;
  }

  // Mapeos canónicos para solicitudes de taller y diagnósticos
  if (
    clean.includes('taller') ||
    clean.includes('revision') ||
    clean.includes('instalacion') ||
    clean.includes('mantenimiento')
  ) {
    return 'soporte_instalacion';
  }
  if (clean.includes('cotiza') || clean.includes('precio') || clean.includes('repuesto')) {
    return 'cotizacion_repuesto';
  }
  if (
    clean.includes('peligro') ||
    clean.includes('riesgo') ||
    clean.includes('humo') ||
    clean.includes('fuego') ||
    clean.includes('chispa')
  ) {
    return 'riesgo_electrico';
  }
  if (clean.includes('diagnostico') || clean.includes('falla')) {
    return 'diagnostico_no_concluyente';
  }

  return 'consulta_tecnica';
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { contactName, contactEmail, contactPhone, requestType, description, technicalDetails } = body;

    const trimmedName = String(contactName || '').trim();
    const trimmedEmail = String(contactEmail || '').trim().toLowerCase();
    const trimmedDesc = String(description || '').trim();

    if (!trimmedName || !trimmedEmail || !trimmedDesc) {
      return NextResponse.json(
        { success: false, error: 'Nombre, correo electrónico y descripción del problema son obligatorios.' },
        { status: 400 }
      );
    }

    // Validación básica de correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return NextResponse.json(
        { success: false, error: 'Ingresa una dirección de correo electrónico válida.' },
        { status: 400 }
      );
    }

    const { user } = await getServerAuthUser();
    const userId = user ? user.id : null;

    const normalizedType = normalizeRequestType(requestType);
    const enrichedTechnicalDetails = {
      ...(technicalDetails || {}),
      rawRequestType: requestType || null,
      submittedAt: new Date().toISOString(),
    };

    // Utiliza el cliente administrativo de servidor (service_role) para persistir sin ser
    // bloqueado por RLS anónimo en PostgreSQL, con fallback a cliente estándar.
    const supabase = createOrderAdminClient() || (await createClient());
    const { error: insertError } = await supabase.from('solicitudes_asistencia').insert({
      user_id: userId,
      nombre_contacto: trimmedName,
      email_contacto: trimmedEmail,
      telefono_contacto: contactPhone ? String(contactPhone).trim() : null,
      tipo_solicitud: normalizedType,
      descripcion: trimmedDesc,
      detalles_tecnicos: enrichedTechnicalDetails,
      estado: 'pendiente',
    });

    if (insertError) {
      console.error('[VoltIA Asistencia] Error al persistir solicitud en base de datos:', insertError.message);
      return NextResponse.json(
        {
          success: false,
          error: 'No fue posible registrar tu solicitud técnica en la base de datos. Por favor intenta más tarde o comunícate vía soporte oficial.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Solicitud de asistencia técnica registrada exitosamente. Un especialista se comunicará contigo.',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al registrar solicitud.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
