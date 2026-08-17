import { type NextRequest, NextResponse } from "next/server"; // We don't need this, wait...
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Phone, ShieldCheck, Truck, Award, ChevronRight } from "lucide-react";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { getLandingSections, getSiteSettings, getFeaturedCategories, getFeaturedProducts } from "@/lib/public-data";
import { CategoryCard } from "@/components/public/category-card";
import { ProductCard } from "@/components/public/product-card";
import { PublicPageLayout } from "@/components/public/public-page-layout";
import { LiveSearch } from "@/components/public/live-search";
import { FloatingWaBtn } from "@/components/public/floating-wa-btn";
import { fetchCustomLandingPageBySlug, fetchLinkedProducts } from "@/lib/actions/custom-landing-actions";
import { publicUrl } from "@/lib/storage-url";
import { sanitizeHtml } from "@/lib/security/sanitizer";
import { logger } from "@/lib/logger";
import { HeroSlider, type HeroBannerItem } from "@/components/public/hero-slider";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ store_slug: string }> }): Promise<Metadata> {
  const { store_slug } = await params;
  const settings = await getSiteSettings(store_slug);
  
  // Try to see if custom home page exists for SEO
  try {
    const customHome = await fetchCustomLandingPageBySlug("home", store_slug);
    if (customHome?.is_active) {
      return {
        title: customHome.meta_title || customHome.title || settings?.seo_title || settings?.brand_name || "Katalog Produk",
        description: customHome.meta_description || settings?.seo_description || `${settings?.brand_name ?? "KatalogHub"} — Katalog produk teknis lengkap.`,
      };
    }
  } catch (e) {
    logger.warn("StorePage", "Failed fetching custom home SEO metadata", e);
  }

  return {
    title: settings?.seo_title || settings?.brand_name || "Katalog Produk",
    description:
      settings?.seo_description ||
      `${settings?.brand_name ?? "KatalogHub"} — Katalog produk teknis lengkap.`,
  };
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildProductCard(
  product: { name: string; slug: string; summary: string | null; main_image_path: string | null },
  imgUrl: string | null,
  basePath: string
): string {
  const img = imgUrl
    ? `<img src="${imgUrl}" alt="${escapeHtml(product.name)}" style="width:100%;height:220px;object-fit:cover;">`
    : `<div style="width:100%;height:220px;background:#f3f4f6;display:flex;align-items:center;justify-content:center;color:#9ca3af;font-size:13px;">Tidak ada gambar</div>`;

  return `<div class="product-card" style="border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;font-family:system-ui,sans-serif;max-width:300px;box-shadow:0 2px 8px rgba(0,0,0,.08);">
  ${img}
  <div style="padding:16px;">
    <h3 style="margin:0 0 6px;font-size:17px;font-weight:700;line-height:1.3;color:#111827;">${escapeHtml(product.name)}</h3>
    ${product.summary ? `<p style="margin:0 0 12px;font-size:14px;color:#6b7280;line-height:1.5;">${escapeHtml(product.summary)}</p>` : ""}
    <a href="${basePath}/produk/${product.slug}" style="display:inline-block;padding:10px 20px;background:#2563eb;color:#fff;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;">Lihat Produk →</a>
  </div>
</div>`;
}

export default async function LandingPage({ params }: { params: Promise<{ store_slug: string }> }) {
  const { store_slug } = await params;
  const basePath = `/toko/${store_slug}`;

  const [sections, settings, featuredCategories, featuredProducts] = await Promise.all([
    getLandingSections(store_slug),
    getSiteSettings(store_slug),
    getFeaturedCategories(store_slug),
    getFeaturedProducts(store_slug, 6),
  ]);

  const waUrl = buildWhatsAppUrl(settings);

  // 1. Cek apakah ada Custom Landing Page bernama "home" khusus untuk toko ini
  let customHtml: string | null = null;
  try {
    const customHome = await fetchCustomLandingPageBySlug("home", store_slug);
    if (customHome?.is_active) {
      const products = await fetchLinkedProducts(customHome.product_ids).catch(() => []);
      let html = customHome.html_source;
      
      // Process tokens
      for (const product of products) {
        const imgUrl = publicUrl("product-images", product.main_image_path);
        const card = buildProductCard(product, imgUrl, basePath);
        const re = (field: string) =>
          new RegExp(`\\{\\{product:${escapeRegExp(product.slug)}:${field}\\}\\}`, "g");
  
        html = html
          .replace(re("card"), card)
          .replace(re("name"), escapeHtml(product.name))
          .replace(re("image"), imgUrl ?? "")
          .replace(re("link"), `${basePath}/produk/${product.slug}`)
          .replace(re("description"), escapeHtml(product.summary ?? product.name));
      }

      // Special global tokens & navigation fixes
      html = html
        .replace(/\{\{site:whatsapp_url\}\}/g, waUrl ?? "#")
        .replace(/\{\{name\}\}/g, escapeHtml(settings?.brand_name || "Toko"))
        .replace(/href="\/kategori"/g, `href="${basePath}/kategori"`)
        .replace(/href="\/produk"/g, `href="${basePath}/produk"`);

      // Extract body if it's a full document, otherwise use as is
      const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      const headStyleMatch = html.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
      
      let finalHtml = bodyMatch ? bodyMatch[1] : html;
      if (headStyleMatch && bodyMatch) {
        finalHtml = headStyleMatch.join("\n") + "\n" + finalHtml;
      }
      
      customHtml = finalHtml;
    }
  } catch (e) {
    logger.warn("StorePage", "Failed rendering custom home page", e);
  }

  // Jika ada custom "home", render custom html TANPA layout bawaan
  // agar tampil persis seperti custom landing page mandiri
  if (customHtml) {
    // SECURITY: Sanitize HTML as second safety net (first is in saveCustomLandingPageAction)
    const safeHtml = sanitizeHtml(customHtml);
    return (
      <main className="w-full min-h-screen" dangerouslySetInnerHTML={{ __html: safeHtml }} />
    );
  }

  // ... DEFAULT LAYOUT ...
  const sectionMap = new Map(sections.map((s) => [s.section_key, s]));
  const hero = sectionMap.get("hero");
  const about = sectionMap.get("about");
  const advantages = sectionMap.get("advantages");
  const featuredCats = sectionMap.get("featured_categories");
  const featuredProds = sectionMap.get("featured_products");
  const testimonials = sectionMap.get("testimonials");
  const cta = sectionMap.get("cta");

  const heroBanners = (hero?.config?.hero_banners as HeroBannerItem[]) || [];

  const advantageItems = [
    { icon: ShieldCheck, title: "Terpercaya", desc: "Produk berkualitas tinggi untuk kebutuhan teknis Anda." },
    { icon: Truck, title: "Pengiriman Cepat", desc: "Logistik andal ke seluruh wilayah Indonesia." },
    { icon: Award, title: "Standar Nasional", desc: "Memenuhi standar SNI dan sertifikasi resmi." },
  ];

  return (
    <PublicPageLayout storeSlug={store_slug}>
      <div className="flex flex-col">
        {/* ─── HERO SLIDER (SUPPORTING CUSTOM PROMO BANNERS) ─── */}
        <HeroSlider
          heroHeading={hero?.heading ?? "Katalog Produk & Etalase Online Resmi"}
          heroSubheading={hero?.subheading ?? hero?.body ?? "Temukan produk pilihan lengkap dengan spesifikasi detail, harga transparan, dan pemesanan instan via WhatsApp."}
          storeSlug={store_slug}
          basePath={basePath}
          featuredProducts={featuredProducts}
          waUrl={waUrl}
          brandName={settings?.brand_name || "Toko Aktif"}
          brandTagline={settings?.brand_tagline || "Solusi belanja kebutuhan Anda langsung dari genggaman."}
          banners={heroBanners}
        />

        {/* ─── ABOUT SECTION ─── */}
        {about && (
          <section className="border-b bg-card py-12 sm:py-16">
            <div className="container max-w-3xl text-center space-y-3">
              {about.heading && (
                <h2 className="font-space text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
                  {about.heading}
                </h2>
              )}
              {about.subheading && (
                <p className="text-sm sm:text-base text-primary font-semibold">{about.subheading}</p>
              )}
              {about.body && (
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed pt-1">
                  {about.body}
                </p>
              )}
            </div>
          </section>
        )}

        {/* ─── ADVANTAGES SECTION ─── */}
        <section className="border-b bg-muted/20 py-12 sm:py-16">
          <div className="container space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h2 className="font-space text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
                {advantages?.heading ?? "Mengapa Memilih Produk Kami?"}
              </h2>
              {advantages?.body && (
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {advantages.body}
                </p>
              )}
            </div>
            
            <div className="grid gap-4 sm:grid-cols-3">
              {advantageItems.map((item) => (
                <div key={item.title} className="rounded-2xl border border-border bg-card p-5 space-y-2.5 shadow-sm hover:border-primary/50 transition-all">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-space text-base font-bold text-foreground">{item.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── FEATURED CATEGORIES SECTION ─── */}
        {featuredCats && featuredCategories.length > 0 && (
          <section className="border-b py-12 sm:py-16">
            <div className="container space-y-6">
              <div className="flex items-end justify-between">
                <div>
                  <h2 className="font-space text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
                    {featuredCats.heading ?? "Kategori Unggulan"}
                  </h2>
                  {featuredCats.subheading && (
                    <p className="mt-1 text-xs sm:text-sm text-muted-foreground">{featuredCats.subheading}</p>
                  )}
                </div>
                <Link
                  href={`${basePath}/kategori`}
                  className="hidden items-center gap-1 text-xs font-bold text-primary hover:underline sm:flex"
                >
                  Semua Kategori <ChevronRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {featuredCategories.slice(0, 6).map((cat) => (
                  <CategoryCard key={cat.id} category={cat} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ─── FEATURED PRODUCTS SECTION ─── */}
        {featuredProds && featuredProducts.length > 0 && (
          <section className="border-b py-12 sm:py-16 bg-muted/20">
            <div className="container space-y-6">
              <div className="flex items-end justify-between">
                <div>
                  <h2 className="font-space text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
                    {featuredProds.heading ?? "Produk Pilihan Terpopuler"}
                  </h2>
                  {featuredProds.subheading && (
                    <p className="mt-1 text-xs sm:text-sm text-muted-foreground">{featuredProds.subheading}</p>
                  )}
                </div>
                <Link
                  href={`${basePath}/produk`}
                  className="hidden items-center gap-1 text-xs font-bold text-primary hover:underline sm:flex"
                >
                  Lihat Semua Produk <ChevronRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {featuredProducts.map((prod) => (
                  <ProductCard key={prod.id} product={prod} storeSlug={store_slug} showPrice={settings?.show_prices} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ─── TESTIMONIALS SECTION ─── */}
        {testimonials && (
          <section className="border-b py-12 sm:py-16">
            <div className="container max-w-3xl text-center space-y-4">
              <h2 className="font-space text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
                {testimonials.heading ?? "Kepuasan Pelanggan Adalah Prioritas Utama"}
              </h2>
              {testimonials.body ? (
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {testimonials.body}
                </p>
              ) : testimonials.subheading ? (
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {testimonials.subheading}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">Pelanggan kami terpuaskan dengan kualitas dan kecepatan respon pengiriman.</p>
              )}
            </div>
          </section>
        )}

        {/* ─── CALL TO ACTION FOOTER BANNER ─── */}
        <section className="py-14 sm:py-20 bg-background">
          <div className="container">
            <div className="rounded-3xl border border-border bg-slate-900 text-white p-8 sm:p-12 lg:p-14 shadow-2xl relative overflow-hidden flex flex-col items-start gap-6">
              
              {/* Background Glow */}
              <div className="absolute top-0 right-0 h-80 w-80 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 max-w-2xl space-y-3">
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full font-mono font-bold uppercase tracking-wider">
                  Siap Memesan?
                </span>

                <h2 className="font-space text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                  {cta?.heading ?? "Tertarik dengan Produk Kami?"}
                </h2>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                  {cta?.subheading ?? cta?.body ?? "Konsultasikan kebutuhan Anda sekarang. Dapatkan penawaran harga terbaik dan pelayanan cepat langsung via WhatsApp!"}
                </p>

                <div className="flex flex-col sm:flex-row gap-3 pt-3">
                  <Link
                    href={`${basePath}/produk`}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-7 text-xs sm:text-sm font-bold text-primary-foreground shadow-md transition-all hover:scale-[1.02] hover:bg-primary/90"
                  >
                    Jelajahi Katalog
                    <ArrowRight className="h-4 w-4" />
                  </Link>

                  {waUrl && (
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-600 px-7 text-xs sm:text-sm font-bold text-white shadow-md transition-all hover:bg-emerald-700"
                    >
                      <Phone className="h-4 w-4" />
                      Chat WhatsApp Toko
                    </a>
                  )}
                </div>
              </div>

            </div>
          </div>
        </section>
      </div>

      {/* ─── FLOATING WHATSAPP BUTTON ─── */}
      {waUrl && <FloatingWaBtn waUrl={waUrl} storeSlug={store_slug} />}
    </PublicPageLayout>
  );
}
