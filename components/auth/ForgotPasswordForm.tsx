'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { createClient } from '../../lib/supabase/client';
import { validateEmail } from '../../lib/auth/validations';
import { Icon } from '../ui/Icons';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    const emailVal = validateEmail(email);
    if (!emailVal.valid) {
      setErrorMessage(emailVal.error || 'Correo electrónico inválido.');
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      const redirectUrl =
        typeof window !== 'undefined'
          ? `${window.location.origin}/auth/callback?next=/actualizar-contrasena`
          : undefined;

      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: redirectUrl,
      });

      if (error) {
        console.error('[MOTOSERVICE Password Reset Error]', error.message);
        // Por seguridad, no revelamos mensajes que permitan enumerar usuarios o correos
      }

      // Siempre mostramos el mensaje de éxito neutral por política de seguridad
      setIsSubmitted(true);
      setIsLoading(false);
    } catch (err) {
      console.error('[MOTOSERVICE Reset Error]', err);
      // Igualmente mostramos mensaje neutral para evitar filtrado de estado
      setIsSubmitted(true);
      setIsLoading(false);
    }
  }

  if (isSubmitted) {
    return (
      <div className="space-y-5 text-center py-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 border border-blue-200 text-blue-600">
          <Icon name="check-circle" className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-gray-900">Solicitud recibida</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Si la dirección <strong className="text-blue-600">{email}</strong> está registrada en nuestra plataforma, recibirás un enlace seguro para restablecer tu contraseña.
          </p>
          <p className="text-xs text-gray-500">
            Revisa tu bandeja de entrada y carpeta de spam. El enlace tiene un tiempo limitado de validez.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors cursor-pointer"
          >
            <span>Volver a Iniciar Sesión</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {/* Banner de Error */}
      {errorMessage && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-3.5 text-xs text-red-700 flex items-start gap-2.5"
        >
          <Icon name="alert-triangle" className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div>
        <label htmlFor="reset-email" className="block text-xs font-semibold text-gray-700 mb-1.5">
          Correo Electrónico de tu Cuenta
        </label>
        <input
          id="reset-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          placeholder="ejemplo@motoservice.pe"
          className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors disabled:opacity-50"
        />
        <p className="mt-1.5 text-xs text-gray-500">
          Te enviaremos un enlace temporal para que definas una nueva contraseña segura.
        </p>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full mt-2 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-[0.99] px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
      >
        {isLoading ? (
          <>
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            <span>Enviando enlace seguro...</span>
          </>
        ) : (
          <>
            <Icon name="zap" className="w-4 h-4 text-white" />
            <span>Enviar Instrucciones de Recuperación</span>
          </>
        )}
      </button>
    </form>
  );
}
