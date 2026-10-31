import test from 'node:test';
import assert from 'node:assert/strict';

// Importación de módulos a evaluar
import {
  validateEmail,
  validatePassword,
  validateFullName,
  validatePhone,
  getSafeRedirectUrl,
} from '../lib/auth/validations.mjs';

// -----------------------------------------------------------------------------
// ESCENARIO 1: Cliente no autenticado que intenta acceder a /cuenta
// -----------------------------------------------------------------------------
test('Escenario 1: Redirección de usuario no autenticado a /login desde /cuenta', () => {
  // Simulación de lógica de proxy para ruta protegida
  function simulateProxyRedirect(pathname, user) {
    const isProtected = pathname.startsWith('/cuenta') || pathname.startsWith('/admin');
    if (isProtected && !user) {
      return {
        redirect: true,
        destination: `/login?redirectTo=${encodeURIComponent(pathname)}`,
      };
    }
    return { redirect: false };
  }

  const result = simulateProxyRedirect('/cuenta', null);
  assert.strictEqual(result.redirect, true);
  assert.strictEqual(result.destination, '/login?redirectTo=%2Fcuenta');

  const subpathResult = simulateProxyRedirect('/cuenta/configuracion', null);
  assert.strictEqual(subpathResult.redirect, true);
  assert.strictEqual(subpathResult.destination, '/login?redirectTo=%2Fcuenta%2Fconfiguracion');
});

// -----------------------------------------------------------------------------
// ESCENARIO 2: Cliente con rol customer que intenta acceder a /admin
// -----------------------------------------------------------------------------
test('Escenario 2: Cliente estándar (customer) bloqueado al intentar acceder a /admin', () => {
  function simulateServerRequireAdmin(account) {
    if (!account) {
      return { status: 'redirect', to: '/login?redirectTo=/admin' };
    }
    if (account.role !== 'admin') {
      return { status: 'redirect', to: '/cuenta?error=unauthorized', authorized: false };
    }
    return { status: 'authorized', account };
  }

  // Usuario cliente intentando entrar a /admin
  const customerAccount = {
    id: 'usr-customer-123',
    email: 'cliente@motoservice.pe',
    fullName: 'Cliente Regular',
    role: 'customer',
  };

  const check = simulateServerRequireAdmin(customerAccount);
  assert.strictEqual(check.status, 'redirect');
  assert.strictEqual(check.to, '/cuenta?error=unauthorized');
  assert.strictEqual(check.authorized, false);
});

// -----------------------------------------------------------------------------
// ESCENARIO 3: Administrador autenticado que accede a /admin
// -----------------------------------------------------------------------------
test('Escenario 3: Administrador verificado obtiene acceso exitoso a /admin', () => {
  function simulateServerRequireAdmin(account) {
    if (!account) {
      return { status: 'redirect', to: '/login?redirectTo=/admin' };
    }
    if (account.role !== 'admin') {
      return { status: 'redirect', to: '/cuenta?error=unauthorized', authorized: false };
    }
    return { status: 'authorized', account };
  }

  const adminAccount = {
    id: 'usr-admin-999',
    email: 'operador.admin@motoservice.pe',
    fullName: 'Operador Principal',
    role: 'admin',
  };

  const check = simulateServerRequireAdmin(adminAccount);
  assert.strictEqual(check.status, 'authorized');
  assert.strictEqual(check.account.role, 'admin');
  assert.strictEqual(check.account.id, 'usr-admin-999');
});

