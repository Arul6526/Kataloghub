-- ====================================================================
-- MIGRASI REKENING PEMBAYARAN PLATFORM & PETUNJUK TRANSFER MANUAL
-- ====================================================================

-- 1. Tabel Rekening Bank Platform (platform_bank_accounts)
CREATE TABLE IF NOT EXISTS public.platform_bank_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_name text NOT NULL,
  account_number text NOT NULL,
  account_holder text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Seed awal rekening bank jika belum ada
INSERT INTO public.platform_bank_accounts (bank_name, account_number, account_holder, sort_order)
VALUES 
  ('Bank BCA', '8830-9128-44', 'a.n. PT Katalog Digital Indonesia', 1),
  ('Bank Mandiri', '1370-0294-8819', 'a.n. PT Katalog Digital Indonesia', 2)
ON CONFLICT DO NOTHING;

-- 2. Tabel Setting Platform Umum (platform_settings)
CREATE TABLE IF NOT EXISTS public.platform_settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- Seed awal teks petunjuk pembayaran
INSERT INTO public.platform_settings (key, value)
VALUES (
  'payment_instructions',
  'Transfer pembayaran langganan ke salah satu rekening resmi di bawah ini, kemudian kirimkan bukti transfer melalui WhatsApp untuk proses verifikasi.'
)
ON CONFLICT (key) DO NOTHING;

-- 3. RLS Policies
ALTER TABLE public.platform_bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Select policy: publik/tenant mana pun bisa membaca rekening & petunjuk pembayaran
DROP POLICY IF EXISTS "platform_bank_accounts_public_read" ON public.platform_bank_accounts;
CREATE POLICY "platform_bank_accounts_public_read" ON public.platform_bank_accounts
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "platform_settings_public_read" ON public.platform_settings;
CREATE POLICY "platform_settings_public_read" ON public.platform_settings
  FOR SELECT USING (true);

-- Superadmin Write Policies
DROP POLICY IF EXISTS "platform_bank_accounts_superadmin_all" ON public.platform_bank_accounts;
CREATE POLICY "platform_bank_accounts_superadmin_all" ON public.platform_bank_accounts
  FOR ALL USING (public.is_superadmin()) WITH CHECK (public.is_superadmin());

DROP POLICY IF EXISTS "platform_settings_superadmin_all" ON public.platform_settings;
CREATE POLICY "platform_settings_superadmin_all" ON public.platform_settings
  FOR ALL USING (public.is_superadmin()) WITH CHECK (public.is_superadmin());
