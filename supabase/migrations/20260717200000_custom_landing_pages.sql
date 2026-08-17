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
