-- ============================================================
-- Migration: Storage RLS — Tenant Isolation
-- Tanggal: 2026-07-31
-- Deskripsi: Memperketat storage policies agar tenant hanya bisa
--   write ke path yang sesuai dengan user_id prefix mereka.
--   Public read tetap dipertahankan (produk image perlu publik).
-- ============================================================

-- ── product-images: Tenant-scoped write ──
DROP POLICY IF EXISTS "product_images_admin_insert" ON storage.objects;
CREATE POLICY "product_images_tenant_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'product-images'
    AND public.is_admin()
    AND (storage.foldername(name))[1] = substr(auth.uid()::text, 1, 8)
  );

DROP POLICY IF EXISTS "product_images_admin_update" ON storage.objects;
CREATE POLICY "product_images_tenant_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'product-images'
    AND public.is_admin()
    AND (storage.foldername(name))[1] = substr(auth.uid()::text, 1, 8)
  );

DROP POLICY IF EXISTS "product_images_admin_delete" ON storage.objects;
CREATE POLICY "product_images_tenant_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'product-images'
    AND public.is_admin()
    AND (storage.foldername(name))[1] = substr(auth.uid()::text, 1, 8)
  );

-- ── product-documents: Tenant-scoped write ──
DROP POLICY IF EXISTS "product_documents_admin_insert" ON storage.objects;
CREATE POLICY "product_documents_tenant_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'product-documents'
    AND public.is_admin()
    AND (storage.foldername(name))[1] = substr(auth.uid()::text, 1, 8)
  );

DROP POLICY IF EXISTS "product_documents_admin_update" ON storage.objects;
CREATE POLICY "product_documents_tenant_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'product-documents'
    AND public.is_admin()
    AND (storage.foldername(name))[1] = substr(auth.uid()::text, 1, 8)
  );

DROP POLICY IF EXISTS "product_documents_admin_delete" ON storage.objects;
CREATE POLICY "product_documents_tenant_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'product-documents'
    AND public.is_admin()
    AND (storage.foldername(name))[1] = substr(auth.uid()::text, 1, 8)
  );

-- ── category-media: Tenant-scoped write ──
DROP POLICY IF EXISTS "category_media_admin_insert" ON storage.objects;
CREATE POLICY "category_media_tenant_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'category-media'
    AND public.is_admin()
    AND (storage.foldername(name))[1] = substr(auth.uid()::text, 1, 8)
  );

DROP POLICY IF EXISTS "category_media_admin_update" ON storage.objects;
CREATE POLICY "category_media_tenant_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'category-media'
    AND public.is_admin()
    AND (storage.foldername(name))[1] = substr(auth.uid()::text, 1, 8)
  );

DROP POLICY IF EXISTS "category_media_admin_delete" ON storage.objects;
CREATE POLICY "category_media_tenant_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'category-media'
    AND public.is_admin()
    AND (storage.foldername(name))[1] = substr(auth.uid()::text, 1, 8)
  );

-- ── landing-media: Tenant-scoped write ──
DROP POLICY IF EXISTS "landing_media_admin_insert" ON storage.objects;
CREATE POLICY "landing_media_tenant_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'landing-media'
    AND public.is_admin()
    AND (storage.foldername(name))[1] = substr(auth.uid()::text, 1, 8)
  );

DROP POLICY IF EXISTS "landing_media_admin_update" ON storage.objects;
CREATE POLICY "landing_media_tenant_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'landing-media'
    AND public.is_admin()
    AND (storage.foldername(name))[1] = substr(auth.uid()::text, 1, 8)
  );

DROP POLICY IF EXISTS "landing_media_admin_delete" ON storage.objects;
CREATE POLICY "landing_media_tenant_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'landing-media'
    AND public.is_admin()
    AND (storage.foldername(name))[1] = substr(auth.uid()::text, 1, 8)
  );
