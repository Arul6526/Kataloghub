-- Migration: Add Announcement Image Path to Site Settings
ALTER TABLE public.site_settings 
ADD COLUMN IF NOT EXISTS catalog_announcement_image_path text;
