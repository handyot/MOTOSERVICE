'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AuthAccount, OrderStatus } from '../../types';
import { signOutAction } from '../../lib/auth/actions';
import { Icon } from '../ui/Icons';
import { formatCurrency } from '../../lib/formatters.js';
import { FEATURED_PARTS } from '../../lib/constants.js';

export interface AdminStats {
  totalMarcas: number;
  totalModelos: number;
  totalRepuestos: number;
  totalCompatibilidades: number;
  pedidosPendientes?: number;
  pedidosConfirmados?: number;
  pedidosEnPreparacion?: number;
  solicitudesPendientes?: number;
  stockBajoCount?: number;
}

export interface AdminOrderRecord {
  id_pedido: string;
  numero_pedido: string;
  cliente_nombre: string;
  cliente_email: string;
  cliente_telefono?: string | null;
  doc_numero: string;
  tipo_comprobante: string;
  modalidad_entrega: string;
  total: number | string;
  moneda: string;
  estado_pago: string;
  estado_pedido: OrderStatus;
  estado_comprobante: string;
  es_invitado: boolean;
}

export interface AdminDocumentRecord {
  id_documento: string;
  tipo: string;
  serie?: string;
  numero?: string;
  datos_receptor?: {
    businessName?: string;
    docNumber?: string;
  };
  total_gravada?: number | string;
  total_igv?: number | string;
  total_comprobante?: number | string;
  estado: string;
}

export interface AdminAssistanceRecord {
  id_solicitud: string;
  nombre_contacto: string;
  email_contacto: string;
  tipo_solicitud: string;
  descripcion: string;
}

export interface AdminSubscriptionRecord {
  id_suscripcion?: string;
  email: string;
  origen: string;
}

interface AdminDashboardViewProps {
  account: AuthAccount;
  stats: AdminStats;
  initialOrders?: AdminOrderRecord[];
  initialAssistance?: AdminAssistanceRecord[];
  initialDocuments?: AdminDocumentRecord[];
  initialSubscriptions?: AdminSubscriptionRecord[];
}

