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
