"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, X, Command, ArrowRight, Package } from "lucide-react";
import { publicUrl } from "@/lib/storage-url";

interface SearchProduct {
  id: string;
  name: string;
  slug: string;
  summary: string | null;
  price: number | null;
  main_image_path: string | null;
  category_name?: string;
}

export function LiveSearch({
  storeSlug,
  products = [],
}: {
  storeSlug: string;
  products?: SearchProduct[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Shortcut Ctrl + K or / to open live search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const filteredProducts = query.trim()
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.summary?.toLowerCase().includes(query.toLowerCase()) ||
          p.category_name?.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <>
      {/* Search Bar Input Trigger */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-between gap-3 w-full max-w-md h-11 px-4 rounded-xl border border-border/80 bg-background/80 hover:bg-muted/50 text-muted-foreground text-xs transition-colors shadow-xs"
      >
        <span className="flex items-center gap-2">
          <Search className="h-4 w-4 text-primary" />
          <span>Cari produk di toko ini...</span>
        </span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">
          <Command className="h-3 w-3" /> K
        </kbd>
      </button>

      {/* Live Search Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm p-4 pt-16 sm:pt-24 animate-in fade-in duration-150">
          <div className="w-full max-w-xl rounded-2xl border border-border bg-card shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-150">
            {/* Input Header */}
            <div className="flex items-center gap-3 border-b px-4 py-3 bg-muted/30">
              <Search className="h-5 w-5 text-primary shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ketik nama produk, kategori, atau spesifikasi..."
                className="w-full bg-transparent text-sm text-foreground focus:outline-none placeholder:text-muted-foreground"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="text-muted-foreground hover:text-foreground p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-xs font-mono bg-muted hover:bg-muted/80 text-muted-foreground px-2 py-1 rounded"
              >
                ESC
              </button>
            </div>

            {/* Live Results */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {!query.trim() ? (
                <div className="py-8 text-center text-xs text-muted-foreground space-y-1">
                  <Package className="h-8 w-8 mx-auto text-muted-foreground/60" />
                  <p className="font-semibold">Live Instant Search Katalog</p>
                  <p>Ketik kata kunci untuk mencari produk secara langsung.</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground space-y-1">
                  <p className="font-semibold text-foreground">Produk tidak ditemukan</p>
                  <p>Tidak ada produk yang cocok dengan kata kunci &quot;{query}&quot;.</p>
                </div>
              ) : (
                filteredProducts.map((product) => {
                  const imgUrl = publicUrl("product-images", product.main_image_path);
                  return (
                    <Link
                      key={product.id}
                      href={`/toko/${storeSlug}/produk/${product.slug}`}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-between gap-3 p-3 rounded-xl border border-border/60 bg-muted/20 hover:bg-primary/5 hover:border-primary/40 transition-colors group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-12 w-12 rounded-lg bg-muted overflow-hidden shrink-0 border border-border">
                          {imgUrl ? (
                            <img
                              src={imgUrl}
                              alt={product.name}
                              className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-[9px] text-muted-foreground">
                              No Pic
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-semibold text-xs text-foreground truncate group-hover:text-primary transition-colors">
                            {product.name}
                          </h4>
                          {product.summary && (
                            <p className="text-[11px] text-muted-foreground truncate">
                              {product.summary}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0 flex items-center gap-2">
                        {product.price && (
                          <span className="font-mono font-bold text-xs text-primary">
                            {formatRupiah(product.price)}
                          </span>
                        )}
                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </Link>
                  );
                })
              )}
            </div>

            <div className="border-t bg-muted/40 px-4 py-2 text-[11px] text-muted-foreground flex justify-between items-center font-mono">
              <span>Menampilkan {filteredProducts.length} hasil</span>
              <span>Tekan Esc untuk menutup</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
