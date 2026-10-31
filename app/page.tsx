import { Hero } from "../components/home/Hero";
import { CategoryGrid } from "../components/home/CategoryGrid";
import { FeaturedParts } from "../components/home/FeaturedParts";
import { TechFeatures } from "../components/home/TechFeatures";
import { ArchitectureStatusBanner } from "../components/home/ArchitectureStatusBanner";
import { WhyChooseUs } from "../components/home/WhyChooseUs";
import { AssistanceCTA } from "../components/home/AssistanceCTA";
import { NewsletterSection } from "../components/home/NewsletterSection";
import { EcoMotoCatalogSection } from "../components/ecomoto/EcoMotoCatalogSection";
import { createClient } from "../lib/supabase/server";
import type { FeaturedPartItem } from "../types";

export const dynamic = "force-dynamic";

export default async function Home() {
  let parts: FeaturedPartItem[] = [];
  let error = false;

  try {
    const supabase = await createClient();

    const { data, error: queryError } = await supabase
      .from("repuestos")
      .select(`
        id_repuesto,
        codigo_sku,
        nombre,
        descripcion,
        precio,
        moneda,
        imagen_url,
        categorias (
          nombre
        )
      `)
      .eq("estado", true)
      .order("nombre", { ascending: true })
      .limit(8);

    if (queryError) {
      console.error(
        "[MOTOSERVICE] Error al consultar repuestos destacados:",
        queryError.message
      );
      error = true;
    } else if (data) {
      parts = data.map((item) => {
        const cat = Array.isArray(item.categorias)
          ? item.categorias[0]
          : item.categorias;

        return {
          id: String(item.id_repuesto),
          sku: item.codigo_sku,
          name: item.nombre,
          shortDescription: item.descripcion || "",
          price:
            typeof item.precio === "number"
              ? item.precio
              : Number(item.precio),
          currency: item.moneda || "PEN",
          imageUrl: item.imagen_url,
          categoryName: cat?.nombre ?? null,
        };
      });
    }
  } catch (err) {
    if (typeof err === "object" && err !== null && "digest" in err) {
      throw err;
    }

    console.error(
      "[MOTOSERVICE] Error inesperado en el servidor al obtener repuestos:",
      err instanceof Error ? err.message : err
    );
    error = true;
  }

  return (
    <div className="flex flex-col">
      <Hero />

      {/* Catálogo investigado: motos oficiales, repuestos compatibles, buscador y comparador */}
      <EcoMotoCatalogSection />

      {/* Líneas de especialización de repuestos */}
      <CategoryGrid />

      {/* Repuestos destacados oficiales consultados desde Supabase */}
      <FeaturedParts parts={parts} error={error} />

      {/* Metodología y criterios de verificación técnica */}
      <TechFeatures />

      {/* Estado real y transparente de la arquitectura */}
      <ArchitectureStatusBanner />

      {/* Pilares de confianza y asistencia técnica */}
      <WhyChooseUs />
      <AssistanceCTA />

      {/* Novedades y guías técnicas */}
      <NewsletterSection />
    </div>
  );
}
