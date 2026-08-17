"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { requireSuperAdmin, requireAdmin } from "@/lib/auth";
import { logAuditEvent } from "@/lib/security/audit";
import type { Subscription, SubscriptionPlan, SubscriptionStatus, SubscriptionPlanConfig, SubscriptionPayment, PlatformBankAccount, PlatformSetting } from "@/lib/db/types";
import { revalidatePath } from "next/cache";
import {
  createSumopodPayment,
  getSumopodPaymentStatus,
  isSumopodPaymentPaid,
} from "@/lib/payment/sumopod";



export interface OwnerOverviewItem {
  userId: string;
  email: string;
  fullName: string | null;
  brandName: string | null;
  storeSlug: string | null;
  createdAt: string;
  subscription: Subscription | null;
  productCount: number;
}

export interface SaaSStats {
  totalOwners: number;
  activeSubscriptions: number;
  expiringSoon: number;
  totalProducts: number;
  freeTrialCount: number;
  starterCount: number;
  proCount: number;
  enterpriseCount: number;
  suspendedCount: number;
}

/**
 * Mengambil ringkasan statistik platform SaaS untuk Super Admin Dashboard.
 */
export async function getSuperAdminStats(): Promise<SaaSStats> {
  await requireSuperAdmin();
  const supabase = await createClient();

  // 1. Total Owners (dari profiles)
  const { count: totalOwners } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  // 2. Subscriptions breakdown
  const { data: subscriptions } = await supabase
    .from("subscriptions")
    .select("*");

  const now = new Date();
  const next7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  let activeSubscriptions = 0;
  let expiringSoon = 0;
  let freeTrialCount = 0;
  let starterCount = 0;
  let proCount = 0;
  let enterpriseCount = 0;
  let suspendedCount = 0;

  if (subscriptions) {
    subscriptions.forEach((sub: Subscription) => {
      if (sub.status === "active") activeSubscriptions++;
      if (sub.status === "suspended") suspendedCount++;

      if (sub.plan_name === "free_trial") freeTrialCount++;
      if (sub.plan_name === "starter") starterCount++;
      if (sub.plan_name === "pro") proCount++;
      if (sub.plan_name === "enterprise") enterpriseCount++;

      if (sub.expires_at) {
        const exp = new Date(sub.expires_at);
        if (exp > now && exp <= next7Days && sub.status === "active") {
          expiringSoon++;
        }
      }
    });
  }

  // 3. Total Products across all stores
  const { count: totalProducts } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true });

  return {
    totalOwners: totalOwners || 0,
    activeSubscriptions,
    expiringSoon,
    totalProducts: totalProducts || 0,
    freeTrialCount,
    starterCount,
    proCount,
    enterpriseCount,
    suspendedCount,
  };
}

export interface MonthlyGrowthPoint {
  monthLabel: string;
  count: number;
}

export interface PlanDistributionPoint {
  planName: string;
  count: number;
  percentage: number;
}

export interface SaaSAnalyticsData {
  monthlyGrowth: MonthlyGrowthPoint[];
  planDistribution: PlanDistributionPoint[];
}

/**
 * Mengambil data analitik tren pendaftaran & komposisi langganan untuk Super Admin.
 */
export async function getSuperAdminAnalytics(): Promise<SaaSAnalyticsData> {
  await requireSuperAdmin();
  const supabase = await createClient();

  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [profilesRes, subsRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("created_at")
      .gte("created_at", sixMonthsAgo.toISOString()),
    supabase
      .from("subscriptions")
      .select("plan_name"),
  ]);

  const profiles = profilesRes.data;
  const subscriptions = subsRes.data;

  // Calculate 6 months growth trend
  const monthsMap = new Map<string, number>();

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toLocaleDateString("id-ID", { month: "short", year: "2-digit" });
    monthsMap.set(key, 0);
  }

  if (profiles) {
    profiles.forEach((p) => {
      if (p.created_at) {
        const d = new Date(p.created_at);
        const key = d.toLocaleDateString("id-ID", { month: "short", year: "2-digit" });
        if (monthsMap.has(key)) {
          monthsMap.set(key, (monthsMap.get(key) || 0) + 1);
        }
      }
    });
  }

  const monthlyGrowth: MonthlyGrowthPoint[] = Array.from(monthsMap.entries()).map(([monthLabel, count]) => ({
    monthLabel,
    count,
  }));

  const totalSubs = subscriptions?.length || 0;
  const planCounts: Record<string, number> = { free_trial: 0, pro: 0, enterprise: 0 };

  if (subscriptions) {
    subscriptions.forEach((s) => {
      const p = s.plan_name || "free_trial";
      planCounts[p] = (planCounts[p] || 0) + 1;
    });
  }

  const planDistribution: PlanDistributionPoint[] = Object.entries(planCounts).map(([planName, count]) => ({
    planName,
    count,
    percentage: totalSubs > 0 ? Math.round((count / totalSubs) * 100) : 0,
  }));

  return {
    monthlyGrowth,
    planDistribution,
  };
}

