import { createAdminClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { PageHeader } from "@/components/admin/page-header";
import { QRPosterClient } from "@/components/admin/qr-poster-client";

export default async function QRPosterPage() {
  const current = await getCurrentUser();
  const userId = current?.userId;

  const supabase = createAdminClient();
  let storeSlug = "toko-kami";
  let brandName = "Toko Kami";
  let brandTagline = "Katalog Produk & Pemesanan Online";
  let whatsappNumber = "";

  if (userId) {
    const { data: settings } = await supabase
      .from("site_settings")
      .select("store_slug, brand_name, brand_tagline, whatsapp_number")
      .eq("user_id", userId)
      .maybeSingle();

    if (settings) {
      storeSlug = settings.store_slug || "toko-kami";
      brandName = settings.brand_name || "Toko Kami";
      brandTagline = settings.brand_tagline || "Katalog Produk & Pemesanan Online";
      whatsappNumber = settings.whatsapp_number || "";
    }
  }

  return (
    <div className="space-y-6">
      <div className="print:hidden">
        <PageHeader
          title="Poster & QR Toko Cetak"
          description="Cetak poster & QR Code fisik untuk dipajang di etalase toko, meja kasir, atau dikirimkan ke pelanggan."
        />
      </div>

      <QRPosterClient
        storeSlug={storeSlug}
        brandName={brandName}
        brandTagline={brandTagline}
        whatsappNumber={whatsappNumber}
      />
    </div>
  );
}
