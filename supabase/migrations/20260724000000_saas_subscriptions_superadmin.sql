-- ====================================================================
-- MIGRASI SAAS SUBSCRIPTIONS & SUPERADMIN ROLE KATALOGHUB
-- ====================================================================

-- 1. Helper Function: is_owner() jika belum ada
CREATE OR REPLACE FUNCTION public.is_owner(owner_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN auth.uid() = owner_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Tambah kolom role ke tabel profiles jika belum ada
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'owner';

-- 3. Tabel Master Paket Langganan (subscription_plans)
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  price numeric NOT NULL DEFAULT 0,
  price_label text,
  billing_period text NOT NULL DEFAULT '3 bulan',
  duration_days int NOT NULL DEFAULT 90,
  max_products int NOT NULL DEFAULT 5,
  max_landing_pages int NOT NULL DEFAULT 1,
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  is_popular boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Seed awal subscription_plans (3 bulan free trial, 165.000/tahun pro plan)
INSERT INTO public.subscription_plans (slug, name, price, price_label, billing_period, duration_days, max_products, max_landing_pages, features, is_popular, sort_order)
VALUES
(
  'free_trial',
  'Free Trial',
  0,
  'Gratis',
  '3 bulan',
  90,
  5,
  1,
  '["Katalog online publik", "Subdomain toko (/toko/nama)", "5 produk", "1 custom landing page", "Masa aktif 3 bulan", "WhatsApp order integration"]'::jsonb,
  false,
  1
),
(
  'pro',
  'Pro Plan',
  165000,
  'Rp165.000',
  'per tahun',
  365,
  200,
  2,
  '["Semua fitur Free Trial", "200 produk", "2 custom landing page", "Masa aktif 1 tahun", "Template spesifikasi produk", "Import produk massal (Excel)", "Prioritas support"]'::jsonb,
  true,
  2
),
(
  'enterprise',
  'Enterprise',
  0,
  'Custom',
  'custom',
  365,
  1000,
  50,
  '["Semua fitur Pro", "Produk unlimited (menyesuaikan)", "Custom landing page unlimited", "Custom domain / subdomain", "Dedicated support"]'::jsonb,
  false,
  3
)
ON CONFLICT (slug) DO UPDATE SET
  duration_days = EXCLUDED.duration_days,
  billing_period = EXCLUDED.billing_period,
  price_label = EXCLUDED.price_label,
  price = EXCLUDED.price;

-- 4. Buat tabel user subscriptions
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  plan_name text NOT NULL DEFAULT 'free_trial',
  status text NOT NULL DEFAULT 'active',
  max_products int NOT NULL DEFAULT 5,
  max_landing_pages int NOT NULL DEFAULT 1,
  starts_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '90 days'),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 5. Function RLS Helper: is_superadmin()
CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS boolean AS $$
DECLARE
  u_role text;
BEGIN
  SELECT role INTO u_role
  FROM public.profiles
  WHERE id = auth.uid();

  IF u_role = 'superadmin' THEN
    RETURN true;
  END IF;

  IF (auth.jwt() -> 'app_metadata' ->> 'role') = 'superadmin' OR
     (auth.jwt() -> 'user_metadata' ->> 'is_superadmin') = 'true' THEN
    RETURN true;
  END IF;

  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Enable RLS
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "subscription_plans_public_read" ON public.subscription_plans;
CREATE POLICY "subscription_plans_public_read" ON public.subscription_plans
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "subscription_plans_superadmin_all" ON public.subscription_plans;
CREATE POLICY "subscription_plans_superadmin_all" ON public.subscription_plans
  FOR ALL USING (public.is_superadmin()) WITH CHECK (public.is_superadmin());

DROP POLICY IF EXISTS "subscriptions_owner_read" ON public.subscriptions;
CREATE POLICY "subscriptions_owner_read" ON public.subscriptions 
  FOR SELECT USING (auth.uid() = user_id OR public.is_superadmin());

