# 🚀 KatalogHub — Pre-Deployment Production Checklist

> **Audit Date:** 30 Juli 2026  
> **Target:** DomaiNesia Cloud VPS → Coolify → Docker  
> **Total Files Reviewed:** ~40+ component/page/action files across full stack

---

## 📊 Ringkasan Score Card

| Dimensi | Score | Keterangan |
|---------|-------|------------|
| **Keamanan & Auth** | 6/10 | Service-role key everywhere, no RLS, no rate limit |
| **Data Integrity** | 8/10 | Zod validation solid, slug unique check ada |
| **Performance** | 5/10 | Semua `force-dynamic`, no cache, N+1 queries |
| **SEO & Metadata** | 4/10 | Minimal OG/Twitter cards, no sitemap |
| **Error Handling** | 6/10 | Try/catch ada, tapi console.log masih numpang |
| **Monitoring** | 1/10 | Zero error tracking, Sentry/etc not installed |
| **DevOps Readiness** | 3/10 | No Dockerfile, no healthcheck, no CI |
| **UX Mobile** | 8/10 | Touch-friendly, responsive sudah baik |
| **Total** | **5.1/10** | **Layak staging, perlu ~2-3 minggu untuk production-grade** |

---

## 🚨 BLOKIR KRITIS — Harus Fix SEBELUM Go-Live

### 1. 🔴 Wrong Redirect Path in `requireAdmin()`
**File:** `src/lib/auth.ts` line 48
```ts
if (!current) {
  redirect("/login"); // WRONG! Harusnya "/admin/login"
}
```
**Dampak:** Kalau session admin expired/not authenticated, di-redirect ke `/login` (404) bukan `/admin/login` — user bakal lihat halaman rusak.  
**Fix:** Ganti jadi `redirect("/admin/login")`.

### 2. 🔴 Semua Query Pakai Service Role Key (Bypass RLS)
**Pattern di seluruh codebase:** `createAdminClient()` = Supabase `service_role` key.  
**Dampak:** Service_role BYPASS RLS total. Kalau ada server-side bug (SSRF, path traversal) atau env variable leak di client build, semua data tenant bisa bocor.  
**Mitigasi:** 
- Firewall ketat di Coolify — cuma Next.js server boleh akses Supabase
- Jangan pernah export `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE` (cuma boleh `SUPABASE_SERVICE_ROLE` server-only)
- Opsional: migrasi bertahap ke `createClient()` (anon key + RLS policies)

### 3. 🔴 No Security Headers
**File:** `next.config.ts` — cuma ada `experimental.serverActions.bodySizeLimit` dan `images.remotePatterns`.  
**Dampak:** Rentan clickjacking, XSS, MIME sniffing.  
**Fix:** Tambah security headers:
```ts
async headers() {
  return [{
    source: '/(.*)',
    headers: [
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
    ]
  }]
}
```

### 4. 🔴 XSS Risk di Custom Landing Page
**File:** `src/app/lp/[slug]/route.ts`  
**Dampak:** `page.html_source` dirender langsung via `new NextResponse(html, ...)`. Store owner bisa inject script.  
**Mitigasi:** Pastikan hanya TRUSTED store owner (bukan public) yang bisa publish LP. Atau gunakan DOMPurify di server side.

### 5. 🔴 Superadmin bisa diakses oleh siapa pun dengan `is_admin=true`
**File:** `src/lib/auth.ts` line 66-67  
```ts
const isSuper = current.profile.role === "superadmin" || current.profile.is_admin;
```
**Dampak:** Admin biasa dengan `is_admin=true` bisa akses /superadmin.  
**Fix:** Hapus fallback `is_admin` — superadmin harus explicit role.

### 6. 🔴 Bootstrap Admin Endpoint Rawan
**File:** `src/app/admin/bootstrap/action/route.ts`  
**Dampak:** Endpoint tanpa CSRF protection, tanpa rate limiting. Kalau somehow `has_no_admin()` RPC error, bisa bypass.  
**Fix:** Tambah CSRF token + rate limiter, atau matikan endpoint setelah bootstrap sukses.

