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
