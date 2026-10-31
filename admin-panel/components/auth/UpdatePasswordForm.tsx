'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../lib/supabase/client';
import { validatePassword } from '../../lib/auth/validations.mjs';
import { Icon } from '../ui/Icons';

export function UpdatePasswordForm() {
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    const passVal = validatePassword(password);
    if (!passVal.valid) {
      setErrorMessage(passVal.error || 'Contraseña inválida.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden.');
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        setErrorMessage(
          'No se pudo actualizar la contraseña. El enlace de recuperación puede haber expirado.'
        );
        setIsLoading(false);
        return;
      }

      router.push('/login?message=password_updated');
    } catch {
      setErrorMessage('Ocurrió un error inesperado al actualizar la contraseña.');
      setIsLoading(false);
    }
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
        <label htmlFor="new-pass" className="block text-xs font-semibold text-slate-300 mb-1.5">
          Nueva Contraseña Administrativa
        </label>
        <div className="relative">
          <input
            id="new-pass"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            placeholder="Mínimo 8 caracteres (letras y números)"
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 pr-10 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-200"
          >
            <Icon name={showPassword ? 'x' : 'zap'} className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="confirm-new-pass" className="block text-xs font-semibold text-slate-300 mb-1.5">
          Confirmar Nueva Contraseña
        </label>
        <input
          id="confirm-new-pass"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={isLoading}
          placeholder="Repite la nueva contraseña"
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full mt-2 rounded-lg bg-amber-500 hover:bg-amber-400 px-4 py-2.5 text-xs font-bold text-slate-950 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
      >
        {isLoading ? 'Guardando...' : 'Establecer Nueva Contraseña'}
      </button>
    </form>
  );
}
