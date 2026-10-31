-- ==============================================================================
-- Migración: MOTOSERVICE Ecommerce Integral, Checkout, VoltIA y Facturación
-- Archivo: supabase/migrations/20261030160000_ecommerce_orders_payments_voltia.sql
-- Descripción: Tablas relacionales, restricciones, índices y RLS para:
--              1. Pedidos y líneas de pedido con snapshots de precios
--              2. Pagos e intentos de cobro (Culqi 3DS)
--              3. Vehículos de clientes
--              4. Conversaciones y sesiones de diagnóstico de VoltIA
--              5. Solicitudes de asistencia técnica y cotización
--              6. Suscripciones comerciales y cupones de descuento
--              7. Documentos fiscales (Boleta, Factura, Guía de Remisión)
-- ==============================================================================

BEGIN;

-- ==============================================================================
-- 1. TABLA: pedidos
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.pedidos (
    id_pedido UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_pedido VARCHAR(32) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    es_invitado BOOLEAN NOT NULL DEFAULT false,
    guest_access_token_hash VARCHAR(128),
    cliente_email VARCHAR(255) NOT NULL,
    cliente_nombre VARCHAR(200) NOT NULL,
    cliente_telefono VARCHAR(50),
    direccion_envio TEXT,
    departamento VARCHAR(100) DEFAULT 'Lima',
    provincia VARCHAR(100) DEFAULT 'Lima',
    distrito VARCHAR(100) DEFAULT 'Lima',
    modalidad_entrega VARCHAR(50) NOT NULL DEFAULT 'envio_domicilio',
    tipo_comprobante VARCHAR(20) NOT NULL DEFAULT 'boleta',
    doc_numero VARCHAR(20) NOT NULL,
    doc_razon_social VARCHAR(200),
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0,
    descuento NUMERIC(12, 2) NOT NULL DEFAULT 0,
    costo_envio NUMERIC(12, 2) NOT NULL DEFAULT 0,
    total NUMERIC(12, 2) NOT NULL DEFAULT 0,
    moneda VARCHAR(3) NOT NULL DEFAULT 'PEN',
    cupon_codigo VARCHAR(50),
    estado_pedido VARCHAR(30) NOT NULL DEFAULT 'pendiente_pago',
    estado_pago VARCHAR(30) NOT NULL DEFAULT 'pendiente',
    estado_comprobante VARCHAR(30) NOT NULL DEFAULT 'pendiente',
    estado_despacho VARCHAR(30) NOT NULL DEFAULT 'pendiente',
    notas_cliente TEXT,
    notas_admin TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_pedidos_numero UNIQUE (numero_pedido),
    CONSTRAINT chk_pedidos_subtotal CHECK (subtotal >= 0),
    CONSTRAINT chk_pedidos_descuento CHECK (descuento >= 0),
    CONSTRAINT chk_pedidos_total CHECK (total >= 0),
    CONSTRAINT chk_pedidos_estado CHECK (
        estado_pedido IN ('pendiente_pago', 'confirmado', 'en_preparacion', 'despachado', 'entregado', 'cancelado')
    ),
    CONSTRAINT chk_pedidos_estado_pago CHECK (
        estado_pago IN ('pendiente', 'en_proceso', 'pagado', 'rechazado', 'cancelado', 'reembolsado')
    ),
    CONSTRAINT chk_pedidos_estado_comprobante CHECK (
        estado_comprobante IN ('pendiente', 'listo', 'emitido', 'rechazado', 'anulado')
    ),
    CONSTRAINT chk_pedidos_estado_despacho CHECK (
        estado_despacho IN ('pendiente', 'preparado', 'despachado', 'entregado', 'incidencia')
    ),
    CONSTRAINT chk_pedidos_tipo_comprobante CHECK (
        tipo_comprobante IN ('boleta', 'factura')
    )
);

COMMENT ON TABLE public.pedidos IS 'Órdenes de compra de repuestos en MOTOSERVICE.';

-- ==============================================================================
-- 2. TABLA: pedido_items
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.pedido_items (
    id_item UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_pedido UUID NOT NULL REFERENCES public.pedidos(id_pedido) ON DELETE CASCADE,
    id_repuesto BIGINT REFERENCES public.repuestos(id_repuesto) ON DELETE SET NULL,
    part_key VARCHAR(100),
    sku VARCHAR(50) NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    precio_unitario NUMERIC(12, 2) NOT NULL,
    cantidad INTEGER NOT NULL DEFAULT 1,
    subtotal NUMERIC(12, 2) NOT NULL,
    snapshot_detalles JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_pedido_items_cantidad CHECK (cantidad > 0),
    CONSTRAINT chk_pedido_items_precio CHECK (precio_unitario >= 0),
    CONSTRAINT chk_pedido_items_subtotal CHECK (subtotal >= 0)
);

