'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Icon } from '../ui/Icons';
import { useCart } from '@/lib/cart/cart-context';
import {
  DiagnosticSymptom,
  VoltIADiagnosisResult,
} from '@/types';
import { executeDiagnosticEvaluation } from '@/lib/voltia/voltia-engine';
import type {
  VoltIARecommendedProduct,
  VoltIASafetyAlert,
} from '@/lib/voltia/voltia-ai-service';

export function openVoltIAChat(detail: {
  brand?: string;
  model?: string;
  voltage?: number | string;
  power?: number | string;
  prompt?: string;
}) {
  if (typeof window !== 'undefined') {
    const defaultPrompt =
      detail.prompt ||
      (detail.brand && detail.model
        ? `Hola, quiero consultar sobre los repuestos compatibles con mi ${detail.brand} ${detail.model}${
            detail.voltage ? ` de ${detail.voltage}V` : ''
          }${detail.power ? ` y ${detail.power}W` : ''}.`
        : 'Hola VoltIA, tengo una consulta técnica sobre compatibilidad de repuestos.');
    window.dispatchEvent(
      new CustomEvent('open-voltia', {
        detail: {
          ...detail,
          prompt: defaultPrompt,
        },
      })
    );
  }
}

interface ChatItem {
  id: string;
  sender: 'user' | 'voltia';
  text: string;
  timestamp: Date;
  safetyAlert?: VoltIASafetyAlert;
  recommendedProducts?: VoltIARecommendedProduct[];
  suggestedQuestions?: string[];
  isError?: boolean;
}

