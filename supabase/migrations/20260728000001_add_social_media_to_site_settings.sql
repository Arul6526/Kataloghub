-- ============================================================
-- Migration: add_social_media_to_site_settings
-- Tanggal: 2026-07-28
-- Deskripsi: Menambahkan kolom sosial media (Instagram, TikTok, Shopee) ke site_settings
-- ============================================================

ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS social_instagram text,
  ADD COLUMN IF NOT EXISTS social_tiktok text,
  ADD COLUMN IF NOT EXISTS social_shopee text;