DROP POLICY IF EXISTS "subscriptions_superadmin_all" ON public.subscriptions;
CREATE POLICY "subscriptions_superadmin_all" ON public.subscriptions 
  FOR ALL USING (public.is_superadmin()) WITH CHECK (public.is_superadmin());

DROP POLICY IF EXISTS "profiles_superadmin_read" ON public.profiles;
CREATE POLICY "profiles_superadmin_read" ON public.profiles
  FOR SELECT USING (id = auth.uid() OR public.is_superadmin());

DROP POLICY IF EXISTS "site_settings_superadmin_read" ON public.site_settings;
CREATE POLICY "site_settings_superadmin_read" ON public.site_settings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "products_superadmin_read" ON public.products;
CREATE POLICY "products_superadmin_read" ON public.products
  FOR SELECT USING (is_visible = true OR auth.uid() = user_id OR public.is_superadmin());

-- 7. Auto insert subscriptions row when new user registers
CREATE OR REPLACE FUNCTION public.handle_new_tenant()
RETURNS trigger AS $$
DECLARE
  base_slug text;
  new_slug text;
  counter int := 1;
  trial_days int := 90;
  trial_products int := 5;
  trial_lps int := 1;
BEGIN
  SELECT duration_days, max_products, max_landing_pages
  INTO trial_days, trial_products, trial_lps
  FROM public.subscription_plans
  WHERE slug = 'free_trial' AND is_active = true
  LIMIT 1;

  IF trial_days IS NULL THEN trial_days := 90; END IF;
  IF trial_products IS NULL THEN trial_products := 5; END IF;
  IF trial_lps IS NULL THEN trial_lps := 1; END IF;

  base_slug := lower(regexp_replace(coalesce(NEW.raw_user_meta_data->>'full_name', 'toko-' || substr(NEW.id::text, 1, 6)), '[^a-zA-Z0-9]', '-', 'g'));
  new_slug := base_slug;
  
  WHILE EXISTS (SELECT 1 FROM public.site_settings WHERE store_slug = new_slug) LOOP
    new_slug := base_slug || '-' || counter;
    counter := counter + 1;
  END LOOP;

  INSERT INTO public.site_settings (user_id, brand_name, store_slug, seo_title, seo_description)
  VALUES (NEW.id, coalesce(NEW.raw_user_meta_data->>'full_name', 'Toko Baru'), new_slug, 'Katalog Produk ' || coalesce(NEW.raw_user_meta_data->>'full_name', ''), 'Katalog produk resmi')
  ON CONFLICT (user_id) DO NOTHING;
  
  INSERT INTO public.landing_sections (user_id, section_key, heading, sort_order, is_visible) VALUES
    (NEW.id, 'hero', 'Selamat Datang di Katalog Kami', 10, true),
    (NEW.id, 'about', 'Tentang Kami', 20, true),
    (NEW.id, 'advantages', 'Keunggulan Kami', 30, true),
    (NEW.id, 'featured_categories', 'Kategori Pilihan', 40, true),
    (NEW.id, 'featured_products', 'Produk Pilihan', 50, true),
    (NEW.id, 'testimonials', 'Testimoni', 60, false),
    (NEW.id, 'cta', 'Hubungi Kami', 70, true)
  ON CONFLICT DO NOTHING;

  INSERT INTO public.subscriptions (user_id, plan_name, status, max_products, max_landing_pages, starts_at, expires_at)
  VALUES (NEW.id, 'free_trial', 'active', trial_products, trial_lps, now(), now() + (trial_days || ' days')::interval)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_tenant();

-- 8. Backfill user lama
INSERT INTO public.subscriptions (user_id, plan_name, status, max_products, max_landing_pages, starts_at, expires_at)
SELECT id, 'pro', 'active', 200, 2, now(), now() + interval '365 days'
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;
