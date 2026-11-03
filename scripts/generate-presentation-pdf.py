#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generador de Dossier Ejecutivo y Técnico en PDF para MOTOSERVICE / NeroElectric Motors.
Utiliza ReportLab para crear un documento profesional, estructurado y listo para presentar.
"""

import sys
import os
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm, mm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    """Canvas de dos pasos para numerar páginas dinámicamente: Página X de Y"""
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_page_decorations(self, page_count):
        if self._pageNumber == 1:
            # En la portada no imprimimos encabezado ni pie de página estándar
            return

        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748b"))

        # Encabezado superior
        self.drawString(2 * cm, 28.3 * cm, "MOTOSERVICE — DOSSIER EJECUTIVO Y TÉCNICO")
        self.drawRightString(19 * cm, 28.3 * cm, "NeroElectric Motors")
        self.setStrokeColor(colors.HexColor("#e2e8f0"))
        self.setLineWidth(0.6)
        self.line(2 * cm, 28.1 * cm, 19 * cm, 28.1 * cm)

        # Pie de página inferior
        self.line(2 * cm, 1.8 * cm, 19 * cm, 1.8 * cm)
        self.drawString(2 * cm, 1.4 * cm, "Confidencial &middot; Documento de Presentación de Proyecto 2026")
        page_str = f"Página {self._pageNumber} de {page_count}"
        self.drawRightString(19 * cm, 1.4 * cm, page_str)
        self.restoreState()


def build_pdf(filename="MOTOSERVICE_Dossier_Ejecutivo_y_Tecnico.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=A4,
        leftMargin=2 * cm,
        rightMargin=2 * cm,
        topMargin=2.2 * cm,
        bottomMargin=2.2 * cm
    )

    styles = getSampleStyleSheet()

    # Colores corporativos
    c_primary = colors.HexColor("#0f172a")     # Slate 900
    c_secondary = colors.HexColor("#1e293b")   # Slate 800
    c_amber = colors.HexColor("#d97706")       # Amber 600
    c_cyan = colors.HexColor("#0284c7")        # Cyan 600
    c_text = colors.HexColor("#1e293b")        # Slate 800
    c_muted = colors.HexColor("#475569")       # Slate 600
    c_border = colors.HexColor("#e2e8f0")

    # Estilos de tipografía
    title_cover = ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=26,
        leading=32,
        textColor=colors.HexColor("#0f172a"),
        alignment=0,
        spaceAfter=10
    )

    subtitle_cover = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=13,
        leading=18,
        textColor=colors.HexColor("#475569"),
        alignment=0,
        spaceAfter=25
    )

    h1 = ParagraphStyle(
        'Header1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=16,
        leading=21,
        textColor=c_primary,
        spaceBefore=14,
        spaceAfter=8,
        keepWithNext=True
    )

    h2 = ParagraphStyle(
        'Header2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=c_amber,
        spaceBefore=10,
        spaceAfter=5,
        keepWithNext=True
    )

    body = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=c_text,
        spaceAfter=6
    )

    bullet = ParagraphStyle(
        'BulletText',
        parent=body,
        leftIndent=12,
        firstLineIndent=-8,
        spaceAfter=4
    )

    callout_text = ParagraphStyle(
        'CalloutText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#0f172a")
    )

    badge = ParagraphStyle(
        'Badge',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=colors.white
    )

    table_header = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.white
    )

    table_cell = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=10.5,
        textColor=c_text
    )

    table_cell_bold = ParagraphStyle(
        'TableCellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10.5,
        textColor=c_primary
    )

    story = []

    # =========================================================================
    # PORTADA
    # =========================================================================
    story.append(Spacer(1, 1.5 * cm))
    
    # Badge superior de estado
    badge_data = [[
        Paragraph("<font color='#0284c7'><b>&bull; DOCUMENTO OFICIAL DE PROYECTO</b></font> &nbsp;|&nbsp; NOVIEMBRE 2026 &nbsp;|&nbsp; VERSIÓN 1.0", ParagraphStyle('Bdg', fontName='Helvetica-Bold', fontSize=8, textColor=c_primary))
    ]]
    t_badge = Table(badge_data, colWidths=[17 * cm])
    t_badge.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f1f5f9")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#cbd5e1")),
        ('PADDING', (0,0), (-1,-1), 6),
        ('ROUNDEDCORNERS', [4, 4, 4, 4]),
    ]))
    story.append(t_badge)
    story.append(Spacer(1, 1.2 * cm))

    # Título principal
    story.append(Paragraph("DOSSIER EJECUTIVO Y TÉCNICO", ParagraphStyle('SubPre', fontName='Helvetica-Bold', fontSize=12, textColor=c_amber, spaceAfter=6)))
    story.append(Paragraph("Plataforma Integral MOTOSERVICE<br/>NeroElectric Motors", title_cover))
    story.append(Paragraph(
        "Solución omnicanal para el mercado peruano de movilidad eléctrica: E-commerce de alta precisión, diagnóstico técnico asistido por Inteligencia Artificial y ERP operativo con facturación electrónica SUNAT y guías de remisión.",
        subtitle_cover
    ))

    story.append(HRFlowable(width="100%", thickness=1.5, color=c_amber, spaceBefore=5, spaceAfter=20))

    # Ficha ejecutiva de la portada
    summary_data = [
        [
            Paragraph("<b>Pilar Arquitectónico</b>", table_header),
            Paragraph("<b>Detalle de Implementación</b>", table_header)
        ],
        [
            Paragraph("<b>Web 1: Tienda Pública</b>", table_cell_bold),
            Paragraph("Next.js 16, React 19, Catálogo EV, Buscador de Compatibilidad, Checkout Perú con Ubigeo (25 departamentos) y Pasarela Culqi 3DS 2.0.", table_cell)
        ],
        [
            Paragraph("<b>Web 2: Portal Admin ERP</b>", table_cell_bold),
            Paragraph("admin-panel/ independiente, RBAC estricto, 10 módulos operativos, facturación SUNAT (A4, 80mm, XML), GRE y scrapers.", table_cell)
        ],
        [
            Paragraph("<b>Asistente IA VoltIA</b>", table_cell_bold),
            Paragraph("Soporte dual Google Gemini / OpenAI con Tool Calling automático, detección de riesgo eléctrico y agendamiento a taller.", table_cell)
        ],
        [
            Paragraph("<b>Capa de Datos</b>", table_cell_bold),
            Paragraph("Supabase PostgreSQL unificado con Row Level Security (RLS) activo y persistencia transaccional.", table_cell)
        ],
        [
            Paragraph("<b>Calidad y Validación</b>", table_cell_bold),
            Paragraph("127 pruebas automatizadas superadas al 100%, accesibilidad WCAG 2.2 AA y cumplimiento tributario SUNAT.", table_cell)
        ]
    ]

    t_summary = Table(summary_data, colWidths=[5 * cm, 12 * cm])
    t_summary.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_primary),
        ('GRID', (0,0), (-1,-1), 0.5, c_border),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#f8fafc")]),
        ('PADDING', (0,0), (-1,-1), 7),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(t_summary)

    story.append(Spacer(1, 2.5 * cm))
    story.append(Paragraph("<b>Preparado para:</b> Equipo Directivo, Operaciones, Desarrollo y Clientes Corporativos", ParagraphStyle('Foot', fontName='Helvetica', fontSize=8.5, textColor=c_muted)))
    story.append(Paragraph("<b>Entorno:</b> Producción &middot; Dominios: <code>neroelectricmotors.com</code> y <code>panel.neroelectricmotors.com</code>", ParagraphStyle('Foot2', fontName='Helvetica', fontSize=8, textColor=c_muted)))

    story.append(PageBreak())

    # =========================================================================
    # CAPÍTULO 1: ARQUITECTURA GENERAL Y AISLAMIENTO
    # =========================================================================
    story.append(Paragraph("1. Arquitectura General del Ecosistema", h1))
    story.append(Paragraph(
        "El sistema ha sido estructurado siguiendo el principio de <b>separación estricta de dominios y responsabilidades</b>. Se compone de dos aplicaciones Next.js 16 desacopladas que consumen una base de datos centralizada en Supabase:",
        body
    ))

    arch_table = [
        [Paragraph("<b>Componente</b>", table_header), Paragraph("<b>Directorio</b>", table_header), Paragraph("<b>Puerto / Dominio</b>", table_header), Paragraph("<b>Nivel de Seguridad</b>", table_header)],
        [
            Paragraph("<b>Web 1: Tienda Pública</b>", table_cell_bold),
            Paragraph("<code>./app</code> (Raíz)", table_cell),
            Paragraph("Puerto 3000<br/>neroelectricmotors.com", table_cell),
            Paragraph("Público & Clientes autenticados. Bloquea /api/admin/* con 404.", table_cell)
        ],
        [
            Paragraph("<b>Web 2: Portal Admin ERP</b>", table_cell_bold),
            Paragraph("<code>admin-panel/</code>", table_cell),
            Paragraph("Puerto 3001<br/>panel.neroelectricmotors.com", table_cell),
            Paragraph("RBAC estricto en servidor. Acceso exclusivo a usuarios con rol admin.", table_cell)
        ],
        [
            Paragraph("<b>Base de Datos Central</b>", table_cell_bold),
            Paragraph("Supabase Cloud", table_cell),
            Paragraph("Cluster PostgreSQL<br/>tbznauwbvhsbmsbcodes", table_cell),
            Paragraph("Row Level Security (RLS) en tablas sensibles. Transacciones ACID.", table_cell)
        ]
    ]

    t_arch = Table(arch_table, colWidths=[4 * cm, 3 * cm, 4.5 * cm, 5.5 * cm])
    t_arch.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_secondary),
        ('GRID', (0,0), (-1,-1), 0.5, c_border),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#f8fafc")]),
        ('PADDING', (0,0), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(t_arch)
    story.append(Spacer(1, 0.4 * cm))

    story.append(Paragraph("<b>Mecanismos Clave de Aislamiento:</b>", h2))
    story.append(Paragraph("&bull; <b>Middleware de Bloqueo (proxy.ts en Web 1):</b> Cualquier petición que intente consultar endpoints administrativos (/api/admin/*) desde la tienda pública es interceptada de inmediato y rechazada con un código HTTP 404 (Not Found), garantizando que ningún vector de ataque administrativo sea expuesto en el storefront.", bullet))
    story.append(Paragraph("&bull; <b>Aislamiento de Despliegue en Vercel:</b> Ambos proyectos se compilan como aplicaciones independientes de Vercel. Web 2 incluye cabeceras de servidor <code>X-Robots-Tag: noindex, nofollow, noarchive</code> para impedir que los motores de búsqueda indexen el panel ERP.", bullet))

    # =========================================================================
    # CAPÍTULO 2: WEB 1 — TIENDA PÚBLICA Y E-COMMERCE
    # =========================================================================
    story.append(Spacer(1, 0.4 * cm))
    story.append(Paragraph("2. Web 1: Tienda Comercial y Experiencia de Usuario", h1))
    story.append(Paragraph(
        "La tienda pública ha sido diseñada específicamente para resolver la incertidumbre de compra de repuestos y vehículos eléctricos en el Perú:",
        body
    ))

    story.append(Paragraph("<b>A. Catálogo de Motos Eléctricas (/motos):</b>", h2))
    story.append(Paragraph("Exhibición homologada de scooters, motos urbanas, choppers y motocargas de fabricantes líderes (Century Motors, Greenline, Yadea, Kayencorp). Cuenta con filtros técnicos por voltaje nominal (48V, 60V, 72V) y potencia (800W a 3000W+), así como un comparador interactivo para evaluar velocidad, autonomía y capacidad de batería cara a cara.", body))

    story.append(Paragraph("<b>B. Catálogo Oficial de Repuestos (/repuestos):</b>", h2))
    story.append(Paragraph("Inventario estructurado de componentes de reemplazo: baterías de litio LiFePO4, baterías de plomo-gel, controladores brushless programables, motores hub directos, cargadores con corte automático y sistemas de frenos hidráulicos. Cada ítem incluye control visual de ciclo de vida (ACTIVO, AGOTADO, DESCONTINUADO).", body))

    story.append(Paragraph("<b>C. Buscador Certificado de Compatibilidad (/compatibilidad):</b>", h2))
    story.append(Paragraph("Herramienta interactiva que permite al cliente seleccionar su modelo de moto y validar qué repuestos son compatibles, clasificándolos en 4 niveles:", body))

    compat_levels = [
        [Paragraph("<b>Nivel de Compatibilidad</b>", table_header), Paragraph("<b>Criterio Técnico y de Garantía</b>", table_header)],
        [Paragraph("<font color='#059669'><b>CONFIRMADA</b></font>", table_cell_bold), Paragraph("Plug & Play. Conectores, voltaje, amperaje y montaje mecánico 100% idénticos al original.", table_cell)],
        [Paragraph("<font color='#0284c7'><b>ADAPTABLE</b></font>", table_cell_bold), Paragraph("Mismo voltaje y potencia nominal. Requiere cambio menor de conectores (ej. Anderson a XT90).", table_cell)],
        [Paragraph("<font color='#d97706'><b>CON MODIFICACIÓN</b></font>", table_cell_bold), Paragraph("Exige reprogramación del controlador o soporte adicional en el chasis por un técnico calificado.", table_cell)],
        [Paragraph("<font color='#dc2626'><b>NO COMPATIBLE</b></font>", table_cell_bold), Paragraph("Incompatibilidad de voltaje o sobrecorriente. Su instalación causaría avería o riesgo de incendio.", table_cell)],
    ]
    t_compat = Table(compat_levels, colWidths=[4.5 * cm, 12.5 * cm])
    t_compat.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_secondary),
        ('GRID', (0,0), (-1,-1), 0.5, c_border),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#f8fafc")]),
        ('PADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_compat)

    story.append(PageBreak())

    # =========================================================================
    # CAPÍTULO 3: CHECKOUT, PERÚ Y PAGOS
    # =========================================================================
    story.append(Paragraph("3. Checkout Adaptado a Perú y Pasarela Culqi 3DS", h1))
    story.append(Paragraph(
        "El flujo de finalización de compra (/checkout) incorpora las particularidades comerciales y tributarias del mercado peruano:",
        body
    ))

    story.append(Paragraph("&bull; <b>Ubigeo Nacional Integrado:</b> Menús dinámicos con los <b>25 departamentos, 196 provincias y más de 1,800 distritos</b> del Perú para cálculo preciso de tarifas de encomienda y despacho a domicilio.", bullet))
    story.append(Paragraph("&bull; <b>Modalidad '¿Quién recibirá el pedido?':</b> Permite al titular autorizar a un tercero para recepcionar el paquete o retirarlo en almacén, validando estrictamente su nombre y DNI.", bullet))
    story.append(Paragraph("&bull; <b>Comprobantes SUNAT:</b> Selección interactiva entre Boleta de Venta (con validación de DNI de 8 dígitos) o Factura Electrónica (con RUC de 11 dígitos con validación de prefijo 10 o 20).", bullet))
    story.append(Paragraph("&bull; <b>Pasarela de Pagos Culqi 3DS 2.0:</b> Tokenización en cliente mediante Culqi JS v4 y procesamiento seguro en el servidor con clave secreta. Soporta el desafío bancario 3D Secure (doble factor de autenticación OTP) y cuenta con bloqueo de concurrencia e idempotencia para impedir duplicidad de cobros.", bullet))

    story.append(Spacer(1, 0.4 * cm))
    story.append(Paragraph("4. Seguimiento de Órdenes y Garage Digital (/cuenta)", h1))
    story.append(Paragraph(
        "La experiencia post-venta acompaña al cliente en todas las etapas del ciclo de vida del vehículo:",
        body
    ))
    story.append(Paragraph("&bull; <b>Tracking en Tiempo Real (/pedido/[id]):</b> Línea de tiempo interactiva con los estados operativos: <code>PENDIENTE &rarr; EN_PREPARACIÓN &rarr; DESPACHADO &rarr; ENTREGADO</code>. Incluye código de seguimiento de transportistas (Olva, Shalom, etc.), descarga directa de comprobantes (PDF y XML) y botón interactivo para dialogar con VoltIA sobre la orden.", bullet))
    story.append(Paragraph("&bull; <b>Garage Digital (/cuenta):</b> Padrón de vehículos del cliente registrado en dos modalidades: catálogo oficial (con autocompletado de especificaciones) o modalidad personalizada (con validación de rangos seguros: 12V a 144V y 100W a 50,000W).", bullet))

    # =========================================================================
    # CAPÍTULO 4: ASISTENTE INTELIGENTE VOLTIA
    # =========================================================================
    story.append(Spacer(1, 0.4 * cm))
    story.append(Paragraph("5. VoltIA: Asistente Técnico y Diagnóstico con IA", h1))
    story.append(Paragraph(
        "VoltIA es un asistente conversacional inteligente desplegado en toda la tienda mediante un widget flotante en tiempo real:",
        body
    ))

    voltia_cards = [
        [Paragraph("<b>Capacidad Técnica</b>", table_header), Paragraph("<b>Descripción Funcional</b>", table_header)],
        [
            Paragraph("<b>Soporte Dual LLM</b>", table_cell_bold),
            Paragraph("Compatible tanto con <b>Google Gemini</b> (<code>gemini-3.5-flash-lite</code>) como con <b>OpenAI</b> (<code>gpt-4o-mini</code>). La plataforma detecta automáticamente las credenciales activas del servidor sin requerir reescritura de código.", table_cell)
        ],
        [
            Paragraph("<b>Tool Calling Real (3 herramientas)</b>", table_cell_bold),
            Paragraph("<b>1. search_catalog:</b> Consulta inventario y precios reales.<br/><b>2. check_compatibility:</b> Valida voltajes y anclajes mecánicos.<br/><b>3. track_order:</b> Ubica órdenes sin exponer información privada sensible.", table_cell)
        ],
        [
            Paragraph("<b>Protocolo de Riesgo Eléctrico</b>", table_cell_bold),
            Paragraph("Intercepta heurísticamente términos críticos (humo, chispas, olor a quemado, calentamiento de batería) para emitir una advertencia roja de seguridad y ordenar la desconexión inmediata.", table_cell)
        ],
        [
            Paragraph("<b>Derivación a Taller Oficial</b>", table_cell_bold),
            Paragraph("Genera automáticamente solicitudes de auxilio mecánico o diagnóstico en la tabla <code>solicitudes_asistencia</code> para contacto por técnicos humanos.", table_cell)
        ]
    ]

    t_voltia = Table(voltia_cards, colWidths=[5 * cm, 12 * cm])
    t_voltia.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_secondary),
        ('GRID', (0,0), (-1,-1), 0.5, c_border),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#f8fafc")]),
        ('PADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t_voltia)

    story.append(PageBreak())

    # =========================================================================
    # CAPÍTULO 5: WEB 2 — PORTAL DE ADMINISTRACIÓN ERP
    # =========================================================================
    story.append(Paragraph("6. Web 2: Portal Administrativo Independiente (ERP)", h1))
    story.append(Paragraph(
        "El Portal de Administración (<code>admin-panel/</code>) constituye el centro neurálgico de operaciones comerciales, logísticas y fiscales de NeroElectric Motors. Está protegido por guardianes de servidor (<code>requireAdmin</code>) y no expone rutas a usuarios sin rol <code>admin</code>.",
        body
    ))

    story.append(Paragraph("<b>Los 10 Módulos Operativos del Dashboard:</b>", h2))

    modules_data = [
        [Paragraph("<b>#</b>", table_header), Paragraph("<b>Módulo</b>", table_header), Paragraph("<b>Funcionalidad Operativa Principal</b>", table_header)],
        [Paragraph("1", table_cell_bold), Paragraph("<b>Resumen Operativo</b>", table_cell_bold), Paragraph("KPIs ejecutivos en vivo: pedidos pendientes, pedidos en preparación, solicitudes de taller y alertas de stock bajo.", table_cell)],
        [Paragraph("2", table_cell_bold), Paragraph("<b>Catálogo Maestro</b>", table_cell_bold), Paragraph("Gestión completa de marcas, modelos de motos, repuestos, compatibilidades y estados de producto.", table_cell)],
        [Paragraph("3", table_cell_bold), Paragraph("<b>Inventario Propio / Prov.</b>", table_cell_bold), Paragraph("Comparativa de stock físico en almacén frente a existencias de distribuidores (Century, Greenline, etc.).", table_cell)],
        [Paragraph("4", table_cell_bold), Paragraph("<b>Pedidos y Ventas POS</b>", table_cell_bold), Paragraph("Control de ciclo de despacho, asignación de tracking de transporte y actualización transaccional.", table_cell)],
        [Paragraph("5", table_cell_bold), Paragraph("<b>Clientes e Invitados</b>", table_cell_bold), Paragraph("Padrón de compradores con su historial de órdenes y vehículos vinculados.", table_cell)],
        [Paragraph("6", table_cell_bold), Paragraph("<b>Promociones</b>", table_cell_bold), Paragraph("Gestión de cupones de descuento y control de base de datos de suscriptores al newsletter.", table_cell)],
        [Paragraph("7", table_cell_bold), Paragraph("<b>Facturación SUNAT</b>", table_cell_bold), Paragraph("Emisión, consulta y descarga de comprobantes en PDF A4, Ticket Térmico 80 mm y XML UBL 2.1.", table_cell)],
        [Paragraph("8", table_cell_bold), Paragraph("<b>Despachos y Guías GRE</b>", table_cell_bold), Paragraph("Generación de Guías de Remisión Electrónica Remitente según la normativa R.S. 123-2022/SUNAT.", table_cell)],
        [Paragraph("9", table_cell_bold), Paragraph("<b>VoltIA y Taller</b>", table_cell_bold), Paragraph("Bandeja de solicitudes de auxilio mecánico y citas técnicas capturadas por el asistente virtual.", table_cell)],
        [Paragraph("10", table_cell_bold), Paragraph("<b>Importador y Scrapers</b>", table_cell_bold), Paragraph("Carga masiva CSV/JSON con delimitación automática y motor de reclasificación de repuestos a motos.", table_cell)],
    ]

    t_modules = Table(modules_data, colWidths=[0.8 * cm, 4.5 * cm, 11.7 * cm])
    t_modules.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_primary),
        ('GRID', (0,0), (-1,-1), 0.5, c_border),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#f8fafc")]),
        ('PADDING', (0,0), (-1,-1), 5),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(t_modules)

    story.append(Spacer(1, 0.4 * cm))
    story.append(Paragraph("7. Facturación SUNAT y Guías de Remisión (GRE)", h1))
    story.append(Paragraph(
        "El módulo de facturación está diseñado para cumplir de manera estricta la regulación fiscal peruana:",
        body
    ))
    story.append(Paragraph("&bull; <b>Comprobantes Electrónicos Canónicos:</b> Emisión de Boletas y Facturas en tres formatos oficiales: <b>PDF A4</b> (formato legal para archivo y contabilidad), <b>Ticket Térmico 80 mm</b> (optimizado para impresoras de punto de venta) y <b>XML UBL 2.1</b> con firma digital y digest de seguridad.", bullet))
    story.append(Paragraph("&bull; <b>Guías de Remisión Electrónica (GRE):</b> Emisión de guías remitente con cálculo automático de peso bruto en kg, motivo de traslado y modalidad de transporte: <i>Privado</i> (captura datos del conductor, licencia y placa) o <i>Público</i> (vincula RUC y razón social de la empresa de transporte interprovincial).", bullet))

    story.append(PageBreak())

    # =========================================================================
    # CAPÍTULO 6: RECLASIFICACIÓN, BASE DE DATOS Y CALIDAD
    # =========================================================================
    story.append(Paragraph("8. Ingesta Masiva y Reclasificación Inteligente", h1))
    story.append(Paragraph(
        "El ERP resuelve de forma automatizada los errores comunes provenientes de proveedores externos o scrapers web mediante su motor de reclasificación:",
        body
    ))
    story.append(Paragraph("&bull; <b>Inferencia Algorítmica:</b> Si un proveedor publica 'Motocarga Eléctrica 1000W 60V' dentro de la categoría de repuestos, el motor detecta automáticamente la potencia, voltaje y marca, transformándolo en un vehículo eléctrico completo oficial en la tabla <code>modelos_moto</code> con su correspondiente slug.", bullet))
    story.append(Paragraph("&bull; <b>Tolerancia de Importación:</b> El parser CSV admite archivos con o sin UTF-8 BOM, saltos de línea entre comillas, y detecta automáticamente separadores de coma, punto y coma o tabulador.", bullet))

    story.append(Spacer(1, 0.4 * cm))
    story.append(Paragraph("9. Estructura de Base de Datos (Supabase PostgreSQL)", h1))
    story.append(Paragraph(
        "El modelo relacional garantiza consistencia e integridad en todas las transacciones:",
        body
    ))

    db_tables = [
        [Paragraph("<b>Tabla</b>", table_header), Paragraph("<b>Propósito y Relaciones</b>", table_header)],
        [Paragraph("<code>marcas</code>", table_cell_bold), Paragraph("Fabricantes autorizados: Century Motors, Greenline, Yadea, Kayencorp.", table_cell)],
        [Paragraph("<code>modelos_moto</code>", table_cell_bold), Paragraph("Fichas técnicas con voltajes nominales, potencia W, velocidad máx y fotos verificadas.", table_cell)],
        [Paragraph("<code>repuestos</code>", table_cell_bold), Paragraph("Inventario clasificado por SKU, stock disponible, precio en Soles y estado operativo.", table_cell)],
        [Paragraph("<code>compatibilidades</code>", table_cell_bold), Paragraph("Relación M:N entre repuestos y motos con nivel de verificación técnica.", table_cell)],
        [Paragraph("<code>pedidos / detalles</code>", table_cell_bold), Paragraph("Cabecera y líneas de compra, ubigeo de despacho, totales e historial de tracking.", table_cell)],
        [Paragraph("<code>documentos_fiscales</code>", table_cell_bold), Paragraph("Registro tributario con XML firmado y representaciones gráficas SUNAT.", table_cell)],
        [Paragraph("<code>guias_remision</code>", table_cell_bold), Paragraph("Guías GRE asociadas a despachos terrestres con conductores y transportistas.", table_cell)],
        [Paragraph("<code>solicitudes_asistencia</code>", table_cell_bold), Paragraph("Tickets de servicio técnico y auxilio mecánico capturados por VoltIA.", table_cell)],
        [Paragraph("<code>user_roles</code>", table_cell_bold), Paragraph("Control de roles con políticas RLS (clientes estándar vs administradores autorizados).", table_cell)]
    ]

    t_db = Table(db_tables, colWidths=[4.5 * cm, 12.5 * cm])
    t_db.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_secondary),
        ('GRID', (0,0), (-1,-1), 0.5, c_border),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#f8fafc")]),
        ('PADDING', (0,0), (-1,-1), 4.5),
    ]))
    story.append(t_db)

    story.append(Spacer(1, 0.4 * cm))
    story.append(Paragraph("10. Calidad de Software y Suite de Pruebas", h1))
    story.append(Paragraph(
        "La estabilidad del sistema está certificada mediante una suite de pruebas automatizadas ejecutada directamente sobre el motor nativo <code>node:test</code>:",
        body
    ))
    story.append(Paragraph("&bull; <b>127 pruebas unitarias y de integración pasando al 100%</b> (0 errores, 0 cancelaciones).", bullet))
    story.append(Paragraph("&bull; <b>Auditorías de Seguridad:</b> Verificación de cero exposición de secretos, protección contra ataques IDOR, mitigación de Open Redirects y blindaje contra manipulación de roles.", bullet))
    story.append(Paragraph("&bull; <b>Accesibilidad WCAG 2.2 AA:</b> Cumplimiento estricto de ratios de contraste cromático superiores a 4.5:1 en todas las interfaces de usuario.", bullet))

    # =========================================================================
    # CAPÍTULO 7: GUÍA RÁPIDA DE DESPLIEGUE Y COMANDOS
    # =========================================================================
    story.append(Spacer(1, 0.4 * cm))
    story.append(Paragraph("11. Guía Operativa de Comandos", h1))

    cmd_data = [
        [Paragraph("<b>Comando</b>", table_header), Paragraph("<b>Finalidad Operativa</b>", table_header)],
        [Paragraph("<code>npm run dev</code>", table_cell_bold), Paragraph("Inicia la Tienda Pública en http://localhost:3000.", table_cell)],
        [Paragraph("<code>npm run dev:admin</code>", table_cell_bold), Paragraph("Inicia el Portal Administrativo ERP en http://localhost:3001.", table_cell)],
        [Paragraph("<code>npm test</code>", table_cell_bold), Paragraph("Ejecuta las 127 pruebas automatizadas de regresión.", table_cell)],
        [Paragraph("<code>npm run build:all</code>", table_cell_bold), Paragraph("Compila y valida la producción de ambas aplicaciones simultáneamente.", table_cell)],
        [Paragraph("<code>npm run scrape:sync</code>", table_cell_bold), Paragraph("Sincroniza y actualiza catálogos directamente con la base de datos.", table_cell)]
    ]
    t_cmd = Table(cmd_data, colWidths=[4.5 * cm, 12.5 * cm])
    t_cmd.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_primary),
        ('GRID', (0,0), (-1,-1), 0.5, c_border),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#f8fafc")]),
        ('PADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_cmd)

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF generado exitosamente en: {filename}")

if __name__ == '__main__':
    filename = sys.argv[1] if len(sys.argv) > 1 else "MOTOSERVICE_Dossier_Ejecutivo_y_Tecnico.pdf"
    build_pdf(filename)
