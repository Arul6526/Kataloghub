"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Admin Shell Error]", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-4 p-6 rounded-2xl border border-zinc-800 bg-zinc-900/90 text-zinc-100 shadow-xl">
        <div className="w-14 h-14 rounded-full bg-amber-500/10 text-amber-400 mx-auto flex items-center justify-center">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <div className="space-y-1">
          <h2 className="text-lg font-bold text-white">Gagal Memuat Halaman Admin</h2>
          <p className="text-xs text-zinc-400">
            Terjadi kesalahan saat memproses data admin. Silakan muat ulang.
          </p>
        </div>

        <div className="pt-2">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2 text-xs font-semibold text-white hover:bg-purple-500 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Coba Lagi
          </button>
        </div>
      </div>
    </div>
  );
}
