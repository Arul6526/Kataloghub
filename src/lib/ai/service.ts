import { createAdminClient } from "@/lib/supabase/server";
import { decryptSecret, encryptSecret, maskSecret } from "@/lib/ai/secrets";
import {
  createOpenAiCompatibleCompletion,
  validateAiBaseUrl,
  type AiMessage,
} from "@/lib/ai/openai-compatible";
import type { AiAssistantDomain, AiMode, AiSettingsView } from "@/lib/ai/types";

const DEFAULT_MODEL = "gpt-4o-mini";
const DEFAULT_BASE_URL = "https://api.openai.com/v1";
const DEFAULT_DOMAIN_PROMPTS: Record<AiAssistantDomain, string> = {
  product: "Fokus pada data produk, katalog, atribut, harga, dan saran merchandising.",
  marketing: "Buat caption, CTA, hashtag, kalender konten, dan variasi konten untuk media sosial.",
  business: "Bantu analisis katalog, performa bisnis, segmentasi, dan rencana pertumbuhan.",
  sales: "Buat skrip penjualan, jawaban keberatan, follow-up, dan rekomendasi produk.",
};

export async function getUserAiSettings(userId: string): Promise<AiSettingsView> {
  const db = createAdminClient();
  const { data } = await db
    .from("ai_user_settings")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  const row = data || {};
  return {
    mode: row.mode === "byok" ? "byok" : "managed",
    providerName: row.provider_name || "OpenAI-compatible",
    baseUrl: row.base_url || DEFAULT_BASE_URL,
    model: row.model || DEFAULT_MODEL,
    hasApiKey: Boolean(row.encrypted_api_key),
    maskedApiKey: row.encrypted_api_key ? "****configured****" : null,
    tokenLimit: Number(row.token_limit) || 100_000,
    tokensUsed: Number(row.tokens_used) || 0,
  };
}

