'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '../../lib/cart/cart-context';
import { Icon } from '../../components/ui/Icons';
import { formatCurrency } from '../../lib/formatters.js';

interface StoredOrder {
  id: string;
  orderNumber: string;
  total: number;
  currency: string;
  date: string;
  guestToken: string;
  status: string;
  paymentStatus: string;
  deliveryMethod?: string;
  itemCount?: number;
}

interface TrackingResult {
  id: string;
  orderNumber: string;
  orderStatus: string;
  paymentStatus: string;
  dispatchStatus: string;
  deliveryMethod: string;
  customerNameMasked: string;
  customerEmailMasked: string;
  shippingAddressMasked: string;
  department: string;
  province: string;
  district: string;
  total: number;
  currency: string;
  createdAt: string;
  items: Array<{
    sku: string;
    name: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }>;
  timelineSteps: Array<{
    key: string;
    label: string;
    description: string;
    status: 'completed' | 'current' | 'upcoming';
  }>;
  supportWhatsAppUrl: string;
}

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, subtotal, totalCount, isLoaded } = useCart();
  const [couponInput, setCouponInput] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Pedido reciente guardado en navegador
  const [recentOrder, setRecentOrder] = useState<StoredOrder | null>(null);

  // Estado de Rastrear Pedido
  const [trackingQuery, setTrackingQuery] = useState('');
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState<string | null>(null);
  const [trackingData, setTrackingData] = useState<TrackingResult | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const rawLast = localStorage.getItem('motoservice_last_order');
        if (rawLast) {
          const parsed = JSON.parse(rawLast);
          if (parsed && (parsed.id || parsed.orderNumber)) {
            setRecentOrder(parsed);
          }
        }
      } catch {
        // Ignorar fallo de almacenamiento
      }

      const urlParams = new URLSearchParams(window.location.search);
      const queryParam =
        urlParams.get('rastreo') ||
        urlParams.get('q') ||
        urlParams.get('order') ||
        urlParams.get('pedido');

      if (queryParam) {
        setTrackingQuery(queryParam);
        handleExecuteTracking(queryParam);
      }
    }
  }, []);

  const handleExecuteTracking = async (code: string) => {
    const cleanCode = code.trim();
    if (!cleanCode) return;

    setTrackingLoading(true);
    setTrackingError(null);

    try {
      const res = await fetch(`/api/orders/track?q=${encodeURIComponent(cleanCode)}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'No se encontró ningún pedido con el código ingresado.');
      }

      setTrackingData(data.tracking);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al consultar pedido.';
      setTrackingError(msg);
      setTrackingData(null);
    } finally {
      setTrackingLoading(false);
    }
  };

  const handleTrackingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleExecuteTracking(trackingQuery);
  };

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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-12">
      {/* Breadcrumb */}
      <nav aria-label="Ruta de navegación" className="flex items-center gap-2 text-xs text-gray-500">
        <Link href="/" className="hover:text-blue-600 transition-colors">
          Inicio
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">Carrito de Compras y Seguimiento</span>
      </nav>

      {/* Cabecera Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Carrito de Repuestos y Seguimiento
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Revisa tus repuestos seleccionados, consulta compras realizadas o rastrea tus entregas en tiempo real.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="#rastreo"
            className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50/50 px-3 py-1.5 transition-colors"
          >
            <Icon name="search" className="w-3.5 h-3.5" />
            Rastrear Pedido Realizado
          </a>

          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 cursor-pointer rounded-lg border border-red-100 bg-red-50/40 px-3 py-1.5 transition-colors"
            >
              <Icon name="trash" className="w-3.5 h-3.5" />
              Vaciar Carrito
            </button>
          )}
        </div>
      </div>

      {/* BANNER DE ÚLTIMO PEDIDO REALIZADO EN ESTE DISPOSITIVO */}
      {recentOrder && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-blue-700 bg-white border border-blue-200 px-2.5 py-0.5 rounded-md">
                Tu Pedido Reciente: {recentOrder.orderNumber}
              </span>
              <span className="rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5">
                Pago Confirmado (Culqi)
              </span>
            </div>
            <p className="text-xs text-gray-600">
              Registrado el{' '}
              {new Date(recentOrder.date).toLocaleDateString('es-PE', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
              {' '}• Total: <strong className="text-gray-900">{formatCurrency(recentOrder.total, 'PEN')}</strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                setTrackingQuery(recentOrder.orderNumber);
                handleExecuteTracking(recentOrder.orderNumber);
                const el = document.getElementById('rastreo');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3.5 py-2 text-xs transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Icon name="search" className="w-3.5 h-3.5 text-white" />
              Rastrear en Vivo
            </button>

            <Link
              href={
                recentOrder.guestToken
                  ? `/pedido/${recentOrder.id}?token=${recentOrder.guestToken}`
                  : `/pedido/${recentOrder.id}`
              }
              className="rounded-lg bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-semibold px-3.5 py-2 text-xs transition-colors shadow-xs flex items-center gap-1"
            >
              Ver Comprobante Oficial →
            </Link>
          </div>
        </div>
      )}

      {/* SECCIÓN DEL CARRITO ACTUAL */}
      {items.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center max-w-xl mx-auto space-y-4 shadow-xs">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gray-50 text-blue-600 mx-auto border border-gray-200">
            <Icon name="cart" className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Tu carrito está vacío</h2>
          <p className="text-xs text-gray-500 leading-relaxed max-w-md mx-auto">
            Aún no has agregado repuestos nuevos. Puedes explorar nuestro catálogo con stock propio en Lima o consultar el estado de tus pedidos existentes ingresando tu código abajo.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center">
            <Link
              href="/#catalogo"
              className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 text-xs transition-colors shadow-xs"
            >
              Ver Repuestos en Catálogo
            </Link>
            <a
              href="#rastreo"
              className="rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold px-4 py-2 text-xs transition-colors border border-gray-200 shadow-xs"
            >
              Rastrear Pedido Realizado ↓
            </a>
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
                          <span>
                            Unitario: <strong className="text-gray-800">{formatCurrency(item.price, item.currency)}</strong>
                          </span>
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
                Continuar al Checkout Seguro →
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

      {/* SECCIÓN DE SEGUIMIENTO Y RASTREO DE PEDIDO */}
      <section id="rastreo" className="scroll-mt-12 rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
        <div className="border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider">
            <Icon name="search" className="w-4 h-4" />
            <span>Módulo de Trazabilidad Oficial</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
            Seguimiento de Pedido en Tiempo Real
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Consulta el estado de preparación, empaque y despacho ingresando tu código de compra (Ej: <strong className="text-gray-800">MS-2026-10001</strong>) o tu correo electrónico (Ej: <strong className="text-gray-800">review@culqi.com</strong>).
          </p>
        </div>

        {/* Buscador de Pedido */}
        <form onSubmit={handleTrackingSubmit} className="flex flex-col sm:flex-row gap-3 max-w-2xl">
          <div className="relative flex-1">
            <input
              type="text"
              value={trackingQuery}
              onChange={(e) => setTrackingQuery(e.target.value)}
              placeholder="Ingresa tu código de orden o correo..."
              className="w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-2.5 text-xs text-gray-900 font-mono placeholder-gray-400 focus:outline-none focus:border-blue-600 focus:bg-white shadow-xs"
            />
          </div>
          <button
            type="submit"
            disabled={trackingLoading || !trackingQuery.trim()}
            className="rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold px-6 py-2.5 text-xs transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
          >
            {trackingLoading ? (
              <>
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-r-transparent"></div>
                <span>Buscando...</span>
              </>
            ) : (
              <>
                <Icon name="search" className="w-3.5 h-3.5" />
                <span>Rastrear Pedido</span>
              </>
            )}
          </button>
        </form>

        {/* Error en consulta */}
        {trackingError && (
          <div className="rounded-xl border border-red-200 bg-red-50/60 p-4 text-xs text-red-700 flex items-start gap-3">
            <Icon name="alert-circle" className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
            <div>
              <p className="font-semibold">{trackingError}</p>
              <p className="mt-1 text-red-600">
                Verifica que el código coincida exactamente con el de tu comprobante o correo registrado.
              </p>
            </div>
          </div>
        )}

        {/* Resultado del Rastrear Pedido */}
        {trackingData && (
          <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-5 sm:p-6 space-y-6">
            {/* Cabecera del Pedido */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-blue-600 uppercase">
                    Código de Orden
                  </span>
                  <span className="rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5">
                    Pago: {trackingData.paymentStatus.toUpperCase()} (Culqi)
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-gray-900 mt-0.5">
                  {trackingData.orderNumber}
                </h3>
                <p className="text-xs text-gray-500">
                  Registrado el {new Date(trackingData.createdAt).toLocaleDateString('es-PE', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-xs rounded-xl bg-blue-100 text-blue-800 px-3 py-1.5 font-bold">
                  Estado: {trackingData.orderStatus.replace('_', ' ').toUpperCase()}
                </span>
                <Link
                  href={`/pedido/${trackingData.id}`}
                  className="text-xs rounded-xl bg-white border border-gray-300 text-gray-800 px-3 py-1.5 font-semibold hover:bg-gray-100 transition-colors shadow-xs"
                >
                  Ver Comprobante Oficial →
                </Link>
              </div>
            </div>

            {/* Línea de tiempo de progreso */}
            <div>
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-4">
                Progreso del Envío y Entrega
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                {trackingData.timelineSteps.map((step, idx) => {
                  const isDone = step.status === 'completed';
                  const isCur = step.status === 'current';

                  return (
                    <div
                      key={step.key}
                      className={`rounded-xl border p-4 transition-all ${
                        isCur
                          ? 'border-blue-500 bg-blue-50/60 shadow-xs'
                          : isDone
                          ? 'border-emerald-300 bg-emerald-50/40'
                          : 'border-gray-200 bg-white opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                            isDone
                              ? 'bg-emerald-600 text-white'
                              : isCur
                              ? 'bg-blue-600 text-white animate-pulse'
                              : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {isDone ? '✓' : idx + 1}
                        </span>
                        <span className="text-xs font-bold text-gray-900">{step.label}</span>
                      </div>
                      <p className="mt-2 text-[11px] text-gray-600 leading-snug">
                        {step.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Datos de Despacho y Productos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-2 text-xs">
                <span className="font-bold text-gray-900 block border-b border-gray-100 pb-1.5">
                  Información de Entrega
                </span>
                <div className="text-gray-600 space-y-1">
                  <p>
                    <strong className="text-gray-800">Destinatario:</strong> {trackingData.customerNameMasked}
                  </p>
                  <p>
                    <strong className="text-gray-800">Correo Notificación:</strong> {trackingData.customerEmailMasked}
                  </p>
                  <p>
                    <strong className="text-gray-800">Modalidad:</strong>{' '}
                    {trackingData.deliveryMethod === 'recojo_tienda' ? 'Recojo en Almacén Central Lima' : 'Despacho a Domicilio'}
                  </p>
                  <p>
                    <strong className="text-gray-800">Ubicación:</strong>{' '}
                    {trackingData.shippingAddressMasked} ({trackingData.district}, {trackingData.province})
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-2 text-xs">
                <span className="font-bold text-gray-900 block border-b border-gray-100 pb-1.5">
                  Repuestos Incluidos ({trackingData.items.length})
                </span>
                <div className="space-y-2 max-h-36 overflow-y-auto">
                  {trackingData.items.map((it) => (
                    <div key={it.sku} className="flex justify-between items-center text-gray-700 text-xs">
                      <span className="truncate pr-2">
                        {it.quantity}x {it.name}
                      </span>
                      <span className="font-bold text-gray-900 whitespace-nowrap">
                        {formatCurrency(it.subtotal, trackingData.currency)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-gray-900 text-xs">
                  <span>Total Pagado</span>
                  <span className="text-blue-600">{formatCurrency(trackingData.total, trackingData.currency)}</span>
                </div>
              </div>
            </div>

            {/* Asistencia Directa */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-gray-200 text-xs">
              <span className="text-gray-600">
                ¿Tienes dudas técnicas o necesitas coordinar el horario de recepción?
              </span>
              <div className="flex gap-2">
                <a
                  href={trackingData.supportWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 text-xs transition-colors shadow-xs flex items-center gap-1.5"
                >
                  <Icon name="chat" className="w-3.5 h-3.5" />
                  Coordinar por WhatsApp
                </a>
                <button
                  type="button"
                  onClick={() => {
                    setTrackingData(null);
                    setTrackingQuery('');
                  }}
                  className="rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 font-semibold px-3 py-2 text-xs transition-colors"
                >
                  Cerrar Consulta
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
