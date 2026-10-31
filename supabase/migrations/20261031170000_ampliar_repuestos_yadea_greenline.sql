-- ==============================================================================
-- Migración: Ampliación de repuestos oficiales YADEA y GREENLINE (Electrica.pe)
-- Archivo: supabase/migrations/20261031170000_ampliar_repuestos_yadea_greenline.sql
-- Total repuestos nuevos: 55
-- Total compatibilidades nuevas: 55
-- ==============================================================================

BEGIN;

-- 1. Asegurar existencia del proveedor Electrica.pe
INSERT INTO proveedores (nombre, ruc, contacto_email, sitio_web)
VALUES ('Electrica.pe', '20608594215', 'contacto@electrica.pe', 'https://electrica.pe')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO repuestos (
    id_categoria, id_proveedor, id_marca, part_key, codigo_sku,
    nombre, descripcion, precio, precio_proveedor_pen, precio_regular_proveedor_pen,
    precio_min_pen, precio_max_pen, stock_proveedor, stock_propio_ecomoto,
    voltaje_electrico_v, capacidad_electrica_ah, source_url, source_checked_on,
    data_status, notas, imagen_url, estado
) VALUES (
    (SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = 'ACCESORIO' LIMIT 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'ELECTRICA.PE' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'GREENLINE' LIMIT 1),
    'GREENLINE-CANDADO-DE-CABLE-1-20M-1854',
    'GRE-1854',
    'Candado de Cable 1.20m',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    46,
    46,
    50,
    46,
    46,
    'DISPONIBLE',
    0,
    NULL,
    NULL,
    'https://electrica.pe/producto/candado-de-cable-1-20m/',
    '2026-10-31',
    'VERIFICADO_CON_CONDICIONES',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    'https://electrica.pe/wp-content/uploads/Greenline-Candado-de-Cable-HERMEX-cb15-06.webp',
    true
) ON CONFLICT (part_key) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    precio = EXCLUDED.precio,
    imagen_url = EXCLUDED.imagen_url,
    source_url = EXCLUDED.source_url;

INSERT INTO repuestos (
    id_categoria, id_proveedor, id_marca, part_key, codigo_sku,
    nombre, descripcion, precio, precio_proveedor_pen, precio_regular_proveedor_pen,
    precio_min_pen, precio_max_pen, stock_proveedor, stock_propio_ecomoto,
    voltaje_electrico_v, capacidad_electrica_ah, source_url, source_checked_on,
    data_status, notas, imagen_url, estado
) VALUES (
    (SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = 'BATERIA' LIMIT 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'ELECTRICA.PE' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'YADEA' LIMIT 1),
    'YADEA-12V-20AH-BATERIA-DE-PLOMO-ACIDO-1851',
    'YAD-1851',
    '12V 20AH Batería de plomo ácido',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    199,
    199,
    220,
    199,
    199,
    'DISPONIBLE',
    0,
    12,
    20,
    'https://electrica.pe/producto/12v-20ah-bateria-de-plomo-acido/',
    '2026-10-31',
    'VERIFICADO_CON_CONDICIONES',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    'https://electrica.pe/wp-content/uploads/bateria-plomo-acido-12v-20ah-1.webp',
    true
) ON CONFLICT (part_key) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    precio = EXCLUDED.precio,
    imagen_url = EXCLUDED.imagen_url,
    source_url = EXCLUDED.source_url;

INSERT INTO repuestos (
    id_categoria, id_proveedor, id_marca, part_key, codigo_sku,
    nombre, descripcion, precio, precio_proveedor_pen, precio_regular_proveedor_pen,
    precio_min_pen, precio_max_pen, stock_proveedor, stock_propio_ecomoto,
    voltaje_electrico_v, capacidad_electrica_ah, source_url, source_checked_on,
    data_status, notas, imagen_url, estado
) VALUES (
    (SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = 'BATERIA' LIMIT 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'ELECTRICA.PE' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'YADEA' LIMIT 1),
    'YADEA-TIANNENG-12V12AH-BATERIA-DE-PLOMO-ACIDO-1849',
    'YAD-1849',
    'TianNeng 12V12AH Batería de plomo acido',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    125,
    125,
    145,
    125,
    125,
    'DISPONIBLE',
    0,
    12,
    12,
    'https://electrica.pe/producto/tianneng-12v12ah-bateria-de-plomo-acido/',
    '2026-10-31',
    'VERIFICADO_CON_CONDICIONES',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    'https://electrica.pe/wp-content/uploads/bateria-12v12ah-tailg.webp',
    true
) ON CONFLICT (part_key) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    precio = EXCLUDED.precio,
    imagen_url = EXCLUDED.imagen_url,
    source_url = EXCLUDED.source_url;

INSERT INTO repuestos (
    id_categoria, id_proveedor, id_marca, part_key, codigo_sku,
    nombre, descripcion, precio, precio_proveedor_pen, precio_regular_proveedor_pen,
    precio_min_pen, precio_max_pen, stock_proveedor, stock_propio_ecomoto,
    voltaje_electrico_v, capacidad_electrica_ah, source_url, source_checked_on,
    data_status, notas, imagen_url, estado
) VALUES (
    (SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = 'CARGADOR' LIMIT 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'ELECTRICA.PE' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'GREENLINE' LIMIT 1),
    'GREENLINE-72V-4A-CARGADOR-TAILG-1846',
    'GRE-1846',
    '72V 4A Cargador Tailg',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    175,
    175,
    195,
    175,
    175,
    'DISPONIBLE',
    0,
    72,
    NULL,
    'https://electrica.pe/producto/72v-4a-cargador-tailg/',
    '2026-10-31',
    'VERIFICADO_CON_CONDICIONES',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    'https://electrica.pe/wp-content/uploads/cargador-72v-4a-greenline-tailg-c.webp',
    true
) ON CONFLICT (part_key) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    precio = EXCLUDED.precio,
    imagen_url = EXCLUDED.imagen_url,
    source_url = EXCLUDED.source_url;

INSERT INTO repuestos (
    id_categoria, id_proveedor, id_marca, part_key, codigo_sku,
    nombre, descripcion, precio, precio_proveedor_pen, precio_regular_proveedor_pen,
    precio_min_pen, precio_max_pen, stock_proveedor, stock_propio_ecomoto,
    voltaje_electrico_v, capacidad_electrica_ah, source_url, source_checked_on,
    data_status, notas, imagen_url, estado
) VALUES (
    (SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = 'BATERIA' LIMIT 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'ELECTRICA.PE' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'GREENLINE' LIMIT 1),
    'GREENLINE-TIANNENG-LITIO-48V12AH-BATERIA-1843',
    'GRE-1843',
    'TianNeng Litio 48V12AH Batería',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    1150,
    1150,
    1450,
    1150,
    1150,
    'DISPONIBLE',
    0,
    48,
    12,
    'https://electrica.pe/producto/tianneng-litio-48v12ah-bateria/',
    '2026-10-31',
    'VERIFICADO_CON_CONDICIONES',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    'https://electrica.pe/wp-content/uploads/GREENLINE-BATERIA-LITIO-TIANNENG-48V-12AH-ANGULO.webp',
    true
) ON CONFLICT (part_key) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    precio = EXCLUDED.precio,
    imagen_url = EXCLUDED.imagen_url,
    source_url = EXCLUDED.source_url;

INSERT INTO repuestos (
    id_categoria, id_proveedor, id_marca, part_key, codigo_sku,
    nombre, descripcion, precio, precio_proveedor_pen, precio_regular_proveedor_pen,
    precio_min_pen, precio_max_pen, stock_proveedor, stock_propio_ecomoto,
    voltaje_electrico_v, capacidad_electrica_ah, source_url, source_checked_on,
    data_status, notas, imagen_url, estado
) VALUES (
    (SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = 'BATERIA' LIMIT 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'ELECTRICA.PE' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'GREENLINE' LIMIT 1),
    'GREENLINE-48V24AH-BATERIA-DE-LITIO-1840',
    'GRE-1840',
    '48V24AH Batería de litio',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    1950,
    1950,
    2300,
    1950,
    1950,
    'DISPONIBLE',
    0,
    48,
    24,
    'https://electrica.pe/producto/48v24ah-bateria-de-litio/',
    '2026-10-31',
    'VERIFICADO_CON_CONDICIONES',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    'https://electrica.pe/wp-content/uploads/bateria-litio-48v24ah-l24-greenline-fb.webp',
    true
) ON CONFLICT (part_key) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    precio = EXCLUDED.precio,
    imagen_url = EXCLUDED.imagen_url,
    source_url = EXCLUDED.source_url;

INSERT INTO repuestos (
    id_categoria, id_proveedor, id_marca, part_key, codigo_sku,
    nombre, descripcion, precio, precio_proveedor_pen, precio_regular_proveedor_pen,
    precio_min_pen, precio_max_pen, stock_proveedor, stock_propio_ecomoto,
    voltaje_electrico_v, capacidad_electrica_ah, source_url, source_checked_on,
    data_status, notas, imagen_url, estado
) VALUES (
    (SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = 'BATERIA' LIMIT 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'ELECTRICA.PE' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'GREENLINE' LIMIT 1),
    'GREENLINE-48V20AH-BATERIA-DE-LITIO-1837',
    'GRE-1837',
    '48V20AH Batería de litio',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    1850,
    1850,
    2050,
    1850,
    1850,
    'DISPONIBLE',
    0,
    48,
    20,
    'https://electrica.pe/producto/48v20ah-bateria-de-litio/',
    '2026-10-31',
    'VERIFICADO_CON_CONDICIONES',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    'https://electrica.pe/wp-content/uploads/bateria-litio-48v20ah-t2.webp',
    true
) ON CONFLICT (part_key) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    precio = EXCLUDED.precio,
    imagen_url = EXCLUDED.imagen_url,
    source_url = EXCLUDED.source_url;

INSERT INTO repuestos (
    id_categoria, id_proveedor, id_marca, part_key, codigo_sku,
    nombre, descripcion, precio, precio_proveedor_pen, precio_regular_proveedor_pen,
    precio_min_pen, precio_max_pen, stock_proveedor, stock_propio_ecomoto,
    voltaje_electrico_v, capacidad_electrica_ah, source_url, source_checked_on,
    data_status, notas, imagen_url, estado
) VALUES (
    (SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = 'BATERIA' LIMIT 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'ELECTRICA.PE' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'GREENLINE' LIMIT 1),
    'GREENLINE-48V16AH-BATERIA-DE-LITIO-1833',
    'GRE-1833',
    '48V16AH Batería de litio',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    1300,
    1300,
    1550,
    1300,
    1300,
    'DISPONIBLE',
    0,
    48,
    16,
    'https://electrica.pe/producto/48v16ah-bateria-de-litio/',
    '2026-10-31',
    'VERIFICADO_CON_CONDICIONES',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    'https://electrica.pe/wp-content/uploads/baterias-litio-48v16ah-t16-greenline.webp',
    true
) ON CONFLICT (part_key) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    precio = EXCLUDED.precio,
    imagen_url = EXCLUDED.imagen_url,
    source_url = EXCLUDED.source_url;

INSERT INTO repuestos (
    id_categoria, id_proveedor, id_marca, part_key, codigo_sku,
    nombre, descripcion, precio, precio_proveedor_pen, precio_regular_proveedor_pen,
    precio_min_pen, precio_max_pen, stock_proveedor, stock_propio_ecomoto,
    voltaje_electrico_v, capacidad_electrica_ah, source_url, source_checked_on,
    data_status, notas, imagen_url, estado
) VALUES (
    (SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = 'LLANTA' LIMIT 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'ELECTRICA.PE' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'GREENLINE' LIMIT 1),
    'GREENLINE-130-70-12-LLANTA-1830',
    'GRE-1830',
    '130/70-12 Llanta',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    180,
    180,
    200,
    180,
    180,
    'DISPONIBLE',
    0,
    NULL,
    NULL,
    'https://electrica.pe/producto/130-70-12-llanta/',
    '2026-10-31',
    'VERIFICADO_CON_CONDICIONES',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    'https://electrica.pe/wp-content/uploads/llanta-130-7-12-greenline-r12.webp',
    true
) ON CONFLICT (part_key) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    precio = EXCLUDED.precio,
    imagen_url = EXCLUDED.imagen_url,
    source_url = EXCLUDED.source_url;

INSERT INTO repuestos (
    id_categoria, id_proveedor, id_marca, part_key, codigo_sku,
    nombre, descripcion, precio, precio_proveedor_pen, precio_regular_proveedor_pen,
    precio_min_pen, precio_max_pen, stock_proveedor, stock_propio_ecomoto,
    voltaje_electrico_v, capacidad_electrica_ah, source_url, source_checked_on,
    data_status, notas, imagen_url, estado
) VALUES (
    (SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = 'LLANTA' LIMIT 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'ELECTRICA.PE' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'GREENLINE' LIMIT 1),
    'GREENLINE-3-0-8-LLANTA-SEYOUN-1828',
    'GRE-1828',
    '3.0-8 Llanta Seyoun',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    110,
    110,
    130,
    110,
    110,
    'DISPONIBLE',
    0,
    NULL,
    NULL,
    'https://electrica.pe/producto/3-0-8-llanta-seyoun/',
    '2026-10-31',
    'VERIFICADO_CON_CONDICIONES',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    'https://electrica.pe/wp-content/uploads/aro-8-trimoto-llanta.webp',
    true
) ON CONFLICT (part_key) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    precio = EXCLUDED.precio,
    imagen_url = EXCLUDED.imagen_url,
    source_url = EXCLUDED.source_url;

INSERT INTO repuestos (
    id_categoria, id_proveedor, id_marca, part_key, codigo_sku,
    nombre, descripcion, precio, precio_proveedor_pen, precio_regular_proveedor_pen,
    precio_min_pen, precio_max_pen, stock_proveedor, stock_propio_ecomoto,
    voltaje_electrico_v, capacidad_electrica_ah, source_url, source_checked_on,
    data_status, notas, imagen_url, estado
) VALUES (
    (SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = 'LLANTA' LIMIT 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'ELECTRICA.PE' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'GREENLINE' LIMIT 1),
    'GREENLINE-120-70-11-56L-MICHELIN-1826',
    'GRE-1826',
    '120/70-11 56L – Michelin',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    320,
    320,
    400,
    320,
    320,
    'DISPONIBLE',
    0,
    NULL,
    NULL,
    'https://electrica.pe/producto/120-70-11-56l-michelin/',
    '2026-10-31',
    'VERIFICADO_CON_CONDICIONES',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    'https://electrica.pe/wp-content/uploads/120-70-11-neumatico-michelin.webp',
    true
) ON CONFLICT (part_key) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    precio = EXCLUDED.precio,
    imagen_url = EXCLUDED.imagen_url,
    source_url = EXCLUDED.source_url;

