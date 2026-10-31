import {
  Server,
  Database,
  Code2,
  Layers,
  FileCode2
} from 'lucide-react';

export function ArchitectureStatusBanner() {
  const readinessCards = [
    {
      title: 'Next.js 16 + TypeScript',
      icon: <Server className="w-5 h-5 text-emerald-600" />,
      status: 'Activo & Verificado',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      description: 'App Router moderno con TypeScript estricto, Tailwind CSS y estructura oficial en raíz (app, components, lib, types).',
      path: 'app/, components/, lib/, types/',
    },
    {
      title: 'Supabase Database (@supabase/ssr)',
      icon: <Database className="w-5 h-5 text-blue-600" />,
      status: 'Integración Activa',
      badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
      description: 'Clientes oficiales cliente y servidor conectados mediante @supabase/ssr. Consulta en servidor activa para repuestos destacados.',
      path: 'lib/supabase/client.ts, server.ts',
    },
    {
      title: 'Catálogo Investigado EcoMoto',
      icon: <Layers className="w-5 h-5 text-blue-600" />,
      status: 'Datos Reales Locales',
      badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
      description: '52 modelos (TAILG, YADEA, KAYENCORP, GreenLine), 19 repuestos y 46 compatibilidades documentadas con comparador técnico.',
      path: 'data/ecomoto-data.ts, services/',
    },
    {
      title: 'Migraciones SQL Versionadas',
      icon: <Code2 className="w-5 h-5 text-gray-700" />,
      status: 'Esquema Oficial',
      badgeClass: 'bg-gray-100 text-gray-700 border-gray-200',
      description: 'Catálogo inicial con RLS estricto y restricciones íntegras, más migraciones y seed aditivo de datos reales EcoMoto Perú.',
      path: 'supabase/migrations/',
    },
  ];

  return (
    <section id="arquitectura" className="py-14 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="border border-gray-200 bg-slate-50 rounded-2xl p-6 lg:p-8">

          {/* Encabezado */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-5 border-b border-gray-200">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2 border border-blue-200">
                <Layers className="w-3.5 h-3.5" />
                <span>Clean Architecture Roadmap</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                Estado de la Arquitectura del Proyecto
              </h2>
              <p className="text-xs text-gray-600 mt-1 max-w-2xl">
                Diseño por capas con separación estricta entre Dominio, Servicios, Adaptadores de Integración y Capa de Presentación (UI).
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs font-medium text-gray-700 shadow-xs">
                <Code2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Clean Architecture</span>
              </span>
            </div>
          </div>

          {/* Rejilla de Módulos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {readinessCards.map((card, i) => (
              <div
                key={i}
                className="p-4 rounded-xl bg-white border border-gray-200 flex flex-col justify-between shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 rounded-lg bg-gray-50 border border-gray-100">
                      {card.icon}
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${card.badgeClass}`}>
                      {card.status}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-gray-900 mb-1.5">
                    {card.title}
                  </h3>

                  <p className="text-xs text-gray-600 leading-relaxed mb-3">
                    {card.description}
                  </p>
                </div>

                <div className="pt-2.5 border-t border-gray-100 flex items-center gap-1.5 text-[10px] font-mono text-gray-400">
                  <FileCode2 className="w-3 h-3 text-gray-400" />
                  <span className="truncate">{card.path}</span>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
