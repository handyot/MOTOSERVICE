import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthCard } from '../../components/auth/AuthCard';
import { ForgotPasswordForm } from '../../components/auth/ForgotPasswordForm';

export const metadata: Metadata = {
  title: 'Recuperar Contraseña | NeroElectric Motors',
  description: 'Restablece la contraseña de tu cuenta en NeroElectric Motors de forma segura.',
};

export default function RecuperarContrasenaPage() {
  return (
    <div className="min-h-[calc(100vh-14rem)] flex items-center justify-center px-4 py-12">
      <AuthCard
        title="Recuperar Contraseña"
        subtitle="Ingresa el correo electrónico asociado a tu cuenta."
        footer={
          <p>
            ¿Recordaste tu contraseña?{' '}
            <Link
              href="/login"
              className="font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Volver al inicio de sesión
            </Link>
          </p>
        }
      >
        <ForgotPasswordForm />
      </AuthCard>
    </div>
  );
}
