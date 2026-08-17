'use client';

import React from 'react';
import { 
  Zap, 
  MessageSquare, 
  ShieldCheck, 
  Globe, 
  Sparkles, 
  Store, 
  ArrowRight,
  TrendingUp,
  Check
} from 'lucide-react';
import Link from 'next/link';

export function RobotDemoSection() { 
  return (
    <div className="relative w-full overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 text-white p-8 md:p-14 shadow-2xl">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.25)_0%,transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.2)_0%,transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#1f293715_1px,transparent_1px),linear-gradient(to_bottom,#1f293715_1px,transparent_1px)] bg-[size:3rem_3rem]" />

      <div className="relative z-10 grid lg:grid-cols-2 gap-10 items-center">
        {/* Left Column: Heading & Copywriting */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Asisten Cerdas &amp; Infrastruktur Toko Digital</span>
          </div>

          <h2 className="font-space text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.15]">
            Mulai Jualan Online <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">Tanpa Hambatan Teknis</span>
          </h2>

          <p className="text-base text-zinc-300 leading-relaxed max-w-xl">
            KatalogHub mengubah daftar produk bisnis Anda menjadi website katalog yang super cepat, elegan, dan terhubung otomatis ke WhatsApp bisnis Anda.
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3 text-sm text-zinc-200">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Check className="h-3.5 w-3.5" />
              </span>
              <span>Buat katalog profesional dalam kurun waktu kurang dari 3 menit.</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-zinc-200">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Check className="h-3.5 w-3.5" />
              </span>
              <span>Format pesan WhatsApp instan lengkap dengan detail barang &amp; jumlah.</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-zinc-200">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Check className="h-3.5 w-3.5" />
              </span>
              <span>Performa kilat di HP pembeli tanpa perlu sewa server &amp; developer.</span>
            </div>
          </div>

          <div className="pt-4 flex flex-wrap items-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg transition-transform hover:scale-[1.02] hover:bg-primary/90"
            >
              Coba Gratis Sekarang <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/portofolio"
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900/80 px-6 py-3.5 text-sm font-semibold text-zinc-200 transition-colors hover:bg-zinc-800 hover:text-white"
            >
              Lihat Contoh Katalog
            </Link>
          </div>
        </div>

        {/* Right Column: Visual Product Showcase Mockup */}
        <div className="relative">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-6 shadow-2xl backdrop-blur-md space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold shadow-md">
                  <Store className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">Etalase Digital Resmi</h4>
                  <p className="text-xs text-zinc-400">Siap menerima pesanan 24/7</p>
                </div>
              </div>
              <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
                Status: Online
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-zinc-950/80 p-4 border border-zinc-800/60 space-y-1">
                <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium">
                  <Zap className="h-4 w-4 text-amber-400" /> Kecepatan
                </div>
                <p className="text-lg font-bold text-white">Ultra-Fast</p>
                <p className="text-[11px] text-zinc-400">Dimuat &lt;1 detik di mobile</p>
              </div>
              <div className="rounded-xl bg-zinc-950/80 p-4 border border-zinc-800/60 space-y-1">
                <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium">
                  <MessageSquare className="h-4 w-4 text-emerald-400" /> Konversi
                </div>
                <p className="text-lg font-bold text-white">Direct WA</p>
                <p className="text-[11px] text-zinc-400">Format checkout otomatis</p>
              </div>
              <div className="rounded-xl bg-zinc-950/80 p-4 border border-zinc-800/60 space-y-1">
                <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium">
                  <Globe className="h-4 w-4 text-blue-400" /> Jangkauan
                </div>
                <p className="text-lg font-bold text-white">SEO Optimized</p>
                <p className="text-[11px] text-zinc-400">Tampil di hasil pencarian</p>
              </div>
              <div className="rounded-xl bg-zinc-950/80 p-4 border border-zinc-800/60 space-y-1">
                <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium">
                  <ShieldCheck className="h-4 w-4 text-purple-400" /> Keamanan
                </div>
                <p className="text-lg font-bold text-white">Enterprise</p>
                <p className="text-[11px] text-zinc-400">Enkripsi &amp; RLS multi-tenant</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div> 
  );
}