export function VoltIAWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'sintomas' | 'humano'>('chat');
  const [inputText, setInputText] = useState('');
  const [vehicleBrand, setVehicleBrand] = useState('TAILG');
  const [vehicleModel, setVehicleModel] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null);

  // Historial de conversación
  const [messages, setMessages] = useState<ChatItem[]>([
    {
      id: 'welcome',
      sender: 'voltia',
      text: '¡Hola! Soy VoltIA, tu asistente técnico oficial en NERO Electric Motors. Puedo asesorarte con diagnósticos eléctricos, compatibilidad real de repuestos y seguimiento de pedidos. ¿En qué puedo ayudarte?',
      timestamp: new Date(),
      suggestedQuestions: [
        '¿Qué batería de litio es compatible con mi moto?',
        '¿Cómo saber si el controlador senoidal está fallando?',
        'Consultar el estado de mi pedido',
      ],
    },
  ]);

  // Diagnóstico determinista rápido
  const [currentDiagnosis, setCurrentDiagnosis] = useState<VoltIADiagnosisResult | null>(null);

  // Formulario de asistencia técnica humana
  const [humanForm, setHumanForm] = useState({ name: '', email: '', phone: '', details: '' });
  const [humanSubmitted, setHumanSubmitted] = useState(false);
  const [humanError, setHumanError] = useState<string | null>(null);
  const [isSubmittingHuman, setIsSubmittingHuman] = useState(false);

  // Notificación de carrito
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const { addItem } = useCart();
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Envío de mensaje a la IA conversacional
  const handleSendMessage = useCallback(
    async (
      textToSend?: string,
      overrideContext?: { brand?: string; model?: string; voltage?: number | string }
    ) => {
      const text = (textToSend || inputText).trim();
      if (!text || isLoading) return;

      const userMessage: ChatItem = {
        id: `user-${Date.now()}`,
        sender: 'user',
        text,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInputText('');
      setIsLoading(true);
      setLastFailedMessage(null);

      // Preparar historial previo para el backend (últimos 6 mensajes)
      const historyPayload = messages.slice(-6).map((m) => ({
        sender: m.sender,
        text: m.text,
      }));

      try {
        const res = await fetch('/api/voltia/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            history: historyPayload,
            context: {
              brand: overrideContext?.brand || vehicleBrand,
              model: overrideContext?.model || vehicleModel,
              voltage: overrideContext?.voltage,
              pagePath: typeof window !== 'undefined' ? window.location.pathname : '',
            },
          }),
        });

        const data = await res.json();

        if (data.success) {
          const aiMessage: ChatItem = {
            id: `voltia-${Date.now()}`,
            sender: 'voltia',
            text: data.message,
            timestamp: new Date(),
            safetyAlert: data.safetyAlert,
            recommendedProducts: data.recommendedProducts,
            suggestedQuestions: data.suggestedQuestions,
          };
          setMessages((prev) => [...prev, aiMessage]);
        } else {
          const errorMsg: ChatItem = {
            id: `voltia-err-${Date.now()}`,
            sender: 'voltia',
            text:
              data.message ||
              'No pudimos completar tu consulta en este momento. Puedes reintentar o solicitar asistencia técnica con un especialista.',
            timestamp: new Date(),
            isError: true,
          };
          setMessages((prev) => [...prev, errorMsg]);
          setLastFailedMessage(text);
        }
      } catch {
        const networkErrMsg: ChatItem = {
          id: `voltia-neterr-${Date.now()}`,
          sender: 'voltia',
          text: 'Error de conexión al contactar a VoltIA. Por favor verifica tu conexión a internet e intenta nuevamente.',
          timestamp: new Date(),
          isError: true,
        };
        setMessages((prev) => [...prev, networkErrMsg]);
        setLastFailedMessage(text);
      } finally {
        setIsLoading(false);
      }
    },
    [inputText, isLoading, messages, vehicleBrand, vehicleModel]
  );

  // Escuchar evento open-voltia desde cualquier botón de la tienda
  useEffect(() => {
    const handleOpenEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{
        brand?: string;
        model?: string;
        voltage?: number | string;
        prompt?: string;
      }>;
      setIsOpen(true);
      setActiveTab('chat');
      if (customEvent.detail?.brand) setVehicleBrand(customEvent.detail.brand);
      if (customEvent.detail?.model) setVehicleModel(customEvent.detail.model);
      if (customEvent.detail?.prompt) {
        handleSendMessage(customEvent.detail.prompt, {
          brand: customEvent.detail.brand,
          model: customEvent.detail.model,
          voltage: customEvent.detail.voltage,
        });
      }
    };

    window.addEventListener('open-voltia', handleOpenEvent);
    return () => window.removeEventListener('open-voltia', handleOpenEvent);
  }, [handleSendMessage]);

  // Auto-scroll al final del chat al recibir mensajes
  useEffect(() => {
    if (activeTab === 'chat' && isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, activeTab, isOpen]);

  // Agregar al carrito desde tarjeta recomendada
  const handleAddToCart = (part: VoltIARecommendedProduct) => {
    const res = addItem({
      id: part.sku,
      sku: part.sku,
      name: part.name,
      price: part.pricePen || part.price || 0,
      currency: part.currency || 'PEN',
      categoryName: part.category || 'Repuesto EV',
      isDirectSale: true,
      stockAvailable: 10,
    });

    setFeedbackMsg(res.message || `«${part.name}» añadido al carrito.`);
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  // Envío a asistencia técnica humana
  const handleHumanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingHuman(true);
    setHumanError(null);

    try {
      const res = await fetch('/api/voltia/asistencia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactName: humanForm.name,
          contactEmail: humanForm.email,
          contactPhone: humanForm.phone,
          requestType: 'consulta_conversacional_voltia',
          description: humanForm.details || 'Consulta derivada desde el chat con VoltIA',
          technicalDetails: {
            brand: vehicleBrand,
            model: vehicleModel,
            recentConversation: messages.slice(-4).map((m) => `${m.sender}: ${m.text}`),
          },
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setHumanSubmitted(true);
      } else {
        setHumanError(data.error || 'No se pudo registrar la solicitud. Intenta de nuevo.');
      }
    } catch {
      setHumanError('Error de red al registrar la solicitud técnica.');
    } finally {
      setIsSubmittingHuman(false);
    }
  };

  const handleSymptomSelect = (symptom: DiagnosticSymptom) => {
    const result = executeDiagnosticEvaluation({
      symptom,
      brand: vehicleBrand,
      model: vehicleModel || 'Modelo general',
      userInput: inputText,
    });
    setCurrentDiagnosis(result);
  };

  return (
    <>
      {/* Botón flotante accesible */}
      <aside aria-label="Asistente VoltIA" className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-controls="voltia-dialog-panel"
          className="group relative flex items-center gap-3 rounded-full bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 px-4.5 py-3 text-slate-950 font-bold shadow-2xl shadow-cyan-500/40 hover:scale-105 active:scale-95 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          aria-label="Abrir asistente técnico VoltIA"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-950 text-cyan-300 shadow-xs">
            <Icon name="circuit" className="h-4.5 w-4.5 animate-pulse stroke-[2.5]" />
          </div>
          <span className="hidden sm:inline text-sm font-black tracking-wide text-slate-950">
            Asistente <span className="text-white drop-shadow-xs">VoltIA</span>
          </span>
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-400 border-2 border-slate-950"></span>
          </span>
        </button>
      </aside>

      {/* Modal conversacional VoltIA */}
      {isOpen && (
        <div
          id="voltia-dialog-panel"
          role="region"
          aria-label="Ventana de asistente VoltIA"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-end p-0 sm:p-6 bg-slate-950/70 backdrop-blur-xs"
        >
          <div className="relative w-full sm:max-w-xl h-[88vh] sm:h-[82vh] flex flex-col rounded-t-3xl sm:rounded-3xl border border-cyan-700/60 bg-slate-900 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-6">
            {/* Header del Asistente */}
            <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950 px-5 py-3.5 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-950 border border-cyan-500/50 text-cyan-300 shadow-xs">
                  <Icon name="circuit" className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-white tracking-wide text-base">VoltIA</h3>
                    <span className="rounded bg-cyan-950 px-2 py-0.5 text-[10px] font-bold text-cyan-300 border border-cyan-700">
                      IA Experta EV
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Diagnóstico eléctrico, compatibilidad y pedidos
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg p-1.5 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
                  aria-label="Cerrar VoltIA"
                >
                  <Icon name="x" className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Pestañas de modo */}
            <div className="flex border-b border-slate-800 bg-slate-950/80 px-4 py-1.5 gap-2 text-xs shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('chat')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  activeTab === 'chat'
                    ? 'bg-cyan-500 text-slate-950 shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                💬 Chat con IA
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('sintomas')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  activeTab === 'sintomas'
                    ? 'bg-cyan-500 text-slate-950 shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                ⚡ Diagnóstico Rápido
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('humano');
                  setHumanSubmitted(false);
                }}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  activeTab === 'humano'
                    ? 'bg-cyan-500 text-slate-950 shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                🛠️ Asistencia en Taller
              </button>
            </div>

            {/* Notificación de Carrito */}
            {feedbackMsg && (
              <div className="bg-emerald-950 border-b border-emerald-700 px-4 py-2 text-xs text-emerald-200 font-bold flex items-center justify-between shrink-0 shadow-xs">
                <span>{feedbackMsg}</span>
                <Link href="/carrito" className="underline font-black text-emerald-300 hover:text-white">
                  Ver Carrito →
                </Link>
              </div>
            )}

            {/* Selector de vehículo */}
            <div className="rounded-none bg-slate-950 p-2.5 border-b border-slate-800 flex flex-wrap gap-2 items-center text-xs shrink-0">
              <span className="text-slate-300 font-bold">Vehículo:</span>
              <select
                value={vehicleBrand}
                onChange={(e) => setVehicleBrand(e.target.value)}
                className="rounded-lg bg-slate-900 border border-slate-700 px-2 py-1 text-white font-bold text-xs"
              >
                <option value="TAILG">TAILG</option>
                <option value="YADEA">YADEA</option>
                <option value="KAYENCORP">KAYENCORP</option>
                <option value="GREENLINE">GREENLINE</option>
                <option value="NIU">NIU</option>
                <option value="SUPER_SOCO">Super Soco</option>
                <option value="OTRA">Otra Multimarca</option>
              </select>

              <input
                type="text"
                placeholder="Modelo (ej: Lion E5, F55)"
                value={vehicleModel}
                onChange={(e) => setVehicleModel(e.target.value)}
                className="rounded-lg bg-slate-900 border border-slate-700 px-2.5 py-1 text-white flex-1 min-w-[120px] text-xs placeholder-slate-400"
              />
            </div>

            {/* ============================================================ */}
            {/* PESTAÑA 1: CHAT CON IA REAL Y HERRAMIENTAS                    */}
            {/* ============================================================ */}
            {activeTab === 'chat' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Lista de mensajes */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs sm:text-sm text-slate-200">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl p-3.5 sm:p-4 shadow-md ${
                          msg.sender === 'user'
                            ? 'bg-cyan-500 text-slate-950 font-medium rounded-br-xs'
                            : msg.isError
                            ? 'bg-rose-950/80 border border-rose-700 text-rose-200 rounded-bl-xs'
                            : 'bg-slate-950 border border-slate-800 text-slate-100 rounded-bl-xs'
                        }`}
                      >
                        <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>

                        {/* Alerta de Peligro Eléctrico Crítico */}
                        {msg.safetyAlert && (
                          <div className="mt-3 p-3 rounded-xl bg-red-950 border-2 border-red-600 text-red-200 text-xs space-y-2">
                            <span className="font-black text-red-300 block text-xs sm:text-sm">
                              🚨 ALERTA CRÍTICA DE SEGURIDAD ELÉCTRICA
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveTab('humano');
                                setHumanForm((prev) => ({
                                  ...prev,
                                  details: `EMERGENCIA TÉCNICA: ${msg.safetyAlert?.title || 'Riesgo eléctrico detectado'}`,
                                }));
                              }}
                              className="w-full mt-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-black py-2 px-3 text-xs transition-colors cursor-pointer shadow-sm"
                            >
                              Solicitar Inspección Técnica Urgente
                            </button>
                          </div>
                        )}

                        {/* Tarjetas de Productos Reales Recomendados */}
                        {msg.recommendedProducts && msg.recommendedProducts.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2.5">
                            <span className="text-xs font-black text-cyan-300 block uppercase tracking-wider">
                              Repuestos y Componentes Disponibles:
                            </span>
                            <div className="grid grid-cols-1 gap-2.5">
                              {msg.recommendedProducts.map((prod: VoltIARecommendedProduct, idx: number) => (
                                <div
                                  key={prod.sku || idx}
                                  className="rounded-xl border border-slate-800 bg-slate-900/90 p-3 flex flex-col gap-2"
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="space-y-0.5">
                                      <span className="font-mono text-[10px] font-bold text-cyan-400 bg-cyan-950 px-1.5 py-0.2 rounded border border-cyan-800">
                                        SKU: {prod.sku}
                                      </span>
                                      <h4 className="font-extrabold text-white text-xs sm:text-sm mt-1">
                                        {prod.name}
                                      </h4>
                                      <p className="text-[11px] text-slate-300 font-medium">
                                        {prod.brand} • {prod.category}
                                      </p>
                                    </div>
                                    <span className="text-sm font-black text-cyan-300 shrink-0">
                                      S/ {Number(prod.pricePen || prod.price || 0).toFixed(2)}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2 pt-1 border-t border-slate-800/60">
                                    {prod.canPurchase !== false ? (
                                      <button
                                        type="button"
                                        onClick={() => handleAddToCart(prod)}
                                        className="flex-1 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black py-1.5 px-3 text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                                      >
                                        <Icon name="cart" className="w-3.5 h-3.5 stroke-[2.5]" />
                                        <span>Añadir al Carrito</span>
                                      </button>
                                    ) : (
                                      <span className="flex-1 text-center text-[10px] text-amber-300 font-semibold py-1 bg-amber-950/60 rounded border border-amber-800/60">
                                        Venta bajo consulta técnica
                                      </span>
                                    )}

                                    <Link
                                      href={prod.url || `/repuestos?q=${encodeURIComponent(prod.sku || prod.name)}`}
                                      onClick={() => setIsOpen(false)}
                                      className="rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-3 py-1.5 text-xs transition-colors"
                                    >
                                      Ficha
                                    </Link>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Botón de reintento ante error */}
                      {msg.isError && lastFailedMessage && (
                        <button
                          type="button"
                          onClick={() => handleSendMessage(lastFailedMessage)}
                          className="mt-1 text-xs text-cyan-300 hover:text-white underline font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <span>↻ Reintentar enviar mensaje</span>
                        </button>
                      )}

                      {/* Preguntas sugeridas */}
                      {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2 max-w-[85%]">
                          {msg.suggestedQuestions.map((q, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleSendMessage(q)}
                              className="text-[11px] font-semibold text-cyan-200 bg-cyan-950/80 border border-cyan-700/60 hover:bg-cyan-900 px-2.5 py-1 rounded-lg transition-colors cursor-pointer text-left"
                            >
                              💡 {q}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Indicador de escritura en curso */}
                  {isLoading && (
                    <div className="flex items-center gap-2 text-xs text-cyan-300 font-semibold bg-slate-950 border border-slate-800 rounded-2xl p-3 max-w-[75%] shadow-sm animate-pulse">
                      <Icon name="circuit" className="w-4 h-4 animate-spin text-cyan-400" />
                      <span>VoltIA está analizando el catálogo y la compatibilidad...</span>
                    </div>
                  )}

                  <div ref={chatBottomRef} />
                </div>

                {/* Input de chat */}
                <div className="bg-slate-950 p-3 sm:p-4 border-t border-slate-800 shrink-0">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                    className="flex gap-2"
                  >
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Escribe tu consulta sobre fallas, repuestos o pedidos..."
                      disabled={isLoading}
                      maxLength={500}
                      className="flex-1 rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
                    />
                    <button
                      type="submit"
                      disabled={isLoading || !inputText.trim()}
                      className="rounded-xl bg-cyan-400 hover:bg-cyan-300 disabled:opacity-40 text-slate-950 px-4 py-2.5 text-xs sm:text-sm font-black transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
                      aria-label="Enviar mensaje a VoltIA"
                    >
                      <Icon name="arrow-right" className="w-4 h-4 stroke-[3]" />
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* PESTAÑA 2: DIAGNÓSTICO RÁPIDO DETERMINISTA POR SÍNTOMAS      */}
            {/* ============================================================ */}
            {activeTab === 'sintomas' && (
              <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs sm:text-sm text-slate-200">
                {!currentDiagnosis ? (
                  <div className="space-y-3">
                    <p className="text-xs font-black uppercase tracking-wider text-cyan-300">
                      Selecciona el síntoma principal que presenta tu vehículo:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {[
                        { id: 'no-enciende', label: 'No enciende / Pantalla apagada', icon: 'zap' },
                        { id: 'perdida-potencia', label: 'Pérdida de fuerza / Aceleración lenta', icon: 'battery' },
                        { id: 'bateria-descarga-rapido', label: 'Batería se descarga rápido', icon: 'battery' },
                        { id: 'cargador-no-carga', label: 'Cargador no carga / Luz roja fija', icon: 'circuit' },
                        { id: 'fallo-intermitente', label: 'Cortes repentinos de energía', icon: 'cpu' },
                        { id: 'compatibilidad-duda', label: 'Dudas de compatibilidad', icon: 'tool' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleSymptomSelect(item.id as DiagnosticSymptom)}
                          className="flex items-center gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500 hover:bg-slate-800 text-left transition-all cursor-pointer group shadow-xs"
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-colors">
                            <Icon name={item.icon} className="w-4 h-4" />
                          </div>
                          <span className="font-bold text-white text-xs">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <h4 className="font-extrabold text-white text-sm">
                        Evaluación: {currentDiagnosis.symptom}
                      </h4>
                      <button
                        type="button"
                        onClick={() => setCurrentDiagnosis(null)}
                        className="text-xs text-cyan-300 hover:text-white underline font-bold"
                      >
                        ← Elegir otro síntoma
                      </button>
                    </div>

                    <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 space-y-3">
                      <span className="text-xs font-black text-cyan-300 block uppercase tracking-wider">
                        Causas más probables:
                      </span>
                      {currentDiagnosis.hypotheses.map((hyp, i) => (
                        <div key={i} className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white">{hyp.cause}</span>
                            <span className="text-[10px] rounded px-2 py-0.5 bg-slate-800 text-cyan-300 font-mono font-bold">
                              {hyp.probability}
                            </span>
                          </div>
                          <p className="text-slate-300 text-xs leading-relaxed">{hyp.description}</p>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-xl bg-cyan-950/60 border border-cyan-700/60 p-4 text-xs space-y-1.5">
                      <span className="font-black text-cyan-300 block text-xs uppercase tracking-wider">
                        Procedimiento recomendado:
                      </span>
                      <p className="text-slate-200 text-xs leading-relaxed">{currentDiagnosis.recommendedAction}</p>
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('chat');
                          handleSendMessage(
                            `Tengo dudas sobre el diagnóstico de «${currentDiagnosis.symptom}» para mi moto ${vehicleBrand} ${vehicleModel}.`
                          );
                        }}
                        className="w-full rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black py-2.5 text-xs transition-colors cursor-pointer shadow-md"
                      >
                        Continuar consulta en el chat conversacional →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ============================================================ */}
            {/* PESTAÑA 3: ASISTENCIA TÉCNICA HUMANA                          */}
            {/* ============================================================ */}
            {activeTab === 'humano' && (
              <div className="flex-1 overflow-y-auto p-5 text-xs sm:text-sm text-slate-200">
                {humanSubmitted ? (
                  <div className="text-center py-8 space-y-3 rounded-2xl bg-emerald-950/80 border border-emerald-700 p-6 shadow-md">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-slate-950 mx-auto shadow-sm">
                      <Icon name="check" className="w-6 h-6 stroke-[3]" />
                    </div>
                    <h4 className="font-black text-white text-base">¡Solicitud Registrada con Éxito!</h4>
                    <p className="text-xs text-slate-200 leading-relaxed max-w-sm mx-auto">
                      Un especialista técnico de NERO Electric Motors revisará los detalles y se pondrá en contacto contigo a la brevedad.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setHumanSubmitted(false);
                        setActiveTab('chat');
                      }}
                      className="rounded-xl bg-slate-900 border border-slate-700 text-white font-bold px-4 py-2 text-xs hover:bg-slate-800 transition-colors"
                    >
                      Volver al Chat
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleHumanSubmit} className="space-y-3">
                    <div>
                      <h4 className="font-black text-white text-sm">Solicitud de Asistencia Técnica Oficial</h4>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Registra tu caso para agendar atención o revisión presencial en taller autorizado.
                      </p>
                    </div>

                    {humanError && (
                      <div className="p-3 rounded-xl bg-rose-950 border border-rose-700 text-rose-200 text-xs font-semibold">
                        {humanError}
                      </div>
                    )}

                    <div>
                      <label className="text-slate-300 font-bold block mb-1">Nombre completo:</label>
                      <input
                        type="text"
                        required
                        value={humanForm.name}
                        onChange={(e) => setHumanForm({ ...humanForm, name: e.target.value })}
                        className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-white text-xs placeholder-slate-400"
                        placeholder="Ej: Andy Ortiz"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 font-bold block mb-1">Correo electrónico:</label>
                      <input
                        type="email"
                        required
                        value={humanForm.email}
                        onChange={(e) => setHumanForm({ ...humanForm, email: e.target.value })}
                        className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-white text-xs placeholder-slate-400"
                        placeholder="correo@ejemplo.com"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 font-bold block mb-1">Teléfono o WhatsApp:</label>
                      <input
                        type="tel"
                        value={humanForm.phone}
                        onChange={(e) => setHumanForm({ ...humanForm, phone: e.target.value })}
                        className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-white text-xs placeholder-slate-400"
                        placeholder="+51 987 654 321"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 font-bold block mb-1">Descripción del problema técnico:</label>
                      <textarea
                        rows={3}
                        required
                        value={humanForm.details}
                        onChange={(e) => setHumanForm({ ...humanForm, details: e.target.value })}
                        className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-white text-xs placeholder-slate-400"
                        placeholder="Indica el síntoma o repuesto que necesitas..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingHuman}
                      className="w-full rounded-xl bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 text-slate-950 font-black py-2.5 text-xs transition-colors cursor-pointer shadow-md"
                    >
                      {isSubmittingHuman ? 'Registrando solicitud...' : 'Enviar Solicitud a Taller Autorizado'}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
