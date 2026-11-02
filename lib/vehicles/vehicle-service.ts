/**
 * MOTOSERVICE - Servicio de Vehículos de Clientes Registrados
 * Soporta registro desde catálogo homologado y registro personalizado.
 */

import { createClient } from '../supabase/server';
import { CustomerVehicle } from '@/types';
export { validateCustomerVehicleInput } from './vehicle-core.mjs';

// Almacén seguro en memoria para pruebas y entornos sin base de datos activa
const memoryVehicles: CustomerVehicle[] = [];

export async function getCustomerVehicles(userId: string): Promise<CustomerVehicle[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('vehiculos_cliente')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (data && !error) {
      return data.map((v: Record<string, unknown>) => ({
        id: String(v.id_vehiculo || v.id),
        userId: String(v.user_id),
        brand: String(v.marca),
        model: String(v.modelo),
        vehicleType: v.tipo_vehiculo ? String(v.tipo_vehiculo) : 'moto_electrica',
        origin: v.origen === 'CATALOGO' ? 'CATALOGO' : 'PERSONALIZADO',
        year: v.anio ? Number(v.anio) : null,
        nominalVoltageV: v.voltaje_nominal_v ? Number(v.voltaje_nominal_v) : null,
        motorPowerW: v.potencia_motor_w ? Number(v.potencia_motor_w) : null,
        batteryChemistry: v.quimica_bateria ? String(v.quimica_bateria) : null,
        capacityAh: v.capacidad_ah ? Number(v.capacidad_ah) : null,
        customNickname: v.apodo ? String(v.apodo) : null,
        controllerAmps: v.amperaje_controlador ? Number(v.amperaje_controlador) : null,
        controllerModel: v.modelo_controlador ? String(v.modelo_controlador) : null,
        notes: v.notas ? String(v.notas) : null,
        createdAt: String(v.created_at),
        updatedAt: v.updated_at ? String(v.updated_at) : undefined,
      }));
    }
  } catch (err) {
    console.warn('[MOTOSERVICE] Usando memoria para vehículos de cliente:', err);
  }

  return memoryVehicles.filter((v) => v.userId === userId);
}

export async function addCustomerVehicle(params: {
  userId: string;
  brand: string;
  model: string;
  vehicleType?: string;
  origin?: 'CATALOGO' | 'PERSONALIZADO';
  year?: number;
  nominalVoltageV?: number;
  motorPowerW?: number;
  batteryChemistry?: string;
  capacityAh?: number;
  customNickname?: string;
  controllerAmps?: number;
  controllerModel?: string;
  notes?: string;
}): Promise<CustomerVehicle> {
  const newVehicle: CustomerVehicle = {
    id: crypto.randomUUID(),
    userId: params.userId,
    brand: params.brand.trim(),
    model: params.model.trim(),
    vehicleType: params.vehicleType || 'moto_electrica',
    origin: params.origin || 'PERSONALIZADO',
    year: params.year || null,
    nominalVoltageV: params.nominalVoltageV || null,
    motorPowerW: params.motorPowerW || null,
    batteryChemistry: params.batteryChemistry || null,
    capacityAh: params.capacityAh || null,
    customNickname: params.customNickname?.trim() || null,
    controllerAmps: params.controllerAmps || null,
    controllerModel: params.controllerModel?.trim() || null,
    notes: params.notes?.trim() || null,
    createdAt: new Date().toISOString(),
  };

  memoryVehicles.push(newVehicle);

  try {
    const supabase = await createClient();
    await supabase.from('vehiculos_cliente').insert({
      id_vehiculo: newVehicle.id,
      user_id: newVehicle.userId,
      marca: newVehicle.brand,
      modelo: newVehicle.model,
      tipo_vehiculo: newVehicle.vehicleType,
      origen: newVehicle.origin,
      anio: newVehicle.year,
      voltaje_nominal_v: newVehicle.nominalVoltageV,
      potencia_motor_w: newVehicle.motorPowerW,
      quimica_bateria: newVehicle.batteryChemistry,
      capacidad_ah: newVehicle.capacityAh,
      apodo: newVehicle.customNickname,
      amperaje_controlador: newVehicle.controllerAmps,
      modelo_controlador: newVehicle.controllerModel,
      notas: newVehicle.notes,
    });
  } catch (err) {
    console.warn('[MOTOSERVICE] Guardado de vehículo en memoria:', err);
  }

  return newVehicle;
}

