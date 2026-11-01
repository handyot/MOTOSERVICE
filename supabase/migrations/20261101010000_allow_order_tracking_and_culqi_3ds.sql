-- ==============================================================================
-- Migración: Habilitar trazabilidad pública de pedidos y soporte Culqi 3DS
-- Archivo: supabase/migrations/20261101010000_allow_order_tracking_and_culqi_3ds.sql
-- ==============================================================================

BEGIN;

-- 1. Permisos para roles anónimo y autenticado en pedidos y items para trazabilidad
GRANT SELECT ON public.pedidos TO anon, authenticated;
GRANT SELECT ON public.pedido_items TO anon, authenticated;

-- 2. Políticas RLS para lectura pública de pedidos
DROP POLICY IF EXISTS "Permitir consulta publica de pedidos" ON public.pedidos;
CREATE POLICY "Permitir consulta publica de pedidos"
    ON public.pedidos
    FOR SELECT
    TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Permitir consulta publica de items pedidos" ON public.pedido_items;
CREATE POLICY "Permitir consulta publica de items pedidos"
    ON public.pedido_items
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- 3. Columnas de soporte 3DS en pagos_intentos
ALTER TABLE public.pagos_intentos
    ADD COLUMN IF NOT EXISTS device_fingerprint text,
    ADD COLUMN IF NOT EXISTS action_code text,
    ADD COLUMN IF NOT EXISTS requires_3ds boolean DEFAULT false;

COMMIT;