INSERT INTO repuestos (
    id_categoria, id_proveedor, id_marca, part_key, codigo_sku,
    nombre, descripcion, precio, precio_proveedor_pen, precio_regular_proveedor_pen,
    precio_min_pen, precio_max_pen, stock_proveedor, stock_propio_ecomoto,
    voltaje_electrico_v, capacidad_electrica_ah, source_url, source_checked_on,
    data_status, notas, imagen_url, estado
) VALUES (
    (SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = 'LLANTA' LIMIT 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'ELECTRICA.PE' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'GREENLINE' LIMIT 1),
    'GREENLINE-20-1-95-LLANTA-BICICLETA-1822',
    'GRE-1822',
    '20-1.95 Llanta Bicicleta',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    45,
    45,
    70,
    45,
    45,
    'DISPONIBLE',
    0,
    NULL,
    NULL,
    'https://electrica.pe/producto/20-1-95-llanta-bicicleta/',
    '2026-10-31',
    'VERIFICADO_CON_CONDICIONES',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    'https://electrica.pe/wp-content/uploads/GreenLine-Tailg-FL1-LLANTA-20-1.95.webp',
    true
) ON CONFLICT (part_key) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    precio = EXCLUDED.precio,
    imagen_url = EXCLUDED.imagen_url,
    source_url = EXCLUDED.source_url;

INSERT INTO repuestos (
    id_categoria, id_proveedor, id_marca, part_key, codigo_sku,
    nombre, descripcion, precio, precio_proveedor_pen, precio_regular_proveedor_pen,
    precio_min_pen, precio_max_pen, stock_proveedor, stock_propio_ecomoto,
    voltaje_electrico_v, capacidad_electrica_ah, source_url, source_checked_on,
    data_status, notas, imagen_url, estado
) VALUES (
    (SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = 'LLANTA' LIMIT 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'ELECTRICA.PE' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'GREENLINE' LIMIT 1),
    'GREENLINE-CAMARA-DE-14-2-125-PARA-LLANTA-BICICLETA-1819',
    'GRE-1819',
    'Cámara de 14-2.125 para Llanta Bicicleta',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    40,
    40,
    60,
    40,
    40,
    'DISPONIBLE',
    0,
    NULL,
    NULL,
    'https://electrica.pe/producto/camara-de-14-2-125-para-llanta-bicicleta/',
    '2026-10-31',
    'VERIFICADO_CON_CONDICIONES',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    'https://electrica.pe/wp-content/uploads/camara-de-llanta-bicicletas-1.webp',
    true
) ON CONFLICT (part_key) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    precio = EXCLUDED.precio,
    imagen_url = EXCLUDED.imagen_url,
    source_url = EXCLUDED.source_url;

INSERT INTO repuestos (
    id_categoria, id_proveedor, id_marca, part_key, codigo_sku,
    nombre, descripcion, precio, precio_proveedor_pen, precio_regular_proveedor_pen,
    precio_min_pen, precio_max_pen, stock_proveedor, stock_propio_ecomoto,
    voltaje_electrico_v, capacidad_electrica_ah, source_url, source_checked_on,
    data_status, notas, imagen_url, estado
) VALUES (
    (SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = 'LLANTA' LIMIT 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'ELECTRICA.PE' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'GREENLINE' LIMIT 1),
    'GREENLINE-CAMARA-DE-20-1-95-PARA-LLANTA-BICICLETA-1815',
    'GRE-1815',
    'Cámara de 20-1.95 para Llanta Bicicleta',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    45,
    45,
    60,
    45,
    45,
    'DISPONIBLE',
    0,
    NULL,
    NULL,
    'https://electrica.pe/producto/camara-de-20-1-95-para-llanta-bicicleta/',
    '2026-10-31',
    'VERIFICADO_CON_CONDICIONES',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    'https://electrica.pe/wp-content/uploads/camara-de-llanta-bicicletas.webp',
    true
) ON CONFLICT (part_key) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    precio = EXCLUDED.precio,
    imagen_url = EXCLUDED.imagen_url,
    source_url = EXCLUDED.source_url;

INSERT INTO repuestos (
    id_categoria, id_proveedor, id_marca, part_key, codigo_sku,
    nombre, descripcion, precio, precio_proveedor_pen, precio_regular_proveedor_pen,
    precio_min_pen, precio_max_pen, stock_proveedor, stock_propio_ecomoto,
    voltaje_electrico_v, capacidad_electrica_ah, source_url, source_checked_on,
    data_status, notas, imagen_url, estado
) VALUES (
    (SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = 'BATERIA' LIMIT 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'ELECTRICA.PE' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'YADEA' LIMIT 1),
    'YADEA-TIANNENG-12V35-5AH-BATERIA-DE-PLOMO-CON-TE-1812',
    'YAD-1812',
    'TianNeng 12V35.5AH Batería de plomo con Tecnología Grafeno',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    350,
    350,
    400,
    350,
    350,
    'DISPONIBLE',
    0,
    12,
    35.5,
    'https://electrica.pe/producto/tianneng-12v35-5ah-bateria-de-plomo-con-tecnologia-grafeno/',
    '2026-10-31',
    'VERIFICADO_CON_CONDICIONES',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    'https://electrica.pe/wp-content/uploads/greenline-bateria-grafeno-12v35.5ah-01.webp',
    true
) ON CONFLICT (part_key) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    precio = EXCLUDED.precio,
    imagen_url = EXCLUDED.imagen_url,
    source_url = EXCLUDED.source_url;

INSERT INTO repuestos (
    id_categoria, id_proveedor, id_marca, part_key, codigo_sku,
    nombre, descripcion, precio, precio_proveedor_pen, precio_regular_proveedor_pen,
    precio_min_pen, precio_max_pen, stock_proveedor, stock_propio_ecomoto,
    voltaje_electrico_v, capacidad_electrica_ah, source_url, source_checked_on,
    data_status, notas, imagen_url, estado
) VALUES (
    (SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = 'LLANTA' LIMIT 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'ELECTRICA.PE' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'GREENLINE' LIMIT 1),
    'GREENLINE-3-0-10-LLANTA-1808',
    'GRE-1808',
    '3.0-10 Llanta',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    130,
    130,
    155,
    130,
    130,
    'DISPONIBLE',
    0,
    NULL,
    NULL,
    'https://electrica.pe/producto/3-0-10-llanta/',
    '2026-10-31',
    'VERIFICADO_CON_CONDICIONES',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    'https://electrica.pe/wp-content/uploads/llanta-aro-3-10-trimoto-electrica-inclinado.webp',
    true
) ON CONFLICT (part_key) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    precio = EXCLUDED.precio,
    imagen_url = EXCLUDED.imagen_url,
    source_url = EXCLUDED.source_url;

INSERT INTO repuestos (
    id_categoria, id_proveedor, id_marca, part_key, codigo_sku,
    nombre, descripcion, precio, precio_proveedor_pen, precio_regular_proveedor_pen,
    precio_min_pen, precio_max_pen, stock_proveedor, stock_propio_ecomoto,
    voltaje_electrico_v, capacidad_electrica_ah, source_url, source_checked_on,
    data_status, notas, imagen_url, estado
) VALUES (
    (SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = 'ACCESORIO' LIMIT 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'ELECTRICA.PE' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'GREENLINE' LIMIT 1),
    'GREENLINE-PITON-ARO-PARA-MOTO-1805',
    'GRE-1805',
    'Piton Aro para moto',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    30,
    30,
    50,
    30,
    30,
    'DISPONIBLE',
    0,
    NULL,
    NULL,
    'https://electrica.pe/producto/piton-aro-para-moto/',
    '2026-10-31',
    'VERIFICADO_CON_CONDICIONES',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    'https://electrica.pe/wp-content/uploads/piton-para-moto-electrica-greenline-peru.webp',
    true
) ON CONFLICT (part_key) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    precio = EXCLUDED.precio,
    imagen_url = EXCLUDED.imagen_url,
    source_url = EXCLUDED.source_url;

INSERT INTO repuestos (
    id_categoria, id_proveedor, id_marca, part_key, codigo_sku,
    nombre, descripcion, precio, precio_proveedor_pen, precio_regular_proveedor_pen,
    precio_min_pen, precio_max_pen, stock_proveedor, stock_propio_ecomoto,
    voltaje_electrico_v, capacidad_electrica_ah, source_url, source_checked_on,
    data_status, notas, imagen_url, estado
) VALUES (
    (SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = 'BATERIA' LIMIT 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'ELECTRICA.PE' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'YADEA' LIMIT 1),
    'YADEA-12V22-3AH-BATERIA-PLOMO-GRAFENO-1801',
    'YAD-1801',
    '12V22.3AH Batería Plomo Grafeno',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    225,
    225,
    275,
    225,
    225,
    'DISPONIBLE',
    0,
    12,
    22.3,
    'https://electrica.pe/producto/12v22-3ah-bateria-plomo-grafeno/',
    '2026-10-31',
    'VERIFICADO_CON_CONDICIONES',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    'https://electrica.pe/wp-content/uploads/bateria-12v22ah.webp',
    true
) ON CONFLICT (part_key) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    precio = EXCLUDED.precio,
    imagen_url = EXCLUDED.imagen_url,
    source_url = EXCLUDED.source_url;

INSERT INTO repuestos (
    id_categoria, id_proveedor, id_marca, part_key, codigo_sku,
    nombre, descripcion, precio, precio_proveedor_pen, precio_regular_proveedor_pen,
    precio_min_pen, precio_max_pen, stock_proveedor, stock_propio_ecomoto,
    voltaje_electrico_v, capacidad_electrica_ah, source_url, source_checked_on,
    data_status, notas, imagen_url, estado
) VALUES (
    (SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = 'ESPEJO' LIMIT 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'ELECTRICA.PE' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'GREENLINE' LIMIT 1),
    'GREENLINE-ESPEJO-MOTO-VINTAGE-1795',
    'GRE-1795',
    'Espejo moto vintage',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    60,
    60,
    75,
    60,
    60,
    'DISPONIBLE',
    0,
    NULL,
    NULL,
    'https://electrica.pe/producto/espejo-moto-vintage/',
    '2026-10-31',
    'VERIFICADO_CON_CONDICIONES',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    'https://electrica.pe/wp-content/uploads/espejo-rendondo-m8-m5-rosca-horario-greenline-frontal04.webp',
    true
) ON CONFLICT (part_key) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    precio = EXCLUDED.precio,
    imagen_url = EXCLUDED.imagen_url,
    source_url = EXCLUDED.source_url;

INSERT INTO repuestos (
    id_categoria, id_proveedor, id_marca, part_key, codigo_sku,
    nombre, descripcion, precio, precio_proveedor_pen, precio_regular_proveedor_pen,
    precio_min_pen, precio_max_pen, stock_proveedor, stock_propio_ecomoto,
    voltaje_electrico_v, capacidad_electrica_ah, source_url, source_checked_on,
    data_status, notas, imagen_url, estado
) VALUES (
    (SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = 'ESPEJO' LIMIT 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'ELECTRICA.PE' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'GREENLINE' LIMIT 1),
    'GREENLINE-ESPEJO-DE-TRIMOTO-1791',
    'GRE-1791',
    'Espejo de Trimoto',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    60,
    60,
    90,
    60,
    60,
    'DISPONIBLE',
    0,
    NULL,
    NULL,
    'https://electrica.pe/producto/espejo-de-trimoto/',
    '2026-10-31',
    'VERIFICADO_CON_CONDICIONES',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    'https://electrica.pe/wp-content/uploads/espejo-brillate-trimoto-greenline-frontal2.webp',
    true
) ON CONFLICT (part_key) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    precio = EXCLUDED.precio,
    imagen_url = EXCLUDED.imagen_url,
    source_url = EXCLUDED.source_url;

INSERT INTO repuestos (
    id_categoria, id_proveedor, id_marca, part_key, codigo_sku,
    nombre, descripcion, precio, precio_proveedor_pen, precio_regular_proveedor_pen,
    precio_min_pen, precio_max_pen, stock_proveedor, stock_propio_ecomoto,
    voltaje_electrico_v, capacidad_electrica_ah, source_url, source_checked_on,
    data_status, notas, imagen_url, estado
) VALUES (
    (SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = 'ELECTRICO' LIMIT 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'ELECTRICA.PE' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'GREENLINE' LIMIT 1),
    'GREENLINE-CONVERTIDOR-VOLTAJE-A-12V-1787',
    'GRE-1787',
    'Convertidor Voltaje a 12V',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    75,
    75,
    90,
    75,
    75,
    'DISPONIBLE',
    0,
    12,
    NULL,
    'https://electrica.pe/producto/convertidor-voltaje-a-12v/',
    '2026-10-31',
    'VERIFICADO_CON_CONDICIONES',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    'https://electrica.pe/wp-content/uploads/convertidor-voltaje-6072v-12v-tailg-fb.webp',
    true
) ON CONFLICT (part_key) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    precio = EXCLUDED.precio,
    imagen_url = EXCLUDED.imagen_url,
    source_url = EXCLUDED.source_url;

INSERT INTO repuestos (
    id_categoria, id_proveedor, id_marca, part_key, codigo_sku,
    nombre, descripcion, precio, precio_proveedor_pen, precio_regular_proveedor_pen,
    precio_min_pen, precio_max_pen, stock_proveedor, stock_propio_ecomoto,
    voltaje_electrico_v, capacidad_electrica_ah, source_url, source_checked_on,
    data_status, notas, imagen_url, estado
) VALUES (
    (SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = 'ELECTRICO' LIMIT 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'ELECTRICA.PE' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'YADEA' LIMIT 1),
    'YADEA-CHAPA-DE-ENCENDIDO-VMP-1783',
    'YAD-1783',
    'Chapa de encendido VMP',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    60,
    60,
    75,
    60,
    60,
    'DISPONIBLE',
    0,
    NULL,
    NULL,
    'https://electrica.pe/producto/chapa-de-encendido-vmp/',
    '2026-10-31',
    'VERIFICADO_CON_CONDICIONES',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    'https://electrica.pe/wp-content/uploads/chapa-encendido-bicimoto-vmp-s2x-s4-p20-l24-greenline.webp',
    true
) ON CONFLICT (part_key) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    precio = EXCLUDED.precio,
    imagen_url = EXCLUDED.imagen_url,
    source_url = EXCLUDED.source_url;

INSERT INTO repuestos (
    id_categoria, id_proveedor, id_marca, part_key, codigo_sku,
    nombre, descripcion, precio, precio_proveedor_pen, precio_regular_proveedor_pen,
    precio_min_pen, precio_max_pen, stock_proveedor, stock_propio_ecomoto,
    voltaje_electrico_v, capacidad_electrica_ah, source_url, source_checked_on,
    data_status, notas, imagen_url, estado
) VALUES (
    (SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = 'CARROCERIA' LIMIT 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'ELECTRICA.PE' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'GREENLINE' LIMIT 1),
    'GREENLINE-POSAPIE-COPILOTO-1779',
    'GRE-1779',
    'Posapie copiloto',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    60,
    60,
    70,
    60,
    60,
    'DISPONIBLE',
    0,
    NULL,
    NULL,
    'https://electrica.pe/producto/posapie-copiloto/',
    '2026-10-31',
    'VERIFICADO_CON_CONDICIONES',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    'https://electrica.pe/wp-content/uploads/posapie-copiloto-r10-greenline-frontal.webp',
    true
) ON CONFLICT (part_key) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    precio = EXCLUDED.precio,
    imagen_url = EXCLUDED.imagen_url,
    source_url = EXCLUDED.source_url;

