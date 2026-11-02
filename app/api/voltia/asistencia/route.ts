import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getServerAuthUser } from '@/lib/auth/server';

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

    const supabase = await createClient();
    const { error: insertError } = await supabase.from('solicitudes_asistencia').insert({
      user_id: userId,
      nombre_contacto: trimmedName,
      email_contacto: trimmedEmail,
      telefono_contacto: contactPhone ? String(contactPhone).trim() : null,
      tipo_solicitud: requestType || 'consulta_tecnica',
      descripcion: trimmedDesc,
      detalles_tecnicos: technicalDetails || {},
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
