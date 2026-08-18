"use server";

import { requireAdmin, requireSuperAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { decryptSecret, encryptSecret } from "@/lib/ai/secrets";
import { validateAiBaseUrl } from "@/lib/ai/openai-compatible";
import {
  getEffectiveAiConfig,
  getUserAiSettings,
  saveUserAiSettings,
  testAiConnection,
} from "@/lib/ai/service";
import type { AiMode } from "@/lib/ai/types";

export async function getMyAiSettingsAction() {
  const current = await requireAdmin();
  return getUserAiSettings(current.userId);
}

export async function saveMyAiSettingsAction(input: {
  mode: AiMode;
  providerName: string;
  baseUrl: string;
  model: string;
  apiKey?: string;
}) {
  const current = await requireAdmin();
  try {
    await saveUserAiSettings(current.userId, input);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal menyimpan konfigurasi AI.",
    };
  }
}

export async function testMyAiConnectionAction(input: {
  mode: AiMode;
  baseUrl: string;
  model: string;
  apiKey?: string;
}) {
  const current = await requireAdmin();
  try {
    if (input.mode === "managed") {
      const config = await getEffectiveAiConfig(current.userId);
      const result = await testAiConnection(config);
      return {
        success: true,
        message: `Koneksi Managed berhasil. Model ${result.model} merespons.`,
      };
    }

    if (!input.apiKey?.trim()) {
      const config = await getEffectiveAiConfig(current.userId);
      const result = await testAiConnection({
        baseUrl: input.baseUrl,
        model: input.model,
        apiKey: config.apiKey,
      });
      return { success: true, message: `Koneksi BYOK berhasil. Model ${result.model} merespons.` };
    }

    const result = await testAiConnection({
      baseUrl: input.baseUrl,
      model: input.model,
      apiKey: input.apiKey.trim(),
    });
    return { success: true, message: `Koneksi BYOK berhasil. Model ${result.model} merespons.` };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Koneksi provider AI gagal.",
    };
  }
}

export async function getPlatformAiSettingsAction() {
  await requireSuperAdmin();
  const db = createAdminClient();
  const { data } = await db.from("ai_platform_settings").select("*").eq("id", true).maybeSingle();
  return {
    enabled: Boolean(data?.enabled),
    providerName: data?.provider_name || "OpenAI-compatible",
    baseUrl: data?.base_url || "https://api.openai.com/v1",
    model: data?.model || "gpt-4o-mini",
    hasApiKey: Boolean(data?.encrypted_api_key),
    maskedApiKey: data?.encrypted_api_key ? "****configured****" : null,
    inputTokenPrice: Number(data?.input_token_price) || 0,
    outputTokenPrice: Number(data?.output_token_price) || 0,
    monthlyTokenLimit: Number(data?.monthly_token_limit) || 1_000_000,
  };
}

export async function savePlatformAiSettingsAction(input: {
  enabled: boolean;
  providerName: string;
  baseUrl: string;
  model: string;
  apiKey?: string;
  inputTokenPrice: number;
  outputTokenPrice: number;
  monthlyTokenLimit: number;
}) {
  const current = await requireSuperAdmin();
  try {
    const db = createAdminClient();
    const baseUrl = validateAiBaseUrl(input.baseUrl);
    const { data: existing } = await db
      .from("ai_platform_settings")
      .select("encrypted_api_key")
      .eq("id", true)
      .maybeSingle();
    if (input.enabled && !input.apiKey && !existing?.encrypted_api_key) {
      return { success: false, error: "API key platform wajib diisi saat AI diaktifkan." };
    }
    const { error } = await db.from("ai_platform_settings").upsert(
      {
        id: true,
        enabled: input.enabled,
        provider_name: input.providerName.trim() || "OpenAI-compatible",
        base_url: baseUrl,
        model: input.model.trim(),
        ...(input.apiKey?.trim() ? { encrypted_api_key: encryptSecret(input.apiKey.trim()) } : {}),
        input_token_price: Math.max(0, input.inputTokenPrice),
        output_token_price: Math.max(0, input.outputTokenPrice),
        monthly_token_limit: Math.max(0, Math.floor(input.monthlyTokenLimit)),
        updated_by: current.userId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    );
    if (error) throw error;
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal menyimpan konfigurasi AI platform.",
    };
  }
}

export async function testPlatformAiConnectionAction(input: {
  baseUrl: string;
  model: string;
  apiKey?: string;
}) {
  await requireSuperAdmin();
  try {
    const db = createAdminClient();
    const baseUrl = validateAiBaseUrl(input.baseUrl);
    const { data: existing } = await db
      .from("ai_platform_settings")
      .select("encrypted_api_key")
      .eq("id", true)
      .maybeSingle();
    const encryptedKey = input.apiKey?.trim()
      ? input.apiKey.trim()
      : existing?.encrypted_api_key
        ? decryptSecret(existing.encrypted_api_key)
        : "";
    if (!encryptedKey) return { success: false, error: "API key platform belum diisi." };
    const result = await testAiConnection({ baseUrl, model: input.model, apiKey: encryptedKey });
    return {
      success: true,
      message: `Koneksi provider berhasil. Model ${result.model} merespons.`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Koneksi provider AI gagal.",
    };
  }
}