INSERT INTO repuestos (
    id_categoria, id_proveedor, id_marca, part_key, codigo_sku,
    nombre, descripcion, precio, precio_proveedor_pen, precio_regular_proveedor_pen,
    precio_min_pen, precio_max_pen, stock_proveedor, stock_propio_ecomoto,
    voltaje_electrico_v, capacidad_electrica_ah, source_url, source_checked_on,
    data_status, notas, imagen_url, estado
) VALUES (
    (SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = 'SUSPENSION' LIMIT 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'ELECTRICA.PE' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'YADEA' LIMIT 1),
    'YADEA-SUSPENSION-DELANTERA-R10-R12-1776',
    'YAD-1776',
    'Suspensión Delantera R10 R12',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    450,
    450,
    500,
    450,
    450,
    'DISPONIBLE',
    0,
    12,
    NULL,
    'https://electrica.pe/producto/suspension-delantera-r10-r12/',
    '2026-10-31',
    'VERIFICADO_CON_CONDICIONES',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    'https://electrica.pe/wp-content/uploads/suspencion-delantera-r12-r10-greenline-frontal.webp',
    true
) ON CONFLICT (part_key) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    precio = EXCLUDED.precio,
    imagen_url = EXCLUDED.imagen_url,
    source_url = EXCLUDED.source_url;

INSERT INTO repuestos (
    id_categoria, id_proveedor, id_marca, part_key, codigo_sku,
    nombre, descripcion, precio, precio_proveedor_pen, precio_regular_proveedor_pen,
    precio_min_pen, precio_max_pen, stock_proveedor, stock_propio_ecomoto,
    voltaje_electrico_v, capacidad_electrica_ah, source_url, source_checked_on,
    data_status, notas, imagen_url, estado
) VALUES (
    (SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = 'CARROCERIA' LIMIT 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'ELECTRICA.PE' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'GREENLINE' LIMIT 1),
    'GREENLINE-POSAPIE-DE-VMP-1772',
    'GRE-1772',
    'Posapie de VMP',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    90,
    90,
    100,
    90,
    90,
    'DISPONIBLE',
    0,
    NULL,
    NULL,
    'https://electrica.pe/producto/posapie-de-vmp/',
    '2026-10-31',
    'VERIFICADO_CON_CONDICIONES',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    'https://electrica.pe/wp-content/uploads/kit-posapie-copiloto-vmp-greenline-frontall.webp',
    true
) ON CONFLICT (part_key) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    precio = EXCLUDED.precio,
    imagen_url = EXCLUDED.imagen_url,
    source_url = EXCLUDED.source_url;

INSERT INTO repuestos (
    id_categoria, id_proveedor, id_marca, part_key, codigo_sku,
    nombre, descripcion, precio, precio_proveedor_pen, precio_regular_proveedor_pen,
    precio_min_pen, precio_max_pen, stock_proveedor, stock_propio_ecomoto,
    voltaje_electrico_v, capacidad_electrica_ah, source_url, source_checked_on,
    data_status, notas, imagen_url, estado
) VALUES (
    (SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = 'CARROCERIA' LIMIT 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'ELECTRICA.PE' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'GREENLINE' LIMIT 1),
    'GREENLINE-POSAPIE-COPILOTO-MOTO-LION-1768',
    'GRE-1768',
    'Posapié copiloto moto Lion',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    45,
    45,
    60,
    45,
    45,
    'DISPONIBLE',
    0,
    NULL,
    NULL,
    'https://electrica.pe/producto/posapie-copiloto-moto-lion/',
    '2026-10-31',
    'VERIFICADO_CON_CONDICIONES',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    'https://electrica.pe/wp-content/uploads/posapie-copiloto-lion-greenline-frontal.webp',
    true
) ON CONFLICT (part_key) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    precio = EXCLUDED.precio,
    imagen_url = EXCLUDED.imagen_url,
    source_url = EXCLUDED.source_url;

INSERT INTO repuestos (
    id_categoria, id_proveedor, id_marca, part_key, codigo_sku,
    nombre, descripcion, precio, precio_proveedor_pen, precio_regular_proveedor_pen,
    precio_min_pen, precio_max_pen, stock_proveedor, stock_propio_ecomoto,
    voltaje_electrico_v, capacidad_electrica_ah, source_url, source_checked_on,
    data_status, notas, imagen_url, estado
) VALUES (
    (SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = 'CARROCERIA' LIMIT 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'ELECTRICA.PE' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'GREENLINE' LIMIT 1),
    'GREENLINE-MALETA-DELIVERY-VMP-1762',
    'GRE-1762',
    'Maleta Delivery VMP',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    90,
    90,
    145,
    90,
    90,
    'DISPONIBLE',
    0,
    NULL,
    NULL,
    'https://electrica.pe/producto/maleta-delivery-vmp/',
    '2026-10-31',
    'VERIFICADO_CON_CONDICIONES',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    'https://electrica.pe/wp-content/uploads/Maleta-delivery-abierto.webp',
    true
) ON CONFLICT (part_key) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    precio = EXCLUDED.precio,
    imagen_url = EXCLUDED.imagen_url,
    source_url = EXCLUDED.source_url;

INSERT INTO repuestos (
    id_categoria, id_proveedor, id_marca, part_key, codigo_sku,
    nombre, descripcion, precio, precio_proveedor_pen, precio_regular_proveedor_pen,
    precio_min_pen, precio_max_pen, stock_proveedor, stock_propio_ecomoto,
    voltaje_electrico_v, capacidad_electrica_ah, source_url, source_checked_on,
    data_status, notas, imagen_url, estado
) VALUES (
    (SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = 'ELECTRICO' LIMIT 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'ELECTRICA.PE' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'YADEA' LIMIT 1),
    'YADEA-MOTOR-HUB-1000W-ARO-10-1758',
    'YAD-1758',
    'Motor HUB 1000W – Aro 10',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    640,
    640,
    690,
    640,
    640,
    'DISPONIBLE',
    0,
    10,
    NULL,
    'https://electrica.pe/producto/motor-hub-1000w-aro-10/',
    '2026-10-31',
    'VERIFICADO_CON_CONDICIONES',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    'https://electrica.pe/wp-content/uploads/GREENLINE-MOTOR-MOTO-ELECTRICA-HUB-Y7-C-72V-1000W.webp',
    true
) ON CONFLICT (part_key) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    precio = EXCLUDED.precio,
    imagen_url = EXCLUDED.imagen_url,
    source_url = EXCLUDED.source_url;

INSERT INTO repuestos (
    id_categoria, id_proveedor, id_marca, part_key, codigo_sku,
    nombre, descripcion, precio, precio_proveedor_pen, precio_regular_proveedor_pen,
    precio_min_pen, precio_max_pen, stock_proveedor, stock_propio_ecomoto,
    voltaje_electrico_v, capacidad_electrica_ah, source_url, source_checked_on,
    data_status, notas, imagen_url, estado
) VALUES (
    (SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = 'ELECTRICO' LIMIT 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'ELECTRICA.PE' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'YADEA' LIMIT 1),
    'YADEA-LLAVE-TERMOMAGNETICA-DC-40A-1754',
    'YAD-1754',
    'Llave Termomagnetica DC 40A',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    45,
    45,
    75,
    45,
    45,
    'DISPONIBLE',
    0,
    12,
    NULL,
    'https://electrica.pe/producto/llave-termomagnetica-dc-40a/',
    '2026-10-31',
    'VERIFICADO_CON_CONDICIONES',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    'https://electrica.pe/wp-content/uploads/GREENLINE-LLAVE-TERMOMAGNETICA-DC-40A-MOTO-ELECTRICA-02.webp',
    true
) ON CONFLICT (part_key) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    precio = EXCLUDED.precio,
    imagen_url = EXCLUDED.imagen_url,
    source_url = EXCLUDED.source_url;

INSERT INTO repuestos (
    id_categoria, id_proveedor, id_marca, part_key, codigo_sku,
    nombre, descripcion, precio, precio_proveedor_pen, precio_regular_proveedor_pen,
    precio_min_pen, precio_max_pen, stock_proveedor, stock_propio_ecomoto,
    voltaje_electrico_v, capacidad_electrica_ah, source_url, source_checked_on,
    data_status, notas, imagen_url, estado
) VALUES (
    (SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = 'SUSPENSION' LIMIT 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'ELECTRICA.PE' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'YADEA' LIMIT 1),
    'YADEA-AMORTIGUADOR-MONOSHOCK-MODELO-R12-MAX-1748',
    'YAD-1748',
    'Amortiguador monoshock modelo R12 max',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    210,
    210,
    250,
    210,
    210,
    'DISPONIBLE',
    0,
    NULL,
    NULL,
    'https://electrica.pe/producto/amortiguador-monoshock-modelo-r12-max/',
    '2026-10-31',
    'VERIFICADO_CON_CONDICIONES',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    'https://electrica.pe/wp-content/uploads/GREENLINE-AMORTIGUADOR-MONO-SHOCK-R12-R10.webp',
    true
) ON CONFLICT (part_key) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    precio = EXCLUDED.precio,
    imagen_url = EXCLUDED.imagen_url,
    source_url = EXCLUDED.source_url;

INSERT INTO repuestos (
    id_categoria, id_proveedor, id_marca, part_key, codigo_sku,
    nombre, descripcion, precio, precio_proveedor_pen, precio_regular_proveedor_pen,
    precio_min_pen, precio_max_pen, stock_proveedor, stock_propio_ecomoto,
    voltaje_electrico_v, capacidad_electrica_ah, source_url, source_checked_on,
    data_status, notas, imagen_url, estado
) VALUES (
    (SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = 'BATERIA' LIMIT 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'ELECTRICA.PE' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'GREENLINE' LIMIT 1),
    'GREENLINE-POWERAMP-LITIO-48V24AH-BATERIA-1743',
    'GRE-1743',
    'PowerAmp Litio 48V24AH Batería',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    1870,
    1870,
    2000,
    1870,
    1870,
    'DISPONIBLE',
    0,
    48,
    24,
    'https://electrica.pe/producto/poweramp-litio-48v24ah-bateria/',
    '2026-10-31',
    'VERIFICADO_CON_CONDICIONES',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    'https://electrica.pe/wp-content/uploads/PowerAmp-48v24ah-bateria-tailg-t3-t5-3.webp',
    true
) ON CONFLICT (part_key) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    precio = EXCLUDED.precio,
    imagen_url = EXCLUDED.imagen_url,
    source_url = EXCLUDED.source_url;

INSERT INTO repuestos (
    id_categoria, id_proveedor, id_marca, part_key, codigo_sku,
    nombre, descripcion, precio, precio_proveedor_pen, precio_regular_proveedor_pen,
    precio_min_pen, precio_max_pen, stock_proveedor, stock_propio_ecomoto,
    voltaje_electrico_v, capacidad_electrica_ah, source_url, source_checked_on,
    data_status, notas, imagen_url, estado
) VALUES (
    (SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = 'BATERIA' LIMIT 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'ELECTRICA.PE' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'YADEA' LIMIT 1),
    'YADEA-TIANNENG-12V45AH-BATERIA-DE-PLOMO-ACIDO-1740',
    'YAD-1740',
    'TianNeng 12V45AH Batería de plomo acido',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    410,
    410,
    450,
    410,
    410,
    'DISPONIBLE',
    0,
    12,
    45,
    'https://electrica.pe/producto/tianneng-12v45ah-bateria-de-plomo-acido/',
    '2026-10-31',
    'VERIFICADO_CON_CONDICIONES',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    'https://electrica.pe/wp-content/uploads/GREENLINE-BATERIA-PLOMO-12V-45AH-LATERAL1.webp',
    true
) ON CONFLICT (part_key) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    precio = EXCLUDED.precio,
    imagen_url = EXCLUDED.imagen_url,
    source_url = EXCLUDED.source_url;

INSERT INTO repuestos (
    id_categoria, id_proveedor, id_marca, part_key, codigo_sku,
    nombre, descripcion, precio, precio_proveedor_pen, precio_regular_proveedor_pen,
    precio_min_pen, precio_max_pen, stock_proveedor, stock_propio_ecomoto,
    voltaje_electrico_v, capacidad_electrica_ah, source_url, source_checked_on,
    data_status, notas, imagen_url, estado
) VALUES (
    (SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = 'BATERIA' LIMIT 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'ELECTRICA.PE' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'GREENLINE' LIMIT 1),
    'GREENLINE-36V10-4AH-BATERIA-DE-LITIO-1734',
    'GRE-1734',
    '36V10.4AH Batería de litio',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    1050,
    1050,
    1120,
    1050,
    1050,
    'DISPONIBLE',
    0,
    36,
    10.4,
    'https://electrica.pe/producto/36v10-4ah-bateria-de-litio/',
    '2026-10-31',
    'VERIFICADO_CON_CONDICIONES',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    'https://electrica.pe/wp-content/uploads/GREENLINE-BATERIA-LITIO-MATRIX-36V-36AH-ANG1.webp',
    true
) ON CONFLICT (part_key) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    precio = EXCLUDED.precio,
    imagen_url = EXCLUDED.imagen_url,
    source_url = EXCLUDED.source_url;

INSERT INTO repuestos (
    id_categoria, id_proveedor, id_marca, part_key, codigo_sku,
    nombre, descripcion, precio, precio_proveedor_pen, precio_regular_proveedor_pen,
    precio_min_pen, precio_max_pen, stock_proveedor, stock_propio_ecomoto,
    voltaje_electrico_v, capacidad_electrica_ah, source_url, source_checked_on,
    data_status, notas, imagen_url, estado
) VALUES (
    (SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = 'ACCESORIO' LIMIT 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'ELECTRICA.PE' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'GREENLINE' LIMIT 1),
    'GREENLINE-CASCO-CERTIFICADO-DOT-RNG701M-1729',
    'GRE-1729',
    'Casco Certificado DOT RNG701M',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    180,
    180,
    250,
    180,
    180,
    'DISPONIBLE',
    0,
    NULL,
    NULL,
    'https://electrica.pe/producto/casco-certificado-dot-rng701m/',
    '2026-10-31',
    'VERIFICADO_CON_CONDICIONES',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    'https://electrica.pe/wp-content/uploads/CASCO-MATE-BLANCO-RNG701M.webp',
    true
) ON CONFLICT (part_key) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    precio = EXCLUDED.precio,
    imagen_url = EXCLUDED.imagen_url,
    source_url = EXCLUDED.source_url;

