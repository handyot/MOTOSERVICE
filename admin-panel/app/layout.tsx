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
    process.env.NEXT_PUBLIC_SITE_URL || "https://panel.neroelectricmotors.com"
  ),
  title: "Portal Administrativo | panel.neroelectricmotors.com — NeroElectric Motors",
  description:
    "Sistema administrativo ERP independiente de NeroElectric Motors (panel.neroelectricmotors.com) conectado a Supabase PostgreSQL: catálogo, inventario, pedidos, facturación SUNAT, VoltIA e importador CSV/JSON.",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#F4F6F9] text-slate-900 selection:bg-amber-400 selection:text-slate-950">
        {children}
      </body>
    </html>
  );
}
