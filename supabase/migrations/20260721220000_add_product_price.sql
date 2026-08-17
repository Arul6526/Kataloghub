-- ============================================================
-- Migration: Add product price and global show_prices toggle
-- Tanggal: 2026-07-21
-- Deskripsi: Menambahkan kolom harga pada produk dan toggle
--            global di site_settings untuk tampilkan/sembunyikan
--            harga di storefront.
-- ============================================================

-- 1. Tambah kolom price ke tabel products (nullable — tidak semua produk wajib punya harga)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS price numeric;

-- 2. Tambah kolom show_prices ke tabel site_settings (default false — harga tidak ditampilkan)
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS show_prices boolean NOT NULL DEFAULT false;

-- 3. Tambah kolom brand_logo_path ke tabel site_settings (nullable — logo opsional)
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS brand_logo_path text;

-- ============================================================
-- 4. Storage Bucket: brand-assets
-- ============================================================

INSERT INTO storage.buckets (id, name, public) 
VALUES ('brand-assets', 'brand-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Policies storage.objects untuk brand-assets
-- Public read
DROP POLICY IF EXISTS "brand_assets_public_read" ON storage.objects;
CREATE POLICY "brand_assets_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'brand-assets');

-- Admin insert
DROP POLICY IF EXISTS "brand_assets_admin_insert" ON storage.objects;
CREATE POLICY "brand_assets_admin_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'brand-assets' AND public.is_admin());

-- Admin update
DROP POLICY IF EXISTS "brand_assets_admin_update" ON storage.objects;
CREATE POLICY "brand_assets_admin_update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'brand-assets' AND public.is_admin());

-- Admin delete
DROP POLICY IF EXISTS "brand_assets_admin_delete" ON storage.objects;
CREATE POLICY "brand_assets_admin_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'brand-assets' AND public.is_admin());
