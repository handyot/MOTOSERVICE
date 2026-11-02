import React, { Suspense } from 'react';
import Link from 'next/link';
import { EcoMotoCatalogSection } from '@/components/ecomoto/EcoMotoCatalogSection';
import { AssistanceCTA } from '@/components/home/AssistanceCTA';

export const metadata = {
  title: 'Catálogo de Repuestos y Componentes EV | NERO Electric Motors',
  description: 'Repuestos originales y compatibles para motos eléctricas en Lima, Perú: baterías de litio, controladores senoidales, cargadores, neumáticos y repuestos de taller.',
};

export default function RepuestosPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; categoria?: string; marca?: string; voltaje?: string }>;
}) {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-gray-500">Cargando catálogo de repuestos...</div>}>
      <RepuestosContent searchParams={searchParams} />
    </Suspense>
  );
}

async function RepuestosContent({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; categoria?: string; marca?: string; voltaje?: string }>;
}) {
  const params = searchParams ? await searchParams : {};
  const query = params.q || '';
  const category = params.categoria || 'todas';
  const brand = params.marca || 'todas';

  return (
    <div className="flex flex-col bg-slate-50/40 min-h-screen">
      {/* Cabecera y migas de pan */}
      <div className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav aria-label="Ruta de navegación" className="flex items-center gap-2 text-xs text-gray-500 mb-3">
            <Link href="/" className="hover:text-blue-600 transition-colors">
              Inicio
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Catálogo de Repuestos</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-2">
                <span>🔧</span>
                <span>Stock Físico Inmediato & Proveedores Verificados</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                Repuestos y Componentes para Motos Eléctricas
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-2xl">
                Explora baterías, controladores senoidales, cargadores, frenos y neumáticos con garantía técnica y disponibilidad real en almacén.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/compatibilidad"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 text-xs font-semibold transition-colors"
              >
                <span>⚡</span>
                <span>Buscar por modelo exacto</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Catálogo de repuestos interactivo con filtros y búsqueda */}
      <EcoMotoCatalogSection
        initialTab="repuestos"
        showFinder={false}
        showHeader={false}
        initialQuery={query}
        initialCategory={category}
        initialBrand={brand}
      />

      <AssistanceCTA />
    </div>
  );
}
