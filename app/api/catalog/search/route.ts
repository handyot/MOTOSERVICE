import { NextResponse } from 'next/server';
import {
  OFFICIAL_PARTS,
  getPublicCatalogMotos,
  getMotoWithCompatibleParts,
} from '@/data/ecomoto-data';
import { searchCatalogItems } from '@/lib/catalog/search-core.mjs';

interface PartItem {
  sku?: string;
  name: string;
  partKey?: string;
  category?: string;
  brand?: string;
  pricePen?: number;
  price?: number;
  dataStatus?: string;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawQuery = (searchParams.get('q') || searchParams.get('query') || '').trim();

    if (!rawQuery) {
      return NextResponse.json({
        query: '',
        totalMatches: 0,
        parts: [],
        motos: [],
      });
    }

    // Repuestos reales del catálogo oficial (mismos que renderiza /repuestos)
    const combinedParts: PartItem[] = OFFICIAL_PARTS.map((p) => ({
      ...p,
      dataStatus: (p as unknown as { dataStatus?: string }).dataStatus || 'ACTIVO',
    }));

    // Motos públicas que cuentan con repuestos compatibles verificados (mismo filtro que /motos)
    const motos = getPublicCatalogMotos().filter((m) => {
      const detail = getMotoWithCompatibleParts(m.slug);
      return Boolean(detail && detail.compatibleParts && detail.compatibleParts.length > 0);
    });

    type SearchCoreFn = (opts: {
      query: string;
      parts: PartItem[];
      motos: typeof motos;
    }) => {
      query: string;
      totalMatches: number;
      parts: unknown[];
      motos: unknown[];
    };

    const runSearch = searchCatalogItems as unknown as SearchCoreFn;
    const searchResult = runSearch({
      query: rawQuery,
      parts: combinedParts,
      motos: motos,
    });

    return NextResponse.json({
      query: searchResult.query,
      totalMatches: searchResult.totalMatches,
      parts: searchResult.parts.slice(0, 8),
      motos: searchResult.motos.slice(0, 6),
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error en búsqueda';
    console.error('[Search API] Error:', error);
    return NextResponse.json(
      {
        query: '',
        totalMatches: 0,
        parts: [],
        motos: [],
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
