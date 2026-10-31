/**
 * MOTOSERVICE - Utilidades de validación para autenticación y seguridad
 */

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PHONE_REGEX = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,15}$/;

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} valid
 * @property {string} [error]
 */

/**
 * Valida formato y longitud de correo electrónico.
 * @param {string} email
 * @returns {ValidationResult}
 */
export function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'El correo electrónico es obligatorio.' };
  }
  const trimmed = email.trim();
  if (trimmed.length > 254) {
    return { valid: false, error: 'El correo electrónico excede la longitud máxima permitida.' };
  }
  if (!EMAIL_REGEX.test(trimmed)) {
    return { valid: false, error: 'Ingresa un correo electrónico con formato válido.' };
  }
  return { valid: true };
}

/**
 * Valida robustez de contraseña (mínimo 8 caracteres, al menos 1 letra y 1 número).
 * @param {string} password
 * @returns {ValidationResult}
 */
export function validatePassword(password) {
  if (!password || typeof password !== 'string') {
    return { valid: false, error: 'La contraseña es obligatoria.' };
  }
  if (password.length < 8) {
    return { valid: false, error: 'La contraseña debe tener al menos 8 caracteres.' };
  }
  if (password.length > 128) {
    return { valid: false, error: 'La contraseña excede la longitud máxima permitida.' };
  }
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  if (!hasLetter || !hasNumber) {
    return {
      valid: false,
      error: 'La contraseña debe incluir al menos una letra y un número.',
    };
  }
  return { valid: true };
}

/**
 * Valida nombre completo del usuario.
 * @param {string} name
 * @returns {ValidationResult}
 */
export function validateFullName(name) {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'El nombre completo es obligatorio.' };
  }
  const trimmed = name.trim();
  if (trimmed.length < 2) {
    return { valid: false, error: 'El nombre debe tener al menos 2 caracteres.' };
  }
  if (trimmed.length > 120) {
    return { valid: false, error: 'El nombre excede el límite de 120 caracteres.' };
  }
  return { valid: true };
}

/**
 * Valida número telefónico de contacto si fue suministrado.
 * @param {string} [phone]
 * @returns {ValidationResult}
 */
export function validatePhone(phone) {
  if (!phone || typeof phone !== 'string' || phone.trim() === '') {
    return { valid: true }; // Opcional
  }
  const trimmed = phone.trim();
  if (!PHONE_REGEX.test(trimmed)) {
    return { valid: false, error: 'El número de teléfono ingresado no tiene un formato válido.' };
  }
  return { valid: true };
}

/**
 * Valida y desinfecta rutas de redirección para evitar vulnerabilidades de Open Redirect.
 * Solo permite rutas relativas internas que comiencen con '/' y descarta prefijos '//',
 * esquemas javascript:/data:/http: y caracteres de escape.
 * @param {string|null|undefined} target
 * @param {string} [fallback='/cuenta']
 * @returns {string}
 */
export function getSafeRedirectUrl(target, fallback = '/cuenta') {
  if (!target || typeof target !== 'string') {
    return fallback;
  }

  const trimmed = target.trim();

  // Debe comenzar con '/', no con '//' ni '/\', ni tener esquemas
  if (
    !trimmed.startsWith('/') ||
    trimmed.startsWith('//') ||
    trimmed.startsWith('/\\') ||
    /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed) ||
    trimmed.includes('\\') ||
    trimmed.includes('\r') ||
    trimmed.includes('\n')
  ) {
    return fallback;
  }

  return trimmed;
}
