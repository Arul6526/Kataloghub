-- KatalogHub AI Gateway: provider registry, model registry, and domain router.

CREATE TABLE IF NOT EXISTS public.ai_assistant_domains (
  slug text PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  system_prompt text NOT NULL DEFAULT '',
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ai_provider_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_key text UNIQUE NOT NULL,
  display_name text NOT NULL,
  base_url text NOT NULL,
  encrypted_api_key text,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ai_provider_models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES public.ai_provider_configs(id) ON DELETE CASCADE,
  model_name text NOT NULL,
  input_token_price numeric NOT NULL DEFAULT 0,
  output_token_price numeric NOT NULL DEFAULT 0,
  enabled boolean NOT NULL DEFAULT true,
  UNIQUE (provider_id, model_name)
);

CREATE TABLE IF NOT EXISTS public.ai_router_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assistant_slug text NOT NULL REFERENCES public.ai_assistant_domains(slug) ON DELETE CASCADE,
  mode text NOT NULL CHECK (mode IN ('managed', 'byok')),
  provider_id uuid REFERENCES public.ai_provider_configs(id) ON DELETE SET NULL,
  model_name text,
  priority integer NOT NULL DEFAULT 100,
  enabled boolean NOT NULL DEFAULT true,
  UNIQUE (assistant_slug, mode, priority)
);

CREATE TABLE IF NOT EXISTS public.ai_user_provider_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_key text NOT NULL,
  base_url text NOT NULL,
  encrypted_api_key text NOT NULL,
  default_model text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, provider_key)
);

ALTER TABLE public.ai_assistant_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_provider_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_provider_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_router_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_user_provider_keys ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ai_domains_authenticated_read" ON public.ai_assistant_domains;
CREATE POLICY "ai_domains_authenticated_read" ON public.ai_assistant_domains
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "ai_provider_superadmin_all" ON public.ai_provider_configs;
CREATE POLICY "ai_provider_superadmin_all" ON public.ai_provider_configs
  FOR ALL USING (public.is_superadmin_user()) WITH CHECK (public.is_superadmin_user());

DROP POLICY IF EXISTS "ai_models_authenticated_read" ON public.ai_provider_models;
CREATE POLICY "ai_models_authenticated_read" ON public.ai_provider_models
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "ai_router_superadmin_all" ON public.ai_router_rules;
CREATE POLICY "ai_router_superadmin_all" ON public.ai_router_rules
  FOR ALL USING (public.is_superadmin_user()) WITH CHECK (public.is_superadmin_user());

DROP POLICY IF EXISTS "ai_user_provider_keys_owner_all" ON public.ai_user_provider_keys;
CREATE POLICY "ai_user_provider_keys_owner_all" ON public.ai_user_provider_keys
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

INSERT INTO public.ai_assistant_domains (slug, name, description, system_prompt)
VALUES
  ('product', 'Product AI', 'Deskripsi, optimasi, dan ide produk', 'Fokus pada data produk, katalog, atribut, harga, dan saran merchandising.'),
  ('marketing', 'Marketing AI', 'Caption dan konten marketing', 'Buat caption, CTA, hashtag, kalender konten, dan variasi konten untuk media sosial.'),
  ('business', 'Business AI', 'Analisis dan keputusan bisnis', 'Bantu analisis katalog, performa bisnis, segmentasi, dan rencana pertumbuhan.'),
  ('sales', 'Sales AI', 'Penjualan dan percakapan pelanggan', 'Buat skrip penjualan, jawaban keberatan, follow-up, dan rekomendasi produk.')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  system_prompt = EXCLUDED.system_prompt;

INSERT INTO public.ai_provider_configs (provider_key, display_name, base_url)
VALUES ('openai-compatible', 'OpenAI-compatible', 'https://api.openai.com/v1')
ON CONFLICT (provider_key) DO NOTHING;

INSERT INTO public.ai_router_rules (assistant_slug, mode, model_name, priority)
SELECT slug, 'managed', 'gpt-4o-mini', 100
FROM public.ai_assistant_domains
ON CONFLICT DO NOTHING;
