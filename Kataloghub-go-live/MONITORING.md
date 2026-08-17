# 📡 KatalogHub — Monitoring & Observability Plan

> **Goal:** Menaikkan monitoring score dari **1/10 → 9/10**  
> **Audit Date:** 30 Juli 2026  
> **Total issues found:** 11  
> **Current state:** ✅ Page analytics exists | ❌ Zero error/performance/uptime tracking

---

## 📋 Ringkasan Score

| Area | Before | After | Gap |
|------|--------|-------|-----|
| **Error Tracking (Sentry)** | 0/10 | 10/10 | ❌ Not installed |
| **Web Vitals / Performance** | 0/10 | 9/10 | ❌ Not tracked |
| **Uptime / Health Check** | 0/10 | 9/10 | ❌ No endpoint |
| **Page Analytics** | 8/10 | 10/10 | ✅ Already good |
| **Structured Logging** | 2/10 | 8/10 | ❌ Just console.raw |
| **Alerting** | 0/10 | 8/10 | ❌ None |
| **Total** | **1/10** | **9/10** | |

---

## 🔍 Current State — Yang Udah Ada (Good!)

### ✅ Page Analytics — Already Working

```
src/
├── components/public/analytics-tracker.tsx  ← Client-side tracker
├── app/api/track/route.ts                    ← POST /api/track
├── app/admin/(shell)/analytics-section.tsx   ← Admin dashboard chart
├── app/admin/(shell)/analytics-chart-client.tsx ← Recharts area chart
├── app/superadmin/page.tsx                    ← Super admin analytics
└── supabase/migrations/20260718210000_website_analytics.sql ← Table
```

**Flow:** `AnalyticsTracker` (client) → POST `/api/track` → insert `page_views` → `AnalyticsSection` reads + charts via Recharts.

**Sudah bagus:**
- ✅ Dedup per pathname di React Strict Mode
- ✅ Skip halaman admin
- ✅ 7-day aggregation with null days
- ✅ Dark mode aware chart
- ✅ Unique visitor via session_hash

**Minor improvements:**
- Tambah `store_slug` extract biar bisa filter per toko
- Tambah referrer tracking (source: direct/WA/social)
- Tambah bounce rate (single-page session)

---

## 🛠️ Fix Plan

### M1. 🔴 Sentry Error Tracking — Install & Setup

Sentry adalah **wajib** untuk production app. Ini bedanya:

| Without Sentry | With Sentry |
|----------------|-------------|
| ❌ Error terjadi, gak tau | ✅ Real-time error alert ke email/Telegram |
| ❌ User complain "app error" | ✅ Lo bisa lihat stack trace + console log |
| ❌ Gak tau error sering terjadi | ✅ Frequency graph + trend |
| ❌ Gak tau browser/OS user | ✅ Device, browser, OS, country |
| ❌ Gak tau user ngapain sebelum error | ✅ Breadcrumb trail |

**Install:**
```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs

# Wizard akan otomatis bikin:
# - sentry.client.config.ts
# - sentry.server.config.ts
# - sentry.edge.config.ts
# - next.config.ts update (auto-inject)
```

**Config minimal:**

```typescript
// sentry.client.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN, // dari sentry.io — gratis tier
  tracesSampleRate: 0.2,        // sampling 20% untuk performance tracing
  replaysSessionSampleRate: 0.1, // session replay 10%
  replaysOnErrorSampleRate: 1.0, // replay 100% saat error
  environment: process.env.NODE_ENV,
  enabled: process.env.NODE_ENV === "production",
});
```

```typescript
// sentry.server.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.2,
  environment: process.env.NODE_ENV,
  enabled: process.env.NODE_ENV === "production",
});
```

**Yang perlu di-fix di codebase setelah install:**

```typescript
// 1. Logger integration — auto-capture ke Sentry
// src/lib/logger.ts
import * as Sentry from "@sentry/nextjs";

export const logger = {
  error: (module, message, error, data) => {
    console.error(`[${module}] ${message}`, error, data ?? "");
    Sentry.withScope((scope) => {
      scope.setTag("module", module);
      scope.setExtra("data", data ?? {});
      Sentry.captureException(error ?? new Error(message));
    });
  },
  warn: (module, message, data) => {
    console.warn(`[${module}] ${message}`, data ?? "");
    Sentry.addBreadcrumb({ category: module, message, level: "warning", data: data ?? {} });
  },
};

// 2. Error boundary — auto-report
// Di error.tsx, tambah:
import * as Sentry from "@sentry/nextjs";

export default function Error({ error, reset }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);
  // ...rest
}
```

