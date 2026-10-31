import type { Metadata } from 'next';
import Link from 'next/link';
import { requireAdmin } from '../../lib/auth/server';
import { createClient } from '../../lib/supabase/server';
import { AdminDashboardView } from '../../components/admin/AdminDashboardView';

export const metadata: Metadata = {
  title: 'Panel Administrativo | NeroElectric Motors',
  description: 'Centro de control operativo: productos, inventario, pedidos, pagos Culqi, facturación SUNAT y VoltIA.',
};

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const account = await requireAdmin();
  const supabase = await createClient();

  // Consultas paralelas seguras a la base de datos
  const [
    { count: countMarcas },
    { count: countModelos },
    { count: countRepuestos },
    { count: countCompat },
    { data: ordersData },
    { data: assistanceData },
    { data: documentsData },
    { data: subscriptionsData },
  ] = await Promise.all([
    supabase.from('marcas').select('*', { count: 'exact', head: true }),
    supabase.from('modelos_moto').select('*', { count: 'exact', head: true }),
    supabase.from('repuestos').select('*', { count: 'exact', head: true }),
    supabase.from('compatibilidades').select('*', { count: 'exact', head: true }),
    supabase.from('pedidos').select('*').order('created_at', { ascending: false }).limit(20),
    supabase.from('solicitudes_asistencia').select('*').order('created_at', { ascending: false }).limit(20),
    supabase.from('documentos_fiscales').select('*').order('created_at', { ascending: false }).limit(20),
    supabase.from('suscripciones_newsletter').select('*').order('created_at', { ascending: false }).limit(20),
  ]);

  const stats = {
    totalMarcas: countMarcas ?? 0,
    totalModelos: countModelos ?? 0,
    totalRepuestos: countRepuestos ?? 0,
    totalCompatibilidades: countCompat ?? 0,
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb Admin */}
      <nav aria-label="Ruta de navegación" className="mb-6 flex items-center gap-2 text-xs text-slate-400">
        <Link href="/" className="hover:text-cyan-400 transition-colors">
          Inicio
        </Link>
        <span>/</span>
        <span className="text-amber-400 font-semibold">Administración Operativa</span>
      </nav>

      {/* Vista de Tablero Administrativo con Todos los Módulos */}
      <AdminDashboardView
        account={account}
        stats={stats}
        initialOrders={ordersData || []}
        initialAssistance={assistanceData || []}
        initialDocuments={documentsData || []}
        initialSubscriptions={subscriptionsData || []}
      />
    </div>
  );
}
