import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/server';
import { getCustomerVehicles, addCustomerVehicle } from '@/lib/vehicles/vehicle-service';

export async function GET() {
  try {
    const account = await requireAuth();
    const vehicles = await getCustomerVehicles(account.id);
    return NextResponse.json({ success: true, vehicles });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'No autorizado';
    return NextResponse.json({ success: false, error: msg }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const account = await requireAuth();
    const body = await request.json();

    if (!body.brand || !body.model) {
      return NextResponse.json(
        { success: false, error: 'Marca y modelo del vehículo son obligatorios.' },
        { status: 400 }
      );
    }

    const vehicle = await addCustomerVehicle({
      userId: account.id,
      brand: body.brand,
      model: body.model,
      year: body.year ? Number(body.year) : undefined,
      nominalVoltageV: body.nominalVoltageV ? Number(body.nominalVoltageV) : undefined,
      batteryChemistry: body.batteryChemistry,
      notes: body.notes,
    });

    return NextResponse.json({ success: true, vehicle });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al registrar vehículo';
    return NextResponse.json({ success: false, error: msg }, { status: 400 });
  }
}
