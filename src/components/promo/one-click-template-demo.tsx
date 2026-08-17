"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Wand2, 
  CheckCircle2, 
  MousePointer2, 
  Package, 
  Layers, 
  Sparkles, 
  Store, 
  ChevronRight,
  ChevronLeft,
  Smartphone,
  ArrowRight
} from "lucide-react";
import Image from "next/image";

const DEMO_PRESETS = [
  { id: "kuliner", label: "Kuliner & Makanan", icon: "🍽️", count: "4 Produk + 4 Kategori" },
  { id: "atk", label: "ATK & Fotocopy", icon: "✏️", count: "4 Produk + 4 Kategori" },
  { id: "fashion", label: "Fashion & Batik", icon: "👕", count: "4 Produk + 4 Kategori" },
  { id: "sembako", label: "Kelontong & Sembako", icon: "🏪", count: "2 Produk + 3 Kategori" },
];

const SAMPLE_KULINER_PRODUCTS = [
  { name: "Paket Nasi Liwet Komplit", price: "Rp 28.000", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&q=80&auto=format" },
  { name: "Snack Box Rapat (3 Kue)", price: "Rp 16.000", image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&q=80&auto=format" },
  { name: "Es Teh Manis Jumbo", price: "Rp 10.000", image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=300&q=80&auto=format" },
  { name: "Hampers Kue Kering Toples", price: "Rp 175.000", image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=300&q=80&auto=format" },
];

export function OneClickTemplateDemo() {
  // NO AUTOPLAY by default per user request
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [selectedIndustry, setSelectedIndustry] = useState<string>("kuliner");

  // Step cycle timer (only runs when isPlaying is TRUE)
  useEffect(() => {
    if (!isPlaying) return;

    const timer1 = setTimeout(() => setCurrentStep(1), 2000); // Step 1: Select Preset
    const timer2 = setTimeout(() => setCurrentStep(2), 4000); // Step 2: Seeding process
    const timer3 = setTimeout(() => setCurrentStep(3), 6200); // Step 3: Complete instant active store
    const timer4 = setTimeout(() => {
      // Loop back or pause
      setCurrentStep(1);
    }, 11000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [currentStep, isPlaying]);

  const handleStartPlay = () => {
    setIsPlaying(true);
    setCurrentStep(1);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
  };

  return (
    <section className="py-12 sm:py-16 bg-card border-b border-border relative overflow-hidden bg-paper-dots">
      <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/95 to-background pointer-events-none" />

      <div className="container relative z-10 max-w-5xl mx-auto px-4">
        
        {/* Header Title */}
        <div className="max-w-2xl mx-auto text-center mb-8 space-y-2">
          <div className="inline-flex items-center gap-2 border border-primary/30 bg-primary/10 px-3.5 py-1 rounded-full text-xs font-semibold text-primary shadow-sm w-max mx-auto">
            <Wand2 className="h-4 w-4" />
            <span>Simulasi Fitur UMKM 1-Klik Setup</span>
          </div>

          <h2 className="font-space text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
            Lihat Cara Kerja <span className="text-primary">Template Toko Instant</span>
          </h2>

          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Pengguna baru tidak perlu dari 0. Tekan tombol Play Demo untuk melihat bagaimana etalase toko Anda langsung aktif & siap huni dalam hitungan detik!
          </p>
        </div>

        {/* Step Indicator Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-6">
          {[
            { num: 1, label: "1. Pilih Industri UMKM" },
            { num: 2, label: "2. Klik Terapkan Template" },
            { num: 3, label: "3. Toko Langsung Siap & Berisi Produk!" },
          ].map((s) => {
            const isActive = currentStep === s.num;
            return (
              <button
                key={s.num}
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentStep(s.num);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                  isActive
                    ? "bg-primary text-primary-foreground border-primary shadow-sm scale-105"
                    : "bg-background/80 border-border text-muted-foreground hover:border-primary/40"
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </div>

        {/* DEMO DISPLAY FRAME */}
        <div className="relative rounded-2xl border border-border bg-background/95 shadow-xl overflow-hidden backdrop-blur-xl">
          
          {/* Mockup Header Bar */}
          <div className="h-10 border-b border-border bg-muted/60 flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
                <div className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
              </div>
              <span className="text-xs font-bold text-foreground font-space ml-2">
                Setup Toko Siap Pakai 1-Klik
              </span>
            </div>

            <div className="flex items-center gap-2">
              {isPlaying ? (
                <button
                  onClick={handlePause}
                  className="px-2.5 py-1 rounded bg-muted hover:bg-muted/80 text-[11px] font-bold text-foreground flex items-center gap-1 border border-border"
                >
                  <Pause className="h-3 w-3 text-amber-500" /> Jeda Demo
                </button>
              ) : (
                <button
                  onClick={handleStartPlay}
                  className="px-2.5 py-1 rounded bg-primary text-primary-foreground text-[11px] font-bold flex items-center gap-1 shadow-sm hover:bg-primary/90"
                >
                  <Play className="h-3 w-3 fill-current" /> Putar Demo
                </button>
              )}
              <button
                onClick={handleReset}
                className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted"
                title="Reset Demo"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* STEP CONTENT CONTAINER */}
          <div className="p-4 sm:p-6 min-h-[380px] flex flex-col justify-between relative">
            
            {/* OVERLAY POSTER COVER (WHEN NOT STARTED / STEP 0) */}
            {currentStep === 0 && (
              <div className="absolute inset-0 z-20 bg-background/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4">
                <div className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary shadow-lg animate-pulse">
                  <Wand2 className="h-8 w-8" />
                </div>

                <div className="max-w-md space-y-1.5">
                  <h3 className="font-space text-lg sm:text-xl font-bold text-foreground">
                    Demo Interaktif Fitur Template 1-Klik
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Lihat bagaimana toko UMKM yang tadinya kosong langsung terisi contoh produk sampel & kategori siap huni dalam 5 detik!
                  </p>
                </div>

                <button
                  onClick={handleStartPlay}
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-bold px-8 py-3.5 rounded-xl shadow-lg hover:scale-105 hover:bg-primary/90 transition-all text-sm group"
                >
                  <Play className="h-5 w-5 fill-current group-hover:scale-110 transition-transform" />
                  Play Demo 1-Klik Setup
                </button>
              </div>
            )}

            {/* STEP 1: PRESET SELECTION SCREEN */}
            {(currentStep === 1 || currentStep === 0) && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <div>
                    <h4 className="font-space text-sm font-bold text-foreground flex items-center gap-2">
                      Langkah 1: Pilih Bidang Usaha UMKM Anda
                    </h4>
                    <p className="text-xs text-muted-foreground">Pilih jenis toko yang paling sesuai untuk seeding instan</p>
                  </div>
                  <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-bold">
                    Pilih 1 dari 8 Industri
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {DEMO_PRESETS.map((p) => {
                    const isSelected = selectedIndustry === p.id;
                    return (
                      <div
                        key={p.id}
                        onClick={() => setSelectedIndustry(p.id)}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                          isSelected
                            ? "border-primary bg-primary/10 ring-2 ring-primary/30 shadow-sm"
                            : "border-border bg-card opacity-70"
                        }`}
                      >
                        <span className="text-xl">{p.icon}</span>
                        <h5 className="font-bold text-xs mt-1 text-foreground">{p.label}</h5>
                        <span className="text-[10px] text-muted-foreground block mt-0.5">{p.count}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Simulated Cursor Effect */}
                {isPlaying && currentStep === 1 && (
                  <motion.div
                    initial={{ x: 200, y: 100, opacity: 0 }}
                    animate={{ x: 80, y: 60, opacity: 1 }}
                    transition={{ duration: 1.2 }}
                    className="absolute z-10 pointer-events-none text-primary flex items-center gap-1 bg-primary/90 text-primary-foreground px-2 py-1 rounded text-[10px] font-bold shadow-lg"
                  >
                    <MousePointer2 className="h-4 w-4 fill-current" /> Klik Pilih Kuliner
                  </motion.div>
                )}
              </div>
            )}

            {/* STEP 2: APPLYING TEMPLATE / SEEDING IN PROGRESS */}
            {currentStep === 2 && (
              <div className="min-h-[220px] flex flex-col items-center justify-center space-y-4 animate-in zoom-in-95 duration-300">
                <div className="relative">
                  <div className="h-16 w-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-xl">
                    <Sparkles className="h-8 w-8 animate-spin" />
                  </div>
                </div>

                <div className="text-center space-y-1">
                  <h4 className="font-space text-base font-bold text-foreground">
                    Menerapkan Template Kuliner & Makanan...
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Menyimpan slogan brand, 4 kategori toko, & 4 produk sampel ke database toko Anda
                  </p>
                </div>
              </div>
            )}

            {/* STEP 3: INSTANT ACTIVE STORE RESULT */}
            {currentStep === 3 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                    <div>
                      <h4 className="font-space text-xs sm:text-sm font-bold text-emerald-800 dark:text-emerald-300">
                        🎉 Toko Siap Pakai Berhasil Disetup! (4 Produk Sampel Siap Edit)
                      </h4>
                      <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                        Etalase toko Anda kini langsung aktif lengkap dengan foto produk & format order WA!
                      </p>
                    </div>
                  </div>
                </div>

                {/* Instant Storefront Products Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {SAMPLE_KULINER_PRODUCTS.map((prod, i) => (
                    <div key={i} className="rounded-xl border border-border bg-card p-2 flex flex-col justify-between space-y-2 shadow-sm">
                      <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-border/40">
                        <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                        <span className="absolute top-1 left-1 text-[9px] bg-amber-500 text-white font-bold px-1.5 py-0.5 rounded shadow">
                          Sampel / Edit
                        </span>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground truncate">{prod.name}</p>
                        <p className="text-xs font-bold text-emerald-600">{prod.price}</p>
                      </div>
                      <span className="w-full py-1 bg-emerald-600 text-white text-[10px] font-bold rounded flex items-center justify-center gap-1">
                        <Smartphone className="h-3 w-3" /> Order WA
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* DEMO CONTROLS FOOTER BAR */}
            <div className="pt-4 border-t border-border/80 flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Store className="h-4 w-4 text-primary" />
                <strong className="text-foreground">Simulasi 1-Klik Setup</strong>
              </span>

              <div className="flex items-center gap-2">
                {currentStep > 0 && (
                  <button
                    onClick={() => setCurrentStep((prev) => (prev > 1 ? prev - 1 : 1))}
                    className="p-1 rounded border border-border hover:bg-muted text-foreground flex items-center gap-1 text-[11px]"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" /> Prev
                  </button>
                )}

                {currentStep < 3 && (
                  <button
                    onClick={() => setCurrentStep((prev) => prev + 1)}
                    className="p-1 px-2 rounded bg-primary text-primary-foreground font-bold flex items-center gap-1 text-[11px]"
                  >
                    Next <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
