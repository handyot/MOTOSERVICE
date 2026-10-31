import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { CartProvider } from "../lib/cart/cart-context";
import { VoltIAWidget } from "../components/voltia/VoltIAWidget";

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
    process.env.NEXT_PUBLIC_SITE_URL || "https://neroelectricmotors.com"
  ),
  title: "NeroElectric Motors | Repuestos y Soluciones para Motos Eléctricas",
  description:
    "Tienda técnica especializada en repuestos originales y homologados, mantenimiento y soluciones para motos eléctricas en Perú. Baterías de litio, controladores senoidales, motores y asesoría de compatibilidad.",
  keywords: [
    "NeroElectric Motors",
    "repuestos motos eléctricas",
    "baterías de litio para moto eléctrica",
    "controladores senoidales",
    "motores brushless hub",
    "TAILG repuestos",
    "Yadea repuestos",
    "KAYENCORP repuestos",
    "GreenLine repuestos",
    "compatibilidad moto eléctrica Perú",
  ],
  icons: {
    icon: "/branding/nero-emblem.png",
    shortcut: "/branding/nero-emblem.png",
    apple: "/branding/nero-emblem.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-gray-900 selection:bg-blue-600 selection:text-white">
        <CartProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <VoltIAWidget />
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
