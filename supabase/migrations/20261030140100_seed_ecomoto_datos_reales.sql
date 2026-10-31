-- ==============================================================================
-- Semilla de Datos Reales EcoMoto Perú (Idempotente)
-- Archivo: supabase/migrations/20261030140100_seed_ecomoto_datos_reales.sql
-- Descripción: Inserción idempotente de marcas, proveedores, categorías,
--              modelos_moto (52), repuestos_proveedor (19) y compatibilidades (46).
-- ==============================================================================

BEGIN;

-- 1. MARCAS OFICIALES
-- Identificación normalizada con UPPER(TRIM(nombre)): reutiliza las marcas existentes
-- en producción ('Tailg', 'Yadea', 'GreenLine') preservando sus nombres de presentación
-- y sin crear registros duplicados; inserta únicamente las marcas ausentes.
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT * FROM (VALUES
            ('Tailg', 'TAILG', 'https://tailg.com.pe/'),
            ('Yadea', 'YADEA', 'https://yadea.pe/'),
            ('Kayencorp', 'KAYENCORP', 'https://kayencorp.com/'),
            ('GreenLine', 'GREENLINE', 'https://glperu.com/')
        ) AS t(display_name, norm_name, web_url)
    LOOP
        UPDATE marcas
        SET sitio_web = r.web_url,
            estado = true
        WHERE UPPER(TRIM(nombre)) = r.norm_name;

        IF NOT FOUND THEN
            INSERT INTO marcas (nombre, sitio_web, estado)
            VALUES (r.display_name, r.web_url, true)
            ON CONFLICT (nombre) DO UPDATE SET
                sitio_web = EXCLUDED.sitio_web,
                estado = EXCLUDED.estado;
        END IF;
    END LOOP;
END $$;

-- 2. PROVEEDORES OFICIALES
INSERT INTO proveedores (nombre, sitio_web, politica_comercial, estado) VALUES
('TAILG Perú', 'https://tailg.com.pe/', 'CONSULTA_EXTERNA', true),
('GreenLine Perú', 'https://glperu.com/', 'CONSULTA_EXTERNA', true),
('Kayencorp Perú', 'https://kayencorp.com/', 'CONSULTA_EXTERNA', true),
('YADEA Perú', 'https://yadea.pe/', 'CONSULTA_EXTERNA', true)
ON CONFLICT (nombre) DO UPDATE SET
    sitio_web = EXCLUDED.sitio_web,
    politica_comercial = EXCLUDED.politica_comercial;

-- 3. CATEGORÍAS
-- Reutiliza categorías preexistentes insensible a mayúsculas (ej. 'Frenos' vs 'FRENOS')
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT * FROM (VALUES
            ('CARGADOR', 'Cargadores de batería inteligentes y rápidos para motos y VMP.'),
            ('BATERIA', 'Packs de batería de grafeno, plomo y litio (LiFePO4, LMFP, NMC).'),
            ('ACCESORIO', 'Accesorios de carrocería, espejos y complementos de chasis.'),
            ('ESPEJO', 'Espejos retrovisores originales y universales.'),
            ('CARROCERIA', 'Partes de carrocería, guardafangos y carenados.'),
            ('FRENOS', 'Sistemas de frenado, pastillas, discos y componentes hidráulicos.')
        ) AS t(cat_name, cat_desc)
    LOOP
        UPDATE categorias
        SET descripcion = r.cat_desc,
            estado = true
        WHERE UPPER(TRIM(nombre)) = UPPER(TRIM(r.cat_name));

        IF NOT FOUND THEN
            INSERT INTO categorias (nombre, descripcion, estado)
            VALUES (r.cat_name, r.cat_desc, true)
            ON CONFLICT (nombre) DO UPDATE SET
                descripcion = EXCLUDED.descripcion,
                estado = EXCLUDED.estado;
        END IF;
    END LOOP;
END $$;

-- 4. MODELOS DE MOTOCICLETAS (52 registros)

INSERT INTO modelos_moto (
    id_marca, nombre, slug, vehicle_type, listing_status, data_status,
    precio_referencial_pen, precio_regular_pen, precio_min_pen, precio_max_pen,
    potencia_motor_w, potencia_max_w, bateria_quimica, voltaje_nominal_v,
    bateria_capacidad_ah, bateria_extraible, velocidad_max_kmh,
    autonomia_min_km, autonomia_max_km, source_url, source_checked_on, notas, estado
) VALUES (
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'TAILG' LIMIT 1),
    'E5',
    'tailg-e5',
    'MOTO_ELECTRICA',
    'CATALOGO',
    'PARCIAL',
    3400, 3700, 3400, 3400,
    1000, NULL, 'PLOMO_GRAFENO', 72,
    23, 'NO_DECLARADO', NULL,
    NULL, NULL, 'https://tailg.com.pe/motos/motos-electricas/', '2026-10-30', 'La página de listado publica motor 1000 W, batería 72 V 23 Ah y precio rebajado. Velocidad/autonomía no indicadas en el extracto consultado.', true
)
ON CONFLICT (id_marca, nombre) DO UPDATE SET
    slug = EXCLUDED.slug,
    vehicle_type = EXCLUDED.vehicle_type,
    listing_status = EXCLUDED.listing_status,
    data_status = EXCLUDED.data_status,
    precio_referencial_pen = EXCLUDED.precio_referencial_pen,
    precio_regular_pen = EXCLUDED.precio_regular_pen,
    precio_min_pen = EXCLUDED.precio_min_pen,
    precio_max_pen = EXCLUDED.precio_max_pen,
    potencia_motor_w = EXCLUDED.potencia_motor_w,
    potencia_max_w = EXCLUDED.potencia_max_w,
    bateria_quimica = EXCLUDED.bateria_quimica,
    voltaje_nominal_v = EXCLUDED.voltaje_nominal_v,
    bateria_capacidad_ah = EXCLUDED.bateria_capacidad_ah,
    bateria_extraible = EXCLUDED.bateria_extraible,
    velocidad_max_kmh = EXCLUDED.velocidad_max_kmh,
    autonomia_min_km = EXCLUDED.autonomia_min_km,
    autonomia_max_km = EXCLUDED.autonomia_max_km,
    source_url = EXCLUDED.source_url,
    source_checked_on = EXCLUDED.source_checked_on,
    notas = EXCLUDED.notas;

INSERT INTO modelos_moto (
    id_marca, nombre, slug, vehicle_type, listing_status, data_status,
    precio_referencial_pen, precio_regular_pen, precio_min_pen, precio_max_pen,
    potencia_motor_w, potencia_max_w, bateria_quimica, voltaje_nominal_v,
    bateria_capacidad_ah, bateria_extraible, velocidad_max_kmh,
    autonomia_min_km, autonomia_max_km, source_url, source_checked_on, notas, estado
) VALUES (
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'TAILG' LIMIT 1),
    'N6 Super S',
    'tailg-n6-super-s',
    'MOTO_ELECTRICA',
    'CATALOGO',
    'VERIFICADO_EN_FICHA',
    3850, NULL, 3850, 3850,
    1200, NULL, 'PLOMO_GRAFENO', 72,
    23, 'NO_DECLARADO', 65,
    NULL, 80, 'https://tailg.com.pe/producto/motos-electricas/urbano-vintage/moto-electrica-tailg-n6/', '2026-10-30', 'Autonomía publicada: hasta 80 km. Incluye varias funciones inteligentes; no usar estas características para deducir compatibilidad de repuestos.', true
)
ON CONFLICT (id_marca, nombre) DO UPDATE SET
    slug = EXCLUDED.slug,
    vehicle_type = EXCLUDED.vehicle_type,
    listing_status = EXCLUDED.listing_status,
    data_status = EXCLUDED.data_status,
    precio_referencial_pen = EXCLUDED.precio_referencial_pen,
    precio_regular_pen = EXCLUDED.precio_regular_pen,
    precio_min_pen = EXCLUDED.precio_min_pen,
    precio_max_pen = EXCLUDED.precio_max_pen,
    potencia_motor_w = EXCLUDED.potencia_motor_w,
    potencia_max_w = EXCLUDED.potencia_max_w,
    bateria_quimica = EXCLUDED.bateria_quimica,
    voltaje_nominal_v = EXCLUDED.voltaje_nominal_v,
    bateria_capacidad_ah = EXCLUDED.bateria_capacidad_ah,
    bateria_extraible = EXCLUDED.bateria_extraible,
    velocidad_max_kmh = EXCLUDED.velocidad_max_kmh,
    autonomia_min_km = EXCLUDED.autonomia_min_km,
    autonomia_max_km = EXCLUDED.autonomia_max_km,
    source_url = EXCLUDED.source_url,
    source_checked_on = EXCLUDED.source_checked_on,
    notas = EXCLUDED.notas;

INSERT INTO modelos_moto (
    id_marca, nombre, slug, vehicle_type, listing_status, data_status,
    precio_referencial_pen, precio_regular_pen, precio_min_pen, precio_max_pen,
    potencia_motor_w, potencia_max_w, bateria_quimica, voltaje_nominal_v,
    bateria_capacidad_ah, bateria_extraible, velocidad_max_kmh,
    autonomia_min_km, autonomia_max_km, source_url, source_checked_on, notas, estado
) VALUES (
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'TAILG' LIMIT 1),
    'F55 Mecha G2',
    'tailg-f55-mecha-g2',
    'MOTO_ELECTRICA',
    'CATALOGO',
    'VERIFICADO_EN_FICHA',
    4700, 4900, 4700, 4700,
    1200, NULL, 'PLOMO_GRAFENO', 72,
    35, 'NO_DECLARADO', 60,
    NULL, 90, 'https://tailg.com.pe/producto/motos-electricas/mecha-deportiva/moto-electrica-tailg-f55/', '2026-10-30', 'La ficha publicada indica autonomía de hasta 90 km.', true
)
ON CONFLICT (id_marca, nombre) DO UPDATE SET
    slug = EXCLUDED.slug,
    vehicle_type = EXCLUDED.vehicle_type,
    listing_status = EXCLUDED.listing_status,
    data_status = EXCLUDED.data_status,
    precio_referencial_pen = EXCLUDED.precio_referencial_pen,
    precio_regular_pen = EXCLUDED.precio_regular_pen,
    precio_min_pen = EXCLUDED.precio_min_pen,
    precio_max_pen = EXCLUDED.precio_max_pen,
    potencia_motor_w = EXCLUDED.potencia_motor_w,
    potencia_max_w = EXCLUDED.potencia_max_w,
    bateria_quimica = EXCLUDED.bateria_quimica,
    voltaje_nominal_v = EXCLUDED.voltaje_nominal_v,
    bateria_capacidad_ah = EXCLUDED.bateria_capacidad_ah,
    bateria_extraible = EXCLUDED.bateria_extraible,
    velocidad_max_kmh = EXCLUDED.velocidad_max_kmh,
    autonomia_min_km = EXCLUDED.autonomia_min_km,
    autonomia_max_km = EXCLUDED.autonomia_max_km,
    source_url = EXCLUDED.source_url,
    source_checked_on = EXCLUDED.source_checked_on,
    notas = EXCLUDED.notas;

INSERT INTO modelos_moto (
    id_marca, nombre, slug, vehicle_type, listing_status, data_status,
    precio_referencial_pen, precio_regular_pen, precio_min_pen, precio_max_pen,
    potencia_motor_w, potencia_max_w, bateria_quimica, voltaje_nominal_v,
    bateria_capacidad_ah, bateria_extraible, velocidad_max_kmh,
    autonomia_min_km, autonomia_max_km, source_url, source_checked_on, notas, estado
) VALUES (
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'TAILG' LIMIT 1),
    'M1 Plus',
    'tailg-m1-plus',
    'MOTO_ELECTRICA',
    'CATALOGO',
    'PARCIAL',
    3600, NULL, 3600, 3600,
    1000, NULL, 'PLOMO_GRAFENO', 72,
    NULL, 'NO_DECLARADO', NULL,
    NULL, NULL, 'https://tailg.com.pe/producto/motos-electricas/urbano-vintage/moto-electrica-tailg-m1-plus/', '2026-10-30', 'La ficha resumida indica motor 1000 W y batería 72 V; capacidad Ah, velocidad y autonomía no estaban explícitas en el extracto.', true
)
ON CONFLICT (id_marca, nombre) DO UPDATE SET
    slug = EXCLUDED.slug,
    vehicle_type = EXCLUDED.vehicle_type,
    listing_status = EXCLUDED.listing_status,
    data_status = EXCLUDED.data_status,
    precio_referencial_pen = EXCLUDED.precio_referencial_pen,
    precio_regular_pen = EXCLUDED.precio_regular_pen,
    precio_min_pen = EXCLUDED.precio_min_pen,
    precio_max_pen = EXCLUDED.precio_max_pen,
    potencia_motor_w = EXCLUDED.potencia_motor_w,
    potencia_max_w = EXCLUDED.potencia_max_w,
    bateria_quimica = EXCLUDED.bateria_quimica,
    voltaje_nominal_v = EXCLUDED.voltaje_nominal_v,
    bateria_capacidad_ah = EXCLUDED.bateria_capacidad_ah,
    bateria_extraible = EXCLUDED.bateria_extraible,
    velocidad_max_kmh = EXCLUDED.velocidad_max_kmh,
    autonomia_min_km = EXCLUDED.autonomia_min_km,
    autonomia_max_km = EXCLUDED.autonomia_max_km,
    source_url = EXCLUDED.source_url,
    source_checked_on = EXCLUDED.source_checked_on,
    notas = EXCLUDED.notas;

INSERT INTO modelos_moto (
    id_marca, nombre, slug, vehicle_type, listing_status, data_status,
    precio_referencial_pen, precio_regular_pen, precio_min_pen, precio_max_pen,
    potencia_motor_w, potencia_max_w, bateria_quimica, voltaje_nominal_v,
    bateria_capacidad_ah, bateria_extraible, velocidad_max_kmh,
    autonomia_min_km, autonomia_max_km, source_url, source_checked_on, notas, estado
) VALUES (
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'TAILG' LIMIT 1),
    'Optimus Mecha G3',
    'tailg-optimus-mecha-g3',
    'MOTO_ELECTRICA',
    'CATALOGO',
    'PARCIAL',
    5900, NULL, 5900, 5900,
    2000, NULL, 'PLOMO_GRAFENO', 72,
    35, 'NO_DECLARADO', 70,
    NULL, NULL, 'https://tailg.com.pe/producto/motos-electricas/mecha-deportiva/moto-electrica-tailg-optimus/', '2026-10-30', 'La ficha/listado indica motor 2000 W, batería 72 V 35 Ah y velocidad máxima 70 km/h.', true
)
ON CONFLICT (id_marca, nombre) DO UPDATE SET
    slug = EXCLUDED.slug,
    vehicle_type = EXCLUDED.vehicle_type,
    listing_status = EXCLUDED.listing_status,
    data_status = EXCLUDED.data_status,
    precio_referencial_pen = EXCLUDED.precio_referencial_pen,
    precio_regular_pen = EXCLUDED.precio_regular_pen,
    precio_min_pen = EXCLUDED.precio_min_pen,
    precio_max_pen = EXCLUDED.precio_max_pen,
    potencia_motor_w = EXCLUDED.potencia_motor_w,
    potencia_max_w = EXCLUDED.potencia_max_w,
    bateria_quimica = EXCLUDED.bateria_quimica,
    voltaje_nominal_v = EXCLUDED.voltaje_nominal_v,
    bateria_capacidad_ah = EXCLUDED.bateria_capacidad_ah,
    bateria_extraible = EXCLUDED.bateria_extraible,
    velocidad_max_kmh = EXCLUDED.velocidad_max_kmh,
    autonomia_min_km = EXCLUDED.autonomia_min_km,
    autonomia_max_km = EXCLUDED.autonomia_max_km,
    source_url = EXCLUDED.source_url,
    source_checked_on = EXCLUDED.source_checked_on,
    notas = EXCLUDED.notas;

INSERT INTO modelos_moto (
    id_marca, nombre, slug, vehicle_type, listing_status, data_status,
    precio_referencial_pen, precio_regular_pen, precio_min_pen, precio_max_pen,
    potencia_motor_w, potencia_max_w, bateria_quimica, voltaje_nominal_v,
    bateria_capacidad_ah, bateria_extraible, velocidad_max_kmh,
    autonomia_min_km, autonomia_max_km, source_url, source_checked_on, notas, estado
) VALUES (
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'TAILG' LIMIT 1),
    'F52 Mecha G1',
    'tailg-f52-mecha-g1',
    'MOTO_ELECTRICA',
    'CATALOGO',
    'VERIFICADO_EN_FICHA',
    4100, 4350, 4100, 4100,
    1200, NULL, 'PLOMO_GRAFENO', 72,
    23, 'NO_DECLARADO', 50,
    NULL, 75, 'https://tailg.com.pe/producto/motos-electricas/mecha-deportiva/moto-electrica-tailg-f52/', '2026-10-30', 'La ficha describe autonomía de hasta 75 km.', true
)
ON CONFLICT (id_marca, nombre) DO UPDATE SET
    slug = EXCLUDED.slug,
    vehicle_type = EXCLUDED.vehicle_type,
    listing_status = EXCLUDED.listing_status,
    data_status = EXCLUDED.data_status,
    precio_referencial_pen = EXCLUDED.precio_referencial_pen,
    precio_regular_pen = EXCLUDED.precio_regular_pen,
    precio_min_pen = EXCLUDED.precio_min_pen,
    precio_max_pen = EXCLUDED.precio_max_pen,
    potencia_motor_w = EXCLUDED.potencia_motor_w,
    potencia_max_w = EXCLUDED.potencia_max_w,
    bateria_quimica = EXCLUDED.bateria_quimica,
    voltaje_nominal_v = EXCLUDED.voltaje_nominal_v,
    bateria_capacidad_ah = EXCLUDED.bateria_capacidad_ah,
    bateria_extraible = EXCLUDED.bateria_extraible,
    velocidad_max_kmh = EXCLUDED.velocidad_max_kmh,
    autonomia_min_km = EXCLUDED.autonomia_min_km,
    autonomia_max_km = EXCLUDED.autonomia_max_km,
    source_url = EXCLUDED.source_url,
    source_checked_on = EXCLUDED.source_checked_on,
    notas = EXCLUDED.notas;

INSERT INTO modelos_moto (
    id_marca, nombre, slug, vehicle_type, listing_status, data_status,
    precio_referencial_pen, precio_regular_pen, precio_min_pen, precio_max_pen,
    potencia_motor_w, potencia_max_w, bateria_quimica, voltaje_nominal_v,
    bateria_capacidad_ah, bateria_extraible, velocidad_max_kmh,
    autonomia_min_km, autonomia_max_km, source_url, source_checked_on, notas, estado
) VALUES (
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'TAILG' LIMIT 1),
    'F52 NEO',
    'tailg-f52-neo',
    'MOTO_ELECTRICA',
    'CATALOGO',
    'VERIFICADO_EN_FICHA',
    4200, 4500, 4200, 4200,
    1200, NULL, 'PLOMO_GRAFENO', 72,
    23, 'NO_DECLARADO', 50,
    NULL, 70, 'https://tailg.com.pe/motos/motos-electricas/', '2026-10-30', 'Modelo F52 NEO en el listado oficial; autonomía publicada hasta 70 km.', true
)
ON CONFLICT (id_marca, nombre) DO UPDATE SET
    slug = EXCLUDED.slug,
    vehicle_type = EXCLUDED.vehicle_type,
    listing_status = EXCLUDED.listing_status,
    data_status = EXCLUDED.data_status,
    precio_referencial_pen = EXCLUDED.precio_referencial_pen,
    precio_regular_pen = EXCLUDED.precio_regular_pen,
    precio_min_pen = EXCLUDED.precio_min_pen,
    precio_max_pen = EXCLUDED.precio_max_pen,
    potencia_motor_w = EXCLUDED.potencia_motor_w,
    potencia_max_w = EXCLUDED.potencia_max_w,
    bateria_quimica = EXCLUDED.bateria_quimica,
    voltaje_nominal_v = EXCLUDED.voltaje_nominal_v,
    bateria_capacidad_ah = EXCLUDED.bateria_capacidad_ah,
    bateria_extraible = EXCLUDED.bateria_extraible,
    velocidad_max_kmh = EXCLUDED.velocidad_max_kmh,
    autonomia_min_km = EXCLUDED.autonomia_min_km,
    autonomia_max_km = EXCLUDED.autonomia_max_km,
    source_url = EXCLUDED.source_url,
    source_checked_on = EXCLUDED.source_checked_on,
    notas = EXCLUDED.notas;

INSERT INTO modelos_moto (
    id_marca, nombre, slug, vehicle_type, listing_status, data_status,
    precio_referencial_pen, precio_regular_pen, precio_min_pen, precio_max_pen,
    potencia_motor_w, potencia_max_w, bateria_quimica, voltaje_nominal_v,
    bateria_capacidad_ah, bateria_extraible, velocidad_max_kmh,
    autonomia_min_km, autonomia_max_km, source_url, source_checked_on, notas, estado
) VALUES (
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'TAILG' LIMIT 1),
    'X9 Super S',
    'tailg-x9-super-s',
    'MOTO_ELECTRICA',
    'CATALOGO',
    'VERIFICADO_EN_FICHA',
    5500, NULL, 5500, 5500,
    2000, NULL, 'PLOMO_GRAFENO', 72,
    35, 'NO_DECLARADO', 70,
    80, 90, 'https://tailg.com.pe/producto/motos-electricas/mecha-deportiva/moto-electrica-tailg-x9/', '2026-10-30', 'Ficha publica autonomía aproximada de 80–90 km; compatibilidad de repuestos debe validarse aparte.', true
)
ON CONFLICT (id_marca, nombre) DO UPDATE SET
    slug = EXCLUDED.slug,
    vehicle_type = EXCLUDED.vehicle_type,
    listing_status = EXCLUDED.listing_status,
    data_status = EXCLUDED.data_status,
    precio_referencial_pen = EXCLUDED.precio_referencial_pen,
    precio_regular_pen = EXCLUDED.precio_regular_pen,
    precio_min_pen = EXCLUDED.precio_min_pen,
    precio_max_pen = EXCLUDED.precio_max_pen,
    potencia_motor_w = EXCLUDED.potencia_motor_w,
    potencia_max_w = EXCLUDED.potencia_max_w,
    bateria_quimica = EXCLUDED.bateria_quimica,
    voltaje_nominal_v = EXCLUDED.voltaje_nominal_v,
    bateria_capacidad_ah = EXCLUDED.bateria_capacidad_ah,
    bateria_extraible = EXCLUDED.bateria_extraible,
    velocidad_max_kmh = EXCLUDED.velocidad_max_kmh,
    autonomia_min_km = EXCLUDED.autonomia_min_km,
    autonomia_max_km = EXCLUDED.autonomia_max_km,
    source_url = EXCLUDED.source_url,
    source_checked_on = EXCLUDED.source_checked_on,
    notas = EXCLUDED.notas;

INSERT INTO modelos_moto (
    id_marca, nombre, slug, vehicle_type, listing_status, data_status,
    precio_referencial_pen, precio_regular_pen, precio_min_pen, precio_max_pen,
    potencia_motor_w, potencia_max_w, bateria_quimica, voltaje_nominal_v,
    bateria_capacidad_ah, bateria_extraible, velocidad_max_kmh,
    autonomia_min_km, autonomia_max_km, source_url, source_checked_on, notas, estado
) VALUES (
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'TAILG' LIMIT 1),
    'F55L Litio Extraíble',
    'tailg-f55l-litio-extraible',
    'MOTO_ELECTRICA',
    'CATALOGO',
    'VERIFICADO_EN_FICHA',
    5200, NULL, 5200, 5200,
    1200, NULL, 'LIFEPO4', 64,
    30, 'SI', 55,
    60, 70, 'https://tailg.com.pe/producto/motos-electricas/mecha-deportiva/moto-electrica-litio-extraible-tailg-f55l/', '2026-10-30', 'La ficha detalla batería GREENWAY LiFePO4 64V30Ah; autonomía estándar 65–70 km y uso urbano 60–65 km.', true
)
ON CONFLICT (id_marca, nombre) DO UPDATE SET
    slug = EXCLUDED.slug,
    vehicle_type = EXCLUDED.vehicle_type,
    listing_status = EXCLUDED.listing_status,
    data_status = EXCLUDED.data_status,
    precio_referencial_pen = EXCLUDED.precio_referencial_pen,
    precio_regular_pen = EXCLUDED.precio_regular_pen,
    precio_min_pen = EXCLUDED.precio_min_pen,
    precio_max_pen = EXCLUDED.precio_max_pen,
    potencia_motor_w = EXCLUDED.potencia_motor_w,
    potencia_max_w = EXCLUDED.potencia_max_w,
    bateria_quimica = EXCLUDED.bateria_quimica,
    voltaje_nominal_v = EXCLUDED.voltaje_nominal_v,
    bateria_capacidad_ah = EXCLUDED.bateria_capacidad_ah,
    bateria_extraible = EXCLUDED.bateria_extraible,
    velocidad_max_kmh = EXCLUDED.velocidad_max_kmh,
    autonomia_min_km = EXCLUDED.autonomia_min_km,
    autonomia_max_km = EXCLUDED.autonomia_max_km,
    source_url = EXCLUDED.source_url,
    source_checked_on = EXCLUDED.source_checked_on,
    notas = EXCLUDED.notas;

INSERT INTO modelos_moto (
    id_marca, nombre, slug, vehicle_type, listing_status, data_status,
    precio_referencial_pen, precio_regular_pen, precio_min_pen, precio_max_pen,
    potencia_motor_w, potencia_max_w, bateria_quimica, voltaje_nominal_v,
    bateria_capacidad_ah, bateria_extraible, velocidad_max_kmh,
    autonomia_min_km, autonomia_max_km, source_url, source_checked_on, notas, estado
) VALUES (
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'TAILG' LIMIT 1),
    'T7 Litio Extraíble',
    'tailg-t7-litio-extraible',
    'VMP_BICIMOTO',
    'CATALOGO',
    'VERIFICADO_EN_FICHA',
    4150, NULL, 4150, 4150,
    600, NULL, 'LITIO_LMFP', 48,
    24, 'SI', 25,
    80, 90, 'https://tailg.com.pe/producto/bicimotos-electricas/bicimotos-litio/tailg-t7/', '2026-10-30', '25 km/h se especifica en modo limitado; no comparar directamente con motos homologadas a mayor velocidad.', true
)
ON CONFLICT (id_marca, nombre) DO UPDATE SET
    slug = EXCLUDED.slug,
    vehicle_type = EXCLUDED.vehicle_type,
    listing_status = EXCLUDED.listing_status,
    data_status = EXCLUDED.data_status,
    precio_referencial_pen = EXCLUDED.precio_referencial_pen,
    precio_regular_pen = EXCLUDED.precio_regular_pen,
    precio_min_pen = EXCLUDED.precio_min_pen,
    precio_max_pen = EXCLUDED.precio_max_pen,
    potencia_motor_w = EXCLUDED.potencia_motor_w,
    potencia_max_w = EXCLUDED.potencia_max_w,
    bateria_quimica = EXCLUDED.bateria_quimica,
    voltaje_nominal_v = EXCLUDED.voltaje_nominal_v,
    bateria_capacidad_ah = EXCLUDED.bateria_capacidad_ah,
    bateria_extraible = EXCLUDED.bateria_extraible,
    velocidad_max_kmh = EXCLUDED.velocidad_max_kmh,
    autonomia_min_km = EXCLUDED.autonomia_min_km,
    autonomia_max_km = EXCLUDED.autonomia_max_km,
    source_url = EXCLUDED.source_url,
    source_checked_on = EXCLUDED.source_checked_on,
    notas = EXCLUDED.notas;

