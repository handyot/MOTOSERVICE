/**
 * MOTOSERVICE / NERO Electric Motors - Reglas de Negocio para Vehículos de Cliente
 * Validaciones técnicas para modalidad Catálogo y Personalizado.
 */

export function validateCustomerVehicleInput(input = {}) {
  const origin = input.origin === 'CATALOGO' ? 'CATALOGO' : 'PERSONALIZADO';
  const brand = (input.brand || '').trim();
  const model = (input.model || '').trim();

  if (!brand || brand.length < 2) {
    return { valid: false, error: 'La marca del vehículo es obligatoria y debe tener al menos 2 caracteres.' };
  }
  if (!model || model.length < 2) {
    return { valid: false, error: 'El modelo del vehículo es obligatorio y debe tener al menos 2 caracteres.' };
  }

  const nominalVoltageV = input.nominalVoltageV != null && input.nominalVoltageV !== ''
    ? Number(input.nominalVoltageV)
    : null;

  if (nominalVoltageV !== null) {
    if (isNaN(nominalVoltageV) || nominalVoltageV < 12 || nominalVoltageV > 144) {
      return { valid: false, error: 'La tensión eléctrica nominal debe estar entre 12V y 144V.' };
    }
  }

  const motorPowerW = input.motorPowerW != null && input.motorPowerW !== ''
    ? Number(input.motorPowerW)
    : null;

  if (motorPowerW !== null) {
    if (isNaN(motorPowerW) || motorPowerW < 100 || motorPowerW > 50000) {
      return { valid: false, error: 'La potencia nominal del motor debe situarse entre 100 W y 50,000 W.' };
    }
  }

  const capacityAh = input.capacityAh != null && input.capacityAh !== ''
    ? Number(input.capacityAh)
    : null;

  const controllerAmps = input.controllerAmps != null && input.controllerAmps !== ''
    ? Number(input.controllerAmps)
    : null;

  const year = input.year != null && input.year !== ''
    ? Number(input.year)
    : null;

  return {
    valid: true,
    cleaned: {
      origin,
      brand,
      model,
      vehicleType: input.vehicleType || 'moto_electrica',
      nominalVoltageV,
      motorPowerW,
      capacityAh,
      batteryType: input.batteryType || input.batteryChemistry || null,
      controllerModel: input.controllerModel ? String(input.controllerModel).trim() : null,
      controllerAmps,
      customNickname: input.customNickname ? String(input.customNickname).trim() : null,
      notes: input.notes ? String(input.notes).trim() : null,
      year,
    },
  };
}
