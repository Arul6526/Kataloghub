import { type NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { sanitizeText, sanitizeSlug, isPayloadTooLarge } from "@/lib/security/input-validator";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // ── Input Validation ──
    if (isPayloadTooLarge(body, 10_000)) {
      return NextResponse.json({ error: "Payload terlalu besar" }, { status: 413 });
    }

    const { storeSlug, itemsSummary, totalPrice, customerName } = body;

    if (!storeSlug || !itemsSummary) {
      return NextResponse.json({ error: "Data pesanan tidak lengkap" }, { status: 400 });
    }

    // Sanitize all inputs
    const safeStoreSlug = sanitizeSlug(storeSlug);
    if (!safeStoreSlug) {
      return NextResponse.json({ error: "Store slug tidak valid" }, { status: 400 });
    }

    const safeItemsSummary = sanitizeText(itemsSummary, 2000);
    const safeCustomerName = sanitizeText(customerName, 200) || "Pelanggan Katalog";
    const safeTotalPrice = Math.max(0, Math.min(Number(totalPrice) || 0, 999_999_999));

    if (!safeItemsSummary) {
      return NextResponse.json({ error: "Ringkasan pesanan tidak boleh kosong" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // 1. Ambil user_id pemilik toko dari site_settings berdasarkan store_slug
    let userId: string | null = null;
    const { data: settings } = await supabase
      .from("site_settings")
      .select("user_id")
      .eq("store_slug", safeStoreSlug)
      .maybeSingle();

    if (settings?.user_id) {
      userId = settings.user_id;
    } else {
      // Fallback: Jika storeSlug tidak cocok (misal mode default/single tenant),
      // ambil site_settings pertama yang memiliki user_id
      const { data: fallbackSettings } = await supabase
        .from("site_settings")
        .select("user_id")
        .not("user_id", "is", null)
        .limit(1)
        .maybeSingle();
      
      userId = fallbackSettings?.user_id ?? null;
    }

    // 2. Catat ke tabel order_leads
    const { error } = await supabase.from("order_leads").insert({
      user_id: userId,
      store_slug: safeStoreSlug,
      customer_name: safeCustomerName,
      items_summary: safeItemsSummary,
      total_price: safeTotalPrice,
    });

    if (error) {
      console.error("[Order Lead API] Error inserting lead into DB:", error.message, error);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[Order Lead API] Unhandled exception:", error);
    return NextResponse.json({ ok: true }); // Return ok agar alur WA tidak terblokir
  }
}
