"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Info, FileDown, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { useCatalogInfo } from "@/components/public/catalog-info-context";
import { useCart } from "@/components/public/cart-context";
import Image from "next/image";

interface HeaderProps {
  brandName: string;
  storeSlug?: string;
  brandLogoUrl?: string | null;
}

export function PublicHeader({ brandName, storeSlug, brandLogoUrl }: HeaderProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isBannerOpen, toggleBanner } = useCatalogInfo();
  const { totalItems, setIsCartOpen } = useCart();

  return (
    <header className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur-md shadow-xs">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <a href={storeSlug ? `/toko/${storeSlug}` : "/"} className="flex items-center gap-2 text-base sm:text-lg font-bold tracking-tight shrink min-w-0">
          {brandLogoUrl && (
            <div className="relative h-7 w-7 sm:h-9 sm:w-9 overflow-hidden rounded shrink-0">
              <Image src={brandLogoUrl} alt={brandName} fill className="object-contain" unoptimized />
            </div>
          )}
          <span className="truncate max-w-[100px] xs:max-w-[160px] sm:max-w-none">{brandName}</span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          {[
            { href: storeSlug ? `/toko/${storeSlug}` : "/", label: "Beranda" },
            { href: storeSlug ? `/toko/${storeSlug}/produk` : "/produk", label: "Produk" },
            { href: storeSlug ? `/toko/${storeSlug}/kategori` : "/kategori", label: "Kategori" },
          ].map((item) => {
            const isBeranda = item.label === "Beranda";
            const Comp = isBeranda ? "a" : Link;
            return (
              <Comp
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
                    ? "text-primary"
                    : "text-muted-foreground",
                )}
              >
                {item.label}
              </Comp>
            );
          })}
        </nav>

        {/* Desktop actions */}
        <div className="hidden items-center gap-2.5 md:flex">
          {storeSlug && (
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex h-9 items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-3 text-xs font-bold text-primary hover:bg-primary/20 transition-all shadow-xs"
              title="Buka Keranjang Pesanan"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Keranjang</span>
              {totalItems > 0 && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-600 px-1 text-[10px] font-bold text-white font-mono">
                  {totalItems}
                </span>
              )}
            </button>
          )}

          {storeSlug && (
            <a
              href={`/toko/${storeSlug}/katalog-pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-muted border border-border px-3 text-xs font-semibold text-foreground transition-colors hover:bg-muted/80 shadow-xs"
              title="Unduh atau Cetak Katalog Produk PDF"
            >
              <FileDown className="h-4 w-4" />
              Download Katalog PDF
            </a>
          )}
          <button
            onClick={toggleBanner}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg border transition-all shadow-sm",
              isBannerOpen
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-border/80 bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
            title={isBannerOpen ? "Tutup Info Banner" : "Tampilkan Info Banner"}
            aria-label="Toggle Banner Info"
          >
            <Info className="h-4 w-4" />
          </button>
          <ThemeToggle />
        </div>

        {/* Mobile toggle */}
        <div className="flex items-center gap-1.5 md:hidden shrink-0">
          {storeSlug && (
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex h-8 items-center gap-1 rounded-lg border border-primary/30 bg-primary/10 px-2 sm:px-2.5 text-[11px] font-bold text-primary hover:bg-primary/20 transition-all shadow-xs"
              title="Buka Keranjang Pesanan"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              <span className="hidden xs:inline">Keranjang</span>
              {totalItems > 0 && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-600 px-1 text-[10px] font-bold text-white font-mono">
                  {totalItems}
                </span>
              )}
            </button>
          )}

          <button
            onClick={toggleBanner}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg border transition-all shadow-sm",
              isBannerOpen
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-border/80 bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
            title="Toggle Banner Info"
            aria-label="Toggle Banner Info"
          >
            <Info className="h-3.5 w-3.5" />
          </button>
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-8 w-8 items-center justify-center rounded-md"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t bg-background md:hidden">
          <nav className="container flex flex-col gap-1 py-4">
            {[
              { href: storeSlug ? `/toko/${storeSlug}` : "/", label: "Beranda" },
              { href: storeSlug ? `/toko/${storeSlug}/produk` : "/produk", label: "Produk" },
              { href: storeSlug ? `/toko/${storeSlug}/kategori` : "/kategori", label: "Kategori" },
            ].map((item) => {
              const isBeranda = item.label === "Beranda";
              const Comp = isBeranda ? "a" : Link;
              return (
                <Comp
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted",
                    pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
                      ? "bg-muted text-primary"
                      : "text-muted-foreground",
                  )}
                >
                  {item.label}
                </Comp>
              );
            })}

            {storeSlug && (
              <a
                href={`/toko/${storeSlug}/katalog-pdf`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-primary bg-primary/10 transition-colors mt-2"
              >
                <FileDown className="h-4 w-4" />
                Download Katalog PDF
              </a>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
