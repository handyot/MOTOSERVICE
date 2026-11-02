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

    const voltage = body.nominalVoltageV ? Number(body.nominalVoltageV) : undefined;
    if (voltage !== undefined && (voltage < 12 || voltage > 144)) {
      return NextResponse.json(
        { success: false, error: 'El voltaje nominal debe estar en el rango de 12V a 144V.' },
        { status: 400 }
      );
    }

    const power = body.motorPowerW ? Number(body.motorPowerW) : undefined;
    if (power !== undefined && (power < 100 || power > 50000)) {
      return NextResponse.json(
        { success: false, error: 'La potencia del motor debe estar en el rango de 100W a 50,000W.' },
        { status: 400 }
      );
    }

    const vehicle = await addCustomerVehicle({
      userId: account.id,
      brand: body.brand,
      model: body.model,
      vehicleType: body.vehicleType,
      origin: body.origin || 'PERSONALIZADO',
      year: body.year ? Number(body.year) : undefined,
      nominalVoltageV: voltage,
      motorPowerW: power,
      batteryChemistry: body.batteryChemistry,
      capacityAh: body.capacityAh ? Number(body.capacityAh) : undefined,
      customNickname: body.customNickname,
      controllerAmps: body.controllerAmps ? Number(body.controllerAmps) : undefined,
      controllerModel: body.controllerModel,
      notes: body.notes,
    });

    return NextResponse.json({ success: true, vehicle });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al registrar vehículo';
    return NextResponse.json({ success: false, error: msg }, { status: 400 });
  }
}
