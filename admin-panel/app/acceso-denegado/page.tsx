import type { Metadata } from 'next';
import { getAuthenticatedAccount } from '../../lib/auth/server';
import { signOutAction } from '../../lib/auth/actions';
import { Icon } from '../../components/ui/Icons';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Acceso Restringido | ERP NeroElectric Motors',
  description: 'Aviso de control de acceso basado en roles (RBAC).',
};

export const dynamic = 'force-dynamic';

export default async function AccesoDenegadoPage() {
  const account = await getAuthenticatedAccount();

  if (!account) {
    redirect('/login');
  }

  if (account.role === 'admin') {
    redirect('/');
  }

  const storefrontUrl = process.env.NEXT_PUBLIC_STOREFRONT_URL || 'https://neroelectricmotors.com';

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#F4F6F9]">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-lg overflow-hidden">
        <div className="bg-[#0B1528] px-6 py-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/20 text-red-400 border border-red-500/30">
              <Icon name="alert-triangle" className="w-4 h-4" />
            </span>
            <span className="text-xs font-extrabold uppercase tracking-wider text-white">
              NERO ELECTRIC MOTORS · RBAC
            </span>
          </div>
          <span className="rounded-md bg-red-950 border border-red-800 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-300">
            Código 403 — Rol Insuficiente
          </span>
        </div>

        <div className="p-6 sm:p-8 text-center space-y-5">
          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Acceso Restringido a Administradores
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Has iniciado sesión como <strong className="text-slate-900">{account.email}</strong> con el rol{' '}
              <code className="rounded bg-slate-100 border border-slate-200 px-1.5 py-0.5 text-slate-800 font-mono text-xs">
                {account.role}
              </code>
              . Este sistema ERP es independiente de la tienda comercial y solo permite el ingreso a cuentas con rol{' '}
              <code className="rounded bg-amber-50 border border-amber-200 px-1.5 py-0.5 text-amber-900 font-mono text-xs font-bold">
                admin
              </code>{' '}
              verificado en <code className="font-mono text-slate-700 text-xs">public.user_roles</code>.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <form action={signOutAction}>
              <button
                type="submit"
                className="rounded-lg bg-[#0B1528] hover:bg-slate-800 px-5 py-2.5 text-xs font-bold text-white transition-colors cursor-pointer flex items-center gap-2"
              >
                <Icon name="log-out" className="w-4 h-4 text-amber-400" />
                <span>Cerrar sesión e ingresar como Admin</span>
              </button>
            </form>

            {storefrontUrl && (
              <a
                href={storefrontUrl}
                className="rounded-lg border border-slate-300 bg-white hover:bg-slate-50 px-5 py-2.5 text-xs font-semibold text-slate-700 transition-colors"
              >
                Ir a la Tienda Pública
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
