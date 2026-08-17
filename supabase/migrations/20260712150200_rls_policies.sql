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
