"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Phone, ShieldCheck, Truck, Award, ChevronLeft, ChevronRight } from "lucide-react";
import { LiveSearch } from "@/components/public/live-search";
import { publicUrl } from "@/lib/storage-url";

export interface HeroBannerItem {
  id: "banner_1" | "banner_2";
  image_path: string | null;
  title?: string;
  subtitle?: string;
  cta_label?: string;
  cta_url?: string;
  is_active: boolean;
}

interface HeroSliderProps {
  heroHeading: string;
  heroSubheading: string;
  storeSlug: string;
  basePath: string;
  featuredProducts: any[];
  waUrl: string | null;
  brandName: string;
  brandTagline: string;
  banners: HeroBannerItem[];
}

export function HeroSlider({
  heroHeading,
  heroSubheading,
  storeSlug,
  basePath,
  featuredProducts,
  waUrl,
  brandName,
  brandTagline,
  banners,
}: HeroSliderProps) {
  // Only active banners with valid image paths
  const activeBanners = banners.filter((b) => b.is_active && b.image_path);
  const totalSlides = 1 + activeBanners.length; // Slide 0 = Default Hero, Slide 1+ = Banners

  const [currentSlide, setCurrentSlide] = useState<number>(0);

  // Auto-play timer if banners are active
  useEffect(() => {
    if (totalSlides <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 6000);

    return () => clearInterval(interval);
  }, [totalSlides]);

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  return (
    <section className="relative overflow-hidden border-b bg-gradient-to-b from-background via-muted/10 to-muted/30 py-10 sm:py-16">
      
      {/* Blueprint Paper Grid Texture */}
      <div className="absolute inset-0 bg-paper-grid opacity-50 pointer-events-none" />
      <div className="absolute top-0 right-1/4 h-80 w-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container relative z-10">
        
        {/* SLIDE CONTENT RENDERER */}
        {currentSlide === 0 ? (
          /* SLIDE 0: DEFAULT HERO SECTION */
          <div className="grid gap-8 lg:grid-cols-12 items-center min-h-[420px] animate-in fade-in duration-300">
            <div className="lg:col-span-7 flex flex-col gap-6">
              
              <div className="inline-flex items-center gap-2 border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 rounded-full text-xs font-semibold text-emerald-600 dark:text-emerald-400 w-max shadow-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span>Toko Resmi Terverifikasi • Pesan Otomatis via WhatsApp</span>
              </div>

              <h1 className="font-space text-3xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl leading-[1.12]">
                {heroHeading}
              </h1>

              <p className="max-w-2xl text-sm sm:text-lg text-muted-foreground leading-relaxed font-medium">
                {heroSubheading}
              </p>

              {/* Live Search Bar */}
              <div className="pt-1 max-w-xl">
                <LiveSearch storeSlug={storeSlug} products={featuredProducts} />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link
                  href={`${basePath}/produk`}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-7 text-sm font-bold text-primary-foreground shadow-md transition-all hover:scale-[1.02] hover:bg-primary/90"
                >
                  Jelajahi Katalog Produk
                  <ArrowRight className="h-4 w-4" />
                </Link>

                {waUrl && (
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-7 text-sm font-bold text-emerald-600 dark:text-emerald-400 shadow-sm transition-all hover:bg-emerald-500/20"
                  >
                    <Phone className="h-4 w-4" />
                    Chat WhatsApp Toko
                  </a>
                )}
              </div>

              {/* Quick Trust Badges */}
              <div className="pt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-semibold text-muted-foreground border-t border-border/60">
                <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-primary shrink-0" /> 100% Kualitas Terjamin</span>
                <span className="flex items-center gap-1.5"><Truck className="h-4 w-4 text-emerald-600 shrink-0" /> Siap Kirim Seluruh Indonesia</span>
                <span className="flex items-center gap-1.5"><Award className="h-4 w-4 text-amber-500 shrink-0" /> Respon WA Cepat</span>
              </div>
            </div>

            {/* Store Card Preview */}
            <div className="lg:col-span-5 relative hidden lg:block">
              <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-xl p-6 shadow-xl space-y-4 ring-1 ring-border/50">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-space text-xs font-bold text-foreground uppercase tracking-wider">
                      {brandName}
                    </span>
                  </div>
                  <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded">Etalase Online</span>
                </div>

                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {brandTagline || "Solusi belanja kebutuhan Anda langsung dari genggaman."}
                  </p>

                  <div className="p-3.5 rounded-xl border border-border/80 bg-muted/30 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-muted-foreground font-mono uppercase">Produk Unggulan</p>
                      <p className="text-xs font-bold text-foreground">{featuredProducts.length} Item Siap Order</p>
                    </div>
                    <Link href={`${basePath}/produk`} className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                      Lihat Katalog
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* SLIDE 1 & 2: PROMOTIONAL PROMO BANNERS */
          (() => {
            const banner = activeBanners[currentSlide - 1];
            const imgUrl = publicUrl("landing-media", banner.image_path);

            return (
              <div className="relative rounded-2xl border border-border bg-card shadow-xl overflow-hidden min-h-[380px] sm:min-h-[420px] flex items-center animate-in fade-in duration-300">
                
                {/* Banner Image Background */}
                {imgUrl && (
                  <div className="absolute inset-0 z-0">
                    <img
                      src={imgUrl}
                      alt={banner.title || "Promo Toko"}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/70 to-transparent" />
                  </div>
                )}

                {/* Banner Content Overlay */}
                <div className="relative z-10 p-6 sm:p-12 max-w-xl space-y-4 text-white">
                  <span className="inline-flex items-center gap-1.5 bg-primary text-white font-bold px-3 py-1 rounded-full text-xs shadow-md uppercase tracking-wider">
                    Promo Toko
                  </span>

                  <h2 className="font-space text-2xl sm:text-4xl font-extrabold text-white leading-tight">
                    {banner.title || brandName}
                  </h2>

                  {banner.subtitle && (
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                      {banner.subtitle}
                    </p>
                  )}

                  <div className="pt-2 flex flex-wrap gap-3">
                    {banner.cta_label ? (
                      <Link
                        href={banner.cta_url || `${basePath}/produk`}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-xs sm:text-sm font-bold text-white shadow-lg hover:scale-105 transition-all"
                      >
                        {banner.cta_label} <ArrowRight className="h-4 w-4" />
                      </Link>
                    ) : (
                      <Link
                        href={`${basePath}/produk`}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-xs sm:text-sm font-bold text-white shadow-lg hover:scale-105 transition-all"
                      >
                        Lihat Promo <ArrowRight className="h-4 w-4" />
                      </Link>
                    )}

                    {waUrl && (
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 backdrop-blur px-6 text-xs sm:text-sm font-bold text-white hover:bg-white/20 transition-all"
                      >
                        <Phone className="h-4 w-4" /> Tanya via WA
                      </a>
                    )}
                  </div>
                </div>

              </div>
            );
          })()
        )}

        {/* CAROUSEL NAVIGATION DOTS & PREV/NEXT ARROWS */}
        {totalSlides > 1 && (
          <div className="pt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {Array.from({ length: totalSlides }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-2.5 rounded-full transition-all ${
                    currentSlide === idx ? "w-8 bg-primary" : "w-2.5 bg-muted-foreground/30 hover:bg-muted-foreground/60"
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                className="p-2 rounded-xl border border-border bg-card text-foreground hover:bg-muted transition-colors shadow-sm"
                aria-label="Previous Slide"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={handleNext}
                className="p-2 rounded-xl border border-border bg-card text-foreground hover:bg-muted transition-colors shadow-sm"
                aria-label="Next Slide"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
