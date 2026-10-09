import { formatCurrency, formatVoltage, formatPower } from "../../lib/formatters.js";
import { Badge } from "../ui/Badge";
import { Icon } from "../ui/Icons";
import type { FeaturedPartItem } from "../../types";

interface FeaturedPartsProps {
  parts?: FeaturedPartItem[];
  error?: boolean;
}

export function FeaturedParts({ parts = [], error = false }: FeaturedPartsProps) {
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

        {error ? (
          <div className="rounded-2xl border border-rose-900/40 bg-rose-950/20 p-8 sm:p-12 text-center max-w-lg mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-rose-950/60 border border-rose-800/40 flex items-center justify-center text-rose-400 mx-auto mb-4">
              <Icon name="alert-circle" className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              No pudimos cargar los repuestos destacados
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Ocurrió una dificultad temporal al consultar el catálogo. Por favor intenta recargar la página más tarde.
            </p>
            <a
              href="#compatibilidad"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold px-4 py-2 text-xs transition-colors"
            >
              Consultar Compatibilidad
              <Icon name="arrow-right" className="w-4 h-4" />
            </a>
          </div>
        ) : parts.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-10 sm:p-14 text-center max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400 mx-auto mb-4">
              <Icon name="search" className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              No hay repuestos disponibles
            </h3>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              Actualmente no tenemos productos destacados en el catálogo activo. Vuelve a consultar pronto o explora nuestro asistente de compatibilidad.
            </p>
            <a
              href="#compatibilidad"
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-5 py-2.5 text-xs transition-colors"
            >
              Consultar Compatibilidad
              <Icon name="arrow-right" className="w-4 h-4" />
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {parts.map((part) => (
              <div
                key={part.id}
                className="rounded-2xl border border-slate-800 bg-slate-950 p-6 flex flex-col justify-between hover:border-slate-700 hover:shadow-xl hover:shadow-slate-900/50 transition-all"
              >
                <div>
                  {/* Imagen o Marcador Visual */}
                  {part.imageUrl ? (
                    <div className="relative w-full h-44 mb-5 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={part.imageUrl}
                        alt={part.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-44 mb-5 rounded-xl bg-slate-900/40 border border-slate-800/80 flex flex-col items-center justify-center text-slate-500 gap-2">
                      <div className="w-12 h-12 rounded-xl bg-slate-800/60 border border-slate-700/40 flex items-center justify-center text-cyan-400">
                        <Icon name="circuit" className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-medium text-slate-400">
                        Sin imagen disponible
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-3 gap-2">
                    <span className="text-xs font-mono text-slate-500 truncate">
                      SKU: {part.sku}
                    </span>
                    {part.categoryName ? (
                      <Badge variant="electric" className="shrink-0">
                        {part.categoryName}
                      </Badge>
                    ) : part.isPopular ? (
                      <Badge variant="electric" className="shrink-0">
                        Más Vendido
                      </Badge>
                    ) : null}
                  </div>

                  <h3 className="text-lg font-bold text-white leading-snug">
                    {part.name}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed line-clamp-3">
                    {part.shortDescription}
                  </p>

                  {/* Specs pill row */}
                  {(part.voltage || part.powerW || part.capacityAh) ? (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {part.voltage && (
                        <div className="rounded-lg bg-slate-900 border border-slate-800 px-2.5 py-1 text-xs">
                          <span className="text-slate-500 mr-1">Tensión:</span>
                          <span className="font-bold text-cyan-400">
                            {formatVoltage(part.voltage)}
                          </span>
                        </div>
                      )}
                      {part.powerW && (
                        <div className="rounded-lg bg-slate-900 border border-slate-800 px-2.5 py-1 text-xs">
                          <span className="text-slate-500 mr-1">Potencia:</span>
                          <span className="font-bold text-white">
                            {formatPower(part.powerW)}
                          </span>
                        </div>
                      )}
                      {part.capacityAh && (
                        <div className="rounded-lg bg-slate-900 border border-slate-800 px-2.5 py-1 text-xs">
                          <span className="text-slate-500 mr-1">Capacidad:</span>
                          <span className="font-bold text-emerald-400">
                            {part.capacityAh} Ah
                          </span>
                        </div>
                      )}
                    </div>
                  ) : null}
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
        )}
      </div>
    </section>
  );
}
