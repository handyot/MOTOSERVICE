import { Icon } from "../ui/Icons";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pt-12 pb-20 md:pt-20 md:pb-28">
      {/* Background ambient lighting effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-cyan-500/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[300px] h-[200px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3.5 py-1.5 text-xs font-semibold text-cyan-300 shadow-inner">
            <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            Especialistas en Movilidad Eléctrica y Repuestos
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            Repuestos y soluciones para tu{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500 bg-clip-text text-transparent">
              moto eléctrica
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            Plataforma especializada en componentes de alta durabilidad: baterías de litio,
            controladores senoidales, motores HUB y electrónica de potencia.
            Verifica la compatibilidad técnica exacta antes de comprar.
          </p>

          {/* CTA Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#compatibilidad"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3.5 text-base font-bold text-slate-950 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02] active:scale-95 transition-all"
            >
              <Icon name="check-circle" className="w-5 h-5 text-slate-950" />
              Verificar Compatibilidad de mi Moto
            </a>
            <a
              href="#catalogo"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-6 py-3.5 text-base font-semibold text-slate-200 hover:border-slate-500 hover:bg-slate-850 hover:text-white transition-all"
            >
              Ver Repuestos Destacados
              <Icon name="arrow-right" className="w-4 h-4 text-cyan-400" />
            </a>
          </div>

          {/* Trust Metrics Bar */}
          <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-slate-800/80 mt-12 text-left">
            <div className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-4">
              <div className="text-2xl font-black text-cyan-400">100%</div>
              <div className="text-xs text-slate-400 mt-0.5">
                Compatibilidad eléctrica validada
              </div>
            </div>
            <div className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-4">
              <div className="text-2xl font-black text-white">48V - 72V</div>
              <div className="text-xs text-slate-400 mt-0.5">
                Tensiones de tracción soportadas
              </div>
            </div>
            <div className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-4">
              <div className="text-2xl font-black text-emerald-400">Homologado</div>
              <div className="text-xs text-slate-400 mt-0.5">
                Celdas grado A y controladores probados
              </div>
            </div>
            <div className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-4">
              <div className="text-2xl font-black text-white">Asistencia</div>
              <div className="text-xs text-slate-400 mt-0.5">
                Soporte técnico especializado
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