INSERT INTO modelos_moto (
    id_marca, nombre, slug, vehicle_type, listing_status, data_status,
    precio_referencial_pen, precio_regular_pen, precio_min_pen, precio_max_pen,
    potencia_motor_w, potencia_max_w, bateria_quimica, voltaje_nominal_v,
    bateria_capacidad_ah, bateria_extraible, velocidad_max_kmh,
    autonomia_min_km, autonomia_max_km, source_url, source_checked_on, notas, estado
) VALUES (
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'TAILG' LIMIT 1),
    'V10 Litio Extraíble',
    'tailg-v10-litio-extraible',
    'VMP_BICIMOTO',
    'CATALOGO',
    'PARCIAL',
    3750, NULL, 3750, 3750,
    600, NULL, 'LITIO', 48,
    24, 'SI', NULL,
    80, 90, 'https://tailg.com.pe/motos/bicimotos-electricas/', '2026-10-30', 'La página enumera motor 600 W y autonomía 80–90 km; velocidad no explicitada en el extracto consultado.', true
)
ON CONFLICT (id_marca, nombre) DO UPDATE SET
    slug = EXCLUDED.slug,
    vehicle_type = EXCLUDED.vehicle_type,
    listing_status = EXCLUDED.listing_status,
    data_status = EXCLUDED.data_status,
    precio_referencial_pen = EXCLUDED.precio_referencial_pen,
    precio_regular_pen = EXCLUDED.precio_regular_pen,
    precio_min_pen = EXCLUDED.precio_min_pen,
    precio_max_pen = EXCLUDED.precio_max_pen,
    potencia_motor_w = EXCLUDED.potencia_motor_w,
    potencia_max_w = EXCLUDED.potencia_max_w,
    bateria_quimica = EXCLUDED.bateria_quimica,
    voltaje_nominal_v = EXCLUDED.voltaje_nominal_v,
    bateria_capacidad_ah = EXCLUDED.bateria_capacidad_ah,
    bateria_extraible = EXCLUDED.bateria_extraible,
    velocidad_max_kmh = EXCLUDED.velocidad_max_kmh,
    autonomia_min_km = EXCLUDED.autonomia_min_km,
    autonomia_max_km = EXCLUDED.autonomia_max_km,
    source_url = EXCLUDED.source_url,
    source_checked_on = EXCLUDED.source_checked_on,
    notas = EXCLUDED.notas;

INSERT INTO modelos_moto (
    id_marca, nombre, slug, vehicle_type, listing_status, data_status,
    precio_referencial_pen, precio_regular_pen, precio_min_pen, precio_max_pen,
    potencia_motor_w, potencia_max_w, bateria_quimica, voltaje_nominal_v,
    bateria_capacidad_ah, bateria_extraible, velocidad_max_kmh,
    autonomia_min_km, autonomia_max_km, source_url, source_checked_on, notas, estado
) VALUES (
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'TAILG' LIMIT 1),
    'X51 Litio Extraíble',
    'tailg-x51-litio-extraible',
    'VMP_BICIMOTO',
    'CATALOGO',
    'VERIFICADO_EN_FICHA',
    4350, NULL, 4350, 4350,
    1000, NULL, 'LITIO', 48,
    24, 'SI', 25,
    70, 80, 'https://tailg.com.pe/producto/bicimotos-electricas/bicimotos-litio/tailg-x51-litio-extraible-48v24ah/', '2026-10-30', 'Velocidad descrita en modo limitado de 25 km/h.', true
)
ON CONFLICT (id_marca, nombre) DO UPDATE SET
    slug = EXCLUDED.slug,
    vehicle_type = EXCLUDED.vehicle_type,
    listing_status = EXCLUDED.listing_status,
    data_status = EXCLUDED.data_status,
    precio_referencial_pen = EXCLUDED.precio_referencial_pen,
    precio_regular_pen = EXCLUDED.precio_regular_pen,
    precio_min_pen = EXCLUDED.precio_min_pen,
    precio_max_pen = EXCLUDED.precio_max_pen,
    potencia_motor_w = EXCLUDED.potencia_motor_w,
    potencia_max_w = EXCLUDED.potencia_max_w,
    bateria_quimica = EXCLUDED.bateria_quimica,
    voltaje_nominal_v = EXCLUDED.voltaje_nominal_v,
    bateria_capacidad_ah = EXCLUDED.bateria_capacidad_ah,
    bateria_extraible = EXCLUDED.bateria_extraible,
    velocidad_max_kmh = EXCLUDED.velocidad_max_kmh,
    autonomia_min_km = EXCLUDED.autonomia_min_km,
    autonomia_max_km = EXCLUDED.autonomia_max_km,
    source_url = EXCLUDED.source_url,
    source_checked_on = EXCLUDED.source_checked_on,
    notas = EXCLUDED.notas;

INSERT INTO modelos_moto (
    id_marca, nombre, slug, vehicle_type, listing_status, data_status,
    precio_referencial_pen, precio_regular_pen, precio_min_pen, precio_max_pen,
    potencia_motor_w, potencia_max_w, bateria_quimica, voltaje_nominal_v,
    bateria_capacidad_ah, bateria_extraible, velocidad_max_kmh,
    autonomia_min_km, autonomia_max_km, source_url, source_checked_on, notas, estado
) VALUES (
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'TAILG' LIMIT 1),
    'LEDO Litio Extraíble LMFP',
    'tailg-ledo-litio-extraible-lmfp',
    'VMP_BICIMOTO',
    'CATALOGO',
    'PARCIAL',
    2200, NULL, 2200, 2200,
    400, NULL, 'LITIO_LMFP', 48,
    12, 'SI', NULL,
    NULL, NULL, 'https://tailg.com.pe/motos/serie-de-litio/', '2026-10-30', 'La fuente oficial confirma motor 400 W y batería extraíble LMFP 48V12Ah; velocidad/autonomía no indicadas en el extracto.', true
)
ON CONFLICT (id_marca, nombre) DO UPDATE SET
    slug = EXCLUDED.slug,
    vehicle_type = EXCLUDED.vehicle_type,
    listing_status = EXCLUDED.listing_status,
    data_status = EXCLUDED.data_status,
    precio_referencial_pen = EXCLUDED.precio_referencial_pen,
    precio_regular_pen = EXCLUDED.precio_regular_pen,
    precio_min_pen = EXCLUDED.precio_min_pen,
    precio_max_pen = EXCLUDED.precio_max_pen,
    potencia_motor_w = EXCLUDED.potencia_motor_w,
    potencia_max_w = EXCLUDED.potencia_max_w,
    bateria_quimica = EXCLUDED.bateria_quimica,
    voltaje_nominal_v = EXCLUDED.voltaje_nominal_v,
    bateria_capacidad_ah = EXCLUDED.bateria_capacidad_ah,
    bateria_extraible = EXCLUDED.bateria_extraible,
    velocidad_max_kmh = EXCLUDED.velocidad_max_kmh,
    autonomia_min_km = EXCLUDED.autonomia_min_km,
    autonomia_max_km = EXCLUDED.autonomia_max_km,
    source_url = EXCLUDED.source_url,
    source_checked_on = EXCLUDED.source_checked_on,
    notas = EXCLUDED.notas;

INSERT INTO modelos_moto (
    id_marca, nombre, slug, vehicle_type, listing_status, data_status,
    precio_referencial_pen, precio_regular_pen, precio_min_pen, precio_max_pen,
    potencia_motor_w, potencia_max_w, bateria_quimica, voltaje_nominal_v,
    bateria_capacidad_ah, bateria_extraible, velocidad_max_kmh,
    autonomia_min_km, autonomia_max_km, source_url, source_checked_on, notas, estado
) VALUES (
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'TAILG' LIMIT 1),
    'A1 Plus',
    'tailg-a1-plus',
    'MOTO_ELECTRICA',
    'CATALOGO',
    'VERIFICADO_EN_FUENTE',
    3950, NULL, 3950, 3950,
    1200, NULL, 'PLOMO_GRAFENO', 72,
    23, 'NO_DECLARADO', 55,
    50, 60, 'https://tailg.com.pe/motos/motos-electricas/', '2026-10-30', 'Se agrega también porque aparece expresamente en la compatibilidad publicada de espejos TAILG.', true
)
ON CONFLICT (id_marca, nombre) DO UPDATE SET
    slug = EXCLUDED.slug,
    vehicle_type = EXCLUDED.vehicle_type,
    listing_status = EXCLUDED.listing_status,
    data_status = EXCLUDED.data_status,
    precio_referencial_pen = EXCLUDED.precio_referencial_pen,
    precio_regular_pen = EXCLUDED.precio_regular_pen,
    precio_min_pen = EXCLUDED.precio_min_pen,
    precio_max_pen = EXCLUDED.precio_max_pen,
    potencia_motor_w = EXCLUDED.potencia_motor_w,
    potencia_max_w = EXCLUDED.potencia_max_w,
    bateria_quimica = EXCLUDED.bateria_quimica,
    voltaje_nominal_v = EXCLUDED.voltaje_nominal_v,
    bateria_capacidad_ah = EXCLUDED.bateria_capacidad_ah,
    bateria_extraible = EXCLUDED.bateria_extraible,
    velocidad_max_kmh = EXCLUDED.velocidad_max_kmh,
    autonomia_min_km = EXCLUDED.autonomia_min_km,
    autonomia_max_km = EXCLUDED.autonomia_max_km,
    source_url = EXCLUDED.source_url,
    source_checked_on = EXCLUDED.source_checked_on,
    notas = EXCLUDED.notas;

INSERT INTO modelos_moto (
    id_marca, nombre, slug, vehicle_type, listing_status, data_status,
    precio_referencial_pen, precio_regular_pen, precio_min_pen, precio_max_pen,
    potencia_motor_w, potencia_max_w, bateria_quimica, voltaje_nominal_v,
    bateria_capacidad_ah, bateria_extraible, velocidad_max_kmh,
    autonomia_min_km, autonomia_max_km, source_url, source_checked_on, notas, estado
) VALUES (
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'TAILG' LIMIT 1),
    'Lion Max 2026',
    'tailg-lion-max-2026',
    'MOTO_ELECTRICA',
    'CATALOGO',
    'VERIFICADO_EN_FUENTE',
    3700, 4150, 3700, 3700,
    1200, NULL, 'PLOMO_GRAFENO', 72,
    23, 'NO_DECLARADO', 55,
    NULL, 70, 'https://tailg.com.pe/motos/motos-electricas/', '2026-10-30', 'Se agrega porque aparece expresamente en compatibilidad de espejos TAILG.', true
)
ON CONFLICT (id_marca, nombre) DO UPDATE SET
    slug = EXCLUDED.slug,
    vehicle_type = EXCLUDED.vehicle_type,
    listing_status = EXCLUDED.listing_status,
    data_status = EXCLUDED.data_status,
    precio_referencial_pen = EXCLUDED.precio_referencial_pen,
    precio_regular_pen = EXCLUDED.precio_regular_pen,
    precio_min_pen = EXCLUDED.precio_min_pen,
    precio_max_pen = EXCLUDED.precio_max_pen,
    potencia_motor_w = EXCLUDED.potencia_motor_w,
    potencia_max_w = EXCLUDED.potencia_max_w,
    bateria_quimica = EXCLUDED.bateria_quimica,
    voltaje_nominal_v = EXCLUDED.voltaje_nominal_v,
    bateria_capacidad_ah = EXCLUDED.bateria_capacidad_ah,
    bateria_extraible = EXCLUDED.bateria_extraible,
    velocidad_max_kmh = EXCLUDED.velocidad_max_kmh,
    autonomia_min_km = EXCLUDED.autonomia_min_km,
    autonomia_max_km = EXCLUDED.autonomia_max_km,
    source_url = EXCLUDED.source_url,
    source_checked_on = EXCLUDED.source_checked_on,
    notas = EXCLUDED.notas;

INSERT INTO modelos_moto (
    id_marca, nombre, slug, vehicle_type, listing_status, data_status,
    precio_referencial_pen, precio_regular_pen, precio_min_pen, precio_max_pen,
    potencia_motor_w, potencia_max_w, bateria_quimica, voltaje_nominal_v,
    bateria_capacidad_ah, bateria_extraible, velocidad_max_kmh,
    autonomia_min_km, autonomia_max_km, source_url, source_checked_on, notas, estado
) VALUES (
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'TAILG' LIMIT 1),
    'Polaris Super S',
    'tailg-polaris-super-s',
    'MOTO_ELECTRICA',
    'CATALOGO',
    'VERIFICADO_EN_FUENTE',
    4250, 4500, 4250, 4250,
    1200, NULL, 'PLOMO_GRAFENO', 72,
    23, 'NO_DECLARADO', 55,
    65, 75, 'https://tailg.com.pe/motos/motos-electricas/', '2026-10-30', 'Se agrega por catálogo y por las compatibilidades de espejos.', true
)
ON CONFLICT (id_marca, nombre) DO UPDATE SET
    slug = EXCLUDED.slug,
    vehicle_type = EXCLUDED.vehicle_type,
    listing_status = EXCLUDED.listing_status,
    data_status = EXCLUDED.data_status,
    precio_referencial_pen = EXCLUDED.precio_referencial_pen,
    precio_regular_pen = EXCLUDED.precio_regular_pen,
    precio_min_pen = EXCLUDED.precio_min_pen,
    precio_max_pen = EXCLUDED.precio_max_pen,
    potencia_motor_w = EXCLUDED.potencia_motor_w,
    potencia_max_w = EXCLUDED.potencia_max_w,
    bateria_quimica = EXCLUDED.bateria_quimica,
    voltaje_nominal_v = EXCLUDED.voltaje_nominal_v,
    bateria_capacidad_ah = EXCLUDED.bateria_capacidad_ah,
    bateria_extraible = EXCLUDED.bateria_extraible,
    velocidad_max_kmh = EXCLUDED.velocidad_max_kmh,
    autonomia_min_km = EXCLUDED.autonomia_min_km,
    autonomia_max_km = EXCLUDED.autonomia_max_km,
    source_url = EXCLUDED.source_url,
    source_checked_on = EXCLUDED.source_checked_on,
    notas = EXCLUDED.notas;

INSERT INTO modelos_moto (
    id_marca, nombre, slug, vehicle_type, listing_status, data_status,
    precio_referencial_pen, precio_regular_pen, precio_min_pen, precio_max_pen,
    potencia_motor_w, potencia_max_w, bateria_quimica, voltaje_nominal_v,
    bateria_capacidad_ah, bateria_extraible, velocidad_max_kmh,
    autonomia_min_km, autonomia_max_km, source_url, source_checked_on, notas, estado
) VALUES (
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'TAILG' LIMIT 1),
    'Leopard Pro Super S',
    'tailg-leopard-pro-super-s',
    'MOTO_ELECTRICA',
    'CATALOGO',
    'VERIFICADO_EN_FUENTE',
    5500, NULL, 5500, 5500,
    2000, NULL, 'PLOMO_GRAFENO', 72,
    35, 'NO_DECLARADO', 70,
    NULL, 90, 'https://tailg.com.pe/motos/motos-electricas/', '2026-10-30', 'Se agrega por aparecer como compatible con espejo HJ-182.', true
)
ON CONFLICT (id_marca, nombre) DO UPDATE SET
    slug = EXCLUDED.slug,
    vehicle_type = EXCLUDED.vehicle_type,
    listing_status = EXCLUDED.listing_status,
    data_status = EXCLUDED.data_status,
    precio_referencial_pen = EXCLUDED.precio_referencial_pen,
    precio_regular_pen = EXCLUDED.precio_regular_pen,
    precio_min_pen = EXCLUDED.precio_min_pen,
    precio_max_pen = EXCLUDED.precio_max_pen,
    potencia_motor_w = EXCLUDED.potencia_motor_w,
    potencia_max_w = EXCLUDED.potencia_max_w,
    bateria_quimica = EXCLUDED.bateria_quimica,
    voltaje_nominal_v = EXCLUDED.voltaje_nominal_v,
    bateria_capacidad_ah = EXCLUDED.bateria_capacidad_ah,
    bateria_extraible = EXCLUDED.bateria_extraible,
    velocidad_max_kmh = EXCLUDED.velocidad_max_kmh,
    autonomia_min_km = EXCLUDED.autonomia_min_km,
    autonomia_max_km = EXCLUDED.autonomia_max_km,
    source_url = EXCLUDED.source_url,
    source_checked_on = EXCLUDED.source_checked_on,
    notas = EXCLUDED.notas;

INSERT INTO modelos_moto (
    id_marca, nombre, slug, vehicle_type, listing_status, data_status,
    precio_referencial_pen, precio_regular_pen, precio_min_pen, precio_max_pen,
    potencia_motor_w, potencia_max_w, bateria_quimica, voltaje_nominal_v,
    bateria_capacidad_ah, bateria_extraible, velocidad_max_kmh,
    autonomia_min_km, autonomia_max_km, source_url, source_checked_on, notas, estado
) VALUES (
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'TAILG' LIMIT 1),
    'Master',
    'tailg-master',
    'MOTO_ELECTRICA',
    'SOLO_COMPATIBILIDAD',
    'SOLO_REFERENCIA_DE_REPUESTO',
    NULL, NULL, NULL, NULL,
    NULL, NULL, NULL, NULL,
    NULL, 'NO_DECLARADO', NULL,
    NULL, NULL, 'https://tailg.com.pe/producto/repuestos-y-accesorios-originales/espejos-retrovisores/espejo-tailg-8mm/', '2026-10-30', 'Modelo citado en compatibilidad de espejo, sin ficha de moto validada en esta recopilación.', true
)
ON CONFLICT (id_marca, nombre) DO UPDATE SET
    slug = EXCLUDED.slug,
    vehicle_type = EXCLUDED.vehicle_type,
    listing_status = EXCLUDED.listing_status,
    data_status = EXCLUDED.data_status,
    precio_referencial_pen = EXCLUDED.precio_referencial_pen,
    precio_regular_pen = EXCLUDED.precio_regular_pen,
    precio_min_pen = EXCLUDED.precio_min_pen,
    precio_max_pen = EXCLUDED.precio_max_pen,
    potencia_motor_w = EXCLUDED.potencia_motor_w,
    potencia_max_w = EXCLUDED.potencia_max_w,
    bateria_quimica = EXCLUDED.bateria_quimica,
    voltaje_nominal_v = EXCLUDED.voltaje_nominal_v,
    bateria_capacidad_ah = EXCLUDED.bateria_capacidad_ah,
    bateria_extraible = EXCLUDED.bateria_extraible,
    velocidad_max_kmh = EXCLUDED.velocidad_max_kmh,
    autonomia_min_km = EXCLUDED.autonomia_min_km,
    autonomia_max_km = EXCLUDED.autonomia_max_km,
    source_url = EXCLUDED.source_url,
    source_checked_on = EXCLUDED.source_checked_on,
    notas = EXCLUDED.notas;

INSERT INTO modelos_moto (
    id_marca, nombre, slug, vehicle_type, listing_status, data_status,
    precio_referencial_pen, precio_regular_pen, precio_min_pen, precio_max_pen,
    potencia_motor_w, potencia_max_w, bateria_quimica, voltaje_nominal_v,
    bateria_capacidad_ah, bateria_extraible, velocidad_max_kmh,
    autonomia_min_km, autonomia_max_km, source_url, source_checked_on, notas, estado
) VALUES (
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'TAILG' LIMIT 1),
    'T5',
    'tailg-t5',
    'VMP_BICIMOTO',
    'SOLO_COMPATIBILIDAD',
    'SOLO_REFERENCIA_DE_REPUESTO',
    NULL, NULL, NULL, NULL,
    NULL, NULL, NULL, NULL,
    NULL, 'NO_DECLARADO', NULL,
    NULL, NULL, 'https://tailg.com.pe/motos/repuestos-y-accesorios-originales/', '2026-10-30', 'Citado como modelo compatible con una batería de litio 48V24Ah; ficha propia pendiente.', true
)
ON CONFLICT (id_marca, nombre) DO UPDATE SET
    slug = EXCLUDED.slug,
    vehicle_type = EXCLUDED.vehicle_type,
    listing_status = EXCLUDED.listing_status,
    data_status = EXCLUDED.data_status,
    precio_referencial_pen = EXCLUDED.precio_referencial_pen,
    precio_regular_pen = EXCLUDED.precio_regular_pen,
    precio_min_pen = EXCLUDED.precio_min_pen,
    precio_max_pen = EXCLUDED.precio_max_pen,
    potencia_motor_w = EXCLUDED.potencia_motor_w,
    potencia_max_w = EXCLUDED.potencia_max_w,
    bateria_quimica = EXCLUDED.bateria_quimica,
    voltaje_nominal_v = EXCLUDED.voltaje_nominal_v,
    bateria_capacidad_ah = EXCLUDED.bateria_capacidad_ah,
    bateria_extraible = EXCLUDED.bateria_extraible,
    velocidad_max_kmh = EXCLUDED.velocidad_max_kmh,
    autonomia_min_km = EXCLUDED.autonomia_min_km,
    autonomia_max_km = EXCLUDED.autonomia_max_km,
    source_url = EXCLUDED.source_url,
    source_checked_on = EXCLUDED.source_checked_on,
    notas = EXCLUDED.notas;

INSERT INTO modelos_moto (
    id_marca, nombre, slug, vehicle_type, listing_status, data_status,
    precio_referencial_pen, precio_regular_pen, precio_min_pen, precio_max_pen,
    potencia_motor_w, potencia_max_w, bateria_quimica, voltaje_nominal_v,
    bateria_capacidad_ah, bateria_extraible, velocidad_max_kmh,
    autonomia_min_km, autonomia_max_km, source_url, source_checked_on, notas, estado
) VALUES (
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'TAILG' LIMIT 1),
    'T3',
    'tailg-t3',
    'VMP_BICIMOTO',
    'SOLO_COMPATIBILIDAD',
    'SOLO_REFERENCIA_DE_REPUESTO',
    NULL, NULL, NULL, NULL,
    NULL, NULL, NULL, NULL,
    NULL, 'NO_DECLARADO', NULL,
    NULL, NULL, 'https://tailg.com.pe/motos/repuestos-y-accesorios-originales/', '2026-10-30', 'Citado como modelo compatible con una batería de litio 48V24Ah; ficha propia pendiente.', true
)
ON CONFLICT (id_marca, nombre) DO UPDATE SET
    slug = EXCLUDED.slug,
    vehicle_type = EXCLUDED.vehicle_type,
    listing_status = EXCLUDED.listing_status,
    data_status = EXCLUDED.data_status,
    precio_referencial_pen = EXCLUDED.precio_referencial_pen,
    precio_regular_pen = EXCLUDED.precio_regular_pen,
    precio_min_pen = EXCLUDED.precio_min_pen,
    precio_max_pen = EXCLUDED.precio_max_pen,
    potencia_motor_w = EXCLUDED.potencia_motor_w,
    potencia_max_w = EXCLUDED.potencia_max_w,
    bateria_quimica = EXCLUDED.bateria_quimica,
    voltaje_nominal_v = EXCLUDED.voltaje_nominal_v,
    bateria_capacidad_ah = EXCLUDED.bateria_capacidad_ah,
    bateria_extraible = EXCLUDED.bateria_extraible,
    velocidad_max_kmh = EXCLUDED.velocidad_max_kmh,
    autonomia_min_km = EXCLUDED.autonomia_min_km,
    autonomia_max_km = EXCLUDED.autonomia_max_km,
    source_url = EXCLUDED.source_url,
    source_checked_on = EXCLUDED.source_checked_on,
    notas = EXCLUDED.notas;

INSERT INTO modelos_moto (
    id_marca, nombre, slug, vehicle_type, listing_status, data_status,
    precio_referencial_pen, precio_regular_pen, precio_min_pen, precio_max_pen,
    potencia_motor_w, potencia_max_w, bateria_quimica, voltaje_nominal_v,
    bateria_capacidad_ah, bateria_extraible, velocidad_max_kmh,
    autonomia_min_km, autonomia_max_km, source_url, source_checked_on, notas, estado
) VALUES (
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'TAILG' LIMIT 1),
    'T24',
    'tailg-t24',
    'VMP_BICIMOTO',
    'SOLO_COMPATIBILIDAD',
    'SOLO_REFERENCIA_DE_REPUESTO',
    NULL, NULL, NULL, NULL,
    NULL, NULL, NULL, NULL,
    NULL, 'NO_DECLARADO', NULL,
    NULL, NULL, 'https://tailg.com.pe/motos/repuestos-y-accesorios-originales/', '2026-10-30', 'Citado como modelo compatible con una batería de litio 48V24Ah; ficha propia pendiente.', true
)
ON CONFLICT (id_marca, nombre) DO UPDATE SET
    slug = EXCLUDED.slug,
    vehicle_type = EXCLUDED.vehicle_type,
    listing_status = EXCLUDED.listing_status,
    data_status = EXCLUDED.data_status,
    precio_referencial_pen = EXCLUDED.precio_referencial_pen,
    precio_regular_pen = EXCLUDED.precio_regular_pen,
    precio_min_pen = EXCLUDED.precio_min_pen,
    precio_max_pen = EXCLUDED.precio_max_pen,
    potencia_motor_w = EXCLUDED.potencia_motor_w,
    potencia_max_w = EXCLUDED.potencia_max_w,
    bateria_quimica = EXCLUDED.bateria_quimica,
    voltaje_nominal_v = EXCLUDED.voltaje_nominal_v,
    bateria_capacidad_ah = EXCLUDED.bateria_capacidad_ah,
    bateria_extraible = EXCLUDED.bateria_extraible,
    velocidad_max_kmh = EXCLUDED.velocidad_max_kmh,
    autonomia_min_km = EXCLUDED.autonomia_min_km,
    autonomia_max_km = EXCLUDED.autonomia_max_km,
    source_url = EXCLUDED.source_url,
    source_checked_on = EXCLUDED.source_checked_on,
    notas = EXCLUDED.notas;

INSERT INTO modelos_moto (
    id_marca, nombre, slug, vehicle_type, listing_status, data_status,
    precio_referencial_pen, precio_regular_pen, precio_min_pen, precio_max_pen,
    potencia_motor_w, potencia_max_w, bateria_quimica, voltaje_nominal_v,
    bateria_capacidad_ah, bateria_extraible, velocidad_max_kmh,
    autonomia_min_km, autonomia_max_km, source_url, source_checked_on, notas, estado
) VALUES (
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'TAILG' LIMIT 1),
    'VMP S4',
    'tailg-vmp-s4',
    'VMP_BICIMOTO',
    'SOLO_COMPATIBILIDAD',
    'SOLO_REFERENCIA_DE_REPUESTO',
    NULL, NULL, NULL, NULL,
    NULL, NULL, NULL, NULL,
    NULL, 'NO_DECLARADO', NULL,
    NULL, NULL, 'https://tailg.com.pe/motos/repuestos-y-accesorios-originales/', '2026-10-30', 'Citado en compatibilidad de batería LMFP 48V12Ah; validar denominación exacta/modelo antes de publicar.', true
)
ON CONFLICT (id_marca, nombre) DO UPDATE SET
    slug = EXCLUDED.slug,
    vehicle_type = EXCLUDED.vehicle_type,
    listing_status = EXCLUDED.listing_status,
    data_status = EXCLUDED.data_status,
    precio_referencial_pen = EXCLUDED.precio_referencial_pen,
    precio_regular_pen = EXCLUDED.precio_regular_pen,
    precio_min_pen = EXCLUDED.precio_min_pen,
    precio_max_pen = EXCLUDED.precio_max_pen,
    potencia_motor_w = EXCLUDED.potencia_motor_w,
    potencia_max_w = EXCLUDED.potencia_max_w,
    bateria_quimica = EXCLUDED.bateria_quimica,
    voltaje_nominal_v = EXCLUDED.voltaje_nominal_v,
    bateria_capacidad_ah = EXCLUDED.bateria_capacidad_ah,
    bateria_extraible = EXCLUDED.bateria_extraible,
    velocidad_max_kmh = EXCLUDED.velocidad_max_kmh,
    autonomia_min_km = EXCLUDED.autonomia_min_km,
    autonomia_max_km = EXCLUDED.autonomia_max_km,
    source_url = EXCLUDED.source_url,
    source_checked_on = EXCLUDED.source_checked_on,
    notas = EXCLUDED.notas;

INSERT INTO modelos_moto (
    id_marca, nombre, slug, vehicle_type, listing_status, data_status,
    precio_referencial_pen, precio_regular_pen, precio_min_pen, precio_max_pen,
    potencia_motor_w, potencia_max_w, bateria_quimica, voltaje_nominal_v,
    bateria_capacidad_ah, bateria_extraible, velocidad_max_kmh,
    autonomia_min_km, autonomia_max_km, source_url, source_checked_on, notas, estado
) VALUES (
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'TAILG' LIMIT 1),
    'VMP S2',
    'tailg-vmp-s2',
    'VMP_BICIMOTO',
    'SOLO_COMPATIBILIDAD',
    'SOLO_REFERENCIA_DE_REPUESTO',
    NULL, NULL, NULL, NULL,
    NULL, NULL, NULL, NULL,
    NULL, 'NO_DECLARADO', NULL,
    NULL, NULL, 'https://tailg.com.pe/motos/repuestos-y-accesorios-originales/', '2026-10-30', 'Citado en compatibilidad de batería LMFP 48V12Ah; validar denominación exacta/modelo antes de publicar.', true
)
ON CONFLICT (id_marca, nombre) DO UPDATE SET
    slug = EXCLUDED.slug,
    vehicle_type = EXCLUDED.vehicle_type,
    listing_status = EXCLUDED.listing_status,
    data_status = EXCLUDED.data_status,
    precio_referencial_pen = EXCLUDED.precio_referencial_pen,
    precio_regular_pen = EXCLUDED.precio_regular_pen,
    precio_min_pen = EXCLUDED.precio_min_pen,
    precio_max_pen = EXCLUDED.precio_max_pen,
    potencia_motor_w = EXCLUDED.potencia_motor_w,
    potencia_max_w = EXCLUDED.potencia_max_w,
    bateria_quimica = EXCLUDED.bateria_quimica,
    voltaje_nominal_v = EXCLUDED.voltaje_nominal_v,
    bateria_capacidad_ah = EXCLUDED.bateria_capacidad_ah,
    bateria_extraible = EXCLUDED.bateria_extraible,
    velocidad_max_kmh = EXCLUDED.velocidad_max_kmh,
    autonomia_min_km = EXCLUDED.autonomia_min_km,
    autonomia_max_km = EXCLUDED.autonomia_max_km,
    source_url = EXCLUDED.source_url,
    source_checked_on = EXCLUDED.source_checked_on,
    notas = EXCLUDED.notas;

