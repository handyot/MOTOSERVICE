-- ==============================================================================
-- Migración: Imágenes Reales para Modelos de Motos Eléctricas y Repuestos
-- Archivo: supabase/migrations/20261031150000_modelos_y_repuestos_imagenes_reales.sql
-- Descripción:
--   1. Añade de forma aditiva la columna imagen_url TEXT a public.modelos_moto
--      y pais_origen VARCHAR(80) a public.marcas.
--   2. Asocia las URLs reales de fotografías extraídas de los catálogos CSV/JSON
--      (TAILG, YADEA, KAYENCORP, GREENLINE) a los modelos en public.modelos_moto.
--   3. Asocia las URLs reales de fotografías extraídas de los catálogos CSV/JSON
--      a los repuestos en public.repuestos.
-- ==============================================================================

BEGIN;

-- 1. Ampliación aditiva de esquema
ALTER TABLE public.modelos_moto ADD COLUMN IF NOT EXISTS imagen_url TEXT;
ALTER TABLE public.marcas ADD COLUMN IF NOT EXISTS pais_origen VARCHAR(80) DEFAULT 'China / Perú';

COMMENT ON COLUMN public.modelos_moto.imagen_url IS 'URL o ruta de la fotografía oficial del modelo de vehículo eléctrico.';

-- 2. Actualizar imágenes reales de modelos TAILG en public.modelos_moto
UPDATE public.modelos_moto SET imagen_url = '/images/motos/tailg-e5.webp' WHERE slug = 'tailg-e5';
UPDATE public.modelos_moto SET imagen_url = '/images/motos/tailg-n6.webp' WHERE slug = 'tailg-n6-super-s';
UPDATE public.modelos_moto SET imagen_url = '/images/motos/tailg-f55-g2.webp' WHERE slug = 'tailg-f55-mecha-g2';
UPDATE public.modelos_moto SET imagen_url = 'https://tailg.com.pe/wp-content/uploads/2026/03/TAILG-M1-Plus-Rosado-430x430.webp' WHERE slug = 'tailg-m1-plus';
UPDATE public.modelos_moto SET imagen_url = '/images/motos/tailg-optimus.webp' WHERE slug = 'tailg-optimus-mecha-g3';
UPDATE public.modelos_moto SET imagen_url = 'https://tailg.com.pe/wp-content/uploads/2025/06/TAILG-F52-Mecha-G1-Verde-430x430.webp' WHERE slug = 'tailg-f52-mecha-g1';
UPDATE public.modelos_moto SET imagen_url = 'https://tailg.com.pe/wp-content/uploads/2026/03/TAILG-F52-NEO-430x430.webp' WHERE slug = 'tailg-f52-neo';
UPDATE public.modelos_moto SET imagen_url = 'https://tailg.com.pe/wp-content/uploads/2026/06/TAILG-X9-Negro-430x430.webp' WHERE slug = 'tailg-x9-super-s';
UPDATE public.modelos_moto SET imagen_url = 'https://tailg.com.pe/wp-content/uploads/2026/03/TAILG-F55L-Negro-430x430.webp' WHERE slug = 'tailg-f55l-litio-extraible';
UPDATE public.modelos_moto SET imagen_url = 'https://tailg.com.pe/wp-content/uploads/2026/02/TAILG-T7-Gris-1-430x430.webp' WHERE slug = 'tailg-t7-litio-extraible';
UPDATE public.modelos_moto SET imagen_url = 'https://tailg.com.pe/wp-content/uploads/2026/02/TAILG-V10-Litio-Extraible-LMFP-Verde-430x430.webp' WHERE slug = 'tailg-v10-litio-extraible' OR UPPER(TRIM(nombre)) = 'V10';
UPDATE public.modelos_moto SET imagen_url = 'https://tailg.com.pe/wp-content/uploads/2026/07/TAILG-X51-NEGRO-litio-extraible-lifepo4-430x430.webp' WHERE slug = 'tailg-x51-litio-extraible';
UPDATE public.modelos_moto SET imagen_url = 'https://tailg.com.pe/wp-content/uploads/2026/08/TAILG-LEDO-litio-extraible-negro-430x430.webp' WHERE slug = 'tailg-ledo-litio-extraible-lmfp';
UPDATE public.modelos_moto SET imagen_url = 'https://tailg.com.pe/wp-content/uploads/2026/01/TAILG-A1-Plus-2026-Negro-430x430.webp' WHERE slug = 'tailg-a1-plus';
UPDATE public.modelos_moto SET imagen_url = '/images/motos/tailg-lion-max.webp' WHERE slug = 'tailg-lion-max-2026';
UPDATE public.modelos_moto SET imagen_url = 'https://tailg.com.pe/wp-content/uploads/2025/03/TAILG-POLARIS-morado-x-430x430.webp' WHERE slug = 'tailg-polaris-super-s';
UPDATE public.modelos_moto SET imagen_url = 'https://tailg.com.pe/wp-content/uploads/2026/06/TAILG-LEOPARD-PRO-NEGRO-nv-430x430.webp' WHERE slug = 'tailg-leopard-pro-super-s';
UPDATE public.modelos_moto SET imagen_url = 'https://tailg.com.pe/wp-content/uploads/2025/03/TAILG-F72-MASTER-verde-FB-x-430x430.webp' WHERE slug = 'tailg-master' OR UPPER(TRIM(nombre)) = 'R12 MAX';
UPDATE public.modelos_moto SET imagen_url = 'https://tailg.com.pe/wp-content/uploads/2026/02/TAILG-T7-Gris-1-430x430.webp' WHERE slug IN ('tailg-t5', 'tailg-t3', 'tailg-t24');
UPDATE public.modelos_moto SET imagen_url = 'https://tailg.com.pe/wp-content/uploads/2026/06/TAILG-P10-NEGRO-430x430.webp' WHERE slug IN ('tailg-vmp-s4', 'tailg-vmp-s2', 'tailg-vmp-s2x');

