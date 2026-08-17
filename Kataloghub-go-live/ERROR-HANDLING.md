# 🚨 KatalogHub — Error Handling & Resilience Plan

> **Goal:** Menaikkan error handling score dari **3/10 → 9/10**  
> **Audit Date:** 30 Juli 2026  
> **Total issues found:** 12  
> **Current state:** Zero error boundaries, mixed patterns, silent failures

---

## 📋 Ringkasan Score

| Layer | Before | After | Key Gap |
|-------|--------|-------|---------|
| **Next.js Error Boundaries** | 0/10 | 10/10 | ❌ **Zero** error.tsx, loading.tsx, not-found.tsx, global-error.tsx |
| **Server Actions Pattern** | 5/10 | 9/10 | ❌ Mixed `throw` vs `ActionResult` — inconsistency |
| **API Routes** | 4/10 | 9/10 | ❌ Unhandled rejections, no typed errors |
| **Client-side UX** | 4/10 | 8/10 | ❌ Silent catch blocks, `.catch(() => [])` |
| **Logging & Monitoring** | 3/10 | 8/10 | ❌ console.error only, no Sentry/structured logging |
| **Input Validation** | 7/10 | 9/10 | ✅ Zod exists, but not di semua endpoint |
| **Total** | **3.8/10** | **9/10** | |

---

## 🔍 Current State — Per Layer

### Layer 1: Next.js Error Boundaries ⚠️

**Files that DON'T exist (zero boundary):**
```
❌ src/app/error.tsx                  — global error page
❌ src/app/loading.tsx                — global loading state
❌ src/app/not-found.tsx             — already exists! ✅
❌ src/app/global-error.tsx          — root error boundary
❌ src/app/toko/[store_slug]/error.tsx — toko error boundary
❌ src/app/toko/[store_slug]/loading.tsx — toko loading state
❌ src/app/admin/(shell)/error.tsx   — admin error boundary
❌ src/app/admin/(shell)/loading.tsx — admin loading state
```

**Yang ada cuma:**
```
✅ src/app/not-found.tsx — 404 page (read sebelumnya, bagus)
```

### Layer 2: Server Actions — Mixed Pattern 🔀

**Pattern A — `throw new Error()` (uncaught → 500 page):**
```typescript
// product-actions.ts:73-74
if (error) {
  console.error("Supabase query error in fetchProducts:", error);
  throw new Error(error.message);
}

// custom-landing-actions.ts:33
if (error) throw new Error(error.message);
```

**Masalah:** `throw` di server action akan:
- Trigger Next.js error boundary (kalo ada)
- Kalau gak ada error boundary → **blank page / white screen**
- Pengguna cuma liat "Something went wrong" tanpa konteks

**Pattern B — `ActionResult` (proper):**
```typescript
// product-actions.ts:401-402
if (error) return { ok: false, error: error.message };

// custom-landing-actions.ts:143
if (error) return { ok: false, error: error.message };
```

**Pattern C — Silent catch (worst):**
```typescript
// toko/[store_slug]/page.tsx:41-42
} catch (e) {
  // Ignore error
}

// admin page
const pages = await fetchCustomLandingPages().catch(() => []);
```

**Files dengan `throw` vs `ActionResult`:**

| File | throw new Error | ActionResult | Silent catch |
|------|:-------:|:--------:|:--------:|
| `product-actions.ts` | 3 | 12 | 0 |
| `category-actions.ts` | 3 | 8 | 0 |
| `saas-actions.ts` | 2 | 4 | 0 |
| `custom-landing-actions.ts` | 3 | 5 | 0 |
| `landing-actions.ts` | 1 | 0 | 0 |
| `toko/[store_slug]/page.tsx` | 0 | 0 | 3 |
| `toko/[store_slug]/produk/[slug]/page.tsx` | 0 | 0 | 0 |

### Layer 3: API Routes

**Files:**
- `api/order-lead/route.ts` — ✅ proper try/catch, but no rate limiting
- `api/track/route.ts` — ✅ proper with NextResponse.json
- `api/admin/products/export/route.ts` — ❌ no try/catch, unhandled rejections
- `admin/login/action/route.ts` — ✅ try/catch
- `admin/bootstrap/action/route.ts` — ✅ try/catch
- `lp/[slug]/route.ts` — ❌ `.catch(() => null)` silent, no try wrap

