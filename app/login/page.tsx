import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthCard } from '../../components/auth/AuthCard';
import { LoginForm } from '../../components/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Iniciar Sesión | NeroElectric Motors',
  description: 'Ingresa a tu cuenta de cliente en NeroElectric Motors para gestionar repuestos y consultas de compatibilidad.',
};

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-14rem)] flex items-center justify-center px-4 py-12">
      <AuthCard
        title="Bienvenido de vuelta"
        subtitle="Ingresa con tu correo y contraseña para acceder a tu cuenta."
        footer={
          <p>
            ¿Aún no tienes una cuenta de cliente?{' '}
            <Link
              href="/registro"
              className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              Regístrate aquí
            </Link>
          </p>
        }
      >
        <Suspense
          fallback={
            <div className="py-8 text-center text-sm text-slate-400">
              Cargando formulario seguro...
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </AuthCard>
    </div>
  );
}
