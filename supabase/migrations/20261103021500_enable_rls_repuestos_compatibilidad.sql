-- ==============================================================================
-- Migración: Habilitar RLS y Políticas de Seguridad en repuestos_compatibilidad
-- Archivo: supabase/migrations/20261103021500_enable_rls_repuestos_compatibilidad.sql
-- Descripción: Resuelve advertencia de lint 'RLS Disabled in Public' en la tabla
--              public.repuestos_compatibilidad permitiendo lectura pública y
--              restringiendo mutaciones exclusivamente a administradores y service_role.
-- ==============================================================================

BEGIN;

-- 1. Habilitar Row Level Security (RLS)
ALTER TABLE IF EXISTS public.repuestos_compatibilidad ENABLE ROW LEVEL SECURITY;

-- 2. Configurar privilegios a nivel de tabla
REVOKE ALL ON TABLE public.repuestos_compatibilidad FROM anon, authenticated;
GRANT SELECT ON TABLE public.repuestos_compatibilidad TO anon, authenticated;

-- 3. Política de lectura pública para catálogo y consultas de compatibilidad
DROP POLICY IF EXISTS "Lectura pública repuestos_compatibilidad" ON public.repuestos_compatibilidad;
CREATE POLICY "Lectura pública repuestos_compatibilidad"
    ON public.repuestos_compatibilidad
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- 4. Política de gestión total (INSERT, UPDATE, DELETE) para administradores autenticados
DROP POLICY IF EXISTS "Admin gestión total repuestos_compatibilidad" ON public.repuestos_compatibilidad;
CREATE POLICY "Admin gestión total repuestos_compatibilidad"
    ON public.repuestos_compatibilidad
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid()
              AND ur.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid()
              AND ur.role = 'admin'
        )
    );

-- 5. Índices de optimización para consultas relacionales frecuentes
CREATE INDEX IF NOT EXISTS idx_repuestos_compatibilidad_id_repuesto 
    ON public.repuestos_compatibilidad (id_repuesto);

CREATE INDEX IF NOT EXISTS idx_repuestos_compatibilidad_id_modelo 
    ON public.repuestos_compatibilidad (id_modelo);

COMMIT;
