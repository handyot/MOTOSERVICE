"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { Icon } from "../ui/Icons";
import { useCart } from "../../lib/cart/cart-context";
import { openVoltIAChat } from "../voltia/VoltIAWidget";
import { formatCurrency } from "../../lib/formatters.js";

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchContainerRef = useRef(null);

  const { totalCount, isLoaded } = useCart();
  const mountedCount = isLoaded ? totalCount : 0;

  // Consulta interactiva en catálogo con debounce
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed || trimmed.length < 2) {
      setSearchResults(null);
      setIsDropdownOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/catalog/search?q=${encodeURIComponent(trimmed)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data);
          setIsDropdownOpen(true);
        }
      } catch (err) {
        console.error("Error en búsqueda interactiva:", err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Cierre al presionar escape o clic exterior
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsDropdownOpen(false);
    router.push(`/repuestos?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const isRepuestosActive = pathname?.startsWith("/repuestos");
  const isMotosActive = pathname?.startsWith("/motos");
  const isCompatibilidadActive = pathname?.startsWith("/compatibilidad");

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200/80 bg-white">
      <div className="mx-auto flex max-w-[1560px] items-center justify-between px-6 sm:px-8 lg:px-12 py-3.5 gap-4">

        {/* Logo Oficial NeroElectric Motors */}
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

        {/* Buscador de catálogo interactivo para escritorio */}
        <div ref={searchContainerRef} className="relative hidden md:flex flex-1 max-w-md mx-2">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (searchResults && searchQuery.trim().length >= 2) {
                  setIsDropdownOpen(true);
                }
              }}
              placeholder="Buscar repuesto, código SKU, modelo o voltaje..."
              className="w-full rounded-lg bg-gray-50/90 border border-gray-200 pl-4 pr-10 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-1 focus:ring-blue-600 transition-all"
            />
            <button
              type="submit"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-blue-600 cursor-pointer"
              title="Buscar repuestos o modelos"
            >
              {isSearching ? (
                <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Icon name="search" className="w-4 h-4" />
              )}
            </button>
          </form>

          {/* Menú flotante de sugerencias en vivo */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden max-h-[480px] overflow-y-auto divide-y divide-gray-100">
              {/* Sin resultados */}
              {searchResults && searchResults.totalMatches === 0 && (
                <div className="p-4 text-center">
                  <p className="text-xs font-semibold text-gray-800">
                    No encontramos productos para «{searchResults.query}»
                  </p>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Prueba buscando por SKU (ej. MS-BAT-72V45AH), marca (Super Soco, TAILG) o voltaje (72V, 60V).
                  </p>
                </div>
              )}

              {/* Repuestos encontrados */}
              {searchResults && searchResults.parts && searchResults.parts.length > 0 && (
                <div className="p-2">
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-500 flex items-center justify-between">
                    <span>Repuestos y Componentes</span>
                    <span className="text-blue-600">{searchResults.parts.length} encontrados</span>
                  </div>
                  <div className="space-y-1 mt-1">
                    {searchResults.parts.map((part) => (
                      <Link
                        key={part.id || part.sku}
                        href={part.url || `/repuestos?q=${encodeURIComponent(part.sku || part.name)}`}
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                          <div className="w-8 h-8 rounded bg-gray-100 border border-gray-200 shrink-0 flex items-center justify-center p-0.5 overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={part.imageUrl || "/branding/nero-electric-motors-optimized.png"}
                              alt={part.name}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-gray-900 group-hover:text-blue-600 truncate">
                              {part.name}
                            </p>
                            <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                              <span className="font-mono bg-gray-100 px-1 rounded text-gray-700">{part.sku}</span>
                              {part.voltage && <span>• {part.voltage}V</span>}
                            </div>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs font-bold text-gray-900 block">
                            {formatCurrency(part.price, part.currency || "PEN")}
                          </span>
                          {part.canPurchase ? (
                            <span className="text-[10px] text-emerald-600 font-medium">Disponible</span>
                          ) : (
                            <span className="text-[10px] text-amber-600 font-medium">Consultar</span>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Motos encontradas */}
              {searchResults && searchResults.motos && searchResults.motos.length > 0 && (
                <div className="p-2">
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-500 flex items-center justify-between">
                    <span>Motos Eléctricas Oficiales</span>
                    <span className="text-blue-600">{searchResults.motos.length} modelos</span>
                  </div>
                  <div className="space-y-1 mt-1">
                    {searchResults.motos.map((moto) => (
                      <Link
                        key={moto.id || moto.slug}
                        href={moto.url || `/motos?modelo=${encodeURIComponent(moto.slug)}`}
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                          <div className="w-8 h-8 rounded bg-gray-100 border border-gray-200 shrink-0 flex items-center justify-center p-0.5 overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={moto.imageUrl || "/images/motos/placeholder-ev-moto.svg"}
                              alt={moto.name}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-gray-900 group-hover:text-blue-600 truncate">
                              {moto.name}
                            </p>
                            <span className="text-[10px] text-gray-500 block truncate">
                              {moto.vehicleType} • {moto.voltage ? `${moto.voltage}V` : "EV"}
                            </span>
                          </div>
                        </div>
                        <span className="text-[11px] font-semibold text-blue-600 shrink-0">
                          Ver ficha →
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Botón Ver todos los resultados */}
              {searchResults && searchResults.totalMatches > 0 && (
                <div className="p-2 bg-gray-50/70 text-center">
                  <Link
                    href={`/repuestos?q=${encodeURIComponent(searchResults.query)}`}
                    onClick={() => setIsDropdownOpen(false)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 py-1"
                  >
                    Ver todos los resultados ({searchResults.totalMatches}) en Repuestos
                    <Icon name="arrow-right" className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navegación de escritorio: Rutas independientes (Issue #16) */}
        <nav className="hidden lg:flex items-center gap-5 text-xs font-semibold text-gray-700">
          <Link
            href="/repuestos"
            className={`transition-colors py-1 px-2 rounded-md ${
              isRepuestosActive
                ? "bg-blue-50 text-blue-700 font-bold"
                : "hover:text-blue-600"
            }`}
          >
            Repuestos
          </Link>
          <Link
            href="/motos"
            className={`transition-colors py-1 px-2 rounded-md ${
              isMotosActive
                ? "bg-blue-50 text-blue-700 font-bold"
                : "hover:text-blue-600"
            }`}
          >
            Motos
          </Link>
          <Link
            href="/compatibilidad"
            className={`transition-colors py-1 px-2 rounded-md ${
              isCompatibilidadActive
                ? "bg-blue-50 text-blue-700 font-bold"
                : "hover:text-blue-600"
            }`}
          >
            Compatibilidad
          </Link>
          <a
            href="https://wa.me/51999999999?text=Hola%20NeroElectric%20Motors,%20necesito%20asesor%C3%ADa%20para%20un%20repuesto%20de%20moto%20el%C3%A9ctrica"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-700 hover:text-emerald-800 transition-colors flex items-center gap-1.5 font-semibold ml-1"
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

          {/* Botón Asesoría VoltIA en la tienda */}
          <button
            type="button"
            onClick={() =>
              openVoltIAChat({
                prompt: "Hola VoltIA, deseo realizar una consulta técnica sobre mi moto eléctrica y sus repuestos.",
              })
            }
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-95 px-3.5 py-2 text-xs font-semibold text-white shadow-2xs transition-all cursor-pointer"
          >
            <Icon name="tool" className="w-3.5 h-3.5 text-white" />
            <span>Consultar Técnico</span>
          </button>

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
          {/* Buscador móvil con redirección */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!searchQuery.trim()) return;
              setMobileMenuOpen(false);
              router.push(`/repuestos?q=${encodeURIComponent(searchQuery.trim())}`);
            }}
            className="mb-2"
          >
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar repuesto o modelo..."
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
              href="/repuestos"
              onClick={() => setMobileMenuOpen(false)}
              className={`px-3 py-1.5 rounded-lg ${
                isRepuestosActive ? "bg-blue-50 text-blue-700 font-bold" : "hover:text-blue-600"
              }`}
            >
              Repuestos
            </Link>
            <Link
              href="/motos"
              onClick={() => setMobileMenuOpen(false)}
              className={`px-3 py-1.5 rounded-lg ${
                isMotosActive ? "bg-blue-50 text-blue-700 font-bold" : "hover:text-blue-600"
              }`}
            >
              Motos Eléctricas
            </Link>
            <Link
              href="/compatibilidad"
              onClick={() => setMobileMenuOpen(false)}
              className={`px-3 py-1.5 rounded-lg ${
                isCompatibilidadActive ? "bg-blue-50 text-blue-700 font-bold" : "hover:text-blue-600"
              }`}
            >
              Buscador de Compatibilidad
            </Link>
          </div>

          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              openVoltIAChat({
                prompt: "Hola VoltIA, requiero diagnóstico técnico de mi moto eléctrica.",
              });
            }}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-50 border border-blue-200 px-4 py-2.5 text-sm font-bold text-blue-700"
          >
            <Icon name="tool" className="w-4 h-4 text-blue-600" />
            Asistente Técnico VoltIA
          </button>
        </div>
      )}
    </header>
  );
}
