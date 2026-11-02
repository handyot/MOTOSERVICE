import React, { Suspense } from 'react';
import Link from 'next/link';
import { EcoMotoCatalogSection } from '@/components/ecomoto/EcoMotoCatalogSection';
import { AssistanceCTA } from '@/components/home/AssistanceCTA';

export const metadata = {
  title: 'Catálogo de Motos Eléctricas Homologadas | NERO Electric Motors',
  description: 'Motos eléctricas, scooters y trimotos de las marcas líderes en Perú: TAILG, YADEA, KAYENCORP y GreenLine con especificaciones técnicas completas y repuestos asociados.',
};

export default function MotosPage({
  searchParams,
}: {
  searchParams?: Promise<{ modelo?: string; marca?: string; tab?: string }>;
}) {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-gray-500">Cargando catálogo de motos...</div>}>
      <MotosContent searchParams={searchParams} />
    </Suspense>
  );
}

async function MotosContent({
  searchParams,
}: {
  searchParams?: Promise<{ modelo?: string; marca?: string; tab?: string }>;
}) {
  const params = searchParams ? await searchParams : {};
  const initialBrand = params.marca || 'todas';
  const initialQuery = params.modelo || '';
  const initialTab = (params.tab === 'comparador' ? 'comparador' : 'motos') as 'motos' | 'comparador';

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
            <span className="text-gray-900 font-medium">Motos Eléctricas</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-2">
                <span>🏍️</span>
                <span>Catálogo Homologado en Perú</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                Motos Eléctricas, Scooters y Trimotos
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-2xl">
                Revisa potencias nominales, tensión del banco de baterías, autonomía y los repuestos compatibles verificados para cada modelo.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/compatibilidad"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100 text-xs font-semibold transition-colors"
              >
                <span>🔍</span>
                <span>Comprobar Compatibilidad</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Catálogo de motos con comparador multivehículo */}
      <EcoMotoCatalogSection
        initialTab={initialTab}
        showFinder={false}
        showHeader={false}
        initialBrand={initialBrand}
        initialQuery={initialQuery}
      />

      <AssistanceCTA />
    </div>
  );
}
