"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderTree,
  ListChecks,
  Package,
  Settings,
  PanelsTopLeft,
  Megaphone,
  Database,
  FileCode,
  LogOut,
  BookOpen,
  ShoppingBag,
  ChevronDown,
  ChevronRight,
  QrCode,
  Receipt,
  Bot,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface NavChild {
  label: string;
  href: string;
  icon: any;
  exact?: boolean;
}

export interface NavItem {
  label: string;
  href?: string;
  icon: any;
  exact?: boolean;
  children?: NavChild[];
}

const NAV: NavItem[] = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: "AI Assistant",
    href: "/admin/ai-assistant",
    icon: Bot,
  },
  {
    label: "Konfigurasi AI",
    href: "/admin/ai-config",
    icon: Settings,
  },
  {
    label: "Riwayat Pesanan WA",
    href: "/admin/orders",
    icon: ShoppingBag,
  },
  {
    label: "Kasir & Nota Digital",
    href: "/admin/pos-nota",
    icon: Receipt,
  },
  {
    label: "Produk",
    icon: Package,
    children: [
      {
        label: "Daftar Produk",
        href: "/admin/products",
        icon: Package,
      },
      {
        label: "Kategori",
        href: "/admin/categories",
        icon: FolderTree,
      },
      {
        label: "Template Spesifikasi",
        href: "/admin/spec-templates",
        icon: ListChecks,
      },
    ],
  },
  {
    label: "Landing Page",
    icon: PanelsTopLeft,
    children: [
      {
        label: "Tampilan Utama",
        href: "/admin/landing",
        icon: PanelsTopLeft,
      },
      {
        label: "Custom Landing Page",
        href: "/admin/custom-pages",
        icon: FileCode,
      },
    ],
  },
  {
    label: "Site Setting & WhatsApp",
    href: "/admin/settings",
    icon: Megaphone,
  },
  {
    label: "Poster & QR Toko Cetak",
    href: "/admin/qr-poster",
    icon: QrCode,
  },
  {
    label: "Berlangganan (SaaS)",
    href: "/admin/subscription",
    icon: Settings,
  },
  {
    label: "Panduan Fitur",
    href: "/admin/panduan",
    icon: BookOpen,
  },
];

function itemActive(href: string, exact: boolean | undefined, pathname: string) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}