/**
 * Mengambil daftar seluruh Store Owner beserta toko & detail langganannya.
 */
export async function getStoreOwnersList(
  searchQuery?: string,
  planFilter?: string,
  statusFilter?: string
): Promise<OwnerOverviewItem[]> {
  await requireSuperAdmin();
  const supabase = await createClient();

  // Fetch profiles
  let profilesQuery = supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (searchQuery && searchQuery.trim()) {
    profilesQuery = profilesQuery.or(
      `email.ilike.%${searchQuery.trim()}%,full_name.ilike.%${searchQuery.trim()}%`
    );
  }

  const { data: profiles, error: pErr } = await profilesQuery;
  if (pErr || !profiles) {
    console.error("Error fetching profiles:", pErr);
    return [];
  }

  const userIds = profiles.map((p) => p.id);
  if (userIds.length === 0) return [];

  // Fetch site_settings
  const { data: settings } = await supabase
    .from("site_settings")
    .select("user_id, brand_name, store_slug")
    .in("user_id", userIds);

  const settingsMap = new Map(
    settings?.map((s) => [s.user_id, s]) || []
  );

  // Fetch subscriptions
  let subQuery = supabase.from("subscriptions").select("*").in("user_id", userIds);
  if (planFilter && planFilter !== "all") {
    subQuery = subQuery.eq("plan_name", planFilter);
  }
  if (statusFilter && statusFilter !== "all") {
    subQuery = subQuery.eq("status", statusFilter);
  }

  const { data: subscriptions } = await subQuery;
  const subMap = new Map(
    subscriptions?.map((sub) => [sub.user_id, sub as Subscription]) || []
  );

  // Fetch product counts per user
  const { data: products } = await supabase
    .from("products")
    .select("user_id");

  const productCountMap = new Map<string, number>();
  if (products) {
    products.forEach((p) => {
      if (p.user_id) {
        productCountMap.set(p.user_id, (productCountMap.get(p.user_id) || 0) + 1);
      }
    });
  }

  // Combine data
  const result: OwnerOverviewItem[] = profiles
    .map((profile) => {
      const storeSetting = settingsMap.get(profile.id);
      const sub = subMap.get(profile.id) || null;

      // Filter check if planFilter or statusFilter was active and sub was null/filtered out
      if ((planFilter && planFilter !== "all") || (statusFilter && statusFilter !== "all")) {
        if (!sub) return null;
      }

      return {
        userId: profile.id,
        email: profile.email,
        fullName: profile.full_name,
        brandName: storeSetting?.brand_name || "Belum Mengatur Toko",
        storeSlug: storeSetting?.store_slug || null,
        createdAt: profile.created_at,
        subscription: sub,
        productCount: productCountMap.get(profile.id) || 0,
      };
    })
    .filter((item): item is OwnerOverviewItem => item !== null);

  return result;
}

/**
 * Server action untuk memperbarui langganan owner oleh Super Admin & mencatat pembayaran jika ada.
 */