**Biaya Sentry:**
- **Free tier:** 5k events/month — cukup untuk UMKM
- **Self-hosted:** `sentry self-hosted` via Docker — gratis total

**Effort:** 30 menit install + 30 menit integrasi  
**Impact:** 🔴 **Lihat semua error production dalam 5 menit**

---

### M2. 🔴 Health Check Endpoint

**Endpoint:** `GET /api/health`

```typescript
// src/app/api/health/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function GET() {
  const checks: Record<string, { status: "ok" | "error"; latency?: number; error?: string }> = {};
  let healthy = true;

  // 1. App is running
  checks.app = { status: "ok" };

  // 2. Supabase connection
  try {
    const start = Date.now();
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
    const { error } = await supabase.from("profiles").select("id", { count: "exact", head: true }).limit(1);
    checks.supabase = { status: error ? "error" : "ok", latency: Date.now() - start };
    if (error) {
      checks.supabase.error = error.message;
      healthy = false;
    }
  } catch (err) {
    checks.supabase = { status: "error", error: err instanceof Error ? err.message : "Connection failed" };
    healthy = false;
  }

  // 3. Storage (optional check — cuma cek bucket exists)
  try {
    const start = Date.now();
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
    const { data: buckets } = await supabase.storage.listBuckets();
    const hasRequired = ["product-images", "product-documents", "landing-assets"]
      .every((b) => buckets?.some((bk) => bk.name === b));
    checks.storage = {
      status: hasRequired ? "ok" : "error",
      latency: Date.now() - start,
      buckets: buckets?.length ?? 0,
    };
    if (!hasRequired) {
      checks.storage.error = "Required buckets missing";
      healthy = false;
    }
  } catch (err) {
    checks.storage = { status: "error", error: err instanceof Error ? err.message : "Storage check failed" };
    // Don't mark unhealthy — storage might not be critical for health endpoint itself
  }

  // 4. Memory usage
  const memUsage = process.memoryUsage();
  checks.memory = {
    status: memUsage.heapUsed / memUsage.heapTotal > 0.9 ? "error" : "ok",
    heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + "MB",
    heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + "MB",
  };

  // 5. Uptime
  checks.uptime = {
    status: "ok",
    seconds: process.uptime(),
    started: new Date(Date.now() - process.uptime() * 1000).toISOString(),
  };

  return NextResponse.json(
    {
      status: healthy ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      version: process.env.NEXT_PUBLIC_APP_VERSION || "0.1.0",
      environment: process.env.NODE_ENV,
      checks,
    },
    { status: healthy ? 200 : 503 },
  );
}
```

**Sample response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-07-30T23:00:00.000Z",
  "version": "0.1.0",
  "environment": "production",
  "checks": {
    "app": { "status": "ok" },
    "supabase": { "status": "ok", "latency": 45 },
    "storage": { "status": "ok", "latency": 32, "buckets": 5 },
    "memory": { "status": "ok", "heapUsed": "128MB", "heapTotal": "256MB" },
    "uptime": { "status": "ok", "seconds": 86400, "started": "2026-07-29T23:00:00.000Z" }
  }
}
```

**Effort:** 30 menit  
**Impact:** 🔴 **Uptime monitoring + auto-restart awareness**

---

### M3. 🟠 Web Vitals Tracking

```typescript
// src/components/public/web-vitals.tsx
"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function WebVitals() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== "undefined" && "performance" in window) {
      // Observe LCP (Largest Contentful Paint)
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        if (entries.length > 0) {
          const lcp = entries[entries.length - 1];
          sendMetric("LCP", lcp.startTime, pathname);
        }
      });
      lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });

      // Observe FID (First Input Delay)
      const fidObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          // @ts-ignore — FID has processingStart
          const delay = entry.processingStart - entry.startTime;
          sendMetric("FID", delay, pathname);
        });
      });
      fidObserver.observe({ type: "first-input", buffered: true });

      // Observe CLS (Cumulative Layout Shift)
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          // @ts-ignore
          if (!entry.hadRecentInput) clsValue += entry.value;
        });
        sendMetric("CLS", clsValue, pathname);
      });
      clsObserver.observe({ type: "layout-shift", buffered: true });

      // TTFB via Navigation Timing
      useEffect(() => {
        const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
        if (nav) {
          sendMetric("TTFB", nav.responseStart - nav.requestStart, pathname);
        }
      }, [pathname]);

      return () => {
        lcpObserver.disconnect();
        fidObserver.disconnect();
        clsObserver.disconnect();
      };
    }
  }, [pathname]);

  return null;
}

