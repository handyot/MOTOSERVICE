import Link from "next/link";
import Image from "next/image";
import { Icon } from "../ui/Icons";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-white min-h-[560px] lg:h-[590px] border-b border-gray-100">
      {/* Fotografía panorámica del taller EV con el técnico en polo oficial NeroElectric Motors */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image
          src="/images/nero-hero-technician.webp"
          alt="Técnico especialista de NeroElectric Motors trabajando en el taller con motocicleta eléctrica"
          fill
          priority
          sizes="100vw"
          className="object-cover object-right"
        />
        {/* En móvil: capa de contraste suave para mantener legibilidad */}
        <div className="absolute inset-0 bg-white/80 sm:bg-white/40 md:hidden" />
      </div>

      {/* Contenido en primer plano */}
      <div className="relative z-10 mx-auto max-w-[1560px] px-6 sm:px-8 lg:px-12 pt-8 sm:pt-10 md:pt-12">
        <div className="max-w-2xl lg:max-w-[620px] space-y-4 sm:space-y-4.5 text-left">

          {/* Badge de Marca */}
          <div className="inline-flex items-center gap-2 rounded-full border border-gray-200/90 bg-white px-3.5 py-1 text-xs font-medium text-gray-700 shadow-2xs">
            <span className="flex h-2 w-2 rounded-full bg-emerald-600" />
            <span>NeroElectric Motors • Repuestos y Mantenimiento Técnico EV</span>
          </div>

          {/* Titular Principal en 3 líneas exactas como en la referencia */}
          <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-black tracking-tight text-gray-950 leading-[1.14]">
            Repuestos, mantenimiento<br />
            y soluciones para tu<br />
            <span className="text-blue-600">
              moto eléctrica
            </span>
          </h1>

          {/* Descripción Técnica Breve */}
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed max-w-[500px]">
            Tienda técnica especializada en componentes homologados para motocicletas eléctricas, bicimotos y VMP. Baterías de litio, controladores, cargadores y electrónica de potencia con verificación técnica antes de tu compra.
          </p>

          {/* Botones Principales */}
          <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Link
              href="/#catalogo"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-95 px-6 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-2xs transition-all"
            >
              <Icon name="cart" className="w-4 h-4 text-white" />
              <span>Explorar Repuestos</span>
            </Link>

            <a
              href="https://wa.me/51999999999?text=Hola%20NeroElectric%20Motors,%20deseo%20consultar%20con%20un%20t%C3%A9cnico%20sobre%20mi%20moto%20el%C3%A9ctrica"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 active:scale-95 px-6 py-2.5 text-xs sm:text-sm font-semibold text-gray-900 transition-all shadow-2xs"
            >
              <Icon name="whatsapp" className="w-4 h-4 text-emerald-600" />
              <span>Consultar con un Técnico</span>
            </a>
          </div>

          {/* Tres Indicadores Inferiores de Confianza con anchura suficiente */}
          <div className="pt-6 sm:pt-7 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl text-xs">
            {/* 1. Tensión Verificada */}
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                <Icon name="zap" className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <strong className="text-gray-900 block font-bold text-xs whitespace-nowrap">Tensión Verificada</strong>
                <span className="text-[11px] text-gray-500 block whitespace-nowrap">Sistemas 48V, 60V y 72V</span>
              </div>
            </div>

            {/* 2. Garantía Técnica */}
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                <Icon name="shield" className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <strong className="text-gray-900 block font-bold text-xs whitespace-nowrap">Garantía Técnica</strong>
                <span className="text-[11px] text-gray-500 block whitespace-nowrap">Respaldo ante defectos de fábrica</span>
              </div>
            </div>

            {/* 3. Despacho Seguro */}
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                <Icon name="truck" className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <strong className="text-gray-900 block font-bold text-xs whitespace-nowrap">Despacho Seguro</strong>
                <span className="text-[11px] text-gray-500 block whitespace-nowrap">Embalaje especial para litio</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