-- 3. Actualizar imágenes reales de modelos YADEA en public.modelos_moto
UPDATE public.modelos_moto SET imagen_url = '/images/motos/yadea-m6.webp' WHERE slug = 'yadea-m6';
UPDATE public.modelos_moto SET imagen_url = '/images/motos/yadea-m6-pro.webp' WHERE slug = 'yadea-m6-pro';
UPDATE public.modelos_moto SET imagen_url = '/images/motos/yadea-m6h.webp' WHERE slug = 'yadea-m6h';
UPDATE public.modelos_moto SET imagen_url = '/images/motos/yadea-gt60.webp' WHERE slug = 'yadea-gt60';
UPDATE public.modelos_moto SET imagen_url = '/images/motos/yadea-e8s-pro.webp' WHERE slug = 'yadea-e8s-pro';
UPDATE public.modelos_moto SET imagen_url = '/images/motos/yadea-s80.webp' WHERE slug = 'yadea-s80';

-- 4. Actualizar imágenes reales de modelos KAYENCORP en public.modelos_moto
UPDATE public.modelos_moto SET imagen_url = 'https://kayencorp.com/wp-content/uploads/2026/06/moto-electrica-time-con-servicio-postventa-600x600.webp' WHERE slug = 'kayencorp-moto-scooter-time';
UPDATE public.modelos_moto SET imagen_url = 'https://kayencorp.com/wp-content/uploads/2025/09/moto-scooter-hawk-deportiva-600x600.webp' WHERE slug = 'kayencorp-moto-scooter-hawk';
UPDATE public.modelos_moto SET imagen_url = 'https://kayencorp.com/wp-content/uploads/2026/02/moto-scooter-kuashian-con-bateria-electrica-600x600.webp' WHERE slug = 'kayencorp-moto-scooter-kuaishan-plus';
UPDATE public.modelos_moto SET imagen_url = 'https://kayencorp.com/wp-content/uploads/2026/02/bicimoto-electrica-leshi-color-negro-600x600.webp' WHERE slug = 'kayencorp-bicimoto-ido';
UPDATE public.modelos_moto SET imagen_url = 'https://kayencorp.com/wp-content/uploads/2024/08/Premium-S90-LiFePo4.webp' WHERE slug = 'kayencorp-moto-mnk2';

