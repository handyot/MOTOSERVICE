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
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-950/60 border border-cyan-800/80 text-cyan-400">
          <Icon name="check-circle" className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white">Solicitud recibida</h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Si la dirección <strong className="text-cyan-300">{email}</strong> está registrada en nuestra plataforma, recibirás un enlace seguro para restablecer tu contraseña.
          </p>
          <p className="text-xs text-slate-400">
            Revisa tu bandeja de entrada y carpeta de spam. El enlace tiene un tiempo limitado de validez.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
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
          className="rounded-lg border border-rose-500/30 bg-rose-950/40 p-3.5 text-xs text-rose-300 flex items-start gap-2.5"
        >
          <Icon name="alert-triangle" className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div>
        <label htmlFor="reset-email" className="block text-xs font-semibold text-slate-300 mb-1.5">
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
          className="w-full rounded-lg border border-slate-700 bg-slate-950/80 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-colors disabled:opacity-50"
        />
        <p className="mt-1.5 text-xs text-slate-400">
          Te enviaremos un enlace temporal para que definas una nueva contraseña segura.
        </p>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full mt-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/20 hover:brightness-110 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
            <span>Enviando enlace seguro...</span>
          </>
        ) : (
          <>
            <Icon name="zap" className="w-4 h-4 text-slate-950" />
            <span>Enviar Instrucciones de Recuperación</span>
          </>
        )}
      </button>
    </form>
  );
}
