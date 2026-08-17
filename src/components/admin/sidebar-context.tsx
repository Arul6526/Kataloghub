"use client";

import * as React from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

const SIDEBAR_KEY = "admin-sidebar-collapsed";

const SidebarContext = React.createContext<{
  collapsed: boolean;
  toggle: () => void;
}>({ collapsed: false, toggle: () => {} });

export function useSidebar() {
  return React.useContext(SidebarContext);
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = React.useState(false);

  // Restore from localStorage on mount
  React.useEffect(() => {
    const saved = localStorage.getItem(SIDEBAR_KEY);
    if (saved === "true") setCollapsed(true);
  }, []);

  const toggle = React.useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(SIDEBAR_KEY, String(next));
      return next;
    });
  }, []);

  return (
    <SidebarContext.Provider value={{ collapsed, toggle }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function SidebarToggleButton() {
  const { collapsed, toggle } = useSidebar();
  return (
    <button
      onClick={toggle}
      className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      aria-label={collapsed ? "Buka sidebar" : "Tutup sidebar"}
      title={collapsed ? "Buka sidebar" : "Tutup sidebar"}
    >
      {collapsed ? (
        <PanelLeftOpen className="h-4 w-4" />
      ) : (
        <PanelLeftClose className="h-4 w-4" />
      )}
    </button>
  );
}
