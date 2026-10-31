/**
 * MOTOSERVICE - Servicio de Vehículos de Clientes Registrados
 */

import { createClient } from '../supabase/server';
import { CustomerVehicle } from '@/types';

// Almacén seguro en memoria para pruebas
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
        id: String(v.id_vehiculo),
        userId: String(v.user_id),
        brand: String(v.marca),
        model: String(v.modelo),
        year: v.anio ? Number(v.anio) : null,
        nominalVoltageV: v.voltaje_nominal_v ? Number(v.voltaje_nominal_v) : null,
        batteryChemistry: v.quimica_bateria ? String(v.quimica_bateria) : null,
        notes: v.notas ? String(v.notas) : null,
        createdAt: String(v.created_at),
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
  year?: number;
  nominalVoltageV?: number;
  batteryChemistry?: string;
  notes?: string;
}): Promise<CustomerVehicle> {
  const newVehicle: CustomerVehicle = {
    id: crypto.randomUUID(),
    userId: params.userId,
    brand: params.brand,
    model: params.model,
    year: params.year || null,
    nominalVoltageV: params.nominalVoltageV || null,
    batteryChemistry: params.batteryChemistry || null,
    notes: params.notes || null,
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
      anio: newVehicle.year,
      voltaje_nominal_v: newVehicle.nominalVoltageV,
      quimica_bateria: newVehicle.batteryChemistry,
      notas: newVehicle.notes,
    });
  } catch (err) {
    console.warn('[MOTOSERVICE] Guardado de vehículo en memoria:', err);
  }

  return newVehicle;
}
