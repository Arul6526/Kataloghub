import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

type CookieArgs = { name: string; value: string; options?: Record<string, unknown> };

/**
 * Klien Supabase untuk Server Components, Route Handlers, dan Server Actions.
 * Meneruskan session cookie pengguna sehingga RLS berlaku per request.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieArgs[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set({ name, value, ...(options ?? {}) }),
            );
          } catch {
            // Dipanggil dari Server Component — safe to ignore karena
            // middleware akan me-refresh session pengguna.
          }
        },
      },
    },
  );
}

/**
 * Klien Supabase dengan service role key — melewati RLS.
 * Menggunakan @supabase/supabase-js langsung (bukan @supabase/ssr)
 * agar kompatibel dengan key format sb_secret_ / sb_publishable_.
 * HANYA gunakan di server untuk operasi admin/bootstrap yang sah.
 * Jangan pernah ekspos ke browser.
 */
export function createAdminClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY belum diatur di environment.");
  }
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
