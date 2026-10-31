import Link from "next/link";
import { Icon } from "../ui/Icons";

const NERO_CATEGORIES = [
  {
    id: "cat-baterias",
    name: "Baterías y BMS",
    description: "Packs de litio NMC y LiFePO4 con BMS inteligente para protección de celdas y mayor autonomía.",
    iconName: "battery",
    badge: "48V / 60V / 72V",
  },
  {
    id: "cat-controladores",
    name: "Controladores y ESC",
    description: "Controladores senoidales de onda suave y alta eficiencia con disipación de calor reforzada.",
    iconName: "cpu",
    badge: "Onda Senoidal",
  },
  {
    id: "cat-motores",
    name: "Motores Eléctricos",
    description: "Motores HUB brushless de rueda trasera y motores centrales de alto par de arranque.",
    iconName: "zap",
    badge: "1500W a 5000W",
  },
  {
    id: "cat-cargadores",
    name: "Cargadores Rápidos",
    description: "Cargadores de carcasa de aluminio con curva inteligente CC/CV y ventilación activa.",
    iconName: "circuit",
    badge: "Corte Automático",
  },
  {
    id: "cat-frenos",
    name: "Frenos y Regeneración",
    description: "Pinzas hidráulicas, pastillas cerámicas y manetas con microswitch de corte regenerativo.",
    iconName: "shield",
    badge: "Seguridad Activa",
  },
  {
    id: "cat-neumaticos",
    name: "Neumáticos y Cámaras",
    description: "Llantas tubeless reforzadas y cámaras antipinchazo para asfalto urbano y uso diario.",
    iconName: "tool",
    badge: "Compuesto Urbano",
  },
  {
    id: "cat-iluminacion",
    name: "Iluminación LED",
    description: "Faros principales LED de bajo consumo, intermitentes secuenciales y pilotos traseros 12V-72V.",
    iconName: "light",
    badge: "Alta Eficiencia",
  },
  {
    id: "cat-accesorios",
    name: "Accesorios y Sensores",
    description: "Convertidores DC-DC aislados, aceleradores Hall impermeables y conectores de potencia.",
    iconName: "package",
    badge: "Instalación Eléctrica",
  },
];

export function CategoryGrid() {
  return (
    <section id="categorias" className="scroll-mt-20 py-16 bg-white border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Encabezado de sección */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-4 border-b border-gray-100">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 block mb-1">
              Líneas de Especialización
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Categorías de Repuestos Técnicos
            </h2>
            <p className="mt-1 text-gray-600 text-xs sm:text-sm max-w-xl">
              Componentes rigurosamente seleccionados para garantizar compatibilidad eléctrica, rendimiento y durabilidad.
            </p>
          </div>

          <span className="mt-3 md:mt-0 text-xs font-medium text-emerald-700 flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 self-start md:self-auto">
            <span className="h-2 w-2 rounded-full bg-emerald-600" />
            8 Líneas de Componentes Homologados
          </span>
        </div>

        {/* Cuadrícula de 8 categorías */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {NERO_CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              className="group relative rounded-xl border border-gray-200 bg-white p-5 hover:border-blue-600 hover:shadow-xs transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition-colors">
                    <Icon name={cat.iconName} className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200">
                    {cat.badge}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {cat.name}
                </h3>
                <p className="mt-1.5 text-xs text-gray-600 leading-relaxed line-clamp-3">
                  {cat.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-blue-600">
                <Link
                  href="/#catalogo"
                  className="inline-flex items-center gap-1 hover:text-blue-700 transition-colors"
                >
                  Ver repuestos
                  <Icon name="arrow-right" className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
