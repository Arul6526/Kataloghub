"use client";

import React, { useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { 
  Printer, 
  Download, 
  QrCode, 
  Store, 
  CheckCircle2, 
  Sparkles, 
  Smartphone,
  Globe,
  Share2
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface QRPosterClientProps {
  storeSlug: string;
  brandName: string;
  brandTagline: string;
  whatsappNumber: string;
}

export function QRPosterClient({
  storeSlug,
  brandName,
  brandTagline,
  whatsappNumber,
}: QRPosterClientProps) {
  const [activeTemplate, setActiveTemplate] = useState<"a5" | "a4" | "cards">("a5");
  const [language, setLanguage] = useState<"id" | "su">("id");
  const posterRef = useRef<HTMLDivElement>(null);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://kataloghub.com";
  const storeUrl = `${baseUrl}/toko/${storeSlug}`;

  const ctaText =
    language === "su"
      ? "Scan pikeun Ningali Katalog Lengkap & Peseun via WhatsApp"
      : "Scan QR Code untuk Lihat Katalog Lengkap & Order via WhatsApp";

  const subText =
    language === "su"
      ? "Gampil, gancang, sareng tiasa langsung pesen ti HP"
      : "Praktis, cepat, & langsung terhubung ke WhatsApp toko kami";

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPNG = () => {
    if (!posterRef.current) return;
    const svgElement = posterRef.current.querySelector("svg");
    if (!svgElement) return;

    // Convert SVG to Canvas and trigger download
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = 1200;
      canvas.height = 1200;
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 100, 100, 1000, 1000);
        const pngUrl = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.href = pngUrl;
        downloadLink.download = `QR-Katalog-${storeSlug}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
    };

    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER BAR (HIDDEN ON PRINT) */}
      <div className="print:hidden rounded-2xl border border-border bg-card p-5 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-space text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
              <QrCode className="h-5 w-5 text-primary" />
              Poster & QR Code Toko Siap Cetak (UMKM Tasikmalaya)
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Unduh & cetak poster QR Code untuk dipajang di kasir, dinding toko/workshop, atau disisipkan ke paket pesanan.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={handleDownloadPNG} className="gap-2 text-xs">
              <Download className="h-4 w-4" /> Unduh PNG HD
            </Button>
            <Button onClick={handlePrint} className="gap-2 text-xs font-bold bg-primary text-primary-foreground">
              <Printer className="h-4 w-4" /> Cetak / Print PDF
            </Button>
          </div>
        </div>

        {/* TEMPLATE & LANGUAGE CONTROLS */}
        <div className="pt-3 border-t border-border/60 flex flex-wrap items-center justify-between gap-4 text-xs">
          
          {/* Template Selection Tabs */}
          <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-xl border border-border">
            <button
              type="button"
              onClick={() => setActiveTemplate("a5")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeTemplate === "a5" ? "bg-background text-foreground shadow-sm font-bold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              🏷️ A5 Standee Kasir
            </button>
            <button
              type="button"
              onClick={() => setActiveTemplate("a4")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeTemplate === "a4" ? "bg-background text-foreground shadow-sm font-bold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              📄 A4 Poster Dinding
            </button>
            <button
              type="button"
              onClick={() => setActiveTemplate("cards")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeTemplate === "cards" ? "bg-background text-foreground shadow-sm font-bold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              📦 Stiker Paket 4-in-1
            </button>
          </div>

          {/* Language Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground font-medium">Bahasa Pesan:</span>
            <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border">
              <button
                type="button"
                onClick={() => setLanguage("id")}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  language === "id" ? "bg-primary text-primary-foreground shadow-sm font-bold" : "text-muted-foreground"
                }`}
              >
                Indonesia
              </button>
              <button
                type="button"
                onClick={() => setLanguage("su")}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  language === "su" ? "bg-primary text-primary-foreground shadow-sm font-bold" : "text-muted-foreground"
                }`}
              >
                Basa Sunda
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* PRINTABLE POSTER DISPLAY CONTAINER */}
      <div className="flex justify-center p-2 sm:p-4 bg-muted/20 rounded-2xl border border-border/40 min-h-[500px]">
        
        <div ref={posterRef} className="print:p-0">
          
          {/* TEMPLATE A5: STANDEE MEJA KASIR */}
          {activeTemplate === "a5" && (
            <div className="w-[360px] sm:w-[420px] bg-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-slate-900 flex flex-col items-center justify-between text-center space-y-6 print:w-full print:shadow-none print:border-2">
              
              {/* Top Brand Tag */}
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-800 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider border border-slate-200">
                  <Store className="h-3.5 w-3.5 text-blue-600" /> {brandName || "Toko Kami"}
                </div>
                <h3 className="font-space text-lg font-black text-slate-900 leading-tight pt-1">
                  {brandTagline || "Katalog Produk & Pemesanan Online"}
                </h3>
              </div>

              {/* High Resolution QR Code */}
              <div className="p-4 bg-white rounded-2xl border-2 border-slate-900 shadow-md space-y-2 flex flex-col items-center">
                <QRCodeSVG
                  value={storeUrl}
                  size={190}
                  level="H"
                  includeMargin={true}
                  imageSettings={{
                    src: "/demo-atk/pulpen-gel.png",
                    x: undefined,
                    y: undefined,
                    height: 24,
                    width: 24,
                    excavate: true,
                  }}
                />
                <span className="text-[10px] font-mono text-slate-600 font-bold tracking-widest uppercase">
                  {storeSlug}
                </span>
              </div>

              {/* Call to Action Box */}
              <div className="space-y-2 w-full">
                <div className="bg-slate-900 text-white rounded-2xl p-3.5 shadow-md space-y-1">
                  <p className="text-xs font-bold leading-snug">{ctaText}</p>
                  <p className="text-[10px] text-slate-300">{subText}</p>
                </div>

                <div className="flex items-center justify-center gap-3 text-[10px] font-bold text-slate-600 pt-1">
                  <span className="flex items-center gap-1"><Smartphone className="h-3 w-3 text-emerald-600" /> Order WA</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Globe className="h-3 w-3 text-blue-600" /> kataloghub.com</span>
                </div>
              </div>

            </div>
          )}

          {/* TEMPLATE A4: POSTER DINDING TOKO / WORKSHOP */}
          {activeTemplate === "a4" && (
            <div className="w-[440px] sm:w-[540px] bg-slate-900 text-white rounded-3xl p-8 sm:p-10 shadow-2xl border-4 border-slate-700 flex flex-col items-center justify-between text-center space-y-8 print:w-full print:shadow-none">
              
              {/* Header Banner */}
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-1.5 rounded-full text-xs font-extrabold tracking-widest uppercase shadow-md">
                  <Sparkles className="h-4 w-4" /> Katalog Resmi UMKM Tasikmalaya
                </div>
                <h2 className="font-space text-2xl sm:text-3xl font-black leading-tight text-white pt-2">
                  {brandName || "Toko Kami"}
                </h2>
                <p className="text-xs text-slate-300 max-w-sm mx-auto">
                  {brandTagline || "Katalog Etalase Lengkap & Layanan Pesanan WhatsApp"}
                </p>
              </div>

              {/* QR Code Container */}
              <div className="p-6 bg-white rounded-3xl border-4 border-blue-500 shadow-2xl flex flex-col items-center space-y-3">
                <QRCodeSVG
                  value={storeUrl}
                  size={230}
                  level="H"
                  includeMargin={true}
                />
                <div className="bg-slate-100 text-slate-900 px-4 py-1 rounded-full text-xs font-mono font-black">
                  kataloghub.com/toko/{storeSlug}
                </div>
              </div>

              {/* CTA Details */}
              <div className="space-y-3 w-full max-w-md">
                <div className="bg-gradient-to-r from-blue-600 to-emerald-600 p-4 rounded-2xl shadow-lg space-y-1">
                  <h4 className="text-sm font-black text-white">{ctaText}</h4>
                  <p className="text-xs text-blue-100">{subText}</p>
                </div>

                <div className="pt-2 flex items-center justify-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Katalog 24 Jam</span>
                  <span className="flex items-center gap-1.5"><Smartphone className="h-4 w-4 text-blue-400" /> Pesan Langsung</span>
                </div>
              </div>

            </div>
          )}

          {/* TEMPLATE CARDS: STIKER PAKET 4-IN-1 */}
          {activeTemplate === "cards" && (
            <div className="grid grid-cols-2 gap-4 w-[480px] sm:w-[560px] print:w-full">
              {[1, 2, 3, 4].map((idx) => (
                <div key={idx} className="bg-white text-slate-900 rounded-2xl p-4 border-2 border-slate-900 shadow-md flex flex-col items-center text-center space-y-3">
                  <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full uppercase">
                    {brandName || "Toko Kami"}
                  </span>
                  <QRCodeSVG value={storeUrl} size={110} level="M" />
                  <p className="text-[10px] font-bold text-slate-800 leading-tight">
                    {language === "su" ? "Hatur nuhun! Scan pikeun order deui" : "Terima Kasih! Scan untuk pesan lagi via WA"}
                  </p>
                  <span className="text-[9px] font-mono text-slate-500 font-semibold">
                    /toko/{storeSlug}
                  </span>
                </div>
              ))}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
