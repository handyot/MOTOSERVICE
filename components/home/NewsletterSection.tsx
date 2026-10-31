'use client';

import React, { useState } from 'react';
import { Mail, Info, Zap, ArrowRight } from 'lucide-react';

export function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  return (
    <section className="py-16 bg-slate-50 border-b border-gray-200 text-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-3 border border-blue-200">
            <Zap className="w-3.5 h-3.5" />
            <span>Guías Técnicas y Novedades</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2 text-gray-900">
            Red Técnica NeroElectric Motors
          </h2>

          <p className="text-gray-600 text-xs sm:text-sm mb-6 max-w-xl mx-auto">
            Publicación periódica de tablas de compatibilidad para baterías LiFePO4, conexionado de controladores senoidales y novedades de repuestos homologados.
          </p>

          {submitted ? (
            <div className="p-4 rounded-xl bg-white border border-gray-200 text-gray-700 flex items-start sm:items-center justify-center gap-2.5 text-xs max-w-md mx-auto text-left shadow-xs">
              <Info className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Suscripción registrada. Puedes consultar libremente todas las fichas técnicas y repuestos en el catálogo.
              </span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5 max-w-md mx-auto">
              <div className="relative flex-1">
                <input
                  type="email"
                  required
                  placeholder="Ingresa tu correo electrónico..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3.5 py-2.5 pl-9 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-all"
                />
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              </div>
              <button
                type="submit"
                className="py-2.5 px-5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                <span>Notificarme</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

          <p className="text-[11px] text-gray-400 mt-3">
            Canal de información técnica. Sin envío de correos no solicitados.
          </p>

        </div>
      </div>
    </section>
  );
}
