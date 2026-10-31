-- ============================================================================
-- MOTOSERVICE / NERO ELECTRIC MOTORS
-- Migración: Actualización de URLs de imágenes reales verificadas (HTTP 200)
-- Fecha: 2026-10-31
-- ============================================================================

-- 1. Actualizar modelos_moto con las URLs reales verificadas (HTTP 200 image/webp)
UPDATE public.modelos_moto m
SET imagen_url = v.img_url
FROM (
  VALUES
    ('TAILG', 'E5', '/images/motos/tailg-e5.webp'),
    ('TAILG', 'N6 Super S', '/images/motos/tailg-n6.webp'),
    ('TAILG', 'F55 Mecha G2', '/images/motos/tailg-f55-g2.webp'),
    ('TAILG', 'M1 Plus', 'https://tailg.com.pe/wp-content/uploads/2026/03/TAILG-M1-Plus-Rosado-430x430.webp'),
    ('TAILG', 'Optimus Mecha G3', '/images/motos/tailg-optimus.webp'),
    ('TAILG', 'F52 Mecha G1', 'https://tailg.com.pe/wp-content/uploads/2025/06/TAILG-F52-Mecha-G1-Verde-430x430.webp'),
    ('TAILG', 'F52 NEO', 'https://tailg.com.pe/wp-content/uploads/2026/03/TAILG-F52-NEO-430x430.webp'),
    ('TAILG', 'X9 Super S', 'https://tailg.com.pe/wp-content/uploads/2026/06/TAILG-X9-Negro-430x430.webp'),
    ('TAILG', 'F55L Litio Extraíble', 'https://tailg.com.pe/wp-content/uploads/2026/03/TAILG-F55L-Negro-430x430.webp'),
    ('TAILG', 'T7 Litio Extraíble', 'https://tailg.com.pe/wp-content/uploads/2026/02/TAILG-T7-Gris-1-430x430.webp'),
    ('TAILG', 'V10 Litio Extraíble', 'https://tailg.com.pe/wp-content/uploads/2026/02/TAILG-V10-Litio-Extraible-LMFP-Verde-430x430.webp'),
    ('TAILG', 'X51 Litio Extraíble', 'https://tailg.com.pe/wp-content/uploads/2026/07/TAILG-X51-NEGRO-litio-extraible-lifepo4-430x430.webp'),
    ('TAILG', 'LEDO Litio Extraíble LMFP', 'https://tailg.com.pe/wp-content/uploads/2026/08/TAILG-LEDO-litio-extraible-negro-430x430.webp'),
    ('TAILG', 'F7 Litio Extraíble LMFP', '/images/motos/tailg-f7.webp'),
    ('TAILG', 'E-Bike M12 Litio', 'https://tailg.com.pe/wp-content/uploads/2026/06/TAILG-P10-NEGRO-430x430.webp'),
    ('TAILG', 'A1 Plus', 'https://tailg.com.pe/wp-content/uploads/2026/01/TAILG-A1-Plus-2026-Negro-430x430.webp'),
    ('TAILG', 'Polaris Super S', 'https://tailg.com.pe/wp-content/uploads/2025/03/TAILG-POLARIS-morado-x-430x430.webp'),
    ('TAILG', 'Leopard Pro Super S', 'https://tailg.com.pe/wp-content/uploads/2026/06/TAILG-LEOPARD-PRO-NEGRO-nv-430x430.webp'),
    ('TAILG', 'Lion Max', '/images/motos/tailg-lion-max.webp'),
    ('TAILG', 'Master', 'https://tailg.com.pe/wp-content/uploads/2025/03/TAILG-F72-MASTER-verde-FB-x-430x430.webp'),
    ('TAILG', 'T5', 'https://tailg.com.pe/wp-content/uploads/2024/12/TAILG-P30-verde-1-430x430.webp'),
    ('TAILG', 'T3', 'https://tailg.com.pe/wp-content/uploads/2025/03/TAILG-M2-verde-430x430.webp'),
    ('TAILG', 'T24', 'https://tailg.com.pe/wp-content/uploads/2024/12/TAILG-F52-plata-430x430.webp'),
    ('TAILG', 'VMP S4', 'https://tailg.com.pe/wp-content/uploads/2026/10/TAILG-N10L-litio-extraible-rosado-430x430.webp'),
    ('TAILG', 'VMP S2', 'https://tailg.com.pe/wp-content/uploads/2026/08/TAILG-LEDO-LITIO-EXTRAIBLE-LMFP.webp'),
    ('TAILG', 'VMP S2X', 'https://tailg.com.pe/wp-content/uploads/2026/10/TAILG-X51-BICIMOTO-DE-LTIO-1000W.webp'),
    ('TAILG', 'King Super S', 'https://tailg.com.pe/wp-content/uploads/2026/04/TAIG-KING-Super-S.webp'),
    ('YADEA', 'E8S Pro', '/images/motos/yadea-e8s-pro.webp'),
    ('YADEA', 'M6', '/images/motos/yadea-m6.webp'),
    ('YADEA', 'M6 Pro', '/images/motos/yadea-m6-pro.webp'),
    ('YADEA', 'M6H', '/images/motos/yadea-m6h.webp'),
    ('YADEA', 'GT60', '/images/motos/yadea-gt60.webp'),
    ('YADEA', 'GT60 S', '/images/motos/yadea-gt60-s.webp'),
    ('YADEA', 'S80', '/images/motos/yadea-s80.webp'),
    ('YADEA', 'Orla', '/images/motos/yadea-m6h.webp'),
    ('YADEA', 'T9', '/images/motos/yadea-e8s-pro.webp'),
    ('YADEA', 'Voltguard', '/images/motos/yadea-gt60.webp'),
    ('YADEA', 'Kemper RC', '/images/motos/yadea-s80.webp'),
    ('YADEA', 'VeloMax 72V', '/images/motos/yadea-s80.webp'),
    ('KAYENCORP', 'Moto Scooter TIME', 'https://kayencorp.com/wp-content/uploads/2026/06/moto-electrica-time-con-servicio-postventa-600x600.webp'),
    ('KAYENCORP', 'Moto Scooter HAWK', 'https://kayencorp.com/wp-content/uploads/2025/09/moto-scooter-hawk-deportiva-600x600.webp'),
    ('KAYENCORP', 'Moto Scooter Kuaishan Plus', 'https://kayencorp.com/wp-content/uploads/2026/02/moto-scooter-kuashian-con-bateria-electrica-600x600.webp'),
    ('KAYENCORP', 'Bicimoto IDO', 'https://kayencorp.com/wp-content/uploads/2026/02/bicimoto-electrica-leshi-color-negro-600x600.webp'),
    ('KAYENCORP', 'Moto MNK2', 'https://kayencorp.com/wp-content/uploads/2026/02/Moto-deportiva-Street-hunter-1536x1536.webp'),
    ('GREENLINE', 'M3', '/images/motos/greenline-m3.webp'),
    ('GREENLINE', 'F4 Pro', '/images/motos/greenline-f4-pro.webp'),
    ('GREENLINE', 'MX6', '/images/motos/greenline-mx6.webp'),
    ('GREENLINE', 'H5', 'https://www.glperu.com/assets/imagenes/productos/motos/h5/h5_rojo_costado.webp?v=20261030-222626'),
    ('GREENLINE', 'X3', 'https://www.glperu.com/assets/imagenes/productos/motos/x3/X3-BLANCO-e1735316531528.webp?v=20261030-222626'),
    ('GREENLINE', 'X6 PRO', 'https://www.glperu.com/assets/imagenes/productos/motos/x6_pro/x6pro_azul_costado.webp?v=20261030-222626'),
    ('GREENLINE', 'H3 Pro', 'https://www.glperu.com/assets/imagenes/productos/motos/h3%20pro/h3_pro_rosado_costado.webp?v=20261030-222626'),
    ('GREENLINE', 'Y5', 'https://www.glperu.com/assets/imagenes/productos/motos/Y5/y5_gris_costado.webp?v=20261030-222626'),
    ('GREENLINE', 'V9 Pro', 'https://www.glperu.com/assets/imagenes/productos/motos/v9_pro/v9_pro_negro_costado.webp?v=20261030-222626'),
    ('GREENLINE', 'T8 (2026)', 'https://www.glperu.com/assets/imagenes/productos/motos/t8/t8_blanca_costado.webp?v=20261030-222626'),
    ('GREENLINE', 'V8', 'https://www.glperu.com/assets/imagenes/productos/motos/sr/sr_blanca_costado.webp?v=20261030-222626'),
    ('GREENLINE', 'M6', 'https://www.glperu.com/assets/imagenes/productos/motos/t6/t6_negro_costado.webp?v=20261030-222626'),
    ('GREENLINE', 'M5', 'https://www.glperu.com/assets/imagenes/productos/vmp/S9/vmp_s9_blanco.webp?v=20261030-222626'),
    ('GREENLINE', 'E3', 'https://www.glperu.com/assets/imagenes/productos/vmp/l3pro/l3_negro_costado.webp?v=20261030-222626'),
    ('GREENLINE', 'E5', 'https://www.glperu.com/assets/imagenes/productos/vmp/S6_Pro/s6pro_verde_costado.webp?v=20261030-222626'),
    ('GREENLINE', 'F6', 'https://www.glperu.com/assets/imagenes/productos/motos/f4%20pro/f4pro_azul_costado.webp?v=20261030-222626'),
    ('GREENLINE', 'J4', 'https://www.glperu.com/assets/imagenes/productos/vmp/T4/t4_crema_costado.webp?v=20261030-222626'),
    ('GREENLINE', 'TM8X', 'https://www.glperu.com/assets/imagenes/productos/trimotos/tm9/tm9_blanco_costado_izq.webp?v=20261030-222626'),
    ('GREENLINE', 'TM6X', 'https://www.glperu.com/assets/imagenes/productos/cargueros/tm6/TM6V24-ROJA.webp?v=20261030-222626'),
    ('GREENLINE', 'H2', 'https://www.glperu.com/assets/imagenes/productos/trimotos/tm7_2026/tmt7_crema_costado.webp?v=20261030-222626')
) AS v(brand_name, model_name, img_url)
JOIN public.marcas ma ON UPPER(TRIM(ma.nombre)) = v.brand_name
WHERE m.id_marca = ma.id_marca
  AND UPPER(TRIM(m.nombre)) = UPPER(TRIM(v.model_name));

