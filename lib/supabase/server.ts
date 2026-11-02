import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseJsClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import {
  resolveSupabaseUrl,
  resolveSupabaseAdminKey,
  getOrderAdminConfigStatus,
} from "./supabase-core.mjs";

export { getOrderAdminConfigStatus };

export async function createClient() {
  const cookieStore = await cookies();
  const url = resolveSupabaseUrl() || process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createServerClient(
    url,
    publishableKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing user sessions.
          }
        },
      },
    }
  );
}

/**
 * Cliente exclusivo de servidor para operaciones autorizadas de pedidos y pagos.
 * Utiliza SUPABASE_SECRET_KEY o SUPABASE_SERVICE_ROLE_KEY para persistir en PostgreSQL
 * sin ser bloqueado por RLS anónimo. Jamás utiliza credenciales públicas anónimas.
 */
export function createOrderAdminClient() {
  const status = getOrderAdminConfigStatus();

  if (!status.isConfigured) {
    console.error("[MOTOSERVICE Supabase Admin] Configuración incompleta:", {
      hasUrl: status.hasUrl,
      hasSecretKey: status.hasSecretKey,
      missingVariables: status.missingVariables,
    });
    return null;
  }

  const url = resolveSupabaseUrl()!;
  const key = resolveSupabaseAdminKey()!;

  if (status.projectRefMismatch) {
    console.warn(
      "[MOTOSERVICE Supabase Admin] Advertencia de proyecto: La clave administrativa JWT y la URL apuntan a proyectos distintos."
    );
  }

  return createSupabaseJsClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