### Layer 4: Client-side UX

**Yang udah bagus:**
- ✅ Toast notifications di login form (`login-form.tsx`)
- ✅ Toast di bootstrap form (`bootstrap-form.tsx`)
- ✅ Toast di admin pages (products, categories, landing)

**Yang kurang:**
- ❌ No loading skeleton / spinner for async operations
- ❌ `.catch(() => [])` — user never knows if data failed to load
- ❌ `// Ignore error` — silent swallow
- ❌ No retry button on failed data load
- ❌ No error toast for failed form submissions (some forms)

---

## 🛠️ Fix Plan

### E1. 🔴 Create Error Boundaries — 5 files

```typescript
// src/app/error.tsx — Global error boundary
'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log ke monitoring service (Sentry, etc.)
    console.error('[Global Error]', error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="max-w-md text-center space-y-4">
        <div className="text-6xl">😵</div>
        <h1 className="text-xl font-bold text-foreground">Terjadi Kesalahan</h1>
        <p className="text-sm text-muted-foreground">
          Maaf, terjadi kesalahan yang tidak terduga. Tim kami sudah mencatat error ini.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Coba Lagi
          </button>
          <a
            href="/"
            className="rounded-lg border border-border bg-card px-5 py-2 text-sm font-semibold hover:bg-muted"
          >
            Kembali ke Beranda
          </a>
        </div>
        {process.env.NODE_ENV === 'development' && (
          <pre className="mt-4 rounded-lg bg-muted p-3 text-left text-xs text-muted-foreground overflow-auto max-h-40">
            {error.message}
            {error.stack && `\n\n${error.stack}`}
          </pre>
        )}
      </div>
    </div>
  );
}
```

```typescript
// src/app/loading.tsx — Global loading
export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
        <p className="text-sm text-muted-foreground">Memuat...</p>
      </div>
    </div>
  );
}
```

```typescript
// src/app/toko/[store_slug]/error.tsx — Toko error boundary
'use client';

export default function TokoError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center p-4">
      <div className="max-w-md text-center space-y-4">
        <div className="text-6xl">🏪</div>
        <h1 className="text-xl font-bold text-foreground">Toko Sedang Bermasalah</h1>
        <p className="text-sm text-muted-foreground">
          Toko ini sedang mengalami gangguan. Silakan coba beberapa saat lagi.
        </p>
        <button onClick={reset} className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground">
          Coba Lagi
        </button>
      </div>
    </div>
  );
}
```

```typescript
// src/app/toko/[store_slug]/loading.tsx — Toko loading skeleton
export default function TokoLoading() {
  return (
    <div className="min-h-screen animate-pulse p-4 space-y-6">
      {/* Hero skeleton */}
      <div className="h-64 rounded-2xl bg-muted" />
      {/* Category grid skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-32 rounded-xl bg-muted" />
        ))}
      </div>
      {/* Product grid skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-64 rounded-xl bg-muted" />
        ))}
      </div>
    </div>
  );
}
```

**Effort:** 30 menit  
**Impact:** 🔴 **User never sees blank page again**

---

### E2. 🔴 Standardize Server Action Error Pattern

**Current:** 3 patterns.  
**Target:** 1 pattern — **always return `ActionResult`, never `throw`**.

```typescript
// src/lib/actions/_types.ts — shared type
export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

// T untuk response data, void untuk mutations
export type MutationResult = ActionResult<void>;
export type QueryResult<T> = ActionResult<T>;
```

**Fix semua `throw new Error` jadi `return { ok: false, error }`:**

```typescript
// product-actions.ts — fetchProducts
// Before:
if (error) {
  console.error("Supabase query error in fetchProducts:", error);
  throw new Error(error.message);
}
const rows = (data ?? []) as ...;
if (rows.length === 0) return { items: [], total: count ?? 0 };

// After:
if (error) {
  console.error("[fetchProducts]", error.message);
  return { items: [], total: 0 }; // Graceful degradation
}
```

**Kenapa gak `throw`?**
- Server actions yang `throw` akan membuat Next.js error boundary — tapi error boundary gak bisa bedain "data kosong" vs "server error"
- Lebih baik return empty data + log error, daripada nampilin error page ke user

**Files yang perlu di-fix (dari `throw` → return error/empty):**

