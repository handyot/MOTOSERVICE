-- ==============================================================================
-- Migración: Ampliación de catálogo oficial CENTURY MOTORS (centurymotors.pe)
-- Archivo: supabase/migrations/20261031180000_ampliar_catalogo_century_motors.sql
-- Modelos: 16
-- Repuestos: 83
-- Compatibilidades: 83
-- ==============================================================================

BEGIN;

-- 1. Asegurar existencia de la marca CENTURY MOTORS
INSERT INTO marcas (nombre, estado)
VALUES ('CENTURY MOTORS', true)
ON CONFLICT (nombre) DO UPDATE SET estado = true;

-- 2. Asegurar existencia del proveedor
INSERT INTO proveedores (nombre, sitio_web)
VALUES ('CENTURY MOTORS Perú', 'https://centurymotors.pe')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO modelos_moto (
    id_marca, nombre, anio, voltaje_nominal_v, potencia_motor_w, imagen_url, estado
) VALUES (
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1),
    'Eléctrica de 4 Ruedas Tipo Carrito con Techo, Parabrisas y Asientos para Pasajeros',
    2026,
    60,
    1000,
    'https://centurymotors.pe/wp-content/uploads/2026/10/w1200h1200fitpad.jpg',
    true
) ON CONFLICT DO NOTHING;

INSERT INTO modelos_moto (
    id_marca, nombre, anio, voltaje_nominal_v, potencia_motor_w, imagen_url, estado
) VALUES (
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1),
    'r 1500w para moto electrica chopper Citycoco',
    2026,
    16,
    800,
    'https://centurymotors.pe/wp-content/uploads/2026/05/image_1-80.jpg',
    true
) ON CONFLICT DO NOTHING;

INSERT INTO modelos_moto (
    id_marca, nombre, anio, voltaje_nominal_v, potencia_motor_w, imagen_url, estado
) VALUES (
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1),
    'Guardabarros para Moto Electrica Chopper Citycoco',
    2026,
    60,
    1000,
    'https://centurymotors.pe/wp-content/uploads/2026/05/image_1-20.png',
    true
) ON CONFLICT DO NOTHING;

INSERT INTO modelos_moto (
    id_marca, nombre, anio, voltaje_nominal_v, potencia_motor_w, imagen_url, estado
) VALUES (
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1),
    'Trimoto Eléctrica Excelencia con techo',
    2026,
    60,
    1000,
    'https://centurymotors.pe/wp-content/uploads/2025/07/www.centurymotors.pe-4.jpg',
    true
) ON CONFLICT DO NOTHING;

INSERT INTO modelos_moto (
    id_marca, nombre, anio, voltaje_nominal_v, potencia_motor_w, imagen_url, estado
) VALUES (
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1),
    'Cuatrimoto Utilitaria Magnesium 125cc',
    2026,
    12,
    800,
    'https://centurymotors.pe/wp-content/uploads/2025/05/cuatrimoto-utilitaria-125-cc-ploma-1-scaled-1.jpg',
    true
) ON CONFLICT DO NOTHING;

INSERT INTO modelos_moto (
    id_marca, nombre, anio, voltaje_nominal_v, potencia_motor_w, imagen_url, estado
) VALUES (
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1),
    'Carrito Espacial 360° chocón a control remoto',
    2026,
    60,
    1000,
    'https://centurymotors.pe/wp-content/uploads/2025/03/image_1-85.jpg',
    true
) ON CONFLICT DO NOTHING;

INSERT INTO modelos_moto (
    id_marca, nombre, anio, voltaje_nominal_v, potencia_motor_w, imagen_url, estado
) VALUES (
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1),
    'eléctrico UNQ de 4 ruedas para personas con discapacidad',
    2026,
    24,
    800,
    'https://centurymotors.pe/wp-content/uploads/2025/03/image_36.jpg',
    true
) ON CONFLICT DO NOTHING;

INSERT INTO modelos_moto (
    id_marca, nombre, anio, voltaje_nominal_v, potencia_motor_w, imagen_url, estado
) VALUES (
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1),
    'Trimoto Doble Fila V8',
    2026,
    60,
    1000,
    'https://centurymotors.pe/wp-content/uploads/2025/03/a9f1f00c-0398-43a5-ade5-d965652e68e0.jpg',
    true
) ON CONFLICT DO NOTHING;

INSERT INTO modelos_moto (
    id_marca, nombre, anio, voltaje_nominal_v, potencia_motor_w, imagen_url, estado
) VALUES (
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1),
    'Trimoto Electrica para Adultos',
    2026,
    72,
    1200,
    'https://centurymotors.pe/wp-content/uploads/2024/11/trimoto-negra-centurymotors.pe_.jpg',
    true
) ON CONFLICT DO NOTHING;

INSERT INTO modelos_moto (
    id_marca, nombre, anio, voltaje_nominal_v, potencia_motor_w, imagen_url, estado
) VALUES (
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1),
    'Electrica Rapture TBK 10-5',
    2026,
    60,
    1000,
    'https://centurymotors.pe/wp-content/uploads/2023/05/century-motors-tbk-105-rojo.jpg',
    true
) ON CONFLICT DO NOTHING;

INSERT INTO modelos_moto (
    id_marca, nombre, anio, voltaje_nominal_v, potencia_motor_w, imagen_url, estado
) VALUES (
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1),
    'Trimoto BMW inspired',
    2026,
    60,
    1000,
    'https://centurymotors.pe/wp-content/uploads/2023/05/trimoto-a-bateria-januca-x01-blanco.jpg',
    true
) ON CONFLICT DO NOTHING;

INSERT INTO modelos_moto (
    id_marca, nombre, anio, voltaje_nominal_v, potencia_motor_w, imagen_url, estado
) VALUES (
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1),
    'Trimoto BMW Inspired BMW',
    2026,
    60,
    1000,
    'https://centurymotors.pe/wp-content/uploads/2022/10/71iCDEjLGpL._AC_SL1200_.jpg',
    true
) ON CONFLICT DO NOTHING;

INSERT INTO modelos_moto (
    id_marca, nombre, anio, voltaje_nominal_v, potencia_motor_w, imagen_url, estado
) VALUES (
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1),
    'Electrico M1 36v',
    2026,
    36,
    800,
    'https://centurymotors.pe/wp-content/uploads/2022/08/scooter-electrico-36v.jpg',
    true
) ON CONFLICT DO NOTHING;

INSERT INTO modelos_moto (
    id_marca, nombre, anio, voltaje_nominal_v, potencia_motor_w, imagen_url, estado
) VALUES (
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1),
    'Cuatrimoto Nitro 49cc',
    2026,
    60,
    1000,
    'https://centurymotors.pe/wp-content/uploads/2022/08/487123289_2852703024938376_5077274790239202149_n.jpg',
    true
) ON CONFLICT DO NOTHING;

INSERT INTO modelos_moto (
    id_marca, nombre, anio, voltaje_nominal_v, potencia_motor_w, imagen_url, estado
) VALUES (
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1),
    'de Litio modelo Matte',
    2026,
    48,
    800,
    'https://centurymotors.pe/wp-content/uploads/2022/07/bicimoto-matte.png',
    true
) ON CONFLICT DO NOTHING;

INSERT INTO modelos_moto (
    id_marca, nombre, anio, voltaje_nominal_v, potencia_motor_w, imagen_url, estado
) VALUES (
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1),
    'Electrica para niños 24v Ducati',
    2026,
    24,
    800,
    'https://centurymotors.pe/wp-content/uploads/2022/06/ducati-24v-rojo.png',
    true
) ON CONFLICT DO NOTHING;

