"use client";

import { Phone } from "lucide-react";

interface FloatingWaBtnProps {
  waUrl: string;
  storeSlug: string;
}

export function FloatingWaBtn({ waUrl, storeSlug }: FloatingWaBtnProps) {
  async function handleClick() {
    try {
      await fetch("/api/order-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeSlug,
          customerName: "Pelanggan Katalog (Chat WA)",
          itemsSummary: "Chat Konsultasi / Pertanyaan via WhatsApp Floating Button",
          totalPrice: 0,
        }),
      });
    } catch (err) {
      console.warn("Floating WA lead log error:", err);
    } finally {
      window.open(waUrl, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl transition-transform hover:scale-110 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-[#25D366]/30 animate-in fade-in slide-in-from-bottom-4 duration-500 cursor-pointer"
      aria-label="Chat via WhatsApp"
      title="Chat WhatsApp"
    >
      <Phone className="h-6 w-6" />
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#25D366] opacity-30 pointer-events-none"></span>
    </button>
  );
}
