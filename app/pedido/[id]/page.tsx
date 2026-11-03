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
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-950/80 border border-rose-600 text-rose-300 mx-auto shadow-md">
          <Icon name="alert-circle" className="w-8 h-8 stroke-[2.5]" />
        </div>
        <h1 className="text-2xl font-black text-white">Acceso no autorizado al pedido</h1>
        <p className="text-sm text-slate-100 leading-relaxed max-w-md mx-auto">
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

  // Estilos accesibles para el estado de pago
  const isPaid = order.paymentStatus === 'pagado';
  const paymentBadgeClass = isPaid
    ? 'bg-emerald-950 border border-emerald-500/80 text-emerald-200'
    : 'bg-amber-950 border border-amber-500/80 text-amber-200';
  const paymentIconClass = isPaid ? 'text-emerald-400' : 'text-amber-400';

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Breadcrumb con alto contraste */}
      <nav aria-label="Ruta de navegación" className="flex items-center gap-2 text-xs text-slate-300">
        <Link
          href="/"
          className="hover:text-cyan-300 transition-colors font-semibold text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 rounded px-1"
        >
          Inicio
        </Link>
        <span className="text-slate-400 font-bold" aria-hidden="true">/</span>
        <span className="text-white font-bold tracking-tight">Pedido {order.orderNumber}</span>
      </nav>

      {/* Alerta si el pedido está cancelado */}
      {order.orderStatus === 'cancelado' && (
        <div className="rounded-2xl border-2 border-rose-600 bg-rose-950/80 p-5 flex items-center gap-4 text-rose-100 shadow-md">
          <Icon name="alert-circle" className="w-6 h-6 text-rose-300 shrink-0 stroke-[2.5]" />
          <div>
            <h2 className="font-extrabold text-white text-base">Este pedido ha sido cancelado</h2>
            <p className="text-xs text-rose-200 mt-0.5">
              Si tienes preguntas sobre la anulación o el reembolso de tu compra, puedes comunicarte con nuestro equipo técnico.
            </p>
          </div>
        </div>
      )}

      {/* Cabecera Principal del Pedido */}
      <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 sm:p-8 space-y-6 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-b border-slate-800 pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-xs font-mono text-cyan-200 font-bold uppercase tracking-wider bg-cyan-950 border border-cyan-600/90 px-3 py-1 rounded-lg shadow-2xs">
                Orden Oficial NERO
              </span>
              {order.isGuest ? (
                <span className="text-xs font-bold rounded-lg bg-slate-900 border border-slate-600 px-3 py-1 text-slate-100">
                  Compra como Invitado
                </span>
              ) : (
                <span className="text-xs font-bold rounded-lg bg-cyan-950 border border-cyan-500 px-3 py-1 text-cyan-200">
                  Cliente Registrado
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              {order.orderNumber}
            </h1>

            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-300 font-medium">
              <Icon name="calendar" className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>
                Registrado el{' '}
                <strong className="text-slate-100 font-bold">
                  {new Date(order.createdAt).toLocaleDateString('es-PE', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </strong>
              </span>
            </div>
          </div>

          <div className="flex flex-wrap sm:flex-col lg:flex-row gap-2.5 items-start sm:items-end lg:items-center">
            <span className={`inline-flex items-center gap-2 text-xs rounded-xl px-3.5 py-2 font-bold shadow-xs ${paymentBadgeClass}`}>
              <Icon name="check-circle" className={`w-4 h-4 ${paymentIconClass} stroke-[2.5]`} />
              <span>Pago: {order.paymentStatus.toUpperCase()}</span>
            </span>

            <span className="inline-flex items-center gap-2 text-xs rounded-xl bg-slate-900 border border-cyan-700/80 px-3.5 py-2 font-bold text-white shadow-xs">
              <Icon name="package" className="w-4 h-4 text-cyan-400 stroke-[2.5]" />
              <span>Estado: {order.orderStatus.replace('_', ' ').toUpperCase()}</span>
            </span>
          </div>
        </div>

        {/* Barra de Progreso del Pedido (Accesible, Multimodal y de Alto Contraste) */}
        {order.orderStatus !== 'cancelado' && (
          <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-5 sm:p-7">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-2">
                <Icon name="truck" className="w-4 h-4 text-cyan-400" />
                <span>Progreso del Despacho</span>
              </h2>
              <span className="text-xs font-semibold text-slate-300">
                Fase {Math.max(1, currentStepIdx + 1)} de {steps.length}
              </span>
            </div>

            <div className="relative pt-2 pb-1">
              {/* Línea base conectora de fondo - alineada verticalmente con los centros de los círculos (top-5) */}
              <div className="absolute top-7 left-6 right-6 sm:left-10 sm:right-10 h-1.5 bg-slate-800 -translate-y-1/2 z-0 rounded-full" />
              {/* Línea activa rellena según el progreso */}
              <div
                className="absolute top-7 left-6 right-6 sm:left-10 sm:right-10 h-1.5 -translate-y-1/2 z-0 rounded-full"
                aria-hidden="true"
              >
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full transition-all duration-500 shadow-sm shadow-cyan-400/50"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Contenedor de las 4 etapas */}
              <div className="relative z-10 grid grid-cols-4 gap-1 sm:gap-2">
                {steps.map((step, idx) => {
                  const isPassed = currentStepIdx > idx;
                  const isCurrent = currentStepIdx === idx;

                  let circleClass = '';
                  let labelClass = '';
                  let badgeText = 'Pendiente';
                  let badgeClass = '';

                  if (isPassed) {
                    circleClass = 'border-2 border-emerald-400 bg-emerald-500 text-slate-950 shadow-md shadow-emerald-950/40';
                    labelClass = 'text-emerald-300 font-bold';
                    badgeText = 'Completado';
                    badgeClass = 'bg-emerald-950 border border-emerald-500 text-emerald-200 font-extrabold';
                  } else if (isCurrent) {
                    circleClass = 'border-2 border-cyan-200 bg-cyan-400 text-slate-950 font-black ring-4 ring-cyan-400/40 shadow-lg shadow-cyan-950/50 scale-105';
                    labelClass = 'text-cyan-200 font-extrabold tracking-wide';
                    badgeText = 'En curso';
                    badgeClass = 'bg-cyan-300 text-slate-950 font-black shadow-md';
                  } else {
                    circleClass = 'border-2 border-slate-600 bg-slate-900 text-slate-200 font-bold';
                    labelClass = 'text-slate-300 font-medium';
                    badgeText = 'Pendiente';
                    badgeClass = 'bg-slate-800 border border-slate-600 text-slate-200 font-bold';
                  }

                  return (
                    <div key={step.key} className="flex flex-col items-center text-center">
                      {/* Indicador circular con número o check */}
                      <div
                        className={`flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full text-xs sm:text-sm transition-all ${circleClass}`}
                        aria-current={isCurrent ? 'step' : undefined}
                      >
                        {isPassed ? (
                          <Icon name="check" className="w-5 h-5 stroke-[3]" />
                        ) : (
                          <span className="font-black">{idx + 1}</span>
                        )}
                      </div>

                      {/* Título de la etapa con alto contraste */}
                      <span className={`mt-2.5 text-[11px] sm:text-xs leading-tight max-w-[85px] sm:max-w-[130px] ${labelClass}`}>
                        {step.label}
                      </span>

                      {/* Badge multimodal explícito (texto + estilo reforzado) */}
                      <span className={`mt-1.5 text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${badgeClass}`}>
                        {isPassed && <span aria-hidden="true">✓</span>}
                        {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-slate-950 inline-block animate-pulse" aria-hidden="true" />}
                        <span>{badgeText}</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Información en Cuadrícula (Alto Contraste y Separación Visual Clara) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-6 border-t border-slate-800">
          {/* Tarjeta Destinatario */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-300">
                <Icon name="user" className="w-4 h-4" />
              </div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-300">Destinatario</h2>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-[11px] font-bold uppercase text-slate-300 tracking-wider">Nombre del Comprador</p>
                <p className="font-extrabold text-white text-base mt-0.5">{order.customerName}</p>
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase text-slate-300 tracking-wider">Correo Electrónico</p>
                <div className="mt-1 flex items-center gap-2 bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2">
                  <Icon name="mail" className="w-4 h-4 text-cyan-400 shrink-0" />
                  <p className="text-slate-100 font-semibold text-xs break-all">{order.customerEmail}</p>
                </div>
              </div>

              {order.customerPhone && (
                <div>
                  <p className="text-[11px] font-bold uppercase text-slate-300 tracking-wider">Teléfono de Contacto</p>
                  <div className="mt-1 flex items-center gap-2 bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2">
                    <Icon name="phone" className="w-4 h-4 text-cyan-400 shrink-0" />
                    <p className="text-slate-100 font-semibold text-xs">{order.customerPhone}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tarjeta Entrega */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-300">
                <Icon name="truck" className="w-4 h-4" />
              </div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-300">Entrega</h2>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-[11px] font-bold uppercase text-slate-300 tracking-wider">Modalidad</p>
                <div className="mt-1">
                  <span className="inline-flex items-center gap-1.5 text-xs font-black text-white bg-slate-800 border border-slate-600 px-3 py-1 rounded-lg">
                    {order.deliveryMethod === 'recojo_tienda' ? 'Recojo en Almacén' : 'Envío a Domicilio'}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase text-slate-300 tracking-wider">Dirección de Entrega</p>
                <div className="mt-1 bg-slate-950/80 border border-slate-800 rounded-lg p-2.5">
                  <p className="text-slate-100 font-semibold text-xs leading-relaxed">
                    {order.shippingAddress || 'Almacén Central NeroElectric Motors'}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase text-slate-300 tracking-wider">Ubicación</p>
                <div className="mt-1 flex items-center gap-1.5">
                  <Icon name="map-pin" className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <p className="text-cyan-200 font-bold text-xs">
                    {order.district}, {order.province}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tarjeta Comprobante SUNAT */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-300">
                <Icon name="file-text" className="w-4 h-4" />
              </div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-300">Comprobante SUNAT</h2>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-[11px] font-bold uppercase text-slate-300 tracking-wider">Tipo de Comprobante</p>
                <p className="font-extrabold text-white text-base mt-0.5">
                  {order.invoiceType === 'factura' ? 'Factura Comercial' : 'Boleta de Venta'}
                </p>
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase text-slate-300 tracking-wider">Número de Documento</p>
                <div className="mt-1">
                  <span className="font-mono font-bold text-white text-xs bg-slate-950 border border-slate-700 px-2.5 py-1 rounded-md inline-block">
                    Doc: {order.docNumber}
                  </span>
                </div>
              </div>

              {order.docBusinessName && (
                <div>
                  <p className="text-[11px] font-bold uppercase text-slate-300 tracking-wider">Razón Social</p>
                  <p className="text-slate-100 font-semibold text-xs mt-0.5">{order.docBusinessName}</p>
                </div>
              )}

              <div className="pt-1">
                <p className="text-[11px] font-bold uppercase text-slate-300 tracking-wider mb-1">Estado Fiscal</p>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-200 bg-cyan-950 border border-cyan-600 px-3 py-1 rounded-md shadow-2xs">
                  <Icon name="check-circle" className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Estado: {order.documentStatus.toUpperCase()}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detalle de Productos Comprados */}
      <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 sm:p-8 space-y-6 shadow-md">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h2 className="text-base sm:text-lg lg:text-xl font-extrabold text-white tracking-tight">
            Productos Comprados (Snapshot Oficial)
          </h2>
          <span className="text-xs font-bold text-slate-100 bg-slate-900 border border-slate-700 px-3 py-1 rounded-lg">
            {(order.items || []).length} ítem{(order.items || []).length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Lista de Productos con alta separación visual */}
        <div className="space-y-3.5">
          {(order.items || []).map((item) => (
            <div
              key={item.id}
              className="rounded-2xl bg-slate-900/60 border border-slate-800/90 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors hover:border-slate-700"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-cyan-200 text-xs font-bold bg-cyan-950 border border-cyan-600 px-2.5 py-0.5 rounded-md inline-block shadow-2xs">
                    SKU: {item.sku}
                  </span>
                </div>
                <h3 className="font-bold text-white text-base sm:text-lg leading-snug">{item.name}</h3>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-200">
                  <span className="text-slate-300 font-medium">Cantidad:</span>
                  <span className="bg-slate-800 border border-slate-600 text-white font-extrabold px-2 py-0.5 rounded text-xs">
                    {item.quantity}
                  </span>
                  <span className="text-slate-400" aria-hidden="true">×</span>
                  <span className="text-slate-100 font-bold">
                    {formatCurrency(item.unitPrice, order.currency)} c/u
                  </span>
                </div>
              </div>

              <div className="text-left sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800 flex sm:flex-col justify-between sm:justify-center items-center sm:items-end">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 sm:hidden">
                  Importe:
                </span>
                <span className="font-black text-white text-base sm:text-lg lg:text-xl tracking-tight">
                  {formatCurrency(item.subtotal, order.currency)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Desglose de Totales con Alta Legibilidad */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 sm:p-6 rounded-2xl space-y-3.5">
          <div className="flex justify-between items-center text-slate-200 text-xs sm:text-sm">
            <span className="font-semibold text-slate-200">Subtotal</span>
            <span className="text-white font-bold text-sm sm:text-base">
              {formatCurrency(order.subtotal, order.currency)}
            </span>
          </div>

          {order.discount > 0 && (
            <div className="flex justify-between items-center text-emerald-300 text-xs sm:text-sm font-bold">
              <span>Descuento aplicado ({order.couponCode || 'Cupón'})</span>
              <span className="font-black text-sm sm:text-base">
                -{formatCurrency(order.discount, order.currency)}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center text-slate-200 text-xs sm:text-sm">
            <span className="font-semibold text-slate-200">Costo de Despacho</span>
            <span className={`font-bold text-sm sm:text-base ${order.shippingCost === 0 ? 'text-emerald-300' : 'text-white'}`}>
              {order.shippingCost === 0 ? (
                <span className="bg-emerald-950 border border-emerald-500 text-emerald-200 font-bold px-2 py-0.5 rounded text-xs">
                  Gratis
                </span>
              ) : (
                formatCurrency(order.shippingCost, order.currency)
              )}
            </span>
          </div>

          <div className="border-t-2 border-slate-800 pt-4 mt-2 bg-gradient-to-r from-slate-950 via-cyan-950/20 to-slate-950 p-4 sm:p-5 rounded-xl border border-cyan-800/70 flex flex-col sm:flex-row justify-between items-start sm:items-baseline gap-2">
            <span className="text-sm sm:text-base lg:text-lg font-extrabold text-white tracking-tight">
              Total Pagado (Inc. IGV)
            </span>
            <span className="text-2xl sm:text-3xl font-black text-cyan-300 tracking-tight font-mono">
              {formatCurrency(order.total, order.currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Asistencia Técnica Post-Venta y VoltIA (Diseño con Alto Contraste y Botón Accesible) */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/80 border-2 border-cyan-500/70 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl shadow-cyan-950/40">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-cyan-950 border border-cyan-500 text-cyan-300 shadow-md">
            <Icon name="circuit" className="w-7 h-7 stroke-[2.5]" />
          </div>
          <div className="space-y-1.5">
            <h3 className="font-black text-white text-base sm:text-lg lg:text-xl tracking-tight">
              ¿Dudas con la instalación o compatibilidad?
            </h3>
            <p className="text-xs sm:text-sm lg:text-base text-slate-100 leading-relaxed font-normal">
              Nuestro asistente inteligente VoltIA y el equipo de soporte técnico oficial están listos para asistirte las 24 horas.
            </p>
          </div>
        </div>

        <OrderVoltIAButton orderNumber={order.orderNumber} itemsSummary={itemsSummary} />
      </div>
    </div>
  );
}
