# 🛡️ KatalogHub — Security Hardening Plan

> **Goal:** Menaikkan security score dari **6/10 → 10/10**  
> **Audit Date:** 30 Juli 2026  
> **Total attack surface items:** 37  
> **Coverage:** Auth, API, Database, Storage, XSS, Rate Limiting, Infrastructure, Monitoring

---

## 📊 Security Posture Matrix

| Layer | Current | Target | Risiko jika tidak di-fix |
|-------|---------|--------|--------------------------|
| **Authentication** | 🟡 6/10 | 🔵 10/10 | Brute force admin login, session hijack |
| **API Security** | 🔴 4/10 | 🔵 10/10 | Spam order leads, abuse tracking, data polling |
| **Database/RLS** | 🔴 3/10 | 🔵 10/10 | Data leakage antar tenant via service role |
| **XSS Prevention** | 🟡 6/10 | 🔵 10/10 | Store owner bisa inject JS di landing page |
| **Infrastructure** | 🔴 2/10 | 🔵 10/10 | Clickjacking, MIME sniffing, CSP bypass |
| **Rate Limiting** | 🔴 0/10 | 🔵 9/10 | DDoS API endpoints, brute force |
| **Monitoring** | 🔴 1/10 | 🔵 9/10 | Blind to attacks, no audit trail |
| **Data Privacy** | 🟡 5/10 | 🔵 9/10 | Hardcoded bank accounts, no PII sanitization |
| **Storage Security** | 🟡 5/10 | 🔵 9/10 | Public bucket tanpa RLS proper |
| **Total** | **🔴 3.5/10** | **🔵 9.5/10** | |

---

## 📋 Task Breakdown

### 🔴 PHASE 1 — Critical (Harus sebelum domain publik)

#### T1. Fix Auth Redirect & Guard
**Files:** `src/lib/auth.ts`, `src/middleware.ts`

**Masalah:**
- `redirect("/login")` → 404, seharusnya `/admin/login`
- Superadmin guard terlalu longgar (`is_admin` juga bisa akses)

**Fix:**
```typescript
// auth.ts — fix redirect
export async function requireAdmin() {
  const current = await getCurrentUser();
  if (!current) {
    redirect("/admin/login"); // FIXED: was "/login"
  }
  return current;
}

// auth.ts — tight superadmin check
export async function requireSuperAdmin() {
  const current = await getCurrentUser();
  if (!current) redirect("/admin/login?redirect=/superadmin");
  // Hanya role explicit "superadmin"
  if (current.profile.role !== "superadmin") {
    redirect("/admin?error=superadmin-required");
  }
  return current;
}
```

**Effort:** 15 menit  
**Risk if skipped:** 🔴 404 on session expiry, privilege escalation

---

#### T2. Security Headers + CSP
**File:** `next.config.ts`

**Masalah:** Zero security headers, vulnerable to clickjacking, XSS, MIME sniffing.

**Fix:**
```typescript
const nextConfig: NextConfig = {
  // ...existing config
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Next.js needs inline
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https://*.supabase.co https:",
              "font-src 'self' data:",
              "connect-src 'self' https://*.supabase.co https://api.unsplash.com",
              "frame-ancestors 'none'",
              "base-uri 'none'",
              "form-action 'self'",
            ].join("; "),
          },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};
```

**Effort:** 30 menit  
**Risk if skipped:** 🔴 Clickjacking, XSS vector via HTML injection

---

#### T3. Rate Limiting Middleware
**Files:** `src/lib/rate-limit.ts` (baru), `src/middleware.ts` (update)

**Masalah:** Bruteforce login, spam order leads, abuse tracking — tidak ada proteksi sama sekali.

**Implementation — In-Memory Rate Limiter:**
```typescript
// src/lib/rate-limit.ts
const rateMap = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(
  key: string,
  maxAttempts: number = 10,
  windowMs: number = 60_000
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateMap.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxAttempts - 1 };
  }

  if (entry.count >= maxAttempts) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: maxAttempts - entry.count };
}

// Periodic cleanup (every 5 menit)
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateMap) {
      if (now > entry.resetAt) rateMap.delete(key);
    }
  }, 300_000);
}
```

