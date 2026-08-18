"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Database, Loader2, Mail, RefreshCw } from "lucide-react";
import { resendVerificationEmailAction } from "@/lib/actions/auth-actions";

export function VerifyEmailClient({ email }: { email: string }) {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function resend() {
    setLoading(true);
    setStatus("");
    const result = await resendVerificationEmailAction(email);
    setLoading(false);
    setStatus(
      result.success
        ? "Email verifikasi dikirim ulang."
        : result.error || "Gagal mengirim ulang email.",
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10 text-foreground">
      <div className="w-full max-w-md space-y-6 rounded-2xl border bg-card p-6 text-center shadow-sm sm:p-8">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Mail className="h-7 w-7" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2 text-sm font-bold">
            <Database className="h-4 w-4 text-primary" /> Katalog
            <span className="text-primary">Hub</span>
          </div>
          <h1 className="text-2xl font-bold">Cek inbox Anda</h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Kami mengirim link verifikasi ke{" "}
            <strong className="text-foreground">{email || "email Anda"}</strong>. Klik link tersebut
            untuk mengaktifkan akun dan masuk ke dashboard.
          </p>
        </div>
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-left text-xs text-muted-foreground">
          <p className="flex items-center gap-2 font-semibold text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" /> Satu langkah lagi
          </p>
          <p className="mt-1">Tidak menemukan email? Periksa folder Spam atau Promotions.</p>
        </div>
        {status && <p className="text-sm text-muted-foreground">{status}</p>}
        {email && (
          <button
            type="button"
            onClick={() => void resend()}
            disabled={loading}
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}{" "}
            Kirim ulang email verifikasi
          </button>
        )}
        <Link
          href="/login"
          className="block text-sm font-semibold text-muted-foreground hover:text-foreground"
        >
          Kembali ke halaman masuk
        </Link>
      </div>
    </main>
  );
}
