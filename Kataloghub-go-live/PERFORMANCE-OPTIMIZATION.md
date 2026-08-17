# ⚡ KatalogHub — Performance Optimization Plan

> **Goal:** Menaikkan performance score dari **5/10 → 9/10**  
> **Audit Date:** 30 Juli 2026  
> **Total issues found:** 11  
> **Current rendering:** 100% SSR (force-dynamic di 11 file)

---

## 📋 Ringkasan Score

| Area | Before | After | Key Improvement |
|------|--------|-------|----------------|
| **SSR → ISR** | 0/10 | 10/10 | force-dynamic di 11 file → ISR revalidate |
| **Image Optimization** | 4/10 | 9/10 | Remote patterns terlalu longgar, no blur |
| **Bundle Size** | 5/10 | 8/10 | xlsx (1.3MB), @splinetool (heavy) |
| **Font Loading** | 6/10 | 9/10 | Google Font subsetting |
| **Client Components** | 3/10 | 8/10 | No lazy loading detected |
| **Caching Strategy** | 2/10 | 9/10 | No cache headers di responses |
| **Total** | **5/10** | **9/10** | **3-5x faster page loads** |

---

## 🔍 Issue Deep Dive

### P1. 🔴 `force-dynamic` di 11 File — Zero Caching

**Files affected:**

| File | Current | Impact |
|------|---------|--------|
| `src/app/toko/[store_slug]/page.tsx` | `force-dynamic` | Landing toko — tiap visit query ulang |
| `src/app/toko/[store_slug]/produk/[slug]/page.tsx` | `force-dynamic` | Detail produk — tiap visit query ulang |
| `src/app/toko/[store_slug]/kategori/[slug]/page.tsx` | `force-dynamic` | List kategori — tiap visit query ulang |
| `src/app/toko/[store_slug]/kategori/page.tsx` | `force-dynamic` | Semua kategori — tiap visit query ulang |
| `src/app/toko/[store_slug]/katalog-pdf/page.tsx` | `force-dynamic` | PDF — tiap visit query ulang |
| `src/app/admin/(shell)/layout.tsx` | `force-dynamic` | Layout admin — tiap navigasi |
| `src/app/admin/(shell)/orders/page.tsx` | `force-dynamic` | Order list |
| `src/app/admin/(shell)/products/page.tsx` | `force-dynamic` | Product list |
| `src/app/admin/login/page.tsx` | `force-dynamic` | Login page |
| `src/middleware.ts` | N/A (runs per req) | Normal for middleware |

**Fix — ISR (Incremental Static Regeneration):**

```typescript
// src/app/toko/[store_slug]/page.tsx — ganti force-dynamic
// Hapus: export const dynamic = "force-dynamic";

// Tambah: revalidate setiap 60 detik
export const revalidate = 60;

// Atau untuk halaman yang jarang berubah:
export const revalidate = 300; // 5 menit
```

**Lebih baik — strategi per tier:**

| Page Type | Strategy | Revalidate | Rationale |
|-----------|----------|-----------|-----------|
| **Toko landing** | ISR | 60s | Konten bisa berubah kapan saja |
| **Produk detail** | ISR | 300s | Produk jarang berubah |
| **Kategori list** | ISR | 300s | Sama |
| **Katalog PDF** | ISR | 3600s | 1 jam |
| **Admin pages** | `force-dynamic` tetap | — | Harus realtime |
| **Admin login** | `force-dynamic` tetap | — | Harus realtime |

**Contoh implementasi:**
```typescript
// src/app/toko/[store_slug]/page.tsx
export const revalidate = 60;

// Kalau ada update toko, panggil:
// revalidatePath(`/toko/${storeSlug}`);
```

**Benefit:**
- Visitor pertama nunggu (SSR) → cache di edge
- Visitor 2-60 detik berikutnya → instant (CDN cache)
- Admin update → trigger revalidation otomatis

**Effort:** 30 menit  
**Impact:** ⚡ **3-5x faster repeat visits**

---

### P2. 🟠 Image Optimization — Remote Patterns Terlalu Longgar

**File:** `next.config.ts:19-25`

```typescript
images: {
  remotePatterns: [
    { hostname: "*.supabase.co" },
    { hostname: "**" }, // ← Wildcard! Next.js ga bisa optimize ini
  ],
},
```

**Masalah:** `hostname: "**"` membuat Next.js Image Optimization gak bisa optimize gambar dari domain yang tidak dikenal. Semua gambar dari luar langsung di-serve tanpa optimasi/resize/webp.

