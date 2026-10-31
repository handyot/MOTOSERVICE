import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://panel.neroelectric.com"
  ),
  title: "Portal Administrativo | panel.neroelectric.com — NeroElectric Motors",
  description:
    "Sistema administrativo independiente de NeroElectric Motors (panel.neroelectric.com) conectado a Supabase PostgreSQL: catálogo, inventario, pedidos, facturación SUNAT, VoltIA e importador CSV/JSON.",
  robots: {
    index: false,
    follow: false,
  },
  icons: {
    icon: "/branding/nero-emblem.png",
    shortcut: "/branding/nero-emblem.png",
    apple: "/branding/nero-emblem.png",
  },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-slate-950">
        <header className="border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="font-bold tracking-wider uppercase text-white">
                NeroElectric Motors
              </span>
              <span className="rounded bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[10px] font-bold text-amber-300 uppercase">
                Web 2 — Administración Independiente
              </span>
            </div>
            <div className="text-slate-400 font-mono text-[11px] hidden sm:block">
              Infraestructura compartida: Supabase Auth + PostgreSQL RLS
            </div>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-[11px] text-slate-500">
          NeroElectric Motors — Portal Operativo Restringido (Solo personal con rol <code className="text-amber-400">admin</code>)
        </footer>
      </body>
    </html>
  );
}
