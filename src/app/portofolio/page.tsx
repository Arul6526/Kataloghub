import type { Metadata } from "next";
import Link from "next/link";
import { Space_Grotesk } from "next/font/google";
import {
  Sparkles,
  CheckCircle2,
  Smartphone,
  MessageCircle,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { PromoLayout } from "@/components/promo/promo-layout";
import { getSiteSettings } from "@/lib/public-data";
import { PortofolioClient } from "@/components/portofolio/portofolio-client";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: "Portofolio Showcase Landing Page Mitra - KatalogHub",
  description:
    "Lihat daftar preview landing page milik toko & UMKM yang menggunakan platform KatalogHub untuk berjualan online dan terima order instan via WhatsApp.",
};

// Showcase data for registered store owners
const FEATURED_SHOWCASES = [
  {
    id: "toko-tia",
    name: "LengkapinAja",
    slug: "toko-tia",
    categoryTag: "ATK & Perlengkapan Kantor",
    description:
      "Etalase katalog online lengkap Alat Tulis Kantor, kertas grid, stapler ergonomis, & aksesoris sekolah dengan sistem order otomatis langsung ke WhatsApp owner.",
    productCount: 150,
    categoryCount: 64,
    verified: true,
    badgeText: "Katalog Terpopuler",
    badgeColor: "bg-primary/10 text-primary border-primary/30",
    bannerGradient: "from-blue-600 via-primary to-indigo-700",
  },
  {
    id: "toko-5fb842",
    name: "Toko Berkah Jaya (Toko Gratis)",
    slug: "toko-5fb842",
    categoryTag: "Alat Tulis & Grosir Usaha",
    description:
      "Katalog etalase digital responsif untuk kebutuhan toko ATK, buku catatan spiral, marker penanda, dan perlengkapan meja kantor tanpa komisi platform.",
    productCount: 12,
    categoryCount: 5,
    verified: true,
    badgeText: "Mitra Terverifikasi",
    badgeColor: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
    bannerGradient: "from-emerald-600 via-teal-600 to-cyan-700",
  },
];

export default async function PortofolioPage() {
  // Fetch real site settings for LengkapinAja if available
  const dbTiaSettings = await getSiteSettings("toko-tia");
  const dbGratisSettings = await getSiteSettings("toko-5fb842");

  const showcases = [
    {
      ...FEATURED_SHOWCASES[0],
      name: dbTiaSettings?.brand_name || FEATURED_SHOWCASES[0].name,
      description: dbTiaSettings?.brand_tagline || FEATURED_SHOWCASES[0].description,
    },
    {
      ...FEATURED_SHOWCASES[1],
      name: dbGratisSettings?.brand_name || FEATURED_SHOWCASES[1].name,
      description: dbGratisSettings?.brand_tagline || FEATURED_SHOWCASES[1].description,
    },
  ];

  return (
    <PromoLayout>
      <div
        className={`min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground ${spaceGrotesk.variable}`}
      >
        {/* HERO HEADER PORTOFOLIO */}
        <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-background via-muted/20 to-muted/40 py-12 lg:py-20">
          <div className="bg-paper-grid pointer-events-none absolute inset-0 opacity-60" />
          <div className="pointer-events-none absolute left-1/2 top-0 h-80 w-[700px] max-w-[100vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-[100px]" />

          <div className="container relative z-10 mx-auto max-w-5xl space-y-4 px-4 text-center">
            <div className="mx-auto inline-flex w-max max-w-full items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-semibold tracking-wide text-primary shadow-sm">
              <Sparkles className="h-3.5 w-3.5 shrink-0" />
              <span>Bukti Nyata Toko yang Tumbuh Bersama KatalogHub</span>
            </div>

            <h1 className="mx-auto max-w-3xl font-space text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
              Lihat bagaimana bisnis tampil lebih siap dipercaya
              <br className="hidden sm:block" />
              <span className="text-primary">sebelum pelanggan menekan tombol order.</span>
            </h1>

            <p className="mx-auto max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-lg">
              Ini bukan mockup dan bukan janji kosong. Jelajahi etalase live milik toko mitra yang
              memakai KatalogHub untuk menampilkan produk dengan rapi dan mengarahkan pelanggan
              langsung ke WhatsApp.
            </p>

            {/* Quick Metrics Badges */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-4 text-xs font-semibold text-muted-foreground">
              <div className="flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 shadow-sm">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" /> 100% Bebas Komisi
                Transaksi
              </div>
              <div className="flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 shadow-sm">
                <Smartphone className="h-4 w-4 shrink-0 text-primary" /> Responsive Landing Page
              </div>
              <div className="flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 shadow-sm">
                <MessageCircle className="h-4 w-4 shrink-0 text-emerald-600" /> Integrasi WhatsApp
                Order
              </div>
            </div>
          </div>
        </section>

        {/* SHOWCASE CARDS GRID & INTERACTIVE CLIENT COMPONENT */}
        <section className="relative bg-background py-12 lg:py-16">
          <div className="container relative z-10 mx-auto max-w-6xl px-4">
            <PortofolioClient initialShowcases={showcases} />
          </div>
        </section>

        {/* CTA JOIN AS OWNER FOOTER */}
        <section className="relative overflow-hidden bg-primary py-14 text-primary-foreground lg:py-16">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,white,transparent_50%)] opacity-10"></div>
          <div className="container relative z-10 mx-auto max-w-3xl space-y-4 px-4 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white">
              <ShieldCheck className="h-3.5 w-3.5" /> Pendaftaran Toko Buka Sekarang
            </div>

            <h2 className="font-space text-2xl font-bold tracking-tight sm:text-4xl">
              Saatnya toko Anda punya etalase yang bekerja lebih keras.
            </h2>

            <p className="mx-auto max-w-xl text-sm leading-relaxed text-primary-foreground/90 sm:text-base">
              Mulai dari katalog yang rapi, lanjutkan dengan order yang lebih terarah. Buat toko
              Anda online dalam hitungan menit, tanpa perlu menunggu tim teknis.
            </p>

            <div className="flex flex-col justify-center gap-3 pt-2 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-background px-8 text-sm font-bold text-primary shadow-xl transition-transform hover:scale-105"
              >
                Bangun Toko Saya Sekarang <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </PromoLayout>
  );
}
