'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Scale,
  X,
  ExternalLink,
  CheckCircle,
  HelpCircle,
  Wrench
} from 'lucide-react';
import { MotoModel } from '@/types';
import { getPublicCatalogMotos } from '@/data/ecomoto-data';
import { formatCurrency } from '@/lib/utils';

interface MotoComparatorProps {
  initialSlugs?: string[];
  onInspectMoto?: (moto: MotoModel) => void;
}

export function MotoComparator({ initialSlugs = ['tailg-n6-super-s', 'yadea-m6-pro', 'greenline-m3'], onInspectMoto }: MotoComparatorProps) {
  const allMotos = getPublicCatalogMotos();
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>(initialSlugs);
  const [selectorBrand, setSelectorBrand] = useState<string>('todas');

  const selectedMotos = selectedSlugs
    .map((slug) => allMotos.find((m) => m.slug === slug))
    .filter((m): m is MotoModel => Boolean(m));

  const availableMotos = allMotos.filter(
    (m) => !selectedSlugs.includes(m.slug) && (selectorBrand === 'todas' || m.brand === selectorBrand)
  );

  const handleAddMoto = (slug: string) => {
    if (selectedSlugs.length >= 4) return;
    if (!selectedSlugs.includes(slug)) {
      setSelectedSlugs([...selectedSlugs, slug]);
    }
  };

  const handleRemoveMoto = (slug: string) => {
    setSelectedSlugs(selectedSlugs.filter((s) => s !== slug));
  };

  const renderValueOrFallback = (val: string | number | undefined | null, suffix: string = '') => {
    if (val === undefined || val === null || val === '' || val === 'NO_DECLARADO') {
      return (
        <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-medium">
          <HelpCircle className="w-3 h-3 shrink-0" />
          No especificado
        </span>
      );
    }
    return <span className="font-semibold text-gray-900">{val}{suffix}</span>;
  };

  const formatVehicleType = (type: string) => {
    switch (type) {
      case 'MOTO_ELECTRICA':
        return 'Moto Eléctrica';
      case 'VMP_BICIMOTO':
        return 'VMP / Bicimoto';
      case 'MOTO_SCOOTER':
        return 'Moto Scooter';
      case 'BICIMOTO':
        return 'Bicimoto';
      default:
        return type || 'No especificado';
    }
  };

  return (
    <div id="comparador" className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-2">
            <Scale className="w-3.5 h-3.5" />
            <span>Comparador Técnico de Motos Eléctricas</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Compara especificaciones técnicas oficiales
          </h3>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">
            Datos verificados de fichas públicas oficiales. Muestra hasta 4 modelos simultáneos con enlaces directos a sus fuentes.
          </p>
        </div>

        {/* Selector para añadir moto */}
        {selectedSlugs.length < 4 && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-gray-50 p-2 rounded-xl border border-gray-200">
            <select
              value={selectorBrand}
              onChange={(e) => setSelectorBrand(e.target.value)}
              className="bg-white border border-gray-300 text-xs text-gray-700 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="todas">Todas las marcas</option>
              <option value="TAILG">TAILG</option>
              <option value="YADEA">YADEA</option>
              <option value="KAYENCORP">KAYENCORP</option>
              <option value="GREENLINE">GreenLine</option>
            </select>

            <select
              defaultValue=""
              onChange={(e) => {
                if (e.target.value) {
                  handleAddMoto(e.target.value);
                  e.target.value = '';
                }
              }}
              className="bg-white border border-gray-300 text-xs text-gray-700 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="" disabled>
                + Añadir moto al comparador
              </option>
              {availableMotos.map((m) => (
                <option key={m.slug} value={m.slug}>
                  {m.brand} {m.model} ({m.batteryVoltageV ? `${m.batteryVoltageV}V` : 'V no decl.'})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Matriz comparativa */}
      {selectedMotos.length === 0 ? (
        <div className="py-16 text-center text-gray-400">
          <Scale className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-base font-medium text-gray-700">No has seleccionado ninguna moto para comparar.</p>
          <p className="text-xs text-gray-500 mt-1">Selecciona uno o más modelos arriba para ver la tabla técnica.</p>
        </div>
      ) : (
        <div className="overflow-x-auto mt-6">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-gray-500 bg-gray-50 w-44 rounded-l-xl">
                  Parámetro Técnico
                </th>
                {selectedMotos.map((m) => (
                  <th key={m.slug} className="py-4 px-4 text-gray-900 bg-white align-top relative min-w-[200px] border-l border-gray-100">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-widest text-blue-600">
                          {m.brand}
                        </span>
                        <h4 className="text-base font-extrabold text-gray-900 leading-tight mt-0.5">
                          {m.model}
                        </h4>
                      </div>
                      <button
                        onClick={() => handleRemoveMoto(m.slug)}
                        title="Quitar de la comparativa"
                        className="text-gray-400 hover:text-rose-600 p-1 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Fotografía de la moto en la cabecera del comparador */}
                    <div className="relative w-full h-32 my-2.5 rounded-lg bg-gray-50 border border-gray-100 overflow-hidden flex items-center justify-center p-2">
                      <Image
                        src={m.imageUrl || "/images/motos/placeholder-ev-moto.svg"}
                        alt={`${m.brand} ${m.model}`}
                        fill
                        sizes="180px"
                        className="object-contain p-1"
                      />
                    </div>

                    <div className="flex flex-wrap gap-1.5 items-center">
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-gray-100 text-gray-600">
                        {formatVehicleType(m.vehicleType)}
                      </span>
                      {m.dataStatus === 'VERIFICADO_EN_FICHA' ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                          <CheckCircle className="w-2.5 h-2.5 text-emerald-600" /> Verificada
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                          <HelpCircle className="w-2.5 h-2.5 text-amber-600" /> Parcial
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {/* Precio referencial */}
              <tr>
                <td className="py-3.5 px-4 font-semibold text-xs text-gray-500 bg-gray-50">
                  Precio Referencial Proveedor
                </td>
                {selectedMotos.map((m) => (
                  <td key={m.slug} className="py-3.5 px-4 border-l border-gray-100">
                    {m.pricePen ? (
                      <div>
                        <span className="text-lg font-extrabold text-gray-900">
                          {formatCurrency(m.pricePen)}
                        </span>
                        {m.regularPricePen && m.regularPricePen > m.pricePen && (
                          <span className="block text-xs text-gray-400 line-through">
                            Reg: {formatCurrency(m.regularPricePen)}
                          </span>
                        )}
                        <span className="block text-[10px] text-gray-400 mt-0.5">
                          Referencial al {m.sourceCheckedOn || '2026-10-30'}
                        </span>
                      </div>
                    ) : (
                      renderValueOrFallback(null)
                    )}
                  </td>
                ))}
              </tr>

              {/* Potencia motor nominal */}
              <tr>
                <td className="py-3.5 px-4 font-semibold text-xs text-gray-500 bg-gray-50">
                  Motor Nominal (W)
                </td>
                {selectedMotos.map((m) => (
                  <td key={m.slug} className="py-3.5 px-4 border-l border-gray-100">
                    {renderValueOrFallback(m.motorNominalW, ' W')}
                    {m.motorMaxW && (
                      <span className="text-xs text-gray-500 block">Pico: {m.motorMaxW} W</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Tensión del sistema */}
              <tr>
                <td className="py-3.5 px-4 font-semibold text-xs text-gray-500 bg-gray-50">
                  Tensión del Sistema
                </td>
                {selectedMotos.map((m) => (
                  <td key={m.slug} className="py-3.5 px-4 border-l border-gray-100">
                    {renderValueOrFallback(m.batteryVoltageV, ' V')}
                  </td>
                ))}
              </tr>

              {/* Batería y Química */}
              <tr>
                <td className="py-3.5 px-4 font-semibold text-xs text-gray-500 bg-gray-50">
                  Capacidad y Química
                </td>
                {selectedMotos.map((m) => (
                  <td key={m.slug} className="py-3.5 px-4 space-y-1 border-l border-gray-100">
                    <div>
                      <span className="text-xs text-gray-500">Capacidad: </span>
                      {renderValueOrFallback(m.batteryCapacityAh, ' Ah')}
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Química: </span>
                      {m.batteryChemistry ? (
                        <span className="text-xs font-medium text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                          {m.batteryChemistry.replace(/_/g, ' ')}
                        </span>
                      ) : (
                        renderValueOrFallback(null)
                      )}
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Extraíble: </span>
                      {m.batteryRemovable === 'SI' ? (
                        <span className="text-xs text-emerald-700 font-semibold">Sí (Extraíble)</span>
                      ) : m.batteryRemovable === 'NO' ? (
                        <span className="text-xs text-gray-500">No (Fija)</span>
                      ) : (
                        renderValueOrFallback(null)
                      )}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Velocidad máxima */}
              <tr>
                <td className="py-3.5 px-4 font-semibold text-xs text-gray-500 bg-gray-50">
                  Velocidad Máxima
                </td>
                {selectedMotos.map((m) => (
                  <td key={m.slug} className="py-3.5 px-4 border-l border-gray-100">
                    {renderValueOrFallback(m.maxSpeedKmh, ' km/h')}
                  </td>
                ))}
              </tr>

              {/* Autonomía declarada */}
              <tr>
                <td className="py-3.5 px-4 font-semibold text-xs text-gray-500 bg-gray-50">
                  Autonomía Publicada
                </td>
                {selectedMotos.map((m) => (
                  <td key={m.slug} className="py-3.5 px-4 border-l border-gray-100">
                    {m.rangeMinKm || m.rangeMaxKm ? (
                      <span className="font-semibold text-gray-900">
                        {m.rangeMinKm ? `${m.rangeMinKm} - ` : 'Hasta '}
                        {m.rangeMaxKm || m.rangeMinKm} km
                      </span>
                    ) : (
                      renderValueOrFallback(null)
                    )}
                  </td>
                ))}
              </tr>

              {/* Notas y advertencias técnicas */}
              <tr>
                <td className="py-3.5 px-4 font-semibold text-xs text-gray-500 bg-gray-50">
                  Notas de la Fuente
                </td>
                {selectedMotos.map((m) => (
                  <td key={m.slug} className="py-3.5 px-4 text-xs text-gray-500 border-l border-gray-100">
                    <p className="line-clamp-3 leading-relaxed" title={m.notes || ''}>
                      {m.notes || 'Sin observaciones adicionales registradas.'}
                    </p>
                  </td>
                ))}
              </tr>

              {/* Acciones y enlace a repuestos */}
              <tr className="bg-gray-50/70">
                <td className="py-4 px-4 font-semibold text-xs text-gray-500">
                  Ficha y Acciones
                </td>
                {selectedMotos.map((m) => (
                  <td key={m.slug} className="py-4 px-4 space-y-2 border-l border-gray-100">
                    {onInspectMoto && (
                      <button
                        type="button"
                        onClick={() => onInspectMoto(m)}
                        className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
                      >
                        <Wrench className="w-3.5 h-3.5" />
                        <span>Ver Repuestos Compatibles</span>
                      </button>
                    )}
                    {m.sourceUrl && (
                      <a
                        href={m.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 text-[11px] font-medium transition-colors"
                      >
                        <ExternalLink className="w-3 h-3 text-gray-500" />
                        <span>Ver Ficha en {m.brand}</span>
                      </a>
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
