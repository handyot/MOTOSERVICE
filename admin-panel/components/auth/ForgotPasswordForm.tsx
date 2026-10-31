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
      <div className="space-y-5 text-center py-3">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600">
          <Icon name="check-circle" className="w-6 h-6" />
        </div>
        <div className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">Solicitud recibida</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Si la dirección <strong className="text-slate-900">{email}</strong> corresponde a un operador registrado, recibirás un enlace seguro para restablecer tu contraseña.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-lg bg-[#0B1528] px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition-colors cursor-pointer"
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
          className="rounded-lg border border-red-200 bg-red-50 p-3.5 text-xs text-red-800 flex items-start gap-2.5"
        >
          <Icon name="alert-triangle" className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span className="font-medium">{errorMessage}</span>
        </div>
      )}

      <div>
        <label htmlFor="reset-email" className="block text-xs font-semibold text-slate-800 mb-1.5">
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
          placeholder="admin@neroelectric.com"
          className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-[#0B1528] focus:outline-none focus:ring-1 focus:ring-[#0B1528] transition-colors disabled:opacity-50"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full mt-2 rounded-lg bg-[#0B1528] hover:bg-slate-800 active:scale-[0.99] px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
      >
        {isLoading ? 'Enviando enlace...' : 'Enviar Instrucciones de Recuperación'}
      </button>
    </form>
  );
}