INSERT INTO repuestos (
    id_categoria, id_proveedor, id_marca, part_key, codigo_sku,
    nombre, descripcion, precio, precio_proveedor_pen, precio_regular_proveedor_pen,
    precio_min_pen, precio_max_pen, stock_proveedor, stock_propio_ecomoto,
    voltaje_electrico_v, capacidad_electrica_ah, source_url, source_checked_on,
    data_status, notas, imagen_url, estado
) VALUES (
    (SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = 'ESPEJO' LIMIT 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'ELECTRICA.PE' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'TAILG' LIMIT 1),
    'TAILG-ESPEJO-ORIGINAL-TAILG-T7-T5-F52-1722',
    'TAI-1722',
    'Espejo Original TAILG T7 T5 F52',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    70,
    70,
    95,
    70,
    70,
    'DISPONIBLE',
    0,
    NULL,
    NULL,
    'https://electrica.pe/producto/espejo-original-tailg-t7-t5-f52/',
    '2026-10-31',
    'VERIFICADO_CON_CONDICIONES',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    'https://electrica.pe/wp-content/uploads/espejo-original-F52-X.webp',
    true
) ON CONFLICT (part_key) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    precio = EXCLUDED.precio,
    imagen_url = EXCLUDED.imagen_url,
    source_url = EXCLUDED.source_url;

INSERT INTO repuestos (
    id_categoria, id_proveedor, id_marca, part_key, codigo_sku,
    nombre, descripcion, precio, precio_proveedor_pen, precio_regular_proveedor_pen,
    precio_min_pen, precio_max_pen, stock_proveedor, stock_propio_ecomoto,
    voltaje_electrico_v, capacidad_electrica_ah, source_url, source_checked_on,
    data_status, notas, imagen_url, estado
) VALUES (
    (SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = 'FRENOS' LIMIT 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'ELECTRICA.PE' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'TAILG' LIMIT 1),
    'TAILG-CANDADO-DE-FRENO-DISCO-CON-ALARMA-PARA-MOT-1712',
    'TAI-1712',
    'Candado de Freno Disco con Alarma para Motos Bicicletas',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    55,
    55,
    75,
    55,
    55,
    'DISPONIBLE',
    0,
    NULL,
    NULL,
    'https://electrica.pe/producto/candado-de-freno-disco-con-alarma-para-motos-bicicletas/',
    '2026-10-31',
    'VERIFICADO_CON_CONDICIONES',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    'https://electrica.pe/wp-content/uploads/Candado-de-Freno-Disco-con-Alarma.webp',
    true
) ON CONFLICT (part_key) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    precio = EXCLUDED.precio,
    imagen_url = EXCLUDED.imagen_url,
    source_url = EXCLUDED.source_url;

INSERT INTO repuestos (
    id_categoria, id_proveedor, id_marca, part_key, codigo_sku,
    nombre, descripcion, precio, precio_proveedor_pen, precio_regular_proveedor_pen,
    precio_min_pen, precio_max_pen, stock_proveedor, stock_propio_ecomoto,
    voltaje_electrico_v, capacidad_electrica_ah, source_url, source_checked_on,
    data_status, notas, imagen_url, estado
) VALUES (
    (SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = 'FRENOS' LIMIT 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'ELECTRICA.PE' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'GREENLINE' LIMIT 1),
    'GREENLINE-CANDADO-DE-FRENO-DISCO-PARA-MOTOS-BICICLET-1706',
    'GRE-1706',
    'Candado de Freno Disco para Motos Bicicletas',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    30,
    30,
    55,
    30,
    30,
    'DISPONIBLE',
    0,
    NULL,
    NULL,
    'https://electrica.pe/producto/candado-de-freno-disco-para-motos-bicicletas/',
    '2026-10-31',
    'VERIFICADO_CON_CONDICIONES',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    'https://electrica.pe/wp-content/uploads/Candado-de-Freno-Disco.webp',
    true
) ON CONFLICT (part_key) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    precio = EXCLUDED.precio,
    imagen_url = EXCLUDED.imagen_url,
    source_url = EXCLUDED.source_url;

INSERT INTO repuestos (
    id_categoria, id_proveedor, id_marca, part_key, codigo_sku,
    nombre, descripcion, precio, precio_proveedor_pen, precio_regular_proveedor_pen,
    precio_min_pen, precio_max_pen, stock_proveedor, stock_propio_ecomoto,
    voltaje_electrico_v, capacidad_electrica_ah, source_url, source_checked_on,
    data_status, notas, imagen_url, estado
) VALUES (
    (SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = 'CARGADOR' LIMIT 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'ELECTRICA.PE' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'TAILG' LIMIT 1),
    'TAILG-72V4A-CARGADOR-TAILG-GB42296-1694',
    'TAI-1694',
    '72V4A Cargador TAILG GB42296',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    160,
    160,
    180,
    160,
    160,
    'DISPONIBLE',
    0,
    72,
    23,
    'https://electrica.pe/producto/72v4a-cargador-tailg-gb42296/',
    '2026-10-31',
    'VERIFICADO_CON_CONDICIONES',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    'https://electrica.pe/wp-content/uploads/cargador-plomo-GB-42296-TAILG-72V4A.webp',
    true
) ON CONFLICT (part_key) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    precio = EXCLUDED.precio,
    imagen_url = EXCLUDED.imagen_url,
    source_url = EXCLUDED.source_url;

INSERT INTO repuestos (
    id_categoria, id_proveedor, id_marca, part_key, codigo_sku,
    nombre, descripcion, precio, precio_proveedor_pen, precio_regular_proveedor_pen,
    precio_min_pen, precio_max_pen, stock_proveedor, stock_propio_ecomoto,
    voltaje_electrico_v, capacidad_electrica_ah, source_url, source_checked_on,
    data_status, notas, imagen_url, estado
) VALUES (
    (SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = 'ESPEJO' LIMIT 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'ELECTRICA.PE' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'TAILG' LIMIT 1),
    'TAILG-ESPEJO-ORIGINAL-TAILG-X9-A1-1689',
    'TAI-1689',
    'Espejo Original TAILG X9 A1',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    70,
    70,
    95,
    70,
    70,
    'DISPONIBLE',
    0,
    NULL,
    NULL,
    'https://electrica.pe/producto/espejo-original-tailg-x9-a1/',
    '2026-10-31',
    'VERIFICADO_CON_CONDICIONES',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    'https://electrica.pe/wp-content/uploads/espejo-original-tailg-x9-a1-x.webp',
    true
) ON CONFLICT (part_key) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    precio = EXCLUDED.precio,
    imagen_url = EXCLUDED.imagen_url,
    source_url = EXCLUDED.source_url;

INSERT INTO repuestos (
    id_categoria, id_proveedor, id_marca, part_key, codigo_sku,
    nombre, descripcion, precio, precio_proveedor_pen, precio_regular_proveedor_pen,
    precio_min_pen, precio_max_pen, stock_proveedor, stock_propio_ecomoto,
    voltaje_electrico_v, capacidad_electrica_ah, source_url, source_checked_on,
    data_status, notas, imagen_url, estado
) VALUES (
    (SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = 'CARGADOR' LIMIT 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'ELECTRICA.PE' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'TAILG' LIMIT 1),
    'TAILG-72V3A-CARGADOR-TAILG-GB42296-1681',
    'TAI-1681',
    '72V3A Cargador TAILG GB42296',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    150,
    150,
    175,
    150,
    150,
    'DISPONIBLE',
    0,
    72,
    20,
    'https://electrica.pe/producto/72v3a-cargador-tailg-gb42296/',
    '2026-10-31',
    'VERIFICADO_CON_CONDICIONES',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    'https://electrica.pe/wp-content/uploads/cargador-tailg-72v3a-plomo-acido-gb42296-1.webp',
    true
) ON CONFLICT (part_key) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    precio = EXCLUDED.precio,
    imagen_url = EXCLUDED.imagen_url,
    source_url = EXCLUDED.source_url;

INSERT INTO repuestos (
    id_categoria, id_proveedor, id_marca, part_key, codigo_sku,
    nombre, descripcion, precio, precio_proveedor_pen, precio_regular_proveedor_pen,
    precio_min_pen, precio_max_pen, stock_proveedor, stock_propio_ecomoto,
    voltaje_electrico_v, capacidad_electrica_ah, source_url, source_checked_on,
    data_status, notas, imagen_url, estado
) VALUES (
    (SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = 'ESPEJO' LIMIT 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'ELECTRICA.PE' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'GREENLINE' LIMIT 1),
    'GREENLINE-ESPEJO-GENERICO-CARCASA-COLOR-PLATA-8MM-1678',
    'GRE-1678',
    'Espejo genérico Carcasa color plata 8mm',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    60,
    60,
    75,
    60,
    60,
    'DISPONIBLE',
    0,
    NULL,
    NULL,
    'https://electrica.pe/producto/espejo-generico-carcasa-color-plata-8mm/',
    '2026-10-31',
    'VERIFICADO_CON_CONDICIONES',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    'https://electrica.pe/wp-content/uploads/espejo-retrovisor-8mm-carcasa-color-plata.webp',
    true
) ON CONFLICT (part_key) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    precio = EXCLUDED.precio,
    imagen_url = EXCLUDED.imagen_url,
    source_url = EXCLUDED.source_url;

INSERT INTO repuestos (
    id_categoria, id_proveedor, id_marca, part_key, codigo_sku,
    nombre, descripcion, precio, precio_proveedor_pen, precio_regular_proveedor_pen,
    precio_min_pen, precio_max_pen, stock_proveedor, stock_propio_ecomoto,
    voltaje_electrico_v, capacidad_electrica_ah, source_url, source_checked_on,
    data_status, notas, imagen_url, estado
) VALUES (
    (SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = 'ESPEJO' LIMIT 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'ELECTRICA.PE' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'TAILG' LIMIT 1),
    'TAILG-ESPEJO-ORIGINAL-TAILG-PIONERO-GRIS-1671',
    'TAI-1671',
    'Espejo Original TAILG Pionero Gris',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    80,
    80,
    100,
    80,
    80,
    'DISPONIBLE',
    0,
    NULL,
    NULL,
    'https://electrica.pe/producto/espejo-original-tailg-pionero-gris/',
    '2026-10-31',
    'VERIFICADO_CON_CONDICIONES',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    'https://electrica.pe/wp-content/uploads/espejo-retrovisor-tailg-pionero-gris-Logox.webp',
    true
) ON CONFLICT (part_key) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    precio = EXCLUDED.precio,
    imagen_url = EXCLUDED.imagen_url,
    source_url = EXCLUDED.source_url;

INSERT INTO repuestos (
    id_categoria, id_proveedor, id_marca, part_key, codigo_sku,
    nombre, descripcion, precio, precio_proveedor_pen, precio_regular_proveedor_pen,
    precio_min_pen, precio_max_pen, stock_proveedor, stock_propio_ecomoto,
    voltaje_electrico_v, capacidad_electrica_ah, source_url, source_checked_on,
    data_status, notas, imagen_url, estado
) VALUES (
    (SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = 'ESPEJO' LIMIT 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'ELECTRICA.PE' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'TAILG' LIMIT 1),
    'TAILG-ESPEJO-ORIGINAL-TAILG-M2-VINTAGE-1665',
    'TAI-1665',
    'Espejo Original TAILG M2 Vintage',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    70,
    70,
    95,
    70,
    70,
    'DISPONIBLE',
    0,
    NULL,
    NULL,
    'https://electrica.pe/producto/espejo-original-tailg-m2-vintage/',
    '2026-10-31',
    'VERIFICADO_CON_CONDICIONES',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    'https://electrica.pe/wp-content/uploads/espejo-retrovisor-tailg-m2-vintage.webp',
    true
) ON CONFLICT (part_key) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    precio = EXCLUDED.precio,
    imagen_url = EXCLUDED.imagen_url,
    source_url = EXCLUDED.source_url;

INSERT INTO repuestos (
    id_categoria, id_proveedor, id_marca, part_key, codigo_sku,
    nombre, descripcion, precio, precio_proveedor_pen, precio_regular_proveedor_pen,
    precio_min_pen, precio_max_pen, stock_proveedor, stock_propio_ecomoto,
    voltaje_electrico_v, capacidad_electrica_ah, source_url, source_checked_on,
    data_status, notas, imagen_url, estado
) VALUES (
    (SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = 'LLANTA' LIMIT 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'ELECTRICA.PE' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'YADEA' LIMIT 1),
    'YADEA-90-90-12-LLANTA-COCADA-SIN-CAMARA-DE-ARO-1-1661',
    'YAD-1661',
    '90/90-12 Llanta Cocada sin Cámara de Aro 12',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    180,
    180,
    200,
    180,
    180,
    'DISPONIBLE',
    0,
    NULL,
    NULL,
    'https://electrica.pe/producto/90-90-12-llanta-cocada-sin-camara-de-aro-12/',
    '2026-10-31',
    'VERIFICADO_CON_CONDICIONES',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    'https://electrica.pe/wp-content/uploads/WhatsApp-Image-2025-11-07-at-9.21.36-PM.webp',
    true
) ON CONFLICT (part_key) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    precio = EXCLUDED.precio,
    imagen_url = EXCLUDED.imagen_url,
    source_url = EXCLUDED.source_url;

INSERT INTO repuestos (
    id_categoria, id_proveedor, id_marca, part_key, codigo_sku,
    nombre, descripcion, precio, precio_proveedor_pen, precio_regular_proveedor_pen,
    precio_min_pen, precio_max_pen, stock_proveedor, stock_propio_ecomoto,
    voltaje_electrico_v, capacidad_electrica_ah, source_url, source_checked_on,
    data_status, notas, imagen_url, estado
) VALUES (
    (SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = 'CARGADOR' LIMIT 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'ELECTRICA.PE' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'GREENLINE' LIMIT 1),
    'GREENLINE-60V3A-CARGADOR-PUERTO-TAILG-1651',
    'GRE-1651',
    '60V3A Cargador Puerto TAILG',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    140,
    140,
    175,
    140,
    140,
    'DISPONIBLE',
    0,
    60,
    20,
    'https://electrica.pe/producto/60v3a-cargador-puerto-tailg/',
    '2026-10-31',
    'VERIFICADO_CON_CONDICIONES',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    'https://electrica.pe/wp-content/uploads/60V3A-cargador-tailg-hg.webp',
    true
) ON CONFLICT (part_key) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    precio = EXCLUDED.precio,
    imagen_url = EXCLUDED.imagen_url,
    source_url = EXCLUDED.source_url;

INSERT INTO repuestos (
    id_categoria, id_proveedor, id_marca, part_key, codigo_sku,
    nombre, descripcion, precio, precio_proveedor_pen, precio_regular_proveedor_pen,
    precio_min_pen, precio_max_pen, stock_proveedor, stock_propio_ecomoto,
    voltaje_electrico_v, capacidad_electrica_ah, source_url, source_checked_on,
    data_status, notas, imagen_url, estado
) VALUES (
    (SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = 'CARROCERIA' LIMIT 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'ELECTRICA.PE' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'TAILG' LIMIT 1),
    'TAILG-CAJUELA-CUADRADA-1634',
    'TAI-1634',
    'Cajuela Cuadrada',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    180,
    180,
    230,
    180,
    180,
    'DISPONIBLE',
    0,
    NULL,
    NULL,
    'https://electrica.pe/producto/cajuela-cuadrada/',
    '2026-10-31',
    'VERIFICADO_CON_CONDICIONES',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    'https://electrica.pe/wp-content/uploads/CAJUELA-45L-negro-TAILG-X9.webp',
    true
) ON CONFLICT (part_key) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    precio = EXCLUDED.precio,
    imagen_url = EXCLUDED.imagen_url,
    source_url = EXCLUDED.source_url;

