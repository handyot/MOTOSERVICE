-- ==============================================================================
-- Migración: Autenticación, Perfiles, Roles y Control de Acceso (RLS)
-- Archivo: supabase/migrations/20261030150000_auth_profiles_roles.sql
-- Descripción:
--   1. Tabla public.profiles vinculada a auth.users con CASCADE.
--   2. Tabla public.user_roles con roles tipados ('customer', 'admin') y
--      restricción unívoca que previene ambigüedades.
--   3. Trigger automático y transaccional ante nuevos registros en auth.users,
--      asignando exclusivamente el rol 'customer' de forma inmune a la entrada del cliente.
--   4. Función SECURITY DEFINER con search_path seguro para verificar rol admin.
--   5. Políticas RLS estrictas:
--      - Usuario sólo lee y actualiza su propio perfil.
--      - Usuario sólo lee su propio rol; no puede insertar ni modificar roles.
--      - Administrador puede consultar perfiles y roles.
--   6. Revocación y concesión explícita de privilegios SQL.
-- ==============================================================================

BEGIN;

-- 1. TABLA: profiles
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(200) NOT NULL,
    phone VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.profiles IS 'Perfiles de clientes y usuarios del sistema MOTOSERVICE.';
COMMENT ON COLUMN public.profiles.id IS 'Identificador unívoco del usuario sincronizado con auth.users.';
COMMENT ON COLUMN public.profiles.full_name IS 'Nombre completo del cliente o usuario.';
COMMENT ON COLUMN public.profiles.phone IS 'Teléfono de contacto (opcional).';

-- Índice para consultas y ordenamiento
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles (created_at DESC);


-- 2. TABLA: user_roles
CREATE TABLE IF NOT EXISTS public.user_roles (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL DEFAULT 'customer',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT pk_user_roles PRIMARY KEY (user_id),
    CONSTRAINT chk_user_roles_allowed CHECK (role IN ('customer', 'admin'))
);

COMMENT ON TABLE public.user_roles IS 'Asignación unívoca y controlada de roles de autorización en MOTOSERVICE.';
COMMENT ON COLUMN public.user_roles.user_id IS 'Usuario propietario del rol. La clave primaria previene asignaciones múltiples o duplicadas.';
COMMENT ON COLUMN public.user_roles.role IS 'Rol concedido: customer (cliente estándar) o admin (administrador de plataforma).';

CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles (role);


-- 3. FUNCIÓN DE SEGURIDAD: public.is_admin
-- Determina de forma confiable si el usuario actual posee el rol administrativo.
-- Si se suministra un UUID distinto al de la sesión activa, solo se evalúa si el invocador
-- ya cuenta con privilegios administrativos comprobados o si es el superusuario/service_role.
-- Esto previene que usuarios comunes puedan explorar o enumerar qué UUIDs poseen el rol admin.
CREATE OR REPLACE FUNCTION public.is_admin(check_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
DECLARE
    v_caller_id UUID := auth.uid();
BEGIN
    -- Caso 1: Consulta para el propio usuario autenticado o invocación por defecto
    IF check_user_id IS NULL OR check_user_id = v_caller_id THEN
        IF v_caller_id IS NULL THEN
            RETURN FALSE;
        END IF;
        RETURN EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = v_caller_id AND role = 'admin'
        );
    END IF;

    -- Caso 2: Consulta sobre un tercero.
    -- Solo se autoriza si el invocador es service_role/operador SQL (v_caller_id IS NULL)
    -- o si el invocador autenticado ya es un administrador verificado.
    IF v_caller_id IS NOT NULL THEN
        IF NOT EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = v_caller_id AND role = 'admin'
        ) THEN
            -- Invocador estándar intentando sondear el rol de otro usuario: denegar sin revelar información
            RETURN FALSE;
        END IF;
    END IF;

    RETURN EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = check_user_id AND role = 'admin'
    );
END;
$$;

COMMENT ON FUNCTION public.is_admin IS 'Verifica de forma confiable en el servidor si un usuario posee el rol admin.';


-- 4. FUNCIÓN TRIGGER: public.handle_new_user
-- Se ejecuta automáticamente al insertarse un nuevo registro en auth.users.
-- Garantiza que cualquier alta pública reciba exclusivamente el rol 'customer'.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
    v_full_name TEXT;
    v_phone TEXT;
BEGIN
    -- Extracción segura de metadatos proporcionados en el registro
    v_full_name := NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data->>'full_name', '')), '');
    IF v_full_name IS NULL THEN
        -- Fallback amigable basado en la primera parte del correo o valor predeterminado
        v_full_name := COALESCE(NULLIF(split_part(NEW.email, '@', 1), ''), 'Cliente MOTOSERVICE');
    END IF;

    v_phone := NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data->>'phone', '')), '');

    -- Creación transaccional e idempotente del perfil
    INSERT INTO public.profiles (id, full_name, phone, created_at, updated_at)
    VALUES (NEW.id, v_full_name, v_phone, now(), now())
    ON CONFLICT (id) DO UPDATE
    SET full_name = CASE
            WHEN profiles.full_name IS NULL OR profiles.full_name = '' THEN EXCLUDED.full_name
            ELSE profiles.full_name
        END,
        phone = COALESCE(profiles.phone, EXCLUDED.phone),
        updated_at = now();

    -- Creación transaccional del rol: SIEMPRE 'customer' en el alta pública.
    -- Se ignora cualquier campo 'role' inyectado en user_metadata por el cliente.
    INSERT INTO public.user_roles (user_id, role, created_at)
    VALUES (NEW.id, 'customer', now())
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- En caso de error inesperado, re-lanzar para evitar estados huérfanos
        RAISE WARNING '[MOTOSERVICE] Error al inicializar perfil/rol para user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.handle_new_user IS 'Trigger para inicializar automáticamente perfil y rol customer ante registros en auth.users.';