INSERT INTO modelos_moto (
    id_marca, nombre, slug, vehicle_type, listing_status, data_status,
    precio_referencial_pen, precio_regular_pen, precio_min_pen, precio_max_pen,
    potencia_motor_w, potencia_max_w, bateria_quimica, voltaje_nominal_v,
    bateria_capacidad_ah, bateria_extraible, velocidad_max_kmh,
    autonomia_min_km, autonomia_max_km, source_url, source_checked_on, notas, estado
) VALUES (
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'TAILG' LIMIT 1),
    'VMP S2X',
    'tailg-vmp-s2x',
    'VMP_BICIMOTO',
    'SOLO_COMPATIBILIDAD',
    'SOLO_REFERENCIA_DE_REPUESTO',
    NULL, NULL, NULL, NULL,
    NULL, NULL, NULL, NULL,
    NULL, 'NO_DECLARADO', NULL,
    NULL, NULL, 'https://tailg.com.pe/motos/repuestos-y-accesorios-originales/', '2026-10-30', 'Citado en compatibilidad de batería LMFP 48V12Ah; validar denominación exacta/modelo antes de publicar.', true
)
ON CONFLICT (id_marca, nombre) DO UPDATE SET
    slug = EXCLUDED.slug,
    vehicle_type = EXCLUDED.vehicle_type,
    listing_status = EXCLUDED.listing_status,
    data_status = EXCLUDED.data_status,
    precio_referencial_pen = EXCLUDED.precio_referencial_pen,
    precio_regular_pen = EXCLUDED.precio_regular_pen,
    precio_min_pen = EXCLUDED.precio_min_pen,
    precio_max_pen = EXCLUDED.precio_max_pen,
    potencia_motor_w = EXCLUDED.potencia_motor_w,
    potencia_max_w = EXCLUDED.potencia_max_w,
    bateria_quimica = EXCLUDED.bateria_quimica,
    voltaje_nominal_v = EXCLUDED.voltaje_nominal_v,
    bateria_capacidad_ah = EXCLUDED.bateria_capacidad_ah,
    bateria_extraible = EXCLUDED.bateria_extraible,
    velocidad_max_kmh = EXCLUDED.velocidad_max_kmh,
    autonomia_min_km = EXCLUDED.autonomia_min_km,
    autonomia_max_km = EXCLUDED.autonomia_max_km,
    source_url = EXCLUDED.source_url,
    source_checked_on = EXCLUDED.source_checked_on,
    notas = EXCLUDED.notas;

INSERT INTO modelos_moto (
    id_marca, nombre, slug, vehicle_type, listing_status, data_status,
    precio_referencial_pen, precio_regular_pen, precio_min_pen, precio_max_pen,
    potencia_motor_w, potencia_max_w, bateria_quimica, voltaje_nominal_v,
    bateria_capacidad_ah, bateria_extraible, velocidad_max_kmh,
    autonomia_min_km, autonomia_max_km, source_url, source_checked_on, notas, estado
) VALUES (
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'YADEA' LIMIT 1),
    'M6',
    'yadea-m6',
    'MOTO_ELECTRICA',
    'CATALOGO',
    'VERIFICADO_EN_FICHA',
    3990, NULL, 3990, 3990,
    600, 1500, 'YADEA_TTFAR', 60,
    25, 'NO_DECLARADO', 38,
    70, 80, 'https://yadea.pe/producto/moto-electrica-m6/', '2026-10-30', 'La ficha oficial denomina al motor 600 W nominal / 1500 W máximo.', true
)
ON CONFLICT (id_marca, nombre) DO UPDATE SET
    slug = EXCLUDED.slug,
    vehicle_type = EXCLUDED.vehicle_type,
    listing_status = EXCLUDED.listing_status,
    data_status = EXCLUDED.data_status,
    precio_referencial_pen = EXCLUDED.precio_referencial_pen,
    precio_regular_pen = EXCLUDED.precio_regular_pen,
    precio_min_pen = EXCLUDED.precio_min_pen,
    precio_max_pen = EXCLUDED.precio_max_pen,
    potencia_motor_w = EXCLUDED.potencia_motor_w,
    potencia_max_w = EXCLUDED.potencia_max_w,
    bateria_quimica = EXCLUDED.bateria_quimica,
    voltaje_nominal_v = EXCLUDED.voltaje_nominal_v,
    bateria_capacidad_ah = EXCLUDED.bateria_capacidad_ah,
    bateria_extraible = EXCLUDED.bateria_extraible,
    velocidad_max_kmh = EXCLUDED.velocidad_max_kmh,
    autonomia_min_km = EXCLUDED.autonomia_min_km,
    autonomia_max_km = EXCLUDED.autonomia_max_km,
    source_url = EXCLUDED.source_url,
    source_checked_on = EXCLUDED.source_checked_on,
    notas = EXCLUDED.notas;

INSERT INTO modelos_moto (
    id_marca, nombre, slug, vehicle_type, listing_status, data_status,
    precio_referencial_pen, precio_regular_pen, precio_min_pen, precio_max_pen,
    potencia_motor_w, potencia_max_w, bateria_quimica, voltaje_nominal_v,
    bateria_capacidad_ah, bateria_extraible, velocidad_max_kmh,
    autonomia_min_km, autonomia_max_km, source_url, source_checked_on, notas, estado
) VALUES (
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'YADEA' LIMIT 1),
    'M6 Pro',
    'yadea-m6-pro',
    'MOTO_ELECTRICA',
    'CATALOGO',
    'VERIFICADO_EN_FICHA',
    4390, NULL, 4390, 4390,
    1200, NULL, 'YADEA_TTFAR', 72,
    25, 'NO_DECLARADO', 50,
    100, 100, 'https://yadea.pe/producto/moto-electrica-m6-pro/', '2026-10-30', 'Autonomía referencial de 100 km según condiciones indicadas por el vendedor.', true
)
ON CONFLICT (id_marca, nombre) DO UPDATE SET
    slug = EXCLUDED.slug,
    vehicle_type = EXCLUDED.vehicle_type,
    listing_status = EXCLUDED.listing_status,
    data_status = EXCLUDED.data_status,
    precio_referencial_pen = EXCLUDED.precio_referencial_pen,
    precio_regular_pen = EXCLUDED.precio_regular_pen,
    precio_min_pen = EXCLUDED.precio_min_pen,
    precio_max_pen = EXCLUDED.precio_max_pen,
    potencia_motor_w = EXCLUDED.potencia_motor_w,
    potencia_max_w = EXCLUDED.potencia_max_w,
    bateria_quimica = EXCLUDED.bateria_quimica,
    voltaje_nominal_v = EXCLUDED.voltaje_nominal_v,
    bateria_capacidad_ah = EXCLUDED.bateria_capacidad_ah,
    bateria_extraible = EXCLUDED.bateria_extraible,
    velocidad_max_kmh = EXCLUDED.velocidad_max_kmh,
    autonomia_min_km = EXCLUDED.autonomia_min_km,
    autonomia_max_km = EXCLUDED.autonomia_max_km,
    source_url = EXCLUDED.source_url,
    source_checked_on = EXCLUDED.source_checked_on,
    notas = EXCLUDED.notas;

INSERT INTO modelos_moto (
    id_marca, nombre, slug, vehicle_type, listing_status, data_status,
    precio_referencial_pen, precio_regular_pen, precio_min_pen, precio_max_pen,
    potencia_motor_w, potencia_max_w, bateria_quimica, voltaje_nominal_v,
    bateria_capacidad_ah, bateria_extraible, velocidad_max_kmh,
    autonomia_min_km, autonomia_max_km, source_url, source_checked_on, notas, estado
) VALUES (
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'YADEA' LIMIT 1),
    'M6H',
    'yadea-m6h',
    'MOTO_ELECTRICA',
    'CATALOGO',
    'VERIFICADO_EN_FICHA',
    5580, 5780, 5580, 5580,
    1000, 2120, 'LIFEPO4', 60,
    30, 'NO_DECLARADO', 32,
    71, 71, 'https://yadea.pe/producto/moto-electrica-m6h/', '2026-10-30', 'Precio en oferta publicado; autonomía indicada como 71 km.', true
)
ON CONFLICT (id_marca, nombre) DO UPDATE SET
    slug = EXCLUDED.slug,
    vehicle_type = EXCLUDED.vehicle_type,
    listing_status = EXCLUDED.listing_status,
    data_status = EXCLUDED.data_status,
    precio_referencial_pen = EXCLUDED.precio_referencial_pen,
    precio_regular_pen = EXCLUDED.precio_regular_pen,
    precio_min_pen = EXCLUDED.precio_min_pen,
    precio_max_pen = EXCLUDED.precio_max_pen,
    potencia_motor_w = EXCLUDED.potencia_motor_w,
    potencia_max_w = EXCLUDED.potencia_max_w,
    bateria_quimica = EXCLUDED.bateria_quimica,
    voltaje_nominal_v = EXCLUDED.voltaje_nominal_v,
    bateria_capacidad_ah = EXCLUDED.bateria_capacidad_ah,
    bateria_extraible = EXCLUDED.bateria_extraible,
    velocidad_max_kmh = EXCLUDED.velocidad_max_kmh,
    autonomia_min_km = EXCLUDED.autonomia_min_km,
    autonomia_max_km = EXCLUDED.autonomia_max_km,
    source_url = EXCLUDED.source_url,
    source_checked_on = EXCLUDED.source_checked_on,
    notas = EXCLUDED.notas;

INSERT INTO modelos_moto (
    id_marca, nombre, slug, vehicle_type, listing_status, data_status,
    precio_referencial_pen, precio_regular_pen, precio_min_pen, precio_max_pen,
    potencia_motor_w, potencia_max_w, bateria_quimica, voltaje_nominal_v,
    bateria_capacidad_ah, bateria_extraible, velocidad_max_kmh,
    autonomia_min_km, autonomia_max_km, source_url, source_checked_on, notas, estado
) VALUES (
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'YADEA' LIMIT 1),
    'GT60',
    'yadea-gt60',
    'MOTO_ELECTRICA',
    'CATALOGO',
    'VERIFICADO_EN_FICHA',
    NULL, NULL, 5690, 5990,
    1500, 2500, 'YADEA_TTFAR', 72,
    38, 'NO_DECLARADO', 60,
    100, 100, 'https://yadea.pe/producto/moto-electrica-gt60/', '2026-10-30', 'El precio cambia por versión (con/sin sliders); conservar rango de precio, no un precio único.', true
)
ON CONFLICT (id_marca, nombre) DO UPDATE SET
    slug = EXCLUDED.slug,
    vehicle_type = EXCLUDED.vehicle_type,
    listing_status = EXCLUDED.listing_status,
    data_status = EXCLUDED.data_status,
    precio_referencial_pen = EXCLUDED.precio_referencial_pen,
    precio_regular_pen = EXCLUDED.precio_regular_pen,
    precio_min_pen = EXCLUDED.precio_min_pen,
    precio_max_pen = EXCLUDED.precio_max_pen,
    potencia_motor_w = EXCLUDED.potencia_motor_w,
    potencia_max_w = EXCLUDED.potencia_max_w,
    bateria_quimica = EXCLUDED.bateria_quimica,
    voltaje_nominal_v = EXCLUDED.voltaje_nominal_v,
    bateria_capacidad_ah = EXCLUDED.bateria_capacidad_ah,
    bateria_extraible = EXCLUDED.bateria_extraible,
    velocidad_max_kmh = EXCLUDED.velocidad_max_kmh,
    autonomia_min_km = EXCLUDED.autonomia_min_km,
    autonomia_max_km = EXCLUDED.autonomia_max_km,
    source_url = EXCLUDED.source_url,
    source_checked_on = EXCLUDED.source_checked_on,
    notas = EXCLUDED.notas;

INSERT INTO modelos_moto (
    id_marca, nombre, slug, vehicle_type, listing_status, data_status,
    precio_referencial_pen, precio_regular_pen, precio_min_pen, precio_max_pen,
    potencia_motor_w, potencia_max_w, bateria_quimica, voltaje_nominal_v,
    bateria_capacidad_ah, bateria_extraible, velocidad_max_kmh,
    autonomia_min_km, autonomia_max_km, source_url, source_checked_on, notas, estado
) VALUES (
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'YADEA' LIMIT 1),
    'E8S Pro',
    'yadea-e8s-pro',
    'MOTO_ELECTRICA',
    'CATALOGO',
    'VERIFICADO_EN_FICHA',
    NULL, NULL, 5700, 5900,
    2000, 3000, 'YADEA_TTFAR', 72,
    38, 'NO_DECLARADO', 60,
    100, 120, 'https://yadea.pe/producto/moto-electrica-e8s-pro/', '2026-10-30', 'Precio mostrado como rango; autonomía referencial publicada de 100–120 km.', true
)
ON CONFLICT (id_marca, nombre) DO UPDATE SET
    slug = EXCLUDED.slug,
    vehicle_type = EXCLUDED.vehicle_type,
    listing_status = EXCLUDED.listing_status,
    data_status = EXCLUDED.data_status,
    precio_referencial_pen = EXCLUDED.precio_referencial_pen,
    precio_regular_pen = EXCLUDED.precio_regular_pen,
    precio_min_pen = EXCLUDED.precio_min_pen,
    precio_max_pen = EXCLUDED.precio_max_pen,
    potencia_motor_w = EXCLUDED.potencia_motor_w,
    potencia_max_w = EXCLUDED.potencia_max_w,
    bateria_quimica = EXCLUDED.bateria_quimica,
    voltaje_nominal_v = EXCLUDED.voltaje_nominal_v,
    bateria_capacidad_ah = EXCLUDED.bateria_capacidad_ah,
    bateria_extraible = EXCLUDED.bateria_extraible,
    velocidad_max_kmh = EXCLUDED.velocidad_max_kmh,
    autonomia_min_km = EXCLUDED.autonomia_min_km,
    autonomia_max_km = EXCLUDED.autonomia_max_km,
    source_url = EXCLUDED.source_url,
    source_checked_on = EXCLUDED.source_checked_on,
    notas = EXCLUDED.notas;

INSERT INTO modelos_moto (
    id_marca, nombre, slug, vehicle_type, listing_status, data_status,
    precio_referencial_pen, precio_regular_pen, precio_min_pen, precio_max_pen,
    potencia_motor_w, potencia_max_w, bateria_quimica, voltaje_nominal_v,
    bateria_capacidad_ah, bateria_extraible, velocidad_max_kmh,
    autonomia_min_km, autonomia_max_km, source_url, source_checked_on, notas, estado
) VALUES (
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'YADEA' LIMIT 1),
    'S80',
    'yadea-s80',
    'MOTO_ELECTRICA',
    'CATALOGO',
    'VERIFICADO_EN_FICHA',
    6500, NULL, 6500, 6500,
    2000, 3795, 'YADEA_TTFAR', 72,
    38, 'NO_DECLARADO', 85,
    100, 110, 'https://yadea.pe/producto/moto-electrica-s80/', '2026-10-30', 'Autonomía y velocidad referenciales del vendedor; revisar condiciones de medición antes de publicar como garantía.', true
)
ON CONFLICT (id_marca, nombre) DO UPDATE SET
    slug = EXCLUDED.slug,
    vehicle_type = EXCLUDED.vehicle_type,
    listing_status = EXCLUDED.listing_status,
    data_status = EXCLUDED.data_status,
    precio_referencial_pen = EXCLUDED.precio_referencial_pen,
    precio_regular_pen = EXCLUDED.precio_regular_pen,
    precio_min_pen = EXCLUDED.precio_min_pen,
    precio_max_pen = EXCLUDED.precio_max_pen,
    potencia_motor_w = EXCLUDED.potencia_motor_w,
    potencia_max_w = EXCLUDED.potencia_max_w,
    bateria_quimica = EXCLUDED.bateria_quimica,
    voltaje_nominal_v = EXCLUDED.voltaje_nominal_v,
    bateria_capacidad_ah = EXCLUDED.bateria_capacidad_ah,
    bateria_extraible = EXCLUDED.bateria_extraible,
    velocidad_max_kmh = EXCLUDED.velocidad_max_kmh,
    autonomia_min_km = EXCLUDED.autonomia_min_km,
    autonomia_max_km = EXCLUDED.autonomia_max_km,
    source_url = EXCLUDED.source_url,
    source_checked_on = EXCLUDED.source_checked_on,
    notas = EXCLUDED.notas;

INSERT INTO modelos_moto (
    id_marca, nombre, slug, vehicle_type, listing_status, data_status,
    precio_referencial_pen, precio_regular_pen, precio_min_pen, precio_max_pen,
    potencia_motor_w, potencia_max_w, bateria_quimica, voltaje_nominal_v,
    bateria_capacidad_ah, bateria_extraible, velocidad_max_kmh,
    autonomia_min_km, autonomia_max_km, source_url, source_checked_on, notas, estado
) VALUES (
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'KAYENCORP' LIMIT 1),
    'Moto Scooter TIME',
    'kayencorp-moto-scooter-time',
    'MOTO_SCOOTER',
    'CATALOGO',
    'VERIFICADO_EN_FICHA',
    3300, 3600, 3300, 3300,
    1000, NULL, 'PLOMO_ACIDO', 60,
    20, 'NO', 45,
    70, 70, 'https://kayencorp.com/producto/moto-scooter-time/', '2026-10-30', 'La ficha indica batería no extraíble; garantía publicada: motor 12 meses, batería 3 meses.', true
)
ON CONFLICT (id_marca, nombre) DO UPDATE SET
    slug = EXCLUDED.slug,
    vehicle_type = EXCLUDED.vehicle_type,
    listing_status = EXCLUDED.listing_status,
    data_status = EXCLUDED.data_status,
    precio_referencial_pen = EXCLUDED.precio_referencial_pen,
    precio_regular_pen = EXCLUDED.precio_regular_pen,
    precio_min_pen = EXCLUDED.precio_min_pen,
    precio_max_pen = EXCLUDED.precio_max_pen,
    potencia_motor_w = EXCLUDED.potencia_motor_w,
    potencia_max_w = EXCLUDED.potencia_max_w,
    bateria_quimica = EXCLUDED.bateria_quimica,
    voltaje_nominal_v = EXCLUDED.voltaje_nominal_v,
    bateria_capacidad_ah = EXCLUDED.bateria_capacidad_ah,
    bateria_extraible = EXCLUDED.bateria_extraible,
    velocidad_max_kmh = EXCLUDED.velocidad_max_kmh,
    autonomia_min_km = EXCLUDED.autonomia_min_km,
    autonomia_max_km = EXCLUDED.autonomia_max_km,
    source_url = EXCLUDED.source_url,
    source_checked_on = EXCLUDED.source_checked_on,
    notas = EXCLUDED.notas;

INSERT INTO modelos_moto (
    id_marca, nombre, slug, vehicle_type, listing_status, data_status,
    precio_referencial_pen, precio_regular_pen, precio_min_pen, precio_max_pen,
    potencia_motor_w, potencia_max_w, bateria_quimica, voltaje_nominal_v,
    bateria_capacidad_ah, bateria_extraible, velocidad_max_kmh,
    autonomia_min_km, autonomia_max_km, source_url, source_checked_on, notas, estado
) VALUES (
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'KAYENCORP' LIMIT 1),
    'Moto Scooter HAWK',
    'kayencorp-moto-scooter-hawk',
    'MOTO_SCOOTER',
    'CATALOGO',
    'VERIFICADO_EN_FICHA',
    3840, NULL, 3840, 3840,
    1000, NULL, 'PLOMO_ACIDO', 72,
    20, 'NO', 45,
    70, 70, 'https://kayencorp.com/producto/moto-scooter-hawk/', '2026-10-30', 'La ficha indica batería no extraíble; garantía publicada: motor 12 meses, batería 3 meses.', true
)
ON CONFLICT (id_marca, nombre) DO UPDATE SET
    slug = EXCLUDED.slug,
    vehicle_type = EXCLUDED.vehicle_type,
    listing_status = EXCLUDED.listing_status,
    data_status = EXCLUDED.data_status,
    precio_referencial_pen = EXCLUDED.precio_referencial_pen,
    precio_regular_pen = EXCLUDED.precio_regular_pen,
    precio_min_pen = EXCLUDED.precio_min_pen,
    precio_max_pen = EXCLUDED.precio_max_pen,
    potencia_motor_w = EXCLUDED.potencia_motor_w,
    potencia_max_w = EXCLUDED.potencia_max_w,
    bateria_quimica = EXCLUDED.bateria_quimica,
    voltaje_nominal_v = EXCLUDED.voltaje_nominal_v,
    bateria_capacidad_ah = EXCLUDED.bateria_capacidad_ah,
    bateria_extraible = EXCLUDED.bateria_extraible,
    velocidad_max_kmh = EXCLUDED.velocidad_max_kmh,
    autonomia_min_km = EXCLUDED.autonomia_min_km,
    autonomia_max_km = EXCLUDED.autonomia_max_km,
    source_url = EXCLUDED.source_url,
    source_checked_on = EXCLUDED.source_checked_on,
    notas = EXCLUDED.notas;

INSERT INTO modelos_moto (
    id_marca, nombre, slug, vehicle_type, listing_status, data_status,
    precio_referencial_pen, precio_regular_pen, precio_min_pen, precio_max_pen,
    potencia_motor_w, potencia_max_w, bateria_quimica, voltaje_nominal_v,
    bateria_capacidad_ah, bateria_extraible, velocidad_max_kmh,
    autonomia_min_km, autonomia_max_km, source_url, source_checked_on, notas, estado
) VALUES (
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'KAYENCORP' LIMIT 1),
    'Moto Scooter Kuaishan Plus',
    'kayencorp-moto-scooter-kuaishan-plus',
    'MOTO_SCOOTER',
    'CATALOGO',
    'REVISAR_FUENTE',
    5346, NULL, 5346, 5346,
    NULL, NULL, 'PLOMO_ACIDO', 72,
    32, 'NO', 75,
    70, 90, 'https://kayencorp.com/producto/moto-scooter-kuaishan/', '2026-10-30', 'No cargar potencia como dato definitivo: descripción corta indica motor 2000 W, pero tabla técnica de la misma página indica 20000 W. Confirmar con Kayencorp antes de mostrar en comparador.', true
)
ON CONFLICT (id_marca, nombre) DO UPDATE SET
    slug = EXCLUDED.slug,
    vehicle_type = EXCLUDED.vehicle_type,
    listing_status = EXCLUDED.listing_status,
    data_status = EXCLUDED.data_status,
    precio_referencial_pen = EXCLUDED.precio_referencial_pen,
    precio_regular_pen = EXCLUDED.precio_regular_pen,
    precio_min_pen = EXCLUDED.precio_min_pen,
    precio_max_pen = EXCLUDED.precio_max_pen,
    potencia_motor_w = EXCLUDED.potencia_motor_w,
    potencia_max_w = EXCLUDED.potencia_max_w,
    bateria_quimica = EXCLUDED.bateria_quimica,
    voltaje_nominal_v = EXCLUDED.voltaje_nominal_v,
    bateria_capacidad_ah = EXCLUDED.bateria_capacidad_ah,
    bateria_extraible = EXCLUDED.bateria_extraible,
    velocidad_max_kmh = EXCLUDED.velocidad_max_kmh,
    autonomia_min_km = EXCLUDED.autonomia_min_km,
    autonomia_max_km = EXCLUDED.autonomia_max_km,
    source_url = EXCLUDED.source_url,
    source_checked_on = EXCLUDED.source_checked_on,
    notas = EXCLUDED.notas;

INSERT INTO modelos_moto (
    id_marca, nombre, slug, vehicle_type, listing_status, data_status,
    precio_referencial_pen, precio_regular_pen, precio_min_pen, precio_max_pen,
    potencia_motor_w, potencia_max_w, bateria_quimica, voltaje_nominal_v,
    bateria_capacidad_ah, bateria_extraible, velocidad_max_kmh,
    autonomia_min_km, autonomia_max_km, source_url, source_checked_on, notas, estado
) VALUES (
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'KAYENCORP' LIMIT 1),
    'Bicimoto IDO',
    'kayencorp-bicimoto-ido',
    'BICIMOTO',
    'SOLO_COMPATIBILIDAD',
    'SOLO_REFERENCIA_DE_REPUESTO',
    NULL, NULL, NULL, NULL,
    NULL, NULL, NULL, NULL,
    NULL, 'NO_DECLARADO', NULL,
    NULL, NULL, 'https://kayencorp.com/producto/guardafango-posterior-bicimoto-ido/', '2026-10-30', 'Modelo referenciado específicamente por un guardafango; ficha técnica de vehículo no recopilada.', true
)
ON CONFLICT (id_marca, nombre) DO UPDATE SET
    slug = EXCLUDED.slug,
    vehicle_type = EXCLUDED.vehicle_type,
    listing_status = EXCLUDED.listing_status,
    data_status = EXCLUDED.data_status,
    precio_referencial_pen = EXCLUDED.precio_referencial_pen,
    precio_regular_pen = EXCLUDED.precio_regular_pen,
    precio_min_pen = EXCLUDED.precio_min_pen,
    precio_max_pen = EXCLUDED.precio_max_pen,
    potencia_motor_w = EXCLUDED.potencia_motor_w,
    potencia_max_w = EXCLUDED.potencia_max_w,
    bateria_quimica = EXCLUDED.bateria_quimica,
    voltaje_nominal_v = EXCLUDED.voltaje_nominal_v,
    bateria_capacidad_ah = EXCLUDED.bateria_capacidad_ah,
    bateria_extraible = EXCLUDED.bateria_extraible,
    velocidad_max_kmh = EXCLUDED.velocidad_max_kmh,
    autonomia_min_km = EXCLUDED.autonomia_min_km,
    autonomia_max_km = EXCLUDED.autonomia_max_km,
    source_url = EXCLUDED.source_url,
    source_checked_on = EXCLUDED.source_checked_on,
    notas = EXCLUDED.notas;

INSERT INTO modelos_moto (
    id_marca, nombre, slug, vehicle_type, listing_status, data_status,
    precio_referencial_pen, precio_regular_pen, precio_min_pen, precio_max_pen,
    potencia_motor_w, potencia_max_w, bateria_quimica, voltaje_nominal_v,
    bateria_capacidad_ah, bateria_extraible, velocidad_max_kmh,
    autonomia_min_km, autonomia_max_km, source_url, source_checked_on, notas, estado
) VALUES (
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'KAYENCORP' LIMIT 1),
    'Moto MNK2',
    'kayencorp-moto-mnk2',
    'MOTO_ELECTRICA',
    'SOLO_COMPATIBILIDAD',
    'SOLO_REFERENCIA_DE_REPUESTO',
    NULL, NULL, NULL, NULL,
    NULL, NULL, NULL, NULL,
    NULL, 'NO_DECLARADO', NULL,
    NULL, NULL, 'https://kayencorp.com/producto/pastillas-de-freno-moto-mnk2/', '2026-10-30', 'Modelo referenciado por pastillas de freno SKU 1020; la página consultada no muestra precio en el resultado.', true
)
ON CONFLICT (id_marca, nombre) DO UPDATE SET
    slug = EXCLUDED.slug,
    vehicle_type = EXCLUDED.vehicle_type,
    listing_status = EXCLUDED.listing_status,
    data_status = EXCLUDED.data_status,
    precio_referencial_pen = EXCLUDED.precio_referencial_pen,
    precio_regular_pen = EXCLUDED.precio_regular_pen,
    precio_min_pen = EXCLUDED.precio_min_pen,
    precio_max_pen = EXCLUDED.precio_max_pen,
    potencia_motor_w = EXCLUDED.potencia_motor_w,
    potencia_max_w = EXCLUDED.potencia_max_w,
    bateria_quimica = EXCLUDED.bateria_quimica,
    voltaje_nominal_v = EXCLUDED.voltaje_nominal_v,
    bateria_capacidad_ah = EXCLUDED.bateria_capacidad_ah,
    bateria_extraible = EXCLUDED.bateria_extraible,
    velocidad_max_kmh = EXCLUDED.velocidad_max_kmh,
    autonomia_min_km = EXCLUDED.autonomia_min_km,
    autonomia_max_km = EXCLUDED.autonomia_max_km,
    source_url = EXCLUDED.source_url,
    source_checked_on = EXCLUDED.source_checked_on,
    notas = EXCLUDED.notas;

