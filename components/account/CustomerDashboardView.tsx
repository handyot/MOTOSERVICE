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
      {/* Navegación por pestañas */}
      <div className="flex border-b border-slate-800 text-xs sm:text-sm font-bold gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('perfil')}
          className={`py-3 px-4 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'perfil'
              ? 'border-cyan-400 text-cyan-400 bg-cyan-950/20'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Icon name="user" className="w-4 h-4" />
          Mi Perfil
        </button>

        <button
          onClick={() => setActiveTab('vehiculos')}
          className={`py-3 px-4 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'vehiculos'
              ? 'border-cyan-400 text-cyan-400 bg-cyan-950/20'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Icon name="zap" className="w-4 h-4" />
          Mis Vehículos ({vehicles.length})
        </button>

        <button
          onClick={() => setActiveTab('pedidos')}
          className={`py-3 px-4 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'pedidos'
              ? 'border-cyan-400 text-cyan-400 bg-cyan-950/20'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Icon name="cart" className="w-4 h-4" />
          Historial de Pedidos ({orders.length})
        </button>

        <button
          onClick={() => setActiveTab('voltia')}
          className={`py-3 px-4 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'voltia'
              ? 'border-cyan-400 text-cyan-400 bg-cyan-950/20'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Icon name="circuit" className="w-4 h-4" />
          Diagnósticos VoltIA
        </button>
      </div>

      {/* Contenido según pestaña */}
      {activeTab === 'perfil' && <ProfileCard account={account} />}

      {/* Pestaña: Mis Vehículos */}
      {activeTab === 'vehiculos' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white">Mis Motos Eléctricas Registradas</h2>
              <p className="text-xs text-slate-400 mt-1">
                Registra tu vehículo para recibir diagnósticos de VoltIA y recomendaciones exactas de voltaje y compatibilidad.
              </p>
            </div>

            <button
              onClick={() => setShowAddVehicle(!showAddVehicle)}
              className="rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-4 py-2 text-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Icon name="plus" className="w-4 h-4" />
              {showAddVehicle ? 'Cancelar' : 'Registrar Moto'}
            </button>
          </div>

          {showAddVehicle && (
            <form onSubmit={handleAddVehicle} className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 space-y-4 max-w-xl text-xs">
              <h3 className="text-sm font-bold text-white">Datos de la Moto Eléctrica</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Marca *</label>
                  <select
                    value={vehicleBrand}
                    onChange={(e) => setVehicleBrand(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white"
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
                  <label className="text-slate-400 block mb-1">Modelo *</label>
                  <input
                    type="text"
                    required
                    value={vehicleModel}
                    onChange={(e) => setVehicleModel(e.target.value)}
                    placeholder="Ej: Lion, G5 Pro, Tiger"
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Año Comercial</label>
                  <input
                    type="number"
                    value={vehicleYear}
                    onChange={(e) => setVehicleYear(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Tensión Operativa (V)</label>
                  <select
                    value={vehicleVoltage}
                    onChange={(e) => setVehicleVoltage(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white"
                  >
                    <option value="48">48V</option>
                    <option value="60">60V</option>
                    <option value="72">72V</option>
                    <option value="84">84V</option>
                    <option value="96">96V</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-slate-400 block mb-1">Química de Batería</label>
                  <select
                    value={vehicleChemistry}
                    onChange={(e) => setVehicleChemistry(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white"
                  >
                    <option value="Litio NMC">Litio NMC (Ternario)</option>
                    <option value="Litio LiFePO4">Litio LiFePO4 (Fosfato de Hierro)</option>
                    <option value="Plomo-Gel (Graphene)">Plomo-Gel / Grafeno</option>
                    <option value="Desconocida">No declarada</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-slate-400 block mb-1">Notas técnicas adicionales</label>
                  <input
                    type="text"
                    value={vehicleNotes}
                    onChange={(e) => setVehicleNotes(e.target.value)}
                    placeholder="Ej: Conector Anderson, controlador modificado 45A"
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSavingVehicle}
                className="rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold px-4 py-2"
              >
                {isSavingVehicle ? 'Guardando...' : 'Guardar Moto'}
              </button>
            </form>
          )}

          {vehicles.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-8 text-center text-slate-400 space-y-2">
              <Icon name="circuit" className="w-8 h-8 text-cyan-400 mx-auto" />
              <p className="font-bold text-white text-sm">No tienes motos registradas</p>
              <p className="text-xs">
                Haz clic en «Registrar Moto» para asociar tu vehículo eléctrico y consultar repuestos compatibles.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vehicles.map((v) => (
                <div key={v.id} className="rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="rounded bg-cyan-950 text-cyan-400 border border-cyan-800 text-[10px] font-bold px-2 py-0.5">
                      {v.brand}
                    </span>
                    <span className="text-xs font-bold text-white">{v.nominalVoltageV}V</span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{v.model}</h3>
                    <p className="text-xs text-slate-400">{v.year ? `Año ${v.year}` : 'Año no declarado'} • {v.batteryChemistry}</p>
                  </div>
                  {v.notes && (
                    <p className="text-[11px] text-slate-500 bg-slate-900 p-2 rounded-lg border border-slate-800">
                      {v.notes}
                    </p>
                  )}
                  <Link
                    href="/#compatibilidad"
                    className="block text-center rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-400 font-bold py-2 text-xs transition-colors border border-slate-800"
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
            <h2 className="text-xl font-bold text-white">Historial de Compras</h2>
            <p className="text-xs text-slate-400 mt-1">
              Consulta el estado de preparación, pago y comprobantes fiscales de tus pedidos.
            </p>
          </div>

          {orders.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-8 text-center text-slate-400 space-y-2">
              <Icon name="cart" className="w-8 h-8 text-cyan-400 mx-auto" />
              <p className="font-bold text-white text-sm">No registras compras en tu cuenta</p>
              <p className="text-xs">
                Cuando realices un pedido con tu cuenta iniciada, aparecerá detallado aquí.
              </p>
              <Link
                href="/#catalogo"
                className="inline-block rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-4 py-2 text-xs transition-colors mt-2"
              >
                Explorar Repuestos
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-800 rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden">
              {orders.map((o) => (
                <div key={o.id_pedido} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{o.numero_pedido}</span>
                      <span className="rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold px-2 py-0.5">
                        {o.estado_pago.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-slate-400">
                      Fecha: {new Date(o.created_at).toLocaleDateString('es-PE')} • Estado: {o.estado_pedido}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-base font-black text-cyan-400">
                      {formatCurrency(Number(o.total), o.moneda || 'PEN')}
                    </span>
                    <Link
                      href={`/pedido/${o.id_pedido}`}
                      className="rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold px-3 py-1.5 transition-colors"
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
            <h2 className="text-xl font-bold text-white">Asistencias y Diagnósticos de VoltIA</h2>
            <p className="text-xs text-slate-400 mt-1">
              Registro de evaluaciones técnicas y solicitudes de soporte en taller para tu motocicleta.
            </p>
          </div>

          <div className="rounded-2xl border border-cyan-800/40 bg-cyan-950/20 p-6 space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400">
                <Icon name="circuit" className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">VoltIA está disponible las 24 horas</h3>
                <p className="text-xs text-slate-400">
                  Puedes abrir el widget flotante en la esquina inferior derecha para iniciar una nueva consulta técnica.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