| File | Lines | Change |
|------|-------|--------|
| `product-actions.ts:73` | `throw new Error` | → return empty |
| `product-actions.ts:250` | `throw new Error` | → return `{ ok: false }` |
| `category-actions.ts:36,84` | `throw new Error` | → return `{ ok: false }` |
| `custom-landing-actions.ts:33,49,83` | `throw new Error` | → return empty |
| `landing-actions.ts:31` | `throw new Error` | → return empty |

**Effort:** 1 jam  
**Impact:** 🔴 **Consistent error handling across app**

---

### E3. 🟠 Add Loading States — Skeleton Pattern

**Current:** 5 public pages dengan `force-dynamic` → no streaming, no loading state.

**Fix — Tambah loading.tsx di setiap route segment:**

```
src/app/
├── toko/
│   └── [store_slug]/
│       ├── loading.tsx         ← skeleton toko (baru)
│       ├── error.tsx           ← error toko (baru)
│       ├── page.tsx
│       ├── kategori/
│       │   ├── loading.tsx     ← skeleton kategori (baru)
│       │   └── page.tsx
│       └── produk/
│           └── [slug]/
│               ├── loading.tsx ← skeleton produk detail (baru)
│               └── page.tsx
```

**Component skeleton reusable:**
```typescript
// src/components/ui/skeleton.tsx — sudah ada di shadcn/ui component
// src/components/public/product-card-skeleton.tsx
export function ProductCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-border/80 bg-card p-4 space-y-3">
      <div className="aspect-square rounded-xl bg-muted" />
      <div className="h-4 w-3/4 rounded bg-muted" />
      <div className="h-3 w-1/2 rounded bg-muted" />
    </div>
  );
}

// src/components/public/category-card-skeleton.tsx
export function CategoryCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-border/80 bg-card p-4 space-y-2">
      <div className="h-4 w-1/3 rounded bg-muted" />
      <div className="h-3 w-1/2 rounded bg-muted" />
    </div>
  );
}
```

**Effort:** 30 menit  
**Impact:** 🟠 **Better perceived performance — no blank flash**

---

### E4. 🟠 Replace Silent Catches with Proper Fallbacks

**Files dengan silent catch:**

| File | Line | Current | Fix |
|------|------|---------|-----|
| `toko/[store_slug]/page.tsx:41-42` | `catch (e) { // Ignore error }` | silent | → log + continue |
| `toko/[store_slug]/page.tsx:103` | `.catch(() => [])` | silent | → log + empty array |
| `toko/[store_slug]/page.tsx:139` | `catch (e) {` | silent | → log + continue |
| `admin/.../custom-pages/page.tsx:10` | `.catch(() => [])` | silent | → log + empty array |
| `lp/[slug]/route.ts` | `.catch(() => null)` | silent | → console.warn |

**Pattern baru:**
```typescript
// ── Instead of silent catch ──
let customHome = null;
try {
  customHome = await fetchCustomLandingPageBySlug("home", store_slug);
} catch (e) {
  console.warn("[LandingPage] Custom home page fetch failed:", e instanceof Error ? e.message : e);
  // Continue dengan fallback — user tetap bisa liat toko
}

// ── Instead of .catch(() => []) ──
const products = await fetchLinkedProducts(customHome.product_ids)
  .catch((err) => {
    console.warn("[LandingPage] fetchLinkedProducts failed:", err instanceof Error ? err.message : err);
    return [];
  });
```

**Golden rule:**
- **Log** error (biar developer tau)
- **Continue** dengan fallback value (biar user tetep bisa pake app)
- Jangan **swallow** error tanpa jejak

**Effort:** 30 menit  
**Impact:** 🟠 **No more mystery bugs**

---

### E5. 🟠 Error Logging — Console → Structured Logger

**Current:** Raw `console.error()`, `console.warn()` scattered everywhere.

**Fix — Simple logger utility:**

