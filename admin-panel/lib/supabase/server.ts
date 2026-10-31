import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseJsClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

if (typeof window !== "undefined") {
  throw new Error(
    "[SEGURIDAD MOTOSERVICE] lib/supabase/server.ts solo puede ejecutarse en el servidor."
  );
}

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
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
            // Ignorado cuando se invoca desde un Server Component; proxy.ts refresca la sesión.
          }
        },
      },
    }
  );
}

/**
 * Cliente exclusivo de servidor para persistencia administrativa en tablas de catálogo.
 * IMPORTANTE: Solo debe invocarse DESPUÉS de haber verificado requireAdmin() o requireAdminApi().
 * Si SUPABASE_SECRET_KEY o SUPABASE_SERVICE_ROLE_KEY está configurada en el servidor, la utiliza
 * sin exponerla jamás al cliente; de lo contrario utiliza el cliente SSR autenticado.
 */
export async function createCatalogWriteClient() {
  const supabaseUrl =
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey =
    process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (supabaseUrl && secretKey) {
    return createSupabaseJsClient(supabaseUrl, secretKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return createClient();
}
