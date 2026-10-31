'use client';

import React, { useState, useMemo } from 'react';
import {
  Zap,
  Eye,
  Info,
  X,
  MessageCircle,
  Cpu,
  Battery,
  SlidersHorizontal
} from 'lucide-react';
import { Product } from '@/types';
import { PRODUCTS } from '@/data/products';
import { formatCurrency } from '@/lib/utils';

export function FeaturedProducts() {
  const [activeCategoryTab, setActiveCategoryTab] = useState<string>('todos');
  const [selectedVoltage, setSelectedVoltage] = useState<string>('todos');
  const [inspectProduct, setInspectProduct] = useState<Product | null>(null);

  // Filtrado reactivo en cliente
  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((item) => {
      const matchCategory =
        activeCategoryTab === 'todos' || item.category === activeCategoryTab;

      const matchVoltage =
        selectedVoltage === 'todos' ||
        item.voltage === selectedVoltage ||
        item.voltage === 'Universal';

      return matchCategory && matchVoltage;
    });
  }, [activeCategoryTab, selectedVoltage]);

  const handleWhatsAppInquiry = (product: Product) => {
    const whatsappSupport = process.env.NEXT_PUBLIC_WHATSAPP_SUPPORT;
    const isRealSupport = whatsappSupport && !whatsappSupport.includes('999888777');
    const message = encodeURIComponent(
      `Consulta técnica NeroElectric Motors: Repuesto ${product.title} (SKU: ${product.sku}) por ${formatCurrency(product.price)}. Requiero validar compatibilidad.`
    );
    if (isRealSupport) {
      window.open(`https://wa.me/${whatsappSupport.replace(/[^0-9]/g, '')}?text=${message}`, '_blank');
    } else {
      const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'soporte@motoservice.pe';
      window.location.assign(`mailto:${email}?subject=${encodeURIComponent(`Consulta técnica repuesto: ${product.sku}`)}&body=${message}`);
    }
  };

  return (
    <section id="muestrario-local" className="py-20 bg-slate-950 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Cabecera de Catálogo */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold mb-2 border border-slate-700">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>Muestrario de Referencia Técnica (Datos Locales)</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Especificaciones de Componentes EV
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-1">
              Fichas de referencia para dimensionamiento eléctrico y diseño. Los productos con inventario persistido se gestionan en Supabase.
            </p>
          </div>

          {/* Filtro rápido por Voltaje */}
          <div className="flex items-center gap-2 flex-wrap bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
            <span className="text-xs font-bold text-slate-400 px-2 flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5" /> Voltaje:
            </span>
            {['todos', '72V', '60V', '48V', 'Universal'].map((volt) => (
              <button
                key={volt}
                type="button"
                onClick={() => setSelectedVoltage(volt)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  selectedVoltage === volt
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {volt === 'todos' ? 'Todos' : volt}
              </button>
            ))}
          </div>
        </div>

        {/* Pestañas de Categoría */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none border-b border-slate-800">
          {[
            { id: 'todos', label: 'Todos los Componentes' },
            { id: 'baterias-bms', label: 'Baterías & Smart BMS' },
            { id: 'motores-controladores', label: 'Motores & Controladores' },
            { id: 'frenos-regenerativos', label: 'Frenos Regenerativos' },
            { id: 'cargadores-rapidos', label: 'Cargadores Rápidos' },
            { id: 'electronica-display', label: 'Displays & DC-DC' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveCategoryTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                activeCategoryTab === tab.id
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Rejilla de Productos */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800">
            <Info className="w-10 h-10 text-slate-500 mx-auto mb-3" />
            <p className="text-lg font-bold text-white">No se encontraron repuestos con los filtros seleccionados</p>
            <p className="text-sm text-slate-400 mt-1">Prueba seleccionando otro voltaje o restaurando la vista general.</p>
            <button
              type="button"
              onClick={() => {
                setActiveCategoryTab('todos');
                setSelectedVoltage('todos');
              }}
              className="mt-4 px-4 py-2 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs"
            >
              Restablecer Filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="group rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 hover:shadow-xl hover:shadow-emerald-500/5 transition-all flex flex-col justify-between overflow-hidden"
              >
                {/* Cabecera de la tarjeta con imagen y badges */}
                <div className="relative p-5 pb-0">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    {product.badge && (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {product.badge}
                      </span>
                    )}
                    {product.voltage && (
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-800 text-slate-300 border border-slate-700 ml-auto">
                        ⚡ {product.voltage}
                      </span>
                    )}
                  </div>

                  {/* Imagen ilustrativa con overlay */}
                  <div className="relative h-44 w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800/80 group-hover:scale-[1.02] transition-transform">
                    {/* Placeholder visual técnico con degradado */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent z-10" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center z-20">
                      {product.category === 'baterias-bms' && <Battery className="w-12 h-12 text-emerald-400 mb-2 opacity-90" />}
                      {product.category === 'motores-controladores' && <Cpu className="w-12 h-12 text-teal-400 mb-2 opacity-90" />}
                      {product.category !== 'baterias-bms' && product.category !== 'motores-controladores' && <Zap className="w-12 h-12 text-cyan-400 mb-2 opacity-90" />}
                      <span className="text-[11px] font-mono text-slate-400 uppercase tracking-widest">{product.sku}</span>
                    </div>
                  </div>
                </div>

                {/* Cuerpo de la tarjeta */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Información Técnica y Garantía */}
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-[11px] font-mono text-slate-400">
                        SKU: {product.sku}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Garantía: {product.warrantyMonths} meses
                      </span>
                    </div>

                    {/* Título */}
                    <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-2 leading-snug">
                      {product.title}
                    </h3>

                    {/* Descripción corta */}
                    <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                      {product.shortDescription}
                    </p>

                    {/* Chips de compatibilidad de marca */}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {product.brandCompatibility.slice(0, 3).map((brand) => (
                        <span
                          key={brand}
                          className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-950 text-slate-300 border border-slate-800"
                        >
                          {brand}
                        </span>
                      ))}
                      {product.brandCompatibility.length > 3 && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] text-slate-500">
                          +{product.brandCompatibility.length - 3} más
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Precios y Botones */}
                  <div className="pt-4 mt-4 border-t border-slate-800/80">
                    <div className="flex items-baseline justify-between mb-3">
                      <div>
                        <span className="text-xs text-slate-400 block">Precio Estimado</span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-xl font-black text-white">
                            {formatCurrency(product.price, product.currency)}
                          </span>
                          {product.originalPrice && (
                            <span className="text-xs line-through text-slate-500">
                              {formatCurrency(product.originalPrice, product.currency)}
                            </span>
                          )}
                        </div>
                      </div>

                      <span className="text-[10px] font-semibold text-slate-400 bg-slate-800/80 px-2 py-1 rounded border border-slate-700">
                        Referencia Local
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setInspectProduct(product)}
                        className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ficha Técnica</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleWhatsAppInquiry(product)}
                        className="py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                      >
                        <MessageCircle className="w-3.5 h-3.5 fill-slate-950" />
                        <span>Consultar</span>
                      </button>
                    </div>

                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

        {/* Modal de Ficha Técnica */}
        {inspectProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8">

              <button
                type="button"
                onClick={() => setInspectProduct(null)}
                className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {inspectProduct.voltage || 'Universal'}
                </span>
                <span className="text-xs text-slate-400 font-mono">SKU: {inspectProduct.sku}</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">
                {inspectProduct.title}
              </h3>

              <p className="text-sm text-slate-300 mb-6 leading-relaxed">
                {inspectProduct.description}
              </p>

              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Especificaciones de Ingeniería Eléctrica
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
                {inspectProduct.specs.map((spec, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                    <span className="text-[11px] text-slate-400 block">{spec.name}</span>
                    <span className="text-xs font-semibold text-white">{spec.value}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
                <div>
                  <span className="text-xs text-slate-400">Precio de lista:</span>
                  <div className="text-2xl font-black text-white">
                    {formatCurrency(inspectProduct.price, inspectProduct.currency)}
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => {
                      handleWhatsAppInquiry(inspectProduct);
                      setInspectProduct(null);
                    }}
                    className="flex-1 sm:flex-none py-3 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4 fill-slate-950" />
                    <span>Consultar Compatibilidad Técnica</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </section>
  );
}
