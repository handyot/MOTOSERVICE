import type { Metadata } from 'next';
import { getAuthenticatedAccount } from '../../lib/auth/server';
import { signOutAction } from '../../lib/auth/actions';
import { Icon } from '../../components/ui/Icons';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Acceso Restringido | Portal Administrativo NeroElectric Motors',
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

  const storefrontUrl = process.env.NEXT_PUBLIC_STOREFRONT_URL || 'https://neroelectric.com';

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg rounded-2xl border border-rose-500/40 bg-slate-900/95 p-8 shadow-2xl text-center space-y-5">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-950/80 border border-rose-700/60 text-rose-400">
          <Icon name="alert-triangle" className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="inline-block rounded-full bg-rose-950 border border-rose-800 px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-rose-300">
            Código 403 — Rol Insuficiente
          </span>
          <h1 className="text-2xl font-bold text-white">
            Acceso Restringido a Administradores
          </h1>
          <p className="text-xs text-slate-300 leading-relaxed">
            Has iniciado sesión como <strong className="text-white">{account.email}</strong> con el rol{' '}
            <code className="rounded bg-slate-800 px-1.5 py-0.5 text-cyan-400 font-mono">{account.role}</code>.
            Este portal web es independiente de la tienda comercial y solo permite el acceso a cuentas con rol{' '}
            <code className="rounded bg-slate-800 px-1.5 py-0.5 text-amber-400 font-mono">admin</code> verificado en{' '}
            <code className="font-mono text-slate-400">public.user_roles</code>.
          </p>
        </div>

        <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
          <form action={signOutAction}>
            <button
              type="submit"
              className="rounded-xl bg-amber-500 hover:bg-amber-400 px-5 py-2.5 text-xs font-bold text-slate-950 transition-colors cursor-pointer flex items-center gap-2"
            >
              <Icon name="x" className="w-4 h-4" />
              <span>Cerrar sesión e ingresar como Admin</span>
            </button>
          </form>

          {storefrontUrl && (
            <a
              href={storefrontUrl}
              className="rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 px-5 py-2.5 text-xs font-semibold text-slate-200 transition-colors"
            >
              Ir a la Tienda Pública
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
