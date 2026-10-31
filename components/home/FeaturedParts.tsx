"use client";

import { useState } from "react";
import Link from "next/link";
import { formatCurrency, formatVoltage, formatPower } from "../../lib/formatters.js";
import { Icon } from "../ui/Icons";
import { useCart } from "../../lib/cart/cart-context";
import type { FeaturedPartItem } from "../../types";

interface FeaturedPartsProps {
  parts?: FeaturedPartItem[];
  error?: boolean;
}

export function FeaturedParts({ parts = [], error = false }: FeaturedPartsProps) {
  const { addItem } = useCart();
  const [feedback, setFeedback] = useState<{ [sku: string]: string }>({});

  const handleAdd = (part: FeaturedPartItem) => {
    const res = addItem({
      id: part.sku,
      sku: part.sku,
      name: part.name,
      price: part.price,
      currency: part.currency,
      categoryName: part.categoryName,
      imageUrl: part.imageUrl,
      isDirectSale: true,
      stockAvailable: 15,
      voltage: part.voltage,
    });

    setFeedback((prev) => ({
      ...prev,
      [part.sku]: res.success ? "¡Añadido al carrito!" : (res.message || "No disponible"),
    }));

    setTimeout(() => {
      setFeedback((prev) => {
        const next = { ...prev };
        delete next[part.sku];
        return next;
      });
    }, 3000);
  };

  return (
    <section id="catalogo" className="scroll-mt-20 py-16 bg-slate-50 border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-4 border-b border-gray-200">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                Venta Directa NeroElectric Motors
              </span>
              <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-2 py-0.5">
                ● Stock Propio Inmediato
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Repuestos con Despacho Inmediato
            </h2>
            <p className="mt-1 text-gray-600 text-xs sm:text-sm max-w-xl">
              Componentes con disponibilidad física en almacén Lima, precios confirmados y garantía técnica.
            </p>
          </div>
          <a
            href="#compatibilidad"
            className="mt-3 md:mt-0 text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
          >
            Filtrar por tu modelo exacto
            <Icon name="arrow-right" className="w-3.5 h-3.5" />
          </a>
        </div>

        {error ? (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center max-w-lg mx-auto shadow-xs">
            <div className="w-12 h-12 rounded-lg bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-3">
              <Icon name="alert-circle" className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">
              Dificultad al consultar repuestos
            </h3>
            <p className="text-gray-500 text-xs leading-relaxed mb-4">
              Por favor intenta recargar la página o consulta con un asesor técnico.
            </p>
            <a
              href="#compatibilidad"
              className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-4 py-2 text-xs transition-colors"
            >
              Consultar Compatibilidad
              <Icon name="arrow-right" className="w-3.5 h-3.5" />
            </a>
          </div>
        ) : parts.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-10 text-center max-w-lg mx-auto shadow-xs">
            <div className="w-12 h-12 rounded-lg bg-gray-50 text-gray-500 flex items-center justify-center mx-auto mb-3">
              <Icon name="search" className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">
              Catálogo en actualización
            </h3>
            <p className="text-gray-500 text-xs mb-4">
              Puedes verificar compatibilidad de repuestos o consultar directamente con nuestro taller.
            </p>
            <a
              href="#compatibilidad"
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 text-xs transition-colors"
            >
              Verificar Compatibilidad
              <Icon name="arrow-right" className="w-3.5 h-3.5" />
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {parts.map((part) => (
              <div
                key={part.id}
                className="rounded-xl border border-gray-200 bg-white p-5 flex flex-col justify-between hover:border-gray-300 hover:shadow-xs transition-all"
              >
                <div>
                  {/* Imagen o Marcador Visual */}
                  {part.imageUrl ? (
                    <div className="relative w-full h-44 mb-4 rounded-lg overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={part.imageUrl}
                        alt={part.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute top-2 left-2">
                        <span className="rounded bg-white/90 backdrop-blur-xs px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-gray-200">
                          Venta Directa
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="relative w-full h-44 mb-4 rounded-lg bg-gray-50 border border-gray-100 flex flex-col items-center justify-center text-gray-400 gap-2">
                      <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-blue-600">
                        <Icon name="circuit" className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-medium text-gray-500">
                        Componente Verificado
                      </span>
                      <div className="absolute top-2 left-2">
                        <span className="rounded bg-white px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-gray-200">
                          Venta Directa
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-2 gap-2">
                    <span className="text-xs font-mono text-gray-500 font-semibold truncate">
                      SKU: {part.sku}
                    </span>
                    {part.categoryName ? (
                      <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                        {part.categoryName}
                      </span>
                    ) : part.isPopular ? (
                      <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Más Vendido
                      </span>
                    ) : null}
                  </div>

                  <h3 className="text-base font-bold text-gray-900 leading-snug">
                    {part.name}
                  </h3>
                  <p className="mt-1.5 text-xs text-gray-500 leading-relaxed line-clamp-2">
                    {part.shortDescription}
                  </p>

                  {/* Specs pill row */}
                  {(part.voltage || part.powerW || part.capacityAh) ? (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {part.voltage && (
                        <div className="rounded bg-gray-50 border border-gray-200 px-2 py-0.5 text-xs text-gray-700">
                          <span className="text-gray-400 mr-1 text-[11px]">Tensión:</span>
                          <span className="font-semibold text-blue-700">
                            {formatVoltage(part.voltage)}
                          </span>
                        </div>
                      )}
                      {part.powerW && (
                        <div className="rounded bg-gray-50 border border-gray-200 px-2 py-0.5 text-xs text-gray-700">
                          <span className="text-gray-400 mr-1 text-[11px]">Potencia:</span>
                          <span className="font-semibold text-gray-800">
                            {formatPower(part.powerW)}
                          </span>
                        </div>
                      )}
                      {part.capacityAh && (
                        <div className="rounded bg-gray-50 border border-gray-200 px-2 py-0.5 text-xs text-gray-700">
                          <span className="text-gray-400 mr-1 text-[11px]">Capacidad:</span>
                          <span className="font-semibold text-emerald-700">
                            {part.capacityAh} Ah
                          </span>
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>

                {/* Bottom footer con precio y botón de compra directa */}
                <div className="mt-5 pt-4 border-t border-gray-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-gray-400 block font-semibold">
                        Precio
                      </span>
                      <span className="text-xl font-bold text-gray-900">
                        {formatCurrency(part.price, part.currency)}
                      </span>
                    </div>

                    <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      En stock (Lima)
                    </span>
                  </div>

                  {feedback[part.sku] && (
                    <div className="rounded-md bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs font-semibold text-emerald-800 flex items-center justify-between">
                      <span>{feedback[part.sku]}</span>
                      <Link href="/carrito" className="underline text-emerald-900 font-bold">
                        Ir al carrito →
                      </Link>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAdd(part)}
                      className="flex-1 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold py-2.5 text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Icon name="cart" className="w-3.5 h-3.5" />
                      Añadir al Carrito
                    </button>

                    <a
                      href="#compatibilidad"
                      className="rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 px-3 py-2.5 text-xs font-semibold text-gray-600 transition-colors flex items-center justify-center"
                      title="Verificar compatibilidad técnica"
                    >
                      <Icon name="check-circle" className="w-3.5 h-3.5 text-emerald-600" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
