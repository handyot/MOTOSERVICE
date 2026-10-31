/**
 * MOTOSERVICE — Suite de Pruebas de Separación Arquitectónica (Tienda Pública vs Panel Administrativo)
 *
 * Verifica:
 * 1. Desacoplamiento real de rutas y vistas administrativas en WEB 1 (Tienda Pública).
 * 2. Estructura, guardianes RBAC (requireAdmin / requireAdminApi) y proxy en WEB 2 (admin-panel).
 * 3. Sincronización exacta de contratos y reglas de negocio compartidas (types, validations, importers, orders).
 * 4. Ausencia de fugas de claves secretas al navegador (NEXT_PUBLIC_*) y aislamiento server-only.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT_DIR = process.cwd();
const ADMIN_DIR = path.join(ROOT_DIR, 'admin-panel');

test('Separación Web 1 (Tienda Pública): no expone /admin ni /api/admin locales', () => {
  assert.strictEqual(
    fs.existsSync(path.join(ROOT_DIR, 'app', 'admin')),
    false,
    'app/admin no debe existir dentro de la tienda pública'
  );
  assert.strictEqual(
    fs.existsSync(path.join(ROOT_DIR, 'app', 'api', 'admin')),
    false,
    'app/api/admin no debe existir dentro de la tienda pública'
  );
  assert.strictEqual(
    fs.existsSync(path.join(ROOT_DIR, 'components', 'admin')),
    false,
    'components/admin no debe existir dentro de la tienda pública'
  );

  const storeProxy = fs.readFileSync(path.join(ROOT_DIR, 'proxy.ts'), 'utf8');
  assert.ok(
    storeProxy.includes("pathname.startsWith('/api/admin')"),
    'El proxy de la tienda pública debe interceptar y bloquear /api/admin con 404'
  );
  assert.ok(
    storeProxy.includes("pathname.startsWith('/cuenta')"),
    'El proxy de la tienda pública debe seguir protegiendo /cuenta'
  );

  const footerContent = fs.readFileSync(
    path.join(ROOT_DIR, 'components', 'layout', 'Footer.tsx'),
    'utf8'
  );
  assert.strictEqual(
    footerContent.includes('href="/admin"'),
    false,
    'El pie de página de la tienda pública no debe enlazar a /admin interno'
  );
});

test('Separación Web 2 (Panel Administrativo): estructura completa e independiente en admin-panel/', () => {
  const requiredFiles = [
    'package.json',
    'tsconfig.json',
    'next.config.ts',
    'vercel.json',
    '.env.example',
    'proxy.ts',
    'app/layout.tsx',
    'app/page.tsx',
    'app/login/page.tsx',
    'app/acceso-denegado/page.tsx',
    'app/recuperar-contrasena/page.tsx',
    'app/actualizar-contrasena/page.tsx',
    'app/auth/callback/route.ts',
    'app/auth/signout/route.ts',
    'app/api/admin/auth/session/route.ts',
    'app/api/admin/orders/update/route.ts',
    'app/api/admin/catalog/import/route.ts',
    'app/api/admin/catalog/manage/route.ts',
    'components/admin/AdminDashboardView.tsx',
    'components/admin/CatalogImporterView.tsx',
    'components/auth/AdminLoginForm.tsx',
    'lib/auth/server.ts',
    'lib/auth/actions.ts',
    'lib/supabase/client.ts',
    'lib/supabase/server.ts',
  ];

  for (const relPath of requiredFiles) {
    assert.strictEqual(
      fs.existsSync(path.join(ADMIN_DIR, relPath)),
      true,
      `Falta el archivo requerido en admin-panel: ${relPath}`
    );
  }
});

test('Seguridad RBAC en Web 2: verificación de requireAdmin y requireAdminApi (401 vs 403)', () => {
  const adminAuthServer = fs.readFileSync(
    path.join(ADMIN_DIR, 'lib', 'auth', 'server.ts'),
    'utf8'
  );

  assert.ok(
    adminAuthServer.includes("redirect('/login')"),
    'requireAdmin debe redirigir a /login cuando no hay sesión'
  );
  assert.ok(
    adminAuthServer.includes("redirect('/acceso-denegado')"),
    'requireAdmin debe redirigir a /acceso-denegado cuando el rol no es admin'
  );
  assert.ok(
    adminAuthServer.includes('status: 401') && adminAuthServer.includes('status: 403'),
    'requireAdminApi debe retornar códigos HTTP 401 (no autenticado) y 403 (customer no autorizado)'
  );

  // Todas las rutas API del admin-panel deben usar requireAdminApi
  const apiRoutes = [
    'app/api/admin/orders/update/route.ts',
    'app/api/admin/catalog/import/route.ts',
    'app/api/admin/catalog/manage/route.ts',
  ];
  for (const route of apiRoutes) {
    const content = fs.readFileSync(path.join(ADMIN_DIR, route), 'utf8');
    assert.ok(
      content.includes('requireAdminApi()'),
      `La ruta administrativa ${route} debe validar permisos con requireAdminApi()`
    );
  }
});

test('Sincronización de contratos compartidos entre Tienda Pública y Panel Administrativo', () => {
  const sharedPairs = [
    ['types/index.ts', 'admin-panel/types/index.ts'],
    ['lib/auth/validations.mjs', 'admin-panel/lib/auth/validations.mjs'],
    ['lib/orders/order-core.mjs', 'admin-panel/lib/orders/order-core.mjs'],
    ['lib/importers/importer-core.mjs', 'admin-panel/lib/importers/importer-core.mjs'],
    ['lib/constants.js', 'admin-panel/lib/constants.js'],
    ['lib/formatters.js', 'admin-panel/lib/formatters.js'],
  ];

  for (const [storeFile, adminFile] of sharedPairs) {
    const storeContent = fs
      .readFileSync(path.join(ROOT_DIR, storeFile), 'utf8')
      .replace(/[ \t]+$/gm, '');
    const adminContent = fs
      .readFileSync(path.join(ROOT_DIR, adminFile), 'utf8')
      .replace(/[ \t]+$/gm, '');
    assert.strictEqual(
      storeContent,
      adminContent,
      `Desfase detectado en contrato compartido: ${storeFile} vs ${adminFile}`
    );
  }
});

test('Auditoría de secretos: ninguna clave administrativa expuesta al cliente', () => {
  const adminServerSupabase = fs.readFileSync(
    path.join(ADMIN_DIR, 'lib', 'supabase', 'server.ts'),
    'utf8'
  );
  assert.ok(
    adminServerSupabase.includes('typeof window !== "undefined"'),
    'admin-panel/lib/supabase/server.ts debe bloquear su ejecución en el navegador'
  );

  const clientFiles = [
    path.join(ADMIN_DIR, 'lib', 'supabase', 'client.ts'),
    path.join(ADMIN_DIR, 'components', 'auth', 'AdminLoginForm.tsx'),
    path.join(ADMIN_DIR, 'components', 'admin', 'AdminDashboardView.tsx'),
    path.join(ADMIN_DIR, 'components', 'admin', 'CatalogImporterView.tsx'),
  ];

  for (const file of clientFiles) {
    const content = fs.readFileSync(file, 'utf8');
    assert.strictEqual(
      content.includes('SUPABASE_SECRET_KEY') || content.includes('SUPABASE_SERVICE_ROLE_KEY'),
      false,
      `El archivo cliente ${file} no debe referenciar claves administrativas secretas`
    );
  }
});

test('Configuración de dominios definitivos y ausencia de placeholders DOMINIO_REAL', () => {
  const storeEnvExample = fs.readFileSync(path.join(ROOT_DIR, '.env.example'), 'utf8');
  const adminEnvExample = fs.readFileSync(path.join(ADMIN_DIR, '.env.example'), 'utf8');
  const storeLayout = fs.readFileSync(path.join(ROOT_DIR, 'app', 'layout.tsx'), 'utf8');
  const adminLayout = fs.readFileSync(path.join(ADMIN_DIR, 'app', 'layout.tsx'), 'utf8');
  const adminDashboard = fs.readFileSync(
    path.join(ADMIN_DIR, 'components', 'admin', 'AdminDashboardView.tsx'),
    'utf8'
  );
  const adminLogin = fs.readFileSync(path.join(ADMIN_DIR, 'app', 'login', 'page.tsx'), 'utf8');
  const adminDenied = fs.readFileSync(
    path.join(ADMIN_DIR, 'app', 'acceso-denegado', 'page.tsx'),
    'utf8'
  );

  assert.ok(
    storeEnvExample.includes('NEXT_PUBLIC_SITE_URL=https://neroelectricmotors.com'),
    '.env.example raíz debe definir NEXT_PUBLIC_SITE_URL=https://neroelectricmotors.com'
  );
  assert.ok(
    storeEnvExample.includes('NEXT_PUBLIC_ADMIN_PANEL_URL=https://panel.neroelectricmotors.com'),
    '.env.example raíz debe definir NEXT_PUBLIC_ADMIN_PANEL_URL=https://panel.neroelectricmotors.com'
  );
  assert.ok(
    adminEnvExample.includes('NEXT_PUBLIC_SITE_URL=https://panel.neroelectricmotors.com'),
    'admin-panel/.env.example debe definir NEXT_PUBLIC_SITE_URL=https://panel.neroelectricmotors.com'
  );
  assert.ok(
    adminEnvExample.includes('NEXT_PUBLIC_STOREFRONT_URL=https://neroelectricmotors.com'),
    'admin-panel/.env.example debe definir NEXT_PUBLIC_STOREFRONT_URL=https://neroelectricmotors.com'
  );
  assert.ok(
    storeLayout.includes('https://neroelectricmotors.com'),
    'app/layout.tsx debe tener https://neroelectricmotors.com como metadataBase de respaldo'
  );
  assert.ok(
    adminLayout.includes('https://panel.neroelectricmotors.com'),
    'admin-panel/app/layout.tsx debe tener https://panel.neroelectricmotors.com como metadataBase de respaldo'
  );
  assert.ok(
    adminDashboard.includes("process.env.NEXT_PUBLIC_STOREFRONT_URL || 'https://neroelectricmotors.com'"),
    'AdminDashboardView.tsx debe apuntar a https://neroelectricmotors.com mediante NEXT_PUBLIC_STOREFRONT_URL'
  );
  assert.ok(
    adminLogin.includes("process.env.NEXT_PUBLIC_STOREFRONT_URL || 'https://neroelectricmotors.com'"),
    'admin-panel/app/login/page.tsx debe apuntar a https://neroelectricmotors.com mediante NEXT_PUBLIC_STOREFRONT_URL'
  );
  assert.ok(
    adminDenied.includes("process.env.NEXT_PUBLIC_STOREFRONT_URL || 'https://neroelectricmotors.com'"),
    'admin-panel/app/acceso-denegado/page.tsx debe apuntar a https://neroelectricmotors.com mediante NEXT_PUBLIC_STOREFRONT_URL'
  );

  for (const content of [storeEnvExample, adminEnvExample, storeLayout, adminLayout]) {
    assert.strictEqual(
      content.includes('DOMINIO_REAL'),
      false,
      'Ninguna plantilla ni layout debe contener el placeholder DOMINIO_REAL'
    );
  }
});

test('Independencia de compilación de admin-panel/ para Vercel (Root Directory = admin-panel)', () => {
  function walkFiles(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    let results = [];
    for (const entry of entries) {
      if (entry.name === 'node_modules' || entry.name === '.next' || entry.name.startsWith('.')) {
        continue;
      }
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        results = results.concat(walkFiles(fullPath));
      } else if (/\.(ts|tsx|js|jsx|mjs)$/.test(entry.name)) {
        results.push(fullPath);
      }
    }
    return results;
  }

  const adminSourceFiles = walkFiles(ADMIN_DIR);
  const importRegex = /(?:from|import)\s*\(?['"](\.[^'"]+)['"]\)?/g;

  for (const file of adminSourceFiles) {
    const content = fs.readFileSync(file, 'utf8');
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      const relImport = match[1];
      const resolvedTarget = path.resolve(path.dirname(file), relImport);
      assert.ok(
        resolvedTarget.startsWith(ADMIN_DIR),
        `El archivo ${path.relative(ROOT_DIR, file)} importa "${relImport}" que escapa de admin-panel/ hacia ${resolvedTarget}`
      );
    }
  }
});

test('Arquitectura visual ERP en Web 2: Sidebar agrupado, Topbar y 10 módulos operativos sin fila de pestañas A-J', () => {
  const dashboardView = fs.readFileSync(
    path.join(ADMIN_DIR, 'components', 'admin', 'AdminDashboardView.tsx'),
    'utf8'
  );

  // Verificar que desapareció la antigua fila horizontal de pestañas A-J
  assert.strictEqual(
    dashboardView.includes('A. Resumen Operativo'),
    false,
    'La antigua fila horizontal de pestañas A-J no debe existir'
  );

  // Verificar presencia de los 6 grupos de navegación en el Sidebar
  const requiredGroups = [
    'General',
    'Catálogo e inventario',
    'Operaciones comerciales',
    'Administración y logística',
    'Servicio y asistencia',
    'Herramientas',
  ];
  for (const group of requiredGroups) {
    assert.ok(
      dashboardView.includes(group),
      `El sidebar del ERP debe incluir el grupo de navegación "${group}"`
    );
  }

  // Verificar que los 10 módulos administrativos siguen accesibles y conectados
  const requiredModuleIds = [
    'resumen',
    'catalogo_db',
    'productos',
    'pedidos',
    'clientes',
    'promociones',
    'facturacion',
    'despacho',
    'voltia',
    'importador',
  ];
  for (const modId of requiredModuleIds) {
    assert.ok(
      dashboardView.includes(`'${modId}'`),
      `El módulo administrativo "${modId}" debe estar presente y accesible`
    );
  }
});
