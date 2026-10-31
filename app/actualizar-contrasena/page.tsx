import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthCard } from '../../components/auth/AuthCard';
import { UpdatePasswordForm } from '../../components/auth/UpdatePasswordForm';

export const metadata: Metadata = {
  title: 'Establecer Nueva Contraseña | NeroElectric Motors',
  description: 'Define una nueva contraseña segura para tu cuenta en NeroElectric Motors.',
};

export default function ActualizarContrasenaPage() {
  return (
    <div className="min-h-[calc(100vh-14rem)] flex items-center justify-center px-4 py-12">
      <AuthCard
        title="Nueva Contraseña"
        subtitle="Ingresa y confirma tu nueva clave de acceso segura."
        footer={
          <p>
            <Link
              href="/login"
              className="font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Ir a Iniciar Sesión
            </Link>
          </p>
        }
      >
        <UpdatePasswordForm />
      </AuthCard>
    </div>
  );
}
