import { CATEGORIES } from "../../lib/constants.js";
import { Icon } from "../ui/Icons";
import { Badge } from "../ui/Badge";

export function CategoryGrid() {
  return (
    <section id="categorias" className="scroll-mt-20 py-20 bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <Badge variant="electric" className="mb-2">
              Líneas de Especialización
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Categorías de Repuestos
            </h2>
            <p className="mt-2 text-slate-400 text-sm sm:text-base max-w-xl">
              Componentes de alto rendimiento diseñados específicamente para el ecosistema de
              tracción eléctrica ligera.
            </p>
          </div>
          <span className="mt-4 md:mt-0 text-xs font-semibold text-cyan-400 uppercase tracking-wider">
            6 Líneas Especializadas
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              className="group relative rounded-2xl border border-slate-800 bg-slate-900/40 p-6 hover:border-cyan-500/50 hover:bg-slate-900/80 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-950/80 border border-cyan-800/40 text-cyan-400 group-hover:scale-110 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-all">
                  <Icon name={cat.iconName} className="h-6 w-6" />
                </div>
                <span className="text-xs font-mono text-slate-500">
                  {cat.itemCount}+ modelos
                </span>
              </div>

              <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                {cat.name}
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
                {cat.description}
              </p>

              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-cyan-400">
                <a href="#compatibilidad" className="inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Ver compatibilidad
                  <Icon name="arrow-right" className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
