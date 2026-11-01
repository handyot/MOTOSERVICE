-- ==============================================================================
-- Migración: Corrección de Seguridad RLS en Pedidos y Seguimiento Protegido
-- Archivo: supabase/migrations/20261101020000_secure_rls_order_tracking.sql
-- ==============================================================================

BEGIN;

-- 1. Eliminar políticas abiertas que exponían datos personales a clientes anónimos
DROP POLICY IF EXISTS "Permitir consulta publica de pedidos" ON public.pedidos;
DROP POLICY IF EXISTS "Permitir consulta publica de items pedidos" ON public.pedido_items;

-- 2. Revocar SELECT directo para anon en pedidos y pedido_items
REVOKE SELECT ON public.pedidos FROM anon;
REVOKE SELECT ON public.pedido_items FROM anon;

-- 3. Reafirmar que usuarios autenticados solo leen sus propios pedidos
DROP POLICY IF EXISTS "Clientes pueden ver sus propios pedidos" ON public.pedidos;
CREATE POLICY "Clientes pueden ver sus propios pedidos"
    ON public.pedidos
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Clientes pueden ver los items de sus pedidos" ON public.pedido_items;
CREATE POLICY "Clientes pueden ver los items de sus pedidos"
    ON public.pedido_items
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.pedidos p
            WHERE p.id_pedido = pedido_items.id_pedido
              AND p.user_id = auth.uid()
        )
    );

COMMIT;
