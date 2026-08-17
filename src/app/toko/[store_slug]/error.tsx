"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Store, RefreshCw, ArrowLeft } from "lucide-react";

export default function TokoError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Toko Error]", error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-4 p-6 rounded-2xl border border-zinc-800 bg-zinc-900/90 text-zinc-100 shadow-xl">
        <div className="w-16 h-16 rounded-full bg-purple-500/10 text-purple-400 mx-auto flex items-center justify-center">
          <Store className="w-8 h-8" />
        </div>

        <div className="space-y-1.5">
          <h1 className="text-xl font-bold tracking-tight text-white">Toko Sedang Bermasalah</h1>
          <p className="text-sm text-zinc-400">
            Maaf, halaman toko ini sedang mengalami kendala teknis. Silakan coba muat ulang halaman.
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
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-zinc-300 hover:bg-zinc-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Beranda Utama
          </Link>
        </div>
      </div>
    </div>
  );
}
