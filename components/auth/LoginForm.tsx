'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '../../lib/supabase/client';
import { validateEmail, validatePassword, getSafeRedirectUrl } from '../../lib/auth/validations';
import { Icon } from '../ui/Icons';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo');
  const safeRedirect = getSafeRedirectUrl(redirectTo, '/cuenta');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Mensajes informativos de URL
  const messageParam = searchParams.get('message');
  const errorParam = searchParams.get('error');

  const infoNotice =
    messageParam === 'password_updated'
      ? 'Tu contraseña ha sido actualizada. Inicia sesión con tus nuevas credenciales.'
      : messageParam === 'logged_out'
      ? 'Sesión finalizada correctamente.'
      : messageParam === 'registered'
      ? '¡Cuenta creada con éxito! Ya puedes iniciar sesión.'
      : null;

  const urlErrorNotice =
    errorParam === 'callback_failed'
      ? 'El enlace de autenticación expiró o no es válido. Inténtalo de nuevo.'
      : errorParam === 'unauthorized'
      ? 'Debes iniciar sesión con permisos suficientes para acceder a ese recurso.'
      : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    // Validaciones en cliente
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
        // Mensajes seguros y comprensibles
        if (
          error.message.includes('Invalid login credentials') ||
          error.message.includes('invalid_grant')
        ) {
          setErrorMessage('Credenciales incorrectas. Verifica tu correo y contraseña.');
        } else if (error.message.includes('Email not confirmed')) {
          setErrorMessage(
            'Tu correo aún no ha sido confirmado. Revisa tu bandeja de entrada o spam para activarlo.'
          );
        } else {
          setErrorMessage('No fue posible iniciar sesión. Verifica tus datos o intenta más tarde.');
        }
        setIsLoading(false);
        return;
      }

      if (data?.session) {
        // Redirección segura
        router.push(safeRedirect);
        router.refresh();
      } else {
        router.push('/cuenta');
        router.refresh();
      }
    } catch (err) {
      console.error('[MOTOSERVICE Login Error]', err);
      setErrorMessage('Ocurrió un error inesperado al conectar con el servicio de autenticación.');
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {/* Banner Informativo */}
      {infoNotice && (
        <div
          role="status"
          className="rounded-lg border border-cyan-500/30 bg-cyan-950/40 p-3.5 text-xs text-cyan-300 flex items-start gap-2.5"
        >
          <Icon name="check-circle" className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <span>{infoNotice}</span>
        </div>
      )}

      {/* Banner de Error */}
      {(errorMessage || urlErrorNotice) && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-3.5 text-xs text-red-700 flex items-start gap-2.5"
        >
          <Icon name="alert-triangle" className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <span>{errorMessage || urlErrorNotice}</span>
        </div>
      )}

      {/* Campo: Correo */}
      <div>
        <label htmlFor="login-email" className="block text-xs font-semibold text-gray-700 mb-1.5">
          Correo Electrónico
        </label>
        <div className="relative">
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            placeholder="ejemplo@motoservice.pe"
            className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors disabled:opacity-50"
          />
        </div>
      </div>

      {/* Campo: Contraseña */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label
            htmlFor="login-password"
            className="block text-xs font-semibold text-gray-700"
          >
            Contraseña
          </label>
          <Link
            href="/recuperar-contrasena"
            className="text-xs text-blue-600 hover:text-blue-700 transition-colors"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
        <div className="relative">
          <input
            id="login-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            placeholder="••••••••"
            className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 pr-10 text-xs text-gray-900 placeholder-gray-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors disabled:opacity-50"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
            aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
          >
            <Icon name={showPassword ? 'x' : 'zap'} className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Botón de Envío */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full mt-2 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-[0.99] px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
      >
        {isLoading ? (
          <>
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
            <span>Iniciando sesión...</span>
          </>
        ) : (
          <>
            <Icon name="check-circle" className="w-4 h-4 text-slate-950" />
            <span>Ingresar a mi Cuenta</span>
          </>
        )}
      </button>
    </form>
  );
}
