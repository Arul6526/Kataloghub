import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, FolderTree } from "lucide-react";
import { getVisibleCategories } from "@/lib/public-data";
import { CategoryCard } from "@/components/public/category-card";
import { EmptyState } from "@/components/ui/empty-state";
import { PublicPageLayout } from "@/components/public/public-page-layout";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Kategori",
  description: "Lihat seluruh kategori produk yang tersedia.",
};

interface Props {
  params: Promise<{ store_slug: string }>;
}

export default async function KategoriPage({ params }: Props) {
  const resolvedParams = await params;
  const storeSlug = resolvedParams.store_slug;
  const categories = await getVisibleCategories(storeSlug);
  const basePath = `/toko/${storeSlug}`;

  return (
    <PublicPageLayout storeSlug={storeSlug}>
      <div className="container py-10">
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground">
        <a href={basePath} className="hover:text-primary transition-colors">
          Beranda
        </a>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">Kategori</span>
      </nav>

      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight mb-2">Kategori Produk</h1>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-muted-foreground">
            {categories.length} kategori tersedia
          </p>
        </div>
      </div>

      {categories.length === 0 ? (
        <EmptyState
          icon={<FolderTree className="h-6 w-6" />}
          title="Belum ada kategori"
          description="Kategori produk akan segera tersedia."
        />
      ) : (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {categories.map((cat) => (
            <CategoryCard key={cat.id} category={cat} storeSlug={storeSlug} />
          ))}
        </div>
        )}
      </div>
    </PublicPageLayout>
  );
}
