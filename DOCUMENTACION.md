# Documentación Técnica y Operativa del Ecosistema MOTOSERVICE / NeroElectric Motors

Documentación detallada sobre la arquitectura, flujos de trabajo, base de datos y despliegue de **Web 1 (Tienda Pública)** y **Web 2 (Portal de Administración ERP)**.

---

## 1. Resumen del Ecosistema

**MOTOSERVICE (NeroElectric Motors)** es una solución integral especializada en el mercado peruano para la venta de vehículos eléctricos (scooters, motos urbanas, choppers y motocargas), repuestos certificados, servicio técnico preventivo y correctivo, y gestión comercial y logística.

El sistema se compone de dos aplicaciones Next.js 16 independientes que comparten el mismo núcleo de datos en Supabase:

1. **Web 1 (Tienda Comercial / Portal de Clientes)**:
   - Directorio: `./` (raíz).
   - Puerto local por defecto: `3000`.
   - Propósito: Catálogo interactivo, comparador técnico, compatibilidad en tiempo real moto-repuesto, carrito de compra, checkout adaptado a Perú (Ubigeo completo), seguimiento de pedidos en vivo, panel de usuario (`/cuenta`) y asistente técnico con IA (**VoltIA**).
2. **Web 2 (Portal Administrativo / ERP Operativo)**:
   - Directorio: `admin-panel/`.
   - Puerto local por defecto: `3001`.
   - Propósito: ERP administrativo para la operación diaria con 11 módulos (Resumen, Catálogo Maestro, Inventario Propio vs Proveedores, Pedidos y POS, Clientes, Promociones, Facturación SUNAT con emisión de PDF A4/Ticket 80mm/XML, Despachos con Guías de Remisión Electrónica GRE, Gestión de solicitudes de taller VoltIA, motor de Importación/Scraping masivo de catálogos y Gestión de Usuarios y Accesos).

---

## 2. Puntos Clave de Web 1: Tienda Pública

### 2.1. Rutas y Funciones
- **`/` (Home)**: Hero publicitario, accesos a categorías, productos destacados, widget de búsqueda rápida de compatibilidad, comparativa técnica y suscripción a newsletter.
- **`/motos`**: Catálogo completo de motos eléctricas con selector de marcas, voltajes (48V, 60V, 72V, etc.), potencias (800W a 3000W+) y comparador multivehículo interactivo.
- **`/repuestos`**: Catálogo oficial de partes (baterías de litio/plomo-gel, controladores programables, motores hub, neumáticos, cargadores inteligentes, frenos hidráulicos) con semáforos de stock y compatibilidad.
- **`/compatibilidad`**: Buscador guiado que valida si un repuesto específico es compatible con la moto seleccionada, clasificándolo en 4 niveles oficiales (`CONFIRMADA`, `COMPATIBLE_ADAPTABLE`, `REQUIERE_MODIFICACION`, `NO_COMPATIBLE`).
- **`/carrito`**: Administración reactiva de artículos, cómputo automático de base imponible e IGV (18%), soporte de cupones de descuento y cálculo de gastos de envío.
- **`/checkout`**: Proceso de compra con autocompletado del dataset oficial de Perú (25 departamentos, 196 provincias, >1800 distritos), opción de recojo en tienda o despacho, selección de Boleta (DNI) o Factura (RUC), soporte de destinatario alternativo y pasarela **Culqi con soporte 3D Secure 2.0**.
- **`/pedido/[id]`**: Seguimiento visual paso a paso de la orden, estado de despacho, número de guía/tracking de transportista, descarga de comprobantes electrónicos y botón de consulta directa con VoltIA.
- **`/cuenta`**: Panel del cliente donde puede gestionar su perfil, registrar sus vehículos eléctricos (por catálogo o personalizados con validaciones técnicas) y revisar su historial de pedidos.
- **`/login`, `/registro`, `/recuperar-contrasena`, `/actualizar-contrasena`**: Autenticación segura mediante Supabase Auth con asignación automática de nombres de usuario corporativos y mitigación de vulnerabilidades IDOR y redirecciones abiertas.

### 2.2. Asistente Técnico Inteligente: VoltIA
- **Arquitectura**: Servicio híbrido con soporte dual para **Google Gemini** (`gemini-3.5-flash-lite`) y **OpenAI** (`gpt-4o-mini`).
- **Function Calling**:
  - `search_catalog`: Realiza búsquedas reales en la base de datos de repuestos y motos.
  - `check_compatibility`: Revisa tolerancias de voltaje y anclajes antes de recomendar un producto.
  - `track_order`: Permite al cliente rastrear su pedido mediante su número de orden o correo.
- **Protocolo de Seguridad**: Detección inmediata de anomalías eléctricas (humo, calor extremo, chispas) con instrucciones de emergencia previas a cualquier sugerencia comercial.
- **Agendamiento a Taller**: Capacidad de registrar solicitudes directas de diagnóstico o auxilio mecánico en la tabla `solicitudes_asistencia`.

---

## 3. Puntos Clave de Web 2: Portal Administrativo (ERP)

### 3.1. Arquitectura y Seguridad
- **Separación Total**: Su código se encuentra en `admin-panel/` con su propio `package.json`, scripts de compilación y servidor independiente.
- **RBAC (Role-Based Access Control)**:
  - Verificación en servidor de sesión (`requireAdmin()` y `requireAdminApi()`).
  - Bloqueo de clientes con rol `customer` mediante `403 Forbidden` y redirección a `/acceso-denegado`.
  - Capa de redundancia para administradores autorizados mediante la variable `ADMIN_EMAILS`.
