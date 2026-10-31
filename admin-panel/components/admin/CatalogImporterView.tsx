'use client';

import React, { useState } from 'react';
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
}

export function CatalogImporterView({ initialHistory = [] }: CatalogImporterViewProps) {
  const [selectedFiles, setSelectedFiles] = useState<FileSelection[]>([]);
  const [history, setHistory] = useState<ImportHistoryRecord[]>(initialHistory);
  const [isScanning, setIsScanning] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [preview, setPreview] = useState<ImportPreviewResult | null>(null);
  const [executionResult, setExecutionResult] = useState<ImportExecutionResult | null>(null);
  const [confirmedExecution, setConfirmedExecution] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'conflicts' | 'skipped' | 'operaciones'>('preview');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

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
              ? `Se detectaron ${mapped.length} archivos en la carpeta oficial «JSON DEL SCRAPS».`
              : 'Carpeta local vacía o entorno remoto (Vercel). Usa «Subir Archivos» desde tu navegador.',
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
        // Refrescar historial
        const histRes = await fetch('/api/admin/catalog/import');
        if (histRes.ok) {
          const histData = await histRes.json();
          if (histData.history) setHistory(histData.history);
        }
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

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
                <Icon name="zap" className="w-4 h-4" />
              </span>
              <h2 className="text-xl font-bold text-white">Importador Central de Catálogos (CSV / JSON)</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Normalización, deduplicación e importación idempotente de TAILG, GreenLine, YADEA y Kayencorp a PostgreSQL. Compatible con carga directa desde navegador en Vercel.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleScanLocalFolder}
              disabled={isScanning}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3.5 py-2 text-xs font-semibold text-white transition-colors disabled:opacity-50"
            >
              <Icon name="search" className="w-3.5 h-3.5 text-blue-400" />
              {isScanning ? 'Escaneando...' : 'Escanear Carpeta Local'}
            </button>

            <label className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-3.5 py-2 text-xs font-semibold text-white transition-colors cursor-pointer shadow-md">
              <Icon name="plus" className="w-3.5 h-3.5" />
              <span>Subir Archivos (CSV / JSON)</span>
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

        {feedback && (
          <div
            className={`mt-4 rounded-xl border p-3 text-xs flex items-center justify-between ${
              feedback.type === 'success'
                ? 'border-emerald-500/30 bg-emerald-950/30 text-emerald-300'
                : feedback.type === 'error'
                ? 'border-rose-500/30 bg-rose-950/30 text-rose-300'
                : 'border-blue-500/30 bg-blue-950/30 text-blue-300'
            }`}
          >
            <span>{feedback.message}</span>
            <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white ml-2">
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Lista de Archivos Seleccionados */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <span>Archivos para Procesar</span>
            <span className="rounded bg-slate-800 px-2 py-0.5 text-xs text-slate-300 font-mono">
              {selectedFiles.length}
            </span>
          </h3>

          {selectedFiles.length > 0 && (
            <button
              onClick={handleGeneratePreview}
              disabled={isPreviewing}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white transition-colors disabled:opacity-50"
            >
              <Icon name="check" className="w-3.5 h-3.5" />
              {isPreviewing ? 'Analizando...' : 'Simular Importación (Dry-Run)'}
            </button>
          )}
        </div>

        {selectedFiles.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-800 p-8 text-center text-slate-500 text-xs">
            Sube tus archivos CSV o JSON directamente desde tu navegador con el botón «Subir Archivos» o escanea la carpeta local en entorno de desarrollo.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-[11px] uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-3 py-2 rounded-l-lg">Archivo</th>
                  <th className="px-3 py-2">Formato</th>
                  <th className="px-3 py-2">Tamaño</th>
                  <th className="px-3 py-2">Marca Asignada</th>
                  <th className="px-3 py-2 text-right rounded-r-lg">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {selectedFiles.map((file, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30">
                    <td className="px-3 py-2 font-mono text-[11px] text-slate-200">{file.filename}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                          file.format === 'csv'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                        }`}
                      >
                        {file.format}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-slate-400">{(file.sizeBytes / 1024).toFixed(1)} KB</td>
                    <td className="px-3 py-2">
                      <select
                        value={file.brandOverride || ''}
                        onChange={(e) => {
                          const val = (e.target.value as EcoMotoBrand) || undefined;
                          setSelectedFiles((prev) =>
                            prev.map((f, i) => (i === idx ? { ...f, brandOverride: val } : f))
                          );
                        }}
                        className="rounded bg-slate-800 border border-slate-700 px-2 py-1 text-xs text-white"
                      >
                        <option value="">Auto-detectar</option>
                        <option value="TAILG">TAILG</option>
                        <option value="KAYENCORP">Kayencorp</option>
                        <option value="YADEA">YADEA</option>
                        <option value="GREENLINE">GreenLine</option>
                      </select>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button
                        onClick={() => setSelectedFiles((prev) => prev.filter((_, i) => i !== idx))}
                        className="text-rose-400 hover:text-rose-300 text-xs"
                      >
                        Quitar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Resultados de la Simulación (Dry-Run) */}
      {preview && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3.5">
              <span className="text-[11px] text-slate-400 uppercase font-medium">Registros Leídos</span>
              <span className="text-xl font-bold text-white block mt-0.5">{preview.totalRawRecords}</span>
              <span className="text-[10px] text-slate-500">{preview.totalFiles} archivos</span>
            </div>

            <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3.5">
              <span className="text-[11px] text-emerald-400 uppercase font-medium">Productos Válidos</span>
              <span className="text-xl font-bold text-emerald-300 block mt-0.5">{preview.validProducts}</span>
              <span className="text-[10px] text-emerald-500/80">Normalizados</span>
            </div>

            <div className="rounded-xl border border-blue-500/30 bg-blue-950/20 p-3.5">
              <span className="text-[11px] text-blue-400 uppercase font-medium">Motos / Vehículos</span>
              <span className="text-xl font-bold text-blue-300 block mt-0.5">{preview.vehiclesCount}</span>
              <span className="text-[10px] text-blue-500/80">Fichas con specs</span>
            </div>

            <div className="rounded-xl border border-purple-500/30 bg-purple-950/20 p-3.5">
              <span className="text-[11px] text-purple-400 uppercase font-medium">Repuestos / Partes</span>
              <span className="text-xl font-bold text-purple-300 block mt-0.5">{preview.partsCount}</span>
              <span className="text-[10px] text-purple-500/80">Baterías, llantas, etc.</span>
            </div>

            <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-3.5">
              <span className="text-[11px] text-amber-400 uppercase font-medium">Duplicados Fusionados</span>
              <span className="text-xl font-bold text-amber-300 block mt-0.5">{preview.duplicatesIdentified}</span>
              <span className="text-[10px] text-amber-500/80">Cruce CSV + JSON</span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3.5">
              <span className="text-[11px] text-slate-400 uppercase font-medium">Páginas Omitidas</span>
              <span className="text-xl font-bold text-slate-300 block mt-0.5">{preview.invalidOrSkippedRecords.length}</span>
              <span className="text-[10px] text-slate-500">Blogs, carritos, etc.</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Distribución por Marca Reconocida
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(preview.productsByBrand).map(([brand, count]) => (
                <div key={brand} className="flex items-center justify-between rounded-lg bg-slate-800/60 border border-slate-700/60 px-3 py-2 text-xs">
                  <span className="font-semibold text-white">{brand}</span>
                  <span className="font-mono text-cyan-400 font-bold">{count} prod.</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden">
            <div className="flex border-b border-slate-800 bg-slate-950/40 text-xs">
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-4 py-2.5 font-semibold transition-colors ${
                  activeTab === 'preview' ? 'border-b-2 border-blue-500 text-blue-400 bg-blue-500/10' : 'text-slate-400 hover:text-white'
                }`}
              >
                Muestra de Productos ({preview.sampleItems.length})
              </button>
              <button
                onClick={() => setActiveTab('operaciones')}
                className={`px-4 py-2.5 font-semibold transition-colors ${
                  activeTab === 'operaciones' ? 'border-b-2 border-blue-500 text-blue-400 bg-blue-500/10' : 'text-slate-400 hover:text-white'
                }`}
              >
                Operaciones Propuestas ({preview.proposedOperations.length})
              </button>
              <button
                onClick={() => setActiveTab('conflicts')}
                className={`px-4 py-2.5 font-semibold transition-colors ${
                  activeTab === 'conflicts' ? 'border-b-2 border-blue-500 text-blue-400 bg-blue-500/10' : 'text-slate-400 hover:text-white'
                }`}
              >
                Discrepancias ({preview.conflicts.length})
              </button>
              <button
                onClick={() => setActiveTab('skipped')}
                className={`px-4 py-2.5 font-semibold transition-colors ${
                  activeTab === 'skipped' ? 'border-b-2 border-blue-500 text-blue-400 bg-blue-500/10' : 'text-slate-400 hover:text-white'
                }`}
              >
                Omitidos ({preview.invalidOrSkippedRecords.length})
              </button>
            </div>

            <div className="p-4">
              {activeTab === 'preview' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-800 text-[10px] uppercase tracking-wider text-slate-400">
                      <tr>
                        <th className="px-3 py-2 rounded-l">Tipo</th>
                        <th className="px-3 py-2">Marca</th>
                        <th className="px-3 py-2">Nombre Comercial</th>
                        <th className="px-3 py-2">SKU</th>
                        <th className="px-3 py-2">Categoría</th>
                        <th className="px-3 py-2">Precio</th>
                        <th className="px-3 py-2 rounded-r">Especificaciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {preview.sampleItems.map((item: NormalizedItem) => (
                        <tr key={item.id} className="hover:bg-slate-800/30">
                          <td className="px-3 py-2">
                            <span
                              className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                                item.entityType === 'VEHICULO'
                                  ? 'bg-blue-500/20 text-blue-400'
                                  : 'bg-emerald-500/20 text-emerald-400'
                              }`}
                            >
                              {item.entityType}
                            </span>
                          </td>
                          <td className="px-3 py-2 font-bold text-white">{item.brand}</td>
                          <td className="px-3 py-2 text-slate-200">{item.name}</td>
                          <td className="px-3 py-2 font-mono text-[11px] text-slate-400">{item.sku || 'S/N'}</td>
                          <td className="px-3 py-2 text-slate-400">{item.category}</td>
                          <td className="px-3 py-2 font-semibold text-emerald-400">
                            {item.pricePen !== null ? `PEN ${item.pricePen.toFixed(2)}` : 'N/D'}
                          </td>
                          <td className="px-3 py-2 text-[11px] text-slate-400">
                            {[
                              item.specs.voltageV ? `${item.specs.voltageV}V` : null,
                              item.specs.batteryCapacityAh ? `${item.specs.batteryCapacityAh}Ah` : null,
                              item.specs.motorPowerW ? `${item.specs.motorPowerW}W` : null,
                              item.specs.maxSpeedKmh ? `${item.specs.maxSpeedKmh}km/h` : null,
                            ]
                              .filter(Boolean)
                              .join(' | ') || 'Estándar'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'operaciones' && (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {preview.proposedOperations.map((op, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg bg-slate-800/50 border border-slate-700/50 p-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 text-[10px] font-bold uppercase">
                          {op.action}
                        </span>
                        <span className="font-mono text-cyan-400">{op.entity}</span>
                        <span className="text-slate-300">{op.summary}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'conflicts' && (
                <div>
                  {preview.conflicts.length === 0 ? (
                    <p className="text-xs text-slate-400">No se detectaron discrepancias entre archivos CSV y JSON.</p>
                  ) : (
                    <div className="space-y-2">
                      {preview.conflicts.map((c, i) => (
                        <div key={i} className="rounded-lg border border-amber-500/30 bg-amber-950/20 p-2.5 text-xs text-amber-200">
                          <span className="font-bold">[{c.type}]</span> {c.resolution}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'skipped' && (
                <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                  {preview.invalidOrSkippedRecords.slice(0, 30).map((s, i) => (
                    <div key={i} className="flex items-center justify-between rounded bg-slate-800/40 p-1.5 text-[11px] text-slate-400">
                      <span className="font-mono truncate max-w-md">{s.url || 'Sin URL'}</span>
                      <span className="text-slate-500 italic">{s.reason}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-blue-500/30 bg-slate-900/90 p-5 shadow-xl">
            <h4 className="text-sm font-bold text-white mb-2">Persistencia en PostgreSQL / Supabase</h4>
            <p className="text-xs text-slate-400 mb-4">
              La importación utiliza inserción idempotente. Si un producto ya existe con el mismo SKU o marca/nombre, no será duplicado.
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmedExecution}
                  onChange={(e) => setConfirmedExecution(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span>Confirmo que deseo aplicar los cambios en la base de datos PostgreSQL</span>
              </label>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadReport}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 px-3.5 py-2 text-xs font-semibold text-white transition-colors"
                >
                  <span>Descargar Informe JSON</span>
                </button>

                <button
                  onClick={handleExecuteImport}
                  disabled={!confirmedExecution || isExecuting}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed px-4 py-2 text-xs font-bold text-white transition-colors shadow-lg"
                >
                  {isExecuting ? 'Importando...' : 'Ejecutar Importación Idempotente'}
                </button>
              </div>
            </div>

            {executionResult && (
              <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                  <Icon name="check" className="w-4 h-4" />
                  <span>Resultado de la ejecución:</span>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
                  <div className="rounded bg-slate-900/60 p-2">
                    <span className="text-slate-400 text-[10px] uppercase block">Insertados</span>
                    <span className="text-emerald-400 font-bold text-sm">{executionResult.insertedCount}</span>
                  </div>
                  <div className="rounded bg-slate-900/60 p-2">
                    <span className="text-slate-400 text-[10px] uppercase block">Omitidos (Existentes)</span>
                    <span className="text-amber-400 font-bold text-sm">{executionResult.skippedCount}</span>
                  </div>
                  <div className="rounded bg-slate-900/60 p-2">
                    <span className="text-slate-400 text-[10px] uppercase block">Errores</span>
                    <span className="text-rose-400 font-bold text-sm">{executionResult.errorCount}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Historial de Importaciones (catalogo_importaciones) */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">
            Historial Auditado de Importaciones (<code className="text-cyan-400 font-mono text-xs">public.catalogo_importaciones</code>)
          </h3>
          <span className="text-xs text-slate-400">{history.length} registros</span>
        </div>

        {history.length === 0 ? (
          <p className="text-xs text-slate-500">
            No se han registrado ejecuciones de importación en el historial todavía.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800 text-[10px] uppercase text-slate-400">
                <tr>
                  <th className="p-2.5">ID</th>
                  <th className="p-2.5">Modo</th>
                  <th className="p-2.5">Archivos</th>
                  <th className="p-2.5">Válidos (Motos / Repuestos)</th>
                  <th className="p-2.5">Omitidos</th>
                  <th className="p-2.5">Operador</th>
                  <th className="p-2.5">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {history.map((h) => (
                  <tr key={h.id_importacion}>
                    <td className="p-2.5 font-mono text-cyan-400">#{h.id_importacion}</td>
                    <td className="p-2.5 font-bold text-emerald-400">{h.modo}</td>
                    <td className="p-2.5">{h.total_archivos}</td>
                    <td className="p-2.5">
                      {h.productos_validos} ({h.motos_procesadas} motos / {h.repuestos_procesados} rep.)
                    </td>
                    <td className="p-2.5">{h.registros_omitidos}</td>
                    <td className="p-2.5 font-mono text-[11px]">{h.admin_email || 'admin'}</td>
                    <td className="p-2.5 text-slate-400">
                      {new Date(h.created_at).toLocaleString('es-PE')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
