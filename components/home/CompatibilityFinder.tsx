'use client';

import React, { useState } from 'react';
import { SlidersHorizontal, RefreshCw, Zap, ArrowRight } from 'lucide-react';

interface FinderProps {
  onFilterChange?: (filters: { brand: string; voltage: string; category: string }) => void;
}

export function CompatibilityFinder({ onFilterChange }: FinderProps) {
  const [selectedBrand, setSelectedBrand] = useState('todas');
  const [selectedVoltage, setSelectedVoltage] = useState('todas');
  const [selectedCategory, setSelectedCategory] = useState('todas');
  const [hasSearched, setHasSearched] = useState(false);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    if (onFilterChange) {
      onFilterChange({
        brand: selectedBrand,
        voltage: selectedVoltage,
        category: selectedCategory,
      });
    }

    // Scroll suave hacia el catálogo
    const catalogElem = document.getElementById('catalogo-ecomoto') || document.getElementById('catalogo');
    if (catalogElem) {
      catalogElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleReset = () => {
    setSelectedBrand('todas');
    setSelectedVoltage('todas');
    setSelectedCategory('todas');
    setHasSearched(false);
    if (onFilterChange) {
      onFilterChange({ brand: 'todas', voltage: 'todas', category: 'todas' });
    }
  };

  return (
    <section id="compatibilidad" className="relative -mt-6 sm:-mt-8 z-30 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-7 shadow-lg shadow-gray-200/50">

        {/* Cabecera del Buscador */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5 pb-4 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md text-blue-600">
                <SlidersHorizontal className="w-5 h-5 text-blue-600" />
              </span>
              <h2 className="text-lg font-bold text-gray-900 tracking-tight">
                Buscador de Compatibilidad EV
              </h2>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Filtra motos y repuestos por marca, tensión del sistema y categoría según compatibilidades técnicas documentadas.
            </p>
          </div>

          <div className="flex items-center">
            <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-lg bg-amber-50 text-amber-800 font-semibold border border-amber-200/80 shadow-2xs">
              <span className="text-amber-500">⚡</span> Tolerancia Eléctrica Verificada
            </span>
          </div>
        </div>

        {/* Formulario de Selección */}
        <form onSubmit={handleApply} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          {/* 1. Marca de Moto */}
          <div>
            <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1.5">
              1. MARCA OFICIAL
            </label>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-colors shadow-2xs cursor-pointer"
            >
              <option value="todas">Todas las marcas</option>
              <option value="TAILG">TAILG</option>
              <option value="YADEA">YADEA</option>
              <option value="KAYENCORP">KAYENCORP</option>
              <option value="GREENLINE">GreenLine</option>
            </select>
          </div>

          {/* 2. Voltaje del Sistema */}
          <div>
            <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1.5">
              2. TENSIÓN DEL SISTEMA
            </label>
            <select
              value={selectedVoltage}
              onChange={(e) => setSelectedVoltage(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-colors shadow-2xs cursor-pointer"
            >
              <option value="todas">Cualquier voltaje</option>
              <option value="72V">72V (Alto Rendimiento / 84V Max)</option>
              <option value="60V">60V (Estándar Urbano / 71.4V Max)</option>
              <option value="48V">48V (Compacto / VMP 54.6V Max)</option>
            </select>
          </div>

          {/* 3. Categoría de Repuesto */}
          <div>
            <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1.5">
              3. CATEGORÍA DE REPUESTO
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-colors shadow-2xs cursor-pointer"
            >
              <option value="todas">Todos los componentes</option>
              <option value="CARGADOR">Cargadores Inteligentes</option>
              <option value="BATERIA">Baterías (Grafeno / Litio)</option>
              <option value="ACCESORIO">Accesorios y Faros</option>
              <option value="ESPEJO">Espejos Retrovisores</option>
              <option value="CARROCERIA">Carrocería y Carenado</option>
              <option value="FRENOS">Sistemas de Frenos</option>
            </select>
          </div>

          {/* Botones de Acción */}
          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 fill-white" />
              <span>Ver Compatibles</span>
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="p-2.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer shadow-2xs"
              title="Restablecer filtros"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

        </form>

        {/* Resumen del filtro activo si aplica */}
        {hasSearched && (
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <span className="text-blue-600 font-semibold">Filtro aplicado:</span>
              <span>Marca: <strong>{selectedBrand === 'todas' ? 'Todas' : selectedBrand}</strong></span>
              <span>•</span>
              <span>Voltaje: <strong>{selectedVoltage === 'todas' ? 'Cualquiera' : selectedVoltage}</strong></span>
              <span>•</span>
              <span>Categoría: <strong>{selectedCategory === 'todas' ? 'Todas' : selectedCategory}</strong></span>
            </div>
            <a href="#catalogo-ecomoto" className="text-blue-600 hover:underline flex items-center gap-1 font-medium">
              Ir al catálogo filtrado <ArrowRight className="w-3 h-3" />
            </a>
          </div>
        )}

      </div>
    </section>
  );
}
