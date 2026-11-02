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
      className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 active:bg-cyan-500 text-slate-950 font-black px-5 py-3 text-xs sm:text-sm transition-all duration-200 cursor-pointer shadow-md hover:shadow-cyan-400/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 shrink-0"
      aria-label="Abrir asistente VoltIA para consultar sobre el pedido"
    >
      <Icon name="circuit" className="w-4 h-4 text-slate-950 stroke-[2.5]" />
      <span>Consultar a VoltIA</span>
    </button>
  );
}
