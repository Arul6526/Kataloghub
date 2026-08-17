import Link from "next/link";
import {
  PanelsTopLeft,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  ArrowRight,
} from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { LandingSectionsClient } from "./sections-client";
import {
  fetchLandingSections,
  fetchFeaturedCategoryOptions,
  fetchFeaturedProductOptions,
} from "@/lib/actions/landing-actions";
import type { LandingSectionKey } from "@/lib/db/types";

const SECTION_LABELS: Record<LandingSectionKey, { label: string; description: string }> = {
  hero: { label: "Hero Banner", description: "Section utama pertama pada landing page." },
  about: { label: "Tentang Brand", description: "Profil singkat perusahaan." },
  advantages: { label: "Keunggulan", description: "Daftar keunggulan perusahaan." },
  featured_categories: { label: "Kategori Unggulan", description: "Tampilkan kategori pilihan." },
  featured_products: { label: "Produk Pilihan", description: "Tampilkan produk unggulan." },
  testimonials: { label: "Testimonial / Proyek", description: "Testimonial atau proyek terkurasi." },
  cta: { label: "CTA Utama", description: "Call-to-action menuju katalog atau WhatsApp." },
};

export default async function LandingPage() {
  const [sections, categoryOptions, productOptions] = await Promise.all([
    fetchLandingSections().catch(() => []),
    fetchFeaturedCategoryOptions().catch(() => []),
    fetchFeaturedProductOptions().catch(() => []),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Landing Page Manager"
        description="Kelola section yang tampil di halaman utama. Section kosong disembunyikan secara otomatis."
      />

      {sections.length === 0 ? (
        <EmptyState
          icon={<PanelsTopLeft className="h-6 w-6" />}
          title="Belum ada section"
          description="Jalankan migrasi seed landing_sections untuk membuat section default."
        />
      ) : (
        <LandingSectionsClient
          sections={sections}
          sectionLabels={SECTION_LABELS}
          categoryOptions={categoryOptions}
          productOptions={productOptions}
        />
      )}
    </div>
  );
}