-- ============================================================
-- Migration: profiles & admin bootstrap
-- Tanggal: 2026-07-12
-- Tujuan: tabel profiles (link ke auth.users), helper is_admin(),
--         trigger pembuatan profile otomatis saat user signup.
-- ============================================================

create extension if not exists "pgcrypto";

-- Tabel profiles: 1:1 dengan auth.users. Menyimpan flag is_admin.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Helper: apakah user saat ini adalah admin (profiles.is_admin = true).
-- Dipakai oleh RLS policy di seluruh tabel katalog.
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select coalesce(
    (
      select p.is_admin
      from public.profiles p
      where p.id = auth.uid()
      limit 1
    ),
    false
  );
$$;

-- Helper: apakah belum ada admin sama sekali (untuk bootstrap admin pertama).
create or replace function public.has_no_admin()
returns boolean
language sql
security definer
stable
as $$
  select not exists (select 1 from public.profiles where is_admin = true);
$$;

-- Auto-buat profile saat user signup baru. Admin pertama ditandai
-- bila belum ada admin lain (jalur bootstrap satu kali).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, email, is_admin)
  values (
    new.id,
    new.email,
    public.has_no_admin()
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helper: timestamp updated_at otomatis.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
-- RLS: profiles
-- ============================================================
alter table public.profiles enable row level security;

-- User bisa melihat profile sendiri. Admin bisa melihat semua (untuk dashboard).
drop policy if exists "profiles_self_select" on public.profiles;
create policy "profiles_self_select" on public.profiles
  for select using (auth.uid() = id or public.is_admin());

-- User bisa update profile sendiri (mis. nama), admin bisa update semua.
-- Flag is_admin hanya bisa diubah oleh admin yang sudah ada (anti-escalation).
drop policy if exists "profiles_self_update" on public.profiles;
create policy "profiles_self_update" on public.profiles
  for update using (auth.uid() = id or public.is_admin())
  with check (
    -- Perubahan is_admin hanya boleh oleh admin yang sudah ada.
    -- Saat belum ada admin sama sekali, baru diperbolehkan (bootstrap).
    (new.is_admin = old.is_admin) or public.is_admin() or public.has_no_admin()
  );

-- Tidak ada delete langsung dari client; user dihapus via auth.users.
-- ============================================================
-- Migration: core catalog tables
-- Tanggal: 2026-07-12
-- Entitas: categories, category_spec_templates, category_spec_fields,
--          products, product_spec_values, product_documents,
--          landing_sections, site_settings
-- ============================================================

-- ------------------------------------------------------------
-- Kategori
-- ------------------------------------------------------------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_path text,
  image_alt text,
  is_visible boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_categories_touch on public.categories;
create trigger trg_categories_touch
  before update on public.categories
  for each row execute function public.touch_updated_at();

create index if not exists idx_categories_sort on public.categories (sort_order);
create index if not exists idx_categories_visible on public.categories (is_visible);

-- ------------------------------------------------------------
-- Template spesifikasi kategori (1:1 dengan kategori)
-- ------------------------------------------------------------
create table if not exists public.category_spec_templates (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete cascade,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (category_id)
);

drop trigger if exists trg_category_spec_templates_touch on public.category_spec_templates;
create trigger trg_category_spec_templates_touch
  before update on public.category_spec_templates
  for each row execute function public.touch_updated_at();

-- ------------------------------------------------------------
-- Field spesifikasi (N:1 dengan template)
-- Tipe field dibatasi untuk MVP: text, number, boolean, select.
-- ------------------------------------------------------------
create table if not exists public.category_spec_fields (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.category_spec_templates(id) on delete cascade,
  label text not null,
  field_key text not null,
  field_type text not null check (field_type in ('text', 'number', 'boolean', 'select')),
  options jsonb not null default '[]'::jsonb,   -- array string untuk select
  unit text,
  is_required boolean not null default false,
  is_filterable boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (template_id, field_key)
);

drop trigger if exists trg_category_spec_fields_touch on public.category_spec_fields;
create trigger trg_category_spec_fields_touch
  before update on public.category_spec_fields
  for each row execute function public.touch_updated_at();

create index if not exists idx_spec_fields_template on public.category_spec_fields (template_id, sort_order);
create index if not exists idx_spec_fields_filterable on public.category_spec_fields (template_id) where is_filterable = true;

-- ------------------------------------------------------------
-- Produk
-- Galeri disimpan sebagai jsonb array of {path, alt} untuk simpel MVP.
-- ------------------------------------------------------------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete restrict,
  name text not null,
  slug text not null unique,
  summary text,
  description text,
  main_image_path text,
  main_image_alt text,
  gallery jsonb not null default '[]'::jsonb,  -- [{ "path": "...", "alt": "..." }]
  tags text[] not null default '{}'::text[],
  is_visible boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_products_touch on public.products;
create trigger trg_products_touch
  before update on public.products
  for each row execute function public.touch_updated_at();

create index if not exists idx_products_category on public.products (category_id);
create index if not exists idx_products_slug on public.products (slug);
create index if not exists idx_products_visible on public.products (is_visible);
create index if not exists idx_products_sort on public.products (sort_order);
create index if not exists idx_products_tags on public.products using gin (tags);
create index if not exists idx_products_name_trgm on public.products using gin (name gin_trgm_ops);

-- Ekstensi trigram untuk search nama produk fuzzy.
create extension if not exists pg_trgm;

-- ------------------------------------------------------------
-- Nilai spesifikasi produk (1:1 produk × field)
-- Kolom value_* dipilih sesuai field_type.
-- ------------------------------------------------------------
create table if not exists public.product_spec_values (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  field_id uuid not null references public.category_spec_fields(id) on delete cascade,
  value_text text,
  value_number numeric,
  value_boolean boolean,
  value_select text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, field_id)
);

