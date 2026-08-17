"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";

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

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {error && (
        <div className="bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400 border border-red-200 dark:border-red-900/50 rounded-md px-4 py-3 text-sm flex items-center gap-2">
          {error}
        </div>
      )}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Email Pribadi</label>
        <input 
          type="email" 
          name="email"
          required
          placeholder="anda@email.com"
          className="w-full h-12 px-4 border-2 border-border/80 dark:border-border rounded-md bg-background focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm transition-colors"
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
            className="w-full h-12 pl-4 pr-11 border-2 border-border/80 dark:border-border rounded-md bg-background focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm transition-colors"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center focus:outline-none"
            aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </div>
      <button 
        type="submit"
        disabled={loading}
        className="w-full h-12 bg-primary text-primary-foreground rounded-md text-sm font-semibold mt-4 flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Masuk Sekarang"}
        {!loading && <ArrowRight className="h-4 w-4" />}
      </button>
    </form>
  );
}
