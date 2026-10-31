'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import {
  Zap,
  Scale,
  Wrench,
  Filter,
  ExternalLink,
  Eye,
  Building2
} from 'lucide-react';
import { MotoModel, SupplierPart } from '@/types';
import {
  getPublicCatalogMotos,
  OFFICIAL_BRANDS,
  OFFICIAL_PARTS,
  getMotoWithCompatibleParts
} from '@/data/ecomoto-data';
import { formatCurrency } from '@/lib/utils';
import { MotoComparator } from './MotoComparator';
import { MotoDetailModal } from './MotoDetailModal';
import { PartDetailModal } from './PartDetailModal';
import { CompatibilityFinder } from '../home/CompatibilityFinder';

export function EcoMotoCatalogSection() {
  const [activeTab, setActiveTab] = useState<'motos' | 'repuestos' | 'comparador'>('motos');
  const [selectedBrand, setSelectedBrand] = useState<string>('todas');
  const [selectedVehicleType, setSelectedVehicleType] = useState<string>('todos');
  const [selectedPartCategory, setSelectedPartCategory] = useState<string>('todas');
  const [selectedVoltage, setSelectedVoltage] = useState<string>('todas');

  // Modales
  const [inspectedMoto, setInspectedMoto] = useState<MotoModel | null>(null);
  const [inspectedPart, setInspectedPart] = useState<SupplierPart | null>(null);

  // Motos del catálogo oficial
  const allCatalogMotos = useMemo(() => getPublicCatalogMotos(), []);

  const handleCompatibilityFilterChange = (filters: { brand: string; voltage: string; category: string }) => {
    setSelectedBrand(filters.brand);
    setSelectedVoltage(filters.voltage);
    if (filters.category !== 'todas') {
      setSelectedPartCategory(filters.category);
      setActiveTab('repuestos');
    } else {
      setSelectedPartCategory('todas');
    }
  };

  // Filtrado de motos
  const filteredMotos = useMemo(() => {
    return allCatalogMotos.filter((m) => {
      const matchBrand = selectedBrand === 'todas' || m.brand === selectedBrand;
      const matchType = selectedVehicleType === 'todos' || m.vehicleType === selectedVehicleType;
      const matchVoltage =
        selectedVoltage === 'todas' ||
        (m.batteryVoltageV && `${m.batteryVoltageV}V` === selectedVoltage);
      return matchBrand && matchType && matchVoltage;
    });
  }, [allCatalogMotos, selectedBrand, selectedVehicleType, selectedVoltage]);

  // Filtrado de repuestos
  const filteredParts = useMemo(() => {
    return OFFICIAL_PARTS.filter((p) => {
      const matchBrand = selectedBrand === 'todas' || p.brand === selectedBrand;
      const matchCat = selectedPartCategory === 'todas' || p.category === selectedPartCategory;
      const matchVoltage =
        selectedVoltage === 'todas' ||
        (p.electricalVoltageV && `${p.electricalVoltageV}V` === selectedVoltage) ||
        (p.outputVoltageV && selectedVoltage === '72V' && p.outputVoltageV >= 70 && p.outputVoltageV <= 84) ||
        (p.outputVoltageV && selectedVoltage === '60V' && p.outputVoltageV >= 58 && p.outputVoltageV <= 72) ||
        (p.outputVoltageV && selectedVoltage === '48V' && p.outputVoltageV >= 48 && p.outputVoltageV <= 56);
      return matchBrand && matchCat && matchVoltage;
    });
  }, [selectedBrand, selectedPartCategory, selectedVoltage]);

  return (
    <div className="flex flex-col">
      {/* Buscador interactivo conectado directamente al catálogo */}
      <CompatibilityFinder onFilterChange={handleCompatibilityFilterChange} />

      <section id="catalogo-ecomoto" className="py-16 bg-white text-gray-900 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Cabecera de la sección */}
          <div className="text-center max-w-3xl mx-auto mb-8 pt-4">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-semibold mb-2 shadow-2xs">
              <span>🚲</span>
              <span>Modelos Disponibles</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Motos Eléctricas y Repuestos Compatibles
            </h2>
            <p className="text-gray-600 text-xs sm:text-sm mt-1.5 max-w-2xl mx-auto">
              Explora nuestros modelos y encuentra los repuestos compatibles con verificación técnica.
            </p>

            {/* Selector de Pestañas Principales */}
            <div className="inline-flex p-1 rounded-xl bg-gray-100 border border-gray-200 mt-5 gap-1 shadow-xs">
              <button
                onClick={() => setActiveTab('motos')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'motos'
                    ? 'bg-white text-gray-900 shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Motos Eléctricas ({filteredMotos.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('repuestos')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'repuestos'
                    ? 'bg-white text-gray-900 shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Repuestos de Proveedor ({filteredParts.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('comparador')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'comparador'
                    ? 'bg-white text-gray-900 shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Scale className="w-3.5 h-3.5" />
                <span>Comparador Multivehículo</span>
              </button>
            </div>
          </div>

          {/* ============================================================ */}
          {/* VISTA 1: CATÁLOGO DE MOTOS ELÉCTRICAS OFICIALES             */}
          {/* ============================================================ */}
          {activeTab === 'motos' && (
            <div>
              {/* Barra de Filtros */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-gray-50 border border-gray-200 mb-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-gray-600 flex items-center gap-1">
                    <Filter className="w-3.5 h-3.5" /> Marca:
                  </span>
                  {['todas', ...OFFICIAL_BRANDS.map((b) => b.name)].map((b) => (
                    <button
                      key={b}
                      onClick={() => setSelectedBrand(b)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                        selectedBrand === b
                          ? 'bg-blue-600 text-white font-semibold shadow-xs'
                          : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {b === 'todas' ? 'Todas' : b}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">Tipo:</span>
                  <select
                    value={selectedVehicleType}
                    onChange={(e) => setSelectedVehicleType(e.target.value)}
                    className="bg-white border border-gray-300 text-xs text-gray-900 rounded-md px-2.5 py-1 focus:ring-1 focus:ring-blue-600"
                  >
                    <option value="todos">Todos los tipos</option>
                    <option value="MOTO_ELECTRICA">Motos Eléctricas</option>
                    <option value="VMP_BICIMOTO">VMP / Bicimotos</option>
                    <option value="MOTO_SCOOTER">Moto Scooters</option>
                    <option value="BICIMOTO">Bicimotos</option>
                  </select>
                </div>
              </div>

              {/* Rejilla de Motos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredMotos.map((moto) => {
                  const detail = getMotoWithCompatibleParts(moto.slug);
                  const partsCount = detail?.compatibleParts.length || 0;

                  return (
                    <div
                      key={moto.slug}
                      className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 flex flex-col justify-between hover:border-blue-200 hover:shadow-xs transition-all group"
                    >
                      <div>
                        {/* Contenedor de Fotografía Real / Representativa */}
                        <div className="relative w-full h-44 mb-3.5 rounded-lg bg-gray-50 border border-gray-100 overflow-hidden flex items-center justify-center p-2">
                          <Image
                            src={moto.imageUrl || "/images/motos/placeholder-ev-moto.svg"}
                            alt={`Moto eléctrica ${moto.brand} ${moto.model}`}
                            fill
                            unoptimized={Boolean(moto.imageUrl?.startsWith('http'))}
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                          />
                          {moto.imageUrl ? (
                            <span className="absolute top-2 left-2 rounded-md bg-white/90 backdrop-blur-xs px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-100 shadow-2xs">
                              Foto Verificada
                            </span>
                          ) : (
                            <span className="absolute top-2 left-2 rounded-md bg-white/90 backdrop-blur-xs px-2 py-0.5 text-[10px] font-medium text-gray-500 border border-gray-200 shadow-2xs">
                              En Homologación
                            </span>
                          )}
                        </div>

                        {/* Badge superior */}
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-xs font-bold tracking-wider uppercase text-blue-600">
                            {moto.brand}
                          </span>
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                            {moto.vehicleType.replace(/_/g, ' ')}
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {moto.model}
                        </h3>

                        {/* Precio Referencial de Proveedor */}
                        <div className="mt-2 mb-3">
                          <span className="text-[10px] uppercase font-semibold text-gray-400 block">
                            Precio Referencial Proveedor:
                          </span>
                          {moto.pricePen ? (
                            <div className="flex items-baseline gap-2">
                              <span className="text-xl font-bold text-gray-900">
                                {formatCurrency(moto.pricePen)}
                              </span>
                              {moto.regularPricePen && (
                                <span className="text-xs line-through text-gray-400">
                                  {formatCurrency(moto.regularPricePen)}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-amber-700 font-medium">A consultar en proveedor</span>
                          )}
                        </div>

                        {/* Métricas clave */}
                        <div className="grid grid-cols-3 gap-2 py-2.5 border-y border-gray-100 text-center my-3 bg-gray-50 rounded-lg">
                          <div>
                            <span className="text-[10px] text-gray-400 block">Motor</span>
                            <span className="text-xs font-semibold text-gray-800">
                              {moto.motorNominalW ? `${moto.motorNominalW}W` : 'N/D'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-gray-400 block">Batería</span>
                            <span className="text-xs font-semibold text-gray-800">
                              {moto.batteryVoltageV ? `${moto.batteryVoltageV}V` : 'N/D'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-gray-400 block">Velocidad</span>
                            <span className="text-xs font-semibold text-gray-800">
                              {moto.maxSpeedKmh ? `${moto.maxSpeedKmh} km/h` : 'N/D'}
                            </span>
                          </div>
                        </div>

                        {/* Repuestos compatibles vinculados */}
                        <div className="mt-2 flex items-center justify-between text-xs">
                          <span className="text-gray-500">Repuestos verificados:</span>
                          {partsCount > 0 ? (
                            <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              {partsCount} compatible{partsCount > 1 ? 's' : ''}
                            </span>
                          ) : (
                            <span className="text-gray-400">En documentación</span>
                          )}
                        </div>
                      </div>

                      {/* Botones de acción */}
                      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setInspectedMoto(moto)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all cursor-pointer shadow-xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ficha y Repuestos</span>
                        </button>

                        {moto.sourceUrl && (
                          <a
                            href={moto.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Ver en sitio web oficial"
                            className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 hover:text-gray-900 transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* VISTA 2: REPUESTOS DE PROVEEDORES REALES                     */}
          {/* ============================================================ */}
          {activeTab === 'repuestos' && (
            <div>
              {/* Filtros de repuestos */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-gray-50 border border-gray-200 mb-6">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-semibold text-gray-600 mr-1">
                    Categoría:
                  </span>
                  {['todas', 'BATERIA', 'CARGADOR', 'LLANTA', 'ESPEJO', 'CARROCERIA', 'ELECTRICO', 'SUSPENSION', 'FRENOS', 'CHASIS', 'ACCESORIO'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedPartCategory(cat)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                        selectedPartCategory === cat
                          ? 'bg-blue-600 text-white font-semibold shadow-xs'
                          : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {cat === 'todas' ? 'Todas' : cat}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">Marca:</span>
                  <select
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    className="bg-white border border-gray-300 text-xs text-gray-900 rounded-md px-2.5 py-1 focus:ring-1 focus:ring-blue-600"
                  >
                    <option value="todas">Todas las marcas</option>
                    {OFFICIAL_BRANDS.map((b) => (
                      <option key={b.name} value={b.name}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Rejilla de Repuestos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredParts.map((part) => (
                  <div
                    key={part.partKey}
                    className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col justify-between hover:border-gray-300 hover:shadow-xs transition-all"
                  >
                    <div>
                      <div className="relative h-40 w-full mb-3.5 rounded-lg bg-gray-50 border border-gray-100 overflow-hidden flex items-center justify-center p-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={part.imageUrl || '/images/motos/placeholder-ev-moto.svg'}
                          alt={part.name}
                          className="h-full w-full object-contain transition-transform duration-300 hover:scale-105"
                          loading="lazy"
                        />
                      </div>

                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-xs font-bold text-blue-600 uppercase">
                          {part.brand}
                        </span>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-600 uppercase">
                          {part.category}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-gray-900 mb-1.5 leading-snug">
                        {part.name}
                      </h3>

                      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
                        <Building2 className="w-3.5 h-3.5 text-blue-600" />
                        <span>{part.supplier}</span>
                      </div>

                      {/* Precio y stock del proveedor */}
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 mb-3">
                        <div className="flex items-baseline justify-between">
                          <div>
                            <span className="text-[10px] uppercase text-gray-400 block font-semibold">Precio Referencial:</span>
                            <span className="text-lg font-bold text-gray-900">
                              {part.pricePen ? formatCurrency(part.pricePen) : 'A Consultar'}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] uppercase text-gray-400 block font-semibold">Stock Proveedor:</span>
                            <span className={`text-xs font-medium ${part.stockStatus === 'AGOTADO_EN_PAGINA' ? 'text-red-600' : 'text-gray-700'}`}>
                              {part.stockStatus.replace(/_/g, ' ')}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Especificaciones clave */}
                      <div className="text-xs text-gray-600 space-y-1 mb-2">
                        {part.electricalVoltageV && (
                          <div>⚡ Tensión: <strong className="text-gray-900">{part.electricalVoltageV}V</strong></div>
                        )}
                        {part.outputVoltageV && (
                          <div>🔌 Salida: <strong className="text-gray-900">{part.outputVoltageV}V {part.outputCurrentA ? `@ ${part.outputCurrentA}A` : ''}</strong></div>
                        )}
                        {part.connectorOrFit && (
                          <div className="text-[11px] line-clamp-2 text-gray-500">
                            🔧 Conector: {part.connectorOrFit}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setInspectedPart(part)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ficha Técnica</span>
                      </button>

                      {part.sourceUrl && (
                        <a
                          href={part.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all shadow-xs"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Ver en {part.supplier}</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* VISTA 3: COMPARADOR TÉCNICO MULTIVEHÍCULO                    */}
          {/* ============================================================ */}
          {activeTab === 'comparador' && (
            <MotoComparator onInspectMoto={(m) => setInspectedMoto(m)} />
          )}

        </div>

        {/* Modales */}
        {inspectedMoto && (
          <MotoDetailModal
            moto={inspectedMoto}
            onClose={() => setInspectedMoto(null)}
            onSelectPart={(p) => setInspectedPart(p)}
          />
        )}

        {inspectedPart && (
          <PartDetailModal
            part={inspectedPart}
            onClose={() => setInspectedPart(null)}
          />
        )}
      </section>
    </div>
  );
}
