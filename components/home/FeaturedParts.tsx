import { FEATURED_PARTS } from "../../lib/constants.js";
import { formatCurrency, formatVoltage, formatPower } from "../../lib/formatters.js";
import { Badge } from "../ui/Badge";
import { Icon } from "../ui/Icons";

export function FeaturedParts() {
  return (
    <section id="catalogo" className="scroll-mt-20 py-20 bg-slate-900/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <Badge variant="electric" className="mb-2">
              Selección Técnica
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Repuestos Destacados
            </h2>
            <p className="mt-2 text-slate-400 text-sm sm:text-base max-w-xl">
              Los componentes más solicitados para mantenimiento preventivo, aumento de potencia
              y extensión de autonomía.
            </p>
          </div>
          <a
            href="#compatibilidad"
            className="mt-4 md:mt-0 text-sm font-bold text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1"
          >
            Filtra por tu modelo exacto
            <Icon name="arrow-right" className="w-4 h-4" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURED_PARTS.map((part) => (
            <div
              key={part.id}
              className="rounded-2xl border border-slate-800 bg-slate-950 p-6 flex flex-col justify-between hover:border-slate-700 hover:shadow-xl hover:shadow-slate-900/50 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono text-slate-500">
                    SKU: {part.sku}
                  </span>
                  {part.isPopular && (
                    <Badge variant="electric">Más Vendido</Badge>
                  )}
                </div>

                <h3 className="text-lg font-bold text-white leading-snug">
                  {part.name}
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {part.shortDescription}
                </p>

                {/* Specs pill row */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {part.voltage && (
                    <div className="rounded-lg bg-slate-900 border border-slate-800 px-2.5 py-1 text-xs">
                      <span className="text-slate-500 mr-1">Tensión:</span>
                      <span className="font-bold text-cyan-400">{formatVoltage(part.voltage)}</span>
                    </div>
                  )}
                  {part.powerW && (
                    <div className="rounded-lg bg-slate-900 border border-slate-800 px-2.5 py-1 text-xs">
                      <span className="text-slate-500 mr-1">Potencia:</span>
                      <span className="font-bold text-white">{formatPower(part.powerW)}</span>
                    </div>
                  )}
                  {part.capacityAh && (
                    <div className="rounded-lg bg-slate-900 border border-slate-800 px-2.5 py-1 text-xs">
                      <span className="text-slate-500 mr-1">Capacidad:</span>
                      <span className="font-bold text-emerald-400">{part.capacityAh} Ah</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom footer */}
              <div className="mt-6 pt-5 border-t border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-slate-500 block">
                    Precio Estimado
                  </span>
                  <span className="text-2xl font-black text-cyan-400">
                    {formatCurrency(part.price, part.currency)}
                  </span>
                </div>

                <a
                  href="#compatibilidad"
                  className="rounded-xl bg-slate-900 hover:bg-cyan-500 hover:text-slate-950 border border-slate-700 hover:border-cyan-400 px-4 py-2.5 text-xs font-bold text-white transition-all"
                >
                  Verificar Ajuste
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
