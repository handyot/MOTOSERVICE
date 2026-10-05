import { SERVICE_BENEFITS } from "../../lib/constants.js";
import { Icon } from "../ui/Icons";
import { Badge } from "../ui/Badge";

export function WhyChooseUs() {
  return (
    <section className="py-20 bg-slate-950 border-t border-slate-800/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <Badge variant="electric" className="mb-3">
            Compromiso MOTOSERVICE
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            ¿Por qué elegir MOTOSERVICE?
          </h2>
          <p className="mt-3 text-slate-400 text-sm sm:text-base">
            Comprar repuestos para motos eléctricas requiere precisión técnica.
            Protegemos tu inversión con validación experta.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {SERVICE_BENEFITS.map((benefit) => (
            <div
              key={benefit.id}
              className="rounded-2xl border border-slate-800/90 bg-slate-900/40 p-6 flex flex-col justify-between hover:border-cyan-500/40 hover:bg-slate-900/70 transition-all"
            >
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-950 border border-cyan-800/50 text-cyan-400 mb-5">
                  <Icon name={benefit.icon} className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  {benefit.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {benefit.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center text-xs font-semibold text-cyan-400">
                <span className="flex h-1.5 w-1.5 rounded-full bg-cyan-400 mr-2" />
                Estándar Garantizado
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
