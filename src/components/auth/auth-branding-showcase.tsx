"use client";

import React from "react";
import { MessageSquare, Zap, ShieldCheck } from "lucide-react";

interface AuthBrandingShowcaseProps {
  mode?: "login" | "register";
}

export function AuthBrandingShowcase({ mode = "login" }: AuthBrandingShowcaseProps) {
  const isLogin = mode === "login";

  return (
    <div className="relative hidden h-full flex-col justify-between overflow-hidden border-l border-slate-200/80 bg-slate-50/80 p-10 text-slate-900 transition-colors duration-200 dark:border-zinc-800/80 dark:bg-zinc-950 dark:text-zinc-100 lg:flex xl:p-14">
      {/* Background Subtle Ambient Glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.06)_0%,transparent_50%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.08)_0%,transparent_50%)]" />

      {/* Main Copywriting Header */}
      <div className="relative z-10 my-auto max-w-lg space-y-4">
        <div className="font-mono text-xs font-semibold uppercase tracking-widest text-primary">
          KatalogHub Digital Storefront
        </div>

        <h2 className="font-space text-2xl font-bold leading-snug tracking-tight text-slate-900 dark:text-white xl:text-3xl">
          {isLogin
            ? "Kelola etalase produk & pesanan WhatsApp dari satu tempat."
            : "Buka pintu toko Anda ke lebih banyak pelanggan dalam 3 menit."}
        </h2>

        <p className="text-sm leading-relaxed text-slate-600 dark:text-zinc-400">
          {isLogin
            ? "Sistem etalase digital modern yang menghubungkan calon pembeli langsung ke nomor WhatsApp Anda tanpa alur checkout rumit."
            : "Mulai dengan katalog yang terlihat profesional, order yang masuk langsung ke WhatsApp, dan AI Team yang membantu Anda bergerak lebih cepat."}
        </p>

        {/* Minimalist Key Benefit Statements */}
        <div className="space-y-4 border-t border-slate-200/80 pt-6 dark:border-zinc-800/80">
          <div className="flex items-start gap-3">
            <div className="shrink-0 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400">
              <MessageSquare className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-200">
                Pelanggan tahu harus klik apa
              </h4>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Produk tampil rapi dan pesanan terformat langsung masuk ke WhatsApp Anda.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="shrink-0 rounded-lg border border-amber-500/20 bg-amber-500/10 p-2 text-amber-600 dark:text-amber-400">
              <Zap className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-200">
                Toko siap jalan, bukan sekadar dibuat
              </h4>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Katalog cepat dibuka di HP, mudah dibagikan, dan siap ditemukan di Google.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="shrink-0 rounded-lg border border-indigo-500/20 bg-indigo-500/10 p-2 text-indigo-600 dark:text-indigo-400">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-200">
                Bisnis Anda tetap milik Anda
              </h4>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Data katalog terisolasi dan dilindungi, agar Anda bisa fokus melayani pelanggan.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 flex items-center justify-between border-t border-slate-200/80 pt-4 text-xs text-slate-500 dark:border-zinc-800/80 dark:text-zinc-500">
        <span>© {new Date().getFullYear()} KatalogHub</span>
        <span className="font-mono text-[11px]">Platform Core v2.4</span>
      </div>
    </div>
  );
}
