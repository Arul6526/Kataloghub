"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorDisplayProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorDisplay({
  title = "Gagal Memuat Data",
  message = "Terjadi kendala saat mengambil data. Silakan coba lagi.",
  onRetry,
  className = "",
}: ErrorDisplayProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center text-zinc-100 ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center">
        <AlertTriangle className="w-6 h-6" />
      </div>

      <div className="space-y-1 max-w-sm">
        <h3 className="text-base font-semibold text-white">{title}</h3>
        <p className="text-xs text-zinc-400">{message}</p>
      </div>

      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-1 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-500 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Coba Lagi
        </button>
      )}
    </div>
  );
}
