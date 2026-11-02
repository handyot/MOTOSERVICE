import type { Metadata } from 'next';
import Link from 'next/link';
import { requireAuth } from '../../lib/auth/server';
import { createClient } from '../../lib/supabase/server';
import { getCustomerVehicles } from '../../lib/vehicles/vehicle-service';
import { CustomerDashboardView } from '../../components/account/CustomerDashboardView';
import { Icon } from '../../components/ui/Icons';

export const metadata: Metadata = {
  title: 'Mi Cuenta de Cliente | NeroElectric Motors',
  description: 'Panel privado de cliente en NeroElectric Motors. Administra tus motos eléctricas, pedidos y diagnósticos de VoltIA.',
};

export const dynamic = 'force-dynamic';

export interface CustomerOrderSummary {
  id_pedido: string;
  numero_pedido: string;
  total: number | string;
  moneda: string;
  estado_pedido: string;
  estado_pago: string;
  created_at: string;
}

export default async function CuentaPage() {
  const account = await requireAuth('/cuenta');
  const vehicles = await getCustomerVehicles(account.id);

  let orders: CustomerOrderSummary[] = [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('pedidos')
      .select('id_pedido, numero_pedido, total, moneda, estado_pedido, estado_pago, created_at')
      .eq('user_id', account.id)
      .order('created_at', { ascending: false });

    if (data) {
      orders = data as CustomerOrderSummary[];
    }
  } catch {
    // Memoria o fallback
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb con alto contraste */}
      <nav aria-label="Ruta de navegación" className="mb-6 flex items-center gap-2 text-xs text-slate-500 font-medium">
        <Link href="/" className="hover:text-slate-900 transition-colors">
          Inicio
        </Link>
        <span className="text-slate-400">/</span>
        <span className="text-slate-900 font-bold">Mi Cuenta</span>
      </nav>

      {/* Cabecera unificada y armónica */}
      <div className="mb-8">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white shadow-xs">
            <Icon name="user" className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Portal del Cliente
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              Administración de vehículos registrados, seguimiento de pedidos y consultas técnicas con VoltIA.
            </p>
          </div>
        </div>
      </div>

      {/* Contenido Principal con Pestañas */}
      <CustomerDashboardView
        account={account}
        initialVehicles={vehicles}
        initialOrders={orders}
      />
    </div>
  );
}
