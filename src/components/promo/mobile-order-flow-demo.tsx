"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageCircle, 
  ShoppingBag, 
  CheckCheck, 
  RotateCcw, 
  Play, 
  Pause, 
  Smartphone, 
  Sparkles, 
  MousePointer2,
  CheckCircle2,
  Send,
  BellRing
} from "lucide-react";
import Image from "next/image";

export function MobileOrderFlowDemo() {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [userClicked, setUserClicked] = useState<boolean>(false);

  // Animation cycle loop (approx 7.5 seconds per full cycle)
  useEffect(() => {
    if (!isPlaying) return;

    const timer1 = setTimeout(() => setCurrentStep(1), 1800); // Hand moves & clicks
    const timer2 = setTimeout(() => setCurrentStep(2), 3600); // Signal transfers & WA receives
    const timer3 = setTimeout(() => {
      setCurrentStep(0);
      setUserClicked(false);
    }, 7500); // Reset loop

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [currentStep, isPlaying]);

  const handleManualTrigger = () => {
    setUserClicked(true);
    setCurrentStep(1);
    setTimeout(() => setCurrentStep(2), 1200);
  };

  const handleNextStep = () => {
    setIsPlaying(false);
    setCurrentStep((prev) => (prev < 2 ? prev + 1 : 0));
  };

  const handlePrevStep = () => {
    setIsPlaying(false);
    setCurrentStep((prev) => (prev > 0 ? prev - 1 : 2));
  };

  const handleReset = () => {
    setCurrentStep(0);
    setUserClicked(false);
    setIsPlaying(true);
  };

  return (
    <section className="py-14 lg:py-20 bg-muted/30 border-y border-border relative overflow-hidden">
      {/* Background Ambient Glow & Blueprint Pattern */}
      <div className="absolute inset-0 bg-paper-grid opacity-40 pointer-events-none" />
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container relative z-10 max-w-6xl mx-auto px-3 sm:px-4">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-8 sm:mb-10 space-y-2.5 sm:space-y-3">
          <div className="inline-flex items-center gap-2 border border-primary/30 bg-primary/10 px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold text-primary shadow-sm max-w-full flex-wrap">
            <Sparkles className="h-3.5 w-3.5 shrink-0" />
            <span>Simulasi Real-Time Alur Transaksi</span>
          </div>
          
          <h2 className="font-space text-xl sm:text-4xl font-bold tracking-tight text-foreground">
            Dari <span className="text-primary">Klik Katalog HP</span> Langsung Terhubung ke <span className="text-emerald-600 dark:text-emerald-400">WhatsApp Owner</span>
          </h2>
          
          <p className="text-xs sm:text-base text-muted-foreground leading-relaxed">
            Tanpa perlu isi form rumit atau daftar akun. Calon pembeli Anda cukup milih produk dan pesanan langsung terformat rapi masuk ke WhatsApp HP Anda.
          </p>
        </div>

        {/* Step Timeline Indicator Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mb-6 sm:mb-8">
          {[
            { num: 1, title: "Pembeli Buka Katalog HP", icon: Smartphone },
            { num: 2, title: "Tangan Klik 'Order via WA'", icon: MousePointer2 },
            { num: 3, title: "Pesan Terkirim ke WA Owner", icon: MessageCircle },
          ].map((step, idx) => {
            const isActive = currentStep === idx;
            const isCompleted = currentStep > idx;

            return (
              <button
                key={idx}
                onClick={() => {
                  setCurrentStep(idx);
                  setIsPlaying(false);
                }}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold transition-all duration-300 border ${
                  isActive
                    ? "bg-primary text-primary-foreground border-primary shadow-md scale-105"
                    : isCompleted
                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                    : "bg-background text-muted-foreground border-border hover:border-muted-foreground/40"
                }`}
              >
                <span className={`flex items-center justify-center h-4 sm:h-5 w-4 sm:w-5 rounded-full text-[9px] sm:text-[10px] font-bold ${
                  isActive
                    ? "bg-primary-foreground text-primary"
                    : isCompleted
                    ? "bg-emerald-500 text-white"
                    : "bg-muted text-muted-foreground"
                }`}>
                  {isCompleted ? "✓" : step.num}
                </span>
                <span className="hidden sm:inline">{step.title}</span>
                <span className="sm:hidden">{step.title.split(" ")[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Animation Main Showcase Stage */}
        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center justify-center">

          {/* LEFT PHONE MOCKUP: BUYER CATALOG VIEW */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-[285px] xs:max-w-[310px] sm:max-w-[330px] rounded-[30px] sm:rounded-[36px] border-[5px] sm:border-[7px] border-slate-900 bg-slate-950 p-1.5 sm:p-2 shadow-2xl ring-1 ring-slate-800">
              
              {/* Phone Speaker & Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 h-3.5 sm:h-4 w-24 sm:w-28 bg-slate-900 rounded-b-xl z-30 flex items-center justify-center">
                <div className="h-1 sm:h-1.5 w-8 sm:w-10 bg-slate-800 rounded-full" />
              </div>

              {/* Inner Screen */}
              <div className="relative rounded-[22px] sm:rounded-[28px] bg-background border border-border overflow-hidden h-[470px] sm:h-[510px] flex flex-col">
                
                {/* Status Bar */}
                <div className="pt-2 px-3 sm:px-4 pb-1 flex justify-between items-center text-[10px] font-semibold text-muted-foreground border-b border-border/40 bg-muted/30">
                  <span>09:41</span>
                  <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-mono">Mobile View</span>
                  <div className="flex gap-1 items-center">
                    <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                    <span>5G</span>
                  </div>
                </div>

                {/* Mobile App Header */}
                <div className="p-2.5 sm:p-3 bg-gradient-to-r from-primary/10 via-background to-primary/5 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs border border-primary/30 shrink-0">
                      TB
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold leading-tight text-foreground flex items-center gap-1 truncate">
                        Toko Berkah Jaya
                        <CheckCircle2 className="h-3 w-3 text-primary fill-primary/20 shrink-0" />
                      </h4>
                      <p className="text-[9px] sm:text-[10px] text-muted-foreground truncate">kataloghub.com/toko/berkah-jaya</p>
                    </div>
                  </div>
                  <span className="text-[9px] bg-emerald-500/10 text-emerald-600 font-bold px-2 py-0.5 rounded-full border border-emerald-500/20 shrink-0">
                    Buka
                  </span>
                </div>

                {/* Store Banner */}
                <div className="px-2.5 sm:px-3 pt-2.5 sm:pt-3">
                  <div className="bg-gradient-to-r from-primary to-blue-600 rounded-xl p-2.5 sm:p-3 text-white shadow-sm space-y-0.5 sm:space-y-1">
                    <span className="text-[8px] sm:text-[9px] bg-white/20 font-semibold px-2 py-0.5 rounded-full uppercase">Promo Merdeka</span>
                    <p className="text-[11px] sm:text-xs font-bold">Diskon Alat Tulis & Perlengkapan Kantor</p>
                    <p className="text-[9px] sm:text-[10px] text-white/80">Pesan langsung tanpa perlu perantara</p>
                  </div>
                </div>

                {/* Catalog Products List */}
                <div className="p-2.5 sm:p-3 flex-1 overflow-y-auto space-y-2 sm:space-y-2.5">
                  <p className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Produk Terpopuler</p>

                  {/* Featured Item (Target of the animation click) */}
                  <div className="relative rounded-xl border-2 border-primary/60 bg-primary/5 p-2 sm:p-2.5 space-y-2 transition-all shadow-sm">
                    <div className="flex items-center gap-2 sm:gap-2.5">
                      <div className="relative h-12 w-12 sm:h-14 sm:w-14 rounded-lg border border-border overflow-hidden bg-muted shrink-0">
                        <Image
                          src="/demo-atk/pulpen-gel.png"
                          alt="Pulpen Gel Ergo"
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[8px] sm:text-[9px] text-primary font-bold uppercase">Pena & Alat Tulis</span>
                        <h5 className="text-[11px] sm:text-xs font-bold text-foreground truncate">Pulpen Gel Ergo 0.5mm (Pack 12 pcs)</h5>
                        <p className="text-[11px] sm:text-xs font-extrabold text-emerald-600 dark:text-emerald-400">Rp 35.000</p>
                      </div>
                    </div>

                    {/* Order Button Target */}
                    <div className="relative">
                      <button
                        onClick={handleManualTrigger}
                        className={`w-full py-1.5 sm:py-2 px-3 rounded-lg bg-emerald-600 text-white font-bold text-[11px] sm:text-xs flex items-center justify-center gap-1.5 sm:gap-2 shadow-md transition-transform duration-150 active:scale-95 ${
                          currentStep === 1 ? "ring-4 ring-emerald-400/50 scale-[0.97] bg-emerald-700" : "hover:bg-emerald-700"
                        }`}
                      >
                        <MessageCircle className="h-3.5 w-3.5 fill-white/20" />
                        <span>Order via WhatsApp</span>
                      </button>

                      {/* Click Pulse Ripple Effect */}
                      <AnimatePresence>
                        {currentStep === 1 && (
                          <motion.span
                            initial={{ scale: 0.8, opacity: 1 }}
                            animate={{ scale: 2.2, opacity: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.6 }}
                            className="absolute inset-0 rounded-lg border-2 border-emerald-400 pointer-events-none"
                          />
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Secondary Product Mock */}
                  <div className="rounded-xl border border-border bg-card p-2 sm:p-2.5 flex items-center gap-2 sm:gap-2.5 opacity-60">
                    <div className="relative h-10 w-10 sm:h-12 sm:w-12 rounded-lg border border-border overflow-hidden bg-muted shrink-0">
                      <Image
                        src="/demo-atk/buku-catatan.png"
                        alt="Grid Spiral Notebook"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-[10px] sm:text-[11px] font-semibold text-foreground truncate">Grid Spiral Notebook A5</h5>
                      <p className="text-[11px] sm:text-xs font-bold text-muted-foreground">Rp 48.000</p>
                    </div>
                  </div>
                </div>

                {/* Footer Disclaimer */}
                <div className="p-2 bg-muted/40 border-t border-border text-center text-[9px] sm:text-[10px] text-muted-foreground font-medium">
                  🛒 Klik tombol untuk memulai simulasi
                </div>

                {/* ANIMATED HAND POINTER CURSOR */}
                <AnimatePresence>
                  {currentStep < 2 && (
                    <motion.div
                      initial={{ top: "75%", left: "60%", opacity: 0, scale: 1 }}
                      animate={
                        currentStep === 0
                          ? { top: "62%", left: "48%", opacity: 1, scale: 1 }
                          : { top: "43%", left: "30%", opacity: 1, scale: 0.82 }
                      }
                      transition={{
                        type: "spring",
                        stiffness: 120,
                        damping: 18,
                        duration: 0.8,
                      }}
                      className="absolute z-40 pointer-events-none drop-shadow-xl"
                    >
                      <div className="relative">
                        {/* Hand Cursor SVG */}
                        <svg
                          width="40"
                          height="40"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="text-foreground fill-primary"
                        >
                          <path
                            d="M9 11.25V5.5C9 4.67157 9.67157 4 10.5 4C11.3284 4 12 4.67157 12 5.5V11.25M12 11.25V3.5C12 2.67157 12.6716 2 13.5 2C14.3284 2 15 2.67157 15 3.5V11.25M15 11.25V4.5C15 3.67157 15.6716 3 16.5 3C17.3284 3 18 3.67157 18 4.5V13.5C18 17.0899 15.0899 20 11.5 20C9.17188 20 7.12658 18.7758 5.96967 16.9298L3.70711 12.7929C3.31658 12.0769 3.57864 11.1824 4.3015 10.7919C4.98188 10.4243 5.82397 10.6406 6.25736 11.2907L9 15.4047V11.25Z"
                            fill="var(--primary)"
                            stroke="#ffffff"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>

                        {/* Hand Click Hint Badge */}
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute left-5 top-5 bg-slate-900 text-white text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded shadow-lg whitespace-nowrap border border-slate-700"
                        >
                          {currentStep === 0 ? "Mengarahkan..." : "Klik Order!"}
                        </motion.div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            </div>
          </div>

          {/* MIDDLE CONNECTING BEAM & ACTION ARROW */}
          <div className="lg:col-span-2 flex flex-col items-center justify-center my-1 lg:my-0">
            <div className="flex lg:flex-col items-center gap-2 sm:gap-3">
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 shadow-md">
                <Send className={`h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-500 ${currentStep >= 1 ? "translate-x-1 lg:translate-x-0 lg:translate-y-1 scale-110" : ""}`} />
              </div>
              
              <div className="relative w-20 sm:w-24 lg:w-1 lg:h-32 bg-border overflow-hidden rounded-full">
                <motion.div
                  animate={
                    currentStep >= 1
                      ? { y: ["0%", "100%"], x: ["0%", "100%"] }
                      : { y: "0%", x: "0%" }
                  }
                  transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                  className="absolute inset-0 bg-gradient-to-r lg:bg-gradient-to-b from-transparent via-emerald-500 to-transparent"
                />
              </div>

              <div className="text-center space-y-1">
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Instan WA
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT PHONE MOCKUP: OWNER WHATSAPP BUSINESS */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-[285px] xs:max-w-[310px] sm:max-w-[330px] rounded-[30px] sm:rounded-[36px] border-[5px] sm:border-[7px] border-emerald-950 bg-slate-950 p-1.5 sm:p-2 shadow-2xl ring-1 ring-emerald-900/50">
              
              {/* Phone Speaker */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 h-3.5 sm:h-4 w-24 sm:w-28 bg-slate-900 rounded-b-xl z-30 flex items-center justify-center">
                <div className="h-1 sm:h-1.5 w-8 sm:w-10 bg-slate-800 rounded-full" />
              </div>

              {/* Inner Screen (WhatsApp Business View) */}
              <div className="relative rounded-[22px] sm:rounded-[28px] bg-[#efeae2] dark:bg-slate-900 border border-border overflow-hidden h-[470px] sm:h-[510px] flex flex-col">
                
                {/* Status Bar */}
                <div className="pt-2 px-3 sm:px-4 pb-1 flex justify-between items-center text-[10px] font-semibold text-emerald-100 bg-emerald-800">
                  <span>09:42</span>
                  <span className="text-[9px] bg-white/20 px-1.5 py-0.5 rounded font-mono text-white">WA Business Owner</span>
                  <span>100%</span>
                </div>

                {/* WhatsApp Chat Header */}
                <div className="bg-[#075e54] text-white p-3 flex items-center gap-2.5 shadow">
                  <div className="relative">
                    <div className="h-8 w-8 rounded-full bg-slate-200 text-slate-800 flex items-center justify-center font-bold text-xs">
                      P
                    </div>
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 border border-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold leading-tight truncate">Pelanggan Baru (Katalog)</h4>
                    <p className="text-[10px] text-emerald-100 flex items-center gap-1">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse"></span>
                      Online • Mengetik pesanan...
                    </p>
                  </div>
                  <BellRing className="h-4 w-4 text-emerald-200 shrink-0" />
                </div>

                {/* WhatsApp Messages Canvas */}
                <div className="p-3 flex-1 overflow-y-auto space-y-3 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:12px_12px]">
                  
                  {/* Date Badge */}
                  <div className="text-center">
                    <span className="text-[9px] bg-white/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold px-2.5 py-0.5 rounded-md shadow-sm border border-slate-200 dark:border-slate-700">
                      Hari Ini
                    </span>
                  </div>

                  {/* Previous System Chat Notification */}
                  <div className="bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 rounded-lg p-2 text-[10px] text-amber-900 dark:text-amber-200 text-center shadow-sm">
                    🔒 Pesanan ini masuk melalui tautan etalase <strong>KatalogHub</strong>
                  </div>

                  {/* INCOMING ORDER MESSAGE BUBBLE */}
                  <AnimatePresence>
                    {currentStep >= 2 ? (
                      <motion.div
                        initial={{ opacity: 0, y: 15, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                        className="bg-white dark:bg-slate-800 rounded-lg rounded-tl-none p-3 shadow-md border border-slate-200 dark:border-slate-700 space-y-1.5 max-w-[90%]"
                      >
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-1.5">
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <ShoppingBag className="h-3 w-3" /> PESANAN KATALOG BARU
                          </span>
                          <span className="text-[9px] text-slate-400 font-mono">09:42</span>
                        </div>

                        <div className="text-xs text-slate-800 dark:text-slate-100 space-y-1 font-sans">
                          <p>Halo <strong>Toko Berkah Jaya</strong> 👋</p>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300">Saya ingin memesan produk dari etalase online Anda:</p>
                          
                          <div className="bg-slate-50 dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-700 text-[11px] space-y-0.5 font-mono">
                            <p><strong>Produk:</strong> Pulpen Gel Ergo 0.5mm</p>
                            <p><strong>Jumlah:</strong> 2 Pack (24 pcs)</p>
                            <p><strong>Harga:</strong> Rp 35.000 / pack</p>
                            <p className="text-emerald-600 dark:text-emerald-400 font-bold border-t border-slate-200 dark:border-slate-800 pt-1 mt-1">
                              TOTAL: Rp 70.000
                            </p>
                          </div>

                          <p className="text-[11px] text-slate-600 dark:text-slate-300">
                            Apakah stok tersedia & bisa dikirim hari ini? Terima kasih!
                          </p>
                        </div>

                        <div className="flex items-center justify-end gap-1 pt-0.5 text-[9px] text-slate-400">
                          <span>09:42</span>
                          <CheckCheck className="h-3 w-3 text-emerald-500" />
                        </div>
                      </motion.div>
                    ) : (
                      <div className="flex items-center gap-2 p-3 bg-white/70 dark:bg-slate-800/70 rounded-lg text-slate-400 text-xs italic">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
                        Menunggu pembeli mengeklik produk...
                      </div>
                    )}
                  </AnimatePresence>

                </div>

                {/* Owner Reply Input Mock */}
                <div className="p-2 bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center gap-2">
                  <div className="flex-1 bg-white dark:bg-slate-900 rounded-full px-3 py-1.5 text-xs text-slate-400 border border-slate-200 dark:border-slate-700 truncate">
                    {currentStep >= 2 ? "Ketik 'Siap, stok ada...' " : "Pesan terisi otomatis..."}
                  </div>
                  <div className="h-8 w-8 rounded-full bg-[#075e54] flex items-center justify-center text-white shrink-0">
                    <Send className="h-3.5 w-3.5" />
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>

        {/* Bottom Interactive Controls */}
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-xl border border-border bg-card shadow-sm">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-semibold text-xs transition-colors hover:bg-primary/90 flex-1 sm:flex-initial"
            >
              {isPlaying ? (
                <>
                  <Pause className="h-3.5 w-3.5 shrink-0" /> Pause
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 shrink-0" /> Auto Play
                </>
              )}
            </button>

            <button
              onClick={handlePrevStep}
              className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg border border-input bg-background text-foreground font-semibold text-xs hover:bg-muted transition-colors"
              title="Langkah Sebelumnya"
            >
              ◄ Sebelum
            </button>

            <button
              onClick={handleNextStep}
              className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg border border-input bg-background text-foreground font-semibold text-xs hover:bg-muted transition-colors"
              title="Langkah Selanjutnya"
            >
              Sesudah ►
            </button>

            <button
              onClick={handleReset}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-input bg-background text-foreground font-semibold text-xs hover:bg-muted transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5 text-muted-foreground shrink-0" /> Reset
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 text-[11px] sm:text-xs text-muted-foreground font-medium text-center sm:text-left">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
            <span>
              Langkah <strong>{currentStep + 1} dari 3</strong>: {currentStep === 0 ? "Pembeli memilih produk di katalog" : currentStep === 1 ? "Klik tombol Order WA" : "Pesan terformat masuk ke WA Owner"}
            </span>
          </div>
        </div>

      </div>
    </section>
  );
}
