import { requireSuperAdmin } from "@/lib/auth";
import Link from "next/link";
import {
  ShieldCheck,
  LayoutDashboard,
  Users,
  CreditCard,
  ArrowLeft,
  Crown,
  Activity,
  Terminal,
  Store,
  Bot,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const current = await requireSuperAdmin();

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 font-sans text-zinc-100 antialiased selection:bg-primary selection:text-primary-foreground md:flex-row">
      {/* Sidebar Super Admin - Sleek Command Style */}
      <aside className="z-20 flex w-full shrink-0 flex-col border-r border-zinc-800/80 bg-zinc-900/90 md:sticky md:top-0 md:h-screen md:w-64">
        {/* Brand Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 font-bold text-white shadow-sm">
              <Crown className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="truncate text-sm font-bold tracking-tight text-white">KatalogHub</h1>
                <span className="py-0.2 rounded border border-blue-500/20 bg-blue-500/10 px-1.5 font-mono text-[10px] font-semibold uppercase text-blue-400">
                  SaaS
                </span>
              </div>
              <p className="font-mono text-[11px] text-zinc-400">Platform Admin</p>
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <nav
          aria-label="Superadmin Main Navigation"
          className="flex-1 space-y-1 overflow-y-auto p-3 text-xs"
        >
          <div className="px-2 py-2 font-mono text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
            Platform Operations
          </div>

          <Link
            href="/superadmin"
            className="group flex items-center gap-2.5 rounded-lg px-3 py-2 font-medium text-zinc-300 transition-all duration-150 hover:bg-zinc-800/80 hover:text-white"
          >
            <LayoutDashboard className="h-4 w-4 text-zinc-400 transition-colors group-hover:text-blue-400" />
            <span>Overview Dashboard</span>
          </Link>

          <Link
            href="/superadmin/owners"
            className="group flex items-center gap-2.5 rounded-lg px-3 py-2 font-medium text-zinc-300 transition-all duration-150 hover:bg-zinc-800/80 hover:text-white"
          >
            <Users className="h-4 w-4 text-zinc-400 transition-colors group-hover:text-blue-400" />
            <span>Store Owners</span>
          </Link>

          <Link
            href="/superadmin/subscriptions"
            className="group flex items-center gap-2.5 rounded-lg px-3 py-2 font-medium text-zinc-300 transition-all duration-150 hover:bg-zinc-800/80 hover:text-white"
          >
            <CreditCard className="h-4 w-4 text-zinc-400 transition-colors group-hover:text-emerald-400" />
            <span>Paket Langganan</span>
          </Link>

          <Link
            href="/superadmin/ai-settings"
            className="group flex items-center gap-2.5 rounded-lg px-3 py-2 font-medium text-zinc-300 transition-all duration-150 hover:bg-zinc-800/80 hover:text-white"
          >
            <Bot className="h-4 w-4 text-zinc-400 transition-colors group-hover:text-blue-400" />
            <span>AI Platform Settings</span>
          </Link>

          <div className="px-2 py-2 pt-5 font-mono text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
            Quick Nav
          </div>

          <Link
            href="/admin"
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 font-medium text-zinc-400 transition-all duration-150 hover:bg-zinc-800/50 hover:text-zinc-200"
          >
            <ArrowLeft className="h-4 w-4 text-zinc-400" />
            <span>Ke Admin Toko Saya</span>
          </Link>
        </nav>

        {/* System Info & User Footer */}
        <div className="space-y-2 border-t border-zinc-800/80 bg-zinc-950/40 p-3">
          <div className="flex items-center justify-between rounded border border-zinc-800 bg-zinc-900 px-2 py-1.5 font-mono text-[11px] text-zinc-400">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              DB Multi-tenant
            </span>
            <span className="text-zinc-400">v1.2</span>
          </div>

          <div className="flex items-center gap-2.5 rounded-lg border border-zinc-800/80 bg-zinc-900/80 p-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-blue-600/20 text-xs font-bold text-blue-300">
              SA
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-zinc-200">{current.email}</p>
              <p className="flex items-center gap-1 font-mono text-[10px] font-medium text-blue-400">
                <ShieldCheck className="h-3 w-3" /> Super Admin
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex min-w-0 flex-1 flex-col bg-zinc-950 text-zinc-100">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-zinc-800/80 bg-zinc-900/60 px-6 backdrop-blur-md">
          <div className="flex items-center gap-3 text-xs font-medium text-zinc-400">
            <div className="flex items-center gap-2 rounded border border-zinc-800 bg-zinc-900 px-2.5 py-1 font-mono text-[11px] text-zinc-300">
              <Activity className="h-3.5 w-3.5 text-emerald-400" />
              <span>Engine Status: Healthy</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded border border-zinc-800 bg-zinc-900 px-3 py-1 font-mono text-[11px] text-zinc-400 sm:flex">
              <Terminal className="h-3.5 w-3.5 text-blue-400" />
              <span>Superadmin CLI Ready</span>
            </div>
          </div>
        </header>

        {/* Main Content Viewport */}
        <div className="mx-auto w-full max-w-7xl flex-1 p-5 md:p-8">{children}</div>
      </main>
    </div>
  );
}
