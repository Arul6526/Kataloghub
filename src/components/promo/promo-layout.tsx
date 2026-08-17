"use client";

import * as React from "react";
import Link from "next/link";
import { Space_Grotesk } from "next/font/google";
import {
  Database,
  ShieldCheck,
  Twitter,
  Github,
  Linkedin,
  Menu,
  X,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

import { usePathname } from "next/navigation";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-grotesk",
});

function PromoHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const pathname = usePathname();

  return (
    <header className="shadow-xs sticky top-0 z-50 w-full border-b border-border bg-background/90 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/promo" className="group flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md transition-transform group-hover:scale-105">
              <Database className="h-5 w-5" />
            </span>
            <span
              className={`font-space text-lg font-bold tracking-tight text-foreground ${spaceGrotesk.className}`}
            >
              Katalog<span className="text-primary">Hub</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
            <Link href="/promo#solusi" className="py-1 transition-colors hover:text-foreground">
              Solusi UMKM
            </Link>
            <Link href="/promo#fitur" className="py-1 transition-colors hover:text-foreground">
              Fitur Utama
            </Link>
            <Link href="/promo#ai-team" className="py-1 transition-colors hover:text-foreground">
              AI Team
            </Link>
            <Link href="/promo#harga" className="py-1 transition-colors hover:text-foreground">
              Harga
            </Link>
            <Link
              href="/portofolio"
              className={`py-1 transition-colors ${
                pathname === "/portofolio"
                  ? "font-semibold text-foreground"
                  : "hover:text-foreground"
              }`}
            >
              Portofolio
            </Link>
          </nav>
        </div>

        {/* Desktop Actions */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          <div className="hidden items-center gap-3 text-sm font-medium md:flex">
            <Link
              href="/login"
              className="rounded-md px-3.5 py-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground shadow-sm transition-all hover:scale-[1.02] hover:bg-primary/90"
            >
              Daftar Gratis <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-border text-foreground transition-colors hover:bg-muted md:hidden"
            aria-label={mobileMenuOpen ? "Tutup menu" : "Buka menu"}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="space-y-4 border-b border-border bg-background px-4 py-6 duration-200 animate-in slide-in-from-top-2 md:hidden">
          <nav className="flex flex-col space-y-3 text-base font-medium">
            <Link
              href="/promo#solusi"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between rounded-md p-2 transition-colors hover:bg-muted"
            >
              Solusi UMKM
            </Link>
            <Link
              href="/promo#fitur"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between rounded-md p-2 transition-colors hover:bg-muted"
            >
              Fitur Utama
            </Link>
            <Link
              href="/promo#ai-team"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between rounded-md p-2 transition-colors hover:bg-muted"
            >
              AI Team
            </Link>
            <Link
              href="/promo#harga"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between rounded-md p-2 transition-colors hover:bg-muted"
            >
              Harga Paket
            </Link>
            <Link
              href="/portofolio"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center justify-between rounded-md p-2 transition-colors ${
                pathname === "/portofolio"
                  ? "bg-muted font-semibold text-foreground"
                  : "hover:bg-muted"
              }`}
            >
              Portofolio
            </Link>
          </nav>

          <div className="flex flex-col gap-2.5 border-t border-border pt-4">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full rounded-lg border border-input py-2.5 text-center font-medium transition-colors hover:bg-muted"
            >
              Masuk ke Dashboard
            </Link>
            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full rounded-lg bg-primary py-2.5 text-center font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              Daftar Sekarang
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

function PromoFooter() {
  return (
    <footer className="border-t border-border bg-card text-card-foreground">
      <div className="container py-12 md:py-16">
        <div className="grid gap-8 md:grid-cols-4 lg:grid-cols-5">
          <div className="space-y-4 lg:col-span-2">
            <Link href="/promo" className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow">
                <Database className="h-4 w-4" />
              </span>
              <span
                className={`font-space text-lg font-bold tracking-tight text-foreground ${spaceGrotesk.className}`}
              >
                Katalog<span className="text-primary">Hub</span>
              </span>
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              Platform infrastruktur website katalog profesional untuk UMKM Indonesia. Buat etalase
              digital tanpa coding & terima pesanan langsung via WhatsApp.
            </p>

            {/* Social media icons with proper min 44x44px touch targets */}
            <div className="flex items-center gap-2 pt-2 text-muted-foreground">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="flex h-11 w-11 items-center justify-center rounded-lg border border-border transition-colors hover:bg-muted hover:text-foreground"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="flex h-11 w-11 items-center justify-center rounded-lg border border-border transition-colors hover:bg-muted hover:text-foreground"
              >
                <Github className="h-4 w-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="flex h-11 w-11 items-center justify-center rounded-lg border border-border transition-colors hover:bg-muted hover:text-foreground"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Produk
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="#fitur" className="transition-colors hover:text-foreground">
                  Fitur Utama
                </Link>
              </li>
              <li>
                <Link href="#solusi" className="transition-colors hover:text-foreground">
                  Solusi UMKM
                </Link>
              </li>
              <li>
                <Link href="#harga" className="transition-colors hover:text-foreground">
                  Harga Paket
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">Akun</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/login" className="transition-colors hover:text-foreground">
                  Masuk Seller
                </Link>
              </li>
              <li>
                <Link href="/register" className="transition-colors hover:text-foreground">
                  Daftar Toko
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Keamanan
            </h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-500" /> Multi-Tenant Encrypted
                DB
              </p>
              <p className="text-xs text-muted-foreground">WhatsApp Instant Order Gateway</p>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between border-t border-border/60 pt-8 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} KatalogHub. Seluruh hak cipta dilindungi.</p>
          <div className="mt-4 flex items-center gap-2 sm:mt-0">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span>Platform Terenkripsi & Terlindungi</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function PromoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`flex min-h-screen flex-col bg-background text-foreground ${spaceGrotesk.variable}`}
    >
      <PromoHeader />
      <main className="flex-1">{children}</main>
      <PromoFooter />
    </div>
  );
}
