-- ============================================================
-- Migration: Data Optimization & Integrity Constraints
-- Tanggal: 2026-07-31
-- Deskripsi: Menambahkan Unique Constraints & Indexes untuk performa query N+1 & integritas data.
-- ============================================================

-- ── 1. Unique constraints untuk mencegah race condition slug duplikat per tenant ──
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_slug_user_id_key') THEN
        ALTER TABLE public.products ADD CONSTRAINT products_slug_user_id_key UNIQUE (slug, user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'categories_slug_user_id_key') THEN
        ALTER TABLE public.categories ADD CONSTRAINT categories_slug_user_id_key UNIQUE (slug, user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'custom_landing_pages_slug_user_id_key') THEN
        ALTER TABLE public.custom_landing_pages ADD CONSTRAINT custom_landing_pages_slug_user_id_key UNIQUE (slug, user_id);
    END IF;
END $$;

-- ── 2. Performance Indexes untuk mengeliminasi N+1 query scans ──
CREATE INDEX IF NOT EXISTS idx_products_user_sort ON public.products (user_id, sort_order, name);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products (category_id) WHERE is_visible = true;
CREATE INDEX IF NOT EXISTS idx_spec_templates_cat ON public.category_spec_templates (category_id, is_active);
CREATE INDEX IF NOT EXISTS idx_spec_fields_template ON public.category_spec_fields (template_id, is_required);
CREATE INDEX IF NOT EXISTS idx_spec_values_product ON public.product_spec_values (product_id, field_id);
CREATE INDEX IF NOT EXISTS idx_product_documents_prod ON public.product_documents (product_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_order_leads_store_slug ON public.order_leads (store_slug, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status ON public.subscriptions (user_id, status);