INSERT INTO modelos_moto (
    id_marca, nombre, slug, vehicle_type, listing_status, data_status,
    precio_referencial_pen, precio_regular_pen, precio_min_pen, precio_max_pen,
    potencia_motor_w, potencia_max_w, bateria_quimica, voltaje_nominal_v,
    bateria_capacidad_ah, bateria_extraible, velocidad_max_kmh,
    autonomia_min_km, autonomia_max_km, source_url, source_checked_on, notas, estado
) VALUES (
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'GREENLINE' LIMIT 1),
    'H5',
    'greenline-h5',
    'MOTO_ELECTRICA',
    'CATALOGO',
    'VERIFICADO_EN_FICHA',
    3200, 3800, 3200, 3200,
    1000, 1250, 'PLOMO_ACIDO', 60,
    20, 'NO', 45,
    45, 55, 'https://www.glperu.com/tienda/greenline-h5/', '2026-10-30', 'Faro LED, alarma, llanta 3.00-10. Autonomía bajo condiciones publicadas por GreenLine.', true
)
ON CONFLICT (id_marca, nombre) DO UPDATE SET
    slug = EXCLUDED.slug,
    vehicle_type = EXCLUDED.vehicle_type,
    listing_status = EXCLUDED.listing_status,
    data_status = EXCLUDED.data_status,
    precio_referencial_pen = EXCLUDED.precio_referencial_pen,
    precio_regular_pen = EXCLUDED.precio_regular_pen,
    precio_min_pen = EXCLUDED.precio_min_pen,
    precio_max_pen = EXCLUDED.precio_max_pen,
    potencia_motor_w = EXCLUDED.potencia_motor_w,
    potencia_max_w = EXCLUDED.potencia_max_w,
    bateria_quimica = EXCLUDED.bateria_quimica,
    voltaje_nominal_v = EXCLUDED.voltaje_nominal_v,
    bateria_capacidad_ah = EXCLUDED.bateria_capacidad_ah,
    bateria_extraible = EXCLUDED.bateria_extraible,
    velocidad_max_kmh = EXCLUDED.velocidad_max_kmh,
    autonomia_min_km = EXCLUDED.autonomia_min_km,
    autonomia_max_km = EXCLUDED.autonomia_max_km,
    source_url = EXCLUDED.source_url,
    source_checked_on = EXCLUDED.source_checked_on,
    notas = EXCLUDED.notas;

INSERT INTO modelos_moto (
    id_marca, nombre, slug, vehicle_type, listing_status, data_status,
    precio_referencial_pen, precio_regular_pen, precio_min_pen, precio_max_pen,
    potencia_motor_w, potencia_max_w, bateria_quimica, voltaje_nominal_v,
    bateria_capacidad_ah, bateria_extraible, velocidad_max_kmh,
    autonomia_min_km, autonomia_max_km, source_url, source_checked_on, notas, estado
) VALUES (
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'GREENLINE' LIMIT 1),
    'X3',
    'greenline-x3',
    'MOTO_ELECTRICA',
    'CATALOGO',
    'REVISAR_FUENTE',
    3500, 4100, 3500, 3500,
    1500, 2100, 'PLOMO_ACIDO', 72,
    25, 'NO', NULL,
    45, 55, 'https://glperu.com/tienda/greenline-x3/', '2026-10-30', 'Conflicto interno de velocidad: resumen y ficha dicen 60 km/h, descripción dice 50 km/h. Dejar max_speed_kmh vacío hasta confirmar versión.', true
)
ON CONFLICT (id_marca, nombre) DO UPDATE SET
    slug = EXCLUDED.slug,
    vehicle_type = EXCLUDED.vehicle_type,
    listing_status = EXCLUDED.listing_status,
    data_status = EXCLUDED.data_status,
    precio_referencial_pen = EXCLUDED.precio_referencial_pen,
    precio_regular_pen = EXCLUDED.precio_regular_pen,
    precio_min_pen = EXCLUDED.precio_min_pen,
    precio_max_pen = EXCLUDED.precio_max_pen,
    potencia_motor_w = EXCLUDED.potencia_motor_w,
    potencia_max_w = EXCLUDED.potencia_max_w,
    bateria_quimica = EXCLUDED.bateria_quimica,
    voltaje_nominal_v = EXCLUDED.voltaje_nominal_v,
    bateria_capacidad_ah = EXCLUDED.bateria_capacidad_ah,
    bateria_extraible = EXCLUDED.bateria_extraible,
    velocidad_max_kmh = EXCLUDED.velocidad_max_kmh,
    autonomia_min_km = EXCLUDED.autonomia_min_km,
    autonomia_max_km = EXCLUDED.autonomia_max_km,
    source_url = EXCLUDED.source_url,
    source_checked_on = EXCLUDED.source_checked_on,
    notas = EXCLUDED.notas;

INSERT INTO modelos_moto (
    id_marca, nombre, slug, vehicle_type, listing_status, data_status,
    precio_referencial_pen, precio_regular_pen, precio_min_pen, precio_max_pen,
    potencia_motor_w, potencia_max_w, bateria_quimica, voltaje_nominal_v,
    bateria_capacidad_ah, bateria_extraible, velocidad_max_kmh,
    autonomia_min_km, autonomia_max_km, source_url, source_checked_on, notas, estado
) VALUES (
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'GREENLINE' LIMIT 1),
    'X6 PRO',
    'greenline-x6-pro',
    'MOTO_ELECTRICA',
    'CATALOGO',
    'VERIFICADO_EN_FICHA',
    4200, 4500, 4200, 4200,
    1500, 1875, 'PLOMO_GRAFENO', 72,
    26, 'NO', 50,
    50, 60, 'https://glperu.com/tienda/greenline-x6-pro/', '2026-10-30', 'La ficha publica batería 72V26Ah, doble disco y llantas 90/90-12 y 90/80-12.', true
)
ON CONFLICT (id_marca, nombre) DO UPDATE SET
    slug = EXCLUDED.slug,
    vehicle_type = EXCLUDED.vehicle_type,
    listing_status = EXCLUDED.listing_status,
    data_status = EXCLUDED.data_status,
    precio_referencial_pen = EXCLUDED.precio_referencial_pen,
    precio_regular_pen = EXCLUDED.precio_regular_pen,
    precio_min_pen = EXCLUDED.precio_min_pen,
    precio_max_pen = EXCLUDED.precio_max_pen,
    potencia_motor_w = EXCLUDED.potencia_motor_w,
    potencia_max_w = EXCLUDED.potencia_max_w,
    bateria_quimica = EXCLUDED.bateria_quimica,
    voltaje_nominal_v = EXCLUDED.voltaje_nominal_v,
    bateria_capacidad_ah = EXCLUDED.bateria_capacidad_ah,
    bateria_extraible = EXCLUDED.bateria_extraible,
    velocidad_max_kmh = EXCLUDED.velocidad_max_kmh,
    autonomia_min_km = EXCLUDED.autonomia_min_km,
    autonomia_max_km = EXCLUDED.autonomia_max_km,
    source_url = EXCLUDED.source_url,
    source_checked_on = EXCLUDED.source_checked_on,
    notas = EXCLUDED.notas;

INSERT INTO modelos_moto (
    id_marca, nombre, slug, vehicle_type, listing_status, data_status,
    precio_referencial_pen, precio_regular_pen, precio_min_pen, precio_max_pen,
    potencia_motor_w, potencia_max_w, bateria_quimica, voltaje_nominal_v,
    bateria_capacidad_ah, bateria_extraible, velocidad_max_kmh,
    autonomia_min_km, autonomia_max_km, source_url, source_checked_on, notas, estado
) VALUES (
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'GREENLINE' LIMIT 1),
    'H3 Pro',
    'greenline-h3-pro',
    'MOTO_ELECTRICA',
    'CATALOGO',
    'PARCIAL',
    3600, 3800, 3600, 3600,
    1200, NULL, 'PLOMO_GRAFENO', NULL,
    NULL, 'NO_DECLARADO', NULL,
    50, 60, 'https://www.glperu.com/tienda/', '2026-10-30', 'El catálogo general da precio, motor, química de batería y autonomía; no copiar voltaje/capacidad ni velocidad no mostrados.', true
)
ON CONFLICT (id_marca, nombre) DO UPDATE SET
    slug = EXCLUDED.slug,
    vehicle_type = EXCLUDED.vehicle_type,
    listing_status = EXCLUDED.listing_status,
    data_status = EXCLUDED.data_status,
    precio_referencial_pen = EXCLUDED.precio_referencial_pen,
    precio_regular_pen = EXCLUDED.precio_regular_pen,
    precio_min_pen = EXCLUDED.precio_min_pen,
    precio_max_pen = EXCLUDED.precio_max_pen,
    potencia_motor_w = EXCLUDED.potencia_motor_w,
    potencia_max_w = EXCLUDED.potencia_max_w,
    bateria_quimica = EXCLUDED.bateria_quimica,
    voltaje_nominal_v = EXCLUDED.voltaje_nominal_v,
    bateria_capacidad_ah = EXCLUDED.bateria_capacidad_ah,
    bateria_extraible = EXCLUDED.bateria_extraible,
    velocidad_max_kmh = EXCLUDED.velocidad_max_kmh,
    autonomia_min_km = EXCLUDED.autonomia_min_km,
    autonomia_max_km = EXCLUDED.autonomia_max_km,
    source_url = EXCLUDED.source_url,
    source_checked_on = EXCLUDED.source_checked_on,
    notas = EXCLUDED.notas;

INSERT INTO modelos_moto (
    id_marca, nombre, slug, vehicle_type, listing_status, data_status,
    precio_referencial_pen, precio_regular_pen, precio_min_pen, precio_max_pen,
    potencia_motor_w, potencia_max_w, bateria_quimica, voltaje_nominal_v,
    bateria_capacidad_ah, bateria_extraible, velocidad_max_kmh,
    autonomia_min_km, autonomia_max_km, source_url, source_checked_on, notas, estado
) VALUES (
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'GREENLINE' LIMIT 1),
    'Y5',
    'greenline-y5',
    'MOTO_ELECTRICA',
    'CATALOGO',
    'PARCIAL',
    3700, 4200, 3700, 3700,
    1200, NULL, 'PLOMO_GRAFENO', NULL,
    NULL, 'NO_DECLARADO', NULL,
    55, 65, 'https://www.glperu.com/tienda/', '2026-10-30', 'El catálogo general da precio, motor, química de batería y autonomía; ficha detallada pendiente.', true
)
ON CONFLICT (id_marca, nombre) DO UPDATE SET
    slug = EXCLUDED.slug,
    vehicle_type = EXCLUDED.vehicle_type,
    listing_status = EXCLUDED.listing_status,
    data_status = EXCLUDED.data_status,
    precio_referencial_pen = EXCLUDED.precio_referencial_pen,
    precio_regular_pen = EXCLUDED.precio_regular_pen,
    precio_min_pen = EXCLUDED.precio_min_pen,
    precio_max_pen = EXCLUDED.precio_max_pen,
    potencia_motor_w = EXCLUDED.potencia_motor_w,
    potencia_max_w = EXCLUDED.potencia_max_w,
    bateria_quimica = EXCLUDED.bateria_quimica,
    voltaje_nominal_v = EXCLUDED.voltaje_nominal_v,
    bateria_capacidad_ah = EXCLUDED.bateria_capacidad_ah,
    bateria_extraible = EXCLUDED.bateria_extraible,
    velocidad_max_kmh = EXCLUDED.velocidad_max_kmh,
    autonomia_min_km = EXCLUDED.autonomia_min_km,
    autonomia_max_km = EXCLUDED.autonomia_max_km,
    source_url = EXCLUDED.source_url,
    source_checked_on = EXCLUDED.source_checked_on,
    notas = EXCLUDED.notas;

INSERT INTO modelos_moto (
    id_marca, nombre, slug, vehicle_type, listing_status, data_status,
    precio_referencial_pen, precio_regular_pen, precio_min_pen, precio_max_pen,
    potencia_motor_w, potencia_max_w, bateria_quimica, voltaje_nominal_v,
    bateria_capacidad_ah, bateria_extraible, velocidad_max_kmh,
    autonomia_min_km, autonomia_max_km, source_url, source_checked_on, notas, estado
) VALUES (
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'GREENLINE' LIMIT 1),
    'V9 Pro',
    'greenline-v9-pro',
    'MOTO_ELECTRICA',
    'CATALOGO',
    'PARCIAL',
    3700, 4000, 3700, 3700,
    1200, NULL, 'PLOMO_GRAFENO', NULL,
    NULL, 'NO_DECLARADO', NULL,
    55, 65, 'https://www.glperu.com/tienda/', '2026-10-30', 'El catálogo general da precio, motor, química de batería y autonomía; ficha detallada pendiente.', true
)
ON CONFLICT (id_marca, nombre) DO UPDATE SET
    slug = EXCLUDED.slug,
    vehicle_type = EXCLUDED.vehicle_type,
    listing_status = EXCLUDED.listing_status,
    data_status = EXCLUDED.data_status,
    precio_referencial_pen = EXCLUDED.precio_referencial_pen,
    precio_regular_pen = EXCLUDED.precio_regular_pen,
    precio_min_pen = EXCLUDED.precio_min_pen,
    precio_max_pen = EXCLUDED.precio_max_pen,
    potencia_motor_w = EXCLUDED.potencia_motor_w,
    potencia_max_w = EXCLUDED.potencia_max_w,
    bateria_quimica = EXCLUDED.bateria_quimica,
    voltaje_nominal_v = EXCLUDED.voltaje_nominal_v,
    bateria_capacidad_ah = EXCLUDED.bateria_capacidad_ah,
    bateria_extraible = EXCLUDED.bateria_extraible,
    velocidad_max_kmh = EXCLUDED.velocidad_max_kmh,
    autonomia_min_km = EXCLUDED.autonomia_min_km,
    autonomia_max_km = EXCLUDED.autonomia_max_km,
    source_url = EXCLUDED.source_url,
    source_checked_on = EXCLUDED.source_checked_on,
    notas = EXCLUDED.notas;

INSERT INTO modelos_moto (
    id_marca, nombre, slug, vehicle_type, listing_status, data_status,
    precio_referencial_pen, precio_regular_pen, precio_min_pen, precio_max_pen,
    potencia_motor_w, potencia_max_w, bateria_quimica, voltaje_nominal_v,
    bateria_capacidad_ah, bateria_extraible, velocidad_max_kmh,
    autonomia_min_km, autonomia_max_km, source_url, source_checked_on, notas, estado
) VALUES (
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'GREENLINE' LIMIT 1),
    'T8 (2026)',
    'greenline-t8-2026',
    'MOTO_ELECTRICA',
    'CATALOGO',
    'PARCIAL',
    NULL, NULL, NULL, NULL,
    1200, NULL, 'LITIO', 60,
    30, 'NO_DECLARADO', NULL,
    NULL, NULL, 'https://www.glperu.com/', '2026-10-30', 'La página de inicio lo presenta como nuevo modelo 2026 con motor 1200W y batería litio 60V30Ah; precio, velocidad y autonomía no visibles en el extracto.', true
)
ON CONFLICT (id_marca, nombre) DO UPDATE SET
    slug = EXCLUDED.slug,
    vehicle_type = EXCLUDED.vehicle_type,
    listing_status = EXCLUDED.listing_status,
    data_status = EXCLUDED.data_status,
    precio_referencial_pen = EXCLUDED.precio_referencial_pen,
    precio_regular_pen = EXCLUDED.precio_regular_pen,
    precio_min_pen = EXCLUDED.precio_min_pen,
    precio_max_pen = EXCLUDED.precio_max_pen,
    potencia_motor_w = EXCLUDED.potencia_motor_w,
    potencia_max_w = EXCLUDED.potencia_max_w,
    bateria_quimica = EXCLUDED.bateria_quimica,
    voltaje_nominal_v = EXCLUDED.voltaje_nominal_v,
    bateria_capacidad_ah = EXCLUDED.bateria_capacidad_ah,
    bateria_extraible = EXCLUDED.bateria_extraible,
    velocidad_max_kmh = EXCLUDED.velocidad_max_kmh,
    autonomia_min_km = EXCLUDED.autonomia_min_km,
    autonomia_max_km = EXCLUDED.autonomia_max_km,
    source_url = EXCLUDED.source_url,
    source_checked_on = EXCLUDED.source_checked_on,
    notas = EXCLUDED.notas;

INSERT INTO modelos_moto (
    id_marca, nombre, slug, vehicle_type, listing_status, data_status,
    precio_referencial_pen, precio_regular_pen, precio_min_pen, precio_max_pen,
    potencia_motor_w, potencia_max_w, bateria_quimica, voltaje_nominal_v,
    bateria_capacidad_ah, bateria_extraible, velocidad_max_kmh,
    autonomia_min_km, autonomia_max_km, source_url, source_checked_on, notas, estado
) VALUES (
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'GREENLINE' LIMIT 1),
    'V8',
    'greenline-v8',
    'MOTO_ELECTRICA',
    'CATALOGO',
    'PARCIAL',
    4200, NULL, 4200, 4200,
    1200, NULL, 'PLOMO_ACIDO', 72,
    20, 'NO_DECLARADO', 45,
    NULL, NULL, 'https://glperu.com/tienda/greenline-v8/', '2026-10-30', 'La ficha resumida indica motor 1200W, batería 72V20Ah y velocidad 45 km/h; autonomía no indicada en el extracto.', true
)
ON CONFLICT (id_marca, nombre) DO UPDATE SET
    slug = EXCLUDED.slug,
    vehicle_type = EXCLUDED.vehicle_type,
    listing_status = EXCLUDED.listing_status,
    data_status = EXCLUDED.data_status,
    precio_referencial_pen = EXCLUDED.precio_referencial_pen,
    precio_regular_pen = EXCLUDED.precio_regular_pen,
    precio_min_pen = EXCLUDED.precio_min_pen,
    precio_max_pen = EXCLUDED.precio_max_pen,
    potencia_motor_w = EXCLUDED.potencia_motor_w,
    potencia_max_w = EXCLUDED.potencia_max_w,
    bateria_quimica = EXCLUDED.bateria_quimica,
    voltaje_nominal_v = EXCLUDED.voltaje_nominal_v,
    bateria_capacidad_ah = EXCLUDED.bateria_capacidad_ah,
    bateria_extraible = EXCLUDED.bateria_extraible,
    velocidad_max_kmh = EXCLUDED.velocidad_max_kmh,
    autonomia_min_km = EXCLUDED.autonomia_min_km,
    autonomia_max_km = EXCLUDED.autonomia_max_km,
    source_url = EXCLUDED.source_url,
    source_checked_on = EXCLUDED.source_checked_on,
    notas = EXCLUDED.notas;

INSERT INTO modelos_moto (
    id_marca, nombre, slug, vehicle_type, listing_status, data_status,
    precio_referencial_pen, precio_regular_pen, precio_min_pen, precio_max_pen,
    potencia_motor_w, potencia_max_w, bateria_quimica, voltaje_nominal_v,
    bateria_capacidad_ah, bateria_extraible, velocidad_max_kmh,
    autonomia_min_km, autonomia_max_km, source_url, source_checked_on, notas, estado
) VALUES (
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'GREENLINE' LIMIT 1),
    'M6',
    'greenline-m6',
    'MOTO_ELECTRICA',
    'SOLO_COMPATIBILIDAD',
    'SOLO_REFERENCIA_DE_REPUESTO',
    NULL, NULL, NULL, NULL,
    NULL, NULL, NULL, 60,
    NULL, 'NO_DECLARADO', NULL,
    NULL, NULL, 'https://tailg.com.pe/motos/repuestos-y-accesorios-originales/', '2026-10-30', 'TAILG indica que un cargador de puerto TAILG aplica a modelos GreenLine M6 si usan batería 60V20/22Ah y puerto compatible. Confirmar variante.', true
)
ON CONFLICT (id_marca, nombre) DO UPDATE SET
    slug = EXCLUDED.slug,
    vehicle_type = EXCLUDED.vehicle_type,
    listing_status = EXCLUDED.listing_status,
    data_status = EXCLUDED.data_status,
    precio_referencial_pen = EXCLUDED.precio_referencial_pen,
    precio_regular_pen = EXCLUDED.precio_regular_pen,
    precio_min_pen = EXCLUDED.precio_min_pen,
    precio_max_pen = EXCLUDED.precio_max_pen,
    potencia_motor_w = EXCLUDED.potencia_motor_w,
    potencia_max_w = EXCLUDED.potencia_max_w,
    bateria_quimica = EXCLUDED.bateria_quimica,
    voltaje_nominal_v = EXCLUDED.voltaje_nominal_v,
    bateria_capacidad_ah = EXCLUDED.bateria_capacidad_ah,
    bateria_extraible = EXCLUDED.bateria_extraible,
    velocidad_max_kmh = EXCLUDED.velocidad_max_kmh,
    autonomia_min_km = EXCLUDED.autonomia_min_km,
    autonomia_max_km = EXCLUDED.autonomia_max_km,
    source_url = EXCLUDED.source_url,
    source_checked_on = EXCLUDED.source_checked_on,
    notas = EXCLUDED.notas;

INSERT INTO modelos_moto (
    id_marca, nombre, slug, vehicle_type, listing_status, data_status,
    precio_referencial_pen, precio_regular_pen, precio_min_pen, precio_max_pen,
    potencia_motor_w, potencia_max_w, bateria_quimica, voltaje_nominal_v,
    bateria_capacidad_ah, bateria_extraible, velocidad_max_kmh,
    autonomia_min_km, autonomia_max_km, source_url, source_checked_on, notas, estado
) VALUES (
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'GREENLINE' LIMIT 1),
    'M5',
    'greenline-m5',
    'MOTO_ELECTRICA',
    'SOLO_COMPATIBILIDAD',
    'SOLO_REFERENCIA_DE_REPUESTO',
    NULL, NULL, NULL, NULL,
    NULL, NULL, NULL, 60,
    NULL, 'NO_DECLARADO', NULL,
    NULL, NULL, 'https://tailg.com.pe/motos/repuestos-y-accesorios-originales/', '2026-10-30', 'TAILG indica que un cargador de puerto TAILG aplica a modelos GreenLine M5 si usan batería 60V20/22Ah y puerto compatible. Confirmar variante.', true
)
ON CONFLICT (id_marca, nombre) DO UPDATE SET
    slug = EXCLUDED.slug,
    vehicle_type = EXCLUDED.vehicle_type,
    listing_status = EXCLUDED.listing_status,
    data_status = EXCLUDED.data_status,
    precio_referencial_pen = EXCLUDED.precio_referencial_pen,
    precio_regular_pen = EXCLUDED.precio_regular_pen,
    precio_min_pen = EXCLUDED.precio_min_pen,
    precio_max_pen = EXCLUDED.precio_max_pen,
    potencia_motor_w = EXCLUDED.potencia_motor_w,
    potencia_max_w = EXCLUDED.potencia_max_w,
    bateria_quimica = EXCLUDED.bateria_quimica,
    voltaje_nominal_v = EXCLUDED.voltaje_nominal_v,
    bateria_capacidad_ah = EXCLUDED.bateria_capacidad_ah,
    bateria_extraible = EXCLUDED.bateria_extraible,
    velocidad_max_kmh = EXCLUDED.velocidad_max_kmh,
    autonomia_min_km = EXCLUDED.autonomia_min_km,
    autonomia_max_km = EXCLUDED.autonomia_max_km,
    source_url = EXCLUDED.source_url,
    source_checked_on = EXCLUDED.source_checked_on,
    notas = EXCLUDED.notas;

INSERT INTO modelos_moto (
    id_marca, nombre, slug, vehicle_type, listing_status, data_status,
    precio_referencial_pen, precio_regular_pen, precio_min_pen, precio_max_pen,
    potencia_motor_w, potencia_max_w, bateria_quimica, voltaje_nominal_v,
    bateria_capacidad_ah, bateria_extraible, velocidad_max_kmh,
    autonomia_min_km, autonomia_max_km, source_url, source_checked_on, notas, estado
) VALUES (
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'GREENLINE' LIMIT 1),
    'E3',
    'greenline-e3',
    'MOTO_ELECTRICA',
    'SOLO_COMPATIBILIDAD',
    'SOLO_REFERENCIA_DE_REPUESTO',
    NULL, NULL, NULL, NULL,
    NULL, NULL, NULL, 60,
    NULL, 'NO_DECLARADO', NULL,
    NULL, NULL, 'https://tailg.com.pe/motos/repuestos-y-accesorios-originales/', '2026-10-30', 'TAILG indica que un cargador de puerto TAILG aplica a modelos GreenLine E3 si usan batería 60V20/22Ah y puerto compatible. Confirmar variante.', true
)
ON CONFLICT (id_marca, nombre) DO UPDATE SET
    slug = EXCLUDED.slug,
    vehicle_type = EXCLUDED.vehicle_type,
    listing_status = EXCLUDED.listing_status,
    data_status = EXCLUDED.data_status,
    precio_referencial_pen = EXCLUDED.precio_referencial_pen,
    precio_regular_pen = EXCLUDED.precio_regular_pen,
    precio_min_pen = EXCLUDED.precio_min_pen,
    precio_max_pen = EXCLUDED.precio_max_pen,
    potencia_motor_w = EXCLUDED.potencia_motor_w,
    potencia_max_w = EXCLUDED.potencia_max_w,
    bateria_quimica = EXCLUDED.bateria_quimica,
    voltaje_nominal_v = EXCLUDED.voltaje_nominal_v,
    bateria_capacidad_ah = EXCLUDED.bateria_capacidad_ah,
    bateria_extraible = EXCLUDED.bateria_extraible,
    velocidad_max_kmh = EXCLUDED.velocidad_max_kmh,
    autonomia_min_km = EXCLUDED.autonomia_min_km,
    autonomia_max_km = EXCLUDED.autonomia_max_km,
    source_url = EXCLUDED.source_url,
    source_checked_on = EXCLUDED.source_checked_on,
    notas = EXCLUDED.notas;

INSERT INTO modelos_moto (
    id_marca, nombre, slug, vehicle_type, listing_status, data_status,
    precio_referencial_pen, precio_regular_pen, precio_min_pen, precio_max_pen,
    potencia_motor_w, potencia_max_w, bateria_quimica, voltaje_nominal_v,
    bateria_capacidad_ah, bateria_extraible, velocidad_max_kmh,
    autonomia_min_km, autonomia_max_km, source_url, source_checked_on, notas, estado
) VALUES (
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'GREENLINE' LIMIT 1),
    'E5',
    'greenline-e5',
    'MOTO_ELECTRICA',
    'SOLO_COMPATIBILIDAD',
    'SOLO_REFERENCIA_DE_REPUESTO',
    NULL, NULL, NULL, NULL,
    NULL, NULL, NULL, 60,
    NULL, 'NO_DECLARADO', NULL,
    NULL, NULL, 'https://tailg.com.pe/motos/repuestos-y-accesorios-originales/', '2026-10-30', 'TAILG indica que un cargador de puerto TAILG aplica a modelos GreenLine E5 si usan batería 60V20/22Ah y puerto compatible. No confundir con TAILG E5.', true
)
ON CONFLICT (id_marca, nombre) DO UPDATE SET
    slug = EXCLUDED.slug,
    vehicle_type = EXCLUDED.vehicle_type,
    listing_status = EXCLUDED.listing_status,
    data_status = EXCLUDED.data_status,
    precio_referencial_pen = EXCLUDED.precio_referencial_pen,
    precio_regular_pen = EXCLUDED.precio_regular_pen,
    precio_min_pen = EXCLUDED.precio_min_pen,
    precio_max_pen = EXCLUDED.precio_max_pen,
    potencia_motor_w = EXCLUDED.potencia_motor_w,
    potencia_max_w = EXCLUDED.potencia_max_w,
    bateria_quimica = EXCLUDED.bateria_quimica,
    voltaje_nominal_v = EXCLUDED.voltaje_nominal_v,
    bateria_capacidad_ah = EXCLUDED.bateria_capacidad_ah,
    bateria_extraible = EXCLUDED.bateria_extraible,
    velocidad_max_kmh = EXCLUDED.velocidad_max_kmh,
    autonomia_min_km = EXCLUDED.autonomia_min_km,
    autonomia_max_km = EXCLUDED.autonomia_max_km,
    source_url = EXCLUDED.source_url,
    source_checked_on = EXCLUDED.source_checked_on,
    notas = EXCLUDED.notas;