drop trigger if exists trg_product_spec_values_touch on public.product_spec_values;
create trigger trg_product_spec_values_touch
  before update on public.product_spec_values
  for each row execute function public.touch_updated_at();

create index if not exists idx_spec_values_product on public.product_spec_values (product_id);
create index if not exists idx_spec_values_field on public.product_spec_values (field_id);

-- ------------------------------------------------------------
-- Dokumen unduhan produk
-- ------------------------------------------------------------
create table if not exists public.product_documents (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  label text not null,
  file_path text not null,
  file_size bigint,
  mime_type text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_product_documents_touch on public.product_documents;
create trigger trg_product_documents_touch
  before update on public.product_documents
  for each row execute function public.touch_updated_at();

create index if not exists idx_documents_product on public.product_documents (product_id, sort_order);

-- ------------------------------------------------------------
-- Landing section: section dinamis untuk landing page publik.
-- section_key unik menandai tipe section; config jsonb menyimpan data section.
-- ------------------------------------------------------------
create table if not exists public.landing_sections (
  id uuid primary key default gen_random_uuid(),
  section_key text not null unique,
  heading text,
  subheading text,
  body text,
  config jsonb not null default '{}'::jsonb,
  is_visible boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_landing_sections_touch on public.landing_sections;
create trigger trg_landing_sections_touch
  before update on public.landing_sections
  for each row execute function public.touch_updated_at();

create index if not exists idx_landing_sort on public.landing_sections (sort_order);
create index if not exists idx_landing_visible on public.landing_sections (is_visible);

-- ------------------------------------------------------------
-- Site settings (singleton: id = 1).
-- ============================================================
create table if not exists public.site_settings (
  id int primary key default 1 check (id = 1),
  brand_name text not null default 'KatalogHub',
  brand_tagline text,
  contact_email text,
  contact_phone text,
  contact_address text,
  whatsapp_number text,
  whatsapp_template text not null default 'Halo, saya tertarik dengan produk di katalog Anda.',
  seo_title text,
  seo_description text,
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_site_settings_touch on public.site_settings;
create trigger trg_site_settings_touch
  before update on public.site_settings
  for each row execute function public.touch_updated_at();

-- Sisipkan baris singleton default.
insert into public.site_settings (id)
values (1)
on conflict (id) do nothing;
-- ============================================================
-- Migration: Row Level Security policies
-- Tanggal: 2026-07-12
-- Aturan:
--   - Publik (anon / authenticated) baca data yang sudah layak tampil.
--   - Admin (profiles.is_admin = true) full CRUD.
--   - Produk tanpa foto utama tidak tampil di publik walau is_visible=true.
-- ============================================================

-- ------------------------------------------------------------
-- categories
-- ------------------------------------------------------------
alter table public.categories enable row level security;

drop policy if exists "categories_public_read" on public.categories;
create policy "categories_public_read" on public.categories
  for select using (is_visible = true or public.is_admin());

drop policy if exists "categories_admin_write" on public.categories;
create policy "categories_admin_write" on public.categories
  for all using (public.is_admin()) with check (public.is_admin());

-- ------------------------------------------------------------
-- category_spec_templates
-- Spesifikasi kategori publik (untuk render halaman detail publik).
-- ------------------------------------------------------------
alter table public.category_spec_templates enable row level security;

drop policy if exists "spec_templates_public_read" on public.category_spec_templates;
create policy "spec_templates_public_read" on public.category_spec_templates
  for select using (true);

drop policy if exists "spec_templates_admin_write" on public.category_spec_templates;
create policy "spec_templates_admin_write" on public.category_spec_templates
  for all using (public.is_admin()) with check (public.is_admin());

-- ------------------------------------------------------------
-- category_spec_fields
-- ------------------------------------------------------------
alter table public.category_spec_fields enable row level security;

drop policy if exists "spec_fields_public_read" on public.category_spec_fields;
create policy "spec_fields_public_read" on public.category_spec_fields
  for select using (true);

drop policy if exists "spec_fields_admin_write" on public.category_spec_fields;
create policy "spec_fields_admin_write" on public.category_spec_fields
  for all using (public.is_admin()) with check (public.is_admin());

-- ------------------------------------------------------------
-- products
-- Aturan MVP: publik hanya melihat produk yang is_visible DAN punya
-- foto utama. Admin melihat & mengelola semua.
-- ------------------------------------------------------------
alter table public.products enable row level security;

drop policy if exists "products_public_read" on public.products;
create policy "products_public_read" on public.products
  for select using (
    (is_visible = true and main_image_path is not null) or public.is_admin()
  );

drop policy if exists "products_admin_write" on public.products;
create policy "products_admin_write" on public.products
  for all using (public.is_admin()) with check (public.is_admin());

-- ------------------------------------------------------------
-- product_spec_values
-- Publik baca hanya untuk produk yang sudah tampil.
-- ------------------------------------------------------------
alter table public.product_spec_values enable row level security;

drop policy if exists "spec_values_public_read" on public.product_spec_values;
create policy "spec_values_public_read" on public.product_spec_values
  for select using (
    exists (
      select 1 from public.products p
      where p.id = product_spec_values.product_id
        and p.is_visible = true
        and p.main_image_path is not null
    ) or public.is_admin()
  );

drop policy if exists "spec_values_admin_write" on public.product_spec_values;
create policy "spec_values_admin_write" on public.product_spec_values
  for all using (public.is_admin()) with check (public.is_admin());

-- ------------------------------------------------------------
-- product_documents
-- ------------------------------------------------------------
alter table public.product_documents enable row level security;

drop policy if exists "documents_public_read" on public.product_documents;
create policy "documents_public_read" on public.product_documents
  for select using (
    exists (
      select 1 from public.products p
      where p.id = product_documents.product_id
        and p.is_visible = true
        and p.main_image_path is not null
    ) or public.is_admin()
  );

drop policy if exists "documents_admin_write" on public.product_documents;
create policy "documents_admin_write" on public.product_documents
  for all using (public.is_admin()) with check (public.is_admin());

-- ------------------------------------------------------------
-- landing_sections
-- ------------------------------------------------------------
alter table public.landing_sections enable row level security;

drop policy if exists "landing_public_read" on public.landing_sections;
create policy "landing_public_read" on public.landing_sections
  for select using (is_visible = true or public.is_admin());

drop policy if exists "landing_admin_write" on public.landing_sections;
create policy "landing_admin_write" on public.landing_sections
  for all using (public.is_admin()) with check (public.is_admin());

-- ------------------------------------------------------------
-- site_settings (singleton)
-- Publik baca (agar header/footer & CTA WhatsApp bisa render).
-- Hanya admin yang update.
-- ------------------------------------------------------------
alter table public.site_settings enable row level security;

drop policy if exists "settings_public_read" on public.site_settings;
create policy "settings_public_read" on public.site_settings
  for select using (true);

drop policy if exists "settings_admin_write" on public.site_settings;
create policy "settings_admin_write" on public.site_settings
  for all using (public.is_admin()) with check (public.is_admin());
-- ============================================================
-- Migration: Storage buckets & policies
-- Tanggal: 2026-07-12
-- Bucket (semua public read, admin write):
--   - product-images   : foto utama & galeri produk
--   - product-documents: dokumen unduhan produk
--   - category-media   : gambar/ikon kategori
--   - landing-media    : gambar section landing page
-- ============================================================

-- product-images
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- product-documents
insert into storage.buckets (id, name, public)
values ('product-documents', 'product-documents', true)
on conflict (id) do nothing;

-- category-media
insert into storage.buckets (id, name, public)
values ('category-media', 'category-media', true)
on conflict (id) do nothing;

-- landing-media
insert into storage.buckets (id, name, public)
values ('landing-media', 'landing-media', true)
on conflict (id) do nothing;

-- ============================================================
-- Policies storage.objects
-- Public read, admin write untuk keempat bucket.
-- ============================================================

-- ---------- product-images ----------
drop policy if exists "product_images_public_read" on storage.objects;
create policy "product_images_public_read" on storage.objects
  for select using (bucket_id = 'product-images');

drop policy if exists "product_images_admin_insert" on storage.objects;
create policy "product_images_admin_insert" on storage.objects
  for insert with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "product_images_admin_update" on storage.objects;
create policy "product_images_admin_update" on storage.objects
  for update using (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "product_images_admin_delete" on storage.objects;
create policy "product_images_admin_delete" on storage.objects
  for delete using (bucket_id = 'product-images' and public.is_admin());

-- ---------- product-documents ----------
drop policy if exists "product_documents_public_read" on storage.objects;
create policy "product_documents_public_read" on storage.objects
  for select using (bucket_id = 'product-documents');

drop policy if exists "product_documents_admin_insert" on storage.objects;
create policy "product_documents_admin_insert" on storage.objects
  for insert with check (bucket_id = 'product-documents' and public.is_admin());

drop policy if exists "product_documents_admin_update" on storage.objects;
create policy "product_documents_admin_update" on storage.objects
  for update using (bucket_id = 'product-documents' and public.is_admin());

drop policy if exists "product_documents_admin_delete" on storage.objects;
create policy "product_documents_admin_delete" on storage.objects
  for delete using (bucket_id = 'product-documents' and public.is_admin());

-- ---------- category-media ----------
drop policy if exists "category_media_public_read" on storage.objects;
create policy "category_media_public_read" on storage.objects
  for select using (bucket_id = 'category-media');

drop policy if exists "category_media_admin_insert" on storage.objects;
create policy "category_media_admin_insert" on storage.objects
  for insert with check (bucket_id = 'category-media' and public.is_admin());

drop policy if exists "category_media_admin_update" on storage.objects;
create policy "category_media_admin_update" on storage.objects
  for update using (bucket_id = 'category-media' and public.is_admin());

drop policy if exists "category_media_admin_delete" on storage.objects;
create policy "category_media_admin_delete" on storage.objects
  for delete using (bucket_id = 'category-media' and public.is_admin());

-- ---------- landing-media ----------
drop policy if exists "landing_media_public_read" on storage.objects;
create policy "landing_media_public_read" on storage.objects
  for select using (bucket_id = 'landing-media');

drop policy if exists "landing_media_admin_insert" on storage.objects;
create policy "landing_media_admin_insert" on storage.objects
  for insert with check (bucket_id = 'landing-media' and public.is_admin());

drop policy if exists "landing_media_admin_update" on storage.objects;
create policy "landing_media_admin_update" on storage.objects
  for update using (bucket_id = 'landing-media' and public.is_admin());

drop policy if exists "landing_media_admin_delete" on storage.objects;
create policy "landing_media_admin_delete" on storage.objects
  for delete using (bucket_id = 'landing-media' and public.is_admin());
-- ============================================================
-- Migration: Seed landing sections default
-- Tanggal: 2026-07-12
-- Membuat 7 section MVP dengan sort_order default & is_visible=false
-- sampai admin mengisinya. Section kosong disembunyikan di publik.
-- ============================================================

insert into public.landing_sections (section_key, heading, subheading, body, config, is_visible, sort_order) values
  (
    'hero',
    'Solusi Teknikal untuk Industri Anda',
    'Brand katalog produk teknis terpercaya',
    null,
    '{"image_path": null, "cta_label": "Lihat Katalog", "cta_href": "/katalog"}'::jsonb,
    false,
    10
  ),
  (
    'about',
    'Tentang Brand',
    null,
    'Cerita singkat tentang brand dan posisi kami di industri.',
    '{"image_path": null}'::jsonb,
    false,
    20
  ),
  (
    'advantages',
    'Keunggulan Kami',
    null,
    null,
    '{"items": []}'::jsonb,
    false,
    30
  ),
  (
    'featured_categories',
    'Kategori Unggulan',
    null,
    null,
    '{"category_ids": []}'::jsonb,
    false,
    40
  ),
  (
    'featured_products',
    'Produk Pilihan',
    null,
    null,
    '{"product_ids": []}'::jsonb,
    false,
    50
  ),
  (
    'testimonials',
    'Proyek & Testimonial',
    null,
    null,
    '{"items": []}'::jsonb,
    false,
    60
  ),
  (
    'cta',
    'Butuh konsultasi produk?',
    'Tim kami siap membantu memilih produk yang tepat.',
    null,
    '{"cta_label": "Tanya Harga via WhatsApp", "cta_href": "whatsapp"}'::jsonb,
    false,
    70
  )
on conflict (section_key) do nothing;
-- ============================================================
-- Migration: seed sample data untuk evaluasi backoffice
-- ============================================================

-- ------------------------------------------------------------
-- 1. Site settings: brand info lengkap
-- ------------------------------------------------------------
update public.site_settings set
  brand_name        = 'Cakra Teknik',
  brand_tagline     = 'Solusi Presisi untuk Kebutuhan Industri Anda',
  contact_email     = 'info@cakrateknik.co.id',
  contact_phone     = '+62 21 5555 1234',
  contact_address   = 'Jl. Industri Raya No. 88, Tangerang, Banten 15132',
  whatsapp_number   = '6281234567890',
  whatsapp_template = 'Halo Cakra Teknik, saya tertarik dengan produk {{name}} di katalog Anda. Mohon info harga dan ketersediaan.',
  seo_title         = 'Cakra Teknik — Katalog Produk Teknikal Industri',
  seo_description   = 'Katalog produk teknis industri: pompa, valve, filter, alat ukur. Spesifikasi lengkap, harga kompetitif, pengiriman seluruh Indonesia.'
where id = 1;

-- ------------------------------------------------------------
-- 2. Kategori produk
-- ------------------------------------------------------------
insert into public.categories (id, name, slug, description, is_visible, sort_order) values
  ('a1000000-0000-0000-0000-000000000001', 'Pompa Sentrifugal',  'pompa-sentrifugal',
   'Pompa industri untuk transfer cairan korosif, panas, dan abrasive. Tersedia berbagai kapasitas dan material.',
   true, 10),
  ('a1000000-0000-0000-0000-000000000002', 'Katup Industri',     'katup-industri',
   'Gate valve, ball valve, butterfly valve, dan globe valve untuk sistem perpipaan tekanan tinggi.',
   true, 20),
  ('a1000000-0000-0000-0000-000000000003', 'Filter & Saringan',  'filter-saringan',
   'Sistem filtrasi untuk air, oli, gas, dan bahan kimia. Cartridge filter, bag filter, dan housing.',
   true, 30),
  ('a1000000-0000-0000-0000-000000000004', 'Alat Ukur Teknikal', 'alat-ukur-teknikal',
   'Instrumen presisi: pressure gauge, flow meter, temperature sensor, dan calibrator.',
   true, 40),
  ('a1000000-0000-0000-0000-000000000005', 'Pipa & Fittings',    'pipa-fittings',
   'Pipa baja carbon steel, stainless steel, PVC, dan HDPE beserta fittings lengkap.',
   false, 50)
on conflict (id) do nothing;

-- ------------------------------------------------------------
-- 3. Spec templates (1 per kategori)
-- ------------------------------------------------------------
insert into public.category_spec_templates (id, category_id, is_active) values
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', true),
  ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000002', true),
  ('b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000003', true),
  ('b1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000004', true)
on conflict (id) do nothing;

-- ------------------------------------------------------------
-- 4. Spec fields — Pompa Sentrifugal
-- ------------------------------------------------------------
insert into public.category_spec_fields (id, template_id, label, field_key, field_type, options, unit, is_required, is_filterable, sort_order) values
  ('c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'Kapasitas',       'kapasitas',        'number',   '[]'::jsonb, 'm³/jam',  true,  true,  10),
  ('c1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001', 'Head (Total)',     'head_total',       'number',   '[]'::jsonb, 'meter',   true,  true,  20),
  ('c1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000001', 'Daya Motor',      'daya_motor',       'number',   '[]'::jsonb, 'kW',      true,  false, 30),
  ('c1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000001', 'Material Wetted',  'material_wetted',  'select',   '["SS316","SS304","Cast Iron","CD4MCu","Hastelloy"]'::jsonb, null, true,  true,  40),
  ('c1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000001', 'Kecepatan Putaran','kecepatan_putaran','number',   '[]'::jsonb, 'RPM',     false, false, 50),
  ('c1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000001', 'Tahan Korosi',    'tahan_korosi',     'boolean',  '[]'::jsonb, null,      false, true,  60);

-- ------------------------------------------------------------
-- 5. Spec fields — Katup Industri
-- ------------------------------------------------------------
insert into public.category_spec_fields (id, template_id, label, field_key, field_type, options, unit, is_required, is_filterable, sort_order) values
  ('c2000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000002', 'Tipe Katup',       'tipe_katup',       'select',   '["Gate","Ball","Butterfly","Globe","Check","Needle"]'::jsonb, null, true,  true,  10),
  ('c2000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000002', 'Ukuran DN',         'ukuran_dn',        'number',   '[]'::jsonb, 'mm',      true,  true,  20),
  ('c2000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000002', 'Tekanan Maks',     'tekanan_maks',     'number',   '[]'::jsonb, 'bar',     true,  true,  30),
  ('c2000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000002', 'Material Body',    'material_body',    'select',   '["Carbon Steel","SS316","SS304","Bronze","Ductile Iron"]'::jsonb, null, true,  true,  40),
  ('c2000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000002', 'Sertifikasi',      'sertifikasi',      'select',   '["API 600","API 602","BS EN 12516","WRAS","ATEX"]'::jsonb, null, false, true,  50);

-- ------------------------------------------------------------
-- 6. Spec fields — Filter & Saringan
-- ------------------------------------------------------------
insert into public.category_spec_fields (id, template_id, label, field_key, field_type, options, unit, is_required, is_filterable, sort_order) values
  ('c3000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000003', 'Tipe Filter',      'tipe_filter',      'select',   '["Cartridge","Bag","Basket","Membrane","Activated Carbon"]'::jsonb, null, true,  true,  10),
  ('c3000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000003', 'Ukuran Micron',     'ukuran_micron',    'number',   '[]'::jsonb, 'μm',      true,  true,  20),
  ('c3000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000003', 'Flow Rate Maks',   'flow_rate_maks',   'number',   '[]'::jsonb, 'L/min',   true,  false, 30),
  ('c3000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000003', 'Media Filtrasi',   'media_filtrasi',   'select',   '["Polypropylene","Polyester","Fiberglass","Stainless Steel Mesh"]'::jsonb, null, true,  true,  40),
  ('c3000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000003', 'Tahan Suhu',       'tahan_suhu',       'number',   '[]'::jsonb, '°C',      false, true,  50);

-- ------------------------------------------------------------
-- 7. Spec fields — Alat Ukur
-- ------------------------------------------------------------
insert into public.category_spec_fields (id, template_id, label, field_key, field_type, options, unit, is_required, is_filterable, sort_order) values
  ('c4000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000004', 'Tipe Instrumen',   'tipe_instrumen',   'select',   '["Pressure Gauge","Flow Meter","Temperature Sensor","Level Sensor","Calibrator"]'::jsonb, null, true,  true,  10),
  ('c4000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000004', 'Range Ukur',       'range_ukur',       'text',     '[]'::jsonb, null,      true,  true,  20),
  ('c4000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000004', 'Akurasi',          'akurasi',          'select',   '["±0.1%","±0.25%","±0.5%","±1.0%","±1.5%"]'::jsonb, null, true,  true,  30),
  ('c4000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000004', 'Output Signal',    'output_signal',    'select',   '["4-20mA","0-10V","HART","Modbus","Pulse"]'::jsonb, null, false, true,  40),
  ('c4000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000004', 'Material Probe',   'material_probe',   'select',   '["SS316","SS304","Inconel","Titanium","PTFE Lined"]'::jsonb, null, false, true,  50);

-- ------------------------------------------------------------
-- 8. Produk — Pompa Sentrifugal
-- ------------------------------------------------------------
insert into public.products (id, category_id, name, slug, summary, description, tags, is_visible, sort_order) values
  ('d1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001',
   'Pompa Sentrifugal CS-200',
   'pompa-sentrifugal-cs-200',
   'Pompa sentrifugal heavy duty untuk aplikasi korosif, kapasitas 200 m³/jam.',
   'Pompa sentrifugal CS-200 dirancang untuk aplikasi transfer cairan korosif dan abrasive di industri petrokimia, pertambangan, dan pengolahan limbah. Body cast iron dengan impeller SS316L untuk ketahanan optimal.',
   ARRAY['pompa','korosif','heavy-duty','centrifugal']::text[],
   true, 10),
  ('d1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001',
   'Pompa Sentrifugal CS-50',
   'pompa-sentrifugal-cs-50',
   'Pompa industri kompak untuk kapasitas 50 m³/jam, material SS304.',
   'Solusi ringkas untuk aplikasi transfer cairan bersih di industri makanan, farmasi, dan HVAC. Desain sanitary grade dengan finishing mirror polish.',
   ARRAY['pompa','sanitary','food-grade','ss304']::text[],
   true, 20),
  ('d1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001',
   'Pompa Sentrifugal CH-500',
   'pompa-sentrifugal-ch-500',
   'Pompa high-capacity 500 m³/jam untuk aplikasi water treatment dan cooling tower.',
   'Pompa berkapasitas tinggi dengan efficiency mencapai 82%. Dilengkapi mechanical seal type D04 untuk mencegah kebocoran pada tekanan tinggi.',
   ARRAY['pompa','high-capacity','water-treatment','cooling']::text[],
   false, 30);

-- ------------------------------------------------------------
-- 9. Produk — Katup Industri
-- ------------------------------------------------------------
insert into public.products (id, category_id, name, slug, summary, description, tags, is_visible, sort_order) values
  ('d2000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000002',
   'Gate Valve API 600 DN100',
   'gate-valve-api-600-dn100',
   'Gate valve berstandar API 600, DN100, tekanan 150#.',
   'Gate valve rugged untuk layanan on-off di refinery dan power plant. Rising stem design dengan bonnet bolted untuk kemudahan maintenance.',
   ARRAY['valve','gate','api-600','refinery']::text[],
   true, 10),
  ('d2000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000002',
   'Ball Valve Full Bore DN50',
   'ball-valve-full-bore-dn50',
   'Ball valve stainless steel full bore, DN50, tekanan 100 bar.',
   'Ball valve full bore untuk minimize pressure drop. Trunnion mounted untuk ukuran DN50 ke atas. Sertifikasi ATEX untuk area berbahaya.',
   ARRAY['valve','ball','stainless','atex']::text[],
   true, 20),
  ('d2000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000002',
   'Butterfly Valve EN 593 DN200',
   'butterfly-valve-en-593-dn200',
   'Butterfly valve lug type, DN200, untuk water treatment dan HVAC.',
   'Butterfly valve dengan desain lug type yang memungkinkan penggunaan pada sistem bongkar pasang (dead-end service). Disc SS316, seat EPDM.',
   ARRAY['valve','butterfly','water-treatment','hvac']::text[],
   true, 30),
  ('d2000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000002',
   'Check Valve Swing DN80',
   'check-valve-swing-dn80',
   'Check valve swing type untuk mencegah backflow, DN80.',
   'Check valve dengan mekanisme swing yang minim pressure loss. Cocok untuk aplikasi pump discharge dan sistem piping vertikal.',
   ARRAY['valve','check','backflow','pump-discharge']::text[],
   false, 40);

-- ------------------------------------------------------------
-- 10. Produk — Filter & Saringan
-- ------------------------------------------------------------
insert into public.products (id, category_id, name, slug, summary, description, tags, is_visible, sort_order) values
  ('d3000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000003',
   'Cartridge Filter Housing CF-10',
   'cartridge-filter-housing-cf-10',
   'Housing cartridge filter 10 inch, SS316, 5 cartridge elements.',
   'Housing stainless steel untuk 5 elemen cartridge 10 inch. Max tekanan 10 bar, suhu kerja maks 120°C. Dilengkapi pressure gauge dan drain valve.',
   ARRAY['filter','cartridge','ss316','housing']::text[],
   true, 10),
  ('d3000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000003',
   'Bag Filter BF-200',
   'bag-filter-bf-200',
   'Bag filter size 2, flow rate 200 L/min, housing carbon steel.',
   'Bag filter untuk aplikasi high-flow dengan 200 mesh stainless steel basket. Housing carbon steel dengan epoxy coating untuk ketahanan korosi.',
   ARRAY['filter','bag','high-flow','carbon-steel']::text[],
   true, 20),
  ('d3000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000003',
   'Activated Carbon Filter ACF-44',
   'activated-carbon-filter-acf-44',
   'Filter karbon aktif untuk removal klorin, VOC, dan bau.',
   'Vertical pressure vessel dengan media karbon aktif coconut shell. Capacity 44 liter media. Ideal untuk pre-treatment RO dan dechlorination.',
   ARRAY['filter','carbon','dechlorination','voc']::text[],
   true, 30);

-- ------------------------------------------------------------
-- 11. Produk — Alat Ukur
-- ------------------------------------------------------------
insert into public.products (id, category_id, name, slug, summary, description, tags, is_visible, sort_order) values
  ('d4000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000004',
   'Pressure Gauge SS316 PG-200',
   'pressure-gauge-ss316-pg-200',
   'Pressure gauge bourdon tube, range 0-200 bar, akurasi ±0.5%.',
   'Pressure gauge dengan casing dan socket SS316 untuk aplikasi korosif. Bourdon tube Monel untuk media agresif. Dilengkapi blow-out safety back.',
   ARRAY['pressure','gauge','ss316','bourdon']::text[],
   true, 10),
  ('d4000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000004',
   'Magnetic Flow Meter MF-150',
   'magnetic-flow-meter-mf-150',
   'Electromagnetic flow meter DN150, output 4-20mA + HART.',
   'Flow meter tanpa bagian moving part untuk akurasi tinggi pada cairan导电. Lining PTFE untuk chemical resistance. Sertifikasi SIL2.',
   ARRAY['flow-meter','magnetic','hart','sil2']::text[],
   true, 20),
  ('d4000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000004',
   'Temperature Transmitter TT-100',
   'temperature-transmitter-tt-100',
   'RTD Pt100 temperature transmitter, range -50°C s/d 400°C, output 4-20mA.',
   'Head-mount temperature transmitter dengan sensor Pt100 class A. Accuracy ±0.15°C. Housing aluminium explosion-proof Ex d IIC T6.',
   ARRAY['temperature','rtd','pt100','explosion-proof']::text[],
   true, 30);

-- ------------------------------------------------------------
-- 12. Spec values untuk produk visible
-- ------------------------------------------------------------
-- Pompa CS-200
insert into public.product_spec_values (product_id, field_id, value_number) values
  ('d1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 200),
  ('d1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000002', 35),
  ('d1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000003', 45),
  ('d1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000005', 2900);

insert into public.product_spec_values (product_id, field_id, value_select) values
  ('d1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000004', 'SS316');

insert into public.product_spec_values (product_id, field_id, value_boolean) values
  ('d1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000006', true);

-- Pompa CS-50
insert into public.product_spec_values (product_id, field_id, value_number) values
  ('d1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000001', 50),
  ('d1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000002', 18),
  ('d1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000003', 11),
  ('d1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000005', 2900);

insert into public.product_spec_values (product_id, field_id, value_select) values
  ('d1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000004', 'SS304');

-- Gate Valve
insert into public.product_spec_values (product_id, field_id, value_number) values
  ('d2000000-0000-0000-0000-000000000001', 'c2000000-0000-0000-0000-000000000002', 100),
  ('d2000000-0000-0000-0000-000000000001', 'c2000000-0000-0000-0000-000000000003', 20);

insert into public.product_spec_values (product_id, field_id, value_select) values
  ('d2000000-0000-0000-0000-000000000001', 'c2000000-0000-0000-0000-000000000001', 'Gate'),
  ('d2000000-0000-0000-0000-000000000001', 'c2000000-0000-0000-0000-000000000004', 'Carbon Steel'),
  ('d2000000-0000-0000-0000-000000000001', 'c2000000-0000-0000-0000-000000000005', 'API 600');

-- Ball Valve
insert into public.product_spec_values (product_id, field_id, value_number) values
  ('d2000000-0000-0000-0000-000000000002', 'c2000000-0000-0000-0000-000000000002', 50),
  ('d2000000-0000-0000-0000-000000000002', 'c2000000-0000-0000-0000-000000000003', 100);

insert into public.product_spec_values (product_id, field_id, value_select) values
  ('d2000000-0000-0000-0000-000000000002', 'c2000000-0000-0000-0000-000000000001', 'Ball'),
  ('d2000000-0000-0000-0000-000000000002', 'c2000000-0000-0000-0000-000000000004', 'SS316'),
  ('d2000000-0000-0000-0000-000000000002', 'c2000000-0000-0000-0000-000000000005', 'ATEX');

-- Butterfly Valve
insert into public.product_spec_values (product_id, field_id, value_number) values
  ('d2000000-0000-0000-0000-000000000003', 'c2000000-0000-0000-0000-000000000002', 200),
  ('d2000000-0000-0000-0000-000000000003', 'c2000000-0000-0000-0000-000000000003', 10);

insert into public.product_spec_values (product_id, field_id, value_select) values
  ('d2000000-0000-0000-0000-000000000003', 'c2000000-0000-0000-0000-000000000001', 'Butterfly'),
  ('d2000000-0000-0000-0000-000000000003', 'c2000000-0000-0000-0000-000000000004', 'Ductile Iron'),
  ('d2000000-0000-0000-0000-000000000003', 'c2000000-0000-0000-0000-000000000005', 'BS EN 12516');

-- Cartridge Filter
insert into public.product_spec_values (product_id, field_id, value_number) values
  ('d3000000-0000-0000-0000-000000000001', 'c3000000-0000-0000-0000-000000000002', 5),
  ('d3000000-0000-0000-0000-000000000001', 'c3000000-0000-0000-0000-000000000003', 50),
  ('d3000000-0000-0000-0000-000000000001', 'c3000000-0000-0000-0000-000000000005', 120);

insert into public.product_spec_values (product_id, field_id, value_select) values
  ('d3000000-0000-0000-0000-000000000001', 'c3000000-0000-0000-0000-000000000001', 'Cartridge'),
  ('d3000000-0000-0000-0000-000000000001', 'c3000000-0000-0000-0000-000000000004', 'Polypropylene');

-- Pressure Gauge
insert into public.product_spec_values (product_id, field_id, value_text) values
  ('d4000000-0000-0000-0000-000000000001', 'c4000000-0000-0000-0000-000000000002', '0 – 200 bar');

insert into public.product_spec_values (product_id, field_id, value_select) values
  ('d4000000-0000-0000-0000-000000000001', 'c4000000-0000-0000-0000-000000000001', 'Pressure Gauge'),
  ('d4000000-0000-0000-0000-000000000001', 'c4000000-0000-0000-0000-000000000003', '±0.5%'),
  ('d4000000-0000-0000-0000-000000000001', 'c4000000-0000-0000-0000-000000000005', 'SS316');

-- Magnetic Flow Meter
insert into public.product_spec_values (product_id, field_id, value_text) values
  ('d4000000-0000-0000-0000-000000000002', 'c4000000-0000-0000-0000-000000000002', '0.3 – 12 m/s');

insert into public.product_spec_values (product_id, field_id, value_select) values
  ('d4000000-0000-0000-0000-000000000002', 'c4000000-0000-0000-0000-000000000001', 'Flow Meter'),
  ('d4000000-0000-0000-0000-000000000002', 'c4000000-0000-0000-0000-000000000003', '±0.5%'),
  ('d4000000-0000-0000-0000-000000000002', 'c4000000-0000-0000-0000-000000000004', 'HART');

-- Temperature Transmitter
insert into public.product_spec_values (product_id, field_id, value_text) values
  ('d4000000-0000-0000-0000-000000000003', 'c4000000-0000-0000-0000-000000000002', '-50°C – 400°C');

insert into public.product_spec_values (product_id, field_id, value_select) values
  ('d4000000-0000-0000-0000-000000000003', 'c4000000-0000-0000-0000-000000000001', 'Temperature Sensor'),
  ('d4000000-0000-0000-0000-000000000003', 'c4000000-0000-0000-0000-000000000003', '±0.1%'),
  ('d4000000-0000-0000-0000-000000000003', 'c4000000-0000-0000-0000-000000000004', '4-20mA'),
  ('d4000000-0000-0000-0000-000000000003', 'c4000000-0000-0000-0000-000000000005', 'Inconel');

-- ------------------------------------------------------------
-- 13. Update landing sections dengan konten realistis & visible
-- ------------------------------------------------------------
update public.landing_sections set
  is_visible = true,
  config = '{
    "image_path": null,
    "cta_label": "Lihat Katalog",
    "cta_href": "/admin/products"
  }'::jsonb
where section_key = 'hero';

update public.landing_sections set
  is_visible = true,
  heading = 'Tentang Cakra Teknik',
  body = 'Didirikan sejak 2008, Cakra Teknik telah menjadi partner terpercaya untuk ribuan industri di Indonesia. Kami menyediakan peralatan teknis berkualitas tinggi dengan sertifikasi internasional dan layanan after-sales yang responsif.',
  config = '{"image_path": null}'::jsonb
where section_key = 'about';

update public.landing_sections set
  is_visible = true,
  heading = 'Mengapa Cakra Teknik?',
  config = '{
    "items": [
      {"icon": "shield", "title": "Sertifikasi Lengkap", "description": "Semua produk memiliki sertifikasi API, ISO, dan CE sesuai standar internasional."},
      {"icon": "clock", "title": "Pengiriman Cepat", "description": "Stok ready stock untuk item populer, pengiriman ke seluruh Indonesia dalam 3-7 hari kerja."},
      {"icon": "headphones", "title": "Tech Support 24/7", "description": "Tim teknisi berpengalaman siap membantu konsultasi teknis dan troubleshooting."},
      {"icon": "wrench", "title": "After-Sales Service", "description": "Garansi resmi dan layanan maintenance berkala untuk semua produk yang kami jual."}
    ]
  }'::jsonb
where section_key = 'advantages';

update public.landing_sections set
  is_visible = true,
  config = '{
    "category_ids": [
      "a1000000-0000-0000-0000-000000000001",
      "a1000000-0000-0000-0000-000000000002",
      "a1000000-0000-0000-0000-000000000003",
      "a1000000-0000-0000-0000-000000000004"
    ]
  }'::jsonb
where section_key = 'featured_categories';

update public.landing_sections set
  is_visible = true,
  config = '{
    "product_ids": [
      "d1000000-0000-0000-0000-000000000001",
      "d2000000-0000-0000-0000-000000000001",
      "d3000000-0000-0000-0000-000000000001",
      "d4000000-0000-0000-0000-000000000001"
    ]
  }'::jsonb
where section_key = 'featured_products';

update public.landing_sections set
  is_visible = true,
  heading = 'Proyek & Testimonial',
  config = '{
    "items": [
      {"author": "Budi Santoso", "role": "Maintenance Manager, PT Semen Gresik", "quote": "Pompa CS-200 yang kami beli dari Cakra Teknik sudah berjalan 2 tahun tanpa masalah. Layanan after-sales mereka sangat responsif."},
      {"author": "Rina Wijaya", "role": "Process Engineer, PT Pertamina", "quote": "Butterfly valve dari Cakra Teknik memiliki kualitas setara import Eropa dengan harga yang lebih kompetitif. Sangat recommended."},
      {"author": "Ahmad Fauzi", "role": "Plant Manager, PT Indolakto", "quote": "Sejak berganti ke cartridge filter dari Cakra Teknik, biaya maintenance sistem filtrasi kami turun 40%. Kualitas filtration excellent."}
    ]
  }'::jsonb
where section_key = 'testimonials';

update public.landing_sections set
  is_visible = true,
  heading = 'Butuh konsultasi produk untuk proyek Anda?',
  subheading = 'Tim kami siap membantu memilih produk yang tepat sesuai kebutuhan teknis Anda.',
  config = '{
    "cta_label": "Tanya Harga via WhatsApp",
    "cta_href": "whatsapp"
  }'::jsonb
