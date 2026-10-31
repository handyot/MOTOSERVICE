import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { AuthCard } from '../../components/auth/AuthCard';
import { AdminLoginForm } from '../../components/auth/AdminLoginForm';

export const metadata: Metadata = {
  title: 'Acceso Administrativo | ERP NeroElectric Motors',
  description: 'Ingreso exclusivo para operadores con rol administrativo verificado en NeroElectric Motors.',
};

export default function AdminLoginPage() {
  const storefrontUrl = process.env.NEXT_PUBLIC_STOREFRONT_URL || 'https://neroelectricmotors.com';

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#F4F6F9]">
      <AuthCard
        title="Ingreso al Panel ERP"
        subtitle="Acceso restringido a operadores autorizados con rol 'admin' verificado en Supabase."
        footer={
          <div className="space-y-2">
            <p className="text-[11px] text-slate-500">
              Las cuentas de clientes estándar (<code className="font-mono text-slate-700">customer</code>) no tienen acceso a este dominio.
            </p>
            {storefrontUrl !== '/' && (
              <p>
                <a
                  href={storefrontUrl}
                  className="font-semibold text-[#0B1528] hover:underline transition-colors"
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
            <div className="py-8 text-center text-xs text-slate-500">
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