**Middleware integration:**
```typescript
// src/middleware.ts — tambah rate limit
export async function middleware(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "unknown";

  // Rate limit API endpoints (20 req/min per IP)
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const { allowed, remaining } = rateLimit(`api:${ip}`, 20, 60_000);
    if (!allowed) {
      return new NextResponse(JSON.stringify({ error: "Too many requests" }), {
        status: 429,
        headers: {
          "Retry-After": "60",
          "X-RateLimit-Remaining": String(remaining),
        },
      });
    }
  }

  // Rate limit login (5 attempts per 15 menit per IP)
  if (request.nextUrl.pathname === "/admin/login/action") {
    const { allowed, remaining } = rateLimit(`login:${ip}`, 5, 900_000);
    if (!allowed) {
      return NextResponse.json(
        { error: "Terlalu banyak percobaan login. Coba lagi dalam 15 menit." },
        { status: 429 }
      );
    }
  }

  return await updateSession(request);
}
```

**Effort:** 1 jam  
**Risk if skipped:** 🔴 Brute force unlimited, API abuse

---

#### T4. Input Validation untuk Order Lead API
**File:** `src/app/api/order-lead/route.ts`

**Masalah:** No validation, anyone can POST any data. Tidak ada rate limiting, tidak ada sanitasi.

**Fix:**
```typescript
import { z } from "zod";

const orderLeadSchema = z.object({
  storeSlug: z.string().min(1).max(60)
    .regex(/^[a-z0-9-]+$/, "Invalid store slug"),
  itemsSummary: z.string().min(1).max(2000),
  totalPrice: z.number().nonnegative().max(999_999_999).optional().default(0),
  customerName: z.string().max(120).optional(),
});

export async function POST(req: NextRequest) {
  try {
    // Rate limit check
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const { allowed } = rateLimit(`order-lead:${ip}`, 10, 60_000); // 10 per minute
    if (!allowed) {
      return NextResponse.json({ error: "Too many orders" }, { status: 429 });
    }

    const body = await req.json();
    const parsed = orderLeadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Data tidak valid", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { storeSlug, itemsSummary, totalPrice, customerName } = parsed.data;

    // Verify store slug exists
    const supabase = createAdminClient();
    const { data: settings } = await supabase
      .from("site_settings")
      .select("user_id")
      .eq("store_slug", storeSlug)
      .maybeSingle();

    if (!settings?.user_id) {
      return NextResponse.json({ error: "Toko tidak ditemukan" }, { status: 404 });
    }

    // Sanitize input
    const sanitizedSummary = itemsSummary
      .replace(/<[^>]*>/g, "")  // Strip HTML tags
      .slice(0, 2000);
    const sanitizedName = (customerName || "Pelanggan Katalog")
      .replace(/<[^>]*>/g, "")
      .slice(0, 120);

    await supabase.from("order_leads").insert({
      user_id: settings.user_id,
      store_slug: storeSlug,
      customer_name: sanitizedName,
      items_summary: sanitizedSummary,
      total_price: Math.max(0, Math.min(totalPrice, 999_999_999)),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[Order Lead API]", error);
    return NextResponse.json({ ok: true }); // Tetap return ok biar WA flow gak broken
  }
}
```

**Effort:** 1 jam  
**Risk if skipped:** 🟠 Database pollution, spam order leads

---

#### T5. XSS Prevention — Custom Landing Page
**File:** `src/app/lp/[slug]/route.ts`

**Masalah:** `page.html_source` dirender mentah. Store owner bisa inject script jahat. Jika ada XSS, pengunjung toko bisa dicuri cookie/session.

**Fix — DOMPurify server-side:**
```bash
npm install isomorphic-dompurify
```

```typescript
// src/lib/sanitize-html.ts
import DOMPurify from "isomorphic-dompurify";

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "h1", "h2", "h3", "h4", "h5", "h6",
      "p", "br", "hr",
      "ul", "ol", "li",
      "table", "thead", "tbody", "tr", "th", "td",
      "div", "span", "section",
      "a", "img",
      "strong", "em", "b", "i", "u", "s",
      "blockquote", "pre", "code",
      "figure", "figcaption",
    ],
    ALLOWED_ATTR: ["href", "target", "rel", "src", "alt", "class", "id", "style"],
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
  });
}
```

```typescript
// lp/[slug]/route.ts — di handler GET
const page = await fetchCustomLandingPageBySlug(slug);
// ... validasi
let html = page.html_source;
html = sanitizeHtml(html); // ← SANITIZE BEFORE RENDER!
```

