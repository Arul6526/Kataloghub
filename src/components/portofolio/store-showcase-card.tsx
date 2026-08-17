"use client";

import React from "react";
import Link from "next/link";
import { Store, ExternalLink, Package, CheckCircle2, Globe, Layers } from "lucide-react";

export interface ShowcaseStore {
  id: string;
  name: string;
  slug: string;
  categoryTag: string;
  description: string;
  productCount: number;
  categoryCount: number;
  verified: boolean;
  badgeText: string;
  badgeColor: string;
  bannerGradient: string;
}

export function StoreShowcaseCard({ store }: { store: ShowcaseStore }) {
  return (
    <div className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card shadow-md transition-all duration-300 hover:border-primary/50 hover:shadow-xl">
      <div>
        {/* Mockup Window Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 p-3 text-slate-300">
          <div className="flex items-center gap-2">
            <div className="flex shrink-0 gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500/80"></span>
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/80"></span>
              <span className="h-2.5 w-2.5 rounded-full bg-green-500/80"></span>
            </div>
            <span className="max-w-[180px] truncate font-mono text-[10px] text-slate-400 sm:max-w-[220px]">
              kataloghub.com/toko/{store.slug}
            </span>
          </div>
          <span
            className={`rounded-full border px-2 py-0.5 text-[9px] font-bold ${store.badgeColor}`}
          >
            {store.badgeText}
          </span>
        </div>

        {/* Banner Graphic Header */}
        <div
          className={`bg-gradient-to-r p-6 ${store.bannerGradient} relative space-y-2 overflow-hidden text-white`}
        >
          <div className="absolute right-0 top-0 -translate-y-4 translate-x-4 opacity-10">
            <Store className="h-32 w-32" />
          </div>

          <div className="relative z-10 space-y-1">
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider">
              {store.categoryTag}
            </span>
            <h3 className="flex items-center gap-2 font-space text-2xl font-bold tracking-tight text-white">
              {store.name}
              <CheckCircle2 className="h-5 w-5 shrink-0 fill-emerald-400/30 text-emerald-300" />
            </h3>
          </div>
        </div>

        {/* Store Details Body */}
        <div className="space-y-5 p-6">
          <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
            {store.description}
          </p>

          {/* Store Stats Grid */}
          <div className="grid grid-cols-2 gap-3 rounded-xl border border-border/60 bg-muted/40 p-3 text-xs">
            <div className="space-y-0.5">
              <span className="text-[10px] font-semibold uppercase text-muted-foreground">
                Total Produk
              </span>
              <p className="flex items-center gap-1 font-bold text-foreground">
                <Package className="h-3.5 w-3.5 text-primary" /> {store.productCount}+ Item Aktif
              </p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] font-semibold uppercase text-muted-foreground">
                Kategori Toko
              </span>
              <p className="flex items-center gap-1 font-bold text-foreground">
                <Layers className="h-3.5 w-3.5 text-emerald-600" /> {store.categoryCount}+ Kategori
              </p>
            </div>
          </div>

          {/* Landing page link without embedded preview */}
          <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Globe className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-foreground">Landing page live tersedia</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Buka halaman toko di tab baru untuk melihat pengalaman lengkapnya.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="flex flex-col items-center gap-2.5 border-t border-border bg-muted/30 p-4 sm:flex-row">
        <Link
          href={`/toko/${store.slug}`}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-center text-xs font-bold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 sm:flex-1"
        >
          <Globe className="h-3.5 w-3.5" />
          Kunjungi Landing Page Live
        </Link>

        <Link
          href={`/toko/${store.slug}/produk`}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-input bg-background px-4 py-2.5 text-center text-xs font-bold text-foreground transition-colors hover:bg-muted sm:w-auto"
        >
          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
          Lihat Semua Produk
        </Link>
      </div>
    </div>
  );
}
