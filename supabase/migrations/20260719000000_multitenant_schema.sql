-- ============================================================
-- Migration: Multi-Tenant Architecture
-- Tanggal: 2026-07-19
-- Deskripsi: Merombak sistem menjadi SaaS / Multi-Tenant.
-- ============================================================

-- 1. Tambah user_id ke site_settings
ALTER TABLE public.site_settings DROP CONSTRAINT IF EXISTS site_settings_id_check;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS user_id uuid references auth.users(id) on delete cascade;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS store_slug text unique;

-- 2. Tambah user_id ke entitas katalog
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS user_id uuid references auth.users(id) on delete cascade;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS user_id uuid references auth.users(id) on delete cascade;
ALTER TABLE public.landing_sections ADD COLUMN IF NOT EXISTS user_id uuid references auth.users(id) on delete cascade;
ALTER TABLE public.website_analytics ADD COLUMN IF NOT EXISTS user_id uuid references auth.users(id) on delete cascade;

-- Tambahkan helper is_owner(uid)
CREATE OR REPLACE FUNCTION public.is_owner(row_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT auth.uid() = row_user_id;
$$;

-- 3. Update RLS categories
DROP POLICY IF EXISTS "categories_public_read" ON public.categories;
CREATE POLICY "categories_public_read" ON public.categories FOR SELECT USING (is_visible = true OR public.is_owner(user_id));

DROP POLICY IF EXISTS "categories_admin_write" ON public.categories;
CREATE POLICY "categories_admin_write" ON public.categories FOR ALL USING (public.is_owner(user_id)) WITH CHECK (public.is_owner(user_id));

-- 4. Update RLS products
DROP POLICY IF EXISTS "products_public_read" ON public.products;
CREATE POLICY "products_public_read" ON public.products FOR SELECT USING (
  (is_visible = true AND main_image_path IS NOT NULL) OR public.is_owner(user_id)
);

DROP POLICY IF EXISTS "products_admin_write" ON public.products;
CREATE POLICY "products_admin_write" ON public.products FOR ALL USING (public.is_owner(user_id)) WITH CHECK (public.is_owner(user_id));

-- 5. Update RLS site_settings
DROP POLICY IF EXISTS "settings_public_read" ON public.site_settings;
CREATE POLICY "settings_public_read" ON public.site_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "settings_admin_write" ON public.site_settings;
CREATE POLICY "settings_admin_write" ON public.site_settings FOR ALL USING (public.is_owner(user_id)) WITH CHECK (public.is_owner(user_id));

-- 6. Trigger pembuatan site_settings saat daftar
CREATE OR REPLACE FUNCTION public.handle_new_tenant()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Buat baris site_settings default untuk toko baru (store_slug ambil dari id atau email awal)
  INSERT INTO public.site_settings (id, user_id, brand_name, store_slug, whatsapp_template)
  VALUES (
    (SELECT COALESCE(MAX(id), 0) + 1 FROM public.site_settings),
    NEW.id,
    'Toko Baru',
    'toko-' || substr(NEW.id::text, 1, 8),
    'Halo, saya tertarik dengan produk di katalog Anda.'
  );
  RETURN NEW;
END;
$$;

-- Pasang trigger ini di atas trigger profile yang lama, atau gabungkan
DROP TRIGGER IF EXISTS on_auth_user_created_tenant ON auth.users;
CREATE TRIGGER on_auth_user_created_tenant
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_tenant();