-- 5. Actualizar imágenes reales de modelos GREENLINE en public.modelos_moto
UPDATE public.modelos_moto SET imagen_url = 'https://www.glperu.com/assets/imagenes/productos/motos/h5/h5_rojo_costado.webp?v=20261030-222626' WHERE slug = 'greenline-h5';
UPDATE public.modelos_moto SET imagen_url = 'https://www.glperu.com/assets/imagenes/productos/motos/x3/X3-BLANCO-e1735316531528.webp?v=20261030-222626' WHERE slug = 'greenline-x3';
UPDATE public.modelos_moto SET imagen_url = 'https://www.glperu.com/assets/imagenes/productos/motos/x6_pro/x6pro_azul_costado.webp?v=20261030-222626' WHERE slug = 'greenline-x6-pro';
UPDATE public.modelos_moto SET imagen_url = 'https://www.glperu.com/assets/imagenes/productos/motos/h3%20pro/h3_pro_rosado_costado.webp?v=20261030-222626' WHERE slug = 'greenline-h3-pro';
UPDATE public.modelos_moto SET imagen_url = 'https://www.glperu.com/assets/imagenes/productos/motos/Y5/y5_gris_costado.webp?v=20261030-222626' WHERE slug = 'greenline-y5';
UPDATE public.modelos_moto SET imagen_url = 'https://www.glperu.com/assets/imagenes/productos/motos/v9_pro/v9_pro_negro_costado.webp?v=20261030-222626' WHERE slug = 'greenline-v9-pro';
UPDATE public.modelos_moto SET imagen_url = 'https://www.glperu.com/assets/imagenes/productos/motos/t8/t8_blanca_costado.webp?v=20261030-222626' WHERE slug = 'greenline-t8-2026';
UPDATE public.modelos_moto SET imagen_url = 'https://www.glperu.com/assets/imagenes/productos/motos/sr/sr_blanca_costado.webp?v=20261030-222626' WHERE slug = 'greenline-v8';
UPDATE public.modelos_moto SET imagen_url = '/images/motos/greenline-mx6.webp' WHERE slug = 'greenline-m6';
UPDATE public.modelos_moto SET imagen_url = '/images/motos/greenline-m3.webp' WHERE slug = 'greenline-m5';
UPDATE public.modelos_moto SET imagen_url = 'https://www.glperu.com/assets/imagenes/productos/vmp/l3pro/l3_negro_costado.webp?v=20261030-222626' WHERE slug = 'greenline-e3';
UPDATE public.modelos_moto SET imagen_url = 'https://www.glperu.com/assets/imagenes/productos/motos/t6/t6_negro_costado.webp?v=20261030-222626' WHERE slug = 'greenline-e5';
UPDATE public.modelos_moto SET imagen_url = '/images/motos/greenline-f4-pro.webp' WHERE slug = 'greenline-f6';
UPDATE public.modelos_moto SET imagen_url = 'https://www.glperu.com/assets/imagenes/productos/vmp/T4/t4_crema_costado.webp?v=20261030-222626' WHERE slug = 'greenline-j4';
UPDATE public.modelos_moto SET imagen_url = 'https://www.glperu.com/assets/imagenes/productos/trimotos/tm9/tm9_blanco_costado_izq.webp?v=20261030-222626' WHERE slug = 'greenline-tm8x';
UPDATE public.modelos_moto SET imagen_url = 'https://www.glperu.com/assets/imagenes/productos/cargueros/tm6/TM6V24-ROJA.webp?v=20261030-222626' WHERE slug = 'greenline-tm6x';
UPDATE public.modelos_moto SET imagen_url = 'https://electrica.pe/wp-content/uploads/H3-LATERAL-324x324.webp' WHERE slug = 'greenline-h2';

