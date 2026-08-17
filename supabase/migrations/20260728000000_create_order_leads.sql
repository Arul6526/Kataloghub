-- ============================================================
-- Migration: create_order_leads
-- Tanggal: 2026-07-28
-- Deskripsi: Tabel untuk menyimpan rekapitulasi pesanan / lead WhatsApp pembeli
-- ============================================================

CREATE TABLE IF NOT EXISTS public.order_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  store_slug text NOT NULL,
  customer_name text DEFAULT 'Pelanggan Katalog',
  items_summary text NOT NULL,
  total_price numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indeks performa pencarian order_leads
CREATE INDEX IF NOT EXISTS idx_order_leads_user_id ON public.order_leads (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_leads_store_slug ON public.order_leads (store_slug);

-- Enable RLS
ALTER TABLE public.order_leads ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Pemilik toko dapat melihat order_leads milik toko / user_id mereka
DROP POLICY IF EXISTS "order_leads_owner_read" ON public.order_leads;
CREATE POLICY "order_leads_owner_read" ON public.order_leads
  FOR SELECT USING (public.is_owner(user_id));

-- RLS Policy: Service role / Admin client dapat melakukan kueri & insert
DROP POLICY IF EXISTS "order_leads_all_admin" ON public.order_leads;
CREATE POLICY "order_leads_all_admin" ON public.order_leads
  FOR ALL USING (true) WITH CHECK (true);