**Effort:** 1 jam  
**Risk if skipped:** 🔴 Full XSS — bisa steal cookies, redirect ke phishing

---

#### T6. Hardcoded Secrets Removal
**Files:** 
- `src/lib/whatsapp.ts` — `PLATFORM_ADMIN_WA` fallback `628123456789`
- `src/lib/actions/saas-actions.ts` — default bank accounts

**Masalah:** Nomor WA admin palsu dan rekening bank palsu hardcoded di source. Kalau env variable gak di-set, fallback ke data palsu.

**Fix:**
```typescript
// whatsapp.ts — jangan pernah fallback ke hardcoded
export const PLATFORM_ADMIN_WA = (() => {
  const wa = process.env.NEXT_PUBLIC_ADMIN_WA;
  if (!wa || !/^\d{10,15}$/.test(wa.replace(/\D/g, ""))) {
    return null; // null lebih aman daripada nomor palsu
  }
  return formatWhatsAppNumber(wa);
})();
```

```typescript
// saas-actions.ts — default bank accounts → null instead of fake data
const defaultAccounts: PlatformBankAccount[] = []; // empty is safer
const defaultInstructions = "Silakan hubungi admin untuk informasi pembayaran.";
```

**Effort:** 15 menit  
**Risk if skipped:** 🟠 Pengunjung lihat data rekening palsu, WA ke nomor salah

---

#### T7. CSRF Protection untuk Bootstrap
**File:** `src/app/admin/bootstrap/action/route.ts`

**Masalah:** Endpoint tanpa CSRF token, tanpa rate limit. If `has_no_admin()` somehow returns true (bug RPC), bisa dibuat admin baru.

**Fix:**
```typescript
// Generate dan validasi CSRF token untuk bootstrap
import { createHash, randomBytes } from "crypto";

const BOOTSTRAP_TOKENS = new Map<string, number>(); // token → expiry

export function generateBootstrapToken(): string {
  const token = randomBytes(32).toString("hex");
  BOOTSTRAP_TOKENS.set(token, Date.now() + 600_000); // 10 menit valid
  return token;
}

export function validateBootstrapToken(token: string): boolean {
  const expiry = BOOTSTRAP_TOKENS.get(token);
  if (!expiry || Date.now() > expiry) return false;
  BOOTSTRAP_TOKENS.delete(token);
  return true;
}
```

```typescript
// bootstrap/action/route.ts — tambah CSRF check
export async function POST(req: NextRequest) {
  // CSRF check
  const csrfToken = req.headers.get("x-csrf-token");
  if (!csrfToken || !validateBootstrapToken(csrfToken)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 403 });
  }

  // Rate limit
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const { allowed } = rateLimit(`bootstrap:${ip}`, 3, 3600_000); // 3 attempts per jam
  if (!allowed) {
    return NextResponse.json({ error: "Too many attempts" }, { status: 429 });
  }

  const { data: noAdmin } = await supabase.rpc("has_no_admin").single();
  if (!noAdmin) {
    return NextResponse.json({ error: "Admin sudah ada" }, { status: 403 });
  }

  // ... sisanya sama
}
```

**Effort:** 45 menit  
**Risk if skipped:** 🟠 Unauthorized admin creation

---

### 🟠 PHASE 2 — High Priority (1-2 hari)

#### T8. RLS Policy Implementation
**File:** Migrasi SQL (via Supabase Dashboard atau migration file)

**Masalah:** Semua operasi pakai `createAdminClient()` (service role), jadi RLS gak pernah di-test.

**Fix — RLS Policies:**
```sql
-- 1. Aktifkan RLS di semua tabel
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE landing_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_landing_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_spec_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_documents ENABLE ROW LEVEL SECURITY;

-- 2. Policy untuk products: owner hanya bisa lihat/edit produknya sendiri
CREATE POLICY "products_owner_select"
  ON products FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "products_owner_insert"
  ON products FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "products_owner_update"
  ON products FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "products_owner_delete"
  ON products FOR DELETE
  USING (user_id = auth.uid());

-- 3. Policy untuk public: hanya visible product
CREATE POLICY "products_public_select"
  ON products FOR SELECT
  USING (is_visible = true);

-- 4. Policy untuk superadmin: bisa lihat semua
CREATE POLICY "products_superadmin_all"
  ON products FOR ALL
  USING (auth.jwt() ->> 'role' = 'superadmin');
```

