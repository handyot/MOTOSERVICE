-- ==============================================================================
-- Migración: Corrección de RLS y CHECK constraint para Asistencia de Taller
-- Archivo: supabase/migrations/20261102010000_fix_solicitudes_asistencia_taller_rls.sql
-- ==============================================================================

BEGIN;

-- 1. Otorgar permisos de inserción a usuarios anónimos y autenticados
GRANT INSERT ON public.solicitudes_asistencia TO anon, authenticated;

-- 2. Asegurar que las políticas RLS permitan la recepción de solicitudes públicas de taller y soporte
DROP POLICY IF EXISTS "Permitir insercion publica solicitudes_asistencia" ON public.solicitudes_asistencia;
CREATE POLICY "Permitir insercion publica solicitudes_asistencia"
    ON public.solicitudes_asistencia
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- 3. Actualizar constraint de tipo para admitir formalmente asistencias de taller y consultas VoltIA
ALTER TABLE public.solicitudes_asistencia DROP CONSTRAINT IF EXISTS chk_asistencia_tipo;
ALTER TABLE public.solicitudes_asistencia ADD CONSTRAINT chk_asistencia_tipo CHECK (
    tipo_solicitud IN (
        'cotizacion_repuesto',
        'diagnostico_no_concluyente',
        'riesgo_electrico',
        'soporte_instalacion',
        'consulta_tecnica',
        'asistencia_taller',
        'consulta_conversacional_voltia'
    )
);

COMMIT;