```typescript
// src/lib/logger.ts
const LOG_LEVELS = { debug: 0, info: 1, warn: 2, error: 3 } as const;
type LogLevel = keyof typeof LOG_LEVELS;

const currentLevel = (process.env.LOG_LEVEL as LogLevel) ?? "info";

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel];
}

export const logger = {
  debug: (module: string, message: string, data?: Record<string, unknown>) => {
    if (!shouldLog("debug")) return;
    if (process.env.NODE_ENV === "development") {
      console.debug(`[${module}] ${message}`, data ?? "");
    }
  },

  info: (module: string, message: string, data?: Record<string, unknown>) => {
    if (!shouldLog("info")) return;
    console.info(`[${module}] ${message}`, data ?? "");
  },

  warn: (module: string, message: string, data?: Record<string, unknown>) => {
    if (!shouldLog("warn")) return;
    console.warn(`[${module}] ${message}`, data ?? "");
    // Future: kirim ke Sentry dengan level "warning"
  },

  error: (module: string, message: string, error?: unknown, data?: Record<string, unknown>) => {
    if (!shouldLog("error")) return;
    const errMsg = error instanceof Error ? error.message : String(error ?? "");
    console.error(`[${module}] ${message}${errMsg ? ` — ${errMsg}` : ""}`, data ?? "");
    // Future: kirim ke Sentry
  },
};

// Usage:
// import { logger } from "@/lib/logger";
// logger.error("fetchProducts", "Supabase query failed", error, { userId });
// logger.warn("LandingPage", "Custom home not found", null, { storeSlug });
```

**Integration dengan Sentry (future):**
```typescript
// Saat Sentry dipasang, tinggal tambah di logger.error():
import * as Sentry from "@sentry/nextjs";

export const logger = {
  // ...
  error: (module, message, error, data) => {
    console.error(`[${module}] ${message}`, error, data ?? "");
    Sentry.withScope((scope) => {
      scope.setTag("module", module);
      scope.setExtra("data", data ?? {});
      Sentry.captureException(error ?? new Error(message));
    });
  },
};
```

**Effort:** 1 jam  
**Impact:** 🟠 **Structured, filterable logs**

---

### E6. 🟡 Add Retry Button / UI Pattern for Failed Data

**Pattern — useReducer for async data:**
```typescript
// src/hooks/use-async-data.ts (custom hook)
import { useCallback, useReducer } from "react";

type State<T> = {
  data: T | null;
  isLoading: boolean;
  error: string | null;
};

type Action<T> =
  | { type: "loading" }
  | { type: "success"; data: T }
  | { type: "error"; error: string };

export function useAsyncData<T>(fetcher: () => Promise<T>) {
  const [state, dispatch] = useReducer(
    (state: State<T>, action: Action<T>): State<T> => {
      switch (action.type) {
        case "loading": return { ...state, isLoading: true, error: null };
        case "success": return { data: action.data, isLoading: false, error: null };
        case "error": return { ...state, isLoading: false, error: action.error };
      }
    },
    { data: null, isLoading: true, error: null }
  );

  const load = useCallback(async () => {
    dispatch({ type: "loading" });
    try {
      const data = await fetcher();
      dispatch({ type: "success", data });
    } catch (err) {
      dispatch({ type: "error", error: err instanceof Error ? err.message : "Gagal memuat data" });
    }
  }, [fetcher]);

  return { ...state, retry: load, load };
}
```

**Pattern — Error UI component:**
```typescript
// src/components/ui/error-display.tsx
export function ErrorDisplay({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
      <div className="text-3xl">⚠️</div>
      <p className="text-sm font-medium text-red-800">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
        >
          Coba Lagi
        </button>
      )}
    </div>
  );
}
```

**Effort:** 1 jam  
**Impact:** 🟡 **User can self-recover from errors**

---

### E7. 🟡 API Route Error Wrapper

**Current:** Every API route has ad-hoc error handling.

**Fix — Unified error wrapper:**
```typescript
// src/lib/api-error.ts
import { NextResponse } from "next/server";

type APIHandler = (req: Request, params: any) => Promise<NextResponse>;

export function withErrorHandler(handler: APIHandler): APIHandler {
  return async (req, params) => {
    try {
      return await handler(req, params);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Internal server error";
      const status = error instanceof SyntaxError ? 400 : 500;

      console.error(`[API] ${req.method} ${req.url} — ${message}`);

      return NextResponse.json(
        { error: message, ok: false },
        { status }
      );
    }
  };
}

// Usage:
// export const GET = withErrorHandler(async (req, params) => {
//   // ... logic
// });
```

**Fix export route (yang gak ada try/catch):**
```typescript
// src/app/api/admin/products/export/route.ts — bungkus dengan withErrorHandler
import { withErrorHandler } from "@/lib/api-error";

export const GET = withErrorHandler(async (req: Request) => {
  await requireAdmin();
  // ... existing logic
});
```

