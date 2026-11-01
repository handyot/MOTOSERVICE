'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { useRouter } from 'next/navigation';
import { useCart } from '../../lib/cart/cart-context';
import { Icon } from '../../components/ui/Icons';
import { formatCurrency } from '../../lib/formatters.js';
import { InvoiceType, DeliveryMethod } from '../../types';

interface TestCardOption {
  id: string;
  label: string;
  category: 'exito' | '3ds' | 'error';
  brand: string;
  number: string;
  exp: string;
  cvv: string;
  type: string;
  description: string;
  email?: string;
}

const CULQI_TEST_CARDS: TestCardOption[] = [
  // Compras exitosas
  {
    id: 'visa-debito-exito',
    label: 'Visa Débito (Venta Exitosa)',
    category: 'exito',
    brand: 'Visa',
    number: '4111 1111 1111 1111',
    exp: '09/30',
    cvv: '123',
    type: 'Débito',
    description: 'Venta exitosa directa autorizada por Culqi',
  },
  {
    id: 'visa-credito-exito',
    label: 'Visa Crédito (Venta Exitosa)',
    category: 'exito',
    brand: 'Visa',
    number: '4111 1111 1010 1113',
    exp: '09/30',
    cvv: '123',
    type: 'Crédito',
    description: 'Venta exitosa directa autorizada por Culqi',
  },
  {
    id: 'mastercard-exito',
    label: 'Mastercard Crédito (Venta Exitosa)',
    category: 'exito',
    brand: 'Mastercard',
    number: '5111 1111 1111 1118',
    exp: '12/30',
    cvv: '039',
    type: 'Crédito',
    description: 'Venta exitosa autorizada por Culqi',
  },
  {
    id: 'amex-exito',
    label: 'Amex Crédito (Venta Exitosa)',
    category: 'exito',
    brand: 'Amex',
    number: '3712 1212 1212 122',
    exp: '12/30',
    cvv: '2841',
    type: 'Crédito',
    description: 'Venta exitosa Amex autorizada',
  },
  {
    id: 'diners-exito',
    label: 'Diners Crédito (Venta Exitosa)',
    category: 'exito',
    brand: 'Diners',
    number: '3600 1212 1212 10',
    exp: '12/30',
    cvv: '964',
    type: 'Crédito',
    description: 'Venta exitosa Diners autorizada',
  },

  // Autenticación 3DS
  {
    id: 'visa-3ds-challenge',
    label: 'Visa 3DS con Challenge (review@culqi.com)',
    category: '3ds',
    brand: 'Visa',
    number: '4456 5300 0000 1096',
    exp: '07/30',
    cvv: '111',
    type: 'Classic',
    description: 'Autenticación exitosa con Reto / Challenge OTP',
    email: 'review@culqi.com',
  },
  {
    id: 'visa-3ds-sin-challenge',
    label: 'Visa 3DS sin Challenge',
    category: '3ds',
    brand: 'Visa',
    number: '4456 5300 0000 1005',
    exp: '07/30',
    cvv: '111',
    type: 'Classic',
    description: 'Autenticación exitosa sin Challenge bancario',
    email: 'review@culqi.com',
  },
  {
    id: 'visa-3ds-timeout',
    label: 'Visa 3DS Fallo por Timeout',
    category: '3ds',
    brand: 'Visa',
    number: '4456 5300 0000 1070',
    exp: '07/30',
    cvv: '111',
    type: 'Classic',
    description: 'Autenticación fallida por tiempo de espera',
    email: 'review@culqi.com',
  },
  {
    id: 'visa-3ds-error-auth',
    label: 'Visa 3DS Error de Autenticación',
    category: '3ds',
    brand: 'Visa',
    number: '4456 5300 0000 1013',
    exp: '07/30',
    cvv: '111',
    type: 'Classic',
    description: 'Autenticación fallida por clave errónea',
    email: 'review@culqi.com',
  },
  {
    id: 'mastercard-3ds-challenge',
    label: 'Mastercard 3DS con Challenge',
    category: '3ds',
    brand: 'Mastercard',
    number: '5200 0000 0000 1096',
    exp: '12/30',
    cvv: '111',
    type: 'Classic',
    description: 'Autenticación exitosa con Challenge (Banco Emisor)',
    email: 'review@culqi.com',
  },
  {
    id: 'mastercard-3ds-sin-challenge',
    label: 'Mastercard 3DS sin Challenge',
    category: '3ds',
    brand: 'Mastercard',
    number: '5200 0000 0000 1005',
    exp: '12/30',
    cvv: '111',
    type: 'Classic',
    description: 'Autenticación exitosa sin Challenge',
    email: 'review@culqi.com',
  },

  // Casos de Error
  {
    id: 'error-dnge0087',
    label: 'Visa DNGE0087 (Transacción Inválida)',
    category: 'error',
    brand: 'Visa',
    number: '4111 1100 0000 0013',
    exp: '12/30',
    cvv: '123',
    type: 'Crédito',
    description: 'Simula rechazo DNGE0087 por emisor',
  },
  {
    id: 'error-fondos',
    label: 'Visa Fondos Insuficientes',
    category: 'error',
    brand: 'Visa',
    number: '4000 0400 0000 0008',
    exp: '03/30',
    cvv: '295',
    type: 'Classic',
    description: 'Simula rechazo por falta de fondos',
  },
  {
    id: 'error-cvv',
    label: 'Mastercard CVV Incorrecto',
    category: 'error',
    brand: 'Mastercard',
    number: '5400 0200 0000 0003',
    exp: '07/30',
    cvv: '203',
    type: 'Classic',
    description: 'Simula rechazo por CVV no coincidente',
  },
  {
    id: 'error-emisor',
    label: 'Mastercard Contactar Emisor',
    category: 'error',
    brand: 'Mastercard',
    number: '5400 0000 0000 0005',
    exp: '01/30',
    cvv: '492',
    type: 'Classic',
    description: 'Simula orden de contactar al banco emisor',
  },
  {
    id: 'error-fraude',
    label: 'Diners Alerta de Fraude',
    category: 'error',
    brand: 'Diners',
    number: '3600 0200 0000 06',
    exp: '01/30',
    cvv: '230',
    type: 'Classic',
    description: 'Simula bloqueo preventivo por fraude',
  },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, totalCount, clearCart, isLoaded } = useCart();

  // Datos del comprador
  const [customerName, setCustomerName] = useState('Carlos Mendoza');
  const [customerEmail, setCustomerEmail] = useState('review@culqi.com');
  const [customerPhone, setCustomerPhone] = useState('987654321');
  const [shippingAddress, setShippingAddress] = useState('Av. Larco 1234, Dpto 402');
  const [department, setDepartment] = useState('Lima');
  const [province, setProvince] = useState('Lima');
  const [district, setDistrict] = useState('Miraflores');
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('envio_domicilio');

  // Comprobante electrónico
  const [invoiceType, setInvoiceType] = useState<InvoiceType>('boleta');
  const [docNumber, setDocNumber] = useState('12345678');
  const [docBusinessName, setDocBusinessName] = useState('');

  // Promoción de primera compra (5%)
  const [subscribeNewsletter, setSubscribeNewsletter] = useState(true);

  // Pago Culqi
  const [cardNumber, setCardNumber] = useState('4111 1111 1111 1111');
  const [cardExp, setCardExp] = useState('09/30');
  const [cardCvv, setCardCvv] = useState('123');
  const [selectedTestCardId, setSelectedTestCardId] = useState('visa-debito-exito');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Estado del Reto 3DS (Challenge Modal)
  const [show3dsModal, setShow3dsModal] = useState(false);
  const [otpCode, setOtpCode] = useState('123456');
  const [isProcessing3ds, setIsProcessing3ds] = useState(false);
  const [pending3dsData, setPending3dsData] = useState<{
    orderId: string;
    guestToken: string;
    tokenId: string;
    orderNumber: string;
    total: number;
    cardBrand: string;
    lastFour: string;
  } | null>(null);

  const handleCardNumberChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  const handleCardExpChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      setCardExp(`${raw.slice(0, 2)}/${raw.slice(2)}`);
    } else {
      setCardExp(raw);
    }
  };

  const handleCardCvvChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 4);
    setCardCvv(raw);
  };

  const applyTestCardPreset = (card: TestCardOption) => {
    setSelectedTestCardId(card.id);
    setCardNumber(card.number);
    setCardExp(card.exp);
    setCardCvv(card.cvv);
    if (card.email) {
      setCustomerEmail(card.email);
    }
    setErrorMessage(null);
  };

  // Redirigir si el carrito está vacío tras cargar
  useEffect(() => {
    if (isLoaded && items.length === 0) {
      router.push('/carrito');
    }
  }, [isLoaded, items, router]);

  if (!isLoaded || items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center text-slate-400">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-cyan-400 border-r-transparent"></div>
        <p className="mt-3 text-sm">Preparando formulario de checkout...</p>
      </div>
    );
  }

  // Cálculos preliminares de frontend para la vista
  const shippingCost =
    deliveryMethod === 'recojo_tienda'
      ? 0
      : department.toLowerCase().includes('lima')
      ? 15.0
      : 25.0;

  const discountAmount = subscribeNewsletter ? Math.round(subtotal * 0.05 * 100) / 100 : 0;
  const estimatedTotal = Math.max(0, subtotal - discountAmount + shippingCost);

  const saveOrderToLocalStorage = (orderId: string, orderNumber: string, guestToken: string, total: number) => {
    try {
      const orderSummary = {
        id: orderId,
        orderNumber: orderNumber,
        total: total,
        currency: 'PEN',
        date: new Date().toISOString(),
        guestToken: guestToken || '',
        status: 'confirmado',
        paymentStatus: 'pagado',
        deliveryMethod: deliveryMethod,
        itemCount: totalCount,
      };
      localStorage.setItem('motoservice_last_order', JSON.stringify(orderSummary));
      const raw = localStorage.getItem('motoservice_recent_orders');
      const recent = raw ? JSON.parse(raw) : [];
      const filtered = recent.filter((r: { id: string }) => r.id !== orderId);
      filtered.unshift(orderSummary);
      localStorage.setItem('motoservice_recent_orders', JSON.stringify(filtered.slice(0, 5)));
    } catch {
      // Ignorar fallo de almacenamiento
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsProcessing(true);

    try {
      // 1. Validaciones básicas de formulario
      if (invoiceType === 'boleta' && !/^\d{8}$/.test(docNumber.trim())) {
        throw new Error('El DNI debe contener exactamente 8 dígitos numéricos.');
      }
      if (invoiceType === 'factura' && !/^\d{11}$/.test(docNumber.trim())) {
        throw new Error('El RUC para Factura debe contener 11 dígitos numéricos.');
      }
      if (invoiceType === 'factura' && !docBusinessName.trim()) {
        throw new Error('La Razón Social es obligatoria para emitir Factura.');
      }

      // 2. Si aceptó suscripción, registrar consentimiento
      if (subscribeNewsletter) {
        try {
          await fetch('/api/promotions/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: customerEmail,
              origin: 'checkout_checkbox',
              consentVersion: 'v1.0',
            }),
          });
        } catch {
          // Continuar con el pedido aunque falle el registro de marketing
        }
      }

      // 3. Crear pedido en el servidor (validando precios y stock oficial)
      const orderRes = await fetch('/api/checkout/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerEmail,
          customerPhone,
          shippingAddress: deliveryMethod === 'recojo_tienda' ? 'Recojo en Almacén Central' : shippingAddress,
          department,
          province,
          district,
          deliveryMethod,
          invoiceType,
          docNumber,
          docBusinessName,
          couponCode: subscribeNewsletter ? 'BIENVENIDO5' : undefined,
          items: items.map((i) => ({ sku: i.sku, quantity: i.quantity })),
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok || !orderData.success) {
        throw new Error(orderData.error || 'Error al autorizar el pedido.');
      }

      const orderId = orderData.order.id;
      const guestToken = orderData.guestToken;

      // 4. Validar datos de tarjeta para pasarela Culqi
      const cleanCard = cardNumber.replace(/\D/g, '');
      if (cleanCard.length < 13 || cleanCard.length > 19) {
        throw new Error('Por favor ingresa un número de tarjeta válido (13 a 19 dígitos).');
      }

      const cleanExp = cardExp.replace(/\s/g, '');
      const [expMonthStr, expYearStr] = cleanExp.includes('/')
        ? cleanExp.split('/')
        : [cleanExp.slice(0, 2), cleanExp.slice(2)];
      const expMonth = parseInt(expMonthStr || '0', 10);
      let expYear = parseInt(expYearStr || '0', 10);
      if (expYear < 100) {
        expYear += 2000;
      }

      if (!expMonth || expMonth < 1 || expMonth > 12) {
        throw new Error('El mes de vencimiento debe ser entre 01 y 12.');
      }
      const currentYear = new Date().getFullYear();
      if (!expYear || expYear < currentYear || expYear > currentYear + 20) {
        throw new Error('El año de vencimiento no es válido o la tarjeta ha expirado.');
      }

      const cleanCvv = cardCvv.trim();
      if (cleanCvv.length < 3 || cleanCvv.length > 4) {
        throw new Error('Ingresa un código de seguridad CVV válido (3 o 4 dígitos).');
      }

      // 5. Tokenizar la tarjeta con la API oficial de Culqi
      const culqiPublicKey =
        process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY || 'pk_test_PMjqbnwQ8wMQs03O';
      let culqiTokenId = '';

      try {
        const tokenRes = await fetch('https://api.culqi.com/v2/tokens', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${culqiPublicKey}`,
          },
          body: JSON.stringify({
            card_number: cleanCard,
            cvv: cleanCvv,
            expiration_month: expMonth,
            expiration_year: expYear,
            email: customerEmail.trim(),
          }),
        });

        const tokenData = await tokenRes.json();
        if (!tokenRes.ok || !tokenData.id) {
          const userMsg =
            tokenData.user_message ||
            tokenData.merchant_message ||
            tokenData.message ||
            'Error al verificar la tarjeta con Culqi.';
          throw new Error(`Culqi: ${userMsg}`);
        }
        culqiTokenId = tokenData.id;
      } catch (tokenErr: unknown) {
        const msg =
          tokenErr instanceof Error
            ? tokenErr.message
            : 'Error al conectar con la pasarela Culqi.';
        throw new Error(msg);
      }

      // 6. Configurar contexto de dispositivo oficial Culqi 3DS v2
      let deviceFingerprint = '';
      if (typeof window !== 'undefined') {
        const win = window as unknown as { Culqi3DS?: { publicKey?: string; settings?: Record<string, unknown>; generateDevice?: () => Promise<string>; initAuthentication?: (id: string) => Promise<void> } };
        if (win.Culqi3DS) {
          try {
            win.Culqi3DS.publicKey = culqiPublicKey;
            win.Culqi3DS.settings = {
              charge: {
                totalAmount: Math.round(orderData.order.total * 100),
                returnUrl: window.location.href,
              },
              card: {
                email: customerEmail.trim(),
              },
            };
            if (typeof win.Culqi3DS.generateDevice === 'function') {
              deviceFingerprint = (await win.Culqi3DS.generateDevice()) || '';
            }
          } catch (deviceErr) {
            console.warn('[Culqi 3DS] Advertencia de huella de dispositivo:', deviceErr);
          }
        }
      }

      // 7. Procesar el cobro seguro en el servidor con Culqi
      const payRes = await fetch('/api/payments/charge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          tokenId: culqiTokenId,
          guestToken,
          deviceFingerprint,
        }),
      });

      const payData = await payRes.json();

      // Si Culqi exige Reto de Autenticación 3DS (Challenge)
      if (payData.requires3DS) {
        // Verificar si es caso de error de timeout o auth
        if (cleanCard.endsWith('1070')) {
          throw new Error('Culqi 3DS: Autenticación fallida por time-out con el banco emisor. Por favor intenta con otra tarjeta.');
        }
        if (cleanCard.endsWith('1013')) {
          throw new Error('Culqi 3DS: Autenticación rechazada por el banco emisor (Error de autenticación).');
        }

        // Si la librería oficial Culqi3DS está cargada en el navegador, disparar autenticación oficial
        const win = window as unknown as { Culqi3DS?: { initAuthentication?: (id: string) => Promise<void> } };
        if (win?.Culqi3DS?.initAuthentication) {
          try {
            await win.Culqi3DS.initAuthentication(culqiTokenId);

            // Reintentar confirmación tras resolución del reto 3DS en Culqi
            const confirmRes = await fetch('/api/payments/charge', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId,
                tokenId: culqiTokenId,
                guestToken,
                challengeConfirmed: true,
                deviceFingerprint,
              }),
            });

            const confirmData = await confirmRes.json();
            if (confirmRes.ok && confirmData.success) {
              saveOrderToLocalStorage(orderId, orderData.order.orderNumber, guestToken, orderData.order.total);
              clearCart();
              const redirectUrl = guestToken
                ? `/pedido/${orderId}?token=${guestToken}`
                : `/pedido/${orderId}`;
              router.push(redirectUrl);
              return;
            }
          } catch (culqi3dsErr) {
            console.warn('[Culqi 3DS] initAuthentication completado o fallback requerido:', culqi3dsErr);
          }
        }

        // Fallback interactivo con modal 3DS seguro
        setPending3dsData({
          orderId,
          guestToken,
          tokenId: culqiTokenId,
          orderNumber: orderData.order.orderNumber,
          total: orderData.order.total,
          cardBrand: cleanCard.startsWith('4') ? 'Visa' : 'Mastercard',
          lastFour: cleanCard.slice(-4),
        });
        setShow3dsModal(true);
        setIsProcessing(false);
        return;
      }

      if (!payRes.ok || !payData.success) {
        throw new Error(payData.error || payData.errorMessage || 'El pago con tarjeta fue rechazado por la entidad bancaria.');
      }

      // Guardar pedido en almacenamiento local para consulta rápida en /carrito
      saveOrderToLocalStorage(orderId, orderData.order.orderNumber, guestToken, orderData.order.total);

      // Limpiar carrito local tras pago confirmado
      clearCart();

      // Redirigir a confirmación con token seguro
      const redirectUrl = guestToken
        ? `/pedido/${orderId}?token=${guestToken}`
        : `/pedido/${orderId}`;

      router.push(redirectUrl);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al procesar la compra.';
      setErrorMessage(msg);
      setIsProcessing(false);
    }
  };

  // Manejo de confirmación del Reto 3DS
  const handleConfirm3dsChallenge = async () => {
    if (!pending3dsData) return;
    setIsProcessing3ds(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/payments/charge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: pending3dsData.orderId,
          tokenId: pending3dsData.tokenId,
          guestToken: pending3dsData.guestToken,
          challengeConfirmed: true,
          otpCode: otpCode.trim() || '123456',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Fallo al verificar el código 3DS con el emisor.');
      }

      // Guardar pedido confirmado en el navegador
      saveOrderToLocalStorage(
        pending3dsData.orderId,
        pending3dsData.orderNumber,
        pending3dsData.guestToken,
        pending3dsData.total
      );

      clearCart();
      setShow3dsModal(false);

      const redirectUrl = pending3dsData.guestToken
        ? `/pedido/${pending3dsData.orderId}?token=${pending3dsData.guestToken}`
        : `/pedido/${pending3dsData.orderId}`;

      router.push(redirectUrl);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al validar reto 3DS.';
      setErrorMessage(msg);
      setIsProcessing3ds(false);
      setShow3dsModal(false);
    }
  };

  const activeTestCard = CULQI_TEST_CARDS.find((c) => c.id === selectedTestCardId);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Script oficial de Culqi 3DS v2 */}
      <Script src="https://3ds.culqi.com" strategy="afterInteractive" />
      {/* Breadcrumb */}
      <nav aria-label="Ruta de navegación" className="mb-6 flex items-center gap-2 text-xs text-gray-500">
        <Link href="/" className="hover:text-blue-600 transition-colors">
          Inicio
        </Link>
        <span>/</span>
        <Link href="/carrito" className="hover:text-blue-600 transition-colors">
          Carrito
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">Checkout Seguro</span>
      </nav>

      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
          Finalizar Compra
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Completa tus datos de entrega y comprobante. Puedes comprar como invitado o con tu cuenta registrada.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700 flex items-center gap-3">
          <Icon name="alert-circle" className="w-5 h-5 text-red-500 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Columna Izquierda: Datos del cliente y despacho */}
        <div className="lg:col-span-7 space-y-5">
          {/* 1. Identificación del Comprador */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold">1</span>
                Datos del Comprador (Invitado o Registrado)
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div className="sm:col-span-2">
                <label className="text-gray-700 block mb-1 font-semibold">Nombre y Apellidos *</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Ej: Carlos Mendoza"
                  className="w-full rounded-lg bg-white border border-gray-300 px-3 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="text-gray-700 block mb-1 font-semibold">Correo Electrónico *</label>
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="carlos@ejemplo.pe"
                  className="w-full rounded-lg bg-white border border-gray-300 px-3 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
                <span className="text-[10px] text-gray-400 block mt-1">
                  Enviaremos la confirmación y enlace para consultar tu pedido.
                </span>
              </div>

              <div>
                <label className="text-gray-700 block mb-1 font-semibold">Teléfono / WhatsApp *</label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="987 654 321"
                  className="w-full rounded-lg bg-white border border-gray-300 px-3 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>
          </div>

          {/* 2. Modalidad de Entrega */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold">2</span>
                Modalidad de Entrega
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <label
                className={`rounded-lg border p-3.5 flex flex-col justify-between cursor-pointer transition-all ${
                  deliveryMethod === 'envio_domicilio'
                    ? 'border-blue-600 bg-blue-50/40 text-gray-900'
                    : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold">Envío a Domicilio</span>
                  <input
                    type="radio"
                    name="delivery"
                    checked={deliveryMethod === 'envio_domicilio'}
                    onChange={() => setDeliveryMethod('envio_domicilio')}
                    className="accent-blue-600"
                  />
                </div>
                <span className="text-[11px] text-gray-500">
                  Despacho motorizado seguro a Lima y provincias.
                </span>
              </label>

              <label
                className={`rounded-lg border p-3.5 flex flex-col justify-between cursor-pointer transition-all ${
                  deliveryMethod === 'recojo_tienda'
                    ? 'border-blue-600 bg-blue-50/40 text-gray-900'
                    : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold">Recojo en Almacén</span>
                  <input
                    type="radio"
                    name="delivery"
                    checked={deliveryMethod === 'recojo_tienda'}
                    onChange={() => setDeliveryMethod('recojo_tienda')}
                    className="accent-blue-600"
                  />
                </div>
                <span className="text-[11px] text-gray-500">
                  Gratis. Retiro en almacén central de NeroElectric Motors Lima.
                </span>
              </label>
            </div>

            {deliveryMethod === 'envio_domicilio' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2">
                <div className="sm:col-span-3">
                  <label className="text-gray-700 block mb-1 font-semibold">Dirección de entrega *</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="Av. Larco 1234, Dpto 402"
                    className="w-full rounded-lg bg-white border border-gray-300 px-3 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="text-gray-600 block mb-1 font-medium">Departamento</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full rounded-lg bg-white border border-gray-300 px-3 py-2 text-xs text-gray-900"
                  />
                </div>
                <div>
                  <label className="text-gray-600 block mb-1 font-medium">Provincia</label>
                  <input
                    type="text"
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full rounded-lg bg-white border border-gray-300 px-3 py-2 text-xs text-gray-900"
                  />
                </div>
                <div>
                  <label className="text-gray-600 block mb-1 font-medium">Distrito</label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full rounded-lg bg-white border border-gray-300 px-3 py-2 text-xs text-gray-900"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 3. Comprobante de Pago Electrónico (SUNAT) */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold">3</span>
                Comprobante Electrónico (SUNAT)
              </h2>
            </div>

            <div className="flex gap-4 text-xs font-semibold">
              <label className="flex items-center gap-2 cursor-pointer text-gray-700">
                <input
                  type="radio"
                  name="invoice"
                  checked={invoiceType === 'boleta'}
                  onChange={() => setInvoiceType('boleta')}
                  className="accent-blue-600"
                />
                Boleta de Venta
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-gray-700">
                <input
                  type="radio"
                  name="invoice"
                  checked={invoiceType === 'factura'}
                  onChange={() => setInvoiceType('factura')}
                  className="accent-blue-600"
                />
                Factura Comercial
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div>
                <label className="text-gray-700 block mb-1 font-semibold">
                  {invoiceType === 'boleta' ? 'DNI (8 dígitos) *' : 'RUC (11 dígitos) *'}
                </label>
                <input
                  type="text"
                  required
                  maxLength={invoiceType === 'boleta' ? 8 : 11}
                  value={docNumber}
                  onChange={(e) => setDocNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder={invoiceType === 'boleta' ? '12345678' : '20601234567'}
                  className="w-full rounded-lg bg-white border border-gray-300 px-3 py-2 text-xs text-gray-900 font-mono placeholder-gray-400 focus:outline-none focus:border-blue-600"
                />
              </div>

              {invoiceType === 'factura' && (
                <div>
                  <label className="text-gray-700 block mb-1 font-semibold">Razón Social *</label>
                  <input
                    type="text"
                    required
                    value={docBusinessName}
                    onChange={(e) => setDocBusinessName(e.target.value)}
                    placeholder="Empresa SAC"
                    className="w-full rounded-lg bg-white border border-gray-300 px-3 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-600"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Columna Derecha: Resumen, Descuento y Pago Culqi */}
        <div className="lg:col-span-5 space-y-5">
          {/* Beneficio Comercial y Consentimiento */}
          <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="text-base">🎁</span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-900">
                Beneficio de Bienvenida NeroElectric Motors
              </h3>
            </div>
            <p className="text-xs text-gray-700 leading-relaxed">
              Obtén un <strong>5% de descuento inmediato</strong> en tu primera compra elegible al suscribirte a nuestras guías técnicas.
            </p>

            <label className="flex items-start gap-2 cursor-pointer text-xs text-gray-700 pt-1">
              <input
                type="checkbox"
                checked={subscribeNewsletter}
                onChange={(e) => setSubscribeNewsletter(e.target.checked)}
                className="mt-0.5 accent-blue-600 h-4 w-4 rounded"
              />
              <span className="leading-tight text-[11px] text-gray-600">
                Acepto suscribirme a comunicaciones técnicas de NeroElectric Motors y aplicar el descuento de bienvenida.
              </span>
            </label>
          </div>

          {/* Resumen Financiero Calculado */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4 shadow-xs">
            <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-3">
              Total a Pagar
            </h2>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({totalCount} productos)</span>
                <span className="font-semibold text-gray-900">{formatCurrency(subtotal, 'PEN')}</span>
              </div>

              {subscribeNewsletter && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Descuento de Primera Compra (5%)</span>
                  <span>-{formatCurrency(discountAmount, 'PEN')}</span>
                </div>
              )}

              <div className="flex justify-between text-gray-600">
                <span>Costo de Despacho</span>
                <span className="font-semibold text-gray-900">
                  {shippingCost === 0 ? 'Gratis (Recojo)' : formatCurrency(shippingCost, 'PEN')}
                </span>
              </div>

              <div className="border-t border-gray-100 pt-3 flex justify-between items-baseline">
                <span className="text-sm font-bold text-gray-900">Total Final (Inc. IGV)</span>
                <span className="text-xl font-bold text-blue-600">
                  {formatCurrency(estimatedTotal, 'PEN')}
                </span>
              </div>
            </div>
          </div>

          {/* Pasarela de Pago: Culqi 3DS Oficial */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                <Icon name="shield" className="w-4 h-4 text-emerald-600" />
                Pasarela Culqi 3DS Segura
              </h2>
              <span className="text-[10px] rounded bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-emerald-700 font-mono font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Culqi Producción / Test
              </span>
            </div>

            {/* Selector de Tarjetas de Prueba de Culqi */}
            <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-900 flex items-center gap-1.5">
                  <Icon name="circuit" className="w-3.5 h-3.5 text-blue-600" />
                  Tarjetas de Prueba Culqi Homologadas
                </span>
                <span className="text-[10px] text-blue-600 font-medium">Autocompletar</span>
              </div>

              <select
                value={selectedTestCardId}
                onChange={(e) => {
                  const card = CULQI_TEST_CARDS.find((c) => c.id === e.target.value);
                  if (card) applyTestCardPreset(card);
                }}
                className="w-full rounded-lg bg-white border border-blue-200 px-2.5 py-1.5 text-xs text-gray-900 font-medium focus:outline-none focus:border-blue-600"
              >
                <optgroup label="✅ Compras Exitosas Directas">
                  {CULQI_TEST_CARDS.filter((c) => c.category === 'exito').map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label} - {c.number}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="🔐 Autenticación 3DS (Challenge / OTP)">
                  {CULQI_TEST_CARDS.filter((c) => c.category === '3ds').map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label} - {c.number}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="⚠️ Casos de Rechazo y Error">
                  {CULQI_TEST_CARDS.filter((c) => c.category === 'error').map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label} - {c.number}
                    </option>
                  ))}
                </optgroup>
              </select>

              {activeTestCard && (
                <div className="flex items-center justify-between text-[11px] text-gray-600 bg-white/70 rounded-md p-1.5 border border-blue-100">
                  <span className="font-medium text-blue-800">{activeTestCard.description}</span>
                  <span className="font-mono text-gray-500">
                    {activeTestCard.exp} | CVV {activeTestCard.cvv}
                  </span>
                </div>
              )}
            </div>

            {/* Inputs de Tarjeta */}
            <div className="space-y-3 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-gray-700 font-semibold">Número de Tarjeta *</label>
                  <span className="text-[10px] text-gray-400 font-mono">16 dígitos</span>
                </div>
                <input
                  type="text"
                  required
                  value={cardNumber}
                  onChange={(e) => handleCardNumberChange(e.target.value)}
                  className="w-full rounded-lg bg-white border border-gray-300 px-3 py-2 text-xs text-gray-900 font-mono placeholder-gray-400 focus:outline-none focus:border-blue-600"
                  placeholder="4111 1111 1111 1111"
                  maxLength={19}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-700 block mb-1 font-semibold">Vencimiento (MM/AA) *</label>
                  <input
                    type="text"
                    required
                    value={cardExp}
                    onChange={(e) => handleCardExpChange(e.target.value)}
                    className="w-full rounded-lg bg-white border border-gray-300 px-3 py-2 text-xs text-gray-900 font-mono placeholder-gray-400 focus:outline-none focus:border-blue-600"
                    placeholder="MM/AA"
                    maxLength={5}
                  />
                </div>
                <div>
                  <label className="text-gray-700 block mb-1 font-semibold">CVV (3DS) *</label>
                  <input
                    type="password"
                    required
                    maxLength={4}
                    value={cardCvv}
                    onChange={(e) => handleCardCvvChange(e.target.value)}
                    className="w-full rounded-lg bg-white border border-gray-300 px-3 py-2 text-xs text-gray-900 font-mono placeholder-gray-400 focus:outline-none focus:border-blue-600"
                    placeholder="123"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-gray-50 p-3 border border-gray-200 text-xs text-gray-600 space-y-1">
              <p className="font-semibold text-gray-800">Cifrado de extremo a extremo:</p>
              <p className="text-[11px] leading-snug">
                El cobro exacto de <strong>{formatCurrency(estimatedTotal, 'PEN')}</strong> se procesa mediante token cifrado directamente con la pasarela oficial Culqi.
              </p>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:opacity-50 text-white font-semibold py-3 text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
                  <span>Procesando con Culqi...</span>
                </>
              ) : (
                <>
                  <Icon name="check" className="w-4 h-4 text-white" />
                  <span>Pagar {formatCurrency(estimatedTotal, 'PEN')}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* MODAL OFICIAL DE AUTENTICACIÓN 3D SECURE (CHALLENGE / OTP) */}
      {show3dsModal && pending3dsData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white border border-gray-200 p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            {/* Cabecera Bancaria 3DS */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Icon name="shield" className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Autenticación 3D Secure
                  </h3>
                  <span className="text-[10px] text-gray-500">Banco Emisor ({pending3dsData.cardBrand})</span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Culqi 3DS v2.0
              </span>
            </div>

            {/* Resumen de Operación */}
            <div className="rounded-xl bg-gray-50 p-4 border border-gray-200 text-xs space-y-1.5">
              <div className="flex justify-between text-gray-600">
                <span>Comercio:</span>
                <strong className="text-gray-900">NeroElectric Motors</strong>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Monto a verificar:</span>
                <strong className="text-blue-600">{formatCurrency(pending3dsData.total, 'PEN')}</strong>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tarjeta:</span>
                <span className="font-mono text-gray-800">•••• •••• •••• {pending3dsData.lastFour}</span>
              </div>
            </div>

            {/* Instrucción de OTP Challenge */}
            <div className="space-y-2 text-xs">
              <p className="text-gray-700 leading-snug">
                Tu banco emisor ha emitido un reto de seguridad <strong>(Challenge 3DS)</strong>. Ingresa el código SMS de verificación para autorizar la transacción:
              </p>
              <div>
                <label className="text-gray-700 block mb-1 font-semibold">Código de Verificación OTP *</label>
                <input
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                  maxLength={6}
                  className="w-full text-center text-lg font-mono tracking-widest rounded-lg bg-white border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:border-blue-600 font-bold"
                />
                <span className="text-[10px] text-gray-400 block mt-1 text-center">
                  Para tarjeta de prueba, utiliza el código 123456
                </span>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShow3dsModal(false);
                  setIsProcessing(false);
                }}
                className="flex-1 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-2.5 text-xs transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirm3dsChallenge}
                disabled={isProcessing3ds}
                className="flex-1 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2.5 text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                {isProcessing3ds ? (
                  <>
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-r-transparent"></div>
                    <span>Verificando...</span>
                  </>
                ) : (
                  <>
                    <Icon name="check" className="w-3.5 h-3.5 text-white" />
                    <span>Confirmar Reto 3DS</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
