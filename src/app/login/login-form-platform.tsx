"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Chrome, Eye, EyeOff, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function LoginFormPlatform() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    try {
      const res = await fetch("/admin/login/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, redirectTo: "/admin" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login gagal");
      window.location.href = data.redirectTo || "/admin";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/admin` },
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
        onClick={() => void handleGoogleLogin()}
        disabled={loading}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-md border-2 border-border/80 bg-background text-sm font-semibold transition-colors hover:bg-muted disabled:opacity-50"
      >
        <Chrome className="h-4 w-4" /> Masuk dengan Google
      </button>
      <div className="flex items-center gap-3 text-[10px] uppercase tracking-wider text-muted-foreground">
        <span className="h-px flex-1 bg-border" /> atau dengan email{" "}
        <span className="h-px flex-1 bg-border" />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Email Pribadi</label>
        <input
          type="email"
          name="email"
          required
          placeholder="anda@email.com"
          className="h-12 w-full rounded-md border-2 border-border/80 bg-background px-4 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-border"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Kata Sandi</label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            required
            placeholder="••••••••"
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
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Masuk Sekarang"}
        {!loading && <ArrowRight className="h-4 w-4" />}
      </button>
    </form>
  );
}