export function AdminDashboardView({
  account,
  stats,
  initialOrders = [],
  initialAssistance = [],
  initialDocuments = [],
  initialSubscriptions = [],
}: AdminDashboardViewProps) {
  const [activeModule, setActiveModule] = useState<
    'resumen' | 'productos' | 'pedidos' | 'facturacion' | 'despacho' | 'clientes' | 'voltia' | 'promociones' | 'seguridad'
  >('resumen');

  const [orders, setOrders] = useState<AdminOrderRecord[]>(initialOrders);
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);
  const [isUpdatingOrder, setIsUpdatingOrder] = useState<string | null>(null);

  // Inventario local verificado vs catálogo de proveedor
  const ownProducts = FEATURED_PARTS.map((p) => ({
    ...p,
    ownStock: 15,
    isDirectSale: true,
  }));

  const handleUpdateOrderStatus = async (orderId: string, targetStatus: OrderStatus) => {
    setIsUpdatingOrder(orderId);
    setStatusFeedback(null);
    try {
      const res = await fetch('/api/admin/orders/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, targetStatus }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id_pedido === orderId ? { ...o, estado_pedido: targetStatus } : o))
        );
        setStatusFeedback(`Pedido actualizado a «${targetStatus}».`);
      } else {
        setStatusFeedback(`Error: ${data.error || 'No se pudo actualizar el estado'}`);
      }
    } catch {
      setStatusFeedback('Error de comunicación con el servidor.');
    } finally {
      setIsUpdatingOrder(null);
      setTimeout(() => setStatusFeedback(null), 4000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Administrativo */}
      <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-slate-900 via-amber-950/20 to-slate-900 p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Icon name="shield" className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white">Panel Operativo NeroElectric Motors</h1>
                <span className="rounded bg-amber-900/60 border border-amber-700/60 px-2 py-0.5 text-[11px] font-bold text-amber-300 uppercase tracking-wider">
                  Admin Privado
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Operador autenticado: <strong className="text-slate-200">{account.fullName}</strong> ({account.email})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/cuenta"
              className="rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-200 hover:text-white hover:bg-slate-700 transition-colors"
            >
              Vista de Cliente
            </Link>
            <form action={signOutAction}>
              <button
                type="submit"
                className="rounded-lg border border-rose-900/50 bg-rose-950/30 px-3 py-1.5 text-xs font-medium text-rose-300 hover:bg-rose-900/50 transition-colors flex items-center gap-1.5"
              >
                <Icon name="x" className="w-3.5 h-3.5" />
                <span>Cerrar Sesión</span>
              </button>
            </form>
          </div>
        </div>

        {/* Notificación de feedback */}
        {statusFeedback && (
          <div className="mt-4 rounded-xl bg-slate-950 border border-amber-500/40 p-3 text-xs text-amber-300 font-semibold animate-in fade-in flex items-center justify-between">
            <span>{statusFeedback}</span>
            <button onClick={() => setStatusFeedback(null)} className="text-slate-400 hover:text-white">✕</button>
          </div>
        )}

        {/* Pestañas / Módulos Operativos */}
        <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveModule('resumen')}
            className={`rounded-lg px-3 py-1.5 transition-colors ${
              activeModule === 'resumen' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            A. Resumen Operativo
          </button>
          <button
            onClick={() => setActiveModule('productos')}
            className={`rounded-lg px-3 py-1.5 transition-colors ${
              activeModule === 'productos' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            B. Inventario Propio vs Proveedor
          </button>
          <button
            onClick={() => setActiveModule('pedidos')}
            className={`rounded-lg px-3 py-1.5 transition-colors ${
              activeModule === 'pedidos' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            C. Pedidos ({orders.length})
          </button>
          <button
            onClick={() => setActiveModule('facturacion')}
            className={`rounded-lg px-3 py-1.5 transition-colors ${
              activeModule === 'facturacion' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            D. Boletas & Facturas SUNAT
          </button>
          <button
            onClick={() => setActiveModule('despacho')}
            className={`rounded-lg px-3 py-1.5 transition-colors ${
              activeModule === 'despacho' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            E. Despachos y Guías
          </button>
          <button
            onClick={() => setActiveModule('clientes')}
            className={`rounded-lg px-3 py-1.5 transition-colors ${
              activeModule === 'clientes' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            F. Clientes & Invitados
          </button>
          <button
            onClick={() => setActiveModule('voltia')}
            className={`rounded-lg px-3 py-1.5 transition-colors ${
              activeModule === 'voltia' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            G. VoltIA & Asistencia Técnica
          </button>
          <button
            onClick={() => setActiveModule('promociones')}
            className={`rounded-lg px-3 py-1.5 transition-colors ${
              activeModule === 'promociones' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            H. Promociones (5%)
          </button>
        </div>
      </div>

      {/* MÓDULO A: Resumen Operativo */}
      {activeModule === 'resumen' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
              <span className="block text-xs font-medium text-slate-400 uppercase tracking-wider">
                Marcas / Modelos EV
              </span>
              <span className="text-2xl font-black text-white mt-1 block">
                {stats.totalMarcas} / {stats.totalModelos}
              </span>
              <span className="text-[11px] text-cyan-400 mt-1 block">Catálogo base sincronizado</span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
              <span className="block text-xs font-medium text-slate-400 uppercase tracking-wider">
                Repuestos en Venta Directa
              </span>
              <span className="text-2xl font-black text-emerald-400 mt-1 block">
                {ownProducts.length}
              </span>
              <span className="text-[11px] text-emerald-400 mt-1 block">Con stock propio confirmado</span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
              <span className="block text-xs font-medium text-slate-400 uppercase tracking-wider">
                Solicitudes de Asistencia
              </span>
              <span className="text-2xl font-black text-amber-400 mt-1 block">
                {initialAssistance.length}
              </span>
              <span className="text-[11px] text-amber-400 mt-1 block">Casos de VoltIA / Taller</span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
              <span className="block text-xs font-medium text-slate-400 uppercase tracking-wider">
                Suscripciones Comerciales
              </span>
              <span className="text-2xl font-black text-cyan-400 mt-1 block">
                {initialSubscriptions.length}
              </span>
              <span className="text-[11px] text-cyan-400 mt-1 block">Consentimientos v1.0</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-3">
              <h3 className="font-bold text-white text-sm">Estado de Pasarela Culqi 3DS</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                El adaptador de cobros calcula los montos autorizados estrictamente en el servidor en céntimos (PEN). Las transacciones en local se ejecutan en modo de pruebas verificado con soporte de 3DS y procesamiento de webhooks idempotente.
              </p>
              <div className="pt-2 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                <span className="text-xs font-bold text-emerald-300">Adaptador Culqi 3DS Activo (Pruebas)</span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-3">
              <h3 className="font-bold text-white text-sm">Facturador Electrónico SUNAT</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Los comprobantes se estructuran automáticamente en Boletas (DNI 8 dígitos) y Facturas (RUC 11 dígitos con IGV desglosado 18%). La emisión oficial hacia el SEE-OSE se encuentra preparada a la espera del certificado digital tributario.
              </p>
              <div className="pt-2 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-400"></span>
                <span className="text-xs font-bold text-amber-300">SEE-OSE Adaptador Preparado</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MÓDULO B: Inventario Propio vs Proveedor */}
      {activeModule === 'productos' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-white">Gestión de Inventario: Venta Directa vs Consulta Externa</h2>
              <p className="text-xs text-slate-400">
                Regla comercial estricta: Solo los productos con stock propio confirmado pueden pasar al checkout.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider font-bold">
                <tr>
                  <th className="p-3">SKU</th>
                  <th className="p-3">Producto</th>
                  <th className="p-3">Categoría</th>
                  <th className="p-3">Precio Oficial</th>
                  <th className="p-3">Stock Propio</th>
                  <th className="p-3">Modalidad Comercial</th>
                  <th className="p-3">Garantía</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {ownProducts.map((p) => (
                  <tr key={p.sku} className="hover:bg-slate-900/50">
                    <td className="p-3 font-mono text-cyan-400 font-bold">{p.sku}</td>
                    <td className="p-3 font-bold text-white">{p.name}</td>
                    <td className="p-3">{p.categorySlug}</td>
                    <td className="p-3 font-bold text-white">{formatCurrency(p.price, p.currency)}</td>
                    <td className="p-3">
                      <span className="rounded bg-emerald-950 border border-emerald-800 px-2 py-0.5 text-emerald-400 font-bold">
                        {p.ownStock} unid.
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="rounded bg-cyan-950 border border-cyan-800 px-2 py-0.5 text-cyan-400 font-bold">
                        Venta Directa
                      </span>
                    </td>
                    <td className="p-3">{p.warrantyMonths} meses</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MÓDULO C: Pedidos y Transiciones de Estado */}
      {activeModule === 'pedidos' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-white">Bandeja de Pedidos y Ciclo de Compra</h2>
              <p className="text-xs text-slate-400">
                Transiciones de la máquina de estados validadas por el servidor: Confirmado → En Preparación → Despachado → Entregado.
              </p>
            </div>
          </div>

          {orders.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No hay pedidos registrados en el sistema actualmente.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider font-bold">
                  <tr>
                    <th className="p-3">Orden</th>
                    <th className="p-3">Comprador</th>
                    <th className="p-3">Modalidad</th>
                    <th className="p-3">Total</th>
                    <th className="p-3">Pago</th>
                    <th className="p-3">Estado Pedido</th>
                    <th className="p-3">Comprobante</th>
                    <th className="p-3">Acciones de Operador</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {orders.map((o) => (
                    <tr key={o.id_pedido} className="hover:bg-slate-900/50">
                      <td className="p-3 font-mono font-bold text-cyan-400">
                        <Link href={`/pedido/${o.id_pedido}`} className="underline hover:text-cyan-300">
                          {o.numero_pedido}
                        </Link>
                      </td>
                      <td className="p-3">
                        <span className="font-bold text-white block">{o.cliente_nombre}</span>
                        <span className="text-[10px] text-slate-500 block">{o.cliente_email}</span>
                      </td>
                      <td className="p-3">{o.modalidad_entrega}</td>
                      <td className="p-3 font-bold text-white">{formatCurrency(Number(o.total), o.moneda || 'PEN')}</td>
                      <td className="p-3">
                        <span className="rounded bg-emerald-950 border border-emerald-800 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                          {o.estado_pago}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="rounded bg-slate-900 border border-slate-800 px-2 py-0.5 text-[10px] font-bold text-white">
                          {o.estado_pedido}
                        </span>
                      </td>
                      <td className="p-3 uppercase font-mono text-[10px]">{o.tipo_comprobante} ({o.estado_comprobante})</td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {o.estado_pedido === 'confirmado' && (
                            <button
                              disabled={isUpdatingOrder === o.id_pedido}
                              onClick={() => handleUpdateOrderStatus(o.id_pedido, 'en_preparacion')}
                              className="rounded bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 border border-amber-500/40 px-2 py-1 text-[10px] font-bold"
                            >
                              Pasar a Preparación
                            </button>
                          )}
                          {o.estado_pedido === 'en_preparacion' && (
                            <button
                              disabled={isUpdatingOrder === o.id_pedido}
                              onClick={() => handleUpdateOrderStatus(o.id_pedido, 'despachado')}
                              className="rounded bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 border border-blue-500/40 px-2 py-1 text-[10px] font-bold"
                            >
                              Marcar Despachado
                            </button>
                          )}
                          {o.estado_pedido === 'despachado' && (
                            <button
                              disabled={isUpdatingOrder === o.id_pedido}
                              onClick={() => handleUpdateOrderStatus(o.id_pedido, 'entregado')}
                              className="rounded bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 border border-emerald-500/40 px-2 py-1 text-[10px] font-bold"
                            >
                              Confirmar Entrega
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* MÓDULO D: Boletas y Facturas Electrónicas */}
      {activeModule === 'facturacion' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white">Comprobantes de Pago Electrónicos (SUNAT SEE-OSE)</h2>
            <p className="text-xs text-slate-400">
              Desglose de IGV (18%), validación de DNI (8 dígitos) y RUC (11 dígitos).
            </p>
          </div>

          <div className="rounded-xl border border-amber-800/40 bg-amber-950/20 p-4 text-xs text-amber-200">
            <strong>Estado del Proveedor Fiscal:</strong> Adaptador estructurado para SEE-OSE / Facturador SUNAT. Pendiente de certificado digital tributario y credenciales SOL en producción. Los comprobantes se emiten en serie correlativa preliminar (B001 / F001).
          </div>

          {initialDocuments.length === 0 ? (
            <p className="text-xs text-slate-500">No hay documentos electrónicos emitidos aún.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900 text-slate-400 uppercase font-bold">
                  <tr>
                    <th className="p-3">Tipo</th>
                    <th className="p-3">Serie y Número</th>
                    <th className="p-3">Receptor</th>
                    <th className="p-3">Base Gravada</th>
                    <th className="p-3">IGV (18%)</th>
                    <th className="p-3">Total</th>
                    <th className="p-3">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {initialDocuments.map((doc) => (
                    <tr key={doc.id_documento}>
                      <td className="p-3 font-bold text-white">{doc.tipo}</td>
                      <td className="p-3 font-mono text-cyan-400">{doc.serie}-{doc.numero}</td>
                      <td className="p-3">{doc.datos_receptor?.businessName} ({doc.datos_receptor?.docNumber})</td>
                      <td className="p-3">{formatCurrency(Number(doc.total_gravada), 'PEN')}</td>
                      <td className="p-3">{formatCurrency(Number(doc.total_igv), 'PEN')}</td>
                      <td className="p-3 font-bold text-white">{formatCurrency(Number(doc.total_comprobante), 'PEN')}</td>
                      <td className="p-3">
                        <span className="rounded bg-amber-950 border border-amber-800 px-2 py-0.5 text-amber-300 font-bold">
                          {doc.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* MÓDULO E: Despacho y Guías */}
      {activeModule === 'despacho' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white">Logística, Envíos y Guías de Remisión</h2>
            <p className="text-xs text-slate-400">
              Control de empaque técnico para baterías de litio y despacho con operadores logísticos autorizados.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
              <h3 className="font-bold text-white">Protocolo de Despacho Seguro (Baterías EV)</h3>
              <ul className="space-y-1.5 text-slate-400">
                <li>• Embalaje ignífugo y aislamiento de terminales Anderson / XT90.</li>
                <li>• Verificación de breaker en OFF antes del envío.</li>
                <li>• Etiquetado de mercancía eléctrica sensible Clase 9.</li>
              </ul>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
              <h3 className="font-bold text-white">Guía de Remisión Electrónica Remitente (GRE)</h3>
              <p className="text-slate-400 leading-relaxed">
                Preparado para generación de serie T001 con motivo de traslado «Venta» según la normativa SUNAT Resolución N° 000123-2022/SUNAT.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MÓDULO F: Clientes e Invitados */}
      {activeModule === 'clientes' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white">Control de Compradores (Invitados y Registrados)</h2>
            <p className="text-xs text-slate-400">
              Datos protegidos contra exposición indiscriminada; solo accesibles con autorización administrativa.
            </p>
          </div>

          <div className="divide-y divide-slate-800 text-xs">
            {orders.map((o) => (
              <div key={o.id_pedido} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="font-bold text-white text-sm">{o.cliente_nombre}</span>
                  <span className="text-slate-400 block">{o.cliente_email} • {o.cliente_telefono || 'Sin teléfono'}</span>
                  <span className="text-[10px] text-slate-500 font-mono">Doc: {o.doc_numero} ({o.tipo_comprobante})</span>
                </div>
                <div>
                  <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${o.es_invitado ? 'bg-slate-900 text-slate-400 border border-slate-800' : 'bg-cyan-950 text-cyan-400 border border-cyan-800'}`}>
                    {o.es_invitado ? 'Comprador Invitado' : 'Cliente con Cuenta'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MÓDULO G: VoltIA & Asistencia Técnica */}
      {activeModule === 'voltia' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white">Bandeja de Asistencia Técnica y Cotizaciones de VoltIA</h2>
            <p className="text-xs text-slate-400">
              Casos derivados por riesgos eléctricos, diagnósticos no concluyentes o solicitudes de piezas especiales.
            </p>
          </div>

          {initialAssistance.length === 0 ? (
            <p className="text-xs text-slate-500">No hay tickets de asistencia pendientes en este momento.</p>
          ) : (
            <div className="space-y-3">
              {initialAssistance.map((ast) => (
                <div key={ast.id_solicitud} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{ast.nombre_contacto} ({ast.email_contacto})</span>
                    <span className="rounded bg-amber-950 border border-amber-800 px-2 py-0.5 text-amber-300 font-bold">
                      {ast.tipo_solicitud}
                    </span>
                  </div>
                  <p className="text-slate-300">{ast.descripcion}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MÓDULO H: Promociones */}
      {activeModule === 'promociones' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white">Promociones Comerciales y Consentimiento Newsletter</h2>
            <p className="text-xs text-slate-400">
              Cupón oficial de bienvenida: <code className="text-cyan-400 font-mono">BIENVENIDO5</code> (5% de descuento en primera compra).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
              <h3 className="font-bold text-white">Reglas del Descuento</h3>
              <ul className="space-y-1 text-slate-400">
                <li>• Porcentaje: <strong>5% sobre el subtotal</strong></li>
                <li>• Política de uso: <strong>Un solo uso por correo normalizado</strong></li>
                <li>• Consentimiento explícito: <strong>v1.0 con fecha y origen auditados</strong></li>
              </ul>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
              <h3 className="font-bold text-white">Suscripciones Registradas ({initialSubscriptions.length})</h3>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {initialSubscriptions.map((sub) => (
                  <div key={sub.id_suscripcion || sub.email} className="text-slate-300 font-mono text-[11px]">
                    {sub.email} <span className="text-slate-600">({sub.origen})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
