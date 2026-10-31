/**
 * MOTOSERVICE - Utilidades de formateo y cálculo numérico
 * Módulo puro de JavaScript para la presentación de valores técnicos y comerciales.
 */

/**
 * Formatea un monto monetario en formato de moneda local (Soles / PEN por defecto).
 * @param {number} amount - Monto numérico.
 * @param {string} [currency='PEN'] - Código ISO de moneda.
 * @returns {string} - Cadena formateada (ej: "S/ 1,250.00").
 */
export function formatCurrency(amount, currency = "PEN") {
  if (typeof amount !== "number" || isNaN(amount)) {
    return "S/ 0.00";
  }

  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Formatea una especificación de voltaje.
 * @param {number|undefined|null} volts
 * @returns {string}
 */
export function formatVoltage(volts) {
  if (!volts || isNaN(volts)) return "Universal";
  return `${volts}V`;
}

/**
 * Formatea la potencia del motor eléctrico.
 * @param {number|undefined|null} watts
 * @returns {string}
 */
export function formatPower(watts) {
  if (!watts || isNaN(watts)) return "N/D";
  if (watts >= 1000) {
    const kw = (watts / 1000).toFixed(1).replace(".0", "");
    return `${kw} kW (${watts}W)`;
  }
  return `${watts}W`;
}

/**
 * Formatea la capacidad de una batería en Amperios-hora y calcula vatios-hora estimados.
 * @param {number} volts
 * @param {number} ah
 * @returns {string}
 */
export function formatBatteryCapacity(volts, ah) {
  if (!ah) return "N/D";
  if (!volts) return `${ah} Ah`;
  const wh = Math.round(volts * ah);
  return `${ah} Ah (~${wh} Wh)`;
}

/**
 * Convierte un texto a un slug apto para URL o IDs.
 * @param {string} text
 * @returns {string}
 */
export function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
