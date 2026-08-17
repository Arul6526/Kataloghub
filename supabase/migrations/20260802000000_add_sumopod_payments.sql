-- MIGRASI SUPPORT PAYMENT GATEWAY SUMOPOD UNTUK SUBSCRIPTIONS

CREATE TABLE IF NOT EXISTS public.subscription_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_slug text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  payment_method text NOT NULL DEFAULT 'QRIS',
  order_id text UNIQUE,
  payment_gateway text DEFAULT 'sumopod',
  checkout_url text,
  reference_note text,
  status text NOT NULL DEFAULT 'pending',
  raw_response jsonb,
  processed_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tambahkan kolom bila tabel sudah dibuat sebelumnya tanpa kolom baru
ALTER TABLE public.subscription_payments ADD COLUMN IF NOT EXISTS order_id text UNIQUE;
ALTER TABLE public.subscription_payments ADD COLUMN IF NOT EXISTS payment_gateway text DEFAULT 'sumopod';
ALTER TABLE public.subscription_payments ADD COLUMN IF NOT EXISTS checkout_url text;
ALTER TABLE public.subscription_payments ADD COLUMN IF NOT EXISTS raw_response jsonb;

-- Index order_id & user_id
CREATE INDEX IF NOT EXISTS idx_subscription_payments_order_id ON public.subscription_payments (order_id);
CREATE INDEX IF NOT EXISTS idx_subscription_payments_user_id ON public.subscription_payments (user_id);

-- RLS
ALTER TABLE public.subscription_payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "subscription_payments_owner_read" ON public.subscription_payments;
CREATE POLICY "subscription_payments_owner_read" ON public.subscription_payments
  FOR SELECT USING (auth.uid() = user_id OR public.is_superadmin());

DROP POLICY IF EXISTS "subscription_payments_superadmin_all" ON public.subscription_payments;
CREATE POLICY "subscription_payments_superadmin_all" ON public.subscription_payments
  FOR ALL USING (public.is_superadmin()) WITH CHECK (public.is_superadmin());
