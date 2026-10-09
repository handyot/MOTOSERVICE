import { Hero } from "../components/home/Hero";
import { CompatibilityWidget } from "../components/home/CompatibilityWidget";
import { CategoryGrid } from "../components/home/CategoryGrid";
import { FeaturedParts } from "../components/home/FeaturedParts";
import { WhyChooseUs } from "../components/home/WhyChooseUs";
import { AssistanceCTA } from "../components/home/AssistanceCTA";
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
          price: typeof item.precio === "number" ? item.precio : Number(item.precio),
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
      {/* 1. Hero banner: Propuesta de valor de MOTOSERVICE */}
      <Hero />

      {/* 2. Asistente interactivo de compatibilidad (Motor JavaScript) */}
      <CompatibilityWidget />

      {/* 3. Categorías de repuestos para motos eléctricas */}
      <CategoryGrid />

      {/* 4. Catálogo destacado con especificaciones técnicas y precios */}
      <FeaturedParts parts={parts} error={error} />

      {/* 5. Pilares de confianza y diferenciación */}
      <WhyChooseUs />

      {/* 6. Bloque de asistencia técnica personalizada */}
      <AssistanceCTA />
    </div>
  );
}
