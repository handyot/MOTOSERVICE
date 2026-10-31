'use client';

import React, { useActionState, useState } from 'react';
import Link from 'next/link';
import type { AuthAccount } from '../../types';
import { updateProfileAction, signOutAction } from '../../lib/auth/actions';
import { Icon } from '../ui/Icons';

interface ProfileCardProps {
  account: AuthAccount;
}

export function ProfileCard({ account }: ProfileCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formState, formAction, isPending] = useActionState(updateProfileAction, null);

  const formattedDate = new Date(account.createdAt).toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-6">
      {/* Tarjeta de Perfil */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-slate-950 shadow-lg shadow-cyan-500/20 font-black text-xl">
              {account.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-bold text-white">{account.fullName}</h2>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider ${
                    account.role === 'admin'
                      ? 'bg-amber-950/80 text-amber-300 border border-amber-700/60'
                      : 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/60'
                  }`}
                >
                  {account.role === 'admin' ? 'Administrador' : 'Cliente Registrado'}
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-0.5">{account.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
              >
                <Icon name="filter" className="w-3.5 h-3.5 text-cyan-400" />
                <span>Editar Perfil</span>
              </button>
            )}

            <form action={signOutAction}>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-lg border border-rose-900/50 bg-rose-950/30 px-3.5 py-2 text-xs font-medium text-rose-300 hover:bg-rose-900/50 transition-colors"
              >
                <Icon name="x" className="w-3.5 h-3.5" />
                <span>Cerrar Sesión</span>
              </button>
            </form>
          </div>
        </div>

        {/* Notificaciones del formulario */}
        {formState?.error && (
          <div
            role="alert"
            className="mt-4 rounded-lg border border-rose-500/30 bg-rose-950/40 p-3.5 text-xs text-rose-300 flex items-center gap-2"
          >
            <Icon name="alert-triangle" className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{formState.error}</span>
          </div>
        )}

        {formState?.success && (
          <div
            role="status"
            className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-950/40 p-3.5 text-xs text-emerald-300 flex items-center gap-2"
          >
            <Icon name="check-circle" className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{formState.message}</span>
          </div>
        )}

        {/* Modo Edición o Modo Visualización */}
        {isEditing ? (
          <form
            action={async (formData) => {
              await formAction(formData);
              setIsEditing(false);
            }}
            className="mt-6 space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="edit-name" className="block text-xs font-semibold text-slate-300 mb-1">
                  Nombre Completo
                </label>
                <input
                  id="edit-name"
                  name="fullName"
                  type="text"
                  required
                  defaultValue={account.fullName}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950/80 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-colors"
                />
              </div>

              <div>
                <label htmlFor="edit-phone" className="block text-xs font-semibold text-slate-300 mb-1">
                  Teléfono de Contacto
                </label>
                <input
                  id="edit-phone"
                  name="phone"
                  type="tel"
                  defaultValue={account.phone || ''}
                  placeholder="+51 999 888 777"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950/80 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={isPending}
                className="rounded-lg bg-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                {isPending ? 'Guardando...' : 'Guardar Cambios'}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs text-slate-300 hover:text-white transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="rounded-xl border border-slate-800/80 bg-slate-950/50 p-4">
              <span className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
                Teléfono de Contacto
              </span>
              <span className="text-white font-medium">
                {account.phone || 'No registrado'}
              </span>
            </div>

            <div className="rounded-xl border border-slate-800/80 bg-slate-950/50 p-4">
              <span className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
                Rol del Sistema
              </span>
              <span className="text-cyan-400 font-semibold capitalize">
                {account.role === 'admin' ? 'Administrador' : 'Cliente (Customer)'}
              </span>
            </div>

            <div className="rounded-xl border border-slate-800/80 bg-slate-950/50 p-4">
              <span className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
                Miembro Desde
              </span>
              <span className="text-white font-medium">{formattedDate}</span>
            </div>
          </div>
        )}

        {/* Aviso informativo para cuentas con rol administrativo */}
        {account.role === 'admin' && (
          <div className="mt-6 rounded-xl border border-amber-600/40 bg-amber-950/30 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-900/60 text-amber-300 border border-amber-700/60">
                <Icon name="shield" className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Cuenta con Rol Administrativo</h3>
                <p className="text-xs text-amber-200/80">
                  La gestión operativa se realiza desde el Portal Administrativo independiente de NeroElectric Motors.
                </p>
              </div>
            </div>
            <a
              href={process.env.NEXT_PUBLIC_ADMIN_PANEL_URL || 'https://panel.neroelectricmotors.com'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-amber-500 px-3.5 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 transition-colors shrink-0"
            >
              <span>Abrir Portal Admin ↗</span>
              <Icon name="check-circle" className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
      </div>

      {/* Accesos Rápidos y Seguridad */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Módulos de Tienda Disponibles */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4 flex items-center gap-2">
            <Icon name="zap" className="w-4 h-4 text-cyan-400" />
            <span>Herramientas Disponibles</span>
          </h3>
          <div className="space-y-3">
            <Link
              href="/#compatibilidad"
              className="block rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 hover:border-cyan-500/50 hover:bg-slate-900 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-semibold text-white group-hover:text-cyan-400 transition-colors">
                    Verificador de Compatibilidad
                  </span>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Valida baterías, controladores y motores para tu moto eléctrica.
                  </p>
                </div>
                <Icon name="check-circle" className="w-4 h-4 text-cyan-400" />
              </div>
            </Link>

            <Link
              href="/#catalogo"
              className="block rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 hover:border-cyan-500/50 hover:bg-slate-900 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-semibold text-white group-hover:text-cyan-400 transition-colors">
                    Catálogo de Repuestos Verificados
                  </span>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Explora piezas compatibles con marcas líderes en Perú.
                  </p>
                </div>
                <Icon name="filter" className="w-4 h-4 text-cyan-400" />
              </div>
            </Link>
          </div>
        </div>

        {/* Seguridad de la Cuenta */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4 flex items-center gap-2">
            <Icon name="shield" className="w-4 h-4 text-cyan-400" />
            <span>Seguridad de la Cuenta</span>
          </h3>
          <div className="space-y-3">
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold text-white">Contraseña de Acceso</span>
                <p className="text-xs text-slate-400 mt-0.5">
                  Actualiza periódicamente tu contraseña para proteger tu cuenta.
                </p>
              </div>
              <Link
                href="/actualizar-contrasena"
                className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-700 transition-colors"
              >
                Cambiar
              </Link>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
              <span className="text-sm font-semibold text-white">Protección de Datos RLS</span>
              <p className="text-xs text-slate-400 mt-0.5">
                Tus datos de perfil están aislados criptográficamente mediante políticas Row Level Security en PostgreSQL.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
