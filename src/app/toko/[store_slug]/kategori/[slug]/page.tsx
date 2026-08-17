import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Package } from "lucide-react";
import { getCategoryBySlug, getVisibleProducts, getSiteSettings } from "@/lib/public-data";
import { ProductCard } from "@/components/public/product-card";
import { EmptyState } from "@/components/ui/empty-state";
import { notFound } from "next/navigation";
import { CategoryIcon } from "@/components/public/category-icon";
import Image from "next/image";
import { publicUrl } from "@/lib/storage-url";

export const revalidate = 300;

interface Props {
  params: Promise<{ store_slug: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { store_slug, slug } = await params;
  const category = await getCategoryBySlug(store_slug, slug);
  if (!category) return { title: "Kategori Tidak Ditemukan" };
  return {
    title: category.name,
    description: category.description || `Kategori ${category.name} — ${category.product_count} produk.`,
  };
}

export default async function KategoriDetailPage({ params }: Props) {
  const { store_slug, slug } = await params;
  const [category, { items }, settings] = await Promise.all([
    getCategoryBySlug(store_slug, slug),
    getVisibleProducts(store_slug, { categorySlug: slug, limit: 100 }),
    getSiteSettings(store_slug),
  ]);
  if (!category) notFound();

  const imgSrc = publicUrl("category-media", category.image_path);
  const basePath = `/toko/${store_slug}`;

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Subtle Micro Dot Pattern Background */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(var(--border)_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,#000_70%,transparent_100%)] opacity-70" />

      <div className="container py-10">
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground">
        <a href={basePath} className="hover:text-primary transition-colors">
          Beranda
        </a>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href={`${basePath}/kategori`} className="hover:text-primary transition-colors">
          Kategori
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">{category.name}</span>
      </nav>

      <div className="mb-6 flex items-center gap-5 border-b pb-5">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-muted shadow-sm">
          {imgSrc ? (
            <Image
              src={imgSrc}
              alt={category.image_alt || category.name}
              width={80}
              height={80}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary">
              <CategoryIcon name={category.name} className="h-8 w-8 opacity-80" />
            </div>
          )}
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{category.name}</h1>
          {category.description && (
            <p className="mt-0.5 text-sm text-muted-foreground max-w-2xl text-balance">{category.description}</p>
          )}
          <p className="mt-1.5 inline-flex items-center rounded-full border bg-muted/50 px-2.5 py-0.5 text-xs font-medium">
            {items.length} produk
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={<Package className="h-6 w-6" />}
          title="Belum ada produk"
          description="Produk dalam kategori ini akan segera tersedia."
        />
      ) : (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} storeSlug={store_slug} showPrice={settings?.show_prices} />
          ))}
        </div>
      )}
    </div>
    </div>
  );
}
