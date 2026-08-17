"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Printer,
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Package,
  FileText,
} from "lucide-react";
import type { SiteSettings } from "@/lib/db/types";
import type { PublicCategory, PublicProductListItem } from "@/lib/public-data";
import { publicUrl } from "@/lib/storage-url";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

interface KatalogPdfClientProps {
  storeSlug: string;
  settings: SiteSettings;
  categories: PublicCategory[];
  products: PublicProductListItem[];
  totalProducts: number;
}

export function KatalogPdfClient({
  storeSlug,
  settings,
  categories,
  products,
  totalProducts,
}: KatalogPdfClientProps) {
  const [autoPrintTriggered, setAutoPrintTriggered] = useState(false);

  const brandName = settings.brand_name || "Katalog Toko";
  const brandTagline = settings.brand_tagline || "Katalog Produk Resmi";
  const logoUrl =
    publicUrl("brand-assets", settings.brand_logo_path) ||
    publicUrl("landing-media", settings.brand_logo_path);
  const waUrl = buildWhatsAppUrl(settings);
  const showPrices = settings.show_prices ?? false;

  const currentDateStr = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const handlePrint = () => {
    window.print();
  };

  useEffect(() => {
    if (!autoPrintTriggered) {
      const timer = setTimeout(() => {
        setAutoPrintTriggered(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [autoPrintTriggered]);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-zinc-950 text-slate-900 dark:text-slate-100 font-sans print:bg-white print:text-black">
      {/* ─── NON-PRINTABLE TOP CONTROL BAR ─── */}
      <header className="print:hidden sticky top-0 z-50 border-b bg-background/90 backdrop-blur-md px-4 py-3 shadow-sm">
        <div className="container max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href={`/toko/${storeSlug}/produk`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border bg-card text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Kembali ke Storefront
            </Link>
            <span className="hidden sm:inline-block text-xs font-mono text-muted-foreground">
              Tabel Kompak PDF A4 ({totalProducts} Produk)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-md hover:bg-primary/90 transition-transform active:scale-95"
            >
              <Printer className="w-4 h-4" /> Simpan / Cetak PDF
            </button>
          </div>
        </div>
      </header>

      {/* ─── PRINTABLE DOCUMENT BODY (COMPACT A4 LAYOUT) ─── */}
      <main className="container max-w-4xl mx-auto py-4 sm:py-6 px-3 sm:px-6 print:p-0 print:max-w-none">
        <div className="bg-white text-slate-900 rounded-xl shadow-lg border border-slate-200 print:shadow-none print:border-none p-5 sm:p-7 print:p-0 space-y-4">
          
          {/* COMPACT BRAND HEADER */}
          <div className="border-b-2 border-slate-900 pb-3 space-y-2">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {logoUrl && (
                  <div className="relative h-12 w-12 sm:h-14 sm:w-14 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 p-1 shrink-0">
                    <Image
                      src={logoUrl}
                      alt={brandName}
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                )}
                <div>
                  <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-950">
                    {brandName}
                  </h1>
                  <p className="text-xs font-medium text-slate-600">
                    {brandTagline}
                  </p>
                </div>
              </div>

              <div className="text-right font-mono text-[11px] text-slate-500 shrink-0">
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-800 font-bold text-[10px]">
                  <FileText className="w-3 h-3 text-emerald-600" /> KATALOG PRODUK
                </div>
                <p className="pt-0.5">{currentDateStr}</p>
                <p className="font-semibold text-slate-700">{totalProducts} Item Produk</p>
              </div>
            </div>

            {/* CONTACT ROW */}
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 pt-2 border-t border-slate-100 text-[11px] text-slate-600">
              {settings.whatsapp_number && (
                <div className="flex items-center gap-1 font-semibold text-emerald-700">
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>WA: +{settings.whatsapp_number}</span>
                </div>
              )}
              {settings.contact_phone && (
                <div className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Telp: {settings.contact_phone}</span>
                </div>
              )}
              {settings.contact_email && (
                <div className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{settings.contact_email}</span>
                </div>
              )}
              {settings.contact_address && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate max-w-xs">{settings.contact_address}</span>
                </div>
              )}
            </div>
          </div>

          {/* HIGH-DENSITY COMPACT PRODUCT TABLE */}
          <div className="overflow-x-auto">
            {products.length === 0 ? (
              <div className="p-8 text-center text-slate-500 border border-dashed rounded-lg text-xs">
                Belum ada produk dalam katalog ini.
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold border-b-2 border-slate-300 uppercase text-[10px] tracking-wider font-mono">
                    <th className="py-2 px-2 text-center w-8 border-r border-slate-300">#</th>
                    <th className="py-2 px-2 text-center w-14 border-r border-slate-300">Foto</th>
                    <th className="py-2 px-3 border-r border-slate-300">Nama Produk & Kategori</th>
                    {showPrices && <th className="py-2 px-3 text-right w-32 font-mono">Harga</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {products.map((p, index) => {
                    const mainImgUrl = publicUrl("product-images", p.main_image_path);
                    return (
                      <tr
                        key={p.id}
                        className="hover:bg-slate-50 transition-colors print:break-inside-avoid"
                      >
                        {/* Index */}
                        <td className="py-1.5 px-2 text-center font-mono font-semibold text-slate-500 text-[11px] border-r border-slate-200">
                          {index + 1}
                        </td>

                        {/* Thumbnail Image */}
                        <td className="py-1.5 px-2 text-center border-r border-slate-200">
                          <div className="h-11 w-11 mx-auto rounded border border-slate-200 bg-slate-50 overflow-hidden relative shrink-0">
                            {mainImgUrl ? (
                              <Image
                                src={mainImgUrl}
                                alt={p.name}
                                fill
                                className="object-contain p-0.5"
                                unoptimized
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-slate-400">
                                <Package className="w-4 h-4 opacity-40" />
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Product Name & Category */}
                        <td className="py-1.5 px-3 border-r border-slate-200">
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-950 text-xs leading-snug">
                                {p.name}
                              </span>
                              {p.category_name && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-slate-100 text-slate-700 border border-slate-300">
                                  {p.category_name}
                                </span>
                              )}
                            </div>
                            {p.summary && (
                              <p className="text-[10px] text-slate-500 line-clamp-1 leading-tight">
                                {p.summary}
                              </p>
                            )}
                          </div>
                        </td>

                        {/* Price */}
                        {showPrices && (
                          <td className="py-1.5 px-3 text-right font-mono font-bold text-slate-900 text-xs border-slate-200">
                            {p.price && p.price > 0
                              ? `Rp ${p.price.toLocaleString("id-ID")}`
                              : "Hubungi Admin"}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* COMPACT FOOTER / HOW TO ORDER */}
          <div className="border-t border-slate-300 pt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600 print:break-inside-avoid">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900">Cara Pemesanan:</span>
              <span>Kirim foto/nama produk ke WhatsApp resmi di atas.</span>
            </div>

            {waUrl && (
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#25D366] text-white font-bold text-[10px] shadow-sm"
              >
                <MessageCircle className="w-3 h-3" /> Order via WhatsApp
              </a>
            )}
          </div>
        </div>
      </main>

      {/* PRINT-SPECIFIC CSS RULES */}
      <style jsx global>{`
        @media print {
          body {
            background-color: white !important;
            color: black !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          header {
            display: none !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
          }
          tr {
            page-break-inside: avoid !important;
          }
        }
      `}</style>
    </div>
  );
}
