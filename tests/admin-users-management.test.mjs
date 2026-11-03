/**
 * MOTOSERVICE — Suite de Pruebas: Módulo de Gestión de Usuarios y Accesos (Issue #19)
 *
 * Verifica:
 * 1. Reglas de negocio RBAC y validaciones puras (user-core.mjs).
 * 2. Inmunidad ante auto-degradación de rol admin y auto-bloqueo de operador en sesión.
 * 3. Restablecimiento de contraseña (enlace seguro vs asignación directa).
 * 4. Alta de nuevos usuarios con rol tipado y validación de contraseñas (mín. 8 caracteres).
 * 5. Filtros reactivos y búsqueda combinada (texto, rol, estado de acceso).
 * 6. Protección estricta en servidor con requireAdminApi() en /api/admin/users.
 * 7. Integración de la vista AdminDashboardView y modales operativos.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  validateUserAction,
  filterUsers,
  formatUserStatus,
  ALLOWED_USER_ROLES,
} from '../admin-panel/lib/users/user-core.mjs';

const ADMIN_ID = 'admin-uuid-001';
const OTHER_USER_ID = 'customer-uuid-002';

test('Issue #19 - Validación RBAC: Asignación y revocación de roles', () => {
  // 1. Asignar rol válido
  const validAdmin = validateUserAction('set_role', { userId: OTHER_USER_ID, role: 'admin' }, ADMIN_ID);
  assert.strictEqual(validAdmin.valid, true);

  const validCustomer = validateUserAction('set_role', { userId: OTHER_USER_ID, role: 'customer' }, ADMIN_ID);
  assert.strictEqual(validCustomer.valid, true);

  // 2. Rechazar rol inexistente o malicioso
  const invalidRole = validateUserAction('set_role', { userId: OTHER_USER_ID, role: 'superadmin' }, ADMIN_ID);
  assert.strictEqual(invalidRole.valid, false);
  assert.ok(invalidRole.error.includes('Rol inválido'));

  // 3. Inmunidad ante auto-degradación de rol
  const selfDemote = validateUserAction('set_role', { userId: ADMIN_ID, role: 'customer' }, ADMIN_ID);
  assert.strictEqual(selfDemote.valid, false);
  assert.ok(selfDemote.error.includes('no puedes revocar tu propio rol'));
});

test('Issue #19 - Validación de Seguridad: Bloqueo de cuentas y auto-protección', () => {
  // 1. Bloqueo válido de usuario tercero
  const validBan = validateUserAction('toggle_ban', { userId: OTHER_USER_ID, isBanned: true }, ADMIN_ID);
  assert.strictEqual(validBan.valid, true);

  // 2. Desbloqueo válido de usuario tercero
  const validUnban = validateUserAction('toggle_ban', { userId: OTHER_USER_ID, isBanned: false }, ADMIN_ID);
  assert.strictEqual(validUnban.valid, true);

  // 3. Inmunidad ante auto-bloqueo del administrador en sesión
  const selfBan = validateUserAction('toggle_ban', { userId: ADMIN_ID, isBanned: true }, ADMIN_ID);
  assert.strictEqual(selfBan.valid, false);
  assert.ok(selfBan.error.includes('no puedes bloquear tu propia cuenta'));

  // 4. Rechazar tipo de dato no booleano
  const invalidBanType = validateUserAction('toggle_ban', { userId: OTHER_USER_ID, isBanned: 'yes' }, ADMIN_ID);
  assert.strictEqual(invalidBanType.valid, false);
});

test('Issue #19 - Validación de Restablecimiento de Contraseñas', () => {
  // 1. Modalidad enlace de recuperación
  const validLink = validateUserAction('reset_password', {
    userId: OTHER_USER_ID,
    mode: 'link',
    email: 'cliente@neroelectricmotors.com',
  });
  assert.strictEqual(validLink.valid, true);

  const invalidEmailLink = validateUserAction('reset_password', {
    userId: OTHER_USER_ID,
    mode: 'link',
    email: 'correo-sin-arroba',
  });
  assert.strictEqual(invalidEmailLink.valid, false);

  // 2. Modalidad directa (mínimo 8 caracteres)
  const validDirect = validateUserAction('reset_password', {
    userId: OTHER_USER_ID,
    mode: 'direct',
    password: 'PasswordSegura2026!',
  });
  assert.strictEqual(validDirect.valid, true);

  const shortPassword = validateUserAction('reset_password', {
    userId: OTHER_USER_ID,
    mode: 'direct',
    password: '123',
  });
  assert.strictEqual(shortPassword.valid, false);
  assert.ok(shortPassword.error.includes('al menos 8 caracteres'));
});

test('Issue #19 - Validación de Alta de Operadores y Usuarios', () => {
  const validUser = validateUserAction('create_user', {
    email: 'tecnico@neroelectricmotors.com',
    password: 'ClaveTecnico2026!',
    fullName: 'Carlos Ramos',
    phone: '987654321',
    role: 'admin',
  });
  assert.strictEqual(validUser.valid, true);

  // Nombre demasiado corto
  const invalidName = validateUserAction('create_user', {
    email: 'test@neroelectricmotors.com',
    password: 'Password123!',
    fullName: 'C',
    role: 'customer',
  });
  assert.strictEqual(invalidName.valid, false);
});

test('Issue #19 - Filtrado y formateo de estados de usuarios', () => {
  const mockUsers = [
    {
      id: '1',
      email: 'admin@neroelectricmotors.com',
      fullName: 'Administrador Principal',
      phone: '999111222',
      role: 'admin',
      isBanned: false,
    },
    {
      id: '2',
      email: 'cliente@gmail.com',
      fullName: 'Rosa Flores',
      phone: '988333444',
      role: 'customer',
      isBanned: false,
    },
    {
      id: '3',
      email: 'bloqueado@spam.com',
      fullName: 'Usuario Fraudulento',
      phone: null,
      role: 'customer',
      isBanned: true,
    },
  ];

  // Búsqueda por correo
  const byEmail = filterUsers(mockUsers, { search: 'rosa' });
  assert.strictEqual(byEmail.length, 1);
  assert.strictEqual(byEmail[0].fullName, 'Rosa Flores');

  // Filtro por rol
  const admins = filterUsers(mockUsers, { role: 'admin' });
  assert.strictEqual(admins.length, 1);
  assert.strictEqual(admins[0].email, 'admin@neroelectricmotors.com');

  // Filtro por estado bloqueado
  const banned = filterUsers(mockUsers, { status: 'banned' });
  assert.strictEqual(banned.length, 1);
  assert.strictEqual(banned[0].id, '3');

  // Formato visual
  const activeStatus = formatUserStatus(mockUsers[0]);
  assert.strictEqual(activeStatus.label, 'Activo');
  assert.ok(activeStatus.badgeClass.includes('emerald'));

  const bannedStatus = formatUserStatus(mockUsers[2]);
  assert.strictEqual(bannedStatus.label, 'Bloqueado');
  assert.ok(bannedStatus.badgeClass.includes('rose'));
});

test('Issue #19 - Integridad de la API /api/admin/users y aislamiento seguro', () => {
  const routePath = path.resolve('admin-panel/app/api/admin/users/route.ts');
  assert.strictEqual(fs.existsSync(routePath), true, 'La ruta /api/admin/users debe existir');

  const content = fs.readFileSync(routePath, 'utf8');
  assert.ok(content.includes('requireAdminApi()'), 'La ruta debe invocar requireAdminApi()');
  assert.ok(content.includes('set_role'), 'La ruta debe manejar la acción set_role');
  assert.ok(content.includes('toggle_ban'), 'La ruta debe manejar la acción toggle_ban');
  assert.ok(content.includes('reset_password'), 'La ruta debe manejar la acción reset_password');
  assert.ok(content.includes('create_user'), 'La ruta debe manejar la acción create_user');
  assert.ok(!content.includes('NEXT_PUBLIC_'), 'La ruta de servidor no debe depender de secretos cliente');
});

test('Issue #19 - UI: Módulo de Usuarios y Modales en AdminDashboardView.tsx', () => {
  const viewPath = path.resolve('admin-panel/components/admin/AdminDashboardView.tsx');
  const viewContent = fs.readFileSync(viewPath, 'utf8');

  // Módulo y Sidebar
  assert.ok(viewContent.includes("'usuarios'"), 'El módulo usuarios debe estar definido en ModuleId');
  assert.ok(viewContent.includes('Usuarios y Roles'), 'El sidebar debe mostrar la pestaña Usuarios y Roles');
  assert.ok(viewContent.includes('Seguridad y accesos'), 'El sidebar debe agrupar bajo Seguridad y accesos');

  // Tabla y Métricas
  assert.ok(viewContent.includes('Gestión de Usuarios, Roles y Accesos'), 'El encabezado debe estar presente');
  assert.ok(viewContent.includes('Total Usuarios'), 'Debe existir la tarjeta de total de usuarios');
  assert.ok(viewContent.includes('Administradores'), 'Debe existir la tarjeta de administradores');
  assert.ok(viewContent.includes('Bloqueados'), 'Debe existir la tarjeta de cuentas bloqueadas');

  // Modales operativos
  assert.ok(viewContent.includes('Modificar Rol de Usuario'), 'Debe existir el modal para cambiar rol');
  assert.ok(viewContent.includes('Bloquear Acceso a Usuario'), 'Debe existir el modal para bloquear/desbloquear');
  assert.ok(viewContent.includes('Restablecer Contraseña'), 'Debe existir el modal de restablecimiento de contraseña');
  assert.ok(viewContent.includes('Crear Nuevo Usuario / Operador'), 'Debe existir el modal para alta de usuarios');
});
