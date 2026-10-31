import { SERVICE_BENEFITS } from "../../lib/constants.js";
import { Icon } from "../ui/Icons";

export function WhyChooseUs() {
  return (
    <section className="py-16 bg-white border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 pb-4 border-b border-gray-100">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 block mb-1">
            Compromiso NeroElectric Motors
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            ¿Por qué elegir NeroElectric Motors?
          </h2>
          <p className="mt-1.5 text-gray-600 text-xs sm:text-sm">
            Comprar repuestos para motos eléctricas exige rigor técnico. Verificamos la compatibilidad y respaldamos cada componente en taller.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {SERVICE_BENEFITS.map((benefit) => (
            <div
              key={benefit.id}
              className="rounded-xl border border-gray-200 bg-white p-5 flex flex-col justify-between hover:border-gray-300 hover:shadow-xs transition-all"
            >
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 mb-3.5">
                  <Icon name={benefit.icon} className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 mb-1.5">
                  {benefit.title}
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {benefit.description}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-gray-100 flex items-center text-xs font-semibold text-emerald-700">
                <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-600 mr-2" />
                Estándar Garantizado
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
