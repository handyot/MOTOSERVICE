import type { Metadata } from 'next';
import { requireAdmin } from '../lib/auth/server';
import { createClient, createCatalogWriteClient } from '../lib/supabase/server';
import { AdminDashboardView } from '../components/admin/AdminDashboardView';
import { mergeCatalogWithMaster } from '../lib/catalog/catalog-fallback';
import { listAdminUsers } from '../lib/users/user-service';

export const metadata: Metadata = {
  title: 'Resumen Operativo | ERP NeroElectric Motors',
  description: 'Gestión integral de catálogo, inventario, pedidos, facturación SUNAT, VoltIA e importaciones CSV/JSON.',
};

export const dynamic = 'force-dynamic';

export default async function AdminHomePage() {
  const account = await requireAdmin();
  const supabase = (await createCatalogWriteClient()) || (await createClient());

  const [
    resMarcas,
    resModelos,
    resRepuestos,
    resCompat,
    resOrders,
    resAssistance,
    resDocs,
    resSubs,
    resImports,
    usersResult,
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
      .select('id_repuesto, id_categoria, codigo_sku, nombre, precio, moneda, imagen_url, estado, data_status, stock_propio_ecomoto, stock_proveedor, precio_proveedor_pen, precio_regular_proveedor_pen, precio_min_pen, precio_max_pen, source_url, notas', { count: 'exact' })
      .order('id_repuesto', { ascending: false }),
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
    listAdminUsers(supabase),
  ]);

  const queryErrors: Record<string, string> = {};
  if (resMarcas.error) queryErrors.marcas = resMarcas.error.message;
  if (resModelos.error) queryErrors.modelos = resModelos.error.message;
  if (resRepuestos.error) queryErrors.repuestos = resRepuestos.error.message;
  if (resCompat.error) queryErrors.compat = resCompat.error.message;
  if (resOrders.error) queryErrors.pedidos = resOrders.error.message;
  if (resAssistance.error) queryErrors.asistencia = resAssistance.error.message;
  if (resDocs.error) queryErrors.documentos = resDocs.error.message;
  if (resSubs.error) queryErrors.suscripciones = resSubs.error.message;
  if (resImports.error) queryErrors.importaciones = resImports.error.message;
  if (usersResult && !usersResult.success && usersResult.error) {
    queryErrors.usuarios = usersResult.error;
  }

  if (Object.keys(queryErrors).length > 0) {
    console.warn('[ADMIN DASHBOARD] Advertencia: errores al consultar fuentes de Supabase:', Object.keys(queryErrors));
  }

  const initialUsers = usersResult?.success && Array.isArray(usersResult.users) ? usersResult.users : [];

  const normalizedCompatibilities = (resCompat.data || []).map((c) => ({
    id_compatibilidad: c.id_compatibilidad,
    id_repuesto: c.id_repuesto,
    id_modelo: c.id_modelo,
    es_compatible: c.status !== 'NO_COMPATIBLE',
    nivel_verificacion: c.nivel_verificacion || c.status || 'CONFIRMADA',
    notas_tecnicas: c.evidence_note || c.observaciones || null,
  }));

  const merged = mergeCatalogWithMaster(
    resMarcas.data,
    resModelos.data,
    resRepuestos.data,
    normalizedCompatibilities,
    {
      marcas: resMarcas.count,
      modelos: resModelos.count,
      repuestos: resRepuestos.count,
      compat: resCompat.count,
    }
  );

  return (
    <AdminDashboardView
      key={`${merged.brands.length}-${merged.models.length}-${merged.parts.length}`}
      account={account}
      stats={merged.stats}
      initialOrders={resOrders.data || []}
      initialAssistance={resAssistance.data || []}
      initialDocuments={resDocs.data || []}
      initialSubscriptions={resSubs.data || []}
      initialImportHistory={resImports.data || []}
      initialBrands={merged.brands}
      initialModels={merged.models}
      initialParts={merged.parts}
      initialCompatibilities={merged.compatibilities}
      initialUsers={initialUsers}
      initialPersistedParts={resRepuestos.data || []}
      persistedPartsError={resRepuestos.error ? resRepuestos.error.message : null}
      queryErrors={queryErrors}
    />
  );
}
