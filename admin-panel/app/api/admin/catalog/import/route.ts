/**
 * MOTOSERVICE ADMIN PANEL — Endpoint Administrativo de Importación de Catálogos (CSV / JSON)
 *
 * Seguridad:
 * - Protegido con requireAdminApi() en el servidor (401 si no hay sesión, 403 si es customer).
 * - Soporta subida de archivos desde el navegador (Vercel remoto) y escaneo local en desarrollo.
 */

import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/auth/server';
import { createClient } from '@/lib/supabase/server';
import {
  discoverScrapedFiles,
  generateImportPreview,
  executeCatalogImport,
} from '@/lib/importers/import-service';
import {
  runLiveScrape,
  scrapeCustomUrl,
  SCRAPE_STORES,
} from '@/lib/importers/scraper-service';

export async function GET() {
  const auth = await requireAdminApi();
  if (!auth.authorized) {
    return NextResponse.json(
      { success: false, error: auth.error },
      { status: auth.status }
    );
  }

  try {
    const files = discoverScrapedFiles();
    const supabase = await createClient();
    const { data: history } = await supabase
      .from('catalogo_importaciones')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(15);

    return NextResponse.json({
      success: true,
      files,
      stores: SCRAPE_STORES,
      history: history || [],
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al consultar importador';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if (!auth.authorized) {
    return NextResponse.json(
      { success: false, error: auth.error },
      { status: auth.status }
    );
  }

  try {
    const body = await request.json();
    const action = body.action || 'preview';

    if (action === 'scrape_live') {
      const stores = body.stores || 'all';
      const saveToDisk = body.saveToDisk !== false;
      const syncCatalog = body.syncCatalog !== false;
      const scrapeResult = await runLiveScrape({ stores, saveToDisk, syncCatalog });

      if (!scrapeResult.success || scrapeResult.items.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'No se pudieron extraer productos de las tiendas seleccionadas. Verifica la conectividad.',
          scrape: scrapeResult,
        });
      }

      // Generar automáticamente vista previa técnica
      const preview = await generateImportPreview([
        {
          filename: scrapeResult.filename,
          content: scrapeResult.content,
          filepath: scrapeResult.filepath,
        },
      ]);

      // Si se solicitó syncDatabase (persistir también de inmediato en PostgreSQL/Supabase)
      let dbExecution = null;
      if (body.syncDatabase) {
        try {
          dbExecution = await executeCatalogImport(preview, {
            dryRun: false,
            adminEmail: auth.account.email,
          });
        } catch (dbErr) {
          console.warn('[ADMIN SCRAPE] Advertencia en persistencia DB:', dbErr);
        }
      }

      return NextResponse.json({
        success: true,
        scrape: scrapeResult,
        preview,
        dbExecution,
      });
    }

    if (action === 'scrape_custom_url') {
      const url = String(body.url || '').trim();
      const brandName = body.brandName ? String(body.brandName).trim() : undefined;
      const syncCatalog = body.syncCatalog !== false;
      const syncDatabase = Boolean(body.syncDatabase);

      if (!url) {
        return NextResponse.json(
          { success: false, error: 'Debes ingresar una URL válida para escanear.' },
          { status: 400 }
        );
      }

      const scrapeResult = await scrapeCustomUrl({
        url,
        brandName,
        saveToDisk: true,
        syncCatalog,
        syncDatabase,
      });

      if (!scrapeResult.success) {
        return NextResponse.json({
          success: false,
          error:
            scrapeResult.error ||
            'La página web no corresponde al rubro de motos eléctricas o no se pudieron extraer repuestos.',
          scrape: scrapeResult,
        });
      }

      const preview = await generateImportPreview([
        {
          filename: scrapeResult.filename,
          content: scrapeResult.content,
          filepath: scrapeResult.filepath,
        },
      ]);

      let dbExecution = null;
      if (syncDatabase) {
        try {
          dbExecution = await executeCatalogImport(preview, {
            dryRun: false,
            adminEmail: auth.account.email,
          });
        } catch (dbErr) {
          console.warn('[ADMIN SCRAPE CUSTOM URL] Error al persistir en base de datos:', dbErr);
        }
      }

      return NextResponse.json({
        success: true,
        scrape: scrapeResult,
        preview,
        dbExecution,
      });
    }

    if (action === 'scan_local') {
      const files = discoverScrapedFiles();
      return NextResponse.json({
        success: true,
        files,
      });
    }

    if (action === 'preview') {
      const inputFiles = Array.isArray(body.files) ? body.files : [];
      if (inputFiles.length === 0) {
        return NextResponse.json(
          { success: false, error: 'No se enviaron archivos para previsualizar.' },
          { status: 400 }
        );
      }

      const preview = await generateImportPreview(inputFiles);
      return NextResponse.json({
        success: true,
        preview,
      });
    }

    if (action === 'execute') {
      const previewData = body.preview;
      const dryRun = Boolean(body.dryRun);

      if (!previewData || !Array.isArray(previewData.proposedOperations)) {
        return NextResponse.json(
          { success: false, error: 'Se requiere una vista previa válida antes de ejecutar la importación.' },
          { status: 400 }
        );
      }

      const result = await executeCatalogImport(previewData, {
        dryRun,
        adminEmail: auth.account.email,
      });

      return NextResponse.json({
        success: result.success,
        result,
      });
    }

    return NextResponse.json(
      { success: false, error: `Acción no soportada: ${action}` },
      { status: 400 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al procesar importación';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
