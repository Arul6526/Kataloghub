"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { Eye, EyeOff, Loader2, LogIn } from "lucide-react";

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/admin/login/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, redirectTo }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login gagal");
      toast({ variant: "success", title: "Berhasil masuk", description: "Mengarahkan ke dashboard" });
      window.location.href = data.redirectTo || redirectTo;
    } catch (err) {
      toast({
        variant: "error",
        title: "Login gagal",
        description: err instanceof Error ? err.message : "Terjadi kesalahan",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Email" htmlFor="email" required>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@brand.com"
          disabled={loading}
        />
      </Field>
      <Field label="Kata sandi" htmlFor="password" required>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            disabled={loading}
            className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-r-md"
            aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </Field>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
        Masuk
      </Button>
    </form>
  );
}