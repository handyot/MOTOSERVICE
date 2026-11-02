import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

test('Perú Locations Dataset: Cobertura de 25 departamentos, provincias y distritos', async () => {
  const {
    getDepartmentNames,
    getProvincesForDepartment,
    getDistrictsForProvince,
  } = await import('../lib/locations/peru-locations-core.mjs');

  // 1. Departamentos
  const departments = getDepartmentNames();
  assert.strictEqual(departments.length, 25, 'Deben existir exactamente 25 departamentos/regiones en el catálogo');
  assert.ok(departments.includes('Lima'), 'Debe incluir Lima');
  assert.ok(departments.includes('Callao'), 'Debe incluir Callao');
  assert.ok(departments.includes('Arequipa'), 'Debe incluir Arequipa');
  assert.ok(departments.includes('Cusco'), 'Debe incluir Cusco');
  assert.ok(departments.includes('La Libertad'), 'Debe incluir La Libertad');

  // 2. Provincias de Lima
  const limaProvinces = getProvincesForDepartment('Lima');
  assert.ok(limaProvinces.includes('Lima (Metropolitana)'), 'Lima debe incluir Lima (Metropolitana)');
  assert.ok(limaProvinces.includes('Cañete'), 'Lima debe incluir Cañete');

  // 3. 43 Distritos de Lima Metropolitana
  const limaDistricts = getDistrictsForProvince('Lima', 'Lima (Metropolitana)');
  assert.strictEqual(limaDistricts.length, 43, 'Lima Metropolitana debe incluir los 43 distritos oficiales');
  assert.ok(limaDistricts.includes('Miraflores'), 'Debe incluir Miraflores');
  assert.ok(limaDistricts.includes('San Isidro'), 'Debe incluir San Isidro');
  assert.ok(limaDistricts.includes('Santiago de Surco'), 'Debe incluir Santiago de Surco');
  assert.ok(limaDistricts.includes('San Borja'), 'Debe incluir San Borja');
  assert.ok(limaDistricts.includes('Los Olivos'), 'Debe incluir Los Olivos');
  assert.ok(limaDistricts.includes('San Juan de Lurigancho'), 'Debe incluir San Juan de Lurigancho');

  // 4. Distritos de Callao
  const callaoDistricts = getDistrictsForProvince('Callao', 'Callao');
  assert.ok(callaoDistricts.includes('Bellavista'), 'Callao debe incluir Bellavista');
  assert.ok(callaoDistricts.includes('La Punta'), 'Callao debe incluir La Punta');
  assert.ok(callaoDistricts.includes('Ventanilla'), 'Callao debe incluir Ventanilla');
});

test('Checkout UI: Menús interactivos y datalists para Departamento, Provincia y Distrito', () => {
  const checkoutFile = fs.readFileSync(path.join(ROOT_DIR, 'app/checkout/page.tsx'), 'utf8');

  // Verificar presencia de inputs y datalists
  assert.ok(checkoutFile.includes('list="list-departamentos"'), 'Debe existir input vinculado a list-departamentos');
  assert.ok(checkoutFile.includes('id="list-departamentos"'), 'Debe existir datalist id="list-departamentos"');

  assert.ok(checkoutFile.includes('list="list-provincias"'), 'Debe existir input vinculado a list-provincias');
  assert.ok(checkoutFile.includes('id="list-provincias"'), 'Debe existir datalist id="list-provincias"');

  assert.ok(checkoutFile.includes('list="list-distritos"'), 'Debe existir input vinculado a list-distritos');
  assert.ok(checkoutFile.includes('id="list-distritos"'), 'Debe existir datalist id="list-distritos"');

  // Verificar accesos rápidos para acelerar compra
  assert.ok(checkoutFile.includes('Lima Metropolitana'), 'Debe incluir acceso rápido para Lima Metropolitana');
  assert.ok(checkoutFile.includes('Callao'), 'Debe incluir acceso rápido para Callao');

  // Verificar que el formulario de invitados inicia limpio
  assert.ok(checkoutFile.includes("const [department, setDepartment] = useState('');"), 'Departamento debe iniciar vacío');
  assert.ok(checkoutFile.includes("const [province, setProvince] = useState('');"), 'Provincia debe iniciar vacía');
  assert.ok(checkoutFile.includes("const [district, setDistrict] = useState('');"), 'Distrito debe iniciar vacío');
});
