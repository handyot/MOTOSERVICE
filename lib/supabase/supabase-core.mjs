/**
 * MOTOSERVICE - Núcleo de Configuración y Resolución Segura de Supabase
 *
 * Resuelve y valida variables de entorno del servidor para la conexión administrativa
 * de PostgreSQL en Supabase. Garantiza compatibilidad canónica de nombres de variables,
 * sanitización rigurosa de cadenas (trim y eliminación de comillas accidentales),
 * compatibilidad nativa con claves 'sb_secret_...' y JWT heredadas ('service_role'),
 * rechazo absoluto de credenciales públicas y diagnósticos explícitos en servidor sin exponer secretos.
 */

export const EXPECTED_PROJECT_REF = 'tbznauwbvhsbmsbcodes';

export const KNOWN_URL_VARIABLES = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_URL',
  'SUPABASE_PROJECT_URL',
  'NEXT_PUBLIC_SUPABASE_PROJECT_URL',
];

export const KNOWN_SECRET_KEY_VARIABLES = [
  'SUPABASE_SECRET_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_SERVICE_KEY',
  'SUPABASE_ADMIN_KEY',
];

/**
 * Sanitiza un valor de entorno: recorta espacios y elimina comillas simples o dobles envolventes.
 * @param {unknown} val
 * @returns {string | null}
 */
export function sanitizeEnvValue(val) {
  if (typeof val !== 'string') return null;
  let trimmed = val.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    trimmed = trimmed.slice(1, -1).trim();
  }
  return trimmed.length > 0 ? trimmed : null;
}

/**
 * Sanitiza una URL eliminando barras finales y comillas.
 * @param {unknown} val
 * @returns {string | null}
 */
export function sanitizeUrl(val) {
  const sanitized = sanitizeEnvValue(val);
  if (!sanitized) return null;
  return sanitized.replace(/\/+$/, '');
}

/**
 * Extrae el subdominio o referencia de proyecto de una URL Supabase.
 * @param {string | null | undefined} url
 * @returns {string | null}
 */
export function extractProjectRef(url) {
  if (!url || typeof url !== 'string') return null;
  const match = url.match(/https?:\/\/([a-z0-9_-]+)\.supabase\.(co|in)/i);
  return match ? match[1].toLowerCase() : null;
}

/**
 * Inspecciona una clave administrativa y determina su formato y validez,
 * bloqueando tajantemente claves públicas, placeholders y credenciales anónimas.
 * No expone el valor del secreto.
 * @param {string | null | undefined} rawKey
 * @returns {{ valid: boolean; format?: string; length?: number; reason?: string; projectRef?: string }}
 */
export function inspectAdminKey(rawKey) {
  const key = sanitizeEnvValue(rawKey);
  if (!key) {
    return { valid: false, reason: 'empty' };
  }

  // Rechazo de claves públicas de cliente
  if (key.startsWith('sb_publishable_')) {
    return { valid: false, reason: 'publishable_key_rejected', length: key.length };
  }

  // Rechazo de placeholders de configuración
  if (/REEMPLAZAR|REPLACE|PLACEHOLDER/i.test(key)) {
    return { valid: false, reason: 'placeholder_key_rejected', length: key.length };
  }

  // Formato moderno Supabase API Key (sb_secret_...)
  if (key.startsWith('sb_secret_')) {
    if (key.length < 20) {
      return { valid: false, reason: 'secret_key_too_short', length: key.length };
    }
    return { valid: true, format: 'sb_secret', length: key.length };
  }

  // Formato heredado JWT (service_role)
  if (key.startsWith('eyJ')) {
    const parts = key.split('.');
    if (parts.length === 3) {
      try {
        const payloadJson = Buffer.from(parts[1], 'base64').toString('utf8');
        const payload = JSON.parse(payloadJson);

        if (payload.role === 'anon') {
          return { valid: false, reason: 'anon_jwt_rejected', length: key.length };
        }

        if (payload.role === 'service_role') {
          return {
            valid: true,
            format: 'service_role_jwt',
            length: key.length,
            projectRef: payload.ref || undefined,
          };
        }

        return {
          valid: false,
          reason: `unexpected_jwt_role_${payload.role || 'unknown'}`,
          length: key.length,
        };
      } catch {
        return { valid: false, reason: 'malformed_jwt', length: key.length };
      }
    }
  }

  // Clave opaca administrativa genérica (mínimo 30 caracteres para seguridad)
  if (key.length >= 30) {
    return { valid: true, format: 'opaque_secret', length: key.length };
  }

  return { valid: false, reason: 'unrecognized_key_format', length: key.length };
}

