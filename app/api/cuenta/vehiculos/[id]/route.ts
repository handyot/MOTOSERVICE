import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/server';
import { updateCustomerVehicle, deleteCustomerVehicle } from '@/lib/vehicles/vehicle-service';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const account = await requireAuth();
    const { id } = await params;
    const body = await request.json();

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

    const updated = await updateCustomerVehicle(account.id, id, {
      brand: body.brand,
      model: body.model,
      vehicleType: body.vehicleType,
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

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Vehículo no encontrado o no pertenece a tu cuenta.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, vehicle: updated });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al actualizar vehículo';
    return NextResponse.json({ success: false, error: msg }, { status: 400 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const account = await requireAuth();
    const { id } = await params;

    const ok = await deleteCustomerVehicle(account.id, id);
    if (!ok) {
      return NextResponse.json(
        { success: false, error: 'No se pudo eliminar el vehículo.' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, message: 'Vehículo eliminado de tu cuenta.' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al eliminar vehículo';
    return NextResponse.json({ success: false, error: msg }, { status: 400 });
  }
}
