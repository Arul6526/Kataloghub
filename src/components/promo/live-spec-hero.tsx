"use client";

import { useEffect, useState } from "react";
import { Store, CheckCircle } from "lucide-react";

const SPECS_DATA = [
  { label: "NAMA_TOKO", value: "Toko Sukses Jaya" },
  { label: "TEMA", value: "Minimalis Modern" },
  { label: "PRODUK", value: "152 Item (Sinkronisasi Selesai)" },
  { label: "KONTAK", value: "WhatsApp Terintegrasi" },
  { label: "STATUS", value: "KATALOG ONLINE" },
];

export function LiveSpecHero() {
  const [linesRevealed, setLinesRevealed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setLinesRevealed((prev) => {
        if (prev < SPECS_DATA.length) {
          return prev + 1;
        }
        clearInterval(interval);
        return prev;
      });
    }, 400); // Reveal one line every 400ms

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full overflow-hidden border border-border bg-card shadow-2xl">
      {/* Top Bar / Blueprint Header */}
      <div className="flex items-center justify-between border-b border-border bg-muted/50 px-4 py-2 font-mono text-[10px] sm:text-xs uppercase tracking-widest text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span>DEPLOY_PROCESS_ACTIVE</span>
        </div>
        <span>KATALOGHUB // GENERATOR</span>
      </div>

      {/* Main Spec Display */}
      <div className="p-4 sm:p-8 font-mono text-xs sm:text-base overflow-hidden">
        <div className="mb-5 flex items-center gap-3 sm:gap-4 border-b border-border/50 pb-5">
          <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center border border-primary/20 bg-primary/5 text-primary shrink-0">
            <Store className="h-6 w-6 sm:h-8 sm:w-8" strokeWidth={1.5} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold tracking-tight text-foreground text-sm sm:text-lg uppercase truncate">
              suksesjaya.kataloghub.id
            </h3>
            <p className="text-muted-foreground text-[10px] sm:text-xs mt-0.5 sm:mt-1 uppercase tracking-widest truncate">
              GENERATING_WEBSITE...
            </p>
          </div>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {SPECS_DATA.map((spec, idx) => (
            <div
              key={spec.label}
              className={`flex flex-col xs:flex-row xs:items-end justify-between border-b border-border/40 pb-2 gap-1 transition-all duration-500 ${
                idx < linesRevealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
              }`}
            >
              <span className="text-muted-foreground text-[11px] sm:text-sm shrink-0">{spec.label}</span>
              <span className="font-semibold text-foreground text-left xs:text-right text-xs sm:text-sm break-words">
                {spec.value}
              </span>
            </div>
          ))}

          {/* Fake Loading Cursor */}
          {linesRevealed < SPECS_DATA.length && (
            <div className="flex items-center gap-2 pt-2 opacity-50">
              <div className="h-4 w-2 bg-primary animate-pulse" />
              <span className="text-xs text-muted-foreground">MEMBANGUN_KATALOG...</span>
            </div>
          )}

          {linesRevealed === SPECS_DATA.length && (
            <div className="pt-4 sm:pt-6 animate-in fade-in slide-in-from-bottom-2 duration-700">
              <div className="flex items-center gap-2 text-primary font-bold text-xs sm:text-sm bg-primary/10 w-full xs:w-max max-w-full px-3 py-1.5 rounded-sm border border-primary/20">
                <CheckCircle className="h-4 w-4 shrink-0" />
                <span className="truncate">WEBSITE KATALOG SIAP DIGUNAKAN!</span>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Grid Pattern Overlay */}
      <div 
        className="pointer-events-none absolute inset-0 opacity-[0.03] mix-blend-overlay"
        style={{
          backgroundImage: `linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />
    </div>
  );
}
