import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthCard } from '../../components/auth/AuthCard';
import { RegisterForm } from '../../components/auth/RegisterForm';

export const metadata: Metadata = {
  title: 'Crear Cuenta | NeroElectric Motors',
  description: 'Regístrate en NeroElectric Motors y accede a repuestos compatibles para tu motocicleta eléctrica con garantía.',
};

export default function RegisterPage() {
  return (
    <div className="min-h-[calc(100vh-14rem)] flex items-center justify-center px-4 py-12">
      <AuthCard
        title="Crear Cuenta de Cliente"
        subtitle="Regístrate para guardar tus vehículos y validar compatibilidades técnicas."
        footer={
          <p>
            ¿Ya tienes una cuenta registrada?{' '}
            <Link
              href="/login"
              className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              Inicia sesión aquí
            </Link>
          </p>
        }
      >
        <RegisterForm />
      </AuthCard>
    </div>
  );
}
