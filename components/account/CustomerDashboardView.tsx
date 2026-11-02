'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AuthAccount, CustomerVehicle } from '@/types';
import { ProfileCard } from './ProfileCard';
import { Icon } from '../ui/Icons';
import { formatCurrency } from '../../lib/formatters.js';

export interface CustomerOrderSummary {
  id_pedido: string;
  numero_pedido: string;
  total: number | string;
  moneda: string;
  estado_pedido: string;
  estado_pago: string;
  created_at: string;
}

interface CustomerDashboardProps {
  account: AuthAccount;
  initialVehicles: CustomerVehicle[];
  initialOrders: CustomerOrderSummary[];
}

export function CustomerDashboardView({
  account,
  initialVehicles,
  initialOrders,
}: CustomerDashboardProps) {
  const [activeTab, setActiveTab] = useState<'perfil' | 'vehiculos' | 'pedidos' | 'voltia'>('perfil');
  const [vehicles, setVehicles] = useState<CustomerVehicle[]>(initialVehicles);
  const [orders] = useState<CustomerOrderSummary[]>(initialOrders);

  // Formulario nuevo vehículo
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [vehicleBrand, setVehicleBrand] = useState('TAILG');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleYear, setVehicleYear] = useState('2024');
  const [vehicleVoltage, setVehicleVoltage] = useState('72');
  const [vehicleChemistry, setVehicleChemistry] = useState('Litio NMC');
  const [vehicleNotes, setVehicleNotes] = useState('');
  const [isSavingVehicle, setIsSavingVehicle] = useState(false);

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingVehicle(true);
    try {
      const res = await fetch('/api/cuenta/vehiculos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand: vehicleBrand,
          model: vehicleModel,
          year: parseInt(vehicleYear, 10),
          nominalVoltageV: parseFloat(vehicleVoltage),
          batteryChemistry: vehicleChemistry,
          notes: vehicleNotes,
        }),
      });

      const data = await res.json();
      if (res.ok && data.vehicle) {
        setVehicles([data.vehicle, ...vehicles]);
        setShowAddVehicle(false);
        setVehicleModel('');
        setVehicleNotes('');
      }
    } catch (err) {
      console.error('Error guardando vehículo:', err);
    } finally {
      setIsSavingVehicle(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Navegación por pestañas unificada con alto contraste */}
      <div className="flex border-b border-slate-200 text-xs sm:text-sm font-semibold gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('perfil')}
          className={`py-3 px-4 border-b-2 rounded-t-xl transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'perfil'
              ? 'border-slate-900 text-slate-900 bg-slate-100/70 font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Icon name="user" className="w-4 h-4" />
          <span>Mi Perfil</span>
        </button>

        <button
          onClick={() => setActiveTab('vehiculos')}
          className={`py-3 px-4 border-b-2 rounded-t-xl transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'vehiculos'
              ? 'border-slate-900 text-slate-900 bg-slate-100/70 font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Icon name="zap" className="w-4 h-4" />
          <span>Mis Vehículos ({vehicles.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('pedidos')}
          className={`py-3 px-4 border-b-2 rounded-t-xl transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'pedidos'
              ? 'border-slate-900 text-slate-900 bg-slate-100/70 font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Icon name="cart" className="w-4 h-4" />
          <span>Historial de Pedidos ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('voltia')}
          className={`py-3 px-4 border-b-2 rounded-t-xl transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'voltia'
              ? 'border-slate-900 text-slate-900 bg-slate-100/70 font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Icon name="circuit" className="w-4 h-4" />
          <span>Diagnósticos VoltIA</span>
        </button>
      </div>

      {/* Contenido según pestaña */}
      {activeTab === 'perfil' && <ProfileCard account={account} />}

      {/* Pestaña: Mis Vehículos */}
      {activeTab === 'vehiculos' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">Mis Motos Eléctricas Registradas</h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Registra tu vehículo para recibir diagnósticos de VoltIA y recomendaciones exactas de voltaje y compatibilidad.
              </p>
            </div>

            <button
              onClick={() => setShowAddVehicle(!showAddVehicle)}
              className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 text-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto shadow-2xs cursor-pointer"
            >
              <Icon name="plus" className="w-4 h-4" />
              <span>{showAddVehicle ? 'Cancelar' : 'Registrar Moto'}</span>
            </button>
          </div>

          {showAddVehicle && (
            <form onSubmit={handleAddVehicle} className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 max-w-xl text-xs shadow-xs">
              <h3 className="text-sm font-extrabold text-slate-900">Datos de la Moto Eléctrica</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Marca *</label>
                  <select
                    value={vehicleBrand}
                    onChange={(e) => setVehicleBrand(e.target.value)}
                    className="w-full rounded-xl bg-white border border-slate-300 px-3 py-2 text-slate-900 focus:border-slate-900 focus:outline-none"
                  >
                    <option value="TAILG">TAILG</option>
                    <option value="YADEA">YADEA</option>
                    <option value="KAYENCORP">KAYENCORP</option>
                    <option value="GREENLINE">GREENLINE</option>
                    <option value="NIU">NIU</option>
                    <option value="SUPER_SOCO">Super Soco</option>
                    <option value="OTRA">Otra / Multimarca</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">Modelo *</label>
                  <input
                    type="text"
                    required
                    value={vehicleModel}
                    onChange={(e) => setVehicleModel(e.target.value)}
                    placeholder="Ej: Lion, G5 Pro, Tiger"
                    className="w-full rounded-xl bg-white border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">Año Comercial</label>
                  <input
                    type="number"
                    value={vehicleYear}
                    onChange={(e) => setVehicleYear(e.target.value)}
                    className="w-full rounded-xl bg-white border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">Tensión Operativa (V)</label>
                  <select
                    value={vehicleVoltage}
                    onChange={(e) => setVehicleVoltage(e.target.value)}
                    className="w-full rounded-xl bg-white border border-slate-300 px-3 py-2 text-slate-900 focus:border-slate-900 focus:outline-none"
                  >
                    <option value="48">48V</option>
                    <option value="60">60V</option>
                    <option value="72">72V</option>
                    <option value="84">84V</option>
                    <option value="96">96V</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-slate-700 font-bold block mb-1">Química de Batería</label>
                  <select
                    value={vehicleChemistry}
                    onChange={(e) => setVehicleChemistry(e.target.value)}
                    className="w-full rounded-xl bg-white border border-slate-300 px-3 py-2 text-slate-900 focus:border-slate-900 focus:outline-none"
                  >
                    <option value="Litio NMC">Litio NMC (Ternario)</option>
                    <option value="Litio LiFePO4">Litio LiFePO4 (Fosfato de Hierro)</option>
                    <option value="Plomo-Gel (Graphene)">Plomo-Gel / Grafeno</option>
                    <option value="Desconocida">No declarada</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-slate-700 font-bold block mb-1">Notas técnicas adicionales</label>
                  <input
                    type="text"
                    value={vehicleNotes}
                    onChange={(e) => setVehicleNotes(e.target.value)}
                    placeholder="Ej: Conector Anderson, controlador modificado 45A"
                    className="w-full rounded-xl bg-white border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSavingVehicle}
                className="rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold px-4 py-2 shadow-2xs transition-colors cursor-pointer"
              >
                {isSavingVehicle ? 'Guardando...' : 'Guardar Moto'}
              </button>
            </form>
          )}

          {vehicles.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600 space-y-2 shadow-xs">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-700 mx-auto">
                <Icon name="circuit" className="w-6 h-6" />
              </div>
              <p className="font-bold text-slate-900 text-sm">No tienes motos registradas</p>
              <p className="text-xs text-slate-600">
                Haz clic en «Registrar Moto» para asociar tu vehículo eléctrico y consultar repuestos compatibles.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vehicles.map((v) => (
                <div key={v.id} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-slate-100 text-slate-900 border border-slate-200 text-[10px] font-bold px-2 py-0.5">
                      {v.brand}
                    </span>
                    <span className="text-xs font-bold text-slate-900 font-mono">{v.nominalVoltageV}V</span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{v.model}</h3>
                    <p className="text-xs text-slate-600 mt-0.5">{v.year ? `Año ${v.year}` : 'Año no declarado'} • {v.batteryChemistry}</p>
                  </div>
                  {v.notes && (
                    <p className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      {v.notes}
                    </p>
                  )}
                  <Link
                    href="/#compatibilidad"
                    className="block text-center rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-900 font-bold py-2 text-xs transition-colors border border-slate-200"
                  >
                    Ver Repuestos Compatibles →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Pestaña: Historial de Pedidos */}
      {activeTab === 'pedidos' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Historial de Compras</h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Consulta el estado de preparación, pago y comprobantes fiscales de tus pedidos.
            </p>
          </div>

          {orders.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600 space-y-2 shadow-xs">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-700 mx-auto">
                <Icon name="cart" className="w-6 h-6" />
              </div>
              <p className="font-bold text-slate-900 text-sm">No registras compras en tu cuenta</p>
              <p className="text-xs text-slate-600">
                Cuando realices un pedido con tu cuenta iniciada, aparecerá detallado aquí.
              </p>
              <Link
                href="/#catalogo"
                className="inline-block rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 text-xs transition-colors shadow-2xs mt-2"
              >
                Explorar Repuestos
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
              {orders.map((o) => (
                <div key={o.id_pedido} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs hover:bg-slate-50/60 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold font-mono text-slate-900 text-sm">{o.numero_pedido}</span>
                      <span className="rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-0.5">
                        {o.estado_pago.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-slate-600">
                      Fecha: {new Date(o.created_at).toLocaleDateString('es-PE')} • Estado: {o.estado_pedido}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-base font-black font-mono text-slate-900">
                      {formatCurrency(Number(o.total), o.moneda || 'PEN')}
                    </span>
                    <Link
                      href={`/pedido/${o.id_pedido}`}
                      className="rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold px-3.5 py-1.5 transition-colors shadow-2xs"
                    >
                      Ver Detalle →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Pestaña: Diagnósticos VoltIA */}
      {activeTab === 'voltia' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Asistencias y Diagnósticos de VoltIA</h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Registro de evaluaciones técnicas y solicitudes de soporte en taller para tu motocicleta.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3 shadow-xs">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-900 border border-slate-200">
                <Icon name="circuit" className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">VoltIA está disponible las 24 horas</h3>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                  Puedes abrir el widget flotante en la esquina inferior derecha para iniciar una nueva consulta técnica con diagnóstico asistido.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