### 7. 🔴 Default Bank Accounts Hardcoded
**File:** `src/lib/actions/saas-actions.ts` lines 486-511  
**Dampak:** Rekening BCA & Mandiri hardcoded sebagai fallback. Kalau tabel `platform_bank_accounts` kosong, data rekening palsu ter-expose.  
**Fix:** Jangan pernah hardcode rekening. Hanya tampilkan dari database.

---

## ⚠️ HIGH PRIORITY — Fix Sebelum Launch Marketing

### 8. 🟠 `force-dynamic` di SEMUA Halaman — No Cache
**Files:** Hampir semua page.tsx di storefront, admin, kategori, produk  
**Dampak:** Setiap request query database. Tidak scalable.  
**Fix:**
- Gunakan `revalidate` atau ISR untuk halaman public (toko, produk, kategori)
- Gunakan `generateStaticParams` untuk produk/kategori yang sudah publish
- Admin dashboard boleh tetap dynamic (internal only)
```ts
// Contoh fix di toko/[store_slug]/produk/[slug]/page.tsx
export const revalidate = 60; // ISR tiap 60 detik
```

### 9. 🟠 Rate Limiting di Semua Endpoint
**Endpoint vulnerable:**
- `POST /admin/login/action` (brute force login)
- `POST /api/order-lead` (spam leads)
- `POST /admin/bootstrap/action` (registration abuse)
- `PATCH /api/track` (tracking abuse)
**Fix:** Pakai `@upstash/ratelimit` atau middleware-based rate limiting.

### 10. 🟠 Login Brute Force Protection
**File:** `src/app/admin/login/login-form.tsx`  
**Fix:** Implement exponential backoff, captcha (Turnstile/grecaptcha), atau lockout after 5 failed attempts.

### 11. 🟠 Console Log di Production
**Files:** 
- `product-actions.ts:75` — `console.log("fetchProducts retrieved rows:", ...)`
- `public-data.ts:34,55,86,198` — `console.error("[...]")`  
**Dampak:** Memory leak + log polusi.  
**Fix:** Ganti dengan logger service atau hapus.

### 12. 🟠 No Proper 404 Page
**File:** `src/app/not-found.tsx` — Nampilin "Dalam Tahap Pengembangan"  
**Dampak:** User bingung, kesan apps belum jadi.  
**Fix:** Ganti dengan 404 page yang proper (branded, cari produk lain, link ke toko).

### 13. 🟠 N+1 Query di `fetchProducts`
**File:** `src/lib/actions/product-actions.ts` lines 91-109  
**Dampak:** Setiap fetch products → 1 query SELECT + N query `checkRequiredSpecsFilled`. Kalau 100 produk = 101 queries.  
**Fix:** Batch check specs via single Supabase query, bukan per-loop.

### 14. 🟠 Subscription Check Hanya di INSERT, Bukan UPDATE
**File:** `product-actions.ts` lines 331-358  
**Dampak:** User expired subscription masih bisa UPDATE produk existing (gambar, deskripsi). Cuma INSERT produk baru yang dicek.  
**Fix:** Pindah subscription check ke function terpisah, panggil baik di insert maupun update.

### 15. 🟠 No Error Monitoring (Sentry/Logtail)
**Dampak:** Kalau di production error 500 atau crash, lo gak bakal tahu.  
**Fix:** Integrasi Sentry untuk Next.js:
```bash
npm install @sentry/nextjs
npx sentry-wizard -i nextjs
```

### 16. 🟠 Order Leads Table Tanpa Pagination
**File:** `admin/(shell)/orders/page.tsx`  
**Dampak:** Toko dengan ribuan leads akan nge-load semua data dalam 1 query.  
**Fix:** Tambah pagination / infinite scroll + server-side `range()`.

---

## 📋 MEDIUM — Improve dalam 1-2 Minggu

### 17. SEO Metadata
- Tambah `generateMetadata` di SEMUA halaman toko (sudah ada di produk & kategori, tapi tidak konsisten)
- Tambah Open Graph (`og:image`, `og:title`, `og:description`) di layout
- Tambah Twitter Cards
- Generate `sitemap.xml` + `robots.txt`

