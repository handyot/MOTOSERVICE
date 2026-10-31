import type { Metadata } from 'next';
import { requireAdmin } from '../lib/auth/server';
import { createClient } from '../lib/supabase/server';
import { AdminDashboardView } from '../components/admin/AdminDashboardView';

export const metadata: Metadata = {
  title: 'Resumen Operativo | ERP NeroElectric Motors',
  description: 'Gestión integral de catálogo, inventario, pedidos, facturación SUNAT, VoltIA e importaciones CSV/JSON.',
};

export const dynamic = 'force-dynamic';

export default async function AdminHomePage() {
  const account = await requireAdmin();
  const supabase = await createClient();

  const [
    { count: countMarcas, data: brandsData },
    { count: countModelos, data: modelsData },
    { count: countRepuestos, data: partsData },
    { count: countCompat, data: compatData },
    { data: ordersData },
    { data: assistanceData },
    { data: documentsData },
    { data: subscriptionsData },
    { data: importHistoryData },
  ] = await Promise.all([
    supabase
      .from('marcas')
      .select('id_marca, nombre, pais_origen, estado', { count: 'exact' })
      .order('id_marca', { ascending: true }),
    supabase
      .from('modelos_moto')
      .select('id_modelo, id_marca, nombre, voltaje_nominal_v, potencia_motor_w, estado', { count: 'exact' })
      .order('id_modelo', { ascending: false })
      .limit(30),
    supabase
      .from('repuestos')
      .select('id_repuesto, id_categoria, codigo_sku, nombre, precio, moneda, estado', { count: 'exact' })
      .order('id_repuesto', { ascending: false })
      .limit(30),
    supabase
      .from('compatibilidades')
      .select('id_compatibilidad, id_repuesto, id_modelo, es_compatible, nivel_verificacion, notas_tecnicas', { count: 'exact' })
      .order('id_compatibilidad', { ascending: false })
      .limit(30),
    supabase.from('pedidos').select('*').order('created_at', { ascending: false }).limit(20),
    supabase.from('solicitudes_asistencia').select('*').order('created_at', { ascending: false }).limit(20),
    supabase.from('documentos_fiscales').select('*').order('created_at', { ascending: false }).limit(20),
    supabase.from('suscripciones_newsletter').select('*').order('created_at', { ascending: false }).limit(20),
    supabase.from('catalogo_importaciones').select('*').order('created_at', { ascending: false }).limit(15),
  ]);

  const stats = {
    totalMarcas: countMarcas ?? 0,
    totalModelos: countModelos ?? 0,
    totalRepuestos: countRepuestos ?? 0,
    totalCompatibilidades: countCompat ?? 0,
  };

  return (
    <AdminDashboardView
      account={account}
      stats={stats}
      initialOrders={ordersData || []}
      initialAssistance={assistanceData || []}
      initialDocuments={documentsData || []}
      initialSubscriptions={subscriptionsData || []}
      initialImportHistory={importHistoryData || []}
      initialBrands={brandsData || []}
      initialModels={modelsData || []}
      initialParts={partsData || []}
      initialCompatibilities={compatData || []}
    />
  );
}
