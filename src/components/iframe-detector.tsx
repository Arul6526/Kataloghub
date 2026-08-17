"use client";

import { useEffect } from "react";

export function IframeDetector() {
  useEffect(() => {
    if (typeof window !== "undefined" && window.self !== window.top) {
      document.documentElement.classList.add("is-iframe");
      document.body.classList.add("is-iframe");

      // Bungkam semua popup JS error di dalam iframe preview
      const silenceErrors = (event: Event) => {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        return false;
      };

      window.addEventListener("error", silenceErrors, true);
      window.addEventListener("unhandledrejection", silenceErrors, true);

      return () => {
        window.removeEventListener("error", silenceErrors, true);
        window.removeEventListener("unhandledrejection", silenceErrors, true);
      };
    }
  }, []);

  return null;
}
