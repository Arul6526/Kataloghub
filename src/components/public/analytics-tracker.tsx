"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function AnalyticsTracker() {
  const pathname = usePathname();
  const hasTracked = useRef<string | null>(null);

  useEffect(() => {
    // Hindari request ganda di React Strict Mode
    if (hasTracked.current === pathname) return;
    hasTracked.current = pathname;

    // Abaikan pelacakan untuk halaman admin
    if (pathname.startsWith("/admin")) return;

    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname }),
    }).catch(() => {
      // Abaikan error secara silent agar tidak mengganggu pengalaman pengguna
    });
  }, [pathname]);

  return null;
}
