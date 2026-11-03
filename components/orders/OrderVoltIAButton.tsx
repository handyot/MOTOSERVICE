'use client';

import React from 'react';
import { openVoltIAChat } from '@/components/voltia/VoltIAWidget';
import { Icon } from '@/components/ui/Icons';

interface OrderVoltIAButtonProps {
  orderNumber: string;
  itemsSummary?: string;
}

export function OrderVoltIAButton({ orderNumber, itemsSummary }: OrderVoltIAButtonProps) {
  const handleConsultVoltIA = () => {
    const prompt = `Hola VoltIA, tengo una consulta sobre la instalación y compatibilidad de mi pedido ${orderNumber}${
      itemsSummary ? ` con los productos: ${itemsSummary}` : ''
    }.`;
    openVoltIAChat({ prompt });
  };

  return (
    <button
      type="button"
      onClick={handleConsultVoltIA}
      className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 active:bg-cyan-500 text-slate-950 font-black px-6 py-3.5 text-sm transition-all duration-200 cursor-pointer shadow-lg hover:shadow-cyan-400/30 ring-2 ring-cyan-200/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 shrink-0"
      aria-label="Abrir asistente VoltIA para consultar sobre el pedido"
    >
      <Icon name="circuit" className="w-5 h-5 text-slate-950 stroke-[2.5]" />
      <span className="tracking-wide">Consultar a VoltIA</span>
    </button>
  );
}
