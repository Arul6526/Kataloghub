"use client";

import { useState } from "react";
import { Bot, Loader2, PlugZap, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  savePlatformAiSettingsAction,
  testPlatformAiConnectionAction,
} from "@/lib/actions/ai-actions";

type Settings = {
  enabled: boolean;
  providerName: string;
  baseUrl: string;
  model: string;
  hasApiKey: boolean;
  inputTokenPrice: number;
  outputTokenPrice: number;
  monthlyTokenLimit: number;
};

export function PlatformAiSettingsForm({ settings }: { settings: Settings }) {
  const [form, setForm] = useState({ ...settings, apiKey: "" });
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState("");
  const update = (key: string, value: string | boolean | number) =>
    setForm((current) => ({ ...current, [key]: value }));

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    const result = await savePlatformAiSettingsAction(form);
    setSaving(false);
    setMessage(
      result.success
        ? "Konfigurasi platform tersimpan."
        : result.error || "Gagal menyimpan konfigurasi.",
    );
    if (result.success) update("apiKey", "");
  }

  async function testConnection() {
    setTesting(true);
    setMessage("");
    const result = await testPlatformAiConnectionAction({
      baseUrl: form.baseUrl,
      model: form.model,
      apiKey: form.apiKey || undefined,
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
          <Bot className="h-6 w-6 text-blue-500" /> AI Platform Settings
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Kelola provider managed dan biaya token KatalogHub.
        </p>
      </div>
      <form
        onSubmit={submit}
        className="space-y-5 rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
      >
        <label className="flex items-center gap-3 text-sm text-zinc-200">
          <input
            type="checkbox"
            checked={form.enabled}
            onChange={(e) => update("enabled", e.target.checked)}
          />{" "}
          Aktifkan AI Managed by KatalogHub
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-zinc-300">Provider</Label>
            <Input
              value={form.providerName}
              onChange={(e) => update("providerName", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-300">Model</Label>
            <Input value={form.model} onChange={(e) => update("model", e.target.value)} required />
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-zinc-300">Base URL HTTPS</Label>
          <Input
            value={form.baseUrl}
            onChange={(e) => update("baseUrl", e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label className="text-zinc-300">
            Platform API Key{" "}
            {form.hasApiKey && <span className="text-emerald-400">(sudah tersimpan)</span>}
          </Label>
          <Input
            type="password"
            value={form.apiKey}
            onChange={(e) => update("apiKey", e.target.value)}
            placeholder={form.hasApiKey ? "Kosongkan untuk mempertahankan key" : "Masukkan API key"}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label className="text-zinc-300">Harga input / 1K</Label>
            <Input
              type="number"
              min="0"
              step="0.000001"
              value={form.inputTokenPrice}
              onChange={(e) => update("inputTokenPrice", Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-300">Harga output / 1K</Label>
            <Input
              type="number"
              min="0"
              step="0.000001"
              value={form.outputTokenPrice}
              onChange={(e) => update("outputTokenPrice", Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-300">Limit token</Label>
            <Input
              type="number"
              min="0"
              value={form.monthlyTokenLimit}
              onChange={(e) => update("monthlyTokenLimit", Number(e.target.value))}
            />
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-zinc-800 pt-4">
          <span className="text-sm text-zinc-400">{message}</span>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              disabled={testing || saving}
              onClick={() => void testConnection()}
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
              Simpan
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
