'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '../../lib/cart/cart-context';
import { Icon } from '../../components/ui/Icons';
import { formatCurrency } from '../../lib/formatters.js';
import { InvoiceType, DeliveryMethod } from '../../types';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, totalCount, clearCart, isLoaded } = useCart();

  // Datos del comprador
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [department, setDepartment] = useState('Lima');
  const [province, setProvince] = useState('Lima');
  const [district, setDistrict] = useState('Miraflores');
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('envio_domicilio');

  // Comprobante electrónico
  const [invoiceType, setInvoiceType] = useState<InvoiceType>('boleta');
  const [docNumber, setDocNumber] = useState('');
  const [docBusinessName, setDocBusinessName] = useState('');

  // Promoción de primera compra (5%)
  const [subscribeNewsletter, setSubscribeNewsletter] = useState(true);

  // Pago Culqi
  const [cardNumber, setCardNumber] = useState('4111 1111 1111 1111');
  const [cardExp, setCardExp] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('123');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

      // 4. Procesar el pago con Culqi 3DS mediante el adaptador seguro de servidor
      const mockToken = `tok_test_${Date.now()}`;
      const payRes = await fetch('/api/payments/charge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          tokenId: mockToken,
          guestToken,
        }),
      });

      const payData = await payRes.json();
      if (!payRes.ok || !payData.success) {
        throw new Error(payData.error || 'El pago con tarjeta fue rechazado.');
      }

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

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav aria-label="Ruta de navegación" className="mb-6 flex items-center gap-2 text-xs text-slate-400">
        <Link href="/" className="hover:text-cyan-400 transition-colors">
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
          Completa tus datos de entrega y comprobante. Puedes comprar como invitado o con tu cuenta.
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
                  Enviaremos el enlace para consultar tu pedido.
                </span>
              </div>

              <div>
                <label className="text-gray-700 block mb-1 font-semibold">Teléfono / WhatsApp *</label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="999 888 777"
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
                  <div className="flex items-center gap-2 font-bold text-gray-900">
                    <Icon name="truck" className="w-4 h-4 text-blue-600" />
                    Envío a Domicilio
                  </div>
                  <input
                    type="radio"
                    name="delivery"
                    checked={deliveryMethod === 'envio_domicilio'}
                    onChange={() => setDeliveryMethod('envio_domicilio')}
                    className="accent-blue-600"
                  />
                </div>
                <span className="text-[11px] text-gray-500">
                  Lima Metropolitana (S/ 15) o Provincias (S/ 25). Cobertura nacional con empaque de seguridad.
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
                  <div className="flex items-center gap-2 font-bold text-gray-900">
                    <Icon name="package" className="w-4 h-4 text-emerald-600" />
                    Recojo en Tienda
                  </div>
                  <input
                    type="radio"
                    name="delivery"
                    checked={deliveryMethod === 'recojo_tienda'}
                    onChange={() => setDeliveryMethod('recojo_tienda')}
                    className="accent-blue-600"
                  />
                </div>
                <span className="text-[11px] text-emerald-700 font-medium">
                  Gratis en Almacén Central NeroElectric Motors (Lima).
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

          {/* Pasarela de Pago: Culqi 3DS */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                <Icon name="shield" className="w-4 h-4 text-emerald-600" />
                Pasarela de Pago Segura (Culqi 3DS)
              </h2>
              <span className="text-[10px] rounded bg-gray-100 border border-gray-200 px-2 py-0.5 text-gray-600 font-mono">
                Cifrado 256-bit
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-gray-700 block mb-1 font-semibold">Número de Tarjeta</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full rounded-lg bg-white border border-gray-300 px-3 py-2 text-xs text-gray-900 font-mono placeholder-gray-400 focus:outline-none focus:border-blue-600"
                  placeholder="4111 1111 1111 1111"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-700 block mb-1 font-semibold">Vencimiento</label>
                  <input
                    type="text"
                    value={cardExp}
                    onChange={(e) => setCardExp(e.target.value)}
                    className="w-full rounded-lg bg-white border border-gray-300 px-3 py-2 text-xs text-gray-900 font-mono placeholder-gray-400 focus:outline-none focus:border-blue-600"
                    placeholder="MM/AA"
                  />
                </div>
                <div>
                  <label className="text-gray-700 block mb-1 font-semibold">CVV (3DS)</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    className="w-full rounded-lg bg-white border border-gray-300 px-3 py-2 text-xs text-gray-900 font-mono placeholder-gray-400 focus:outline-none focus:border-blue-600"
                    placeholder="123"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-gray-50 p-3 border border-gray-200 text-xs text-gray-600 space-y-1">
              <p className="font-semibold text-gray-800">Entorno seguro de pagos:</p>
              <p className="text-[11px] leading-snug">
                El servidor autorizará el cargo exacto de <strong>{formatCurrency(estimatedTotal, 'PEN')}</strong> a través de Culqi con validación 3DS. No almacenamos datos de tu tarjeta.
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
                  <span>Autorizando Pago Seguro...</span>
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
    </div>
  );
}