INSERT INTO modelos_moto (
    id_marca, nombre, slug, vehicle_type, listing_status, data_status,
    precio_referencial_pen, precio_regular_pen, precio_min_pen, precio_max_pen,
    potencia_motor_w, potencia_max_w, bateria_quimica, voltaje_nominal_v,
    bateria_capacidad_ah, bateria_extraible, velocidad_max_kmh,
    autonomia_min_km, autonomia_max_km, source_url, source_checked_on, notas, estado
) VALUES (
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'GREENLINE' LIMIT 1),
    'F6',
    'greenline-f6',
    'VMP_BICIMOTO',
    'SOLO_COMPATIBILIDAD',
    'SOLO_REFERENCIA_DE_REPUESTO',
    NULL, NULL, NULL, NULL,
    NULL, NULL, NULL, 72,
    NULL, 'NO_DECLARADO', NULL,
    NULL, NULL, 'https://glperu.com/tienda/cargador-72v-3a-greenline/', '2026-10-30', 'Modelo listado como compatible con cargador GreenLine 72V3A; ficha de vehículo pendiente.', true
)
ON CONFLICT (id_marca, nombre) DO UPDATE SET
    slug = EXCLUDED.slug,
    vehicle_type = EXCLUDED.vehicle_type,
    listing_status = EXCLUDED.listing_status,
    data_status = EXCLUDED.data_status,
    precio_referencial_pen = EXCLUDED.precio_referencial_pen,
    precio_regular_pen = EXCLUDED.precio_regular_pen,
    precio_min_pen = EXCLUDED.precio_min_pen,
    precio_max_pen = EXCLUDED.precio_max_pen,
    potencia_motor_w = EXCLUDED.potencia_motor_w,
    potencia_max_w = EXCLUDED.potencia_max_w,
    bateria_quimica = EXCLUDED.bateria_quimica,
    voltaje_nominal_v = EXCLUDED.voltaje_nominal_v,
    bateria_capacidad_ah = EXCLUDED.bateria_capacidad_ah,
    bateria_extraible = EXCLUDED.bateria_extraible,
    velocidad_max_kmh = EXCLUDED.velocidad_max_kmh,
    autonomia_min_km = EXCLUDED.autonomia_min_km,
    autonomia_max_km = EXCLUDED.autonomia_max_km,
    source_url = EXCLUDED.source_url,
    source_checked_on = EXCLUDED.source_checked_on,
    notas = EXCLUDED.notas;

INSERT INTO modelos_moto (
    id_marca, nombre, slug, vehicle_type, listing_status, data_status,
    precio_referencial_pen, precio_regular_pen, precio_min_pen, precio_max_pen,
    potencia_motor_w, potencia_max_w, bateria_quimica, voltaje_nominal_v,
    bateria_capacidad_ah, bateria_extraible, velocidad_max_kmh,
    autonomia_min_km, autonomia_max_km, source_url, source_checked_on, notas, estado
) VALUES (
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'GREENLINE' LIMIT 1),
    'J4',
    'greenline-j4',
    'VMP_BICIMOTO',
    'SOLO_COMPATIBILIDAD',
    'SOLO_REFERENCIA_DE_REPUESTO',
    NULL, NULL, NULL, NULL,
    NULL, NULL, NULL, 72,
    NULL, 'NO_DECLARADO', NULL,
    NULL, NULL, 'https://glperu.com/tienda/cargador-72v-3a-greenline/', '2026-10-30', 'Modelo listado como compatible con cargador GreenLine 72V3A; ficha de vehículo pendiente.', true
)
ON CONFLICT (id_marca, nombre) DO UPDATE SET
    slug = EXCLUDED.slug,
    vehicle_type = EXCLUDED.vehicle_type,
    listing_status = EXCLUDED.listing_status,
    data_status = EXCLUDED.data_status,
    precio_referencial_pen = EXCLUDED.precio_referencial_pen,
    precio_regular_pen = EXCLUDED.precio_regular_pen,
    precio_min_pen = EXCLUDED.precio_min_pen,
    precio_max_pen = EXCLUDED.precio_max_pen,
    potencia_motor_w = EXCLUDED.potencia_motor_w,
    potencia_max_w = EXCLUDED.potencia_max_w,
    bateria_quimica = EXCLUDED.bateria_quimica,
    voltaje_nominal_v = EXCLUDED.voltaje_nominal_v,
    bateria_capacidad_ah = EXCLUDED.bateria_capacidad_ah,
    bateria_extraible = EXCLUDED.bateria_extraible,
    velocidad_max_kmh = EXCLUDED.velocidad_max_kmh,
    autonomia_min_km = EXCLUDED.autonomia_min_km,
    autonomia_max_km = EXCLUDED.autonomia_max_km,
    source_url = EXCLUDED.source_url,
    source_checked_on = EXCLUDED.source_checked_on,
    notas = EXCLUDED.notas;

INSERT INTO modelos_moto (
    id_marca, nombre, slug, vehicle_type, listing_status, data_status,
    precio_referencial_pen, precio_regular_pen, precio_min_pen, precio_max_pen,
    potencia_motor_w, potencia_max_w, bateria_quimica, voltaje_nominal_v,
    bateria_capacidad_ah, bateria_extraible, velocidad_max_kmh,
    autonomia_min_km, autonomia_max_km, source_url, source_checked_on, notas, estado
) VALUES (
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'GREENLINE' LIMIT 1),
    'TM8X',
    'greenline-tm8x',
    'MOTO_ELECTRICA',
    'SOLO_COMPATIBILIDAD',
    'SOLO_REFERENCIA_DE_REPUESTO',
    NULL, NULL, NULL, NULL,
    NULL, NULL, 'PLOMO_ACIDO', 60,
    NULL, 'NO_DECLARADO', NULL,
    NULL, NULL, 'https://glperu.com/tienda/cargador-60v-3a-modelo-tm8x-tm6x-h2/', '2026-10-30', 'Citado en la ficha de cargador GreenLine 60V3A; no se importan especificaciones de vehículo sin ficha.', true
)
ON CONFLICT (id_marca, nombre) DO UPDATE SET
    slug = EXCLUDED.slug,
    vehicle_type = EXCLUDED.vehicle_type,
    listing_status = EXCLUDED.listing_status,
    data_status = EXCLUDED.data_status,
    precio_referencial_pen = EXCLUDED.precio_referencial_pen,
    precio_regular_pen = EXCLUDED.precio_regular_pen,
    precio_min_pen = EXCLUDED.precio_min_pen,
    precio_max_pen = EXCLUDED.precio_max_pen,
    potencia_motor_w = EXCLUDED.potencia_motor_w,
    potencia_max_w = EXCLUDED.potencia_max_w,
    bateria_quimica = EXCLUDED.bateria_quimica,
    voltaje_nominal_v = EXCLUDED.voltaje_nominal_v,
    bateria_capacidad_ah = EXCLUDED.bateria_capacidad_ah,
    bateria_extraible = EXCLUDED.bateria_extraible,
    velocidad_max_kmh = EXCLUDED.velocidad_max_kmh,
    autonomia_min_km = EXCLUDED.autonomia_min_km,
    autonomia_max_km = EXCLUDED.autonomia_max_km,
    source_url = EXCLUDED.source_url,
    source_checked_on = EXCLUDED.source_checked_on,
    notas = EXCLUDED.notas;

INSERT INTO modelos_moto (
    id_marca, nombre, slug, vehicle_type, listing_status, data_status,
    precio_referencial_pen, precio_regular_pen, precio_min_pen, precio_max_pen,
    potencia_motor_w, potencia_max_w, bateria_quimica, voltaje_nominal_v,
    bateria_capacidad_ah, bateria_extraible, velocidad_max_kmh,
    autonomia_min_km, autonomia_max_km, source_url, source_checked_on, notas, estado
) VALUES (
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'GREENLINE' LIMIT 1),
    'TM6X',
    'greenline-tm6x',
    'MOTO_ELECTRICA',
    'SOLO_COMPATIBILIDAD',
    'SOLO_REFERENCIA_DE_REPUESTO',
    NULL, NULL, NULL, NULL,
    NULL, NULL, 'PLOMO_ACIDO', 60,
    NULL, 'NO_DECLARADO', NULL,
    NULL, NULL, 'https://glperu.com/tienda/cargador-60v-3a-modelo-tm8x-tm6x-h2/', '2026-10-30', 'Citado en la ficha de cargador GreenLine 60V3A; no se importan especificaciones de vehículo sin ficha.', true
)
ON CONFLICT (id_marca, nombre) DO UPDATE SET
    slug = EXCLUDED.slug,
    vehicle_type = EXCLUDED.vehicle_type,
    listing_status = EXCLUDED.listing_status,
    data_status = EXCLUDED.data_status,
    precio_referencial_pen = EXCLUDED.precio_referencial_pen,
    precio_regular_pen = EXCLUDED.precio_regular_pen,
    precio_min_pen = EXCLUDED.precio_min_pen,
    precio_max_pen = EXCLUDED.precio_max_pen,
    potencia_motor_w = EXCLUDED.potencia_motor_w,
    potencia_max_w = EXCLUDED.potencia_max_w,
    bateria_quimica = EXCLUDED.bateria_quimica,
    voltaje_nominal_v = EXCLUDED.voltaje_nominal_v,
    bateria_capacidad_ah = EXCLUDED.bateria_capacidad_ah,
    bateria_extraible = EXCLUDED.bateria_extraible,
    velocidad_max_kmh = EXCLUDED.velocidad_max_kmh,
    autonomia_min_km = EXCLUDED.autonomia_min_km,
    autonomia_max_km = EXCLUDED.autonomia_max_km,
    source_url = EXCLUDED.source_url,
    source_checked_on = EXCLUDED.source_checked_on,
    notas = EXCLUDED.notas;

INSERT INTO modelos_moto (
    id_marca, nombre, slug, vehicle_type, listing_status, data_status,
    precio_referencial_pen, precio_regular_pen, precio_min_pen, precio_max_pen,
    potencia_motor_w, potencia_max_w, bateria_quimica, voltaje_nominal_v,
    bateria_capacidad_ah, bateria_extraible, velocidad_max_kmh,
    autonomia_min_km, autonomia_max_km, source_url, source_checked_on, notas, estado
) VALUES (
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'GREENLINE' LIMIT 1),
    'H2',
    'greenline-h2',
    'MOTO_ELECTRICA',
    'SOLO_COMPATIBILIDAD',
    'SOLO_REFERENCIA_DE_REPUESTO',
    NULL, NULL, NULL, NULL,
    NULL, NULL, 'PLOMO_ACIDO', 60,
    NULL, 'NO_DECLARADO', NULL,
    NULL, NULL, 'https://glperu.com/tienda/cargador-60v-3a-modelo-tm8x-tm6x-h2/', '2026-10-30', 'Citado en la ficha de cargador GreenLine 60V3A; no se importan especificaciones de vehículo sin ficha.', true
)
ON CONFLICT (id_marca, nombre) DO UPDATE SET
    slug = EXCLUDED.slug,
    vehicle_type = EXCLUDED.vehicle_type,
    listing_status = EXCLUDED.listing_status,
    data_status = EXCLUDED.data_status,
    precio_referencial_pen = EXCLUDED.precio_referencial_pen,
    precio_regular_pen = EXCLUDED.precio_regular_pen,
    precio_min_pen = EXCLUDED.precio_min_pen,
    precio_max_pen = EXCLUDED.precio_max_pen,
    potencia_motor_w = EXCLUDED.potencia_motor_w,
    potencia_max_w = EXCLUDED.potencia_max_w,
    bateria_quimica = EXCLUDED.bateria_quimica,
    voltaje_nominal_v = EXCLUDED.voltaje_nominal_v,
    bateria_capacidad_ah = EXCLUDED.bateria_capacidad_ah,
    bateria_extraible = EXCLUDED.bateria_extraible,
    velocidad_max_kmh = EXCLUDED.velocidad_max_kmh,
    autonomia_min_km = EXCLUDED.autonomia_min_km,
    autonomia_max_km = EXCLUDED.autonomia_max_km,
    source_url = EXCLUDED.source_url,
    source_checked_on = EXCLUDED.source_checked_on,
    notas = EXCLUDED.notas;

-- 5. REPUESTOS DE PROVEEDOR (19 registros)

INSERT INTO repuestos (
    id_categoria, id_proveedor, id_marca, part_key, codigo_sku,
    nombre, descripcion, precio, precio_proveedor_pen, precio_regular_proveedor_pen,
    precio_min_pen, precio_max_pen, stock_proveedor, stock_propio_ecomoto,
    voltaje_electrico_v, capacidad_electrica_ah, quimica, voltaje_salida_v, corriente_salida_a,
    conector_o_ajuste, source_url, source_checked_on, data_status, notas, estado
) VALUES (
    (SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = 'CARGADOR'),
    (SELECT id_proveedor FROM proveedores WHERE nombre = 'TAILG Perú'),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'TAILG' LIMIT 1),
    'TAILG-CHG-60V-3A-PORT',
    'TAILG-CHG-60V-3A-PORT',
    'Cargador 60V 3A puerto TAILG',
    'La fuente también enumera GreenLine M6, M5, E3, E5. Antes de mostrar compra confirmada, validar el puerto y la variante exacta. Precio publicado sin instalación.',
    140,
    140,
    NULL,
    140,
    140,
    'CONSULTAR_STOCK',
    0,
    60,
    NULL,
    NULL,
    NULL,
    3,
    NULL,
    'https://tailg.com.pe/motos/repuestos-y-accesorios-originales/',
    '2026-10-30',
    'VERIFICADO_CON_CONDICIONES',
    'La fuente también enumera GreenLine M6, M5, E3, E5. Antes de mostrar compra confirmada, validar el puerto y la variante exacta. Precio publicado sin instalación.',
    true
)
ON CONFLICT (part_key) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    precio = EXCLUDED.precio,
    precio_proveedor_pen = EXCLUDED.precio_proveedor_pen,
    precio_regular_proveedor_pen = EXCLUDED.precio_regular_proveedor_pen,
    stock_proveedor = EXCLUDED.stock_proveedor,
    stock_propio_ecomoto = 0,
    voltaje_electrico_v = EXCLUDED.voltaje_electrico_v,
    capacidad_electrica_ah = EXCLUDED.capacidad_electrica_ah,
    quimica = EXCLUDED.quimica,
    voltaje_salida_v = EXCLUDED.voltaje_salida_v,
    corriente_salida_a = EXCLUDED.corriente_salida_a,
    conector_o_ajuste = EXCLUDED.conector_o_ajuste,
    source_url = EXCLUDED.source_url,
    source_checked_on = EXCLUDED.source_checked_on,
    data_status = EXCLUDED.data_status,
    notas = EXCLUDED.notas;

INSERT INTO repuestos (
    id_categoria, id_proveedor, id_marca, part_key, codigo_sku,
    nombre, descripcion, precio, precio_proveedor_pen, precio_regular_proveedor_pen,
    precio_min_pen, precio_max_pen, stock_proveedor, stock_propio_ecomoto,
    voltaje_electrico_v, capacidad_electrica_ah, quimica, voltaje_salida_v, corriente_salida_a,
    conector_o_ajuste, source_url, source_checked_on, data_status, notas, estado
) VALUES (
    (SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = 'BATERIA'),
    (SELECT id_proveedor FROM proveedores WHERE nombre = 'TAILG Perú'),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'TAILG' LIMIT 1),
    'TAILG-BAT-PHYLION-48V12-LMFP',
    'TAILG-BAT-PHYLION-48V12-LMFP',
    'Batería extraíble Phylion LMFP 48V12Ah',
    'La fuente declara compatibilidad con bicimotos/VMP TAILG LEDO, VMP S4, VMP S2 y VMP S2X, entre otros.',
    700,
    700,
    NULL,
    700,
    700,
    'CONSULTAR_STOCK',
    0,
    48,
    12,
    'LITIO_LMFP',
    NULL,
    NULL,
    NULL,
    'https://tailg.com.pe/motos/repuestos-y-accesorios-originales/',
    '2026-10-30',
    'VERIFICADO_EN_FUENTE',
    'La fuente declara compatibilidad con bicimotos/VMP TAILG LEDO, VMP S4, VMP S2 y VMP S2X, entre otros.',
    true
)
ON CONFLICT (part_key) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    precio = EXCLUDED.precio,
    precio_proveedor_pen = EXCLUDED.precio_proveedor_pen,
    precio_regular_proveedor_pen = EXCLUDED.precio_regular_proveedor_pen,
    stock_proveedor = EXCLUDED.stock_proveedor,
    stock_propio_ecomoto = 0,
    voltaje_electrico_v = EXCLUDED.voltaje_electrico_v,
    capacidad_electrica_ah = EXCLUDED.capacidad_electrica_ah,
    quimica = EXCLUDED.quimica,
    voltaje_salida_v = EXCLUDED.voltaje_salida_v,
    corriente_salida_a = EXCLUDED.corriente_salida_a,
    conector_o_ajuste = EXCLUDED.conector_o_ajuste,
    source_url = EXCLUDED.source_url,
    source_checked_on = EXCLUDED.source_checked_on,
    data_status = EXCLUDED.data_status,
    notas = EXCLUDED.notas;

INSERT INTO repuestos (
    id_categoria, id_proveedor, id_marca, part_key, codigo_sku,
    nombre, descripcion, precio, precio_proveedor_pen, precio_regular_proveedor_pen,
    precio_min_pen, precio_max_pen, stock_proveedor, stock_propio_ecomoto,
    voltaje_electrico_v, capacidad_electrica_ah, quimica, voltaje_salida_v, corriente_salida_a,
    conector_o_ajuste, source_url, source_checked_on, data_status, notas, estado
) VALUES (
    (SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = 'BATERIA'),
    (SELECT id_proveedor FROM proveedores WHERE nombre = 'TAILG Perú'),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'TAILG' LIMIT 1),
    'TAILG-BAT-AMPACE-48V24',
    'TAILG-BAT-AMPACE-48V24',
    'Batería extraíble Ampace Snow Leopard 48V24Ah',
    'La fuente enumera T7, V10, X51, T5, T3 y T24; incluye advertencia de verificar compatibilidad para otros modelos/marcas.',
    1500,
    1500,
    NULL,
    1500,
    1500,
    'CONSULTAR_STOCK',
    0,
    48,
    24,
    'LITIO',
    NULL,
    NULL,
    NULL,
    'https://tailg.com.pe/motos/repuestos-y-accesorios-originales/',
    '2026-10-30',
    'VERIFICAR_VARIANTE',
    'La fuente enumera T7, V10, X51, T5, T3 y T24; incluye advertencia de verificar compatibilidad para otros modelos/marcas.',
    true
)
ON CONFLICT (part_key) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    precio = EXCLUDED.precio,
    precio_proveedor_pen = EXCLUDED.precio_proveedor_pen,
    precio_regular_proveedor_pen = EXCLUDED.precio_regular_proveedor_pen,
    stock_proveedor = EXCLUDED.stock_proveedor,
    stock_propio_ecomoto = 0,
    voltaje_electrico_v = EXCLUDED.voltaje_electrico_v,
    capacidad_electrica_ah = EXCLUDED.capacidad_electrica_ah,
    quimica = EXCLUDED.quimica,
    voltaje_salida_v = EXCLUDED.voltaje_salida_v,
    corriente_salida_a = EXCLUDED.corriente_salida_a,
    conector_o_ajuste = EXCLUDED.conector_o_ajuste,
    source_url = EXCLUDED.source_url,
    source_checked_on = EXCLUDED.source_checked_on,
    data_status = EXCLUDED.data_status,
    notas = EXCLUDED.notas;

INSERT INTO repuestos (
    id_categoria, id_proveedor, id_marca, part_key, codigo_sku,
    nombre, descripcion, precio, precio_proveedor_pen, precio_regular_proveedor_pen,
    precio_min_pen, precio_max_pen, stock_proveedor, stock_propio_ecomoto,
    voltaje_electrico_v, capacidad_electrica_ah, quimica, voltaje_salida_v, corriente_salida_a,
    conector_o_ajuste, source_url, source_checked_on, data_status, notas, estado
) VALUES (
    (SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = 'BATERIA'),
    (SELECT id_proveedor FROM proveedores WHERE nombre = 'TAILG Perú'),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'TAILG' LIMIT 1),
    'TAILG-BAT-GREENWAY-64V30',
    'TAILG-BAT-GREENWAY-64V30',
    'Batería GreenWay LiFePO4 64V30Ah',
    'La fuente indica que está equipada en TAILG F55L. No asumir compatibilidad en cualquier batería de tensión nominal similar.',
    2300,
    2300,
    NULL,
    2300,
    2300,
    'CONSULTAR_STOCK',
    0,
    64,
    30,
    'LIFEPO4',
    NULL,
    45,
    NULL,
    'https://tailg.com.pe/motos/repuestos-y-accesorios-originales/',
    '2026-10-30',
    'VERIFICADO_EN_FUENTE',
    'La fuente indica que está equipada en TAILG F55L. No asumir compatibilidad en cualquier batería de tensión nominal similar.',
    true
)
ON CONFLICT (part_key) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    precio = EXCLUDED.precio,
    precio_proveedor_pen = EXCLUDED.precio_proveedor_pen,
    precio_regular_proveedor_pen = EXCLUDED.precio_regular_proveedor_pen,
    stock_proveedor = EXCLUDED.stock_proveedor,
    stock_propio_ecomoto = 0,
    voltaje_electrico_v = EXCLUDED.voltaje_electrico_v,
    capacidad_electrica_ah = EXCLUDED.capacidad_electrica_ah,
    quimica = EXCLUDED.quimica,
    voltaje_salida_v = EXCLUDED.voltaje_salida_v,
    corriente_salida_a = EXCLUDED.corriente_salida_a,
    conector_o_ajuste = EXCLUDED.conector_o_ajuste,
    source_url = EXCLUDED.source_url,
    source_checked_on = EXCLUDED.source_checked_on,
    data_status = EXCLUDED.data_status,
    notas = EXCLUDED.notas;

INSERT INTO repuestos (
    id_categoria, id_proveedor, id_marca, part_key, codigo_sku,
    nombre, descripcion, precio, precio_proveedor_pen, precio_regular_proveedor_pen,
    precio_min_pen, precio_max_pen, stock_proveedor, stock_propio_ecomoto,
    voltaje_electrico_v, capacidad_electrica_ah, quimica, voltaje_salida_v, corriente_salida_a,
    conector_o_ajuste, source_url, source_checked_on, data_status, notas, estado
) VALUES (
    (SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = 'CARGADOR'),
    (SELECT id_proveedor FROM proveedores WHERE nombre = 'TAILG Perú'),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'TAILG' LIMIT 1),
    'TAILG-CHG-48V3A-54V6',
    'TAILG-CHG-48V3A-54V6',
    'Cargador de litio 48V 3A salida 54.6V',
    'Compatible según la fuente con bicimotos TAILG T7, V10 y X51.',
    120,
    120,
    NULL,
    120,
    120,
    'CONSULTAR_STOCK',
    0,
    48,
    NULL,
    'LITIO',
    54.6,
    3,
    NULL,
    'https://tailg.com.pe/motos/repuestos-y-accesorios-originales/',
    '2026-10-30',
    'VERIFICADO_EN_FUENTE',
    'Compatible según la fuente con bicimotos TAILG T7, V10 y X51.',
    true
)
ON CONFLICT (part_key) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    precio = EXCLUDED.precio,
    precio_proveedor_pen = EXCLUDED.precio_proveedor_pen,
    precio_regular_proveedor_pen = EXCLUDED.precio_regular_proveedor_pen,
    stock_proveedor = EXCLUDED.stock_proveedor,
    stock_propio_ecomoto = 0,
    voltaje_electrico_v = EXCLUDED.voltaje_electrico_v,
    capacidad_electrica_ah = EXCLUDED.capacidad_electrica_ah,
    quimica = EXCLUDED.quimica,
    voltaje_salida_v = EXCLUDED.voltaje_salida_v,
    corriente_salida_a = EXCLUDED.corriente_salida_a,
    conector_o_ajuste = EXCLUDED.conector_o_ajuste,
    source_url = EXCLUDED.source_url,
    source_checked_on = EXCLUDED.source_checked_on,
    data_status = EXCLUDED.data_status,
    notas = EXCLUDED.notas;

INSERT INTO repuestos (
    id_categoria, id_proveedor, id_marca, part_key, codigo_sku,
    nombre, descripcion, precio, precio_proveedor_pen, precio_regular_proveedor_pen,
    precio_min_pen, precio_max_pen, stock_proveedor, stock_propio_ecomoto,
    voltaje_electrico_v, capacidad_electrica_ah, quimica, voltaje_salida_v, corriente_salida_a,
    conector_o_ajuste, source_url, source_checked_on, data_status, notas, estado
) VALUES (
    (SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = 'CARGADOR'),
    (SELECT id_proveedor FROM proveedores WHERE nombre = 'TAILG Perú'),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'TAILG' LIMIT 1),
    'TAILG-CHG-LEDO-48V3A-59V',
    'TAILG-CHG-LEDO-48V3A-59V',
    'Cargador de litio 48V 3A salida 59V para LEDO',
    'No reemplazar por un cargador 48V genérico: salida y adaptador difieren.',
    120,
    120,
    NULL,
    120,
    120,
    'CONSULTAR_STOCK',
    0,
    48,
    NULL,
    'LITIO',
    59,
    3,
    NULL,
    'https://tailg.com.pe/motos/repuestos-y-accesorios-originales/',
    '2026-10-30',
    'VERIFICADO_EN_FUENTE',
    'No reemplazar por un cargador 48V genérico: salida y adaptador difieren.',
    true
)
ON CONFLICT (part_key) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    precio = EXCLUDED.precio,
    precio_proveedor_pen = EXCLUDED.precio_proveedor_pen,
    precio_regular_proveedor_pen = EXCLUDED.precio_regular_proveedor_pen,
    stock_proveedor = EXCLUDED.stock_proveedor,
    stock_propio_ecomoto = 0,
    voltaje_electrico_v = EXCLUDED.voltaje_electrico_v,
    capacidad_electrica_ah = EXCLUDED.capacidad_electrica_ah,
    quimica = EXCLUDED.quimica,
    voltaje_salida_v = EXCLUDED.voltaje_salida_v,
    corriente_salida_a = EXCLUDED.corriente_salida_a,
    conector_o_ajuste = EXCLUDED.conector_o_ajuste,
    source_url = EXCLUDED.source_url,
    source_checked_on = EXCLUDED.source_checked_on,
    data_status = EXCLUDED.data_status,
    notas = EXCLUDED.notas;

INSERT INTO repuestos (
    id_categoria, id_proveedor, id_marca, part_key, codigo_sku,
    nombre, descripcion, precio, precio_proveedor_pen, precio_regular_proveedor_pen,
    precio_min_pen, precio_max_pen, stock_proveedor, stock_propio_ecomoto,
    voltaje_electrico_v, capacidad_electrica_ah, quimica, voltaje_salida_v, corriente_salida_a,
    conector_o_ajuste, source_url, source_checked_on, data_status, notas, estado
) VALUES (
    (SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = 'CARGADOR'),
    (SELECT id_proveedor FROM proveedores WHERE nombre = 'TAILG Perú'),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'TAILG' LIMIT 1),
    'TAILG-CHG-F55L-60V5A-73V',
    'TAILG-CHG-F55L-60V5A-73V',
    'Cargador LiFePO4 60V 5A salida 73V',
    'La fuente declara 365 W y uso diseñado para la batería de TAILG F55L.',
    150,
    150,
    NULL,
    150,
    150,
    'CONSULTAR_STOCK',
    0,
    64,
    30,
    'LIFEPO4',
    73,
    5,
    NULL,
    'https://tailg.com.pe/motos/repuestos-y-accesorios-originales/',
    '2026-10-30',
    'VERIFICADO_EN_FUENTE',
    'La fuente declara 365 W y uso diseñado para la batería de TAILG F55L.',
    true
)
ON CONFLICT (part_key) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    precio = EXCLUDED.precio,
    precio_proveedor_pen = EXCLUDED.precio_proveedor_pen,
    precio_regular_proveedor_pen = EXCLUDED.precio_regular_proveedor_pen,
    stock_proveedor = EXCLUDED.stock_proveedor,
    stock_propio_ecomoto = 0,
    voltaje_electrico_v = EXCLUDED.voltaje_electrico_v,
    capacidad_electrica_ah = EXCLUDED.capacidad_electrica_ah,
    quimica = EXCLUDED.quimica,
    voltaje_salida_v = EXCLUDED.voltaje_salida_v,
    corriente_salida_a = EXCLUDED.corriente_salida_a,
    conector_o_ajuste = EXCLUDED.conector_o_ajuste,
    source_url = EXCLUDED.source_url,
    source_checked_on = EXCLUDED.source_checked_on,
    data_status = EXCLUDED.data_status,
    notas = EXCLUDED.notas;

