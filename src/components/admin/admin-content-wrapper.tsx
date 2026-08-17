"use client";

import Link from "next/link";
import { Bot, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarBrand, SidebarNav } from "@/components/admin/sidebar";
import { HeaderUser } from "@/components/admin/header-user";
import { MobileNav } from "@/components/admin/mobile-nav";
import { useSidebar, SidebarToggleButton } from "@/components/admin/sidebar-context";
import { ThemeToggle } from "@/components/theme-toggle";
import { TourProvider } from "@/components/admin/tour-provider";
import { NavGuideButton } from "@/components/admin/nav-guide-button";

interface AdminContentWrapperProps {
  children: React.ReactNode;
  brandName: string;
  email: string;
  storeSlug: string;
  brandLogoUrl?: string | null;
}

export function AdminContentWrapper({
  children,
  brandName,
  email,
  storeSlug,
  brandLogoUrl,
}: AdminContentWrapperProps) {
  const { collapsed } = useSidebar();

  return (
    <TourProvider>
      <div className="min-h-dvh bg-muted/20">
        {/* Sidebar desktop */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 hidden flex-col border-r bg-background transition-all duration-300 lg:flex ${
            collapsed ? "w-16" : "w-64"
          }`}
        >
          {/* Brand & Toggle */}
          <div
            className={`flex items-center ${collapsed ? "flex-col justify-center gap-4 py-5" : "justify-between pr-3"}`}
          >
            {collapsed ? (
              <Link
                href="/admin"
                className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-md bg-primary text-primary-foreground shadow"
                title={brandName}
              >
                {brandLogoUrl ? (
                  <img
                    src={brandLogoUrl}
                    alt={brandName}
                    className="h-full w-full bg-white object-cover"
                  />
                ) : (
                  <span className="text-sm font-bold">{brandName.charAt(0).toUpperCase()}</span>
                )}
              </Link>
            ) : (
              <SidebarBrand brandName={brandName} brandLogoUrl={brandLogoUrl} />
            )}
            <SidebarToggleButton />
          </div>

          {/* Nav items */}
          <div className="flex-1 overflow-y-auto px-2 pb-4">
            <SidebarNav collapsed={collapsed} />
          </div>

          {/* Footer */}
          {!collapsed && (
            <div className="border-t p-3">
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2 text-muted-foreground"
              >
                <Link href={storeSlug ? `/toko/${storeSlug}` : "/"} target="_blank">
                  <ExternalLink className="h-4 w-4" />
                  Lihat situs publik
                </Link>
              </Button>
            </div>
          )}
        </aside>

        {/* Header + content */}
        <div
          className={`transition-all duration-300 ${collapsed ? "lg:pl-16" : "lg:pl-64"} relative min-h-dvh overflow-x-hidden`}
        >
          {/* Subtle Grid Background */}
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px]"></div>

          {/* Glowing Orb */}
          <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-96 w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[120px]"></div>

          <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-background/95 px-3 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:px-4">
            <MobileNav brandName={brandName} brandLogoUrl={brandLogoUrl} storeSlug={storeSlug} />

            {/* Tombol Lihat Situs Toko (Langsung Terlihat di Navbar HP & Desktop) */}
            <Button
              asChild
              variant="outline"
              size="sm"
              className="shadow-xs h-8 gap-1.5 border-primary/30 px-2.5 text-xs font-bold text-primary transition-colors hover:bg-primary/10"
              title="Lihat Situs Publik Toko Anda"
            >
              <Link href={storeSlug ? `/toko/${storeSlug}` : "/"} target="_blank">
                <ExternalLink className="h-3.5 w-3.5" />
                <span className="inline">Lihat Toko</span>
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 border-emerald-500/30 px-2.5 text-xs font-bold text-emerald-600 transition-colors hover:bg-emerald-500/10 dark:text-emerald-400"
              title="Buka KatalogHub AI"
            >
              <Link href="/admin/ai-assistant">
                <Bot className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">KatalogHub AI</span>
              </Link>
            </Button>

            <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
              <NavGuideButton />
              <ThemeToggle />
              <HeaderUser email={email} />
            </div>
          </header>
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</div>
        </div>
      </div>
    </TourProvider>
  );
}
