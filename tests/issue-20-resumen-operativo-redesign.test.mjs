/**
 * MOTOSERVICE — Suite de Pruebas: Rediseño del Resumen Operativo (Issue #20)
 *
 * Verifica:
 * 1. Jerarquía visual en 4 niveles operativos en AdminDashboardView.tsx.
 * 2. Cifras y títulos principales de los 4 indicadores (Marcas/modelos, Repuestos/matriz, Asistencia, Suscripciones).
 * 3. Alertas y pendientes operativos con diferenciación de urgencia e información preventiva.
 * 4. Estado de servicios e integraciones honesto (Culqi 3DS, SUNAT, Supabase).
 * 5. Tablas de actividad reciente con tipografía legible, alineaciones monetarias y estados vacíos claros.
 * 6. Preservación intacta de enlaces de navegación y botones de acción.
 * 7. Ausencia de métricas inventadas o porcentajes ficticios.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const VIEW_PATH = path.resolve('admin-panel/components/admin/AdminDashboardView.tsx');

test('Issue #20 - Nivel 1: Encabezado operativo estructurado con fecha y acciones generales', () => {
  const content = fs.readFileSync(VIEW_PATH, 'utf8');

  assert.ok(content.includes('Resumen operativo'), 'El encabezado debe contener el título Resumen operativo');
  assert.ok(content.includes('{formattedCurrentDate}'), 'Debe renderizar la fecha actual formateada');
  assert.ok(content.includes('Gestionar catálogo'), 'Debe ofrecer acceso directo a gestionar catálogo');
  assert.ok(content.includes('Importar catálogo CSV/JSON'), 'Debe ofrecer acceso directo al importador');
});

test('Issue #20 - Nivel 2: Los cuatro indicadores principales conservan datos reales y enlaces', () => {
  const content = fs.readFileSync(VIEW_PATH, 'utf8');

  // KPI 1: Marcas y modelos
  assert.ok(content.includes('Marcas y modelos'), 'KPI 1 debe etiquetarse claramente');
  assert.ok(content.includes('{stats.totalMarcas}'), 'KPI 1 debe mostrar totalMarcas');
  assert.ok(content.includes('{stats.totalModelos}'), 'KPI 1 debe mostrar totalModelos');
  assert.ok(content.includes("setCatalogEntityTab('modelos')"), 'KPI 1 debe enlazar a modelos');
  assert.ok(content.includes('Ver modelos'), 'KPI 1 debe tener botón Ver modelos');

  // KPI 2: Repuestos y compatibilidades
  assert.ok(content.includes('Repuestos y compatibilidad'), 'KPI 2 debe etiquetarse claramente');
  assert.ok(content.includes('{stats.totalRepuestos}'), 'KPI 2 debe mostrar totalRepuestos');
  assert.ok(content.includes('{stats.totalCompatibilidades}'), 'KPI 2 debe mostrar totalCompatibilidades');
  assert.ok(content.includes("setCatalogEntityTab('repuestos')"), 'KPI 2 debe enlazar a repuestos');
  assert.ok(content.includes('Ver matriz'), 'KPI 2 debe tener botón Ver matriz');

  // KPI 3: Solicitudes de asistencia
  assert.ok(content.includes('Solicitudes de asistencia'), 'KPI 3 debe etiquetarse claramente');
  assert.ok(content.includes('{initialAssistance.length}'), 'KPI 3 debe mostrar initialAssistance.length');
  assert.ok(content.includes('Abrir bandeja'), 'KPI 3 debe tener botón Abrir bandeja');
  assert.ok(content.includes("setActiveModule('voltia')"), 'KPI 3 debe enlazar al módulo VoltIA');

  // KPI 4: Suscripciones comerciales
  assert.ok(content.includes('Suscripciones comerciales'), 'KPI 4 debe etiquetarse claramente');
  assert.ok(content.includes('{initialSubscriptions.length}'), 'KPI 4 debe mostrar initialSubscriptions.length');
  assert.ok(content.includes('Ver registros'), 'KPI 4 debe tener botón Ver registros');
  assert.ok(content.includes("setActiveModule('promociones')"), 'KPI 4 debe enlazar a promociones');

  // Prohibición estricta de métricas o porcentajes ficticios
  assert.strictEqual(content.includes('+12%'), false, 'No deben existir porcentajes ficticios de crecimiento');
  assert.strictEqual(content.includes('+5.4%'), false, 'No deben existir porcentajes ficticios de crecimiento');
  assert.strictEqual(content.includes('+8.2%'), false, 'No deben existir porcentajes ficticios de crecimiento');
});

test('Issue #20 - Nivel 3: Alertas operativas, información preventiva y estado vacío', () => {
  const content = fs.readFileSync(VIEW_PATH, 'utf8');

  assert.ok(content.includes('Alertas y pendientes operativos'), 'Debe existir la sección de alertas');
  assert.ok(content.includes('pendingOrdersCount'), 'Debe considerar los pedidos pendientes de despacho');
  assert.ok(content.includes('pendingAssistanceCount'), 'Debe considerar las solicitudes de asistencia pendientes');
  assert.ok(content.includes('Flujo operativo al día'), 'Debe presentar estado vacío cuando no hay pendientes');
  assert.ok(content.includes('Ir a pedidos'), 'Debe tener acción directa hacia pedidos');
  assert.ok(content.includes('Revisar'), 'Debe tener acción directa hacia asistencia');
  assert.ok(content.includes('Importador'), 'Debe tener acción directa hacia el importador');
});

test('Issue #20 - Nivel 3: Estado de servicios e integraciones con diagnósticos honestos', () => {
  const content = fs.readFileSync(VIEW_PATH, 'utf8');

  assert.ok(content.includes('Estado de servicios e integraciones'), 'Debe existir la sección de integraciones');
  assert.ok(content.includes('Adaptador de Pagos Culqi 3DS'), 'Debe incluir servicio Culqi 3DS');
  assert.ok(content.includes('Modo Pruebas / Sandbox'), 'Culqi debe reflejar estado honesto de pruebas');
  assert.ok(content.includes('Preparación Fiscal SUNAT'), 'Debe incluir preparación fiscal SUNAT');
  assert.ok(content.includes('Sin Vínculo OSE'), 'SUNAT debe reportar que no tiene vínculo OSE activo');
  assert.ok(content.includes('Supabase PostgreSQL & Control RBAC'), 'Debe incluir Supabase PostgreSQL');
  assert.ok(content.includes('Operativo y Sincronizado'), 'Supabase debe reportar estado operativo');
});

test('Issue #20 - Nivel 4: Actividad reciente (Pedidos y Asistencia Técnica)', () => {
  const content = fs.readFileSync(VIEW_PATH, 'utf8');

  // Pedidos recientes
  assert.ok(content.includes('Pedidos recientes'), 'Debe titularse Pedidos recientes');
  assert.ok(content.includes('Ver todos ({orders.length})'), 'Debe ofrecer enlace para ver todos los pedidos');
  assert.ok(content.includes('Sin pedidos registrados actualmente'), 'Debe tener estado vacío para pedidos');
  assert.ok(content.includes('renderOrderStatusBadge(o.estado_pedido)'), 'Debe renderizar los badges de estado');

  // Solicitudes de asistencia recientes
  assert.ok(content.includes('Solicitudes de asistencia recientes'), 'Debe titularse Solicitudes de asistencia recientes');
  assert.ok(content.includes('Ver bandeja ({initialAssistance.length})'), 'Debe ofrecer enlace para ver la bandeja');
  assert.ok(content.includes('No hay solicitudes de asistencia registradas'), 'Debe tener estado vacío para asistencia');
  assert.ok(content.includes('ast.tipo_solicitud'), 'Debe destacar el tipo de solicitud');
});