INSERT INTO repuestos (
    id_categoria, id_proveedor, id_marca, part_key, codigo_sku,
    nombre, descripcion, precio, precio_proveedor_pen, precio_regular_proveedor_pen,
    precio_min_pen, precio_max_pen, stock_proveedor, stock_propio_ecomoto,
    voltaje_electrico_v, capacidad_electrica_ah, quimica, voltaje_salida_v, corriente_salida_a,
    conector_o_ajuste, source_url, source_checked_on, data_status, notas, estado
) VALUES (
    (SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = 'ACCESORIO'),
    (SELECT id_proveedor FROM proveedores WHERE nombre = 'TAILG Perú'),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'TAILG' LIMIT 1),
    'TAILG-BOX-45L',
    'TAILG-BOX-45L',
    'Cajuela trasera cuadrada 45L',
    'La fuente dice que precios no incluyen instalación.',
    180,
    180,
    250,
    180,
    180,
    'CONSULTAR_STOCK',
    0,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    'https://tailg.com.pe/motos/repuestos-y-accesorios-originales/',
    '2026-10-30',
    'VERIFICADO_EN_FUENTE',
    'La fuente dice que precios no incluyen instalación.',
    true
)
ON CONFLICT (part_key) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    precio = EXCLUDED.precio,
    precio_proveedor_pen = EXCLUDED.precio_proveedor_pen,
    precio_regular_proveedor_pen = EXCLUDED.precio_regular_proveedor_pen,
    stock_proveedor = EXCLUDED.stock_proveedor,
    stock_propio_ecomoto = 0,
    voltaje_electrico_v = EXCLUDED.voltaje_electrico_v,
    capacidad_electrica_ah = EXCLUDED.capacidad_electrica_ah,
    quimica = EXCLUDED.quimica,
    voltaje_salida_v = EXCLUDED.voltaje_salida_v,
    corriente_salida_a = EXCLUDED.corriente_salida_a,
    conector_o_ajuste = EXCLUDED.conector_o_ajuste,
    source_url = EXCLUDED.source_url,
    source_checked_on = EXCLUDED.source_checked_on,
    data_status = EXCLUDED.data_status,
    notas = EXCLUDED.notas;

INSERT INTO repuestos (
    id_categoria, id_proveedor, id_marca, part_key, codigo_sku,
    nombre, descripcion, precio, precio_proveedor_pen, precio_regular_proveedor_pen,
    precio_min_pen, precio_max_pen, stock_proveedor, stock_propio_ecomoto,
    voltaje_electrico_v, capacidad_electrica_ah, quimica, voltaje_salida_v, corriente_salida_a,
    conector_o_ajuste, source_url, source_checked_on, data_status, notas, estado
) VALUES (
    (SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = 'ESPEJO'),
    (SELECT id_proveedor FROM proveedores WHERE nombre = 'TAILG Perú'),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'TAILG' LIMIT 1),
    'TAILG-MIRROR-WY261-8MM',
    'WY-261',
    'Espejo deportivo original WY-261 rosca 8mm',
    'El proveedor muestra rango de precio S/30–60 según variante. Verificar sentido de rosca y lado antes de venta.',
    0,
    0,
    NULL,
    30,
    60,
    'CONSULTAR_STOCK',
    0,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    'https://tailg.com.pe/producto/repuestos-y-accesorios-originales/espejos-retrovisores/espejo-tailg-8mm/',
    '2026-10-30',
    'VERIFICADO_EN_FUENTE',
    'El proveedor muestra rango de precio S/30–60 según variante. Verificar sentido de rosca y lado antes de venta.',
    true
)
ON CONFLICT (part_key) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    precio = EXCLUDED.precio,
    precio_proveedor_pen = EXCLUDED.precio_proveedor_pen,
    precio_regular_proveedor_pen = EXCLUDED.precio_regular_proveedor_pen,
    stock_proveedor = EXCLUDED.stock_proveedor,
    stock_propio_ecomoto = 0,
    voltaje_electrico_v = EXCLUDED.voltaje_electrico_v,
    capacidad_electrica_ah = EXCLUDED.capacidad_electrica_ah,
    quimica = EXCLUDED.quimica,
    voltaje_salida_v = EXCLUDED.voltaje_salida_v,
    corriente_salida_a = EXCLUDED.corriente_salida_a,
    conector_o_ajuste = EXCLUDED.conector_o_ajuste,
    source_url = EXCLUDED.source_url,
    source_checked_on = EXCLUDED.source_checked_on,
    data_status = EXCLUDED.data_status,
    notas = EXCLUDED.notas;

INSERT INTO repuestos (
    id_categoria, id_proveedor, id_marca, part_key, codigo_sku,
    nombre, descripcion, precio, precio_proveedor_pen, precio_regular_proveedor_pen,
    precio_min_pen, precio_max_pen, stock_proveedor, stock_propio_ecomoto,
    voltaje_electrico_v, capacidad_electrica_ah, quimica, voltaje_salida_v, corriente_salida_a,
    conector_o_ajuste, source_url, source_checked_on, data_status, notas, estado
) VALUES (
    (SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = 'ESPEJO'),
    (SELECT id_proveedor FROM proveedores WHERE nombre = 'TAILG Perú'),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'TAILG' LIMIT 1),
    'TAILG-MIRROR-HJ182-8MM',
    'HJ-182',
    'Par de espejos deportivos HJ-182 8mm',
    'Rango de precio publicado S/35–70 según variante.',
    0,
    0,
    NULL,
    35,
    70,
    'CONSULTAR_STOCK',
    0,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    'https://tailg.com.pe/motos/repuestos-y-accesorios-originales/espejos-retrovisores/',
    '2026-10-30',
    'VERIFICADO_EN_FUENTE',
    'Rango de precio publicado S/35–70 según variante.',
    true
)
ON CONFLICT (part_key) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    precio = EXCLUDED.precio,
    precio_proveedor_pen = EXCLUDED.precio_proveedor_pen,
    precio_regular_proveedor_pen = EXCLUDED.precio_regular_proveedor_pen,
    stock_proveedor = EXCLUDED.stock_proveedor,
    stock_propio_ecomoto = 0,
    voltaje_electrico_v = EXCLUDED.voltaje_electrico_v,
    capacidad_electrica_ah = EXCLUDED.capacidad_electrica_ah,
    quimica = EXCLUDED.quimica,
    voltaje_salida_v = EXCLUDED.voltaje_salida_v,
    corriente_salida_a = EXCLUDED.corriente_salida_a,
    conector_o_ajuste = EXCLUDED.conector_o_ajuste,
    source_url = EXCLUDED.source_url,
    source_checked_on = EXCLUDED.source_checked_on,
    data_status = EXCLUDED.data_status,
    notas = EXCLUDED.notas;

INSERT INTO repuestos (
    id_categoria, id_proveedor, id_marca, part_key, codigo_sku,
    nombre, descripcion, precio, precio_proveedor_pen, precio_regular_proveedor_pen,
    precio_min_pen, precio_max_pen, stock_proveedor, stock_propio_ecomoto,
    voltaje_electrico_v, capacidad_electrica_ah, quimica, voltaje_salida_v, corriente_salida_a,
    conector_o_ajuste, source_url, source_checked_on, data_status, notas, estado
) VALUES (
    (SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = 'ESPEJO'),
    (SELECT id_proveedor FROM proveedores WHERE nombre = 'TAILG Perú'),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'TAILG' LIMIT 1),
    'TAILG-MIRROR-XC603',
    'XC-603',
    'Espejo deportivo TAILG XC-603',
    'Rango de precio publicado S/40–80 según variante.',
    0,
    0,
    NULL,
    40,
    80,
    'CONSULTAR_STOCK',
    0,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    'https://tailg.com.pe/motos/repuestos-y-accesorios-originales/espejos-retrovisores/',
    '2026-10-30',
    'VERIFICADO_EN_FUENTE',
    'Rango de precio publicado S/40–80 según variante.',
    true
)
ON CONFLICT (part_key) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    precio = EXCLUDED.precio,
    precio_proveedor_pen = EXCLUDED.precio_proveedor_pen,
    precio_regular_proveedor_pen = EXCLUDED.precio_regular_proveedor_pen,
    stock_proveedor = EXCLUDED.stock_proveedor,
    stock_propio_ecomoto = 0,
    voltaje_electrico_v = EXCLUDED.voltaje_electrico_v,
    capacidad_electrica_ah = EXCLUDED.capacidad_electrica_ah,
    quimica = EXCLUDED.quimica,
    voltaje_salida_v = EXCLUDED.voltaje_salida_v,
    corriente_salida_a = EXCLUDED.corriente_salida_a,
    conector_o_ajuste = EXCLUDED.conector_o_ajuste,
    source_url = EXCLUDED.source_url,
    source_checked_on = EXCLUDED.source_checked_on,
    data_status = EXCLUDED.data_status,
    notas = EXCLUDED.notas;

INSERT INTO repuestos (
    id_categoria, id_proveedor, id_marca, part_key, codigo_sku,
    nombre, descripcion, precio, precio_proveedor_pen, precio_regular_proveedor_pen,
    precio_min_pen, precio_max_pen, stock_proveedor, stock_propio_ecomoto,
    voltaje_electrico_v, capacidad_electrica_ah, quimica, voltaje_salida_v, corriente_salida_a,
    conector_o_ajuste, source_url, source_checked_on, data_status, notas, estado
) VALUES (
    (SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = 'CARGADOR'),
    (SELECT id_proveedor FROM proveedores WHERE nombre = 'GreenLine Perú'),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'GREENLINE' LIMIT 1),
    'GREENLINE-CHG-72V3A',
    'GREENLINE-CHG-72V3A',
    'Cargador GreenLine 72V 3A',
    'La página marca sin existencias; mostrar como agotado o para consultar, no permitir checkout como stock disponible.',
    150,
    150,
    175,
    150,
    150,
    'AGOTADO_EN_PAGINA',
    0,
    72,
    NULL,
    NULL,
    NULL,
    3,
    NULL,
    'https://glperu.com/tienda/cargador-72v-3a-greenline/',
    '2026-10-30',
    'VERIFICADO_EN_FUENTE',
    'La página marca sin existencias; mostrar como agotado o para consultar, no permitir checkout como stock disponible.',
    true
)
ON CONFLICT (part_key) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    precio = EXCLUDED.precio,
    precio_proveedor_pen = EXCLUDED.precio_proveedor_pen,
    precio_regular_proveedor_pen = EXCLUDED.precio_regular_proveedor_pen,
    stock_proveedor = EXCLUDED.stock_proveedor,
    stock_propio_ecomoto = 0,
    voltaje_electrico_v = EXCLUDED.voltaje_electrico_v,
    capacidad_electrica_ah = EXCLUDED.capacidad_electrica_ah,
    quimica = EXCLUDED.quimica,
    voltaje_salida_v = EXCLUDED.voltaje_salida_v,
    corriente_salida_a = EXCLUDED.corriente_salida_a,
    conector_o_ajuste = EXCLUDED.conector_o_ajuste,
    source_url = EXCLUDED.source_url,
    source_checked_on = EXCLUDED.source_checked_on,
    data_status = EXCLUDED.data_status,
    notas = EXCLUDED.notas;

INSERT INTO repuestos (
    id_categoria, id_proveedor, id_marca, part_key, codigo_sku,
    nombre, descripcion, precio, precio_proveedor_pen, precio_regular_proveedor_pen,
    precio_min_pen, precio_max_pen, stock_proveedor, stock_propio_ecomoto,
    voltaje_electrico_v, capacidad_electrica_ah, quimica, voltaje_salida_v, corriente_salida_a,
    conector_o_ajuste, source_url, source_checked_on, data_status, notas, estado
) VALUES (
    (SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = 'BATERIA'),
    (SELECT id_proveedor FROM proveedores WHERE nombre = 'GreenLine Perú'),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'GREENLINE' LIMIT 1),
    'GREENLINE-BAT-12V20AH-6DZF20',
    '6-DZF-20',
    'Batería plomo ácido 12V20Ah 6-DZF-20',
    'No hay un modelo compatible específico indicado en la ficha consultada. No asignar compatibilidad automática por voltaje solamente.',
    160,
    160,
    175,
    160,
    160,
    'CONSULTAR_STOCK',
    0,
    12,
    20,
    'PLOMO_ACIDO',
    NULL,
    NULL,
    NULL,
    'https://glperu.com/tienda/12v-20ah-bateria-de-plomo-acido/',
    '2026-10-30',
    'PARCIAL',
    'No hay un modelo compatible específico indicado en la ficha consultada. No asignar compatibilidad automática por voltaje solamente.',
    true
)
ON CONFLICT (part_key) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    precio = EXCLUDED.precio,
    precio_proveedor_pen = EXCLUDED.precio_proveedor_pen,
    precio_regular_proveedor_pen = EXCLUDED.precio_regular_proveedor_pen,
    stock_proveedor = EXCLUDED.stock_proveedor,
    stock_propio_ecomoto = 0,
    voltaje_electrico_v = EXCLUDED.voltaje_electrico_v,
    capacidad_electrica_ah = EXCLUDED.capacidad_electrica_ah,
    quimica = EXCLUDED.quimica,
    voltaje_salida_v = EXCLUDED.voltaje_salida_v,
    corriente_salida_a = EXCLUDED.corriente_salida_a,
    conector_o_ajuste = EXCLUDED.conector_o_ajuste,
    source_url = EXCLUDED.source_url,
    source_checked_on = EXCLUDED.source_checked_on,
    data_status = EXCLUDED.data_status,
    notas = EXCLUDED.notas;

INSERT INTO repuestos (
    id_categoria, id_proveedor, id_marca, part_key, codigo_sku,
    nombre, descripcion, precio, precio_proveedor_pen, precio_regular_proveedor_pen,
    precio_min_pen, precio_max_pen, stock_proveedor, stock_propio_ecomoto,
    voltaje_electrico_v, capacidad_electrica_ah, quimica, voltaje_salida_v, corriente_salida_a,
    conector_o_ajuste, source_url, source_checked_on, data_status, notas, estado
) VALUES (
    (SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = 'CARGADOR'),
    (SELECT id_proveedor FROM proveedores WHERE nombre = 'GreenLine Perú'),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'GREENLINE' LIMIT 1),
    'GREENLINE-CHG-60V3A-TM8X',
    'GREENLINE-CHG-60V3A-TM8X',
    'Cargador GreenLine 60V 3A para TM8X/TM6X/H2',
    'Página marcada sin existencias; la ficha lo describe como cargador genérico para pack de 5 celdas de plomo ácido (equivalente 60V).',
    140,
    140,
    165,
    140,
    140,
    'AGOTADO_EN_PAGINA',
    0,
    60,
    NULL,
    'PLOMO_ACIDO',
    NULL,
    3,
    NULL,
    'https://glperu.com/tienda/cargador-60v-3a-modelo-tm8x-tm6x-h2/',
    '2026-10-30',
    'VERIFICADO_EN_FUENTE',
    'Página marcada sin existencias; la ficha lo describe como cargador genérico para pack de 5 celdas de plomo ácido (equivalente 60V).',
    true
)
ON CONFLICT (part_key) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    precio = EXCLUDED.precio,
    precio_proveedor_pen = EXCLUDED.precio_proveedor_pen,
    precio_regular_proveedor_pen = EXCLUDED.precio_regular_proveedor_pen,
    stock_proveedor = EXCLUDED.stock_proveedor,
    stock_propio_ecomoto = 0,
    voltaje_electrico_v = EXCLUDED.voltaje_electrico_v,
    capacidad_electrica_ah = EXCLUDED.capacidad_electrica_ah,
    quimica = EXCLUDED.quimica,
    voltaje_salida_v = EXCLUDED.voltaje_salida_v,
    corriente_salida_a = EXCLUDED.corriente_salida_a,
    conector_o_ajuste = EXCLUDED.conector_o_ajuste,
    source_url = EXCLUDED.source_url,
    source_checked_on = EXCLUDED.source_checked_on,
    data_status = EXCLUDED.data_status,
    notas = EXCLUDED.notas;

INSERT INTO repuestos (
    id_categoria, id_proveedor, id_marca, part_key, codigo_sku,
    nombre, descripcion, precio, precio_proveedor_pen, precio_regular_proveedor_pen,
    precio_min_pen, precio_max_pen, stock_proveedor, stock_propio_ecomoto,
    voltaje_electrico_v, capacidad_electrica_ah, quimica, voltaje_salida_v, corriente_salida_a,
    conector_o_ajuste, source_url, source_checked_on, data_status, notas, estado
) VALUES (
    (SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = 'BATERIA'),
    (SELECT id_proveedor FROM proveedores WHERE nombre = 'Kayencorp Perú'),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'KAYENCORP' LIMIT 1),
    'KAYEN-BAT-LIFEPO4-72V30AH',
    '1569',
    'Batería LiFePO4 72V30Ah',
    'La ficha no identifica modelos concretos de motos compatibles. No asociar automáticamente a todos los modelos de 72V.',
    2596,
    2596,
    NULL,
    2596,
    2596,
    'CONSULTAR_STOCK',
    0,
    72,
    30,
    'LIFEPO4',
    NULL,
    NULL,
    NULL,
    'https://kayencorp.com/producto/bateria-lifepo4-72v30ah/',
    '2026-10-30',
    'PENDIENTE_DE_COMPATIBILIDAD',
    'La ficha no identifica modelos concretos de motos compatibles. No asociar automáticamente a todos los modelos de 72V.',
    true
)
ON CONFLICT (part_key) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    precio = EXCLUDED.precio,
    precio_proveedor_pen = EXCLUDED.precio_proveedor_pen,
    precio_regular_proveedor_pen = EXCLUDED.precio_regular_proveedor_pen,
    stock_proveedor = EXCLUDED.stock_proveedor,
    stock_propio_ecomoto = 0,
    voltaje_electrico_v = EXCLUDED.voltaje_electrico_v,
    capacidad_electrica_ah = EXCLUDED.capacidad_electrica_ah,
    quimica = EXCLUDED.quimica,
    voltaje_salida_v = EXCLUDED.voltaje_salida_v,
    corriente_salida_a = EXCLUDED.corriente_salida_a,
    conector_o_ajuste = EXCLUDED.conector_o_ajuste,
    source_url = EXCLUDED.source_url,
    source_checked_on = EXCLUDED.source_checked_on,
    data_status = EXCLUDED.data_status,
    notas = EXCLUDED.notas;

INSERT INTO repuestos (
    id_categoria, id_proveedor, id_marca, part_key, codigo_sku,
    nombre, descripcion, precio, precio_proveedor_pen, precio_regular_proveedor_pen,
    precio_min_pen, precio_max_pen, stock_proveedor, stock_propio_ecomoto,
    voltaje_electrico_v, capacidad_electrica_ah, quimica, voltaje_salida_v, corriente_salida_a,
    conector_o_ajuste, source_url, source_checked_on, data_status, notas, estado
) VALUES (
    (SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = 'BATERIA'),
    (SELECT id_proveedor FROM proveedores WHERE nombre = 'Kayencorp Perú'),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'KAYENCORP' LIMIT 1),
    'KAYEN-BAT-LIFEPO4-72V24AH',
    '1568',
    'Batería LiFePO4 72V24Ah',
    'La ficha no identifica modelos concretos de motos compatibles. No asociar automáticamente a todos los modelos de 72V.',
    2100,
    2100,
    NULL,
    2100,
    2100,
    'CONSULTAR_STOCK',
    0,
    72,
    24,
    'LIFEPO4',
    NULL,
    NULL,
    NULL,
    'https://kayencorp.com/producto/bateria-lifepo4-72v24ah/',
    '2026-10-30',
    'PENDIENTE_DE_COMPATIBILIDAD',
    'La ficha no identifica modelos concretos de motos compatibles. No asociar automáticamente a todos los modelos de 72V.',
    true
)
ON CONFLICT (part_key) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    precio = EXCLUDED.precio,
    precio_proveedor_pen = EXCLUDED.precio_proveedor_pen,
    precio_regular_proveedor_pen = EXCLUDED.precio_regular_proveedor_pen,
    stock_proveedor = EXCLUDED.stock_proveedor,
    stock_propio_ecomoto = 0,
    voltaje_electrico_v = EXCLUDED.voltaje_electrico_v,
    capacidad_electrica_ah = EXCLUDED.capacidad_electrica_ah,
    quimica = EXCLUDED.quimica,
    voltaje_salida_v = EXCLUDED.voltaje_salida_v,
    corriente_salida_a = EXCLUDED.corriente_salida_a,
    conector_o_ajuste = EXCLUDED.conector_o_ajuste,
    source_url = EXCLUDED.source_url,
    source_checked_on = EXCLUDED.source_checked_on,
    data_status = EXCLUDED.data_status,
    notas = EXCLUDED.notas;

INSERT INTO repuestos (
    id_categoria, id_proveedor, id_marca, part_key, codigo_sku,
    nombre, descripcion, precio, precio_proveedor_pen, precio_regular_proveedor_pen,
    precio_min_pen, precio_max_pen, stock_proveedor, stock_propio_ecomoto,
    voltaje_electrico_v, capacidad_electrica_ah, quimica, voltaje_salida_v, corriente_salida_a,
    conector_o_ajuste, source_url, source_checked_on, data_status, notas, estado
) VALUES (
    (SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = 'CARROCERIA'),
    (SELECT id_proveedor FROM proveedores WHERE nombre = 'Kayencorp Perú'),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'KAYENCORP' LIMIT 1),
    'KAYEN-FENDER-IDO',
    '199',
    'Guardafango posterior para bicimoto IDO',
    'El proveedor identifica el modelo compatible de forma explícita.',
    50,
    50,
    NULL,
    50,
    50,
    'CONSULTAR_STOCK',
    0,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    'https://kayencorp.com/producto/guardafango-posterior-bicimoto-ido/',
    '2026-10-30',
    'VERIFICADO_EN_FUENTE',
    'El proveedor identifica el modelo compatible de forma explícita.',
    true
)
ON CONFLICT (part_key) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    precio = EXCLUDED.precio,
    precio_proveedor_pen = EXCLUDED.precio_proveedor_pen,
    precio_regular_proveedor_pen = EXCLUDED.precio_regular_proveedor_pen,
    stock_proveedor = EXCLUDED.stock_proveedor,
    stock_propio_ecomoto = 0,
    voltaje_electrico_v = EXCLUDED.voltaje_electrico_v,
    capacidad_electrica_ah = EXCLUDED.capacidad_electrica_ah,
    quimica = EXCLUDED.quimica,
    voltaje_salida_v = EXCLUDED.voltaje_salida_v,
    corriente_salida_a = EXCLUDED.corriente_salida_a,
    conector_o_ajuste = EXCLUDED.conector_o_ajuste,
    source_url = EXCLUDED.source_url,
    source_checked_on = EXCLUDED.source_checked_on,
    data_status = EXCLUDED.data_status,
    notas = EXCLUDED.notas;

INSERT INTO repuestos (
    id_categoria, id_proveedor, id_marca, part_key, codigo_sku,
    nombre, descripcion, precio, precio_proveedor_pen, precio_regular_proveedor_pen,
    precio_min_pen, precio_max_pen, stock_proveedor, stock_propio_ecomoto,
    voltaje_electrico_v, capacidad_electrica_ah, quimica, voltaje_salida_v, corriente_salida_a,
    conector_o_ajuste, source_url, source_checked_on, data_status, notas, estado
) VALUES (
    (SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = 'FRENOS'),
    (SELECT id_proveedor FROM proveedores WHERE nombre = 'Kayencorp Perú'),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'KAYENCORP' LIMIT 1),
    'KAYEN-BRAKE-PADS-MNK2',
    '1020',
    'Pastillas de freno para moto MNK2',
    'Precio no visible en el resultado consultado; no inventar precio.',
    0,
    0,
    NULL,
    NULL,
    NULL,
    'CONSULTAR_PRECIO_Y_STOCK',
    0,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    'https://kayencorp.com/producto/pastillas-de-freno-moto-mnk2/',
    '2026-10-30',
    'VERIFICADO_EN_FUENTE',
    'Precio no visible en el resultado consultado; no inventar precio.',
    true
)
ON CONFLICT (part_key) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    precio = EXCLUDED.precio,
    precio_proveedor_pen = EXCLUDED.precio_proveedor_pen,
    precio_regular_proveedor_pen = EXCLUDED.precio_regular_proveedor_pen,
    stock_proveedor = EXCLUDED.stock_proveedor,
    stock_propio_ecomoto = 0,
    voltaje_electrico_v = EXCLUDED.voltaje_electrico_v,
    capacidad_electrica_ah = EXCLUDED.capacidad_electrica_ah,
    quimica = EXCLUDED.quimica,
    voltaje_salida_v = EXCLUDED.voltaje_salida_v,
    corriente_salida_a = EXCLUDED.corriente_salida_a,
    conector_o_ajuste = EXCLUDED.conector_o_ajuste,
    source_url = EXCLUDED.source_url,
    source_checked_on = EXCLUDED.source_checked_on,
    data_status = EXCLUDED.data_status,
    notas = EXCLUDED.notas;

INSERT INTO repuestos (
    id_categoria, id_proveedor, id_marca, part_key, codigo_sku,
    nombre, descripcion, precio, precio_proveedor_pen, precio_regular_proveedor_pen,
    precio_min_pen, precio_max_pen, stock_proveedor, stock_propio_ecomoto,
    voltaje_electrico_v, capacidad_electrica_ah, quimica, voltaje_salida_v, corriente_salida_a,
    conector_o_ajuste, source_url, source_checked_on, data_status, notas, estado
) VALUES (
    (SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = 'CARGADOR'),
    (SELECT id_proveedor FROM proveedores WHERE nombre = 'Kayencorp Perú'),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'KAYENCORP' LIMIT 1),
    'KAYEN-CHG-48V3A-LITHIUM-BICIMOTO',
    '183',
    'Cargador litio bicimoto 48V 3A / salida 54.6V',
    'No se atribuye compatibilidad a un modelo específico porque la ficha de producto no lo identifica.',
    0,
    0,
    NULL,
    NULL,
    NULL,
    'CONSULTAR_PRECIO_Y_STOCK',
    0,
    48,
    20,
    'LITIO',
    54.6,
    3,
    NULL,
    'https://kayencorp.com/producto/cargador-48v20ah-litio-bicimoto/',
    '2026-10-30',
    'PENDIENTE_DE_COMPATIBILIDAD',
    'No se atribuye compatibilidad a un modelo específico porque la ficha de producto no lo identifica.',
    true
)
ON CONFLICT (part_key) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    precio = EXCLUDED.precio,
    precio_proveedor_pen = EXCLUDED.precio_proveedor_pen,
    precio_regular_proveedor_pen = EXCLUDED.precio_regular_proveedor_pen,
    stock_proveedor = EXCLUDED.stock_proveedor,
    stock_propio_ecomoto = 0,
    voltaje_electrico_v = EXCLUDED.voltaje_electrico_v,
    capacidad_electrica_ah = EXCLUDED.capacidad_electrica_ah,
    quimica = EXCLUDED.quimica,
    voltaje_salida_v = EXCLUDED.voltaje_salida_v,
    corriente_salida_a = EXCLUDED.corriente_salida_a,
    conector_o_ajuste = EXCLUDED.conector_o_ajuste,
    source_url = EXCLUDED.source_url,
    source_checked_on = EXCLUDED.source_checked_on,
    data_status = EXCLUDED.data_status,
    notas = EXCLUDED.notas;

-- 6. COMPATIBILIDADES PUBLICADAS (46 registros)
-- Verificación estricta previa: garantiza que cada una de las 46 compatibilidades
-- resuelva un id_repuesto y un id_modelo válidos antes de ejecutar los INSERT.
-- Si alguna referencia no existe, aborta con un error descriptivo identificando
-- el repuesto (part_key), la marca y el modelo exacto.
DO $$
DECLARE
    r RECORD;
    v_id_repuesto BIGINT;
    v_id_modelo BIGINT;
