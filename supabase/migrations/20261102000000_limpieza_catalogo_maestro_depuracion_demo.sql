-- ==============================================================================
-- Migración: Depuración de Catálogo Inicial y Consolidación de Catálogo Maestro
-- Archivo: supabase/migrations/20261102000000_limpieza_catalogo_maestro_depuracion_demo.sql
-- Descripción:
-- 1. Elimina repuestos de demostración (DEMO-*) del prototipo inicial.
-- 2. Elimina modelos corruptos/ruido del scraper (juguetes, quads de combustión, repuestos en tabla modelos).
-- 3. Normaliza nombres de marcas oficiales (TAILG, YADEA, GREENLINE, KAYENCORP, CENTURY MOTORS).
-- 4. Actualiza los comentarios de las tablas para reflejar el Catálogo Maestro Oficial.
-- ==============================================================================

BEGIN;

-- 1. Eliminar repuestos de demostración del prototipo inicial
DELETE FROM compatibilidades
WHERE id_repuesto IN (
    SELECT id_repuesto FROM repuestos WHERE codigo_sku LIKE 'DEMO-%'
);

DELETE FROM repuestos
WHERE codigo_sku LIKE 'DEMO-%';

-- 2. Eliminar compatibilidades asignadas a modelos de prueba o infantiles
DELETE FROM compatibilidades
WHERE id_modelo IN (1, 2, 124, 125, 127, 128, 129, 133, 134, 136, 137, 138);

-- 3. Eliminar modelos corruptos/ruido
DELETE FROM modelos_moto
WHERE id_modelo IN (1, 2, 124, 125, 127, 128, 129, 133, 134, 136, 137, 138);

-- 4. Corregir y pulir nombres de vehículos de Century Motors
UPDATE modelos_moto SET nombre = 'Citycoco 4 Ruedas con Techo', voltaje_nominal_v = 60, potencia_motor_w = 1000 WHERE id_modelo = 123;
UPDATE modelos_moto SET nombre = 'Trimoto Excelencia con Techo', voltaje_nominal_v = 60, potencia_motor_w = 1000 WHERE id_modelo = 126;
UPDATE modelos_moto SET nombre = 'Trimoto Doble Fila V8', voltaje_nominal_v = 60, potencia_motor_w = 1000 WHERE id_modelo = 130;
UPDATE modelos_moto SET nombre = 'Trimoto Urbana para Adultos', voltaje_nominal_v = 72, potencia_motor_w = 1200 WHERE id_modelo = 131;
UPDATE modelos_moto SET nombre = 'Scooter Eléctrico Rapture TBK 10-5', voltaje_nominal_v = 60, potencia_motor_w = 1000 WHERE id_modelo = 132;
UPDATE modelos_moto SET nombre = 'Scooter Eléctrico M1', voltaje_nominal_v = 36, potencia_motor_w = 800 WHERE id_modelo = 135;

-- 5. Normalizar nombres canónicos de marcas
UPDATE marcas SET nombre = 'TAILG' WHERE id_marca = 1;
UPDATE marcas SET nombre = 'YADEA' WHERE id_marca = 2;
UPDATE marcas SET nombre = 'GREENLINE' WHERE id_marca = 3;
UPDATE marcas SET nombre = 'KAYENCORP' WHERE id_marca = 14;
UPDATE marcas SET nombre = 'CENTURY MOTORS' WHERE id_marca = 20;

-- 6. Actualizar comentarios formales de las tablas
COMMENT ON TABLE repuestos IS 'Catálogo Maestro Oficial de Repuestos y Componentes EV - NERO Electric Motors';
COMMENT ON TABLE modelos_moto IS 'Catálogo Maestro Oficial de Modelos de Motos y Vehículos Eléctricos';
COMMENT ON TABLE marcas IS 'Marcas Oficiales de Movilidad Eléctrica';
COMMENT ON TABLE compatibilidades IS 'Matriz Maestra de Compatibilidad Técnica EV';
COMMENT ON TABLE categorias IS 'Categorías Oficiales de Repuestos y Componentes EV';

COMMIT;
