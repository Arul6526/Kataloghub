import { PublicHeader } from "@/components/public/header";
import { PublicFooter } from "@/components/public/footer";
import { getSiteSettings } from "@/lib/public-data";
import { publicUrl } from "@/lib/storage-url";
import { CatalogInfoProvider } from "@/components/public/catalog-info-context";
import { CartProvider } from "@/components/public/cart-context";
import { CartDrawer } from "@/components/public/cart-drawer";

export async function PublicPageLayout({ children, storeSlug }: { children: React.ReactNode; storeSlug?: string }) {
  const settings = storeSlug ? await getSiteSettings(storeSlug) : null;
  const brandName = settings?.brand_name ?? "KatalogHub";
  const brandLogoUrl = publicUrl("brand-assets", settings?.brand_logo_path);

  return (
    <CatalogInfoProvider>
      <CartProvider storeSlug={storeSlug || "default"}>
        <div className="flex min-h-dvh flex-col">
          <PublicHeader brandName={brandName} storeSlug={storeSlug} brandLogoUrl={brandLogoUrl} />
          <main className="flex-1">{children}</main>
          <PublicFooter storeSlug={storeSlug} />

          {storeSlug && (
            <CartDrawer
              storeSlug={storeSlug}
              brandName={brandName}
              whatsappNumber={settings?.whatsapp_number}
              whatsappTemplate={settings?.whatsapp_template}
            />
          )}
        </div>
      </CartProvider>
    </CatalogInfoProvider>
  );
}