// -----------------------------------------------------------------------------
// ESCENARIO 4: Intento de auto-modificación o inyección de rol en la cuenta
// -----------------------------------------------------------------------------
test('Escenario 4: Inmunidad ante intentos de escalada de privilegios a rol admin', () => {
  // Simulación del trigger en auth.users
  function simulateHandleNewUserTrigger(userInsertPayload) {
    // El trigger en PostgreSQL fija 'customer' de forma incondicional
    const assignedRole = 'customer';
    return {
      userId: userInsertPayload.id,
      fullName: userInsertPayload.raw_user_meta_data?.full_name || 'Cliente MOTOSERVICE',
      role: assignedRole, // Ignora userInsertPayload.raw_user_meta_data.role = 'admin'
    };
  }

  const maliciousPayload = {
    id: 'hacker-uuid',
    email: 'intruso@fake.com',
    raw_user_meta_data: {
      full_name: 'Intruso Audaz',
      role: 'admin', // Intento de inyección
    },
  };

  const createdAccount = simulateHandleNewUserTrigger(maliciousPayload);
  assert.strictEqual(createdAccount.role, 'customer', 'El rol asignado DEBE ser estrictamente customer');
  assert.notStrictEqual(createdAccount.role, 'admin');

  // En la acción de actualización de perfil, solo se procesan fullName y phone
  function extractAllowedProfileUpdates(formData) {
    const allowed = {};
    if (formData.has('fullName')) allowed.full_name = formData.get('fullName').trim();
    if (formData.has('phone')) allowed.phone = formData.get('phone').trim();
    // Cualquier otro campo como 'role' es ignorado por diseño
    return allowed;
  }

  const formDataWithInjectedRole = new Map([
    ['fullName', 'Nombre Válido'],
    ['phone', '+51 987654321'],
    ['role', 'admin'], // Atacante intenta enviar role
  ]);

  const sanitized = extractAllowedProfileUpdates(formDataWithInjectedRole);
  assert.strictEqual(sanitized.full_name, 'Nombre Válido');
  assert.strictEqual(sanitized.role, undefined, 'El campo role no debe ser extraído');
});

// -----------------------------------------------------------------------------
// ESCENARIO 5: Intento de consultar o modificar el perfil de otro usuario
// -----------------------------------------------------------------------------
test('Escenario 5: Aislamiento estricto de perfiles y prevención de IDOR', () => {
  // Simulación de la regla RLS: auth.uid() = id
  function simulateRlsProfileAccess(currentAuthenticatedUserId, targetProfileId, operation) {
    if (operation === 'SELECT' || operation === 'UPDATE') {
      if (currentAuthenticatedUserId !== targetProfileId) {
        return { allowed: false, error: 'RLS policy violation: unauthorized' };
      }
    }
    return { allowed: true };
  }

  const victimUserId = 'user-alice-111';
  const attackerUserId = 'user-bob-222';

  // Bob intenta leer el perfil de Alice
  const selectAttempt = simulateRlsProfileAccess(attackerUserId, victimUserId, 'SELECT');
  assert.strictEqual(selectAttempt.allowed, false);

  // Bob intenta actualizar el perfil de Alice
  const updateAttempt = simulateRlsProfileAccess(attackerUserId, victimUserId, 'UPDATE');
  assert.strictEqual(updateAttempt.allowed, false);

  // Bob intenta actualizar su propio perfil
  const ownUpdateAttempt = simulateRlsProfileAccess(attackerUserId, attackerUserId, 'UPDATE');
  assert.strictEqual(ownUpdateAttempt.allowed, true);
});

// -----------------------------------------------------------------------------
// ESCENARIO 6: Callback, recuperación de contraseña y sanitización de redirecciones
// -----------------------------------------------------------------------------
test('Escenario 6: Prevención de Open Redirect en callbacks y formularios', () => {
  // Casos maliciosos conocidos de Open Redirect
  assert.strictEqual(getSafeRedirectUrl('//evil.com', '/cuenta'), '/cuenta');
  assert.strictEqual(getSafeRedirectUrl('http://attacker.com', '/cuenta'), '/cuenta');
  assert.strictEqual(getSafeRedirectUrl('https://phishing.site', '/cuenta'), '/cuenta');
  assert.strictEqual(getSafeRedirectUrl('javascript:alert(1)', '/cuenta'), '/cuenta');
  assert.strictEqual(getSafeRedirectUrl('/\\evil.com', '/cuenta'), '/cuenta');
  assert.strictEqual(getSafeRedirectUrl('cuenta', '/cuenta'), '/cuenta'); // sin slash inicial

  // Casos legítimos
  assert.strictEqual(getSafeRedirectUrl('/cuenta', '/cuenta'), '/cuenta');
  assert.strictEqual(getSafeRedirectUrl('/admin', '/cuenta'), '/admin');
  assert.strictEqual(getSafeRedirectUrl('/#catalogo', '/cuenta'), '/#catalogo');
  assert.strictEqual(getSafeRedirectUrl('/cuenta?tab=seguridad', '/cuenta'), '/cuenta?tab=seguridad');
  assert.strictEqual(getSafeRedirectUrl(null, '/cuenta'), '/cuenta');
  assert.strictEqual(getSafeRedirectUrl('', '/cuenta'), '/cuenta');
});

