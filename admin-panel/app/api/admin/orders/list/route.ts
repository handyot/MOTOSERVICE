import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/auth/server';
import { createCatalogWriteClient, createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const auth = await requireAdminApi();
  if (!auth.authorized) {
    return NextResponse.json(
      { success: false, error: auth.error },
      { status: auth.status }
    );
  }

  try {
    const supabase = (await createCatalogWriteClient()) || (await createClient());

    const { data, error } = await supabase
      .from('pedidos')
      .select(`
        *,
        pedido_items (*)
      `)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      orders: data || [],
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al listar pedidos';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