export async function saveUserAiSettings(
  userId: string,
  input: { mode: AiMode; providerName: string; baseUrl: string; model: string; apiKey?: string },
) {
  const db = createAdminClient();
  const baseUrl = validateAiBaseUrl(input.baseUrl);
  const { data: existing } = await db
    .from("ai_user_settings")
    .select("encrypted_api_key")
    .eq("user_id", userId)
    .maybeSingle();

  if (input.mode === "byok" && !input.apiKey && !existing?.encrypted_api_key) {
    throw new Error("API key wajib diisi untuk mode BYOK.");
  }

  const update = {
    user_id: userId,
    mode: input.mode,
    provider_name: input.providerName.trim() || "OpenAI-compatible",
    base_url: baseUrl,
    model: input.model.trim(),
    ...(input.apiKey?.trim() ? { encrypted_api_key: encryptSecret(input.apiKey.trim()) } : {}),
    updated_at: new Date().toISOString(),
  };
  const { error } = await db.from("ai_user_settings").upsert(update, { onConflict: "user_id" });
  if (error) throw error;

  if (input.mode === "byok" && input.apiKey?.trim()) {
    await db.from("ai_user_provider_keys").upsert(
      {
        user_id: userId,
        provider_key: input.providerName
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-"),
        base_url: baseUrl,
        encrypted_api_key: update.encrypted_api_key,
        default_model: input.model.trim(),
        enabled: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,provider_key" },
    );
  }
}

export async function getAssistantDomain(domain: AiAssistantDomain) {
  const db = createAdminClient();
  const { data } = await db
    .from("ai_assistant_domains")
    .select("slug, name, system_prompt, enabled")
    .eq("slug", domain)
    .maybeSingle();
  if (data?.enabled === false) throw new Error("Domain AI ini sedang dinonaktifkan.");
  return {
    name: data?.name || domain,
    systemPrompt: data?.system_prompt || DEFAULT_DOMAIN_PROMPTS[domain],
  };
}

export async function getEffectiveAiConfig(
  userId: string,
  domain: AiAssistantDomain = "marketing",
) {
  const db = createAdminClient();
  const { data: userSettings } = await db
    .from("ai_user_settings")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  const mode: AiMode = userSettings?.mode === "byok" ? "byok" : "managed";

  if (mode === "byok") {
    const providerKey = userSettings?.provider_name
      ?.trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-");
    const { data: provider } = await db
      .from("ai_user_provider_keys")
      .select("*")
      .eq("user_id", userId)
      .eq("provider_key", providerKey)
      .eq("enabled", true)
      .maybeSingle();
    const encryptedKey = provider?.encrypted_api_key || userSettings?.encrypted_api_key;
    if (!encryptedKey) throw new Error("API key BYOK belum dikonfigurasi.");
    return {
      mode,
      providerName: provider?.provider_key || userSettings.provider_name,
      baseUrl: provider?.base_url || userSettings.base_url,
      model: provider?.default_model || userSettings.model,
      apiKey: decryptSecret(encryptedKey),
      tokenLimit: Number(userSettings.token_limit) || 100_000,
      tokensUsed: Number(userSettings.tokens_used) || 0,
    };
  }

  const { data: route } = await db
    .from("ai_router_rules")
    .select("provider_id, model_name")
    .eq("assistant_slug", domain)
    .eq("mode", "managed")
    .eq("enabled", true)
    .order("priority", { ascending: true })
    .limit(1)
    .maybeSingle();
  const { data: routedProvider } = route?.provider_id
    ? await db
        .from("ai_provider_configs")
        .select("*")
        .eq("id", route.provider_id)
        .eq("enabled", true)
        .maybeSingle()
    : { data: null };
  const { data: platform } = await db
    .from("ai_platform_settings")
    .select("*")
    .eq("id", true)
    .maybeSingle();
  const managedProvider = routedProvider?.encrypted_api_key ? routedProvider : platform;
  if (!platform?.enabled || !managedProvider?.encrypted_api_key) {
    throw new Error("AI Managed by KatalogHub belum diaktifkan oleh Superadmin.");
  }
  return {
    mode,
    providerName: managedProvider.provider_name || managedProvider.display_name,
    baseUrl: managedProvider.base_url,
    model: route?.model_name || managedProvider.model,
    apiKey: decryptSecret(managedProvider.encrypted_api_key),
    tokenLimit: Number(userSettings?.token_limit) || 100_000,
    tokensUsed: Number(userSettings?.tokens_used) || 0,
  };
}

export async function completeForUser(
  userId: string,
  messages: AiMessage[],
  conversationId: string | null,
  domain: AiAssistantDomain = "marketing",
  tools: Record<string, unknown>[] = [],
) {
  const db = createAdminClient();
  const config = await getEffectiveAiConfig(userId, domain);
  const totalInput = messages.reduce(
    (sum, message) => sum + Math.max(1, Math.ceil(message.content.length / 4)),
    0,
  );
  if (config.tokensUsed + totalInput >= config.tokenLimit) {
    throw new Error("Quota token AI Anda sudah habis.");
  }

  const result = await createOpenAiCompatibleCompletion({
    baseUrl: config.baseUrl,
    apiKey: config.apiKey,
    model: config.model,
    messages,
    tools,
  });

  const totalTokens = result.totalTokens;
  const { data: currentSettings } = await db
    .from("ai_user_settings")
    .select("tokens_used")
    .eq("user_id", userId)
    .maybeSingle();
  await db.from("ai_user_settings").upsert(
    {
      user_id: userId,
      mode: config.mode,
      tokens_used: Number(currentSettings?.tokens_used || 0) + totalTokens,
    },
    { onConflict: "user_id" },
  );

  await db.from("ai_usage_logs").insert({
    user_id: userId,
    conversation_id: conversationId,
    mode: config.mode,
    provider_name: config.providerName,
    model: config.model,
    input_tokens: result.inputTokens,
    output_tokens: result.outputTokens,
    total_tokens: totalTokens,
  });
  return { ...result, mode: config.mode, providerName: config.providerName, model: config.model };
}

export function serializeSecretStatus(value: string | null | undefined) {
  return maskSecret(value);
}
