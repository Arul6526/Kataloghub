"use client";

import React, { useState } from "react";
import { 
  STARTER_STORE_PRESETS, 
  StarterStorePreset 
} from "@/lib/starter-store-templates";
import { applyStarterStorePresetAction } from "@/lib/actions/starter-template-actions";
import { 
  Sparkles, 
  CheckCircle2, 
  Package, 
  Layers, 
  ArrowRight, 
  Loader2, 
  AlertCircle,
  Wand2,
  Store
} from "lucide-react";

interface StarterTemplateSelectorProps {
  onSuccess?: () => void;
  compact?: boolean;
}

export function StarterTemplateSelector({ onSuccess, compact = false }: StarterTemplateSelectorProps) {
  const [selectedPresetId, setSelectedPresetId] = useState<string>("atk");
  const [clearExisting, setClearExisting] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const presets = Object.values(STARTER_STORE_PRESETS);
  const activePreset = STARTER_STORE_PRESETS[selectedPresetId];

  const handleApplyPreset = async () => {
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const res = await applyStarterStorePresetAction({
      presetId: selectedPresetId,
      clearExisting,
    });

    setLoading(false);

    if (res.ok) {
      setSuccessMsg(
        `🎉 Toko Berhasil Disetup! ${res.productsCount} Produk Sampel & ${res.categoriesCount} Kategori Toko telah siap digunakan. Pengguna tinggal mengedit nama & harga produk!`
      );
      if (onSuccess) onSuccess();
    } else {
      setErrorMsg(res.error);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Info Banner */}
      <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-md mt-0.5">
            <Wand2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-space text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
              Template Toko Siap Pakai (1-Klik Setup)
              <span className="text-[10px] bg-primary text-primary-foreground font-semibold px-2 py-0.5 rounded-full uppercase">
                Fitur UMKM
              </span>
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Pilih bidang usaha Anda. Sistem akan otomatis mengisi slogan toko, kategori, dan contoh produk sampel yang tinggal Anda edit!
            </p>
          </div>
        </div>
      </div>

      {/* Success Alert Banner */}
      {successMsg && (
        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm font-semibold flex items-start gap-2.5 shadow-sm">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1">{successMsg}</div>
        </div>
      )}

      {/* Error Alert Banner */}
      {errorMsg && (
        <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-800 dark:text-red-300 text-xs sm:text-sm font-semibold flex items-start gap-2.5">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">{errorMsg}</div>
        </div>
      )}

      {/* PRESETS SELECTION GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
        {presets.map((preset) => {
          const isSelected = selectedPresetId === preset.id;

          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => setSelectedPresetId(preset.id)}
              className={`p-4 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between space-y-3 ${
                isSelected
                  ? "border-primary bg-primary/10 ring-2 ring-primary/30 shadow-md"
                  : "border-border bg-card hover:border-primary/50 hover:bg-muted/30"
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{preset.icon}</span>
                  {isSelected && (
                    <span className="text-[10px] bg-primary text-primary-foreground font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Terpilih
                    </span>
                  )}
                </div>

                <h4 className="font-space text-base font-bold text-foreground">
                  {preset.label}
                </h4>

                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                  {preset.description}
                </p>
              </div>

              {/* Preset Contents Preview Badges */}
              <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground font-medium">
                <span className="flex items-center gap-1">
                  <Package className="h-3.5 w-3.5 text-primary" /> {preset.products.length} Produk Sampel
                </span>
                <span className="flex items-center gap-1">
                  <Layers className="h-3.5 w-3.5 text-emerald-600" /> {preset.categories.length} Kategori
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* ACTIVE PRESET PREVIEW & ACTION FOOTER */}
      {activePreset && (
        <div className="p-5 rounded-2xl border border-border bg-card space-y-4 shadow-md">
          <div className="space-y-1 border-b border-border pb-3">
            <h4 className="font-space text-sm font-bold text-foreground flex items-center gap-2">
              <span>Rincian Preset: {activePreset.label}</span>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded font-mono border border-emerald-500/20">
                1-Klik Setup
              </span>
            </h4>
            <p className="text-xs text-muted-foreground">
              {activePreset.brandPreset.tagline}
            </p>
          </div>

          {/* Sample Categories & Products List Preview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <span className="font-bold text-foreground text-[11px] uppercase tracking-wider block">
                Kategori Siap Pakai ({activePreset.categories.length}):
              </span>
              <ul className="space-y-1">
                {activePreset.categories.map((cat, idx) => (
                  <li key={idx} className="flex items-center gap-1.5 text-muted-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>{cat.name}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-1.5">
              <span className="font-bold text-foreground text-[11px] uppercase tracking-wider block">
                Contoh Produk Sampel ({activePreset.products.length}):
              </span>
              <ul className="space-y-1">
                {activePreset.products.map((prod, idx) => (
                  <li key={idx} className="flex items-center justify-between text-muted-foreground">
                    <span className="truncate max-w-[180px]">• {prod.name}</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      Rp {prod.price.toLocaleString("id-ID")}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Options & Apply Button */}
          <div className="pt-3 border-t border-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                checked={clearExisting}
                onChange={(e) => setClearExisting(e.target.checked)}
                className="rounded border-input text-primary focus:ring-primary/40 h-4 w-4"
              />
              <span>Bersihkan/reset produk & kategori lama sebelum menerapkan preset ini</span>
            </label>

            <button
              type="button"
              onClick={handleApplyPreset}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold px-6 py-2.5 rounded-xl text-xs shadow-md hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Menerapkan Template Toko...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4" />
                  Terapkan Template {activePreset.label} <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
