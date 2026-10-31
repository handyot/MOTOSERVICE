'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '../../lib/supabase/client';
import { validateEmail, validatePassword, getSafeRedirectUrl } from '../../lib/auth/validations.mjs';
import { Icon } from '../ui/Icons';

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo');
  const safeRedirect = getSafeRedirectUrl(redirectTo, '/');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const messageParam = searchParams.get('message');
  const errorParam = searchParams.get('error');

  const infoNotice =
    messageParam === 'password_updated'
      ? 'Tu contraseña administrativa ha sido actualizada. Inicia sesión con tus nuevas credenciales.'
      : messageParam === 'logged_out'
      ? 'Sesión administrativa cerrada correctamente.'
      : null;

  const urlErrorNotice =
    errorParam === 'callback_failed'
      ? 'El enlace de autenticación expiró o no es válido. Inténtalo de nuevo.'
      : errorParam === 'unauthorized' || errorParam === 'customer_forbidden'
      ? 'Acceso restringido: Tu cuenta no posee el rol administrativo (admin) requerido para ingresar a este portal.'
      : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      setErrorMessage(emailValidation.error || 'Correo no válido.');
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      setErrorMessage(passwordValidation.error || 'Contraseña inválida.');
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        if (
          error.message.includes('Invalid login credentials') ||
          error.message.includes('invalid_grant')
        ) {
          setErrorMessage('Credenciales incorrectas. Verifica tu correo y contraseña administrativa.');
        } else if (error.message.includes('Email not confirmed')) {
          setErrorMessage('Tu correo aún no ha sido confirmado.');
        } else {
          setErrorMessage('No fue posible iniciar sesión. Verifica tus datos o intenta más tarde.');
        }
        setIsLoading(false);
        return;
      }

      if (data?.session) {
        // Verificar inmediatamente en el servidor que el usuario posea role = 'admin' en public.user_roles
        const verifyRes = await fetch('/api/admin/auth/session', {
          method: 'GET',
          headers: { 'Cache-Control': 'no-store' },
        });
        const verifyData = await verifyRes.json();

        if (!verifyRes.ok || !verifyData.authorized) {
          await supabase.auth.signOut();
          setErrorMessage(
            verifyData.error ||
              'Acceso denegado: Tu cuenta tiene rol de cliente (customer). Este portal es exclusivo para administradores.'
          );
          setIsLoading(false);
          return;
        }

        router.push(safeRedirect);
        router.refresh();
      } else {
        setErrorMessage('No se pudo establecer la sesión administrativa.');
        setIsLoading(false);
      }
    } catch (err) {
      console.error('[MOTOSERVICE ADMIN Login Error]', err);
      setErrorMessage('Error inesperado al conectar con el servicio de autenticación.');
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {infoNotice && (
        <div
          role="status"
          className="rounded-lg border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-800 flex items-start gap-2.5"
        >
          <Icon name="check-circle" className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span className="font-medium">{infoNotice}</span>
        </div>
      )}

      {(errorMessage || urlErrorNotice) && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-3.5 text-xs text-red-800 flex items-start gap-2.5"
        >
          <Icon name="alert-triangle" className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span className="font-medium">{errorMessage || urlErrorNotice}</span>
        </div>
      )}

      <div>
        <label htmlFor="admin-email" className="block text-xs font-semibold text-slate-800 mb-1.5">
          Correo del Operador / Administrador
        </label>
        <input
          id="admin-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          placeholder="admin@neroelectric.com"
          className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-[#0B1528] focus:outline-none focus:ring-1 focus:ring-[#0B1528] transition-colors disabled:opacity-50"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label htmlFor="admin-password" className="block text-xs font-semibold text-slate-800">
            Contraseña
          </label>
          <Link
            href="/recuperar-contrasena"
            className="text-xs font-semibold text-[#0B1528] hover:underline transition-colors"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
        <div className="relative">
          <input
            id="admin-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            placeholder="••••••••"
            className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 pr-10 text-xs text-slate-900 placeholder-slate-400 focus:border-[#0B1528] focus:outline-none focus:ring-1 focus:ring-[#0B1528] transition-colors disabled:opacity-50"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-700 cursor-pointer"
            aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
          >
            <Icon name={showPassword ? 'eye-off' : 'eye'} className="w-4 h-4" />
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full mt-2 rounded-lg bg-[#0B1528] hover:bg-slate-800 active:scale-[0.99] px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
      >
        {isLoading ? (
          <>
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
            <span>Verificando credenciales y rol admin...</span>
          </>
        ) : (
          <>
            <Icon name="shield" className="w-4 h-4 text-amber-400" />
            <span>Ingresar al Panel Administrativo</span>
          </>
        )}
      </button>
    </form>
  );
}
