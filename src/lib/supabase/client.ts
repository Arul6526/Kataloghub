import { createBrowserClient } from "@supabase/ssr";

/**
 * Klien Supabase untuk digunakan di Client Components.
 * Pakai NEXT_PUBLIC_* env agar aman diekspos ke browser.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