-- 2. Actualizar repuestos con las URLs reales verificadas (HTTP 200 image/webp)
UPDATE public.repuestos r
SET imagen_url = v.img_url
FROM (
  VALUES
    ('TAILG-CHG-60V-3A-PORT', 'https://tailg.com.pe/wp-content/uploads/2025/04/60V3A-cargador-tailg-hg-430x430.webp'),
    ('TAILG-BAT-PHYLION-48V12-LMFP', 'https://tailg.com.pe/wp-content/uploads/2026/10/bateria-de-tailg-ledo-litio-extraible-PHYLION-430x430.webp'),
    ('TAILG-BAT-AMPACE-48V24', 'https://tailg.com.pe/wp-content/uploads/2026/10/Bateria-Litio-48V24AH-Extraible-Ampace-430x430.webp'),
    ('TAILG-BAT-GREENWAY-64V30', 'https://tailg.com.pe/wp-content/uploads/2026/10/Bateria-Litio-Extraible-64V30AH-GreenWay-LMFP-H-430x430.webp'),
    ('TAILG-CHG-48V3A-54V6', 'https://tailg.com.pe/wp-content/uploads/2025/06/Cargador-de-Litio-48V-3A-Output-54.6V-frontal-430x430.webp'),
    ('TAILG-CHG-LEDO-48V3A-59V', 'https://tailg.com.pe/wp-content/uploads/2026/10/cargador-de-litio-output-59.0V-3V-430x430.webp'),
    ('TAILG-CHG-F55L-60V5A-73V', 'https://tailg.com.pe/wp-content/uploads/2026/10/TAILG-Cargador-de-litio-60V-5A-LiFEPO4-73V-430x430.webp'),
    ('TAILG-BOX-45L', 'https://tailg.com.pe/wp-content/uploads/2025/04/cajuela-cuadra-iw-blanco-430x430.webp'),
    ('TAILG-MIRROR-WY261-8MM', 'https://tailg.com.pe/wp-content/uploads/2025/10/Espejo-Deportivo-8mm-Original-TAILG-WY-261-430x430.webp'),
    ('TAILG-MIRROR-HJ182-8MM', 'https://tailg.com.pe/wp-content/uploads/2024/12/espejos-deportivos-TAILG-HJ-182-430x430.webp'),
    ('TAILG-MIRROR-XC603', 'https://tailg.com.pe/wp-content/uploads/2026/10/Espejo-Deportivo-TAILG-XC-603-430x430.webp'),
    ('GREENLINE-CHG-72V3A', 'https://tailg.com.pe/wp-content/uploads/2025/04/Cargador-tailg-72V3A-v-430x430.webp'),
    ('GREENLINE-BAT-12V20AH-6DZF20', 'https://electrica.pe/wp-content/uploads/bateria-plomo-acido-12v-20ah.webp'),
    ('GREENLINE-CHG-60V3A-TM8X', 'https://tailg.com.pe/wp-content/uploads/2025/04/60V3A-cargador-tailg-hg-430x430.webp'),
    ('KAYEN-BAT-LIFEPO4-72V30AH', 'https://kayencorp.com/wp-content/uploads/2024/07/bateria-lifepo4-72V30AH-con-mayor-tiempo-de-vida.webp'),
    ('KAYEN-BAT-LIFEPO4-72V24AH', 'https://kayencorp.com/wp-content/uploads/2024/07/bateria-lifepo4-72V24AH-con-mayor-ciclos-de-carga.webp'),
    ('KAYEN-FENDER-IDO', 'https://kayencorp.com/wp-content/uploads/2024/05/guardafango-posterior-bicimoto-ido_3-scaled.webp'),
    ('KAYEN-BRAKE-PADS-MNK2', 'https://kayencorp.com/wp-content/uploads/2024/05/pastilla-de-freno-motor-mnk2-scaled-300x300.webp'),
    ('KAYEN-CHG-48V3A-LITHIUM-BICIMOTO', 'https://kayencorp.com/wp-content/uploads/2024/05/cargador-48v20ah-litio-bicimoto-scaled-300x300.webp')
) AS v(part_key_val, img_url)
WHERE TRIM(r.part_key) = v.part_key_val
   OR TRIM(r.codigo_sku) = v.part_key_val;