BEGIN
    FOR r IN
        SELECT * FROM (VALUES
            ('TAILG-CHG-48V3A-54V6', 'TAILG', 'T7 Litio Extraíble'),
            ('TAILG-CHG-48V3A-54V6', 'TAILG', 'V10 Litio Extraíble'),
            ('TAILG-CHG-48V3A-54V6', 'TAILG', 'X51 Litio Extraíble'),
            ('TAILG-BAT-AMPACE-48V24', 'TAILG', 'T7 Litio Extraíble'),
            ('TAILG-BAT-AMPACE-48V24', 'TAILG', 'V10 Litio Extraíble'),
            ('TAILG-BAT-AMPACE-48V24', 'TAILG', 'X51 Litio Extraíble'),
            ('TAILG-BAT-AMPACE-48V24', 'TAILG', 'T5'),
            ('TAILG-BAT-AMPACE-48V24', 'TAILG', 'T3'),
            ('TAILG-BAT-AMPACE-48V24', 'TAILG', 'T24'),
            ('TAILG-BAT-PHYLION-48V12-LMFP', 'TAILG', 'LEDO Litio Extraíble LMFP'),
            ('TAILG-BAT-PHYLION-48V12-LMFP', 'TAILG', 'VMP S4'),
            ('TAILG-BAT-PHYLION-48V12-LMFP', 'TAILG', 'VMP S2'),
            ('TAILG-BAT-PHYLION-48V12-LMFP', 'TAILG', 'VMP S2X'),
            ('TAILG-CHG-LEDO-48V3A-59V', 'TAILG', 'LEDO Litio Extraíble LMFP'),
            ('TAILG-CHG-F55L-60V5A-73V', 'TAILG', 'F55L Litio Extraíble'),
            ('TAILG-BAT-GREENWAY-64V30', 'TAILG', 'F55L Litio Extraíble'),
            ('TAILG-BOX-45L', 'TAILG', 'F55 Mecha G2'),
            ('TAILG-BOX-45L', 'TAILG', 'F52 Mecha G1'),
            ('TAILG-BOX-45L', 'TAILG', 'F52 NEO'),
            ('TAILG-BOX-45L', 'TAILG', 'X9 Super S'),
            ('TAILG-MIRROR-WY261-8MM', 'TAILG', 'X9 Super S'),
            ('TAILG-MIRROR-WY261-8MM', 'TAILG', 'A1 Plus'),
            ('TAILG-MIRROR-WY261-8MM', 'TAILG', 'V10 Litio Extraíble'),
            ('TAILG-MIRROR-WY261-8MM', 'TAILG', 'T7 Litio Extraíble'),
            ('TAILG-MIRROR-WY261-8MM', 'TAILG', 'Lion Max 2026'),
            ('TAILG-MIRROR-WY261-8MM', 'TAILG', 'Polaris Super S'),
            ('TAILG-MIRROR-WY261-8MM', 'TAILG', 'Master'),
            ('TAILG-MIRROR-HJ182-8MM', 'TAILG', 'X9 Super S'),
            ('TAILG-MIRROR-HJ182-8MM', 'TAILG', 'Leopard Pro Super S'),
            ('TAILG-MIRROR-HJ182-8MM', 'TAILG', 'A1 Plus'),
            ('TAILG-MIRROR-XC603', 'TAILG', 'F55 Mecha G2'),
            ('TAILG-MIRROR-XC603', 'TAILG', 'F55L Litio Extraíble'),
            ('TAILG-MIRROR-XC603', 'TAILG', 'Polaris Super S'),
            ('TAILG-MIRROR-XC603', 'TAILG', 'Optimus Mecha G3'),
            ('TAILG-MIRROR-XC603', 'TAILG', 'Master'),
            ('TAILG-CHG-60V-3A-PORT', 'GREENLINE', 'M6'),
            ('TAILG-CHG-60V-3A-PORT', 'GREENLINE', 'M5'),
            ('TAILG-CHG-60V-3A-PORT', 'GREENLINE', 'E3'),
            ('TAILG-CHG-60V-3A-PORT', 'GREENLINE', 'E5'),
            ('GREENLINE-CHG-72V3A', 'GREENLINE', 'F6'),
            ('GREENLINE-CHG-72V3A', 'GREENLINE', 'J4'),
            ('GREENLINE-CHG-60V3A-TM8X', 'GREENLINE', 'TM8X'),
            ('GREENLINE-CHG-60V3A-TM8X', 'GREENLINE', 'TM6X'),
            ('GREENLINE-CHG-60V3A-TM8X', 'GREENLINE', 'H2'),
            ('KAYEN-FENDER-IDO', 'KAYENCORP', 'Bicimoto IDO'),
            ('KAYEN-BRAKE-PADS-MNK2', 'KAYENCORP', 'Moto MNK2')
        ) AS t(part_key, marca, modelo)
    LOOP
        SELECT id_repuesto INTO v_id_repuesto
        FROM repuestos
        WHERE TRIM(part_key) = TRIM(r.part_key)
        LIMIT 1;

        IF v_id_repuesto IS NULL THEN
            RAISE EXCEPTION '[SEED ECOMOTO] Referencia de repuesto faltante: part_key="%" (requerido para marca="%", modelo="%")',
                r.part_key, r.marca, r.modelo;
        END IF;

        SELECT m.id_modelo INTO v_id_modelo
        FROM modelos_moto m
        JOIN marcas ma ON m.id_marca = ma.id_marca
        WHERE UPPER(TRIM(ma.nombre)) = UPPER(TRIM(r.marca))
          AND TRIM(m.nombre) = TRIM(r.modelo)
        LIMIT 1;

        IF v_id_modelo IS NULL THEN
            RAISE EXCEPTION '[SEED ECOMOTO] Referencia de modelo faltante: marca="%", modelo="%" (requerido para repuesto part_key="%")',
                r.marca, r.modelo, r.part_key;
        END IF;
    END LOOP;
