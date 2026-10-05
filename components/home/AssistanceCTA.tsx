import { Icon } from "../ui/Icons";
import { Badge } from "../ui/Badge";

export function AssistanceCTA() {
  return (
    <section id="asesoria" className="scroll-mt-20 py-20 bg-gradient-to-b from-slate-900 to-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-cyan-500/30 bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950/40 p-8 sm:p-12 lg:p-16">
          {/* Background glow */}
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl">
            <Badge variant="electric" className="mb-4">
              Asistencia Técnica al Cliente
            </Badge>

            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              ¿Dudas sobre la compatibilidad del controlador o batería de tu moto?
            </h2>

            <p className="mt-4 text-base text-slate-300 leading-relaxed">
              Nuestro equipo técnico te ayuda a validar dimensiones, protocolos de comunicación
              (CAN-Bus/LIN), arnés de cables y voltaje antes de que realices cualquier compra.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <a
                href="#compatibilidad"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 px-6 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-400/20 transition-all"
              >
                <Icon name="check-circle" className="w-5 h-5 text-slate-950" />
                Diagnosticar mi Moto Ahora
              </a>

              <div className="inline-flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-800 bg-slate-900/60 text-slate-300 text-xs sm:text-sm">
                <Icon name="headset" className="w-5 h-5 text-cyan-400 shrink-0" />
                <span>Atención directa para talleres y propietarios particulares.</span>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-800/80">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Icon name="check" className="w-4 h-4 text-emerald-400 shrink-0" />
                Revisión de arnés y fichas
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Icon name="check" className="w-4 h-4 text-emerald-400 shrink-0" />
                Validación de BMS y celdas
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Icon name="check" className="w-4 h-4 text-emerald-400 shrink-0" />
                Configuración de controladores
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