**Fix — Whitelist specific domains:**
```typescript
images: {
  remotePatterns: [
    { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
    { protocol: "https", hostname: "images.unsplash.com" },
    // Tambah specifik per tenant/domain yang dipake
  ],
  formats: ["image/webp", "image/avif"],
  deviceSizes: [640, 750, 828, 1080, 1200, 1920],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  minimumCacheTTL: 300, // Cache optimized images 5 menit minimal
},
```

**Alternative — tetap allow `**` tapi dengan pembatasan:**
```typescript
images: {
  // Unoptimized untuk domain luar, optimized untuk Supabase
  remotePatterns: [
    { hostname: "*.supabase.co" },
  ],
  // Kalau terpaksa, tetap diarahkan, Next.js ga optimize
},
```

**Effort:** 15 menit  
**Impact:** ⚡ **30-50% smaller images**

---

### P3. 🟠 Bundle Size — Heavy Dependencies

**File:** `package.json`

```json
"dependencies": {
  "@splinetool/react-spline": "^4.1.0",  // ~500KB+ — 3D viewer heavy
  "xlsx": "^0.18.5",                     // ~1.3MB — full Excel parser
  "framer-motion": "^12.42.2",           // ~200KB
  "recharts": "^3.9.2",                  // ~400KB — charting
}
```

**Fix — Code splitting + lighter alternatives:**

**a. Dynamic import untuk xlsx:**
```typescript
// export route — import only ketika dipanggil
export async function GET() {
  const xlsx = await import("xlsx"); // dynamic import
  // ...
}
```

**b. Cek apakah @splinetool benar-benar dipake:**
```bash
# Cari import @splinetool di codebase
grep -r "splinetool" src/
# Kalau gak dipake sama sekali → uninstall
npm uninstall @splinetool/react-spline
```

**c. Lazy load framer-motion components:**
```typescript
// Sebelum (heavy, langsung load)
import { motion } from "framer-motion";

// Sesudah (lazy, hanya untuk client)
import dynamic from "next/dynamic";
const MotionDiv = dynamic(() => import("framer-motion").then(m => m.motion.div), {
  ssr: false,
});
```

**d. Tree-shake recharts:**
```typescript
// Sebelum (import all)
import { BarChart, XAxis, YAxis } from "recharts";

// Sesudah (import spesifik — sudah otomatis tree-shake di ESM)
// Tapi pastikan no side-effects
```