END $$;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, status, nivel_verificacion,
    source_url, evidence_note, verified_at, verified_by, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'TAILG-CHG-48V3A-54V6'),
    (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'TAILG' AND TRIM(m.nombre) = 'T7 Litio Extraíble'),
    'CONFIRMADA_EN_FUENTE',
    'CONFIRMADA',
    'https://tailg.com.pe/motos/repuestos-y-accesorios-originales/',
    'La fuente oficial nombra el modelo explícitamente como compatible con salida 54.6V; revisar conector y lote antes de instalar.',
    '2026-10-30T00:00:00Z'::TIMESTAMPTZ,
    'Investigación EcoMoto',
    'La fuente oficial nombra el modelo explícitamente como compatible con salida 54.6V; revisar conector y lote antes de instalar.'
)
ON CONFLICT (id_repuesto, id_modelo) DO UPDATE SET
    status = EXCLUDED.status,
    nivel_verificacion = EXCLUDED.nivel_verificacion,
    source_url = EXCLUDED.source_url,
    evidence_note = EXCLUDED.evidence_note,
    verified_at = EXCLUDED.verified_at,
    verified_by = EXCLUDED.verified_by,
    observaciones = EXCLUDED.observaciones;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, status, nivel_verificacion,
    source_url, evidence_note, verified_at, verified_by, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'TAILG-CHG-48V3A-54V6'),
    (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'TAILG' AND TRIM(m.nombre) = 'V10 Litio Extraíble'),
    'CONFIRMADA_EN_FUENTE',
    'CONFIRMADA',
    'https://tailg.com.pe/motos/repuestos-y-accesorios-originales/',
    'La fuente oficial nombra el modelo explícitamente como compatible con salida 54.6V; revisar conector y lote antes de instalar.',
    '2026-10-30T00:00:00Z'::TIMESTAMPTZ,
    'Investigación EcoMoto',
    'La fuente oficial nombra el modelo explícitamente como compatible con salida 54.6V; revisar conector y lote antes de instalar.'
)
ON CONFLICT (id_repuesto, id_modelo) DO UPDATE SET
    status = EXCLUDED.status,
    nivel_verificacion = EXCLUDED.nivel_verificacion,
    source_url = EXCLUDED.source_url,
    evidence_note = EXCLUDED.evidence_note,
    verified_at = EXCLUDED.verified_at,
    verified_by = EXCLUDED.verified_by,
    observaciones = EXCLUDED.observaciones;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, status, nivel_verificacion,
    source_url, evidence_note, verified_at, verified_by, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'TAILG-CHG-48V3A-54V6'),
    (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'TAILG' AND TRIM(m.nombre) = 'X51 Litio Extraíble'),
    'CONFIRMADA_EN_FUENTE',
    'CONFIRMADA',
    'https://tailg.com.pe/motos/repuestos-y-accesorios-originales/',
    'La fuente oficial nombra el modelo explícitamente como compatible con salida 54.6V; revisar conector y lote antes de instalar.',
    '2026-10-30T00:00:00Z'::TIMESTAMPTZ,
    'Investigación EcoMoto',
    'La fuente oficial nombra el modelo explícitamente como compatible con salida 54.6V; revisar conector y lote antes de instalar.'
)
ON CONFLICT (id_repuesto, id_modelo) DO UPDATE SET
    status = EXCLUDED.status,
    nivel_verificacion = EXCLUDED.nivel_verificacion,
    source_url = EXCLUDED.source_url,
    evidence_note = EXCLUDED.evidence_note,
    verified_at = EXCLUDED.verified_at,
    verified_by = EXCLUDED.verified_by,
    observaciones = EXCLUDED.observaciones;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, status, nivel_verificacion,
    source_url, evidence_note, verified_at, verified_by, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'TAILG-BAT-AMPACE-48V24'),
    (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'TAILG' AND TRIM(m.nombre) = 'T7 Litio Extraíble'),
    'CONFIRMADA_EN_FUENTE',
    'CONFIRMADA',
    'https://tailg.com.pe/motos/repuestos-y-accesorios-originales/',
    'Modelo nombrado en la ficha de batería Ampace 48V24Ah; validar conector/comunicación para el lote concreto.',
    '2026-10-30T00:00:00Z'::TIMESTAMPTZ,
    'Investigación EcoMoto',
    'Modelo nombrado en la ficha de batería Ampace 48V24Ah; validar conector/comunicación para el lote concreto.'
)
ON CONFLICT (id_repuesto, id_modelo) DO UPDATE SET
    status = EXCLUDED.status,
    nivel_verificacion = EXCLUDED.nivel_verificacion,
    source_url = EXCLUDED.source_url,
    evidence_note = EXCLUDED.evidence_note,
    verified_at = EXCLUDED.verified_at,
    verified_by = EXCLUDED.verified_by,
    observaciones = EXCLUDED.observaciones;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, status, nivel_verificacion,
    source_url, evidence_note, verified_at, verified_by, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'TAILG-BAT-AMPACE-48V24'),
    (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'TAILG' AND TRIM(m.nombre) = 'V10 Litio Extraíble'),
    'CONFIRMADA_EN_FUENTE',
    'CONFIRMADA',
    'https://tailg.com.pe/motos/repuestos-y-accesorios-originales/',
    'Modelo nombrado en la ficha de batería Ampace 48V24Ah; validar conector/comunicación para el lote concreto.',
    '2026-10-30T00:00:00Z'::TIMESTAMPTZ,
    'Investigación EcoMoto',
    'Modelo nombrado en la ficha de batería Ampace 48V24Ah; validar conector/comunicación para el lote concreto.'
)
ON CONFLICT (id_repuesto, id_modelo) DO UPDATE SET
    status = EXCLUDED.status,
    nivel_verificacion = EXCLUDED.nivel_verificacion,
    source_url = EXCLUDED.source_url,
    evidence_note = EXCLUDED.evidence_note,
    verified_at = EXCLUDED.verified_at,
    verified_by = EXCLUDED.verified_by,
    observaciones = EXCLUDED.observaciones;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, status, nivel_verificacion,
    source_url, evidence_note, verified_at, verified_by, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'TAILG-BAT-AMPACE-48V24'),
    (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'TAILG' AND TRIM(m.nombre) = 'X51 Litio Extraíble'),
    'CONFIRMADA_EN_FUENTE',
    'CONFIRMADA',
    'https://tailg.com.pe/motos/repuestos-y-accesorios-originales/',
    'Modelo nombrado en la ficha de batería Ampace 48V24Ah; validar conector/comunicación para el lote concreto.',
    '2026-10-30T00:00:00Z'::TIMESTAMPTZ,
    'Investigación EcoMoto',
    'Modelo nombrado en la ficha de batería Ampace 48V24Ah; validar conector/comunicación para el lote concreto.'
)
ON CONFLICT (id_repuesto, id_modelo) DO UPDATE SET
    status = EXCLUDED.status,
    nivel_verificacion = EXCLUDED.nivel_verificacion,
    source_url = EXCLUDED.source_url,
    evidence_note = EXCLUDED.evidence_note,
    verified_at = EXCLUDED.verified_at,
    verified_by = EXCLUDED.verified_by,
    observaciones = EXCLUDED.observaciones;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, status, nivel_verificacion,
    source_url, evidence_note, verified_at, verified_by, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'TAILG-BAT-AMPACE-48V24'),
    (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'TAILG' AND TRIM(m.nombre) = 'T5'),
    'CONFIRMADA_EN_FUENTE',
    'CONFIRMADA',
    'https://tailg.com.pe/motos/repuestos-y-accesorios-originales/',
    'Modelo nombrado en la ficha de batería Ampace 48V24Ah; validar conector/comunicación para el lote concreto.',
    '2026-10-30T00:00:00Z'::TIMESTAMPTZ,
    'Investigación EcoMoto',
    'Modelo nombrado en la ficha de batería Ampace 48V24Ah; validar conector/comunicación para el lote concreto.'
)
ON CONFLICT (id_repuesto, id_modelo) DO UPDATE SET
    status = EXCLUDED.status,
    nivel_verificacion = EXCLUDED.nivel_verificacion,
    source_url = EXCLUDED.source_url,
    evidence_note = EXCLUDED.evidence_note,
    verified_at = EXCLUDED.verified_at,
    verified_by = EXCLUDED.verified_by,
    observaciones = EXCLUDED.observaciones;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, status, nivel_verificacion,
    source_url, evidence_note, verified_at, verified_by, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'TAILG-BAT-AMPACE-48V24'),
    (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'TAILG' AND TRIM(m.nombre) = 'T3'),
    'CONFIRMADA_EN_FUENTE',
    'CONFIRMADA',
    'https://tailg.com.pe/motos/repuestos-y-accesorios-originales/',
    'Modelo nombrado en la ficha de batería Ampace 48V24Ah; validar conector/comunicación para el lote concreto.',
    '2026-10-30T00:00:00Z'::TIMESTAMPTZ,
    'Investigación EcoMoto',
    'Modelo nombrado en la ficha de batería Ampace 48V24Ah; validar conector/comunicación para el lote concreto.'
)
ON CONFLICT (id_repuesto, id_modelo) DO UPDATE SET
    status = EXCLUDED.status,
    nivel_verificacion = EXCLUDED.nivel_verificacion,
    source_url = EXCLUDED.source_url,
    evidence_note = EXCLUDED.evidence_note,
    verified_at = EXCLUDED.verified_at,
    verified_by = EXCLUDED.verified_by,
    observaciones = EXCLUDED.observaciones;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, status, nivel_verificacion,
    source_url, evidence_note, verified_at, verified_by, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'TAILG-BAT-AMPACE-48V24'),
    (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'TAILG' AND TRIM(m.nombre) = 'T24'),
    'CONFIRMADA_EN_FUENTE',
    'CONFIRMADA',
    'https://tailg.com.pe/motos/repuestos-y-accesorios-originales/',
    'Modelo nombrado en la ficha de batería Ampace 48V24Ah; validar conector/comunicación para el lote concreto.',
    '2026-10-30T00:00:00Z'::TIMESTAMPTZ,
    'Investigación EcoMoto',
    'Modelo nombrado en la ficha de batería Ampace 48V24Ah; validar conector/comunicación para el lote concreto.'
)
ON CONFLICT (id_repuesto, id_modelo) DO UPDATE SET
    status = EXCLUDED.status,
    nivel_verificacion = EXCLUDED.nivel_verificacion,
    source_url = EXCLUDED.source_url,
    evidence_note = EXCLUDED.evidence_note,
    verified_at = EXCLUDED.verified_at,
    verified_by = EXCLUDED.verified_by,
    observaciones = EXCLUDED.observaciones;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, status, nivel_verificacion,
    source_url, evidence_note, verified_at, verified_by, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'TAILG-BAT-PHYLION-48V12-LMFP'),
    (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'TAILG' AND TRIM(m.nombre) = 'LEDO Litio Extraíble LMFP'),
    'CONFIRMADA_EN_FUENTE',
    'CONFIRMADA',
    'https://tailg.com.pe/motos/repuestos-y-accesorios-originales/',
    'La ficha de la batería Phylion LMFP 48V12Ah cita estos modelos. Verificar adaptador y versión antes de instalación.',
    '2026-10-30T00:00:00Z'::TIMESTAMPTZ,
    'Investigación EcoMoto',
    'La ficha de la batería Phylion LMFP 48V12Ah cita estos modelos. Verificar adaptador y versión antes de instalación.'
)
ON CONFLICT (id_repuesto, id_modelo) DO UPDATE SET
    status = EXCLUDED.status,
    nivel_verificacion = EXCLUDED.nivel_verificacion,
    source_url = EXCLUDED.source_url,
    evidence_note = EXCLUDED.evidence_note,
    verified_at = EXCLUDED.verified_at,
    verified_by = EXCLUDED.verified_by,
    observaciones = EXCLUDED.observaciones;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, status, nivel_verificacion,
    source_url, evidence_note, verified_at, verified_by, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'TAILG-BAT-PHYLION-48V12-LMFP'),
    (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'TAILG' AND TRIM(m.nombre) = 'VMP S4'),
    'CONFIRMADA_EN_FUENTE',
    'CONFIRMADA',
    'https://tailg.com.pe/motos/repuestos-y-accesorios-originales/',
    'La ficha de la batería Phylion LMFP 48V12Ah cita estos modelos. Verificar adaptador y versión antes de instalación.',
    '2026-10-30T00:00:00Z'::TIMESTAMPTZ,
    'Investigación EcoMoto',
    'La ficha de la batería Phylion LMFP 48V12Ah cita estos modelos. Verificar adaptador y versión antes de instalación.'
)
ON CONFLICT (id_repuesto, id_modelo) DO UPDATE SET
    status = EXCLUDED.status,
    nivel_verificacion = EXCLUDED.nivel_verificacion,
    source_url = EXCLUDED.source_url,
    evidence_note = EXCLUDED.evidence_note,
    verified_at = EXCLUDED.verified_at,
    verified_by = EXCLUDED.verified_by,
    observaciones = EXCLUDED.observaciones;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, status, nivel_verificacion,
    source_url, evidence_note, verified_at, verified_by, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'TAILG-BAT-PHYLION-48V12-LMFP'),
    (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'TAILG' AND TRIM(m.nombre) = 'VMP S2'),
    'CONFIRMADA_EN_FUENTE',
    'CONFIRMADA',
    'https://tailg.com.pe/motos/repuestos-y-accesorios-originales/',
    'La ficha de la batería Phylion LMFP 48V12Ah cita estos modelos. Verificar adaptador y versión antes de instalación.',
    '2026-10-30T00:00:00Z'::TIMESTAMPTZ,
    'Investigación EcoMoto',
    'La ficha de la batería Phylion LMFP 48V12Ah cita estos modelos. Verificar adaptador y versión antes de instalación.'
)
ON CONFLICT (id_repuesto, id_modelo) DO UPDATE SET
    status = EXCLUDED.status,
    nivel_verificacion = EXCLUDED.nivel_verificacion,
    source_url = EXCLUDED.source_url,
    evidence_note = EXCLUDED.evidence_note,
    verified_at = EXCLUDED.verified_at,
    verified_by = EXCLUDED.verified_by,
    observaciones = EXCLUDED.observaciones;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, status, nivel_verificacion,
    source_url, evidence_note, verified_at, verified_by, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'TAILG-BAT-PHYLION-48V12-LMFP'),
    (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'TAILG' AND TRIM(m.nombre) = 'VMP S2X'),
    'CONFIRMADA_EN_FUENTE',
    'CONFIRMADA',
    'https://tailg.com.pe/motos/repuestos-y-accesorios-originales/',
    'La ficha de la batería Phylion LMFP 48V12Ah cita estos modelos. Verificar adaptador y versión antes de instalación.',
    '2026-10-30T00:00:00Z'::TIMESTAMPTZ,
    'Investigación EcoMoto',
    'La ficha de la batería Phylion LMFP 48V12Ah cita estos modelos. Verificar adaptador y versión antes de instalación.'
)
ON CONFLICT (id_repuesto, id_modelo) DO UPDATE SET
    status = EXCLUDED.status,
    nivel_verificacion = EXCLUDED.nivel_verificacion,
    source_url = EXCLUDED.source_url,
    evidence_note = EXCLUDED.evidence_note,
    verified_at = EXCLUDED.verified_at,
    verified_by = EXCLUDED.verified_by,
    observaciones = EXCLUDED.observaciones;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, status, nivel_verificacion,
    source_url, evidence_note, verified_at, verified_by, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'TAILG-CHG-LEDO-48V3A-59V'),
    (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'TAILG' AND TRIM(m.nombre) = 'LEDO Litio Extraíble LMFP'),
    'CONFIRMADA_EN_FUENTE',
    'CONFIRMADA',
    'https://tailg.com.pe/motos/repuestos-y-accesorios-originales/',
    'La fuente especifica la batería Phylion 48V12Ah de TAILG LEDO y salida 59.0V; no sustituir por un cargador genérico de 54.6V.',
    '2026-10-30T00:00:00Z'::TIMESTAMPTZ,
    'Investigación EcoMoto',
    'La fuente especifica la batería Phylion 48V12Ah de TAILG LEDO y salida 59.0V; no sustituir por un cargador genérico de 54.6V.'
)
ON CONFLICT (id_repuesto, id_modelo) DO UPDATE SET
    status = EXCLUDED.status,
    nivel_verificacion = EXCLUDED.nivel_verificacion,
    source_url = EXCLUDED.source_url,
    evidence_note = EXCLUDED.evidence_note,
    verified_at = EXCLUDED.verified_at,
    verified_by = EXCLUDED.verified_by,
    observaciones = EXCLUDED.observaciones;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, status, nivel_verificacion,
    source_url, evidence_note, verified_at, verified_by, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'TAILG-CHG-F55L-60V5A-73V'),
    (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'TAILG' AND TRIM(m.nombre) = 'F55L Litio Extraíble'),
    'CONFIRMADA_EN_FUENTE',
    'CONFIRMADA',
    'https://tailg.com.pe/motos/repuestos-y-accesorios-originales/',
    'La fuente diseña el cargador para la batería GreenWay LiFePO4 64V30Ah de la TAILG F55L.',
    '2026-10-30T00:00:00Z'::TIMESTAMPTZ,
    'Investigación EcoMoto',
    'La fuente diseña el cargador para la batería GreenWay LiFePO4 64V30Ah de la TAILG F55L.'
)
ON CONFLICT (id_repuesto, id_modelo) DO UPDATE SET
    status = EXCLUDED.status,
    nivel_verificacion = EXCLUDED.nivel_verificacion,
    source_url = EXCLUDED.source_url,
    evidence_note = EXCLUDED.evidence_note,
    verified_at = EXCLUDED.verified_at,
    verified_by = EXCLUDED.verified_by,
    observaciones = EXCLUDED.observaciones;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, status, nivel_verificacion,
    source_url, evidence_note, verified_at, verified_by, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'TAILG-BAT-GREENWAY-64V30'),
    (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'TAILG' AND TRIM(m.nombre) = 'F55L Litio Extraíble'),
    'CONFIRMADA_EN_FUENTE',
    'CONFIRMADA',
    'https://tailg.com.pe/motos/repuestos-y-accesorios-originales/',
    'La fuente indica que la batería GREENWAY DM523 64V30Ah equipa la TAILG F55L.',
    '2026-10-30T00:00:00Z'::TIMESTAMPTZ,
    'Investigación EcoMoto',
    'La fuente indica que la batería GREENWAY DM523 64V30Ah equipa la TAILG F55L.'
)
ON CONFLICT (id_repuesto, id_modelo) DO UPDATE SET
    status = EXCLUDED.status,
    nivel_verificacion = EXCLUDED.nivel_verificacion,
    source_url = EXCLUDED.source_url,
    evidence_note = EXCLUDED.evidence_note,
    verified_at = EXCLUDED.verified_at,
    verified_by = EXCLUDED.verified_by,
    observaciones = EXCLUDED.observaciones;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, status, nivel_verificacion,
    source_url, evidence_note, verified_at, verified_by, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'TAILG-BOX-45L'),
    (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'TAILG' AND TRIM(m.nombre) = 'F55 Mecha G2'),
    'CONFIRMADA_EN_FUENTE',
    'CONFIRMADA',
    'https://tailg.com.pe/motos/repuestos-y-accesorios-originales/',
    'La ficha de la cajuela 45L nombra estos modelos; otros requieren validación del montaje.',
    '2026-10-30T00:00:00Z'::TIMESTAMPTZ,
    'Investigación EcoMoto',
    'La ficha de la cajuela 45L nombra estos modelos; otros requieren validación del montaje.'
)
ON CONFLICT (id_repuesto, id_modelo) DO UPDATE SET
    status = EXCLUDED.status,
    nivel_verificacion = EXCLUDED.nivel_verificacion,
    source_url = EXCLUDED.source_url,
    evidence_note = EXCLUDED.evidence_note,
    verified_at = EXCLUDED.verified_at,
    verified_by = EXCLUDED.verified_by,
    observaciones = EXCLUDED.observaciones;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, status, nivel_verificacion,
    source_url, evidence_note, verified_at, verified_by, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'TAILG-BOX-45L'),
    (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'TAILG' AND TRIM(m.nombre) = 'F52 Mecha G1'),
    'CONFIRMADA_EN_FUENTE',
    'CONFIRMADA',
    'https://tailg.com.pe/motos/repuestos-y-accesorios-originales/',
    'La ficha de la cajuela 45L nombra estos modelos; otros requieren validación del montaje.',
    '2026-10-30T00:00:00Z'::TIMESTAMPTZ,
    'Investigación EcoMoto',
    'La ficha de la cajuela 45L nombra estos modelos; otros requieren validación del montaje.'
)
ON CONFLICT (id_repuesto, id_modelo) DO UPDATE SET
    status = EXCLUDED.status,
    nivel_verificacion = EXCLUDED.nivel_verificacion,
    source_url = EXCLUDED.source_url,
    evidence_note = EXCLUDED.evidence_note,
    verified_at = EXCLUDED.verified_at,
    verified_by = EXCLUDED.verified_by,
    observaciones = EXCLUDED.observaciones;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, status, nivel_verificacion,
    source_url, evidence_note, verified_at, verified_by, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'TAILG-BOX-45L'),
    (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'TAILG' AND TRIM(m.nombre) = 'F52 NEO'),
    'CONFIRMADA_EN_FUENTE',
    'CONFIRMADA',
    'https://tailg.com.pe/motos/repuestos-y-accesorios-originales/',
    'La ficha de la cajuela 45L nombra estos modelos; otros requieren validación del montaje.',
    '2026-10-30T00:00:00Z'::TIMESTAMPTZ,
    'Investigación EcoMoto',
    'La ficha de la cajuela 45L nombra estos modelos; otros requieren validación del montaje.'
)
ON CONFLICT (id_repuesto, id_modelo) DO UPDATE SET
    status = EXCLUDED.status,
    nivel_verificacion = EXCLUDED.nivel_verificacion,
    source_url = EXCLUDED.source_url,
    evidence_note = EXCLUDED.evidence_note,
    verified_at = EXCLUDED.verified_at,
    verified_by = EXCLUDED.verified_by,
    observaciones = EXCLUDED.observaciones;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, status, nivel_verificacion,
    source_url, evidence_note, verified_at, verified_by, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'TAILG-BOX-45L'),
    (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'TAILG' AND TRIM(m.nombre) = 'X9 Super S'),
    'CONFIRMADA_EN_FUENTE',
    'CONFIRMADA',
    'https://tailg.com.pe/motos/repuestos-y-accesorios-originales/',
    'La ficha de la cajuela 45L nombra estos modelos; otros requieren validación del montaje.',
    '2026-10-30T00:00:00Z'::TIMESTAMPTZ,
    'Investigación EcoMoto',
    'La ficha de la cajuela 45L nombra estos modelos; otros requieren validación del montaje.'
)
ON CONFLICT (id_repuesto, id_modelo) DO UPDATE SET
    status = EXCLUDED.status,
    nivel_verificacion = EXCLUDED.nivel_verificacion,
    source_url = EXCLUDED.source_url,
    evidence_note = EXCLUDED.evidence_note,
    verified_at = EXCLUDED.verified_at,
    verified_by = EXCLUDED.verified_by,
    observaciones = EXCLUDED.observaciones;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, status, nivel_verificacion,
    source_url, evidence_note, verified_at, verified_by, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'TAILG-MIRROR-WY261-8MM'),
    (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'TAILG' AND TRIM(m.nombre) = 'X9 Super S'),
    'CONFIRMADA_EN_FUENTE',
    'CONFIRMADA',
    'https://tailg.com.pe/producto/repuestos-y-accesorios-originales/espejos-retrovisores/espejo-tailg-8mm/',
    'Compatible según proveedor; confirmar rosca de 8mm y sentido de rosca.',
    '2026-10-30T00:00:00Z'::TIMESTAMPTZ,
    'Investigación EcoMoto',
    'Compatible según proveedor; confirmar rosca de 8mm y sentido de rosca.'
)
ON CONFLICT (id_repuesto, id_modelo) DO UPDATE SET
    status = EXCLUDED.status,
    nivel_verificacion = EXCLUDED.nivel_verificacion,
    source_url = EXCLUDED.source_url,
    evidence_note = EXCLUDED.evidence_note,
    verified_at = EXCLUDED.verified_at,
    verified_by = EXCLUDED.verified_by,
    observaciones = EXCLUDED.observaciones;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, status, nivel_verificacion,
    source_url, evidence_note, verified_at, verified_by, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'TAILG-MIRROR-WY261-8MM'),
    (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'TAILG' AND TRIM(m.nombre) = 'A1 Plus'),
    'CONFIRMADA_EN_FUENTE',
    'CONFIRMADA',
    'https://tailg.com.pe/producto/repuestos-y-accesorios-originales/espejos-retrovisores/espejo-tailg-8mm/',
    'Compatible según proveedor; confirmar rosca de 8mm y sentido de rosca.',
    '2026-10-30T00:00:00Z'::TIMESTAMPTZ,
    'Investigación EcoMoto',
    'Compatible según proveedor; confirmar rosca de 8mm y sentido de rosca.'
)
ON CONFLICT (id_repuesto, id_modelo) DO UPDATE SET
    status = EXCLUDED.status,
    nivel_verificacion = EXCLUDED.nivel_verificacion,
    source_url = EXCLUDED.source_url,
    evidence_note = EXCLUDED.evidence_note,
    verified_at = EXCLUDED.verified_at,
    verified_by = EXCLUDED.verified_by,
    observaciones = EXCLUDED.observaciones;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, status, nivel_verificacion,
    source_url, evidence_note, verified_at, verified_by, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'TAILG-MIRROR-WY261-8MM'),
    (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'TAILG' AND TRIM(m.nombre) = 'V10 Litio Extraíble'),
    'CONFIRMADA_EN_FUENTE',
    'CONFIRMADA',
    'https://tailg.com.pe/producto/repuestos-y-accesorios-originales/espejos-retrovisores/espejo-tailg-8mm/',
    'Compatible según proveedor; confirmar rosca de 8mm y sentido de rosca.',
    '2026-10-30T00:00:00Z'::TIMESTAMPTZ,
    'Investigación EcoMoto',
    'Compatible según proveedor; confirmar rosca de 8mm y sentido de rosca.'
)
ON CONFLICT (id_repuesto, id_modelo) DO UPDATE SET
    status = EXCLUDED.status,
    nivel_verificacion = EXCLUDED.nivel_verificacion,
    source_url = EXCLUDED.source_url,
    evidence_note = EXCLUDED.evidence_note,
    verified_at = EXCLUDED.verified_at,
    verified_by = EXCLUDED.verified_by,
    observaciones = EXCLUDED.observaciones;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, status, nivel_verificacion,
    source_url, evidence_note, verified_at, verified_by, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'TAILG-MIRROR-WY261-8MM'),
    (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'TAILG' AND TRIM(m.nombre) = 'T7 Litio Extraíble'),
    'CONFIRMADA_EN_FUENTE',
    'CONFIRMADA',
    'https://tailg.com.pe/producto/repuestos-y-accesorios-originales/espejos-retrovisores/espejo-tailg-8mm/',
    'Compatible según proveedor; confirmar rosca de 8mm y sentido de rosca.',
    '2026-10-30T00:00:00Z'::TIMESTAMPTZ,
    'Investigación EcoMoto',
    'Compatible según proveedor; confirmar rosca de 8mm y sentido de rosca.'
)
ON CONFLICT (id_repuesto, id_modelo) DO UPDATE SET
    status = EXCLUDED.status,
    nivel_verificacion = EXCLUDED.nivel_verificacion,
    source_url = EXCLUDED.source_url,
    evidence_note = EXCLUDED.evidence_note,
    verified_at = EXCLUDED.verified_at,
    verified_by = EXCLUDED.verified_by,
    observaciones = EXCLUDED.observaciones;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, status, nivel_verificacion,
    source_url, evidence_note, verified_at, verified_by, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'TAILG-MIRROR-WY261-8MM'),
    (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'TAILG' AND TRIM(m.nombre) = 'Lion Max 2026'),
    'CONFIRMADA_EN_FUENTE',
    'CONFIRMADA',
    'https://tailg.com.pe/producto/repuestos-y-accesorios-originales/espejos-retrovisores/espejo-tailg-8mm/',
    'Compatible según proveedor; confirmar rosca de 8mm y sentido de rosca.',
    '2026-10-30T00:00:00Z'::TIMESTAMPTZ,
    'Investigación EcoMoto',
    'Compatible según proveedor; confirmar rosca de 8mm y sentido de rosca.'
)
ON CONFLICT (id_repuesto, id_modelo) DO UPDATE SET
    status = EXCLUDED.status,
    nivel_verificacion = EXCLUDED.nivel_verificacion,
    source_url = EXCLUDED.source_url,
    evidence_note = EXCLUDED.evidence_note,
    verified_at = EXCLUDED.verified_at,
    verified_by = EXCLUDED.verified_by,
    observaciones = EXCLUDED.observaciones;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, status, nivel_verificacion,
    source_url, evidence_note, verified_at, verified_by, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'TAILG-MIRROR-WY261-8MM'),
    (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'TAILG' AND TRIM(m.nombre) = 'Polaris Super S'),
    'CONFIRMADA_EN_FUENTE',
    'CONFIRMADA',
    'https://tailg.com.pe/producto/repuestos-y-accesorios-originales/espejos-retrovisores/espejo-tailg-8mm/',
    'Compatible según proveedor; confirmar rosca de 8mm y sentido de rosca.',
    '2026-10-30T00:00:00Z'::TIMESTAMPTZ,
    'Investigación EcoMoto',
    'Compatible según proveedor; confirmar rosca de 8mm y sentido de rosca.'
)
ON CONFLICT (id_repuesto, id_modelo) DO UPDATE SET
    status = EXCLUDED.status,
    nivel_verificacion = EXCLUDED.nivel_verificacion,
    source_url = EXCLUDED.source_url,
    evidence_note = EXCLUDED.evidence_note,
    verified_at = EXCLUDED.verified_at,
    verified_by = EXCLUDED.verified_by,
    observaciones = EXCLUDED.observaciones;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, status, nivel_verificacion,
    source_url, evidence_note, verified_at, verified_by, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'TAILG-MIRROR-WY261-8MM'),
    (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'TAILG' AND TRIM(m.nombre) = 'Master'),
    'CONFIRMADA_EN_FUENTE',
    'CONFIRMADA',
    'https://tailg.com.pe/producto/repuestos-y-accesorios-originales/espejos-retrovisores/espejo-tailg-8mm/',
    'Compatible según proveedor; confirmar rosca de 8mm y sentido de rosca.',
    '2026-10-30T00:00:00Z'::TIMESTAMPTZ,
    'Investigación EcoMoto',
    'Compatible según proveedor; confirmar rosca de 8mm y sentido de rosca.'
)
ON CONFLICT (id_repuesto, id_modelo) DO UPDATE SET
    status = EXCLUDED.status,
    nivel_verificacion = EXCLUDED.nivel_verificacion,
    source_url = EXCLUDED.source_url,
    evidence_note = EXCLUDED.evidence_note,
    verified_at = EXCLUDED.verified_at,
    verified_by = EXCLUDED.verified_by,
    observaciones = EXCLUDED.observaciones;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, status, nivel_verificacion,
    source_url, evidence_note, verified_at, verified_by, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'TAILG-MIRROR-HJ182-8MM'),
    (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'TAILG' AND TRIM(m.nombre) = 'X9 Super S'),
    'CONFIRMADA_EN_FUENTE',
    'CONFIRMADA',
    'https://tailg.com.pe/motos/repuestos-y-accesorios-originales/espejos-retrovisores/',
    'Modelos nombrados en la ficha del espejo HJ-182 de 8mm; verificar montaje.',
    '2026-10-30T00:00:00Z'::TIMESTAMPTZ,
    'Investigación EcoMoto',
    'Modelos nombrados en la ficha del espejo HJ-182 de 8mm; verificar montaje.'
)
ON CONFLICT (id_repuesto, id_modelo) DO UPDATE SET
    status = EXCLUDED.status,
    nivel_verificacion = EXCLUDED.nivel_verificacion,
    source_url = EXCLUDED.source_url,
    evidence_note = EXCLUDED.evidence_note,
    verified_at = EXCLUDED.verified_at,
    verified_by = EXCLUDED.verified_by,
    observaciones = EXCLUDED.observaciones;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, status, nivel_verificacion,
    source_url, evidence_note, verified_at, verified_by, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'TAILG-MIRROR-HJ182-8MM'),
    (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'TAILG' AND TRIM(m.nombre) = 'Leopard Pro Super S'),
    'CONFIRMADA_EN_FUENTE',
    'CONFIRMADA',
    'https://tailg.com.pe/motos/repuestos-y-accesorios-originales/espejos-retrovisores/',
    'Modelos nombrados en la ficha del espejo HJ-182 de 8mm; verificar montaje.',
    '2026-10-30T00:00:00Z'::TIMESTAMPTZ,
    'Investigación EcoMoto',
    'Modelos nombrados en la ficha del espejo HJ-182 de 8mm; verificar montaje.'
)
ON CONFLICT (id_repuesto, id_modelo) DO UPDATE SET
    status = EXCLUDED.status,
    nivel_verificacion = EXCLUDED.nivel_verificacion,
    source_url = EXCLUDED.source_url,
    evidence_note = EXCLUDED.evidence_note,
    verified_at = EXCLUDED.verified_at,
    verified_by = EXCLUDED.verified_by,
    observaciones = EXCLUDED.observaciones;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, status, nivel_verificacion,
    source_url, evidence_note, verified_at, verified_by, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'TAILG-MIRROR-HJ182-8MM'),
    (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'TAILG' AND TRIM(m.nombre) = 'A1 Plus'),
    'CONFIRMADA_EN_FUENTE',
    'CONFIRMADA',
    'https://tailg.com.pe/motos/repuestos-y-accesorios-originales/espejos-retrovisores/',
    'Modelos nombrados en la ficha del espejo HJ-182 de 8mm; verificar montaje.',
    '2026-10-30T00:00:00Z'::TIMESTAMPTZ,
    'Investigación EcoMoto',
    'Modelos nombrados en la ficha del espejo HJ-182 de 8mm; verificar montaje.'
)
ON CONFLICT (id_repuesto, id_modelo) DO UPDATE SET
    status = EXCLUDED.status,
    nivel_verificacion = EXCLUDED.nivel_verificacion,
    source_url = EXCLUDED.source_url,
    evidence_note = EXCLUDED.evidence_note,
    verified_at = EXCLUDED.verified_at,
    verified_by = EXCLUDED.verified_by,
    observaciones = EXCLUDED.observaciones;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, status, nivel_verificacion,
    source_url, evidence_note, verified_at, verified_by, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'TAILG-MIRROR-XC603'),
    (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'TAILG' AND TRIM(m.nombre) = 'F55 Mecha G2'),
    'CONFIRMADA_EN_FUENTE',
    'CONFIRMADA',
    'https://tailg.com.pe/motos/repuestos-y-accesorios-originales/espejos-retrovisores/',
    'Modelos nombrados en la ficha del espejo XC-603; verificar tipo de montaje.',
    '2026-10-30T00:00:00Z'::TIMESTAMPTZ,
    'Investigación EcoMoto',
    'Modelos nombrados en la ficha del espejo XC-603; verificar tipo de montaje.'
)
ON CONFLICT (id_repuesto, id_modelo) DO UPDATE SET
    status = EXCLUDED.status,
    nivel_verificacion = EXCLUDED.nivel_verificacion,
    source_url = EXCLUDED.source_url,
    evidence_note = EXCLUDED.evidence_note,
    verified_at = EXCLUDED.verified_at,
    verified_by = EXCLUDED.verified_by,
    observaciones = EXCLUDED.observaciones;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, status, nivel_verificacion,
    source_url, evidence_note, verified_at, verified_by, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'TAILG-MIRROR-XC603'),
    (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'TAILG' AND TRIM(m.nombre) = 'F55L Litio Extraíble'),
    'CONFIRMADA_EN_FUENTE',
    'CONFIRMADA',
    'https://tailg.com.pe/motos/repuestos-y-accesorios-originales/espejos-retrovisores/',
    'Modelos nombrados en la ficha del espejo XC-603; verificar tipo de montaje.',
    '2026-10-30T00:00:00Z'::TIMESTAMPTZ,
    'Investigación EcoMoto',
    'Modelos nombrados en la ficha del espejo XC-603; verificar tipo de montaje.'
)
ON CONFLICT (id_repuesto, id_modelo) DO UPDATE SET
    status = EXCLUDED.status,
    nivel_verificacion = EXCLUDED.nivel_verificacion,
    source_url = EXCLUDED.source_url,
    evidence_note = EXCLUDED.evidence_note,
    verified_at = EXCLUDED.verified_at,
    verified_by = EXCLUDED.verified_by,
    observaciones = EXCLUDED.observaciones;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, status, nivel_verificacion,
    source_url, evidence_note, verified_at, verified_by, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'TAILG-MIRROR-XC603'),
    (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'TAILG' AND TRIM(m.nombre) = 'Polaris Super S'),
    'CONFIRMADA_EN_FUENTE',
    'CONFIRMADA',
    'https://tailg.com.pe/motos/repuestos-y-accesorios-originales/espejos-retrovisores/',
    'Modelos nombrados en la ficha del espejo XC-603; verificar tipo de montaje.',
    '2026-10-30T00:00:00Z'::TIMESTAMPTZ,
    'Investigación EcoMoto',
    'Modelos nombrados en la ficha del espejo XC-603; verificar tipo de montaje.'
)
ON CONFLICT (id_repuesto, id_modelo) DO UPDATE SET
    status = EXCLUDED.status,
    nivel_verificacion = EXCLUDED.nivel_verificacion,
    source_url = EXCLUDED.source_url,
    evidence_note = EXCLUDED.evidence_note,
    verified_at = EXCLUDED.verified_at,
    verified_by = EXCLUDED.verified_by,
    observaciones = EXCLUDED.observaciones;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, status, nivel_verificacion,
    source_url, evidence_note, verified_at, verified_by, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'TAILG-MIRROR-XC603'),
    (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'TAILG' AND TRIM(m.nombre) = 'Optimus Mecha G3'),
    'CONFIRMADA_EN_FUENTE',
    'CONFIRMADA',
    'https://tailg.com.pe/motos/repuestos-y-accesorios-originales/espejos-retrovisores/',
    'Modelos nombrados en la ficha del espejo XC-603; verificar tipo de montaje.',
    '2026-10-30T00:00:00Z'::TIMESTAMPTZ,
    'Investigación EcoMoto',
    'Modelos nombrados en la ficha del espejo XC-603; verificar tipo de montaje.'
)
ON CONFLICT (id_repuesto, id_modelo) DO UPDATE SET
    status = EXCLUDED.status,
    nivel_verificacion = EXCLUDED.nivel_verificacion,
    source_url = EXCLUDED.source_url,
    evidence_note = EXCLUDED.evidence_note,
    verified_at = EXCLUDED.verified_at,
    verified_by = EXCLUDED.verified_by,
    observaciones = EXCLUDED.observaciones;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, status, nivel_verificacion,
    source_url, evidence_note, verified_at, verified_by, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'TAILG-MIRROR-XC603'),
    (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'TAILG' AND TRIM(m.nombre) = 'Master'),
    'CONFIRMADA_EN_FUENTE',
    'CONFIRMADA',
    'https://tailg.com.pe/motos/repuestos-y-accesorios-originales/espejos-retrovisores/',
    'Modelos nombrados en la ficha del espejo XC-603; verificar tipo de montaje.',
    '2026-10-30T00:00:00Z'::TIMESTAMPTZ,
    'Investigación EcoMoto',
    'Modelos nombrados en la ficha del espejo XC-603; verificar tipo de montaje.'
)
ON CONFLICT (id_repuesto, id_modelo) DO UPDATE SET
    status = EXCLUDED.status,
    nivel_verificacion = EXCLUDED.nivel_verificacion,
    source_url = EXCLUDED.source_url,
    evidence_note = EXCLUDED.evidence_note,
    verified_at = EXCLUDED.verified_at,
    verified_by = EXCLUDED.verified_by,
    observaciones = EXCLUDED.observaciones;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, status, nivel_verificacion,
    source_url, evidence_note, verified_at, verified_by, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'TAILG-CHG-60V-3A-PORT'),
    (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'GREENLINE' AND TRIM(m.nombre) = 'M6'),
    'CONDICIONAL_FUENTE',
    'PENDIENTE',
    'https://tailg.com.pe/motos/repuestos-y-accesorios-originales/',
    'Fuente nombra el modelo; compatibilidad sujeta a que el vehículo tenga puerto TAILG y pack 60V20Ah/60V22Ah de la química indicada. Técnico debe verificar variante antes de permitir compra definitiva.',
    '2026-10-30T00:00:00Z'::TIMESTAMPTZ,
    'Investigación EcoMoto',
    'Fuente nombra el modelo; compatibilidad sujeta a que el vehículo tenga puerto TAILG y pack 60V20Ah/60V22Ah de la química indicada. Técnico debe verificar variante antes de permitir compra definitiva.'
)
ON CONFLICT (id_repuesto, id_modelo) DO UPDATE SET
    status = EXCLUDED.status,
    nivel_verificacion = EXCLUDED.nivel_verificacion,
    source_url = EXCLUDED.source_url,
    evidence_note = EXCLUDED.evidence_note,
    verified_at = EXCLUDED.verified_at,
    verified_by = EXCLUDED.verified_by,
    observaciones = EXCLUDED.observaciones;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, status, nivel_verificacion,
    source_url, evidence_note, verified_at, verified_by, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'TAILG-CHG-60V-3A-PORT'),
    (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'GREENLINE' AND TRIM(m.nombre) = 'M5'),
    'CONDICIONAL_FUENTE',
    'PENDIENTE',
    'https://tailg.com.pe/motos/repuestos-y-accesorios-originales/',
    'Fuente nombra el modelo; compatibilidad sujeta a que el vehículo tenga puerto TAILG y pack 60V20Ah/60V22Ah de la química indicada. Técnico debe verificar variante antes de permitir compra definitiva.',
    '2026-10-30T00:00:00Z'::TIMESTAMPTZ,
    'Investigación EcoMoto',
    'Fuente nombra el modelo; compatibilidad sujeta a que el vehículo tenga puerto TAILG y pack 60V20Ah/60V22Ah de la química indicada. Técnico debe verificar variante antes de permitir compra definitiva.'
)
ON CONFLICT (id_repuesto, id_modelo) DO UPDATE SET
    status = EXCLUDED.status,
    nivel_verificacion = EXCLUDED.nivel_verificacion,
    source_url = EXCLUDED.source_url,
    evidence_note = EXCLUDED.evidence_note,
    verified_at = EXCLUDED.verified_at,
    verified_by = EXCLUDED.verified_by,
    observaciones = EXCLUDED.observaciones;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, status, nivel_verificacion,
    source_url, evidence_note, verified_at, verified_by, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'TAILG-CHG-60V-3A-PORT'),
    (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'GREENLINE' AND TRIM(m.nombre) = 'E3'),
    'CONDICIONAL_FUENTE',
    'PENDIENTE',
    'https://tailg.com.pe/motos/repuestos-y-accesorios-originales/',
    'Fuente nombra el modelo; compatibilidad sujeta a que el vehículo tenga puerto TAILG y pack 60V20Ah/60V22Ah de la química indicada. Técnico debe verificar variante antes de permitir compra definitiva.',
    '2026-10-30T00:00:00Z'::TIMESTAMPTZ,
    'Investigación EcoMoto',
    'Fuente nombra el modelo; compatibilidad sujeta a que el vehículo tenga puerto TAILG y pack 60V20Ah/60V22Ah de la química indicada. Técnico debe verificar variante antes de permitir compra definitiva.'
)
ON CONFLICT (id_repuesto, id_modelo) DO UPDATE SET
    status = EXCLUDED.status,
    nivel_verificacion = EXCLUDED.nivel_verificacion,
    source_url = EXCLUDED.source_url,
    evidence_note = EXCLUDED.evidence_note,
    verified_at = EXCLUDED.verified_at,
    verified_by = EXCLUDED.verified_by,
    observaciones = EXCLUDED.observaciones;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, status, nivel_verificacion,
    source_url, evidence_note, verified_at, verified_by, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'TAILG-CHG-60V-3A-PORT'),
    (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'GREENLINE' AND TRIM(m.nombre) = 'E5'),
    'CONDICIONAL_FUENTE',
    'PENDIENTE',
    'https://tailg.com.pe/motos/repuestos-y-accesorios-originales/',
    'Fuente nombra el modelo; compatibilidad sujeta a que el vehículo tenga puerto TAILG y pack 60V20Ah/60V22Ah de la química indicada. Técnico debe verificar variante antes de permitir compra definitiva.',
    '2026-10-30T00:00:00Z'::TIMESTAMPTZ,
    'Investigación EcoMoto',
    'Fuente nombra el modelo; compatibilidad sujeta a que el vehículo tenga puerto TAILG y pack 60V20Ah/60V22Ah de la química indicada. Técnico debe verificar variante antes de permitir compra definitiva.'
)
ON CONFLICT (id_repuesto, id_modelo) DO UPDATE SET
    status = EXCLUDED.status,
    nivel_verificacion = EXCLUDED.nivel_verificacion,
    source_url = EXCLUDED.source_url,
    evidence_note = EXCLUDED.evidence_note,
    verified_at = EXCLUDED.verified_at,
    verified_by = EXCLUDED.verified_by,
    observaciones = EXCLUDED.observaciones;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, status, nivel_verificacion,
    source_url, evidence_note, verified_at, verified_by, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'GREENLINE-CHG-72V3A'),
    (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'GREENLINE' AND TRIM(m.nombre) = 'F6'),
    'CONFIRMADA_EN_FUENTE',
    'CONFIRMADA',
    'https://glperu.com/tienda/cargador-72v-3a-greenline/',
    'La ficha del cargador 72V3A indica estos modelos; la página aparece como sin existencias.',
    '2026-10-30T00:00:00Z'::TIMESTAMPTZ,
    'Investigación EcoMoto',
    'La ficha del cargador 72V3A indica estos modelos; la página aparece como sin existencias.'
)
ON CONFLICT (id_repuesto, id_modelo) DO UPDATE SET
    status = EXCLUDED.status,
    nivel_verificacion = EXCLUDED.nivel_verificacion,
    source_url = EXCLUDED.source_url,
    evidence_note = EXCLUDED.evidence_note,
    verified_at = EXCLUDED.verified_at,
    verified_by = EXCLUDED.verified_by,
    observaciones = EXCLUDED.observaciones;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, status, nivel_verificacion,
    source_url, evidence_note, verified_at, verified_by, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'GREENLINE-CHG-72V3A'),
    (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'GREENLINE' AND TRIM(m.nombre) = 'J4'),
    'CONFIRMADA_EN_FUENTE',
    'CONFIRMADA',
    'https://glperu.com/tienda/cargador-72v-3a-greenline/',
    'La ficha del cargador 72V3A indica estos modelos; la página aparece como sin existencias.',
    '2026-10-30T00:00:00Z'::TIMESTAMPTZ,
    'Investigación EcoMoto',
    'La ficha del cargador 72V3A indica estos modelos; la página aparece como sin existencias.'
)
ON CONFLICT (id_repuesto, id_modelo) DO UPDATE SET
    status = EXCLUDED.status,
    nivel_verificacion = EXCLUDED.nivel_verificacion,
    source_url = EXCLUDED.source_url,
    evidence_note = EXCLUDED.evidence_note,
    verified_at = EXCLUDED.verified_at,
    verified_by = EXCLUDED.verified_by,
    observaciones = EXCLUDED.observaciones;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, status, nivel_verificacion,
    source_url, evidence_note, verified_at, verified_by, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'GREENLINE-CHG-60V3A-TM8X'),
    (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'GREENLINE' AND TRIM(m.nombre) = 'TM8X'),
    'CONFIRMADA_EN_FUENTE',
    'CONFIRMADA',
    'https://glperu.com/tienda/cargador-60v-3a-modelo-tm8x-tm6x-h2/',
    'La ficha del cargador 60V3A nombra estos modelos; la página aparece sin existencias.',
    '2026-10-30T00:00:00Z'::TIMESTAMPTZ,
    'Investigación EcoMoto',
    'La ficha del cargador 60V3A nombra estos modelos; la página aparece sin existencias.'
)
ON CONFLICT (id_repuesto, id_modelo) DO UPDATE SET
    status = EXCLUDED.status,
    nivel_verificacion = EXCLUDED.nivel_verificacion,
    source_url = EXCLUDED.source_url,
    evidence_note = EXCLUDED.evidence_note,
    verified_at = EXCLUDED.verified_at,
    verified_by = EXCLUDED.verified_by,
    observaciones = EXCLUDED.observaciones;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, status, nivel_verificacion,
    source_url, evidence_note, verified_at, verified_by, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'GREENLINE-CHG-60V3A-TM8X'),
    (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'GREENLINE' AND TRIM(m.nombre) = 'TM6X'),
    'CONFIRMADA_EN_FUENTE',
    'CONFIRMADA',
    'https://glperu.com/tienda/cargador-60v-3a-modelo-tm8x-tm6x-h2/',
    'La ficha del cargador 60V3A nombra estos modelos; la página aparece sin existencias.',
    '2026-10-30T00:00:00Z'::TIMESTAMPTZ,
    'Investigación EcoMoto',
    'La ficha del cargador 60V3A nombra estos modelos; la página aparece sin existencias.'
)
ON CONFLICT (id_repuesto, id_modelo) DO UPDATE SET
    status = EXCLUDED.status,
    nivel_verificacion = EXCLUDED.nivel_verificacion,
    source_url = EXCLUDED.source_url,
    evidence_note = EXCLUDED.evidence_note,
    verified_at = EXCLUDED.verified_at,
    verified_by = EXCLUDED.verified_by,
    observaciones = EXCLUDED.observaciones;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, status, nivel_verificacion,
    source_url, evidence_note, verified_at, verified_by, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'GREENLINE-CHG-60V3A-TM8X'),
    (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'GREENLINE' AND TRIM(m.nombre) = 'H2'),
    'CONFIRMADA_EN_FUENTE',
    'CONFIRMADA',
    'https://glperu.com/tienda/cargador-60v-3a-modelo-tm8x-tm6x-h2/',
    'La ficha del cargador 60V3A nombra estos modelos; la página aparece sin existencias.',
    '2026-10-30T00:00:00Z'::TIMESTAMPTZ,
    'Investigación EcoMoto',
    'La ficha del cargador 60V3A nombra estos modelos; la página aparece sin existencias.'
)
ON CONFLICT (id_repuesto, id_modelo) DO UPDATE SET
    status = EXCLUDED.status,
    nivel_verificacion = EXCLUDED.nivel_verificacion,
    source_url = EXCLUDED.source_url,
    evidence_note = EXCLUDED.evidence_note,
    verified_at = EXCLUDED.verified_at,
    verified_by = EXCLUDED.verified_by,
    observaciones = EXCLUDED.observaciones;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, status, nivel_verificacion,
    source_url, evidence_note, verified_at, verified_by, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'KAYEN-FENDER-IDO'),
    (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'KAYENCORP' AND TRIM(m.nombre) = 'Bicimoto IDO'),
    'CONFIRMADA_EN_FUENTE',
    'CONFIRMADA',
    'https://kayencorp.com/producto/guardafango-posterior-bicimoto-ido/',
    'Ficha indica guardafango para Bicimoto IDO.',
    '2026-10-30T00:00:00Z'::TIMESTAMPTZ,
    'Investigación EcoMoto',
    'Ficha indica guardafango para Bicimoto IDO.'
)
ON CONFLICT (id_repuesto, id_modelo) DO UPDATE SET
    status = EXCLUDED.status,
    nivel_verificacion = EXCLUDED.nivel_verificacion,
    source_url = EXCLUDED.source_url,
    evidence_note = EXCLUDED.evidence_note,
    verified_at = EXCLUDED.verified_at,
    verified_by = EXCLUDED.verified_by,
    observaciones = EXCLUDED.observaciones;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, status, nivel_verificacion,
    source_url, evidence_note, verified_at, verified_by, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'KAYEN-BRAKE-PADS-MNK2'),
    (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'KAYENCORP' AND TRIM(m.nombre) = 'Moto MNK2'),
    'CONFIRMADA_EN_FUENTE',
    'CONFIRMADA',
    'https://kayencorp.com/producto/pastillas-de-freno-moto-mnk2/',
    'Ficha indica pastillas de freno para la moto MNK2.',
    '2026-10-30T00:00:00Z'::TIMESTAMPTZ,
    'Investigación EcoMoto',
    'Ficha indica pastillas de freno para la moto MNK2.'
)
ON CONFLICT (id_repuesto, id_modelo) DO UPDATE SET
    status = EXCLUDED.status,
    nivel_verificacion = EXCLUDED.nivel_verificacion,
    source_url = EXCLUDED.source_url,
    evidence_note = EXCLUDED.evidence_note,
    verified_at = EXCLUDED.verified_at,
    verified_by = EXCLUDED.verified_by,
    observaciones = EXCLUDED.observaciones;

COMMIT;