COMMENT ON TABLE public.pedido_items IS 'Líneas e instantáneas de productos comprados en un pedido.';

-- ==============================================================================
-- 3. TABLA: pagos_intentos
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.pagos_intentos (
    id_pago UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_pedido UUID NOT NULL REFERENCES public.pedidos(id_pedido) ON DELETE CASCADE,
    proveedor VARCHAR(50) NOT NULL DEFAULT 'culqi',
    referencia_externa VARCHAR(100),
    idempotency_key VARCHAR(100),
    monto NUMERIC(12, 2) NOT NULL,
    moneda VARCHAR(3) NOT NULL DEFAULT 'PEN',
    estado VARCHAR(30) NOT NULL DEFAULT 'pendiente',
    metadatos JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_pagos_idempotency UNIQUE (idempotency_key),
    CONSTRAINT chk_pagos_estado CHECK (
        estado IN ('pendiente', 'en_proceso', 'pagado', 'rechazado', 'cancelado', 'reembolsado')
    )
);

COMMENT ON TABLE public.pagos_intentos IS 'Registro de cobros y transacciones de pasarela (Culqi 3DS).';

-- ==============================================================================
-- 4. TABLA: vehiculos_cliente
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.vehiculos_cliente (
    id_vehiculo UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    marca VARCHAR(100) NOT NULL,
    modelo VARCHAR(150) NOT NULL,
    anio SMALLINT,
    voltaje_nominal_v NUMERIC(6, 2),
    quimica_bateria VARCHAR(50),
    capacidad_ah NUMERIC(6, 2),
    notas TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_vehiculos_voltaje CHECK (voltaje_nominal_v IS NULL OR voltaje_nominal_v > 0)
);

COMMENT ON TABLE public.vehiculos_cliente IS 'Motos eléctricas y VMP registrados por cada cliente en su perfil.';

-- ==============================================================================
-- 5. TABLA: voltia_conversaciones
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.voltia_conversaciones (
    id_conversacion UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    session_token VARCHAR(100) NOT NULL,
    titulo VARCHAR(200) NOT NULL DEFAULT 'Diagnóstico de moto eléctrica',
    estado VARCHAR(30) NOT NULL DEFAULT 'activa',
    sintoma_principal VARCHAR(100),
    vehiculo_info JSONB DEFAULT '{}'::jsonb,
    diagnostico_resumen JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_voltia_estado CHECK (estado IN ('activa', 'derivada', 'cerrada'))
);

COMMENT ON TABLE public.voltia_conversaciones IS 'Sesiones de conversación y diagnóstico técnico de VoltIA.';

-- ==============================================================================
-- 6. TABLA: voltia_mensajes
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.voltia_mensajes (
    id_mensaje UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_conversacion UUID NOT NULL REFERENCES public.voltia_conversaciones(id_conversacion) ON DELETE CASCADE,
    remitente VARCHAR(20) NOT NULL,
    contenido TEXT NOT NULL,
    metadatos JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_voltia_mensajes_remitente CHECK (remitente IN ('usuario', 'voltia', 'asesor'))
);

COMMENT ON TABLE public.voltia_mensajes IS 'Historial cronológico de mensajes en las conversaciones de VoltIA.';

-- ==============================================================================
-- 7. TABLA: solicitudes_asistencia
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.solicitudes_asistencia (
    id_solicitud UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_conversacion UUID REFERENCES public.voltia_conversaciones(id_conversacion) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    nombre_contacto VARCHAR(150) NOT NULL,
    email_contacto VARCHAR(255) NOT NULL,
    telefono_contacto VARCHAR(50),
    tipo_solicitud VARCHAR(50) NOT NULL DEFAULT 'consulta_tecnica',
    estado VARCHAR(30) NOT NULL DEFAULT 'pendiente',
    descripcion TEXT NOT NULL,
    detalles_tecnicos JSONB DEFAULT '{}'::jsonb,
    notas_admin TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_asistencia_tipo CHECK (
        tipo_solicitud IN ('cotizacion_repuesto', 'diagnostico_no_concluyente', 'riesgo_electrico', 'soporte_instalacion', 'consulta_tecnica')
    ),
    CONSTRAINT chk_asistencia_estado CHECK (
        estado IN ('pendiente', 'en_atencion', 'resuelta', 'rechazada')
    )
);