**Setelah RLS aktif, migrasi bertahap dari `createAdminClient()` ke `createClient()`:**
- `public-data.ts` → tetap pakai `createAdminClient()` (butuh akses all rows untuk render toko)
- `product-actions.ts` → bisa pindah ke `createClient()` + RLS filter by user_id
- Admin pages → bisa pindah ke `createClient()`

**Effort:** 3-4 jam  
**Risk if skipped:** 🟠 Data leakage antar tenant via service role key leak

---

#### T9. Brute Force Protection — Progressive Delay
**File:** `src/app/admin/login/action/route.ts`

**Masalah:** Tidak ada batasan jumlah percobaan login. Attacker bisa brute force password.

**Fix:**
```typescript
// Tambah progressive delay based on attempt count
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const attempt = loginAttempts.get(ip) || { count: 0, lastAttempt: 0 };

  // Progressive delay: 1s → 2s → 4s → 8s → 16s → 30s
  const delays = [0, 1000, 2000, 4000, 8000, 16000, 30000];
  const delay = delays[Math.min(attempt.count, delays.length - 1)];
  if (delay > 0) {
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  const body = await req.json();
  const email = String(body.email ?? "").trim();
  const password = String(body.password ?? "");

  // Di bawah ini rate limit 5 attempts / 15 menit (dari middleware)
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    // Increment attempt counter
    loginAttempts.set(ip, { count: attempt.count + 1, lastAttempt: Date.now() });

    // Lockout setelah 10 gagal
    if (attempt.count >= 10) {
      return NextResponse.json(
        { error: "Akun terkunci sementara. Coba lagi dalam 30 menit." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "Email atau kata sandi salah" },
      { status: 401 }
    );
  }

  // Reset counter on success
  loginAttempts.delete(ip);

  // ... sisanya
}
```

**Effort:** 1 jam  
**Risk if skipped:** 🟠 Brute force attack sukses

---

#### T10. Input Validation Library — Zod di Semua API
**Files:** 
- `src/app/api/order-lead/route.ts` ✓ (fix di T4)
- `src/app/api/track/route.ts`
- `src/app/admin/login/action/route.ts`
- `src/app/admin/landing/upload/route.ts`
- `src/app/api/admin/products/export/route.ts`

**Masalah:** Tracking endpoint terima input tanpa validasi minimal.

**Fix — track API:**
```typescript
const trackSchema = z.object({
  path: z.string().min(1).max(500)
    .regex(/^\//, "Path harus dimulai dengan /"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = trackSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }

    const { path } = parsed.data;
    // ... sisanya
  }
}
```

**Effort:** 2 jam untuk semua endpoint  
**Risk if skipped:** 🟢 Data quality issues, minor injection vectors

---

#### T11. Supabase Storage RLS
**Masalah:** Bucket `product-images`, `product-documents`, `category-media`, `landing-media`, `brand-assets` menggunakan service role untuk upload dan public URL untuk akses. Tidak ada RLS policy.

**Fix di Supabase SQL:**
```sql
-- Product images: public read, authenticated write
CREATE POLICY "product_images_public_select"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "product_images_auth_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'product-images'
    AND auth.role() = 'authenticated'
  );

-- Repeat for each bucket...
```

**Effort:** 30 menit  
**Risk if skipped:** 🟡 Anyone with the storage URL could potentially upload via service role

---

#### T12. Audit Logging untuk Admin Actions
**File:** `src/lib/audit-log.ts` (baru)

**Masalah:** Tidak ada catatan siapa melakukan apa di admin panel. Kalau ada kejadian, impossible untuk trace.

**Fix:**
```typescript
// src/lib/audit-log.ts
import { createAdminClient } from "./supabase/server";

export type AuditAction =
  | "product.create" | "product.update" | "product.delete"
  | "category.create" | "category.update" | "category.delete"
  | "admin.login" | "admin.logout"
  | "subscription.update" | "subscription.extend"
  | "superadmin.access"
  | "settings.update"
  | "landing.update";

export async function logAudit(
  userId: string,
  action: AuditAction,
  metadata?: Record<string, unknown>
) {
  const supabase = createAdminClient();
  try {
    await supabase.from("audit_logs").insert({
      user_id: userId,
      action,
      metadata: metadata || {},
      ip_address: null, // TODO: pass from request
      user_agent: null,
    });
  } catch (e) {
    console.error("[Audit Log] Failed:", e);
    // Jangan throw — audit log failure gak boleh block main flow
  }
}
```

