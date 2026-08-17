"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  X,
  ChevronRight,
  ChevronLeft,
  Settings,
  FolderPlus,
  PackagePlus,
  Share2,
  FileCode,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface StepItem {
  stepNumber: number;
  title: string;
  subtitle: string;
  badge: string;
  icon: any;
  content: string;
  tips: string[];
  href: string;
  actionText: string;
  isExternal?: boolean;
}

const TOUR_STEPS: StepItem[] = [
  {
    stepNumber: 1,
    badge: "Langkah 1 dari 5",
    title: "Atur Nama Toko & WhatsApp Order",
    subtitle: "Menghubungkan pelanggan langsung ke WhatsApp Anda",
    icon: Settings,
    content: "Langkah pertama yang sangat penting adalah mengatur nama brand toko Anda dan nomor WhatsApp aktif. Semua pesanan pelanggan dari halaman katalog publik akan dikirim langsung ke WhatsApp ini.",
    tips: [
      "Gunakan format nomor internasional tanpa tanda + (contoh: 628123456789).",
      "Sesuaikan template kata-kata pesan otomatis sesuai selera toko Anda."
    ],
    href: "/admin/settings",
    actionText: "Buka Pengaturan Toko Sekarang",
  },
  {
    stepNumber: 2,
    badge: "Langkah 2 dari 5",
    title: "Buat Kategori Produk Pertama",
    subtitle: "Kelompokkan jenis barang agar pembeli tidak kebingungan",
    icon: FolderPlus,
    content: "Kategori membantu merapikan katalog toko Anda. Buat beberapa kelompok seperti 'Elektronik', 'Alat Tulis', 'Pakaian', atau 'Sembako'.",
    tips: [
      "Upload foto ikon/thumbnail kategori agar katalog terlihat menarik.",
      "Anda juga bisa mengatur template spesifikasi teknis khusus per kategori."
    ],
    href: "/admin/categories",
    actionText: "Kelola Kategori Produk",
  },
  {
    stepNumber: 3,
    badge: "Langkah 3 dari 5",
    title: "Tambah & Import Produk Katalog",
    subtitle: "Memasukkan daftar barang dagangan ke situs online",
    icon: PackagePlus,
    content: "Unggah produk-produk unggulan Anda lengkap dengan foto utama, deskripsi ringkas, dan harga.",
    tips: [
      "Bisa tambah produk satu per satu secara manual.",
      "Punya ratusan produk? Gunakan fitur Import Excel (.xlsx) untuk upload massal cepat."
    ],
    href: "/admin/products",
    actionText: "Buka Menu Produk",
  },
  {
    stepNumber: 4,
    badge: "Langkah 4 dari 5",
    title: "Bagikan Link Toko Online ke Pelanggan",
    subtitle: "Toko publik Anda siap dibuka untuk transaksi!",
    icon: Share2,
    content: "Setiap toko memiliki link unik publik. Anda dapat membagikan link ini ke pembeli di WhatsApp, Bio Instagram, Facebook, atau TikTok.",
    tips: [
      "Pembeli dapat melihat seluruh barang tanpa perlu install aplikasi.",
      "Tombol 'Pesan via WA' otomatis memproses pesanan langsung ke WhatsApp Anda."
    ],
    href: "/admin",
    actionText: "Lihat Ringkasan Toko",
  },
  {
    stepNumber: 5,
    badge: "Langkah 5 dari 5",
    title: "Custom Landing Page & Desain Bebas",
    subtitle: "Halaman promosi khusus pameran atau event promo",
    icon: FileCode,
    content: "Ingin buat halaman khusus promo seperti pameran atau diskon akhir tahun? Anda bisa mendesain Landing Page khusus dengan editor visual HTML/CSS bebas tanpa batasan.",
    tips: [
      "Dapat dihubungkan ke produk di katalog secara otomatis.",
      "Mendukung kustomisasi visual penuh untuk promosi bisnis Anda."
    ],
    href: "/admin/custom-pages",
    actionText: "Coba Builder Landing Page",
  },
];

export function InteractiveTourModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const router = useRouter();

  if (!isOpen) return null;

  const currentStep = TOUR_STEPS[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === TOUR_STEPS.length - 1;
  const Icon = currentStep.icon;

  const handleNext = () => {
    if (isLastStep) {
      onClose();
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleGoToFeature = () => {
    onClose();
    router.push(currentStep.href);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl border border-border bg-card shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between border-b px-6 py-4 bg-muted/40">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold text-primary uppercase tracking-wider">
                {currentStep.badge}
              </span>
              <h3 className="text-sm font-bold text-foreground leading-tight">
                Panduan Penggunaan KatalogHub
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            title="Tutup (Esc)"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Step Progress Line */}
        <div className="h-1.5 w-full bg-muted overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${((currentStepIndex + 1) / TOUR_STEPS.length) * 100}%` }}
          />
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-inner">
              <Icon className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold font-space text-foreground">
                {currentStep.title}
              </h2>
              <p className="text-xs text-muted-foreground">{currentStep.subtitle}</p>
            </div>
          </div>

          <div className="rounded-xl bg-muted/40 border border-border/60 p-4 text-sm text-foreground/90 leading-relaxed">
            {currentStep.content}
          </div>

          {/* Tips Box */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2">
            <span className="text-xs font-bold text-primary flex items-center gap-1.5 uppercase tracking-wider font-mono">
              <CheckCircle2 className="h-4 w-4" /> Tips Praktis:
            </span>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              {currentStep.tips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="border-t bg-muted/30 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Lewati (Skip)
            </Button>

            <Link
              href="/admin/panduan"
              onClick={onClose}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
              <BookOpen className="h-3.5 w-3.5" /> Halaman Panduan Lengkap
            </Link>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {!isFirstStep && (
              <Button variant="outline" size="sm" onClick={handlePrev} className="gap-1 text-xs">
                <ChevronLeft className="h-4 w-4" /> Sebelumnya
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={handleGoToFeature}
              className="text-xs font-semibold border-primary/40 text-primary hover:bg-primary/10 gap-1"
            >
              {currentStep.actionText} <ExternalLink className="h-3.5 w-3.5" />
            </Button>

            <Button size="sm" onClick={handleNext} className="gap-1 text-xs font-bold shadow-md">
              {isLastStep ? "Selesai" : "Lanjut"} {!isLastStep && <ChevronRight className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
