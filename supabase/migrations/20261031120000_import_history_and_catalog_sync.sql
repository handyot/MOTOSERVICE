-- ============================================================================
-- MOTOSERVICE — MIGRACIÓN: HISTORIAL DE IMPORTACIONES Y REGISTRO DE MARCAS
-- Fecha: 2026-10-31
-- Descripción:
--   1. Asegura la presencia de la marca oficial 'Kayencorp' en la tabla marcas.
--   2. Añade la tabla catalogo_importaciones para auditoría de importaciones CSV/JSON.
--   3. Aplica políticas RLS estrictas para que solo administradores autenticados
--      o service_role puedan auditar y registrar importaciones.
-- ============================================================================

-- 1. Registrar marca oficial Kayencorp sin alterar marcas existentes
INSERT INTO public.marcas (nombre, estado)
VALUES ('Kayencorp', true)
ON CONFLICT (nombre) DO NOTHING;

-- Asegurar marcas oficiales en mayúsculas/minúsculas sin duplicidad
INSERT INTO public.marcas (nombre, estado)
VALUES ('GreenLine', true)
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO public.marcas (nombre, estado)
VALUES ('Yadea', true)
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO public.marcas (nombre, estado)
VALUES ('Tailg', true)
ON CONFLICT (nombre) DO NOTHING;

-- 2. Tabla de auditoría de importaciones
CREATE TABLE IF NOT EXISTS public.catalogo_importaciones (
  id_importacion BIGSERIAL PRIMARY KEY,
  modo VARCHAR(30) NOT NULL DEFAULT 'DRY_RUN', -- 'DRY_RUN' | 'EXECUTE'
  total_archivos INTEGER NOT NULL DEFAULT 0,
  total_registros_brutos INTEGER NOT NULL DEFAULT 0,
  productos_validos INTEGER NOT NULL DEFAULT 0,
  motos_procesadas INTEGER NOT NULL DEFAULT 0,
  repuestos_procesados INTEGER NOT NULL DEFAULT 0,
  duplicados_fusionados INTEGER NOT NULL DEFAULT 0,
  conflictos_detectados INTEGER NOT NULL DEFAULT 0,
  registros_omitidos INTEGER NOT NULL DEFAULT 0,
  marcas_involucradas JSONB NOT NULL DEFAULT '{}'::jsonb,
  archivos_procesados JSONB NOT NULL DEFAULT '[]'::jsonb,
  detalles_operaciones JSONB NOT NULL DEFAULT '[]'::jsonb,
  admin_email VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Habilitar RLS
ALTER TABLE public.catalogo_importaciones ENABLE ROW LEVEL SECURITY;

-- 4. Políticas de seguridad
DROP POLICY IF EXISTS "importaciones_admin_lectura" ON public.catalogo_importaciones;
CREATE POLICY "importaciones_admin_lectura"
  ON public.catalogo_importaciones
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "importaciones_admin_escritura" ON public.catalogo_importaciones;
CREATE POLICY "importaciones_admin_escritura"
  ON public.catalogo_importaciones
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role = 'admin'
    )
  );