**Integrasi di product actions:**
```typescript
// product-actions.ts — setelah save sukses
await logAudit(userId, input.id ? "product.update" : "product.create", {
  productId,
  productName: input.name,
});
```

**Effort:** 2 jam  
**Risk if skipped:** 🟡 No audit trail, hard to investigate security incidents

---

#### T13. Environment Variable Validation di Startup
**File:** `src/lib/env.ts` (baru)

**Masalah:** Import `createAdminClient()` bisa throw error kalau `SUPABASE_SERVICE_ROLE_KEY` gak di-set, tapi baru ketahuan pas runtime.

**Fix:**
```typescript
// src/lib/env.ts
const requiredEnvVars = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
] as const;

const optionalEnvVars = [
  "NEXT_PUBLIC_ADMIN_WA",
] as const;

export function validateEnv() {
  const missing: string[] = [];
  for (const key of requiredEnvVars) {
    if (!process.env[key]) missing.push(key);
  }
  if (missing.length > 0) {
    throw new Error(
      `❌ Missing required environment variables:\n  ${missing.join("\n  ")}\n` +
      "Check .env.local or Coolify environment settings."
    );
  }

  // Validate URL format
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  if (!url.startsWith("https://")) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL harus https://");
  }
}

// Panggil di layout.tsx atau early in app lifecycle
```

**Effort:** 30 menit  
**Risk if skipped:** 🟢 Runtime error instead of startup error

---

### 🔵 PHASE 3 — Medium (3-5 hari)

#### T14. Supabase Row Level Security — Migrasi Bertahap
**Masalah:** Semua admin query pakai `createAdminClient()` (service role). After RLS policies applied, kita perlu migrasi bertahap.

**Strategy:**
1. Buat RLS policies (T8)
2. **Ganti `product-actions.ts`** — pindah ke `createClient()` karena sudah filter user_id via RLS
3. **Ganti admin pages** — pindah ke `createClient()`
4. **`public-data.ts` tetap pakai service role** — karena perlu akses multi-tenant untuk toko publik
5. Tambah middleware yang detect kalau `createClient()` di admin area dan user_id gak match → block

**Effort:** 4-6 jam  
**Risk if skipped:** 🟡 Service role key exposure risk lebih tinggi

---

#### T15. Cookie Security — Session Configuration
**File:** Supabase SSR config di `src/lib/supabase/server.ts` dan `middleware.ts`

**Masalah:** Cookie default Supabase bisa diakses JavaScript (no httpOnly flag), dan tidak ada sameSite strict.

**Fix:**
```typescript
// server.ts — set cookie options
return createServerClient(url, anonKey, {
  cookies: {
    getAll() { return cookieStore.getAll(); },
    setAll(cookiesToSet) {
      cookiesToSet.forEach(({ name, value, options }) =>
        cookieStore.set(name, value, {
          ...options,
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax", // strict bisa break redirect flow
          path: "/",
        })
      );
    },
  },
});
```

**Effort:** 30 menit  
**Risk if skipped:** 🟢 Cookie bisa dibaca XSS, CSRF via subdomain

---

#### T16. Remove Console Log dari Production
**Files:** Scan `console.log`, `console.error` di semua server files.

**Masalah:** Console log di production bisa expose data sensitif (user_id, email, product names) dan memory leak.

**Fix:** Ganti `console.log` di `product-actions.ts:75` dengan silent. Ganti `console.error` dengan structured logger.

```typescript
// src/lib/logger.ts
const isDev = process.env.NODE_ENV === "development";

export const logger = {
  info: (msg: string, ...args: unknown[]) => {
    if (isDev) console.log(`[INFO] ${msg}`, ...args);
  },
  error: (msg: string, ...args: unknown[]) => {
    // Di production, kirim ke Sentry
    console.error(`[ERROR] ${msg}`, ...args);
  },
  warn: (msg: string, ...args: unknown[]) => {
    if (isDev) console.warn(`[WARN] ${msg}`, ...args);
  },
};
```

