"use client";

import * as React from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastVariant = "success" | "error" | "info";

export interface ToastItem {
  id: number;
  title: string;
  description?: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  toast: (input: Omit<ToastItem, "id">) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast harus dipakai di dalam <ToastProvider>");
  return ctx;
}

const ICONS: Record<ToastVariant, React.ReactNode> = {
  success: <CheckCircle2 className="h-5 w-5 text-emerald-600" />,
  error: <AlertCircle className="h-5 w-5 text-destructive" />,
  info: <Info className="h-5 w-5 text-primary" />,
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<ToastItem[]>([]);
  const counter = React.useRef(0);

  const remove = React.useCallback((id: number) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const [isIframe, setIsIframe] = React.useState(false);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const inIframe = window.self !== window.top || document.body.classList.contains("is-iframe");
      setIsIframe(inIframe);
    }
  }, []);

  const toast = React.useCallback(
    (input: Omit<ToastItem, "id">) => {
      // Hindari menampilkan notifikasi saat di dalam iframe preview
      if (typeof window !== "undefined") {
        const inIframe = window.self !== window.top || document.body.classList.contains("is-iframe");
        if (inIframe) return;
      }
      const id = ++counter.current;
      setItems((prev) => [...prev, { id, ...input }]);
      window.setTimeout(() => remove(id), 4000);
    },
    [remove],
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {!isIframe && (
        <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2">
          {items.map((item) => (
            <div
              key={item.id}
              className={cn(
                "pointer-events-auto flex items-start gap-3 rounded-lg border bg-background p-4 shadow-lg data-[state=open]:animate-slide-in-right",
                item.variant === "error" && "border-destructive/30",
                item.variant === "success" && "border-emerald-200",
              )}
            >
              <div className="mt-0.5 shrink-0">{ICONS[item.variant]}</div>
              <div className="flex-1 space-y-0.5">
                <p className="text-sm font-semibold leading-tight">
                  {item.title}
                </p>
                {item.description ? (
                  <p className="text-xs text-muted-foreground">
                    {item.description}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => remove(item.id)}
                className="shrink-0 rounded-sm text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Tutup notifikasi"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}