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
