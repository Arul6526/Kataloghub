-- Migration: Add Catalog Announcement Message to Site Settings
ALTER TABLE public.site_settings 
ADD COLUMN IF NOT EXISTS catalog_announcement_title text,
ADD COLUMN IF NOT EXISTS catalog_announcement_message text,
ADD COLUMN IF NOT EXISTS catalog_announcement_enabled boolean DEFAULT true;
