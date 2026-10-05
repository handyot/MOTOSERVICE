"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "../ui/Icons";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <Icon name="zap" className="h-6 w-6 text-slate-950" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-wider text-white">
                MOTO<span className="text-cyan-400">SERVICE</span>
              </span>
              <span className="rounded bg-cyan-950 px-1.5 py-0.5 text-[10px] font-bold text-cyan-400 border border-cyan-800/60 uppercase">
                EV Parts
              </span>
            </div>
            <span className="text-[11px] text-slate-400 hidden sm:block">
              Repuestos y soluciones para tu moto eléctrica
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="#compatibilidad"
            className="text-sm font-medium text-slate-300 hover:text-cyan-400 transition-colors flex items-center gap-1.5"
          >
            <Icon name="check-circle" className="w-4 h-4 text-cyan-400" />
            Verificador de Compatibilidad
          </Link>
          <Link
            href="#categorias"
            className="text-sm font-medium text-slate-300 hover:text-cyan-400 transition-colors"
          >
            Categorías
          </Link>
          <Link
            href="#catalogo"
            className="text-sm font-medium text-slate-300 hover:text-cyan-400 transition-colors"
          >
            Repuestos Destacados
          </Link>
          <Link
            href="#asesoria"
            className="text-sm font-medium text-slate-300 hover:text-cyan-400 transition-colors"
          >
            Asesoría Especializada
          </Link>
        </nav>

        {/* Action Button & Contact */}
        <div className="hidden lg:flex items-center gap-4">
          <a
            href="#compatibilidad"
            className="rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-sm font-bold text-slate-950 shadow-md shadow-cyan-500/20 hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
          >
            <Icon name="filter" className="w-4 h-4 text-slate-950" />
            Validar mi Moto
          </a>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden rounded-lg p-2 text-slate-400 hover:bg-slate-900 hover:text-white transition-colors"
          aria-label="Abrir menú"
        >
          <Icon name={mobileMenuOpen ? "x" : "menu"} className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-950/95 px-4 pt-3 pb-6 space-y-3">
          <Link
            href="#compatibilidad"
            onClick={() => setMobileMenuOpen(false)}
            className="block rounded-lg px-3 py-2 text-base font-medium text-cyan-400 bg-cyan-950/40 border border-cyan-900/40"
          >
            ⚡ Verificador de Compatibilidad
          </Link>
          <Link
            href="#categorias"
            onClick={() => setMobileMenuOpen(false)}
            className="block rounded-lg px-3 py-2 text-base font-medium text-slate-300 hover:bg-slate-900"
          >
            Categorías
          </Link>
          <Link
            href="#catalogo"
            onClick={() => setMobileMenuOpen(false)}
            className="block rounded-lg px-3 py-2 text-base font-medium text-slate-300 hover:bg-slate-900"
          >
            Repuestos Destacados
          </Link>
          <Link
            href="#asesoria"
            onClick={() => setMobileMenuOpen(false)}
            className="block rounded-lg px-3 py-2 text-base font-medium text-slate-300 hover:bg-slate-900"
          >
            Asesoría Especializada
          </Link>
          <div className="pt-2">
            <a
              href="#compatibilidad"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center block rounded-lg bg-cyan-500 py-2.5 font-bold text-slate-950 shadow-md shadow-cyan-500/20"
            >
              Validar Repuesto para mi Moto
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
