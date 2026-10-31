'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { createClient } from '../../lib/supabase/client';
import { validateEmail } from '../../lib/auth/validations.mjs';
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

      await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: redirectUrl,
      });

      setIsSubmitted(true);
      setIsLoading(false);
    } catch {
      setIsSubmitted(true);
      setIsLoading(false);
    }
  }

  if (isSubmitted) {
    return (
      <div className="space-y-5 text-center py-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-950/60 border border-amber-700/50 text-amber-400">
          <Icon name="check-circle" className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white">Solicitud recibida</h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Si la dirección <strong className="text-amber-400">{email}</strong> corresponde a un operador registrado, recibirás un enlace seguro para restablecer tu contraseña.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-400 transition-colors cursor-pointer"
          >
            <span>Volver a Iniciar Sesión</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {errorMessage && (
        <div
          role="alert"
          className="rounded-lg border border-rose-500/40 bg-rose-950/50 p-3.5 text-xs text-rose-300 flex items-start gap-2.5"
        >
          <Icon name="alert-triangle" className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div>
        <label htmlFor="reset-email" className="block text-xs font-semibold text-slate-300 mb-1.5">
          Correo Electrónico Administrativo
        </label>
        <input
          id="reset-email"
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

      <button
        type="submit"
        disabled={isLoading}
        className="w-full mt-2 rounded-lg bg-amber-500 hover:bg-amber-400 active:scale-[0.99] px-4 py-2.5 text-xs font-bold text-slate-950 shadow-xs transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
      >
        {isLoading ? 'Enviando enlace...' : 'Enviar Instrucciones de Recuperación'}
      </button>
    </form>
  );
}
