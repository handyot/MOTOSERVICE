import { NextResponse } from 'next/server';
import { getServerAuthUser, getUserRole } from '@/lib/auth/server';
import { processVoltIAChat, VoltIAChatRequest } from '@/lib/voltia/voltia-ai-service';

export async function POST(request: Request) {
  try {
    const body: VoltIAChatRequest = await request.json().catch(() => ({ message: '' }));

    // Validar autenticación de usuario en el servidor (para track_order y contexto)
    const { user } = await getServerAuthUser();
    const userId = user ? user.id : null;
    const role = userId ? await getUserRole(userId) : null;
    const isAdmin = role === 'admin';

    const result = await processVoltIAChat(body, {
      authenticatedUserId: userId,
      isAdmin,
    });

    return NextResponse.json(result, {
      status: result.success ? 200 : (result.isAiEnabled === false ? 200 : 400),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error interno al procesar conversación con VoltIA';
    return NextResponse.json(
      {
        success: false,
        message: 'Ocurrió un error inesperado al procesar tu mensaje. Por favor intenta nuevamente.',
        error: message,
        isAiEnabled: false,
      },
      { status: 500 }
    );
  }
}