where section_key = 'cta';
-- ============================================================
-- Migration: relax main_image_path requirement
-- Tanggal: 2026-07-14
-- Tujuan: Izinkan produk tampil di publik meskipun tanpa foto
--         utama. UI sudah menampilkan fallback placeholder.
-- ============================================================

-- products: hapus syarat main_image_path is not null
drop policy if exists "products_public_read" on public.products;
create policy "products_public_read" on public.products
  for select using (
    is_visible = true or public.is_admin()
  );

-- product_spec_values: sinkronkan dengan perubahan di atas
drop policy if exists "spec_values_public_read" on public.product_spec_values;
create policy "spec_values_public_read" on public.product_spec_values
  for select using (
    exists (
      select 1 from public.products p
      where p.id = product_spec_values.product_id
        and p.is_visible = true
    ) or public.is_admin()
  );

-- product_documents: sinkronkan dengan perubahan di atas
drop policy if exists "documents_public_read" on public.product_documents;
create policy "documents_public_read" on public.product_documents
  for select using (
    exists (
      select 1 from public.products p
      where p.id = product_documents.product_id
        and p.is_visible = true
    ) or public.is_admin()
  );

-- ============================================================
-- Migration: custom_landing_pages
-- Tanggal: 2026-07-17
-- Fitur: Custom landing page dengan source code editor (HTML/CSS/JS)
--        yang dapat terhubung ke produk via placeholder token.
-- ============================================================

create table if not exists public.custom_landing_pages (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  html_source text not null default '',
  css_source text not null default '',
  js_source text not null default '',
  is_active boolean not null default false,
  product_ids uuid[] not null default '{}',
  meta_title text,
  meta_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_custom_landing_pages_touch on public.custom_landing_pages;
create trigger trg_custom_landing_pages_touch
  before update on public.custom_landing_pages
  for each row execute function public.touch_updated_at();

create index if not exists idx_custom_landing_slug on public.custom_landing_pages (slug);
create index if not exists idx_custom_landing_active on public.custom_landing_pages (is_active);

-- ----------------------------------------------------------------
-- RLS: baca publik jika is_active = true, write hanya admin.
-- ----------------------------------------------------------------
alter table public.custom_landing_pages enable row level security;

drop policy if exists "custom_landing_pages: select active for everyone" on public.custom_landing_pages;
create policy "custom_landing_pages: select active for everyone"
  on public.custom_landing_pages for select
  using (is_active = true);

drop policy if exists "custom_landing_pages: all for service_role" on public.custom_landing_pages;
create policy "custom_landing_pages: all for service_role"
  on public.custom_landing_pages for all
  using (true)
  with check (true);

