"use client";

import { useState, useEffect } from "react";
import { Smartphone, Download, X, Share, PlusSquare, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);

  useEffect(() => {
    // Register Service Worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => console.log("[PWA] Service Worker registered:", reg.scope))
        .catch((err) => console.warn("[PWA] SW register error:", err));
    }

    // Check if already running in standalone PWA mode
    const isStandaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    setIsStandalone(isStandaloneMode);
    if (isStandaloneMode) return;

    // Check if user dismissed before
    const isDismissed = localStorage.getItem("kataloghub_pwa_dismissed");
    if (isDismissed) return;

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const iosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(iosDevice);

    if (iosDevice) {
      // Delay showing prompt on iOS
      const timer = setTimeout(() => setShowPrompt(true), 3000);
      return () => clearTimeout(timer);
    }

    // Capture Chrome / Android / Desktop beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (isIos) {
      setShowIosGuide(true);
      return;
    }

    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      console.log("[PWA] User accepted install prompt");
    }
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setShowIosGuide(false);
    localStorage.setItem("kataloghub_pwa_dismissed", "true");
  };

  if (isStandalone || !showPrompt || (typeof window !== "undefined" && window.self !== window.top)) return null;

  return (
    <>
      {/* Floating Bottom App Install Banner */}
      <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 z-50 max-w-md rounded-2xl border border-primary/30 bg-card p-4 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-5 duration-300">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0 shadow-md">
            <Smartphone className="h-5 w-5" />
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-xs text-foreground font-space flex items-center gap-1.5">
              Install Aplikasi KatalogHub
            </h4>
            <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
              Pasang aplikasi di layar utama HP Anda untuk akses cepat seperti aplikasi bawaan HP!
            </p>

            <div className="flex items-center gap-2 mt-3">
              <Button
                size="sm"
                onClick={handleInstallClick}
                className="h-8 px-3 text-xs font-bold gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
              >
                <Download className="h-3.5 w-3.5" />
                Install Sekarang
              </Button>

              <button
                onClick={handleDismiss}
                className="text-[11px] text-muted-foreground hover:text-foreground px-2 py-1 transition-colors"
              >
                Nanti Saja
              </button>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="text-muted-foreground hover:text-foreground p-1 rounded-full"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* iOS Install Guide Popup */}
      {showIosGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl text-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <Share className="h-6 w-6" />
            </div>

            <div className="space-y-1">
              <h3 className="font-bold text-sm text-foreground">Cara Install di iPhone / iPad:</h3>
              <p className="text-xs text-muted-foreground">
                Ikuti 2 langkah mudah ini dari Safari:
              </p>
            </div>

            <div className="rounded-xl bg-muted/50 p-4 text-left space-y-3 text-xs border border-border">
              <div className="flex items-center gap-3">
                <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                  1
                </div>
                <span>Ketuk tombol **Bagikan** (<Share className="inline h-3.5 w-3.5 mx-0.5 text-primary" />) di bagian bawah Safari.</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                  2
                </div>
                <span>Pilih menu **&quot;Tambahkan ke Layar Utama&quot;** (<PlusSquare className="inline h-3.5 w-3.5 mx-0.5 text-primary" />).</span>
              </div>
            </div>

            <Button size="sm" onClick={handleDismiss} className="w-full font-bold">
              <Check className="h-4 w-4 mr-1" /> Mengerti
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