### 18. Social Link Placeholders
**File:** Layout promo/footer — beberapa link sosmed masih placeholder (`#`). Fix sebelum traffic datang.

### 19. Supabase Storage RLS
Storage bucket harus punya RLS policy: publik hanya bisa READ, admin (authenticated) bisa WRITE.

### 20. Hydration Mismatch: `new Date().getFullYear()`
**Files:** 
- `admin/login/page.tsx:46` — `{new Date().getFullYear()}`
- Promo layout footer
**Dampak:** Server render tahun X, client render tahun X+... no problem actually untuk tahun, kecuali kalau SSR vs client timezone beda.  
**Fix:** Pindah ke komponen client untuk dynamic dates.

### 21. API Response Shape Tidak Konsisten
- `order-lead/route.ts` — return `{ error: string }` 
- `product-actions.ts` — return `ActionResult = { ok: true } | { ok: false; error: string }`
- `bootstrap/action/route.ts` — return `{ ok: true, email }`
**Fix:** Standarisasi jadi satu format: `{ success: boolean, data?: T, error?: string }`.

### 22. Stale-While-Revalidate di Custom Landing Page
**File:** `lp/[slug]/route.ts` line 115  
```ts
"Cache-Control": "public, s-maxage=60, stale-while-revalidate=300"
```
Good! Tapi perlu dipastikan CDN (Coolify/Caddy) respect header ini.

### 23. Image Optimization
- Tambah `priority` prop di `next/image` untuk above-the-fold images
- Gunakan `sizes` prop untuk responsive images
- Pastikan alt text di semua `<Image>` (banyak yang null/missing)

### 24. Rate Limit for Failed Login Attempts
**File:** `admin/login/action/route.ts` — tambah delay progresif atau lockout.

### 25. No Type Check di Build
**File:** `package.json` — script `typecheck` ada tapi tidak otomatis jalan.  
**Fix:** Tambah `"prebuild": "tsc --noEmit"` atau integrasi ke CI.

---

## 🟢 LOW — Nice to Have / Tech Debt

| # | Issue | File | Notes |
|---|-------|------|-------|
| 26 | No Dockerfile | — | Untuk Coolify, perlu `Dockerfile` + `.dockerignore` |
| 27 | No healthcheck endpoint | — | Tambah `GET /api/health` untuk monitoring Coolify |
| 28 | `@splinetool/react-spline` unused | package.json | Heavy dep, cek apakah dipake |
| 29 | `xlsx` heavy for export | package.json | 1.3MB — bisa ganti pakai `exceljs` ringan atau CSV |
| 30 | No automated tests | — | Vitest/Playwright 0 setup |
| 31 | No CI pipeline | — | GitHub Actions untuk lint + typecheck + build |
| 32 | `.env.example` outdated | — | Cek apakah semua env key ada dokumentasinya |
| 33 | Superadmin dashboard O(N) queries | saas-actions.ts | `forEach` subscriptions, products — scale issue |
| 34 | Gap: No email/notif integration | — | Order lead masuk → owner gak dapat notif |
| 35 | Gap: No export CSV per kategori | — | Only full export via xlsx |
| 36 | Gap: No webhook for order_leads | api/order-lead/route.ts | 
| 37 | `next.config.ts` no `output: "standalone"` | — | Untuk Docker, perlu standalone output |

---

## 🔧 Pre-Deployment Action Items (By Priority)

### Week 1 — CRITICAL (HARUS)
- [ ] Fix redirect `/login` → `/admin/login` di auth.ts
- [ ] Tambah security headers di next.config.ts
- [ ] Ganti superadmin check (hapus fallback `is_admin`)
- [ ] Hardened bootstrap endpoint (CSRF + rate limit)
- [ ] Hapus hardcoded bank accounts fallback
- [ ] Set `NEXT_PUBLIC_ADMIN_WA` env variable (hapus fallback hardcoded)

### Week 2 — HIGH
- [ ] Rate limiting middleware untuk semua API
- [ ] Login brute force protection (5 attempts lockout)
- [ ] Hapus console.log statements
- [ ] Fix N+1 query di fetchProducts
- [ ] Subscription check juga di UPDATE
- [ ] ISR/Revalidation untuk public pages
- [ ] Fix 404 page
- [ ] Integrasi Sentry error tracking

