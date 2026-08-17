-- Migration: Create brand-assets storage bucket if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('brand-assets', 'brand-assets', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for brand-assets bucket
DROP POLICY IF EXISTS "brand_assets_public_read" ON storage.objects;
CREATE POLICY "brand_assets_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'brand-assets');

DROP POLICY IF EXISTS "brand_assets_admin_insert" ON storage.objects;
CREATE POLICY "brand_assets_admin_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'brand-assets');

DROP POLICY IF EXISTS "brand_assets_admin_update" ON storage.objects;
CREATE POLICY "brand_assets_admin_update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'brand-assets');

DROP POLICY IF EXISTS "brand_assets_admin_delete" ON storage.objects;
CREATE POLICY "brand_assets_admin_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'brand-assets');
