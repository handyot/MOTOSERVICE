'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AuthAccount, OrderStatus, AdminUserRecord } from '../../types';
import { signOutAction } from '../../lib/auth/actions';
import { Icon } from '../ui/Icons';
import { formatCurrency } from '../../lib/formatters.js';
import { CatalogImporterView, ImportHistoryRecord } from './CatalogImporterView';
import { getProductStatusBadge, PRODUCT_STATUSES } from '../../lib/catalog/product-status-core.mjs';
import {
  inferVehicleDataFromPart,
  VEHICLE_TYPE_LABELS,
  CATALOG_DESTINATIONS,
} from '../../lib/catalog/reclassify-core.mjs';
import {
  filterUsers,
  formatUserStatus,
  ALLOWED_USER_ROLES,
} from '../../lib/users/user-core.mjs';

export interface AdminStats {
  totalMarcas: number;
  totalModelos: number;
  totalRepuestos: number;
  totalCompatibilidades: number;
  pedidosPendientes?: number;
  pedidosConfirmados?: number;
  pedidosEnPreparacion?: number;
  solicitudesPendientes?: number;
  stockBajoCount?: number;
}

export interface AdminOrderRecord {
  id_pedido: string;
  numero_pedido: string;
  cliente_nombre: string;
  cliente_email: string;
  cliente_telefono?: string | null;
  doc_numero: string;
  tipo_comprobante: string;
  modalidad_entrega: string;
  total: number | string;
  moneda: string;
  estado_pago: string;
  estado_pedido: OrderStatus;
  estado_comprobante: string;
  es_invitado: boolean;
  created_at?: string;
}

export interface AdminDocumentRecord {
  id_documento: string;
  id_pedido?: string;
  tipo: string;
  serie?: string;
  numero?: string;
  datos_receptor?: {
    businessName?: string;
    docNumber?: string;
    docType?: string;
    direccion?: string;
  };
  total_gravada?: number | string;
  total_igv?: number | string;
  total_comprobante?: number | string;
  estado: string;
  observaciones?: string;
  metadatos?: any;
  created_at?: string;
}

function SafeCatalogImage({
  src,
  alt,
  className,
}: {
  src?: string | null;
  alt: string;
  className?: string;
}) {
  const [imgSrc, setImgSrc] = useState<string | null>(() => {
    if (!src) return null;
    if (src.includes('centurymotors.pe') && src.endsWith('.webp')) {
      return src.replace(/\.webp$/, '.jpg');
    }
    return src;
  });
  const [hasError, setHasError] = useState(false);

  React.useEffect(() => {
    if (!src) {
      setImgSrc(null);
      setHasError(false);
      return;
    }
    const resolved =
      src.includes('centurymotors.pe') && src.endsWith('.webp')
        ? src.replace(/\.webp$/, '.jpg')
        : src;
    setImgSrc(resolved);
    setHasError(false);
  }, [src]);

  if (!imgSrc || hasError) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-slate-100 text-slate-400 p-0.5 select-none rounded">
        <Icon name="bike" className="w-5 h-5 text-slate-400" />
        <span className="text-[8px] font-semibold text-slate-500 uppercase tracking-tighter text-center">
          NERO EV
        </span>
      </div>
    );
  }

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className || 'h-full w-full object-contain'}
      loading="lazy"
      onError={() => {
        if (imgSrc.includes('centurymotors.pe') && imgSrc.endsWith('.webp')) {
          setImgSrc(imgSrc.replace(/\.webp$/, '.jpg'));
        } else {
          setHasError(true);
        }
      }}
    />
  );
}

export interface AdminAssistanceRecord {
  id_solicitud: string;
  nombre_contacto: string;
  email_contacto: string;
  telefono_contacto?: string | null;
  tipo_solicitud: string;
  descripcion: string;
  detalles_tecnicos?: {
    brand?: string;
    model?: string;
    symptom?: string;
    [key: string]: any;
  } | null;
  estado?: string;
  created_at?: string;
}

export interface AdminSubscriptionRecord {
  id_suscripcion?: string;
  email: string;
  origen: string;
  created_at?: string;
}

export interface AdminBrandRecord {
  id_marca: number;
  nombre: string;
  pais_origen?: string | null;
  estado: boolean;
  isFallback?: boolean;
}

export interface AdminModelRecord {
  id_modelo: number;
  id_marca: number;
  nombre: string;
  voltaje_nominal_v?: number | null;
  potencia_motor_w?: number | null;
  imagen_url?: string | null;
  estado: boolean;
  isFallback?: boolean;
}

export interface AdminPartRecord {
  id_repuesto: number;
  id_categoria: number;
  codigo_sku: string;
  nombre: string;
  precio: number | string;
  moneda: string;
  imagen_url?: string | null;
  estado: boolean;
  data_status?: string;
  notas?: string | null;
  stock_propio_ecomoto?: number | null;
  stock_proveedor?: string | null;
  precio_proveedor_pen?: number | null;
  precio_regular_proveedor_pen?: number | null;
  precio_min_pen?: number | null;
  precio_max_pen?: number | null;
  source_url?: string | null;
  isFallback?: boolean;
}

export interface AdminCompatibilityRecord {
  id_compatibilidad: number;
  id_repuesto: number;
  id_modelo: number;
  es_compatible: boolean;
  nivel_verificacion: string;
  notas_tecnicas?: string | null;
  isFallback?: boolean;
}

type ModuleId =
  | 'resumen'
  | 'catalogo_db'
  | 'productos'
  | 'pedidos'
  | 'clientes'
  | 'promociones'
  | 'facturacion'
  | 'despacho'
  | 'voltia'
  | 'importador'
  | 'usuarios';

interface NavItem {
  id: ModuleId;
  label: string;
  shortLabel: string;
  icon: string;
  count?: number;
}

interface NavGroup {
  groupTitle: string;
  items: NavItem[];
}

interface AdminDashboardViewProps {
  account: AuthAccount;
  stats: AdminStats;
  initialOrders?: AdminOrderRecord[];
  initialAssistance?: AdminAssistanceRecord[];
  initialDocuments?: AdminDocumentRecord[];
  initialSubscriptions?: AdminSubscriptionRecord[];
  initialImportHistory?: ImportHistoryRecord[];
  initialBrands?: AdminBrandRecord[];
  initialModels?: AdminModelRecord[];
  initialParts?: AdminPartRecord[];
  initialCompatibilities?: AdminCompatibilityRecord[];
  initialUsers?: AdminUserRecord[];
  initialPersistedParts?: AdminPartRecord[];
  persistedPartsError?: string | null;
  queryErrors?: Record<string, string>;
}