### Week 3 — MEDIUM
- [ ] SEO: Open Graph + Twitter Cards + sitemap.xml
- [ ] RLS policies untuk Supabase Storage
- [ ] Pagination di order leads
- [ ] Standarisasi API response shape
- [ ] Fix hydration mismatch (date)
- [ ] Image optimization (priority, sizes, alt)

### Before Go-Live Final Check
- [ ] `npm run build` sukses tanpa error
- [ ] `npm run lint` clean
- [ ] `tsc --noEmit` no type errors
- [ ] Security headers verified dengan curl
- [ ] Rate limiting tested with 100 rapid requests
- [ ] All env variables documented & set
- [ ] Database backup configured
- [ ] SSL certificate aktif via Coolify

---

## 📊 Detailed Findings by Layer

### Security (6/10)
```
✅ Zod validation on all user inputs
✅ Supabase SSR session handling
✅ requireAdmin/requireSuperAdmin guard
✅ CSRF via Next.js Server Actions (built-in)
❌ Service-role key everywhere (no RLS)
❌ No rate limiting on any endpoint
❌ No CSP / security headers
❌ XSS vector on custom landing pages
❌ Brute force protection missing
❌ Superadmin auth check too loose
```

### Data Layer (8/10)
```
✅ Zod schemas: product, category, site_settings
✅ Slug uniqueness validation
✅ Gallery JSON normalization (parseGalleryField)
✅ Storage path sanitization (safeName regex)
✅ File type validation on upload
❌ N+1 queries (fetchProducts, getVisibleCategories + count)
❌ Subscription check on INSERT only
❌ No pagination on order_leads
```

### Performance (5/10)
```
❌ force-dynamic on all public pages (no cache)
❌ N+1 query pattern widespread
❌ No ISR/revalidate strategy
✅ Server Components (minimal JS client-side)
✅ Image optimization via next/image (partial)
```

### UX & Storefront (8/10)
```
✅ Touch-friendly buttons (h-14 on mobile)
✅ Responsive grid (2-6 columns)
✅ Breadcrumbs everywhere
✅ Loading states (skeleton/empty-state)
✅ WA CTA flow tested
❌ Line-clamp-1 issues (known from promo)
❌ Missing alt text on some images
❌ Social links placeholder
```

---

## 🚀 Coolify Deployment Notes

1. **Build Command:** `npm run build` (butuh Node 20+)
2. **Start Command:** `npm start` atau `node .next/standalone/server.js`
3. **Environment**: Semua `NEXT_PUBLIC_*` + `SUPABASE_SERVICE_ROLE` + `SUPABASE_URL`
4. **Dockerfile:** Perlu `Dockerfile` dengan multi-stage build:
   ```dockerfile
   FROM node:20-alpine AS builder
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   COPY . .
   RUN npm run build
   
   FROM node:20-alpine AS runner
   WORKDIR /app
   COPY --from=builder /app/.next/standalone ./
   COPY --from=builder /app/public ./public
   EXPOSE 3000
   CMD ["node", "server.js"]
   ```
5. **Set `next.config.ts`:** tambah `output: "standalone"`

---

## 📝 Cara Verifikasi Checklist

```bash
# 1. Build test
npm run build

# 2. Lint
npm run lint

# 3. Type check
npx tsc --noEmit

# 4. Security headers test
curl -s -I https://yourdomain.com | grep -i "X-Frame\|X-Content\|Strict-Transport"

# 5. Rate limit test
for i in $(seq 1 20); do curl -s -o /dev/null -w "%{http_code}\n" -X POST https://yourdomain.com/api/order-lead; done

# 6. RLS check (via Supabase dashboard SQL editor)
SELECT * FROM pg_policies WHERE tablename = 'products';
```

---

> **Last Updated:** 2026-07-30  
> **Auditor:** Hermes AI (Arul IT Profile)  
> **Status:** 🟡 Production-ready dengan catatan — critical blocker harus fix dulu sebelum指向 actual domain
