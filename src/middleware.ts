import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { loginRateLimiter, apiRateLimiter, trackRateLimiter } from "@/lib/security/rate-limiter";
import { getClientIp } from "@/lib/security/input-validator";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const clientIp = getClientIp(request.headers);

  // ── Rate Limiting for Login ──
  if ((pathname === "/admin/login" || pathname === "/admin/login/action") && request.method === "POST") {
    const { allowed, retryAfterMs } = loginRateLimiter.check(clientIp);
    if (!allowed) {
      return NextResponse.json(
        { error: "Terlalu banyak percobaan login. Coba lagi nanti." },
        {
          status: 429,
          headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) },
        }
      );
    }
  }

  // ── Rate Limiting for Order Lead API ──
  if (pathname === "/api/order-lead" && request.method === "POST") {
    const { allowed, retryAfterMs } = apiRateLimiter.check(clientIp);
    if (!allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        {
          status: 429,
          headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) },
        }
      );
    }
  }

  // ── Rate Limiting for Tracking API ──
  if (pathname === "/api/track" && request.method === "POST") {
    const { allowed, retryAfterMs } = trackRateLimiter.check(clientIp);
    if (!allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        {
          status: 429,
          headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) },
        }
      );
    }
  }

  // ── Session refresh for admin/superadmin/login routes ──
  if (pathname.startsWith("/admin") || pathname.startsWith("/superadmin") || pathname === "/login") {
    return await updateSession(request);
  }

  return NextResponse.next();
}

export const config = {
  // Proteksi area admin + API routes publik yang butuh rate limiting.
  matcher: [
    "/admin/:path*",
    "/superadmin/:path*",
    "/login",
    "/api/order-lead",
    "/api/track",
  ],
};
