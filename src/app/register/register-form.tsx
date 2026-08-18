"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Chrome, Eye, EyeOff, Loader2, CreditCard, Sparkles } from "lucide-react";
import { registerAction } from "@/lib/actions/auth-actions";
import { createClient } from "@/lib/supabase/client";
import type { SubscriptionPlanConfig } from "@/lib/db/types";

export function RegisterForm({ plans }: { plans: SubscriptionPlanConfig[] }) {
  const searchParams = useSearchParams();
  const requestedPlan = searchParams.get("plan");
  const initialPlan = plans.some((plan) => plan.slug === requestedPlan)
    ? requestedPlan!
    : plans.find((plan) => plan.slug === "free_trial")?.slug || plans[0]?.slug || "";

  const [selectedPlan, setSelectedPlan] = useState<string>(initialPlan);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const selectedPlanData = plans.find((plan) => plan.slug === selectedPlan);

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
      if ("requiresEmailVerification" in res && res.requiresEmailVerification) {
        window.location.href = `/register/verify-email?email=${encodeURIComponent(res.email || "")}`;
      } else if (res.checkoutUrl) {
        window.location.href = res.checkoutUrl;
      } else if (res.orderId) {
        window.location.href = `/admin/subscription?payment=pending&order_id=${res.orderId}`;
      } else {
        window.location.href = "/admin";
      }
    }
  }

  async function handleGoogleSignup() {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/admin`,
      },
    });
    if (oauthError) {
      setError(oauthError.message);
      setLoading(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {error && (
        <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-400">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={() => void handleGoogleSignup()}
        disabled={loading}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-md border-2 border-border/80 bg-background text-sm font-semibold transition-colors hover:bg-muted disabled:opacity-50"
      >
        <Chrome className="h-4 w-4" /> Daftar dengan Google
      </button>
      <div className="flex items-center gap-3 text-[10px] uppercase tracking-wider text-muted-foreground">
        <span className="h-px flex-1 bg-border" /> atau dengan email{" "}
        <span className="h-px flex-1 bg-border" />
      </div>

      {/* Plan Selector */}
      <div className="space-y-2">
        <div className="flex items-end justify-between gap-3">
          <label className="text-sm font-medium text-foreground">Pilih cara mulai</label>
          <span className="text-[10px] text-muted-foreground">Bisa upgrade kapan saja</span>
        </div>
        {plans.length > 0 ? (
          <div className="grid grid-cols-2 gap-2">
            {plans.map((plan) => (
              <button
                key={plan.slug}
                type="button"
                onClick={() => setSelectedPlan(plan.slug)}
                className={`relative flex min-h-24 flex-col justify-between rounded-lg border p-2.5 text-left transition-all ${
                  selectedPlan === plan.slug
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : "border-border/80 bg-background hover:bg-muted/40 dark:border-border"
                }`}
              >
                {plan.is_popular && (
                  <span className="absolute -right-1.5 -top-2 rounded-full bg-primary px-1.5 py-0.5 text-[8px] font-bold text-primary-foreground">
                    POPULER
                  </span>
                )}
                <span className="flex items-center gap-1 text-xs font-bold text-foreground">
                  {plan.name}
                  {plan.is_popular && <Sparkles className="h-3 w-3 fill-amber-500 text-amber-500" />}
                </span>
                <span className={`mt-1 text-[10px] font-semibold ${plan.price > 0 ? "text-primary" : "text-emerald-600 dark:text-emerald-400"}`}>
                  {plan.price_label || (plan.price > 0 ? `Rp${plan.price.toLocaleString("id-ID")}` : "Gratis")}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {plan.max_products} Produk · {plan.billing_period}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
            Paket belum tersedia. Silakan coba lagi nanti.
          </p>
        )}
        {selectedPlanData && selectedPlanData.price > 0 && (
          <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400">
            <CreditCard className="h-3 w-3 shrink-0" />
            Setelah akun terverifikasi, Anda akan diarahkan ke pembayaran QRIS yang aman.
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
        ) : selectedPlanData && selectedPlanData.price > 0 ? (
          `Lanjut Pembayaran ${selectedPlanData.name} via QRIS`
        ) : (
          "Buat Akun Gratis Sekarang"
        )}
        {!loading && <ArrowRight className="h-4 w-4" />}
      </button>
    </form>
  );
}