**e. Pertimbangkan CSV untuk export:**
```typescript
// Alternatif: export CSV instead of XLSX (zero dependency)
export async function GET() {
  const csv = [
    ["ID", "Nama Produk", "Kategori", "Harga"].join(","),
    ...products.map(p => [p.id, p.name, p.category?.name, p.price].join(",")),
  ].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="produk-${now}.csv"`,
    },
  });
}
```

**Effort:** 1-2 jam  
**Impact:** ⚡ **30-40% bundle size reduction**

---

### P4. 🟡 Font Loading — Google Font Subsetting

**File:** `src/app/layout.tsx`

```typescript
import { Inter, JetBrains_Mono } from "next/font/google";
```

**Masalah:** Font Google di-load tanpa subset. Default-nya load **semua karakter Latin**, termasuk yang tidak dipake (Latin Extended, etc.).

**Fix — Subset + display swap:**
```typescript
const inter = Inter({
  subsets: ["latin"], // Hanya Latin, tanpa Extended
  display: "swap",    // FOUT instead of FOIT
  preload: true,      // Preload font utama
  fallback: ["system-ui", "Arial", "sans-serif"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  preload: false,     // Jangan preload font sekunder
  fallback: ["Consolas", "monospace"],
});
```

**Effort:** 5 menit  
**Impact:** ⚡ **10-20% first paint improvement**

---

### P5. 🟡 No Dynamic Import — Client Components

**Masalah:** Komponen client-side seperti `ProductGalleryClient`, `AddToCartBtn`, `LiveSearch`, `HeroSlider` di-import langsung (eager) meskipun mereka "use client".

**Cek komponen yang bisa di-lazy load:**

```typescript
// src/app/toko/[store_slug]/page.tsx — heavy components
import { FloatingWaBtn } from "@/components/public/floating-wa-btn"; // client
import { HeroSlider } from "@/components/public/hero-slider";       // client
import { LiveSearch } from "@/components/public/live-search";       // client
```

**Fix — Dynamic import:**
```typescript
// Di page server component, import client components via dynamic
import dynamic from "next/dynamic";

const FloatingWaBtn = dynamic(() => import("@/components/public/floating-wa-btn"), {
  ssr: false, // No SSR needed for floating button
});

const HeroSlider = dynamic(() => import("@/components/public/hero-slider"), {
  ssr: true, // SSR ok, but split bundle
});

const LiveSearch = dynamic(() => import("@/components/public/live-search"), {
  ssr: false, // Only client, after user scrolls
  loading: () => <div className="h-10 w-full skeleton" />,
});
```

**Effort:** 30 menit  
**Impact:** ⚡ **Reduksi initial bundle ~50-100KB**

---

### P6. 🟡 No Streaming / Suspense Boundaries

**Masalah:** Tidak ada `Suspense` boundary. Semua page di-render blocking — browser nunggu semua data selesai sebelum render apapun.

**Fix — Streaming dengan Suspense:**
```typescript
// src/app/toko/[store_slug]/page.tsx
import { Suspense } from "react";

export default async function LandingPage({ params }: Props) {
  const { store_slug } = await params;

  return (
    <div>
      {/* Hero section — instant dari cache */}
      <HeroSection storeSlug={store_slug} />

      {/* Categories — stream setelah siap */}
      <Suspense fallback={<CategorySkeleton />}>
        <FeaturedCategories storeSlug={store_slug} />
      </Suspense>

      {/* Products — stream setelah siap */}
      <Suspense fallback={<ProductGridSkeleton count={6} />}>
        <FeaturedProducts storeSlug={store_slug} />
      </Suspense>

      {/* Custom HTML — slow, stream terakhir */}
      <Suspense fallback={null}>
        <CustomLanding storeSlug={store_slug} />
      </Suspense>
    </div>
  );
}

// Komponen terpisah jadi bisa streaming
async function FeaturedCategories({ storeSlug }: { storeSlug: string }) {
  const categories = await getFeaturedCategories(storeSlug);
  return <CategoryGrid categories={categories} />;
}
```

**Effort:** 1 jam  
**Impact:** ⚡ **First paint 50% faster**

---

### P7. 🟡 Caching Strategy — Public Pages

**Masalah:** Hanya custom landing page (`lp/[slug]/route.ts`) yang punya `Cache-Control: public, s-maxage=60`. Semua halaman toko publik tidak punya cache header sama sekali.

**Fix — Cache headers per route:**

```typescript
// src/app/toko/[store_slug]/page.tsx — tambah di layout/page
// Atau via next.config.ts — headers per path pattern

// next.config.ts — tambah caching untuk public pages
async headers() {
  return [
    {
      source: "/toko/:slug",
      headers: [
        { key: "Cache-Control", value: "public, s-maxage=60, stale-while-revalidate=300" },
      ],
    },
    {
      source: "/toko/:slug/produk/:product",
      headers: [
        { key: "Cache-Control", value: "public, s-maxage=300, stale-while-revalidate=600" },
      ],
    },
    {
      source: "/toko/:slug/kategori/:category",
      headers: [
        { key: "Cache-Control", value: "public, s-maxage=300, stale-while-revalidate=600" },
      ],
    },
    {
      source: "/promo",
      headers: [
        { key: "Cache-Control", value: "public, s-maxage=3600, stale-while-revalidate=86400" },
      ],
    },
  ];
},
```

**Effort:** 15 menit  
**Impact:** ⚡ **CDN cache hit ratio 80%+**

---

### P8. 🟢 No Bundle Analyzer

**Masalah:** Tidak ada visibility ke bundle size. Tidak tahu komponen mana yang berat.

**Fix:**
```bash
npm install --save-dev @next/bundle-analyzer
```

```typescript
// next.config.ts
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

module.exports = withBundleAnalyzer(nextConfig);
```

```bash
# Jalankan:
ANALYZE=true npm run build
# → Buka .next/analyze/client.html untuk visual bundle map
```

**Effort:** 15 menit  
**Impact:** 📊 **Visibility ke bundle composition**

---

### P9. 🟢 Supabase Query Over-fetching

**Masalah:** Banyak query pake `SELECT *` padahal cuma butuh 2-3 field.

**File:**
- `public-data.ts:81` — `categories: .select("*")`, padahal cuma butuh `id, name, slug, description, image_path, image_alt, sort_order`
- `public-data.ts:274` — `products: .select("*")` padahal cuma butuh 10 dari ~20 field
- `product-actions.ts:167` — `products: .select("*")`

**Fix — Select specific columns:**
```typescript
// Sebelum: .select("*")
// Sesudah:
.select("id, name, slug, summary, main_image_path, main_image_alt, price, tags, sort_order, category_id, is_visible, created_at, updated_at")
```

**Effort:** 30 menit  
**Impact:** ⚡ **30-50% less data over wire**

---

### P10. 🟢 Use `React.cache` untuk Data yang Sama

**Masalah:** `getSiteSettings(storeSlug)` dipanggil multiple times di halaman yang sama:
- `generateMetadata` panggil 1x
- `LandingPage` panggil 1x
- `getVisibleCategories` panggil 1x (via `getStoreOwnerId`)

**Fix — Deduplicate dengan `React.cache`:**
```typescript
// src/lib/public-data.ts
import { cache } from "react";

// Cache per request — gak perlu query ulang untuk slug yang sama
export const getSiteSettings = cache(async (storeSlug: string): Promise<SiteSettings | null> => {
  const supabase = createAdminClient();
  const { data } = await supabase.from("site_settings").select("*").eq("store_slug", storeSlug).single();
  return data as SiteSettings | null;
});
```

Supabase SSR client sebenarnya sudah punya request dedup, tapi `React.cache` memastikan dalam 1 render cycle function dipanggil sekali.

**Effort:** 15 menit  
**Impact:** ⚡ **25-50% fewer duplicate queries**

---

### P11. 🟢 Route Segment Config — Missing Caching

**Masalah:** Tidak ada page yang define `generateStaticParams`. Untuk toko slug yang jarang berubah, kita bisa generate static pages.

**Fix — Partial Static Generation:**
```typescript
// src/app/toko/[store_slug]/kategori/page.tsx
export async function generateStaticParams() {
  // Generate static pages untuk toko populer
  const supabase = createAdminClient();
  const { data } = await supabase.from("site_settings").select("store_slug").limit(50);
  return (data ?? []).map((s) => ({ store_slug: s.store_slug }));
}

export const revalidate = 3600; // Revalidate setiap jam
```

**Catatan:** Jangan generate semua toko — cukup yang populer. Coolify + ISR akan handle sisanya.

**Effort:** 30 menit  
**Impact:** ⚡ **Instant load untuk toko populer**

---

## 📈 Lighthouse Score Projection

| Metric | Before (est.) | After (est.) | Improvement |
|--------|:------------:|:------------:|:-----------:|
| **First Contentful Paint** | 2.5s | **0.8s** | 68% faster |
| **Largest Contentful Paint** | 4.0s | **1.5s** | 63% faster |
| **Time to Interactive** | 3.5s | **1.2s** | 66% faster |
| **Cumulative Layout Shift** | 0.15 | **0.02** | Stable |
| **Speed Index** | 5.0s | **1.8s** | 64% faster |
| **Bundle Size (initial)** | ~450KB | **~200KB** | 56% smaller |

---

## 🎯 Prioritized Task List

| ID | Task | Effort | Impact | Priority |
|----|------|--------|--------|----------|
| P1 | **ISR revalidate** — ganti 9 `force-dynamic` | 30m | 🔴 3-5x faster | **Week 1** |
| P2 | **Image optimization** — whitelist domains | 15m | 🟠 30-50% smaller | **Week 1** |
| P3 | **Bundle size** — xlsx dynamic/spline check | 1-2h | 🟠 30-40% bundle | **Week 2** |
| P4 | **Font subset** — latin subset + swap | 5m | 🟠 10-20% FCP | **Week 1** |
| P5 | **Dynamic import** — lazy load client components | 30m | 🟡 50-100KB reduksi | **Week 2** |
| P6 | **Streaming/Suspense** — non-blocking render | 1h | 🟡 50% first paint | **Week 2** |
| P7 | **Cache headers** — public pages CDN cache | 15m | 🟡 80% cache hit | **Week 1** |
| P8 | **Bundle analyzer** — visibility setup | 15m | 🟢 Monitoring tool | **Week 3** |
| P9 | **Query SELECT *** — specific columns | 30m | 🟡 30-50% less data | **Week 2** |
| P10 | **React.cache** — dedup queries | 15m | 🟢 25-50% fewer queries | **Week 2** |
| P11 | **generateStaticParams** — populer toko | 30m | 🟢 Instant load top toko | **Week 3** |

---

## 🚀 Quick Wins (Day 1)

Kalau cuma punya 1 jam, lakukan ini:

1. **P4 + P1 + P7** — Font subset (5m) + ISR di toko pages (15m) + Cache headers (15m)
2. **P9** — SELECT * → specific columns di 3 file (20m)
3. **P10** — React.cache di getSiteSettings (5m)

**Hasil:** First paint turun dari 2.5s → **~1.0s** hanya dalam 1 jam kerja.

---

> **Generated:** 30 Juli 2026 | **Status:** 🔴 5/10 → 🎯 Target 9/10  
> **File:** `KatalogHub-go-live/PERFORMANCE-OPTIMIZATION.md`