export function AdminDashboardView({
  account,
  stats: initialStats,
  initialOrders = [],
  initialAssistance = [],
  initialDocuments = [],
  initialSubscriptions = [],
  initialImportHistory = [],
  initialBrands = [],
  initialModels = [],
  initialParts = [],
  initialCompatibilities = [],
  initialUsers = [],
  initialPersistedParts = [],
  persistedPartsError = null,
  queryErrors = {},
}: AdminDashboardViewProps) {
  const [activeModule, setActiveModule] = useState<ModuleId>('resumen');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Datos reactivos de operación
  const [stats, setStats] = useState<AdminStats>(initialStats);
  const [orders, setOrders] = useState<AdminOrderRecord[]>(initialOrders);
  const [brands, setBrands] = useState<AdminBrandRecord[]>(initialBrands);
  const [models, setModels] = useState<AdminModelRecord[]>(initialModels);
  const [parts, setParts] = useState<AdminPartRecord[]>(initialParts);
  const [compatibilities, setCompatibilities] = useState<AdminCompatibilityRecord[]>(
    initialCompatibilities
  );
  const [documents, setDocuments] = useState<AdminDocumentRecord[]>(initialDocuments);
  const [downloadingDocId, setDownloadingDocId] = useState<string | null>(null);

  const handleDownloadDocument = (docId: string, format: 'a4' | '80mm' | 'xml') => {
    setDownloadingDocId(`${docId}-${format}`);
    try {
      const url = `/api/admin/documents/${encodeURIComponent(docId)}/download?format=${format}`;
      window.open(url, '_blank');
    } finally {
      setTimeout(() => setDownloadingDocId(null), 1200);
    }
  };

  // Estados operativos de Despachos y Guías de Remisión (GRE)
  const [despachoSearch, setDespachoSearch] = useState('');
  const [despachoStatusFilter, setDespachoStatusFilter] = useState('ALL');
  const [isGreModalOpen, setIsGreModalOpen] = useState(false);
  const [selectedOrderForGre, setSelectedOrderForGre] = useState<AdminOrderRecord | null>(null);
  const [isSubmittingGre, setIsSubmittingGre] = useState(false);
  const [greFormError, setGreFormError] = useState<string | null>(null);
  const [greFormSuccess, setGreFormSuccess] = useState<string | null>(null);

  const [greForm, setGreForm] = useState({
    motivoTraslado: 'VENTA',
    modalidadTransporte: 'PRIVADO' as 'PRIVADO' | 'PUBLICO',
    fechaInicioTraslado: new Date().toISOString().split('T')[0],
    puntoPartida: 'Av. César Canevaro 1332, Lince, Lima',
    puntoLlegada: '',
    pesoBrutoTotalKg: 5.0,
    conductorNombre: 'Carlos Ramos Quispe',
    conductorDni: '45892134',
    conductorLicencia: 'Q45892134',
    conductorPlaca: 'B12-890',
    conductorMarca: 'Haojue Express',
    transportistaRazonSocial: 'OLVA COURIER S.A.C.',
    transportistaRuc: '20100686814',
  });

  const refreshCatalogData = async () => {
    try {
      const res = await fetch('/api/admin/catalog/manage');
      const data = await res.json();
      if (data.success) {
        if (Array.isArray(data.brands)) setBrands(data.brands);
        if (Array.isArray(data.models)) setModels(data.models);
        if (Array.isArray(data.parts)) setParts(data.parts);
        if (Array.isArray(data.compatibilities)) setCompatibilities(data.compatibilities);
        if (data.stats) setStats(data.stats);
      }
    } catch {
      // Silencioso
    }
  };

  // Feedback global de acciones operativas
  const [statusFeedback, setStatusFeedback] = useState<{
    type: 'success' | 'error' | 'warning';
    text: string;
  } | null>(null);
  const [isUpdatingOrder, setIsUpdatingOrder] = useState<string | null>(null);

  // Sub-vista y filtros del módulo Catálogo Base (Módulo B)
  const [catalogEntityTab, setCatalogEntityTab] = useState<
    'modelos' | 'repuestos' | 'compatibilidades' | 'marcas'
  >('modelos');
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogBrandFilter, setCatalogBrandFilter] = useState<string>('ALL');
  const [isSubmittingCatalog, setIsSubmittingCatalog] = useState(false);

  // Estados de formularios de alta en Catálogo Base (conectados a /api/admin/catalog/manage)
  const [newBrandName, setNewBrandName] = useState('');
  const [newBrandOrigin, setNewBrandOrigin] = useState('China');

  const [newModelBrandId, setNewModelBrandId] = useState(
    initialBrands[0]?.id_marca ? String(initialBrands[0].id_marca) : '1'
  );
  const [newModelName, setNewModelName] = useState('');
  const [newModelVoltage, setNewModelVoltage] = useState('72');
  const [newModelPower, setNewModelPower] = useState('2000');

  const [newPartSku, setNewPartSku] = useState('');
  const [newPartName, setNewPartName] = useState('');
  const [newPartPrice, setNewPartPrice] = useState('');

  // Estados para acciones de gestión de repuestos (Issue #9)
  const [activePartMenuId, setActivePartMenuId] = useState<number | null>(null);
  const [blockModalPart, setBlockModalPart] = useState<AdminPartRecord | null>(null);
  const [blockReason, setBlockReason] = useState('');
  const [deleteModalPart, setDeleteModalPart] = useState<AdminPartRecord | null>(null);
  const [isProcessingPartAction, setIsProcessingPartAction] = useState(false);

  // Estados para acción Reclasificar / Mover a catálogo
  const [reclassifyModalItem, setReclassifyModalItem] = useState<{
    item: AdminPartRecord | AdminModelRecord;
    sourceEntity: 'repuestos' | 'modelos_moto';
  } | null>(null);
  const [reclassifyTargetList, setReclassifyTargetList] = useState<'modelos_ev' | 'repuestos' | 'fuera_catalogo'>('modelos_ev');
  const [reclassifyBrandId, setReclassifyBrandId] = useState<string>('');
  const [reclassifyModelName, setReclassifyModelName] = useState<string>('');
  const [reclassifyVehicleType, setReclassifyVehicleType] = useState<string>('MOTOCARGA_ELECTRICA');
  const [reclassifyVoltage, setReclassifyVoltage] = useState<string>('');
  const [reclassifyPowerW, setReclassifyPowerW] = useState<string>('');
  const [reclassifyPrice, setReclassifyPrice] = useState<string>('');
  const [reclassifyReason, setReclassifyReason] = useState<string>('');
  const [isProcessingReclassify, setIsProcessingReclassify] = useState(false);
  const [activeModelMenuId, setActiveModelMenuId] = useState<number | null>(null);

  const [newCompatPartId, setNewCompatPartId] = useState(
    initialParts[0]?.id_repuesto ? String(initialParts[0].id_repuesto) : ''
  );
  const [newCompatModelId, setNewCompatModelId] = useState(
    initialModels[0]?.id_modelo ? String(initialModels[0].id_modelo) : ''
  );
  const [newCompatLevel, setNewCompatLevel] = useState('CONFIRMADA');
  const [newCompatNotes, setNewCompatNotes] = useState('');

  // Filtros en Inventario Propio, Pedidos, Clientes, Facturación, VoltIA y Promociones
  const [inventorySearch, setInventorySearch] = useState('');
  const [inventoryCategoryFilter, setInventoryCategoryFilter] = useState('ALL');

  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('ALL');

  const [customerSearch, setCustomerSearch] = useState('');
  const [customerTypeFilter, setCustomerTypeFilter] = useState<'ALL' | 'REGISTERED' | 'GUEST'>('ALL');

  const [documentSearch, setDocumentSearch] = useState('');
  const [documentTypeFilter, setDocumentTypeFilter] = useState('ALL');

  const [assistanceSearch, setAssistanceSearch] = useState('');
  const [subscriptionSearch, setSubscriptionSearch] = useState('');

  // Estados para el Módulo de Gestión de Usuarios y Accesos
  const [users, setUsers] = useState<AdminUserRecord[]>(initialUsers);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'ALL' | 'admin' | 'customer'>('ALL');
  const [userStatusFilter, setUserStatusFilter] = useState<'ALL' | 'active' | 'banned'>('ALL');
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isProcessingUserAction, setIsProcessingUserAction] = useState(false);
  const [activeUserMenuId, setActiveUserMenuId] = useState<string | null>(null);

  // Modales interactivos de Usuarios
  const [roleModalUser, setRoleModalUser] = useState<AdminUserRecord | null>(null);
  const [targetUserRole, setTargetUserRole] = useState<'admin' | 'customer'>('admin');

  const [banModalUser, setBanModalUser] = useState<AdminUserRecord | null>(null);

  const [passwordModalUser, setPasswordModalUser] = useState<AdminUserRecord | null>(null);
  const [passwordResetMode, setPasswordResetMode] = useState<'link' | 'direct'>('link');
  const [directNewPassword, setDirectNewPassword] = useState('');
  const [generatedRecoveryLink, setGeneratedRecoveryLink] = useState<string | null>(null);

  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserFullName, setNewUserFullName] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin' | 'customer'>('customer');
  const [createUserError, setCreateUserError] = useState<string | null>(null);

  const storefrontUrl = process.env.NEXT_PUBLIC_STOREFRONT_URL || 'https://neroelectricmotors.com';

  const [persistedParts] = useState<AdminPartRecord[]>(
    initialPersistedParts && initialPersistedParts.length > 0
      ? initialPersistedParts
      : initialParts.filter((p) => !p.isFallback)
  );
  const [inventoryModeFilter, setInventoryModeFilter] = useState<'ALL' | 'DIRECT' | 'PROVIDER'>('ALL');

  const directSaleCount = useMemo(() => {
    return persistedParts.filter((p) => {
      const stock = typeof p.stock_propio_ecomoto === 'number' ? p.stock_propio_ecomoto : 0;
      const isCommerciallyActive = p.estado !== false && (!p.data_status || p.data_status === 'ACTIVO');
      return stock > 0 && isCommerciallyActive;
    }).length;
  }, [persistedParts]);

  const providerPartsCount = useMemo(() => {
    return persistedParts.filter((p) => {
      const stock = typeof p.stock_propio_ecomoto === 'number' ? p.stock_propio_ecomoto : 0;
      const isDirect = stock > 0 && p.estado !== false && (!p.data_status || p.data_status === 'ACTIVO');
      return !isDirect;
    }).length;
  }, [persistedParts]);

  // Mapa rápido de ID de marca -> Nombre
  const brandNameById = useMemo(() => {
    const map = new Map<number, string>();
    for (const b of brands) {
      map.set(b.id_marca, b.nombre);
    }
    return map;
  }, [brands]);

  // Mapa rápido de ID de modelo y repuesto para compatibilidades
  const modelNameById = useMemo(() => {
    const map = new Map<number, string>();
    for (const m of models) {
      const bName = brandNameById.get(m.id_marca);
      map.set(m.id_modelo, bName ? `${bName} ${m.nombre}` : m.nombre);
    }
    return map;
  }, [models, brandNameById]);

  const partNameById = useMemo(() => {
    const map = new Map<number, { name: string; sku: string }>();
    for (const p of parts) {
      map.set(p.id_repuesto, { name: p.nombre, sku: p.codigo_sku });
    }
    return map;
  }, [parts]);

  // Estructura de navegación agrupada según requerimiento 3A
  const navGroups: NavGroup[] = useMemo(
    () => [
      {
        groupTitle: 'General',
        items: [
          {
            id: 'resumen',
            label: 'Resumen operativo',
            shortLabel: 'Resumen',
            icon: 'layout-dashboard',
          },
        ],
      },
      {
        groupTitle: 'Catálogo e inventario',
        items: [
          {
            id: 'catalogo_db',
            label: 'Marcas, modelos, repuestos y compatibilidades',
            shortLabel: 'Catálogo Maestro',
            icon: 'database',
            count: stats.totalModelos + stats.totalRepuestos > 0 ? stats.totalModelos + stats.totalRepuestos : undefined,
          },
          {
            id: 'productos',
            label: 'Inventario propio vs proveedor',
            shortLabel: 'Inventario',
            icon: 'package',
            count: directSaleCount > 0 ? directSaleCount : 0,
          },
        ],
      },
      {
        groupTitle: 'Operaciones comerciales',
        items: [
          {
            id: 'pedidos',
            label: 'Pedidos y Ventas POS',
            shortLabel: 'Pedidos y POS',
            icon: 'shopping-bag',
            count: orders.length > 0 ? orders.length : undefined,
          },
          {
            id: 'clientes',
            label: 'Clientes e invitados',
            shortLabel: 'Clientes',
            icon: 'users',
            count: orders.length > 0 ? orders.length : undefined,
          },
          {
            id: 'promociones',
            label: 'Promociones',
            shortLabel: 'Promociones',
            icon: 'tag',
            count: initialSubscriptions.length > 0 ? initialSubscriptions.length : undefined,
          },
        ],
      },
      {
        groupTitle: 'Administración y logística',
        items: [
          {
            id: 'facturacion',
            label: 'Boletas y facturas SUNAT',
            shortLabel: 'Facturación SUNAT',
            icon: 'file-text',
            count: initialDocuments.length > 0 ? initialDocuments.length : undefined,
          },
          {
            id: 'despacho',
            label: 'Despachos y guías',
            shortLabel: 'Despachos',
            icon: 'truck',
          },
        ],
      },
      {
        groupTitle: 'Servicio y asistencia',
        items: [
          {
            id: 'voltia',
            label: 'VoltIA y asistencia técnica',
            shortLabel: 'VoltIA y taller',
            icon: 'headset',
            count: initialAssistance.length > 0 ? initialAssistance.length : undefined,
          },
        ],
      },
      {
        groupTitle: 'Herramientas',
        items: [
          {
            id: 'importador',
            label: 'Importador de catálogos CSV/JSON',
            shortLabel: 'Importador CSV/JSON',
            icon: 'upload',
          },
        ],
      },
      {
        groupTitle: 'Seguridad y accesos',
        items: [
          {
            id: 'usuarios',
            label: 'Gestión de usuarios, roles y accesos',
            shortLabel: 'Usuarios y Roles',
            icon: 'shield',
            count: users.length > 0 ? users.length : undefined,
          },
        ],
      },
    ],
    [
      stats.totalModelos,
      stats.totalRepuestos,
      directSaleCount,
      orders.length,
      initialSubscriptions.length,
      initialDocuments.length,
      initialAssistance.length,
      users.length,
    ]
  );

  // Obtener información contextual del módulo activo para el breadcrumb de la barra superior
  const activeItem = navGroups
    .flatMap((group) =>
      group.items.map((item) => ({
        groupTitle: group.groupTitle,
        label: item.label,
        shortLabel: item.shortLabel,
        id: item.id,
      }))
    )
    .find((entry) => entry.id === activeModule);

  const activeContext = activeItem || {
    groupTitle: 'General',
    label: 'Resumen operativo',
    shortLabel: 'Resumen',
  };

  const showFeedback = (type: 'success' | 'error' | 'warning', text: string) => {
    setStatusFeedback({ type, text });
    setTimeout(() => {
      setStatusFeedback((prev) => (prev?.text === text ? null : prev));
    }, 5000);
  };

  // Acción real: Actualizar estado de pedido
  const handleUpdateOrderStatus = async (orderId: string, targetStatus: OrderStatus) => {
    setIsUpdatingOrder(orderId);
    setStatusFeedback(null);
    try {
      const res = await fetch('/api/admin/orders/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, targetStatus }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id_pedido === orderId ? { ...o, estado_pedido: targetStatus } : o))
        );
        showFeedback('success', `Pedido actualizado correctamente al estado «${targetStatus}».`);
      } else {
        showFeedback('error', data.error || 'No se pudo actualizar el estado del pedido.');
      }
    } catch {
      showFeedback('error', 'Error de comunicación con el servidor administrativo.');
    } finally {
      setIsUpdatingOrder(null);
    }
  };

  // Acción real: Sincronizar pedidos en tiempo real con el POS
  const [isRefreshingOrders, setIsRefreshingOrders] = useState(false);
  const handleRefreshOrders = async () => {
    setIsRefreshingOrders(true);
    setStatusFeedback(null);
    try {
      const res = await fetch('/api/admin/orders/list');
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.orders)) {
        setOrders(data.orders);
        showFeedback('success', `Se sincronizaron ${data.orders.length} pedidos en tiempo real con el POS.`);
      } else {
        showFeedback('error', data.error || 'No se pudieron sincronizar los pedidos.');
      }
    } catch {
      showFeedback('error', 'Error de comunicación al sincronizar pedidos.');
    } finally {
      setIsRefreshingOrders(false);
    }
  };

  // Acción real: Alta de Marca
  const handleCreateBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrandName.trim()) return;
    setIsSubmittingCatalog(true);
    try {
      const res = await fetch('/api/admin/catalog/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entity: 'marcas',
          operation: 'create',
          payload: {
            nombre: newBrandName.trim(),
            pais_origen: newBrandOrigin.trim() || 'China',
          },
        }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.record) {
        setBrands((prev) => [...prev, data.record]);
        setNewBrandName('');
        showFeedback('success', `Marca «${data.record.nombre}» registrada en public.marcas.`);
      } else {
        showFeedback('warning', data.error || 'No se pudo registrar la marca.');
      }
    } catch {
      showFeedback('error', 'Error conectando con el servidor administrativo.');
    } finally {
      setIsSubmittingCatalog(false);
    }
  };

  // Acción real: Alta de Modelo EV
  const handleCreateModel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModelName.trim()) return;
    setIsSubmittingCatalog(true);
    try {
      const res = await fetch('/api/admin/catalog/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entity: 'modelos_moto',
          operation: 'create',
          payload: {
            id_marca: Number(newModelBrandId),
            nombre: newModelName.trim(),
            voltaje_nominal_v: Number(newModelVoltage) || null,
            potencia_motor_w: Number(newModelPower) || null,
          },
        }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.record) {
        setModels((prev) => [data.record, ...prev]);
        setNewModelName('');
        showFeedback('success', `Modelo «${data.record.nombre}» registrado en public.modelos_moto.`);
      } else {
        showFeedback('warning', data.error || 'No se pudo registrar el modelo.');
      }
    } catch {
      showFeedback('error', 'Error conectando con el servidor administrativo.');
    } finally {
      setIsSubmittingCatalog(false);
    }
  };

  // Acción real: Alta de Repuesto
  const handleCreatePart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartSku.trim() || !newPartName.trim()) return;
    if (!newPartSku.trim() || !newPartName.trim()) {
      showFeedback('warning', 'SKU y nombre del repuesto son obligatorios.');
      return;
    }

    const parsedPrice = Number(newPartPrice);
    if (!newPartPrice.trim() || isNaN(parsedPrice) || parsedPrice <= 0) {
      showFeedback('warning', 'El precio del repuesto debe ser un número válido mayor a cero.');
      return;
    }

    setIsSubmittingCatalog(true);
    try {
      const res = await fetch('/api/admin/catalog/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entity: 'repuestos',
          operation: 'create',
          payload: {
            id_categoria: 1,
            codigo_sku: newPartSku.trim(),
            nombre: newPartName.trim(),
            precio: parsedPrice,
          },
        }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.record) {
        setParts((prev) => [data.record, ...prev]);
        setNewPartSku('');
        setNewPartName('');
        setNewPartPrice('');
        showFeedback('success', `Repuesto «${data.record.nombre}» registrado en public.repuestos.`);
      } else {
        showFeedback('warning', data.error || 'No se pudo registrar el repuesto.');
      }
    } catch {
      showFeedback('error', 'Error conectando con el servidor administrativo.');
    } finally {
      setIsSubmittingCatalog(false);
    }
  };

  // Acción real: Alta de Compatibilidad
  const handleCreateCompatibility = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompatPartId || !newCompatModelId) return;
    setIsSubmittingCatalog(true);
    try {
      const res = await fetch('/api/admin/catalog/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entity: 'compatibilidades',
          operation: 'create',
          payload: {
            id_repuesto: Number(newCompatPartId),
            id_modelo: Number(newCompatModelId),
            nivel_verificacion: newCompatLevel,
            notas_tecnicas: newCompatNotes.trim() || null,
          },
        }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.record) {
        setCompatibilities((prev) => [data.record, ...prev]);
        setNewCompatNotes('');
        showFeedback('success', 'Vínculo de compatibilidad técnica registrado en public.compatibilidades.');
      } else {
        showFeedback('warning', data.error || 'No se pudo registrar la compatibilidad.');
      }
    } catch {
      showFeedback('error', 'Error conectando con el servidor administrativo.');
    } finally {
      setIsSubmittingCatalog(false);
    }
  };

  // Gestión de ciclo de vida de repuestos (Issue #9)
  const handleProductAction = async (part: AdminPartRecord, action: string, extraPayload: any = {}) => {
    setActivePartMenuId(null);
    if (action === 'BLOQUEAR') {
      setBlockModalPart(part);
      setBlockReason('');
      return;
    }
    if (action === 'ELIMINAR' || action === 'ARCHIVAR') {
      setDeleteModalPart(part);
      return;
    }

    setIsProcessingPartAction(true);
    try {
      const res = await fetch('/api/admin/catalog/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entity: 'repuestos',
          operation: 'update_status',
          payload: {
            id_repuesto: part.id_repuesto,
            action,
            ...extraPayload,
          },
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showFeedback('success', data.message || `Estado de «${part.nombre}» actualizado.`);
        await refreshCatalogData();
      } else {
        showFeedback('error', data.error || 'No se pudo actualizar el estado del repuesto.');
      }
    } catch {
      showFeedback('error', 'Error al conectar con el servidor administrativo.');
    } finally {
      setIsProcessingPartAction(false);
    }
  };

  const handleConfirmBlock = async () => {
    if (!blockModalPart) return;
    if (!blockReason.trim() || blockReason.trim().length < 5) {
      showFeedback('warning', 'El motivo de bloqueo es obligatorio y debe tener al menos 5 caracteres.');
      return;
    }

    setIsProcessingPartAction(true);
    try {
      const res = await fetch('/api/admin/catalog/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entity: 'repuestos',
          operation: 'update_status',
          payload: {
            id_repuesto: blockModalPart.id_repuesto,
            action: 'BLOQUEAR',
            motivo_bloqueo: blockReason.trim(),
          },
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showFeedback('success', `Repuesto «${blockModalPart.nombre}» bloqueado administrativamente.`);
        setBlockModalPart(null);
        setBlockReason('');
        await refreshCatalogData();
      } else {
        showFeedback('error', data.error || 'No se pudo bloquear el repuesto.');
      }
    } catch {
      showFeedback('error', 'Error al conectar con el servidor.');
    } finally {
      setIsProcessingPartAction(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteModalPart) return;

    setIsProcessingPartAction(true);
    try {
      const res = await fetch('/api/admin/catalog/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entity: 'repuestos',
          operation: 'delete',
          payload: {
            id_repuesto: deleteModalPart.id_repuesto,
          },
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showFeedback(
          'success',
          data.message ||
            (data.archived
              ? `Repuesto «${deleteModalPart.nombre}» archivado (baja lógica) por trazabilidad.`
              : `Repuesto «${deleteModalPart.nombre}» eliminado definitivamente.`)
        );
        setDeleteModalPart(null);
        await refreshCatalogData();
      } else {
        showFeedback('error', data.error || 'No se pudo eliminar el repuesto.');
      }
    } catch {
      showFeedback('error', 'Error al conectar con el servidor.');
    } finally {
      setIsProcessingPartAction(false);
    }
  };

  // Reclasificación y movimiento entre listas del catálogo
  const handleOpenReclassifyModal = (
    item: AdminPartRecord | AdminModelRecord,
    sourceEntity: 'repuestos' | 'modelos_moto'
  ) => {
    setActivePartMenuId(null);
    setActiveModelMenuId(null);

    if (sourceEntity === 'repuestos') {
      const part = item as AdminPartRecord;
      const inferred = inferVehicleDataFromPart(part, brands);
      setReclassifyModalItem({ item, sourceEntity });
      setReclassifyTargetList('modelos_ev');
      setReclassifyBrandId(String(inferred?.brandId || (brands[0]?.id_marca ?? 1)));
      setReclassifyModelName(inferred?.modelName || part.nombre);
      setReclassifyVehicleType(inferred?.vehicleType || 'MOTOCARGA_ELECTRICA');
      setReclassifyVoltage(inferred?.voltage ? String(inferred.voltage) : '');
      setReclassifyPowerW(inferred?.powerW ? String(inferred.powerW) : '');
      setReclassifyPrice(String(part.precio || ''));
      setReclassifyReason('Reclasificación de catálogo comercial');
    } else {
      const model = item as AdminModelRecord;
      setReclassifyModalItem({ item, sourceEntity });
      setReclassifyTargetList('repuestos');
      setReclassifyBrandId(String(model.id_marca));
      setReclassifyModelName(model.nombre);
      setReclassifyPrice('0');
      setReclassifyReason('Traslado a lista de repuestos');
    }
  };

  const handleConfirmReclassify = async () => {
    if (!reclassifyModalItem) return;
    setIsProcessingReclassify(true);
    try {
      const { item, sourceEntity } = reclassifyModalItem;
      const selectedBrand = brands.find((b) => String(b.id_marca) === String(reclassifyBrandId));

      const res = await fetch('/api/admin/catalog/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entity: 'catalog',
          operation: 'reclassify',
          payload: {
            sourceEntity,
            sourceId:
              sourceEntity === 'repuestos'
                ? (item as AdminPartRecord).id_repuesto
                : (item as AdminModelRecord).id_modelo,
            targetList: reclassifyTargetList,
            modelData: {
              id_marca: Number(reclassifyBrandId) || undefined,
              brandName: selectedBrand?.nombre,
              nombre: reclassifyModelName.trim(),
              vehicleType: reclassifyVehicleType,
              voltaje_nominal_v: reclassifyVoltage ? Number(reclassifyVoltage) : null,
              potencia_motor_w: reclassifyPowerW ? Number(reclassifyPowerW) : null,
              precio: reclassifyPrice ? Number(reclassifyPrice) : 0,
              imagen_url: item.imagen_url || null,
            },
            partData: {
              nombre: reclassifyModelName.trim(),
              precio: reclassifyPrice ? Number(reclassifyPrice) : 0,
              imagen_url: item.imagen_url || null,
            },
            reason: reclassifyReason.trim(),
          },
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showFeedback('success', data.message || 'Registro reclasificado exitosamente.');
        setReclassifyModalItem(null);
        await refreshCatalogData();
      } else {
        showFeedback('error', data.error || 'No se pudo reclasificar el registro.');
      }
    } catch {
      showFeedback('error', 'Error al conectar con el servidor administrativo.');
    } finally {
      setIsProcessingReclassify(false);
    }
  };

  // Colecciones filtradas para búsqueda rápida en tablas
  const filteredModels = useMemo(() => {
    const q = catalogSearch.trim().toLowerCase();
    return models.filter((m) => {
      const matchesBrand = catalogBrandFilter === 'ALL' || String(m.id_marca) === catalogBrandFilter;
      const bName = (brandNameById.get(m.id_marca) || '').toLowerCase();
      const matchesQuery =
        !q ||
        m.nombre.toLowerCase().includes(q) ||
        bName.includes(q) ||
        String(m.voltaje_nominal_v || '').includes(q);
      return matchesBrand && matchesQuery;
    });
  }, [models, catalogSearch, catalogBrandFilter, brandNameById]);

  const filteredParts = useMemo(() => {
    const q = catalogSearch.trim().toLowerCase();
    return parts.filter(
      (p) =>
        !q ||
        p.nombre.toLowerCase().includes(q) ||
        p.codigo_sku.toLowerCase().includes(q)
    );
  }, [parts, catalogSearch]);

  const filteredCompatibilities = useMemo(() => {
    const q = catalogSearch.trim().toLowerCase();
    return compatibilities.filter((c) => {
      if (!q) return true;
      const pInfo = partNameById.get(c.id_repuesto);
      const mName = modelNameById.get(c.id_modelo) || '';
      return (
        (pInfo?.name || '').toLowerCase().includes(q) ||
        (pInfo?.sku || '').toLowerCase().includes(q) ||
        mName.toLowerCase().includes(q) ||
        (c.notas_tecnicas || '').toLowerCase().includes(q)
      );
    });
  }, [compatibilities, catalogSearch, partNameById, modelNameById]);

  const filteredBrands = useMemo(() => {
    const q = catalogSearch.trim().toLowerCase();
    return brands.filter(
      (b) =>
        !q ||
        b.nombre.toLowerCase().includes(q) ||
        (b.pais_origen || '').toLowerCase().includes(q)
    );
  }, [brands, catalogSearch]);

  const inventoryCategories = useMemo(() => {
    const set = new Set<string>();
    for (const p of persistedParts) {
      if (p.id_categoria) set.add(String(p.id_categoria));
    }
    return Array.from(set);
  }, [persistedParts]);

  const filteredInventoryParts = useMemo(() => {
    const q = inventorySearch.trim().toLowerCase();
    return persistedParts.filter((p) => {
      const stock = typeof p.stock_propio_ecomoto === 'number' ? p.stock_propio_ecomoto : 0;
      const isDirect = stock > 0 && p.estado !== false && (!p.data_status || p.data_status === 'ACTIVO');

      if (inventoryModeFilter === 'DIRECT' && !isDirect) return false;
      if (inventoryModeFilter === 'PROVIDER' && isDirect) return false;

      const catStr = String(p.id_categoria || 'General');
      const matchesCat = inventoryCategoryFilter === 'ALL' || catStr === inventoryCategoryFilter;
      const matchesQ =
        !q ||
        (p.nombre || '').toLowerCase().includes(q) ||
        (p.codigo_sku || '').toLowerCase().includes(q) ||
        catStr.toLowerCase().includes(q);
      return matchesCat && matchesQ;
    });
  }, [persistedParts, inventorySearch, inventoryCategoryFilter, inventoryModeFilter]);

  const filteredOrders = useMemo(() => {
    const q = orderSearch.trim().toLowerCase();
    return orders.filter((o) => {
      const matchesStatus = orderStatusFilter === 'ALL' || o.estado_pedido === orderStatusFilter;
      const matchesQ =
        !q ||
        o.numero_pedido.toLowerCase().includes(q) ||
        o.cliente_nombre.toLowerCase().includes(q) ||
        o.cliente_email.toLowerCase().includes(q) ||
        (o.doc_numero || '').toLowerCase().includes(q);
      return matchesStatus && matchesQ;
    });
  }, [orders, orderSearch, orderStatusFilter]);

  const filteredCustomers = useMemo(() => {
    const q = customerSearch.trim().toLowerCase();
    return orders.filter((o) => {
      const matchesType =
        customerTypeFilter === 'ALL' ||
        (customerTypeFilter === 'GUEST' && o.es_invitado) ||
        (customerTypeFilter === 'REGISTERED' && !o.es_invitado);
      const matchesQ =
        !q ||
        o.cliente_nombre.toLowerCase().includes(q) ||
        o.cliente_email.toLowerCase().includes(q) ||
        (o.doc_numero || '').toLowerCase().includes(q);
      return matchesType && matchesQ;
    });
  }, [orders, customerSearch, customerTypeFilter]);

  const docByOrderId = useMemo(() => {
    const map = new Map<string, AdminDocumentRecord>();
    documents.forEach((d) => {
      if (d.id_pedido && d.tipo !== 'GUIA_REMISION') {
        map.set(d.id_pedido, d);
      }
    });
    return map;
  }, [documents]);

  const guiaByOrderId = useMemo(() => {
    const map = new Map<string, AdminDocumentRecord>();
    documents.forEach((d) => {
      if (d.id_pedido && d.tipo === 'GUIA_REMISION') {
        map.set(d.id_pedido, d);
      }
    });
    return map;
  }, [documents]);

  const filteredDocuments = useMemo(() => {
    const q = documentSearch.trim().toLowerCase();
    return documents.filter((d) => {
      const matchesType =
        documentTypeFilter === 'ALL' ||
        (d.tipo || '').toUpperCase() === documentTypeFilter;
      const serieNum = `${d.serie || ''}-${d.numero || ''}`.toLowerCase();
      const receptor = `${d.datos_receptor?.businessName || ''} ${d.datos_receptor?.docNumber || ''}`.toLowerCase();
      const matchesQ = !q || serieNum.includes(q) || receptor.includes(q);
      return matchesType && matchesQ;
    });
  }, [documents, documentSearch, documentTypeFilter]);

  const filteredAssistance = useMemo(() => {
    const q = assistanceSearch.trim().toLowerCase();
    return initialAssistance.filter(
      (a) =>
        !q ||
        a.nombre_contacto.toLowerCase().includes(q) ||
        a.email_contacto.toLowerCase().includes(q) ||
        a.tipo_solicitud.toLowerCase().includes(q) ||
        a.descripcion.toLowerCase().includes(q)
    );
  }, [initialAssistance, assistanceSearch]);

  const filteredSubscriptions = useMemo(() => {
    const q = subscriptionSearch.trim().toLowerCase();
    return initialSubscriptions.filter(
      (s) =>
        !q ||
        s.email.toLowerCase().includes(q) ||
        (s.origen || '').toLowerCase().includes(q)
    );
  }, [initialSubscriptions, subscriptionSearch]);

  // Pendientes reales para el Resumen Operativo
  const pendingOrdersCount = useMemo(
    () =>
      orders.filter(
        (o) => o.estado_pedido === 'confirmado' || o.estado_pedido === 'en_preparacion'
      ).length,
    [orders]
  );

  const pendingAssistanceCount = useMemo(
    () =>
      initialAssistance.filter(
        (a) => !a.estado || a.estado === 'pendiente' || a.estado === 'en_revision'
      ).length,
    [initialAssistance]
  );

  const logisticsOrders = useMemo(
    () =>
      orders.filter(
        (o) =>
          o.estado_pedido === 'confirmado' ||
          o.estado_pedido === 'en_preparacion' ||
          o.estado_pedido === 'despachado'
      ),
    [orders]
  );

  const filteredLogisticsOrders = useMemo(() => {
    const q = despachoSearch.trim().toLowerCase();
    return orders.filter((o) => {
      const matchesStatus =
        despachoStatusFilter === 'ALL'
          ? (o.estado_pedido === 'confirmado' || o.estado_pedido === 'en_preparacion' || o.estado_pedido === 'despachado' || o.estado_pedido === 'entregado')
          : o.estado_pedido === despachoStatusFilter;
      const guia = guiaByOrderId.get(o.id_pedido);
      const guiaNum = guia ? `${guia.serie || ''}-${guia.numero || ''}`.toLowerCase() : '';
      const matchesQ =
        !q ||
        o.numero_pedido.toLowerCase().includes(q) ||
        o.cliente_nombre.toLowerCase().includes(q) ||
        (o.doc_numero || '').toLowerCase().includes(q) ||
        guiaNum.includes(q);
      return matchesStatus && matchesQ;
    });
  }, [orders, despachoSearch, despachoStatusFilter, guiaByOrderId]);

  const handleOpenGreModal = (order: AdminOrderRecord) => {
    setSelectedOrderForGre(order);
    setGreFormError(null);
    setGreFormSuccess(null);
    setGreForm({
      motivoTraslado: 'VENTA',
      modalidadTransporte: 'PRIVADO',
      fechaInicioTraslado: new Date().toISOString().split('T')[0],
      puntoPartida: 'Av. César Canevaro 1332, Lince, Lima',
      puntoLlegada: order.cliente_telefono ? `${order.cliente_nombre} - Modalidad: ${order.modalidad_entrega}` : 'Lima Metropolitana, Perú',
      pesoBrutoTotalKg: 4.5,
      conductorNombre: 'Carlos Ramos Quispe',
      conductorDni: '45892134',
      conductorLicencia: 'Q45892134',
      conductorPlaca: 'B12-890',
      conductorMarca: 'Haojue Express',
      transportistaRazonSocial: 'OLVA COURIER S.A.C.',
      transportistaRuc: '20100686814',
    });
    setIsGreModalOpen(true);
  };

  const handleSubmitGre = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForGre) return;
    setIsSubmittingGre(true);
    setGreFormError(null);
    setGreFormSuccess(null);

    try {
      const docAsociado = docByOrderId.get(selectedOrderForGre.id_pedido);
      const payload = {
        orderId: selectedOrderForGre.id_pedido,
        orderNumber: selectedOrderForGre.numero_pedido,
        motivoTraslado: greForm.motivoTraslado,
        modalidadTransporte: greForm.modalidadTransporte,
        fechaInicioTraslado: greForm.fechaInicioTraslado,
        puntoPartida: greForm.puntoPartida,
        puntoLlegada: greForm.puntoLlegada,
        destinatario: {
          docType: (selectedOrderForGre.doc_numero?.length === 11 ? 'RUC' : 'DNI') as 'DNI' | 'RUC',
          docNumber: selectedOrderForGre.doc_numero || '00000000',
          nombre: selectedOrderForGre.cliente_nombre,
          direccion: greForm.puntoLlegada,
        },
        conductor:
          greForm.modalidadTransporte === 'PRIVADO'
            ? {
                nombre: greForm.conductorNombre,
                docType: 'DNI' as const,
                docNumber: greForm.conductorDni,
                licencia: greForm.conductorLicencia,
                placaVehiculo: greForm.conductorPlaca,
                marcaVehiculo: greForm.conductorMarca,
              }
            : undefined,
        transportista:
          greForm.modalidadTransporte === 'PUBLICO'
            ? {
                razonSocial: greForm.transportistaRazonSocial,
                ruc: greForm.transportistaRuc,
              }
            : undefined,
        pesoBrutoTotalKg: Number(greForm.pesoBrutoTotalKg) || 1,
        items: [
          {
            sku: 'MS-ORDER-PACK',
            nombre: `Bienes del pedido ${selectedOrderForGre.numero_pedido}`,
            cantidad: 1,
            unidad: 'NIU',
            pesoKg: Number(greForm.pesoBrutoTotalKg) || 1,
          },
        ],
        comprobanteAsociado: docAsociado
          ? {
              tipo: docAsociado.tipo as 'BOLETA' | 'FACTURA',
              serieNumero: `${docAsociado.serie || ''}-${docAsociado.numero || ''}`,
            }
          : undefined,
      };

      const res = await fetch('/api/admin/despacho/guia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'No se pudo generar la Guía de Remisión');
      }

      setGreFormSuccess(data.message || 'Guía de Remisión generada con éxito');
      if (data.guia) {
        setDocuments((prev) => [data.guia, ...prev]);
      }
      setOrders((prev) =>
        prev.map((o) =>
          o.id_pedido === selectedOrderForGre.id_pedido
            ? { ...o, estado_pedido: 'en_preparacion' }
            : o
        )
      );
      setStatusFeedback({
        type: 'success',
        text: `Guía generada con éxito para el pedido ${selectedOrderForGre.numero_pedido}.`,
      });
      setTimeout(() => {
        setIsGreModalOpen(false);
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error inesperado';
      setGreFormError(msg);
    } finally {
      setIsSubmittingGre(false);
    }
  };

  // Filtrado reactivo de usuarios
  const filteredUsers = useMemo(() => {
    return filterUsers(users, {
      search: userSearch,
      role: userRoleFilter,
      status: userStatusFilter,
    });
  }, [users, userSearch, userRoleFilter, userStatusFilter]);

  const handleRefreshUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.success && Array.isArray(data.users)) {
        setUsers(data.users);
        setStatusFeedback({ type: 'success', text: `Lista de usuarios actualizada (${data.users.length} cuentas registradas).` });
      } else {
        setStatusFeedback({ type: 'error', text: data.error || 'Error al obtener usuarios' });
      }
    } catch {
      setStatusFeedback({ type: 'error', text: 'Error de conexión al cargar usuarios' });
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleConfirmRoleChange = async () => {
    if (!roleModalUser) return;
    setIsProcessingUserAction(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'set_role',
          userId: roleModalUser.id,
          role: targetUserRole,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === roleModalUser.id ? { ...u, role: targetUserRole } : u))
        );
        setStatusFeedback({ type: 'success', text: data.message || 'Rol actualizado correctamente' });
        setRoleModalUser(null);
      } else {
        setStatusFeedback({ type: 'error', text: data.error || 'Error al cambiar rol' });
      }
    } catch {
      setStatusFeedback({ type: 'error', text: 'Error al cambiar rol del usuario' });
    } finally {
      setIsProcessingUserAction(false);
    }
  };

  const handleConfirmToggleBan = async () => {
    if (!banModalUser) return;
    setIsProcessingUserAction(true);
    const newIsBanned = !banModalUser.isBanned;
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle_ban',
          userId: banModalUser.id,
          isBanned: newIsBanned,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === banModalUser.id
              ? { ...u, isBanned: newIsBanned, bannedUntil: data.bannedUntil }
              : u
          )
        );
        setStatusFeedback({ type: 'success', text: data.message || 'Estado de acceso modificado' });
        setBanModalUser(null);
      } else {
        setStatusFeedback({ type: 'error', text: data.error || 'Error al modificar estado de acceso' });
      }
    } catch {
      setStatusFeedback({ type: 'error', text: 'Error de conexión al modificar acceso' });
    } finally {
      setIsProcessingUserAction(false);
    }
  };

  const handleConfirmResetPassword = async () => {
    if (!passwordModalUser) return;
    setIsProcessingUserAction(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reset_password',
          userId: passwordModalUser.id,
          email: passwordModalUser.email,
          mode: passwordResetMode,
          password: directNewPassword,
        }),
      });
      const data = await res.json();
      if (data.success) {
        if (passwordResetMode === 'link' && data.recoveryLink) {
          setGeneratedRecoveryLink(data.recoveryLink);
          setStatusFeedback({ type: 'success', text: 'Enlace generado. Cópialo para compartirlo con el usuario.' });
        } else {
          setStatusFeedback({ type: 'success', text: data.message || 'Contraseña actualizada correctamente' });
          setPasswordModalUser(null);
          setDirectNewPassword('');
          setGeneratedRecoveryLink(null);
        }
      } else {
        setStatusFeedback({ type: 'error', text: data.error || 'Error al restablecer contraseña' });
      }
    } catch {
      setStatusFeedback({ type: 'error', text: 'Error al procesar contraseña' });
    } finally {
      setIsProcessingUserAction(false);
    }
  };

  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateUserError(null);
    setIsProcessingUserAction(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_user',
          email: newUserEmail,
          password: newUserPassword,
          fullName: newUserFullName,
          phone: newUserPhone || undefined,
          role: newUserRole,
        }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUsers((prev) => [data.user, ...prev]);
        setStatusFeedback({ type: 'success', text: data.message || 'Usuario creado exitosamente' });
        setIsCreateUserModalOpen(false);
        setNewUserEmail('');
        setNewUserPassword('');
        setNewUserFullName('');
        setNewUserPhone('');
        setNewUserRole('customer');
      } else {
        setCreateUserError(data.error || 'Error al crear usuario');
      }
    } catch {
      setCreateUserError('Error de red al crear el usuario');
    } finally {
      setIsProcessingUserAction(false);
    }
  };

  const formattedCurrentDate = useMemo(() => {
    try {
      return new Intl.DateTimeFormat('es-PE', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(new Date());
    } catch {
      return '';
    }
  }, []);

  const handleSelectModule = (id: ModuleId) => {
    setActiveModule(id);
    setIsMobileMenuOpen(false);
  };

  const renderOrderStatusBadge = (status: OrderStatus) => {
    const badgeMap: Record<string, { label: string; style: string }> = {
      pendiente_pago: { label: 'Pendiente Pago', style: 'bg-amber-50 text-amber-800 border-amber-200' },
      pagado: { label: 'Pago Verificado', style: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
      confirmado: { label: 'Pago Confirmado', style: 'bg-blue-50 text-blue-900 border-blue-200' },
      en_preparacion: { label: 'En Preparación', style: 'bg-amber-50 text-amber-900 border-amber-300' },
      despachado: { label: 'En Tránsito', style: 'bg-indigo-50 text-indigo-900 border-indigo-200' },
      entregado: { label: 'Completado / Entregado', style: 'bg-emerald-50 text-emerald-900 border-emerald-300' },
      cancelado: { label: 'Cancelado', style: 'bg-red-50 text-red-700 border-red-200' },
      reembolsado: { label: 'Reembolsado', style: 'bg-slate-100 text-slate-700 border-slate-300' },
    };
    const current = badgeMap[status] || {
      label: status.replace(/_/g, ' '),
      style: 'bg-slate-100 text-slate-700 border-slate-200',
    };
    return (
      <span
        className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${current.style}`}
      >
        {current.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen flex bg-[#F4F6F9] text-slate-900">
      {/* Drawer móvil accesible */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden flex"
          role="dialog"
          aria-modal="true"
          aria-label="Menú de navegación administrativa"
        >
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <aside className="relative z-10 w-72 max-w-[85vw] bg-[#0B1528] text-slate-100 flex flex-col h-full shadow-2xl">
            <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <Image
                  src="/branding/nero-emblem.png"
                  alt="NeroElectric Motors"
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-lg object-contain bg-slate-900 p-0.5 border border-amber-400/30"
                />
                <div>
                  <span className="block text-xs font-extrabold tracking-wider uppercase text-white">
                    NERO ELECTRIC MOTORS
                  </span>
                  <span className="block text-[10px] font-medium text-amber-400">
                    ERP Comercial y Técnico
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800"
                aria-label="Cerrar menú lateral"
              >
                <Icon name="x" className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5" aria-label="Navegación móvil">
              {navGroups.map((group) => (
                <div key={group.groupTitle}>
                  <p className="px-2.5 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {group.groupTitle}
                  </p>
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const isActive = activeModule === item.id;
                      return (
                        <button
                          type="button"
                          key={item.id}
                          onClick={() => handleSelectModule(item.id)}
                          aria-current={isActive ? 'page' : undefined}
                          className={`w-full flex items-center justify-between gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs font-medium transition-colors cursor-pointer ${
                            isActive
                              ? 'bg-slate-800/90 text-white border-l-3 border-amber-400 font-semibold'
                              : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Icon
                              name={item.icon}
                              className={`w-4 h-4 shrink-0 ${
                                isActive ? 'text-amber-400' : 'text-slate-400'
                              }`}
                            />
                            <span className="truncate">{item.label}</span>
                          </div>
                          {typeof item.count === 'number' && item.count > 0 && (
                            <span
                              className={`rounded-full px-1.5 py-0.5 text-[10px] font-mono font-bold shrink-0 ${
                                isActive
                                  ? 'bg-amber-400 text-slate-950'
                                  : 'bg-slate-800 text-slate-300'
                              }`}
                            >
                              {item.count}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* A. Sidebar Izquierdo Persistente en Escritorio */}
      <aside
        className={`hidden lg:flex flex-col shrink-0 bg-[#0B1528] text-slate-100 border-r border-slate-900 transition-all duration-200 select-none ${
          isSidebarCollapsed ? 'w-[72px]' : 'w-68'
        }`}
        aria-label="Barra lateral de módulos administrativos"
      >
        {/* Cabecera del Sidebar con Identidad NERO ELECTRIC MOTORS */}
        <div className="h-16 px-3.5 flex items-center justify-between border-b border-slate-800/80 shrink-0">
          <button
            type="button"
            onClick={() => setActiveModule('resumen')}
            className="flex items-center gap-2.5 text-left min-w-0 focus:outline-none cursor-pointer"
            title="Ir a Resumen operativo"
          >
            <Image
              src="/branding/nero-emblem.png"
              alt="NeroElectric Motors"
              width={34}
              height={34}
              className="h-8 w-8 shrink-0 rounded-lg object-contain bg-slate-900 p-0.5 border border-amber-400/40"
            />
            {!isSidebarCollapsed && (
              <div className="min-w-0">
                <span className="block text-xs font-extrabold tracking-wider uppercase text-white truncate">
                  NERO ELECTRIC MOTORS
                </span>
                <span className="block text-[10px] font-medium text-amber-400 truncate">
                  Panel ERP Administrativo
                </span>
              </div>
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsSidebarCollapsed((prev) => !prev)}
            className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            aria-label={isSidebarCollapsed ? 'Expandir barra lateral' : 'Contraer barra lateral'}
            title={isSidebarCollapsed ? 'Expandir menú lateral' : 'Contraer menú lateral'}
          >
            <Icon
              name={isSidebarCollapsed ? 'chevron-right' : 'chevron-left'}
              className="w-4 h-4"
            />
          </button>
        </div>

        {/* Grupos de Módulos del Sidebar */}
        <nav className="flex-1 overflow-y-auto px-2.5 py-4 space-y-5" aria-label="Menú principal del ERP">
          {navGroups.map((group) => (
            <div key={group.groupTitle}>
              {!isSidebarCollapsed ? (
                <p className="px-2.5 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {group.groupTitle}
                </p>
              ) : (
                <div className="h-px bg-slate-800 my-2 mx-2" />
              )}

              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = activeModule === item.id;
                  return (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => setActiveModule(item.id)}
                      aria-current={isActive ? 'page' : undefined}
                      title={isSidebarCollapsed ? `${group.groupTitle}: ${item.label}` : item.label}
                      className={`w-full flex items-center ${
                        isSidebarCollapsed ? 'justify-center px-2 py-2.5' : 'justify-between px-2.5 py-2'
                      } rounded-lg text-left text-xs transition-all cursor-pointer ${
                        isActive
                          ? 'bg-slate-800/95 text-white font-semibold shadow-2xs border-l-3 border-amber-400'
                          : 'text-slate-300 hover:bg-slate-800/50 hover:text-white font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          name={item.icon}
                          className={`w-4 h-4 shrink-0 ${
                            isActive ? 'text-amber-400' : 'text-slate-400'
                          }`}
                        />
                        {!isSidebarCollapsed && (
                          <span className="leading-snug line-clamp-1">{item.label}</span>
                        )}
                      </div>

                      {!isSidebarCollapsed &&
                        typeof item.count === 'number' &&
                        item.count > 0 && (
                          <span
                            className={`ml-2 rounded-full px-1.5 py-0.5 text-[10px] font-mono font-bold shrink-0 ${
                              isActive
                                ? 'bg-amber-400 text-slate-950'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {item.count}
                          </span>
                        )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Pie del Sidebar: Estado de Conexión a Base de Datos */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 text-[11px] text-slate-400">
          {isSidebarCollapsed ? (
            <div className="flex justify-center" title="Conectado a Supabase PostgreSQL (RLS activo)">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 shrink-0" />
                <span className="font-medium text-slate-300 truncate">Supabase PostgreSQL</span>
              </div>
              <span className="font-mono text-[10px] text-slate-400">RLS Activo</span>
            </div>
          )}
        </div>
      </aside>

      {/* Contenedor Derecho: Barra Superior + Área de Contenido */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* B. Barra Superior Compacta y Profesional */}
        <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Izquierda: Botón móvil + Breadcrumb contextual */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden rounded-lg border border-slate-200 p-2 text-slate-700 hover:bg-slate-100"
              aria-label="Abrir menú de navegación"
            >
              <Icon name="menu" className="w-5 h-5" />
            </button>

            <nav aria-label="Ruta de navegación" className="flex items-center gap-2 text-xs min-w-0">
              <span className="hidden sm:inline font-medium text-slate-500">
                {activeContext.groupTitle}
              </span>
              <span className="hidden sm:inline text-slate-300">/</span>
              <span className="font-bold text-slate-900 truncate text-sm">
                {activeContext.label}
              </span>
            </nav>
          </div>

          {/* Derecha: Acceso a Tienda Pública + Usuario Autenticado + Rol + Cerrar Sesión */}
          <div className="flex items-center gap-3 shrink-0">
            <a
              href={storefrontUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors"
              title="Abrir Tienda Pública en nueva pestaña (neroelectricmotors.com)"
            >
              <span className="hidden sm:inline">Abrir Tienda Pública</span>
              <Icon name="external-link" className="w-3.5 h-3.5 text-slate-500" />
            </a>

            <div className="h-5 w-px bg-slate-200 hidden sm:block" />

            <div className="flex items-center gap-2.5">
              <div className="hidden md:flex flex-col items-end leading-tight">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900">{account.fullName}</span>
                  <span className="rounded bg-[#0B1528] px-1.5 py-0.2 text-[10px] font-mono font-bold uppercase text-amber-400">
                    {account.role}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">{account.email}</span>
              </div>

              <Link
                href="/actualizar-contrasena"
                className="rounded-lg border border-slate-200 bg-white hover:bg-slate-50 p-2 text-slate-600 hover:text-slate-900 transition-colors"
                title="Cambiar contraseña administrativa"
                aria-label="Cambiar contraseña administrativa"
              >
                <Icon name="tool" className="w-4 h-4" />
              </Link>

              <form action={signOutAction}>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white hover:bg-red-50 hover:border-red-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-red-700 transition-colors cursor-pointer"
                  title="Cerrar sesión administrativa"
                >
                  <Icon name="log-out" className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Salir</span>
                </button>
              </form>
            </div>
          </div>
        </header>

        {/* C. Área de Contenido Principal */}
        <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Notificación de estado de operación */}
          {statusFeedback && (
            <div
              role="status"
              className={`rounded-xl border px-4 py-3 text-xs sm:text-sm flex items-center justify-between gap-3 shadow-2xs ${
                statusFeedback.type === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                  : statusFeedback.type === 'error'
                  ? 'border-red-200 bg-red-50 text-red-900'
                  : 'border-amber-200 bg-amber-50 text-amber-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  name={statusFeedback.type === 'success' ? 'check-circle' : 'alert-triangle'}
                  className={`w-4 h-4 shrink-0 ${
                    statusFeedback.type === 'success'
                      ? 'text-emerald-600'
                      : statusFeedback.type === 'error'
                      ? 'text-red-600'
                      : 'text-amber-600'
                  }`}
                />
                <span className="font-medium">{statusFeedback.text}</span>
              </div>
              <button
                type="button"
                onClick={() => setStatusFeedback(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
                aria-label="Cerrar aviso"
              >
                <Icon name="x" className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* ====================================================================
              1. MÓDULO: RESUMEN OPERATIVO
             ==================================================================== */}
          {activeModule === 'resumen' && (
            <div className="space-y-7">
              {/* ------------------------------------------------------------------
                  NIVEL 1: ENCABEZADO OPERATIVO
                 ------------------------------------------------------------------ */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-lg bg-slate-100 border border-slate-200/60 px-2.5 py-1 text-xs font-semibold text-slate-600 mb-2 capitalize">
                    <Icon name="clock" className="w-3.5 h-3.5 text-slate-500" />
                    <span>{formattedCurrentDate}</span>
                  </div>
                  <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-slate-900">
                    Resumen operativo
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
                    Supervisión integral de catálogo, pedidos en curso, solicitudes técnicas de taller y estado de pasarelas conectadas.
                  </p>
                </div>

                <div className="flex items-center gap-2.5 self-start lg:self-auto shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveModule('catalogo_db')}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-800 shadow-2xs transition-colors cursor-pointer"
                  >
                    <Icon name="database" className="w-3.5 h-3.5 text-slate-600" />
                    <span>Gestionar catálogo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveModule('importador')}
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                  >
                    <Icon name="upload" className="w-3.5 h-3.5" />
                    <span>Importar catálogo CSV/JSON</span>
                  </button>
                </div>
              </div>

              {queryErrors && Object.keys(queryErrors).length > 0 && (
                <div className="rounded-xl border border-amber-200 bg-amber-50/90 p-4 text-xs text-amber-950 shadow-2xs">
                  <div className="flex items-center gap-2 font-bold text-amber-900">
                    <Icon name="alert-triangle" className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Aviso operativo: Fallo de lectura en {Object.keys(queryErrors).length} fuentes de Supabase</span>
                  </div>
                  <p className="mt-1 text-amber-800">
                    No se pudieron recuperar datos actualizados de:{' '}
                    <strong>{Object.keys(queryErrors).join(', ')}</strong>.
                    Los indicadores correspondientes identifican la fuente afectada y no ocultan el error.
                  </p>
                  <div className="mt-2.5 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => window.location.reload()}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-800 hover:bg-amber-900 text-white font-semibold rounded-lg text-[11px] transition-colors"
                    >
                      <Icon name="refresh" className="w-3 h-3" />
                      <span>Reintentar consultas</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------------
                  NIVEL 2: INDICADORES PRINCIPALES (4 TARJETAS HOMOGÉNEAS)
                 ------------------------------------------------------------------ */}
              <section aria-label="Indicadores principales">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                  {/* KPI 1: Marcas y modelos eléctricos */}
                  <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
                    <div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          Marcas y modelos
                        </span>
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
                          <Icon name="zap" className="w-4 h-4" />
                        </span>
                      </div>
                      <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-3xl font-black text-slate-900 font-mono tracking-tight">
                          {stats.totalMarcas}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">marcas</span>
                        <span className="text-slate-300 font-light">/</span>
                        <span className="text-3xl font-black text-slate-900 font-mono tracking-tight">
                          {stats.totalModelos}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">modelos</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1.5">
                        Flota registrada en catálogo maestro
                      </p>
                    </div>

                    <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-slate-400">PostgreSQL</span>
                      <button
                        type="button"
                        onClick={() => {
                          setCatalogEntityTab('modelos');
                          setActiveModule('catalogo_db');
                        }}
                        className="font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        <span>Ver modelos</span>
                        <span aria-hidden="true">→</span>
                      </button>
                    </div>
                  </div>

                  {/* KPI 2: Repuestos y compatibilidades */}
                  <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
                    <div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          Repuestos y compatibilidad
                        </span>
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                          <Icon name="package" className="w-4 h-4" />
                        </span>
                      </div>
                      <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-3xl font-black text-slate-900 font-mono tracking-tight">
                          {stats.totalRepuestos}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">piezas</span>
                        <span className="text-slate-300 font-light">/</span>
                        <span className="text-3xl font-black text-emerald-700 font-mono tracking-tight">
                          {stats.totalCompatibilidades}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">vínculos</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1.5">
                        Matriz sincronizada con tienda pública
                      </p>
                    </div>

                    <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-slate-400">Catálogo Base</span>
                      <button
                        type="button"
                        onClick={() => {
                          setCatalogEntityTab('repuestos');
                          setActiveModule('catalogo_db');
                        }}
                        className="font-bold text-emerald-700 hover:text-emerald-900 transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        <span>Ver matriz</span>
                        <span aria-hidden="true">→</span>
                      </button>
                    </div>
                  </div>

                  {/* KPI 3: Solicitudes de asistencia */}
                  <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
                    <div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          Solicitudes de asistencia
                        </span>
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                          <Icon name="headset" className="w-4 h-4" />
                        </span>
                      </div>
                      <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-3xl font-black text-slate-900 font-mono tracking-tight">
                          {initialAssistance.length}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">
                          {initialAssistance.length === 1 ? 'caso registrado' : 'casos registrados'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1.5">
                        Consultas técnicas y citas de taller
                      </p>
                    </div>

                    <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-slate-400">
                        {pendingAssistanceCount > 0 ? (
                          <span className="font-semibold text-amber-700">{pendingAssistanceCount} pendientes</span>
                        ) : (
                          'Al día'
                        )}
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveModule('voltia')}
                        className="font-bold text-amber-800 hover:text-amber-950 transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        <span>Abrir bandeja</span>
                        <span aria-hidden="true">→</span>
                      </button>
                    </div>
                  </div>

                  {/* KPI 4: Suscripciones comerciales */}
                  <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
                    <div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          Suscripciones comerciales
                        </span>
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                          <Icon name="tag" className="w-4 h-4" />
                        </span>
                      </div>
                      <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-3xl font-black text-slate-900 font-mono tracking-tight">
                          {initialSubscriptions.length}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">consentimientos</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1.5">
                        Campaña cupón BIENVENIDO5 activa
                      </p>
                    </div>

                    <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-slate-400">Marketing</span>
                      <button
                        type="button"
                        onClick={() => setActiveModule('promociones')}
                        className="font-bold text-blue-700 hover:text-blue-900 transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        <span>Ver registros</span>
                        <span aria-hidden="true">→</span>
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* ------------------------------------------------------------------
                  NIVEL 3: ATENCIÓN Y SUPERVISIÓN (ALERTAS + ESTADO DE SERVICIOS)
                 ------------------------------------------------------------------ */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* 3A: Alertas y Pendientes Operativos (5 cols en LG) */}
                <section
                  aria-labelledby="alertas-pendientes-heading"
                  className="lg:col-span-5 rounded-2xl border border-slate-200/90 bg-white shadow-xs flex flex-col overflow-hidden"
                >
                  <div className="px-5 py-4 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/50">
                    <div>
                      <h2 id="alertas-pendientes-heading" className="text-sm font-black text-slate-900">
                        Alertas y pendientes operativos
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Prioridades operativas que requieren atención
                      </p>
                    </div>
                    {pendingOrdersCount + pendingAssistanceCount > 0 ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-900 border border-amber-200 text-[11px] font-bold px-2.5 py-0.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-600 animate-pulse" />
                        <span>{pendingOrdersCount + pendingAssistanceCount} pendientes</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200 text-[11px] font-bold px-2.5 py-0.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                        <span>Al día</span>
                      </span>
                    )}
                  </div>

                  <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-3">
                      {/* Estado vacío cuando no hay pendientes de pedidos ni de taller */}
                      {pendingOrdersCount === 0 && pendingAssistanceCount === 0 && (
                        <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/60 text-emerald-950 flex items-start gap-3">
                          <Icon name="check-circle" className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-bold text-emerald-900">
                              Flujo operativo al día
                            </p>
                            <p className="text-[11px] text-emerald-800/90 mt-0.5 leading-relaxed">
                              No hay pedidos pendientes de despacho ni solicitudes urgentes de asistencia sin resolver.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Pendiente 1: Pedidos por atender */}
                      <div
                        className={`p-3.5 rounded-xl border transition-colors flex items-start justify-between gap-3 ${
                          pendingOrdersCount > 0
                            ? 'border-amber-200 bg-amber-50/50 text-amber-950'
                            : 'border-slate-200 bg-white text-slate-800'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                              pendingOrdersCount > 0
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            <Icon name="shopping-bag" className="w-4 h-4" />
                          </span>
                          <div>
                            <p className="text-xs font-bold text-slate-900">
                              {pendingOrdersCount > 0
                                ? `${pendingOrdersCount} pedido(s) en cola de despacho`
                                : 'Sin pedidos pendientes de despacho'}
                            </p>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {orders.length} órdenes totales registradas en pedidos
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveModule('pedidos')}
                          className="shrink-0 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-800 transition-colors shadow-2xs cursor-pointer"
                        >
                          Ir a pedidos
                        </button>
                      </div>

                      {/* Pendiente 2: Solicitudes de asistencia VoltIA / Taller */}
                      <div
                        className={`p-3.5 rounded-xl border transition-colors flex items-start justify-between gap-3 ${
                          pendingAssistanceCount > 0
                            ? 'border-amber-200 bg-amber-50/50 text-amber-950'
                            : 'border-slate-200 bg-white text-slate-800'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                              pendingAssistanceCount > 0
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            <Icon name="headset" className="w-4 h-4" />
                          </span>
                          <div>
                            <p className="text-xs font-bold text-slate-900">
                              {pendingAssistanceCount > 0
                                ? `${pendingAssistanceCount} caso(s) de asistencia por revisar`
                                : 'Sin solicitudes de asistencia pendientes'}
                            </p>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {initialAssistance.length} consultas en solicitudes_asistencia
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveModule('voltia')}
                          className="shrink-0 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-800 transition-colors shadow-2xs cursor-pointer"
                        >
                          Revisar
                        </button>
                      </div>

                      {/* Preventivo / Informativo: Auditoría de importaciones CSV/JSON */}
                      <div className="p-3.5 rounded-xl border border-slate-200 bg-white text-slate-800 flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                            <Icon name="upload" className="w-4 h-4" />
                          </span>
                          <div>
                            <p className="text-xs font-bold text-slate-900">
                              {initialImportHistory.length > 0
                                ? `${initialImportHistory.length} importación(es) auditadas en historial`
                                : 'Sin ejecuciones registradas en historial'}
                            </p>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Catálogo actual: {stats.totalMarcas} marcas y {stats.totalRepuestos} repuestos
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveModule('importador')}
                          className="shrink-0 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-800 transition-colors shadow-2xs cursor-pointer"
                        >
                          Importador
                        </button>
                      </div>
                    </div>
                  </div>
                </section>

                {/* 3B: Estado de Servicios e Integraciones (7 cols en LG) */}
                <section
                  aria-labelledby="servicios-integraciones-heading"
                  className="lg:col-span-7 rounded-2xl border border-slate-200/90 bg-white shadow-xs flex flex-col overflow-hidden"
                >
                  <div className="px-5 py-4 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/50">
                    <div>
                      <h2 id="servicios-integraciones-heading" className="text-sm font-black text-slate-900">
                        Estado de servicios e integraciones
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Monitoreo técnico de pasarelas, comprobantes y base de datos
                      </p>
                    </div>
                  </div>

                  <div className="p-5 space-y-3.5 flex-1 flex flex-col justify-between">
                    {/* Culqi 3DS */}
                    <div className="p-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700 mt-0.5">
                          <Icon name="credit-card" className="w-4 h-4" />
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-xs font-bold text-slate-900">
                              Adaptador de Pagos Culqi 3DS
                            </h3>
                          </div>
                          <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                            Cálculo de montos en céntimos (PEN) y webhooks activos. Opera en entorno de pruebas hasta configurar llaves productivas.
                          </p>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-900 shrink-0 self-start sm:self-auto">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                        <span>Modo Pruebas / Sandbox</span>
                      </span>
                    </div>

                    {/* SUNAT SEE-OSE */}
                    <div className="p-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700 mt-0.5">
                          <Icon name="file-text" className="w-4 h-4" />
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-xs font-bold text-slate-900">
                              Preparación Fiscal SUNAT (Boletas y Facturas)
                            </h3>
                          </div>
                          <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                            Validación de DNI/RUC, IGV (18%) y correlativos B001/F001 listos en BD ({initialDocuments.length} emitidos). Requiere credenciales SEE-OSE para envío oficial.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-800">
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                          <span>Estructura Lista · Sin Vínculo OSE</span>
                        </span>
                      </div>
                    </div>

                    {/* Supabase Auth + PostgreSQL RLS */}
                    <div className="p-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 mt-0.5">
                          <Icon name="shield" className="w-4 h-4" />
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-xs font-bold text-slate-900">
                              Supabase PostgreSQL & Control RBAC
                            </h3>
                          </div>
                          <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                            Base de datos relacional compartida con la tienda. Políticas RLS y autenticación administrativa activas.
                          </p>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-800 shrink-0 self-start sm:self-auto">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        <span>Operativo y Sincronizado</span>
                      </span>
                    </div>
                  </div>
                </section>
              </div>

              {/* ------------------------------------------------------------------
                  NIVEL 4: ACTIVIDAD RECIENTE (PEDIDOS Y ASISTENCIA TÉCNICA)
                 ------------------------------------------------------------------ */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 4A: Pedidos recientes */}
                <section
                  aria-labelledby="pedidos-recientes-heading"
                  className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden flex flex-col"
                >
                  <div className="px-5 py-4 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/50">
                    <div>
                      <h2 id="pedidos-recientes-heading" className="text-sm font-black text-slate-900">
                        Pedidos recientes
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Últimas órdenes en <code className="font-mono text-[11px]">public.pedidos</code>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveModule('pedidos')}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer inline-flex items-center gap-1"
                    >
                      <span>Ver todos ({orders.length})</span>
                      <span aria-hidden="true">→</span>
                    </button>
                  </div>

                  {orders.length === 0 ? (
                    <div className="p-10 text-center flex-1 flex flex-col items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
                        <Icon name="shopping-bag" className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-slate-700">
                        Sin pedidos registrados actualmente
                      </p>
                      <p className="text-xs text-slate-500 mt-1 max-w-xs">
                        Cuando los clientes completen compras en la tienda pública, las órdenes aparecerán aquí automáticamente.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto flex-1">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50/70 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          <tr>
                            <th className="py-3 px-4">Orden</th>
                            <th className="py-3 px-4">Cliente</th>
                            <th className="py-3 px-4 text-right">Total</th>
                            <th className="py-3 px-4 text-center">Estado</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          {orders.slice(0, 5).map((o) => (
                            <tr key={o.id_pedido} className="hover:bg-slate-50/70 transition-colors">
                              <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                                {o.numero_pedido}
                              </td>
                              <td className="py-3.5 px-4">
                                <span className="font-bold text-slate-900 block">
                                  {o.cliente_nombre}
                                </span>
                                <span className="text-[11px] text-slate-500 font-mono block">
                                  {o.cliente_email}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                                {formatCurrency(Number(o.total), o.moneda || 'PEN')}
                              </td>
                              <td className="py-3.5 px-4 text-center">
                                {renderOrderStatusBadge(o.estado_pedido)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>

                {/* 4B: Solicitudes de asistencia técnica recientes */}
                <section
                  aria-labelledby="solicitudes-recientes-heading"
                  className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden flex flex-col"
                >
                  <div className="px-5 py-4 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/50">
                    <div>
                      <h2 id="solicitudes-recientes-heading" className="text-sm font-black text-slate-900">
                        Solicitudes de asistencia recientes
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Casos registrados en <code className="font-mono text-[11px]">public.solicitudes_asistencia</code>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveModule('voltia')}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer inline-flex items-center gap-1"
                    >
                      <span>Ver bandeja ({initialAssistance.length})</span>
                      <span aria-hidden="true">→</span>
                    </button>
                  </div>

                  {initialAssistance.length === 0 ? (
                    <div className="p-10 text-center flex-1 flex flex-col items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
                        <Icon name="headset" className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-slate-700">
                        No hay solicitudes de asistencia registradas
                      </p>
                      <p className="text-xs text-slate-500 mt-1 max-w-xs">
                        Los casos derivados por el asistente VoltIA o el formulario técnico se mostrarán en esta lista.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 flex-1">
                      {initialAssistance.slice(0, 5).map((ast) => (
                        <div key={ast.id_solicitud} className="p-4 text-xs space-y-1.5 hover:bg-slate-50/70 transition-colors">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span className="font-bold text-slate-900">
                              {ast.nombre_contacto}{' '}
                              <span className="font-mono font-normal text-slate-500 text-[11px]">
                                ({ast.email_contacto})
                              </span>
                            </span>
                            <span className="rounded-md bg-amber-50 border border-amber-200/80 px-2 py-0.5 text-[10px] font-bold text-amber-900 uppercase">
                              {ast.tipo_solicitud}
                            </span>
                          </div>
                          <p className="text-slate-600 line-clamp-2 leading-relaxed">
                            {ast.descripcion}
                          </p>
                          {ast.created_at && (
                            <p className="text-[10px] text-slate-400">
                              Registrado: {new Date(ast.created_at).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>
            </div>
          )}

          {/* ====================================================================
              2. MÓDULO: MARCAS, MODELOS, REPUESTOS Y COMPATIBILIDADES (catalogo_db)
             ==================================================================== */}
          {activeModule === 'catalogo_db' && (
            <div className="space-y-6">
              {/* Encabezado del Módulo */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-5">
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-slate-900">
                    Marcas, modelos, repuestos y compatibilidades
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1">
                    Administración directa de las tablas relacionales de catálogo en PostgreSQL compartidas con la tienda pública.
                  </p>
                </div>

                {/* Selector de Entidad */}
                <div className="inline-flex flex-wrap rounded-xl border border-slate-200 bg-white p-1 shadow-2xs gap-1">
                  <button
                    type="button"
                    onClick={() => setCatalogEntityTab('modelos')}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                      catalogEntityTab === 'modelos'
                        ? 'bg-[#0B1528] text-white'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Modelos EV ({models.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setCatalogEntityTab('repuestos')}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                      catalogEntityTab === 'repuestos'
                        ? 'bg-[#0B1528] text-white'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Repuestos ({parts.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setCatalogEntityTab('compatibilidades')}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                      catalogEntityTab === 'compatibilidades'
                        ? 'bg-[#0B1528] text-white'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Compatibilidades ({compatibilities.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setCatalogEntityTab('marcas')}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                      catalogEntityTab === 'marcas'
                        ? 'bg-[#0B1528] text-white'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Marcas ({brands.length})
                  </button>
                </div>
              </div>

              {/* Barra de Búsqueda y Filtros + Formulario Contextual de Alta */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Columna Izquierda (4 cols): Formulario de Alta Real conectado a /api/admin/catalog/manage */}
                <section className="lg:col-span-4 rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
                  {catalogEntityTab === 'modelos' && (
                    <>
                      <div className="border-b border-slate-100 pb-3">
                        <h2 className="text-sm font-bold text-slate-900">
                          Registrar nuevo modelo eléctrico
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Inserción directa en <code className="font-mono">public.modelos_moto</code>
                        </p>
                      </div>
                      <form onSubmit={handleCreateModel} className="space-y-3.5 text-xs">
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">
                            Marca homologada
                          </label>
                          <select
                            value={newModelBrandId}
                            onChange={(e) => setNewModelBrandId(e.target.value)}
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-slate-900 focus:outline-none"
                          >
                            {brands.map((b) => (
                              <option key={b.id_marca} value={b.id_marca}>
                                {b.nombre}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">
                            Nombre comercial del modelo
                          </label>
                          <input
                            type="text"
                            required
                            value={newModelName}
                            onChange={(e) => setNewModelName(e.target.value)}
                            placeholder="Ej. Super Soco TC Max / F55"
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-none"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">
                              Voltaje nominal (V)
                            </label>
                            <input
                              type="number"
                              value={newModelVoltage}
                              onChange={(e) => setNewModelVoltage(e.target.value)}
                              placeholder="72"
                              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 font-mono focus:border-slate-900 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">
                              Potencia motor (W)
                            </label>
                            <input
                              type="number"
                              value={newModelPower}
                              onChange={(e) => setNewModelPower(e.target.value)}
                              placeholder="2000"
                              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 font-mono focus:border-slate-900 focus:outline-none"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={isSubmittingCatalog}
                          className="w-full rounded-lg bg-amber-400 hover:bg-amber-500 disabled:opacity-50 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-2xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Icon name="plus" className="w-4 h-4" />
                          <span>{isSubmittingCatalog ? 'Guardando...' : 'Guardar modelo en catálogo'}</span>
                        </button>
                      </form>
                    </>
                  )}

                  {catalogEntityTab === 'repuestos' && (
                    <>
                      <div className="border-b border-slate-100 pb-3">
                        <h2 className="text-sm font-bold text-slate-900">
                          Registrar nuevo repuesto
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Inserción directa en <code className="font-mono">public.repuestos</code>
                        </p>
                      </div>
                      <form onSubmit={handleCreatePart} className="space-y-3.5 text-xs">
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">
                            Código SKU único
                          </label>
                          <input
                            type="text"
                            required
                            value={newPartSku}
                            onChange={(e) => setNewPartSku(e.target.value)}
                            placeholder="Ej. NERO-BAT-72V35"
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 font-mono placeholder-slate-400 focus:border-slate-900 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">
                            Nombre técnico del repuesto
                          </label>
                          <input
                            type="text"
                            required
                            value={newPartName}
                            onChange={(e) => setNewPartName(e.target.value)}
                            placeholder="Ej. Controlador Senoidal 72V 55A"
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">
                            Precio de venta (PEN S/)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            required
                            value={newPartPrice}
                            onChange={(e) => setNewPartPrice(e.target.value)}
                            placeholder="280.00"
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 font-mono placeholder-slate-400 focus:border-slate-900 focus:outline-none"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={isSubmittingCatalog}
                          className="w-full rounded-lg bg-amber-400 hover:bg-amber-500 disabled:opacity-50 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-2xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Icon name="plus" className="w-4 h-4" />
                          <span>{isSubmittingCatalog ? 'Guardando...' : 'Registrar repuesto'}</span>
                        </button>
                      </form>
                    </>
                  )}

                  {catalogEntityTab === 'compatibilidades' && (
                    <>
                      <div className="border-b border-slate-100 pb-3">
                        <h2 className="text-sm font-bold text-slate-900">
                          Vincular compatibilidad técnica
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Inserción directa en <code className="font-mono">public.compatibilidades</code>
                        </p>
                      </div>
                      <form onSubmit={handleCreateCompatibility} className="space-y-3.5 text-xs">
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">
                            Repuesto
                          </label>
                          <select
                            required
                            value={newCompatPartId}
                            onChange={(e) => setNewCompatPartId(e.target.value)}
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-slate-900 focus:outline-none"
                          >
                            <option value="">Seleccionar repuesto...</option>
                            {parts.map((p) => (
                              <option key={p.id_repuesto} value={p.id_repuesto}>
                                [{p.codigo_sku}] {p.nombre}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">
                            Modelo de moto eléctrica
                          </label>
                          <select
                            required
                            value={newCompatModelId}
                            onChange={(e) => setNewCompatModelId(e.target.value)}
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-slate-900 focus:outline-none"
                          >
                            <option value="">Seleccionar modelo...</option>
                            {models.map((m) => (
                              <option key={m.id_modelo} value={m.id_modelo}>
                                {brandNameById.get(m.id_marca) || `Marca #${m.id_marca}`} — {m.nombre}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">
                            Nivel de verificación
                          </label>
                          <select
                            value={newCompatLevel}
                            onChange={(e) => setNewCompatLevel(e.target.value)}
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-slate-900 focus:outline-none"
                          >
                            <option value="CONFIRMADA">CONFIRMADA (Calce directo OEM)</option>
                            <option value="COMPATIBLE_CON_ADAPTACION">COMPATIBLE CON ADAPTACIÓN</option>
                            <option value="REQUIERE_REVISION">REQUIERE REVISIÓN EN TALLER</option>
                          </select>
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">
                            Notas técnicas de montaje (opcional)
                          </label>
                          <input
                            type="text"
                            value={newCompatNotes}
                            onChange={(e) => setNewCompatNotes(e.target.value)}
                            placeholder="Ej. Verificar conector Anderson 50A"
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-none"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={isSubmittingCatalog}
                          className="w-full rounded-lg bg-amber-400 hover:bg-amber-500 disabled:opacity-50 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-2xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Icon name="plus" className="w-4 h-4" />
                          <span>{isSubmittingCatalog ? 'Vinculando...' : 'Guardar compatibilidad'}</span>
                        </button>
                      </form>
                    </>
                  )}

                  {catalogEntityTab === 'marcas' && (
                    <>
                      <div className="border-b border-slate-100 pb-3">
                        <h2 className="text-sm font-bold text-slate-900">
                          Registrar nueva marca
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Inserción directa en <code className="font-mono">public.marcas</code>
                        </p>
                      </div>
                      <form onSubmit={handleCreateBrand} className="space-y-3.5 text-xs">
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">
                            Nombre de la marca
                          </label>
                          <input
                            type="text"
                            required
                            value={newBrandName}
                            onChange={(e) => setNewBrandName(e.target.value)}
                            placeholder="Ej. NIU / Super Soco"
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">
                            País de origen
                          </label>
                          <input
                            type="text"
                            value={newBrandOrigin}
                            onChange={(e) => setNewBrandOrigin(e.target.value)}
                            placeholder="China"
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-none"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={isSubmittingCatalog}
                          className="w-full rounded-lg bg-amber-400 hover:bg-amber-500 disabled:opacity-50 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-2xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Icon name="plus" className="w-4 h-4" />
                          <span>{isSubmittingCatalog ? 'Guardando...' : 'Agregar marca homologada'}</span>
                        </button>
                      </form>
                    </>
                  )}
                </section>

                {/* Columna Derecha (8 cols): Tabla Filtrable de la Entidad Seleccionada */}
                <section className="lg:col-span-8 rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
                  {/* Barra de herramientas de tabla */}
                  <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="relative flex-1 max-w-md">
                      <Icon
                        name="search"
                        className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                      />
                      <input
                        type="search"
                        value={catalogSearch}
                        onChange={(e) => setCatalogSearch(e.target.value)}
                        placeholder="Filtrar registros por nombre, SKU, marca o nota técnica..."
                        className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-slate-900 focus:outline-none"
                      />
                    </div>

                    {catalogEntityTab === 'modelos' && (
                      <select
                        aria-label="Filtrar modelos por marca"
                        value={catalogBrandFilter}
                        onChange={(e) => setCatalogBrandFilter(e.target.value)}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 focus:border-slate-900 focus:outline-none"
                      >
                        <option value="ALL">Todas las marcas ({brands.length})</option>
                        {brands.map((b) => (
                          <option key={b.id_marca} value={String(b.id_marca)}>
                            {b.nombre}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Tabla: Modelos */}
                  {catalogEntityTab === 'modelos' && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                          <tr>
                            <th className="px-4 py-3">ID</th>
                            <th className="px-4 py-3">Imagen</th>
                            <th className="px-4 py-3">Marca</th>
                            <th className="px-4 py-3">Modelo de Moto Eléctrica</th>
                            <th className="px-4 py-3">Voltaje Nominal</th>
                            <th className="px-4 py-3">Potencia Motor</th>
                            <th className="px-4 py-3">Estado</th>
                            <th className="px-4 py-3 text-right">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 text-slate-700">
                          {filteredModels.map((m) => {
                            const isMenuOpen = activeModelMenuId === m.id_modelo;
                            return (
                              <tr key={m.id_modelo} className="hover:bg-slate-50/80">
                                <td className="px-4 py-3 font-mono text-slate-500">#{m.id_modelo}</td>
                                <td className="px-4 py-2.5">
                                  <div className="h-10 w-14 rounded-lg border border-slate-200 bg-white overflow-hidden flex items-center justify-center p-0.5">
                                    <SafeCatalogImage src={m.imagen_url} alt={m.nombre} />
                                  </div>
                                </td>
                                <td className="px-4 py-3 font-bold text-slate-900">
                                  {brandNameById.get(m.id_marca) || `Marca #${m.id_marca}`}
                                </td>
                                <td className="px-4 py-3 font-semibold text-slate-900">{m.nombre}</td>
                                <td className="px-4 py-3 font-mono">
                                  {m.voltaje_nominal_v ? (
                                    <span className="rounded bg-blue-50 border border-blue-200 px-2 py-0.5 text-blue-800 font-semibold">
                                      {m.voltaje_nominal_v}V
                                    </span>
                                  ) : (
                                    <span className="text-slate-400">No especificado</span>
                                  )}
                                </td>
                                <td className="px-4 py-3 font-mono">
                                  {m.potencia_motor_w ? `${m.potencia_motor_w} W` : 'No especificado'}
                                </td>
                                <td className="px-4 py-3">
                                  <span
                                    className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase border ${
                                      m.estado
                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                        : 'bg-slate-100 text-slate-600 border-slate-200'
                                    }`}
                                  >
                                    {m.estado ? 'Activo' : 'Inactivo'}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-right relative">
                                  <div className="inline-block text-left">
                                    <button
                                      type="button"
                                      aria-label={`Acciones para modelo ${m.nombre}`}
                                      onClick={() => setActiveModelMenuId(isMenuOpen ? null : m.id_modelo)}
                                      className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 shadow-2xs transition-colors cursor-pointer"
                                    >
                                      <Icon name="more-vertical" className="w-4 h-4" />
                                    </button>

                                    {isMenuOpen && (
                                      <div className="absolute right-0 mt-1 w-52 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl z-30 text-left text-xs space-y-0.5">
                                        <button
                                          type="button"
                                          onClick={() => handleOpenReclassifyModal(m, 'modelos_moto')}
                                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-indigo-700 hover:bg-indigo-50 font-medium transition-colors cursor-pointer"
                                        >
                                          <Icon name="arrow-right" className="w-3.5 h-3.5" />
                                          <span>Mover a catálogo...</span>
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Tabla: Repuestos */}
                  {catalogEntityTab === 'repuestos' && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                          <tr>
                            <th className="px-4 py-3">Imagen</th>
                            <th className="px-4 py-3">SKU</th>
                            <th className="px-4 py-3">Descripción del Repuesto</th>
                            <th className="px-4 py-3 text-right">Precio Unitario</th>
                            <th className="px-4 py-3">Estado</th>
                            <th className="px-4 py-3 text-right">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 text-slate-700">
                          {filteredParts.map((p) => {
                            const badge = getProductStatusBadge(p.data_status, p.estado);
                            const isMenuOpen = activePartMenuId === p.id_repuesto;
                            const currentStatus = String(p.data_status || (p.estado ? 'ACTIVO' : 'OCULTO')).toUpperCase();
                            const isBlocked = currentStatus === PRODUCT_STATUSES.BLOQUEADO;
                            const isPaused = currentStatus === PRODUCT_STATUSES.PAUSADO;
                            const isHidden = currentStatus === PRODUCT_STATUSES.OCULTO;
                            const isArchived = currentStatus === PRODUCT_STATUSES.ARCHIVADO;

                            return (
                              <tr key={p.id_repuesto} className="hover:bg-slate-50/80">
                                <td className="px-4 py-2.5">
                                  <div className="h-10 w-14 rounded-lg border border-slate-200 bg-white overflow-hidden flex items-center justify-center p-0.5">
                                    <SafeCatalogImage src={p.imagen_url} alt={p.nombre} />
                                  </div>
                                </td>
                                <td className="px-4 py-3 font-mono font-bold text-slate-900">
                                  {p.codigo_sku}
                                </td>
                                <td className="px-4 py-3">
                                  <div className="font-medium text-slate-900">{p.nombre}</div>
                                  {p.notas && (
                                    <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1 italic" title={p.notas}>
                                      {p.notas}
                                    </p>
                                  )}
                                </td>
                                <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                                  {formatCurrency(Number(p.precio), p.moneda || 'PEN')}
                                </td>
                                <td className="px-4 py-3">
                                  <span
                                    className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase border ${badge.bgColor} ${badge.textColor} ${badge.borderColor}`}
                                    title={badge.description}
                                  >
                                    {badge.label}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-right relative">
                                  <div className="inline-block text-left">
                                    <button
                                      type="button"
                                      aria-label={`Acciones para ${p.nombre}`}
                                      onClick={() => setActivePartMenuId(isMenuOpen ? null : p.id_repuesto)}
                                      disabled={isProcessingPartAction}
                                      className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 shadow-2xs transition-colors cursor-pointer"
                                    >
                                      <Icon name="more-vertical" className="w-4 h-4" />
                                    </button>

                                    {isMenuOpen && (
                                      <div className="absolute right-0 mt-1 w-52 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl z-30 text-left text-xs space-y-0.5">
                                        {isBlocked ? (
                                          <button
                                            type="button"
                                            onClick={() => handleProductAction(p, 'DESBLOQUEAR', { confirmed_unlock: true })}
                                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-amber-700 hover:bg-amber-50 font-medium transition-colors"
                                          >
                                            <Icon name="unlock" className="w-3.5 h-3.5" />
                                            <span>Desbloquear repuesto</span>
                                          </button>
                                        ) : (
                                          <>
                                            {(!p.estado || isPaused || isHidden || isArchived) && (
                                              <button
                                                type="button"
                                                onClick={() => handleProductAction(p, 'ACTIVAR')}
                                                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-emerald-700 hover:bg-emerald-50 font-medium transition-colors"
                                              >
                                                <Icon name="check-circle" className="w-3.5 h-3.5" />
                                                <span>Activar / En venta</span>
                                              </button>
                                            )}

                                            {p.estado && !isPaused && !isHidden && (
                                              <button
                                                type="button"
                                                onClick={() => handleProductAction(p, 'PAUSAR')}
                                                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-amber-700 hover:bg-amber-50 font-medium transition-colors"
                                              >
                                                <Icon name="pause" className="w-3.5 h-3.5" />
                                                <span>Pausar venta</span>
                                              </button>
                                            )}

                                            {isHidden ? (
                                              <button
                                                type="button"
                                                onClick={() => handleProductAction(p, 'PUBLICAR')}
                                                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-blue-700 hover:bg-blue-50 font-medium transition-colors"
                                              >
                                                <Icon name="filter" className="w-3.5 h-3.5" />
                                                <span>Publicar en catálogo</span>
                                              </button>
                                            ) : (
                                              <button
                                                type="button"
                                                onClick={() => handleProductAction(p, 'OCULTAR')}
                                                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 font-medium transition-colors"
                                              >
                                                <Icon name="x" className="w-3.5 h-3.5" />
                                                <span>Ocultar de tienda</span>
                                              </button>
                                            )}

                                            <button
                                              type="button"
                                              onClick={() => handleProductAction(p, 'BLOQUEAR')}
                                              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-700 hover:bg-red-50 font-medium transition-colors"
                                            >
                                              <Icon name="lock" className="w-3.5 h-3.5" />
                                              <span>Bloquear producto...</span>
                                            </button>
                                          </>
                                        )}

                                        <div className="border-t border-slate-100 my-1" />

                                        <button
                                          type="button"
                                          onClick={() => handleOpenReclassifyModal(p, 'repuestos')}
                                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-indigo-700 hover:bg-indigo-50 font-medium transition-colors cursor-pointer"
                                        >
                                          <Icon name="arrow-right" className="w-3.5 h-3.5" />
                                          <span>Mover a catálogo...</span>
                                        </button>

                                        <button
                                          type="button"
                                          onClick={() => handleProductAction(p, 'ELIMINAR')}
                                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-rose-700 hover:bg-rose-50 font-medium transition-colors cursor-pointer"
                                        >
                                          <Icon name="trash" className="w-3.5 h-3.5" />
                                          <span>Eliminar / Archivar...</span>
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Modal Bloqueo Administrativo (Issue #9) */}
                  {blockModalPart && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
                      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-700 border border-red-200">
                            <Icon name="lock" className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-slate-900">Bloquear Repuesto</h3>
                            <p className="text-xs text-slate-500">
                              {blockModalPart.codigo_sku} — {blockModalPart.nombre}
                            </p>
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed">
                          Al bloquear este producto, se retirará de inmediato de la tienda pública, carrito, pasarela de pagos y sugerencias de VoltIA. Requiere ingresar una justificación técnica o de seguridad.
                        </p>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Motivo obligatorio de bloqueo *
                          </label>
                          <textarea
                            rows={3}
                            value={blockReason}
                            onChange={(e) => setBlockReason(e.target.value)}
                            placeholder="Ej. Incidencia de calidad en lote de fábrica / Pendiente de revisión técnica con proveedor."
                            className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-none"
                          />
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => {
                              setBlockModalPart(null);
                              setBlockReason('');
                            }}
                            disabled={isProcessingPartAction}
                            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            onClick={handleConfirmBlock}
                            disabled={isProcessingPartAction || blockReason.trim().length < 5}
                            className="rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold px-4 py-2 text-xs shadow-2xs transition-colors"
                          >
                            {isProcessingPartAction ? 'Bloqueando...' : 'Confirmar Bloqueo'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Modal Eliminar / Archivar con Protección de Trazabilidad (Issue #9) */}
                  {deleteModalPart && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
                      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-700 border border-rose-200">
                            <Icon name="trash" className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-slate-900">Eliminar o Archivar Repuesto</h3>
                            <p className="text-xs text-slate-500">
                              {deleteModalPart.codigo_sku} — {deleteModalPart.nombre}
                            </p>
                          </div>
                        </div>

                        <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 text-xs text-amber-900 space-y-1">
                          <p className="font-bold">Protección de integridad contable y fiscal:</p>
                          <p className="text-[11px] leading-relaxed">
                            Si este repuesto cuenta con registros en ventas o pedidos pasados, el sistema aplicará automáticamente una <strong>baja lógica (Archivado)</strong> para conservar la trazabilidad legal exigida por SUNAT. Si no cuenta con pedidos históricos, se eliminará permanentemente.
                          </p>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => setDeleteModalPart(null)}
                            disabled={isProcessingPartAction}
                            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            onClick={handleConfirmDelete}
                            disabled={isProcessingPartAction}
                            className="rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold px-4 py-2 text-xs shadow-2xs transition-colors"
                          >
                            {isProcessingPartAction ? 'Procesando...' : 'Confirmar Eliminación'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Modal Reclasificar / Mover a Catálogo */}
                  {reclassifyModalItem && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
                      <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-5 my-8">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200">
                            <Icon name="layers" className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-base font-bold text-slate-900">Mover a catálogo / Reclasificar</h3>
                            <p className="text-xs text-slate-500">
                              {reclassifyModalItem.sourceEntity === 'repuestos'
                                ? `SKU: ${(reclassifyModalItem.item as AdminPartRecord).codigo_sku}`
                                : `Modelo #${(reclassifyModalItem.item as AdminModelRecord).id_modelo}`}
                              {' — '}
                              <strong className="text-slate-800">{reclassifyModalItem.item.nombre}</strong>
                            </p>
                          </div>
                        </div>

                        {/* Clasificación actual */}
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 flex items-center justify-between text-xs">
                          <div>
                            <span className="text-slate-500 font-medium">Ubicación y clasificación actual:</span>
                            <div className="font-bold text-slate-900 mt-0.5">
                              {reclassifyModalItem.sourceEntity === 'repuestos'
                                ? 'Lista de Repuestos y Componentes'
                                : 'Lista de Modelos de Vehículos EV'}
                            </div>
                          </div>
                          <span className="rounded-lg bg-white border border-slate-300 px-2.5 py-1 font-mono text-[11px] font-bold text-slate-700">
                            {reclassifyModalItem.sourceEntity === 'repuestos'
                              ? (reclassifyModalItem.item as AdminPartRecord).codigo_sku
                              : `ID #${(reclassifyModalItem.item as AdminModelRecord).id_modelo}`}
                          </span>
                        </div>

                        {/* Selector de Lista de Destino */}
                        <div className="space-y-2">
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                            Seleccionar Lista de Destino:
                          </label>

                          <div className="grid grid-cols-1 gap-2.5">
                            {/* Opción 1: Modelos EV */}
                            <label
                              className={`flex items-start gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-colors ${
                                reclassifyTargetList === 'modelos_ev'
                                  ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 font-medium'
                                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              <input
                                type="radio"
                                name="targetList"
                                value="modelos_ev"
                                checked={reclassifyTargetList === 'modelos_ev'}
                                onChange={() => setReclassifyTargetList('modelos_ev')}
                                className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                              />
                              <div>
                                <span className="font-bold block">Modelos EV (Vehículos Eléctricos Completos)</span>
                                <span className="text-[11px] text-slate-600 block mt-0.5">
                                  Para motocargas, motocicletas, trimotos, bicimotos y scooters eléctricos.
                                </span>
                              </div>
                            </label>

                            {/* Opción 2: Repuestos */}
                            <label
                              className={`flex items-start gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-colors ${
                                reclassifyTargetList === 'repuestos'
                                  ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 font-medium'
                                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              <input
                                type="radio"
                                name="targetList"
                                value="repuestos"
                                checked={reclassifyTargetList === 'repuestos'}
                                onChange={() => setReclassifyTargetList('repuestos')}
                                className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                              />
                              <div>
                                <span className="font-bold block">Repuestos y Componentes</span>
                                <span className="text-[11px] text-slate-600 block mt-0.5">
                                  Para baterías, BMS, controladores, motores, cargadores, frenos, llantas y accesorios.
                                </span>
                              </div>
                            </label>

                            {/* Opción 3: Fuera de Catálogo Comercial */}
                            <label
                              className={`flex items-start gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-colors ${
                                reclassifyTargetList === 'fuera_catalogo'
                                  ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 font-medium'
                                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              <input
                                type="radio"
                                name="targetList"
                                value="fuera_catalogo"
                                checked={reclassifyTargetList === 'fuera_catalogo'}
                                onChange={() => setReclassifyTargetList('fuera_catalogo')}
                                className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                              />
                              <div>
                                <span className="font-bold block">Otros productos / Fuera del catálogo comercial</span>
                                <span className="text-[11px] text-slate-600 block mt-0.5">
                                  Para juguetes eléctricos o artículos que no corresponden a la oferta comercial de NERO. Se excluyen de la tienda pública sin borrar su información.
                                </span>
                              </div>
                            </label>
                          </div>
                        </div>

                        {/* Campos de configuración si el destino es Modelos EV */}
                        {reclassifyTargetList === 'modelos_ev' && (
                          <div className="rounded-xl border border-indigo-100 bg-indigo-50/30 p-4 space-y-3 text-xs">
                            <h4 className="font-bold text-indigo-950 text-xs">Datos Técnicos para el Modelo EV</h4>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                  Marca Fabricante *
                                </label>
                                <select
                                  value={reclassifyBrandId}
                                  onChange={(e) => setReclassifyBrandId(e.target.value)}
                                  className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
                                >
                                  {brands.map((b) => (
                                    <option key={b.id_marca} value={String(b.id_marca)}>
                                      {b.nombre}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                  Tipo de Vehículo *
                                </label>
                                <select
                                  value={reclassifyVehicleType}
                                  onChange={(e) => setReclassifyVehicleType(e.target.value)}
                                  className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
                                >
                                  <option value="MOTOCARGA_ELECTRICA">Motocarga Eléctrica</option>
                                  <option value="MOTO_ELECTRICA">Moto Eléctrica</option>
                                  <option value="TRIMOTO_ELECTRICA">Trimoto Eléctrica</option>
                                  <option value="BICIMOTO_ELECTRICA">Bicimoto Eléctrica</option>
                                  <option value="SCOOTER_ELECTRICO">Scooter / Patinete Eléctrico</option>
                                </select>
                              </div>
                            </div>

                            <div>
                              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                Nombre del Modelo de Vehículo *
                              </label>
                              <input
                                type="text"
                                value={reclassifyModelName}
                                onChange={(e) => setReclassifyModelName(e.target.value)}
                                placeholder="Ej. Motocarga Eléctrica 1000w"
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
                              />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div>
                                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                  Voltaje Nominal (V)
                                </label>
                                <input
                                  type="number"
                                  value={reclassifyVoltage}
                                  onChange={(e) => setReclassifyVoltage(e.target.value)}
                                  placeholder="Ej. 60 o 72"
                                  className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
                                />
                              </div>

                              <div>
                                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                  Potencia Motor (W)
                                </label>
                                <input
                                  type="number"
                                  value={reclassifyPowerW}
                                  onChange={(e) => setReclassifyPowerW(e.target.value)}
                                  placeholder="Ej. 1000"
                                  className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
                                />
                              </div>

                              <div>
                                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                  Precio Referencial (PEN)
                                </label>
                                <input
                                  type="number"
                                  value={reclassifyPrice}
                                  onChange={(e) => setReclassifyPrice(e.target.value)}
                                  placeholder="Ej. 7700"
                                  className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Campos de configuración si el destino es Fuera de Catálogo */}
                        {reclassifyTargetList === 'fuera_catalogo' && (
                          <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 space-y-2.5 text-xs text-amber-900">
                            <p className="font-bold">Aviso de exclusión comercial:</p>
                            <p className="text-[11px] leading-relaxed">
                              Este producto se archivará y dejará de aparecer en la tienda pública, catálogo y sugerencias de VoltIA. Se conservarán íntegramente sus identificadores (SKU, imágenes, precios y pedidos previos) para no romper la trazabilidad histórica.
                            </p>
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                Motivo de exclusión
                              </label>
                              <input
                                type="text"
                                value={reclassifyReason}
                                onChange={(e) => setReclassifyReason(e.target.value)}
                                placeholder="Ej. Juguete eléctrico no comercializado por NERO / Producto fuera de rubro"
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
                              />
                            </div>
                          </div>
                        )}

                        {/* Datos preservados y garantía transaccional */}
                        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-[11px] text-slate-600 space-y-1">
                          <p className="font-semibold text-slate-800">Garantías de integridad comercial:</p>
                          <p>✓ Se conserva el SKU original y los identificadores de trazabilidad.</p>
                          <p>✓ No se alteran pedidos históricos, comprobantes SUNAT ni registros contables.</p>
                          <p>✓ Operación transaccional: en caso de error, el registro original permanece intacto.</p>
                        </div>

                        {/* Botones de acción */}
                        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
                          <button
                            type="button"
                            onClick={() => setReclassifyModalItem(null)}
                            disabled={isProcessingReclassify}
                            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            onClick={handleConfirmReclassify}
                            disabled={isProcessingReclassify}
                            className="rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold px-4 py-2 text-xs shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
                          >
                            <Icon name="arrow-right" className="w-3.5 h-3.5" />
                            <span>{isProcessingReclassify ? 'Reclasificando...' : 'Confirmar Reclasificación'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tabla: Compatibilidades */}
                  {catalogEntityTab === 'compatibilidades' && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                          <tr>
                            <th className="px-4 py-3">Repuesto</th>
                            <th className="px-4 py-3">Modelo Compatible</th>
                            <th className="px-4 py-3">Nivel de Verificación</th>
                            <th className="px-4 py-3">Notas Técnicas</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 text-slate-700">
                          {filteredCompatibilities.map((c) => {
                            const partInfo = partNameById.get(c.id_repuesto);
                            const modelLabel =
                              modelNameById.get(c.id_modelo) || `Modelo #${c.id_modelo}`;
                            return (
                              <tr key={c.id_compatibilidad} className="hover:bg-slate-50/80">
                                <td className="px-4 py-3">
                                  <span className="font-semibold text-slate-900 block">
                                    {partInfo?.name || `Repuesto #${c.id_repuesto}`}
                                  </span>
                                  {partInfo?.sku && (
                                    <span className="font-mono text-[11px] text-slate-500">
                                      {partInfo.sku}
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-3 font-medium text-slate-900">
                                  {modelLabel}
                                </td>
                                <td className="px-4 py-3">
                                  <span
                                    className={`inline-flex rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase ${
                                      c.nivel_verificacion === 'CONFIRMADA'
                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                        : 'bg-amber-50 text-amber-900 border-amber-200'
                                    }`}
                                  >
                                    {c.nivel_verificacion}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-slate-600">
                                  {c.notas_tecnicas || 'Calce directo verificado'}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Tabla: Marcas */}
                  {catalogEntityTab === 'marcas' && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                          <tr>
                            <th className="px-4 py-3">ID Marca</th>
                            <th className="px-4 py-3">Marca Homologada</th>
                            <th className="px-4 py-3">País de Origen</th>
                            <th className="px-4 py-3">Estado</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 text-slate-700">
                          {filteredBrands.map((b) => (
                            <tr key={b.id_marca} className="hover:bg-slate-50/80">
                              <td className="px-4 py-3 font-mono text-slate-500">#{b.id_marca}</td>
                              <td className="px-4 py-3 font-bold text-slate-900">{b.nombre}</td>
                              <td className="px-4 py-3 text-slate-600">
                                {b.pais_origen || 'China'}
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`inline-flex rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase ${
                                    b.estado
                                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                      : 'bg-slate-100 text-slate-600 border-slate-200'
                                  }`}
                                >
                                  {b.estado ? 'Activa' : 'Inactiva'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              </div>
            </div>
          )}

          {/* ====================================================================
              3. MÓDULO: INVENTARIO PROPIO VS PROVEEDOR (productos)
             ==================================================================== */}
          {activeModule === 'productos' && (
            <div className="space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-5">
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-slate-900">
                    Inventario propio vs proveedor
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1">
                    Regla comercial activa: únicamente los productos con stock propio verificado habilitan cobro directo en el checkout; las piezas de proveedor operan bajo consulta técnica externa.
                  </p>
                </div>
              </div>

              {persistedPartsError && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-900 shadow-2xs">
                  <div className="flex items-center gap-2 font-bold text-red-800">
                    <Icon name="alert-triangle" className="w-4 h-4 text-red-600 shrink-0" />
                    <span>Error al consultar registros de inventario en public.repuestos (Supabase)</span>
                  </div>
                  <p className="mt-1 text-red-700">{persistedPartsError}</p>
                  <p className="mt-1 text-slate-500">
                    Por integridad comercial, no se sustituyen los registros fallidos con datos simulados o cantidades inventadas.
                  </p>
                </div>
              )}

              {/* Resumen comparativo */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
                    Ítems de Venta Directa (Stock Propio)
                  </span>
                  <span className="text-2xl font-extrabold text-slate-900 font-mono mt-1 block">
                    {directSaleCount} SKU
                  </span>
                  <span className="text-xs text-emerald-700 font-medium mt-0.5 block">
                    {directSaleCount > 0 ? 'Habilitados para carrito y cobro Culqi' : 'Sin existencias propias físicas confirmadas'}
                  </span>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
                    Catálogo Persistido en Supabase
                  </span>
                  <span className="text-2xl font-extrabold text-slate-900 font-mono mt-1 block">
                    {persistedParts.length} repuestos
                  </span>
                  <span className="text-xs text-slate-500 mt-0.5 block">
                    Registros en base de datos PostgreSQL
                  </span>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
                    Política de Despacho
                  </span>
                  <span className="text-base font-bold text-slate-900 mt-1 block leading-snug">
                    Consultar según destino y disponibilidad
                  </span>
                  <span className="text-xs text-slate-500 mt-0.5 block">
                    Sujeto a verificación logística en almacén
                  </span>
                </div>
              </div>

              {/* Filtros de modalidad y búsqueda */}
              <section className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
                <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50/70 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setInventoryModeFilter('ALL')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        inventoryModeFilter === 'ALL'
                          ? 'bg-slate-900 text-white'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      Todos ({persistedParts.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setInventoryModeFilter('DIRECT')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        inventoryModeFilter === 'DIRECT'
                          ? 'bg-emerald-700 text-white'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      Venta Directa ({directSaleCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setInventoryModeFilter('PROVIDER')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        inventoryModeFilter === 'PROVIDER'
                          ? 'bg-amber-700 text-white'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      Catálogo Proveedor ({providerPartsCount})
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1 max-w-md justify-end">
                    <div className="relative flex-1">
                      <Icon
                        name="search"
                        className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                      />
                      <input
                        type="search"
                        value={inventorySearch}
                        onChange={(e) => setInventorySearch(e.target.value)}
                        placeholder="Buscar por SKU o nombre..."
                        className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-slate-900 focus:outline-none"
                      />
                    </div>

                    {inventoryCategories.length > 0 && (
                      <select
                        aria-label="Filtrar por categoría de inventario"
                        value={inventoryCategoryFilter}
                        onChange={(e) => setInventoryCategoryFilter(e.target.value)}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 focus:border-slate-900 focus:outline-none"
                      >
                        <option value="ALL">Todas las categorías</option>
                        {inventoryCategories.map((cat) => (
                          <option key={cat} value={cat}>
                            Categoría {cat}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      <tr>
                        <th className="px-4 py-3">SKU</th>
                        <th className="px-4 py-3">Producto</th>
                        <th className="px-4 py-3">Categoría</th>
                        <th className="px-4 py-3 text-right">Precio Venta Oficial</th>
                        <th className="px-4 py-3">Stock Propio</th>
                        <th className="px-4 py-3">Modalidad Comercial</th>
                        <th className="px-4 py-3">Disponibilidad Proveedor</th>
                        <th className="px-4 py-3 text-right">Precio Proveedor</th>
                        <th className="px-4 py-3">Garantía</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-700">
                      {filteredInventoryParts.map((p) => {
                        const stockPropio = typeof p.stock_propio_ecomoto === 'number' ? p.stock_propio_ecomoto : 0;
                        const isDirect = stockPropio > 0 && p.estado !== false && (!p.data_status || p.data_status === 'ACTIVO');
                        const providerStockText =
                          p.stock_proveedor && p.stock_proveedor !== 'CONSULTAR_STOCK'
                            ? p.stock_proveedor
                            : 'Consultar stock';

                        return (
                          <tr key={p.id_repuesto || p.codigo_sku} className="hover:bg-slate-50/80">
                            <td className="px-4 py-3 font-mono font-bold text-slate-900">
                              {p.codigo_sku}
                            </td>
                            <td className="px-4 py-3 font-semibold text-slate-900">{p.nombre}</td>
                            <td className="px-4 py-3 text-slate-600">Cat. {p.id_categoria || '—'}</td>
                            <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                              {formatCurrency(Number(p.precio) || 0, p.moneda || 'PEN')}
                            </td>
                            <td className="px-4 py-3">
                              {stockPropio > 0 ? (
                                <span className="inline-flex rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 font-mono text-[11px] font-bold text-emerald-800">
                                  {stockPropio} unid.
                                </span>
                              ) : (
                                <span className="inline-flex rounded-md bg-slate-100 border border-slate-200 px-2 py-0.5 font-mono text-[11px] font-medium text-slate-500">
                                  0 unid.
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {isDirect ? (
                                <span className="inline-flex rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-800">
                                  Venta Directa
                                </span>
                              ) : (
                                <span className="inline-flex rounded-md bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-800">
                                  Catálogo Proveedor
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-slate-600 font-medium">
                                {providerStockText}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right font-mono text-slate-600">
                              {typeof p.precio_proveedor_pen === 'number' && p.precio_proveedor_pen > 0
                                ? formatCurrency(p.precio_proveedor_pen, 'PEN')
                                : '—'}
                            </td>
                            <td className="px-4 py-3 text-slate-400 italic">
                              No registrada
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {filteredInventoryParts.length === 0 && (
                    <div className="p-8 text-center text-xs text-slate-500">
                      {inventoryModeFilter === 'DIRECT' ? (
                        <div>
                          <p className="font-semibold text-slate-800 text-sm">0 SKU de venta directa confirmados</p>
                          <p className="mt-1 max-w-md mx-auto text-slate-500">
                            No se registran existencias físicas propias mayores a cero en public.repuestos. Todos los repuestos disponibles operan actualmente mediante catálogo de proveedor.
                          </p>
                        </div>
                      ) : (
                        <p>No se encontraron repuestos en el inventario con los criterios de búsqueda.</p>
                      )}
                    </div>
                  )}
                </div>
              </section>
            </div>
          )}

          {/* ====================================================================
              4. MÓDULO: PEDIDOS (pedidos)
             ==================================================================== */}
          {activeModule === 'pedidos' && (
            <div className="space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-5">
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-slate-900">
                    Pedidos y Punto de Venta (POS)
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1">
                    Control de órdenes comerciales y ventas de mostrador POS: Confirmado → En preparación → En tránsito → Completado / Entregado.
                  </p>
                </div>
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    disabled={isRefreshingOrders}
                    onClick={handleRefreshOrders}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Icon name="search" className={`w-3.5 h-3.5 ${isRefreshingOrders ? 'animate-spin' : ''}`} />
                    <span>{isRefreshingOrders ? 'Sincronizando...' : 'Sincronizar Pedidos POS'}</span>
                  </button>
                </div>
              </div>

              {queryErrors?.pedidos && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-900 shadow-2xs">
                  <div className="flex items-center gap-2 font-bold text-red-800">
                    <Icon name="alert-triangle" className="w-4 h-4 text-red-600 shrink-0" />
                    <span>Error al consultar pedidos en Supabase</span>
                  </div>
                  <p className="mt-1 text-red-700">{queryErrors.pedidos}</p>
                </div>
              )}

              <section className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
                <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="relative flex-1 max-w-md">
                    <Icon
                      name="search"
                      className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    />
                    <input
                      type="search"
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      placeholder="Buscar por número de orden, comprador, correo o DNI/RUC..."
                      className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-slate-900 focus:outline-none"
                    />
                  </div>

                  <select
                    aria-label="Filtrar pedidos por estado"
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 focus:border-slate-900 focus:outline-none"
                  >
                    <option value="ALL">Todos los estados ({orders.length})</option>
                    <option value="confirmado">Confirmado (Pago verificado)</option>
                    <option value="en_preparacion">En preparación (Almacén)</option>
                    <option value="despachado">En tránsito (Despachado)</option>
                    <option value="entregado">Completado / Entregado</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>

                {filteredOrders.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-500 mb-3">
                      <Icon name="shopping-bag" className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-bold text-slate-800">
                      {orders.length === 0
                        ? 'No existen pedidos registrados en el sistema'
                        : 'Ningún pedido coincide con los filtros aplicados'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                      {orders.length === 0
                        ? 'Las órdenes generadas desde el checkout de la tienda pública se listarán en esta tabla junto con sus controles de avance logístico.'
                        : 'Intenta limpiar el término de búsqueda o cambiar el filtro de estado.'}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                        <tr>
                          <th className="px-4 py-3">Orden</th>
                          <th className="px-4 py-3">Comprador</th>
                          <th className="px-4 py-3">Entrega</th>
                          <th className="px-4 py-3 text-right">Total</th>
                          <th className="px-4 py-3">Pago</th>
                          <th className="px-4 py-3">Estado Pedido</th>
                          <th className="px-4 py-3">Comprobante</th>
                          <th className="px-4 py-3 text-right">Acciones de Operador</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-slate-700">
                        {filteredOrders.map((o) => (
                          <tr key={o.id_pedido} className="hover:bg-slate-50/80">
                            <td className="px-4 py-3 font-mono font-bold text-slate-900">
                              {o.numero_pedido}
                            </td>
                            <td className="px-4 py-3">
                              <span className="font-bold text-slate-900 block">
                                {o.cliente_nombre}
                              </span>
                              <span className="text-[11px] text-slate-500 block">
                                {o.cliente_email}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-slate-600">{o.modalidad_entrega}</td>
                            <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                              {formatCurrency(Number(o.total), o.moneda || 'PEN')}
                            </td>
                            <td className="px-4 py-3">
                              <span className="inline-flex rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-800">
                                {o.estado_pago}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              {renderOrderStatusBadge(o.estado_pedido)}
                            </td>
                            <td className="px-4 py-3 font-mono text-[11px] uppercase text-slate-600">
                              {o.tipo_comprobante} ({o.estado_comprobante})
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="inline-flex flex-wrap justify-end gap-1.5">
                                {o.estado_pedido === 'confirmado' && (
                                  <button
                                    type="button"
                                    disabled={isUpdatingOrder === o.id_pedido}
                                    onClick={() => handleUpdateOrderStatus(o.id_pedido, 'en_preparacion')}
                                    className="rounded-lg bg-amber-400 hover:bg-amber-500 text-slate-950 px-2.5 py-1 text-[11px] font-bold transition-colors cursor-pointer disabled:opacity-50"
                                  >
                                    Pasar a En Preparación →
                                  </button>
                                )}
                                {o.estado_pedido === 'en_preparacion' && (
                                  <button
                                    type="button"
                                    disabled={isUpdatingOrder === o.id_pedido}
                                    onClick={() => handleUpdateOrderStatus(o.id_pedido, 'despachado')}
                                    className="rounded-lg bg-[#0B1528] hover:bg-slate-800 text-white px-2.5 py-1 text-[11px] font-bold transition-colors cursor-pointer disabled:opacity-50"
                                  >
                                    Poner En Tránsito →
                                  </button>
                                )}
                                {o.estado_pedido === 'despachado' && (
                                  <button
                                    type="button"
                                    disabled={isUpdatingOrder === o.id_pedido}
                                    onClick={() => handleUpdateOrderStatus(o.id_pedido, 'entregado')}
                                    className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 text-[11px] font-bold transition-colors cursor-pointer disabled:opacity-50"
                                  >
                                    Marcar Completado / Entregado ✓
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </div>
          )}

          {/* ====================================================================
              5. MÓDULO: CLIENTES E INVITADOS (clientes)
             ==================================================================== */}
          {activeModule === 'clientes' && (
            <div className="space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-5">
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-slate-900">
                    Clientes e invitados
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1">
                    Directorio de compradores registrados e invitados en órdenes comerciales, protegido por políticas RLS.
                  </p>
                </div>
              </div>

              <section className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
                <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="relative flex-1 max-w-md">
                    <Icon
                      name="search"
                      className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    />
                    <input
                      type="search"
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      placeholder="Buscar por nombre, correo o documento (DNI / RUC)..."
                      className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-slate-900 focus:outline-none"
                    />
                  </div>

                  <select
                    aria-label="Filtrar por modalidad de comprador"
                    value={customerTypeFilter}
                    onChange={(e) =>
                      setCustomerTypeFilter(e.target.value as 'ALL' | 'REGISTERED' | 'GUEST')
                    }
                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 focus:border-slate-900 focus:outline-none"
                  >
                    <option value="ALL">Todos los compradores</option>
                    <option value="REGISTERED">Clientes con cuenta</option>
                    <option value="GUEST">Compradores invitados</option>
                  </select>
                </div>

                {filteredCustomers.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-500 mb-3">
                      <Icon name="users" className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-bold text-slate-800">
                      Sin registros de compradores en órdenes recientes
                    </p>
                    <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                      Los datos de contacto y documento fiscal de clientes registrados e invitados aparecerán aquí conforme se registren pedidos.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                        <tr>
                          <th className="px-4 py-3">Nombre / Razón Social</th>
                          <th className="px-4 py-3">Correo y Teléfono</th>
                          <th className="px-4 py-3">Documento Fiscal</th>
                          <th className="px-4 py-3">Tipo de Cuenta</th>
                          <th className="px-4 py-3">Orden Asociada</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-slate-700">
                        {filteredCustomers.map((o) => (
                          <tr key={o.id_pedido} className="hover:bg-slate-50/80">
                            <td className="px-4 py-3 font-bold text-slate-900">
                              {o.cliente_nombre}
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-slate-800 block">{o.cliente_email}</span>
                              <span className="text-[11px] text-slate-500">
                                {o.cliente_telefono || 'Teléfono no registrado'}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-mono text-slate-700">
                              {o.doc_numero} ({o.tipo_comprobante})
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase ${
                                  o.es_invitado
                                    ? 'bg-slate-100 text-slate-700 border-slate-300'
                                    : 'bg-blue-50 text-blue-800 border-blue-200'
                                }`}
                              >
                                {o.es_invitado ? 'Comprador Invitado' : 'Cliente con Cuenta'}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-mono font-semibold text-slate-800">
                              {o.numero_pedido}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </div>
          )}

          {/* ====================================================================
              6. MÓDULO: PROMOCIONES (promociones)
             ==================================================================== */}
          {activeModule === 'promociones' && (
            <div className="space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-5">
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-slate-900">
                    Promociones y suscripciones comerciales
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1">
                    Control del beneficio de primera compra y auditoría de consentimientos en <code className="font-mono">public.suscripciones_newsletter</code>.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Reglas del cupón activo */}
                <section className="lg:col-span-5 rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-2 py-0.5">
                        Regla Activa en Servidor
                      </span>
                      <h2 className="text-base font-bold text-slate-900 mt-2">
                        Cupón primera compra: <code className="font-mono text-[#0B1528]">BIENVENIDO5</code>
                      </h2>
                    </div>
                    <span className="text-2xl font-extrabold font-mono text-amber-600">-5%</span>
                  </div>

                  <dl className="space-y-2.5 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <dt className="text-slate-500">Descuento aplicado</dt>
                      <dd className="font-semibold text-slate-900">5% sobre subtotal de productos</dd>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <dt className="text-slate-500">Límite de redención</dt>
                      <dd className="font-semibold text-slate-900">1 uso por correo normalizado</dd>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <dt className="text-slate-500">Versión de consentimiento</dt>
                      <dd className="font-mono font-semibold text-slate-900">v1.0 (auditado)</dd>
                    </div>
                  </dl>
                </section>

                {/* Tabla de suscripciones reales */}
                <section className="lg:col-span-7 rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
                  <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <h2 className="text-sm font-bold text-slate-900">
                      Suscripciones registradas ({initialSubscriptions.length})
                    </h2>
                    <div className="relative w-full sm:w-64">
                      <Icon
                        name="search"
                        className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                      />
                      <input
                        type="search"
                        value={subscriptionSearch}
                        onChange={(e) => setSubscriptionSearch(e.target.value)}
                        placeholder="Filtrar por correo u origen..."
                        className="w-full rounded-lg border border-slate-300 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-slate-900 focus:outline-none"
                      />
                    </div>
                  </div>

                  {filteredSubscriptions.length === 0 ? (
                    <div className="p-10 text-center text-xs text-slate-500">
                      No hay suscripciones comerciales registradas que coincidan con el criterio actual.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                          <tr>
                            <th className="px-4 py-3">Correo Electrónico</th>
                            <th className="px-4 py-3">Canal de Origen</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 text-slate-700">
                          {filteredSubscriptions.map((sub) => (
                            <tr key={sub.id_suscripcion || sub.email} className="hover:bg-slate-50/80">
                              <td className="px-4 py-3 font-mono font-medium text-slate-900">
                                {sub.email}
                              </td>
                              <td className="px-4 py-3">
                                <span className="inline-flex rounded-md bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-700 uppercase">
                                  {sub.origen || 'web_storefront'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              </div>
            </div>
          )}

          {/* ====================================================================
              7. MÓDULO: BOLETAS Y FACTURAS SUNAT (facturacion)
             ==================================================================== */}
          {activeModule === 'facturacion' && (
            <div className="space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-5">
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-slate-900">
                    Boletas y facturas SUNAT
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1">
                    Registro tributario estructurado con desglose de IGV (18%), validación de DNI (8 dígitos) para Boletas y RUC (11 dígitos) para Facturas.
                  </p>
                </div>
              </div>

              {queryErrors?.documentos && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-900 shadow-2xs">
                  <div className="flex items-center gap-2 font-bold text-red-800">
                    <Icon name="alert-triangle" className="w-4 h-4 text-red-600 shrink-0" />
                    <span>Error al consultar comprobantes fiscales en Supabase</span>
                  </div>
                  <p className="mt-1 text-red-700">{queryErrors.documentos}</p>
                </div>
              )}

              {/* Aviso transparente sobre el estado de la integración SEE-OSE */}
              <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-950">
                <div className="flex items-start gap-2.5">
                  <Icon name="alert-triangle" className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold">Estado de integración SEE-OSE:</strong> Los comprobantes se estructuran y almacenan en <code className="font-mono">public.documentos_fiscales</code> con series correlativas (<code className="font-mono">B001</code> / <code className="font-mono">F001</code>). La emisión electrónica hacia SUNAT requiere vincular el certificado digital y endpoint del operador OSE en producción.
                  </div>
                </div>
              </div>

              <section className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
                <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="relative flex-1 max-w-md">
                    <Icon
                      name="search"
                      className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    />
                    <input
                      type="search"
                      value={documentSearch}
                      onChange={(e) => setDocumentSearch(e.target.value)}
                      placeholder="Buscar por serie-número, razón social o DNI/RUC..."
                      className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-slate-900 focus:outline-none"
                    />
                  </div>

                  <select
                    aria-label="Filtrar por tipo de comprobante"
                    value={documentTypeFilter}
                    onChange={(e) => setDocumentTypeFilter(e.target.value)}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 focus:border-slate-900 focus:outline-none"
                  >
                    <option value="ALL">Todos los comprobantes ({initialDocuments.length})</option>
                    <option value="BOLETA">Boletas de Venta (B001)</option>
                    <option value="FACTURA">Facturas Electrónicas (F001)</option>
                  </select>
                </div>

                {filteredDocuments.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-500 mb-3">
                      <Icon name="file-text" className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-bold text-slate-800">
                      No hay documentos fiscales registrados actualmente
                    </p>
                    <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                      Los comprobantes asociados a órdenes pagadas se registrarán automáticamente en <code className="font-mono">public.documentos_fiscales</code>.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                        <tr>
                          <th className="px-4 py-3">Tipo</th>
                          <th className="px-4 py-3">Serie y Número</th>
                          <th className="px-4 py-3">Receptor (DNI / RUC)</th>
                          <th className="px-4 py-3 text-right">Op. Gravada</th>
                          <th className="px-4 py-3 text-right">IGV (18%)</th>
                          <th className="px-4 py-3 text-right">Importe Total</th>
                          <th className="px-4 py-3">Estado</th>
                          <th className="px-4 py-3 text-right">Descargas SUNAT</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-slate-700">
                        {filteredDocuments.map((doc) => {
                          const linkedGuia = doc.id_pedido ? guiaByOrderId.get(doc.id_pedido) : null;
                          return (
                            <tr key={doc.id_documento} className="hover:bg-slate-50/80">
                              <td className="px-4 py-3 font-bold uppercase text-slate-900">
                                <div className="flex items-center gap-2">
                                  <span>{doc.tipo}</span>
                                  {linkedGuia && (
                                    <span
                                      className="inline-flex items-center gap-1 rounded bg-sky-50 border border-sky-200 px-1.5 py-0.5 text-[10px] font-bold text-sky-800"
                                      title={`GRE vinculada: ${linkedGuia.serie}-${linkedGuia.numero}`}
                                    >
                                      <Icon name="truck" className="w-3 h-3 text-sky-600" />
                                      {linkedGuia.serie}-{linkedGuia.numero}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3 font-mono font-semibold text-slate-900">
                                {doc.serie}-{doc.numero}
                              </td>
                              <td className="px-4 py-3">
                                <span className="font-medium text-slate-900 block">
                                  {doc.datos_receptor?.businessName || 'Cliente'}
                                </span>
                                <span className="font-mono text-[11px] text-slate-500">
                                  {doc.datos_receptor?.docType || 'Doc'}: {doc.datos_receptor?.docNumber || 'S/N'}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right font-mono text-slate-700">
                                {formatCurrency(Number(doc.total_gravada), 'PEN')}
                              </td>
                              <td className="px-4 py-3 text-right font-mono text-slate-700">
                                {formatCurrency(Number(doc.total_igv), 'PEN')}
                              </td>
                              <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                                {formatCurrency(Number(doc.total_comprobante), 'PEN')}
                              </td>
                              <td className="px-4 py-3">
                                <span className="inline-flex rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-900">
                                  {doc.estado}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleDownloadDocument(doc.id_documento, 'a4')}
                                    disabled={downloadingDocId === `${doc.id_documento}-a4`}
                                    title={`Descargar ${doc.serie}-${doc.numero}-A4.pdf`}
                                    className="px-2 py-1 rounded bg-white hover:bg-slate-100 border border-slate-300 text-[11px] font-bold text-slate-700 inline-flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                                  >
                                    <Icon name="download" className="w-3 h-3 text-slate-500" />
                                    <span>PDF A4</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDownloadDocument(doc.id_documento, '80mm')}
                                    disabled={downloadingDocId === `${doc.id_documento}-80mm`}
                                    title={`Descargar ${doc.serie}-${doc.numero}-80mm.pdf`}
                                    className="px-2 py-1 rounded bg-white hover:bg-slate-100 border border-slate-300 text-[11px] font-bold text-slate-700 inline-flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                                  >
                                    <Icon name="receipt" className="w-3 h-3 text-slate-500" />
                                    <span>80 mm</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDownloadDocument(doc.id_documento, 'xml')}
                                    disabled={downloadingDocId === `${doc.id_documento}-xml`}
                                    title={`Descargar ${doc.serie}-${doc.numero}.xml`}
                                    className="px-2 py-1 rounded bg-amber-50 hover:bg-amber-100 border border-amber-300 text-[11px] font-bold text-amber-900 inline-flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                                  >
                                    <Icon name="file-text" className="w-3 h-3 text-amber-700" />
                                    <span>XML</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </div>
          )}

          {/* ====================================================================
              8. MÓDULO: DESPACHOS Y GUÍAS (despacho)
             ==================================================================== */}
          {activeModule === 'despacho' && (
            <div className="space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-5">
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-slate-900">
                    Despachos y Guías de Remisión SUNAT (GRE)
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1">
                    Trazabilidad integral de pedidos confirmados, documentación tributaria y emisión de Guías de Remisión Remitente (Serie <code className="font-mono font-semibold">T001</code>) bajo R.S. N° 000123-2022/SUNAT.
                  </p>
                </div>
              </div>

              {/* Filtros operativos y búsqueda */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                <div className="relative flex-1 max-w-md">
                  <Icon
                    name="search"
                    className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  />
                  <input
                    type="search"
                    value={despachoSearch}
                    onChange={(e) => setDespachoSearch(e.target.value)}
                    placeholder="Buscar por orden, cliente, DNI/RUC o guía..."
                    className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-slate-900 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium hidden sm:inline">Estado:</span>
                  <select
                    aria-label="Filtrar despachos por estado"
                    value={despachoStatusFilter}
                    onChange={(e) => setDespachoStatusFilter(e.target.value)}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 focus:border-slate-900 focus:outline-none"
                  >
                    <option value="ALL">Todos los despachos ({orders.filter(o => o.estado_pedido !== 'cancelado').length})</option>
                    <option value="confirmado">Confirmados (Pendiente empaque)</option>
                    <option value="en_preparacion">En preparación (Almacén)</option>
                    <option value="despachado">Despachados (En tránsito)</option>
                    <option value="entregado">Entregados (Completados)</option>
                  </select>
                </div>
              </div>

              {/* Tabla de órdenes en flujo logístico */}
              <section className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">
                      Flujo de Despacho y Trazabilidad Comercial
                    </h2>
                    <p className="text-xs text-slate-500">
                      Vinculación en tiempo real: Pedido ➔ Comprobante (B001/F001) ➔ Guía de Remisión (T001)
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-mono font-bold text-slate-700">
                    {filteredLogisticsOrders.length} registros
                  </span>
                </div>

                {filteredLogisticsOrders.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500">
                    No se encontraron pedidos en la etapa logística seleccionada.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                        <tr>
                          <th className="px-4 py-3">Orden</th>
                          <th className="px-4 py-3">Destinatario</th>
                          <th className="px-4 py-3">Comprobante SUNAT</th>
                          <th className="px-4 py-3">Guía de Remisión (GRE)</th>
                          <th className="px-4 py-3">Estado</th>
                          <th className="px-4 py-3 text-right">Acción Operativa</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-slate-700">
                        {filteredLogisticsOrders.map((o) => {
                          const docAsociado = docByOrderId.get(o.id_pedido);
                          const guiaAsociada = guiaByOrderId.get(o.id_pedido);

                          return (
                            <tr key={o.id_pedido} className="hover:bg-slate-50/80">
                              <td className="px-4 py-3 font-mono font-bold text-slate-900">
                                <div>{o.numero_pedido}</div>
                                <div className="text-[10px] font-normal text-slate-400">
                                  {o.modalidad_entrega}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span className="font-semibold text-slate-900 block">
                                  {o.cliente_nombre}
                                </span>
                                <span className="font-mono text-[11px] text-slate-500">
                                  Doc: {o.doc_numero || 'S/N'}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                {docAsociado ? (
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-bold text-slate-900">
                                        {docAsociado.tipo} {docAsociado.serie}-{docAsociado.numero}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <button
                                        type="button"
                                        onClick={() => handleDownloadDocument(docAsociado.id_documento, 'a4')}
                                        title="Descargar comprobante en PDF A4"
                                        className="text-[10px] text-blue-700 hover:underline font-medium inline-flex items-center gap-0.5 cursor-pointer"
                                      >
                                        [PDF A4]
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDownloadDocument(docAsociado.id_documento, 'xml')}
                                        title="Descargar comprobante en XML UBL 2.1"
                                        className="text-[10px] text-amber-700 hover:underline font-medium inline-flex items-center gap-0.5 cursor-pointer"
                                      >
                                        [XML]
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-[11px] text-slate-400 italic">
                                    Sin comprobante
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                {guiaAsociada ? (
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-1.5">
                                      <span className="inline-flex items-center gap-1 rounded bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[11px] font-bold text-emerald-900 font-mono">
                                        <Icon name="truck" className="w-3.5 h-3.5 text-emerald-700" />
                                        {guiaAsociada.serie}-{guiaAsociada.numero}
                                      </span>
                                      <span className="text-[9px] font-bold text-emerald-700 uppercase">
                                        Emitida
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      <button
                                        type="button"
                                        onClick={() => handleDownloadDocument(guiaAsociada.id_documento, 'a4')}
                                        className="px-1.5 py-0.5 text-[10px] rounded bg-slate-100 hover:bg-slate-200 border border-slate-300 font-bold text-slate-700 cursor-pointer"
                                      >
                                        PDF A4
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDownloadDocument(guiaAsociada.id_documento, '80mm')}
                                        className="px-1.5 py-0.5 text-[10px] rounded bg-slate-100 hover:bg-slate-200 border border-slate-300 font-bold text-slate-700 cursor-pointer"
                                      >
                                        80 mm
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDownloadDocument(guiaAsociada.id_documento, 'xml')}
                                        className="px-1.5 py-0.5 text-[10px] rounded bg-amber-50 hover:bg-amber-100 border border-amber-300 font-bold text-amber-900 cursor-pointer"
                                      >
                                        XML GRE
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenGreModal(o)}
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 border border-sky-300 px-2.5 py-1 text-[11px] font-bold text-sky-900 cursor-pointer transition-colors shadow-2xs"
                                  >
                                    <Icon name="plus" className="w-3 h-3 text-sky-700" />
                                    Generar Guía GRE
                                  </button>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                {renderOrderStatusBadge(o.estado_pedido)}
                              </td>
                              <td className="px-4 py-3 text-right">
                                {o.estado_pedido === 'confirmado' && (
                                  <button
                                    type="button"
                                    disabled={isUpdatingOrder === o.id_pedido}
                                    onClick={() => handleUpdateOrderStatus(o.id_pedido, 'en_preparacion')}
                                    className="rounded-lg bg-amber-400 hover:bg-amber-500 text-slate-950 px-3 py-1 text-[11px] font-bold cursor-pointer"
                                  >
                                    Iniciar preparación
                                  </button>
                                )}
                                {o.estado_pedido === 'en_preparacion' && (
                                  <button
                                    type="button"
                                    disabled={isUpdatingOrder === o.id_pedido}
                                    onClick={() => handleUpdateOrderStatus(o.id_pedido, 'despachado')}
                                    className="rounded-lg bg-[#0B1528] hover:bg-slate-800 text-white px-3 py-1 text-[11px] font-bold cursor-pointer"
                                  >
                                    Poner en tránsito
                                  </button>
                                )}
                                {o.estado_pedido === 'despachado' && (
                                  <button
                                    type="button"
                                    disabled={isUpdatingOrder === o.id_pedido}
                                    onClick={() => handleUpdateOrderStatus(o.id_pedido, 'entregado')}
                                    className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 text-[11px] font-bold cursor-pointer"
                                  >
                                    Completar y entregar
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              {/* Registro de Guías de Remisión Emitidas */}
              {documents.some((d) => d.tipo === 'GUIA_REMISION') && (
                <section className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">
                        Historial de Guías de Remisión Emitidas (GRE Serie T001)
                      </h2>
                      <p className="text-xs text-slate-500">
                        Documentación de traslado emitida conforme a la RS 123-2022/SUNAT
                      </p>
                    </div>
                    <span className="rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-0.5 text-xs font-mono font-bold">
                      {documents.filter((d) => d.tipo === 'GUIA_REMISION').length} guías
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                        <tr>
                          <th className="px-4 py-3">Serie y Número</th>
                          <th className="px-4 py-3">Destinatario</th>
                          <th className="px-4 py-3">Modalidad / Traslado</th>
                          <th className="px-4 py-3">Punto Llegada</th>
                          <th className="px-4 py-3">Estado</th>
                          <th className="px-4 py-3 text-right">Descargas Oficiales</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-slate-700">
                        {documents
                          .filter((d) => d.tipo === 'GUIA_REMISION')
                          .map((g) => (
                            <tr key={g.id_documento} className="hover:bg-slate-50/80">
                              <td className="px-4 py-3 font-mono font-bold text-slate-900">
                                <div className="flex items-center gap-1.5">
                                  <Icon name="truck" className="w-4 h-4 text-emerald-600" />
                                  <span>{g.serie}-{g.numero}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span className="font-bold text-slate-900 block">
                                  {g.datos_receptor?.businessName || 'Destinatario'}
                                </span>
                                <span className="font-mono text-[11px] text-slate-500">
                                  Doc: {g.datos_receptor?.docNumber || 'S/N'}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="inline-flex rounded bg-slate-100 border border-slate-300 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-800">
                                  {g.metadatos?.modalidadTransporte || 'PRIVADO'}
                                </span>
                                <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
                                  {g.metadatos?.conductor?.placaVehiculo
                                    ? `Placa: ${g.metadatos.conductor.placaVehiculo}`
                                    : g.metadatos?.transportista?.ruc
                                    ? `RUC Transp: ${g.metadatos.transportista.ruc}`
                                    : 'Vehículo propio'}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-slate-600 max-w-xs truncate" title={g.metadatos?.puntoLlegada || ''}>
                                {g.metadatos?.puntoLlegada || 'No especificado'}
                              </td>
                              <td className="px-4 py-3">
                                <span className="inline-flex rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-900">
                                  {g.estado}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleDownloadDocument(g.id_documento, 'a4')}
                                    className="px-2 py-1 rounded bg-white hover:bg-slate-100 border border-slate-300 text-[11px] font-bold text-slate-700 inline-flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                                  >
                                    <Icon name="download" className="w-3 h-3 text-slate-500" />
                                    PDF A4
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDownloadDocument(g.id_documento, '80mm')}
                                    className="px-2 py-1 rounded bg-white hover:bg-slate-100 border border-slate-300 text-[11px] font-bold text-slate-700 inline-flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                                  >
                                    <Icon name="receipt" className="w-3 h-3 text-slate-500" />
                                    80 mm
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDownloadDocument(g.id_documento, 'xml')}
                                    className="px-2 py-1 rounded bg-amber-50 hover:bg-amber-100 border border-amber-300 text-[11px] font-bold text-amber-900 inline-flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                                  >
                                    <Icon name="file-text" className="w-3 h-3 text-amber-700" />
                                    XML
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {/* Protocolos normativos de despacho */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-3">
                  <div className="flex items-center gap-2">
                    <Icon name="battery" className="w-4 h-4 text-[#0B1528]" />
                    <h3 className="text-sm font-bold text-slate-900">
                      Protocolo de despacho seguro (Baterías EV)
                    </h3>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-600">
                    <li className="flex items-start gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                      <span>Embalaje ignífugo y aislamiento dieléctrico de terminales Anderson / XT90.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                      <span>Verificación obligatoria de llave térmica (breaker) en posición OFF antes del sellado.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                      <span>Etiquetado normativo de mercancía eléctrica sensible Clase 9 (UN 3480).</span>
                    </li>
                  </ul>
                </section>

                <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-3">
                  <div className="flex items-center gap-2">
                    <Icon name="truck" className="w-4 h-4 text-[#0B1528]" />
                    <h3 className="text-sm font-bold text-slate-900">
                      Guía de Remisión Electrónica Remitente (GRE)
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Estructura normalizada en serie correlativa <code className="font-mono font-semibold text-slate-800">T001</code> con motivo de traslado «01 - Venta» conforme a la Resolución de Superintendencia N° 000123-2022/SUNAT. Integra validación estricta de conductor y vehículo en transporte privado o RUC de transportista en servicio público.
                  </p>
                </section>
              </div>
            </div>
          )}

          {/* ====================================================================
              9. MÓDULO: VOLTIA Y ASISTENCIA TÉCNICA (voltia)
             ==================================================================== */}
          {activeModule === 'voltia' && (
            <div className="space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-5">
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-slate-900">
                    VoltIA y asistencia técnica
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1">
                    Casos derivados por diagnósticos de riesgo eléctrico, consultas de compatibilidad o requerimientos de taller especializado.
                  </p>
                </div>
              </div>

              {queryErrors?.asistencia && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-900 shadow-2xs">
                  <div className="flex items-center gap-2 font-bold text-red-800">
                    <Icon name="alert-triangle" className="w-4 h-4 text-red-600 shrink-0" />
                    <span>Error al consultar solicitudes de asistencia en Supabase</span>
                  </div>
                  <p className="mt-1 text-red-700">{queryErrors.asistencia}</p>
                </div>
              )}

              <section className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
                <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="relative flex-1 max-w-md">
                    <Icon
                      name="search"
                      className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    />
                    <input
                      type="search"
                      value={assistanceSearch}
                      onChange={(e) => setAssistanceSearch(e.target.value)}
                      placeholder="Buscar por nombre de contacto, correo, tipo o síntoma..."
                      className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-slate-900 focus:outline-none"
                    />
                  </div>
                  <span className="text-xs font-mono font-semibold text-slate-600">
                    {filteredAssistance.length} de {initialAssistance.length} solicitudes
                  </span>
                </div>

                {filteredAssistance.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-500 mb-3">
                      <Icon name="headset" className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-bold text-slate-800">
                      No hay solicitudes de asistencia técnica registradas
                    </p>
                    <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                      Cuando un usuario envíe una consulta desde el asistente VoltIA o solicite soporte de compatibilidad, el registro aparecerá aquí.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-200">
                    {filteredAssistance.map((ast) => (
                      <div key={ast.id_solicitud} className="p-5 hover:bg-slate-50/70 transition-colors space-y-2.5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <span className="font-bold text-sm text-slate-900">
                              {ast.nombre_contacto}
                            </span>
                            <a
                              href={`mailto:${ast.email_contacto}`}
                              className="font-mono text-xs text-blue-700 hover:underline"
                            >
                              {ast.email_contacto}
                            </a>
                            {ast.telefono_contacto && (
                              <a
                                href={`https://wa.me/51${ast.telefono_contacto.replace(/\D/g, '')}?text=Hola%20${encodeURIComponent(ast.nombre_contacto)},%20te%20escribimos%20de%20NeroElectric%20Motors%20respecto%20a%20tu%20solicitud%20de%20asistencia.`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 font-mono text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded hover:bg-emerald-100 transition-colors"
                              >
                                <Icon name="whatsapp" className="w-3.5 h-3.5 text-emerald-600" />
                                <span>{ast.telefono_contacto}</span>
                              </a>
                            )}
                          </div>
                          <div className="flex items-center gap-2 self-start sm:self-auto">
                            {ast.created_at && (
                              <span className="text-[11px] text-slate-400 font-mono">
                                {new Date(ast.created_at).toLocaleDateString('es-PE', {
                                  day: '2-digit',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            )}
                            <span className="inline-flex rounded-md bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-900">
                              {ast.tipo_solicitud}
                            </span>
                            <span className="inline-flex rounded-md bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-bold uppercase text-blue-900">
                              {ast.estado || 'pendiente'}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                          {ast.descripcion}
                        </p>
                        {ast.detalles_tecnicos && Object.keys(ast.detalles_tecnicos).length > 0 && (
                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                            {(ast.detalles_tecnicos.brand || ast.detalles_tecnicos.model) && (
                              <span className="inline-flex items-center gap-1 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded font-medium text-slate-700">
                                🛵 {ast.detalles_tecnicos.brand || ''} {ast.detalles_tecnicos.model || ''}
                              </span>
                            )}
                            {ast.detalles_tecnicos.symptom && (
                              <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-amber-800">
                                ⚠️ Síntoma: {ast.detalles_tecnicos.symptom}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}

          {/* ====================================================================
              10. MÓDULO: IMPORTADOR DE CATÁLOGOS CSV/JSON (importador)
             ==================================================================== */}
          {activeModule === 'importador' && (
            <CatalogImporterView
              initialHistory={initialImportHistory}
              onCatalogUpdated={refreshCatalogData}
            />
          )}

          {/* ====================================================================
              11. MÓDULO: GESTIÓN DE USUARIOS Y ACCESOS (usuarios)
             ==================================================================== */}
          {activeModule === 'usuarios' && (
            <div className="space-y-6">
              {/* Tarjetas de Métricas de Usuarios */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase">Total Usuarios</span>
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Icon name="users" className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-2xl font-black text-slate-900 mt-2">{users.length}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Cuentas registradas en Auth</p>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase">Administradores</span>
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <Icon name="shield" className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-2xl font-black text-indigo-600 mt-2">
                    {users.filter((u) => u.role === 'admin').length}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Operadores con acceso total</p>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase">Clientes</span>
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Icon name="user" className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-2xl font-black text-emerald-600 mt-2">
                    {users.filter((u) => u.role === 'customer').length}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Usuarios finales de la tienda</p>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase">Bloqueados</span>
                    <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                      <Icon name="lock" className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-2xl font-black text-rose-600 mt-2">
                    {users.filter((u) => u.isBanned).length}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Acceso revocado preventivo</p>
                </div>
              </div>

              {/* Panel Principal */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-base font-black text-slate-900">Gestión de Usuarios, Roles y Accesos</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Control granular de privilegios administrativos, estado de bloqueo y contraseñas.
                    </p>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={handleRefreshUsers}
                      disabled={isLoadingUsers}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <Icon name="clock" className={`w-3.5 h-3.5 ${isLoadingUsers ? 'animate-spin' : ''}`} />
                      <span>{isLoadingUsers ? 'Cargando...' : 'Actualizar'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCreateUserError(null);
                        setIsCreateUserModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors shadow-sm cursor-pointer"
                    >
                      <Icon name="plus" className="w-3.5 h-3.5" />
                      <span>Nuevo Usuario / Operador</span>
                    </button>
                  </div>
                </div>

                {/* Filtros de Búsqueda */}
                <div className="p-4 bg-slate-50/70 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="relative">
                    <Icon name="search" className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Buscar por nombre, correo o ID..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="w-full text-xs rounded-xl border border-slate-300 bg-white pl-9 pr-3 py-2 text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                    />
                  </div>

                  <div>
                    <select
                      value={userRoleFilter}
                      onChange={(e) => setUserRoleFilter(e.target.value as 'ALL' | 'admin' | 'customer')}
                      className="w-full text-xs rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:outline-none focus:border-indigo-600"
                    >
                      <option value="ALL">Todos los roles</option>
                      <option value="admin">Solo Administradores</option>
                      <option value="customer">Solo Clientes</option>
                    </select>
                  </div>

                  <div>
                    <select
                      value={userStatusFilter}
                      onChange={(e) => setUserStatusFilter(e.target.value as 'ALL' | 'active' | 'banned')}
                      className="w-full text-xs rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:outline-none focus:border-indigo-600"
                    >
                      <option value="ALL">Todos los estados</option>
                      <option value="active">Solo Cuentas Activas</option>
                      <option value="banned">Solo Cuentas Bloqueadas</option>
                    </select>
                  </div>
                </div>

                {/* Tabla de Usuarios */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-100/70 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                        <th className="py-3 px-4">Usuario</th>
                        <th className="py-3 px-4">Contacto</th>
                        <th className="py-3 px-4">Rol Asignado</th>
                        <th className="py-3 px-4">Estado de Acceso</th>
                        <th className="py-3 px-4">Registro / Conexión</th>
                        <th className="py-3 px-4 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-slate-400">
                            No se encontraron usuarios coincidentes con los filtros aplicados.
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((u) => {
                          const statusInfo = formatUserStatus(u);
                          const isSelf = u.id === account.id;

                          return (
                            <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs shrink-0">
                                    {(u.fullName || u.email || 'U').charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-bold text-slate-900">{u.fullName}</span>
                                      {isSelf && (
                                        <span className="bg-cyan-100 text-cyan-800 text-[10px] font-bold px-1.5 py-0.2 rounded">
                                          Tú
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-[11px] text-slate-500 font-mono block">
                                      {u.email}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              <td className="py-3.5 px-4 text-slate-600">
                                {u.phone ? (
                                  <span className="font-mono text-slate-700">{u.phone}</span>
                                ) : (
                                  <span className="text-slate-400 italic">Sin teléfono</span>
                                )}
                              </td>

                              <td className="py-3.5 px-4">
                                {u.role === 'admin' ? (
                                  <span className="inline-flex items-center gap-1 bg-indigo-100 border border-indigo-200 text-indigo-800 text-[11px] font-bold px-2 py-0.5 rounded-md">
                                    <Icon name="shield" className="w-3 h-3 text-indigo-600" />
                                    <span>Administrador</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-medium px-2 py-0.5 rounded-md">
                                    <Icon name="user" className="w-3 h-3 text-slate-500" />
                                    <span>Cliente</span>
                                  </span>
                                )}
                              </td>

                              <td className="py-3.5 px-4">
                                <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${statusInfo.badgeClass}`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotClass}`} />
                                  <span>{statusInfo.label}</span>
                                </span>
                              </td>

                              <td className="py-3.5 px-4 text-[11px] text-slate-500">
                                <div>Alta: {new Date(u.createdAt).toLocaleDateString('es-PE')}</div>
                                {u.lastSignInAt ? (
                                  <div className="text-[10px] text-slate-400">
                                    Login: {new Date(u.lastSignInAt).toLocaleDateString('es-PE')}
                                  </div>
                                ) : (
                                  <div className="text-[10px] text-slate-400 italic">Sin ingresos registrados</div>
                                )}
                              </td>

                              <td className="py-3.5 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  {/* Botón Cambiar Rol */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setRoleModalUser(u);
                                      setTargetUserRole(u.role === 'admin' ? 'customer' : 'admin');
                                    }}
                                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                                    title={u.role === 'admin' ? 'Cambiar a Cliente' : 'Promover a Administrador'}
                                  >
                                    <Icon name="shield" className="w-4 h-4" />
                                  </button>

                                  {/* Botón Bloquear / Desbloquear */}
                                  <button
                                    type="button"
                                    onClick={() => setBanModalUser(u)}
                                    className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                      u.isBanned
                                        ? 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                                        : 'border-rose-200 text-rose-700 hover:bg-rose-50'
                                    }`}
                                    title={u.isBanned ? 'Desbloquear acceso' : 'Bloquear acceso'}
                                  >
                                    <Icon name={u.isBanned ? 'unlock' : 'lock'} className="w-4 h-4" />
                                  </button>

                                  {/* Botón Restablecer Contraseña */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setPasswordModalUser(u);
                                      setPasswordResetMode('link');
                                      setDirectNewPassword('');
                                      setGeneratedRecoveryLink(null);
                                    }}
                                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                                    title="Restablecer Contraseña"
                                  >
                                    <Icon name="key" className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modal interactivo de Emisión de Guía de Remisión Remitente (GRE Serie T001) */}
      {isGreModalOpen && selectedOrderForGre && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="px-6 py-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Icon name="truck" className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-sm font-bold">
                    Emitir Guía de Remisión Remitente (GRE Serie T001)
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    Pedido #{selectedOrderForGre.numero_pedido} — {selectedOrderForGre.cliente_nombre}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsGreModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <Icon name="x" className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitGre} className="p-6 space-y-4">
              {greFormError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 flex items-center gap-2">
                  <Icon name="alert-triangle" className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{greFormError}</span>
                </div>
              )}

              {greFormSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
                  <Icon name="check-circle" className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{greFormSuccess}</span>
                </div>
              )}

              {/* Selector de Modalidad */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Modalidad de Transporte SUNAT
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                      greForm.modalidadTransporte === 'PRIVADO'
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="modalidadTransporte"
                      value="PRIVADO"
                      checked={greForm.modalidadTransporte === 'PRIVADO'}
                      onChange={() =>
                        setGreForm((prev) => ({ ...prev, modalidadTransporte: 'PRIVADO' }))
                      }
                      className="sr-only"
                    />
                    <Icon name="bike" className="w-4 h-4" />
                    <span>01 - Transporte Privado (Vehículo Propio)</span>
                  </label>

                  <label
                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                      greForm.modalidadTransporte === 'PUBLICO'
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="modalidadTransporte"
                      value="PUBLICO"
                      checked={greForm.modalidadTransporte === 'PUBLICO'}
                      onChange={() =>
                        setGreForm((prev) => ({ ...prev, modalidadTransporte: 'PUBLICO' }))
                      }
                      className="sr-only"
                    />
                    <Icon name="truck" className="w-4 h-4" />
                    <span>02 - Transporte Público (Empresa / Courier)</span>
                  </label>
                </div>
              </div>

              {/* Puntos de traslado y Peso */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Punto de Partida (Dirección fiscal / Almacén)
                  </label>
                  <input
                    type="text"
                    required
                    value={greForm.puntoPartida}
                    onChange={(e) =>
                      setGreForm((prev) => ({ ...prev, puntoPartida: e.target.value }))
                    }
                    className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-800 focus:outline-none focus:border-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Punto de Llegada (Destino final del cliente)
                  </label>
                  <input
                    type="text"
                    required
                    value={greForm.puntoLlegada}
                    onChange={(e) =>
                      setGreForm((prev) => ({ ...prev, puntoLlegada: e.target.value }))
                    }
                    className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-800 focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Fecha de Inicio del Traslado
                  </label>
                  <input
                    type="date"
                    required
                    value={greForm.fechaInicioTraslado}
                    onChange={(e) =>
                      setGreForm((prev) => ({ ...prev, fechaInicioTraslado: e.target.value }))
                    }
                    className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-800 focus:outline-none focus:border-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Peso Bruto Total (Kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    value={greForm.pesoBrutoTotalKg}
                    onChange={(e) =>
                      setGreForm((prev) => ({
                        ...prev,
                        pesoBrutoTotalKg: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-800 focus:outline-none focus:border-slate-900 font-mono"
                  />
                </div>
              </div>

              {/* Campos condicionales según Modalidad */}
              {greForm.modalidadTransporte === 'PRIVADO' ? (
                <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 space-y-3">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Icon name="user" className="w-4 h-4 text-slate-600" />
                    <span>Datos del Conductor y Vehículo (Transporte Privado)</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                        Nombre del Conductor
                      </label>
                      <input
                        type="text"
                        required
                        value={greForm.conductorNombre}
                        onChange={(e) =>
                          setGreForm((prev) => ({ ...prev, conductorNombre: e.target.value }))
                        }
                        className="w-full text-xs rounded-md border border-slate-300 px-2.5 py-1.5 bg-white text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                        DNI Conductor (8 dígitos)
                      </label>
                      <input
                        type="text"
                        maxLength={8}
                        required
                        value={greForm.conductorDni}
                        onChange={(e) =>
                          setGreForm((prev) => ({ ...prev, conductorDni: e.target.value }))
                        }
                        className="w-full text-xs rounded-md border border-slate-300 px-2.5 py-1.5 bg-white text-slate-800 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                        Licencia (Brevete)
                      </label>
                      <input
                        type="text"
                        required
                        value={greForm.conductorLicencia}
                        onChange={(e) =>
                          setGreForm((prev) => ({ ...prev, conductorLicencia: e.target.value }))
                        }
                        className="w-full text-xs rounded-md border border-slate-300 px-2.5 py-1.5 bg-white text-slate-800 font-mono"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                        Placa del Vehículo
                      </label>
                      <input
                        type="text"
                        required
                        value={greForm.conductorPlaca}
                        onChange={(e) =>
                          setGreForm((prev) => ({ ...prev, conductorPlaca: e.target.value }))
                        }
                        placeholder="Ej. B12-890"
                        className="w-full text-xs rounded-md border border-slate-300 px-2.5 py-1.5 bg-white text-slate-800 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                        Marca / Modelo del Vehículo
                      </label>
                      <input
                        type="text"
                        value={greForm.conductorMarca}
                        onChange={(e) =>
                          setGreForm((prev) => ({ ...prev, conductorMarca: e.target.value }))
                        }
                        className="w-full text-xs rounded-md border border-slate-300 px-2.5 py-1.5 bg-white text-slate-800"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 space-y-3">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Icon name="truck" className="w-4 h-4 text-slate-600" />
                    <span>Datos de la Empresa Transportista (Transporte Público)</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                        Razón Social de la Empresa Transportista
                      </label>
                      <input
                        type="text"
                        required
                        value={greForm.transportistaRazonSocial}
                        onChange={(e) =>
                          setGreForm((prev) => ({
                            ...prev,
                            transportistaRazonSocial: e.target.value,
                          }))
                        }
                        className="w-full text-xs rounded-md border border-slate-300 px-2.5 py-1.5 bg-white text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                        RUC Transportista (11 dígitos)
                      </label>
                      <input
                        type="text"
                        maxLength={11}
                        required
                        value={greForm.transportistaRuc}
                        onChange={(e) =>
                          setGreForm((prev) => ({ ...prev, transportistaRuc: e.target.value }))
                        }
                        className="w-full text-xs rounded-md border border-slate-300 px-2.5 py-1.5 bg-white text-slate-800 font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Botones de acción */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsGreModalOpen(false)}
                  disabled={isSubmittingGre}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingGre}
                  className="px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold inline-flex items-center gap-2 cursor-pointer transition-colors shadow-sm disabled:opacity-50"
                >
                  {isSubmittingGre ? (
                    <>
                      <Icon name="clock" className="w-4 h-4 animate-spin" />
                      <span>Emitiendo GRE...</span>
                    </>
                  ) : (
                    <>
                      <Icon name="check" className="w-4 h-4 text-amber-400" />
                      <span>Generar y Emitir Guía GRE</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODALES DE GESTIÓN DE USUARIOS
         ==================================================================== */}

      {/* 1. Modal Cambiar Rol RBAC */}
      {roleModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Icon name="shield" className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold">Modificar Rol de Usuario</h3>
              </div>
              <button
                type="button"
                onClick={() => setRoleModalUser(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <Icon name="x" className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200">
                <p className="text-xs text-slate-500 font-medium">Usuario seleccionado:</p>
                <p className="text-sm font-bold text-slate-900">{roleModalUser.fullName}</p>
                <p className="text-xs text-slate-600 font-mono">{roleModalUser.email}</p>
              </div>

              {roleModalUser.id === account.id && targetUserRole !== 'admin' && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <Icon name="alert-triangle" className="w-4 h-4 text-amber-600" />
                    <span>Atención: Es tu propia cuenta</span>
                  </p>
                  <p className="text-[11px]">
                    No puedes revocar tu propio rol de administrador mientras estás en sesión.
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">Seleccionar nuevo rol:</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTargetUserRole('customer')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      targetUserRole === 'customer'
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 ring-2 ring-indigo-600'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <Icon name="user" className="w-4 h-4 text-slate-500" />
                      <span className="font-bold text-xs">Cliente</span>
                    </div>
                    <p className="text-[10px] text-slate-500">Acceso estándar a tienda y pedidos</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetUserRole('admin')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      targetUserRole === 'admin'
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 ring-2 ring-indigo-600'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <Icon name="shield" className="w-4 h-4 text-indigo-600" />
                      <span className="font-bold text-xs">Administrador</span>
                    </div>
                    <p className="text-[10px] text-slate-500">Acceso total al ERP administrativo</p>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setRoleModalUser(null)}
                  disabled={isProcessingUserAction}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmRoleChange}
                  disabled={isProcessingUserAction || (roleModalUser.id === account.id && targetUserRole !== 'admin')}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer transition-colors disabled:opacity-50 shadow-sm"
                >
                  {isProcessingUserAction ? 'Actualizando...' : 'Guardar Nuevo Rol'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Modal Bloquear / Desbloquear Acceso */}
      {banModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div
              className={`px-6 py-4 text-white flex items-center justify-between ${
                banModalUser.isBanned
                  ? 'bg-gradient-to-r from-emerald-900 to-slate-900'
                  : 'bg-gradient-to-r from-rose-950 to-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon name={banModalUser.isBanned ? 'unlock' : 'lock'} className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold">
                  {banModalUser.isBanned ? 'Desbloquear Acceso a Usuario' : 'Bloquear Acceso a Usuario'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setBanModalUser(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <Icon name="x" className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200">
                <p className="text-xs text-slate-500 font-medium">Usuario:</p>
                <p className="text-sm font-bold text-slate-900">{banModalUser.fullName}</p>
                <p className="text-xs text-slate-600 font-mono">{banModalUser.email}</p>
              </div>

              {banModalUser.id === account.id && !banModalUser.isBanned ? (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 text-xs">
                  <p className="font-bold">Acción Denegada</p>
                  <p className="text-[11px] mt-0.5">
                    No puedes bloquear tu propia cuenta de administrador en sesión activa.
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-600 leading-relaxed">
                  {banModalUser.isBanned
                    ? 'Al desbloquear a este usuario, podrá volver a autenticarse y operar con normalidad en la plataforma.'
                    : 'Al bloquear a este usuario, su sesión será invalidada y se le denegará el acceso inmediato a la tienda y al panel ERP.'}
                </p>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setBanModalUser(null)}
                  disabled={isProcessingUserAction}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmToggleBan}
                  disabled={isProcessingUserAction || (banModalUser.id === account.id && !banModalUser.isBanned)}
                  className={`px-5 py-2 rounded-xl text-white text-xs font-bold cursor-pointer transition-colors disabled:opacity-50 shadow-sm ${
                    banModalUser.isBanned
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {isProcessingUserAction
                    ? 'Procesando...'
                    : banModalUser.isBanned
                    ? 'Confirmar Desbloqueo'
                    : 'Confirmar Bloqueo'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Modal Restablecer Contraseña */}
      {passwordModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Icon name="key" className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-sm font-bold">Restablecer Contraseña</h3>
                  <p className="text-[11px] text-slate-300">{passwordModalUser.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPasswordModalUser(null);
                  setGeneratedRecoveryLink(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <Icon name="x" className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Selector de Modalidad */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setPasswordResetMode('link');
                    setGeneratedRecoveryLink(null);
                  }}
                  className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    passwordResetMode === 'link'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Enlace Seguro
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPasswordResetMode('direct');
                    setGeneratedRecoveryLink(null);
                  }}
                  className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    passwordResetMode === 'direct'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Asignar Manual
                </button>
              </div>

              {passwordResetMode === 'link' ? (
                <div className="space-y-3">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Genera un enlace de un solo uso criptográficamente seguro para que el usuario restablezca su clave.
                  </p>
                  {generatedRecoveryLink ? (
                    <div className="space-y-2">
                      <label className="block text-[11px] font-bold text-emerald-800">
                        ✓ Enlace generado con éxito:
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          readOnly
                          value={generatedRecoveryLink}
                          className="w-full text-[11px] rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1.5 text-emerald-900 font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(generatedRecoveryLink);
                            setStatusFeedback({ type: 'success', text: 'Enlace copiado al portapapeles' });
                          }}
                          className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold cursor-pointer shrink-0"
                        >
                          Copiar
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-500">
                        Copia y comparte este enlace con el usuario a través de un canal seguro.
                      </p>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleConfirmResetPassword}
                      disabled={isProcessingUserAction}
                      className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer transition-colors shadow-sm disabled:opacity-50"
                    >
                      {isProcessingUserAction ? 'Generando...' : 'Generar Enlace de Recuperación'}
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nueva Contraseña (mínimo 8 caracteres):
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={directNewPassword}
                      onChange={(e) => setDirectNewPassword(e.target.value)}
                      className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    La clave se actualizará de forma inmediata en Supabase Auth.
                  </p>
                  <button
                    type="button"
                    onClick={handleConfirmResetPassword}
                    disabled={isProcessingUserAction || directNewPassword.trim().length < 8}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer transition-colors shadow-sm disabled:opacity-50"
                  >
                    {isProcessingUserAction ? 'Actualizando...' : 'Actualizar Contraseña'}
                  </button>
                </div>
              )}

              <div className="flex items-center justify-end pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setPasswordModalUser(null);
                    setGeneratedRecoveryLink(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Modal Crear Nuevo Usuario / Operador */}
      {isCreateUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="px-6 py-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Icon name="plus" className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold">Crear Nuevo Usuario / Operador</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateUserModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <Icon name="x" className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUserSubmit} className="p-6 space-y-4">
              {createUserError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
                  {createUserError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Juan Pérez"
                    value={newUserFullName}
                    onChange={(e) => setNewUserFullName(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Teléfono (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="999888777"
                    value={newUserPhone}
                    onChange={(e) => setNewUserPhone(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:border-indigo-600 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Correo Electrónico *
                </label>
                <input
                  type="email"
                  required
                  placeholder="operador@neroelectricmotors.com"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:border-indigo-600 font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Contraseña Inicial (mín. 8 car.) *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    placeholder="••••••••"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Rol Inicial *
                  </label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as 'admin' | 'customer')}
                    className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:border-indigo-600 bg-white"
                  >
                    <option value="customer">Cliente Estándar (customer)</option>
                    <option value="admin">Administrador (admin)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCreateUserModalOpen(false)}
                  disabled={isProcessingUserAction}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isProcessingUserAction}
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer transition-colors disabled:opacity-50 shadow-sm"
                >
                  {isProcessingUserAction ? 'Creando...' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
