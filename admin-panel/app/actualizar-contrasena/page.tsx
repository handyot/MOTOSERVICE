import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthCard } from '../../components/auth/AuthCard';
import { UpdatePasswordForm } from '../../components/auth/UpdatePasswordForm';

export const metadata: Metadata = {
  title: 'Nueva Contraseña | ERP NeroElectric Motors',
  description: 'Define una nueva contraseña segura para el Portal Administrativo.',
};

export default function ActualizarContrasenaPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#F4F6F9]">
      <AuthCard
        title="Nueva Contraseña"
        subtitle="Ingresa y confirma tu nueva clave de acceso administrativa."
        footer={
          <p>
            <Link
              href="/login"
              className="font-semibold text-[#0B1528] hover:underline transition-colors"
            >
              Volver al Panel o Iniciar Sesión
            </Link>
          </p>
        }
      >
        <UpdatePasswordForm />
      </AuthCard>
    </div>
  );
}