/**
 * Resuelve la URL canónica de la instancia de Supabase desde el entorno.
 * Si existen múltiples variables configuradas y una coincide con el proyecto oficial,
 * prioriza la coincidencia oficial.
 * @param {Record<string, string | undefined>} [env=process.env]
 * @returns {string | null}
 */
export function resolveSupabaseUrl(env = process.env) {
  const details = resolveSupabaseUrlDetails(env);
  return details ? details.url : null;
}

/**
 * Resuelve detalles de la URL identificando la variable fuente.
 * @param {Record<string, string | undefined>} [env=process.env]
 * @returns {{ url: string; sourceVariable: string; projectRef: string | null } | null}
 */
export function resolveSupabaseUrlDetails(env = process.env) {
  if (!env || typeof env !== 'object') return null;

  const candidates = [];
  for (const varName of KNOWN_URL_VARIABLES) {
    const rawVal = env[varName];
    const sanitized = sanitizeUrl(rawVal);
    if (sanitized) {
      candidates.push({
        url: sanitized,
        sourceVariable: varName,
        projectRef: extractProjectRef(sanitized),
      });
    }
  }

  if (candidates.length === 0) return null;

  // Si algún candidato coincide con el proyecto esperado, priorizarlo
  const matchingOfficial = candidates.find((c) => c.projectRef === EXPECTED_PROJECT_REF);
  if (matchingOfficial) {
    return matchingOfficial;
  }

  return candidates[0];
}

/**
 * Resuelve la clave secreta o service_role de Supabase desde el servidor.
 * Rechaza credenciales anónimas, públicas y formatos corruptos.
 * Si la primera variable evaluada es inválida o placeholder, evalúa los alias restantes.
 * @param {Record<string, string | undefined>} [env=process.env]
 * @returns {string | null}
 */
export function resolveSupabaseAdminKey(env = process.env) {
  const details = resolveSupabaseAdminKeyDetails(env);
  return details ? details.key : null;
}

/**
 * Resuelve detalles de la clave secreta identificando la variable fuente y metadatos no sensibles.
 * @param {Record<string, string | undefined>} [env=process.env]
 * @returns {{ key: string; sourceVariable: string; format: string; length: number; projectRef?: string } | null}
 */
export function resolveSupabaseAdminKeyDetails(env = process.env) {
  if (!env || typeof env !== 'object') return null;

  for (const varName of KNOWN_SECRET_KEY_VARIABLES) {
    const rawVal = env[varName];
    const sanitized = sanitizeEnvValue(rawVal);
    if (sanitized) {
      const inspection = inspectAdminKey(sanitized);
      if (inspection.valid) {
        return {
          key: sanitized,
          sourceVariable: varName,
          format: inspection.format || 'unknown',
          length: inspection.length || sanitized.length,
          projectRef: inspection.projectRef,
        };
      }
    }
  }

  return null;
}

/**
 * Diagnóstico completo del estado de configuración de persistencia administrativa.
 * Informa metadatos técnicos (host, formato de clave, origen) sin revelar secretos.
 * @param {Record<string, string | undefined>} [env=process.env]
 */
export function getOrderAdminConfigStatus(env = process.env) {
  const urlDetails = resolveSupabaseUrlDetails(env);
  const keyDetails = resolveSupabaseAdminKeyDetails(env);

  const missingVariables = [];
  if (!urlDetails) {
    missingVariables.push('SUPABASE_URL / NEXT_PUBLIC_SUPABASE_URL');
  }
  if (!keyDetails) {
    missingVariables.push('SUPABASE_SECRET_KEY / SUPABASE_SERVICE_ROLE_KEY');
  }

  // Detección de posibles inconsistencias entre URL y Token
  let projectRefMismatch = false;
  if (urlDetails?.projectRef && keyDetails?.projectRef) {
    if (urlDetails.projectRef !== keyDetails.projectRef) {
      projectRefMismatch = true;
    }
  }

  return {
    isConfigured: Boolean(urlDetails && keyDetails),
    hasUrl: Boolean(urlDetails),
    hasSecretKey: Boolean(keyDetails),
    missingVariables,
    urlHost: urlDetails ? new URL(urlDetails.url).host : null,
    projectRef: urlDetails?.projectRef || null,
    sourceUrlVar: urlDetails?.sourceVariable || null,
    sourceKeyVar: keyDetails?.sourceVariable || null,
    keyFormat: keyDetails?.format || null,
    keyLength: keyDetails?.length || null,
    projectRefMismatch,
  };
}