**Effort:** 30 menit  
**Impact:** 🟡 **Consistent API error responses (never raw throw)**

---

### E8. 🟢 global-error.tsx — Last Resort

```typescript
// src/app/global-error.tsx
// NOTE: This must be a Client Component and use default HTML/CSS
// because it catches errors in the root layout itself.

"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div style={{
          display: "flex", minHeight: "100vh", alignItems: "center",
          justifyContent: "center", padding: "16px", textAlign: "center",
        }}>
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: 700 }}>
              ⚠️ Aplikasi Mengalami Gangguan
            </h1>
            <p style={{ color: "#666", margin: "8px 0 16px" }}>
              Maaf, aplikasi sedang bermasalah. Tim kami sudah diberitahu.
            </p>
            <button
              onClick={() => reset()}
              style={{
                background: "#2563eb", color: "#fff", border: "none",
                padding: "10px 24px", borderRadius: "8px", fontSize: "14px",
                fontWeight: 600, cursor: "pointer",
              }}
            >
              Muat Ulang
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
```

**Effort:** 10 menit  
**Impact:** 🟢 **Never see white screen even if root layout fails**

---

### E9. 🟢 Zod Validation Error → User-Friendly Messages

**Current:** Di beberapa tempat, error Zod langsung ditampilkan ke user:
```typescript
// category-actions.ts:102
return { ok: false, error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
```

**Masalah:** Zod error message dalam bahasa Inggris, technical.

**Fix — Zod error formatter:**
```typescript
// src/lib/validators/error-formatter.ts
import { ZodError } from "zod";

export function formatZodError(error: ZodError): string {
  const firstIssue = error.issues[0];
  if (!firstIssue) return "Data tidak valid";

  // Map field name ke label Indonesia
  const fieldLabel = (path: string): string => {
    const labels: Record<string, string> = {
      name: "Nama",
      slug: "Slug URL",
      email: "Email",
      password: "Kata Sandi",
      category_id: "Kategori",
      price: "Harga",
      summary: "Ringkasan",
      description: "Deskripsi",
      main_image_path: "Foto Utama",
    };
    return labels[path] || path;
  };

  const path = firstIssue.path.join(".");
  const field = fieldLabel(path);

  // Custom messages
  const messages: Record<string, string> = {
    required: `"${field}" wajib diisi`,
    invalid_string: `"${field}" tidak valid`,
    too_small: firstIssue.type === "string"
      ? `"${field}" minimal ${firstIssue.minLength ?? firstIssue.minimum} karakter`
      : `"${field}" minimal ${firstIssue.minimum}`,
    too_big: `"${field}" maksimal ${firstIssue.maximum}`,
  };

  return messages[firstIssue.code] || firstIssue.message || "Data tidak valid";
}
```

**Effort:** 30 menit  
**Impact:** 🟢 **User-friendly Indonesian error messages**

---

### E10. 🟢 Structured Error Page for API Routes

**Current:** API error format inconsistent — sometimes `{ error: string }`, sometimes `{ ok: false, error: string }`.

**Fix — Consistent error response shape:**
```typescript
// src/lib/api-response.ts
import { NextResponse } from "next/server";

export type APIError = {
  ok: false;
  error: string;
  code?: string; // machine-readable error code
  details?: Record<string, unknown>;
};

export type APISuccess<T = unknown> = {
  ok: true;
  data: T;
};

export type APIResponse<T = unknown> = APISuccess<T> | APIError;

export function apiError(
  error: string,
  status: number = 400,
  code?: string,
  details?: Record<string, unknown>,
): NextResponse<APIError> {
  return NextResponse.json(
    { ok: false as const, error, code, details },
    { status },
  );
}

export function apiSuccess<T>(data: T, status: number = 200): NextResponse<APISuccess<T>> {
  return NextResponse.json({ ok: true as const, data }, { status });
}
```

**Effort:** 30 menit  
**Impact:** 🟢 **Consistent API contract**

---

### E11. 🟢 Rate Limiting untuk Error Prevention

**Current:** Tidak ada rate limiting = bisa brute force login, spam oreder-lead.

