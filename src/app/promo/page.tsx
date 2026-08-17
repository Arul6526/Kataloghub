import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Space_Grotesk } from "next/font/google";
import {
  ArrowRight,
  Store,
  MousePointerClick,
  Smartphone,
  Globe,
  ShieldCheck,
  CheckCircle2,
  BarChart3,
  Search,
  LayoutTemplate,
  Sparkles,
  Check,
  Package,
  MessageCircle,
  Wand2,
} from "lucide-react";
import { PromoLayout } from "@/components/promo/promo-layout";
import { LiveSpecHero } from "@/components/promo/live-spec-hero";
import { MobileOrderFlowDemo } from "@/components/promo/mobile-order-flow-demo";
import { OneClickTemplateDemo } from "@/components/promo/one-click-template-demo";
import { AiTeamSection } from "@/components/promo/ai-team-section";
import { PLATFORM_ADMIN_WA } from "@/lib/whatsapp";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: "KatalogHub - Platform Pembuatan Website Katalog UMKM & ATK",
  description:
    "Bawa toko Alat Tulis Kantor & UMKM Anda ke ranah digital. Buat website katalog profesional Anda sendiri, pamerkan produk, dan terima pesanan langsung via WhatsApp dalam hitungan menit.",
};

const ATK_PRODUCTS = [
  {
    id: 1,
    title: "Pulpen Gel Ergo 0.5mm (Pack 12 pcs)",
    cat: "Pena & Alat Tulis",
    price: "Rp 35.000",
    image: "/demo-atk/pulpen-gel.png",
    rating: "4.9",
  },
  {
    id: 2,
    title: "Grid Spiral Notebook A5 Cover Kulit",
    cat: "Kertas & Buku",
    price: "Rp 48.000",
    image: "/demo-atk/buku-catatan.png",
    rating: "5.0",
  },
  {
    id: 3,
    title: "Highlighter Pastel Marker Set 6 Warna",
    cat: "Penanda & Highlight",
    price: "Rp 29.500",
    image: "/demo-atk/highlighter.png",
    rating: "4.8",
  },
  {
    id: 4,
    title: "Stapler Office Ergonomis & Isi Paperclip",
    cat: "Perlengkapan Meja",
    price: "Rp 52.000",
    image: "/demo-atk/stapler-set.png",
    rating: "4.9",
  },
];

