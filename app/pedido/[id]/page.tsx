import React from 'react';
import Link from 'next/link';
import { getOrderSecurely } from '../../../lib/orders/order-service';
import { getServerAuthUser, getUserRole } from '../../../lib/auth/server';
import { Icon } from '../../../components/ui/Icons';
import { formatCurrency } from '../../../lib/formatters.js';

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
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-950/60 border border-rose-800/40 text-rose-400 mx-auto">
          <Icon name="alert-circle" className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-white">Acceso no autorizado al pedido</h1>
        <p className="text-sm text-slate-400 leading-relaxed">
          No tienes permisos para consultar esta orden o el enlace seguro ha expirado. Si eres un comprador invitado, asegúrate de acceder utilizando el enlace completo que te proporcionó el sistema.
        </p>
        <div className="pt-2">
          <Link
            href="/"
            className="rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-semibold px-4 py-2 text-xs transition-colors"
          >
            Volver a la Tienda
          </Link>
        </div>
      </div>
    );
  }

  // Mapeo de estados del pedido
  const steps = [
    { key: 'confirmado', label: 'Pago Confirmado' },
    { key: 'en_preparacion', label: 'En Preparación' },
    { key: 'despachado', label: 'Despachado' },
    { key: 'entregado', label: 'Entregado' },
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

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Breadcrumb */}
      <nav aria-label="Ruta de navegación" className="flex items-center gap-2 text-xs text-slate-400">
        <Link href="/" className="hover:text-cyan-400 transition-colors">
          Inicio
        </Link>
        <span>/</span>
        <span className="text-white font-medium">Pedido {order.orderNumber}</span>
      </nav>

      {/* Cabecera del Pedido */}
      <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
                Orden Oficial
              </span>
              {order.isGuest ? (
                <span className="text-[10px] rounded bg-slate-900 border border-slate-800 px-2 py-0.5 text-slate-400">
                  Compra como Invitado
                </span>
              ) : (
                <span className="text-[10px] rounded bg-cyan-950 border border-cyan-800 px-2 py-0.5 text-cyan-400">
                  Cliente Registrado
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              {order.orderNumber}
            </h1>
            <p className="text-xs text-slate-400">
              Registrado el {new Date(order.createdAt).toLocaleDateString('es-PE', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs rounded-xl bg-emerald-950/80 border border-emerald-800 px-3 py-1.5 font-bold text-emerald-300">
              Pago: {order.paymentStatus.toUpperCase()}
            </span>
            <span className="text-xs rounded-xl bg-slate-900 border border-slate-800 px-3 py-1.5 font-bold text-white">
              Estado: {order.orderStatus.replace('_', ' ').toUpperCase()}
            </span>
          </div>
        </div>

        {/* Barra de Progreso del Pedido */}
        {order.orderStatus !== 'cancelado' && (
          <div className="py-2">
            <div className="relative flex items-center justify-between">
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-800 -translate-y-1/2 z-0"></div>
              {steps.map((step, idx) => {
                const isPassed = currentStepIdx >= idx;
                const isCurrent = currentStepIdx === idx;

                return (
                  <div key={step.key} className="relative z-10 flex flex-col items-center">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-all ${
                        isPassed
                          ? 'border-cyan-400 bg-cyan-500 text-slate-950'
                          : 'border-slate-700 bg-slate-900 text-slate-500'
                      }`}
                    >
                      {isPassed ? <Icon name="check" className="w-4 h-4" /> : idx + 1}
                    </div>
                    <span
                      className={`mt-2 text-[10px] sm:text-xs font-semibold text-center ${
                        isCurrent
                          ? 'text-cyan-400 font-bold'
                          : isPassed
                          ? 'text-slate-200'
                          : 'text-slate-500'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Información en Cuadrícula */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-slate-800 text-xs">
          <div className="space-y-1">
            <span className="text-slate-500 uppercase font-semibold">Destinatario</span>
            <p className="font-bold text-white">{order.customerName}</p>
            <p className="text-slate-400">{order.customerEmail}</p>
            {order.customerPhone && <p className="text-slate-400">{order.customerPhone}</p>}
          </div>

          <div className="space-y-1">
            <span className="text-slate-500 uppercase font-semibold">Entrega</span>
            <p className="font-bold text-white">
              {order.deliveryMethod === 'recojo_tienda' ? 'Recojo en Almacén' : 'Envío a Domicilio'}
            </p>
            <p className="text-slate-400">{order.shippingAddress || 'Almacén Central NeroElectric Motors'}</p>
            <p className="text-slate-500">{order.district}, {order.province}</p>
          </div>

          <div className="space-y-1">
            <span className="text-slate-500 uppercase font-semibold">Comprobante SUNAT</span>
            <p className="font-bold text-white">
              {order.invoiceType === 'factura' ? 'Factura Comercial' : 'Boleta de Venta'}
            </p>
            <p className="text-slate-400 font-mono">Doc: {order.docNumber}</p>
            {order.docBusinessName && <p className="text-slate-400">{order.docBusinessName}</p>}
            <p className="text-[11px] text-cyan-400 font-medium">Estado: {order.documentStatus.toUpperCase()}</p>
          </div>
        </div>
      </div>

      {/* Detalle de Productos Comprados */}
      <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 sm:p-8 space-y-4">
        <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3">
          Productos Comprados (Snapshot Oficial)
        </h2>

        <div className="divide-y divide-slate-800/80">
          {(order.items || []).map((item) => (
            <div key={item.id} className="py-3.5 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <span className="font-mono text-cyan-400 text-[10px]">SKU: {item.sku}</span>
                <h3 className="font-bold text-white text-sm">{item.name}</h3>
                <span className="text-slate-400">
                  Cantidad: {item.quantity} × {formatCurrency(item.unitPrice, order.currency)}
                </span>
              </div>
              <span className="font-black text-white text-sm">
                {formatCurrency(item.subtotal, order.currency)}
              </span>
            </div>
          ))}
        </div>

        {/* Desglose de Totales */}
        <div className="border-t border-slate-800 pt-4 space-y-2 text-xs">
          <div className="flex justify-between text-slate-400">
            <span>Subtotal</span>
            <span className="text-white font-bold">{formatCurrency(order.subtotal, order.currency)}</span>
          </div>

          {order.discount > 0 && (
            <div className="flex justify-between text-emerald-400 font-bold">
              <span>Descuento aplicado ({order.couponCode || 'Cupón'})</span>
              <span>-{formatCurrency(order.discount, order.currency)}</span>
            </div>
          )}

          <div className="flex justify-between text-slate-400">
            <span>Costo de Despacho</span>
            <span className="text-white font-bold">
              {order.shippingCost === 0 ? 'Gratis' : formatCurrency(order.shippingCost, order.currency)}
            </span>
          </div>

          <div className="border-t border-slate-800 pt-3 flex justify-between items-baseline text-sm font-black text-white">
            <span>Total Pagado (Inc. IGV)</span>
            <span className="text-xl text-cyan-400">
              {formatCurrency(order.total, order.currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Asistencia Técnica Post-Venta */}
      <div className="rounded-2xl bg-cyan-950/20 border border-cyan-800/40 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="font-bold text-white text-sm">¿Dudas con la instalación o compatibilidad?</h3>
          <p className="text-xs text-slate-400">
            Nuestro asistente inteligente VoltIA y el equipo de soporte técnico están listos para asistirte.
          </p>
        </div>
        <Link
          href="/"
          className="rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-4 py-2 text-xs transition-colors shrink-0"
        >
          Consultar a VoltIA
        </Link>
      </div>
    </div>
  );
}
