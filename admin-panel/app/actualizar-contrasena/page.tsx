import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthCard } from '../../components/auth/AuthCard';
import { UpdatePasswordForm } from '../../components/auth/UpdatePasswordForm';

export const metadata: Metadata = {
  title: 'Nueva Contraseña | Portal Administrativo NeroElectric Motors',
  description: 'Define una nueva contraseña segura para el Portal Administrativo.',
};

export default function ActualizarContrasenaPage() {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
      <AuthCard
        title="Nueva Contraseña"
        subtitle="Ingresa y confirma tu nueva clave de acceso administrativa."
        footer={
          <p>
            <Link
              href="/login"
              className="font-semibold text-amber-400 hover:text-amber-300 transition-colors"
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
