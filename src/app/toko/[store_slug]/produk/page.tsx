import type { Metadata } from "next";
import Link from "next/link";
import { Package, ChevronRight, Phone, FileDown } from "lucide-react";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { getVisibleProducts, getVisibleCategories, getSiteSettings } from "@/lib/public-data";
import { ProductCard } from "@/components/public/product-card";
import { EmptyState } from "@/components/ui/empty-state";
import { ProductFilters } from "./filters";
import { PublicPageLayout } from "@/components/public/public-page-layout";
import { CatalogHeroHeader } from "./catalog-hero-header";
import { FloatingWaBtn } from "@/components/public/floating-wa-btn";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Produk",
  description: "Jelajahi seluruh katalog produk teknis kami.",
};

interface Props {
  params: Promise<{ store_slug: string }>;
  searchParams: Promise<{ q?: string; kategori?: string; tag?: string; page?: string }>;
}

export default async function ProdukPage({ params, searchParams }: Props) {
  const resolvedParams = await params;
  const storeSlug = resolvedParams.store_slug;
  const resolvedSearchParams = await searchParams;
  
  const page = Math.max(1, parseInt(resolvedSearchParams.page ?? "1", 10) || 1);
  const limit = 24;
  const offset = (page - 1) * limit;

  const [{ items, total }, categories, settings] = await Promise.all([
    getVisibleProducts(storeSlug, {
      search: resolvedSearchParams.q,
      categorySlug: resolvedSearchParams.kategori,
      tag: resolvedSearchParams.tag,
      limit,
      offset,
    }),
    getVisibleCategories(storeSlug),
    getSiteSettings(storeSlug),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const basePath = `/toko/${storeSlug}`;
  const waUrl = buildWhatsAppUrl(settings);

  return (
    <PublicPageLayout storeSlug={storeSlug}>
      <div className="relative min-h-screen overflow-x-hidden">
        {/* Subtle Micro Dot Pattern Background */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(var(--border)_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,#000_70%,transparent_100%)] opacity-70" />

        <div className="container py-6 sm:py-8">
          {/* Glowing Orb Header Accent */}
          <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-72 w-[600px] -translate-x-1/2 rounded-full bg-primary/15 blur-[110px]" />

          {/* Breadcrumb */}
          <nav className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground">
            <a href={basePath} className="hover:text-primary transition-colors">
              Beranda
            </a>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground font-medium">Katalog Produk</span>
          </nav>

          {/* Compact Interactive Hero Header / Popup Announcement */}
          <CatalogHeroHeader
            total={total}
            customTitle={settings?.catalog_announcement_title}
            customMessage={settings?.catalog_announcement_message}
            customImagePath={settings?.catalog_announcement_image_path}
            isEnabled={settings?.catalog_announcement_enabled ?? true}
          />

          {/* Standard Page Title & Search/Filter Header */}
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold tracking-tight">Katalog Produk</h1>
                <a
                  href={`/toko/${storeSlug}/katalog-pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-xs font-semibold text-primary transition-colors hover:bg-primary/20 shadow-sm"
                  title="Unduh Katalog Produk PDF Resmi"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  PDF Katalog
                </a>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {total} produk tersedia
              </p>
            </div>
            
            <div className="w-full sm:w-auto">
              <ProductFilters
                currentSearch={resolvedSearchParams.q ?? ""}
                currentCategory={resolvedSearchParams.kategori ?? ""}
                currentTag={resolvedSearchParams.tag ?? ""}
                categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
                storeSlug={storeSlug}
              />
            </div>
          </div>

      {/* Grid */}
      {items.length === 0 ? (
        <EmptyState
          icon={<Package className="h-6 w-6" />}
          title="Belum ada produk"
          description="Produk akan segera tersedia."
        />
      ) : (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} storeSlug={storeSlug} showPrice={settings?.show_prices} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={{
                pathname: `${basePath}/produk`,
                query: {
                  ...(resolvedSearchParams.q ? { q: resolvedSearchParams.q } : {}),
                  ...(resolvedSearchParams.kategori ? { kategori: resolvedSearchParams.kategori } : {}),
                  ...(resolvedSearchParams.tag ? { tag: resolvedSearchParams.tag } : {}),
                  ...(p > 1 ? { page: String(p) } : {}),
                },
              }}
              className={`flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition-colors ${
                p === page
                  ? "bg-primary text-primary-foreground"
                  : "border hover:bg-muted"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
        )}
        </div>
      </div>

      {/* ─── FLOATING WHATSAPP BUTTON ─── */}
      {waUrl && <FloatingWaBtn waUrl={waUrl} storeSlug={storeSlug} />}
    </PublicPageLayout>
  );
}
