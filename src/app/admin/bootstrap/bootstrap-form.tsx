"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { Eye, EyeOff, Loader2, Rocket } from "lucide-react";

export function BootstrapForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (password.length < 8) {
      toast({ variant: "error", title: "Kata sandi minimal 8 karakter" });
      return;
    }
    if (password !== confirm) {
      toast({ variant: "error", title: "Konfirmasi kata sandi tidak cocok" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/admin/bootstrap/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal membuat admin");
      toast({
        variant: "success",
        title: "Admin pertama berhasil dibuat",
        description: "Silakan masuk dengan akun baru Anda",
      });
      router.replace("/admin/login");
    } catch (err) {
      toast({
        variant: "error",
        title: "Gagal bootstrap",
        description: err instanceof Error ? err.message : "Terjadi kesalahan",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Email admin" htmlFor="email" required hint="Email ini akan menjadi satu-satunya admin pertama">
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
      <Field label="Kata sandi" htmlFor="password" required hint="Minimal 8 karakter">
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
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
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </Field>
      <Field label="Ulangi kata sandi" htmlFor="confirm" required>
        <div className="relative">
          <Input
            id="confirm"
            type={showConfirm ? "text" : "password"}
            autoComplete="new-password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            disabled={loading}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            disabled={loading}
            className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-r-md"
            aria-label={showConfirm ? "Sembunyikan konfirmasi kata sandi" : "Tampilkan konfirmasi kata sandi"}
          >
            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </Field>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Rocket className="h-4 w-4" />
        )}
        Buat Admin Pertama
      </Button>
    </form>
  );
}