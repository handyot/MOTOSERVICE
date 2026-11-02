import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Cargar credenciales locales si existen
let env = {};
try {
  const envContent = fs.readFileSync(path.join(ROOT_DIR, '.env.local'), 'utf8');
  envContent.split('\n').forEach((line) => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
  });
} catch {
  // Ignorar si no existe en CI
}

test('1. Endpoint /api/voltia/asistencia utiliza createOrderAdminClient para evitar bloqueo RLS', () => {
  const routeContent = fs.readFileSync(
    path.join(ROOT_DIR, 'app/api/voltia/asistencia/route.ts'),
    'utf8'
  );

  assert.ok(
    routeContent.includes('createOrderAdminClient'),
    'La ruta de asistencia debe importar y usar createOrderAdminClient'
  );

  assert.ok(
    routeContent.includes('normalizeRequestType') || routeContent.includes('VALID_REQUEST_TYPES'),
    'La ruta debe normalizar el tipo de solicitud para cumplir el CHECK constraint de PostgreSQL'
  );
});

test('2. VoltIAWidget envía solicitud compatible con el taller oficial', () => {
  const widgetContent = fs.readFileSync(
    path.join(ROOT_DIR, 'components/voltia/VoltIAWidget.tsx'),
    'utf8'
  );

  assert.ok(
    widgetContent.includes('/api/voltia/asistencia'),
    'VoltIAWidget debe invocar el endpoint /api/voltia/asistencia'
  );

  assert.ok(
    !widgetContent.includes("requestType: 'consulta_conversacional_voltia'"),
    'VoltIAWidget no debe enviar el tipo inválido consulta_conversacional_voltia'
  );
});

test('3. Persistencia en vivo: solicitudes de taller llegan a la BD y al panel administrativo', async () => {
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !secretKey) {
    console.log('Skipping live DB check: No Supabase secret credentials in environment');
    return;
  }

  const adminClient = createClient(supabaseUrl, secretKey);

  const testPayload = {
    nombre_contacto: 'Prueba Taller Automatizada',
    email_contacto: 'taller.test@neroelectric.com',
    telefono_contacto: '+51 912 345 678',
    tipo_solicitud: 'soporte_instalacion',
    descripcion: 'Solicitud de verificación técnica de motor y controlador en taller',
    detalles_tecnicos: {
      brand: 'TAILG',
      model: 'Optimus Mecha G3',
      testSuite: 'voltia-taller-asistencia.test.mjs',
    },
    estado: 'pendiente',
  };

  // Inserción simulando la operación del servidor
  const { data: inserted, error: insertError } = await adminClient
    .from('solicitudes_asistencia')
    .insert(testPayload)
    .select();

  assert.strictEqual(insertError, null, `La inserción en solicitudes_asistencia no debe fallar: ${insertError?.message}`);
  assert.ok(inserted && inserted.length > 0, 'Debe retornar el registro insertado');

  const insertedId = inserted[0].id_solicitud;

  // Verificación de lectura que realiza el panel administrativo en admin-panel/app/page.tsx
  const { data: panelList, error: readError } = await adminClient
    .from('solicitudes_asistencia')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);

  assert.strictEqual(readError, null, 'El panel administrativo debe poder leer las solicitudes');
  const foundInPanel = panelList.some((item) => item.id_solicitud === insertedId);
  assert.ok(foundInPanel, 'La solicitud recién registrada debe aparecer en la bandeja del panel administrativo');

  // Limpieza inmediata del registro de prueba
  const { error: deleteError } = await adminClient
    .from('solicitudes_asistencia')
    .delete()
    .eq('id_solicitud', insertedId);

  assert.strictEqual(deleteError, null, 'El registro de prueba debe poder eliminarse limpiamente');
});
