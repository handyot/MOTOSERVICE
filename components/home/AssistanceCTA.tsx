import { Icon } from "../ui/Icons";

export function AssistanceCTA() {
  return (
    <section id="asesoria" className="scroll-mt-20 py-16 bg-white border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-gray-200 bg-slate-50 p-8 sm:p-10 lg:p-12">

          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 mb-3">
              <Icon name="tool" className="w-3.5 h-3.5 text-blue-600" />
              Soporte Técnico Especializado
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight leading-tight">
              ¿Dudas sobre qué repuesto o batería necesita tu moto eléctrica?
            </h2>

            <p className="mt-3 text-sm text-gray-600 leading-relaxed">
              En <strong>NeroElectric Motors</strong> te asesoramos directamente para verificar dimensiones del compartimento, curvas de descarga de batería, conectores de potencia y programación de controladores senoidales.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <a
                href="https://wa.me/51999999999?text=Hola%20NeroElectric%20Motors,%20tengo%20una%20consulta%20t%C3%A9cnica%20sobre%20mi%20moto%20el%C3%A9ctrica"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-95 px-5 py-3 text-xs sm:text-sm font-semibold text-white shadow-xs transition-all cursor-pointer"
              >
                <Icon name="whatsapp" className="w-4 h-4 text-white" />
                <span>Contactar a un Técnico por WhatsApp</span>
              </a>

              <a
                href="#compatibilidad"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 px-5 py-3 text-xs sm:text-sm font-semibold text-gray-700 transition-all shadow-xs"
              >
                <Icon name="check-circle" className="w-4 h-4 text-blue-600" />
                <span>Verificar con Asistente VoltIA</span>
              </a>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-5 border-t border-gray-200 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <Icon name="check" className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Diagnóstico de arnés y sensores</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="check" className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Evaluación de packs de litio</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="check" className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Compatibilidad 48V, 60V y 72V</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
