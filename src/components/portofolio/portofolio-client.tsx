"use client";

import React, { useState, useMemo } from "react";
import { Search, Store, CheckCircle2, SlidersHorizontal, Package } from "lucide-react";
import { StoreShowcaseCard, ShowcaseStore } from "./store-showcase-card";

interface PortofolioClientProps {
  initialShowcases: ShowcaseStore[];
}

export function PortofolioClient({ initialShowcases }: PortofolioClientProps) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Extract unique category tags
  const categories = useMemo(() => {
    const set = new Set<string>();
    initialShowcases.forEach((store) => {
      if (store.categoryTag) set.add(store.categoryTag);
    });
    return Array.from(set);
  }, [initialShowcases]);

  // Filter showcases based on search query and category
  const filteredShowcases = useMemo(() => {
    return initialShowcases.filter((store) => {
      const matchesSearch =
        store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store.categoryTag.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategory === "all" || store.categoryTag === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [initialShowcases, searchQuery, selectedCategory]);

  return (
    <div className="space-y-8">
      {/* HEADER & FILTER BAR */}
      <div className="flex flex-col gap-5 border-b border-border pb-6">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-space text-xl font-bold tracking-tight sm:text-2xl">
              Daftar Preview Landing Page Toko ({filteredShowcases.length})
            </h2>
            <p className="text-xs text-muted-foreground sm:text-sm">
              Bandingkan cara toko nyata menyusun produk, membangun kepercayaan, dan menerima order
              langsung.
            </p>
          </div>

          {/* Business-friendly Verified Badge (Replaces developer jargon) */}
          <div className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            <span>Toko Aktif Terverifikasi</span>
          </div>
        </div>

        {/* SEARCH & CATEGORY FILTER CONTROLS */}
        <div className="flex flex-col items-stretch justify-between gap-3 md:flex-row md:items-center">
          {/* Search Input Bar */}
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama toko, spesifikasi produk..."
              className="w-full rounded-xl border border-input bg-background py-2 pl-10 pr-4 text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 sm:text-sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto py-0.5 text-xs">
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className={`whitespace-nowrap rounded-lg border px-3 py-1.5 font-semibold transition-all ${
                selectedCategory === "all"
                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                  : "border-border bg-background text-muted-foreground hover:bg-muted"
              }`}
            >
              Semua Kategori ({initialShowcases.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap rounded-lg border px-3 py-1.5 font-semibold transition-all ${
                  selectedCategory === cat
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "border-border bg-background text-muted-foreground hover:bg-muted"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SHOWCASE CARDS GRID */}
      {filteredShowcases.length > 0 ? (
        <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-2">
          {filteredShowcases.map((store) => (
            <StoreShowcaseCard key={store.id} store={store} />
          ))}
        </div>
      ) : (
        /* Empty Search State */
        <div className="space-y-3 rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Store className="h-6 w-6" />
          </div>
          <h3 className="font-space text-lg font-bold">Toko Tidak Ditemukan</h3>
          <p className="mx-auto max-w-sm text-xs text-muted-foreground">
            Tidak ada toko yang cocok dengan kata kunci &quot;{searchQuery}&quot;. Coba gunakan kata
            kunci lain atau pilih kategori &quot;Semua Kategori&quot;.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary/90"
          >
            Reset Filter
          </button>
        </div>
      )}
    </div>
  );
}