COMMENT ON TABLE public.solicitudes_asistencia IS 'Bandeja de asistencia técnica humana y cotizaciones para el administrador.';

-- ==============================================================================
-- 8. TABLA: suscripciones_newsletter
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.suscripciones_newsletter (
    id_suscripcion UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    consentimiento_comercial BOOLEAN NOT NULL DEFAULT true,
    version_consentimiento VARCHAR(20) NOT NULL DEFAULT 'v1.0',
    fecha_consentimiento TIMESTAMPTZ NOT NULL DEFAULT now(),
    origen VARCHAR(50) NOT NULL DEFAULT 'tienda',
    activo BOOLEAN NOT NULL DEFAULT true,
    token_baja VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_suscripciones_email UNIQUE (email)
);

COMMENT ON TABLE public.suscripciones_newsletter IS 'Registro auditado de consentimientos comerciales de clientes e invitados.';

-- ==============================================================================
-- 9. TABLA: cupones_descuento
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.cupones_descuento (
    id_cupon UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(50) NOT NULL,
    tipo VARCHAR(20) NOT NULL DEFAULT 'porcentaje',
    valor NUMERIC(10, 2) NOT NULL DEFAULT 5.00,
    monto_minimo NUMERIC(10, 2) DEFAULT 0,
    max_usos INTEGER DEFAULT 1,
    usos_actuales INTEGER NOT NULL DEFAULT 0,
    activo BOOLEAN NOT NULL DEFAULT true,
    fecha_inicio TIMESTAMPTZ NOT NULL DEFAULT now(),
    fecha_fin TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_cupones_codigo UNIQUE (codigo),
    CONSTRAINT chk_cupones_tipo CHECK (tipo IN ('porcentaje', 'fijo')),
    CONSTRAINT chk_cupones_valor CHECK (valor > 0)
);

COMMENT ON TABLE public.cupones_descuento IS 'Cupones comerciales configurables (ej. 5% de primera compra).';

-- ==============================================================================
-- 10. TABLA: cupon_redenciones
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.cupon_redenciones (
    id_redencion UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_cupon UUID NOT NULL REFERENCES public.cupones_descuento(id_cupon) ON DELETE RESTRICT,
    id_pedido UUID NOT NULL REFERENCES public.pedidos(id_pedido) ON DELETE CASCADE,
    email_normalizado VARCHAR(255) NOT NULL,
    monto_descontado NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_cupon_email_redencion UNIQUE (id_cupon, email_normalizado)
);

COMMENT ON TABLE public.cupon_redenciones IS 'Auditoría de un solo uso por correo electrónico para promociones.';

-- ==============================================================================
-- 11. TABLA: documentos_fiscales
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.documentos_fiscales (
    id_documento UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_pedido UUID NOT NULL REFERENCES public.pedidos(id_pedido) ON DELETE CASCADE,
    tipo VARCHAR(30) NOT NULL,
    serie VARCHAR(10),
    numero VARCHAR(20),
    estado VARCHAR(30) NOT NULL DEFAULT 'pendiente',
    datos_receptor JSONB NOT NULL,
    total_gravada NUMERIC(12, 2) DEFAULT 0,
    total_igv NUMERIC(12, 2) DEFAULT 0,
    total_comprobante NUMERIC(12, 2) DEFAULT 0,
    hash_cdr TEXT,
    enlace_pdf TEXT,
    enlace_xml TEXT,
    respuesta_sunat JSONB DEFAULT '{}'::jsonb,
    observaciones TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_doc_tipo CHECK (tipo IN ('BOLETA', 'FACTURA', 'GUIA_REMISION')),
    CONSTRAINT chk_doc_estado CHECK (estado IN ('pendiente', 'listo', 'emitido', 'rechazado', 'anulado'))
);

COMMENT ON TABLE public.documentos_fiscales IS 'Comprobantes electrónicos y guías tributarias para SUNAT.';

-- ==============================================================================
-- 12. SEED: Cupón inicial de bienvenida (5% configurable)
-- ==============================================================================
INSERT INTO public.cupones_descuento (codigo, tipo, valor, monto_minimo, max_usos, usos_actuales, activo)
VALUES ('BIENVENIDO5', 'porcentaje', 5.00, 50.00, 100000, 0, true)
ON CONFLICT (codigo) DO NOTHING;

