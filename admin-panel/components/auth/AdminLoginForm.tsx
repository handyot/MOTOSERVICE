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
          className="rounded-lg border border-emerald-500/40 bg-emerald-950/40 p-3.5 text-xs text-emerald-300 flex items-start gap-2.5"
        >
          <Icon name="check-circle" className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <span>{infoNotice}</span>
        </div>
      )}

      {(errorMessage || urlErrorNotice) && (
        <div
          role="alert"
          className="rounded-lg border border-rose-500/40 bg-rose-950/50 p-3.5 text-xs text-rose-300 flex items-start gap-2.5"
        >
          <Icon name="alert-triangle" className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span>{errorMessage || urlErrorNotice}</span>
        </div>
      )}

      <div>
        <label htmlFor="admin-email" className="block text-xs font-semibold text-slate-300 mb-1.5">
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
          placeholder="admin@motoservice.pe"
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-colors disabled:opacity-50"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label htmlFor="admin-password" className="block text-xs font-semibold text-slate-300">
            Contraseña
          </label>
          <Link
            href="/recuperar-contrasena"
            className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
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
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 pr-10 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-colors disabled:opacity-50"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-200"
            aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
          >
            <Icon name={showPassword ? 'x' : 'zap'} className="w-4 h-4" />
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full mt-2 rounded-lg bg-amber-500 hover:bg-amber-400 active:scale-[0.99] px-4 py-2.5 text-xs font-bold text-slate-950 shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
      >
        {isLoading ? (
          <>
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
            <span>Verificando credenciales y rol admin...</span>
          </>
        ) : (
          <>
            <Icon name="shield" className="w-4 h-4 text-slate-950" />
            <span>Ingresar al Panel Administrativo</span>
          </>
        )}
      </button>
    </form>
  );
}
