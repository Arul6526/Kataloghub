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