**Effort:** 1 jam  
**Risk if skipped:** 🟢 Data leak via logs, memory leak

---

#### T17. Session Timeout & Refresh
**Masalah:** Session Supabase default long-lived. Admin yang lupa logout bisa diakses orang lain.

**Fix di middleware:**
```typescript
// middleware.ts — tambah session timeout check
const SESSION_TIMEOUT = 60 * 60 * 1000; // 1 jam inactivity

// Di updateSession:
if (user) {
  const lastActivity = request.cookies.get("last_activity")?.value;
  const now = Date.now();

  if (lastActivity && (now - Number(lastActivity)) > SESSION_TIMEOUT) {
    // Session expired — sign out
    await supabase.auth.signOut();
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("expired", "true");
    return NextResponse.redirect(url);
  }

  // Update last activity
  supabaseResponse.cookies.set("last_activity", String(now), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: SESSION_TIMEOUT / 1000,
  });
}
```

**Effort:** 1 jam  
**Risk if skipped:** 🟢 Abandoned sessions bisa diakses publik

---

### 🟢 PHASE 4 — Monitoring & Infrastructure (1 minggu)

#### T18. Sentry Error Tracking
```bash
npm install @sentry/nextjs
npx sentry-wizard -i nextjs
```

**Konfigurasi:**
```typescript
// sentry.client.config.ts
import * as Sentry from "@sentry/nextjs";
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1, // 10% di production
  environment: process.env.NODE_ENV,
});

// sentry.server.config.ts — sama, dengan sample rate lebih tinggi
```

**Effort:** 1 jam  
**Benefit:** Lihat error realtime, performance monitoring

---

#### T19. Health Check Endpoint
```typescript
// src/app/api/health/route.ts
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET() {
  const checks = {
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  };

  try {
    const supabase = createAdminClient();
    const { count } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true });
    checks.db = "connected";
  } catch (e) {
    checks.db = "error";
    checks.status = "degraded";
  }

  const status = checks.status === "ok" ? 200 : 503;
  return NextResponse.json(checks, { status });
}
```

**Effort:** 15 menit  
**Benefit:** Monitoring Coolify auto-restart, uptime tracking

---

#### T20. Automated Security Testing Playwright
```typescript
// e2e/security.spec.ts
import { test, expect } from "@playwright/test";

test("security headers exist", async ({ page }) => {
  const response = await page.goto("/admin/login");
  const headers = await response?.allHeaders();
  expect(headers["x-frame-options"]).toBe("DENY");
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["strict-transport-security"]).toBeDefined();
});

test("login rate limiting", async ({ page }) => {
  for (let i = 0; i < 6; i++) {
    await page.goto("/admin/login");
    await page.fill("#email", "test@test.com");
    await page.fill("#password", "wrongpassword");
    await page.click("button[type=submit]");
  }
  const toast = await page.locator(".toast-error");
  await expect(toast).toContainText("Terlalu banyak");
});

test("XSS not possible in order lead", async ({ page }) => {
  const response = await page.request.post("/api/order-lead", {
    data: {
      storeSlug: "<script>alert('xss')</script>",
      itemsSummary: "test",
    },
  });
  expect(response.status()).toBe(400); // Harus ditolak
});
```

**Effort:** 2-3 jam  
**Benefit:** Regression test untuk security fixes

---

## 📋 Executive Summary — Prioritized Task List

| ID | Task | Effort | Impact | Priority |
|----|------|--------|--------|----------|
| T1 | Fix auth redirect & guard | 15m | 🔴 Critical | **Week 1** |
| T2 | Security headers + CSP | 30m | 🔴 Critical | **Week 1** |
| T3 | Rate limiting middleware | 1h | 🔴 Critical | **Week 1** |
| T4 | Input validation order-lead | 1h | 🟠 High | **Week 1** |
| T5 | XSS prevention landing page | 1h | 🔴 Critical | **Week 1** |
| T6 | Remove hardcoded secrets | 15m | 🟠 High | **Week 1** |
| T7 | CSRF bootstrap endpoint | 45m | 🟠 High | **Week 1** |
| T8 | RLS policies | 3-4h | 🟠 High | **Week 2** |
| T9 | Brute force protection | 1h | 🟠 High | **Week 2** |
| T10 | Zod validation semua API | 2h | 🟡 Medium | **Week 2** |
| T11 | Storage RLS | 30m | 🟡 Medium | **Week 2** |
| T12 | Audit logging | 2h | 🟡 Medium | **Week 2** |
| T13 | Env validation startup | 30m | 🟢 Low | **Week 2** |
| T14 | Migrasi ke RLS (createClient) | 4-6h | 🟡 Medium | **Week 3** |
| T15 | Cookie security config | 30m | 🟡 Medium | **Week 3** |
| T16 | Remove console.log | 1h | 🟢 Low | **Week 3** |
| T17 | Session timeout | 1h | 🟢 Low | **Week 3** |
| T18 | Sentry error tracking | 1h | 🟡 Medium | **Week 3** |
| T19 | Health check endpoint | 15m | 🟢 Low | **Week 3** |
| T20 | Automated security tests | 2-3h | 🟢 Low | **Week 4** |

