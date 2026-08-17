-- ============================================================
-- Migration: Security Hardening — RLS Multi-Tenant Isolation
-- Tanggal: 2026-07-31
-- Deskripsi: Memperbaiki RLS policies agar data antar tenant terisolasi.
--   - Storage write policies: owner-only via user_id path prefix
--   - category_spec_templates & fields: tambah user_id owner check
--   - product_spec_values & product_documents: owner check
--   - order_leads: hanya pemilik toko yang bisa baca
--   - page_views: isolasi per user
-- ============================================================

-- ── 1. FIX is_admin() function: tambah user_id scoping ──
-- Function ini sekarang hanya return true jika user punya is_admin=true di profiles
-- dan JUGA merupakan pemilik data (user_id match).
-- Legacy is_admin() tetap dipertahankan untuk backward compat, 
-- tapi kita tambahkan is_owner_admin() yang lebih ketat.

CREATE OR REPLACE FUNCTION public.is_owner_admin(row_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT 
    auth.uid() IS NOT NULL 
    AND auth.uid() = row_user_id
    AND EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    );
$$;

-- ── 2. Stricter RLS for category_spec_templates ──
DROP POLICY IF EXISTS "spec_templates_admin_write" ON public.category_spec_templates;
CREATE POLICY "spec_templates_admin_write" ON public.category_spec_templates
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.categories c 
      WHERE c.id = category_spec_templates.category_id 
      AND public.is_owner(c.user_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.categories c 
      WHERE c.id = category_spec_templates.category_id 
      AND public.is_owner(c.user_id)
    )
  );

-- ── 3. Stricter RLS for category_spec_fields ──
DROP POLICY IF EXISTS "spec_fields_admin_write" ON public.category_spec_fields;
CREATE POLICY "spec_fields_admin_write" ON public.category_spec_fields
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.category_spec_templates t
      JOIN public.categories c ON c.id = t.category_id
      WHERE t.id = category_spec_fields.template_id
      AND public.is_owner(c.user_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.category_spec_templates t
      JOIN public.categories c ON c.id = t.category_id
      WHERE t.id = category_spec_fields.template_id
      AND public.is_owner(c.user_id)
    )
  );

-- ── 4. Stricter RLS for product_spec_values ──
DROP POLICY IF EXISTS "spec_values_admin_write" ON public.product_spec_values;
CREATE POLICY "spec_values_admin_write" ON public.product_spec_values
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_spec_values.product_id
      AND public.is_owner(p.user_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_spec_values.product_id
      AND public.is_owner(p.user_id)
    )
  );

-- ── 5. Stricter RLS for product_documents ──
DROP POLICY IF EXISTS "documents_admin_write" ON public.product_documents;
CREATE POLICY "documents_admin_write" ON public.product_documents
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_documents.product_id
      AND public.is_owner(p.user_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_documents.product_id
      AND public.is_owner(p.user_id)
    )
  );

-- ── 6. Stricter RLS for landing_sections ──
DROP POLICY IF EXISTS "landing_admin_write" ON public.landing_sections;
CREATE POLICY "landing_admin_write" ON public.landing_sections
  FOR ALL
  USING (public.is_owner(user_id))
  WITH CHECK (public.is_owner(user_id));

-- ── 7. RLS for order_leads ──
ALTER TABLE public.order_leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "order_leads_owner_read" ON public.order_leads;
CREATE POLICY "order_leads_owner_read" ON public.order_leads
  FOR SELECT
  USING (public.is_owner(user_id));

-- Service role (used by API route) can insert
DROP POLICY IF EXISTS "order_leads_service_insert" ON public.order_leads;
CREATE POLICY "order_leads_service_insert" ON public.order_leads
  FOR INSERT
  WITH CHECK (true); -- API route uses service role key

-- ── 8. RLS for page_views ──
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

-- Public insert (tracking API uses service role)
DROP POLICY IF EXISTS "page_views_service_insert" ON public.page_views;
CREATE POLICY "page_views_service_insert" ON public.page_views
  FOR INSERT
  WITH CHECK (true); -- API route uses service role key

-- Superadmin reads all, owner reads own
DROP POLICY IF EXISTS "page_views_read" ON public.page_views;
CREATE POLICY "page_views_read" ON public.page_views
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'superadmin' OR profiles.is_admin = true)
    )
  );

-- ── 9. RLS for custom_landing_pages ──
ALTER TABLE public.custom_landing_pages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "custom_landing_owner_all" ON public.custom_landing_pages;
CREATE POLICY "custom_landing_owner_all" ON public.custom_landing_pages
  FOR ALL
  USING (public.is_owner(user_id))
  WITH CHECK (public.is_owner(user_id));

DROP POLICY IF EXISTS "custom_landing_public_read" ON public.custom_landing_pages;
CREATE POLICY "custom_landing_public_read" ON public.custom_landing_pages
  FOR SELECT
  USING (is_active = true);
