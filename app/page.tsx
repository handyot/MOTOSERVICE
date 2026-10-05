import { Hero } from "../components/home/Hero";
import { CompatibilityWidget } from "../components/home/CompatibilityWidget";
import { CategoryGrid } from "../components/home/CategoryGrid";
import { FeaturedParts } from "../components/home/FeaturedParts";
import { WhyChooseUs } from "../components/home/WhyChooseUs";
import { AssistanceCTA } from "../components/home/AssistanceCTA";

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* 1. Hero banner: Propuesta de valor de MOTOSERVICE */}
      <Hero />

      {/* 2. Asistente interactivo de compatibilidad (Motor JavaScript) */}
      <CompatibilityWidget />

      {/* 3. Categorías de repuestos para motos eléctricas */}
      <CategoryGrid />

      {/* 4. Catálogo destacado con especificaciones técnicas y precios */}
      <FeaturedParts />

      {/* 5. Pilares de confianza y diferenciación */}
      <WhyChooseUs />

      {/* 6. Bloque de asistencia técnica personalizada */}
      <AssistanceCTA />
    </div>
  );
}