export async function updateOwnerSubscriptionAction(formData: FormData) {
  const superadmin = await requireSuperAdmin();
  const supabase = await createClient();

  const userId = formData.get("userId") as string;
  const planName = formData.get("planName") as SubscriptionPlan;
  const status = formData.get("status") as SubscriptionStatus;
  const maxProducts = parseInt((formData.get("maxProducts") as string) || "5", 10);
  const maxLandingPages = parseInt((formData.get("maxLandingPages") as string) || "1", 10);
  const expiresAtStr = formData.get("expiresAt") as string;
  const notes = (formData.get("notes") as string) || "";

  // Dynamic payment recording
  const amountStr = formData.get("paymentAmount") as string;
  const paymentAmount = amountStr ? parseFloat(amountStr) : 0;
  const paymentMethod = (formData.get("paymentMethod") as string) || "Manual Transfer";
  const referenceNote = (formData.get("referenceNote") as string) || null;

  if (!userId) {
    return { success: false, error: "User ID diperlukan" };
  }

  const expiresAt = expiresAtStr ? new Date(expiresAtStr).toISOString() : null;

  const { error } = await supabase
    .from("subscriptions")
    .upsert({
      user_id: userId,
      plan_name: planName,
      status: status,
      max_products: maxProducts,
      max_landing_pages: maxLandingPages,
      expires_at: expiresAt,
      notes: notes,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });

  if (error) {
    console.error("Gagal update subscription:", error);
    return { success: false, error: error.message };
  }

  // Jika ada nominal pembayaran > 0 atau catatan transaksi, catat ke subscription_payments
  if (paymentAmount > 0 || referenceNote) {
    await supabase.from("subscription_payments").insert({
      user_id: userId,
      plan_slug: planName,
      amount: paymentAmount,
      payment_method: paymentMethod,
      reference_note: referenceNote || notes || null,
      status: "completed",
      processed_by: superadmin.userId,
    });
  }

  // Audit log
  await logAuditEvent({
    actionType: "SUBSCRIPTION_UPDATE",
    targetType: "owner_subscription",
    targetId: userId,
    details: { planName, status, maxProducts, maxLandingPages, expiresAt, paymentAmount },
  });

  revalidatePath("/superadmin");
  revalidatePath("/superadmin/owners");
  revalidatePath("/admin/subscription");
  return { success: true };
}

/**
 * Server action untuk memperpanjang masa aktif langganan toko dengan 1-klik (misal +30 hari).
 */
export async function quickExtendSubscriptionAction(userId: string, additionalDays: number = 30) {
  await requireSuperAdmin();
  const supabase = await createClient();

  if (!userId) {
    return { success: false, error: "User ID diperlukan" };
  }

  // Get current subscription
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("expires_at, status")
    .eq("user_id", userId)
    .maybeSingle();

  const now = new Date();
  let baseDate = now;
  if (sub?.expires_at && new Date(sub.expires_at) > now) {
    baseDate = new Date(sub.expires_at);
  }

  const newExpiresAt = new Date(baseDate.getTime() + additionalDays * 86400000).toISOString();

  const { error } = await supabase
    .from("subscriptions")
    .upsert({
      user_id: userId,
      status: "active",
      expires_at: newExpiresAt,
      notes: `[Quick Extend +${additionalDays} Hari oleh Super Admin]`,
      updated_at: now.toISOString(),
    }, { onConflict: "user_id" });

  if (error) {
    console.error("Gagal quick extend subscription:", error);
    return { success: false, error: error.message };
  }

  // Audit log
  await logAuditEvent({
    actionType: "QUICK_EXTEND_SUBSCRIPTION",
    targetType: "owner_subscription",
    targetId: userId,
    details: { additionalDays, newExpiresAt },
  });

  revalidatePath("/superadmin");
  revalidatePath("/superadmin/owners");
  revalidatePath("/admin/subscription");
  return { success: true };
}

/**
 * Server action untuk mensuspend / mengaktifkan langganan owner.
 */
