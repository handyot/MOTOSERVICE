"use client";

import { useState, useMemo } from "react";
import {
  MOTORCYCLE_BRANDS,
  FEATURED_PARTS,
} from "../../lib/constants.js";
import {
  getModelsByBrand,
  findModelById,
  checkPartCompatibility,
  calculateBatteryRangeEstimate,
} from "../../lib/compatibility.js";
import {
  formatCurrency,
  formatVoltage,
  formatPower,
} from "../../lib/formatters.js";
import { Icon } from "../ui/Icons";
import { Badge } from "../ui/Badge";

export function CompatibilityWidget() {
  const [selectedBrand, setSelectedBrand] = useState("niu");
  const [selectedModelId, setSelectedModelId] = useState("niu-nqi-gt");
  const [selectedYear, setSelectedYear] = useState("");

  // Obtener modelos correspondientes a la marca seleccionada vía JavaScript
  const availableModels = useMemo(() => {
    return getModelsByBrand(selectedBrand);
  }, [selectedBrand]);

  // Modelo actualmente seleccionado
  const currentModel = useMemo(() => {
    return findModelById(selectedModelId);
  }, [selectedModelId]);

  // Manejar cambio de marca
  const handleBrandChange = (e) => {
    const brandId = e.target.value;
    setSelectedBrand(brandId);
    const models = getModelsByBrand(brandId);
    if (models.length > 0) {
      setSelectedModelId(models[0].id);
      setSelectedYear(models[0].years[0] ? String(models[0].years[0]) : "");
    } else {
      setSelectedModelId("");
      setSelectedYear("");
    }
  };

  // Manejar cambio de modelo
  const handleModelChange = (e) => {
    const modelId = e.target.value;
    setSelectedModelId(modelId);
    const model = findModelById(modelId);
    if (model && model.years && model.years.length > 0) {
      setSelectedYear(String(model.years[0]));
    }
  };

  // Repuestos evaluados con el motor de compatibilidad
  const evaluatedParts = useMemo(() => {
    if (!currentModel) return [];

    return FEATURED_PARTS.map((part) => {
      const evaluation = checkPartCompatibility(part, currentModel);
      return {
        ...part,
        evaluation,
      };
    });
  }, [currentModel]);

  // Estimado de autonomía para batería típica del modelo
  const rangeEstimate = useMemo(() => {
    if (!currentModel) return null;
    // Cálculo de ejemplo usando capacidad estándar (35Ah a su voltaje)
    return calculateBatteryRangeEstimate(currentModel.voltage, 35, currentModel.motorPowerW);
  }, [currentModel]);

  return (
    <section id="compatibilidad" className="scroll-mt-20 py-16 bg-slate-900/60 border-y border-slate-800/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <Badge variant="electric" className="mb-3">
            Motor de Diagnóstico y Compatibilidad
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Verifica la compatibilidad para tu moto
          </h2>
          <p className="mt-2 text-base text-slate-300">
            Selecciona la marca y modelo de tu moto eléctrica. Nuestro algoritmo en
            JavaScript evaluará tensiones, potencias y anclajes técnicos en tiempo real.
          </p>
        </div>

        {/* Interactive Selector Card */}
        <div className="rounded-2xl border border-cyan-500/30 bg-slate-950 p-6 sm:p-8 shadow-2xl shadow-cyan-950/40">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Step 1: Brand */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                1. Marca de la Moto
              </label>
              <select
                value={selectedBrand}
                onChange={handleBrandChange}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white font-medium focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-colors"
              >
                {MOTORCYCLE_BRANDS.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name} ({brand.country})
                  </option>
                ))}
              </select>
            </div>

            {/* Step 2: Model */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                2. Modelo
              </label>
              <select
                value={selectedModelId}
                onChange={handleModelChange}
                disabled={availableModels.length === 0}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white font-medium focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-colors disabled:opacity-50"
              >
                {availableModels.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name} — {model.voltage}V ({model.motorPowerW}W)
                  </option>
                ))}
              </select>
            </div>

            {/* Step 3: Year / Version */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                3. Año / Versión
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                disabled={!currentModel || !currentModel.years}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white font-medium focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-colors disabled:opacity-50"
              >
                {currentModel && currentModel.years ? (
                  currentModel.years.map((year) => (
                    <option key={year} value={year}>
                      Año {year}
                    </option>
                  ))
                ) : (
                  <option value="">No disponible</option>
                )}
              </select>
            </div>
          </div>

          {/* Technical Specs Diagnostic Strip */}
          {currentModel && (
            <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900/80 p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                    <Icon name="zap" className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      Ficha Técnica: {currentModel.name}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Parámetros eléctricos para coincidencia de repuestos
                    </p>
                  </div>
                </div>

                <Badge variant="success" className="px-3 py-1">
                  Perfil Activo para Filtro
                </Badge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                <div className="bg-slate-950/60 rounded-lg p-2.5 border border-slate-800/80">
                  <span className="text-[11px] text-slate-400 block">Voltaje Nominal</span>
                  <span className="font-bold text-cyan-400 text-base">
                    {formatVoltage(currentModel.voltage)}
                  </span>
                </div>
                <div className="bg-slate-950/60 rounded-lg p-2.5 border border-slate-800/80">
                  <span className="text-[11px] text-slate-400 block">Potencia de Motor</span>
                  <span className="font-bold text-white text-base">
                    {formatPower(currentModel.motorPowerW)}
                  </span>
                </div>
                <div className="bg-slate-950/60 rounded-lg p-2.5 border border-slate-800/80">
                  <span className="text-[11px] text-slate-400 block">Tipo Batería</span>
                  <span className="font-semibold text-slate-200">
                    {currentModel.batteryType}
                  </span>
                </div>
                <div className="bg-slate-950/60 rounded-lg p-2.5 border border-slate-800/80">
                  <span className="text-[11px] text-slate-400 block">Autonomía Est. (35Ah)</span>
                  <span className="font-bold text-emerald-400 text-base">
                    {rangeEstimate ? `${rangeEstimate.minKm} - ${rangeEstimate.maxKm} km` : "N/D"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Results: Compatible Parts */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Icon name="check" className="w-5 h-5 text-cyan-400" />
                Repuestos evaluados para {currentModel ? currentModel.name : "tu moto"}
              </h3>
              <span className="text-xs text-slate-400">
                Mostrando {evaluatedParts.length} repuestos
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {evaluatedParts.map((part) => {
                const isVerified = part.evaluation.status === "verified";
                const requiresAdapt = part.evaluation.status === "requires_adaptation";

                return (
                  <div
                    key={part.id}
                    className={`rounded-xl border p-4 flex flex-col justify-between transition-all ${
                      isVerified
                        ? "border-emerald-500/40 bg-slate-900/60 hover:border-emerald-400/80"
                        : requiresAdapt
                        ? "border-amber-500/40 bg-slate-900/40 hover:border-amber-400/80"
                        : "border-slate-800 bg-slate-950/60 opacity-60"
                    }`}
                  >
                    <div>
                      {/* Status header */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[11px] font-mono text-slate-500">
                          {part.sku}
                        </span>
                        {isVerified && (
                          <Badge variant="success">✓ 100% Compatible</Badge>
                        )}
                        {requiresAdapt && (
                          <Badge variant="warning">⚡ Requiere Adaptación</Badge>
                        )}
                        {!isVerified && !requiresAdapt && (
                          <Badge variant="danger">✕ Incompatible</Badge>
                        )}
                      </div>

                      <h4 className="font-bold text-white text-base leading-snug line-clamp-2">
                        {part.name}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        {part.shortDescription}
                      </p>

                      {/* Technical Specs tags */}
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {part.voltage && (
                          <span className="rounded bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-cyan-300">
                            {formatVoltage(part.voltage)}
                          </span>
                        )}
                        {part.powerW && (
                          <span className="rounded bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-300">
                            {formatPower(part.powerW)}
                          </span>
                        )}
                        {part.capacityAh && (
                          <span className="rounded bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-300">
                            {part.capacityAh} Ah
                          </span>
                        )}
                        <span className="rounded bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-emerald-400">
                          {part.warrantyMonths} meses gta.
                        </span>
                      </div>

                      {/* Technical message from JS compatibility engine */}
                      <div className="mt-3 rounded-lg bg-slate-950/80 p-2.5 text-xs text-slate-300 border border-slate-800/80">
                        <p className="font-medium">{part.evaluation.message}</p>
                        {part.evaluation.notes.length > 0 && (
                          <p className="text-[11px] text-slate-400 mt-1">
                            ℹ {part.evaluation.notes[0]}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Price and action */}
                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase text-slate-500 block">
                          Precio Referencial
                        </span>
                        <span className="text-lg font-black text-cyan-400">
                          {formatCurrency(part.price, part.currency)}
                        </span>
                      </div>

                      <a
                        href="#asesoria"
                        className="rounded-lg bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 px-3 py-1.5 text-xs font-bold text-white transition-colors"
                      >
                        Consultar
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
