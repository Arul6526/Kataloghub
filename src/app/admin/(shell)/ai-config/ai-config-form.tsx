"use client";

import { useState } from "react";
import { Bot, CheckCircle2, KeyRound, Loader2, PlugZap, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveMyAiSettingsAction, testMyAiConnectionAction } from "@/lib/actions/ai-actions";
import type { AiSettingsView } from "@/lib/ai/types";

export function AiConfigForm({ settings }: { settings: AiSettingsView }) {
  const [mode, setMode] = useState(settings.mode);
  const [providerName, setProviderName] = useState(settings.providerName);
  const [baseUrl, setBaseUrl] = useState(settings.baseUrl);
  const [model, setModel] = useState(settings.model);
  const [apiKey, setApiKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    const result = await saveMyAiSettingsAction({
      mode,
      providerName,
      baseUrl,
      model,
      apiKey: apiKey || undefined,
    });
    setSaving(false);
    setMessage(
      result.success
        ? "Konfigurasi AI berhasil disimpan."
        : result.error || "Gagal menyimpan konfigurasi.",
    );
    if (result.success) setApiKey("");
  }

  async function handleTestConnection() {
    setTesting(true);
    setMessage("");
    const result = await testMyAiConnectionAction({
      mode,
      baseUrl,
      model,
      apiKey: apiKey || undefined,
    });
    setTesting(false);
    setMessage(
      result.success ? result.message || "Koneksi berhasil." : result.error || "Koneksi gagal.",
    );
  }

  return (
    <div className="max-w-3xl space-y-6 pb-12">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Bot className="h-6 w-6 text-emerald-600" /> Konfigurasi AI
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pilih sumber model AI yang digunakan oleh assistant toko Anda.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border bg-card p-6 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setMode("managed")}
            className={`rounded-xl border p-4 text-left ${mode === "managed" ? "border-emerald-500 bg-emerald-500/10" : "border-border"}`}
          >
            <p className="font-semibold">Managed by KatalogHub</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Gunakan provider yang dikonfigurasi Superadmin.
            </p>
          </button>
          <button
            type="button"
            onClick={() => setMode("byok")}
            className={`rounded-xl border p-4 text-left ${mode === "byok" ? "border-emerald-500 bg-emerald-500/10" : "border-border"}`}
          >
            <p className="font-semibold">BYOK</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Gunakan Base URL, model, dan API key milik Anda.
            </p>
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Nama Provider</Label>
            <Input
              value={providerName}
              onChange={(e) => setProviderName(e.target.value)}
              placeholder="OpenAI-compatible"
            />
          </div>
          <div className="space-y-2">
            <Label>Model</Label>
            <Input
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="gpt-4o-mini"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Base URL HTTPS</Label>
          <Input
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="https://api.openai.com/v1"
            required
          />
        </div>
        {mode === "byok" && (
          <div className="space-y-2">
            <Label>
              <KeyRound className="mr-1 inline h-4 w-4" /> API Key{" "}
              {settings.hasApiKey && (
                <span className="text-xs text-emerald-600">(sudah tersimpan)</span>
              )}
            </Label>
            <Input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={
                settings.hasApiKey ? "Kosongkan untuk mempertahankan key" : "Masukkan API key"
              }
            />
          </div>
        )}
        <div className="flex flex-col items-stretch justify-between gap-3 border-t pt-4 sm:flex-row sm:items-center">
          {message && (
            <p className="flex items-center gap-1 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              {message}
            </p>
          )}
          <div className="ml-auto flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              disabled={testing || saving}
              onClick={() => void handleTestConnection()}
              className="gap-2"
            >
              {testing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <PlugZap className="h-4 w-4" />
              )}
              {testing ? "Mengecek..." : "Cek Koneksi"}
            </Button>
            <Button type="submit" disabled={saving || testing} className="gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}{" "}
              Simpan Konfigurasi
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