-- Enlazar trigger a auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();


-- 5. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Limpieza de políticas previas si existieran
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_admin" ON public.profiles;

DROP POLICY IF EXISTS "user_roles_select_own" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_select_admin" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_admin_insert" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_admin_update" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_admin_delete" ON public.user_roles;

-- Políticas para public.profiles:
-- a) Un usuario autenticado solo puede leer su propio perfil.
CREATE POLICY "profiles_select_own"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

-- b) Un administrador puede leer todos los perfiles.
CREATE POLICY "profiles_select_admin"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (public.is_admin());

-- c) Un usuario autenticado solo puede modificar su propio perfil (nombre, teléfono).
CREATE POLICY "profiles_update_own"
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- d) Un administrador puede actualizar perfiles si es necesario.
CREATE POLICY "profiles_update_admin"
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());


-- Políticas para public.user_roles:
-- a) Un usuario autenticado solo puede consultar su propio rol.
CREATE POLICY "user_roles_select_own"
    ON public.user_roles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- b) Un administrador puede consultar los roles de todos los usuarios.
CREATE POLICY "user_roles_select_admin"
    ON public.user_roles
    FOR SELECT
    TO authenticated
    USING (public.is_admin());

-- c) Las operaciones de escritura (INSERT, UPDATE, DELETE) en roles están
--    estrictamente prohibidas a usuarios comunes y solo permitidas a administradores
--    o mediante ejecución directa de operador/service_role.
CREATE POLICY "user_roles_admin_insert"
    ON public.user_roles
    FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

CREATE POLICY "user_roles_admin_update"
    ON public.user_roles
    FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "user_roles_admin_delete"
    ON public.user_roles
    FOR DELETE
    TO authenticated
    USING (public.is_admin());


-- 6. PRIVILEGIOS SQL EXPLÍCITOS (GRANTS / REVOKES)
REVOKE ALL ON TABLE public.profiles FROM anon, public;
REVOKE ALL ON TABLE public.user_roles FROM anon, public;

-- Clientes autenticados solo reciben SELECT y UPDATE sobre su perfil
GRANT SELECT, UPDATE ON TABLE public.profiles TO authenticated;

-- Clientes autenticados solo reciben SELECT sobre user_roles (controlado por RLS)
GRANT SELECT ON TABLE public.user_roles TO authenticated;

-- Permisos estrictos para public.is_admin con firma explícita
REVOKE ALL ON FUNCTION public.is_admin(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated;


-- ==============================================================================
-- 7. INICIALIZACIÓN RETROACTIVA (BACKFILL) PARA USUARIOS EXISTENTES
-- ==============================================================================
-- Garantiza que cualquier cuenta creada previamente en auth.users reciba su perfil
-- y su rol correspondiente sin sobrescribir datos de usuarios ya inicializados.

-- Backfill de perfiles faltantes
INSERT INTO public.profiles (id, full_name, phone, created_at, updated_at)
SELECT
    u.id,
    COALESCE(
        NULLIF(TRIM(u.raw_user_meta_data->>'full_name'), ''),
        NULLIF(split_part(u.email, '@', 1), ''),
        'Cliente'
    ),
    NULLIF(TRIM(u.raw_user_meta_data->>'phone'), ''),
    COALESCE(u.created_at, now()),
    now()
FROM auth.users u
ON CONFLICT (id) DO NOTHING;

-- Backfill de rol 'customer' exclusivamente para cuentas sin rol asignado.
-- ON CONFLICT (user_id) DO NOTHING preserva estrictamente cualquier rol admin
-- preexistente asignado manualmente por el operador.
INSERT INTO public.user_roles (user_id, role, created_at)
SELECT
    u.id,
    'customer',
    COALESCE(u.created_at, now())
FROM auth.users u
ON CONFLICT (user_id) DO NOTHING;


-- ==============================================================================
-- 8. PROCEDIMIENTO OPERATIVO DOCUMENTADO: ELEVACIÓN DE PRIMER ADMINISTRADOR
-- ==============================================================================
-- Para asignar el rol 'admin' a la primera cuenta administrativa, un operador con
-- acceso al SQL Editor del panel de Supabase o mediante la CLI de Supabase
-- debe ejecutar los siguientes comandos (reemplazar con el correo real ya registrado):
--
-- PASO 1: Obtener el UUID del usuario registrado:
--   SELECT id, email, created_at
--   FROM auth.users
--   WHERE email = 'operador.admin@motoservice.pe';
--
-- PASO 2: Asignar de forma unívoca y segura el rol 'admin':
--   INSERT INTO public.user_roles (user_id, role, created_at)
--   VALUES ('<UUID_DEL_USUARIO>', 'admin', now())
--   ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
--
-- PASO 3: Verificar que la función de seguridad lo reconozca:
--   SELECT public.is_admin('<UUID_DEL_USUARIO>'); -- Debe retornar TRUE
-- ==============================================================================

COMMIT;