export async function toggleOwnerStatusAction(userId: string, newStatus: SubscriptionStatus) {
  await requireSuperAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("subscriptions")
    .update({
      status: newStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/superadmin");
  revalidatePath("/superadmin/owners");
  revalidatePath("/admin/subscription");
  return { success: true };
}

/**
 * Mengambil informasi langganan & riwayat pembayaran milik Store Owner saat ini.
 */
export async function getMySubscription(): Promise<{
  subscription: Subscription | null;
  productCount: number;
  maxProducts: number;
  brandName: string | null;
  storeSlug: string | null;
  payments: SubscriptionPayment[];
}> {
  const current = await requireAdmin();
  const supabase = await createClient();

  const [subRes, countRes, settingRes, paymentsRes] = await Promise.all([
    supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", current.userId)
      .maybeSingle(),
    supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("user_id", current.userId),
    supabase
      .from("site_settings")
      .select("brand_name, store_slug")
      .eq("user_id", current.userId)
      .maybeSingle(),
    supabase
      .from("subscription_payments")
      .select("*")
      .eq("user_id", current.userId)
      .order("created_at", { ascending: false }),
  ]);

  const sub = subRes.data as Subscription | null;

  return {
    subscription: sub || null,
    productCount: countRes.count || 0,
    maxProducts: sub?.max_products ?? 5,
    brandName: settingRes.data?.brand_name || null,
    storeSlug: settingRes.data?.store_slug || null,
    payments: (paymentsRes.data as SubscriptionPayment[]) || [],
  };
}

/**
 * Server action bagi Store Owner untuk mengajukan perpanjangan/upgrade langganan.
 */
export async function requestSubscriptionUpgradeAction(formData: FormData) {
  const current = await requireAdmin();
  const supabase = await createClient();

  const targetPlan = formData.get("targetPlan") as string;
  const paymentNotes = formData.get("paymentNotes") as string;

  const noteText = `[Pengajuan Upgrade ke ${targetPlan.toUpperCase()}] ${paymentNotes ? "Catatan: " + paymentNotes : ""}`;

  const { error } = await supabase
    .from("subscriptions")
    .update({
      status: "pending_approval",
      notes: noteText,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", current.userId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/subscription");
  return { success: true };
}

/**
 * Mengambil daftar konfigurasi paket langganan dari tabel subscription_plans.
 */
export async function getSubscriptionPlans(): Promise<SubscriptionPlanConfig[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("subscription_plans")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error || !data) {
    console.error("Error fetching subscription_plans:", error);
    return [];
  }

  return data.map((plan) => ({
    ...plan,
    features: Array.isArray(plan.features) ? plan.features : typeof plan.features === "string" ? JSON.parse(plan.features) : [],
  })) as SubscriptionPlanConfig[];
}

/**
 * Server action untuk Super Admin memperbarui isi & harga paket langganan.
 */
export async function updateSubscriptionPlanAction(formData: FormData) {
  await requireSuperAdmin();
  const supabase = await createClient();

  const id = formData.get("id") as string;
  const slug = formData.get("slug") as string;
  const name = formData.get("name") as string;
  const price = parseFloat((formData.get("price") as string) || "0");
  const priceLabel = (formData.get("priceLabel") as string) || null;
  const billingPeriod = (formData.get("billingPeriod") as string) || "per tahun";
  const durationDays = parseInt((formData.get("durationDays") as string) || "365", 10);
  const maxProducts = parseInt((formData.get("maxProducts") as string) || "5", 10);
  const maxLandingPages = parseInt((formData.get("maxLandingPages") as string) || "1", 10);
  const isActive = formData.get("isActive") === "true";
  const isPopular = formData.get("isPopular") === "true";
  const featuresRaw = (formData.get("features") as string) || "";

  // Parse features lines into array
  const features = featuresRaw
    .split("\n")
    .map((f) => f.trim())
    .filter((f) => f.length > 0);

  const row = {
    slug,
    name,
    price,
    price_label: priceLabel,
    billing_period: billingPeriod,
    duration_days: durationDays,
    max_products: maxProducts,
    max_landing_pages: maxLandingPages,
    features: JSON.stringify(features),
    is_active: isActive,
    is_popular: isPopular,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("subscription_plans")
    .update(row)
    .eq("id", id);

  if (error) {
    console.error("Gagal update subscription_plan:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/superadmin/subscriptions");
  revalidatePath("/admin/subscription");
  return { success: true };
}

/**
 * Mengambil rekening bank aktif & petunjuk pembayaran platform (Dapat diakses Tenant & Superadmin).
 *
 * SECURITY: Hardcoded bank account data telah dihapus dari source code.
 * Semua data rekening disimpan hanya di database (tabel platform_bank_accounts).
 */
export async function getPlatformPaymentSettings(): Promise<{
  bankAccounts: PlatformBankAccount[];
  instructions: string;
}> {
  const defaultInstructions =
    "Informasi pembayaran belum dikonfigurasi. Hubungi Super Admin untuk mengatur rekening bank platform.";

  try {
    const supabase = await createClient();

    const { data: accountsData } = await supabase
      .from("platform_bank_accounts")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    const { data: settingData } = await supabase
      .from("platform_settings")
      .select("value")
      .eq("key", "payment_instructions")
      .single();

    return {
      bankAccounts: (accountsData ?? []) as PlatformBankAccount[],
      instructions: settingData?.value || defaultInstructions,
    };
  } catch (err) {
    console.error("Gagal mengambil platform payment settings:", err);
    return {
      bankAccounts: [],
      instructions: defaultInstructions,
    };
  }
}

/**
 * Mengambil semua rekening bank (termasuk yang non-aktif) & petunjuk pembayaran untuk Superadmin.
 */
export async function getAllPlatformBankAccounts(): Promise<{
  bankAccounts: PlatformBankAccount[];
  instructions: string;
}> {
  await requireSuperAdmin();
  const supabase = await createClient();

  const { data: accountsData } = await supabase
    .from("platform_bank_accounts")
    .select("*")
    .order("sort_order", { ascending: true });

  const { data: settingData } = await supabase
    .from("platform_settings")
    .select("value")
    .eq("key", "payment_instructions")
    .single();

  return {
    bankAccounts: (accountsData ?? []) as PlatformBankAccount[],
    instructions: settingData?.value || "Belum ada petunjuk pembayaran. Atur di pengaturan.",
  };
}

/**
 * Menyimpan atau memperbarui rekening bank platform (Superadmin only).
 */
export async function savePlatformBankAccountAction(formData: FormData) {
  await requireSuperAdmin();
  const supabase = await createClient();

  const id = formData.get("id") as string | null;
  const bankName = (formData.get("bankName") as string) || "";
  const accountNumber = (formData.get("accountNumber") as string) || "";
  const accountHolder = (formData.get("accountHolder") as string) || "";
  const isActive = formData.get("isActive") === "true";
  const sortOrder = parseInt((formData.get("sortOrder") as string) || "1", 10);

  if (!bankName.trim() || !accountNumber.trim()) {
    return { success: false, error: "Nama bank dan nomor rekening wajib diisi." };
  }

  const payload = {
    bank_name: bankName.trim(),
    account_number: accountNumber.trim(),
    account_holder: accountHolder.trim(),
    is_active: isActive,
    sort_order: sortOrder,
    updated_at: new Date().toISOString(),
  };

  let resultErr = null;

  if (id && !id.startsWith("default-")) {
    const { error } = await supabase
      .from("platform_bank_accounts")
      .update(payload)
      .eq("id", id);
    resultErr = error;
  } else {
    const { error } = await supabase
      .from("platform_bank_accounts")
      .insert([payload]);
    resultErr = error;
  }

  if (resultErr) {
    console.error("Gagal simpan platform_bank_account:", resultErr);
    return { success: false, error: resultErr.message };
  }

  revalidatePath("/superadmin/subscriptions");
  revalidatePath("/admin/subscription");
  return { success: true };
}

/**
 * Menghapus rekening bank platform (Superadmin only).
 */
export async function deletePlatformBankAccountAction(id: string) {
  await requireSuperAdmin();
  const supabase = await createClient();

  if (id.startsWith("default-")) {
    return { success: false, error: "Rekening default tidak dapat dihapus." };
  }

  const { error } = await supabase
    .from("platform_bank_accounts")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Gagal hapus platform_bank_account:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/superadmin/subscriptions");
  revalidatePath("/admin/subscription");
  return { success: true };
}

/**
 * Memperbarui teks petunjuk pembayaran platform (Superadmin only).
 */
export async function updatePaymentInstructionsAction(instructions: string) {
  await requireSuperAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("platform_settings")
    .upsert({
      key: "payment_instructions",
      value: instructions.trim(),
      updated_at: new Date().toISOString(),
    });

  if (error) {
    console.error("Gagal update payment_instructions:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/superadmin/subscriptions");
  revalidatePath("/admin/subscription");
  return { success: true };
}

export interface PlatformAuditLog {
  id: string;
  actor_email: string | null;
  action_type: string;
  target_type: string | null;
  target_id: string | null;
  details: Record<string, any> | null;
  created_at: string;
}

/**
 * Mengambil log aktivitas platform terbaru untuk Super Admin.
 */
export async function getPlatformAuditLogs(limit: number = 10): Promise<PlatformAuditLog[]> {
  await requireSuperAdmin();
  const supabase = await createClient();

  try {
    const { data } = await supabase
      .from("platform_audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (data && data.length > 0) {
      return data as PlatformAuditLog[];
    }
  } catch (err) {
    console.warn("Table platform_audit_logs maybe not created yet:", err);
  }

  // Fallback initial log entry
  return [
    {
      id: "log-1",
      actor_email: "superadmin@kataloghub.com",
      action_type: "SYSTEM_INITIALIZE",
      target_type: "platform",
      target_id: "saas-core",
      details: { message: "SaaS Control Center & Audit Log aktif" },
      created_at: new Date().toISOString(),
    },
  ];
}

/**
 * Membuat transaksi pembayaran baru via Sumopod Payment Gateway untuk paket langganan.
 */
export async function createSumopodSubscriptionPaymentAction(planSlug: string) {
  const current = await requireAdmin();
  const supabase = await createClient();
  const adminDb = createAdminClient();

  // 1. Ambil detail paket langganan
  const { data: plan } = await supabase
    .from("subscription_plans")
    .select("*")
    .eq("slug", planSlug)
    .maybeSingle();

  const price = plan ? Number(plan.price) : planSlug === "starter" ? 20000 : planSlug === "pro" ? 75000 : 0;

  if (price <= 0) {
    return { success: false, error: "Paket ini gratis atau tidak memerlukan pembayaran." };
  }

  // 2. Generate unique order_id
  const timestamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  const orderId = `KH-${planSlug.toUpperCase()}-${timestamp}-${rand}`;

  // 3. Tentukan return URL & webhook URL
  const appUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const successReturnUrl = `${appUrl}/admin/subscription?payment=success&order_id=${orderId}`;
  const cancelReturnUrl = `${appUrl}/admin/subscription?payment=cancel&order_id=${orderId}`;
  const webhookUrl = `${appUrl}/api/payments/sumopod/webhook`;

  // 4. Panggil Sumopod Payment API
  const sumopodRes = await createSumopodPayment({
    orderId,
    amount: price,
    currency: "IDR",
    expiresInHours: 24,
    successReturnUrl,
    cancelReturnUrl,
    webhookUrl,
    paymentMethodTypeCode: "QRIS",
  });

  const checkoutUrl = sumopodRes.data?.payment_link_url || sumopodRes.data?.payment_url || sumopodRes.data?.checkout_url || null;
  const qrisContent = sumopodRes.data?.qris_content || sumopodRes.data?.qris_url || null;


  // 5. Catat transaksi di subscription_payments
  const { error: dbErr } = await adminDb.from("subscription_payments").insert({
    user_id: current.userId,
    plan_slug: planSlug,
    amount: price,
    payment_method: "QRIS",
    order_id: orderId,
    payment_gateway: "sumopod",
    checkout_url: checkoutUrl,
    status: "pending",
    reference_note: `[Sumopod Sandbox] Tagihan ${planSlug.toUpperCase()} (${orderId})`,
    raw_response: sumopodRes.raw || null,
  });

  if (dbErr) {
    console.error("Gagal menyimpan subscription_payments:", dbErr);
  }

  revalidatePath("/admin/subscription");

  if (!sumopodRes.success) {
    return {
      success: false,
      error: sumopodRes.error || "Gagal membuat invoice Sumopod.",
      orderId,
      fallbackPending: true,
    };
  }

  return {
    success: true,
    orderId,
    checkoutUrl,
    qrisContent,
    amount: price,
  };
}

/**
 * Mengecek dan mensinkronisasikan status pembayaran dari API Sumopod Gateway secara langsung (Live API Check).
 */
export async function checkAndSyncSumopodPaymentStatusAction(orderId: string) {
  const current = await requireAdmin();
  const adminDb = createAdminClient();

  // 1. Ambil record dari DB
  const { data: payment } = await adminDb
    .from("subscription_payments")
    .select("*")
    .eq("order_id", orderId)
    .eq("user_id", current.userId)
    .maybeSingle();

  if (!payment) {
    return { success: false, error: "Transaksi tidak ditemukan." };
  }

  // Jika sudah completed, tidak perlu sync ulang
  if (payment.status === "completed") {
    return { success: true, status: "completed", isPaid: true };
  }

  // 2. Panggil API status Sumopod Sandbox secara live
  const sumopodRes = await getSumopodPaymentStatus(orderId);
  if (!sumopodRes.success) {
    return { success: false, error: sumopodRes.error || "Gagal mengambil status dari Sumopod." };
  }

  const statusRaw = (
    sumopodRes.data?.status ||
    sumopodRes.data?.payment_status ||
    ""
  ).toString().toLowerCase();

  const isPaid = isSumopodPaymentPaid(statusRaw, sumopodRes.data?.is_paid === true);

  if (isPaid) {
    const planSlug = payment.plan_slug || "starter";
    const { data: planConfig } = await adminDb
      .from("subscription_plans")
      .select("*")
      .eq("slug", planSlug)
      .maybeSingle();

    const durationDays = planConfig?.duration_days || 30;
    const maxProducts = planConfig?.max_products ?? (planSlug === "starter" ? 20 : planSlug === "pro" ? 100 : 500);
    const maxLandingPages = planConfig?.max_landing_pages ?? (planSlug === "starter" ? 1 : planSlug === "pro" ? 5 : 20);

    const expiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString();

    await adminDb.from("subscription_payments").update({
      status: "completed",
      raw_response: sumopodRes.raw,
      updated_at: new Date().toISOString(),
    }).eq("id", payment.id);

    await adminDb.from("subscriptions").upsert(
      {
        user_id: current.userId,
        plan_name: planSlug,
        status: "active",
        max_products: maxProducts,
        max_landing_pages: maxLandingPages,
        starts_at: new Date().toISOString(),
        expires_at: expiresAt,
        notes: `Aktif via Live Status Check Sumopod Sandbox (${orderId})`,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

    revalidatePath("/admin/subscription");
    return { success: true, status: "completed", isPaid: true };
  }

  return { success: true, status: statusRaw || payment.status, isPaid: false };
}

/**
 * Helper Simulasi Pembayaran Sandbox (untuk testing lokal / dev bila webhook tidak terjangkau internet).
 */
export async function simulateSumopodPaymentSandboxAction(orderId: string) {
  const current = await requireAdmin();

  if (process.env.SUMOPOD_SANDBOX_SIMULATION_ENABLED !== "true") {
    return {
      success: false,
      error: "Simulasi sandbox belum diaktifkan. Set SUMOPOD_SANDBOX_SIMULATION_ENABLED=true hanya di environment test.",
    };
  }

  const adminDb = createAdminClient();

  const { data: payment } = await adminDb
    .from("subscription_payments")
    .select("*")
    .eq("order_id", orderId)
    .eq("user_id", current.userId)
    .maybeSingle();

  if (!payment) {
    return { success: false, error: "Data transaksi tidak ditemukan." };
  }

  // Panggil logika pengaktifan paket
  const planSlug = payment.plan_slug || "starter";
  const { data: planConfig } = await adminDb
    .from("subscription_plans")
    .select("*")
    .eq("slug", planSlug)
    .maybeSingle();

  const durationDays = planConfig?.duration_days || 30;
  const maxProducts = planConfig?.max_products ?? (planSlug === "starter" ? 20 : planSlug === "pro" ? 100 : 500);
  const maxLandingPages = planConfig?.max_landing_pages ?? (planSlug === "starter" ? 1 : planSlug === "pro" ? 5 : 20);

  const expiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString();

  await adminDb.from("subscription_payments").update({
    status: "completed",
    reference_note: `[Simulasi Sandbox Sukses] ${orderId}`,
    updated_at: new Date().toISOString(),
  }).eq("id", payment.id);

  await adminDb.from("subscriptions").upsert(
    {
      user_id: current.userId,
      plan_name: planSlug,
      status: "active",
      max_products: maxProducts,
      max_landing_pages: maxLandingPages,
      starts_at: new Date().toISOString(),
      expires_at: expiresAt,
      notes: `Aktif via Simulasi Sandbox Sumopod (${orderId})`,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  revalidatePath("/admin/subscription");
  return { success: true };
}