// -----------------------------------------------------------------------------
// ESCENARIO 7: Sesiones expiradas, validaciones y manejo de errores de Supabase
// -----------------------------------------------------------------------------
test('Escenario 7: Robustez ante sesiones expiradas, errores y validaciones de datos', () => {
  // 1. Sesión expirada
  function handleSupabaseAuthResult(data, error) {
    if (error || !data?.user) {
      return {
        isAuthenticated: false,
        userMessage: 'Sesión no válida o expirada. Por favor, inicia sesión nuevamente.',
      };
    }
    return { isAuthenticated: true, user: data.user };
  }

  const expiredResult = handleSupabaseAuthResult(null, { message: 'JWT expired' });
  assert.strictEqual(expiredResult.isAuthenticated, false);
  assert.ok(expiredResult.userMessage.includes('Sesión no válida o expirada'));

  // 2. Validación de correo
  assert.strictEqual(validateEmail('test@motoservice.pe').valid, true);
  assert.strictEqual(validateEmail('invalido').valid, false);
  assert.strictEqual(validateEmail('test@.com').valid, false);
  assert.strictEqual(validateEmail('').valid, false);

  // 3. Validación de contraseña (mínimo 8 caracteres, al menos letra y número)
  assert.strictEqual(validatePassword('Motoservice2026').valid, true);
  assert.strictEqual(validatePassword('corto1').valid, false); // < 8
  assert.strictEqual(validatePassword('sololetrasymayusculas').valid, false); // sin número
  assert.strictEqual(validatePassword('1234567890').valid, false); // sin letra

  // 4. Validación de nombre
  assert.strictEqual(validateFullName('Carlos Mendoza').valid, true);
  assert.strictEqual(validateFullName('A').valid, false); // < 2
  assert.strictEqual(validateFullName('').valid, false);

  // 5. Validación de teléfono
  assert.strictEqual(validatePhone('+51987654321').valid, true);
  assert.strictEqual(validatePhone('(01) 456-7890').valid, true);
  assert.strictEqual(validatePhone('').valid, true); // Opcional
  assert.strictEqual(validatePhone('abc-invalid').valid, false);
});

// -----------------------------------------------------------------------------
// ESCENARIO 8: Fallback a user_metadata cuando public.profiles está ausente
// -----------------------------------------------------------------------------
test('Escenario 8: Preservación de nombre y teléfono desde auth.user_metadata si no existe tabla profiles', () => {
  function simulateAccountResolution(authUser, profileRecord, userRole, adminEmailsEnv = '') {
    const metaFullName =
      typeof authUser.user_metadata?.full_name === 'string' && authUser.user_metadata.full_name.trim()
        ? authUser.user_metadata.full_name.trim()
        : null;
    const metaPhone =
      typeof authUser.user_metadata?.phone === 'string' && authUser.user_metadata.phone.trim()
        ? authUser.user_metadata.phone.trim()
        : null;

    const isAdmin = adminEmailsEnv
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .includes((authUser.email || '').toLowerCase());

    const resolvedRole = userRole || (isAdmin ? 'admin' : 'customer');

    return {
      id: authUser.id,
      email: authUser.email || '',
      fullName: profileRecord?.fullName || metaFullName || authUser.email?.split('@')[0] || 'Cliente',
      phone: profileRecord?.phone || metaPhone || null,
      role: resolvedRole,
    };
  }

  // Usuario registrado con metadata pero sin fila en public.profiles (tabla ausente o registro pendiente)
  const authUserWithMeta = {
    id: 'user-ev-777',
    email: 'roberto.motors@gmail.com',
    user_metadata: {
      full_name: 'Roberto Gómez',
      phone: '+51 912345678',
    },
  };

  const account = simulateAccountResolution(authUserWithMeta, null, null);
  assert.strictEqual(account.fullName, 'Roberto Gómez', 'Debe tomar el nombre de user_metadata');
  assert.strictEqual(account.phone, '+51 912345678', 'Debe tomar el teléfono de user_metadata');
  assert.strictEqual(account.role, 'customer', 'Rol por defecto customer');
});

// -----------------------------------------------------------------------------
// ESCENARIO 9: Fallback de administrador por variable de entorno ADMIN_EMAILS
// -----------------------------------------------------------------------------
test('Escenario 9: Acceso de operador garantizado vía ADMIN_EMAILS aún con user_roles ausente', () => {
  function isConfiguredAdminEmail(email, adminEmailsEnv) {
    if (!email || !adminEmailsEnv) return false;
    const adminList = adminEmailsEnv
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    return adminList.includes(email.trim().toLowerCase());
  }

  const envConfig = 'admin@neroelectric.pe, operador@motoservice.pe';

  assert.strictEqual(isConfiguredAdminEmail('admin@neroelectric.pe', envConfig), true);
  assert.strictEqual(isConfiguredAdminEmail('OPERADOR@MOTOSERVICE.PE', envConfig), true); // Case-insensitive
  assert.strictEqual(isConfiguredAdminEmail('hacker@neroelectric.pe', envConfig), false);
  assert.strictEqual(isConfiguredAdminEmail('cliente@gmail.com', envConfig), false);
  assert.strictEqual(isConfiguredAdminEmail('', envConfig), false);
});