export default function PromoPage() {
  return (
    <PromoLayout>
      <div
        className={`min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground ${spaceGrotesk.variable}`}
      >
        {/* HERO SECTION (PADDINGS NARROWED & TIGHTENED) */}
        <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-background via-muted/10 to-muted/20 py-10 lg:py-16">
          {/* Technical Blueprint Paper Grid Background */}
          <div className="bg-paper-grid absolute inset-0 opacity-70"></div>

          {/* Glowing Ambient Orb */}
          <div className="pointer-events-none absolute left-1/2 top-0 h-80 w-[700px] max-w-[100vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-[100px]"></div>

          <div className="container relative z-10 grid items-center gap-8 px-4 lg:grid-cols-2 lg:gap-12">
            <div className="flex max-w-2xl flex-col gap-6 duration-700 animate-in slide-in-from-bottom-6 fill-mode-both">
              <div className="inline-flex w-max max-w-full flex-wrap items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-semibold tracking-wide text-primary shadow-sm">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
                </span>
                <span>🚀 Platform Katalog Digital & Order WhatsApp</span>
              </div>

              <h1 className="font-space text-3xl font-bold leading-[1.15] tracking-tight sm:text-5xl lg:text-6xl">
                Bikin Katalog Rapi, <br className="hidden sm:block" />
                <span className="text-primary">Terima Order Langsung ke WA.</span>
              </h1>

              <p className="max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-lg">
                Tampilkan produk secara profesional, kurangi pertanyaan berulang, dan buat calon
                pembeli langsung pesan ke WhatsApp toko Anda. Dilengkapi versi aplikasi HP yang
                mudah dipasang!
              </p>

              <div className="flex flex-col gap-3 pt-1 sm:flex-row">
                <Link
                  href="/register"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-7 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:scale-[1.02] hover:bg-primary/90"
                >
                  Daftar Sekarang <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-input bg-background px-7 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                >
                  Masuk ke Dashboard
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" /> Setup 5 Menit
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" /> Tanpa Kartu Kredit
                </div>
                <div className="flex items-center gap-1.5">
                  <Smartphone className="h-4 w-4 shrink-0 text-primary" /> Versi Aplikasi HP (PWA)
                </div>
              </div>
            </div>

            {/* Signature Element */}
            <div className="relative mx-auto w-full max-w-lg pb-4 delay-150 duration-700 animate-in fade-in zoom-in-95 fill-mode-both sm:pb-0 lg:max-w-none">
              <div className="overflow-hidden rounded-xl border border-border bg-card/70 shadow-xl ring-1 ring-primary/10 backdrop-blur-xl">
                <div className="flex h-9 items-center gap-2 border-b border-border bg-muted/60 px-3">
                  <div className="flex shrink-0 gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-red-500/80"></div>
                    <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/80"></div>
                    <div className="h-2.5 w-2.5 rounded-full bg-green-500/80"></div>
                  </div>
                  <div className="ml-2 flex h-5 w-36 items-center truncate rounded border border-border bg-background px-2 text-[10px] text-muted-foreground sm:ml-3 sm:w-44">
                    kataloghub.com/toko/bisnis-anda
                  </div>
                </div>
                <div className="pointer-events-none p-1">
                  <LiveSpecHero />
                </div>
              </div>

              {/* Floating Badge */}
              <div className="absolute -bottom-3 left-3 z-20 flex items-center gap-2.5 rounded-lg border border-border bg-background/95 p-2.5 shadow-lg backdrop-blur sm:-bottom-4 sm:-left-4 sm:gap-3 sm:p-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 sm:h-9 sm:w-9">
                  <Smartphone className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-[9px] font-semibold uppercase text-muted-foreground sm:text-[10px]">
                    Order Baru
                  </p>
                  <p className="text-xs font-bold text-foreground">Via WhatsApp</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* WORKFLOW ANIMATION DEMO SECTION */}
        <MobileOrderFlowDemo />

        {/* VALUE PROP SECTION (NARROWED PADDING & PAPER DOTS TEXTURE) */}
        <section
          id="solusi"
          className="bg-paper-dots relative overflow-hidden border-b border-border bg-card py-10 sm:py-12 lg:py-16"
        >
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-card/85 via-card/95 to-card"></div>

          <div className="container relative z-10 px-4">
            <div className="mx-auto mb-8 max-w-2xl space-y-2 text-center sm:mb-10">
              <h2 className="font-space text-2xl font-bold tracking-tight sm:text-3xl">
                Kenapa Toko & UMKM Memilih KatalogHub?
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                Dirancang khusus memangkas kerumitan teknis, membuat etalase digital Anda langsung
                aktif & siap terima order.
              </p>
            </div>

            {/* Asymmetrical Feature Showcase Grid */}
            <div className="grid items-stretch gap-5 sm:gap-6 lg:grid-cols-12">
              {/* Main Feature Highlight */}
              <div className="flex flex-col justify-between rounded-xl border border-border bg-background/90 p-4 shadow-sm backdrop-blur transition-shadow hover:shadow-md sm:p-6 lg:col-span-7 lg:p-8">
                <div className="space-y-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
                    <Smartphone className="h-5 w-5" />
                  </div>
                  <h3 className="font-space text-lg font-bold tracking-tight sm:text-xl">
                    Order Langsung via WhatsApp tanpa Komisi Platform
                  </h3>
                  <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
                    Setiap produk di etalase dilengkapi tombol pemesanan WhatsApp otomatis. Saat
                    pembeli order, pesan terformat rapi dengan rincian nama produk, varian, dan
                    harga.
                  </p>
                </div>

                {/* Simulated Order Notification Box */}
                <div className="mt-5 flex items-center gap-2.5 rounded-lg border border-border bg-muted/40 p-2.5 sm:mt-6 sm:gap-3 sm:p-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 sm:h-9 sm:w-9">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-bold text-foreground sm:text-xs">
                      Format Pesan WhatsApp Otomatis
                    </p>
                    <p className="truncate text-[10px] text-muted-foreground sm:text-[11px]">
                      Halo, saya ingin pesan &quot;Pulpen Gel Ergo 0.5mm&quot; sejumlah 2 pack...
                    </p>
                  </div>
                  <span className="shrink-0 rounded border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-semibold text-emerald-600 sm:text-[10px]">
                    Instan
                  </span>
                </div>
              </div>

              {/* Secondary Feature Cards */}
              <div className="flex flex-col justify-between gap-4 sm:gap-6 lg:col-span-5">
                <div className="relative flex flex-1 flex-col justify-center space-y-2 overflow-hidden rounded-xl border border-primary/30 bg-primary/5 p-4 shadow-sm transition-colors hover:border-primary/50 sm:p-5">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm sm:h-9 sm:w-9">
                      <Wand2 className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase text-primary-foreground">
                        Fitur UMKM 1-Klik
                      </span>
                      <h3 className="text-sm font-bold tracking-tight text-foreground sm:text-base">
                        Template Toko Siap Pakai
                      </h3>
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Pengguna baru tidak akan pusing dari 0! Cukup 1-klik pilih bidang usaha Anda
                    (Kuliner, ATK, Fashion, Sembako, dll), etalase toko langsung terisi contoh
                    produk yang tinggal Anda sunting.
                  </p>
                </div>

                <div className="flex flex-1 flex-col justify-center space-y-2 rounded-xl border border-border bg-background/90 p-4 shadow-sm backdrop-blur transition-colors hover:border-primary/40 sm:p-5">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary sm:h-9 sm:w-9">
                      <LayoutTemplate className="h-4 w-4" />
                    </div>
                    <h3 className="text-sm font-bold tracking-tight sm:text-base">
                      Tampilan Otomatis Rapi & Responsif
                    </h3>
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Setiap produk yang Anda upload otomatis tersusun rapi di layar ponsel maupun
                    laptop dengan tampilan etalase profesional.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ONE-CLICK TEMPLATE INTERACTIVE DEMO (NON-AUTOPLAY / LIGHTWEIGHT) */}
        <OneClickTemplateDemo />

        {/* AI TEAM FEATURE */}
        <AiTeamSection />

        {/* FEATURES SHOWCASE (TECHNICAL PAPER GRID BACKGROUND + NARROWED GAP) */}
        <section
          id="fitur"
          className="bg-paper-grid relative overflow-hidden border-b border-border bg-background py-12 lg:py-16"
        >
          {/* Gradient Overlay for subtle blueprint contrast */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background"></div>

          <div className="container relative z-10 px-4">
            <div className="grid items-center gap-10 lg:grid-cols-2">
              {/* Left Column: ATK Live Storefront Demo */}
              <div className="relative order-2 lg:order-1">
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary/30 via-blue-500/20 to-primary/20 opacity-60 blur-lg"></div>

                <div className="relative overflow-hidden rounded-xl border border-border bg-card/95 shadow-xl ring-1 ring-border backdrop-blur-xl">
                  {/* Browser Mockup Header Bar */}
                  <div className="flex h-10 items-center justify-between border-b border-border bg-muted/70 px-3.5">
                    <div className="flex items-center gap-2">
                      <Store className="h-4 w-4 text-primary" />
                      <span className="text-xs font-bold text-foreground">
                        Toko ATK Berkah Jaya
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500"></span>
                      Active Catalog
                    </span>
                  </div>

                  {/* Filter & Search Toolbar */}
                  <div className="space-y-2 border-b border-border bg-muted/20 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex flex-1 items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground">
                        <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <span className="truncate">Cari alat tulis, kertas, highlighter...</span>
                      </div>
                      <span className="whitespace-nowrap text-[10px] font-medium text-muted-foreground">
                        4 Produk
                      </span>
                    </div>

                    {/* Category Tags */}
                    <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto text-[10px]">
                      <span className="whitespace-nowrap rounded-full bg-primary px-2.5 py-0.5 font-semibold text-primary-foreground">
                        Semua ATK
                      </span>
                      <span className="whitespace-nowrap rounded-full border border-border bg-background px-2.5 py-0.5 text-muted-foreground">
                        Pena & Tulis
                      </span>
                      <span className="whitespace-nowrap rounded-full border border-border bg-background px-2.5 py-0.5 text-muted-foreground">
                        Buku & Kertas
                      </span>
                      <span className="whitespace-nowrap rounded-full border border-border bg-background px-2.5 py-0.5 text-muted-foreground">
                        Marker
                      </span>
                    </div>
                  </div>

                  {/* ATK Products Grid */}
                  <div className="grid gap-3 bg-background/50 p-3 sm:grid-cols-2">
                    {ATK_PRODUCTS.map((prod) => (
                      <div
                        key={prod.id}
                        className="group flex flex-col justify-between space-y-2 rounded-lg border border-border bg-background p-2.5 transition-all duration-200 hover:border-primary/50 hover:shadow-md"
                      >
                        <div className="relative aspect-[4/3] overflow-hidden rounded border border-border/60 bg-muted/30">
                          <Image
                            src={prod.image}
                            alt={prod.title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            unoptimized
                          />
                          <span className="absolute left-1.5 top-1.5 rounded bg-background/90 px-1.5 py-0.5 text-[9px] font-semibold text-foreground shadow-sm backdrop-blur">
                            {prod.cat}
                          </span>
                        </div>

                        <div className="space-y-0.5">
                          <p className="line-clamp-1 text-xs font-bold leading-snug text-foreground">
                            {prod.title}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                              {prod.price}
                            </span>
                            <span className="text-[10px] font-medium text-muted-foreground">
                              ★ {prod.rating}
                            </span>
                          </div>
                        </div>

                        <a
                          href="https://wa.me/628123456789"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex w-full items-center justify-center gap-1 rounded bg-emerald-600 py-1 text-[10px] font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700"
                        >
                          <Smartphone className="h-3 w-3" /> Order WA
                        </a>
                      </div>
                    ))}
                  </div>

                  {/* Banner Info Footer Preview */}
                  <div className="flex items-center justify-between border-t border-border bg-muted/40 p-2.5 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1 font-medium">
                      <Package className="h-3.5 w-3.5 text-primary" /> Kirim Seluruh Indonesia
                    </span>
                    <span className="font-semibold text-primary">KatalogHub Powered</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Features List */}
              <div className="order-1 space-y-6 lg:order-2">
                <div>
                  <h2 className="mb-2 font-space text-2xl font-bold tracking-tight sm:text-3xl">
                    Etalase Lengkap & Performa Cepat untuk Toko Anda
                  </h2>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Fondasi sistem teruji, memastikan etalase toko Anda selalu cepat diakses tanpa
                    membebankan pembeli.
                  </p>
                </div>

                <ul className="space-y-4">
                  {[
                    {
                      icon: Wand2,
                      title: "Template Toko Instant Siap Pakai (1-Klik Setup)",
                      desc: "Pengguna baru tidak akan pusing buat etalase dari nol! Pilih bidang usaha Anda (ATK, Kuliner, Fashion, Sembako, Jasa, dll), sistem langsung menyiapkan toko beserta contoh produk yang tinggal Anda sunting.",
                    },
                    {
                      icon: Smartphone,
                      title: "Dapat Dipasang di HP Tanpa Download",
                      desc: "Etalase toko dapat langsung dipasang di layar utama HP (Android & iOS) dengan 1 klik tanpa perlu download dari Play Store atau App Store.",
                    },
                    {
                      icon: Globe,
                      title: "Mudah Ditemukan Pembeli di Google",
                      desc: "Struktur etalase dan informasi produk dioptimalkan otomatis agar mudah muncul saat calon pembeli mencari di Google.",
                    },
                    {
                      icon: Search,
                      title: "Pencarian Cepat & Filter Kategori",
                      desc: "Memudahkan pelanggan mencari spesifikasi produk, stok, atau kategori dengan sistem pencarian instan.",
                    },
                    {
                      icon: ShieldCheck,
                      title: "Data Toko & Stok Aman Terlindungi",
                      desc: "Seluruh data katalog, stok produk, dan harga terisolasi aman dalam database terenkripsi.",
                    },
                    {
                      icon: BarChart3,
                      title: "Loading Super Cepat Tanpa Lag",
                      desc: "Etalase terbuka instan dari jaringan HP manapun tanpa kendala.",
                    },
                  ].map((item, i) => (
                    <li key={i} className="flex gap-3">
                      <div className="mt-0.5 shrink-0">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary shadow-sm">
                          <item.icon className="h-4.5 w-4.5" />
                        </div>
                      </div>
                      <div className="space-y-0.5">
                        <h3 className="text-sm font-bold text-foreground">{item.title}</h3>
                        <p className="text-xs leading-relaxed text-muted-foreground">{item.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* PRICING SECTION (ADAPTS DYNAMICALLY TO LIGHT & DARK MODES) */}
        <section
          id="harga"
          className="bg-paper-dots relative overflow-hidden border-b border-border bg-card py-12 text-foreground lg:py-16"
        >
          {/* Background Gradient Overlay */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/90 via-background/95 to-background" />

          <div className="container relative z-10 mx-auto max-w-6xl px-4">
            <div className="mx-auto mb-12 max-w-2xl space-y-2 text-center">
              <h2 className="font-space text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Pilih Paket Sesuai Skala Bisnis Anda
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Mulai gratis tanpa komitmen. Tingkatkan fitur toko kapan saja sesuai pertumbuhan
                usaha Anda.
              </p>
            </div>

            <div className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {/* Card 1: Free Trial */}
              <div className="flex flex-col justify-between space-y-6 rounded-2xl border border-border bg-card p-6 shadow-md transition-all hover:shadow-lg">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="font-space text-xl font-bold text-foreground">Free Trial</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold text-foreground">Gratis</span>
                      <span className="font-mono text-xs text-muted-foreground">/ 3 bulan</span>
                    </div>
                  </div>

                  {/* BATASAN KUOTA */}
                  <div className="space-y-2 border-t border-border/80 pt-2">
                    <span className="block font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      BATASAN KUOTA:
                    </span>
                    <ul className="space-y-1.5 text-xs text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 shrink-0 text-primary" />
                        <span>
                          Hingga <strong className="font-bold text-foreground">5 produk</strong>
                        </span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 shrink-0 text-primary" />
                        <span>
                          Hingga{" "}
                          <strong className="font-bold text-foreground">
                            1 custom landing page
                          </strong>
                        </span>
                      </li>
                    </ul>
                  </div>

                  {/* FITUR UTAMA */}
                  <div className="space-y-2.5 border-t border-border/80 pt-3">
                    <span className="block font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      FITUR UTAMA:
                    </span>
                    <ul className="space-y-2 text-xs text-muted-foreground">
                      {[
                        "Katalog online publik",
                        "Subdomain toko (/toko/nama)",
                        "5 produk",
                        "1 custom landing page",
                        "Masa aktif 3 bulan",
                        "WhatsApp order integration",
                      ].map((item, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <a
                  href={`https://wa.me/${PLATFORM_ADMIN_WA}?text=${encodeURIComponent("Halo Admin KatalogHub, saya tertarik dengan paket Free Trial")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-input bg-background px-4 py-3 text-center text-xs font-bold text-foreground shadow-sm transition-colors hover:bg-muted"
                >
                  <MessageCircle className="h-4 w-4 text-primary" />
                  Pilih Paket ini via WA
                </a>
              </div>

              {/* Card Starter: Starter Plan */}
              <div className="flex flex-col justify-between space-y-6 rounded-2xl border border-border bg-card p-6 shadow-md transition-all hover:shadow-lg">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="font-space text-xl font-bold text-foreground">Starter</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold text-foreground">Rp20.000</span>
                      <span className="font-mono text-xs text-muted-foreground">/ 1 bulan</span>
                    </div>
                  </div>

                  {/* BATASAN KUOTA */}
                  <div className="space-y-2 border-t border-border/80 pt-2">
                    <span className="block font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      BATASAN KUOTA:
                    </span>
                    <ul className="space-y-1.5 text-xs text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 shrink-0 text-primary" />
                        <span>
                          Hingga <strong className="font-bold text-foreground">20 produk</strong>
                        </span>
                      </li>
                      <li className="flex items-center gap-2 text-muted-foreground/70">
                        <span className="flex h-4 w-4 shrink-0 items-center justify-center text-xs font-bold">
                          ✕
                        </span>
                        <span>Tanpa custom landing page</span>
                      </li>
                    </ul>
                  </div>

                  {/* FITUR UTAMA */}
                  <div className="space-y-2.5 border-t border-border/80 pt-3">
                    <span className="block font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      FITUR UTAMA:
                    </span>
                    <ul className="space-y-2 text-xs text-muted-foreground">
                      {[
                        "Katalog online publik",
                        "Subdomain toko (/toko/nama)",
                        "Maksimal 20 produk",
                        "Tanpa custom landing page",
                        "Masa aktif 1 bulan",
                        "WhatsApp order integration",
                      ].map((item, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <a
                  href={`https://wa.me/${PLATFORM_ADMIN_WA}?text=${encodeURIComponent("Halo Admin KatalogHub, saya tertarik dengan paket Starter (Rp20.000 / 1 bulan)")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-input bg-background px-4 py-3 text-center text-xs font-bold text-foreground shadow-sm transition-colors hover:bg-muted"
                >
                  <MessageCircle className="h-4 w-4 text-primary" />
                  Pilih Paket ini via WA
                </a>
              </div>

              {/* Card 2: Pro Plan (PALING POPULER) */}
              <div className="relative flex flex-col justify-between space-y-6 rounded-2xl border-2 border-primary bg-card p-6 shadow-xl">
                {/* Top Badge */}
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full border border-primary/40 bg-primary px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground shadow-md">
                  PALING POPULER
                </div>

                <div className="space-y-4 pt-1">
                  <div className="space-y-1">
                    <h3 className="font-space text-xl font-bold text-primary">Pro Plan</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold text-foreground">Rp165.000</span>
                      <span className="font-mono text-xs text-muted-foreground">/ per tahun</span>
                    </div>
                  </div>

                  {/* BATASAN KUOTA */}
                  <div className="space-y-2 border-t border-border/80 pt-2">
                    <span className="block font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      BATASAN KUOTA:
                    </span>
                    <ul className="space-y-1.5 text-xs text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 shrink-0 text-primary" />
                        <span>
                          Hingga <strong className="font-bold text-foreground">200 produk</strong>
                        </span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 shrink-0 text-primary" />
                        <span>
                          Hingga{" "}
                          <strong className="font-bold text-foreground">
                            2 custom landing page
                          </strong>
                        </span>
                      </li>
                    </ul>
                  </div>

                  {/* FITUR UTAMA */}
                  <div className="space-y-2.5 border-t border-border/80 pt-3">
                    <span className="block font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      FITUR UTAMA:
                    </span>
                    <ul className="space-y-2 text-xs text-muted-foreground">
                      {[
                        "Semua fitur Free Trial",
                        "200 produk",
                        "2 custom landing page",
                        "Masa aktif 1 tahun",
                        "Template spesifikasi produk",
                        "Import produk massal (Excel)",
                        "Prioritas support",
                      ].map((item, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <a
                  href={`https://wa.me/${PLATFORM_ADMIN_WA}?text=${encodeURIComponent("Halo Admin KatalogHub, saya tertarik dengan Pro Plan")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-center text-xs font-bold text-primary-foreground shadow-md transition-colors hover:bg-primary/90"
                >
                  <MessageCircle className="h-4 w-4" />
                  Pilih Paket ini via WA
                </a>
              </div>

              {/* Card 3: Enterprise */}
              <div className="flex flex-col justify-between space-y-6 rounded-2xl border border-border bg-card p-6 shadow-md transition-all hover:shadow-lg">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="font-space text-xl font-bold text-foreground">Enterprise</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold text-foreground">Custom</span>
                      <span className="font-mono text-xs text-muted-foreground">/ custom</span>
                    </div>
                  </div>

                  {/* BATASAN KUOTA */}
                  <div className="space-y-2 border-t border-border/80 pt-2">
                    <span className="block font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      BATASAN KUOTA:
                    </span>
                    <ul className="space-y-1.5 text-xs text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 shrink-0 text-primary" />
                        <span>
                          Hingga <strong className="font-bold text-foreground">1000 produk</strong>
                        </span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 shrink-0 text-primary" />
                        <span>
                          Hingga{" "}
                          <strong className="font-bold text-foreground">
                            50 custom landing page
                          </strong>
                        </span>
                      </li>
                    </ul>
                  </div>

                  {/* FITUR UTAMA */}
                  <div className="space-y-2.5 border-t border-border/80 pt-3">
                    <span className="block font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      FITUR UTAMA:
                    </span>
                    <ul className="space-y-2 text-xs text-muted-foreground">
                      {[
                        "Semua fitur Pro",
                        "Produk unlimited (menyesuaikan)",
                        "Custom landing page unlimited",
                        "Custom domain / subdomain",
                        "Dedicated support",
                      ].map((item, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <a
                  href={`https://wa.me/${PLATFORM_ADMIN_WA}?text=${encodeURIComponent("Halo Admin KatalogHub, saya tertarik dengan paket Enterprise")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-input bg-background px-4 py-3 text-center text-xs font-bold text-foreground shadow-sm transition-colors hover:bg-muted"
                >
                  <MessageCircle className="h-4 w-4 text-primary" />
                  Pilih Paket ini via WA
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* CTA FOOTER */}
        <section className="relative overflow-hidden bg-primary py-14 text-primary-foreground lg:py-16">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,white,transparent_50%)] opacity-10"></div>
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:24px_24px] opacity-[0.03]"></div>

          <div className="container relative z-10 mx-auto max-w-3xl space-y-4 text-center">
            <h2 className="font-space text-3xl font-bold tracking-tighter sm:text-4xl">
              Mulai Digitalisasi Toko Hari Ini
            </h2>
            <p className="mx-auto max-w-xl text-base leading-relaxed text-primary-foreground/90 sm:text-lg">
              Bergabunglah dengan ratusan pemilik toko & UMKM lainnya yang telah mempercayakan
              etalase digital mereka kepada KatalogHub.
            </p>

            <div className="flex flex-col justify-center gap-3 pt-2 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-background px-8 text-sm font-bold text-primary shadow-xl transition-transform hover:scale-105"
              >
                Buat Katalog Sekarang <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <p className="text-xs font-medium text-primary-foreground/80">
              Tidak perlu kartu kredit • Gratis setup • Langsung online
            </p>
          </div>
        </section>
      </div>
    </PromoLayout>
  );
}
