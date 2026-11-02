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
      {/* Tarjeta Principal de Perfil */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white font-black text-xl shadow-xs">
              {account.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl font-extrabold text-slate-900">{account.fullName}</h2>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider border ${
                    account.role === 'admin'
                      ? 'bg-amber-50 text-amber-900 border-amber-200'
                      : 'bg-slate-100 text-slate-800 border-slate-200'
                  }`}
                >
                  {account.role === 'admin' ? 'Administrador' : 'Cliente Registrado'}
                </span>
              </div>
              <p className="text-sm font-medium text-slate-600 mt-0.5">{account.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs cursor-pointer"
              >
                <Icon name="filter" className="w-3.5 h-3.5 text-slate-600" />
                <span>Editar Perfil</span>
              </button>
            )}

            <form action={signOutAction}>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
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
            className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-semibold text-rose-800 flex items-center gap-2"
          >
            <Icon name="alert-triangle" className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{formState.error}</span>
          </div>
        )}

        {formState?.success && (
          <div
            role="status"
            className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-semibold text-emerald-800 flex items-center gap-2"
          >
            <Icon name="check-circle" className="w-4 h-4 text-emerald-600 shrink-0" />
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
                <label htmlFor="edit-name" className="block text-xs font-bold text-slate-700 mb-1">
                  Nombre Completo
                </label>
                <input
                  id="edit-name"
                  name="fullName"
                  type="text"
                  required
                  defaultValue={account.fullName}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 transition-colors"
                />
              </div>

              <div>
                <label htmlFor="edit-phone" className="block text-xs font-bold text-slate-700 mb-1">
                  Teléfono de Contacto
                </label>
                <input
                  id="edit-phone"
                  name="phone"
                  type="tel"
                  defaultValue={account.phone || ''}
                  placeholder="+51 999 888 777"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={isPending}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                {isPending ? 'Guardando...' : 'Guardar Cambios'}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Teléfono de Contacto
              </span>
              <span className="text-slate-900 font-bold">
                {account.phone || 'No registrado'}
              </span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Rol del Sistema
              </span>
              <span className="text-slate-900 font-bold capitalize">
                {account.role === 'admin' ? 'Administrador' : 'Cliente (Customer)'}
              </span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Miembro Desde
              </span>
              <span className="text-slate-900 font-bold">{formattedDate}</span>
            </div>
          </div>
        )}

        {/* Aviso informativo para cuentas con rol administrativo */}
        {account.role === 'admin' && (
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50/80 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-900 border border-amber-300">
                <Icon name="shield" className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Cuenta con Rol Administrativo</h3>
                <p className="text-xs text-slate-700 font-medium">
                  La gestión operativa se realiza desde el Portal Administrativo independiente de NeroElectric Motors.
                </p>
              </div>
            </div>
            <a
              href={process.env.NEXT_PUBLIC_ADMIN_PANEL_URL || 'https://panel.neroelectricmotors.com'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold px-3.5 py-2 text-xs shadow-2xs transition-colors shrink-0"
            >
              <span>Abrir Portal Admin ↗</span>
              <Icon name="check-circle" className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
      </div>

      {/* Accesos Rápidos y Seguridad en tarjetas armonizadas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Herramientas Disponibles */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-4 flex items-center gap-2">
            <Icon name="zap" className="w-4 h-4 text-slate-900" />
            <span>Herramientas Disponibles</span>
          </h3>
          <div className="space-y-3">
            <Link
              href="/#compatibilidad"
              className="block rounded-xl border border-slate-200 bg-slate-50/70 p-4 hover:border-slate-300 hover:bg-slate-100 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-slate-900 group-hover:text-slate-950 transition-colors">
                    Verificador de Compatibilidad
                  </span>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    Valida baterías, controladores y motores para tu moto eléctrica.
                  </p>
                </div>
                <Icon name="check-circle" className="w-4 h-4 text-emerald-600 shrink-0" />
              </div>
            </Link>

            <Link
              href="/#catalogo"
              className="block rounded-xl border border-slate-200 bg-slate-50/70 p-4 hover:border-slate-300 hover:bg-slate-100 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-slate-900 group-hover:text-slate-950 transition-colors">
                    Catálogo de Repuestos Verificados
                  </span>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    Explora piezas compatibles con marcas líderes en Perú.
                  </p>
                </div>
                <Icon name="filter" className="w-4 h-4 text-slate-700 shrink-0" />
              </div>
            </Link>
          </div>
        </div>

        {/* Seguridad de la Cuenta */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-4 flex items-center gap-2">
            <Icon name="shield" className="w-4 h-4 text-slate-900" />
            <span>Seguridad de la Cuenta</span>
          </h3>
          <div className="space-y-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-slate-900">Contraseña de Acceso</span>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                  Actualiza periódicamente tu contraseña para proteger tu cuenta.
                </p>
              </div>
              <Link
                href="/actualizar-contrasena"
                className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-2xs shrink-0"
              >
                Cambiar
              </Link>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <span className="text-sm font-bold text-slate-900">Protección de Datos RLS</span>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                Tus datos de perfil están aislados criptográficamente mediante políticas Row Level Security en PostgreSQL.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
