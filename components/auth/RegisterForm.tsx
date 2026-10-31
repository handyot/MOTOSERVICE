'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '../../lib/supabase/client';
import {
  validateEmail,
  validatePassword,
  validateFullName,
  validatePhone,
} from '../../lib/auth/validations';
import { Icon } from '../ui/Icons';

export function RegisterForm() {
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [emailConfirmationRequired, setEmailConfirmationRequired] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    // Validaciones
    const nameVal = validateFullName(fullName);
    if (!nameVal.valid) {
      setErrorMessage(nameVal.error || 'Nombre inválido.');
      return;
    }

    const emailVal = validateEmail(email);
    if (!emailVal.valid) {
      setErrorMessage(emailVal.error || 'Correo inválido.');
      return;
    }

    const phoneVal = validatePhone(phone);
    if (!phoneVal.valid) {
      setErrorMessage(phoneVal.error || 'Teléfono inválido.');
      return;
    }

    const passVal = validatePassword(password);
    if (!passVal.valid) {
      setErrorMessage(passVal.error || 'Contraseña inválida.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden. Por favor, verifícalas.');
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      const redirectUrl =
        typeof window !== 'undefined'
          ? `${window.location.origin}/auth/callback?next=/cuenta`
          : undefined;

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            phone: phone.trim() || undefined,
          },
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        if (
          error.message.includes('already registered') ||
          error.message.includes('unique constraint')
        ) {
          setErrorMessage('Este correo ya está registrado en NeroElectric Motors. Inicia sesión en su lugar.');
        } else {
          setErrorMessage('No fue posible completar el registro. Verifica tus datos o intenta más tarde.');
        }
        setIsLoading(false);
        return;
      }

      // Si Supabase requiere confirmación por correo (sin sesión inmediata)
      if (data?.user && !data.session) {
        setEmailConfirmationRequired(true);
        setIsLoading(false);
        return;
      }

      // Si hay sesión creada de inmediato, redirigir a /cuenta
      router.push('/cuenta');
      router.refresh();
    } catch (err) {
      console.error('[NeroElectric Motors Register Error]', err);
      setErrorMessage('Ocurrió un error inesperado al conectar con el servidor.');
      setIsLoading(false);
    }
  }

  if (emailConfirmationRequired) {
    return (
      <div className="space-y-5 text-center py-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-950/60 border border-cyan-800/80 text-cyan-400">
          <Icon name="check-circle" className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white">¡Revisa tu correo electrónico!</h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Hemos enviado un enlace de confirmación a{' '}
            <strong className="text-cyan-300">{email}</strong>.
          </p>
          <p className="text-xs text-slate-400">
            Haz clic en el enlace para activar tu cuenta de cliente en NeroElectric Motors. Si no lo ves en unos minutos, revisa tu carpeta de spam.
          </p>
        </div>
        <div className="pt-3">
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
    <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
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

      {/* Nombre Completo */}
      <div>
        <label htmlFor="reg-name" className="block text-xs font-semibold text-gray-700 mb-1">
          Nombre y Apellidos
        </label>
        <input
          id="reg-name"
          type="text"
          autoComplete="name"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          disabled={isLoading}
          placeholder="Juan Pérez"
          className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors disabled:opacity-50"
        />
      </div>

      {/* Correo Electrónico */}
      <div>
        <label htmlFor="reg-email" className="block text-xs font-semibold text-gray-700 mb-1">
          Correo Electrónico
        </label>
        <input
          id="reg-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          placeholder="juan.perez@ejemplo.com"
          className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors disabled:opacity-50"
        />
      </div>

      {/* Teléfono (opcional) */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <label htmlFor="reg-phone" className="block text-xs font-semibold text-gray-700">
            Teléfono Móvil
          </label>
          <span className="text-[11px] text-gray-400">Opcional para avisos</span>
        </div>
        <input
          id="reg-phone"
          type="tel"
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          disabled={isLoading}
          placeholder="+51 987 654 321"
          className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors disabled:opacity-50"
        />
      </div>

      {/* Contraseña */}
      <div>
        <label htmlFor="reg-pass" className="block text-xs font-semibold text-gray-700 mb-1">
          Contraseña
        </label>
        <div className="relative">
          <input
            id="reg-pass"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            placeholder="Mínimo 8 caracteres (letras y números)"
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
        <p className="mt-1 text-[11px] text-gray-400">
          Usa al menos 8 caracteres con combinación de letras y números.
        </p>
      </div>

      {/* Confirmar Contraseña */}
      <div>
        <label htmlFor="reg-confirm" className="block text-xs font-semibold text-gray-700 mb-1">
          Confirmar Contraseña
        </label>
        <input
          id="reg-confirm"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={isLoading}
          placeholder="Repite tu contraseña"
          className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors disabled:opacity-50"
        />
      </div>

      {/* Botón de Registro */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full mt-3 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-[0.99] px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
      >
        {isLoading ? (
          <>
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            <span>Creando cuenta de cliente...</span>
          </>
        ) : (
          <>
            <Icon name="check-circle" className="w-4 h-4 text-white" />
            <span>Crear mi Cuenta</span>
          </>
        )}
      </button>
    </form>
  );
}
