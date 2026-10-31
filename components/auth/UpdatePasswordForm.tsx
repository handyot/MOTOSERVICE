'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../lib/supabase/client';
import { validatePassword } from '../../lib/auth/validations';
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
        password: password,
      });

      if (error) {
        setErrorMessage(
          'No se pudo actualizar la contraseña. El enlace de recuperación puede haber expirado. Solicita uno nuevo.'
        );
        setIsLoading(false);
        return;
      }

      // Redirigir al login con mensaje de confirmación
      router.push('/login?message=password_updated');
    } catch (err) {
      console.error('[MOTOSERVICE Update Password Error]', err);
      setErrorMessage('Ocurrió un error inesperado al actualizar la contraseña.');
      setIsLoading(false);
    }
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

      {/* Nueva Contraseña */}
      <div>
        <label htmlFor="new-pass" className="block text-xs font-semibold text-slate-300 mb-1.5">
          Nueva Contraseña
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
            className="w-full rounded-lg border border-slate-700 bg-slate-950/80 px-3.5 py-2.5 pr-10 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-colors disabled:opacity-50"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-white"
            aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
          >
            <Icon name={showPassword ? 'x' : 'zap'} className="w-4 h-4" />
          </button>
        </div>
        <p className="mt-1 text-[11px] text-slate-400">
          Usa al menos 8 caracteres combinando letras y números.
        </p>
      </div>

      {/* Confirmar Nueva Contraseña */}
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
          className="w-full rounded-lg border border-slate-700 bg-slate-950/80 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-colors disabled:opacity-50"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full mt-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/20 hover:brightness-110 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
            <span>Guardando contraseña...</span>
          </>
        ) : (
          <>
            <Icon name="check-circle" className="w-4 h-4 text-slate-950" />
            <span>Establecer Nueva Contraseña</span>
          </>
        )}
      </button>
    </form>
  );
}
