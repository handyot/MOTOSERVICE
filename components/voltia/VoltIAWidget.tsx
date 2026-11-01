'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Icon } from '../ui/Icons';
import { Badge } from '../ui/Badge';
import { useCart } from '@/lib/cart/cart-context';
import {
  DiagnosticSymptom,
  VoltIADiagnosisResult,
  VoltIARecommendedPart,
} from '@/types';
import { executeDiagnosticEvaluation } from '@/lib/voltia/voltia-engine';

export function VoltIAWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [vehicleBrand, setVehicleBrand] = useState('TAILG');
  const [vehicleModel, setVehicleModel] = useState('');
  const [currentDiagnosis, setCurrentDiagnosis] = useState<VoltIADiagnosisResult | null>(null);
  const [isRequestingHuman, setIsRequestingHuman] = useState(false);
  const [humanForm, setHumanForm] = useState({ name: '', email: '', phone: '', details: '' });
  const [humanSubmitted, setHumanSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const { addItem } = useCart();

  const handleSymptomSelect = (symptom: DiagnosticSymptom) => {
    const result = executeDiagnosticEvaluation({
      symptom,
      brand: vehicleBrand,
      model: vehicleModel || 'Modelo general',
      userInput: inputText,
    });
    setCurrentDiagnosis(result);
    setFeedbackMsg(null);
  };

  const handleFreeTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    // Detectar síntoma o riesgo en base al texto libre
    const lower = inputText.toLowerCase();
    let symptom: DiagnosticSymptom = 'compatibilidad-duda';

    if (lower.includes('enciende') || lower.includes('prende') || lower.includes('muerta')) {
      symptom = 'no-enciende';
    } else if (lower.includes('potencia') || lower.includes('fuerza') || lower.includes('lenta') || lower.includes('tiron')) {
      symptom = 'perdida-potencia';
    } else if (lower.includes('descarga') || lower.includes('autonomia') || lower.includes('dura poco') || lower.includes('bateria')) {
      symptom = 'bateria-descarga-rapido';
    } else if (lower.includes('cargador') || lower.includes('carga') || lower.includes('enchufe')) {
      symptom = 'cargador-no-carga';
    } else if (lower.includes('corte') || lower.includes('apaga') || lower.includes('intermitente')) {
      symptom = 'fallo-intermitente';
    }

    const result = executeDiagnosticEvaluation({
      symptom,
      brand: vehicleBrand,
      model: vehicleModel || 'Consulta directa',
      userInput: inputText,
    });

    setCurrentDiagnosis(result);
    setInputText('');
    setFeedbackMsg(null);
  };

  const handleAddToCart = (part: VoltIARecommendedPart) => {
    const res = addItem({
      id: part.sku,
      sku: part.sku,
      name: part.name,
      price: part.price,
      currency: part.currency,
      categoryName: part.category,
      isDirectSale: part.isDirectSale,
      stockAvailable: part.inStock ? 10 : 0,
    });

    setFeedbackMsg(res.message || 'Producto añadido al carrito');
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const handleHumanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/voltia/asistencia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactName: humanForm.name,
          contactEmail: humanForm.email,
          contactPhone: humanForm.phone,
          requestType: currentDiagnosis?.safetyAlert ? 'riesgo_electrico' : 'diagnostico_no_concluyente',
          description: humanForm.details || currentDiagnosis?.symptom || 'Solicitud de asistencia técnica',
          technicalDetails: {
            brand: vehicleBrand,
            model: vehicleModel,
            diagnosisSummary: currentDiagnosis,
          },
        }),
      });

      if (res.ok) {
        setHumanSubmitted(true);
      }
    } catch (err) {
      console.error('Error enviando asistencia:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Botón flotante siempre visible */}
      <aside aria-label="Asistente VoltIA" className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-controls="voltia-dialog-panel"
          className="group relative flex items-center gap-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 text-slate-950 font-bold shadow-2xl shadow-cyan-500/40 hover:scale-105 active:scale-95 transition-all"
          aria-label="Abrir asistente técnico VoltIA"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-950 text-cyan-400">
            <Icon name="zap" className="h-5 w-5 animate-pulse" />
          </div>
          <span className="hidden sm:inline text-sm font-black tracking-wide text-white">
            Asistente <span className="text-cyan-200">VoltIA</span>
          </span>
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
          </span>
        </button>
      </aside>

      {/* Panel / Modal de VoltIA */}
      {isOpen && (
        <div id="voltia-dialog-panel" role="region" aria-label="Ventana de asistente VoltIA" className="fixed inset-0 z-50 flex items-end sm:items-center justify-end p-0 sm:p-6 bg-slate-950/60 backdrop-blur-sm">
          <div className="relative w-full sm:max-w-xl max-h-[90vh] flex flex-col rounded-t-3xl sm:rounded-3xl border border-cyan-800/40 bg-slate-900 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-6">

            {/* Header */}
            <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950 px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400">
                  <Icon name="circuit" className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-white tracking-wide text-base">VoltIA</h3>
                    <span className="rounded bg-cyan-950 px-1.5 py-0.5 text-[9px] font-bold text-cyan-400 border border-cyan-800">
                      Asistente Técnico EV
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Diagnóstico de averías y compatibilidad en motos eléctricas
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                aria-label="Cerrar VoltIA"
              >
                <Icon name="x" className="w-5 h-5" />
              </button>
            </div>

            {/* Notificación de feedback */}
            {feedbackMsg && (
              <div className="bg-emerald-950/90 border-b border-emerald-800 px-4 py-2 text-xs text-emerald-200 font-medium flex items-center justify-between">
                <span>{feedbackMsg}</span>
                <Link href="/carrito" className="underline font-bold text-emerald-400 hover:text-white">
                  Ver Carrito
                </Link>
              </div>
            )}

            {/* Contenido desplazable */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-sm text-slate-200">

              {/* Información preliminar del vehículo */}
              <div className="rounded-xl bg-slate-950/80 p-3 border border-slate-800/80 flex flex-wrap gap-2 items-center text-xs">
                <span className="text-slate-400 font-medium">Tu moto:</span>
                <select
                  value={vehicleBrand}
                  onChange={(e) => setVehicleBrand(e.target.value)}
                  className="rounded bg-slate-900 border border-slate-700 px-2 py-1 text-white font-semibold"
                >
                  <option value="TAILG">TAILG</option>
                  <option value="YADEA">YADEA</option>
                  <option value="KAYENCORP">KAYENCORP</option>
                  <option value="GREENLINE">GREENLINE</option>
                  <option value="NIU">NIU</option>
                  <option value="SUPER_SOCO">Super Soco</option>
                  <option value="OTRA">Otra / Multimarca</option>
                </select>

                <input
                  type="text"
                  placeholder="Modelo (ej: Lion, G5, T6)"
                  value={vehicleModel}
                  onChange={(e) => setVehicleModel(e.target.value)}
                  className="rounded bg-slate-900 border border-slate-700 px-2 py-1 text-white flex-1 min-w-[120px]"
                />
              </div>

              {/* Botones de Síntomas Frecuentes */}
              {!currentDiagnosis && !isRequestingHuman && (
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                    ¿Qué problema experimenta tu vehículo?
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      onClick={() => handleSymptomSelect('no-enciende')}
                      className="text-left rounded-xl border border-slate-800 bg-slate-950/60 p-3 hover:border-cyan-500/60 hover:bg-slate-900 transition-all group"
                    >
                      <div className="flex items-center gap-2 font-bold text-white group-hover:text-cyan-400 text-xs">
                        <Icon name="alert-circle" className="w-4 h-4 text-cyan-400" />
                        La moto no enciende
                      </div>
                      <span className="text-[11px] text-slate-400 block mt-1">
                        Tablero apagado o disyuntor disparado.
                      </span>
                    </button>

                    <button
                      onClick={() => handleSymptomSelect('perdida-potencia')}
                      className="text-left rounded-xl border border-slate-800 bg-slate-950/60 p-3 hover:border-cyan-500/60 hover:bg-slate-900 transition-all group"
                    >
                      <div className="flex items-center gap-2 font-bold text-white group-hover:text-cyan-400 text-xs">
                        <Icon name="zap" className="w-4 h-4 text-cyan-400" />
                        Pérdida de potencia
                      </div>
                      <span className="text-[11px] text-slate-400 block mt-1">
                        Tirones, cortes al acelerar o baja velocidad.
                      </span>
                    </button>

                    <button
                      onClick={() => handleSymptomSelect('bateria-descarga-rapido')}
                      className="text-left rounded-xl border border-slate-800 bg-slate-950/60 p-3 hover:border-cyan-500/60 hover:bg-slate-900 transition-all group"
                    >
                      <div className="flex items-center gap-2 font-bold text-white group-hover:text-cyan-400 text-xs">
                        <Icon name="battery" className="w-4 h-4 text-cyan-400" />
                        Batería se descarga rápido
                      </div>
                      <span className="text-[11px] text-slate-400 block mt-1">
                        Poca autonomía o corte repentino de energía.
                      </span>
                    </button>

                    <button
                      onClick={() => handleSymptomSelect('cargador-no-carga')}
                      className="text-left rounded-xl border border-slate-800 bg-slate-950/60 p-3 hover:border-cyan-500/60 hover:bg-slate-900 transition-all group"
                    >
                      <div className="flex items-center gap-2 font-bold text-white group-hover:text-cyan-400 text-xs">
                        <Icon name="check-circle" className="w-4 h-4 text-cyan-400" />
                        Cargador no carga
                      </div>
                      <span className="text-[11px] text-slate-400 block mt-1">
                        Luz verde fija, no arranca o fusible abierto.
                      </span>
                    </button>

                    <button
                      onClick={() => handleSymptomSelect('fallo-intermitente')}
                      className="text-left rounded-xl border border-slate-800 bg-slate-950/60 p-3 hover:border-cyan-500/60 hover:bg-slate-900 transition-all group"
                    >
                      <div className="flex items-center gap-2 font-bold text-white group-hover:text-cyan-400 text-xs">
                        <Icon name="tool" className="w-4 h-4 text-cyan-400" />
                        Fallos intermitentes
                      </div>
                      <span className="text-[11px] text-slate-400 block mt-1">
                        Cortes en baches o microswitch de freno pegado.
                      </span>
                    </button>

                    <button
                      onClick={() => handleSymptomSelect('compatibilidad-duda')}
                      className="text-left rounded-xl border border-slate-800 bg-slate-950/60 p-3 hover:border-cyan-500/60 hover:bg-slate-900 transition-all group"
                    >
                      <div className="flex items-center gap-2 font-bold text-white group-hover:text-cyan-400 text-xs">
                        <Icon name="search" className="w-4 h-4 text-cyan-400" />
                        ¿Qué repuesto me sirve?
                      </div>
                      <span className="text-[11px] text-slate-400 block mt-1">
                        Compatibilidad por voltaje, BMS o controlador.
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* Resultado del Diagnóstico Técnico */}
              {currentDiagnosis && !isRequestingHuman && (
                <div className="space-y-4 animate-in fade-in">

                  {/* ALERTA DE RIESGO ELÉCTRICO CRÍTICO */}
                  {currentDiagnosis.safetyAlert && (
                    <div className="rounded-2xl border-2 border-rose-600 bg-rose-950/80 p-4 text-rose-100 space-y-3">
                      <div className="flex items-center gap-2 font-black text-rose-300 text-sm">
                        <Icon name="alert-circle" className="w-6 h-6 text-rose-400 shrink-0" />
                        {currentDiagnosis.safetyAlert.title}
                      </div>
                      <p className="text-xs leading-relaxed text-rose-200">
                        {currentDiagnosis.safetyAlert.warning}
                      </p>
                      <div className="bg-rose-900/40 rounded-xl p-3 border border-rose-800/60 space-y-1.5 text-[11px]">
                        <p className="font-bold text-white">Instrucciones de seguridad obligatorias:</p>
                        {currentDiagnosis.safetyAlert.immediateActions.map((act, idx) => (
                          <div key={idx} className="flex items-start gap-1.5 text-rose-200">
                            <span>•</span>
                            <span>{act}</span>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => setIsRequestingHuman(true)}
                        className="w-full rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold py-2.5 text-xs transition-colors"
                      >
                        🚨 Solicitar Contacto de Emergencia Técnica
                      </button>
                    </div>
                  )}

                  {/* Ficha Diagnóstica Estructurada */}
                  <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Evaluación Técnica
                      </span>
                      <Badge
                        variant={
                          currentDiagnosis.certainty === 'CONFIRMADO'
                            ? 'electric'
                            : currentDiagnosis.certainty === 'PROBABLE'
                            ? 'default'
                            : 'neutral'
                        }
                      >
                        Certeza: {currentDiagnosis.certainty}
                      </Badge>
                    </div>

                    <h4 className="text-sm font-bold text-white">
                      {currentDiagnosis.symptom}
                    </h4>

                    {/* Hipótesis */}
                    <div className="space-y-2">
                      <span className="text-[11px] font-semibold text-cyan-400 block">
                        Causas más probables analizadas:
                      </span>
                      {currentDiagnosis.hypotheses.map((hyp, i) => (
                        <div
                          key={i}
                          className="rounded-lg bg-slate-900/80 p-2.5 border border-slate-800 text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-200">{hyp.cause}</span>
                            <span className="text-[10px] rounded px-1.5 py-0.5 bg-slate-800 text-cyan-300 font-mono">
                              Prob: {hyp.probability}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            {hyp.description}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Acción recomendada */}
                    <div className="rounded-xl bg-cyan-950/30 border border-cyan-800/40 p-3 text-xs space-y-1">
                      <span className="font-bold text-cyan-400 block">
                        Procedimiento seguro recomendado:
                      </span>
                      <p className="text-slate-300 text-[11px] leading-relaxed">
                        {currentDiagnosis.recommendedAction}
                      </p>
                    </div>

                    {/* Alerta de Adaptación en Taller Autorizado (Modelo sin repuestos directos) */}
                    {currentDiagnosis.adaptationNotice && (
                      <div className="rounded-xl bg-amber-950/40 border border-amber-500/50 p-3 text-xs space-y-2">
                        <div className="flex items-start gap-2">
                          <span className="text-base leading-none">🛠️</span>
                          <div>
                            <h5 className="font-bold text-amber-300 text-xs">
                              {currentDiagnosis.adaptationNotice.title}
                            </h5>
                            <p className="text-slate-300 text-[11px] leading-relaxed mt-1">
                              {currentDiagnosis.adaptationNotice.description}
                            </p>
                          </div>
                        </div>

                        {currentDiagnosis.adaptationNotice.suggestedModifications.length > 0 && (
                          <div className="bg-slate-900/80 rounded-lg p-2.5 border border-amber-900/40">
                            <span className="text-[10px] uppercase font-bold text-amber-400 block mb-1">
                              Modificaciones requeridas en taller autorizado:
                            </span>
                            <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-300">
                              {currentDiagnosis.adaptationNotice.suggestedModifications.map((mod, idx) => (
                                <li key={idx}>{mod}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="pt-1 space-y-2">
                          <p className="text-[10px] text-amber-200/80 italic">
                            {currentDiagnosis.adaptationNotice.workshopRecommendation}
                          </p>
                          <a
                            href={`https://wa.me/51987654321?text=${encodeURIComponent(
                              `Hola MotoService, deseo agendar una modificación y adaptación técnica en taller autorizado para mi moto ${currentDiagnosis.reportedVehicle || ''}. Diagnóstico VoltIA: ${currentDiagnosis.symptom}`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2 text-xs transition-colors"
                          >
                            <span>🔧 Agendar Modificación en Taller Autorizado</span>
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Repuestos recomendados con acción directa de compra */}
                    {currentDiagnosis.recommendedParts.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-slate-800">
                        <span className="text-xs font-bold text-white block">
                          {currentDiagnosis.adaptationNotice
                            ? 'Repuestos de tracción compatibles mediante adaptación en taller:'
                            : 'Repuestos compatibles de venta directa:'}
                        </span>
                        {currentDiagnosis.recommendedParts.map((part) => (
                          <div
                            key={part.sku}
                            className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 space-y-2"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className="text-[10px] font-mono text-cyan-400 block">
                                  SKU: {part.sku}
                                </span>
                                <h5 className="font-bold text-xs text-white leading-snug">
                                  {part.name}
                                </h5>
                              </div>
                              <span className="text-xs font-black text-cyan-400 shrink-0">
                                S/ {part.price.toFixed(2)}
                              </span>
                            </div>

                            {part.workshopModificationRequired && (
                              <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-[10px] text-amber-300 font-semibold">
                                <span>⚠️</span>
                                <span>Requiere modificación en taller autorizado</span>
                              </div>
                            )}

                            <p className="text-[11px] text-slate-400 leading-relaxed">
                              {part.rationale}
                            </p>

                            {part.workshopNotes && (
                              <p className="text-[10px] text-slate-400 italic">
                                {part.workshopNotes}
                              </p>
                            )}

                            <div className="flex items-center gap-2 pt-1">
                              <button
                                onClick={() => handleAddToCart(part)}
                                className="flex-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-1.5 text-xs transition-colors flex items-center justify-center gap-1.5"
                              >
                                <Icon name="cart" className="w-3.5 h-3.5" />
                                Añadir al Carrito
                              </button>
                              <a
                                href="#catalogo"
                                onClick={() => setIsOpen(false)}
                                className="rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium px-3 py-1.5 text-xs transition-colors"
                              >
                                Ver Ficha
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Acciones de pie */}
                    <div className="flex items-center gap-2 pt-2">
                      <button
                        onClick={() => setCurrentDiagnosis(null)}
                        className="text-xs text-slate-400 hover:text-white underline py-1"
                      >
                        ← Consultar otro síntoma
                      </button>
                      <button
                        onClick={() => setIsRequestingHuman(true)}
                        className="ml-auto rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 text-xs text-cyan-300 font-semibold"
                      >
                        Contactar a un técnico
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Formulario de derivación técnica humana */}
              {isRequestingHuman && (
                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-white text-xs">
                      Solicitud de Asistencia Técnica MotoService
                    </h4>
                    <button
                      onClick={() => setIsRequestingHuman(false)}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      Volver
                    </button>
                  </div>

                  {humanSubmitted ? (
                    <div className="rounded-xl bg-emerald-950/60 border border-emerald-800 p-4 text-center space-y-2">
                      <Icon name="check-circle" className="w-8 h-8 text-emerald-400 mx-auto" />
                      <p className="font-bold text-white text-xs">¡Solicitud recibida!</p>
                      <p className="text-[11px] text-slate-300">
                        Un especialista en tracción eléctrica revisará tu caso y te contactará a la brevedad.
                      </p>
                      <button
                        onClick={() => {
                          setIsRequestingHuman(false);
                          setHumanSubmitted(false);
                        }}
                        className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs text-white"
                      >
                        Cerrar
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleHumanSubmit} className="space-y-2 text-xs">
                      <div>
                        <label className="text-slate-400 block mb-1">Nombre completo:</label>
                        <input
                          type="text"
                          required
                          value={humanForm.name}
                          onChange={(e) => setHumanForm({ ...humanForm, name: e.target.value })}
                          className="w-full rounded-lg bg-slate-900 border border-slate-800 px-3 py-1.5 text-white"
                          placeholder="Tu nombre"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1">Correo electrónico:</label>
                        <input
                          type="email"
                          required
                          value={humanForm.email}
                          onChange={(e) => setHumanForm({ ...humanForm, email: e.target.value })}
                          className="w-full rounded-lg bg-slate-900 border border-slate-800 px-3 py-1.5 text-white"
                          placeholder="correo@ejemplo.com"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1">Teléfono o WhatsApp:</label>
                        <input
                          type="tel"
                          value={humanForm.phone}
                          onChange={(e) => setHumanForm({ ...humanForm, phone: e.target.value })}
                          className="w-full rounded-lg bg-slate-900 border border-slate-800 px-3 py-1.5 text-white"
                          placeholder="999 999 999"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1">Detalles del problema:</label>
                        <textarea
                          rows={3}
                          value={humanForm.details}
                          onChange={(e) => setHumanForm({ ...humanForm, details: e.target.value })}
                          className="w-full rounded-lg bg-slate-900 border border-slate-800 px-3 py-1.5 text-white"
                          placeholder="Describe lo que le ocurre a la moto o pieza que buscas..."
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold py-2 mt-1"
                      >
                        {isSubmitting ? 'Enviando solicitud...' : 'Enviar Solicitud a Taller'}
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>

            {/* Input abierto en el pie */}
            <div className="bg-slate-950 p-3 border-t border-slate-800">
              <form onSubmit={handleFreeTextSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Describe qué le pasa a tu moto o qué repuesto buscas..."
                  className="flex-1 rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-3.5 py-2 text-xs font-bold transition-colors flex items-center gap-1"
                >
                  <Icon name="arrow-right" className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
