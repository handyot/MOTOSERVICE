import Image from "next/image";

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
    </section>
  );
}
