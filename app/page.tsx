import { Hero } from "../components/home/Hero";
import { EcoMotoCatalogSection } from "../components/ecomoto/EcoMotoCatalogSection";
import { AssistanceCTA } from "../components/home/AssistanceCTA";
import { NewsletterSection } from "../components/home/NewsletterSection";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <div className="flex flex-col">
      <Hero />

      {/* Catálogo oficial: motos y repuestos compatibles */}
      <EcoMotoCatalogSection showComparatorTab={false} />

      {/* Asistencia técnica directa y soporte */}
      <AssistanceCTA />

      {/* Cupón y suscripción */}
      <NewsletterSection />
    </div>
  );
}
