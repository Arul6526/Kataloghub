"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Settings, 
  FolderPlus, 
  PackagePlus, 
  Share2, 
  CheckCircle2, 
  ArrowRight, 
  ExternalLink,
  Sparkles,
  ChevronDown,
  ChevronUp
} from "lucide-react";

interface OnboardingGuideProps {
  storeSlug?: string;
  hasProducts: boolean;
  hasCategories: boolean;
  hasWhatsapp: boolean;
}

export function OnboardingGuide({
  storeSlug,
  hasProducts,
  hasCategories,
  hasWhatsapp,
}: OnboardingGuideProps) {
  const [isOpen, setIsOpen] = useState(true);

  const steps = [
    {
      id: 1,
      title: "1. Atur Profil & Nomor WhatsApp Toko",
      desc: "Isi nama brand dan nomor WhatsApp agar tombol 'Pesan via WA' langsung terhubung ke HP Anda.",
      href: "/admin/settings",
      actionText: "Buka Pengaturan Toko",
      icon: Settings,
      completed: hasWhatsapp,
      badge: "Langkah Pertama",
    },
    {
      id: 2,
      title: "2. Buat Kategori Produk",
      desc: "Kelompokkan produk Anda ke dalam kategori agar pembeli mudah menemukan barang yang dicari.",
      href: "/admin/categories",
      actionText: "Tambah Kategori Baru",
      icon: FolderPlus,
      completed: hasCategories,
      badge: "Organisasi Katalog",
    },
    {
      id: 3,
      title: "3. Tambahkan Produk Pertama Anda",
      desc: "Upload foto produk, isi nama, deskripsi, dan harga. Anda juga bisa mengunggah file Excel sekaligus.",
      href: "/admin/products/new",
      actionText: "Tambah Produk Baru",
      icon: PackagePlus,
      completed: hasProducts,
      badge: "Katalog Utama",
    },
    {
      id: 4,
      title: "4. Bagikan Link Toko Online ke Pelanggan",
      desc: "Katalog Anda sudah siap! Salin link toko publik Anda dan pasang di Bio Instagram atau WhatsApp.",
      href: storeSlug ? `/toko/${storeSlug}` : "#",
      isExternal: true,
      actionText: "Lihat Toko Publik Anda",
      icon: Share2,
      completed: hasProducts && hasWhatsapp,
      badge: "Siap Jualan",
    },
  ];

  const completedCount = steps.filter((s) => s.completed).length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);

  return (
    <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 p-6 shadow-sm relative overflow-hidden transition-all">
      {/* Background Accent */}
      <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-primary/10 blur-2xl pointer-events-none" />

      {/* Header Widget */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold shadow-inner">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-space font-bold text-lg text-foreground flex items-center gap-2">
              Panduan Cepat Memulai Toko Online
            </h2>
            <p className="text-xs text-muted-foreground">
              Ikuti 4 langkah praktis ini untuk menyiapkan katalog online toko Anda.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1 bg-muted/60 px-3 py-1.5 rounded-lg transition-colors"
        >
          {isOpen ? (
            <>
              Sembunyikan <ChevronUp className="h-3.5 w-3.5" />
            </>
          ) : (
            <>
              Tampilkan Panduan ({completedCount}/4) <ChevronDown className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5 mb-6">
        <div className="flex justify-between text-xs font-medium text-muted-foreground">
          <span>Kelengkapan Toko Anda</span>
          <span className="font-mono font-bold text-primary">{progressPercent}% Selesai</span>
        </div>
        <div className="h-2 w-full bg-muted/80 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Steps List */}
      {isOpen && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.id}
                className={`rounded-xl border p-4 flex flex-col justify-between space-y-3 transition-all ${
                  step.completed
                    ? "border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/10"
                    : "border-border bg-card/90 hover:border-primary/40 shadow-sm"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">
                      {step.badge}
                    </span>
                    {step.completed ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="h-4 w-4" /> Selesai
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground font-mono">Langkah {step.id}</span>
                    )}
                  </div>

                  <div className="flex items-start gap-3">
                    <div
                      className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        step.completed
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-foreground">{step.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-border/60 flex items-center justify-between">
                  {step.isExternal ? (
                    <a
                      href={step.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-primary hover:underline flex items-center gap-1.5"
                    >
                      {step.actionText} <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  ) : (
                    <Link
                      href={step.href}
                      className="text-xs font-bold text-primary hover:underline flex items-center gap-1.5"
                    >
                      {step.actionText} <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
