import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getVisibleProducts, getVisibleCategories, getSiteSettings } from "@/lib/public-data";
import { KatalogPdfClient } from "./katalog-pdf-client";

export const revalidate = 3600;

interface Props {
  params: Promise<{ store_slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const settings = await getSiteSettings(resolvedParams.store_slug);
  const brandName = settings?.brand_name || "Toko";

  return {
    title: `Katalog Produk PDF - ${brandName}`,
    description: `Unduh dokumen resmi katalog produk dari ${brandName}`,
  };
}

export default async function KatalogPdfPage({ params }: Props) {
  const resolvedParams = await params;
  const storeSlug = resolvedParams.store_slug;

  const [settings, categories, productResult] = await Promise.all([
    getSiteSettings(storeSlug),
    getVisibleCategories(storeSlug),
    getVisibleProducts(storeSlug, { limit: 500 }),
  ]);

  if (!settings) {
    notFound();
  }

  return (
    <KatalogPdfClient
      storeSlug={storeSlug}
      settings={settings}
      categories={categories}
      products={productResult.items}
      totalProducts={productResult.total}
    />
  );
}