function sendMetric(name: string, value: number, path: string) {
  // Kirim ke endpoint sendiri atau ke analytics service
  const body = {
    name,
    value: Math.round(value),
    path,
    rating: value <= 2500 ? "good" : value <= 4000 ? "needs-improvement" : "poor",
    ua: navigator.userAgent,
  };

  // Silent fetch — jangan ganggu user experience
  if (navigator.sendBeacon) {
    navigator.sendBeacon("/api/vitals", JSON.stringify(body));
  } else {
    fetch("/api/vitals", { method: "POST", body: JSON.stringify(body), keepalive: true }).catch(() => {});
  }
}
```

**Alternative — pakai `next/web-vitals` built-in:**
```typescript
// src/app/report-web-vitals.ts — Next.js 15 built-in
"use client";

export function reportWebVitals(metric: any) {
  if (process.env.NODE_ENV === "production") {
    const body = JSON.stringify({
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      path: window.location.pathname,
    });
    navigator.sendBeacon?.("/api/vitals", body);
  }
}
```

**API endpoint:**
```typescript
// src/app/api/vitals/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    // Log ke database atau eksternal service
    if (data.rating === "poor") {
      console.warn(`[WebVitals] ${data.name}: ${data.value} (POOR) — ${data.path}`);
      // Kirim alert kalo CLS > 0.25 atau LCP > 4s
    }

    // Future: simpan ke table page_vitals untuk tracking trend
    // await supabase.from("page_vitals").insert({ ... });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
```

**Effort:** 1 jam  
**Impact:** 🟠 **Tahu performance sebelum user complain "lemot"**

---

### M4. 🟠 Better Page Analytics — Tambah Field

**Current `analytics-tracker.tsx`:**
```tsx
fetch("/api/track", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ path: pathname }),
})
```

**Fix — Tambah referrer + store_slug:**
```tsx
// analytics-tracker.tsx — enhanced
"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function AnalyticsTracker() {
  const pathname = usePathname();
  const hasTracked = useRef<string | null>(null);

  useEffect(() => {
    if (hasTracked.current === pathname) return;
    hasTracked.current = pathname;
    if (pathname.startsWith("/admin")) return;

    // Extract store_slug dari path /toko/[store_slug]/...
    const tokoMatch = pathname.match(/^\/toko\/([^\/]+)/);
    const storeSlug = tokoMatch?.[1] ?? null;

    const payload: Record<string, unknown> = {
      path: pathname,
      referrer: document.referrer || null,
      store_slug: storeSlug,
      screen: `${window.innerWidth}x${window.innerHeight}`,
    };

    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => {});
  }, [pathname]);

  return null;
}
```

**Fix `/api/track` — handle new fields:**
```typescript
// src/app/api/track/route.ts — tambah kolom
const { error } = await supabase.from("page_views").insert({
  path: body.path,
  referrer: body.referrer || null,
  store_slug: body.store_slug || null,
  screen_size: body.screen || null,
  session_hash, // existing
});
```

**Effort:** 30 menit  
**Impact:** 🟠 **Analytics lebih granular — tau sumber traffic**

---

### M5. 🟠 Uptime Monitoring — Coolify + Better Uptime

**Karena lo pake Coolify, lo bisa langsung:**

1. **Coolify built-in health check:**
   - Di Coolify dashboard → service lo → Health Check
   - Set `GET /api/health` → port 3000
   - Coolify auto-restart kalo health check gagal 3x

2. **Better Uptime (free tier):**
   - Daftar di [betteruptime.com](https://betteruptime.com) — free 5 monitors
   - Monitor `https://domainkamu.com/api/health`
   - Dapat notifikasi via Telegram/Email kalo down

3. **Self-hosted uptime:**
   - `docker run -p 3001:3001 louislam/uptime-kuma`
   - Dashboard uptime sendiri

**Effort:** 15 menit (setting di Coolify)  
**Impact:** 🟠 **Tahu kalo app down — auto-restart**

---

### M6. 🟡 Database Query Monitoring

**Masalah:** Gak tau query mana yang lambat.

