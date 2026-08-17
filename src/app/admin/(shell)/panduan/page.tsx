"use client";

import Link from "next/link";
import {
  Sparkles,
  Settings,
  FolderPlus,
  PackagePlus,
  Share2,
  FileCode,
  ArrowRight,
  BookOpen,
  HelpCircle,
  CheckCircle2,
  ExternalLink,
  MessageCircle,
  Database,
  Search,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTour } from "@/components/admin/tour-provider";

export default function PanduanPage() {
  const { openTour } = useTour();

  const steps = [
    {
      id: 1,
      title: "1. Atur Profil & Nomor WhatsApp Toko",
      category: "Pengaturan Awal",
      desc: "Langkah terpenting agar pesanan pembeli terkirim ke WhatsApp Anda. Atur nama brand, logo, tagline, dan nomor WhatsApp toko.",
      href: "/admin/settings",
      actionText: "Buka Pengaturan Toko",
      icon: Settings,
      details: [
        "Masukkan nomor WA internasional tanpa tanda '+' (misal: 628123456789).",
        "Sesuaikan template pesan yang dikirim pelanggan saat menekan tombol order.",
        "Upload logo toko untuk mempercantik header katalog publik Anda."
      ]
    },
    {
      id: 2,
      title: "2. Buat Kategori Produk",
      category: "Struktur Katalog",
      desc: "Pengelompokan barang membantu calon pembeli menelusuri katalog Anda dengan cepat dan rapi.",
      href: "/admin/categories",
      actionText: "Kelola Kategori Produk",
      icon: FolderPlus,
      details: [
        "Buat kategori sesuai kelompok produk (misal: Perkakas, Alat Tulis, Pakaian).",
        "Unggah thumbnail foto untuk setiap kategori.",
        "Gunakan fitur Template Spesifikasi bila produk Anda memiliki spek teknis."
      ]
    },
    {
      id: 3,
      title: "3. Tambah & Upload Produk Katalog",
      category: "Katalog Produk",
      desc: "Masukkan produk-produk unggulan lengkap dengan foto, deskripsi, harga, dan tag pencarian.",
      href: "/admin/products",
      actionText: "Buka Menu Produk",
      icon: PackagePlus,
      details: [
        "Tambah produk satu per satu lewat form intuitif.",
        "Punya banyak produk? Gunakan fitur Import Excel (.xlsx) untuk upload massal.",
        "Atur status 'Visible' agar produk langsung tampil di situs publik."
      ]
    },
    {
      id: 4,
      title: "4. Bagikan Link Toko Online ke Pelanggan",
      category: "Siap Jualan",
      desc: "Katalog online Anda sudah aktif! Salin URL publik toko dan pasang di media sosial Anda.",
      href: "/admin",
      actionText: "Cek Overview Toko",
      icon: Share2,
      details: [
        "Format link toko publik: /toko/[slug-toko-anda].",
        "Pasang link di Bio Instagram, TikTok, Facebook, atau broadcast WhatsApp.",
        "Pelanggan dapat langsung membuka toko tanpa perlu install aplikasi."
      ]
    },
    {
      id: 5,
      title: "5. Buat Custom Landing Page Promo (Opsional)",
      category: "Fitur Lanjutan",
      desc: "Ingin buat halaman khusus pameran, event promo, atau landing page penawaran khusus?",
      href: "/admin/custom-pages",
      actionText: "Coba Page Builder",
      icon: FileCode,
      details: [
        "Buat halaman promosi berdesain bebas sesuai brand Anda.",
        "Hubungkan tombol aksi landing page langsung ke katalog atau WhatsApp.",
        "Bisa diatur sebagai halaman utama toko jika diaktifkan."
      ]
    }
  ];

  const faqs = [
    {
      q: "Apakah pelanggan harus membuat akun untuk membeli?",
      a: "Tidak perlu. KatalogHub dirancang agar pembeli dapat langsung menelusuri produk dan memesan cepat via WhatsApp tanpa pendaftaran yang rumit."
    },
    {
      q: "Bagaimana cara mengubah nama atau logo toko saya?",
      a: "Anda dapat mengubah nama brand, slogan, dan logo kapan saja melalui menu Site Setting & WhatsApp di sidebar admin."
    },
    {
      q: "Apakah ada batasan jumlah produk yang bisa saya upload?",
      a: "Kapasitas produk dan fitur lanjutan disesuaikan dengan paket berlangganan toko Anda (Free Trial / Pro / Enterprise). Cek menu Berlangganan (SaaS) untuk info kuota."
    },
    {
      q: "Bagaimana jika saya membutuhkan bantuan teknis?",
      a: "Anda dapat menghubungi tim support platform via tombol bantuan atau WhatsApp Admin yang tersedia di halaman akun."
    }
  ];

  return (
    <div className="space-y-10 pb-12">
      {/* Header Banner */}
      <div className="relative rounded-2xl border border-primary/20 bg-gradient-to-r from-card via-card to-primary/10 p-6 sm:p-8 shadow-sm overflow-hidden">
        <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
              <Sparkles className="h-3.5 w-3.5" /> Panduan Resmi KatalogHub
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-space text-foreground tracking-tight">
              Panduan Lengkap Penggunaan Platform
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Pelajari langkah-langkah praktis untuk menyiapkan katalog online toko Anda, mengunggah produk, hingga siap menerima pesanan dari pelanggan.
            </p>
          </div>

          <Button
            size="lg"
            onClick={openTour}
            className="font-bold gap-2 shadow-lg hover:scale-105 transition-transform shrink-0"
          >
            <Zap className="h-5 w-5 fill-current" /> Buka Tour Pop-up Interaktif
          </Button>
        </div>
      </div>

      {/* Main Steps Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold font-space text-foreground flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" /> 5 Langkah Utama Pengelolaan Toko
          </h2>
          <span className="text-xs text-muted-foreground font-mono">Urutan Praktis</span>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.id}
                className="rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-0.5 rounded">
                        {step.category}
                      </span>
                      <h3 className="text-lg font-bold text-foreground mt-0.5">{step.title}</h3>
                    </div>
                  </div>

                  <Button asChild size="sm" variant="outline" className="font-semibold gap-1.5 shrink-0 border-primary/30 text-primary hover:bg-primary/10">
                    <Link href={step.href}>
                      {step.actionText} <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>

                <p className="text-sm text-foreground/80 leading-relaxed">
                  {step.desc}
                </p>

                <div className="rounded-xl bg-muted/40 p-4 space-y-2">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5 font-mono uppercase tracking-wider">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Detail Penting:
                  </span>
                  <ul className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-muted-foreground pt-1">
                    {step.details.map((detail, idx) => (
                      <li key={idx} className="flex items-start gap-2 bg-card p-2.5 rounded-lg border border-border/50">
                        <span className="text-primary font-bold">•</span>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="space-y-6 pt-4">
        <div className="flex items-center justify-between border-b pb-3">
          <h2 className="text-xl font-bold font-space text-foreground flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" /> Pertanyaan Yang Sering Diajukan (FAQ)
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="rounded-xl border border-border bg-card p-5 space-y-2 shadow-sm">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <span className="text-primary font-mono font-extrabold">Q:</span> {faq.q}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed pl-5">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
