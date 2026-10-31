'use client';

import React from 'react';
import {
  X,
  ExternalLink,
  CheckCircle2,
  Zap,
  Clock,
  Building2,
  Info
} from 'lucide-react';
import { SupplierPart } from '@/types';
import { getPartWithCompatibleMotos } from '@/data/ecomoto-data';
import { formatCurrency } from '@/lib/utils';

interface PartDetailModalProps {
  part: SupplierPart | null;
  onClose: () => void;
  onSelectMotoSlug?: (slug: string) => void;
}

export function PartDetailModal({ part, onClose, onSelectMotoSlug }: PartDetailModalProps) {
  if (!part) return null;

  const data = getPartWithCompatibleMotos(part.partKey);
  const compatibleMotos = data?.compatibleMotos || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white border border-gray-200 rounded-2xl shadow-xl p-6 sm:p-8 text-gray-900">

        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg bg-gray-100 text-gray-500 hover:text-gray-900 hover:bg-gray-200 transition-colors cursor-pointer"
          title="Cerrar ficha"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Cabecera */}
        <div className="border-b border-gray-200 pb-5 pr-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {part.imageUrl && (
              <div className="h-24 w-28 shrink-0 rounded-xl border border-gray-200 bg-gray-50 p-2 flex items-center justify-center overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={part.imageUrl}
                  alt={part.name}
                  className="h-full w-full object-contain"
                />
              </div>
            )}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                  {part.brand} Oficial
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                  Categoría: {part.category}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                  Clave: {part.partKey}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                {part.name}
              </h2>

              <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-gray-500">
                <div className="flex items-center gap-1.5 text-gray-700">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <span>Proveedor Oficial: <strong>{part.supplier}</strong></span>
                </div>
                <div className="flex items-center gap-1 text-gray-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Fecha de consulta: {part.sourceCheckedOn || '2026-10-30'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* SEPARACIÓN DE PRECIO PROVEEDOR Y POLÍTICA COMERCIAL          */}
        {/* ============================================================ */}
        <div className="my-5 p-4 rounded-xl bg-gray-50 border border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="text-[11px] uppercase tracking-wider font-semibold text-gray-500 block mb-0.5">
                Precio Referencial de Proveedor
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                  {part.pricePen ? formatCurrency(part.pricePen) : 'A Consultar'}
                </span>
                {part.regularPricePen && part.regularPricePen > (part.pricePen || 0) && (
                  <span className="text-xs text-gray-400 line-through">
                    Reg: {formatCurrency(part.regularPricePen)}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-500 mt-1 leading-snug">
                Precio capturado de la tienda oficial del proveedor. No incluye costos de envío ni montaje salvo que el vendedor lo indique.
              </p>
            </div>

            <div className="sm:border-l sm:border-gray-200 sm:pl-4">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-gray-500 block mb-0.5">
                Disponibilidad y Existencia
              </span>
              <div className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <span className={`inline-block w-2.5 h-2.5 rounded-full ${part.stockStatus === 'AGOTADO_EN_PAGINA' ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                <span>{part.stockStatus.replace(/_/g, ' ')}</span>
              </div>
              <div className="mt-2 text-[11px] text-amber-900 bg-amber-50 p-2.5 rounded-lg border border-amber-200 leading-snug">
                <Info className="w-3.5 h-3.5 inline mr-1 text-amber-600 shrink-0" />
                NeroElectric Motors enlaza y orienta respecto al catálogo oficial del proveedor. Se deriva la consulta o compra a su tienda autorizada.
              </div>
            </div>
          </div>
        </div>

        {/* Ficha técnica y Parámetros Eléctricos */}
        <div className="mb-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-3 flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-blue-600" />
            Especificaciones Técnicas
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
              <span className="text-gray-500 block mb-0.5">Tensión Eléctrica</span>
              <span className="font-bold text-gray-900 text-sm">
                {part.electricalVoltageV ? `${part.electricalVoltageV} V` : 'No especificado'}
              </span>
            </div>

            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
              <span className="text-gray-500 block mb-0.5">Capacidad Eléctrica</span>
              <span className="font-bold text-gray-900 text-sm">
                {part.electricalCapacityAh ? `${part.electricalCapacityAh} Ah` : 'No especificado'}
              </span>
            </div>

            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
              <span className="text-gray-500 block mb-0.5">Química de Batería</span>
              <span className="font-bold text-gray-900 text-sm">
                {part.chemistry ? part.chemistry.replace(/_/g, ' ') : 'No aplicable / No indicada'}
              </span>
            </div>

            {part.outputVoltageV && (
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                <span className="text-gray-500 block mb-0.5">Tensión de Salida</span>
                <span className="font-bold text-gray-900 text-sm">
                  {part.outputVoltageV} V
                </span>
              </div>
            )}

            {part.outputCurrentA && (
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                <span className="text-gray-500 block mb-0.5">Corriente de Salida</span>
                <span className="font-bold text-gray-900 text-sm">
                  {part.outputCurrentA} A
                </span>
              </div>
            )}

            {part.sku && (
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                <span className="text-gray-500 block mb-0.5">SKU Proveedor</span>
                <span className="font-mono text-gray-800 text-xs font-semibold">
                  {part.sku}
                </span>
              </div>
            )}
          </div>

          {part.connectorOrFit && (
            <div className="mt-3 p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-700">
              <strong className="text-blue-600">Conector / Ajuste físico:</strong> {part.connectorOrFit}
            </div>
          )}

          {part.notes && (
            <div className="mt-2 p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-600 leading-relaxed">
              <strong className="text-gray-900">Observaciones del proveedor:</strong> {part.notes}
            </div>
          )}
        </div>

        {/* Motos compatibles publicadas */}
        <div className="mb-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-2 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Motos Eléctricas Compatibles Declaradas ({compatibleMotos.length})
          </h3>

          {compatibleMotos.length === 0 ? (
            <p className="text-xs text-gray-500">No hay modelos expresamente declarados en la ficha.</p>
          ) : (
            <div className="flex flex-wrap gap-2 mt-2">
              {compatibleMotos.map((m, idx) => {
                const isConfirmed = m.compatibilityStatus === 'CONFIRMADA_EN_FUENTE';
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (onSelectMotoSlug && m.motoSlug) {
                        onSelectMotoSlug(m.motoSlug);
                      }
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border text-left transition-colors cursor-pointer ${
                      onSelectMotoSlug && m.motoSlug ? 'hover:border-blue-400' : 'cursor-default'
                    } ${
                      isConfirmed
                        ? 'bg-gray-50 border-gray-200 text-gray-800'
                        : 'bg-amber-50/60 border-amber-200 text-amber-900'
                    }`}
                  >
                    <span className="font-bold text-blue-600">{m.brand}</span>
                    <span>{m.model}</span>
                    {isConfirmed ? (
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-semibold border border-emerald-200">Confirmada</span>
                    ) : m.compatibilityStatus === 'CONDICIONAL_FUENTE' ? (
                      <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-semibold border border-amber-200">Condicional</span>
                    ) : (
                      <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded font-semibold border border-gray-200">Pendiente</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Botones de acción */}
        <div className="pt-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[11px] text-gray-400">
            Fuente oficial verificada al {part.sourceCheckedOn || '2026-10-30'}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold transition-colors flex-1 sm:flex-initial cursor-pointer"
            >
              Cerrar
            </button>

            {part.sourceUrl && (
              <a
                href={part.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all shadow-xs flex-1 sm:flex-initial cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Ir a Consulta / Compra en {part.supplier}</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
