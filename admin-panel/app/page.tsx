import type { Metadata } from 'next';
import { requireAdmin } from '../lib/auth/server';
import { createClient } from '../lib/supabase/server';
import { AdminDashboardView } from '../components/admin/AdminDashboardView';
import { mergeCatalogWithMaster } from '../lib/catalog/catalog-fallback';

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
      .select('id_modelo, id_marca, nombre, voltaje_nominal_v, potencia_motor_w, imagen_url, estado', { count: 'exact' })
      .order('id_modelo', { ascending: false })
      .limit(100),
    supabase
      .from('repuestos')
      .select('id_repuesto, id_categoria, codigo_sku, nombre, precio, moneda, imagen_url, estado', { count: 'exact' })
      .order('id_repuesto', { ascending: false })
      .limit(100),
    supabase
      .from('compatibilidades')
      .select('id_compatibilidad, id_repuesto, id_modelo, nivel_verificacion, observaciones, status, evidence_note', { count: 'exact' })
      .order('id_compatibilidad', { ascending: false })
      .limit(100),
    supabase.from('pedidos').select('*').order('created_at', { ascending: false }).limit(20),
    supabase.from('solicitudes_asistencia').select('*').order('created_at', { ascending: false }).limit(20),
    supabase.from('documentos_fiscales').select('*').order('created_at', { ascending: false }).limit(20),
    supabase.from('suscripciones_newsletter').select('*').order('created_at', { ascending: false }).limit(20),
    supabase.from('catalogo_importaciones').select('*').order('created_at', { ascending: false }).limit(15),
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

  return (
    <AdminDashboardView
      key={`${merged.brands.length}-${merged.models.length}-${merged.parts.length}`}
      account={account}
      stats={merged.stats}
      initialOrders={ordersData || []}
      initialAssistance={assistanceData || []}
      initialDocuments={documentsData || []}
      initialSubscriptions={subscriptionsData || []}
      initialImportHistory={importHistoryData || []}
      initialBrands={merged.brands}
      initialModels={merged.models}
      initialParts={merged.parts}
      initialCompatibilities={merged.compatibilities}
    />
  );
}
