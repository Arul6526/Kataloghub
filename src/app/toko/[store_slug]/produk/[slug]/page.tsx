import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Phone, Download, FileText, ArrowLeft, ShieldCheck, Sparkles } from "lucide-react";
import { getProductBySlug, getSiteSettings } from "@/lib/public-data";
import { publicUrl } from "@/lib/storage-url";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { formatRupiah } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ProductGalleryClient } from "./product-gallery-client";
import { AddToCartBtn } from "./add-to-cart-btn";
import { DirectWaBtn } from "@/components/public/direct-wa-btn";
import { notFound } from "next/navigation";

export const revalidate = 300;

interface Props {
  params: Promise<{ store_slug: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { store_slug, slug } = await params;
  const product = await getProductBySlug(store_slug, slug);
  if (!product) return { title: "Produk Tidak Ditemukan" };
  return {
    title: product.name,
    description: product.summary || `${product.name} — ${product.category.name}`,
  };
}

export default async function ProdukDetailPage({ params }: Props) {
  const { store_slug, slug } = await params;
  const [product, settings] = await Promise.all([
    getProductBySlug(store_slug, slug),
    getSiteSettings(store_slug),
  ]);

  if (!product) notFound();

  const waUrl = buildWhatsAppUrl(settings, product.name);
  const mainImg = publicUrl("product-images", product.main_image_path);
  const basePath = `/toko/${store_slug}`;
  const showPrice = settings?.show_prices === true;

  return (
    <div className="relative min-h-screen overflow-x-hidden pb-16 sm:pb-24">
      {/* Background Ambient Studio Glow */}
      <div className="pointer-events-none absolute left-1/4 top-10 -z-10 h-[350px] w-[350px] sm:h-[450px] sm:w-[450px] -translate-x-1/2 rounded-full bg-primary/10 blur-[130px]" />
      <div className="pointer-events-none absolute right-10 top-1/3 -z-10 h-60 w-60 rounded-full bg-blue-500/5 blur-[100px]" />

      <div className="w-full max-w-7xl mx-auto px-4 py-4 sm:py-8">
        {/* Mobile Friendly Breadcrumb (Scrollable horizontally) */}
        <nav className="mb-4 sm:mb-6 flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground overflow-x-auto no-scrollbar whitespace-nowrap pb-1">
          <a href={basePath} className="hover:text-primary transition-colors shrink-0">
            Beranda
          </a>
          <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-60" />
          <Link href={`${basePath}/produk`} className="hover:text-primary transition-colors shrink-0">
            Produk
          </Link>
          <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-60" />
          <Link
            href={`${basePath}/kategori/${product.category.slug}`}
            className="hover:text-primary transition-colors shrink-0"
          >
            {product.category.name}
          </Link>
          <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-60" />
          <span className="text-foreground font-medium truncate max-w-[140px] sm:max-w-none">
            {product.name}
          </span>
        </nav>

        <div className="grid gap-6 sm:gap-10 lg:grid-cols-2 items-start w-full max-w-full overflow-hidden">
          {/* Gallery (Sticky Desktop, Full Width Mobile) */}
          <div className="lg:sticky lg:top-24 relative w-full max-w-full overflow-hidden">
            <div className="pointer-events-none absolute -left-6 -top-6 -z-10 h-48 w-48 rounded-full bg-primary/15 blur-3xl" />
            <ProductGalleryClient
              mainImage={mainImg ? { src: mainImg, alt: product.main_image_alt || product.name } : null}
              gallery={product.gallery
                .map((g) => {
                  const src = publicUrl("product-images", g.path);
                  return {
                    src: src || "",
                    alt: g.alt || product.name,
                  };
                })
                .filter((g) => g.src !== "")}
            />
          </div>

          {/* Product Details Section */}
          <div className="space-y-6 sm:space-y-8 w-full max-w-full min-w-0">
            <div className="space-y-3 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-block rounded-md bg-primary/10 border border-primary/20 px-2.5 py-1 text-[11px] font-bold text-primary">
                  {product.category.name}
                </span>
                <span className="text-[11px] text-muted-foreground font-mono flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Garansi Resmi
                </span>
              </div>

              <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight text-foreground leading-tight break-words">
                {product.name}
              </h1>

              {showPrice && product.price != null && (
                <div className="inline-block rounded-xl border border-primary/20 bg-primary/5 px-4 py-2 mt-1">
                  <span className="text-xs text-muted-foreground block font-medium">Harga Resmi:</span>
                  <span className="text-xl sm:text-3xl font-black text-primary font-mono tracking-tight">
                    {formatRupiah(product.price)}
                  </span>
                </div>
              )}

              {product.summary && (
                <p className="text-xs sm:text-base text-muted-foreground leading-relaxed pt-1 break-words">
                  {product.summary}
                </p>
              )}
            </div>

            {/* Action CTA Buttons (Full Width & Touch-Friendly on Mobile) */}
            <div className="flex flex-col sm:flex-row items-stretch gap-3 pt-2 w-full">
              <AddToCartBtn
                product={{
                  id: product.id,
                  name: product.name,
                  slug: product.slug,
                  price: product.price,
                  main_image_path: product.main_image_path,
                }}
              />

              {waUrl ? (
                <DirectWaBtn
                  waUrl={waUrl}
                  storeSlug={store_slug}
                  productName={product.name}
                  productPrice={product.price}
                />
              ) : (
                <div className="flex-1 flex h-14 sm:h-16 items-center justify-center rounded-2xl bg-muted text-sm font-bold text-muted-foreground">
                  Kontak tidak tersedia
                </div>
              )}
            </div>

            {/* Tags */}
            {product.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-muted/80 border border-border px-3 py-0.5 text-[11px] font-medium text-muted-foreground"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Deskripsi Produk */}
            {product.description && (
              <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs space-y-2 overflow-hidden">
                <h3 className="font-bold text-sm text-foreground font-space">Deskripsi Produk</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed whitespace-pre-line break-words overflow-hidden">
                  {product.description}
                </p>
              </div>
            )}

            {/* Spesifikasi Teknis Table Card */}
            {product.spec_values.length > 0 && (
              <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs space-y-4 overflow-hidden">
                <h3 className="font-bold text-sm text-foreground font-space flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" /> Spesifikasi Teknis
                </h3>

                <div className="divide-y divide-border/60">
                  {product.spec_values.map((sv) => {
                    let display = "";
                    if (sv.field.field_type === "boolean") {
                      display = sv.value_boolean ? "Ya" : "Tidak";
                    } else if (sv.field.field_type === "number") {
                      display = `${sv.value_number}${sv.field.unit ? " " + sv.field.unit : ""}`;
                    } else {
                      display = sv.value_text || sv.value_select || "—";
                    }
                    return (
                      <div
                        key={sv.id}
                        className="flex justify-between items-baseline py-2.5 text-xs sm:text-sm gap-2 min-w-0"
                      >
                        <span className="text-muted-foreground font-medium shrink min-w-0 truncate">
                          {sv.field.label}
                        </span>
                        <span className="font-semibold text-foreground text-right font-mono break-all shrink-0 max-w-[60%]">
                          {display}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Dokumen & Download PDF */}
            {product.documents.length > 0 && (
              <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs space-y-3">
                <h3 className="font-bold text-sm text-foreground font-space">Dokumentasi Teknis</h3>
                <div className="space-y-2">
                  {product.documents.map((doc) => {
                    const url = publicUrl("product-documents", doc.file_path);
                    return (
                      <a
                        key={doc.id}
                        href={url ?? "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center justify-between rounded-xl border border-border/80 bg-muted/30 p-3 text-xs transition-colors hover:border-primary/50 hover:bg-primary/5"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <FileText className="h-4 w-4" />
                          </div>
                          <span className="font-semibold text-foreground truncate">{doc.label}</span>
                        </div>
                        <Download className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