INSERT INTO repuestos (
    id_categoria, id_proveedor, id_marca, part_key, codigo_sku,
    nombre, descripcion, precio, precio_proveedor_pen, precio_regular_proveedor_pen,
    precio_min_pen, precio_max_pen, stock_proveedor, stock_propio_ecomoto,
    voltaje_electrico_v, capacidad_electrica_ah, source_url, source_checked_on,
    data_status, notas, imagen_url, estado
) VALUES (
    (SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = 'BATERIA' LIMIT 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'ELECTRICA.PE' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'TAILG' LIMIT 1),
    'TAILG-48V-3A-CARGADOR-BATERIA-DE-LITIO-1617',
    'TAI-1617',
    '48V 3A Cargador Batería de Litio',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    120,
    120,
    145,
    120,
    120,
    'DISPONIBLE',
    0,
    48,
    NULL,
    'https://electrica.pe/producto/48v-3a-cargador-bateria-de-litio/',
    '2026-10-31',
    'VERIFICADO_CON_CONDICIONES',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    'https://electrica.pe/wp-content/uploads/CARGADOR-1.webp',
    true
) ON CONFLICT (part_key) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    precio = EXCLUDED.precio,
    imagen_url = EXCLUDED.imagen_url,
    source_url = EXCLUDED.source_url;

INSERT INTO repuestos (
    id_categoria, id_proveedor, id_marca, part_key, codigo_sku,
    nombre, descripcion, precio, precio_proveedor_pen, precio_regular_proveedor_pen,
    precio_min_pen, precio_max_pen, stock_proveedor, stock_propio_ecomoto,
    voltaje_electrico_v, capacidad_electrica_ah, source_url, source_checked_on,
    data_status, notas, imagen_url, estado
) VALUES (
    (SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = 'FRENOS' LIMIT 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'ELECTRICA.PE' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'TAILG' LIMIT 1),
    'TAILG-CANDADO-DE-FRENO-DISCO-CON-ALARMA-ACCESORI-1611',
    'TAI-1611',
    'Candado de Freno Disco con Alarma & Accesorios para Motos Bicicletas',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    70,
    70,
    100,
    70,
    70,
    'DISPONIBLE',
    0,
    NULL,
    NULL,
    'https://electrica.pe/producto/candado-de-freno-disco-con-alarma-accesorios-para-motos-bicicletas/',
    '2026-10-31',
    'VERIFICADO_CON_CONDICIONES',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    'https://electrica.pe/wp-content/uploads/Candado-de-Freno-Disco-con-Alarma-Accesorios-xx.webp',
    true
) ON CONFLICT (part_key) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    precio = EXCLUDED.precio,
    imagen_url = EXCLUDED.imagen_url,
    source_url = EXCLUDED.source_url;

INSERT INTO repuestos (
    id_categoria, id_proveedor, id_marca, part_key, codigo_sku,
    nombre, descripcion, precio, precio_proveedor_pen, precio_regular_proveedor_pen,
    precio_min_pen, precio_max_pen, stock_proveedor, stock_propio_ecomoto,
    voltaje_electrico_v, capacidad_electrica_ah, source_url, source_checked_on,
    data_status, notas, imagen_url, estado
) VALUES (
    (SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = 'ELECTRICO' LIMIT 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'ELECTRICA.PE' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'GREENLINE' LIMIT 1),
    'GREENLINE-INTERRUPTOR-AUTOMATICO-DE-DOS-TOMAS-1607',
    'GRE-1607',
    'Interruptor automático de dos tomas',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    80,
    80,
    120,
    80,
    80,
    'DISPONIBLE',
    0,
    220,
    NULL,
    'https://electrica.pe/producto/interruptor-automatico-de-dos-tomas/',
    '2026-10-31',
    'VERIFICADO_CON_CONDICIONES',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    'https://electrica.pe/wp-content/uploads/INTERRUPTOR-DOS-TOMAS-3.webp',
    true
) ON CONFLICT (part_key) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    precio = EXCLUDED.precio,
    imagen_url = EXCLUDED.imagen_url,
    source_url = EXCLUDED.source_url;

INSERT INTO repuestos (
    id_categoria, id_proveedor, id_marca, part_key, codigo_sku,
    nombre, descripcion, precio, precio_proveedor_pen, precio_regular_proveedor_pen,
    precio_min_pen, precio_max_pen, stock_proveedor, stock_propio_ecomoto,
    voltaje_electrico_v, capacidad_electrica_ah, source_url, source_checked_on,
    data_status, notas, imagen_url, estado
) VALUES (
    (SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = 'BATERIA' LIMIT 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'ELECTRICA.PE' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'YADEA' LIMIT 1),
    'YADEA-BATERIA-DE-LITIO-72V73AH-FARASIS-CELDA-NMC-1601',
    'YAD-1601',
    'Batería de Litio 72V73Ah Farasis Celda NMC Tipo Pouch',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    3800,
    3800,
    4000,
    3800,
    3800,
    'DISPONIBLE',
    0,
    72,
    73,
    'https://electrica.pe/producto/bateria-de-litio-72v73ah-farasis-celda-nmc-tipo-pouch/',
    '2026-10-31',
    'VERIFICADO_CON_CONDICIONES',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    'https://electrica.pe/wp-content/uploads/Bateria-de-Litio-72V73Ah-Farasis-Celda-NMC-Tipo-Pouch-P.png',
    true
) ON CONFLICT (part_key) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    precio = EXCLUDED.precio,
    imagen_url = EXCLUDED.imagen_url,
    source_url = EXCLUDED.source_url;

INSERT INTO repuestos (
    id_categoria, id_proveedor, id_marca, part_key, codigo_sku,
    nombre, descripcion, precio, precio_proveedor_pen, precio_regular_proveedor_pen,
    precio_min_pen, precio_max_pen, stock_proveedor, stock_propio_ecomoto,
    voltaje_electrico_v, capacidad_electrica_ah, source_url, source_checked_on,
    data_status, notas, imagen_url, estado
) VALUES (
    (SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = 'BATERIA' LIMIT 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'ELECTRICA.PE' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'TAILG' LIMIT 1),
    'TAILG-BATERIA12V22AH-TAILG-6-DZF-22-PLOMO-ACIDO--1586',
    'TAI-1586',
    'Batería12V22AH TAILG 6-DZF-22 Plomo Acido con Grafeno',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    220,
    220,
    245,
    220,
    220,
    'DISPONIBLE',
    0,
    12,
    22,
    'https://electrica.pe/producto/bateria12v22ah-tailg-6-dzf-22-plomo-acido-con-grafeno/',
    '2026-10-31',
    'VERIFICADO_CON_CONDICIONES',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    'https://electrica.pe/wp-content/uploads/Bateria12V22AH-TAILG-Plomo-Acido-con-Grafeno.webp',
    true
) ON CONFLICT (part_key) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    precio = EXCLUDED.precio,
    imagen_url = EXCLUDED.imagen_url,
    source_url = EXCLUDED.source_url;

INSERT INTO repuestos (
    id_categoria, id_proveedor, id_marca, part_key, codigo_sku,
    nombre, descripcion, precio, precio_proveedor_pen, precio_regular_proveedor_pen,
    precio_min_pen, precio_max_pen, stock_proveedor, stock_propio_ecomoto,
    voltaje_electrico_v, capacidad_electrica_ah, source_url, source_checked_on,
    data_status, notas, imagen_url, estado
) VALUES (
    (SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = 'BATERIA' LIMIT 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'ELECTRICA.PE' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'YADEA' LIMIT 1),
    'YADEA-BATERIA12V23AH-TIAN-NENG-6-DZF-23-PLOMO-AC-1581',
    'YAD-1581',
    'Batería12V23AH TIAN NENG 6-DZF-23 Plomo Acido con Grafeno',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    220,
    220,
    245,
    220,
    220,
    'DISPONIBLE',
    0,
    12,
    23,
    'https://electrica.pe/producto/bateria12v23ah-tian-neng-6-dzf-23-plomo-acido-con-grafeno/',
    '2026-10-31',
    'VERIFICADO_CON_CONDICIONES',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    'https://electrica.pe/wp-content/uploads/Bateria12V23AH-TIAN-NENG-Plomo-Acido-con-Grafeno.webp',
    true
) ON CONFLICT (part_key) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    precio = EXCLUDED.precio,
    imagen_url = EXCLUDED.imagen_url,
    source_url = EXCLUDED.source_url;

INSERT INTO repuestos (
    id_categoria, id_proveedor, id_marca, part_key, codigo_sku,
    nombre, descripcion, precio, precio_proveedor_pen, precio_regular_proveedor_pen,
    precio_min_pen, precio_max_pen, stock_proveedor, stock_propio_ecomoto,
    voltaje_electrico_v, capacidad_electrica_ah, source_url, source_checked_on,
    data_status, notas, imagen_url, estado
) VALUES (
    (SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = 'ESPEJO' LIMIT 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'ELECTRICA.PE' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'TAILG' LIMIT 1),
    'TAILG-ESPEJO-ORIGINAL-TAILG-DE-8MM-1577',
    'TAI-1577',
    'Espejo Original TAILG de 8mm',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    50,
    50,
    59,
    50,
    50,
    'DISPONIBLE',
    0,
    NULL,
    NULL,
    'https://electrica.pe/producto/espejo-original-tailg-de-8mm/',
    '2026-10-31',
    'VERIFICADO_CON_CONDICIONES',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    'https://electrica.pe/wp-content/uploads/TAILG-ESPEJO-D.webp',
    true
) ON CONFLICT (part_key) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    precio = EXCLUDED.precio,
    imagen_url = EXCLUDED.imagen_url,
    source_url = EXCLUDED.source_url;

INSERT INTO repuestos (
    id_categoria, id_proveedor, id_marca, part_key, codigo_sku,
    nombre, descripcion, precio, precio_proveedor_pen, precio_regular_proveedor_pen,
    precio_min_pen, precio_max_pen, stock_proveedor, stock_propio_ecomoto,
    voltaje_electrico_v, capacidad_electrica_ah, source_url, source_checked_on,
    data_status, notas, imagen_url, estado
) VALUES (
    (SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = 'BATERIA' LIMIT 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'ELECTRICA.PE' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'YADEA' LIMIT 1),
    'YADEA-BATERIA-LITIO-EXTRAIBLE-48V24AH-GREENWAY-T-1393',
    '8866660915220915CSF-1-1-2-1',
    'Batería Litio Extraíble 48V24AH GreenWay tipo LMFP – Alta Calidad',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    1500,
    1500,
    1650,
    1500,
    1500,
    'DISPONIBLE',
    0,
    48,
    24,
    'https://electrica.pe/producto/bateria-litio-extraible-48v24ah-greenway-tipo-lmfp-alta-calidad/',
    '2026-10-31',
    'VERIFICADO_CON_CONDICIONES',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    'https://electrica.pe/wp-content/uploads/greenway-bateria-48v24ah-pack.png',
    true
) ON CONFLICT (part_key) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    precio = EXCLUDED.precio,
    imagen_url = EXCLUDED.imagen_url,
    source_url = EXCLUDED.source_url;

INSERT INTO repuestos (
    id_categoria, id_proveedor, id_marca, part_key, codigo_sku,
    nombre, descripcion, precio, precio_proveedor_pen, precio_regular_proveedor_pen,
    precio_min_pen, precio_max_pen, stock_proveedor, stock_propio_ecomoto,
    voltaje_electrico_v, capacidad_electrica_ah, source_url, source_checked_on,
    data_status, notas, imagen_url, estado
) VALUES (
    (SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = 'ELECTRICO' LIMIT 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'ELECTRICA.PE' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'YADEA' LIMIT 1),
    'YADEA-LLAVE-TERMOMAGNETICA-B63-40A-1302',
    'YAD-1302',
    'Llave Termomagnética B63 40A',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    45,
    45,
    60,
    45,
    45,
    'DISPONIBLE',
    0,
    12,
    NULL,
    'https://electrica.pe/producto/llave-termomagnetica-b63-40a/',
    '2026-10-31',
    'VERIFICADO_CON_CONDICIONES',
    'Repuesto oficial extraído de catálogo Electrica.pe.',
    'https://electrica.pe/wp-content/uploads/987517922-8.png',
    true
) ON CONFLICT (part_key) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    precio = EXCLUDED.precio,
    imagen_url = EXCLUDED.imagen_url,
    source_url = EXCLUDED.source_url;

INSERT INTO repuestos_compatibilidad (
    id_repuesto, id_modelo, compatibilidad_declarada, notas_evidencia, source_url, source_checked_on
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE part_key = 'GREENLINE-CANDADO-DE-CABLE-1-20M-1854' LIMIT 1),
    (SELECT m.id_modelo FROM modelos_moto m JOIN marcas b ON m.id_marca = b.id_marca WHERE UPPER(TRIM(b.nombre)) = 'GREENLINE' AND UPPER(TRIM(m.nombre)) = 'M6' LIMIT 1),
    'CONFIRMADA_EN_FUENTE',
    'Compatible con GreenLine M6 (60V / chasis urbano).',
    'https://electrica.pe/producto/candado-de-cable-1-20m/',
    '2026-10-31'
) ON CONFLICT (id_repuesto, id_modelo) DO NOTHING;

INSERT INTO repuestos_compatibilidad (
    id_repuesto, id_modelo, compatibilidad_declarada, notas_evidencia, source_url, source_checked_on
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE part_key = 'YADEA-12V-20AH-BATERIA-DE-PLOMO-ACIDO-1851' LIMIT 1),
    (SELECT m.id_modelo FROM modelos_moto m JOIN marcas b ON m.id_marca = b.id_marca WHERE UPPER(TRIM(b.nombre)) = 'YADEA' AND UPPER(TRIM(m.nombre)) = 'M6 PRO' LIMIT 1),
    'CONFIRMADA_EN_FUENTE',
    'Especificación técnica compatible con línea YADEA M6 / M6 Pro.',
    'https://electrica.pe/producto/12v-20ah-bateria-de-plomo-acido/',
    '2026-10-31'
) ON CONFLICT (id_repuesto, id_modelo) DO NOTHING;

INSERT INTO repuestos_compatibilidad (
    id_repuesto, id_modelo, compatibilidad_declarada, notas_evidencia, source_url, source_checked_on
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE part_key = 'YADEA-TIANNENG-12V12AH-BATERIA-DE-PLOMO-ACIDO-1849' LIMIT 1),
    (SELECT m.id_modelo FROM modelos_moto m JOIN marcas b ON m.id_marca = b.id_marca WHERE UPPER(TRIM(b.nombre)) = 'YADEA' AND UPPER(TRIM(m.nombre)) = 'M6 PRO' LIMIT 1),
    'CONFIRMADA_EN_FUENTE',
    'Especificación técnica compatible con línea YADEA M6 / M6 Pro.',
    'https://electrica.pe/producto/tianneng-12v12ah-bateria-de-plomo-acido/',
    '2026-10-31'
) ON CONFLICT (id_repuesto, id_modelo) DO NOTHING;

