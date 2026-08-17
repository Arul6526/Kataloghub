"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useCallback } from "react";
import { Search } from "lucide-react";

interface Props {
  currentSearch: string;
  currentCategory: string;
  currentTag: string;
  categories: { slug: string; name: string }[];
  storeSlug: string;
}

export function ProductFilters({ currentSearch, currentCategory, currentTag, categories, storeSlug }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(currentSearch);

  const applyFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      router.push(`/toko/${storeSlug}/produk?${params.toString()}`);
    },
    [router, searchParams, storeSlug],
  );

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      applyFilter("q", query.trim());
    },
    [applyFilter, query],
  );

  return (
    <div className="flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row sm:items-center">
      <form onSubmit={handleSearch} className="relative w-full sm:w-64">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
        <input
          type="text"
          placeholder="Cari nama atau deskripsi produk..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-10 w-full rounded-xl border border-border/80 bg-card/90 backdrop-blur-md pl-9 pr-4 text-xs font-medium outline-none transition-all placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm"
        />
      </form>
      <select
        value={currentCategory}
        onChange={(e) => applyFilter("kategori", e.target.value)}
        className="h-10 w-full rounded-xl border border-border/80 bg-card/90 backdrop-blur-md px-3 text-xs font-medium outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm sm:w-44 cursor-pointer"
      >
        <option value="">Semua Kategori</option>
        {categories.map((c) => (
          <option key={c.slug} value={c.slug}>
            {c.name}
          </option>
        ))}
      </select>
    </div>
  );
}
