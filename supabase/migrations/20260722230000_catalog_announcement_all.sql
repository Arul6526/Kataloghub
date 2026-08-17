-- Migration: Add all announcement columns to site_settings
ALTER TABLE public.site_settings 
ADD COLUMN IF NOT EXISTS catalog_announcement_title text,
ADD COLUMN IF NOT EXISTS catalog_announcement_message text,
ADD COLUMN IF NOT EXISTS catalog_announcement_enabled boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS catalog_announcement_image_path text;