- **Privacidad y SEO**: Cabecera `X-Robots-Tag: noindex, nofollow, noarchive` activa para evitar indexación en motores de búsqueda.

### 3.2. Los 10 Módulos Operativos
1. **Resumen Operativo**: Métricas en vivo (pedidos por atender, solicitudes de taller pendientes, stock crítico, volumen de catálogo).
2. **Catálogo Maestro**: Control total de marcas, modelos, repuestos y compatibilidades. Edición de ciclo de vida del producto (`ACTIVO`, `PAUSADO`, `AGOTADO`, `BLOQUEADO`, `ARCHIVADO`).
3. **Inventario Propio vs Proveedor**: Comparativa de existencias físicas en bodega propia versus catálogo de distribuidores asociados (Century Motors, Greenline, Yadea, etc.).
4. **Pedidos y Ventas POS**: Visualización y cambio de estados (`PENDIENTE`, `EN_PREPARACION`, `DESPACHADO`, `ENTREGADO`, `CANCELADO`), tracking y notas de despacho.
5. **Clientes e Invitados**: Padrón general de compradores con vehículos registrados e histórico de órdenes.
6. **Promociones**: Gestión de campañas, lista de suscriptores al newsletter y cupones de descuento.
7. **Facturación SUNAT**: Monitoreo de boletas y facturas emitidas con generación y descarga de comprobantes en:
   - Formato PDF A4.
   - Formato Térmico de 80 mm para impresoras de punto de venta.
   - Formato XML estándar UBL 2.1.
8. **Despachos y Guías GRE**: Emisión de Guías de Remisión Electrónica Remitente (GRE) según normativa SUNAT R.S. 123-2022/SUNAT (modalidad privada con datos de conductor y placa, o pública con transportista).
9. **VoltIA y Asistencia Técnica**: Gestión de solicitudes de taller y citas generadas por los usuarios desde la tienda.
10. **Importador y Scrapers**: Cargador universal para archivos CSV (con delimitación automática y UTF-8 BOM) y JSON, junto a visualizador de historial de importaciones (`catalogo_importaciones`). Incluye la herramienta de **Reclasificación de Catálogo** para transformar repuestos mal etiquetados en vehículos oficiales o archivarlos.
11. **Gestión de Usuarios y Accesos**: Panel centralizado de seguridad RBAC que permite a los operadores auditar cuentas, conceder o revocar privilegios de administrador, suspender o desbloquear el acceso a la plataforma, generar enlaces de recuperación de contraseña o asignación directa, y dar de alta a nuevos operadores.

---

## 4. Base de Datos Compartida (Supabase PostgreSQL)

| Tabla | Descripción |
|---|---|
| `marcas` | Fabricantes oficiales de vehículos eléctricos |
| `categorias` | Clasificación de piezas y accesorios |
| `modelos_moto` | Fichas técnicas de motocicletas y scooters eléctricos |
| `repuestos` | Catálogo de componentes con SKU, precios y stock |
| `compatibilidades` | Matriz de compatibilidad entre repuestos y motos |
| `profiles` / `user_roles` | Perfiles de usuario y asignación estricta de roles (`admin`, `customer`) |
| `vehiculos_cliente` | Garage digital de clientes registrados |
| `pedidos` / `pedido_detalles` | Órdenes de compra, transacciones, montos e items |
| `documentos_fiscales` | Comprobantes tributarios emitidos para SUNAT |
| `guias_remision` | Guías de remisión electrónicas remitente (GRE) |
| `solicitudes_asistencia` | Tickets de soporte y auxilio mecánico para taller |
| `suscripciones_newsletter` | Suscriptores para alertas técnicas y ofertas |
| `catalogo_importaciones` | Auditoría de cargas masivas de datos |

---

## 5. Configuración y Despliegue

### 5.1. Variables de Entorno Requeridas

#### Tienda Pública (`.env.local`)
```ini
NEXT_PUBLIC_SUPABASE_URL=https://tbznauwbvhsbmsbcodes.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SECRET_KEY=sb_secret_...
NEXT_PUBLIC_SITE_URL=https://neroelectricmotors.com
NEXT_PUBLIC_ADMIN_PANEL_URL=https://panel.neroelectricmotors.com
NEXT_PUBLIC_CULQI_PUBLIC_KEY=pk_test_...
CULQI_PRIVATE_KEY=sk_test_...
CULQI_WEBHOOK_SECRET=whsec_...
OPENAI_API_KEY=sk-proj-... # o GEMINI_API_KEY=AQ...
OPENAI_MODEL=gpt-4o-mini # o GEMINI_MODEL=gemini-3.5-flash-lite
```

#### Panel de Administración (`admin-panel/.env.local`)
```ini
NEXT_PUBLIC_SUPABASE_URL=https://tbznauwbvhsbmsbcodes.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SECRET_KEY=sb_secret_...
NEXT_PUBLIC_SITE_URL=https://panel.neroelectricmotors.com
NEXT_PUBLIC_STOREFRONT_URL=https://neroelectricmotors.com
ADMIN_EMAILS=admin@neroelectric.com
```

### 5.2. Comandos Operativos
```bash
# Servidor de desarrollo Tienda Pública (puerto 3000)
npm run dev

# Servidor de desarrollo Panel Admin (puerto 3001)
npm run dev:admin

# Ejecutar ambos en paralelo para pruebas completas
npm run dev & npm run dev:admin

# Suite de pruebas automatizadas (127 pruebas)
npm test

# Verificación de compilación de producción
npm run build:all
```
