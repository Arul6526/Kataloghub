"use client";

import { useState } from "react";
import { Phone, Loader2 } from "lucide-react";

interface DirectWaBtnProps {
  waUrl: string;
  storeSlug: string;
  productName: string;
  productPrice: number | null;
}

export function DirectWaBtn({
  waUrl,
  storeSlug,
  productName,
  productPrice,
}: DirectWaBtnProps) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      await fetch("/api/order-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeSlug,
          customerName: "Pelanggan Katalog (Tanya WA)",
          itemsSummary: `1. *${productName}* - ${
            productPrice
              ? `Rp ${productPrice.toLocaleString("id-ID")}`
              : "Tanya Harga"
          }`,
          totalPrice: productPrice || 0,
        }),
      });
    } catch (err) {
      console.warn("Direct WA lead log error:", err);
    } finally {
      setLoading(false);
      window.open(waUrl, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="flex-1 flex h-14 sm:h-16 items-center justify-center gap-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm sm:text-base font-extrabold shadow-md transition-transform hover:scale-[1.01] active:scale-98 min-w-0 disabled:opacity-80 cursor-pointer"
    >
      {loading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <Phone className="h-5 w-5 shrink-0" />
      )}
      <span className="truncate">Tanya via WhatsApp</span>
    </button>
  );
}