INSERT INTO repuestos_compatibilidad (
    id_repuesto, id_modelo, compatibilidad_declarada, notas_evidencia, source_url, source_checked_on
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE part_key = 'GREENLINE-72V-4A-CARGADOR-TAILG-1846' LIMIT 1),
    (SELECT m.id_modelo FROM modelos_moto m JOIN marcas b ON m.id_marca = b.id_marca WHERE UPPER(TRIM(b.nombre)) = 'GREENLINE' AND UPPER(TRIM(m.nombre)) = 'M6' LIMIT 1),
    'CONFIRMADA_EN_FUENTE',
    'Compatible con GreenLine M6 (60V / chasis urbano).',
    'https://electrica.pe/producto/72v-4a-cargador-tailg/',
    '2026-10-31'
) ON CONFLICT (id_repuesto, id_modelo) DO NOTHING;

INSERT INTO repuestos_compatibilidad (
    id_repuesto, id_modelo, compatibilidad_declarada, notas_evidencia, source_url, source_checked_on
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE part_key = 'GREENLINE-TIANNENG-LITIO-48V12AH-BATERIA-1843' LIMIT 1),
    (SELECT m.id_modelo FROM modelos_moto m JOIN marcas b ON m.id_marca = b.id_marca WHERE UPPER(TRIM(b.nombre)) = 'GREENLINE' AND UPPER(TRIM(m.nombre)) = 'E3' LIMIT 1),
    'CONFIRMADA_EN_FUENTE',
    'Voltaje nominal 48V y anclaje compatible con GreenLine E3 / E5.',
    'https://electrica.pe/producto/tianneng-litio-48v12ah-bateria/',
    '2026-10-31'
) ON CONFLICT (id_repuesto, id_modelo) DO NOTHING;

INSERT INTO repuestos_compatibilidad (
    id_repuesto, id_modelo, compatibilidad_declarada, notas_evidencia, source_url, source_checked_on
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE part_key = 'GREENLINE-48V24AH-BATERIA-DE-LITIO-1840' LIMIT 1),
    (SELECT m.id_modelo FROM modelos_moto m JOIN marcas b ON m.id_marca = b.id_marca WHERE UPPER(TRIM(b.nombre)) = 'GREENLINE' AND UPPER(TRIM(m.nombre)) = 'E3' LIMIT 1),
    'CONFIRMADA_EN_FUENTE',
    'Voltaje nominal 48V y anclaje compatible con GreenLine E3 / E5.',
    'https://electrica.pe/producto/48v24ah-bateria-de-litio/',
    '2026-10-31'
) ON CONFLICT (id_repuesto, id_modelo) DO NOTHING;

INSERT INTO repuestos_compatibilidad (
    id_repuesto, id_modelo, compatibilidad_declarada, notas_evidencia, source_url, source_checked_on
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE part_key = 'GREENLINE-48V20AH-BATERIA-DE-LITIO-1837' LIMIT 1),
    (SELECT m.id_modelo FROM modelos_moto m JOIN marcas b ON m.id_marca = b.id_marca WHERE UPPER(TRIM(b.nombre)) = 'GREENLINE' AND UPPER(TRIM(m.nombre)) = 'E3' LIMIT 1),
    'CONFIRMADA_EN_FUENTE',
    'Voltaje nominal 48V y anclaje compatible con GreenLine E3 / E5.',
    'https://electrica.pe/producto/48v20ah-bateria-de-litio/',
    '2026-10-31'
) ON CONFLICT (id_repuesto, id_modelo) DO NOTHING;

INSERT INTO repuestos_compatibilidad (
    id_repuesto, id_modelo, compatibilidad_declarada, notas_evidencia, source_url, source_checked_on
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE part_key = 'GREENLINE-48V16AH-BATERIA-DE-LITIO-1833' LIMIT 1),
    (SELECT m.id_modelo FROM modelos_moto m JOIN marcas b ON m.id_marca = b.id_marca WHERE UPPER(TRIM(b.nombre)) = 'GREENLINE' AND UPPER(TRIM(m.nombre)) = 'E3' LIMIT 1),
    'CONFIRMADA_EN_FUENTE',
    'Voltaje nominal 48V y anclaje compatible con GreenLine E3 / E5.',
    'https://electrica.pe/producto/48v16ah-bateria-de-litio/',
    '2026-10-31'
) ON CONFLICT (id_repuesto, id_modelo) DO NOTHING;

INSERT INTO repuestos_compatibilidad (
    id_repuesto, id_modelo, compatibilidad_declarada, notas_evidencia, source_url, source_checked_on
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE part_key = 'GREENLINE-130-70-12-LLANTA-1830' LIMIT 1),
    (SELECT m.id_modelo FROM modelos_moto m JOIN marcas b ON m.id_marca = b.id_marca WHERE UPPER(TRIM(b.nombre)) = 'GREENLINE' AND UPPER(TRIM(m.nombre)) = 'M6' LIMIT 1),
    'CONFIRMADA_EN_FUENTE',
    'Compatible con GreenLine M6 (60V / chasis urbano).',
    'https://electrica.pe/producto/130-70-12-llanta/',
    '2026-10-31'
) ON CONFLICT (id_repuesto, id_modelo) DO NOTHING;

INSERT INTO repuestos_compatibilidad (
    id_repuesto, id_modelo, compatibilidad_declarada, notas_evidencia, source_url, source_checked_on
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE part_key = 'GREENLINE-3-0-8-LLANTA-SEYOUN-1828' LIMIT 1),
    (SELECT m.id_modelo FROM modelos_moto m JOIN marcas b ON m.id_marca = b.id_marca WHERE UPPER(TRIM(b.nombre)) = 'GREENLINE' AND UPPER(TRIM(m.nombre)) = 'M6' LIMIT 1),
    'CONFIRMADA_EN_FUENTE',
    'Compatible con GreenLine M6 (60V / chasis urbano).',
    'https://electrica.pe/producto/3-0-8-llanta-seyoun/',
    '2026-10-31'
) ON CONFLICT (id_repuesto, id_modelo) DO NOTHING;

INSERT INTO repuestos_compatibilidad (
    id_repuesto, id_modelo, compatibilidad_declarada, notas_evidencia, source_url, source_checked_on
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE part_key = 'GREENLINE-120-70-11-56L-MICHELIN-1826' LIMIT 1),
    (SELECT m.id_modelo FROM modelos_moto m JOIN marcas b ON m.id_marca = b.id_marca WHERE UPPER(TRIM(b.nombre)) = 'GREENLINE' AND UPPER(TRIM(m.nombre)) = 'M6' LIMIT 1),
    'CONFIRMADA_EN_FUENTE',
    'Compatible con GreenLine M6 (60V / chasis urbano).',
    'https://electrica.pe/producto/120-70-11-56l-michelin/',
    '2026-10-31'
) ON CONFLICT (id_repuesto, id_modelo) DO NOTHING;

INSERT INTO repuestos_compatibilidad (
    id_repuesto, id_modelo, compatibilidad_declarada, notas_evidencia, source_url, source_checked_on
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE part_key = 'GREENLINE-20-1-95-LLANTA-BICICLETA-1822' LIMIT 1),
    (SELECT m.id_modelo FROM modelos_moto m JOIN marcas b ON m.id_marca = b.id_marca WHERE UPPER(TRIM(b.nombre)) = 'GREENLINE' AND UPPER(TRIM(m.nombre)) = 'M6' LIMIT 1),
    'CONFIRMADA_EN_FUENTE',
    'Compatible con GreenLine M6 (60V / chasis urbano).',
    'https://electrica.pe/producto/20-1-95-llanta-bicicleta/',
    '2026-10-31'
) ON CONFLICT (id_repuesto, id_modelo) DO NOTHING;

INSERT INTO repuestos_compatibilidad (
    id_repuesto, id_modelo, compatibilidad_declarada, notas_evidencia, source_url, source_checked_on
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE part_key = 'GREENLINE-CAMARA-DE-14-2-125-PARA-LLANTA-BICICLETA-1819' LIMIT 1),
    (SELECT m.id_modelo FROM modelos_moto m JOIN marcas b ON m.id_marca = b.id_marca WHERE UPPER(TRIM(b.nombre)) = 'GREENLINE' AND UPPER(TRIM(m.nombre)) = 'M6' LIMIT 1),
    'CONFIRMADA_EN_FUENTE',
    'Compatible con GreenLine M6 (60V / chasis urbano).',
    'https://electrica.pe/producto/camara-de-14-2-125-para-llanta-bicicleta/',
    '2026-10-31'
) ON CONFLICT (id_repuesto, id_modelo) DO NOTHING;

INSERT INTO repuestos_compatibilidad (
    id_repuesto, id_modelo, compatibilidad_declarada, notas_evidencia, source_url, source_checked_on
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE part_key = 'GREENLINE-CAMARA-DE-20-1-95-PARA-LLANTA-BICICLETA-1815' LIMIT 1),
    (SELECT m.id_modelo FROM modelos_moto m JOIN marcas b ON m.id_marca = b.id_marca WHERE UPPER(TRIM(b.nombre)) = 'GREENLINE' AND UPPER(TRIM(m.nombre)) = 'M6' LIMIT 1),
    'CONFIRMADA_EN_FUENTE',
    'Compatible con GreenLine M6 (60V / chasis urbano).',
    'https://electrica.pe/producto/camara-de-20-1-95-para-llanta-bicicleta/',
    '2026-10-31'
) ON CONFLICT (id_repuesto, id_modelo) DO NOTHING;

INSERT INTO repuestos_compatibilidad (
    id_repuesto, id_modelo, compatibilidad_declarada, notas_evidencia, source_url, source_checked_on
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE part_key = 'YADEA-TIANNENG-12V35-5AH-BATERIA-DE-PLOMO-CON-TE-1812' LIMIT 1),
    (SELECT m.id_modelo FROM modelos_moto m JOIN marcas b ON m.id_marca = b.id_marca WHERE UPPER(TRIM(b.nombre)) = 'YADEA' AND UPPER(TRIM(m.nombre)) = 'M6 PRO' LIMIT 1),
    'CONFIRMADA_EN_FUENTE',
    'Especificación técnica compatible con línea YADEA M6 / M6 Pro.',
    'https://electrica.pe/producto/tianneng-12v35-5ah-bateria-de-plomo-con-tecnologia-grafeno/',
    '2026-10-31'
) ON CONFLICT (id_repuesto, id_modelo) DO NOTHING;

INSERT INTO repuestos_compatibilidad (
    id_repuesto, id_modelo, compatibilidad_declarada, notas_evidencia, source_url, source_checked_on
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE part_key = 'GREENLINE-3-0-10-LLANTA-1808' LIMIT 1),
    (SELECT m.id_modelo FROM modelos_moto m JOIN marcas b ON m.id_marca = b.id_marca WHERE UPPER(TRIM(b.nombre)) = 'GREENLINE' AND UPPER(TRIM(m.nombre)) = 'M6' LIMIT 1),
    'CONFIRMADA_EN_FUENTE',
    'Compatible con GreenLine M6 (60V / chasis urbano).',
    'https://electrica.pe/producto/3-0-10-llanta/',
    '2026-10-31'
) ON CONFLICT (id_repuesto, id_modelo) DO NOTHING;

INSERT INTO repuestos_compatibilidad (
    id_repuesto, id_modelo, compatibilidad_declarada, notas_evidencia, source_url, source_checked_on
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE part_key = 'GREENLINE-PITON-ARO-PARA-MOTO-1805' LIMIT 1),
    (SELECT m.id_modelo FROM modelos_moto m JOIN marcas b ON m.id_marca = b.id_marca WHERE UPPER(TRIM(b.nombre)) = 'GREENLINE' AND UPPER(TRIM(m.nombre)) = 'M6' LIMIT 1),
    'CONFIRMADA_EN_FUENTE',
    'Compatible con GreenLine M6 (60V / chasis urbano).',
    'https://electrica.pe/producto/piton-aro-para-moto/',
    '2026-10-31'
) ON CONFLICT (id_repuesto, id_modelo) DO NOTHING;

INSERT INTO repuestos_compatibilidad (
    id_repuesto, id_modelo, compatibilidad_declarada, notas_evidencia, source_url, source_checked_on
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE part_key = 'YADEA-12V22-3AH-BATERIA-PLOMO-GRAFENO-1801' LIMIT 1),
    (SELECT m.id_modelo FROM modelos_moto m JOIN marcas b ON m.id_marca = b.id_marca WHERE UPPER(TRIM(b.nombre)) = 'YADEA' AND UPPER(TRIM(m.nombre)) = 'M6 PRO' LIMIT 1),
    'CONFIRMADA_EN_FUENTE',
    'Especificación técnica compatible con línea YADEA M6 / M6 Pro.',
    'https://electrica.pe/producto/12v22-3ah-bateria-plomo-grafeno/',
    '2026-10-31'
) ON CONFLICT (id_repuesto, id_modelo) DO NOTHING;

INSERT INTO repuestos_compatibilidad (
    id_repuesto, id_modelo, compatibilidad_declarada, notas_evidencia, source_url, source_checked_on
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE part_key = 'GREENLINE-ESPEJO-MOTO-VINTAGE-1795' LIMIT 1),
    (SELECT m.id_modelo FROM modelos_moto m JOIN marcas b ON m.id_marca = b.id_marca WHERE UPPER(TRIM(b.nombre)) = 'GREENLINE' AND UPPER(TRIM(m.nombre)) = 'M6' LIMIT 1),
    'CONFIRMADA_EN_FUENTE',
    'Compatible con GreenLine M6 (60V / chasis urbano).',
    'https://electrica.pe/producto/espejo-moto-vintage/',
    '2026-10-31'
) ON CONFLICT (id_repuesto, id_modelo) DO NOTHING;

INSERT INTO repuestos_compatibilidad (
    id_repuesto, id_modelo, compatibilidad_declarada, notas_evidencia, source_url, source_checked_on
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE part_key = 'GREENLINE-ESPEJO-DE-TRIMOTO-1791' LIMIT 1),
    (SELECT m.id_modelo FROM modelos_moto m JOIN marcas b ON m.id_marca = b.id_marca WHERE UPPER(TRIM(b.nombre)) = 'GREENLINE' AND UPPER(TRIM(m.nombre)) = 'M6' LIMIT 1),
    'CONFIRMADA_EN_FUENTE',
    'Compatible con GreenLine M6 (60V / chasis urbano).',
    'https://electrica.pe/producto/espejo-de-trimoto/',
    '2026-10-31'
) ON CONFLICT (id_repuesto, id_modelo) DO NOTHING;