**Fix — Simple in-memory rate limiter:**
```typescript
// src/lib/rate-limit.ts
const rateMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  key: string,
  limit: number = 10,
  windowMs: number = 60000,
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateMap.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  entry.count++;
  if (entry.count > limit) {
    return { allowed: false, remaining: 0 };
  }

  return { allowed: true, remaining: limit - entry.count };
}

// Cleanup stale entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateMap) {
      if (now > entry.resetAt) rateMap.delete(key);
    }
  }, 5 * 60 * 1000);
}
```

**Usage:**
```typescript
// login action
const rl = checkRateLimit(`login:${email}`);
if (!rl.allowed) {
  return { ok: false, error: "Terlalu banyak percobaan login. Silakan coba 1 menit lagi." };
}
```

**Effort:** 30 menit  
**Impact:** 🟢 **Prevent brute force & abuse**

---

### E12. 🟢 not-found.tsx Enhancement

**Current `not-found.tsx`:**
```typescript
// src/app/not-found.tsx — bagus, tapi bisa di-improve
```
(udah ada dari audit sebelumnya, cuma perlu dipastikan SEO-friendly)

**Effort:** 5 menit  
**Impact:** 🟢 **Better UX for 404**

---

## 📈 Error Coverage Score

| Area | # Fix | Before | After |
|------|-------|--------|-------|
| Next.js Boundaries | 5 files | ❌ 0/5 | ✅ 5/5 |
| Server Action Pattern | 8 files | 🔀 Mixed | ✅ `ActionResult` only |
| Silent Catch | 5 locations | ❌ Silent | ✅ Logged + fallback |
| API Error Handling | 3 files | 🔀 Inconsistent | ✅ Unified wrapper |
| Client UX (loading) | 4 files | ❌ No loading | ✅ Skeleton |
| Client UX (error) | 0 files | ❌ No retry UI | ✅ Error + retry component |
| Logging | N/A | ❌ console.raw | ✅ Structured logger |
| Rate Limiting | 3 endpoints | ❌ None | ✅ In-memory |
| Zod Messages | 3 files | ❌ English/raw | ✅ Indonesian |
| API Response Shape | N/A | 🔀 Mixed | ✅ Consistent |

---

## 🎯 Prioritized Task List

| ID | Task | Effort | Coverage | Priority |
|----|------|--------|----------|----------|
| E1 | **Error boundaries** — error.tsx ×4 + loading.tsx ×4 | 30m | 🌐 Global | **Week 1** |
| E2 | **Standardize pattern** — `throw` → `ActionResult` | 1h | 🔧 6 files | **Week 1** |
| E3 | **Loading skeletons** — reusable components | 30m | 🎨 UX | **Week 1** |
| E4 | **Replace silent catches** — log + fallback | 30m | 🔧 5 locations | **Week 1** |
| E5 | **Structured logger** — `src/lib/logger.ts` | 1h | 🌐 Global | **Week 2** |
| E6 | **Retry UI pattern** — `useAsyncData` hook | 1h | 🎨 UX | **Week 2** |
| E7 | **API error wrapper** — `withErrorHandler` | 30m | 🔧 3 API routes | **Week 2** |
| E8 | **global-error.tsx** — last resort | 10m | 🌐 Root | **Week 2** |
| E9 | **Zod formatter** — Indonesian messages | 30m | 🔧 3 validators | **Week 3** |
| E10 | **API response consistency** — `apiSuccess`/`apiError` | 30m | 🔧 API routes | **Week 3** |
| E11 | **Rate limiting** — login + API endpoints | 30m | 🔧 Anti-abuse | **Week 1** |
| E12 | **not-found.tsx** — enhancement | 5m | 🎨 UX | **Week 3** |

---

## 🚀 Quick Wins (30 Menit)

Kalo cuma punya 30 menit:

| Step | Task | Time |
|------|------|------|
| 1 | **E1** — error.tsx + loading.tsx di `app/` | 5m |
| 2 | **E8** — global-error.tsx | 5m |
| 3 | **E4** — silent catch → log + fallback di landing page | 10m |
| 4 | **E11** — rate limiter di login action | 10m |
| | **Total** | **30 menit** |

**Hasil:** 
- ✅ User gak pernah liat blank page lagi
- ✅ Brute force login terblokir
- ✅ Silent catches jadi visible di log

---

> **Generated:** 30 Juli 2026 | **Status:** 🔴 3.8/10 → 🎯 Target 9/10  
> **File:** `KatalogHub-go-live/ERROR-HANDLING.md`
