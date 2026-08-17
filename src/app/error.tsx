"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, Home } from "lucide-react";

export default function GlobalAppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[App Global Error]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-zinc-950 text-zinc-100">
      <div className="max-w-md w-full text-center space-y-5 p-6 rounded-2xl border border-zinc-800 bg-zinc-900/80 backdrop-blur">
        <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-400 mx-auto flex items-center justify-center">
          <AlertCircle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold tracking-tight text-white">Terjadi Kesalahan Sistem</h1>
          <p className="text-sm text-zinc-400">
            Maaf, halaman ini mengalami gangguan yang tidak terduga. Silakan coba muat ulang halaman.
          </p>
        </div>

        <div className="flex items-center gap-3 justify-center pt-2">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-purple-500 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Coba Lagi
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-zinc-300 hover:bg-zinc-800 transition-colors"
          >
            <Home className="w-4 h-4" />
            Beranda
          </Link>
        </div>

        {process.env.NODE_ENV === "development" && (
          <div className="mt-4 text-left">
            <p className="text-xs font-mono text-zinc-500 mb-1">Developer Error Details:</p>
            <pre className="rounded-lg bg-zinc-950 p-3 text-xs text-red-300 overflow-auto max-h-36 font-mono border border-red-900/30">
              {error.message}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