**Simple approach — query timing wrapper:**
```typescript
// src/lib/supabase/timed-client.ts
import { createClient } from "./server";

export async function createTimedClient() {
  const supabase = await createClient();

  // Wrap query method
  const originalThen = supabase.from;
  // Ini simplified — real implementation perlu Proxy
  // Tapi untuk MVP, cukup log di setiap query

  return supabase;
}

// Lebih simple — log query duration di setiap action:
export async function withQueryLog<T>(
  label: string,
  fn: () => Promise<T>,
): Promise<T> {
  const start = Date.now();
  try {
    const result = await fn();
    const duration = Date.now() - start;
    if (duration > 500) {
      console.warn(`[Slow Query] ${label} — ${duration}ms`);
    }
    return result;
  } catch (err) {
    const duration = Date.now() - start;
    console.error(`[Query Failed] ${label} — ${duration}ms`, err);
    throw err;
  }
}
```

**Alternative — Supabase Logs Explorer:**
- Buka Supabase dashboard → Logs → Explorer
- Run: `select * from edge_logs where timestamp > now() - interval '1 hour'`
- Lihat query yang slow (duration > 500ms)

**Effort:** 15 menit (Supabase dashboard)  
**Impact:** 🟡 **Tahu bottleneck query tanpa instrumentasi**

---

### M7. 🟡 Cron Job — Daily Status Report

**Gunakan cron job Hermes untuk daily health check:**

```typescript
// Cron prompt:
// Cek health endpoint KatalogHub tiap pagi jam 8
// URL: https://domainkamu.com/api/health
// Kalau status != "healthy" → kirim alert
```

**Atau schedule di Coolify sendiri:**
```bash
# curl health endpoint tiap 5 menit, log hasilnya
*/5 * * * * curl -s https://domainkamu.com/api/health | logger -t kataloghub-health
```

**Effort:** 10 menit  
**Impact:** 🟡 **Passive monitoring tanpa keluar biaya**

---

### M8. 🟡 Error Tracking di Client — `window.onerror`

**Current:** Error runtime di browser gak tertangkap sama sekali.

```typescript
// src/lib/client-error-tracker.ts
"use client";

import { useEffect } from "react";

export function ClientErrorTracker({ enabled = true }: { enabled?: boolean }) {
  useEffect(() => {
    if (!enabled) return;

    // Global error handler
    const handleError = (event: ErrorEvent) => {
      const payload = {
        type: "unhandled_error",
        message: event.message,
        source: event.filename,
        line: event.lineno,
        column: event.colno,
        stack: event.error?.stack || null,
        url: window.location.href,
        ua: navigator.userAgent,
      };

      // Kirim ke endpoint
      fetch("/api/log/error", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {});
    };

    // Unhandled promise rejection
    const handleRejection = (event: PromiseRejectionEvent) => {
      const payload = {
        type: "unhandled_rejection",
        message: event.reason?.message || String(event.reason),
        stack: event.reason?.stack || null,
        url: window.location.href,
      };

      fetch("/api/log/error", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {});
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, [enabled]);

  return null;
}
```

**Effort:** 30 menit  
**Impact:** 🟡 **Tahu error browser user**

---

### M9. 🟢 Performance Budget — Bundle Size Alert

```json
// package.json — tambah script
{
  "scripts": {
    "build:analyze": "ANALYZE=true next build",
    "size:check": "next build && node scripts/check-bundle-size.mjs"
  }
}
```

```javascript
// scripts/check-bundle-size.mjs
import { readFileSync } from "fs";
import path from "path";

const NEXT_DIR = path.resolve(".next");
const BUNDLE_DIR = path.join(NEXT_DIR, "static", "chunks");

// Simple check — total size of JS files per page
const totalSize = fs
  .readdirSync(BUNDLE_DIR)
  .filter(f => f.endsWith(".js"))
  .reduce((sum, f) => sum + fs.statSync(path.join(BUNDLE_DIR, f)).size, 0);

const MB = totalSize / 1024 / 1024;
const LIMIT = 300; // 300KB target per page

if (MB > LIMIT) {
  console.warn(`⚠️  Bundle size: ${MB.toFixed(1)}MB (limit: ${LIMIT}MB)`);
  process.exit(1);
} else {
  console.log(`✅ Bundle size: ${MB.toFixed(1)}MB (under ${LIMIT}MB limit)`);
}
```

**Effort:** 30 menit  
**Impact:** 🟢 **Gak kaget bundle bloat di production**

---

### M10. 🟢 Supabase Logs — Alert Setup

**Supabase dashboard → Database → Webhooks:**

Setup webhook untuk:
1. **Failed login attempts** (`platform_audit_logs` insert with `action_type = "login_failed"`)
2. **Subscription expiring** (cron job harian)
3. **Storage upload errors**