export function SidebarNav({ collapsed = false }: { collapsed?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();

  // State kelola buka/tutup grup sub-menu
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  // Auto-expand group jika halaman yang aktif berada di dalam sub-menu tersebut
  useEffect(() => {
    const updated: Record<string, boolean> = { ...openGroups };
    NAV.forEach((item) => {
      if (item.children) {
        const hasActiveChild = item.children.some((child) =>
          itemActive(child.href, child.exact, pathname),
        );
        if (hasActiveChild) {
          updated[item.label] = true;
        }
      }
    });
    setOpenGroups(updated);
  }, [pathname]);

  function toggleGroup(label: string, e: React.MouseEvent) {
    e.stopPropagation();
    setOpenGroups((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  }

  async function handleLogout() {
    await fetch("/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <nav className="flex flex-col gap-1">
      {NAV.map((item) => {
        // Menu item tunggal tanpa anak
        if (!item.children && item.href) {
          const active = itemActive(item.href, item.exact, pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              title={collapsed ? item.label : undefined}
              className={cn(
                "group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all duration-200",
                collapsed ? "justify-center px-2" : "",
                active
                  ? "bg-emerald-500/10 font-semibold text-emerald-600 dark:text-emerald-400"
                  : "text-foreground/70 hover:bg-muted hover:text-foreground",
              )}
            >
              {active && (
                <span className="absolute inset-y-1 left-0 w-1 rounded-r-md bg-emerald-500" />
              )}
              <item.icon
                className={cn(
                  "shrink-0",
                  collapsed ? "h-5 w-5" : "h-4 w-4",
                  active ? "text-emerald-600 dark:text-emerald-400" : "",
                )}
              />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        }

        // Menu item grup dengan sub-menu (anak)
        if (item.children) {
          const isChildActive = item.children.some((child) =>
            itemActive(child.href, child.exact, pathname),
          );
          const isOpen = !!openGroups[item.label];
          const defaultFirstHref = item.children[0]?.href || "#";

          // Jika sidebar dalam posisi collapsed
          if (collapsed) {
            return (
              <Link
                key={item.label}
                href={defaultFirstHref}
                title={item.label}
                className={cn(
                  "group relative flex items-center justify-center rounded-md px-2 py-2 text-sm transition-all duration-200",
                  isChildActive
                    ? "bg-emerald-500/10 font-semibold text-emerald-600 dark:text-emerald-400"
                    : "text-foreground/70 hover:bg-muted hover:text-foreground",
                )}
              >
                {isChildActive && (
                  <span className="absolute inset-y-1 left-0 w-1 rounded-r-md bg-emerald-500" />
                )}
                <item.icon
                  className={cn(
                    "h-5 w-5 shrink-0",
                    isChildActive ? "text-emerald-600 dark:text-emerald-400" : "",
                  )}
                />
              </Link>
            );
          }

          // Sidebar posisi normal / ter-expand
          return (
            <div key={item.label} className="space-y-1">
              <button
                type="button"
                onClick={(e) => toggleGroup(item.label, e)}
                className={cn(
                  "group relative flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-sm transition-all duration-200",
                  isChildActive
                    ? "font-semibold text-emerald-600 dark:text-emerald-400"
                    : "text-foreground/70 hover:bg-muted hover:text-foreground",
                )}
              >
                <div className="flex items-center gap-3 truncate">
                  <item.icon
                    className={cn(
                      "h-4 w-4 shrink-0",
                      isChildActive ? "text-emerald-600 dark:text-emerald-400" : "",
                    )}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
                {isOpen ? (
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground/70" />
                ) : (
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/70" />
                )}
              </button>

              {/* Sub-menu Items */}
              {isOpen && (
                <div className="my-1 ml-3 space-y-1 border-l border-border/60 pl-3">
                  {item.children.map((child) => {
                    const active = itemActive(child.href, child.exact, pathname);
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "group relative flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-xs transition-all duration-200",
                          active
                            ? "bg-emerald-500/10 font-semibold text-emerald-600 dark:text-emerald-400"
                            : "text-foreground/70 hover:bg-muted hover:text-foreground",
                        )}
                      >
                        <child.icon
                          className={cn(
                            "h-3.5 w-3.5 shrink-0",
                            active
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-muted-foreground",
                          )}
                        />
                        <span className="truncate">{child.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        }

        return null;
      })}

      <div className="my-2 border-t border-border" />
      <button
        onClick={handleLogout}
        title={collapsed ? "Keluar" : undefined}
        className={cn(
          "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all duration-200",
          collapsed ? "justify-center px-2" : "",
          "text-destructive/80 hover:bg-destructive/10 hover:text-destructive",
        )}
      >
        <LogOut className={cn("shrink-0", collapsed ? "h-5 w-5" : "h-4 w-4")} />
        {!collapsed && <span className="truncate">Keluar</span>}
      </button>
    </nav>
  );
}

export function SidebarBrand({
  brandName,
  brandLogoUrl,
}: {
  brandName?: string;
  brandLogoUrl?: string | null;
}) {
  return (
    <Link href="/admin" className="flex items-center gap-2.5 px-3 py-5 text-foreground">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md bg-primary text-primary-foreground shadow">
        {brandLogoUrl ? (
          <img src={brandLogoUrl} alt="Logo" className="h-full w-full bg-white object-cover" />
        ) : (
          <Database className="h-5 w-5" />
        )}
      </span>
      <span className="flex flex-col leading-none">
        <span className="text-sm font-bold tracking-tight">{brandName || "KatalogHub"}</span>
        <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Admin Console
        </span>
      </span>
    </Link>
  );
}