INSERT INTO repuestos_compatibilidad (
    id_repuesto, id_modelo, compatibilidad_declarada, notas_evidencia, source_url, source_checked_on
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE part_key = 'GREENLINE-CONVERTIDOR-VOLTAJE-A-12V-1787' LIMIT 1),
    (SELECT m.id_modelo FROM modelos_moto m JOIN marcas b ON m.id_marca = b.id_marca WHERE UPPER(TRIM(b.nombre)) = 'GREENLINE' AND UPPER(TRIM(m.nombre)) = 'M6' LIMIT 1),
    'CONFIRMADA_EN_FUENTE',
    'Compatible con GreenLine M6 (60V / chasis urbano).',
    'https://electrica.pe/producto/convertidor-voltaje-a-12v/',
    '2026-10-31'
) ON CONFLICT (id_repuesto, id_modelo) DO NOTHING;

INSERT INTO repuestos_compatibilidad (
    id_repuesto, id_modelo, compatibilidad_declarada, notas_evidencia, source_url, source_checked_on
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE part_key = 'YADEA-CHAPA-DE-ENCENDIDO-VMP-1783' LIMIT 1),
    (SELECT m.id_modelo FROM modelos_moto m JOIN marcas b ON m.id_marca = b.id_marca WHERE UPPER(TRIM(b.nombre)) = 'YADEA' AND UPPER(TRIM(m.nombre)) = 'M6 PRO' LIMIT 1),
    'CONFIRMADA_EN_FUENTE',
    'Especificación técnica compatible con línea YADEA M6 / M6 Pro.',
    'https://electrica.pe/producto/chapa-de-encendido-vmp/',
    '2026-10-31'
) ON CONFLICT (id_repuesto, id_modelo) DO NOTHING;

INSERT INTO repuestos_compatibilidad (
    id_repuesto, id_modelo, compatibilidad_declarada, notas_evidencia, source_url, source_checked_on
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE part_key = 'GREENLINE-POSAPIE-COPILOTO-1779' LIMIT 1),
    (SELECT m.id_modelo FROM modelos_moto m JOIN marcas b ON m.id_marca = b.id_marca WHERE UPPER(TRIM(b.nombre)) = 'GREENLINE' AND UPPER(TRIM(m.nombre)) = 'M6' LIMIT 1),
    'CONFIRMADA_EN_FUENTE',
    'Compatible con GreenLine M6 (60V / chasis urbano).',
    'https://electrica.pe/producto/posapie-copiloto/',
    '2026-10-31'
) ON CONFLICT (id_repuesto, id_modelo) DO NOTHING;

INSERT INTO repuestos_compatibilidad (
    id_repuesto, id_modelo, compatibilidad_declarada, notas_evidencia, source_url, source_checked_on
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE part_key = 'YADEA-SUSPENSION-DELANTERA-R10-R12-1776' LIMIT 1),
    (SELECT m.id_modelo FROM modelos_moto m JOIN marcas b ON m.id_marca = b.id_marca WHERE UPPER(TRIM(b.nombre)) = 'YADEA' AND UPPER(TRIM(m.nombre)) = 'M6 PRO' LIMIT 1),
    'CONFIRMADA_EN_FUENTE',
    'Especificación técnica compatible con línea YADEA M6 / M6 Pro.',
    'https://electrica.pe/producto/suspension-delantera-r10-r12/',
    '2026-10-31'
) ON CONFLICT (id_repuesto, id_modelo) DO NOTHING;

INSERT INTO repuestos_compatibilidad (
    id_repuesto, id_modelo, compatibilidad_declarada, notas_evidencia, source_url, source_checked_on
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE part_key = 'GREENLINE-POSAPIE-DE-VMP-1772' LIMIT 1),
    (SELECT m.id_modelo FROM modelos_moto m JOIN marcas b ON m.id_marca = b.id_marca WHERE UPPER(TRIM(b.nombre)) = 'GREENLINE' AND UPPER(TRIM(m.nombre)) = 'M6' LIMIT 1),
    'CONFIRMADA_EN_FUENTE',
    'Compatible con GreenLine M6 (60V / chasis urbano).',
    'https://electrica.pe/producto/posapie-de-vmp/',
    '2026-10-31'
) ON CONFLICT (id_repuesto, id_modelo) DO NOTHING;

INSERT INTO repuestos_compatibilidad (
    id_repuesto, id_modelo, compatibilidad_declarada, notas_evidencia, source_url, source_checked_on
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE part_key = 'GREENLINE-POSAPIE-COPILOTO-MOTO-LION-1768' LIMIT 1),
    (SELECT m.id_modelo FROM modelos_moto m JOIN marcas b ON m.id_marca = b.id_marca WHERE UPPER(TRIM(b.nombre)) = 'GREENLINE' AND UPPER(TRIM(m.nombre)) = 'M6' LIMIT 1),
    'CONFIRMADA_EN_FUENTE',
    'Compatible con GreenLine M6 (60V / chasis urbano).',
    'https://electrica.pe/producto/posapie-copiloto-moto-lion/',
    '2026-10-31'
) ON CONFLICT (id_repuesto, id_modelo) DO NOTHING;

INSERT INTO repuestos_compatibilidad (
    id_repuesto, id_modelo, compatibilidad_declarada, notas_evidencia, source_url, source_checked_on
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE part_key = 'GREENLINE-MALETA-DELIVERY-VMP-1762' LIMIT 1),
    (SELECT m.id_modelo FROM modelos_moto m JOIN marcas b ON m.id_marca = b.id_marca WHERE UPPER(TRIM(b.nombre)) = 'GREENLINE' AND UPPER(TRIM(m.nombre)) = 'M6' LIMIT 1),
    'CONFIRMADA_EN_FUENTE',
    'Compatible con GreenLine M6 (60V / chasis urbano).',
    'https://electrica.pe/producto/maleta-delivery-vmp/',
    '2026-10-31'
) ON CONFLICT (id_repuesto, id_modelo) DO NOTHING;

INSERT INTO repuestos_compatibilidad (
    id_repuesto, id_modelo, compatibilidad_declarada, notas_evidencia, source_url, source_checked_on
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE part_key = 'YADEA-MOTOR-HUB-1000W-ARO-10-1758' LIMIT 1),
    (SELECT m.id_modelo FROM modelos_moto m JOIN marcas b ON m.id_marca = b.id_marca WHERE UPPER(TRIM(b.nombre)) = 'YADEA' AND UPPER(TRIM(m.nombre)) = 'M6 PRO' LIMIT 1),
    'CONFIRMADA_EN_FUENTE',
    'Especificación técnica compatible con línea YADEA M6 / M6 Pro.',
    'https://electrica.pe/producto/motor-hub-1000w-aro-10/',
    '2026-10-31'
) ON CONFLICT (id_repuesto, id_modelo) DO NOTHING;

INSERT INTO repuestos_compatibilidad (
    id_repuesto, id_modelo, compatibilidad_declarada, notas_evidencia, source_url, source_checked_on
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE part_key = 'YADEA-LLAVE-TERMOMAGNETICA-DC-40A-1754' LIMIT 1),
    (SELECT m.id_modelo FROM modelos_moto m JOIN marcas b ON m.id_marca = b.id_marca WHERE UPPER(TRIM(b.nombre)) = 'YADEA' AND UPPER(TRIM(m.nombre)) = 'M6 PRO' LIMIT 1),
    'CONFIRMADA_EN_FUENTE',
    'Especificación técnica compatible con línea YADEA M6 / M6 Pro.',
    'https://electrica.pe/producto/llave-termomagnetica-dc-40a/',
    '2026-10-31'
) ON CONFLICT (id_repuesto, id_modelo) DO NOTHING;

INSERT INTO repuestos_compatibilidad (
    id_repuesto, id_modelo, compatibilidad_declarada, notas_evidencia, source_url, source_checked_on
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE part_key = 'YADEA-AMORTIGUADOR-MONOSHOCK-MODELO-R12-MAX-1748' LIMIT 1),
    (SELECT m.id_modelo FROM modelos_moto m JOIN marcas b ON m.id_marca = b.id_marca WHERE UPPER(TRIM(b.nombre)) = 'YADEA' AND UPPER(TRIM(m.nombre)) = 'M6 PRO' LIMIT 1),
    'CONFIRMADA_EN_FUENTE',
    'Especificación técnica compatible con línea YADEA M6 / M6 Pro.',
    'https://electrica.pe/producto/amortiguador-monoshock-modelo-r12-max/',
    '2026-10-31'
) ON CONFLICT (id_repuesto, id_modelo) DO NOTHING;

INSERT INTO repuestos_compatibilidad (
    id_repuesto, id_modelo, compatibilidad_declarada, notas_evidencia, source_url, source_checked_on
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE part_key = 'GREENLINE-POWERAMP-LITIO-48V24AH-BATERIA-1743' LIMIT 1),
    (SELECT m.id_modelo FROM modelos_moto m JOIN marcas b ON m.id_marca = b.id_marca WHERE UPPER(TRIM(b.nombre)) = 'GREENLINE' AND UPPER(TRIM(m.nombre)) = 'E3' LIMIT 1),
    'CONFIRMADA_EN_FUENTE',
    'Voltaje nominal 48V y anclaje compatible con GreenLine E3 / E5.',
    'https://electrica.pe/producto/poweramp-litio-48v24ah-bateria/',
    '2026-10-31'
) ON CONFLICT (id_repuesto, id_modelo) DO NOTHING;

INSERT INTO repuestos_compatibilidad (
    id_repuesto, id_modelo, compatibilidad_declarada, notas_evidencia, source_url, source_checked_on
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE part_key = 'YADEA-TIANNENG-12V45AH-BATERIA-DE-PLOMO-ACIDO-1740' LIMIT 1),
    (SELECT m.id_modelo FROM modelos_moto m JOIN marcas b ON m.id_marca = b.id_marca WHERE UPPER(TRIM(b.nombre)) = 'YADEA' AND UPPER(TRIM(m.nombre)) = 'M6 PRO' LIMIT 1),
    'CONFIRMADA_EN_FUENTE',
    'Especificación técnica compatible con línea YADEA M6 / M6 Pro.',
    'https://electrica.pe/producto/tianneng-12v45ah-bateria-de-plomo-acido/',
    '2026-10-31'
) ON CONFLICT (id_repuesto, id_modelo) DO NOTHING;

INSERT INTO repuestos_compatibilidad (
    id_repuesto, id_modelo, compatibilidad_declarada, notas_evidencia, source_url, source_checked_on
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE part_key = 'GREENLINE-36V10-4AH-BATERIA-DE-LITIO-1734' LIMIT 1),
    (SELECT m.id_modelo FROM modelos_moto m JOIN marcas b ON m.id_marca = b.id_marca WHERE UPPER(TRIM(b.nombre)) = 'GREENLINE' AND UPPER(TRIM(m.nombre)) = 'M6' LIMIT 1),
    'CONFIRMADA_EN_FUENTE',
    'Compatible con GreenLine M6 (60V / chasis urbano).',
    'https://electrica.pe/producto/36v10-4ah-bateria-de-litio/',
    '2026-10-31'
) ON CONFLICT (id_repuesto, id_modelo) DO NOTHING;

INSERT INTO repuestos_compatibilidad (
    id_repuesto, id_modelo, compatibilidad_declarada, notas_evidencia, source_url, source_checked_on
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE part_key = 'GREENLINE-CASCO-CERTIFICADO-DOT-RNG701M-1729' LIMIT 1),
    (SELECT m.id_modelo FROM modelos_moto m JOIN marcas b ON m.id_marca = b.id_marca WHERE UPPER(TRIM(b.nombre)) = 'GREENLINE' AND UPPER(TRIM(m.nombre)) = 'M6' LIMIT 1),
    'CONFIRMADA_EN_FUENTE',
    'Compatible con GreenLine M6 (60V / chasis urbano).',
    'https://electrica.pe/producto/casco-certificado-dot-rng701m/',
    '2026-10-31'
) ON CONFLICT (id_repuesto, id_modelo) DO NOTHING;

INSERT INTO repuestos_compatibilidad (
    id_repuesto, id_modelo, compatibilidad_declarada, notas_evidencia, source_url, source_checked_on
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE part_key = 'TAILG-ESPEJO-ORIGINAL-TAILG-T7-T5-F52-1722' LIMIT 1),
    (SELECT m.id_modelo FROM modelos_moto m JOIN marcas b ON m.id_marca = b.id_marca WHERE UPPER(TRIM(b.nombre)) = 'TAILG' AND UPPER(TRIM(m.nombre)) = 'F52' LIMIT 1),
    'CONFIRMADA_EN_FUENTE',
    'Accesorio y componente original TAILG compatible con chasis F52.',
    'https://electrica.pe/producto/espejo-original-tailg-t7-t5-f52/',
    '2026-10-31'
) ON CONFLICT (id_repuesto, id_modelo) DO NOTHING;

INSERT INTO repuestos_compatibilidad (
    id_repuesto, id_modelo, compatibilidad_declarada, notas_evidencia, source_url, source_checked_on
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE part_key = 'TAILG-CANDADO-DE-FRENO-DISCO-CON-ALARMA-PARA-MOT-1712' LIMIT 1),
    (SELECT m.id_modelo FROM modelos_moto m JOIN marcas b ON m.id_marca = b.id_marca WHERE UPPER(TRIM(b.nombre)) = 'TAILG' AND UPPER(TRIM(m.nombre)) = 'F52' LIMIT 1),
    'CONFIRMADA_EN_FUENTE',
    'Accesorio y componente original TAILG compatible con chasis F52.',
    'https://electrica.pe/producto/candado-de-freno-disco-con-alarma-para-motos-bicicletas/',
    '2026-10-31'
) ON CONFLICT (id_repuesto, id_modelo) DO NOTHING;

INSERT INTO repuestos_compatibilidad (
    id_repuesto, id_modelo, compatibilidad_declarada, notas_evidencia, source_url, source_checked_on
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE part_key = 'GREENLINE-CANDADO-DE-FRENO-DISCO-PARA-MOTOS-BICICLET-1706' LIMIT 1),
    (SELECT m.id_modelo FROM modelos_moto m JOIN marcas b ON m.id_marca = b.id_marca WHERE UPPER(TRIM(b.nombre)) = 'GREENLINE' AND UPPER(TRIM(m.nombre)) = 'M6' LIMIT 1),
    'CONFIRMADA_EN_FUENTE',
    'Compatible con GreenLine M6 (60V / chasis urbano).',
    'https://electrica.pe/producto/candado-de-freno-disco-para-motos-bicicletas/',
    '2026-10-31'
) ON CONFLICT (id_repuesto, id_modelo) DO NOTHING;

INSERT INTO repuestos_compatibilidad (
    id_repuesto, id_modelo, compatibilidad_declarada, notas_evidencia, source_url, source_checked_on
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE part_key = 'TAILG-72V4A-CARGADOR-TAILG-GB42296-1694' LIMIT 1),
    (SELECT m.id_modelo FROM modelos_moto m JOIN marcas b ON m.id_marca = b.id_marca WHERE UPPER(TRIM(b.nombre)) = 'TAILG' AND UPPER(TRIM(m.nombre)) = 'F52' LIMIT 1),
    'CONFIRMADA_EN_FUENTE',
    'Accesorio y componente original TAILG compatible con chasis F52.',
    'https://electrica.pe/producto/72v4a-cargador-tailg-gb42296/',
    '2026-10-31'
) ON CONFLICT (id_repuesto, id_modelo) DO NOTHING;