**Atau via Supabase Edge Functions:**
```typescript
// supabase/functions/alert-on-error/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  const { type, records } = await req.json();

  for (const record of records) {
    if (record.table === "platform_audit_logs" && record.event === "INSERT") {
      // Kalau error login, kirim notifikasi
      if (record.new.action_type === "login_failed") {
        await fetch(Deno.env.get("TELEGRAM_WEBHOOK_URL")!, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: `🔴 Login failed: ${record.new.actor_email}`,
          }),
        });
      }
    }
  }

  return new Response("ok");
});
```

**Effort:** 1 jam  
**Impact:** 🟢 **Real-time alert via Telegram**

---

### M11. 🟢 API Response Time Tracking

Tambahkan `X-Response-Time` header di API routes:

```typescript
// src/lib/api-response.ts — enhance
export function apiResponseTime(startTime: number): string {
  return `${Date.now() - startTime}ms`;
}

// Usage di setiap API route:
export async function GET(req: Request) {
  const start = Date.now();
  // ... logic ...
  return NextResponse.json(data, {
    headers: { "X-Response-Time": apiResponseTime(start) },
  });
}
```

**Better — Middleware:**
```typescript
// src/middleware.ts — tambah timing
export function middleware(req: NextRequest) {
  const start = Date.now();

  const response = NextResponse.next();

  response.headers.set("X-Response-Time", `${Date.now() - start}ms`);

  return response;
}
```

**Effort:** 10 menit  
**Impact:** 🟢 **Tau response time tiap request**

---

## 📈 Monitoring Score Progression

| Phase | Error Tracking | Performance | Health | Analytics | Logging | Alert | Total |
|-------|:------------:|:----------:|:-----:|:--------:|:------:|:----:|:----:|
| **Sekarang** | 0 | 0 | 0 | 8 | 2 | 0 | **1/10** |
| **Week 1** | 10 | 0 | 9 | 9 | 6 | 4 | **6.3** |
| **Week 2** | 10 | 7 | 10 | 10 | 8 | 7 | **8.7** |
| **Week 3** | 10 | 9 | 10 | 10 | 9 | 9 | **9.5** |

---

## 🎯 Prioritized Task List

| ID | Task | Effort | Score Lift | Priority |
|----|------|--------|:--------:|----------|
| **M1** | **Sentry install + integrate** | 1h | 🔴 +3 | **Week 1** |
| **M2** | **Health check endpoint** | 30m | 🔴 +2 | **Week 1** |
| **M3** | Web Vitals tracking | 1h | 🟠 +2 | **Week 2** |
| **M4** | Enhanced page analytics (referrer, store_slug) | 30m | 🟠 +0.5 | **Week 1** |
| **M5** | Coolify health check + Better Uptime | 15m | 🟠 +1 | **Week 1** |
| **M6** | Slow query detection | 15m | 🟡 +0.5 | **Week 2** |
| **M7** | Daily status report cron | 10m | 🟡 +0.5 | **Week 2** |
| **M8** | Client error tracker | 30m | 🟡 +1 | **Week 2** |
| **M9** | Performance budget script | 30m | 🟢 +0.5 | **Week 3** |
| **M10** | Supabase webhook alert | 1h | 🟢 +0.5 | **Week 3** |
| **M11** | Response time header | 10m | 🟢 +0.25 | **Week 3** |

---

## 💰 Biaya Monitoring

| Service | Free Tier | Pro |
|---------|-----------|-----|
| **Sentry** | 5k events/month | $29/month (100k) |
| **Better Uptime** | 5 monitors, 3m interval | $20/month |
| **Coolify Health** | ✅ Included | — |
| **Supabase Logs** | ✅ Included (7 day retention) | $25/month (30 day) |
| **Umami** (self-hosted) | ✅ Free (Docker) | — |

**Rekomendasi:**
- **Free total:** Sentry free + Better Uptime free + Coolify health
- **Total biaya: $0/month**

---

## 🚀 Quick Wins (1 Jam)

| Step | Task | Time |
|------|------|------|
| 1 | **M2** — Health check endpoint `GET /api/health` | 20m |
| 2 | **M1** — Sentry install `npm install @sentry/nextjs` | 30m |
| 3 | **M5** — Coolify health check config | 10m |
| | **Total** | **1 jam** |

**Hasil:**
- ✅ Monitoring naik 1/10 → 6/10 ✅
- ✅ Error visible via Sentry dalam 5 menit
- ✅ Health check + auto-restart
- ✅ $0 biaya tambahan

---

> **Generated:** 30 Juli 2026 | **Status:** 🟥 1/10 → 🎯 Target 9/10  
> **File:** `KatalogHub-go-live/MONITORING.md`
