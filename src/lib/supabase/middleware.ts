import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type CookieArgs = { name: string; value: string; options?: Record<string, unknown> };

/**
 * Helper untuk memperbarui session Supabase di setiap request.
 * Dipanggil dari middleware.ts (root). Menyegarkan access token bila perlu
 * dan menempelkan cookie yang diperbarui ke response.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieArgs[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAdminArea = pathname.startsWith("/admin");
  const isSuperAdminArea = pathname.startsWith("/superadmin");
  const isLoginPage = pathname === "/admin/login" || pathname === "/login";
  const isAuthApi =
    pathname.startsWith("/admin/login/callback") ||
    pathname === "/admin/login/action";

  // Pengunjung belum login mengakses area admin atau superadmin -> arahkan ke login.
  if ((isAdminArea || isSuperAdminArea) && !isLoginPage && !isAuthApi && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Admin yang sudah login tapi mengunjungi halaman login -> dashboard.
  if (isLoginPage && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
