import Link from "next/link";
import Image from "next/image";
import { Icon } from "../ui/Icons";

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-slate-50 text-gray-600">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">

          {/* Columna de Marca NeroElectric Motors */}
          <div className="space-y-3.5">
            <Link href="/" className="inline-block">
              <Image
                src="/branding/nero-electric-motors-optimized.png"
                alt="NeroElectric Motors"
                width={180}
                height={50}
                className="h-8 sm:h-9 w-auto object-contain"
              />
            </Link>
            <p className="text-xs text-gray-600 leading-relaxed">
              Tienda técnica especializada en repuestos para motocicletas eléctricas, bicimotos y VMP. Baterías, controladores, cargadores y servicio de verificación técnica.
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-700">
              <span className="flex h-2 w-2 rounded-full bg-emerald-600"></span>
              <span>Almacén Central y Taller Técnico: Lima, Perú</span>
            </div>
            <div className="pt-1">
              <a
                href="https://wa.me/51999999999?text=Hola%20NeroElectric%20Motors,%20necesito%20asistencia%20t%C3%A9cnica"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition-colors"
              >
                <Icon name="whatsapp" className="w-4 h-4 text-emerald-600" />
                WhatsApp: Consultas Técnicas
              </a>
            </div>
          </div>

          {/* Líneas de Repuestos */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-3">
              Líneas de Repuestos
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/#catalogo-ecomoto" className="hover:text-blue-600 transition-colors">
                  Baterías de Litio NMC y LiFePO4
                </Link>
              </li>
              <li>
                <Link href="/#catalogo-ecomoto" className="hover:text-blue-600 transition-colors">
                  Controladores Senoidales ESC
                </Link>
              </li>
              <li>
                <Link href="/#catalogo-ecomoto" className="hover:text-blue-600 transition-colors">
                  Motores HUB Brushless y Centrales
                </Link>
              </li>
              <li>
                <Link href="/#catalogo-ecomoto" className="hover:text-blue-600 transition-colors">
                  Cargadores Rápidos 48V - 72V
                </Link>
              </li>
              <li>
                <Link href="/#catalogo-ecomoto" className="hover:text-blue-600 transition-colors">
                  Frenos con Corte Regenerativo
                </Link>
              </li>
              <li>
                <Link href="/#catalogo-ecomoto" className="hover:text-blue-600 transition-colors">
                  Neumáticos Urbanos Reforzados
                </Link>
              </li>
            </ul>
          </div>

          {/* Marcas y Compatibilidad */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-3">
              Marcas Homologadas
            </h3>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2 text-gray-700">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                TAILG (E5, N6, F55, T7...)
              </li>
              <li className="flex items-center gap-2 text-gray-700">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                YADEA (M6, M6 Pro, E8S Pro...)
              </li>
              <li className="flex items-center gap-2 text-gray-700">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                KAYENCORP (IDO, MNK2, Sport...)
              </li>
              <li className="flex items-center gap-2 text-gray-700">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                GreenLine (M3, F4 Pro, MX6...)
              </li>
            </ul>
          </div>

          {/* Políticas y Soporte */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-3">
              Información y Soporte
            </h3>
            <div className="space-y-2.5 text-xs">
              <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-xs">
                <p className="font-semibold text-gray-900 mb-1 flex items-center gap-1.5">
                  <Icon name="shield" className="w-4 h-4 text-emerald-600" />
                  Garantía y Compatibilidad
                </p>
                <p className="text-[11px] text-gray-500 leading-snug">
                  Verificación de tensión nominal y terminales de conexión antes del despacho en almacén.
                </p>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-xs">
                <p className="font-semibold text-gray-900 mb-1 flex items-center gap-1.5">
                  <Icon name="tool" className="w-4 h-4 text-blue-600" />
                  Asistente Técnico VoltIA
                </p>
                <p className="text-[11px] text-gray-500 leading-snug">
                  Diagnóstico interactivo para identificar averías y orientar repuestos compatibles.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Barra inferior */}
        <div className="border-t border-gray-200 pt-5 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-3">
          <p>
            © {new Date().getFullYear()} NeroElectric Motors. Todos los derechos reservados. Lima, Perú.
          </p>
          <div className="flex gap-4 text-gray-600">
            <Link href="/#compatibilidad" className="hover:text-blue-600 transition-colors">
              Compatibilidad
            </Link>
            <Link href="/cuenta" className="hover:text-blue-600 transition-colors">
              Mi Cuenta
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
