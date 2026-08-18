import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import {
  isSumopodPaymentFailed,
  isSumopodPaymentPaid,
  normalizeSumopodStatus,
} from "@/lib/payment/sumopod";
import { verifyWebhookSignature } from "@/lib/payment/webhook-signature";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const webhookSecret = process.env.SUMOPOD_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("SUMOPOD_WEBHOOK_SECRET belum dikonfigurasi.");
      return NextResponse.json(
        { success: false, message: "Webhook is not configured" },
        { status: 500 },
      );
    }

    const isValid = verifyWebhookSignature(
      webhookSecret,
      req.headers.get("svix-id"),
      req.headers.get("svix-timestamp"),
      req.headers.get("svix-signature"),
      rawBody,
    );

    if (!isValid) {
      return NextResponse.json(
        { success: false, message: "Invalid webhook signature" },
        { status: 401 },
      );
    }

    let payload: Record<string, any>;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid JSON payload" },
        { status: 400 },
      );
    }

    console.log("Verified Sumopod Payment Webhook:", payload.event_type || payload.event);

    const eventType = (payload.event_type || payload.event || "").toString().toLowerCase();

    // 0. Penanganan Test Event dari Halaman Settings Dashboard Sumopod (payment.test / payment.text)
    if (
      eventType === "payment.test" ||
      eventType === "payment.text" ||
      payload.event === "payment.test"
    ) {
      console.log("Sumopod Test Webhook Event Verified!");
      return NextResponse.json({
        success: true,
        message: "Test webhook event received successfully!",
      });
    }

    // Ekstrak order_id dan status dari payload webhook resmi Sumopod
    const dataObj = payload.data || payload;
    const orderId = dataObj.order_id || payload.order_id || payload.orderId;
    const statusRaw = normalizeSumopodStatus(dataObj.status || payload.status || eventType);

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: "Missing order_id in webhook payload" },
        { status: 400 },
      );
    }

    const adminDb = createAdminClient();

    // 1. Cari data pembayaran di subscription_payments
    const { data: payment, error: fetchErr } = await adminDb
      .from("subscription_payments")
      .select("*")
      .eq("order_id", orderId)
      .maybeSingle();

    if (fetchErr || !payment) {
      console.warn(`Pembayaran dengan order_id ${orderId} tidak ditemukan:`, fetchErr);
      return NextResponse.json(
        { success: false, message: "Payment record not found" },
        { status: 404 },
      );
    }

    const webhookAmount = dataObj.amount ?? dataObj.total_amount ?? dataObj.gross_amount;
    if (webhookAmount !== undefined && Number(webhookAmount) !== Number(payment.amount)) {
      console.warn(`Nominal webhook ${webhookAmount} tidak cocok dengan order ${orderId}.`);
      return NextResponse.json(
        { success: false, message: "Payment amount mismatch" },
        { status: 400 },
      );
    }

    const webhookCurrency = dataObj.currency;
    if (webhookCurrency && webhookCurrency.toString().toUpperCase() !== "IDR") {
      return NextResponse.json(
        { success: false, message: "Unsupported payment currency" },
        { status: 400 },
      );
    }

    // 2. Evaluasi status pembayaran
    const isPaid =
      eventType === "payment.completed" ||
      isSumopodPaymentPaid(statusRaw, dataObj.is_paid === true);

    const isFailed =
      eventType === "payment.failed" ||
      eventType === "payment.expired" ||
      isSumopodPaymentFailed(statusRaw);

    if (isPaid) {
      if (payment.status === "completed") {
        return NextResponse.json({
          success: true,
          message: "Payment already processed",
        });
      }

      // Update status pembayaran menjadi completed
      const { error: paymentUpdateError } = await adminDb
        .from("subscription_payments")
        .update({
          status: "completed",
          raw_response: payload,
          updated_at: new Date().toISOString(),
        })
        .eq("id", payment.id);

      if (paymentUpdateError) {
        throw paymentUpdateError;
      }

      // Ambil detail paket dari subscription_plans atau fallback default
      const planSlug = payment.plan_slug || "starter";
      const { data: planConfig } = await adminDb
        .from("subscription_plans")
        .select("*")
        .eq("slug", planSlug)
        .maybeSingle();

      const durationDays = planConfig?.duration_days || 30;
      const maxProducts =
        planConfig?.max_products ?? (planSlug === "starter" ? 20 : planSlug === "pro" ? 100 : 500);
      const maxLandingPages =
        planConfig?.max_landing_pages ?? (planSlug === "starter" ? 1 : planSlug === "pro" ? 5 : 20);

      const expiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString();

      // Update / Upsert status langganan pengguna menjadi active
      const { error: subErr } = await adminDb.from("subscriptions").upsert(
        {
          user_id: payment.user_id,
          plan_name: planSlug,
          status: "active",
          max_products: maxProducts,
          max_landing_pages: maxLandingPages,
          starts_at: new Date().toISOString(),
          expires_at: expiresAt,
          notes: `Auto-activated via Sumopod Payment Webhook (${orderId})`,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      );

      if (subErr) {
        console.error("Gagal memperbarui status langganan via webhook:", subErr);
      } else {
        console.log(`Berhasil mengaktifkan paket ${planSlug} untuk user ${payment.user_id}`);
      }

      return NextResponse.json({
        success: true,
        message: "Payment completed and subscription activated",
      });
    } else if (isFailed) {
      if (payment.status === "completed") {
        return NextResponse.json({
          success: true,
          message: "Payment already completed; ignoring later failure event",
        });
      }
      const finalStatus =
        eventType === "payment.expired" || statusRaw === "expired" ? "expired" : "failed";
      const { error: paymentUpdateError } = await adminDb
        .from("subscription_payments")
        .update({
          status: finalStatus,
          raw_response: payload,
          updated_at: new Date().toISOString(),
        })
        .eq("id", payment.id);

      if (paymentUpdateError) {
        throw paymentUpdateError;
      }

      return NextResponse.json({
        success: true,
        message: `Payment status updated to ${finalStatus}`,
      });
    }

    // Jika status masih pending / processing
    return NextResponse.json({
      success: true,
      message: `Webhook received with event ${eventType} & status: ${statusRaw}`,
    });
  } catch (err: any) {
    console.error("Webhook processing error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
