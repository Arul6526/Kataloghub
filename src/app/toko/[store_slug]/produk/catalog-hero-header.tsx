"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X, Sparkles, Clock } from "lucide-react";
import { useCatalogInfo } from "@/components/public/catalog-info-context";
import { publicUrl } from "@/lib/storage-url";

interface CatalogHeroHeaderProps {
  total: number;
  customTitle?: string | null;
  customMessage?: string | null;
  customImagePath?: string | null;
  isEnabled?: boolean;
}

export function CatalogHeroHeader({
  total,
  customTitle,
  customMessage,
  customImagePath,
  isEnabled = true,
}: CatalogHeroHeaderProps) {
  const { isBannerOpen, setIsBannerOpen } = useCatalogInfo();
  const [timeLeft, setTimeLeft] = useState<number>(4);

  // Auto-close popup timer (4 seconds)
  useEffect(() => {
    if (!isEnabled || !isBannerOpen) return;

    setTimeLeft(4);
    const interval = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    const timer = setTimeout(() => {
      setIsBannerOpen(false);
    }, 4000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [isEnabled, isBannerOpen, setIsBannerOpen]);

  if (!isEnabled || !isBannerOpen) return null;

  const displayTitle = customTitle?.trim() || "Eksplorasi Katalog Produk";
  const displayMessage =
    customMessage?.trim() ||
    `Menampilkan ${total} produk berkualitas. Temukan spesifikasi & pesankan langsung via WhatsApp.`;
  const bannerImageUrl = publicUrl("landing-media", customImagePath);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-md p-4 animate-in fade-in duration-300">
      {/* Modal Backdrop click to close */}
      <div className="absolute inset-0" onClick={() => setIsBannerOpen(false)} />

      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-border/80 bg-card shadow-2xl transition-all animate-in zoom-in-95 duration-300">
        
        {/* Animated Progress Bar at Top (4 Seconds) */}
        <div className="h-1.5 w-full bg-muted overflow-hidden">
          <div className="h-full bg-primary transition-all duration-1000 ease-linear animate-pulse" style={{ width: `${(timeLeft / 4) * 100}%` }} />
        </div>

        {/* Close Button X */}
        <button
          onClick={() => setIsBannerOpen(false)}
          className="absolute right-3 top-3.5 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 text-muted-foreground backdrop-blur-md transition-colors hover:bg-muted hover:text-foreground shadow-md"
          title="Tutup (Esc)"
          aria-label="Tutup Popup"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Foto Banner Image (if uploaded) */}
        {bannerImageUrl && (
          <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
            <Image
              src={bannerImageUrl}
              alt={displayTitle}
              fill
              className="object-cover"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
          </div>
        )}

        {/* Content Body */}
        <div className="space-y-3 p-5 sm:p-6">
          <div className="flex items-center justify-between gap-2">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Pesan Penjual
            </div>

            <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-medium">
              <Clock className="h-3 w-3 text-primary animate-spin" />
              Auto-close dalam {timeLeft}s
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
            {displayTitle}
          </h2>

          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
            {displayMessage}
          </p>

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => setIsBannerOpen(false)}
              className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2 text-xs font-bold text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:scale-[1.02]"
            >
              Tutup Pengumuman
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
