import { createAdminClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { PageHeader } from "@/components/admin/page-header";
import { POSNotaClient } from "@/components/admin/pos-nota-client";

export default async function POSNotaPage() {
  const current = await getCurrentUser();
  const userId = current?.userId;

  const supabase = createAdminClient();
  let products: { id: string; name: string; price: number | null; slug: string }[] = [];
  let storeSlug = "toko-kami";
  let brandName = "Toko Kami";
  let brandTagline = "Katalog Produk & Pemesanan Online";
  let whatsappNumber = "";

  if (userId) {
    // Fetch products for product selection
    const { data: prods } = await supabase
      .from("products")
      .select("id, name, price, slug")
      .eq("user_id", userId)
      .eq("is_visible", true)
      .order("name", { ascending: true });

    if (prods) {
      products = prods;
    }

    // Fetch site settings
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
          title="Kasir & Rekap Nota Digital"
          description="Buat rincian transaksi belanja instan, kirim bukti nota resmi ke WhatsApp pembeli, atau cetak struk pembayaran."
        />
      </div>

      <POSNotaClient
        products={products}
        brandName={brandName}
        brandTagline={brandTagline}
        whatsappNumber={whatsappNumber}
        storeSlug={storeSlug}
      />
    </div>
  );
}
