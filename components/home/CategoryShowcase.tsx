import React from 'react';
import Link from 'next/link';
import {
  BatteryCharging,
  Cpu,
  Disc,
  Gauge,
  Zap,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { CATEGORIES } from '@/data/categories';

const ICON_MAP: Record<string, React.ReactNode> = {
  BatteryCharging: <BatteryCharging className="w-6 h-6 text-emerald-400" />,
  Cpu: <Cpu className="w-6 h-6 text-teal-400" />,
  Disc: <Disc className="w-6 h-6 text-cyan-400" />,
  Gauge: <Gauge className="w-6 h-6 text-emerald-400" />,
  Zap: <Zap className="w-6 h-6 text-yellow-400" />,
  ShieldCheck: <ShieldCheck className="w-6 h-6 text-teal-400" />,
};

export function CategoryShowcase() {
  return (
    <section id="categorias" className="py-20 bg-slate-950 border-b border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Cabecera de Sección */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-3 border border-emerald-500/20">
              <span>Ingeniería y Repuestos Originales</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Categorías de Componentes EV
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-2xl">
              Cada componente ha sido probado bajo exigencias de corriente y calor para asegurar la máxima durabilidad en tu vehículo eléctrico.
            </p>
          </div>

          <Link
            href="#catalogo"
            className="inline-flex items-center gap-2 text-sm font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            <span>Ver todo el inventario</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Rejilla de Tarjetas de Categoría */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href="#catalogo"
              className="group rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/50 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/10 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center group-hover:scale-110 transition-transform">
                    {ICON_MAP[cat.iconName] || <Zap className="w-6 h-6 text-emerald-400" />}
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {cat.itemCount} items
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                  {cat.name}
                </h3>

                <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                  {cat.description}
                </p>
              </div>

              <div className="pt-6 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-slate-300 group-hover:text-emerald-400 transition-colors">
                <span>Ver repuestos disponibles</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
