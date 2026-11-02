import React, { Suspense } from 'react';
import Link from 'next/link';
import { EcoMotoCatalogSection } from '@/components/ecomoto/EcoMotoCatalogSection';
import { AssistanceCTA } from '@/components/home/AssistanceCTA';

export const metadata = {
  title: 'Buscador de Compatibilidad EV | NERO Electric Motors',
  description: 'Comprueba compatibilidad verificada de baterías, controladores y motores para tu moto eléctrica sin riesgo de daño eléctrico. Asistencia con VoltIA.',
};

export default function CompatibilidadPage({
  searchParams,
}: {
  searchParams?: Promise<{ marca?: string; voltaje?: string; categoria?: string }>;
}) {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-gray-500">Cargando buscador de compatibilidad...</div>}>
      <CompatibilidadContent searchParams={searchParams} />
    </Suspense>
  );
}

async function CompatibilidadContent({
  searchParams,
}: {
  searchParams?: Promise<{ marca?: string; voltaje?: string; categoria?: string }>;
}) {
  const params = searchParams ? await searchParams : {};
  const brand = params.marca || 'todas';
  const category = params.categoria || 'todas';

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
            <span className="text-gray-900 font-medium">Buscador de Compatibilidad EV</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-2">
                <span>⚡</span>
                <span>Tolerancia y Compatibilidad Eléctrica Verificada</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                Buscador Oficial de Compatibilidad Técnica
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-2xl">
                Selecciona la marca y tensión eléctrica de tu moto para obtener repuestos 100% compatibles, condicionales y universales sin riesgo de daños.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Buscador y rejilla integrada */}
      <div className="pt-8">
        <EcoMotoCatalogSection
          initialTab="motos"
          showFinder={true}
          showHeader={true}
          initialBrand={brand}
          initialCategory={category}
        />
      </div>

      <AssistanceCTA />
    </div>
  );
}
