import React from 'react';
import Link from 'next/link';
import { getOrderSecurely } from '../../../lib/orders/order-service';
import { getServerAuthUser, getUserRole } from '../../../lib/auth/server';
import { Icon } from '../../../components/ui/Icons';
import { formatCurrency } from '../../../lib/formatters.js';
import { OrderVoltIAButton } from '../../../components/orders/OrderVoltIAButton';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
}

export default async function OrderDetailPage({ params, searchParams }: PageProps) {
  const { id: orderId } = await params;
  const { token: guestToken } = await searchParams;

  const { user } = await getServerAuthUser();
  const userId = user ? user.id : null;
  const role = userId ? await getUserRole(userId) : null;
  const isAdmin = role === 'admin';

  // Obtener pedido con verificación estricta de autorización en el servidor
  const order = await getOrderSecurely({
    orderId,
    guestToken,
    authenticatedUserId: userId,
    isAdmin,
  });

  if (!order) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center space-y-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-950/80 border border-rose-700 text-rose-300 mx-auto shadow-md">
          <Icon name="alert-circle" className="w-8 h-8 stroke-[2.5]" />
        </div>
        <h1 className="text-2xl font-black text-white">Acceso no autorizado al pedido</h1>
        <p className="text-sm text-slate-200 leading-relaxed max-w-md mx-auto">
          No tienes permisos para consultar esta orden o el enlace seguro ha expirado. Si eres un comprador invitado, asegúrate de acceder utilizando el enlace completo que te proporcionó el sistema.
        </p>
        <div className="pt-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-bold px-5 py-2.5 text-xs transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            Volver a la Tienda
          </Link>
        </div>
      </div>
    );
  }

  // Mapeo de estados del pedido (Trazabilidad en 4 fases)
  const steps = [
    { key: 'confirmado', label: 'Pago Confirmado' },
    { key: 'en_preparacion', label: 'En Preparación' },
    { key: 'despachado', label: order.deliveryMethod === 'recojo_tienda' ? 'Listo para Recojo' : 'En Tránsito' },
    { key: 'entregado', label: 'Completado / Entregado' },
  ];

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'confirmado':
        return 0;
      case 'en_preparacion':
        return 1;
      case 'despachado':
        return 2;
      case 'entregado':
        return 3;
      default:
        return -1;
    }
  };

  const currentStepIdx = getStepIndex(order.orderStatus);
  const progressPercent = Math.max(0, Math.min(100, (currentStepIdx / 3) * 100));

  const itemsSummary = (order.items || []).map((i) => i.name).join(', ');

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Breadcrumb con alto contraste */}
      <nav aria-label="Ruta de navegación" className="flex items-center gap-2 text-xs text-slate-300">
        <Link
          href="/"
          className="hover:text-cyan-300 transition-colors font-semibold text-slate-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-300 rounded px-1"
        >
          Inicio
        </Link>
        <span className="text-slate-500 font-bold">/</span>
        <span className="text-white font-bold tracking-tight">Pedido {order.orderNumber}</span>
      </nav>

      {/* Cabecera del Pedido */}
      <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 sm:p-8 space-y-6 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-xs font-mono text-cyan-300 font-bold uppercase tracking-wider bg-cyan-950/90 border border-cyan-700/80 px-2.5 py-0.5 rounded-md shadow-2xs">
                Orden Oficial
              </span>
              {order.isGuest ? (
                <span className="text-xs font-semibold rounded-md bg-slate-900 border border-slate-700 px-2.5 py-0.5 text-slate-200">
                  Compra como Invitado
                </span>
              ) : (
                <span className="text-xs font-bold rounded-md bg-cyan-950 border border-cyan-600 px-2.5 py-0.5 text-cyan-200">
                  Cliente Registrado
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {order.orderNumber}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium">
              Registrado el{' '}
              <span className="text-slate-100 font-semibold">
                {new Date(order.createdAt).toLocaleDateString('es-PE', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 items-center">
            <span className="inline-flex items-center gap-1.5 text-xs rounded-xl bg-emerald-950 border border-emerald-500/70 px-3.5 py-2 font-bold text-emerald-200 shadow-xs">
              <Icon name="check-circle" className="w-3.5 h-3.5 text-emerald-400 stroke-[2.5]" />
              <span>Pago: {order.paymentStatus.toUpperCase()}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2 font-bold text-white shadow-xs">
              <Icon name="package" className="w-3.5 h-3.5 text-cyan-400 stroke-[2.5]" />
              <span>Estado: {order.orderStatus.replace('_', ' ').toUpperCase()}</span>
            </span>
          </div>
        </div>

        {/* Barra de Progreso del Pedido (Accesible, Multimodal y de Alto Contraste) */}
        {order.orderStatus !== 'cancelado' && (
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-4 sm:p-6 my-4">
            <div className="relative flex items-center justify-between">
              {/* Línea base de fondo */}
              <div className="absolute top-1/2 left-0 right-0 h-1.5 bg-slate-800 -translate-y-1/2 z-0 rounded-full" />
              {/* Línea activa rellena según el progreso */}
              <div
                className="absolute top-1/2 left-0 h-1.5 bg-gradient-to-r from-emerald-500 to-cyan-400 -translate-y-1/2 z-0 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />

              {steps.map((step, idx) => {
                const isPassed = currentStepIdx > idx;
                const isCurrent = currentStepIdx === idx;

                let circleClass = '';
                let labelClass = '';
                let badgeText = 'Pendiente';
                let badgeClass = 'text-[10px] font-medium text-slate-400 mt-1';

                if (isPassed) {
                  circleClass = 'border-2 border-emerald-400 bg-emerald-500 text-slate-950 shadow-md';
                  labelClass = 'text-emerald-300 font-bold';
                  badgeText = 'Completado';
                  badgeClass = 'text-[10px] font-bold text-emerald-300 bg-emerald-950 border border-emerald-700 px-1.5 py-0.2 rounded mt-1 shadow-2xs';
                } else if (isCurrent) {
                  circleClass = 'border-2 border-cyan-200 bg-cyan-400 text-slate-950 font-black ring-4 ring-cyan-500/30 shadow-lg scale-105';
                  labelClass = 'text-cyan-200 font-extrabold tracking-wide';
                  badgeText = 'En curso';
                  badgeClass = 'text-[10px] font-black text-slate-950 bg-cyan-300 px-2 py-0.5 rounded-full mt-1 shadow-2xs';
                } else {
                  circleClass = 'border-2 border-slate-700 bg-slate-900 text-slate-300 font-bold';
                  labelClass = 'text-slate-300 font-medium';
                  badgeText = 'Pendiente';
                  badgeClass = 'text-[10px] font-medium text-slate-400 mt-1';
                }

                return (
                  <div key={step.key} className="relative z-10 flex flex-col items-center">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full text-xs transition-all ${circleClass}`}
                    >
                      {isPassed ? (
                        <Icon name="check" className="w-4 h-4 stroke-[3]" />
                      ) : (
                        <span className="font-black">{idx + 1}</span>
                      )}
                    </div>
                    <span className={`mt-2 text-[11px] sm:text-xs text-center max-w-[90px] sm:max-w-none ${labelClass}`}>
                      {step.label}
                    </span>
                    <span className={badgeClass}>{badgeText}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Información en Cuadrícula (Alto Contraste y Separación Visual Clara) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-slate-800 text-xs">
          <div className="space-y-1.5 sm:border-r border-slate-800/80 sm:pr-4">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-cyan-300">
              <Icon name="user" className="w-3.5 h-3.5 text-cyan-400" />
              <span>Destinatario</span>
            </div>
            <p className="font-extrabold text-white text-sm">{order.customerName}</p>
            <p className="text-slate-200 font-medium break-all">{order.customerEmail}</p>
            {order.customerPhone && (
              <p className="text-slate-200 font-medium flex items-center gap-1">
                <span>📞</span>
                <span>{order.customerPhone}</span>
              </p>
            )}
          </div>

          <div className="space-y-1.5 sm:border-r border-slate-800/80 sm:pr-4">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-cyan-300">
              <Icon name="truck" className="w-3.5 h-3.5 text-cyan-400" />
              <span>Entrega</span>
            </div>
            <p className="font-extrabold text-white text-sm">
              {order.deliveryMethod === 'recojo_tienda' ? 'Recojo en Almacén' : 'Envío a Domicilio'}
            </p>
            <p className="text-slate-200 font-medium">
              {order.shippingAddress || 'Almacén Central NeroElectric Motors'}
            </p>
            <p className="text-slate-300 font-semibold">
              {order.district}, {order.province}
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-cyan-300">
              <Icon name="file-text" className="w-3.5 h-3.5 text-cyan-400" />
              <span>Comprobante SUNAT</span>
            </div>
            <p className="font-extrabold text-white text-sm">
              {order.invoiceType === 'factura' ? 'Factura Comercial' : 'Boleta de Venta'}
            </p>
            <p className="text-slate-200 font-mono font-semibold">Doc: {order.docNumber}</p>
            {order.docBusinessName && (
              <p className="text-slate-200 font-medium">{order.docBusinessName}</p>
            )}
            <div className="pt-1">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-200 bg-cyan-950 border border-cyan-700/80 px-2 py-0.5 rounded shadow-2xs">
                Estado: {order.documentStatus.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Detalle de Productos Comprados */}
      <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 sm:p-8 space-y-5 shadow-md">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
            Productos Comprados (Snapshot Oficial)
          </h2>
          <span className="text-xs font-bold text-slate-200 bg-slate-900 border border-slate-700 px-2.5 py-1 rounded-lg">
            {(order.items || []).length} ítem{(order.items || []).length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="divide-y divide-slate-800">
          {(order.items || []).map((item) => (
            <div key={item.id} className="py-4 flex items-center justify-between gap-4 text-xs">
              <div className="space-y-1">
                <span className="font-mono text-cyan-300 text-xs font-bold bg-cyan-950/90 border border-cyan-800/80 px-2 py-0.5 rounded inline-block">
                  SKU: {item.sku}
                </span>
                <h3 className="font-bold text-white text-sm sm:text-base mt-1">{item.name}</h3>
                <p className="text-xs text-slate-200 font-medium">
                  Cantidad: <strong className="text-white font-bold">{item.quantity}</strong> ×{' '}
                  {formatCurrency(item.unitPrice, order.currency)}
                </p>
              </div>
              <span className="font-black text-white text-base sm:text-lg tracking-tight shrink-0">
                {formatCurrency(item.subtotal, order.currency)}
              </span>
            </div>
          ))}
        </div>

        {/* Desglose de Totales con Alta Legibilidad */}
        <div className="border-t-2 border-slate-800 pt-4 space-y-2.5 text-xs sm:text-sm bg-slate-900/50 p-4 sm:p-5 rounded-2xl border border-slate-800">
          <div className="flex justify-between items-center text-slate-200">
            <span className="font-semibold">Subtotal</span>
            <span className="text-white font-bold text-sm">
              {formatCurrency(order.subtotal, order.currency)}
            </span>
          </div>

          {order.discount > 0 && (
            <div className="flex justify-between items-center text-emerald-300 font-bold">
              <span>Descuento aplicado ({order.couponCode || 'Cupón'})</span>
              <span className="font-black text-sm">
                -{formatCurrency(order.discount, order.currency)}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center text-slate-200">
            <span className="font-semibold">Costo de Despacho</span>
            <span className={`font-bold text-sm ${order.shippingCost === 0 ? 'text-emerald-300' : 'text-white'}`}>
              {order.shippingCost === 0 ? 'Gratis' : formatCurrency(order.shippingCost, order.currency)}
            </span>
          </div>

          <div className="border-t border-slate-700/80 pt-3.5 flex justify-between items-baseline text-sm sm:text-base font-extrabold text-white">
            <span className="tracking-tight">Total Pagado (Inc. IGV)</span>
            <span className="text-2xl sm:text-3xl font-black text-cyan-300 tracking-tight">
              {formatCurrency(order.total, order.currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Asistencia Técnica Post-Venta y VoltIA (Diseño con Alto Contraste y Botón Accesible) */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950 border-2 border-cyan-600/60 p-6 sm:p-7 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-xl shadow-cyan-950/30">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-950 border border-cyan-500/50 text-cyan-300 shadow-md">
            <Icon name="circuit" className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div className="space-y-1">
            <h3 className="font-black text-white text-base sm:text-lg tracking-tight">
              ¿Dudas con la instalación o compatibilidad?
            </h3>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
              Nuestro asistente inteligente VoltIA y el equipo de soporte técnico oficial están listos para asistirte las 24 horas.
            </p>
          </div>
        </div>

        <OrderVoltIAButton orderNumber={order.orderNumber} itemsSummary={itemsSummary} />
      </div>
    </div>
  );
}
