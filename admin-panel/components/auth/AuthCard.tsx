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
      <div className="rounded-2xl border border-amber-500/30 bg-slate-900/95 p-6 sm:p-8 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col items-center text-center mb-6">
          <Link href="/" className="inline-block mb-3 hover:opacity-90 transition-opacity">
            <Image
              src="/branding/nero-electric-motors-optimized.png"
              alt="NeroElectric Motors — Administración"
              width={195}
              height={55}
              className="h-10 w-auto object-contain"
              priority
            />
          </Link>

          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-950/80 border border-amber-700/60 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-300 mb-3">
            <Icon name="shield" className="w-3.5 h-3.5 text-amber-400" />
            <span>Portal Administrativo Independiente</span>
          </div>

          <h1 className="text-xl font-bold tracking-tight text-white">{title}</h1>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">{subtitle}</p>
        </div>

        {children}

        {footer && (
          <div className="mt-6 pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
