import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Icon } from '../ui/Icons';

interface AuthCardProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="rounded-2xl border border-slate-200 bg-white shadow-lg overflow-hidden">
        {/* Cabecera Estructural Azul Marino */}
        <div className="bg-[#0B1528] px-6 py-6 text-center border-b border-slate-800">
          <Link href="/" className="inline-flex items-center justify-center mb-3 hover:opacity-95 transition-opacity">
            <Image
              src="/branding/nero-electric-motors-optimized.png"
              alt="NeroElectric Motors — ERP Administrativo"
              width={185}
              height={52}
              className="h-10 w-auto object-contain"
              priority
            />
          </Link>

          <div className="mt-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 border border-amber-400/40 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-400">
              <Icon name="shield" className="w-3.5 h-3.5 text-amber-400" />
              <span>ERP Comercial y Técnico</span>
            </span>
          </div>
        </div>

        {/* Cuerpo de Formulario en Superficie Blanca */}
        <div className="p-6 sm:p-8">
          <div className="mb-6 text-center">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
              {title}
            </h1>
            <p className="text-xs text-slate-600 mt-1">{subtitle}</p>
          </div>

          {children}

          {footer && (
            <div className="mt-6 pt-5 border-t border-slate-200 text-center text-xs text-slate-600">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