export async function updateCustomerVehicle(
  userId: string,
  vehicleId: string,
  params: Partial<Omit<CustomerVehicle, 'id' | 'userId' | 'createdAt'>>
): Promise<CustomerVehicle | null> {
  const memIndex = memoryVehicles.findIndex((v) => v.id === vehicleId && v.userId === userId);
  if (memIndex !== -1) {
    memoryVehicles[memIndex] = {
      ...memoryVehicles[memIndex],
      ...params,
      updatedAt: new Date().toISOString(),
    };
  }

  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };
    if (params.brand !== undefined) payload.marca = params.brand;
    if (params.model !== undefined) payload.modelo = params.model;
    if (params.vehicleType !== undefined) payload.tipo_vehiculo = params.vehicleType;
    if (params.year !== undefined) payload.anio = params.year;
    if (params.nominalVoltageV !== undefined) payload.voltaje_nominal_v = params.nominalVoltageV;
    if (params.motorPowerW !== undefined) payload.potencia_motor_w = params.motorPowerW;
    if (params.batteryChemistry !== undefined) payload.quimica_bateria = params.batteryChemistry;
    if (params.capacityAh !== undefined) payload.capacidad_ah = params.capacityAh;
    if (params.customNickname !== undefined) payload.apodo = params.customNickname;
    if (params.controllerAmps !== undefined) payload.amperaje_controlador = params.controllerAmps;
    if (params.controllerModel !== undefined) payload.modelo_controlador = params.controllerModel;
    if (params.notes !== undefined) payload.notas = params.notes;

    const { data } = await supabase
      .from('vehiculos_cliente')
      .update(payload)
      .eq('id_vehiculo', vehicleId)
      .eq('user_id', userId)
      .select('*')
      .maybeSingle();

    if (data) {
      return {
        id: String(data.id_vehiculo || data.id),
        userId: String(data.user_id),
        brand: String(data.marca),
        model: String(data.modelo),
        vehicleType: data.tipo_vehiculo ? String(data.tipo_vehiculo) : 'moto_electrica',
        origin: data.origen === 'CATALOGO' ? 'CATALOGO' : 'PERSONALIZADO',
        year: data.anio ? Number(data.anio) : null,
        nominalVoltageV: data.voltaje_nominal_v ? Number(data.voltaje_nominal_v) : null,
        motorPowerW: data.potencia_motor_w ? Number(data.potencia_motor_w) : null,
        batteryChemistry: data.quimica_bateria ? String(data.quimica_bateria) : null,
        capacityAh: data.capacidad_ah ? Number(data.capacidad_ah) : null,
        customNickname: data.apodo ? String(data.apodo) : null,
        controllerAmps: data.amperaje_controlador ? Number(data.amperaje_controlador) : null,
        controllerModel: data.modelo_controlador ? String(data.modelo_controlador) : null,
        notes: data.notas ? String(data.notas) : null,
        createdAt: String(data.created_at),
        updatedAt: String(data.updated_at),
      };
    }
  } catch (err) {
    console.warn('[MOTOSERVICE] Actualización de vehículo en memoria:', err);
  }

  return memIndex !== -1 ? memoryVehicles[memIndex] : null;
}

export async function deleteCustomerVehicle(userId: string, vehicleId: string): Promise<boolean> {
  const memIndex = memoryVehicles.findIndex((v) => v.id === vehicleId && v.userId === userId);
  if (memIndex !== -1) {
    memoryVehicles.splice(memIndex, 1);
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('vehiculos_cliente')
      .delete()
      .eq('id_vehiculo', vehicleId)
      .eq('user_id', userId);

    return !error;
  } catch (err) {
    console.warn('[MOTOSERVICE] Eliminación de vehículo en memoria:', err);
    return memIndex !== -1;
  }
}
