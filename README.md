# KatalogHub - Backoffice (Fase 1-8)

Web app katalog produk teknis dengan admin panel dan CTA WhatsApp. Bagian **backoffice** (Fase 1-8) sudah dibangun di sesi ini. Website publik (Fase 9-12) menyusul.

## Stack

- **Next.js 15** App Router, React 19, TypeScript
- **Tailwind CSS 3** + komponen ala shadcn/ui (industrial teknikal)
- **Supabase** (Postgres + Auth + Storage) — local-first

## Struktur

```
src/
  app/
    (public)/         # halaman publik (menyusul)
    admin/            # area admin (login + dashboard + modul)
    layout.tsx        # root layout
  components/
    ui/               # komponen primitif (button, input, dsb.)
    admin/            # komponen khusus admin
  lib/
    supabase/         # klien server/browser/middleware
    db/               # query helpers & types
    utils.ts          # cn, slugify, format, dll.
supabase/
  config.toml
  migrations/
    20260712150000_profiles_and_bootstrap.sql
    20260712150100_catalog_tables.sql
    20260712150200_rls_policies.sql
    20260712150300_storage_buckets.sql
    20260712150400_seed_landing.sql
```

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Salin env

```bash
cp .env.example .env.local
```

### 3. Jalankan Supabase lokal

Memerlukan Supabase CLI & Docker.

```bash
npm i -g supabase
supabase start
# salin NEXT_PUBLIC_SUPABASE_URL & NEXT_PUBLIC_SUPABASE_ANON_KEY dari output
# tempel ke .env.local
supabase db reset   # apply migration + seed
```

> Bisa juga pakai project remote: isi `.env.local` dengan URL & anon key project Anda, lalu apply migration via Supabase Studio → SQL Editor (jalankan berurutan).

### 4. Buat admin pertama (bootstrap)

Karena signup publik dimatikan, admin pertama dibuat lewat route bootstrap satu kali. Jalankan dev server:

```bash
npm run dev
```

Buka `http://localhost:3000/admin/bootstrap`. Bila belum ada admin, Anda bisa mendaftarkan admin pertama melalui Supabase Auth (email/password) — profile Anda otomatis ditandai `is_admin = true` oleh trigger `handle_new_user`.

### 5. Login admin

`http://localhost:3000/admin/login`.

## Skema data (ringkas)

- `profiles` — link ke `auth.users`, flag `is_admin`
- `categories` — pengelompokan katalog (slug unik, status tampil, urutan)
- `category_spec_templates` — 1:1 dengan kategori
- `category_spec_fields` — field spesifikasi: label, tipe (`text|number|boolean|select`), wajib, filterable, urutan
- `products` — produk + galeri (jsonb) + tags + main_image_path
- `product_spec_values` — nilai spesifikasi per produk × field
- `product_documents` — file unduhan per produk
- `landing_sections` — section dinamis dengan config jsonb (hero, about, advantages, featured_categories, featured_products, testimonials, cta)
- `site_settings` — singleton (id=1): brand, kontak, SEO, WhatsApp

### Aturan MVP yang dijaga RLS

- Publik hanya melihat kategori dengan `is_visible = true`
- Produk publik harus `is_visible = true` **dan** `main_image_path IS NOT NULL`
- Spec values & dokumen ikut visibilitas produk
- Hanya admin (`profiles.is_admin = true`) yang CRUD; publik read-only
- Storage bucket publik read, admin write

## Skrip

```bash
npm run dev        # development
npm run build      # build produksi
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
```

## Yang belum dibangun (Fase 9-14)

- Website publik: header, footer, landing page render, katalog, detail produk
- Search & filter publik
- Hardening UX, loading state, dan testing E2E MVP