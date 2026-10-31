'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '../../lib/cart/cart-context';
import { Icon } from '../../components/ui/Icons';
import { formatCurrency } from '../../lib/formatters.js';

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, subtotal, totalCount, isLoaded } = useCart();
  const [couponInput, setCouponInput] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  if (!isLoaded) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center text-gray-500">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-3 border-solid border-blue-600 border-r-transparent"></div>
        <p className="mt-3 text-xs font-medium">Cargando carrito de compras...</p>
      </div>
    );
  }

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    if (couponInput.trim().toUpperCase() === 'BIENVENIDO5') {
      setCouponApplied(true);
      setCouponError(null);
    } else {
      setCouponError('El código no es válido o no está activo.');
      setCouponApplied(false);
    }
  };

  const discountAmount = couponApplied ? Math.round(subtotal * 0.05 * 100) / 100 : 0;
  const estimatedTotal = Math.max(0, subtotal - discountAmount);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav aria-label="Ruta de navegación" className="mb-6 flex items-center gap-2 text-xs text-gray-500">
        <Link href="/" className="hover:text-blue-600 transition-colors">
          Inicio
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">Carrito de Compras</span>
      </nav>

      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Carrito de Repuestos
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Revisa los componentes seleccionados antes de proceder al pago seguro.
          </p>
        </div>

        {items.length > 0 && (
          <button
            onClick={clearCart}
            className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            <Icon name="trash" className="w-3.5 h-3.5" />
            Vaciar Carrito
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center max-w-xl mx-auto space-y-4 shadow-xs">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gray-50 text-blue-600 mx-auto border border-gray-200">
            <Icon name="cart" className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Tu carrito está vacío</h2>
          <p className="text-xs text-gray-500 leading-relaxed max-w-md mx-auto">
            Aún no has agregado repuestos de venta directa. Explora nuestro catálogo de componentes homologados o consulta con VoltIA para encontrar la pieza exacta para tu moto.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center">
            <Link
              href="/#catalogo"
              className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 text-xs transition-colors shadow-xs"
            >
              Ver Repuestos en Venta Directa
            </Link>
            <Link
              href="/#compatibilidad"
              className="rounded-lg bg-white hover:bg-gray-50 text-gray-700 font-semibold px-4 py-2 text-xs transition-colors border border-gray-300 shadow-xs"
            >
              Comprobar Compatibilidad
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Listado de Productos */}
          <div className="lg:col-span-8 space-y-4">
            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-xs">
              <div className="border-b border-gray-100 bg-gray-50 px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider flex justify-between">
                <span>Producto</span>
                <span className="hidden sm:inline">Subtotal</span>
              </div>

              <div className="divide-y divide-gray-100">
                {items.map((item) => (
                  <div key={item.sku} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {item.imageUrl ? (
                        <div className="h-16 w-16 rounded-lg bg-gray-50 border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                        </div>
                      ) : (
                        <div className="h-16 w-16 rounded-lg bg-gray-50 border border-gray-200 shrink-0 flex items-center justify-center text-blue-600">
                          <Icon name="circuit" className="w-6 h-6" />
                        </div>
                      )}

                      <div className="space-y-1">
                        <span className="text-[10px] font-mono text-gray-500 font-semibold">
                          SKU: {item.sku}
                        </span>
                        <h3 className="text-sm font-bold text-gray-900 leading-snug">
                          {item.name}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>Unitario: <strong className="text-gray-800">{formatCurrency(item.price, item.currency)}</strong></span>
                          <span>•</span>
                          <span className="text-emerald-700 font-medium">Stock Propio Confirmado</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100">
                      {/* Control de cantidad */}
                      <div className="flex items-center rounded-lg bg-gray-50 border border-gray-200 p-1">
                        <button
                          onClick={() => updateQuantity(item.sku, item.quantity - 1)}
                          className="h-7 w-7 flex items-center justify-center rounded text-gray-600 hover:bg-white hover:shadow-xs transition-all cursor-pointer"
                          aria-label="Disminuir cantidad"
                        >
                          <Icon name="minus" className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-gray-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.sku, item.quantity + 1)}
                          disabled={item.quantity >= item.stockAvailable}
                          className="h-7 w-7 flex items-center justify-center rounded text-gray-600 hover:bg-white hover:shadow-xs transition-all disabled:opacity-30 cursor-pointer"
                          aria-label="Aumentar cantidad"
                        >
                          <Icon name="plus" className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Subtotal por producto */}
                      <div className="text-right min-w-[90px]">
                        <span className="text-sm font-bold text-gray-900 block">
                          {formatCurrency(item.price * item.quantity, item.currency)}
                        </span>
                      </div>

                      {/* Eliminar */}
                      <button
                        onClick={() => removeItem(item.sku)}
                        className="text-gray-400 hover:text-red-600 transition-colors p-1 cursor-pointer"
                        aria-label="Quitar producto"
                      >
                        <Icon name="trash" className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Garantía de Venta Directa */}
            <div className="rounded-xl bg-white border border-gray-200 p-4 flex items-center gap-3 text-xs text-gray-700 shadow-xs">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 shrink-0">
                <Icon name="shield" className="w-4 h-4" />
              </div>
              <p>
                <strong>Garantía Oficial NeroElectric Motors:</strong> Todos los repuestos de tu carrito cuentan con verificación de voltaje, compatibilidad homologada y respaldo ante defectos de fábrica.
              </p>
            </div>
          </div>

          {/* Resumen y Checkout */}
          <div className="lg:col-span-4 space-y-4">
            <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4 shadow-xs">
              <h2 className="text-sm font-bold text-gray-900 tracking-wide border-b border-gray-100 pb-3">
                Resumen del Pedido
              </h2>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Productos ({totalCount})</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(subtotal, 'PEN')}</span>
                </div>

                {couponApplied && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Descuento Bienvenida (5%)</span>
                    <span>-{formatCurrency(discountAmount, 'PEN')}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-600">
                  <span>Despacho estimado</span>
                  <span className="text-gray-900 font-medium">Calculado en checkout</span>
                </div>

                <div className="border-t border-gray-100 pt-3 flex justify-between text-sm font-bold text-gray-900">
                  <span>Total Estimado</span>
                  <span className="text-base text-blue-600">{formatCurrency(estimatedTotal, 'PEN')}</span>
                </div>
              </div>

              {/* Caja de Cupón de Descuento */}
              <div className="border-t border-gray-100 pt-3.5">
                <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                  ¿Tienes un cupón de descuento?
                </label>
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Ej: BIENVENIDO5"
                    className="flex-1 rounded-lg bg-gray-50 border border-gray-200 px-3 py-1.5 text-xs text-gray-900 uppercase placeholder-gray-400 focus:outline-none focus:border-blue-600 focus:bg-white"
                  />
                  <button
                    type="submit"
                    className="rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-3 py-1.5 text-xs transition-colors cursor-pointer"
                  >
                    Aplicar
                  </button>
                </form>
                {couponApplied && (
                  <p className="mt-1.5 text-[11px] text-emerald-700 font-semibold">
                    ✓ Cupón BIENVENIDO5 aplicado con éxito (5% de descuento).
                  </p>
                )}
                {couponError && (
                  <p className="mt-1.5 text-[11px] text-red-600 font-medium">
                    {couponError}
                  </p>
                )}
              </div>

              {/* Botón hacia Checkout */}
              <Link
                href="/checkout"
                className="w-full block text-center rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold py-2.5 text-xs transition-all shadow-xs"
              >
                Continuar al Checkout →
              </Link>

              <div className="text-center pt-1">
                <Link
                  href="/#catalogo"
                  className="text-xs text-gray-500 hover:text-blue-600 transition-colors"
                >
                  ← Seguir explorando repuestos
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
