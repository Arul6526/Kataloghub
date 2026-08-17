"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";

import { createSumopodPayment } from "@/lib/payment/sumopod";

export async function registerAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const businessName = formData.get("businessName") as string;
  const selectedPlan = (formData.get("selectedPlan") as string) || "free_trial";
  const supabase = await createClient();

  // 1. Daftar user ke Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  let checkoutUrl: string | null = null;
  let orderId: string | null = null;

  if (data.user) {
    try {
      const adminDb = createAdminClient();
      
      // 2. Pastikan Profile terbuat (Self-healing bila DB trigger tidak aktif)
      await adminDb.from("profiles").upsert(
        {
          id: data.user.id,
          email: data.user.email ?? email,
          full_name: businessName || email.split("@")[0],
          is_admin: true,
        },
        { onConflict: "id" }
      );

      // 3. Pastikan Site Settings terbuat untuk toko baru
      const baseSlug = (businessName || email.split("@")[0] || "toko")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "") || "toko";
      const storeSlug = `${baseSlug}-${data.user.id.substring(0, 6)}`;

      await adminDb.from("site_settings").upsert(
        {
          user_id: data.user.id,
          brand_name: businessName || "Toko Saya",
          store_slug: storeSlug,
          seo_title: `Katalog ${businessName || "Toko"}`,
          seo_description: `Katalog produk resmi ${businessName || "Toko"}`,
          whatsapp_template: "Halo, saya tertarik dengan produk di katalog Anda.",
        },
        { onConflict: "user_id" }
      );

      // 4. Jika pengguna memilih paket berbayar saat pendaftaran (misal: Starter / Pro)
      if (selectedPlan === "starter" || selectedPlan === "pro") {
        const amount = selectedPlan === "starter" ? 20000 : 75000;
        const timestamp = Date.now().toString(36).toUpperCase();
        const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
        orderId = `KH-REG-${selectedPlan.toUpperCase()}-${timestamp}-${rand}`;

        const appUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
        const successReturnUrl = `${appUrl}/admin/subscription?payment=success&order_id=${orderId}`;
        const cancelReturnUrl = `${appUrl}/admin/subscription?payment=cancel&order_id=${orderId}`;

        const sumopodRes = await createSumopodPayment({
          orderId,
          amount,
          currency: "IDR",
          expiresInHours: 24,
          successReturnUrl,
          cancelReturnUrl,
          paymentMethodTypeCode: "QRIS",
        });

        checkoutUrl = sumopodRes.data?.payment_link_url || sumopodRes.data?.payment_url || sumopodRes.data?.checkout_url || null;


        await adminDb.from("subscription_payments").insert({
          user_id: data.user.id,
          plan_slug: selectedPlan,
          amount,
          payment_method: "QRIS",
          order_id: orderId,
          payment_gateway: "sumopod",
          checkout_url: checkoutUrl,
          status: "pending",
          reference_note: `[Registration Sumopod Sandbox] Tagihan ${selectedPlan.toUpperCase()} (${orderId})`,
          raw_response: sumopodRes.raw || null,
        });
      }
    } catch (e) {
      console.error("Register auto-provisioning warning:", e);
    }
  }

  return { 
    success: true, 
    selectedPlan,
    checkoutUrl,
    orderId,
  };
}

