import Link from "next/link";
import { getSiteSettings } from "@/lib/public-data";
import { publicUrl } from "@/lib/storage-url";
import { Phone, Mail, MapPin, ExternalLink } from "lucide-react";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import Image from "next/image";

function InstagramIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function TikTokIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 1 1-2.88-2.88c.32 0 .64.05.94.15V9.45a6.32 6.32 0 0 0-.94-.07 6.34 6.34 0 1 0 6.34 6.34V9.3a8.16 8.16 0 0 0 4.76 1.53v-3.4a4.85 4.85 0 0 1-1-.74z" />
    </svg>
  );
}

function ShopeeIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M19.5 7.5h-3.21c-.41-2.58-2.58-4.5-5.29-4.5S6.21 4.92 5.8 7.5H2.5L1 21h22l-3.5-13.5zM11 4.5c1.65 0 3 1.35 3.32 3H7.68c.32-1.65 1.67-3 3.32-3zM12 17.5c-2.33 0-4.33-.9-5.74-2.26l1.41-1.41c1.07 1.04 2.58 1.67 4.33 1.67 2.33 0 3.5-1.17 3.5-2.25 0-3.25-6.75-2.25-6.75-6 0-1.92 1.83-3.25 4.25-3.25 1.83 0 3.42.67 4.58 1.75l-1.33 1.42c-.83-.83-1.92-1.33-3.25-1.33-1.42 0-2.33.67-2.33 1.42 0 2.92 6.75 2 6.75 5.83 0 2.25-1.92 3.42-4.92 3.42z" />
    </svg>
  );
}

export async function PublicFooter({ storeSlug }: { storeSlug?: string }) {
  const settings = storeSlug ? await getSiteSettings(storeSlug) : null;
  const waUrl = buildWhatsAppUrl(settings);
  const basePath = storeSlug ? `/toko/${storeSlug}` : "";
  const brandLogoUrl = publicUrl("brand-assets", settings?.brand_logo_path);

  // Fallback URL jika medsos belum di-setting: mengarah ke halaman toko itu sendiri
  const fallbackUrl = basePath || "/";

  const igUrl = settings?.social_instagram?.trim() || fallbackUrl;
  const isIgExternal = Boolean(settings?.social_instagram?.trim());

  const ttUrl = settings?.social_tiktok?.trim() || fallbackUrl;
  const isTtExternal = Boolean(settings?.social_tiktok?.trim());

  const shopeeUrl = settings?.social_shopee?.trim() || fallbackUrl;
  const isShopeeExternal = Boolean(settings?.social_shopee?.trim());

  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Brand */}
          <div className="space-y-3">
            <a href={basePath || "/"} className="flex items-center gap-2 text-lg font-bold tracking-tight">
              {brandLogoUrl && (
                <div className="relative h-8 w-8 overflow-hidden rounded shrink-0">
                  <Image src={brandLogoUrl} alt={settings?.brand_name || "Logo"} fill className="object-contain" unoptimized />
                </div>
              )}
              {settings?.brand_name ?? "KatalogHub"}
            </a>
            {settings?.brand_tagline && (
              <p className="text-sm text-muted-foreground leading-relaxed">{settings.brand_tagline}</p>
            )}

            {/* Social Media Badges (Selalu Muncul) */}
            <div className="pt-1 flex items-center gap-2">
              <a
                href={igUrl}
                target={isIgExternal ? "_blank" : undefined}
                rel={isIgExternal ? "noopener noreferrer" : undefined}
                aria-label="Instagram"
                title={isIgExternal ? "Instagram Toko" : `Katalog ${settings?.brand_name || "Toko"}`}
                className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-background border border-border text-muted-foreground hover:text-rose-600 hover:border-rose-300 transition-colors shadow-2xs"
              >
                <InstagramIcon className="h-4 w-4" />
              </a>

              <a
                href={ttUrl}
                target={isTtExternal ? "_blank" : undefined}
                rel={isTtExternal ? "noopener noreferrer" : undefined}
                aria-label="TikTok"
                title={isTtExternal ? "TikTok Toko" : `Katalog ${settings?.brand_name || "Toko"}`}
                className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-background border border-border text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-colors shadow-2xs"
              >
                <TikTokIcon className="h-4 w-4" />
              </a>

              <a
                href={shopeeUrl}
                target={isShopeeExternal ? "_blank" : undefined}
                rel={isShopeeExternal ? "noopener noreferrer" : undefined}
                aria-label="Shopee"
                title={isShopeeExternal ? "Shopee Toko" : `Katalog ${settings?.brand_name || "Toko"}`}
                className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-background border border-border text-muted-foreground hover:text-orange-600 hover:border-orange-300 transition-colors shadow-2xs"
              >
                <ShopeeIcon className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Navigasi */}
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Navigasi
            </p>
            <nav className="flex flex-col gap-2 text-sm">
              <a href={basePath || "/"} className="hover:text-primary transition-colors">
                Beranda
              </a>
              <Link href={`${basePath}/produk`} className="hover:text-primary transition-colors">
                Produk
              </Link>
              <Link href={`${basePath}/kategori`} className="hover:text-primary transition-colors">
                Kategori
              </Link>
            </nav>
          </div>

          {/* Kontak */}
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Kontak
            </p>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              {settings?.contact_phone && (
                <a
                  href={`tel:${settings.contact_phone}`}
                  className="flex items-center gap-2 hover:text-primary transition-colors"
                >
                  <Phone className="h-3.5 w-3.5" />
                  {settings.contact_phone}
                </a>
              )}
              {settings?.contact_email && (
                <a
                  href={`mailto:${settings.contact_email}`}
                  className="flex items-center gap-2 hover:text-primary transition-colors"
                >
                  <Mail className="h-3.5 w-3.5" />
                  {settings.contact_email}
                </a>
              )}
              {settings?.contact_address && (
                <span className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  {settings.contact_address}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar: Powered by & Copyright */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t pt-6 text-xs text-muted-foreground sm:flex-row">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-center sm:text-left">
            <p>&copy; {new Date().getFullYear()} {settings?.brand_name ?? "KatalogHub"}. All rights reserved.</p>
            <span className="hidden sm:inline text-muted-foreground/40">•</span>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-foreground/80 hover:text-primary transition-colors"
            >
              <span>Powered by</span>
              <span className="font-space text-primary font-extrabold">KatalogHub</span>
            </a>
          </div>

          {waUrl && (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-primary transition-colors font-medium"
            >
              Chat WhatsApp
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>
    </footer>
  );
}