-- ==============================================================================
-- 13. ÍNDICES DE RENDIMIENTO Y CONSULTA
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_pedidos_user_id ON public.pedidos(user_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_email ON public.pedidos(cliente_email);
CREATE INDEX IF NOT EXISTS idx_pedidos_estado ON public.pedidos(estado_pedido);
CREATE INDEX IF NOT EXISTS idx_pedidos_created_at ON public.pedidos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pedido_items_pedido ON public.pedido_items(id_pedido);
CREATE INDEX IF NOT EXISTS idx_pagos_pedido ON public.pagos_intentos(id_pedido);
CREATE INDEX IF NOT EXISTS idx_vehiculos_user_id ON public.vehiculos_cliente(user_id);
CREATE INDEX IF NOT EXISTS idx_voltia_conv_user ON public.voltia_conversaciones(user_id);
CREATE INDEX IF NOT EXISTS idx_voltia_conv_token ON public.voltia_conversaciones(session_token);
CREATE INDEX IF NOT EXISTS idx_voltia_mensajes_conv ON public.voltia_mensajes(id_conversacion);
CREATE INDEX IF NOT EXISTS idx_asistencia_estado ON public.solicitudes_asistencia(estado);
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON public.suscripciones_newsletter(email);
CREATE INDEX IF NOT EXISTS idx_documentos_pedido ON public.documentos_fiscales(id_pedido);

-- ==============================================================================
-- 14. ROW LEVEL SECURITY (RLS) Y POLÍTICAS
-- ==============================================================================
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedido_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagos_intentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehiculos_cliente ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voltia_conversaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voltia_mensajes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solicitudes_asistencia ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suscripciones_newsletter ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cupones_descuento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cupon_redenciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documentos_fiscales ENABLE ROW LEVEL SECURITY;

-- Permisos básicos
GRANT SELECT ON public.cupones_descuento TO anon, authenticated;
GRANT SELECT, INSERT ON public.suscripciones_newsletter TO anon, authenticated;
GRANT SELECT, INSERT ON public.voltia_conversaciones TO anon, authenticated;
GRANT SELECT, INSERT ON public.voltia_mensajes TO anon, authenticated;
GRANT INSERT ON public.solicitudes_asistencia TO anon, authenticated;

-- Políticas para vehículos de clientes
CREATE POLICY "Clientes pueden ver sus propios vehículos"
    ON public.vehiculos_cliente
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Clientes pueden insertar sus propios vehículos"
    ON public.vehiculos_cliente
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Clientes pueden eliminar sus propios vehículos"
    ON public.vehiculos_cliente
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Políticas para pedidos (Clientes autenticados ven solo sus compras)
CREATE POLICY "Clientes pueden ver sus propios pedidos"
    ON public.pedidos
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

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

-- Políticas para conversaciones de VoltIA
CREATE POLICY "Clientes pueden ver sus propias conversaciones"
    ON public.voltia_conversaciones
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Clientes pueden ver mensajes de sus conversaciones"
    ON public.voltia_mensajes
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.voltia_conversaciones c
            WHERE c.id_conversacion = voltia_mensajes.id_conversacion
              AND c.user_id = auth.uid()
        )
    );

-- Políticas para Administradores (Acceso completo a todos los registros)
CREATE POLICY "Admin acceso total pedidos"
    ON public.pedidos
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
        )
    );

CREATE POLICY "Admin acceso total pedido_items"
    ON public.pedido_items
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
        )
    );

CREATE POLICY "Admin acceso total pagos_intentos"
    ON public.pagos_intentos
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
        )
    );

CREATE POLICY "Admin acceso total vehiculos"
    ON public.vehiculos_cliente
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
        )
    );

CREATE POLICY "Admin acceso total voltia_conversaciones"
    ON public.voltia_conversaciones
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
        )
    );

CREATE POLICY "Admin acceso total voltia_mensajes"
    ON public.voltia_mensajes
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
        )
    );

CREATE POLICY "Admin acceso total solicitudes_asistencia"
    ON public.solicitudes_asistencia
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
        )
    );

CREATE POLICY "Admin acceso total suscripciones"
    ON public.suscripciones_newsletter
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
        )
    );

CREATE POLICY "Admin acceso total cupones"
    ON public.cupones_descuento
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
        )
    );

CREATE POLICY "Admin acceso total cupon_redenciones"
    ON public.cupon_redenciones
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
        )
    );

CREATE POLICY "Admin acceso total documentos_fiscales"
    ON public.documentos_fiscales
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
        )
    );

COMMIT;
