-- AI Assistant: platform configuration, tenant configuration, conversations, and token usage.

CREATE TABLE IF NOT EXISTS public.ai_platform_settings (
  id boolean PRIMARY KEY DEFAULT true CHECK (id = true),
  enabled boolean NOT NULL DEFAULT false,
  provider_name text NOT NULL DEFAULT 'OpenAI-compatible',
  base_url text NOT NULL DEFAULT 'https://api.openai.com/v1',
  model text NOT NULL DEFAULT 'gpt-4o-mini',
  encrypted_api_key text,
  input_token_price numeric NOT NULL DEFAULT 0,
  output_token_price numeric NOT NULL DEFAULT 0,
  monthly_token_limit bigint NOT NULL DEFAULT 1000000,
  updated_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ai_user_settings (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  mode text NOT NULL DEFAULT 'managed' CHECK (mode IN ('managed', 'byok')),
  provider_name text NOT NULL DEFAULT 'OpenAI-compatible',
  base_url text NOT NULL DEFAULT 'https://api.openai.com/v1',
  model text NOT NULL DEFAULT 'gpt-4o-mini',
  encrypted_api_key text,
  token_limit bigint NOT NULL DEFAULT 100000,
  tokens_used bigint NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ai_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'Percakapan baru',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ai_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('system', 'user', 'assistant')),
  content text NOT NULL,
  input_tokens integer NOT NULL DEFAULT 0,
  output_tokens integer NOT NULL DEFAULT 0,
  provider_name text,
  model text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ai_usage_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id uuid REFERENCES public.ai_conversations(id) ON DELETE SET NULL,
  mode text NOT NULL CHECK (mode IN ('managed', 'byok')),
  provider_name text NOT NULL,
  model text NOT NULL,
  input_tokens integer NOT NULL DEFAULT 0,
  output_tokens integer NOT NULL DEFAULT 0,
  total_tokens integer NOT NULL DEFAULT 0,
  estimated_cost numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage_logs ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_superadmin_user()
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'superadmin'
  );
$$;

DROP POLICY IF EXISTS "ai_platform_superadmin_all" ON public.ai_platform_settings;
CREATE POLICY "ai_platform_superadmin_all" ON public.ai_platform_settings
  FOR ALL USING (public.is_superadmin_user()) WITH CHECK (public.is_superadmin_user());

DROP POLICY IF EXISTS "ai_user_settings_owner_all" ON public.ai_user_settings;
CREATE POLICY "ai_user_settings_owner_all" ON public.ai_user_settings
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "ai_conversations_owner_all" ON public.ai_conversations;
CREATE POLICY "ai_conversations_owner_all" ON public.ai_conversations
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "ai_messages_owner_all" ON public.ai_messages;
CREATE POLICY "ai_messages_owner_all" ON public.ai_messages
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "ai_usage_owner_read" ON public.ai_usage_logs;
CREATE POLICY "ai_usage_owner_read" ON public.ai_usage_logs
  FOR SELECT USING (auth.uid() = user_id OR public.is_superadmin_user());

DROP POLICY IF EXISTS "ai_usage_superadmin_all" ON public.ai_usage_logs;
CREATE POLICY "ai_usage_superadmin_all" ON public.ai_usage_logs
  FOR ALL USING (public.is_superadmin_user()) WITH CHECK (public.is_superadmin_user());

CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_updated
  ON public.ai_conversations(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation_created
  ON public.ai_messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_ai_usage_user_created
  ON public.ai_usage_logs(user_id, created_at DESC);

INSERT INTO public.ai_platform_settings (id)
VALUES (true)
ON CONFLICT (id) DO NOTHING;