-- 6. Actualizar imágenes reales de los 19 repuestos verificados en public.repuestos
UPDATE public.repuestos SET imagen_url = 'https://tailg.com.pe/wp-content/uploads/2025/04/60V3A-cargador-tailg-hg-430x430.webp' WHERE part_key = 'TAILG-CHG-60V-3A-PORT' OR codigo_sku = 'TAILG-CHG-60V-3A-PORT';
UPDATE public.repuestos SET imagen_url = 'https://tailg.com.pe/wp-content/uploads/2026/10/bateria-de-tailg-ledo-litio-extraible-PHYLION-430x430.webp' WHERE part_key = 'TAILG-BAT-PHYLION-48V12-LMFP' OR codigo_sku = 'TAILG-BAT-PHYLION-48V12-LMFP';
UPDATE public.repuestos SET imagen_url = 'https://tailg.com.pe/wp-content/uploads/2026/10/Bateria-Litio-48V24AH-Extraible-Ampace-430x430.webp' WHERE part_key = 'TAILG-BAT-AMPACE-48V24' OR codigo_sku = 'TAILG-BAT-AMPACE-48V24';
UPDATE public.repuestos SET imagen_url = 'https://tailg.com.pe/wp-content/uploads/2026/10/Bateria-Litio-Extraible-64V30AH-GreenWay-LMFP-H-430x430.webp' WHERE part_key = 'TAILG-BAT-GREENWAY-64V30' OR codigo_sku = 'TAILG-BAT-GREENWAY-64V30';
UPDATE public.repuestos SET imagen_url = 'https://tailg.com.pe/wp-content/uploads/2025/06/Cargador-de-Litio-48V-3A-Output-54.6V-frontal-430x430.webp' WHERE part_key = 'TAILG-CHG-48V3A-54V6' OR codigo_sku = 'TAILG-CHG-48V3A-54V6';
UPDATE public.repuestos SET imagen_url = 'https://tailg.com.pe/wp-content/uploads/2026/10/cargador-de-litio-output-59.0V-3V-430x430.webp' WHERE part_key = 'TAILG-CHG-LEDO-48V3A-59V' OR codigo_sku = 'TAILG-CHG-LEDO-48V3A-59V';
UPDATE public.repuestos SET imagen_url = 'https://tailg.com.pe/wp-content/uploads/2026/10/TAILG-Cargador-de-litio-60V-5A-LiFEPO4-73V-430x430.webp' WHERE part_key = 'TAILG-CHG-F55L-60V5A-73V' OR codigo_sku = 'TAILG-CHG-F55L-60V5A-73V';
UPDATE public.repuestos SET imagen_url = 'https://tailg.com.pe/wp-content/uploads/2025/04/cajuela-cuadra-iw-blanco-430x430.webp' WHERE part_key = 'TAILG-BOX-45L' OR codigo_sku = 'TAILG-BOX-45L';
UPDATE public.repuestos SET imagen_url = 'https://tailg.com.pe/wp-content/uploads/2025/10/Espejo-Deportivo-8mm-Original-TAILG-WY-261-430x430.webp' WHERE part_key = 'TAILG-MIRROR-WY261-8MM' OR codigo_sku = 'WY-261';
UPDATE public.repuestos SET imagen_url = 'https://tailg.com.pe/wp-content/uploads/2024/12/espejos-deportivos-TAILG-HJ-182-430x430.webp' WHERE part_key = 'TAILG-MIRROR-HJ182-8MM' OR codigo_sku = 'HJ-182';
UPDATE public.repuestos SET imagen_url = 'https://tailg.com.pe/wp-content/uploads/2026/10/Espejo-Deportivo-TAILG-XC-603-430x430.webp' WHERE part_key = 'TAILG-MIRROR-XC603' OR codigo_sku = 'XC-603';
UPDATE public.repuestos SET imagen_url = 'https://electrica.pe/wp-content/uploads/cargador-72v-4a-greenline-tailg-c-324x324.webp' WHERE part_key = 'GREENLINE-CHG-72V3A' OR codigo_sku = 'GREENLINE-CHG-72V3A';
UPDATE public.repuestos SET imagen_url = 'https://electrica.pe/wp-content/uploads/bateria-plomo-acido-12v-20ah.webp' WHERE part_key = 'GREENLINE-BAT-12V20AH-6DZF20' OR codigo_sku = '6-DZF-20';
UPDATE public.repuestos SET imagen_url = 'https://electrica.pe/wp-content/uploads/CARGADOR-1-324x324.webp' WHERE part_key = 'GREENLINE-CHG-60V3A-TM8X' OR codigo_sku = 'GREENLINE-CHG-60V3A-TM8X';
UPDATE public.repuestos SET imagen_url = 'https://kayencorp.com/wp-content/uploads/2024/07/bateria-lifepo4-72V30AH-con-mayor-tiempo-de-vida.webp' WHERE part_key = 'KAYEN-BAT-LIFEPO4-72V30AH' OR codigo_sku = '1569';
UPDATE public.repuestos SET imagen_url = 'https://kayencorp.com/wp-content/uploads/2024/07/bateria-lifepo4-72V24AH-con-mayor-ciclos-de-carga.webp' WHERE part_key = 'KAYEN-BAT-LIFEPO4-72V24AH' OR codigo_sku = '1568';
UPDATE public.repuestos SET imagen_url = 'https://kayencorp.com/wp-content/uploads/2024/05/guardafango-posterior-bicimoto-ido_3-scaled.webp' WHERE part_key = 'KAYEN-FENDER-IDO' OR codigo_sku = '199';
UPDATE public.repuestos SET imagen_url = 'https://kayencorp.com/wp-content/uploads/2024/05/pastilla-de-freno-motor-mnk2-scaled-300x300.webp' WHERE part_key = 'KAYEN-BRAKE-PADS-MNK2' OR codigo_sku = '1020';
UPDATE public.repuestos SET imagen_url = 'https://kayencorp.com/wp-content/uploads/2024/05/cargador-48v12ah-litio-bicimoto-scaled-300x300.webp' WHERE part_key = 'KAYEN-CHG-48V3A-LITHIUM-BICIMOTO' OR codigo_sku = '183';

COMMIT;