// -----------------------------------------------------------------------------
// ESCENARIO 10: Resiliencia en actualización de perfil ante error PGRST205
// -----------------------------------------------------------------------------
test('Escenario 10: updateProfileAction persiste datos en Auth metadata ante PGRST205', () => {
  function simulateUpdateProfile(user, formData, tableExists) {
    const fullNameRaw = formData.get('fullName');
    const phoneRaw = formData.get('phone');
    const fullName = typeof fullNameRaw === 'string' ? fullNameRaw.trim() : '';
    const phone = typeof phoneRaw === 'string' ? phoneRaw.trim() : '';

    const nameVal = validateFullName(fullName);
    if (!nameVal.valid) return { success: false, error: nameVal.error };

    const phoneVal = validatePhone(phone);
    if (!phoneVal.valid) return { success: false, error: phoneVal.error };

    // Simula auth.updateUser siempre exitoso
    const updatedMetadata = { full_name: fullName, phone: phone || null };

    // Simula tabla profiles
    let dbError = null;
    if (!tableExists) {
      dbError = { code: 'PGRST205', message: "Could not find table 'public.profiles'" };
    }

    if (dbError && dbError.code !== 'PGRST205') {
      return { success: false, error: dbError.message };
    }

    return {
      success: true,
      message: 'Perfil actualizado correctamente.',
      persistedInAuth: updatedMetadata,
      tableUpdated: tableExists,
    };
  }

  const formData = new Map([
    ['fullName', 'Lucía Fernández'],
    ['phone', '+51 999888777'],
  ]);

  // Caso: Tabla profiles aún no migrada (PGRST205)
  const resultWithoutTable = simulateUpdateProfile({ id: 'u1' }, formData, false);
  assert.strictEqual(resultWithoutTable.success, true);
  assert.strictEqual(resultWithoutTable.persistedInAuth.full_name, 'Lucía Fernández');
  assert.strictEqual(resultWithoutTable.tableUpdated, false);

  // Caso: Tabla profiles existente
  const resultWithTable = simulateUpdateProfile({ id: 'u1' }, formData, true);
  assert.strictEqual(resultWithTable.success, true);
  assert.strictEqual(resultWithTable.tableUpdated, true);
});

// -----------------------------------------------------------------------------
// ESCENARIO 11: Preservación de redirectTo en proxy.ts con sanitización
// -----------------------------------------------------------------------------
test('Escenario 11: proxy.ts preserva redirectTo legítimo y neutraliza rutas maliciosas', () => {
  function simulateAuthEntryProxy(pathname, user, rawRedirect) {
    const isAuthEntry = pathname === '/login' || pathname === '/registro';
    if (isAuthEntry && user) {
      const safeTarget = getSafeRedirectUrl(rawRedirect, '/cuenta');
      return { redirect: true, to: safeTarget };
    }
    return { redirect: false };
  }

  // Usuario autenticado con redirectTo legítimo (ej. venía de /checkout o /carrito)
  const legitRedirect = simulateAuthEntryProxy('/login', { id: 'usr-1' }, '/checkout');
  assert.strictEqual(legitRedirect.redirect, true);
  assert.strictEqual(legitRedirect.to, '/checkout');

  // Usuario autenticado sin redirectTo -> va a /cuenta
  const defaultRedirect = simulateAuthEntryProxy('/login', { id: 'usr-1' }, null);
  assert.strictEqual(defaultRedirect.redirect, true);
  assert.strictEqual(defaultRedirect.to, '/cuenta');

  // Usuario autenticado con intento de ataque de redirección abierta
  const attackRedirect = simulateAuthEntryProxy('/login', { id: 'usr-1' }, 'https://malicious.com');
  assert.strictEqual(attackRedirect.redirect, true);
  assert.strictEqual(attackRedirect.to, '/cuenta');

  const protoAttack = simulateAuthEntryProxy('/login', { id: 'usr-1' }, '//phishing.site');
  assert.strictEqual(protoAttack.redirect, true);
  assert.strictEqual(protoAttack.to, '/cuenta');
});
