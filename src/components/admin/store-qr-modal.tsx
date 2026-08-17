"use client";

import { useState, useRef } from "react";
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";
import { QrCode, Download, Copy, Check, ExternalLink, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StoreQrModalProps {
  storeSlug: string;
  brandName?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function StoreQrModal({
  storeSlug,
  brandName,
  isOpen,
  onClose,
}: StoreQrModalProps) {
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
  const storeUrl = `${origin}/toko/${storeSlug}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(storeUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPng = () => {
    const canvas = canvasRef.current?.querySelector("canvas");
    if (!canvas) return;

    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `QR-Toko-${storeSlug || "KatalogHub"}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-4 bg-muted/30">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
              <QrCode className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-space font-bold text-sm text-foreground leading-tight">
                QR Code Resmi Toko
              </h3>
              <p className="text-[11px] text-muted-foreground">{brandName || "Katalog Toko"}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* QR Code Container */}
        <div className="p-6 flex flex-col items-center justify-center text-center space-y-4">
          <div className="rounded-2xl border-2 border-primary/30 bg-white p-5 shadow-lg relative group">
            {/* SVG display for crisp UI */}
            <div className="block">
              <QRCodeSVG
                value={storeUrl}
                size={200}
                bgColor="#ffffff"
                fgColor="#0f172a"
                level="H"
                marginSize={1}
              />
            </div>

            {/* Hidden Canvas for PNG Export */}
            <div ref={canvasRef} className="hidden">
              <QRCodeCanvas
                value={storeUrl}
                size={600}
                bgColor="#ffffff"
                fgColor="#0f172a"
                level="H"
                marginSize={2}
              />
            </div>
          </div>

          <div className="space-y-1 max-w-xs">
            <h4 className="font-bold text-sm text-foreground">{brandName || "Toko Anda"}</h4>
            <p className="text-xs text-muted-foreground break-all font-mono bg-muted/60 px-2 py-1 rounded">
              {storeUrl}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 w-full pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="gap-1.5 font-bold text-xs"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
              {copied ? "Tersalin!" : "Salin Link"}
            </Button>

            <Button
              size="sm"
              onClick={handleDownloadPng}
              className="gap-1.5 font-bold text-xs shadow-md"
            >
              <Download className="h-4 w-4" />
              Unduh PNG
            </Button>
          </div>

          <a
            href={storeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline flex items-center gap-1 pt-1 font-semibold"
          >
            Buka Toko Publik <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
