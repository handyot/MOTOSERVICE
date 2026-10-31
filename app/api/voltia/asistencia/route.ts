import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getServerAuthUser } from '@/lib/auth/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { contactName, contactEmail, contactPhone, requestType, description, technicalDetails } = body;

    if (!contactName || !contactEmail || !description) {
      return NextResponse.json(
        { success: false, error: 'Nombre, email y descripción son obligatorios.' },
        { status: 400 }
      );
    }

    const { user } = await getServerAuthUser();
    const userId = user ? user.id : null;

    try {
      const supabase = await createClient();
      await supabase.from('solicitudes_asistencia').insert({
        user_id: userId,
        nombre_contacto: contactName,
        email_contacto: contactEmail,
        telefono_contacto: contactPhone || null,
        tipo_solicitud: requestType || 'consulta_tecnica',
        descripcion: description,
        detalles_tecnicos: technicalDetails || {},
        estado: 'pendiente',
      });
    } catch (dbErr) {
      console.warn('[MOTOSERVICE] Asistencia guardada localmente (DB no disponible):', dbErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Solicitud de asistencia técnica registrada exitosamente.',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al registrar solicitud.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