INSERT INTO repuestos (
    id_categoria, id_proveedor, id_marca, part_key, codigo_sku,
    nombre, descripcion, precio, precio_proveedor_pen, precio_regular_proveedor_pen,
    precio_min_pen, precio_max_pen, stock_proveedor, stock_propio_ecomoto,
    voltaje_electrico_v, capacidad_electrica_ah, source_url, source_checked_on,
    data_status, notas, imagen_url, estado
) VALUES (
    COALESCE((SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = UPPER(TRIM('Motores eléctricos')) LIMIT 1), 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS PERÚ' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1),
    'CENTURYMOTORS-AVION-ELECTRICO-12V-4820',
    'CENT-4820',
    'Avión Eléctrico 12v',
    'Registrado automáticamente desde https://centurymotors.pe',
    660,
    660,
    890,
    660,
    660,
    'DISPONIBLE',
    0,
    12,
    20,
    'https://centurymotors.pe/producto/avion-electrico-12v/',
    '2026-10-31',
    'VERIFICADO_EN_FUENTE',
    'Registrado automáticamente desde https://centurymotors.pe',
    'https://centurymotors.pe/wp-content/uploads/2026/10/Avioncito-rosa-con-pequena-aviadora.png',
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
    COALESCE((SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = UPPER(TRIM('Motores eléctricos')) LIMIT 1), 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS PERÚ' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1),
    'CENTURYMOTORS-SUPER-BIKE-24V-JIEMEI-4810',
    'CENT-4810',
    'Super Bike 24v Jiemei',
    'Registrado automáticamente desde https://centurymotors.pe',
    890,
    890,
    1090,
    890,
    890,
    'DISPONIBLE',
    0,
    24,
    7,
    'https://centurymotors.pe/producto/super-bike-24v-jiemei/',
    '2026-10-31',
    'VERIFICADO_EN_FUENTE',
    'Registrado automáticamente desde https://centurymotors.pe',
    'https://centurymotors.pe/wp-content/uploads/2026/10/24V-Kids-Electric-Dirt-Bike-with-300W-Motor-16in-Wheels-Handle-Acceleration-Adjustable-Seat-Power-Display-Hand-Brakes.jpg',
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
    COALESCE((SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = UPPER(TRIM('Motores eléctricos')) LIMIT 1), 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS PERÚ' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1),
    'CENTURYMOTORS-MESA-CARPETA-DE-METAL-PARA-ESCOLARE-4781',
    'CENT-4781',
    'Mesa Carpeta de Metal para escolares',
    'Registrado automáticamente desde https://centurymotors.pe',
    220,
    220,
    290,
    220,
    220,
    'DISPONIBLE',
    0,
    60,
    20,
    'https://centurymotors.pe/producto/mesa-carpeta-de-metal-para-escolares/',
    '2026-10-31',
    'VERIFICADO_EN_FUENTE',
    'Registrado automáticamente desde https://centurymotors.pe',
    'https://centurymotors.pe/wp-content/uploads/2026/08/H5f0aef14596341cdbf7f2001d7623c9fe.jpg',
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
    COALESCE((SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = UPPER(TRIM('Motores eléctricos')) LIMIT 1), 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS PERÚ' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1),
    'CENTURYMOTORS-DODGE-RAM-2500-REBEL-DE-24-VOLTIOS--4753',
    'CENT-4753',
    'Dodge RAM 2500 Rebel de 24 voltios para niños',
    'Registrado automáticamente desde https://centurymotors.pe',
    1100,
    1100,
    1590,
    1100,
    1100,
    'DISPONIBLE',
    0,
    24,
    20,
    'https://centurymotors.pe/producto/dodge-ram-2500-rebel-de-24-voltios-para-ninos/',
    '2026-10-31',
    'VERIFICADO_EN_FUENTE',
    'Registrado automáticamente desde https://centurymotors.pe',
    'https://centurymotors.pe/wp-content/uploads/2026/06/XCS_9366.jpg',
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
    COALESCE((SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = UPPER(TRIM('Motores eléctricos')) LIMIT 1), 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS PERÚ' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1),
    'CENTURYMOTORS-SCOOTER-24V-EK8-4612',
    'CENT-4612',
    'Scooter 24v EK8',
    'Registrado automáticamente desde https://centurymotors.pe',
    710,
    710,
    890,
    710,
    710,
    'DISPONIBLE',
    0,
    24,
    5.2,
    'https://centurymotors.pe/producto/scooter-24v-ek8/',
    '2026-10-31',
    'VERIFICADO_EN_FUENTE',
    'Registrado automáticamente desde https://centurymotors.pe',
    'https://centurymotors.pe/wp-content/uploads/2026/06/image_1-2026-06-02T160733.857-scaled.jpg',
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
    COALESCE((SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = UPPER(TRIM('Motores eléctricos')) LIMIT 1), 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS PERÚ' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1),
    'CENTURYMOTORS-SCOOTER-LED-24V-4589',
    'CENT-4589',
    'Scooter Led 24v',
    'Registrado automáticamente desde https://centurymotors.pe',
    690,
    690,
    890,
    690,
    690,
    'DISPONIBLE',
    0,
    24,
    5.2,
    'https://centurymotors.pe/producto/scooter-led-24v/',
    '2026-10-31',
    'VERIFICADO_EN_FUENTE',
    'Registrado automáticamente desde https://centurymotors.pe',
    'https://centurymotors.pe/wp-content/uploads/2026/06/image_1-2026-06-03T135353.308.jpg',
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
    COALESCE((SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = UPPER(TRIM('Baterías')) LIMIT 1), 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS PERÚ' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1),
    'CENTURYMOTORS-BATERIA-PARA-SCOOTER-36V-10AH-4579',
    'CENT-4579',
    'Bateria para Scooter 36v 10Ah',
    'Registrado automáticamente desde https://centurymotors.pe',
    490,
    490,
    610,
    490,
    490,
    'DISPONIBLE',
    0,
    36,
    10,
    'https://centurymotors.pe/producto/bateria-para-scooter-36v-10ah/',
    '2026-10-31',
    'VERIFICADO_EN_FUENTE',
    'Registrado automáticamente desde https://centurymotors.pe',
    'https://centurymotors.pe/wp-content/uploads/2026/05/image_1-91.jpg',
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
    COALESCE((SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = UPPER(TRIM('Baterías')) LIMIT 1), 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS PERÚ' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1),
    'CENTURYMOTORS-BATERIA-36V-4-4AH-PARA-SMART-BALANC-4570',
    'CENT-4570',
    'Bateria 36v 4.4Ah para Smart Balance &#8211; Hoverboard',
    'Registrado automáticamente desde https://centurymotors.pe',
    280,
    280,
    390,
    280,
    280,
    'DISPONIBLE',
    0,
    36,
    4.4,
    'https://centurymotors.pe/producto/bateria-36v-4-4ah-para-smart-balance-hoverboard/',
    '2026-10-31',
    'VERIFICADO_EN_FUENTE',
    'Registrado automáticamente desde https://centurymotors.pe',
    'https://centurymotors.pe/wp-content/uploads/2026/05/image_1-2026-05-31T153523.566.jpg',
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
    COALESCE((SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = UPPER(TRIM('Motores eléctricos')) LIMIT 1), 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS PERÚ' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1),
    'CENTURYMOTORS-LLANTA-PARA-BICIMOTO-VMP-14-X-2-50-4562',
    'CENT-4562',
    'Llanta para Bicimoto VMP 14 x 2.50',
    'Registrado automáticamente desde https://centurymotors.pe',
    42,
    42,
    55,
    42,
    42,
    'DISPONIBLE',
    0,
    16,
    20,
    'https://centurymotors.pe/producto/llanta-para-bicimoto-vmp-14-x-2-50/',
    '2026-10-31',
    'VERIFICADO_EN_FUENTE',
    'Registrado automáticamente desde https://centurymotors.pe',
    'https://centurymotors.pe/wp-content/uploads/2026/05/71iwKzRbnhL._AC_SL1500_.jpg',
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
    COALESCE((SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = UPPER(TRIM('Baterías')) LIMIT 1), 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS PERÚ' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1),
    'CENTURYMOTORS-BATERIA-DE-LITIO-60V-24AH-HORIZONTA-4552',
    'CENT-4552',
    'Batería de Litio 60v 24ah horizontal para Moto Electrica Chopper Citycoco',
    'Registrado automáticamente desde https://centurymotors.pe',
    1490,
    1490,
    1890,
    1490,
    1490,
    'DISPONIBLE',
    0,
    60,
    24,
    'https://centurymotors.pe/producto/4552/',
    '2026-10-31',
    'VERIFICADO_EN_FUENTE',
    'Registrado automáticamente desde https://centurymotors.pe',
    'https://centurymotors.pe/wp-content/uploads/2026/05/image_1-86.jpg',
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
    COALESCE((SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = UPPER(TRIM('Baterías')) LIMIT 1), 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS PERÚ' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1),
    'CENTURYMOTORS-BATERIA-DE-LITIO-60V-20AH-CHILWEE-4544',
    'CENT-4544',
    'Bateria de Litio 60v 20ah Chilwee',
    'Registrado automáticamente desde https://centurymotors.pe',
    1290,
    1290,
    1450,
    1290,
    1290,
    'DISPONIBLE',
    0,
    60,
    20,
    'https://centurymotors.pe/producto/bateria-de-litio-60v-20ah-chilwee/',
    '2026-10-31',
    'VERIFICADO_EN_FUENTE',
    'Registrado automáticamente desde https://centurymotors.pe',
    'https://centurymotors.pe/wp-content/uploads/2026/05/image_1-25.png',
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
    COALESCE((SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = UPPER(TRIM('Baterías')) LIMIT 1), 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS PERÚ' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1),
    'CENTURYMOTORS-BATERIA-LIFEPO4-72V-20AH-CHILWEE-4538',
    'CENT-4538',
    'Bateria Lifepo4 72v 20ah Chilwee',
    'Registrado automáticamente desde https://centurymotors.pe',
    1490,
    1490,
    1890,
    1490,
    1490,
    'DISPONIBLE',
    0,
    72,
    20,
    'https://centurymotors.pe/producto/bateria-lifepo4-72v-20ah-chilwee/',
    '2026-10-31',
    'VERIFICADO_EN_FUENTE',
    'Registrado automáticamente desde https://centurymotors.pe',
    'https://centurymotors.pe/wp-content/uploads/2026/05/664357965_1907319133235294_8433895358544345680_n.jpg',
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
    COALESCE((SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = UPPER(TRIM('Controladores')) LIMIT 1), 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS PERÚ' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1),
    'CENTURYMOTORS-CONTROLADOR-BOTONERA-60V-LOOP-CHOPP-4518',
    'CENT-4518',
    'Controlador Botonera 60v Loop Chopper',
    'Registrado automáticamente desde https://centurymotors.pe',
    35,
    35,
    45,
    35,
    35,
    'DISPONIBLE',
    0,
    60,
    20,
    'https://centurymotors.pe/producto/controlador-botonera-60v-loop-chopper/',
    '2026-10-31',
    'VERIFICADO_EN_FUENTE',
    'Registrado automáticamente desde https://centurymotors.pe',
    'https://centurymotors.pe/wp-content/uploads/2026/05/image_1-2026-05-28T234206.764-1.jpg',
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
    COALESCE((SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = UPPER(TRIM('Baterías')) LIMIT 1), 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS PERÚ' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1),
    'CENTURYMOTORS-BATERIA-60V-24AH-MODELO-MALETA-PARA-4488',
    'CENT-4488',
    'Bateria 60v 24ah modelo maleta para moto Citycoco Chopper',
    'Registrado automáticamente desde https://centurymotors.pe',
    1350,
    1350,
    1750,
    1350,
    1350,
    'DISPONIBLE',
    0,
    60,
    24,
    'https://centurymotors.pe/producto/bateria-60v-24ah-modelo-maleta-para-moto-citycoco-chopper/',
    '2026-10-31',
    'VERIFICADO_EN_FUENTE',
    'Registrado automáticamente desde https://centurymotors.pe',
    'https://centurymotors.pe/wp-content/uploads/2026/05/454505619_1030243198726371_6949391567673916658_n.jpg',
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
    COALESCE((SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = UPPER(TRIM('Motores eléctricos')) LIMIT 1), 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS PERÚ' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1),
    'CENTURYMOTORS-MERCEDES-AMG-DRIFT-TUNNING-24V-4430',
    'CENT-4430',
    'Mercedes AMG  Drift Tunning 24v',
    'Registrado automáticamente desde https://centurymotors.pe',
    920,
    920,
    1450,
    920,
    920,
    'DISPONIBLE',
    0,
    24,
    20,
    'https://centurymotors.pe/producto/mercedes-amg-drift-tunning-24v/',
    '2026-10-31',
    'VERIFICADO_EN_FUENTE',
    'Registrado automáticamente desde https://centurymotors.pe',
    'https://centurymotors.pe/wp-content/uploads/2025/12/WhatsApp-Image-2025-11-30-at-11.49.49-AM-2.jpg',
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
    COALESCE((SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = UPPER(TRIM('Motores eléctricos')) LIMIT 1), 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS PERÚ' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1),
    'CENTURYMOTORS-MOTO-CROSS-GOGO-24V-4419',
    'CENT-4419',
    'Moto Cross Gogo 24v',
    'Registrado automáticamente desde https://centurymotors.pe',
    920,
    920,
    1350,
    920,
    920,
    'DISPONIBLE',
    0,
    24,
    5,
    'https://centurymotors.pe/producto/moto-cross-gogo-24v/',
    '2026-10-31',
    'VERIFICADO_EN_FUENTE',
    'Registrado automáticamente desde https://centurymotors.pe',
    'https://centurymotors.pe/wp-content/uploads/2025/11/onemoto-200w-electric-motorbike-24v-kids-dirt-bike-Kids-Electric-Ride-On-Motorbike-Toys-2-1.jpg',
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
    COALESCE((SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = UPPER(TRIM('Motores eléctricos')) LIMIT 1), 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS PERÚ' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1),
    'CENTURYMOTORS-MOTO-SUPER-CHOPPER-CRUISER-24V-4404',
    'CENT-4404',
    'Moto Super Chopper Cruiser  24v',
    'Registrado automáticamente desde https://centurymotors.pe',
    1250,
    1250,
    1950,
    1250,
    1250,
    'DISPONIBLE',
    0,
    24,
    20,
    'https://centurymotors.pe/producto/moto-super-chopper-cruiser-gogo-24v/',
    '2026-10-31',
    'VERIFICADO_EN_FUENTE',
    'Registrado automáticamente desde https://centurymotors.pe',
    'https://centurymotors.pe/wp-content/uploads/2025/11/981028523-2l.jpg',
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
    COALESCE((SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = UPPER(TRIM('Motores eléctricos')) LIMIT 1), 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS PERÚ' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1),
    'CENTURYMOTORS-KART-DRIFT-24V-LAMBORGHINI-4375',
    'CENT-4375',
    'Kart Drift 24v Lamborghini',
    'Registrado automáticamente desde https://centurymotors.pe',
    1290,
    1290,
    1850,
    1290,
    1290,
    'DISPONIBLE',
    0,
    24,
    14,
    'https://centurymotors.pe/producto/kart-drift-24v-lamborghini/',
    '2026-10-31',
    'VERIFICADO_EN_FUENTE',
    'Registrado automáticamente desde https://centurymotors.pe',
    'https://centurymotors.pe/wp-content/uploads/2025/10/image_1-2025-10-16T204004.586.jpg',
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
    COALESCE((SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = UPPER(TRIM('Motores eléctricos')) LIMIT 1), 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS PERÚ' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1),
    'CENTURYMOTORS-RAPTOR-UTV-RACING-24V-2026-4362',
    'CENT-4362',
    'Raptor UTV Racing 24v 2026',
    'Registrado automáticamente desde https://centurymotors.pe',
    1490,
    1490,
    1950,
    1490,
    1490,
    'DISPONIBLE',
    0,
    24,
    20,
    'https://centurymotors.pe/producto/raptor-utv-racing-24v-2026/',
    '2026-10-31',
    'VERIFICADO_EN_FUENTE',
    'Registrado automáticamente desde https://centurymotors.pe',
    'https://centurymotors.pe/wp-content/uploads/2025/10/image_1-38.jpg',
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
    COALESCE((SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = UPPER(TRIM('Motores eléctricos')) LIMIT 1), 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS PERÚ' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1),
    'CENTURYMOTORS-BOLSO-DELANTERO-DE-CARCASA-RIGIDA-D-4342',
    'CENT-4342',
    'Bolso delantero de carcasa rígida de EVA',
    'Registrado automáticamente desde https://centurymotors.pe',
    89,
    89,
    129,
    89,
    89,
    'DISPONIBLE',
    0,
    60,
    20,
    'https://centurymotors.pe/producto/bolso-delantero-de-carcasa-rigida-de-eva/',
    '2026-10-31',
    'VERIFICADO_EN_FUENTE',
    'Registrado automáticamente desde https://centurymotors.pe',
    'https://centurymotors.pe/wp-content/uploads/2025/08/image_1-2025-08-29T164639.804-1.jpg',
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
    COALESCE((SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = UPPER(TRIM('Baterías')) LIMIT 1), 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS PERÚ' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1),
    'CENTURYMOTORS-BATERIA-12V-20AH-TIANNENG-PLOMO-4335',
    'CENT-4335',
    'Batería 12v 20Ah Tianneng Plomo',
    'Registrado automáticamente desde https://centurymotors.pe',
    168,
    168,
    210,
    168,
    168,
    'DISPONIBLE',
    0,
    12,
    20,
    'https://centurymotors.pe/producto/bateria-12v-20ah-tianneng-plomo/',
    '2026-10-31',
    'VERIFICADO_EN_FUENTE',
    'Registrado automáticamente desde https://centurymotors.pe',
    'https://centurymotors.pe/wp-content/uploads/2025/08/527579370_778875294667071_2394729507726862025_n-1.jpg',
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
    COALESCE((SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = UPPER(TRIM('Motores eléctricos')) LIMIT 1), 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS PERÚ' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1),
    'CENTURYMOTORS-SILLA-MECEDORA-RECLINABLE-4326',
    'CENT-4326',
    'Silla Mecedora Reclinable',
    'Registrado automáticamente desde https://centurymotors.pe',
    190,
    190,
    250,
    190,
    190,
    'DISPONIBLE',
    0,
    60,
    20,
    'https://centurymotors.pe/producto/silla-mecedora-reclinable/',
    '2026-10-31',
    'VERIFICADO_EN_FUENTE',
    'Registrado automáticamente desde https://centurymotors.pe',
    'https://centurymotors.pe/wp-content/uploads/2025/08/WhatsApp-Image-2025-08-22-at-12.14.15-PM.jpg',
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
    COALESCE((SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = UPPER(TRIM('Baterías')) LIMIT 1), 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS PERÚ' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1),
    'CENTURYMOTORS-BATERIA-12V-25AH-TIANNENG-PLOMO-GRA-4309',
    'CENT-4309',
    'Bateria 12v 25ah Tianneng plomo grafeno aleación',
    'Registrado automáticamente desde https://centurymotors.pe',
    169,
    169,
    240,
    169,
    169,
    'DISPONIBLE',
    0,
    12,
    25,
    'https://centurymotors.pe/producto/bateria-12v-25ah-tianneng-plomo-grafeno-aleacion/',
    '2026-10-31',
    'VERIFICADO_EN_FUENTE',
    'Registrado automáticamente desde https://centurymotors.pe',
    'https://centurymotors.pe/wp-content/uploads/2025/08/image_1-2025-08-20T164151.053.jpg',
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
    COALESCE((SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = UPPER(TRIM('Baterías')) LIMIT 1), 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS PERÚ' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1),
    'CENTURYMOTORS-BATERIA-LITIO-ION-48V-20AH-CHILWEE-4294',
    'CENT-4294',
    'Bateria Litio Ion 48v 20ah Chilwee',
    'Registrado automáticamente desde https://centurymotors.pe',
    920,
    920,
    1250,
    920,
    920,
    'DISPONIBLE',
    0,
    48,
    20,
    'https://centurymotors.pe/producto/bateria-litio-ion-48v-20ah-chilwee/',
    '2026-10-31',
    'VERIFICADO_EN_FUENTE',
    'Registrado automáticamente desde https://centurymotors.pe',
    'https://centurymotors.pe/wp-content/uploads/2025/07/513742290_1376792350073252_8300465781573087065_n.jpg',
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
    COALESCE((SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = UPPER(TRIM('Baterías')) LIMIT 1), 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS PERÚ' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1),
    'CENTURYMOTORS-BATERIA-DE-LITIO-ION-48V-12AH-CHILW-4285',
    'CENT-4285',
    'Bateria de Litio Ion 48v 12Ah Chilwee',
    'Registrado automáticamente desde https://centurymotors.pe',
    750,
    750,
    920,
    750,
    750,
    'DISPONIBLE',
    0,
    48,
    12,
    'https://centurymotors.pe/producto/bateria-de-litio-ion-48v-12ah-chilwee/',
    '2026-10-31',
    'VERIFICADO_EN_FUENTE',
    'Registrado automáticamente desde https://centurymotors.pe',
    'https://centurymotors.pe/wp-content/uploads/2025/07/513558022_707048038708347_7926313068087728579_n.jpg',
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
    COALESCE((SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = UPPER(TRIM('Motores eléctricos')) LIMIT 1), 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS PERÚ' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1),
    'CENTURYMOTORS-GO-KART-LED-6V-4262',
    'CENT-4262',
    'Go Kart Led 6v',
    'Registrado automáticamente desde https://centurymotors.pe',
    185,
    185,
    290,
    185,
    185,
    'DISPONIBLE',
    0,
    60,
    20,
    'https://centurymotors.pe/producto/go-kart-led-6v/',
    '2026-10-31',
    'VERIFICADO_EN_FUENTE',
    'Registrado automáticamente desde https://centurymotors.pe',
    'https://centurymotors.pe/wp-content/uploads/2025/07/www.centurymotors.pe_.jpg',
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
    COALESCE((SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = UPPER(TRIM('Motores eléctricos')) LIMIT 1), 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS PERÚ' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1),
    'CENTURYMOTORS-GO-KART-HOLLICY-4241',
    'CENT-4241',
    'Go Kart Hollicy',
    'Registrado automáticamente desde https://centurymotors.pe',
    1350,
    1350,
    1700,
    1350,
    1350,
    'DISPONIBLE',
    0,
    12,
    20,
    'https://centurymotors.pe/producto/go-kart-hollicy/',
    '2026-10-31',
    'VERIFICADO_EN_FUENTE',
    'Registrado automáticamente desde https://centurymotors.pe',
    'https://centurymotors.pe/wp-content/uploads/2025/07/www.centurymotors.pe_.png',
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
    COALESCE((SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = UPPER(TRIM('Motores eléctricos')) LIMIT 1), 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS PERÚ' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1),
    'CENTURYMOTORS-SCOOTER-X8-MAX-4211',
    'CENT-4211',
    'Scooter X8 Max',
    'Registrado automáticamente desde https://centurymotors.pe',
    1690,
    1690,
    1990,
    1690,
    1690,
    'DISPONIBLE',
    0,
    36,
    10,
    'https://centurymotors.pe/producto/scooter-x8-max/',
    '2026-10-31',
    'VERIFICADO_EN_FUENTE',
    'Registrado automáticamente desde https://centurymotors.pe',
    'https://centurymotors.pe/wp-content/uploads/2025/06/image_33.jpg',
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
    COALESCE((SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = UPPER(TRIM('Baterías')) LIMIT 1), 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS PERÚ' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1),
    'CENTURYMOTORS-BATERIA-12V-15AH-TIANNENG-8211-PARA-4162',
    'CENT-4162',
    'Bateria 12v 15ah Tianneng &#8211; Para bicimotos de 48v',
    'Registrado automáticamente desde https://centurymotors.pe',
    150,
    150,
    195,
    150,
    150,
    'DISPONIBLE',
    0,
    12,
    15,
    'https://centurymotors.pe/producto/bateria-12v-15ah-tianneng-para-bicimotos-de-48v-pack-de-4/',
    '2026-10-31',
    'VERIFICADO_EN_FUENTE',
    'Registrado automáticamente desde https://centurymotors.pe',
    'https://centurymotors.pe/wp-content/uploads/2025/03/image_1-15.jpg',
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
    COALESCE((SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = UPPER(TRIM('Motores eléctricos')) LIMIT 1), 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS PERÚ' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1),
    'CENTURYMOTORS-CASCO-KAWAII-PARA-NINOS-4100',
    'CENT-4100',
    'Casco Kawaii para niños',
    'Registrado automáticamente desde https://centurymotors.pe',
    39,
    39,
    69,
    39,
    39,
    'DISPONIBLE',
    0,
    60,
    20,
    'https://centurymotors.pe/producto/casco-kawaii-para-ninos/',
    '2026-10-31',
    'VERIFICADO_EN_FUENTE',
    'Registrado automáticamente desde https://centurymotors.pe',
    'https://centurymotors.pe/wp-content/uploads/2025/02/image_1-49.jpg',
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
    COALESCE((SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = UPPER(TRIM('Motores eléctricos')) LIMIT 1), 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS PERÚ' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1),
    'CENTURYMOTORS-SILLA-PEREZOSA-GRAVEDAD-CERO-4083',
    'CENT-4083',
    'Silla Perezosa Gravedad Cero',
    'Registrado automáticamente desde https://centurymotors.pe',
    139,
    139,
    180,
    139,
    139,
    'DISPONIBLE',
    0,
    60,
    20,
    'https://centurymotors.pe/producto/silla-perezosa-gravedad-cero/',
    '2026-10-31',
    'VERIFICADO_EN_FUENTE',
    'Registrado automáticamente desde https://centurymotors.pe',
    'https://centurymotors.pe/wp-content/uploads/2025/02/71Z2jetEzRL._AC_SL1500_.jpg',
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
    COALESCE((SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = UPPER(TRIM('Motores eléctricos')) LIMIT 1), 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS PERÚ' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1),
    'CENTURYMOTORS-HX-X10-SCOOTER-8211-OFF-ROAD-ELECTR-4064',
    'CENT-4064',
    'HX X10 Scooter &#8211; Off Road Electric',
    'Registrado automáticamente desde https://centurymotors.pe',
    120,
    120,
    132,
    120,
    120,
    'DISPONIBLE',
    0,
    10,
    2,
    'https://centurymotors.pe/producto/hx-x10-scooter-off-road-electric/',
    '2026-10-31',
    'VERIFICADO_EN_FUENTE',
    'Registrado automáticamente desde https://centurymotors.pe',
    'https://centurymotors.pe/wp-content/uploads/2025/01/image_1-23.jpg',
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
    COALESCE((SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = UPPER(TRIM('Motores eléctricos')) LIMIT 1), 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS PERÚ' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1),
    'CENTURYMOTORS-SCOOTER-HX-X9-MAX-48V-550W-4044',
    'CENT-4044',
    'Scooter HX X9 MAX 48v 550w',
    'Registrado automáticamente desde https://centurymotors.pe',
    1990,
    1990,
    2490,
    1990,
    1990,
    'DISPONIBLE',
    0,
    48,
    6,
    'https://centurymotors.pe/producto/scooter-hx-x9-max-48v-550w/',
    '2026-10-31',
    'VERIFICADO_EN_FUENTE',
    'Registrado automáticamente desde https://centurymotors.pe',
    'https://centurymotors.pe/wp-content/uploads/2025/01/image_32.jpg',
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
    COALESCE((SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = UPPER(TRIM('Controladores')) LIMIT 1), 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS PERÚ' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1),
    'CENTURYMOTORS-CONTROLADOR-60V-2000W-SS12-YTC-25-4042',
    'CENT-4042',
    'Controlador 60V 2000w  SS12 YTC-25',
    'Registrado automáticamente desde https://centurymotors.pe',
    190,
    190,
    230,
    190,
    190,
    'DISPONIBLE',
    0,
    60,
    20,
    'https://centurymotors.pe/producto/controlador-60v-2000w-ss12-ytc-25/',
    '2026-10-31',
    'VERIFICADO_EN_FUENTE',
    'Registrado automáticamente desde https://centurymotors.pe',
    'https://centurymotors.pe/wp-content/uploads/2025/01/image_1-2.jpg',
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
    COALESCE((SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = UPPER(TRIM('Motores eléctricos')) LIMIT 1), 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS PERÚ' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1),
    'CENTURYMOTORS-TRICICLO-DINO-4018',
    'CENT-4018',
    'Triciclo Dino',
    'Registrado automáticamente desde https://centurymotors.pe',
    149,
    149,
    195,
    149,
    149,
    'DISPONIBLE',
    0,
    60,
    20,
    'https://centurymotors.pe/producto/triciclo-dino/',
    '2026-10-31',
    'VERIFICADO_EN_FUENTE',
    'Registrado automáticamente desde https://centurymotors.pe',
    'https://centurymotors.pe/wp-content/uploads/2025/01/H5fc055f554b042e3bc6bc750c95c541aU.jpg',
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
    COALESCE((SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = UPPER(TRIM('Motores eléctricos')) LIMIT 1), 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS PERÚ' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1),
    'CENTURYMOTORS-MERCEDES-BENZ-VINTAGE-2024-3965',
    'CENT-3965',
    'Mercedes Benz Vintage 2024',
    'Registrado automáticamente desde https://centurymotors.pe',
    550,
    550,
    750,
    550,
    550,
    'DISPONIBLE',
    0,
    12,
    20,
    'https://centurymotors.pe/producto/mercedes-benz-vintage-2024/',
    '2026-10-31',
    'VERIFICADO_EN_FUENTE',
    'Registrado automáticamente desde https://centurymotors.pe',
    'https://centurymotors.pe/wp-content/uploads/2024/10/H4fe3683ec30c4a7b834ae503896723a5V.jpg',
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
    COALESCE((SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = UPPER(TRIM('Motores eléctricos')) LIMIT 1), 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS PERÚ' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1),
    'CENTURYMOTORS-MOTOR-36V-PARA-SCOOTERS-XIAOMI-3950',
    'CENT-3950',
    'Motor 36v para Scooters Xiaomi',
    'Registrado automáticamente desde https://centurymotors.pe',
    350,
    350,
    420,
    350,
    350,
    'DISPONIBLE',
    0,
    36,
    20,
    'https://centurymotors.pe/producto/motor-36v-para-scooters-xiaomi/',
    '2026-10-31',
    'VERIFICADO_EN_FUENTE',
    'Registrado automáticamente desde https://centurymotors.pe',
    'https://centurymotors.pe/wp-content/uploads/2024/08/D_NQ_NP_2X_684866-MPE69949211041_062023-F.jpg',
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
    COALESCE((SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = UPPER(TRIM('Motores eléctricos')) LIMIT 1), 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS PERÚ' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1),
    'CENTURYMOTORS-MOTOCARGA-ELECTRICA-1500W-XL-3930',
    'CENT-3930',
    'Motocarga Eléctrica 1500W XL',
    'Registrado automáticamente desde https://centurymotors.pe',
    8200,
    8200,
    9600,
    8200,
    8200,
    'DISPONIBLE',
    0,
    72,
    50,
    'https://centurymotors.pe/producto/motocarga-electrica-1500w-xl/',
    '2026-10-31',
    'VERIFICADO_EN_FUENTE',
    'Registrado automáticamente desde https://centurymotors.pe',
    'https://centurymotors.pe/wp-content/uploads/2024/04/cf06d271-9300-4474-8d00-c613e7a12473.jpg',
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
    COALESCE((SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = UPPER(TRIM('Motores eléctricos')) LIMIT 1), 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS PERÚ' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1),
    'CENTURYMOTORS-SUPER73-S1-BIKE-3913',
    'CENT-3913',
    'SUPER73-S1 Bike',
    'Registrado automáticamente desde https://centurymotors.pe',
    4600,
    4600,
    6200,
    4600,
    4600,
    'DISPONIBLE',
    0,
    500,
    10,
    'https://centurymotors.pe/producto/super73-s1-bike/',
    '2026-10-31',
    'VERIFICADO_EN_FUENTE',
    'Registrado automáticamente desde https://centurymotors.pe',
    'https://centurymotors.pe/wp-content/uploads/2024/04/super73-s1-e-bike.jpg',
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
    COALESCE((SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = UPPER(TRIM('Motores eléctricos')) LIMIT 1), 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS PERÚ' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1),
    'CENTURYMOTORS-SCOOTER-MICROGO-M5-3831',
    'CENT-3831',
    'Scooter MicroGo M5',
    'Registrado automáticamente desde https://centurymotors.pe',
    1190,
    1190,
    1590,
    1190,
    1190,
    'DISPONIBLE',
    0,
    36,
    7.5,
    'https://centurymotors.pe/producto/scooter-microgo-m5/',
    '2026-10-31',
    'VERIFICADO_EN_FUENTE',
    'Registrado automáticamente desde https://centurymotors.pe',
    'https://centurymotors.pe/wp-content/uploads/2023/11/71xVy-UUl9L._AC_SL1500_.jpg',
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
    COALESCE((SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = UPPER(TRIM('Motores eléctricos')) LIMIT 1), 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS PERÚ' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1),
    'CENTURYMOTORS-TRUCK-MINERO12V-3820',
    'CENT-3820',
    'Truck Minero12V',
    'Registrado automáticamente desde https://centurymotors.pe',
    850,
    850,
    1400,
    850,
    850,
    'DISPONIBLE',
    0,
    12,
    7,
    'https://centurymotors.pe/producto/truck-minero12v/',
    '2026-10-31',
    'VERIFICADO_EN_FUENTE',
    'Registrado automáticamente desde https://centurymotors.pe',
    'https://centurymotors.pe/wp-content/uploads/2023/11/tractor-2-1.jpg',
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
    COALESCE((SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = UPPER(TRIM('Motores eléctricos')) LIMIT 1), 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS PERÚ' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1),
    'CENTURYMOTORS-UTV-2023-ARENERO-TERRAIN-3739',
    'CENT-3739',
    'UTV 2023 Arenero Terrain',
    'Registrado automáticamente desde https://centurymotors.pe',
    1490,
    1490,
    2200,
    1490,
    1490,
    'DISPONIBLE',
    0,
    24,
    7,
    'https://centurymotors.pe/producto/utv-2023-arenero-terrain/',
    '2026-10-31',
    'VERIFICADO_EN_FUENTE',
    'Registrado automáticamente desde https://centurymotors.pe',
    'https://centurymotors.pe/wp-content/uploads/2022/12/Hdd21db97b9ea4784b5ca1b476322442cE.jpg_960x960.jpg',
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
    COALESCE((SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = UPPER(TRIM('Motores eléctricos')) LIMIT 1), 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS PERÚ' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1),
    'CENTURYMOTORS-TOYOTA-ALPHARD-12V-3718',
    'CENT-3718',
    'Toyota Alphard 12v',
    'Registrado automáticamente desde https://centurymotors.pe',
    820,
    820,
    1490,
    820,
    820,
    'DISPONIBLE',
    0,
    12,
    20,
    'https://centurymotors.pe/producto/toyota-alphard-12v/',
    '2026-10-31',
    'VERIFICADO_EN_FUENTE',
    'Registrado automáticamente desde https://centurymotors.pe',
    'https://centurymotors.pe/wp-content/uploads/2022/11/2022-New-Model-Boyi-Factory-988-12V-4-Motors-Big-Kids-Children-Battery-Electric-Toy-Driving-Car-2.jpg',
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
    COALESCE((SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = UPPER(TRIM('Motores eléctricos')) LIMIT 1), 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS PERÚ' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1),
    'CENTURYMOTORS-MCLAREN-F1-KART-24V-DRIFT-3623',
    'CENT-3623',
    'McLaren F1 Kart 24v Drift',
    'Registrado automáticamente desde https://centurymotors.pe',
    1350,
    1350,
    1950,
    1350,
    1350,
    'DISPONIBLE',
    0,
    24,
    10,
    'https://centurymotors.pe/producto/mclaren-f1-kart-24v-drift/',
    '2026-10-31',
    'VERIFICADO_EN_FUENTE',
    'Registrado automáticamente desde https://centurymotors.pe',
    'https://centurymotors.pe/wp-content/uploads/2022/11/716m5OI9oUL._AC_SL1500_.jpg',
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
    COALESCE((SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = UPPER(TRIM('Motores eléctricos')) LIMIT 1), 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS PERÚ' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1),
    'CENTURYMOTORS-COCHE-BOLINA-GAMA-ALTA-3584',
    'CENT-3584',
    'Coche Bolina Gama Alta',
    'Registrado automáticamente desde https://centurymotors.pe',
    850,
    850,
    1250,
    850,
    850,
    'DISPONIBLE',
    0,
    60,
    20,
    'https://centurymotors.pe/producto/coche-bolina-gama-alta/',
    '2026-10-31',
    'VERIFICADO_EN_FUENTE',
    'Registrado automáticamente desde https://centurymotors.pe',
    'https://centurymotors.pe/wp-content/uploads/2022/11/Copia-de-Copia-de-Copia-de-tr-1.png',
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
    COALESCE((SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = UPPER(TRIM('Motores eléctricos')) LIMIT 1), 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS PERÚ' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1),
    'CENTURYMOTORS-MAVERICK-X3-CAN-AM-24-VOLTIOS-3544',
    'CENT-3544',
    'Maverick X3 Can-am 24 Voltios',
    'Registrado automáticamente desde https://centurymotors.pe',
    2590,
    2590,
    3250,
    2590,
    2590,
    'DISPONIBLE',
    0,
    24,
    14,
    'https://centurymotors.pe/producto/maverick-x3-can-am-24-voltios/',
    '2026-10-31',
    'VERIFICADO_EN_FUENTE',
    'Registrado automáticamente desde https://centurymotors.pe',
    'https://centurymotors.pe/wp-content/uploads/2022/10/web-maverick.jpg',
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
    COALESCE((SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = UPPER(TRIM('Motores eléctricos')) LIMIT 1), 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS PERÚ' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1),
    'CENTURYMOTORS-SCOOTER-LINEAL-SHOVIT-3483',
    'CENT-3483',
    'Scooter Lineal Shovit',
    'Registrado automáticamente desde https://centurymotors.pe',
    390,
    390,
    450,
    390,
    390,
    'DISPONIBLE',
    0,
    60,
    20,
    'https://centurymotors.pe/producto/scooter-lineal-shovit/',
    '2026-10-31',
    'VERIFICADO_EN_FUENTE',
    'Registrado automáticamente desde https://centurymotors.pe',
    'https://centurymotors.pe/wp-content/uploads/2022/10/Scooter-Plegable-Patin2.jpg',
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
    COALESCE((SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = UPPER(TRIM('Motores eléctricos')) LIMIT 1), 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS PERÚ' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1),
    'CENTURYMOTORS-EXCAVADORA-VOLVO-3467',
    'CENT-3467',
    'Excavadora Volvo',
    'Registrado automáticamente desde https://centurymotors.pe',
    1390,
    1390,
    2300,
    1390,
    1390,
    'DISPONIBLE',
    0,
    12,
    14,
    'https://centurymotors.pe/producto/excavadora-volvo/',
    '2026-10-31',
    'VERIFICADO_EN_FUENTE',
    'Registrado automáticamente desde https://centurymotors.pe',
    'https://centurymotors.pe/wp-content/uploads/2022/09/H5ab1d42a1686424b9ab4a0bdf326c836O.jpg',
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
    COALESCE((SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = UPPER(TRIM('Baterías')) LIMIT 1), 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS PERÚ' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1),
    'CENTURYMOTORS-BATERIA-DE-36V-7-8AH-LITIO-PARA-SCO-3461',
    'CENT-3461',
    'Bateria de 36v 7.8ah Litio para Scooter tipo Xiaomi M365',
    'Registrado automáticamente desde https://centurymotors.pe',
    329,
    329,
    380,
    329,
    329,
    'DISPONIBLE',
    0,
    36,
    7.8,
    'https://centurymotors.pe/producto/bateria-de-36v-7-8ah-litio-para-scooter-tipo-xiaomi-m365/',
    '2026-10-31',
    'VERIFICADO_EN_FUENTE',
    'Registrado automáticamente desde https://centurymotors.pe',
    'https://centurymotors.pe/wp-content/uploads/2022/09/H00a4d4123ee949e9ae8ac06fd23be9411.jpg',
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
    COALESCE((SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = UPPER(TRIM('Baterías')) LIMIT 1), 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS PERÚ' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1),
    'CENTURYMOTORS-BATERIA-60V-16AH-MALETA-VERTICAL-3451',
    'CENT-3451',
    'Bateria 60v 16ah Maleta (Vertical)',
    'Registrado automáticamente desde https://centurymotors.pe',
    990,
    990,
    1190,
    990,
    990,
    'DISPONIBLE',
    0,
    60,
    16,
    'https://centurymotors.pe/producto/bateria-60v-16ah-maleta-vertical/',
    '2026-10-31',
    'VERIFICADO_EN_FUENTE',
    'Registrado automáticamente desde https://centurymotors.pe',
    'https://centurymotors.pe/wp-content/uploads/2022/09/298294528_1984278621962706_3475201095668243621_n.jpg',
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
    COALESCE((SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = UPPER(TRIM('Baterías')) LIMIT 1), 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS PERÚ' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1),
    'CENTURYMOTORS-BATERIA-DE-LITIO-20AH-DE-PISO-HORIZ-3442',
    'CENT-3442',
    'Bateria de Litio 20Ah de piso (Horizontal)',
    'Registrado automáticamente desde https://centurymotors.pe',
    1580,
    1580,
    1750,
    1580,
    1580,
    'DISPONIBLE',
    0,
    60,
    20,
    'https://centurymotors.pe/producto/bateria-de-litio-20ah-de-piso-horizontal/',
    '2026-10-31',
    'VERIFICADO_EN_FUENTE',
    'Registrado automáticamente desde https://centurymotors.pe',
    'https://centurymotors.pe/wp-content/uploads/2022/09/298467007_4864125893692755_3656167639756867302_n.jpg',
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
    COALESCE((SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = UPPER(TRIM('Baterías')) LIMIT 1), 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS PERÚ' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1),
    'CENTURYMOTORS-BATERIA-60V-20AH-MALETA-VERTICAL-3434',
    'CENT-3434',
    'Bateria 60v 20ah Maleta (Vertical)',
    'Registrado automáticamente desde https://centurymotors.pe',
    1390,
    1390,
    1890,
    1390,
    1390,
    'DISPONIBLE',
    0,
    60,
    20,
    'https://centurymotors.pe/producto/bateria-60v-20ah-maleta-vertical/',
    '2026-10-31',
    'VERIFICADO_EN_FUENTE',
    'Registrado automáticamente desde https://centurymotors.pe',
    'https://centurymotors.pe/wp-content/uploads/2022/09/bateria-de-litio-60v-20ah-maleta-red.jpg',
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
    COALESCE((SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = UPPER(TRIM('Controladores')) LIMIT 1), 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS PERÚ' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1),
    'CENTURYMOTORS-CONTROLADOR-60V-2000W-3426',
    'CENT-3426',
    'Controlador 60v 2000w',
    'Registrado automáticamente desde https://centurymotors.pe',
    180,
    180,
    280,
    180,
    180,
    'DISPONIBLE',
    0,
    60,
    20,
    'https://centurymotors.pe/producto/controlador-60v-2000w/',
    '2026-10-31',
    'VERIFICADO_EN_FUENTE',
    'Registrado automáticamente desde https://centurymotors.pe',
    'https://centurymotors.pe/wp-content/uploads/2022/09/298525260_1408256519671390_2857251968738267585_n-scaled.jpg',
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
    COALESCE((SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = UPPER(TRIM('Controladores')) LIMIT 1), 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS PERÚ' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1),
    'CENTURYMOTORS-CONTROLADOR-60V-1500W-PARA-CITYCOCO-3409',
    'CENT-3409',
    'Controlador 60v 1500w para Citycoco',
    'Registrado automáticamente desde https://centurymotors.pe',
    170,
    170,
    280,
    170,
    170,
    'DISPONIBLE',
    0,
    60,
    20,
    'https://centurymotors.pe/producto/controlador-60v-1500w-para-citycoco/',
    '2026-10-31',
    'VERIFICADO_EN_FUENTE',
    'Registrado automáticamente desde https://centurymotors.pe',
    'https://centurymotors.pe/wp-content/uploads/2022/09/298567027_3390877941199164_5653578506951289474_n-scaled.jpg',
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
    COALESCE((SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = UPPER(TRIM('Controladores')) LIMIT 1), 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS PERÚ' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1),
    'CENTURYMOTORS-CONTROLADOR-BICIMOTO-48V-350W-3395',
    'CENT-3395',
    'Controlador Bicimoto 48v 350w',
    'Registrado automáticamente desde https://centurymotors.pe',
    120,
    120,
    180,
    120,
    120,
    'DISPONIBLE',
    0,
    48,
    20,
    'https://centurymotors.pe/producto/controlador-bicimoto-48v-350w/',
    '2026-10-31',
    'VERIFICADO_EN_FUENTE',
    'Registrado automáticamente desde https://centurymotors.pe',
    'https://centurymotors.pe/wp-content/uploads/2022/09/High-Quality-36V-48V-350W-BLDC-Motor-Controller-for-Electric-Bicycle-and-Scooter.jpg',
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
    COALESCE((SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = UPPER(TRIM('Baterías')) LIMIT 1), 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS PERÚ' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1),
    'CENTURYMOTORS-BATERIA-GEL-NARADA-12V-12AH-3392',
    'CENT-3392',
    'Bateria Gel Narada 12v 12Ah',
    'Registrado automáticamente desde https://centurymotors.pe',
    130,
    130,
    190,
    130,
    130,
    'DISPONIBLE',
    0,
    12,
    12,
    'https://centurymotors.pe/producto/bateria-gel-narada-12v-12ah/',
    '2026-10-31',
    'VERIFICADO_EN_FUENTE',
    'Registrado automáticamente desde https://centurymotors.pe',
    'https://centurymotors.pe/wp-content/uploads/2022/09/6743094d-3169-4ddc-b8da-52d1ac20521a-1.jpg',
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
    COALESCE((SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = UPPER(TRIM('Baterías')) LIMIT 1), 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS PERÚ' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1),
    'CENTURYMOTORS-BATERIA-GEL-NARADA-12V-20AH-3381',
    'CENT-3381',
    'Bateria Gel Narada 12v 20Ah',
    'Registrado automáticamente desde https://centurymotors.pe',
    195,
    195,
    250,
    195,
    195,
    'DISPONIBLE',
    0,
    12,
    20,
    'https://centurymotors.pe/producto/bateria-gel-narada12v-20ah/',
    '2026-10-31',
    'VERIFICADO_EN_FUENTE',
    'Registrado automáticamente desde https://centurymotors.pe',
    'https://centurymotors.pe/wp-content/uploads/2022/09/bateria-60v-20ah-narada-1.png',
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
    COALESCE((SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = UPPER(TRIM('Motores eléctricos')) LIMIT 1), 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS PERÚ' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1),
    'CENTURYMOTORS-UTV-CLASH-24V-4-215-4-3319',
    'CENT-3319',
    'UTV CLASH 24v 4&#215;4',
    'Registrado automáticamente desde https://centurymotors.pe',
    2490,
    2490,
    2950,
    2490,
    2490,
    'DISPONIBLE',
    0,
    24,
    20,
    'https://centurymotors.pe/producto/utv-clash-24v-4x4/',
    '2026-10-31',
    'VERIFICADO_EN_FUENTE',
    'Registrado automáticamente desde https://centurymotors.pe',
    'https://centurymotors.pe/wp-content/uploads/2022/08/8ba66722-61a9-47d3-8bab-dfa8f5b8679f.fdf12e27fd1d76f15535cf3900be703a.jpg',
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
    COALESCE((SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = UPPER(TRIM('Motores eléctricos')) LIMIT 1), 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS PERÚ' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1),
    'CENTURYMOTORS-ARENERO-UTV-RAPTOR-3296',
    'CENT-3296',
    'Arenero UTV Raptor',
    'Registrado automáticamente desde https://centurymotors.pe',
    1450,
    1450,
    2350,
    1450,
    1450,
    'DISPONIBLE',
    0,
    12,
    20,
    'https://centurymotors.pe/producto/arenero-utv-raptor/',
    '2026-10-31',
    'VERIFICADO_EN_FUENTE',
    'Registrado automáticamente desde https://centurymotors.pe',
    'https://centurymotors.pe/wp-content/uploads/2022/08/megastar_sport_edition_2_seater_12v_green_buggy_utv_style_kids_electric_rideon_car.jpg',
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
    COALESCE((SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = UPPER(TRIM('Motores eléctricos')) LIMIT 1), 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS PERÚ' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1),
    'CENTURYMOTORS-FORD-RANGER-GO-KART-ELECTRICO-3252',
    'CENT-3252',
    'Ford Ranger Go Kart Electrico',
    'Registrado automáticamente desde https://centurymotors.pe',
    790,
    790,
    1390,
    790,
    790,
    'DISPONIBLE',
    0,
    12,
    7,
    'https://centurymotors.pe/producto/ford-ranger-go-kart-electrico/',
    '2026-10-31',
    'VERIFICADO_EN_FUENTE',
    'Registrado automáticamente desde https://centurymotors.pe',
    'https://centurymotors.pe/wp-content/uploads/2022/08/HTB1F2soXyrxK1RkHFCc763QCVXac.png',
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
    COALESCE((SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = UPPER(TRIM('Motores eléctricos')) LIMIT 1), 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS PERÚ' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1),
    'CENTURYMOTORS-ARENERO-TERRAIN-4-215-4-VOLTAGE-3231',
    'CENT-3231',
    'Arenero Terrain 4&#215;4 Voltage',
    'Registrado automáticamente desde https://centurymotors.pe',
    1090,
    1090,
    2490,
    1090,
    1090,
    'DISPONIBLE',
    0,
    12,
    12,
    'https://centurymotors.pe/producto/arenero-terrain-4x4/',
    '2026-10-31',
    'VERIFICADO_EN_FUENTE',
    'Registrado automáticamente desde https://centurymotors.pe',
    'https://centurymotors.pe/wp-content/uploads/2022/08/H36ea87cfdd9d4efeb65036969b221d3cQ.jpg',
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
    COALESCE((SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = UPPER(TRIM('Motores eléctricos')) LIMIT 1), 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS PERÚ' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1),
    'CENTURYMOTORS-MESA-DELUXE-DOUX-BEBE-3190',
    'CENT-3190',
    'Mesa Deluxe Doux Bebé',
    'Registrado automáticamente desde https://centurymotors.pe',
    395,
    395,
    490,
    395,
    395,
    'DISPONIBLE',
    0,
    60,
    20,
    'https://centurymotors.pe/producto/mesa-deluxe-doux-bebe/',
    '2026-10-31',
    'VERIFICADO_EN_FUENTE',
    'Registrado automáticamente desde https://centurymotors.pe',
    'https://centurymotors.pe/wp-content/uploads/2022/07/1337129_20200823054228_5528_600x600.jpg',
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
    COALESCE((SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = UPPER(TRIM('Motores eléctricos')) LIMIT 1), 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS PERÚ' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1),
    'CENTURYMOTORS-FERRARI-TRIBUTO-8-12V-3161',
    'CENT-3161',
    'Ferrari Tributo 8 12v',
    'Registrado automáticamente desde https://centurymotors.pe',
    690,
    690,
    900,
    690,
    690,
    'DISPONIBLE',
    0,
    12,
    4.5,
    'https://centurymotors.pe/producto/ferrari-tributo-8-12v/',
    '2026-10-31',
    'VERIFICADO_EN_FUENTE',
    'Registrado automáticamente desde https://centurymotors.pe',
    'https://centurymotors.pe/wp-content/uploads/2022/07/Copia-de-Copia-de-tr-4-1.png',
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
    COALESCE((SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = UPPER(TRIM('Motores eléctricos')) LIMIT 1), 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS PERÚ' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1),
    'CENTURYMOTORS-MCLAREN-GT-12V-LICENCIADO-3135',
    'CENT-3135',
    'McLaren GT 12v Licenciado',
    'Registrado automáticamente desde https://centurymotors.pe',
    750,
    750,
    1590,
    750,
    750,
    'DISPONIBLE',
    0,
    12,
    10,
    'https://centurymotors.pe/producto/mclaren-gt-12v-licenciado/',
    '2026-10-31',
    'VERIFICADO_EN_FUENTE',
    'Registrado automáticamente desde https://centurymotors.pe',
    'https://centurymotors.pe/wp-content/uploads/2022/07/Hba25f5fe7f5d4486847dafdfc7b5208cM.jpg',
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
    COALESCE((SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = UPPER(TRIM('Motores eléctricos')) LIMIT 1), 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS PERÚ' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1),
    'CENTURYMOTORS-MINITRIKE-PREMIUM-3121',
    'CENT-3121',
    'Minitrike Premium',
    'Registrado automáticamente desde https://centurymotors.pe',
    190,
    190,
    450,
    190,
    190,
    'DISPONIBLE',
    0,
    60,
    20,
    'https://centurymotors.pe/producto/minitrike-premium/',
    '2026-10-31',
    'VERIFICADO_EN_FUENTE',
    'Registrado automáticamente desde https://centurymotors.pe',
    'https://centurymotors.pe/wp-content/uploads/2022/07/Ha8c1bb63788e4d3596e0d9a207744618D.jpg',
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
    COALESCE((SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = UPPER(TRIM('Motores eléctricos')) LIMIT 1), 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS PERÚ' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1),
    'CENTURYMOTORS-MESA-ESCRITORIO-OSITO-3108',
    'CENT-3108',
    'Mesa Escritorio Osito',
    'Registrado automáticamente desde https://centurymotors.pe',
    340,
    340,
    470,
    340,
    340,
    'DISPONIBLE',
    0,
    60,
    20,
    'https://centurymotors.pe/producto/mesa-escritorio-osito/',
    '2026-10-31',
    'VERIFICADO_EN_FUENTE',
    'Registrado automáticamente desde https://centurymotors.pe',
    'https://centurymotors.pe/wp-content/uploads/2022/07/s-l1600.jpg',
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
    COALESCE((SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = UPPER(TRIM('Motores eléctricos')) LIMIT 1), 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS PERÚ' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1),
    'CENTURYMOTORS-MESA-ESCRITORIO-PARA-NINOS-9040-3083',
    'CENT-3083',
    'Mesa Escritorio para niños 9040',
    'Registrado automáticamente desde https://centurymotors.pe',
    249,
    249,
    350,
    249,
    249,
    'DISPONIBLE',
    0,
    60,
    20,
    'https://centurymotors.pe/producto/mesa-escritorio-para-ninos-9040/',
    '2026-10-31',
    'VERIFICADO_EN_FUENTE',
    'Registrado automáticamente desde https://centurymotors.pe',
    'https://centurymotors.pe/wp-content/uploads/2022/07/H83df4740e250496e857c6c1a9kk09934f18.jpg',
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
    COALESCE((SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = UPPER(TRIM('Motores eléctricos')) LIMIT 1), 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS PERÚ' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1),
    'CENTURYMOTORS-MERCEDES-BENZ-GLE-63-LICENCIADO-3066',
    'CENT-3066',
    'Mercedes Benz GLE 63 Licenciado',
    'Registrado automáticamente desde https://centurymotors.pe',
    339,
    339,
    420,
    339,
    339,
    'DISPONIBLE',
    0,
    60,
    20,
    'https://centurymotors.pe/producto/mercedes-benz-gle-63-licenciado/',
    '2026-10-31',
    'VERIFICADO_EN_FUENTE',
    'Registrado automáticamente desde https://centurymotors.pe',
    'https://centurymotors.pe/wp-content/uploads/2022/07/5b83b7ef-fddf-47e9-b5d3-ad11ed15f2d6.jpg',
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
    COALESCE((SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = UPPER(TRIM('Motores eléctricos')) LIMIT 1), 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS PERÚ' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1),
    'CENTURYMOTORS-MERCEDES-BENZ-MALETA-2-EN-1-3053',
    'CENT-3053',
    'Mercedes Benz Maleta 2 en 1',
    'Registrado automáticamente desde https://centurymotors.pe',
    269,
    269,
    350,
    269,
    269,
    'DISPONIBLE',
    0,
    60,
    20,
    'https://centurymotors.pe/producto/mercedes-benz-maleta-2-en-1/',
    '2026-10-31',
    'VERIFICADO_EN_FUENTE',
    'Registrado automáticamente desde https://centurymotors.pe',
    'https://centurymotors.pe/wp-content/uploads/2022/07/61lrJ2kcmL._AC_SL1500_.jpg',
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
    COALESCE((SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = UPPER(TRIM('Motores eléctricos')) LIMIT 1), 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS PERÚ' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1),
    'CENTURYMOTORS-GO-KART-FERRARI-LICENCIADO-3014',
    'CENT-3014',
    'Go Kart Ferrari Licenciado',
    'Registrado automáticamente desde https://centurymotors.pe',
    249,
    249,
    499,
    249,
    249,
    'DISPONIBLE',
    0,
    60,
    20,
    'https://centurymotors.pe/producto/go-kart-ferrari-licenciado/',
    '2026-10-31',
    'VERIFICADO_EN_FUENTE',
    'Registrado automáticamente desde https://centurymotors.pe',
    'https://centurymotors.pe/wp-content/uploads/2022/07/Go-Kart-Ferrari-century-kids4.jpg',
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
    COALESCE((SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = UPPER(TRIM('Baterías')) LIMIT 1), 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS PERÚ' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1),
    'CENTURYMOTORS-BATERIA-12V-12AH-LITIO-3006',
    'CENT-3006',
    'Batería 12v 12ah Litio',
    'Registrado automáticamente desde https://centurymotors.pe',
    290,
    290,
    330,
    290,
    290,
    'DISPONIBLE',
    0,
    12,
    12,
    'https://centurymotors.pe/producto/bateria-12v-12ah-litio/',
    '2026-10-31',
    'VERIFICADO_EN_FUENTE',
    'Registrado automáticamente desde https://centurymotors.pe',
    'https://centurymotors.pe/wp-content/uploads/2022/06/pack-bateria-12v-15ah-li-ion-samsung-lg.jpg',
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
    COALESCE((SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = UPPER(TRIM('Motores eléctricos')) LIMIT 1), 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS PERÚ' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1),
    'CENTURYMOTORS-MCLAREN-P1-LICENCIADO-12V-2984',
    'CENT-2984',
    'McLaren P1 Licenciado 12v',
    'Registrado automáticamente desde https://centurymotors.pe',
    1350,
    1350,
    1690,
    1350,
    1350,
    'DISPONIBLE',
    0,
    12,
    20,
    'https://centurymotors.pe/producto/mclaren-p1-licenciado-12v/',
    '2026-10-31',
    'VERIFICADO_EN_FUENTE',
    'Registrado automáticamente desde https://centurymotors.pe',
    'https://centurymotors.pe/wp-content/uploads/2022/06/2016-New-P1-Licensed-Best-Ride-on-c2.jpg',
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
    COALESCE((SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = UPPER(TRIM('Motores eléctricos')) LIMIT 1), 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS PERÚ' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1),
    'CENTURYMOTORS-SILLA-CARPETA-ELEFANTE-2967',
    'CENT-2967',
    'Silla Carpeta Elefante',
    'Registrado automáticamente desde https://centurymotors.pe',
    395,
    395,
    450,
    395,
    395,
    'DISPONIBLE',
    0,
    60,
    20,
    'https://centurymotors.pe/producto/silla-carpeta-elefante/',
    '2026-10-31',
    'VERIFICADO_EN_FUENTE',
    'Registrado automáticamente desde https://centurymotors.pe',
    'https://centurymotors.pe/wp-content/uploads/2022/06/128738168_203836981298670_1675278411822741683_n.jpg',
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
    COALESCE((SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = UPPER(TRIM('Motores eléctricos')) LIMIT 1), 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS PERÚ' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1),
    'CENTURYMOTORS-SILLA-DE-COMER-JUSTIN-2959',
    'CENT-2959',
    'Silla de Comer Justin',
    'Registrado automáticamente desde https://centurymotors.pe',
    149,
    149,
    220,
    149,
    149,
    'DISPONIBLE',
    0,
    60,
    20,
    'https://centurymotors.pe/producto/silla-de-comer-justin/',
    '2026-10-31',
    'VERIFICADO_EN_FUENTE',
    'Registrado automáticamente desde https://centurymotors.pe',
    'https://centurymotors.pe/wp-content/uploads/2022/06/78325600-a9b8-42c7-82f4-3115d379412c.jpg',
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
    COALESCE((SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = UPPER(TRIM('Motores eléctricos')) LIMIT 1), 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS PERÚ' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1),
    'CENTURYMOTORS-MESA-DE-ACTIVIDADES-MULTIPLE-2941',
    'CENT-2941',
    'Mesa de actividades múltiple',
    'Registrado automáticamente desde https://centurymotors.pe',
    180,
    180,
    270,
    180,
    180,
    'DISPONIBLE',
    0,
    60,
    20,
    'https://centurymotors.pe/producto/mesa-de-actividades-multiple/',
    '2026-10-31',
    'VERIFICADO_EN_FUENTE',
    'Registrado automáticamente desde https://centurymotors.pe',
    'https://centurymotors.pe/wp-content/uploads/2022/06/61D83VrczXL._AC_SL1000_.jpg',
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
    COALESCE((SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = UPPER(TRIM('Motores eléctricos')) LIMIT 1), 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS PERÚ' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1),
    'CENTURYMOTORS-MOTOCARGA-ELECTRICA-1000W-2926',
    'CENT-2926',
    'Motocarga Eléctrica 1000w',
    'Registrado automáticamente desde https://centurymotors.pe',
    7700,
    7700,
    9800,
    7700,
    7700,
    'DISPONIBLE',
    0,
    60,
    45,
    'https://centurymotors.pe/producto/moto-carga-electrica-800w/',
    '2026-10-31',
    'VERIFICADO_EN_FUENTE',
    'Registrado automáticamente desde https://centurymotors.pe',
    'https://centurymotors.pe/wp-content/uploads/2022/06/motocargas-electricas-800w.png',
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
    COALESCE((SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = UPPER(TRIM('Motores eléctricos')) LIMIT 1), 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS PERÚ' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1),
    'CENTURYMOTORS-NAVE-ESPACIAL-INTERESTELAR-12V-360-2912',
    'CENT-2912',
    'Nave Espacial Interestelar 12v 360º',
    'Registrado automáticamente desde https://centurymotors.pe',
    499,
    499,
    790,
    499,
    499,
    'DISPONIBLE',
    0,
    12,
    7,
    'https://centurymotors.pe/producto/nave-espacial-interestelar-12v-360o/',
    '2026-10-31',
    'VERIFICADO_EN_FUENTE',
    'Registrado automáticamente desde https://centurymotors.pe',
    'https://centurymotors.pe/wp-content/uploads/2022/06/nave-espacial-2.jpg',
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
    COALESCE((SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = UPPER(TRIM('Cargadores')) LIMIT 1), 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS PERÚ' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1),
    'CENTURYMOTORS-CARGADOR-60V-3AH-2904',
    'CENT-2904',
    'Cargador 60v 3Ah',
    'Registrado automáticamente desde https://centurymotors.pe',
    150,
    150,
    220,
    150,
    150,
    'DISPONIBLE',
    0,
    60,
    3,
    'https://centurymotors.pe/producto/cargador-60v-3ah/',
    '2026-10-31',
    'VERIFICADO_EN_FUENTE',
    'Registrado automáticamente desde https://centurymotors.pe',
    'https://centurymotors.pe/wp-content/uploads/2022/06/a0a145c425b1c320e72a9fbb44348767_tn.jpg',
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
    COALESCE((SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = UPPER(TRIM('Cargadores')) LIMIT 1), 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS PERÚ' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1),
    'CENTURYMOTORS-CARGADOR-DE-CITYCOCO-60V-2AH-JN60-2892',
    'CENT-2892',
    'Cargador de Citycoco 60v 2Ah JN60',
    'Registrado automáticamente desde https://centurymotors.pe',
    145,
    145,
    180,
    145,
    145,
    'DISPONIBLE',
    0,
    60,
    2,
    'https://centurymotors.pe/producto/cargador-de-citycoco-60v-2ah-jn60/',
    '2026-10-31',
    'VERIFICADO_EN_FUENTE',
    'Registrado automáticamente desde https://centurymotors.pe',
    'https://centurymotors.pe/wp-content/uploads/2022/06/H9150ce6f2d0d4d63b1907f3592d7f3feb.jpg_.jpg',
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
    COALESCE((SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = UPPER(TRIM('Cargadores')) LIMIT 1), 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS PERÚ' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1),
    'CENTURYMOTORS-CARGADOR-INTELIGENTE-48V-2-0AH-LITI-2877',
    'CENT-2877',
    'Cargador Inteligente 48v 2.0Ah Litio original Yitong',
    'Registrado automáticamente desde https://centurymotors.pe',
    180,
    180,
    230,
    180,
    180,
    'DISPONIBLE',
    0,
    48,
    2,
    'https://centurymotors.pe/producto/cargador-inteligente-48v-2-0ah-litio-original-yitong/',
    '2026-10-31',
    'VERIFICADO_EN_FUENTE',
    'Registrado automáticamente desde https://centurymotors.pe',
    'https://centurymotors.pe/wp-content/uploads/2022/06/6.jpg',
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
    COALESCE((SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = UPPER(TRIM('Motores eléctricos')) LIMIT 1), 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS PERÚ' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1),
    'CENTURYMOTORS-MOTO-DUCATI-12V-2866',
    'CENT-2866',
    'Moto Ducati 12v',
    'Registrado automáticamente desde https://centurymotors.pe',
    450,
    450,
    950,
    450,
    450,
    'DISPONIBLE',
    0,
    12,
    20,
    'https://centurymotors.pe/producto/moto-ducati-12v/',
    '2026-10-31',
    'VERIFICADO_EN_FUENTE',
    'Registrado automáticamente desde https://centurymotors.pe',
    'https://centurymotors.pe/wp-content/uploads/2022/06/ducati-12v.jpg',
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
    COALESCE((SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = UPPER(TRIM('Motores eléctricos')) LIMIT 1), 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS PERÚ' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1),
    'CENTURYMOTORS-GO-KART-ELECTRICO-FORMULA-1-2824',
    'CENT-2824',
    'Go Kart Eléctrico Formula 1',
    'Registrado automáticamente desde https://centurymotors.pe',
    690,
    690,
    1490,
    690,
    690,
    'DISPONIBLE',
    0,
    12,
    7,
    'https://centurymotors.pe/producto/kart-electrico-formula-1/',
    '2026-10-31',
    'VERIFICADO_EN_FUENTE',
    'Registrado automáticamente desde https://centurymotors.pe',
    'https://centurymotors.pe/wp-content/uploads/2022/06/Hbdb4942a77ac4401b551a85d382007fbf.jpg',
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
    COALESCE((SELECT id_categoria FROM categorias WHERE UPPER(TRIM(nombre)) = UPPER(TRIM('Motores eléctricos')) LIMIT 1), 1),
    (SELECT id_proveedor FROM proveedores WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS PERÚ' LIMIT 1),
    (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1),
    'CENTURYMOTORS-MOTO-PISTERA-49CC-GASOLINA-2808',
    'CENT-2808',
    'Moto pistera 49cc Gasolina',
    'Registrado automáticamente desde https://centurymotors.pe',
    1850,
    1850,
    2490,
    1850,
    1850,
    'DISPONIBLE',
    0,
    60,
    20,
    'https://centurymotors.pe/producto/moto-pistera-49cc-gasolina/',
    '2026-10-31',
    'VERIFICADO_EN_FUENTE',
    'Registrado automáticamente desde https://centurymotors.pe',
    'https://centurymotors.pe/wp-content/uploads/2022/06/81090552_2096788053757151_241847735832018944_o.jpg',
    true
) ON CONFLICT (part_key) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    precio = EXCLUDED.precio,
    imagen_url = EXCLUDED.imagen_url,
    source_url = EXCLUDED.source_url;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, nivel_verificacion, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'CENTURYMOTORS-AVION-ELECTRICO-12V-4820' LIMIT 1),
    COALESCE(
      (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'CENTURY MOTORS' AND TRIM(m.nombre) = 'Electrica para niños 24v Ducati' LIMIT 1),
      (SELECT id_modelo FROM modelos_moto WHERE id_marca = (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1) LIMIT 1)
    ),
    'CONFIRMADA',
    'Compatibilidad verificada para línea CENTURY MOTORS Electrica para niños 24v Ducati.'
) ON CONFLICT DO NOTHING;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, nivel_verificacion, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'CENTURYMOTORS-SUPER-BIKE-24V-JIEMEI-4810' LIMIT 1),
    COALESCE(
      (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'CENTURY MOTORS' AND TRIM(m.nombre) = 'Electrica para niños 24v Ducati' LIMIT 1),
      (SELECT id_modelo FROM modelos_moto WHERE id_marca = (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1) LIMIT 1)
    ),
    'CONFIRMADA',
    'Compatibilidad verificada para línea CENTURY MOTORS Electrica para niños 24v Ducati.'
) ON CONFLICT DO NOTHING;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, nivel_verificacion, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'CENTURYMOTORS-MESA-CARPETA-DE-METAL-PARA-ESCOLARE-4781' LIMIT 1),
    COALESCE(
      (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'CENTURY MOTORS' AND TRIM(m.nombre) = 'Electrica para niños 24v Ducati' LIMIT 1),
      (SELECT id_modelo FROM modelos_moto WHERE id_marca = (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1) LIMIT 1)
    ),
    'CONFIRMADA',
    'Compatibilidad verificada para línea CENTURY MOTORS Electrica para niños 24v Ducati.'
) ON CONFLICT DO NOTHING;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, nivel_verificacion, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'CENTURYMOTORS-DODGE-RAM-2500-REBEL-DE-24-VOLTIOS--4753' LIMIT 1),
    COALESCE(
      (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'CENTURY MOTORS' AND TRIM(m.nombre) = 'Electrica para niños 24v Ducati' LIMIT 1),
      (SELECT id_modelo FROM modelos_moto WHERE id_marca = (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1) LIMIT 1)
    ),
    'CONFIRMADA',
    'Compatibilidad verificada para línea CENTURY MOTORS Electrica para niños 24v Ducati.'
) ON CONFLICT DO NOTHING;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, nivel_verificacion, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'CENTURYMOTORS-SCOOTER-24V-EK8-4612' LIMIT 1),
    COALESCE(
      (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'CENTURY MOTORS' AND TRIM(m.nombre) = 'Electrica para niños 24v Ducati' LIMIT 1),
      (SELECT id_modelo FROM modelos_moto WHERE id_marca = (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1) LIMIT 1)
    ),
    'CONFIRMADA',
    'Compatibilidad verificada para línea CENTURY MOTORS Electrica para niños 24v Ducati.'
) ON CONFLICT DO NOTHING;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, nivel_verificacion, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'CENTURYMOTORS-SCOOTER-LED-24V-4589' LIMIT 1),
    COALESCE(
      (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'CENTURY MOTORS' AND TRIM(m.nombre) = 'Electrica para niños 24v Ducati' LIMIT 1),
      (SELECT id_modelo FROM modelos_moto WHERE id_marca = (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1) LIMIT 1)
    ),
    'CONFIRMADA',
    'Compatibilidad verificada para línea CENTURY MOTORS Electrica para niños 24v Ducati.'
) ON CONFLICT DO NOTHING;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, nivel_verificacion, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'CENTURYMOTORS-BATERIA-PARA-SCOOTER-36V-10AH-4579' LIMIT 1),
    COALESCE(
      (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'CENTURY MOTORS' AND TRIM(m.nombre) = 'Electrica para niños 24v Ducati' LIMIT 1),
      (SELECT id_modelo FROM modelos_moto WHERE id_marca = (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1) LIMIT 1)
    ),
    'CONFIRMADA',
    'Compatibilidad verificada para línea CENTURY MOTORS Electrica para niños 24v Ducati.'
) ON CONFLICT DO NOTHING;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, nivel_verificacion, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'CENTURYMOTORS-BATERIA-36V-4-4AH-PARA-SMART-BALANC-4570' LIMIT 1),
    COALESCE(
      (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'CENTURY MOTORS' AND TRIM(m.nombre) = 'Electrica para niños 24v Ducati' LIMIT 1),
      (SELECT id_modelo FROM modelos_moto WHERE id_marca = (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1) LIMIT 1)
    ),
    'CONFIRMADA',
    'Compatibilidad verificada para línea CENTURY MOTORS Electrica para niños 24v Ducati.'
) ON CONFLICT DO NOTHING;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, nivel_verificacion, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'CENTURYMOTORS-LLANTA-PARA-BICIMOTO-VMP-14-X-2-50-4562' LIMIT 1),
    COALESCE(
      (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'CENTURY MOTORS' AND TRIM(m.nombre) = 'Electrica para niños 24v Ducati' LIMIT 1),
      (SELECT id_modelo FROM modelos_moto WHERE id_marca = (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1) LIMIT 1)
    ),
    'CONFIRMADA',
    'Compatibilidad verificada para línea CENTURY MOTORS Electrica para niños 24v Ducati.'
) ON CONFLICT DO NOTHING;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, nivel_verificacion, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'CENTURYMOTORS-BATERIA-DE-LITIO-60V-24AH-HORIZONTA-4552' LIMIT 1),
    COALESCE(
      (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'CENTURY MOTORS' AND TRIM(m.nombre) = 'Electrica para niños 24v Ducati' LIMIT 1),
      (SELECT id_modelo FROM modelos_moto WHERE id_marca = (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1) LIMIT 1)
    ),
    'CONFIRMADA',
    'Compatibilidad verificada para línea CENTURY MOTORS Electrica para niños 24v Ducati.'
) ON CONFLICT DO NOTHING;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, nivel_verificacion, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'CENTURYMOTORS-BATERIA-DE-LITIO-60V-20AH-CHILWEE-4544' LIMIT 1),
    COALESCE(
      (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'CENTURY MOTORS' AND TRIM(m.nombre) = 'Electrica para niños 24v Ducati' LIMIT 1),
      (SELECT id_modelo FROM modelos_moto WHERE id_marca = (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1) LIMIT 1)
    ),
    'CONFIRMADA',
    'Compatibilidad verificada para línea CENTURY MOTORS Electrica para niños 24v Ducati.'
) ON CONFLICT DO NOTHING;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, nivel_verificacion, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'CENTURYMOTORS-BATERIA-LIFEPO4-72V-20AH-CHILWEE-4538' LIMIT 1),
    COALESCE(
      (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'CENTURY MOTORS' AND TRIM(m.nombre) = 'Electrica para niños 24v Ducati' LIMIT 1),
      (SELECT id_modelo FROM modelos_moto WHERE id_marca = (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1) LIMIT 1)
    ),
    'CONFIRMADA',
    'Compatibilidad verificada para línea CENTURY MOTORS Electrica para niños 24v Ducati.'
) ON CONFLICT DO NOTHING;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, nivel_verificacion, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'CENTURYMOTORS-CONTROLADOR-BOTONERA-60V-LOOP-CHOPP-4518' LIMIT 1),
    COALESCE(
      (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'CENTURY MOTORS' AND TRIM(m.nombre) = 'Electrica para niños 24v Ducati' LIMIT 1),
      (SELECT id_modelo FROM modelos_moto WHERE id_marca = (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1) LIMIT 1)
    ),
    'CONFIRMADA',
    'Compatibilidad verificada para línea CENTURY MOTORS Electrica para niños 24v Ducati.'
) ON CONFLICT DO NOTHING;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, nivel_verificacion, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'CENTURYMOTORS-BATERIA-60V-24AH-MODELO-MALETA-PARA-4488' LIMIT 1),
    COALESCE(
      (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'CENTURY MOTORS' AND TRIM(m.nombre) = 'Electrica para niños 24v Ducati' LIMIT 1),
      (SELECT id_modelo FROM modelos_moto WHERE id_marca = (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1) LIMIT 1)
    ),
    'CONFIRMADA',
    'Compatibilidad verificada para línea CENTURY MOTORS Electrica para niños 24v Ducati.'
) ON CONFLICT DO NOTHING;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, nivel_verificacion, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'CENTURYMOTORS-MERCEDES-AMG-DRIFT-TUNNING-24V-4430' LIMIT 1),
    COALESCE(
      (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'CENTURY MOTORS' AND TRIM(m.nombre) = 'Electrica para niños 24v Ducati' LIMIT 1),
      (SELECT id_modelo FROM modelos_moto WHERE id_marca = (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1) LIMIT 1)
    ),
    'CONFIRMADA',
    'Compatibilidad verificada para línea CENTURY MOTORS Electrica para niños 24v Ducati.'
) ON CONFLICT DO NOTHING;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, nivel_verificacion, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'CENTURYMOTORS-MOTO-CROSS-GOGO-24V-4419' LIMIT 1),
    COALESCE(
      (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'CENTURY MOTORS' AND TRIM(m.nombre) = 'Electrica para niños 24v Ducati' LIMIT 1),
      (SELECT id_modelo FROM modelos_moto WHERE id_marca = (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1) LIMIT 1)
    ),
    'CONFIRMADA',
    'Compatibilidad verificada para línea CENTURY MOTORS Electrica para niños 24v Ducati.'
) ON CONFLICT DO NOTHING;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, nivel_verificacion, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'CENTURYMOTORS-MOTO-SUPER-CHOPPER-CRUISER-24V-4404' LIMIT 1),
    COALESCE(
      (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'CENTURY MOTORS' AND TRIM(m.nombre) = 'Electrica para niños 24v Ducati' LIMIT 1),
      (SELECT id_modelo FROM modelos_moto WHERE id_marca = (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1) LIMIT 1)
    ),
    'CONFIRMADA',
    'Compatibilidad verificada para línea CENTURY MOTORS Electrica para niños 24v Ducati.'
) ON CONFLICT DO NOTHING;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, nivel_verificacion, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'CENTURYMOTORS-KART-DRIFT-24V-LAMBORGHINI-4375' LIMIT 1),
    COALESCE(
      (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'CENTURY MOTORS' AND TRIM(m.nombre) = 'Electrica para niños 24v Ducati' LIMIT 1),
      (SELECT id_modelo FROM modelos_moto WHERE id_marca = (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1) LIMIT 1)
    ),
    'CONFIRMADA',
    'Compatibilidad verificada para línea CENTURY MOTORS Electrica para niños 24v Ducati.'
) ON CONFLICT DO NOTHING;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, nivel_verificacion, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'CENTURYMOTORS-RAPTOR-UTV-RACING-24V-2026-4362' LIMIT 1),
    COALESCE(
      (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'CENTURY MOTORS' AND TRIM(m.nombre) = 'Electrica para niños 24v Ducati' LIMIT 1),
      (SELECT id_modelo FROM modelos_moto WHERE id_marca = (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1) LIMIT 1)
    ),
    'CONFIRMADA',
    'Compatibilidad verificada para línea CENTURY MOTORS Electrica para niños 24v Ducati.'
) ON CONFLICT DO NOTHING;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, nivel_verificacion, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'CENTURYMOTORS-BOLSO-DELANTERO-DE-CARCASA-RIGIDA-D-4342' LIMIT 1),
    COALESCE(
      (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'CENTURY MOTORS' AND TRIM(m.nombre) = 'Electrica para niños 24v Ducati' LIMIT 1),
      (SELECT id_modelo FROM modelos_moto WHERE id_marca = (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1) LIMIT 1)
    ),
    'CONFIRMADA',
    'Compatibilidad verificada para línea CENTURY MOTORS Electrica para niños 24v Ducati.'
) ON CONFLICT DO NOTHING;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, nivel_verificacion, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'CENTURYMOTORS-BATERIA-12V-20AH-TIANNENG-PLOMO-4335' LIMIT 1),
    COALESCE(
      (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'CENTURY MOTORS' AND TRIM(m.nombre) = 'Electrica para niños 24v Ducati' LIMIT 1),
      (SELECT id_modelo FROM modelos_moto WHERE id_marca = (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1) LIMIT 1)
    ),
    'CONFIRMADA',
    'Compatibilidad verificada para línea CENTURY MOTORS Electrica para niños 24v Ducati.'
) ON CONFLICT DO NOTHING;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, nivel_verificacion, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'CENTURYMOTORS-SILLA-MECEDORA-RECLINABLE-4326' LIMIT 1),
    COALESCE(
      (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'CENTURY MOTORS' AND TRIM(m.nombre) = 'Electrica para niños 24v Ducati' LIMIT 1),
      (SELECT id_modelo FROM modelos_moto WHERE id_marca = (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1) LIMIT 1)
    ),
    'CONFIRMADA',
    'Compatibilidad verificada para línea CENTURY MOTORS Electrica para niños 24v Ducati.'
) ON CONFLICT DO NOTHING;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, nivel_verificacion, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'CENTURYMOTORS-BATERIA-12V-25AH-TIANNENG-PLOMO-GRA-4309' LIMIT 1),
    COALESCE(
      (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'CENTURY MOTORS' AND TRIM(m.nombre) = 'Electrica para niños 24v Ducati' LIMIT 1),
      (SELECT id_modelo FROM modelos_moto WHERE id_marca = (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1) LIMIT 1)
    ),
    'CONFIRMADA',
    'Compatibilidad verificada para línea CENTURY MOTORS Electrica para niños 24v Ducati.'
) ON CONFLICT DO NOTHING;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, nivel_verificacion, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'CENTURYMOTORS-BATERIA-LITIO-ION-48V-20AH-CHILWEE-4294' LIMIT 1),
    COALESCE(
      (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'CENTURY MOTORS' AND TRIM(m.nombre) = 'Electrica para niños 24v Ducati' LIMIT 1),
      (SELECT id_modelo FROM modelos_moto WHERE id_marca = (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1) LIMIT 1)
    ),
    'CONFIRMADA',
    'Compatibilidad verificada para línea CENTURY MOTORS Electrica para niños 24v Ducati.'
) ON CONFLICT DO NOTHING;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, nivel_verificacion, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'CENTURYMOTORS-BATERIA-DE-LITIO-ION-48V-12AH-CHILW-4285' LIMIT 1),
    COALESCE(
      (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'CENTURY MOTORS' AND TRIM(m.nombre) = 'Electrica para niños 24v Ducati' LIMIT 1),
      (SELECT id_modelo FROM modelos_moto WHERE id_marca = (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1) LIMIT 1)
    ),
    'CONFIRMADA',
    'Compatibilidad verificada para línea CENTURY MOTORS Electrica para niños 24v Ducati.'
) ON CONFLICT DO NOTHING;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, nivel_verificacion, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'CENTURYMOTORS-GO-KART-LED-6V-4262' LIMIT 1),
    COALESCE(
      (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'CENTURY MOTORS' AND TRIM(m.nombre) = 'Electrica para niños 24v Ducati' LIMIT 1),
      (SELECT id_modelo FROM modelos_moto WHERE id_marca = (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1) LIMIT 1)
    ),
    'CONFIRMADA',
    'Compatibilidad verificada para línea CENTURY MOTORS Electrica para niños 24v Ducati.'
) ON CONFLICT DO NOTHING;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, nivel_verificacion, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'CENTURYMOTORS-GO-KART-HOLLICY-4241' LIMIT 1),
    COALESCE(
      (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'CENTURY MOTORS' AND TRIM(m.nombre) = 'Electrica para niños 24v Ducati' LIMIT 1),
      (SELECT id_modelo FROM modelos_moto WHERE id_marca = (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1) LIMIT 1)
    ),
    'CONFIRMADA',
    'Compatibilidad verificada para línea CENTURY MOTORS Electrica para niños 24v Ducati.'
) ON CONFLICT DO NOTHING;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, nivel_verificacion, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'CENTURYMOTORS-SCOOTER-X8-MAX-4211' LIMIT 1),
    COALESCE(
      (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'CENTURY MOTORS' AND TRIM(m.nombre) = 'Electrica para niños 24v Ducati' LIMIT 1),
      (SELECT id_modelo FROM modelos_moto WHERE id_marca = (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1) LIMIT 1)
    ),
    'CONFIRMADA',
    'Compatibilidad verificada para línea CENTURY MOTORS Electrica para niños 24v Ducati.'
) ON CONFLICT DO NOTHING;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, nivel_verificacion, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'CENTURYMOTORS-BATERIA-12V-15AH-TIANNENG-8211-PARA-4162' LIMIT 1),
    COALESCE(
      (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'CENTURY MOTORS' AND TRIM(m.nombre) = 'Electrica para niños 24v Ducati' LIMIT 1),
      (SELECT id_modelo FROM modelos_moto WHERE id_marca = (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1) LIMIT 1)
    ),
    'CONFIRMADA',
    'Compatibilidad verificada para línea CENTURY MOTORS Electrica para niños 24v Ducati.'
) ON CONFLICT DO NOTHING;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, nivel_verificacion, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'CENTURYMOTORS-CASCO-KAWAII-PARA-NINOS-4100' LIMIT 1),
    COALESCE(
      (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'CENTURY MOTORS' AND TRIM(m.nombre) = 'Electrica para niños 24v Ducati' LIMIT 1),
      (SELECT id_modelo FROM modelos_moto WHERE id_marca = (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1) LIMIT 1)
    ),
    'CONFIRMADA',
    'Compatibilidad verificada para línea CENTURY MOTORS Electrica para niños 24v Ducati.'
) ON CONFLICT DO NOTHING;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, nivel_verificacion, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'CENTURYMOTORS-SILLA-PEREZOSA-GRAVEDAD-CERO-4083' LIMIT 1),
    COALESCE(
      (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'CENTURY MOTORS' AND TRIM(m.nombre) = 'Electrica para niños 24v Ducati' LIMIT 1),
      (SELECT id_modelo FROM modelos_moto WHERE id_marca = (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1) LIMIT 1)
    ),
    'CONFIRMADA',
    'Compatibilidad verificada para línea CENTURY MOTORS Electrica para niños 24v Ducati.'
) ON CONFLICT DO NOTHING;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, nivel_verificacion, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'CENTURYMOTORS-HX-X10-SCOOTER-8211-OFF-ROAD-ELECTR-4064' LIMIT 1),
    COALESCE(
      (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'CENTURY MOTORS' AND TRIM(m.nombre) = 'Electrica para niños 24v Ducati' LIMIT 1),
      (SELECT id_modelo FROM modelos_moto WHERE id_marca = (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1) LIMIT 1)
    ),
    'CONFIRMADA',
    'Compatibilidad verificada para línea CENTURY MOTORS Electrica para niños 24v Ducati.'
) ON CONFLICT DO NOTHING;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, nivel_verificacion, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'CENTURYMOTORS-SCOOTER-HX-X9-MAX-48V-550W-4044' LIMIT 1),
    COALESCE(
      (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'CENTURY MOTORS' AND TRIM(m.nombre) = 'Electrica para niños 24v Ducati' LIMIT 1),
      (SELECT id_modelo FROM modelos_moto WHERE id_marca = (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1) LIMIT 1)
    ),
    'CONFIRMADA',
    'Compatibilidad verificada para línea CENTURY MOTORS Electrica para niños 24v Ducati.'
) ON CONFLICT DO NOTHING;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, nivel_verificacion, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'CENTURYMOTORS-CONTROLADOR-60V-2000W-SS12-YTC-25-4042' LIMIT 1),
    COALESCE(
      (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'CENTURY MOTORS' AND TRIM(m.nombre) = 'Electrica para niños 24v Ducati' LIMIT 1),
      (SELECT id_modelo FROM modelos_moto WHERE id_marca = (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1) LIMIT 1)
    ),
    'CONFIRMADA',
    'Compatibilidad verificada para línea CENTURY MOTORS Electrica para niños 24v Ducati.'
) ON CONFLICT DO NOTHING;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, nivel_verificacion, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'CENTURYMOTORS-TRICICLO-DINO-4018' LIMIT 1),
    COALESCE(
      (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'CENTURY MOTORS' AND TRIM(m.nombre) = 'Electrica para niños 24v Ducati' LIMIT 1),
      (SELECT id_modelo FROM modelos_moto WHERE id_marca = (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1) LIMIT 1)
    ),
    'CONFIRMADA',
    'Compatibilidad verificada para línea CENTURY MOTORS Electrica para niños 24v Ducati.'
) ON CONFLICT DO NOTHING;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, nivel_verificacion, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'CENTURYMOTORS-MERCEDES-BENZ-VINTAGE-2024-3965' LIMIT 1),
    COALESCE(
      (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'CENTURY MOTORS' AND TRIM(m.nombre) = 'Electrica para niños 24v Ducati' LIMIT 1),
      (SELECT id_modelo FROM modelos_moto WHERE id_marca = (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1) LIMIT 1)
    ),
    'CONFIRMADA',
    'Compatibilidad verificada para línea CENTURY MOTORS Electrica para niños 24v Ducati.'
) ON CONFLICT DO NOTHING;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, nivel_verificacion, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'CENTURYMOTORS-MOTOR-36V-PARA-SCOOTERS-XIAOMI-3950' LIMIT 1),
    COALESCE(
      (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'CENTURY MOTORS' AND TRIM(m.nombre) = 'Electrica para niños 24v Ducati' LIMIT 1),
      (SELECT id_modelo FROM modelos_moto WHERE id_marca = (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1) LIMIT 1)
    ),
    'CONFIRMADA',
    'Compatibilidad verificada para línea CENTURY MOTORS Electrica para niños 24v Ducati.'
) ON CONFLICT DO NOTHING;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, nivel_verificacion, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'CENTURYMOTORS-MOTOCARGA-ELECTRICA-1500W-XL-3930' LIMIT 1),
    COALESCE(
      (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'CENTURY MOTORS' AND TRIM(m.nombre) = 'Electrica para niños 24v Ducati' LIMIT 1),
      (SELECT id_modelo FROM modelos_moto WHERE id_marca = (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1) LIMIT 1)
    ),
    'CONFIRMADA',
    'Compatibilidad verificada para línea CENTURY MOTORS Electrica para niños 24v Ducati.'
) ON CONFLICT DO NOTHING;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, nivel_verificacion, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'CENTURYMOTORS-SUPER73-S1-BIKE-3913' LIMIT 1),
    COALESCE(
      (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'CENTURY MOTORS' AND TRIM(m.nombre) = 'Electrica para niños 24v Ducati' LIMIT 1),
      (SELECT id_modelo FROM modelos_moto WHERE id_marca = (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1) LIMIT 1)
    ),
    'CONFIRMADA',
    'Compatibilidad verificada para línea CENTURY MOTORS Electrica para niños 24v Ducati.'
) ON CONFLICT DO NOTHING;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, nivel_verificacion, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'CENTURYMOTORS-SCOOTER-MICROGO-M5-3831' LIMIT 1),
    COALESCE(
      (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'CENTURY MOTORS' AND TRIM(m.nombre) = 'Electrica para niños 24v Ducati' LIMIT 1),
      (SELECT id_modelo FROM modelos_moto WHERE id_marca = (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1) LIMIT 1)
    ),
    'CONFIRMADA',
    'Compatibilidad verificada para línea CENTURY MOTORS Electrica para niños 24v Ducati.'
) ON CONFLICT DO NOTHING;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, nivel_verificacion, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'CENTURYMOTORS-TRUCK-MINERO12V-3820' LIMIT 1),
    COALESCE(
      (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'CENTURY MOTORS' AND TRIM(m.nombre) = 'Electrica para niños 24v Ducati' LIMIT 1),
      (SELECT id_modelo FROM modelos_moto WHERE id_marca = (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1) LIMIT 1)
    ),
    'CONFIRMADA',
    'Compatibilidad verificada para línea CENTURY MOTORS Electrica para niños 24v Ducati.'
) ON CONFLICT DO NOTHING;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, nivel_verificacion, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'CENTURYMOTORS-UTV-2023-ARENERO-TERRAIN-3739' LIMIT 1),
    COALESCE(
      (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'CENTURY MOTORS' AND TRIM(m.nombre) = 'Electrica para niños 24v Ducati' LIMIT 1),
      (SELECT id_modelo FROM modelos_moto WHERE id_marca = (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1) LIMIT 1)
    ),
    'CONFIRMADA',
    'Compatibilidad verificada para línea CENTURY MOTORS Electrica para niños 24v Ducati.'
) ON CONFLICT DO NOTHING;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, nivel_verificacion, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'CENTURYMOTORS-TOYOTA-ALPHARD-12V-3718' LIMIT 1),
    COALESCE(
      (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'CENTURY MOTORS' AND TRIM(m.nombre) = 'Electrica para niños 24v Ducati' LIMIT 1),
      (SELECT id_modelo FROM modelos_moto WHERE id_marca = (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1) LIMIT 1)
    ),
    'CONFIRMADA',
    'Compatibilidad verificada para línea CENTURY MOTORS Electrica para niños 24v Ducati.'
) ON CONFLICT DO NOTHING;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, nivel_verificacion, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'CENTURYMOTORS-MCLAREN-F1-KART-24V-DRIFT-3623' LIMIT 1),
    COALESCE(
      (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'CENTURY MOTORS' AND TRIM(m.nombre) = 'Electrica para niños 24v Ducati' LIMIT 1),
      (SELECT id_modelo FROM modelos_moto WHERE id_marca = (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1) LIMIT 1)
    ),
    'CONFIRMADA',
    'Compatibilidad verificada para línea CENTURY MOTORS Electrica para niños 24v Ducati.'
) ON CONFLICT DO NOTHING;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, nivel_verificacion, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'CENTURYMOTORS-COCHE-BOLINA-GAMA-ALTA-3584' LIMIT 1),
    COALESCE(
      (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'CENTURY MOTORS' AND TRIM(m.nombre) = 'Electrica para niños 24v Ducati' LIMIT 1),
      (SELECT id_modelo FROM modelos_moto WHERE id_marca = (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1) LIMIT 1)
    ),
    'CONFIRMADA',
    'Compatibilidad verificada para línea CENTURY MOTORS Electrica para niños 24v Ducati.'
) ON CONFLICT DO NOTHING;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, nivel_verificacion, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'CENTURYMOTORS-MAVERICK-X3-CAN-AM-24-VOLTIOS-3544' LIMIT 1),
    COALESCE(
      (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'CENTURY MOTORS' AND TRIM(m.nombre) = 'Electrica para niños 24v Ducati' LIMIT 1),
      (SELECT id_modelo FROM modelos_moto WHERE id_marca = (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1) LIMIT 1)
    ),
    'CONFIRMADA',
    'Compatibilidad verificada para línea CENTURY MOTORS Electrica para niños 24v Ducati.'
) ON CONFLICT DO NOTHING;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, nivel_verificacion, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'CENTURYMOTORS-SCOOTER-LINEAL-SHOVIT-3483' LIMIT 1),
    COALESCE(
      (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'CENTURY MOTORS' AND TRIM(m.nombre) = 'Electrica para niños 24v Ducati' LIMIT 1),
      (SELECT id_modelo FROM modelos_moto WHERE id_marca = (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1) LIMIT 1)
    ),
    'CONFIRMADA',
    'Compatibilidad verificada para línea CENTURY MOTORS Electrica para niños 24v Ducati.'
) ON CONFLICT DO NOTHING;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, nivel_verificacion, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'CENTURYMOTORS-EXCAVADORA-VOLVO-3467' LIMIT 1),
    COALESCE(
      (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'CENTURY MOTORS' AND TRIM(m.nombre) = 'Electrica para niños 24v Ducati' LIMIT 1),
      (SELECT id_modelo FROM modelos_moto WHERE id_marca = (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1) LIMIT 1)
    ),
    'CONFIRMADA',
    'Compatibilidad verificada para línea CENTURY MOTORS Electrica para niños 24v Ducati.'
) ON CONFLICT DO NOTHING;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, nivel_verificacion, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'CENTURYMOTORS-BATERIA-DE-36V-7-8AH-LITIO-PARA-SCO-3461' LIMIT 1),
    COALESCE(
      (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'CENTURY MOTORS' AND TRIM(m.nombre) = 'Electrica para niños 24v Ducati' LIMIT 1),
      (SELECT id_modelo FROM modelos_moto WHERE id_marca = (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1) LIMIT 1)
    ),
    'CONFIRMADA',
    'Compatibilidad verificada para línea CENTURY MOTORS Electrica para niños 24v Ducati.'
) ON CONFLICT DO NOTHING;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, nivel_verificacion, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'CENTURYMOTORS-BATERIA-60V-16AH-MALETA-VERTICAL-3451' LIMIT 1),
    COALESCE(
      (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'CENTURY MOTORS' AND TRIM(m.nombre) = 'Electrica para niños 24v Ducati' LIMIT 1),
      (SELECT id_modelo FROM modelos_moto WHERE id_marca = (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1) LIMIT 1)
    ),
    'CONFIRMADA',
    'Compatibilidad verificada para línea CENTURY MOTORS Electrica para niños 24v Ducati.'
) ON CONFLICT DO NOTHING;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, nivel_verificacion, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'CENTURYMOTORS-BATERIA-DE-LITIO-20AH-DE-PISO-HORIZ-3442' LIMIT 1),
    COALESCE(
      (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'CENTURY MOTORS' AND TRIM(m.nombre) = 'Electrica para niños 24v Ducati' LIMIT 1),
      (SELECT id_modelo FROM modelos_moto WHERE id_marca = (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1) LIMIT 1)
    ),
    'CONFIRMADA',
    'Compatibilidad verificada para línea CENTURY MOTORS Electrica para niños 24v Ducati.'
) ON CONFLICT DO NOTHING;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, nivel_verificacion, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'CENTURYMOTORS-BATERIA-60V-20AH-MALETA-VERTICAL-3434' LIMIT 1),
    COALESCE(
      (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'CENTURY MOTORS' AND TRIM(m.nombre) = 'Electrica para niños 24v Ducati' LIMIT 1),
      (SELECT id_modelo FROM modelos_moto WHERE id_marca = (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1) LIMIT 1)
    ),
    'CONFIRMADA',
    'Compatibilidad verificada para línea CENTURY MOTORS Electrica para niños 24v Ducati.'
) ON CONFLICT DO NOTHING;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, nivel_verificacion, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'CENTURYMOTORS-CONTROLADOR-60V-2000W-3426' LIMIT 1),
    COALESCE(
      (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'CENTURY MOTORS' AND TRIM(m.nombre) = 'Electrica para niños 24v Ducati' LIMIT 1),
      (SELECT id_modelo FROM modelos_moto WHERE id_marca = (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1) LIMIT 1)
    ),
    'CONFIRMADA',
    'Compatibilidad verificada para línea CENTURY MOTORS Electrica para niños 24v Ducati.'
) ON CONFLICT DO NOTHING;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, nivel_verificacion, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'CENTURYMOTORS-CONTROLADOR-60V-1500W-PARA-CITYCOCO-3409' LIMIT 1),
    COALESCE(
      (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'CENTURY MOTORS' AND TRIM(m.nombre) = 'Electrica para niños 24v Ducati' LIMIT 1),
      (SELECT id_modelo FROM modelos_moto WHERE id_marca = (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1) LIMIT 1)
    ),
    'CONFIRMADA',
    'Compatibilidad verificada para línea CENTURY MOTORS Electrica para niños 24v Ducati.'
) ON CONFLICT DO NOTHING;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, nivel_verificacion, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'CENTURYMOTORS-CONTROLADOR-BICIMOTO-48V-350W-3395' LIMIT 1),
    COALESCE(
      (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'CENTURY MOTORS' AND TRIM(m.nombre) = 'Electrica para niños 24v Ducati' LIMIT 1),
      (SELECT id_modelo FROM modelos_moto WHERE id_marca = (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1) LIMIT 1)
    ),
    'CONFIRMADA',
    'Compatibilidad verificada para línea CENTURY MOTORS Electrica para niños 24v Ducati.'
) ON CONFLICT DO NOTHING;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, nivel_verificacion, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'CENTURYMOTORS-BATERIA-GEL-NARADA-12V-12AH-3392' LIMIT 1),
    COALESCE(
      (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'CENTURY MOTORS' AND TRIM(m.nombre) = 'Electrica para niños 24v Ducati' LIMIT 1),
      (SELECT id_modelo FROM modelos_moto WHERE id_marca = (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1) LIMIT 1)
    ),
    'CONFIRMADA',
    'Compatibilidad verificada para línea CENTURY MOTORS Electrica para niños 24v Ducati.'
) ON CONFLICT DO NOTHING;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, nivel_verificacion, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'CENTURYMOTORS-BATERIA-GEL-NARADA-12V-20AH-3381' LIMIT 1),
    COALESCE(
      (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'CENTURY MOTORS' AND TRIM(m.nombre) = 'Electrica para niños 24v Ducati' LIMIT 1),
      (SELECT id_modelo FROM modelos_moto WHERE id_marca = (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1) LIMIT 1)
    ),
    'CONFIRMADA',
    'Compatibilidad verificada para línea CENTURY MOTORS Electrica para niños 24v Ducati.'
) ON CONFLICT DO NOTHING;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, nivel_verificacion, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'CENTURYMOTORS-UTV-CLASH-24V-4-215-4-3319' LIMIT 1),
    COALESCE(
      (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'CENTURY MOTORS' AND TRIM(m.nombre) = 'Electrica para niños 24v Ducati' LIMIT 1),
      (SELECT id_modelo FROM modelos_moto WHERE id_marca = (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1) LIMIT 1)
    ),
    'CONFIRMADA',
    'Compatibilidad verificada para línea CENTURY MOTORS Electrica para niños 24v Ducati.'
) ON CONFLICT DO NOTHING;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, nivel_verificacion, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'CENTURYMOTORS-ARENERO-UTV-RAPTOR-3296' LIMIT 1),
    COALESCE(
      (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'CENTURY MOTORS' AND TRIM(m.nombre) = 'Electrica para niños 24v Ducati' LIMIT 1),
      (SELECT id_modelo FROM modelos_moto WHERE id_marca = (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1) LIMIT 1)
    ),
    'CONFIRMADA',
    'Compatibilidad verificada para línea CENTURY MOTORS Electrica para niños 24v Ducati.'
) ON CONFLICT DO NOTHING;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, nivel_verificacion, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'CENTURYMOTORS-FORD-RANGER-GO-KART-ELECTRICO-3252' LIMIT 1),
    COALESCE(
      (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'CENTURY MOTORS' AND TRIM(m.nombre) = 'Electrica para niños 24v Ducati' LIMIT 1),
      (SELECT id_modelo FROM modelos_moto WHERE id_marca = (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1) LIMIT 1)
    ),
    'CONFIRMADA',
    'Compatibilidad verificada para línea CENTURY MOTORS Electrica para niños 24v Ducati.'
) ON CONFLICT DO NOTHING;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, nivel_verificacion, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'CENTURYMOTORS-ARENERO-TERRAIN-4-215-4-VOLTAGE-3231' LIMIT 1),
    COALESCE(
      (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'CENTURY MOTORS' AND TRIM(m.nombre) = 'Electrica para niños 24v Ducati' LIMIT 1),
      (SELECT id_modelo FROM modelos_moto WHERE id_marca = (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1) LIMIT 1)
    ),
    'CONFIRMADA',
    'Compatibilidad verificada para línea CENTURY MOTORS Electrica para niños 24v Ducati.'
) ON CONFLICT DO NOTHING;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, nivel_verificacion, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'CENTURYMOTORS-MESA-DELUXE-DOUX-BEBE-3190' LIMIT 1),
    COALESCE(
      (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'CENTURY MOTORS' AND TRIM(m.nombre) = 'Electrica para niños 24v Ducati' LIMIT 1),
      (SELECT id_modelo FROM modelos_moto WHERE id_marca = (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1) LIMIT 1)
    ),
    'CONFIRMADA',
    'Compatibilidad verificada para línea CENTURY MOTORS Electrica para niños 24v Ducati.'
) ON CONFLICT DO NOTHING;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, nivel_verificacion, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'CENTURYMOTORS-FERRARI-TRIBUTO-8-12V-3161' LIMIT 1),
    COALESCE(
      (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'CENTURY MOTORS' AND TRIM(m.nombre) = 'Electrica para niños 24v Ducati' LIMIT 1),
      (SELECT id_modelo FROM modelos_moto WHERE id_marca = (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1) LIMIT 1)
    ),
    'CONFIRMADA',
    'Compatibilidad verificada para línea CENTURY MOTORS Electrica para niños 24v Ducati.'
) ON CONFLICT DO NOTHING;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, nivel_verificacion, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'CENTURYMOTORS-MCLAREN-GT-12V-LICENCIADO-3135' LIMIT 1),
    COALESCE(
      (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'CENTURY MOTORS' AND TRIM(m.nombre) = 'Electrica para niños 24v Ducati' LIMIT 1),
      (SELECT id_modelo FROM modelos_moto WHERE id_marca = (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1) LIMIT 1)
    ),
    'CONFIRMADA',
    'Compatibilidad verificada para línea CENTURY MOTORS Electrica para niños 24v Ducati.'
) ON CONFLICT DO NOTHING;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, nivel_verificacion, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'CENTURYMOTORS-MINITRIKE-PREMIUM-3121' LIMIT 1),
    COALESCE(
      (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'CENTURY MOTORS' AND TRIM(m.nombre) = 'Electrica para niños 24v Ducati' LIMIT 1),
      (SELECT id_modelo FROM modelos_moto WHERE id_marca = (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1) LIMIT 1)
    ),
    'CONFIRMADA',
    'Compatibilidad verificada para línea CENTURY MOTORS Electrica para niños 24v Ducati.'
) ON CONFLICT DO NOTHING;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, nivel_verificacion, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'CENTURYMOTORS-MESA-ESCRITORIO-OSITO-3108' LIMIT 1),
    COALESCE(
      (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'CENTURY MOTORS' AND TRIM(m.nombre) = 'Electrica para niños 24v Ducati' LIMIT 1),
      (SELECT id_modelo FROM modelos_moto WHERE id_marca = (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1) LIMIT 1)
    ),
    'CONFIRMADA',
    'Compatibilidad verificada para línea CENTURY MOTORS Electrica para niños 24v Ducati.'
) ON CONFLICT DO NOTHING;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, nivel_verificacion, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'CENTURYMOTORS-MESA-ESCRITORIO-PARA-NINOS-9040-3083' LIMIT 1),
    COALESCE(
      (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'CENTURY MOTORS' AND TRIM(m.nombre) = 'Electrica para niños 24v Ducati' LIMIT 1),
      (SELECT id_modelo FROM modelos_moto WHERE id_marca = (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1) LIMIT 1)
    ),
    'CONFIRMADA',
    'Compatibilidad verificada para línea CENTURY MOTORS Electrica para niños 24v Ducati.'
) ON CONFLICT DO NOTHING;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, nivel_verificacion, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'CENTURYMOTORS-MERCEDES-BENZ-GLE-63-LICENCIADO-3066' LIMIT 1),
    COALESCE(
      (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'CENTURY MOTORS' AND TRIM(m.nombre) = 'Electrica para niños 24v Ducati' LIMIT 1),
      (SELECT id_modelo FROM modelos_moto WHERE id_marca = (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1) LIMIT 1)
    ),
    'CONFIRMADA',
    'Compatibilidad verificada para línea CENTURY MOTORS Electrica para niños 24v Ducati.'
) ON CONFLICT DO NOTHING;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, nivel_verificacion, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'CENTURYMOTORS-MERCEDES-BENZ-MALETA-2-EN-1-3053' LIMIT 1),
    COALESCE(
      (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'CENTURY MOTORS' AND TRIM(m.nombre) = 'Electrica para niños 24v Ducati' LIMIT 1),
      (SELECT id_modelo FROM modelos_moto WHERE id_marca = (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1) LIMIT 1)
    ),
    'CONFIRMADA',
    'Compatibilidad verificada para línea CENTURY MOTORS Electrica para niños 24v Ducati.'
) ON CONFLICT DO NOTHING;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, nivel_verificacion, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'CENTURYMOTORS-GO-KART-FERRARI-LICENCIADO-3014' LIMIT 1),
    COALESCE(
      (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'CENTURY MOTORS' AND TRIM(m.nombre) = 'Electrica para niños 24v Ducati' LIMIT 1),
      (SELECT id_modelo FROM modelos_moto WHERE id_marca = (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1) LIMIT 1)
    ),
    'CONFIRMADA',
    'Compatibilidad verificada para línea CENTURY MOTORS Electrica para niños 24v Ducati.'
) ON CONFLICT DO NOTHING;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, nivel_verificacion, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'CENTURYMOTORS-BATERIA-12V-12AH-LITIO-3006' LIMIT 1),
    COALESCE(
      (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'CENTURY MOTORS' AND TRIM(m.nombre) = 'Electrica para niños 24v Ducati' LIMIT 1),
      (SELECT id_modelo FROM modelos_moto WHERE id_marca = (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1) LIMIT 1)
    ),
    'CONFIRMADA',
    'Compatibilidad verificada para línea CENTURY MOTORS Electrica para niños 24v Ducati.'
) ON CONFLICT DO NOTHING;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, nivel_verificacion, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'CENTURYMOTORS-MCLAREN-P1-LICENCIADO-12V-2984' LIMIT 1),
    COALESCE(
      (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'CENTURY MOTORS' AND TRIM(m.nombre) = 'Electrica para niños 24v Ducati' LIMIT 1),
      (SELECT id_modelo FROM modelos_moto WHERE id_marca = (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1) LIMIT 1)
    ),
    'CONFIRMADA',
    'Compatibilidad verificada para línea CENTURY MOTORS Electrica para niños 24v Ducati.'
) ON CONFLICT DO NOTHING;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, nivel_verificacion, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'CENTURYMOTORS-SILLA-CARPETA-ELEFANTE-2967' LIMIT 1),
    COALESCE(
      (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'CENTURY MOTORS' AND TRIM(m.nombre) = 'Electrica para niños 24v Ducati' LIMIT 1),
      (SELECT id_modelo FROM modelos_moto WHERE id_marca = (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1) LIMIT 1)
    ),
    'CONFIRMADA',
    'Compatibilidad verificada para línea CENTURY MOTORS Electrica para niños 24v Ducati.'
) ON CONFLICT DO NOTHING;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, nivel_verificacion, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'CENTURYMOTORS-SILLA-DE-COMER-JUSTIN-2959' LIMIT 1),
    COALESCE(
      (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'CENTURY MOTORS' AND TRIM(m.nombre) = 'Electrica para niños 24v Ducati' LIMIT 1),
      (SELECT id_modelo FROM modelos_moto WHERE id_marca = (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1) LIMIT 1)
    ),
    'CONFIRMADA',
    'Compatibilidad verificada para línea CENTURY MOTORS Electrica para niños 24v Ducati.'
) ON CONFLICT DO NOTHING;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, nivel_verificacion, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'CENTURYMOTORS-MESA-DE-ACTIVIDADES-MULTIPLE-2941' LIMIT 1),
    COALESCE(
      (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'CENTURY MOTORS' AND TRIM(m.nombre) = 'Electrica para niños 24v Ducati' LIMIT 1),
      (SELECT id_modelo FROM modelos_moto WHERE id_marca = (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1) LIMIT 1)
    ),
    'CONFIRMADA',
    'Compatibilidad verificada para línea CENTURY MOTORS Electrica para niños 24v Ducati.'
) ON CONFLICT DO NOTHING;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, nivel_verificacion, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'CENTURYMOTORS-MOTOCARGA-ELECTRICA-1000W-2926' LIMIT 1),
    COALESCE(
      (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'CENTURY MOTORS' AND TRIM(m.nombre) = 'Electrica para niños 24v Ducati' LIMIT 1),
      (SELECT id_modelo FROM modelos_moto WHERE id_marca = (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1) LIMIT 1)
    ),
    'CONFIRMADA',
    'Compatibilidad verificada para línea CENTURY MOTORS Electrica para niños 24v Ducati.'
) ON CONFLICT DO NOTHING;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, nivel_verificacion, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'CENTURYMOTORS-NAVE-ESPACIAL-INTERESTELAR-12V-360-2912' LIMIT 1),
    COALESCE(
      (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'CENTURY MOTORS' AND TRIM(m.nombre) = 'Electrica para niños 24v Ducati' LIMIT 1),
      (SELECT id_modelo FROM modelos_moto WHERE id_marca = (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1) LIMIT 1)
    ),
    'CONFIRMADA',
    'Compatibilidad verificada para línea CENTURY MOTORS Electrica para niños 24v Ducati.'
) ON CONFLICT DO NOTHING;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, nivel_verificacion, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'CENTURYMOTORS-CARGADOR-60V-3AH-2904' LIMIT 1),
    COALESCE(
      (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'CENTURY MOTORS' AND TRIM(m.nombre) = 'Electrica para niños 24v Ducati' LIMIT 1),
      (SELECT id_modelo FROM modelos_moto WHERE id_marca = (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1) LIMIT 1)
    ),
    'CONFIRMADA',
    'Compatibilidad verificada para línea CENTURY MOTORS Electrica para niños 24v Ducati.'
) ON CONFLICT DO NOTHING;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, nivel_verificacion, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'CENTURYMOTORS-CARGADOR-DE-CITYCOCO-60V-2AH-JN60-2892' LIMIT 1),
    COALESCE(
      (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'CENTURY MOTORS' AND TRIM(m.nombre) = 'Electrica para niños 24v Ducati' LIMIT 1),
      (SELECT id_modelo FROM modelos_moto WHERE id_marca = (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1) LIMIT 1)
    ),
    'CONFIRMADA',
    'Compatibilidad verificada para línea CENTURY MOTORS Electrica para niños 24v Ducati.'
) ON CONFLICT DO NOTHING;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, nivel_verificacion, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'CENTURYMOTORS-CARGADOR-INTELIGENTE-48V-2-0AH-LITI-2877' LIMIT 1),
    COALESCE(
      (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'CENTURY MOTORS' AND TRIM(m.nombre) = 'Electrica para niños 24v Ducati' LIMIT 1),
      (SELECT id_modelo FROM modelos_moto WHERE id_marca = (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1) LIMIT 1)
    ),
    'CONFIRMADA',
    'Compatibilidad verificada para línea CENTURY MOTORS Electrica para niños 24v Ducati.'
) ON CONFLICT DO NOTHING;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, nivel_verificacion, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'CENTURYMOTORS-MOTO-DUCATI-12V-2866' LIMIT 1),
    COALESCE(
      (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'CENTURY MOTORS' AND TRIM(m.nombre) = 'Electrica para niños 24v Ducati' LIMIT 1),
      (SELECT id_modelo FROM modelos_moto WHERE id_marca = (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1) LIMIT 1)
    ),
    'CONFIRMADA',
    'Compatibilidad verificada para línea CENTURY MOTORS Electrica para niños 24v Ducati.'
) ON CONFLICT DO NOTHING;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, nivel_verificacion, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'CENTURYMOTORS-GO-KART-ELECTRICO-FORMULA-1-2824' LIMIT 1),
    COALESCE(
      (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'CENTURY MOTORS' AND TRIM(m.nombre) = 'Electrica para niños 24v Ducati' LIMIT 1),
      (SELECT id_modelo FROM modelos_moto WHERE id_marca = (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1) LIMIT 1)
    ),
    'CONFIRMADA',
    'Compatibilidad verificada para línea CENTURY MOTORS Electrica para niños 24v Ducati.'
) ON CONFLICT DO NOTHING;

INSERT INTO compatibilidades (
    id_repuesto, id_modelo, nivel_verificacion, observaciones
) VALUES (
    (SELECT id_repuesto FROM repuestos WHERE TRIM(part_key) = 'CENTURYMOTORS-MOTO-PISTERA-49CC-GASOLINA-2808' LIMIT 1),
    COALESCE(
      (SELECT m.id_modelo FROM modelos_moto m JOIN marcas ma ON m.id_marca = ma.id_marca WHERE UPPER(TRIM(ma.nombre)) = 'CENTURY MOTORS' AND TRIM(m.nombre) = 'Electrica para niños 24v Ducati' LIMIT 1),
      (SELECT id_modelo FROM modelos_moto WHERE id_marca = (SELECT id_marca FROM marcas WHERE UPPER(TRIM(nombre)) = 'CENTURY MOTORS' LIMIT 1) LIMIT 1)
    ),
    'CONFIRMADA',
    'Compatibilidad verificada para línea CENTURY MOTORS Electrica para niños 24v Ducati.'
) ON CONFLICT DO NOTHING;

COMMIT;
