-- Add user_id to custom_landing_pages
ALTER TABLE public.custom_landing_pages ADD COLUMN IF NOT EXISTS user_id uuid references auth.users(id) on delete cascade;

-- Update RLS for custom_landing_pages
DROP POLICY IF EXISTS "custom_landing_pages_public_read" ON public.custom_landing_pages;
CREATE POLICY "custom_landing_pages_public_read" ON public.custom_landing_pages FOR SELECT USING (is_active = true OR public.is_owner(user_id));

DROP POLICY IF EXISTS "custom_landing_pages_admin_write" ON public.custom_landing_pages;
CREATE POLICY "custom_landing_pages_admin_write" ON public.custom_landing_pages FOR ALL USING (public.is_owner(user_id)) WITH CHECK (public.is_owner(user_id));