**Total estimated effort:** ~25 jam (3-4 hari kerja full)

---

## 🏁 Security Score Progression

```
Current:  🔴 3.5/10
           ↓
Week 1:   🟡 6.5/10  (Auth fix + headers + rate limit + XSS + CSRF)
           ↓
Week 2:   🟡 8.0/10  (RLS + brute force + validation + audit + storage)
           ↓
Week 3:   🔵 9.5/10  (Cookie + session + sentry + health + env validation)
           ↓
Week 4:   🔵 10/10   (Automated tests + performance review)
```

---

## 🚨 Danger Items — Impact Analysis

| Attack Vector | Likelihood | Impact | Risk |
|--------------|-----------|--------|------|
| Brute force admin login | 🟠 Medium | 🔴 Full admin access | **HIGH** |
| XSS via custom LP | 🟢 Low | 🔴 Steal cookies, redirect | **HIGH** |
| Spam order leads | 🔴 High | 🟡 Data pollution | **MEDIUM** |
| Service role key leak | 🟢 Low | 🔴 All data accessible | **HIGH** |
| Clickjacking admin | 🟢 Low | 🔴 Admin action hijack | **MEDIUM** |
| DDoS API endpoints | 🟡 Medium | 🟡 Service disruption | **MEDIUM** |
| Session hijack | 🟡 Medium | 🟡 Access as admin | **MEDIUM** |
| Hardcoded secrets exposed | 🟡 Medium | 🟡 Fake bank details | **LOW** |

---

## 🔧 Recommended Tools

| Tool | Purpose | License |
|------|---------|---------|
| **isomorphic-dompurify** | Server-side HTML sanitization | MIT |
| **@sentry/nextjs** | Error + performance monitoring | Free tier |
| **@upstash/ratelimit** | Serverless rate limiting (Redis) | Free tier |
| **Playwright** | E2E security testing | Apache 2.0 |
| **zod** | Input validation (already installed) | MIT |

---

## ✅ Verifikasi Security Checklist

Sebelum go-live, jalankan:

```bash
# 1. Security headers check
curl -s -I https://yourdomain.com | grep -E "X-Frame|X-Content|Strict-Transport|Content-Security|Referrer-Policy"

# 2. Rate limit test (20 requests rapid)
for i in $(seq 1 25); do
  curl -s -o /dev/null -w "%{http_code} " \
    -X POST https://yourdomain.com/api/order-lead \
    -H "Content-Type: application/json" \
    -d '{"storeSlug":"test","itemsSummary":"test"}'
done
# Expect: 200 200 ... 429 setelah >20

# 3. Brute force test
for i in $(seq 1 15); do
  curl -s -o /dev/null -w "%{http_code} " \
    -X POST https://yourdomain.com/admin/login/action \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@test.com","password":"wrong"}'
done
# Expect: 401 401 ... 429 dengan delay progresif

# 4. XSS test
curl -s https://yourdomain.com/lp/xss-test \
  | grep -c "<script>" || echo "No XSS vector found"

# 5. Build + lint
npm run build && npm run lint && npx tsc --noEmit

# 6. Sentry test
curl https://yourdomain.com/api/sentry-test  # Harus muncul di Sentry dashboard
```

---

> **Generated:** 30 Juli 2026 | **Auditor:** AI-assisted | **Status:** 🔴 Security score 3.5/10 → 🎯 Target 10/10  
> **File:** `KatalogHub-go-live/SECURITY-HARDENING.md`
