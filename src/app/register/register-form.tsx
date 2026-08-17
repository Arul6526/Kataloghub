"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Loader2, CreditCard, Sparkles, CheckCircle2 } from "lucide-react";
import { registerAction } from "@/lib/actions/auth-actions";

export function RegisterForm() {
  const searchParams = useSearchParams();
  const initialPlan = searchParams.get("plan") || "free_trial";

  const [selectedPlan, setSelectedPlan] = useState<string>(initialPlan);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set("selectedPlan", selectedPlan);
    const res = await registerAction(formData);

    if (res.error) {
      setError(res.error);
      setLoading(false);
    } else {
      if (res.checkoutUrl) {
        window.location.href = res.checkoutUrl;
      } else if (res.orderId) {
        window.location.href = `/admin/subscription?payment=pending&order_id=${res.orderId}`;
      } else {
        window.location.href = "/admin";
      }
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {error && (
        <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Plan Selector */}
      <div className="space-y-2">
        <div className="flex items-end justify-between gap-3">
          <label className="text-sm font-medium text-foreground">Pilih cara mulai</label>
          <span className="text-[10px] text-muted-foreground">Bisa upgrade kapan saja</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setSelectedPlan("free_trial")}
            className={`flex flex-col justify-between rounded-lg border p-2.5 text-left transition-all ${
              selectedPlan === "free_trial"
                ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                : "border-border/80 bg-background hover:bg-muted/40 dark:border-border"
            }`}
          >
            <span className="text-xs font-bold text-foreground">Free Trial</span>
            <span className="mt-1 text-[10px] text-muted-foreground">Uji coba 90 hari</span>
            <span className="mt-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
              5 Produk
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedPlan("starter")}
            className={`relative flex flex-col justify-between rounded-lg border p-2.5 text-left transition-all ${
              selectedPlan === "starter"
                ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                : "border-border/80 bg-background hover:bg-muted/40 dark:border-border"
            }`}
          >
            <span className="flex items-center gap-1 text-xs font-bold text-foreground">
              Starter
            </span>
            <span className="mt-1 text-[10px] font-semibold text-primary">Rp20.000</span>
            <span className="text-[10px] text-muted-foreground">20 Produk</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedPlan("pro")}
            className={`relative flex flex-col justify-between rounded-lg border p-2.5 text-left transition-all ${
              selectedPlan === "pro"
                ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                : "border-border/80 bg-background hover:bg-muted/40 dark:border-border"
            }`}
          >
            <span className="flex items-center gap-1 text-xs font-bold text-foreground">
              Pro <Sparkles className="h-3 w-3 fill-amber-500 text-amber-500" />
            </span>
            <span className="mt-1 text-[10px] font-semibold text-primary">Rp75.000</span>
            <span className="text-[10px] text-muted-foreground">100 Produk</span>
          </button>
        </div>
        {selectedPlan !== "free_trial" && (
          <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400">
            <CreditCard className="h-3 w-3 shrink-0" />
            Setelah akun dibuat, Anda akan diarahkan ke pembayaran QRIS yang aman.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Nama bisnis atau toko</label>
        <input
          type="text"
          name="businessName"
          required
          placeholder="Contoh: Teknik Jaya Mandiri"
          className="h-12 w-full rounded-md border-2 border-border/80 bg-background px-4 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-border"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Email untuk akses dashboard</label>
        <input
          type="email"
          name="email"
          required
          placeholder="nama@bisnisanda.com"
          className="h-12 w-full rounded-md border-2 border-border/80 bg-background px-4 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-border"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Buat kata sandi</label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            required
            placeholder="Minimal 8 karakter, mudah diingat"
            className="h-12 w-full rounded-md border-2 border-border/80 bg-background pl-4 pr-11 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-border"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-0 top-0 flex h-full items-center justify-center px-3 text-muted-foreground transition-colors hover:text-foreground focus:outline-none"
            aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-md bg-primary text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : selectedPlan === "free_trial" ? (
          "Buat Akun Gratis Sekarang"
        ) : (
          `Lanjut Pembayaran ${selectedPlan.toUpperCase()} via QRIS`
        )}
        {!loading && <ArrowRight className="h-4 w-4" />}
      </button>
    </form>
  );
}
