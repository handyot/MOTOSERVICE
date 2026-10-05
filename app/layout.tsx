import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MOTOSERVICE | Repuestos y soluciones para tu moto eléctrica",
  description:
    "Plataforma comercial especializada en repuestos para motos eléctricas y asistencia técnica de compatibilidad. Baterías de litio, controladores senoidales, motores HUB y accesorios.",
  keywords: [
    "motos eléctricas",
    "repuestos moto eléctrica",
    "baterías de litio para moto",
    "controlador senoidal",
    "motor hub brushless",
    "NIU",
    "Super Soco",
    "Yadea",
    "compatibilidad repuestos moto",
    "MOTOSERVICE",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-slate-950">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
