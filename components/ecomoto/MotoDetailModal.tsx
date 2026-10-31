'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  X,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  Wrench,
  HelpCircle,
  Clock
} from 'lucide-react';
import { MotoModel, SupplierPart } from '@/types';
import { getMotoWithCompatibleParts } from '@/data/ecomoto-data';
import { formatCurrency } from '@/lib/utils';

interface MotoDetailModalProps {
  moto: MotoModel | null;
  onClose: () => void;
  onSelectPart?: (part: SupplierPart) => void;
}

export function MotoDetailModal({ moto, onClose, onSelectPart }: MotoDetailModalProps) {
  const [confirmedVariantPartKey, setConfirmedVariantPartKey] = useState<Record<string, boolean>>({});

  if (!moto) return null;

  const detail = getMotoWithCompatibleParts(moto.slug);
  const compatibleParts = detail?.compatibleParts || [];

  const handleToggleConfirmVariant = (partKey: string) => {
    setConfirmedVariantPartKey((prev) => ({
      ...prev,
      [partKey]: !prev[partKey],
    }));
  };

  const renderValueOrFallback = (val: string | number | undefined | null, suffix: string = '') => {
    if (val === undefined || val === null || val === '' || val === 'NO_DECLARADO') {
      return (
        <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
          <HelpCircle className="w-3 h-3" />
          No especificado
        </span>
      );
    }
    return <span className="font-bold text-gray-900">{val}{suffix}</span>;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white border border-gray-200 rounded-2xl shadow-xl p-6 sm:p-8 text-gray-900">

        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg bg-gray-100 text-gray-500 hover:text-gray-900 hover:bg-gray-200 transition-colors cursor-pointer"
          title="Cerrar ficha técnica"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Cabecera de la ficha con Fotografía Integrada */}
        <div className="border-b border-gray-200 pb-6 pr-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">

            {/* Contenedor de Fotografía */}
            <div className="relative w-full sm:w-56 h-48 bg-gray-50 border border-gray-200 rounded-xl overflow-hidden flex items-center justify-center p-2 shrink-0">
              <Image
                src={moto.imageUrl || "/images/motos/placeholder-ev-moto.svg"}
                alt={`Moto eléctrica ${moto.brand} ${moto.model}`}
                fill
                sizes="224px"
                className="object-contain p-2"
              />
              {moto.imageUrl ? (
                <span className="absolute bottom-2 left-2 rounded-md bg-white/95 backdrop-blur-xs px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200 shadow-2xs">
                  Fotografía Oficial Verificada
                </span>
              ) : (
                <span className="absolute bottom-2 left-2 rounded-md bg-white/95 backdrop-blur-xs px-2 py-0.5 text-[10px] font-medium text-gray-600 border border-gray-300 shadow-2xs">
                  Fotografía en Homologación
                </span>
              )}
            </div>

            {/* Datos Principales del Modelo */}
            <div className="flex-1 text-left w-full">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                  {moto.brand} Oficial
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                  {moto.vehicleType.replace(/_/g, ' ')}
                </span>
                {moto.dataStatus === 'VERIFICADO_EN_FICHA' ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Ficha Verificada
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5 text-amber-600" /> Ficha Parcial
                  </span>
                )}
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                {moto.brand} {moto.model}
              </h2>

              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-600">
                {moto.pricePen ? (
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs uppercase font-semibold text-gray-400">Precio Proveedor:</span>
                    <span className="text-2xl font-black text-gray-900">
                      {formatCurrency(moto.pricePen)}
                    </span>
                    {moto.regularPricePen && (
                      <span className="text-xs line-through text-gray-400">
                        {formatCurrency(moto.regularPricePen)}
                      </span>
                    )}
                  </div>
                ) : (
                  <div>
                    <span className="text-xs text-gray-400 mr-2">Precio Proveedor:</span>
                    {renderValueOrFallback(null)}
                  </div>
                )}

                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  <span>Consulta: {moto.sourceCheckedOn || '2026-10-30'}</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Rejilla de Especificaciones Técnicas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-6 border-b border-gray-200">
          <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200">
            <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block mb-1">
              Motor Nominal
            </span>
            <div className="text-base sm:text-lg">
              {renderValueOrFallback(moto.motorNominalW, ' W')}
            </div>
            {moto.motorMaxW && (
              <span className="text-[10px] text-gray-500">Pico: {moto.motorMaxW} W</span>
            )}
          </div>

          <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200">
            <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block mb-1">
              Tensión Batería
            </span>
            <div className="text-base sm:text-lg">
              {renderValueOrFallback(moto.batteryVoltageV, ' V')}
            </div>
            <span className="text-[10px] text-gray-500 block truncate" title={moto.batteryChemistry || 'No especificada'}>
              {moto.batteryChemistry || 'Química no especificada'}
            </span>
          </div>

          <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200">
            <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block mb-1">
              Capacidad
            </span>
            <div className="text-base sm:text-lg">
              {renderValueOrFallback(moto.batteryCapacityAh, ' Ah')}
            </div>
            <span className="text-[10px] text-gray-500">
              {moto.batteryRemovable === 'SI' ? 'Batería Extraíble' : moto.batteryRemovable === 'NO' ? 'Batería Fija' : 'Extracción no declarada'}
            </span>
          </div>

          <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200">
            <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block mb-1">
              Velocidad Máx.
            </span>
            <div className="text-base sm:text-lg">
              {renderValueOrFallback(moto.maxSpeedKmh, ' km/h')}
            </div>
            <span className="text-[10px] text-gray-500">
              {moto.rangeMaxKm ? `Hasta ${moto.rangeMaxKm} km` : 'Autonomía no especificada'}
            </span>
          </div>
        </div>

        {/* Notas técnicas del fabricante */}
        {moto.notes && (
          <div className="py-3.5 px-4 text-xs text-gray-600 border border-gray-200 bg-gray-50 rounded-xl my-5 leading-relaxed">
            <strong className="text-gray-900">Nota técnica del fabricante:</strong> {moto.notes}
          </div>
        )}

        {/* ============================================================ */}
        {/* SECCIÓN OBLIGATORIA: REPUESTOS COMPATIBLES                   */}
        {/* ============================================================ */}
        <div className="pt-2">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
                <Wrench className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
                  Repuestos compatibles ({compatibleParts.length})
                </h3>
                <p className="text-xs text-gray-500">
                  Únicamente componentes con compatibilidad verificada o condición declarada por el proveedor.
                </p>
              </div>
            </div>

            <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-md border border-gray-200">
              Matriz N:M sin inferencias arbitrarias
            </span>
          </div>

          {compatibleParts.length === 0 ? (
            <div className="p-8 text-center bg-gray-50 rounded-xl border border-gray-200 text-gray-500">
              <Wrench className="w-8 h-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm font-semibold text-gray-700">Aún no hay repuestos con compatibilidad publicada para este modelo.</p>
              <p className="text-xs text-gray-500 mt-1 max-w-lg mx-auto">
                NeroElectric Motors no asigna compatibilidades basándose únicamente en el voltaje. Solo publicamos repuestos explícitamente confirmados por el fabricante.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {compatibleParts.map(({ part, compatibilityStatus, evidenceNote, sourceUrl }) => {
                const isConfirmed = compatibilityStatus === 'CONFIRMADA_EN_FUENTE';
                const isConditional = compatibilityStatus === 'CONDICIONAL_FUENTE';
                const isVariantConfirmed = confirmedVariantPartKey[part.partKey] || false;

                return (
                  <div
                    key={part.partKey}
                    className={`p-4 rounded-xl border transition-all ${
                      isConfirmed
                        ? 'bg-white border-gray-200 hover:border-emerald-300 shadow-2xs'
                        : 'bg-amber-50/40 border-amber-200 hover:border-amber-300'
                    }`}
                  >
                    {/* Badge de compatibilidad oficial */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      {isConfirmed ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Confirmada en Fuente
                        </span>
                      ) : isConditional ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-300">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          Compatibilidad Condicional
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-600 bg-gray-100 px-2.5 py-0.5 rounded-full border border-gray-200">
                          <Clock className="w-3.5 h-3.5" />
                          Pendiente de Confirmación
                        </span>
                      )}

                      <span className="text-[10px] uppercase font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                        {part.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mb-1">
                      {part.imageUrl && (
                        <div className="h-12 w-14 shrink-0 rounded-lg border border-gray-200 bg-gray-50 p-1 flex items-center justify-center overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={part.imageUrl}
                            alt={part.name}
                            className="h-full w-full object-contain"
                            loading="lazy"
                          />
                        </div>
                      )}
                      <h4 className="text-sm sm:text-base font-bold text-gray-900">
                        {part.name}
                      </h4>
                    </div>

                    {/* Precios y stock */}
                    <div className="flex items-baseline justify-between text-xs mt-2 pt-2 border-t border-gray-100">
                      <div>
                        <span className="text-[10px] uppercase text-gray-400 block font-semibold">Precio Proveedor:</span>
                        <span className="text-base font-extrabold text-gray-900">
                          {part.pricePen ? formatCurrency(part.pricePen) : 'Consultar'}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase text-gray-400 block font-semibold">Disponibilidad:</span>
                        <span className={`font-semibold ${part.stockStatus === 'AGOTADO_EN_PAGINA' ? 'text-rose-600' : 'text-gray-700'}`}>
                          {part.stockStatus.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>

                    {/* Parámetros eléctricos */}
                    {(part.electricalVoltageV || part.outputVoltageV || part.outputCurrentA) && (
                      <div className="mt-2.5 text-xs text-gray-600 bg-gray-50 p-2.5 rounded-lg space-y-0.5 border border-gray-100">
                        {part.electricalVoltageV && <div>⚡ Tensión: <span className="text-gray-900 font-semibold">{part.electricalVoltageV}V</span></div>}
                        {part.outputVoltageV && <div>🔌 Salida: <span className="text-gray-900 font-semibold">{part.outputVoltageV}V {part.outputCurrentA ? `@ ${part.outputCurrentA}A` : ''}</span></div>}
                        {part.connectorOrFit && <div className="text-[11px] text-gray-500">🔧 Conector: {part.connectorOrFit}</div>}
                      </div>
                    )}

                    {/* Nota de evidencia técnica del proveedor */}
                    {evidenceNote && (
                      <div className="mt-2.5 p-2.5 rounded-lg bg-gray-50 border border-gray-200 text-[11px] text-gray-600 leading-relaxed">
                        <span className="font-semibold text-emerald-700 block mb-0.5">Evidencia en fuente:</span>
                        {evidenceNote}
                      </div>
                    )}

                    {/* Alerta condicional y confirmación de conector/variante */}
                    {isConditional && (
                      <div className="mt-2.5 p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <strong className="block font-bold text-amber-900 mb-1">
                              Aviso Técnico de Variante / Conector
                            </strong>
                            <p className="text-[11px] text-amber-800 leading-relaxed">
                              El proveedor indica que este repuesto requiere verificar el tipo de puerto, conector físico o capacidad de pack antes de instalar.
                            </p>

                            <label className="flex items-center gap-2 mt-2 cursor-pointer font-medium text-amber-900 text-[11px]">
                              <input
                                type="checkbox"
                                checked={isVariantConfirmed}
                                onChange={() => handleToggleConfirmVariant(part.partKey)}
                                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-amber-400"
                              />
                              <span>He confirmado mi tipo de conector/variante de pack</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Acciones del repuesto */}
                    <div className="mt-3.5 pt-2.5 border-t border-gray-100 flex items-center justify-between gap-2">
                      {sourceUrl ? (
                        <a
                          href={sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Fuente ({part.supplier})</span>
                        </a>
                      ) : (
                        <span className="text-[11px] text-gray-500">Proveedor: {part.supplier}</span>
                      )}

                      {onSelectPart && (
                        <button
                          type="button"
                          onClick={() => onSelectPart(part)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
                            isConditional && !isVariantConfirmed
                              ? 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                              : 'bg-blue-600 hover:bg-blue-700 text-white'
                          }`}
                        >
                          {isConditional && !isVariantConfirmed ? 'Ver Ficha' : 'Ver / Consultar'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pie del modal */}
        <div className="mt-8 pt-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <div>
            <span>Políticas EcoMoto: Los precios mostrados corresponden a capturas públicas del fabricante; no constituyen inventario propio de entrega garantizada.</span>
          </div>
          {moto.sourceUrl && (
            <a
              href={moto.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold shrink-0 transition-colors border border-gray-200"
            >
              <ExternalLink className="w-3.5 h-3.5 text-gray-600" />
              <span>Ver Ficha Oficial de {moto.model}</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
