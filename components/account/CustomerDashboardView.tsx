'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { AuthAccount, CustomerVehicle } from '@/types';
import { ProfileCard } from './ProfileCard';
import { Icon } from '../ui/Icons';
import { formatCurrency } from '../../lib/formatters.js';
import { getPublicCatalogMotos, OFFICIAL_BRANDS } from '@/data/ecomoto-data';
import { openVoltIAChat } from '../voltia/VoltIAWidget';

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

  // Catálogo oficial para selección progresiva
  const catalogMotos = useMemo(() => getPublicCatalogMotos(), []);
  const availableBrands = useMemo(() => {
    const brandsSet = new Set<string>();
    OFFICIAL_BRANDS.forEach((b) => brandsSet.add(b.name));
    catalogMotos.forEach((m) => brandsSet.add(m.brand));
    return Array.from(brandsSet);
  }, [catalogMotos]);

  // Modal y formulario de registro
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [registrationMode, setRegistrationMode] = useState<'catalogo' | 'personalizado'>('catalogo');
  const [selectedCatalogBrand, setSelectedCatalogBrand] = useState(availableBrands[0] || 'TAILG');
  const [selectedCatalogModel, setSelectedCatalogModel] = useState('');

  // Campos comunes y personalizados
  const [vehicleBrand, setVehicleBrand] = useState('TAILG');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleType, setVehicleType] = useState('moto_electrica');
  const [vehicleYear, setVehicleYear] = useState('2024');
  const [vehicleVoltage, setVehicleVoltage] = useState('72');
  const [vehiclePower, setVehiclePower] = useState('2000');
  const [vehicleChemistry, setVehicleChemistry] = useState('Litio NMC');
  const [vehicleCapacityAh, setVehicleCapacityAh] = useState('');
  const [vehicleNickname, setVehicleNickname] = useState('');
  const [controllerAmps, setControllerAmps] = useState('');
  const [controllerModel, setControllerModel] = useState('');
  const [vehicleNotes, setVehicleNotes] = useState('');

  const [isSavingVehicle, setIsSavingVehicle] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Estado para edición y eliminación
  const [editingVehicle, setEditingVehicle] = useState<CustomerVehicle | null>(null);
  const [deletingVehicleId, setDeletingVehicleId] = useState<string | null>(null);

  // Filtrar modelos del catálogo según la marca seleccionada
  const filteredCatalogModels = useMemo(() => {
    return catalogMotos.filter((m) => m.brand.toUpperCase() === selectedCatalogBrand.toUpperCase());
  }, [catalogMotos, selectedCatalogBrand]);

  // Manejar cambio de marca en modo catálogo
  const handleCatalogBrandChange = (brand: string) => {
    setSelectedCatalogBrand(brand);
    setVehicleBrand(brand);
    const modelsForBrand = catalogMotos.filter((m) => m.brand.toUpperCase() === brand.toUpperCase());
    if (modelsForBrand.length > 0) {
      const first = modelsForBrand[0];
      setSelectedCatalogModel(first.model);
      setVehicleModel(first.model);
      const volt = first.batteryVoltageV || first.batteryVoltage;
      const power = first.motorNominalW || first.motorPower;
      setVehicleVoltage(volt ? String(volt) : '72');
      setVehiclePower(power ? String(power) : '2000');
      setVehicleChemistry(first.batteryChemistry || 'Litio NMC');
    } else {
      setSelectedCatalogModel('');
      setVehicleModel('');
    }
  };

  // Manejar cambio de modelo en modo catálogo (autocompletado)
  const handleCatalogModelChange = (modelName: string) => {
    setSelectedCatalogModel(modelName);
    setVehicleModel(modelName);
    const found = filteredCatalogModels.find((m) => m.model === modelName);
    if (found) {
      const volt = found.batteryVoltageV || found.batteryVoltage;
      const power = found.motorNominalW || found.motorPower;
      setVehicleVoltage(volt ? String(volt) : '72');
      setVehiclePower(power ? String(power) : '2000');
      setVehicleChemistry(found.batteryChemistry || 'Litio NMC');
    }
  };

  const handleOpenAdd = () => {
    setFormError(null);
    setRegistrationMode('catalogo');
    handleCatalogBrandChange(availableBrands[0] || 'TAILG');
    setShowAddVehicle(true);
  };

  const handleSaveVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const b = (registrationMode === 'catalogo' ? selectedCatalogBrand : vehicleBrand).trim();
    const m = (registrationMode === 'catalogo' ? selectedCatalogModel : vehicleModel).trim();

    if (!b || !m) {
      setFormError('La marca y el modelo del vehículo son obligatorios.');
      return;
    }

    const v = vehicleVoltage ? parseFloat(vehicleVoltage) : undefined;
    if (v !== undefined && (isNaN(v) || v < 12 || v > 144)) {
      setFormError('El voltaje debe ser un valor válido entre 12V y 144V.');
      return;
    }

    const w = vehiclePower ? parseFloat(vehiclePower) : undefined;
    if (w !== undefined && (isNaN(w) || w < 100 || w > 50000)) {
      setFormError('La potencia del motor debe estar entre 100W y 50,000W.');
      return;
    }

    setIsSavingVehicle(true);
    try {
      const payload = {
        brand: b,
        model: m,
        vehicleType,
        origin: registrationMode === 'catalogo' ? 'CATALOGO' : 'PERSONALIZADO',
        year: vehicleYear ? parseInt(vehicleYear, 10) : undefined,
        nominalVoltageV: v,
        motorPowerW: w,
        batteryChemistry: vehicleChemistry || undefined,
        capacityAh: vehicleCapacityAh ? parseFloat(vehicleCapacityAh) : undefined,
        customNickname: vehicleNickname.trim() || undefined,
        controllerAmps: controllerAmps ? parseFloat(controllerAmps) : undefined,
        controllerModel: controllerModel.trim() || undefined,
        notes: vehicleNotes.trim() || undefined,
      };

      let res: Response;
      if (editingVehicle) {
        res = await fetch(`/api/cuenta/vehiculos/${editingVehicle.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/cuenta/vehiculos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (res.ok && data.vehicle) {
        if (editingVehicle) {
          setVehicles((prev) => prev.map((item) => (item.id === editingVehicle.id ? data.vehicle : item)));
          setEditingVehicle(null);
        } else {
          setVehicles((prev) => [data.vehicle, ...prev]);
        }
        setShowAddVehicle(false);
        setVehicleNickname('');
        setVehicleNotes('');
        setVehicleCapacityAh('');
        setControllerAmps('');
        setControllerModel('');
      } else {
        setFormError(data.error || 'No se pudo guardar el vehículo.');
      }
    } catch {
      setFormError('Error de comunicación al guardar el vehículo.');
    } finally {
      setIsSavingVehicle(false);
    }
  };

  const handleStartEdit = (veh: CustomerVehicle) => {
    setEditingVehicle(veh);
    setFormError(null);
    setRegistrationMode(veh.origin === 'CATALOGO' ? 'catalogo' : 'personalizado');
    setSelectedCatalogBrand(veh.brand);
    setSelectedCatalogModel(veh.model);
    setVehicleBrand(veh.brand);
    setVehicleModel(veh.model);
    setVehicleType(veh.vehicleType || 'moto_electrica');
    setVehicleYear(veh.year ? String(veh.year) : '2024');
    setVehicleVoltage(veh.nominalVoltageV ? String(veh.nominalVoltageV) : '72');
    setVehiclePower(veh.motorPowerW ? String(veh.motorPowerW) : '2000');
    setVehicleChemistry(veh.batteryChemistry || 'Litio NMC');
    setVehicleCapacityAh(veh.capacityAh ? String(veh.capacityAh) : '');
    setVehicleNickname(veh.customNickname || '');
    setControllerAmps(veh.controllerAmps ? String(veh.controllerAmps) : '');
    setControllerModel(veh.controllerModel || '');
    setVehicleNotes(veh.notes || '');
    setShowAddVehicle(true);
  };

  const handleDeleteVehicle = async (id: string) => {
    setDeletingVehicleId(id);
    try {
      const res = await fetch(`/api/cuenta/vehiculos/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setVehicles((prev) => prev.filter((v) => v.id !== id));
      }
    } catch (err) {
      console.error('Error al eliminar vehículo:', err);
    } finally {
      setDeletingVehicleId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Navegación por pestañas unificada con alto contraste */}
      <div className="flex border-b border-slate-200 text-xs sm:text-sm font-semibold gap-1 overflow-x-auto">
        <button
          type="button"
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
          type="button"
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
          type="button"
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
          type="button"
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
                Registra tu vehículo desde el catálogo o de forma personalizada para obtener repuestos compatibles y diagnósticos en VoltIA.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                if (showAddVehicle) {
                  setShowAddVehicle(false);
                  setEditingVehicle(null);
                } else {
                  handleOpenAdd();
                }
              }}
              className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 text-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto shadow-2xs cursor-pointer"
            >
              <Icon name="plus" className="w-4 h-4" />
              <span>{showAddVehicle ? 'Cancelar Registro' : 'Registrar Moto'}</span>
            </button>
          </div>

          {/* Formulario Modal/In-place con 2 Modalidades (Issue #11) */}
          {showAddVehicle && (
            <form onSubmit={handleSaveVehicle} className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 max-w-2xl text-xs shadow-xs">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-extrabold text-slate-900">
                  {editingVehicle ? 'Editar Datos del Vehículo' : 'Registrar Nuevo Vehículo Eléctrico'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Selecciona una opción del catálogo oficial o ingresa especificaciones personalizadas.
                </p>
              </div>

              {/* Selector de Modalidad */}
              {!editingVehicle && (
                <div className="flex items-center gap-3 p-1.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setRegistrationMode('catalogo');
                      handleCatalogBrandChange(availableBrands[0] || 'TAILG');
                    }}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      registrationMode === 'catalogo'
                        ? 'bg-white text-slate-900 shadow-2xs border border-slate-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    1. Seleccionar del Catálogo Oficial
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRegistrationMode('personalizado');
                      setVehicleBrand('');
                      setVehicleModel('');
                    }}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      registrationMode === 'personalizado'
                        ? 'bg-white text-slate-900 shadow-2xs border border-slate-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    2. Mi vehículo no aparece en el catálogo
                  </button>
                </div>
              )}

              {formError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 font-semibold flex items-center gap-2">
                  <Icon name="alert-triangle" className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Modalidad 1: Selección desde Catálogo */}
              {registrationMode === 'catalogo' && (
                <div className="space-y-3.5 bg-slate-50/60 p-4 rounded-xl border border-slate-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-700 font-bold block mb-1">Marca en Catálogo *</label>
                      <select
                        value={selectedCatalogBrand}
                        onChange={(e) => handleCatalogBrandChange(e.target.value)}
                        className="w-full rounded-xl bg-white border border-slate-300 px-3 py-2 text-slate-900 font-medium focus:border-slate-900 focus:outline-none"
                      >
                        {availableBrands.map((b) => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-700 font-bold block mb-1">Modelo Registrado *</label>
                      <select
                        value={selectedCatalogModel}
                        onChange={(e) => handleCatalogModelChange(e.target.value)}
                        className="w-full rounded-xl bg-white border border-slate-300 px-3 py-2 text-slate-900 font-medium focus:border-slate-900 focus:outline-none"
                      >
                        {filteredCatalogModels.length === 0 ? (
                          <option value="">No hay modelos en catálogo para esta marca</option>
                        ) : (
                          filteredCatalogModels.map((m) => (
                            <option key={m.slug} value={m.model}>
                              {m.model} ({m.batteryVoltageV || m.batteryVoltage || 'EV'}V / {m.motorNominalW || m.motorPower || 'N/D'}W)
                            </option>
                          ))
                        )}
                      </select>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 italic">
                    ⚡ Los datos de voltaje ({vehicleVoltage}V), potencia ({vehiclePower}W) y química ({vehicleChemistry}) se completan automáticamente según la ficha técnica oficial.
                  </p>
                </div>
              )}

              {/* Modalidad 2: Ingreso Personalizado */}
              {registrationMode === 'personalizado' && (
                <div className="space-y-3.5 bg-amber-50/40 p-4 rounded-xl border border-amber-200">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                    <span>⚙️</span>
                    <span>Especificaciones del Vehículo Personalizado</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-700 font-bold block mb-1">Marca o Fabricante *</label>
                      <input
                        type="text"
                        required
                        value={vehicleBrand}
                        onChange={(e) => setVehicleBrand(e.target.value)}
                        placeholder="Ej: Century Motors, Sunra, Kaabo"
                        className="w-full rounded-xl bg-white border border-slate-300 px-3 py-2 text-slate-900 focus:border-slate-900 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-slate-700 font-bold block mb-1">Modelo o Denominación *</label>
                      <input
                        type="text"
                        required
                        value={vehicleModel}
                        onChange={(e) => setVehicleModel(e.target.value)}
                        placeholder="Ej: Nitro 49cc EV, M1 36V, Eagle 2000"
                        className="w-full rounded-xl bg-white border border-slate-300 px-3 py-2 text-slate-900 focus:border-slate-900 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Especificaciones Eléctricas y Físicas */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Tipo de Vehículo</label>
                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    className="w-full rounded-xl bg-white border border-slate-300 px-3 py-2 text-slate-900 focus:border-slate-900 focus:outline-none"
                  >
                    <option value="moto_electrica">Moto Eléctrica</option>
                    <option value="trimoto">Trimoto / Torito</option>
                    <option value="cuatrimoto">Cuatrimoto EV</option>
                    <option value="scooter">Scooter / Monopatín</option>
                    <option value="bicimoto">Bicimoto Eléctrica</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">Año de Fabricación</label>
                  <input
                    type="number"
                    min="2010"
                    max="2030"
                    value={vehicleYear}
                    onChange={(e) => setVehicleYear(e.target.value)}
                    className="w-full rounded-xl bg-white border border-slate-300 px-3 py-2 text-slate-900 focus:border-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">Tensión Operativa (V) *</label>
                  <select
                    value={vehicleVoltage}
                    onChange={(e) => setVehicleVoltage(e.target.value)}
                    className="w-full rounded-xl bg-white border border-slate-300 px-3 py-2 text-slate-900 font-bold focus:border-slate-900 focus:outline-none"
                  >
                    <option value="48">48V</option>
                    <option value="60">60V</option>
                    <option value="72">72V</option>
                    <option value="84">84V</option>
                    <option value="96">96V</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">Potencia Motor (W)</label>
                  <input
                    type="number"
                    min="100"
                    max="50000"
                    step="50"
                    value={vehiclePower}
                    onChange={(e) => setVehiclePower(e.target.value)}
                    placeholder="2000"
                    className="w-full rounded-xl bg-white border border-slate-300 px-3 py-2 text-slate-900 focus:border-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">Química de Batería</label>
                  <select
                    value={vehicleChemistry}
                    onChange={(e) => setVehicleChemistry(e.target.value)}
                    className="w-full rounded-xl bg-white border border-slate-300 px-3 py-2 text-slate-900 focus:border-slate-900 focus:outline-none"
                  >
                    <option value="Litio NMC">Litio NMC (Ternario)</option>
                    <option value="Litio LiFePO4">Litio LiFePO4 (Hierro-Fosfato)</option>
                    <option value="Plomo-Gel (Graphene)">Plomo-Gel / Grafeno</option>
                    <option value="Desconocida">No declarada</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">Capacidad Batería (Ah)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={vehicleCapacityAh}
                    onChange={(e) => setVehicleCapacityAh(e.target.value)}
                    placeholder="Ej: 35"
                    className="w-full rounded-xl bg-white border border-slate-300 px-3 py-2 text-slate-900 focus:border-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              {/* Datos de Controlador y Apodo */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Nombre / Apodo en Cuenta</label>
                  <input
                    type="text"
                    value={vehicleNickname}
                    onChange={(e) => setVehicleNickname(e.target.value)}
                    placeholder="Ej: Mi moto de trabajo"
                    className="w-full rounded-xl bg-white border border-slate-300 px-3 py-2 text-slate-900 focus:border-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">Corriente Controlador (A)</label>
                  <input
                    type="number"
                    value={controllerAmps}
                    onChange={(e) => setControllerAmps(e.target.value)}
                    placeholder="Ej: 45"
                    className="w-full rounded-xl bg-white border border-slate-300 px-3 py-2 text-slate-900 focus:border-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">Modelo de Controlador</label>
                  <input
                    type="text"
                    value={controllerModel}
                    onChange={(e) => setControllerModel(e.target.value)}
                    placeholder="Ej: VOTOL EM-100"
                    className="w-full rounded-xl bg-white border border-slate-300 px-3 py-2 text-slate-900 focus:border-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Notas técnicas adicionales</label>
                <input
                  type="text"
                  value={vehicleNotes}
                  onChange={(e) => setVehicleNotes(e.target.value)}
                  placeholder="Ej: Conector Anderson gris 50A, acelerador con reversa"
                  className="w-full rounded-xl bg-white border border-slate-300 px-3 py-2 text-slate-900 focus:border-slate-900 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddVehicle(false);
                    setEditingVehicle(null);
                  }}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingVehicle}
                  className="rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold px-4 py-2 text-xs shadow-2xs transition-colors cursor-pointer"
                >
                  {isSavingVehicle ? 'Guardando...' : (editingVehicle ? 'Actualizar Vehículo' : 'Guardar Moto')}
                </button>
              </div>
            </form>
          )}

          {/* Listado de Vehículos */}
          {vehicles.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600 space-y-2 shadow-xs">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-700 mx-auto">
                <Icon name="circuit" className="w-6 h-6" />
              </div>
              <p className="font-bold text-slate-900 text-sm">No tienes motos registradas</p>
              <p className="text-xs text-slate-600">
                Haz clic en «Registrar Moto» para asociar tu vehículo eléctrico desde el catálogo o con tus especificaciones técnicas.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vehicles.map((v) => {
                const isCatalog = v.origin === 'CATALOGO';
                return (
                  <div key={v.id} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3.5 shadow-xs flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="rounded-md bg-slate-100 text-slate-900 border border-slate-200 text-[10px] font-bold px-2 py-0.5">
                          {v.brand}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            isCatalog
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          {isCatalog ? 'Catálogo Oficial' : 'Personalizado'}
                        </span>
                      </div>

                      <div>
                        {v.customNickname && (
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                            «{v.customNickname}»
                          </span>
                        )}
                        <h3 className="text-base font-extrabold text-slate-900">{v.model}</h3>
                        <p className="text-xs text-slate-600 mt-0.5">
                          {v.year ? `Año ${v.year}` : 'Año no declarado'} • {v.batteryChemistry || 'Batería EV'}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                        <div>
                          <span className="text-slate-500 block">Tensión:</span>
                          <span className="font-bold text-slate-900 font-mono">
                            {v.nominalVoltageV ? `${v.nominalVoltageV}V` : 'No especificada'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Potencia:</span>
                          <span className="font-bold text-slate-900 font-mono">
                            {v.motorPowerW ? `${v.motorPowerW}W` : 'No declarada'}
                          </span>
                        </div>
                        {v.capacityAh && (
                          <div>
                            <span className="text-slate-500 block">Capacidad:</span>
                            <span className="font-bold text-slate-900 font-mono">{v.capacityAh} Ah</span>
                          </div>
                        )}
                        {v.controllerAmps && (
                          <div>
                            <span className="text-slate-500 block">Controlador:</span>
                            <span className="font-bold text-slate-900 font-mono">{v.controllerAmps} A</span>
                          </div>
                        )}
                      </div>

                      {v.notes && (
                        <p className="text-[11px] text-slate-600 bg-slate-50/70 p-2 rounded-lg border border-slate-200 italic line-clamp-2" title={v.notes}>
                          {v.notes}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <div className="grid grid-cols-2 gap-2">
                        <Link
                          href={`/repuestos?brand=${encodeURIComponent(v.brand)}&voltage=${v.nominalVoltageV || ''}`}
                          className="text-center rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 text-xs transition-colors shadow-2xs"
                        >
                          Repuestos →
                        </Link>

                        <button
                          type="button"
                          onClick={() => {
                            openVoltIAChat({
                              brand: v.brand,
                              model: v.model,
                              voltage: v.nominalVoltageV || undefined,
                              power: v.motorPowerW || undefined,
                            });
                          }}
                          className="text-center rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold py-2 text-xs transition-colors border border-blue-200 cursor-pointer"
                        >
                          Consultar VoltIA ⚡
                        </button>
                      </div>

                      <div className="flex items-center justify-between text-[11px] pt-1">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(v)}
                          className="text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
                        >
                          Editar Ficha
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteVehicle(v.id)}
                          disabled={deletingVehicleId === v.id}
                          className="text-rose-600 hover:text-rose-700 font-semibold disabled:opacity-50 cursor-pointer"
                        >
                          {deletingVehicleId === v.id ? 'Eliminando...' : 'Eliminar'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
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
                href="/repuestos"
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
