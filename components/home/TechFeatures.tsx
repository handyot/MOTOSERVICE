import React from 'react';
import {
  ShieldCheck,
  Cpu,
  BatteryCharging,
  Activity,
  Truck,
  Award
} from 'lucide-react';

export function TechFeatures() {
  const features = [
    {
      icon: <BatteryCharging className="w-5 h-5 text-emerald-600" />,
      title: 'Química y Voltaje Documentados',
      description: 'Identificamos la química de batería (LiFePO4, Grafeno, Plomo-Ácido) y tensión nominal declarada por el fabricante para evitar incompatibilidades.',
    },
    {
      icon: <Activity className="w-5 h-5 text-blue-600" />,
      title: 'Tolerancia Eléctrica y Potencia',
      description: 'Cotejamos límites de tensión, corte por bajo voltaje y amperaje continuo entre batería y controlador según especificaciones técnicas oficiales.',
    },
    {
      icon: <Cpu className="w-5 h-5 text-blue-600" />,
      title: 'Protección y Controladores FOC',
      description: 'Documentamos especificaciones de controladores BLDC/FOC y sistemas de gestión de batería (BMS) para proteger la electrónica de potencia.',
    },
    {
      icon: <Award className="w-5 h-5 text-emerald-600" />,
      title: 'Políticas de Proveedor Oficial',
      description: 'Registramos y transparentamos las condiciones comerciales, stock referencial y garantías publicadas por los distribuidores autorizados.',
    },
    {
      icon: <Truck className="w-5 h-5 text-gray-700" />,
      title: 'Verificación Física de Conectores',
      description: 'Alertamos sobre variantes de puertos de carga y conectores de potencia (Anderson, Chogori, terminales) antes de confirmar compatibilidad.',
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-emerald-600" />,
      title: 'Asistencia y Dimensionamiento',
      description: 'Orientamos en la interpretación de fichas técnicas, cálculo de consumo estimado y compatibilidad mecánica de repuestos para motos eléctricas.',
    },
  ];

  return (
    <section className="py-16 bg-slate-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Título de Sección */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2 border border-blue-200">
            <span>Criterios de Verificación Técnica</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Metodología de Validación NeroElectric Motors
          </h2>
          <p className="text-gray-600 text-xs sm:text-sm mt-2">
            Priorizamos la precisión técnica y la trazabilidad de fuentes oficiales para proteger los componentes de tu vehículo eléctrico.
          </p>
        </div>

        {/* Grilla de Características */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((item, idx) => (
            <div
              key={idx}
              className="p-5 rounded-xl bg-white border border-gray-200 hover:border-gray-300 hover:shadow-xs transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center mb-3.5">
                {item.icon}
              </div>
              <h3 className="text-sm font-bold text-gray-900 mb-1.5">
                {item.title}
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
