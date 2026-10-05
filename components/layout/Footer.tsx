import Link from "next/link";
import { Icon } from "../ui/Icons";

export function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-400">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500 shadow-md shadow-cyan-500/30">
                <Icon name="zap" className="h-5 w-5 text-slate-950" />
              </div>
              <span className="text-xl font-black text-white">
                MOTO<span className="text-cyan-400">SERVICE</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Repuestos y soluciones para tu moto eléctrica. Especialistas en
              baterías de litio, controladores senoidales, motores hub y
              asistencia técnica de compatibilidad.
            </p>
            <div className="text-xs text-slate-500">
              Lima, Perú • Cobertura y envíos a todo el territorio nacional.
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200 mb-4">
              Líneas de Repuestos
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="#categorias" className="hover:text-cyan-400 transition-colors">
                  Baterías de Litio & BMS
                </Link>
              </li>
              <li>
                <Link href="#categorias" className="hover:text-cyan-400 transition-colors">
                  Controladores Senoidales ESC
                </Link>
              </li>
              <li>
                <Link href="#categorias" className="hover:text-cyan-400 transition-colors">
                  Motores Brushless HUB & Centrales
                </Link>
              </li>
              <li>
                <Link href="#categorias" className="hover:text-cyan-400 transition-colors">
                  Sistemas de Frenos Regenerativos
                </Link>
              </li>
              <li>
                <Link href="#categorias" className="hover:text-cyan-400 transition-colors">
                  Cargadores Inteligentes 48V-72V
                </Link>
              </li>
            </ul>
          </div>

          {/* Models supported */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200 mb-4">
              Marcas Soportadas
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                NIU (Serie NQi, MQi, UQi)
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                Super Soco (TC, TC Max, CPx, TS)
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                Yadea (G5, C-Umi, E8S)
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                Sunra (Miku Super, Hawk, Robo)
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                Segway / Ninebot & Conversiones
              </li>
            </ul>
          </div>

          {/* Guarantees & Tech info */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200 mb-4">
              Garantía y Plataforma
            </h3>
            <div className="space-y-3 text-sm">
              <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
                <p className="text-xs font-semibold text-slate-300 mb-1">
                  Pasarela de Pago Segura (Culqi 3DS)
                </p>
                <p className="text-[11px] text-slate-500">
                  Infraestructura lista para pagos con autenticación 3D Secure y tarjetas locales/internacionales.
                </p>
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
                <p className="text-xs font-semibold text-slate-300 mb-1">
                  Arquitectura Cloud
                </p>
                <p className="text-[11px] text-slate-500">
                  Potenciado por Next.js App Router, Supabase para gestión de datos y despliegue continuo en Vercel.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-800/80 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>
            © {new Date().getFullYear()} MOTOSERVICE. Todos los derechos reservados. Repuestos y soluciones para tu moto eléctrica.
          </p>
          <div className="flex gap-6">
            <span>Términos y Condiciones</span>
            <span>Garantía de Compatibilidad</span>
            <span>Soporte Técnico</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
