import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { AuthCard } from '../../components/auth/AuthCard';
import { AdminLoginForm } from '../../components/auth/AdminLoginForm';

export const metadata: Metadata = {
  title: 'Acceso Administrativo | NeroElectric Motors',
  description: 'Ingreso exclusivo para operadores con rol administrativo verificado en NeroElectric Motors.',
};

export default function AdminLoginPage() {
  const storefrontUrl = process.env.NEXT_PUBLIC_STOREFRONT_URL || 'https://neroelectric.com';

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
      <AuthCard
        title="Ingreso al Centro de Control"
        subtitle="Acceso restringido a operadores autorizados con rol 'admin' verificado en Supabase."
        footer={
          <div className="space-y-2">
            <p className="text-[11px] text-slate-500">
              Las cuentas de clientes estándar (<code className="text-slate-400">customer</code>) no tienen acceso a este dominio.
            </p>
            {storefrontUrl !== '/' && (
              <p>
                <a
                  href={storefrontUrl}
                  className="font-semibold text-amber-400 hover:text-amber-300 transition-colors"
                >
                  Ir a la Tienda Pública Comercial →
                </a>
              </p>
            )}
          </div>
        }
      >
        <Suspense
          fallback={
            <div className="py-8 text-center text-xs text-slate-400">
              Cargando módulo de autenticación administrativa...
            </div>
          }
        >
          <AdminLoginForm />
        </Suspense>
      </AuthCard>
    </div>
  );
}