INSERT INTO repuestos_compatibilidad (
    id_repuesto, id_modelo, compatibilidad_declarada, notas_evidencia, source_url, source_checked_on
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE part_key = 'TAILG-ESPEJO-ORIGINAL-TAILG-X9-A1-1689' LIMIT 1),
    (SELECT m.id_modelo FROM modelos_moto m JOIN marcas b ON m.id_marca = b.id_marca WHERE UPPER(TRIM(b.nombre)) = 'TAILG' AND UPPER(TRIM(m.nombre)) = 'F52' LIMIT 1),
    'CONFIRMADA_EN_FUENTE',
    'Accesorio y componente original TAILG compatible con chasis F52.',
    'https://electrica.pe/producto/espejo-original-tailg-x9-a1/',
    '2026-10-31'
) ON CONFLICT (id_repuesto, id_modelo) DO NOTHING;

INSERT INTO repuestos_compatibilidad (
    id_repuesto, id_modelo, compatibilidad_declarada, notas_evidencia, source_url, source_checked_on
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE part_key = 'TAILG-72V3A-CARGADOR-TAILG-GB42296-1681' LIMIT 1),
    (SELECT m.id_modelo FROM modelos_moto m JOIN marcas b ON m.id_marca = b.id_marca WHERE UPPER(TRIM(b.nombre)) = 'TAILG' AND UPPER(TRIM(m.nombre)) = 'F52' LIMIT 1),
    'CONFIRMADA_EN_FUENTE',
    'Accesorio y componente original TAILG compatible con chasis F52.',
    'https://electrica.pe/producto/72v3a-cargador-tailg-gb42296/',
    '2026-10-31'
) ON CONFLICT (id_repuesto, id_modelo) DO NOTHING;

INSERT INTO repuestos_compatibilidad (
    id_repuesto, id_modelo, compatibilidad_declarada, notas_evidencia, source_url, source_checked_on
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE part_key = 'GREENLINE-ESPEJO-GENERICO-CARCASA-COLOR-PLATA-8MM-1678' LIMIT 1),
    (SELECT m.id_modelo FROM modelos_moto m JOIN marcas b ON m.id_marca = b.id_marca WHERE UPPER(TRIM(b.nombre)) = 'GREENLINE' AND UPPER(TRIM(m.nombre)) = 'M6' LIMIT 1),
    'CONFIRMADA_EN_FUENTE',
    'Compatible con GreenLine M6 (60V / chasis urbano).',
    'https://electrica.pe/producto/espejo-generico-carcasa-color-plata-8mm/',
    '2026-10-31'
) ON CONFLICT (id_repuesto, id_modelo) DO NOTHING;

INSERT INTO repuestos_compatibilidad (
    id_repuesto, id_modelo, compatibilidad_declarada, notas_evidencia, source_url, source_checked_on
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE part_key = 'TAILG-ESPEJO-ORIGINAL-TAILG-PIONERO-GRIS-1671' LIMIT 1),
    (SELECT m.id_modelo FROM modelos_moto m JOIN marcas b ON m.id_marca = b.id_marca WHERE UPPER(TRIM(b.nombre)) = 'TAILG' AND UPPER(TRIM(m.nombre)) = 'F52' LIMIT 1),
    'CONFIRMADA_EN_FUENTE',
    'Accesorio y componente original TAILG compatible con chasis F52.',
    'https://electrica.pe/producto/espejo-original-tailg-pionero-gris/',
    '2026-10-31'
) ON CONFLICT (id_repuesto, id_modelo) DO NOTHING;

INSERT INTO repuestos_compatibilidad (
    id_repuesto, id_modelo, compatibilidad_declarada, notas_evidencia, source_url, source_checked_on
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE part_key = 'TAILG-ESPEJO-ORIGINAL-TAILG-M2-VINTAGE-1665' LIMIT 1),
    (SELECT m.id_modelo FROM modelos_moto m JOIN marcas b ON m.id_marca = b.id_marca WHERE UPPER(TRIM(b.nombre)) = 'TAILG' AND UPPER(TRIM(m.nombre)) = 'F52' LIMIT 1),
    'CONFIRMADA_EN_FUENTE',
    'Accesorio y componente original TAILG compatible con chasis F52.',
    'https://electrica.pe/producto/espejo-original-tailg-m2-vintage/',
    '2026-10-31'
) ON CONFLICT (id_repuesto, id_modelo) DO NOTHING;

INSERT INTO repuestos_compatibilidad (
    id_repuesto, id_modelo, compatibilidad_declarada, notas_evidencia, source_url, source_checked_on
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE part_key = 'YADEA-90-90-12-LLANTA-COCADA-SIN-CAMARA-DE-ARO-1-1661' LIMIT 1),
    (SELECT m.id_modelo FROM modelos_moto m JOIN marcas b ON m.id_marca = b.id_marca WHERE UPPER(TRIM(b.nombre)) = 'YADEA' AND UPPER(TRIM(m.nombre)) = 'M6 PRO' LIMIT 1),
    'CONFIRMADA_EN_FUENTE',
    'Especificación técnica compatible con línea YADEA M6 / M6 Pro.',
    'https://electrica.pe/producto/90-90-12-llanta-cocada-sin-camara-de-aro-12/',
    '2026-10-31'
) ON CONFLICT (id_repuesto, id_modelo) DO NOTHING;

INSERT INTO repuestos_compatibilidad (
    id_repuesto, id_modelo, compatibilidad_declarada, notas_evidencia, source_url, source_checked_on
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE part_key = 'GREENLINE-60V3A-CARGADOR-PUERTO-TAILG-1651' LIMIT 1),
    (SELECT m.id_modelo FROM modelos_moto m JOIN marcas b ON m.id_marca = b.id_marca WHERE UPPER(TRIM(b.nombre)) = 'GREENLINE' AND UPPER(TRIM(m.nombre)) = 'M6' LIMIT 1),
    'CONFIRMADA_EN_FUENTE',
    'Compatible con GreenLine M6 (60V / chasis urbano).',
    'https://electrica.pe/producto/60v3a-cargador-puerto-tailg/',
    '2026-10-31'
) ON CONFLICT (id_repuesto, id_modelo) DO NOTHING;

INSERT INTO repuestos_compatibilidad (
    id_repuesto, id_modelo, compatibilidad_declarada, notas_evidencia, source_url, source_checked_on
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE part_key = 'TAILG-CAJUELA-CUADRADA-1634' LIMIT 1),
    (SELECT m.id_modelo FROM modelos_moto m JOIN marcas b ON m.id_marca = b.id_marca WHERE UPPER(TRIM(b.nombre)) = 'TAILG' AND UPPER(TRIM(m.nombre)) = 'F52' LIMIT 1),
    'CONFIRMADA_EN_FUENTE',
    'Accesorio y componente original TAILG compatible con chasis F52.',
    'https://electrica.pe/producto/cajuela-cuadrada/',
    '2026-10-31'
) ON CONFLICT (id_repuesto, id_modelo) DO NOTHING;

INSERT INTO repuestos_compatibilidad (
    id_repuesto, id_modelo, compatibilidad_declarada, notas_evidencia, source_url, source_checked_on
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE part_key = 'TAILG-48V-3A-CARGADOR-BATERIA-DE-LITIO-1617' LIMIT 1),
    (SELECT m.id_modelo FROM modelos_moto m JOIN marcas b ON m.id_marca = b.id_marca WHERE UPPER(TRIM(b.nombre)) = 'TAILG' AND UPPER(TRIM(m.nombre)) = 'F52' LIMIT 1),
    'CONFIRMADA_EN_FUENTE',
    'Accesorio y componente original TAILG compatible con chasis F52.',
    'https://electrica.pe/producto/48v-3a-cargador-bateria-de-litio/',
    '2026-10-31'
) ON CONFLICT (id_repuesto, id_modelo) DO NOTHING;

INSERT INTO repuestos_compatibilidad (
    id_repuesto, id_modelo, compatibilidad_declarada, notas_evidencia, source_url, source_checked_on
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE part_key = 'TAILG-CANDADO-DE-FRENO-DISCO-CON-ALARMA-ACCESORI-1611' LIMIT 1),
    (SELECT m.id_modelo FROM modelos_moto m JOIN marcas b ON m.id_marca = b.id_marca WHERE UPPER(TRIM(b.nombre)) = 'TAILG' AND UPPER(TRIM(m.nombre)) = 'F52' LIMIT 1),
    'CONFIRMADA_EN_FUENTE',
    'Accesorio y componente original TAILG compatible con chasis F52.',
    'https://electrica.pe/producto/candado-de-freno-disco-con-alarma-accesorios-para-motos-bicicletas/',
    '2026-10-31'
) ON CONFLICT (id_repuesto, id_modelo) DO NOTHING;

INSERT INTO repuestos_compatibilidad (
    id_repuesto, id_modelo, compatibilidad_declarada, notas_evidencia, source_url, source_checked_on
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE part_key = 'GREENLINE-INTERRUPTOR-AUTOMATICO-DE-DOS-TOMAS-1607' LIMIT 1),
    (SELECT m.id_modelo FROM modelos_moto m JOIN marcas b ON m.id_marca = b.id_marca WHERE UPPER(TRIM(b.nombre)) = 'GREENLINE' AND UPPER(TRIM(m.nombre)) = 'M6' LIMIT 1),
    'CONFIRMADA_EN_FUENTE',
    'Compatible con GreenLine M6 (60V / chasis urbano).',
    'https://electrica.pe/producto/interruptor-automatico-de-dos-tomas/',
    '2026-10-31'
) ON CONFLICT (id_repuesto, id_modelo) DO NOTHING;

INSERT INTO repuestos_compatibilidad (
    id_repuesto, id_modelo, compatibilidad_declarada, notas_evidencia, source_url, source_checked_on
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE part_key = 'YADEA-BATERIA-DE-LITIO-72V73AH-FARASIS-CELDA-NMC-1601' LIMIT 1),
    (SELECT m.id_modelo FROM modelos_moto m JOIN marcas b ON m.id_marca = b.id_marca WHERE UPPER(TRIM(b.nombre)) = 'YADEA' AND UPPER(TRIM(m.nombre)) = 'E8S PRO' LIMIT 1),
    'CONFIRMADA_EN_FUENTE',
    'Voltaje 72V verificado para modelo insignia YADEA E8S Pro.',
    'https://electrica.pe/producto/bateria-de-litio-72v73ah-farasis-celda-nmc-tipo-pouch/',
    '2026-10-31'
) ON CONFLICT (id_repuesto, id_modelo) DO NOTHING;

INSERT INTO repuestos_compatibilidad (
    id_repuesto, id_modelo, compatibilidad_declarada, notas_evidencia, source_url, source_checked_on
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE part_key = 'TAILG-BATERIA12V22AH-TAILG-6-DZF-22-PLOMO-ACIDO--1586' LIMIT 1),
    (SELECT m.id_modelo FROM modelos_moto m JOIN marcas b ON m.id_marca = b.id_marca WHERE UPPER(TRIM(b.nombre)) = 'TAILG' AND UPPER(TRIM(m.nombre)) = 'F52' LIMIT 1),
    'CONFIRMADA_EN_FUENTE',
    'Accesorio y componente original TAILG compatible con chasis F52.',
    'https://electrica.pe/producto/bateria12v22ah-tailg-6-dzf-22-plomo-acido-con-grafeno/',
    '2026-10-31'
) ON CONFLICT (id_repuesto, id_modelo) DO NOTHING;

INSERT INTO repuestos_compatibilidad (
    id_repuesto, id_modelo, compatibilidad_declarada, notas_evidencia, source_url, source_checked_on
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE part_key = 'YADEA-BATERIA12V23AH-TIAN-NENG-6-DZF-23-PLOMO-AC-1581' LIMIT 1),
    (SELECT m.id_modelo FROM modelos_moto m JOIN marcas b ON m.id_marca = b.id_marca WHERE UPPER(TRIM(b.nombre)) = 'YADEA' AND UPPER(TRIM(m.nombre)) = 'M6 PRO' LIMIT 1),
    'CONFIRMADA_EN_FUENTE',
    'Especificación técnica compatible con línea YADEA M6 / M6 Pro.',
    'https://electrica.pe/producto/bateria12v23ah-tian-neng-6-dzf-23-plomo-acido-con-grafeno/',
    '2026-10-31'
) ON CONFLICT (id_repuesto, id_modelo) DO NOTHING;

INSERT INTO repuestos_compatibilidad (
    id_repuesto, id_modelo, compatibilidad_declarada, notas_evidencia, source_url, source_checked_on
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE part_key = 'TAILG-ESPEJO-ORIGINAL-TAILG-DE-8MM-1577' LIMIT 1),
    (SELECT m.id_modelo FROM modelos_moto m JOIN marcas b ON m.id_marca = b.id_marca WHERE UPPER(TRIM(b.nombre)) = 'TAILG' AND UPPER(TRIM(m.nombre)) = 'F52' LIMIT 1),
    'CONFIRMADA_EN_FUENTE',
    'Accesorio y componente original TAILG compatible con chasis F52.',
    'https://electrica.pe/producto/espejo-original-tailg-de-8mm/',
    '2026-10-31'
) ON CONFLICT (id_repuesto, id_modelo) DO NOTHING;

INSERT INTO repuestos_compatibilidad (
    id_repuesto, id_modelo, compatibilidad_declarada, notas_evidencia, source_url, source_checked_on
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE part_key = 'YADEA-BATERIA-LITIO-EXTRAIBLE-48V24AH-GREENWAY-T-1393' LIMIT 1),
    (SELECT m.id_modelo FROM modelos_moto m JOIN marcas b ON m.id_marca = b.id_marca WHERE UPPER(TRIM(b.nombre)) = 'YADEA' AND UPPER(TRIM(m.nombre)) = 'M6 PRO' LIMIT 1),
    'CONFIRMADA_EN_FUENTE',
    'Especificación técnica compatible con línea YADEA M6 / M6 Pro.',
    'https://electrica.pe/producto/bateria-litio-extraible-48v24ah-greenway-tipo-lmfp-alta-calidad/',
    '2026-10-31'
) ON CONFLICT (id_repuesto, id_modelo) DO NOTHING;

INSERT INTO repuestos_compatibilidad (
    id_repuesto, id_modelo, compatibilidad_declarada, notas_evidencia, source_url, source_checked_on
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE part_key = 'YADEA-LLAVE-TERMOMAGNETICA-B63-40A-1302' LIMIT 1),
    (SELECT m.id_modelo FROM modelos_moto m JOIN marcas b ON m.id_marca = b.id_marca WHERE UPPER(TRIM(b.nombre)) = 'YADEA' AND UPPER(TRIM(m.nombre)) = 'M6 PRO' LIMIT 1),
    'CONFIRMADA_EN_FUENTE',
    'Especificación técnica compatible con línea YADEA M6 / M6 Pro.',
    'https://electrica.pe/producto/llave-termomagnetica-b63-40a/',
    '2026-10-31'
) ON CONFLICT (id_repuesto, id_modelo) DO NOTHING;

COMMIT;
