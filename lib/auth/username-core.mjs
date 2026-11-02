/**
 * MOTOSERVICE / NERO Electric Motors - Reglas de Generación de Nombres de Usuario
 *
 * Formato canónico:
 * Primer nombre + espacio + primeras dos letras del primer apellido + punto.
 *
 * Ejemplos:
 * - Andy Steven Ortiz Trujillo -> ANDY OR.
 * - Carlos Mendoza Pérez -> CARLOS ME.
 * - María Fernanda López Torres -> MARÍA LÓ.
 * - José Ramírez Díaz -> JOSÉ RA.
 * - Carlos Mendoza -> CARLOS ME.
 */

/**
 * Normaliza una cadena de texto eliminando espacios redundantes y caracteres de control.
 * Conserva acentos (Á, É, Í, Ó, Ú, Ñ).
 * @param {string} str
 * @returns {string}
 */
export function normalizeNameString(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .trim()
    .replace(/\s+/g, ' ')
    .toUpperCase();
}

/**
 * Genera un nombre de usuario normalizado a partir del nombre completo del cliente.
 * @param {string} fullName - Nombre completo del usuario
 * @param {number} [collisionIndex=0] - Índice de desempate para garantizar unicidad (0 = sin sufijo)
 * @returns {string} Nombre de usuario formateado
 */
export function generateUsername(fullName, collisionIndex = 0) {
  const clean = normalizeNameString(fullName);
  if (!clean) return 'CLIENTE';

  const parts = clean.split(' ').filter(Boolean);
  if (parts.length === 0) return 'CLIENTE';

  const firstName = parts[0];

  // Caso: solo un término provisto
  if (parts.length === 1) {
    const base = `${firstName}.`;
    return collisionIndex > 0 ? `${firstName}.${collisionIndex + 1}` : base;
  }

  // Identificar el primer apellido según la cantidad de tokens:
  // - 2 palabras: [Nombre, PrimerApellido] -> parts[1]
  // - 3 palabras: [Nombre, PrimerApellido, SegundoApellido] -> parts[1]
  // - 4 o más palabras: [PrimerNombre, SegundoNombre, ..., PrimerApellido, SegundoApellido] -> parts[parts.length - 2]
  let firstSurname = parts[1];
  if (parts.length >= 4) {
    firstSurname = parts[parts.length - 2];
  }

  const surnamePrefix = firstSurname.slice(0, 2);
  const base = `${firstName} ${surnamePrefix}.`;

  if (collisionIndex > 0) {
    return `${firstName} ${surnamePrefix}.${collisionIndex + 1}`;
  }

  return base;
}

/**
 * Retorna el saludo personalizado para el cliente autenticado.
 * Evita saludos genéricos como "Bienvenido, Nombre de usuario".
 * @param {string|null|undefined} username
 * @param {string|null|undefined} fullName
 * @returns {string}
 */
export function formatPersonalizedGreeting(username, fullName) {
  if (username && typeof username === 'string' && username.trim()) {
    const clean = username.trim();
    if (clean !== 'Nombre de usuario' && clean !== 'Usuario') {
      return `Hola, ${clean}`;
    }
  }

  if (fullName && typeof fullName === 'string' && fullName.trim()) {
    const derived = generateUsername(fullName);
    return `Hola, ${derived}`;
  }

  return 'Hola, Cliente';
}
