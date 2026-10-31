'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '../ui/Icons';
import type { EcoMotoBrand } from '@/types';
import type {
  ScrapedFileDescriptor,
  ImportPreviewResult,
  ImportExecutionResult,
  NormalizedItem,
} from '@/lib/importers/types';

export interface ImportHistoryRecord {
  id_importacion: number;
  modo: string;
  total_archivos: number;
  total_registros_brutos: number;
  productos_validos: number;
  motos_procesadas: number;
  repuestos_procesados: number;
  registros_omitidos: number;
  admin_email?: string | null;
  created_at: string;
}

interface FileSelection {
  filename: string;
  sizeBytes: number;
  format: 'csv' | 'json';
  brandOverride?: EcoMotoBrand;
  content?: string;
  filepath?: string;
}

interface CatalogImporterViewProps {
  initialHistory?: ImportHistoryRecord[];
  onCatalogUpdated?: () => void;
}

export function CatalogImporterView({
  initialHistory = [],
  onCatalogUpdated,
}: CatalogImporterViewProps) {
  const router = useRouter();
  const [selectedFiles, setSelectedFiles] = useState<FileSelection[]>([]);
  const [history, setHistory] = useState<ImportHistoryRecord[]>(initialHistory);
  const [isScanning, setIsScanning] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [preview, setPreview] = useState<ImportPreviewResult | null>(null);
  const [executionResult, setExecutionResult] = useState<ImportExecutionResult | null>(null);
  const [confirmedExecution, setConfirmedExecution] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'conflicts' | 'skipped' | 'operaciones'>('preview');
  const [searchQuery, setSearchQuery] = useState('');
  const [brandFilter, setBrandFilter] = useState<string>('ALL');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Estado del extractor / web scraper en vivo
  const [isScraping, setIsScraping] = useState(false);
  const [selectedScrapeStore, setSelectedScrapeStore] = useState<'all' | 'electrica' | 'tailg' | 'kayencorp'>('all');
  const [autoSyncArchitecture, setAutoSyncArchitecture] = useState(true);
  const [autoSyncDatabase, setAutoSyncDatabase] = useState(false);
  const [scrapeSummary, setScrapeSummary] = useState<{
    totalFound: number;
    filename: string;
    savedToDisk: boolean;
    brandBreakdown: Record<string, number>;
    categoryBreakdown: Record<string, number>;
    storesScraped: Array<{ name: string; domain: string; found: number; status: string; error?: string }>;
    syncResult?: {
      success: boolean;
      totalParts: number;
      totalCompatibilities: number;
      newPartsAdded: number;
      existingPartsUpdated: number;
      error?: string;
    };
  } | null>(null);

  // Estado del escáner de nueva URL externa (rubro y autocreación de marcas)
  const [customUrl, setCustomUrl] = useState('');
  const [customBrandOverride, setCustomBrandOverride] = useState('');
  const [isScanningUrl, setIsScanningUrl] = useState(false);
  const [urlScanResult, setUrlScanResult] = useState<{
    url: string;
    rubroValidation: {
      isValid: boolean;
      score: number;
      matchedKeywords: string[];
      reason: string;
    };
    detectedBrand: string;
    detectedSupplier: string;
    isNewBrand: boolean;
    totalFound: number;
    vehiclesCount: number;
    partsCount: number;
    syncResult?: {
      success: boolean;
      brandAdded?: boolean;
      supplierAdded?: boolean;
      modelsAdded?: number;
      compatibilitiesAdded?: number;
      totalParts: number;
      totalCompatibilities: number;
      newPartsAdded: number;
    };
  } | null>(null);

  const handleScanCustomUrl = async () => {
    if (!customUrl.trim()) {
      setFeedback({ type: 'error', message: 'Ingresa una URL de tienda o catálogo para escanear.' });
      return;
    }

    setIsScanningUrl(true);
    setFeedback(null);
    setUrlScanResult(null);

    try {
      const res = await fetch('/api/admin/catalog/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'scrape_custom_url',
          url: customUrl.trim(),
          brandName: customBrandOverride.trim() || undefined,
          syncCatalog: autoSyncArchitecture,
          syncDatabase: autoSyncDatabase,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.scrape) {
        setUrlScanResult(data.scrape);
        setSelectedFiles([
          {
            filename: data.scrape.filename,
            sizeBytes: data.scrape.content ? data.scrape.content.length : 1024,
            format: 'json',
            content: data.scrape.content,
            filepath: data.scrape.filepath,
          },
        ]);
        if (data.preview) {
          setPreview(data.preview);
        }

        const brandStatus = data.scrape.isNewBrand
          ? `Se registró la nueva marca "${data.scrape.detectedBrand}" y su proveedor oficial.`
          : `Asociado a la marca "${data.scrape.detectedBrand}".`;

        const syncMsg = data.scrape.syncResult?.success
          ? ` Catálogo público y arquitectura actualizados (${data.scrape.syncResult.totalParts} repuestos activos, ${data.scrape.syncResult.totalCompatibilities} compatibilidades vinculadas).`
          : '';

        setFeedback({
          type: 'success',
          message: `¡URL verificada con éxito! ${brandStatus} Se extrajeron ${data.scrape.totalFound} productos (${data.scrape.vehiclesCount} motos, ${data.scrape.partsCount} repuestos).${syncMsg}`,
        });

        onCatalogUpdated?.();
        router.refresh();
      } else {
        const errReason = data.error || data.scrape?.rubroValidation?.reason || 'Error al escanear la URL.';
        setFeedback({
          type: 'error',
          message: errReason,
        });
        if (data.scrape?.rubroValidation) {
          setUrlScanResult(data.scrape);
        }
      }
    } catch {
      setFeedback({
        type: 'error',
        message: 'Error de comunicación al intentar escanear la URL. Verifica tu conexión de red.',
      });
    } finally {
      setIsScanningUrl(false);
    }
  };

  const handleRunLiveScrape = async () => {
    setIsScraping(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/admin/catalog/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'scrape_live',
          stores: selectedScrapeStore,
          saveToDisk: true,
          syncCatalog: autoSyncArchitecture,
          syncDatabase: autoSyncDatabase,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.scrape) {
        setScrapeSummary(data.scrape);
        setSelectedFiles([
          {
            filename: data.scrape.filename,
            sizeBytes: data.scrape.content ? data.scrape.content.length : 1024,
            format: 'json',
            content: data.scrape.content,
            filepath: data.scrape.filepath,
          },
        ]);
        if (data.preview) {
          setPreview(data.preview);
        }

        const syncMsg = data.scrape.syncResult?.success
          ? ` Catálogo público y arquitectura actualizados exitosamente (${data.scrape.syncResult.totalParts} repuestos activos, ${data.scrape.syncResult.totalCompatibilities} compatibilidades vinculadas).`
          : '';

        setFeedback({
          type: 'success',
          message: `Scraping completado: Se extrajeron ${data.scrape.totalFound} repuestos oficiales.${syncMsg}`,
        });

        onCatalogUpdated?.();
        router.refresh();
      } else {
        setFeedback({
          type: 'error',
          message: data.error || 'Error al ejecutar scraping en vivo de proveedores.',
        });
      }
    } catch {
      setFeedback({
        type: 'error',
        message: 'Error de conexión o timeout al consultar las tiendas de proveedores.',
      });
    } finally {
      setIsScraping(false);
    }
  };

  const handleScanLocalFolder = async () => {
    setIsScanning(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/admin/catalog/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'scan_local' }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const mapped: FileSelection[] = data.files.map((f: ScrapedFileDescriptor) => ({
          filename: f.filename,
          sizeBytes: f.sizeBytes,
          format: f.format,
          filepath: f.path,
        }));
        setSelectedFiles(mapped);
        setFeedback({
          type: mapped.length > 0 ? 'success' : 'info',
          message:
            mapped.length > 0
              ? `Se detectaron ${mapped.length} archivos en la carpeta local «JSON DEL SCRAPS».`
              : 'Carpeta local vacía o entorno remoto (Vercel). Utiliza «Subir Archivos CSV / JSON» desde tu navegador.',
        });
      } else {
        setFeedback({
          type: 'error',
          message: data.error || 'No se pudo acceder a la carpeta local.',
        });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Error de conexión con el servidor.' });
    } finally {
      setIsScanning(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    Array.from(fileList).forEach((file) => {
      const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
      if (ext === '.csv' || ext === '.json') {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          setSelectedFiles((prev) => [
            ...prev.filter((p) => p.filename !== file.name),
            {
              filename: file.name,
              sizeBytes: file.size,
              format: ext === '.csv' ? 'csv' : 'json',
              content,
            },
          ]);
        };
        reader.readAsText(file);
      }
    });

    setFeedback({
      type: 'info',
      message: 'Archivos CSV/JSON cargados en memoria desde tu navegador listos para simulación.',
    });
  };

  const handleGeneratePreview = async () => {
    if (selectedFiles.length === 0) {
      setFeedback({ type: 'error', message: 'Selecciona al menos un archivo antes de continuar.' });
      return;
    }

    setIsPreviewing(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/admin/catalog/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'preview',
          files: selectedFiles,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setPreview(data.preview);
        setFeedback({
          type: 'success',
          message: `Simulación completada: ${data.preview.validProducts} productos normalizados (${data.preview.vehiclesCount} motos, ${data.preview.partsCount} repuestos).`,
        });
      } else {
        setFeedback({ type: 'error', message: data.error || 'Error al generar la vista previa.' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Error de comunicación al procesar los archivos.' });
    } finally {
      setIsPreviewing(false);
    }
  };

  const handleExecuteImport = async () => {
    if (!preview) {
      setFeedback({ type: 'error', message: 'Debes generar la vista previa antes de ejecutar la importación.' });
      return;
    }
    if (!confirmedExecution) {
      setFeedback({ type: 'error', message: 'Debes marcar la casilla de confirmación para autorizar la persistencia.' });
      return;
    }

    setIsExecuting(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/admin/catalog/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'execute',
          preview,
          dryRun: false,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setExecutionResult(data.result);
        setFeedback({
          type: 'success',
          message: `Importación completada: ${data.result.insertedCount} creados, ${data.result.skippedCount} omitidos por existencia.`,
        });
        const histRes = await fetch('/api/admin/catalog/import');
        if (histRes.ok) {
          const histData = await histRes.json();
          if (histData.history) setHistory(histData.history);
        }

        onCatalogUpdated?.();
        router.refresh();
      } else {
        setFeedback({
          type: 'error',
          message: data.error || data.result?.errors?.[0] || 'Error durante la persistencia en la base de datos.',
        });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Fallo al conectar con el endpoint de importación.' });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleDownloadReport = () => {
    if (!preview) return;
    const reportData = {
      timestamp: new Date().toISOString(),
      preview,
      executionResult,
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-importacion-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredPreviewItems = useMemo(() => {
    if (!preview) return [];
    const q = searchQuery.trim().toLowerCase();
    return preview.sampleItems.filter((item: NormalizedItem) => {
      const matchesBrand = brandFilter === 'ALL' || item.brand === brandFilter;
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        (item.sku && item.sku.toLowerCase().includes(q)) ||
        item.category.toLowerCase().includes(q);
      return matchesBrand && matchesSearch;
    });
  }, [preview, searchQuery, brandFilter]);

  return (
    <div className="space-y-6">
      {/* Encabezado de Sección y Acciones Primarias */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Importador de Catálogos (CSV / JSON)
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl">
            Normalización técnica, deduplicación cruzada e importación idempotente de catálogos para{' '}
            <strong className="font-semibold text-slate-800">TAILG, GreenLine, YADEA y Kayencorp</strong> hacia PostgreSQL.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleScanLocalFolder}
            disabled={isScanning}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Icon name="search" className="w-3.5 h-3.5 text-slate-500" />
            <span>{isScanning ? 'Escaneando carpeta...' : 'Escanear carpeta local'}</span>
          </button>

          <label className="inline-flex items-center gap-2 rounded-lg bg-[#0B1528] hover:bg-slate-800 px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer">
            <Icon name="upload" className="w-3.5 h-3.5 text-amber-400" />
            <span>Subir archivos (CSV / JSON)</span>
            <input
              type="file"
              multiple
              accept=".csv,.json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Notificación contextual */}
      {feedback && (
        <div
          role="status"
          className={`rounded-xl border px-4 py-3 text-xs sm:text-sm flex items-center justify-between gap-3 ${
            feedback.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : feedback.type === 'error'
              ? 'border-red-200 bg-red-50 text-red-800'
              : 'border-amber-200 bg-amber-50 text-amber-900'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Icon
              name={
                feedback.type === 'success'
                  ? 'check-circle'
                  : feedback.type === 'error'
                  ? 'alert-triangle'
                  : 'zap'
              }
              className={`w-4 h-4 shrink-0 ${
                feedback.type === 'success'
                  ? 'text-emerald-600'
                  : feedback.type === 'error'
                  ? 'text-red-600'
                  : 'text-amber-600'
              }`}
            />
            <span className="font-medium">{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-700 p-1 rounded"
            aria-label="Cerrar notificación"
          >
            <Icon name="x" className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* MÓDULO DESTACADO: WEB SCRAPER EN VIVO */}
      <section className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50/60 via-white to-slate-50 p-5 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100/80 border border-blue-300 text-blue-800 text-[11px] font-bold uppercase tracking-wider mb-2">
              <Icon name="zap" className="w-3 h-3 text-blue-600" />
              <span>Extracción Automática en Tiempo Real</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>Web Scraper de Tiendas Oficiales (Perú)</span>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                ● En vivo
              </span>
            </h3>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Conexión directa a las tiendas oficiales de motos y repuestos eléctricos. Extrae automáticamente precios actualizados en Soles (PEN), imágenes verificadas, códigos SKU y compatibilidades técnicas sin necesidad de archivos manuales.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            <select
              value={selectedScrapeStore}
              onChange={(e) => setSelectedScrapeStore(e.target.value as 'all' | 'electrica' | 'tailg' | 'kayencorp')}
              disabled={isScraping}
              className="bg-white border border-slate-300 text-xs font-semibold text-slate-800 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-600 shadow-2xs"
            >
              <option value="all">⚡ Todas las tiendas (150+ repuestos)</option>
              <option value="electrica">Electrica.pe (Yadea, GreenLine, TianNeng)</option>
              <option value="tailg">TAILG Perú Oficial (tailg.com.pe)</option>
              <option value="kayencorp">Kayencorp (kayencorp.com)</option>
            </select>

            <button
              type="button"
              onClick={handleRunLiveScrape}
              disabled={isScraping}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 px-4 py-2 text-xs font-bold text-white shadow-2xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Icon name={isScraping ? "clock" : "zap"} className={`w-3.5 h-3.5 ${isScraping ? 'animate-spin' : ''}`} />
              <span>{isScraping ? 'Extrayendo y sincronizando...' : 'Scraping y Sincronización Total'}</span>
            </button>
          </div>
        </div>

        {/* Opciones de Sincronización Automática */}
        <div className="mt-3 pt-3 border-t border-blue-100/70 flex flex-wrap items-center gap-4 text-xs">
          <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
            <input
              type="checkbox"
              checked={autoSyncArchitecture}
              onChange={(e) => setAutoSyncArchitecture(e.target.checked)}
              disabled={isScraping}
              className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
            />
            <span>Sincronizar automáticamente la arquitectura pública (<code className="font-mono text-blue-700 bg-blue-50 px-1 py-0.5 rounded">data/ecomoto-data.ts</code>)</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
            <input
              type="checkbox"
              checked={autoSyncDatabase}
              onChange={(e) => setAutoSyncDatabase(e.target.checked)}
              disabled={isScraping}
              className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
            />
            <span>Persistir en base de datos PostgreSQL/Supabase si está conectada</span>
          </label>
        </div>

        {/* Resumen de Scraping si ya se ejecutó */}
        {scrapeSummary && (
          <div className="mt-4 pt-4 border-t border-blue-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-slate-700">Proveedores consultados:</span>
              {scrapeSummary.storesScraped.map((s, idx) => (
                <span
                  key={idx}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium border ${
                    s.status === 'ok'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-red-50 text-red-800 border-red-200'
                  }`}
                >
                  <span className="font-bold">{s.name}:</span>
                  <span>{s.found} repuestos</span>
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2">
              {scrapeSummary.syncResult?.success ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-300 font-semibold text-[11px]">
                  <Icon name="check-circle" className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Catálogo público actualizado: {scrapeSummary.syncResult.totalParts} repuestos y {scrapeSummary.syncResult.totalCompatibilities} compatibilidades activas</span>
                </span>
              ) : (
                <span className="text-slate-500 flex items-center gap-1">
                  <Icon name="check-circle" className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{scrapeSummary.totalFound} repuestos listos para importar</span>
                </span>
              )}
            </div>
          </div>
        )}
      </section>

      {/* MÓDULO NUEVA URL: ESCÁNER DE PÁGINAS EXTERNAS DEL RUBRO */}
      <section className="rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50/50 via-white to-slate-50 p-5 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-100/90 border border-indigo-300 text-indigo-900 text-[11px] font-bold uppercase tracking-wider mb-2">
              <Icon name="search" className="w-3 h-3 text-indigo-600" />
              <span>Escaneo y Fusión de Nueva URL del Rubro</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>Escanear Tienda Externa y Auto-crear Marca en Tablas</span>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 border border-indigo-200">
                ● Auto-fusión segura
              </span>
            </h3>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Introduce la URL de cualquier tienda o página web de movilidad eléctrica. El sistema verificará de forma estricta si corresponde al rubro de motos eléctricas y repuestos, extraerá los productos, auto-creará la nueva marca en las tablas correspondientes y fusionará el catálogo sin romper la arquitectura existente.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
            <input
              type="url"
              placeholder="https://tienda-motos.pe/repuestos"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              disabled={isScanningUrl}
              className="bg-white border border-slate-300 text-xs text-slate-800 rounded-lg px-3 py-2 w-full sm:w-64 focus:ring-2 focus:ring-indigo-600 shadow-2xs"
            />
            <input
              type="text"
              placeholder="Marca (opcional)"
              value={customBrandOverride}
              onChange={(e) => setCustomBrandOverride(e.target.value)}
              disabled={isScanningUrl}
              className="bg-white border border-slate-300 text-xs text-slate-800 rounded-lg px-3 py-2 w-full sm:w-32 focus:ring-2 focus:ring-indigo-600 shadow-2xs"
            />
            <button
              type="button"
              onClick={handleScanCustomUrl}
              disabled={isScanningUrl || !customUrl.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 px-4 py-2 text-xs font-bold text-white shadow-2xs transition-colors disabled:opacity-50 cursor-pointer shrink-0"
            >
              <Icon name={isScanningUrl ? "clock" : "search"} className={`w-3.5 h-3.5 ${isScanningUrl ? 'animate-spin' : ''}`} />
              <span>{isScanningUrl ? 'Verificando y fusionando...' : 'Escanear y Fusionar Nueva URL'}</span>
            </button>
          </div>
        </div>

        {/* Resumen del escaneo de URL si ya se realizó */}
        {urlScanResult && (
          <div className="mt-4 pt-4 border-t border-indigo-100 flex flex-col gap-2.5 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold border ${
                    urlScanResult.rubroValidation.isValid
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-red-50 text-red-800 border-red-300'
                  }`}
                >
                  <Icon
                    name={urlScanResult.rubroValidation.isValid ? 'check-circle' : 'alert-circle'}
                    className="w-3.5 h-3.5"
                  />
                  <span>
                    {urlScanResult.rubroValidation.isValid
                      ? `Rubro Verificado (Puntuación: ${urlScanResult.rubroValidation.score}/100)`
                      : `Rubro No Coincide (Puntuación: ${urlScanResult.rubroValidation.score}/100)`}
                  </span>
                </span>

                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 font-medium text-[11px]">
                  <span className="font-bold">Marca:</span>
                  <span className="text-indigo-600 font-bold">{urlScanResult.detectedBrand}</span>
                  {urlScanResult.isNewBrand && (
                    <span className="ml-1 text-[10px] bg-indigo-100 text-indigo-800 px-1.5 py-0.2 rounded font-semibold">
                      Nueva Marca
                    </span>
                  )}
                </span>

                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 font-medium text-[11px]">
                  <span className="font-bold">Extraídos:</span>
                  <span>{urlScanResult.totalFound} productos ({urlScanResult.vehiclesCount} vehículos, {urlScanResult.partsCount} repuestos)</span>
                </span>
              </div>

              {urlScanResult.syncResult?.success && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-300 font-semibold text-[11px]">
                  <Icon name="check-circle" className="w-3.5 h-3.5 text-emerald-700" />
                  <span>
                    Arquitectura actualizada ({urlScanResult.syncResult.totalParts} repuestos activos)
                  </span>
                </span>
              )}
            </div>

            {urlScanResult.rubroValidation.matchedKeywords?.length > 0 && (
              <div className="flex flex-wrap items-center gap-1 text-[11px] text-slate-600">
                <span className="font-semibold text-slate-500">Palabras clave detectadas:</span>
                {urlScanResult.rubroValidation.matchedKeywords.slice(0, 8).map((kw, i) => (
                  <span key={i} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-mono text-[10px]">
                    {kw}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Paso 1: Bandeja de Archivos Seleccionados */}
      <section className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-[#0B1528] text-amber-400 text-xs font-bold">
              1
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>Archivos en Cola de Procesamiento</span>
                <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-mono font-bold text-slate-700">
                  {selectedFiles.length}
                </span>
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {selectedFiles.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFiles([]);
                    setPreview(null);
                    setExecutionResult(null);
                  }}
                  className="rounded-lg border border-slate-300 bg-white hover:bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors cursor-pointer"
                >
                  Limpiar lista
                </button>
                <button
                  type="button"
                  onClick={handleGeneratePreview}
                  disabled={isPreviewing}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-amber-400 hover:bg-amber-500 px-4 py-1.5 text-xs font-bold text-slate-950 shadow-2xs transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <Icon name="check" className="w-3.5 h-3.5" />
                  <span>{isPreviewing ? 'Ejecutando simulación...' : 'Simular Importación (Dry-Run)'}</span>
                </button>
              </>
            )}
          </div>
        </div>

        {selectedFiles.length === 0 ? (
          <div className="p-10 text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-500 mb-3">
              <Icon name="upload" className="w-5 h-5" />
            </div>
            <p className="text-sm font-semibold text-slate-800">
              No hay archivos seleccionados para procesar
            </p>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Carga archivos <code className="font-mono text-slate-700">.csv</code> o{' '}
              <code className="font-mono text-slate-700">.json</code> desde tu equipo o utiliza el botón «Escanear carpeta local» si trabajas en el servidor de desarrollo.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3">Nombre del Archivo</th>
                  <th className="px-4 py-3">Formato</th>
                  <th className="px-4 py-3">Tamaño</th>
                  <th className="px-4 py-3">Regla de Marca</th>
                  <th className="px-4 py-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700">
                {selectedFiles.map((file, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-medium text-slate-900">
                      {file.filename}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase border ${
                          file.format === 'csv'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-blue-50 text-blue-800 border-blue-200'
                        }`}
                      >
                        {file.format}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-500">
                      {(file.sizeBytes / 1024).toFixed(1)} KB
                    </td>
                    <td className="px-4 py-3">
                      <select
                        aria-label={`Marca para ${file.filename}`}
                        value={file.brandOverride || ''}
                        onChange={(e) => {
                          const val = (e.target.value as EcoMotoBrand) || undefined;
                          setSelectedFiles((prev) =>
                            prev.map((f, i) => (i === idx ? { ...f, brandOverride: val } : f))
                          );
                        }}
                        className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-800 focus:border-slate-900 focus:outline-none"
                      >
                        <option value="">Auto-detectar por origen/contenido</option>
                        <option value="TAILG">TAILG</option>
                        <option value="KAYENCORP">Kayencorp</option>
                        <option value="YADEA">YADEA</option>
                        <option value="GREENLINE">GreenLine</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedFiles((prev) => prev.filter((_, i) => i !== idx))}
                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <Icon name="trash" className="w-3.5 h-3.5" />
                        <span>Quitar</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Paso 2: Resultados de la Simulación (Dry-Run) */}
      {preview && (
        <section className="space-y-6">
          {/* Métricas de Simulación */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
                Registros Brutos
              </span>
              <span className="text-2xl font-bold text-slate-900 mt-1 block font-mono">
                {preview.totalRawRecords}
              </span>
              <span className="text-[11px] text-slate-500 mt-0.5 block">
                En {preview.totalFiles} archivos
              </span>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-2xs">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800 block">
                Productos Válidos
              </span>
              <span className="text-2xl font-bold text-emerald-700 mt-1 block font-mono">
                {preview.validProducts}
              </span>
              <span className="text-[11px] text-emerald-700 mt-0.5 block">
                Normalizados
              </span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
                Modelos de Motos
              </span>
              <span className="text-2xl font-bold text-slate-900 mt-1 block font-mono">
                {preview.vehiclesCount}
              </span>
              <span className="text-[11px] text-slate-500 mt-0.5 block">
                Tabla <code className="font-mono">modelos_moto</code>
              </span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
                Repuestos y Partes
              </span>
              <span className="text-2xl font-bold text-slate-900 mt-1 block font-mono">
                {preview.partsCount}
              </span>
              <span className="text-[11px] text-slate-500 mt-0.5 block">
                Tabla <code className="font-mono">repuestos</code>
              </span>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-4 shadow-2xs">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-800 block">
                Duplicados Fusionados
              </span>
              <span className="text-2xl font-bold text-amber-700 mt-1 block font-mono">
                {preview.duplicatesIdentified}
              </span>
              <span className="text-[11px] text-amber-700 mt-0.5 block">
                Cruce CSV + JSON
              </span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
                No-Productos Omitidos
              </span>
              <span className="text-2xl font-bold text-slate-700 mt-1 block font-mono">
                {preview.invalidOrSkippedRecords.length}
              </span>
              <span className="text-[11px] text-slate-500 mt-0.5 block">
                Carritos, blogs, sedes
              </span>
            </div>
          </div>

          {/* Distribución por Marca */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Distribución por Marca Reconocida (clic para filtrar)
              </h4>
              {brandFilter !== 'ALL' && (
                <button
                  type="button"
                  onClick={() => setBrandFilter('ALL')}
                  className="text-xs font-semibold text-blue-700 hover:underline self-start sm:self-auto cursor-pointer"
                >
                  Mostrar todas las marcas
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(preview.productsByBrand).map(([brand, count]) => {
                const isSelected = brandFilter === brand;
                return (
                  <button
                    type="button"
                    key={brand}
                    onClick={() => setBrandFilter(isSelected ? 'ALL' : brand)}
                    className={`flex items-center justify-between rounded-lg border px-3.5 py-2.5 text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#0B1528] bg-[#0B1528] text-white shadow-2xs'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800'
                    }`}
                  >
                    <span className="font-bold">{brand}</span>
                    <span
                      className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                        isSelected
                          ? 'bg-amber-400 text-slate-950'
                          : 'bg-white border border-slate-200 text-slate-700'
                      }`}
                    >
                      {count} prod.
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tabla de Inspección de Simulación */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 bg-slate-50/70 px-4 pt-3 md:py-0 gap-3">
              <div className="flex flex-wrap gap-1 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className={`px-3.5 py-3 font-semibold border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'preview'
                      ? 'border-[#0B1528] text-[#0B1528] bg-white'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Productos Normalizados ({preview.sampleItems.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('operaciones')}
                  className={`px-3.5 py-3 font-semibold border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'operaciones'
                      ? 'border-[#0B1528] text-[#0B1528] bg-white'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Operaciones SQL Propuestas ({preview.proposedOperations.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('conflicts')}
                  className={`px-3.5 py-3 font-semibold border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'conflicts'
                      ? 'border-[#0B1528] text-[#0B1528] bg-white'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Discrepancias ({preview.conflicts.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('skipped')}
                  className={`px-3.5 py-3 font-semibold border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'skipped'
                      ? 'border-[#0B1528] text-[#0B1528] bg-white'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  URLs Omitidas ({preview.invalidOrSkippedRecords.length})
                </button>
              </div>

              {activeTab === 'preview' && (
                <div className="relative pb-3 md:pb-0 w-full md:w-64">
                  <Icon
                    name="search"
                    className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar producto, SKU o categoría..."
                    className="w-full rounded-lg border border-slate-300 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-slate-900 focus:outline-none"
                  />
                </div>
              )}
            </div>

            <div className="p-0">
              {activeTab === 'preview' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      <tr>
                        <th className="px-4 py-3">Imagen</th>
                        <th className="px-4 py-3">Entidad</th>
                        <th className="px-4 py-3">Marca</th>
                        <th className="px-4 py-3">Nombre Comercial</th>
                        <th className="px-4 py-3">SKU</th>
                        <th className="px-4 py-3">Categoría</th>
                        <th className="px-4 py-3 text-right">Precio (PEN)</th>
                        <th className="px-4 py-3">Especificaciones Detectadas</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-700">
                      {filteredPreviewItems.map((item: NormalizedItem) => (
                        <tr key={item.id} className="hover:bg-slate-50/80">
                          <td className="px-4 py-2">
                            {item.imageUrl ? (
                              <div className="h-9 w-12 rounded-md border border-slate-200 bg-white overflow-hidden flex items-center justify-center p-0.5">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={item.imageUrl}
                                  alt={item.name}
                                  className="h-full w-full object-contain"
                                  loading="lazy"
                                />
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-400">N/D</span>
                            )}
                          </td>
                          <td className="px-4 py-2.5">
                            <span
                              className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold uppercase border ${
                                item.entityType === 'VEHICULO'
                                  ? 'bg-blue-50 text-blue-800 border-blue-200'
                                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              }`}
                            >
                              {item.entityType}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 font-bold text-slate-900">{item.brand}</td>
                          <td className="px-4 py-2.5 font-medium text-slate-900">{item.name}</td>
                          <td className="px-4 py-2.5 font-mono text-[11px] text-slate-600">
                            {item.sku || 'S/N'}
                          </td>
                          <td className="px-4 py-2.5 text-slate-600">{item.category}</td>
                          <td className="px-4 py-2.5 text-right font-mono font-semibold text-slate-900">
                            {item.pricePen !== null ? `S/ ${item.pricePen.toFixed(2)}` : 'Por cotizar'}
                          </td>
                          <td className="px-4 py-2.5 font-mono text-[11px] text-slate-600">
                            {[
                              item.specs.voltageV ? `${item.specs.voltageV}V` : null,
                              item.specs.batteryCapacityAh ? `${item.specs.batteryCapacityAh}Ah` : null,
                              item.specs.motorPowerW ? `${item.specs.motorPowerW}W` : null,
                              item.specs.maxSpeedKmh ? `${item.specs.maxSpeedKmh}km/h` : null,
                            ]
                              .filter(Boolean)
                              .join(' · ') || 'Estándar'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'operaciones' && (
                <div className="p-4 space-y-2 max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {preview.proposedOperations.map((op, i) => (
                    <div key={i} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <span className="rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 px-2 py-0.5 text-[10px] font-bold uppercase">
                          {op.action}
                        </span>
                        <span className="font-mono font-semibold text-slate-800">{op.entity}</span>
                        <span className="text-slate-600">{op.summary}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'conflicts' && (
                <div className="p-6">
                  {preview.conflicts.length === 0 ? (
                    <div className="flex items-center gap-2 text-xs text-emerald-700 font-medium">
                      <Icon name="check-circle" className="w-4 h-4 text-emerald-600" />
                      <span>No se detectaron discrepancias de precios ni atributos entre archivos CSV y JSON.</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {preview.conflicts.map((c, i) => (
                        <div
                          key={i}
                          className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900"
                        >
                          <span className="font-bold">[{c.type}]</span> {c.resolution}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'skipped' && (
                <div className="p-4 space-y-1.5 max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {preview.invalidOrSkippedRecords.slice(0, 40).map((s, i) => (
                    <div
                      key={i}
                      className="pt-1.5 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs"
                    >
                      <span className="font-mono text-slate-700 truncate max-w-xl">
                        {s.url || 'Registro sin URL'}
                      </span>
                      <span className="text-slate-500 text-[11px]">{s.reason}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Paso 3: Confirmación y Ejecución en PostgreSQL */}
          <div className="rounded-xl border border-slate-300 bg-white p-5 shadow-xs">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#0B1528] text-amber-400 text-xs font-bold mt-0.5">
                2
              </span>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-slate-900">
                  Persistencia Idempotente en PostgreSQL / Supabase
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Los registros existentes con el mismo código SKU o par Marca/Modelo se omitirán automáticamente para evitar duplicidad.
                </p>

                <div className="mt-4 pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <label className="flex items-center gap-2.5 text-xs font-medium text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={confirmedExecution}
                      onChange={(e) => setConfirmedExecution(e.target.checked)}
                      className="rounded border-slate-300 text-[#0B1528] focus:ring-slate-900 w-4 h-4"
                    />
                    <span>
                      Confirmo que revisé la simulación y autorizo la sincronización con PostgreSQL
                    </span>
                  </label>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      type="button"
                      onClick={handleDownloadReport}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                    >
                      <Icon name="download" className="w-3.5 h-3.5 text-slate-500" />
                      <span>Descargar reporte JSON</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleExecuteImport}
                      disabled={!confirmedExecution || isExecuting}
                      className="inline-flex items-center gap-2 rounded-lg bg-amber-400 hover:bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed px-4 py-2 text-xs font-bold text-slate-950 shadow-2xs transition-colors cursor-pointer"
                    >
                      <Icon name="database" className="w-3.5 h-3.5" />
                      <span>
                        {isExecuting ? 'Sincronizando en PostgreSQL...' : 'Ejecutar Importación en Base de Datos'}
                      </span>
                    </button>
                  </div>
                </div>

                {executionResult && (
                  <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
                    <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                      <Icon name="check-circle" className="w-4 h-4 text-emerald-600" />
                      <span>Resumen de ejecución en PostgreSQL:</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mt-2.5 text-xs">
                      <div className="rounded-lg bg-white border border-emerald-200 p-2.5">
                        <span className="text-slate-500 text-[10px] font-semibold uppercase block">
                          Nuevos Insertados
                        </span>
                        <span className="text-emerald-700 font-bold text-base font-mono">
                          {executionResult.insertedCount}
                        </span>
                      </div>
                      <div className="rounded-lg bg-white border border-slate-200 p-2.5">
                        <span className="text-slate-500 text-[10px] font-semibold uppercase block">
                          Omitidos (Preexistentes)
                        </span>
                        <span className="text-slate-800 font-bold text-base font-mono">
                          {executionResult.skippedCount}
                        </span>
                      </div>
                      <div className="rounded-lg bg-white border border-slate-200 p-2.5">
                        <span className="text-slate-500 text-[10px] font-semibold uppercase block">
                          Errores
                        </span>
                        <span className="text-red-600 font-bold text-base font-mono">
                          {executionResult.errorCount}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Historial Auditado de Importaciones */}
      <section className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Historial Auditado de Importaciones
            </h3>
            <p className="text-xs text-slate-500">
              Registros almacenados en <code className="font-mono text-slate-700">public.catalogo_importaciones</code>
            </p>
          </div>
          <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-mono font-semibold text-slate-700">
            {history.length} ejecuciones
          </span>
        </div>

        {history.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            Aún no se han registrado ejecuciones de importación en la tabla de auditoría{' '}
            <code className="font-mono text-slate-700">public.catalogo_importaciones</code>.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Modo</th>
                  <th className="px-4 py-3">Archivos</th>
                  <th className="px-4 py-3">Válidos (Motos / Repuestos)</th>
                  <th className="px-4 py-3">Omitidos</th>
                  <th className="px-4 py-3">Operador</th>
                  <th className="px-4 py-3">Fecha y Hora</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700">
                {history.map((h) => (
                  <tr key={h.id_importacion} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">
                      #{h.id_importacion}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-800 uppercase">
                        {h.modo}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono">{h.total_archivos}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {h.productos_validos} ({h.motos_procesadas} motos / {h.repuestos_procesados} rep.)
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-600">{h.registros_omitidos}</td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-600">
                      {h.admin_email || 'admin'}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {new Date(h.created_at).toLocaleString('es-PE')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
