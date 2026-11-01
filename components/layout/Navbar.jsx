"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Icon } from "../ui/Icons";
import { useCart } from "../../lib/cart/cart-context";

export function Navbar() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { totalCount, isLoaded } = useCart();
  const mountedCount = isLoaded ? totalCount : 0;

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const target = document.getElementById("catalogo") || document.getElementById("catalogo-ecomoto");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    } else {
      router.push(`/#catalogo?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200/80 bg-white">
      <div className="mx-auto flex max-w-[1560px] items-center justify-between px-6 sm:px-8 lg:px-12 py-3.5 gap-4">

        {/* Logo Oficial NeroElectric Motors integrado directamente */}
        <Link href="/" className="flex items-center shrink-0">
          <Image
            src="/branding/nero-electric-motors-optimized.png"
            alt="NeroElectric Motors — Repuestos y Soluciones para Motos Eléctricas"
            width={195}
            height={55}
            priority
            className="h-8 sm:h-9 md:h-10 w-auto object-contain"
          />
        </Link>

        {/* Buscador de repuestos central para escritorio */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-2">
          <div className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por repuesto, código, voltaje o modelo..."
              className="w-full rounded-lg bg-gray-50/90 border border-gray-200 pl-4 pr-10 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-1 focus:ring-blue-600 transition-all"
            />
            <button
              type="submit"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
              title="Buscar"
            >
              <Icon name="search" className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Navegación de escritorio */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-gray-700">
          <Link
            href="/#catalogo"
            className="hover:text-blue-600 transition-colors"
          >
            Repuestos
          </Link>
          <Link
            href="/#catalogo-ecomoto"
            className="hover:text-blue-600 transition-colors"
          >
            Motos
          </Link>
          <Link
            href="/#compatibilidad"
            className="hover:text-blue-600 transition-colors"
          >
            Compatibilidad
          </Link>
          <a
            href="https://wa.me/51999999999?text=Hola%20NeroElectric%20Motors,%20necesito%20asesor%C3%ADa%20para%20un%20repuesto%20de%20moto%20el%C3%A9ctrica"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-700 hover:text-emerald-800 transition-colors flex items-center gap-1.5 font-semibold"
          >
            <Icon name="whatsapp" className="w-3.5 h-3.5 text-emerald-600" />
            WhatsApp Taller
          </a>
        </nav>

        {/* Acciones: Cuenta & Carrito & Asistencia */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Carrito de Compras */}
          <Link
            href="/carrito"
            className="relative flex items-center justify-center rounded-lg bg-white border border-gray-200 p-2 text-gray-700 hover:border-blue-600 hover:text-blue-600 transition-all shadow-2xs"
            aria-label={
              mountedCount === 1
                ? "Ver carrito de compras con 1 repuesto"
                : `Ver carrito de compras con ${mountedCount} repuestos`
            }
          >
            <Icon name="cart" className="w-5 h-5 text-gray-700 hover:text-blue-600" />
            {mountedCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-emerald-600 px-1 text-[11px] font-bold text-white shadow-xs">
                {mountedCount}
              </span>
            )}
          </Link>

          {/* Acceso a Cuenta / Login */}
          <Link
            href="/cuenta"
            className="hidden sm:flex items-center gap-1.5 rounded-lg bg-white border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:border-gray-300 hover:text-gray-900 transition-all shadow-2xs"
          >
            <Icon name="user" className="w-4 h-4 text-gray-500" />
            <span>Mi Cuenta</span>
          </Link>

          {/* Botón Asesoría / VoltIA */}
          <a
            href="https://wa.me/51999999999?text=Hola%20NeroElectric%20Motors,%20deseo%20consultar%20con%20un%20t%C3%A9cnico"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-95 px-3.5 py-2 text-xs font-semibold text-white shadow-2xs transition-all"
          >
            <Icon name="tool" className="w-3.5 h-3.5 text-white" />
            <span>Consultar Técnico</span>
          </a>

          {/* Botón Menú Móvil */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            aria-label="Abrir menú de navegación"
          >
            <Icon name={mobileMenuOpen ? "x" : "menu"} className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Menú Móvil */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-gray-200 bg-white px-4 pt-3 pb-6 space-y-3">
          {/* Buscador móvil */}
          <form onSubmit={handleSearch} className="mb-2">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar repuesto..."
                className="w-full rounded-lg bg-gray-50 border border-gray-200 pl-4 pr-10 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-600 focus:bg-white"
              />
              <button
                type="submit"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <Icon name="search" className="w-4 h-4" />
              </button>
            </div>
          </form>

          <Link
            href="/carrito"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between rounded-lg px-3.5 py-2.5 text-sm font-semibold text-gray-900 bg-gray-50 border border-gray-200"
          >
            <span className="flex items-center gap-2">
              <Icon name="cart" className="w-4 h-4 text-gray-600" />
              Carrito de compras
            </span>
            <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-xs font-bold text-white">
              {mountedCount} repuestos
            </span>
          </Link>

          <Link
            href="/cuenta"
            onClick={() => setMobileMenuOpen(false)}
            className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            👤 Mi Cuenta de Cliente
          </Link>

          <div className="pt-2 border-t border-gray-100 flex flex-col gap-2 text-sm font-medium text-gray-700">
            <Link
              href="/#catalogo"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-1.5 hover:text-blue-600"
            >
              Repuestos
            </Link>
            <Link
              href="/#catalogo-ecomoto"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-1.5 hover:text-blue-600"
            >
              Motos Eléctricas
            </Link>
            <Link
              href="/#compatibilidad"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-1.5 hover:text-blue-600"
            >
              Buscador de Compatibilidad
            </Link>
          </div>

          <a
            href="https://wa.me/51999999999?text=Hola%20NeroElectric%20Motors,%20necesito%20asesor%C3%ADa%20para%20un%20repuesto%20de%20moto%20el%C3%A9ctrica"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-2.5 text-sm font-bold text-emerald-700"
          >
            <Icon name="whatsapp" className="w-4 h-4 text-emerald-600" />
            WhatsApp Taller
          </a>
        </div>
      )}
    </header>
  );
}
