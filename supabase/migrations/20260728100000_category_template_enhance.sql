-- ============================================================
-- Migration: category_template_enhance
-- Tanggal: 2026-07-28
-- Deskripsi:
--   1. Tambah kolom category_slug & language ke site_settings.
--   2. Buat tabel landing_sections_backup untuk snapshot sebelum template.
--   3. Fix constraint UNIQUE(section_key) → UNIQUE(user_id, section_key)
--      agar multi-tenant bisa jalan.
-- ============================================================

-- 1. Kolom template & bahasa di site_settings
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS category_slug text,
  ADD COLUMN IF NOT EXISTS language text NOT NULL DEFAULT 'id';

-- 2. Tabel backup landing sections
CREATE TABLE IF NOT EXISTS public.landing_sections_backup (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  section_key text NOT NULL,
  heading text,
  subheading text,
  body text,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_visible boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  backed_up_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lsb_user ON public.landing_sections_backup (user_id, backed_up_at DESC);

-- RLS untuk backup table
ALTER TABLE public.landing_sections_backup ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "lsb_owner_read" ON public.landing_sections_backup;
CREATE POLICY "lsb_owner_read" ON public.landing_sections_backup
  FOR SELECT USING (public.is_owner(user_id));

DROP POLICY IF EXISTS "lsb_admin_all" ON public.landing_sections_backup;
CREATE POLICY "lsb_admin_all" ON public.landing_sections_backup
  FOR ALL USING (true) WITH CHECK (true);

-- 3. Fix multi-tenant constraint pada landing_sections
--    Hapus constraint lama (global unique section_key)
--    dan ganti dengan composite unique (user_id, section_key).
ALTER TABLE public.landing_sections
  DROP CONSTRAINT IF EXISTS landing_sections_section_key_key;

-- Buat composite unique agar section_key unik per tenant
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'landing_sections_user_section_key'
  ) THEN
    ALTER TABLE public.landing_sections
      ADD CONSTRAINT landing_sections_user_section_key UNIQUE (user_id, section_key);
  END IF;
END
$$;
