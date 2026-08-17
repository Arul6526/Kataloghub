"use client";

import { useState } from "react";
import type {
  Subscription,
  SubscriptionPlanConfig,
  SubscriptionPayment,
  PlatformBankAccount,
} from "@/lib/db/types";
import {
  requestSubscriptionUpgradeAction,
  createSumopodSubscriptionPaymentAction,
  simulateSumopodPaymentSandboxAction,
  checkAndSyncSumopodPaymentStatusAction,
} from "@/lib/actions/saas-actions";

import { useSearchParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Package,
  CreditCard,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Crown,
  Sparkles,
  ArrowUpRight,
  Loader2,
  Ban,
  FileCode,
  MessageCircle,
  Building,
  History,
  Check,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";

interface SubscriptionClientViewProps {
  subscription: Subscription | null;
  productCount: number;
  maxProducts: number;
  brandName?: string | null;
  storeSlug?: string | null;
  payments?: SubscriptionPayment[];
  plans?: SubscriptionPlanConfig[];
  bankAccounts?: PlatformBankAccount[];
  paymentInstructions?: string;
}

const DEFAULT_ADMIN_WA = "6281234567890"; // WhatsApp Admin

export function SubscriptionClientView({
  subscription,
  productCount,
  maxProducts,
  brandName,
  storeSlug,
  payments = [],
  plans = [],
  bankAccounts = [],
  paymentInstructions = "Transfer pembayaran langganan ke salah satu rekening resmi di bawah ini, kemudian kirimkan bukti transfer melalui WhatsApp untuk proses verifikasi.",
}: SubscriptionClientViewProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const paymentQueryStatus = searchParams.get("payment");
  const queryOrderId = searchParams.get("order_id");

  const [showUpgradeForm, setShowUpgradeForm] = useState(false);
  const [selectedPlanSlug, setSelectedPlanSlug] = useState<string>("pro");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [sumopodLoading, setSumopodLoading] = useState<string | null>(null);
  const [syncingOrderId, setSyncingOrderId] = useState<string | null>(null);
  const [activePaymentOrder, setActivePaymentOrder] = useState<{
    orderId: string;
    checkoutUrl?: string | null;
    qrisContent?: string | null;
    amount?: number;
    planSlug?: string;
  } | null>(queryOrderId ? { orderId: queryOrderId } : null);
  const [simulatingOrderId, setSimulatingOrderId] = useState<string | null>(null);

  const plan = subscription?.plan_name || "free_trial";
  const status = subscription?.status || "active";
  const expiresAt = subscription?.expires_at;
  const maxLandingPages = subscription?.max_landing_pages ?? 1;

  const isExpired = expiresAt && new Date(expiresAt) < new Date();
  const isExpiringSoon =
    expiresAt && !isExpired && new Date(expiresAt) <= new Date(Date.now() + 7 * 86400000);
  const usagePercent = maxProducts > 0 ? Math.round((productCount / maxProducts) * 100) : 0;

  // Build WhatsApp URL preset
  const buildWhatsAppUpgradeUrl = (targetPlanName: string, planPriceLabel?: string) => {
    const store = brandName || storeSlug || "Toko Kami";
    const userId = subscription?.user_id || "-";
    const text = `Halo Admin KatalogHub, saya ingin perpanjang/upgrade paket langganan toko *${store}* (ID: ${userId}) ke paket *${targetPlanName}* (${planPriceLabel || "Pro"}). Mohon bantuan verifikasi pembayaran manual. Terima kasih!`;
    return `https://wa.me/${DEFAULT_ADMIN_WA}?text=${encodeURIComponent(text)}`;
  };

  async function handleCreateSumopodPayment(targetPlanSlug: string) {
    setSumopodLoading(targetPlanSlug);
    setMessage("Menghubungkan ke Sumopod Sandbox...");

    try {
      const res = await createSumopodSubscriptionPaymentAction(targetPlanSlug);

      if (res.success && res.orderId) {
        if (res.checkoutUrl) {
          window.open(res.checkoutUrl, "_blank");
        }
        setActivePaymentOrder({
          orderId: res.orderId,
          checkoutUrl: res.checkoutUrl,
          qrisContent: res.qrisContent,
          amount: res.amount,
          planSlug: targetPlanSlug,
        });
        setMessage(
          `Tagihan ${targetPlanSlug.toUpperCase()} (${res.orderId}) berhasil dibuat via Sumopod Pay Sandbox!`,
        );
      } else {
        if (res.orderId) {
          setActivePaymentOrder({
            orderId: res.orderId,
            planSlug: targetPlanSlug,
          });
        }
        setMessage(`Catatan Sumopod Sandbox: ${res.error || "Gagal membuat invoice."}`);
      }
    } catch (error) {
      console.error("Gagal membuat pembayaran Sumopod:", error);
      setMessage("Koneksi ke Sumopod gagal atau terlalu lama. Silakan coba lagi.");
    } finally {
      setSumopodLoading(null);
    }
  }

  async function handleCheckLiveSumopodStatus(orderIdToSync: string) {
    setSyncingOrderId(orderIdToSync);
    try {
      const res = await checkAndSyncSumopodPaymentStatusAction(orderIdToSync);

      if (res.success) {
        if (res.isPaid) {
          setMessage(
            `[Live API Sync] Transaksi ${orderIdToSync} LUNAS di Sumopod Gateway! Paket langganan Anda kini AKTIF.`,
          );
          setActivePaymentOrder(null);
          router.refresh();
        } else {
          setMessage(
            `[Live API Sync] Status transaksi ${orderIdToSync} di Sumopod API: ${res.status.toUpperCase()}`,
          );
        }
      } else {
        setMessage(`Gagal sync status: ${res.error}`);
      }
    } catch (error) {
      console.error("Gagal sync status Sumopod:", error);
      setMessage("Pengecekan status terlalu lama atau gagal terhubung ke Sumopod.");
    } finally {
      setSyncingOrderId(null);
    }
  }

  async function handleSimulateSandboxSuccess(orderIdToSimulate: string) {
    setSimulatingOrderId(orderIdToSimulate);
    const res = await simulateSumopodPaymentSandboxAction(orderIdToSimulate);
    setSimulatingOrderId(null);

    if (res.success) {
      setMessage(
        `[Sandbox Test] Pembayaran (${orderIdToSimulate}) berhasil disimulasikan! Paket langganan Anda kini AKTIF.`,
      );
      setActivePaymentOrder(null);
      router.refresh();
    } else {
      setMessage(`Gagal simulasi pembayaran: ${res.error}`);
    }
  }

  async function handleUpgradeRequest(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const formData = new FormData(e.currentTarget);
    const res = await requestSubscriptionUpgradeAction(formData);
    setLoading(false);

    if (res.success) {
      setMessage(
        "Pengajuan upgrade berhasil dicatat! Anda juga dapat langsung mengonfirmasi bukti transfer via WhatsApp ke Admin.",
      );
      setShowUpgradeForm(false);
    } else {
      setMessage("Gagal mengirim pengajuan: " + (res.error || "Terjadi kesalahan."));
    }
  }

  return (
    <div className="max-w-4xl space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight">
          <CreditCard className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          Paket Langganan & Billing Toko
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pantau status aktif paket, sisa hari, kuota produk, serta kelola perpanjangan & konfirmasi
          pembayaran via WhatsApp.
        </p>
      </div>

      {/* Alerts */}
      {status === "suspended" && (
        <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-500/20 dark:bg-rose-500/10">
          <Ban className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />
          <div>
            <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">
              Akun Ditangguhkan (Suspended)
            </p>
            <p className="mt-0.5 text-xs text-rose-500 dark:text-rose-400/80">
              Akun toko Anda saat ini ditangguhkan. Silakan hubungi Customer Support via WhatsApp
              untuk bantuan pengaktifan kembali.
            </p>
          </div>
        </div>
      )}

      {status === "pending_approval" && (
        <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-500/20 dark:bg-blue-500/10">
          <Clock className="mt-0.5 h-5 w-5 shrink-0 text-blue-500" />
          <div className="space-y-1">
            <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
              Menunggu Verifikasi Pembayaran Admin
            </p>
            <p className="text-xs text-blue-600/90 dark:text-blue-400/80">
              Pengajuan perpanjangan Anda sedang ditinjau. Untuk mempercepat proses verifikasi, Anda
              bisa langsung mengirim bukti transfer ke WhatsApp Admin.
            </p>
            <div className="pt-1">
              <a
                href={buildWhatsAppUpgradeUrl(
                  plan === "free_trial" ? "Pro Plan" : plan,
                  "Konfirmasi Transfer",
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-emerald-500"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                Kirim Bukti Transfer via WA
              </a>
            </div>
          </div>
        </div>
      )}

      {isExpired && status === "active" && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/20 dark:bg-amber-500/10">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
          <div>
            <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">
              Masa Langganan Telah Expired
            </p>
            <p className="mt-0.5 text-xs text-amber-600/90 dark:text-amber-400/80">
              Masa aktif paket toko Anda sudah berakhir. Lakukan perpanjangan agar katalog & fitur
              toko tetap berjalan optimal.
            </p>
          </div>
        </div>
      )}

      {message && (
        <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          {message}
        </div>
      )}

      {/* Sumopod Active Payment Banner & Sandbox Test Tool */}
      {activePaymentOrder && (
        <div className="space-y-3 rounded-2xl border-2 border-amber-500/30 bg-amber-500/10 p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-amber-500 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                  Sumopod Pay Sandbox
                </span>
                <span className="font-mono text-xs font-bold text-foreground">
                  Order ID: {activePaymentOrder.orderId}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Tagihan pembayaran QRIS telah dibuat di Sumopod Payment Gateway Sandbox.
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground"
              onClick={() => setActivePaymentOrder(null)}
            >
              Tutup
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-amber-500/20 pt-2">
            {activePaymentOrder.checkoutUrl && (
              <a
                href={activePaymentOrder.checkoutUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shadow-xs inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-amber-500"
              >
                <ExternalLink className="h-3.5 w-3.5" /> Buka Halaman Bayar Sumopod
              </a>
            )}

            <Button
              onClick={() => handleCheckLiveSumopodStatus(activePaymentOrder.orderId)}
              disabled={syncingOrderId === activePaymentOrder.orderId}
              className="shadow-xs flex items-center gap-1.5 rounded-xl bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-500"
            >
              {syncingOrderId === activePaymentOrder.orderId ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <ShieldCheck className="h-3.5 w-3.5" />
              )}
              Cek Status Live API (Sumopod)
            </Button>
          </div>
        </div>
      )}

      {/* Current Plan Card */}
      <div className="space-y-6 rounded-2xl border bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
          <div className="flex items-center gap-3.5">
            <div
              className={`rounded-2xl p-3 ${
                plan === "enterprise"
                  ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400"
                  : plan === "pro"
                    ? "bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400"
                    : "bg-slate-100 text-slate-500 dark:bg-slate-800"
              }`}
            >
              {plan === "enterprise" ? (
                <Sparkles className="h-6 w-6" />
              ) : plan === "pro" ? (
                <Crown className="h-6 w-6" />
              ) : (
                <Clock className="h-6 w-6" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold capitalize">
                  {plan === "enterprise"
                    ? "Enterprise Plan"
                    : plan === "pro"
                      ? "Pro Plan"
                      : plan === "starter"
                        ? "Starter Plan"
                        : "Free Trial"}
                </h2>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
                    status === "active"
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
                      : status === "suspended"
                        ? "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300"
                        : status === "pending_approval"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300"
                  }`}
                >
                  {status === "pending_approval" ? "Pending" : status}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {plan === "pro"
                  ? "Rp165.000 / tahun"
                  : plan === "starter"
                    ? "Rp20.000 / 1 bulan"
                    : plan === "enterprise"
                      ? "Custom Plan"
                      : "Gratis — 90 hari percobaan"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={buildWhatsAppUpgradeUrl(
                plan === "free_trial" ? "Pro Plan" : plan,
                "Tanya Admin",
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-emerald-500"
            >
              <MessageCircle className="h-4 w-4" />
              Konsultasi / Perpanjang WA
            </a>
          </div>
        </div>

        {/* Usage Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Product Usage */}
          <div className="space-y-2.5 rounded-xl border bg-muted/40 p-4">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-medium text-muted-foreground">
                <Package className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Kuota Produk
              </span>
              <span className="font-bold tabular-nums">
                {productCount} / {maxProducts} produk
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  usagePercent >= 90
                    ? "bg-rose-500"
                    : usagePercent >= 75
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                }`}
                style={{ width: `${Math.min(usagePercent, 100)}%` }}
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              {usagePercent >= 100
                ? "Batas kuota tercapai — upgrade paket untuk menambah produk lagi."
                : `${maxProducts - productCount} sisa kuota penambahan produk.`}
            </p>
          </div>

          {/* Landing Pages */}
          <div className="space-y-2.5 rounded-xl border bg-muted/40 p-4">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-medium text-muted-foreground">
                <FileCode className="h-4 w-4 text-purple-600 dark:text-purple-400" /> Landing Page
                Builder
              </span>
              <span className="font-bold tabular-nums">Maks. {maxLandingPages} Halaman</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full w-full rounded-full bg-purple-500" />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Fitur landing page khusus promosi produk / penawaran spesial.
            </p>
          </div>
        </div>

        {/* Expiration */}
        {expiresAt && (
          <div className="flex items-center justify-between gap-3 rounded-xl border bg-muted/30 p-3.5 text-xs">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>
                Masa Aktif Berakhir:{" "}
                <strong
                  className={`font-semibold ${isExpired ? "text-rose-500" : isExpiringSoon ? "text-amber-500" : "text-foreground"}`}
                >
                  {new Date(expiresAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </strong>
                {isExpiringSoon && (
                  <span className="ml-1.5 font-bold text-amber-600 dark:text-amber-400">
                    (Segera Habis)
                  </span>
                )}
                {isExpired && (
                  <span className="ml-1.5 font-bold text-rose-600 dark:text-rose-400">
                    (Expired)
                  </span>
                )}
              </span>
            </div>

            <a
              href={buildWhatsAppUpgradeUrl(
                plan === "free_trial" ? "Pro Plan" : plan,
                "Perpanjang Masa Aktif",
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
            >
              Perpanjang Sekarang <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}
      </div>

      {/* Available Plans Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-lg font-bold">
            <Crown className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            Pilihan Paket Langganan KatalogHub
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(plans.length > 0
            ? plans
            : [
                {
                  id: "1",
                  slug: "free_trial",
                  name: "Free Trial",
                  price: 0,
                  price_label: "Gratis",
                  billing_period: "3 bulan",
                  duration_days: 90,
                  max_products: 5,
                  max_landing_pages: 1,
                  features: [
                    "Katalog online publik",
                    "Subdomain toko",
                    "5 produk",
                    "1 custom landing page",
                    "WhatsApp order integration",
                  ],
                  is_active: true,
                  is_popular: false,
                  sort_order: 1,
                  created_at: "",
                  updated_at: "",
                },
                {
                  id: "starter-plan",
                  slug: "starter",
                  name: "Starter",
                  price: 20000,
                  price_label: "Rp20.000",
                  billing_period: "1 bulan",
                  duration_days: 30,
                  max_products: 20,
                  max_landing_pages: 0,
                  features: [
                    "Katalog online publik",
                    "Subdomain toko",
                    "20 produk",
                    "Tanpa custom landing page",
                    "Masa aktif 1 bulan",
                    "WhatsApp order integration",
                  ],
                  is_active: true,
                  is_popular: false,
                  sort_order: 2,
                  created_at: "",
                  updated_at: "",
                },
                {
                  id: "2",
                  slug: "pro",
                  name: "Pro Plan",
                  price: 165000,
                  price_label: "Rp165.000",
                  billing_period: "per tahun",
                  duration_days: 365,
                  max_products: 200,
                  max_landing_pages: 2,
                  features: [
                    "Semua fitur Free Trial",
                    "200 produk",
                    "2 custom landing page",
                    "Masa aktif 1 tahun",
                    "Template spesifikasi produk",
                    "Import massal (Excel)",
                    "Prioritas support",
                  ],
                  is_active: true,
                  is_popular: true,
                  sort_order: 3,
                  created_at: "",
                  updated_at: "",
                },
                {
                  id: "3",
                  slug: "enterprise",
                  name: "Enterprise",
                  price: 0,
                  price_label: "Custom",
                  billing_period: "custom",
                  duration_days: 365,
                  max_products: 1000,
                  max_landing_pages: 50,
                  features: [
                    "Semua fitur Pro",
                    "Produk unlimited",
                    "Custom landing page unlimited",
                    "Custom domain / subdomain",
                    "Dedicated support",
                  ],
                  is_active: true,
                  is_popular: false,
                  sort_order: 4,
                  created_at: "",
                  updated_at: "",
                },
              ]
          ).map((p) => {
            const isCurrent = plan === p.slug;
            return (
              <div
                key={p.slug}
                className={`relative flex flex-col justify-between rounded-2xl border p-5 transition-all ${
                  p.is_popular
                    ? "border-purple-500 bg-purple-50/20 shadow-md ring-1 ring-purple-500/20 dark:bg-purple-500/5"
                    : isCurrent
                      ? "border-emerald-500 bg-emerald-50/20 dark:bg-emerald-500/5"
                      : "bg-card hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                {p.is_popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-purple-600 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                    Paling Populer
                  </span>
                )}

                <div className="space-y-4">
                  <div>
                    <h4 className="text-base font-bold">{p.name}</h4>
                    <div className="mt-1 flex items-baseline gap-1">
                      <span className="text-2xl font-extrabold tracking-tight">
                        {p.price_label ||
                          (p.price > 0 ? `Rp${p.price.toLocaleString("id-ID")}` : "Gratis")}
                      </span>
                      <span className="text-xs text-muted-foreground">/ {p.billing_period}</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Batasan Kuota:
                    </p>
                    <div className="flex items-center gap-1.5 font-medium text-foreground">
                      <Check className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                      <span>
                        Hingga <strong>{p.max_products}</strong> produk
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 font-medium text-foreground">
                      <Check className="h-3.5 w-3.5 shrink-0 text-purple-600" />
                      <span>
                        Hingga <strong>{p.max_landing_pages}</strong> custom landing page
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 border-t pt-2 text-xs">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Fitur Utama:
                    </p>
                    {p.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-muted-foreground">
                        <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 space-y-2 border-t pt-5">
                  {isCurrent ? (
                    <Button
                      disabled
                      className="w-full bg-emerald-600 text-xs font-semibold text-white opacity-90"
                    >
                      <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                      Paket Aktif Saat Ini
                    </Button>
                  ) : p.price > 0 ? (
                    <>
                      <Button
                        onClick={() => handleCreateSumopodPayment(p.slug)}
                        disabled={sumopodLoading === p.slug}
                        className={`flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold shadow-sm transition-all ${
                          p.is_popular
                            ? "bg-purple-600 text-white hover:bg-purple-500"
                            : "bg-primary text-primary-foreground hover:bg-primary/90"
                        }`}
                      >
                        {sumopodLoading === p.slug ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <CreditCard className="h-4 w-4" />
                        )}
                        {sumopodLoading === p.slug
                          ? "Membuat Tagihan..."
                          : `Bayar Instan QRIS (Sumopod)`}
                      </Button>

                      <a
                        href={buildWhatsAppUpgradeUrl(
                          p.name,
                          p.price_label || `Rp${p.price.toLocaleString("id-ID")}`,
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full py-1 text-center text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
                      >
                        atau Chat WA Admin
                      </a>
                    </>
                  ) : (
                    <a
                      href={buildWhatsAppUpgradeUrl(
                        p.name,
                        p.price_label || `Rp${p.price.toLocaleString("id-ID")}`,
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Hubungi Admin
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Manual Payment Information Card */}
      <div className="space-y-4 rounded-2xl border bg-card p-6">
        <h3 className="flex items-center gap-2 text-base font-bold">
          <Building className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          Petunjuk Pembayaran Transfer Bank Manual
        </h3>
        <p className="text-xs text-muted-foreground">{paymentInstructions}</p>

        {bankAccounts.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 pt-1 md:grid-cols-2">
            {bankAccounts.map((acc) => (
              <div
                key={acc.id}
                className="space-y-1.5 rounded-xl border bg-slate-50 p-4 dark:bg-slate-900/50"
              >
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {acc.bank_name}
                </p>
                <p className="font-mono text-lg font-extrabold tracking-wider text-foreground">
                  {acc.account_number}
                </p>
                <p className="text-xs text-muted-foreground">{acc.account_holder}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border bg-slate-50 p-4 text-center dark:bg-slate-900/50">
            <p className="text-xs text-muted-foreground">
              Hubungi WhatsApp admin untuk informasi rekening pembayaran.
            </p>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-2">
          {!showUpgradeForm ? (
            <Button
              onClick={() => setShowUpgradeForm(true)}
              variant="outline"
              className="text-xs font-semibold"
            >
              Catat Pengajuan Transfer di Sistem
            </Button>
          ) : (
            <form
              onSubmit={handleUpgradeRequest}
              className="w-full space-y-4 rounded-xl border bg-muted/20 p-4"
            >
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Paket yang Dibayar</Label>
                <select
                  name="targetPlan"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  value={selectedPlanSlug}
                  onChange={(e) => setSelectedPlanSlug(e.target.value)}
                >
                  <option value="starter">Starter Plan — Rp20.000 / 1 bulan</option>
                  <option value="pro">Pro Plan — Rp165.000 / per tahun</option>
                  <option value="enterprise">Enterprise Plan — Custom</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">
                  Catatan / No. Referensi Transfer (opsional)
                </Label>
                <Input
                  name="paymentNotes"
                  placeholder="Contoh: Transfer BCA a.n Budi Prasetyo, Rp165.000"
                  className="text-sm"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-emerald-600 text-xs text-white hover:bg-emerald-500"
                >
                  {loading && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                  Simpan Pengajuan
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="text-xs"
                  onClick={() => setShowUpgradeForm(false)}
                >
                  Batal
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Payment History Log Table */}
      <div className="space-y-4 rounded-2xl border bg-card p-6">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-base font-bold">
            <History className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            Riwayat Pembayaran & Transaksi Manual
          </h3>
          <span className="text-xs text-muted-foreground">{payments.length} transaksi dicatat</span>
        </div>

        {payments.length === 0 ? (
          <div className="rounded-xl border border-dashed bg-muted/20 p-8 text-center">
            <p className="text-sm font-medium text-muted-foreground">
              Belum ada riwayat pembayaran yang dicatat.
            </p>
            <p className="mt-1 text-xs text-muted-foreground/80">
              Setiap pembayaran yang dikonfirmasi oleh Admin akan tampil di sini secara transparan.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full text-left text-xs">
              <thead className="border-b bg-muted/50 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Tanggal</th>
                  <th className="px-4 py-3">Paket</th>
                  <th className="px-4 py-3">Metode</th>
                  <th className="px-4 py-3">Nominal</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Catatan / Ref</th>
                  <th className="px-4 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {payments.map((p) => (
                  <tr key={p.id} className="transition-colors hover:bg-muted/30">
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-muted-foreground">
                      {new Date(p.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3 font-semibold uppercase text-foreground">
                      {p.plan_slug}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {p.payment_method || "Manual Transfer"}
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {p.amount > 0 ? `Rp${p.amount.toLocaleString("id-ID")}` : "Gratis / Promo"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          p.status === "completed"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
                            : p.status === "pending"
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300"
                              : "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="max-w-xs truncate px-4 py-3 text-muted-foreground">
                      {p.reference_note || "-"}
                    </td>
                    <td className="px-4 py-3">
                      {p.status === "pending" && p.order_id && (
                        <div className="flex items-center gap-1.5">
                          {p.checkout_url && (
                            <a
                              href={p.checkout_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rounded bg-amber-500 px-2 py-1 text-[10px] font-bold text-white transition-colors hover:bg-amber-600"
                            >
                              Bayar
                            </a>
                          )}
                          <button
                            onClick={() => handleCheckLiveSumopodStatus(p.order_id!)}
                            disabled={syncingOrderId === p.order_id}
                            className="rounded bg-emerald-600 px-2 py-1 text-[10px] font-bold text-white transition-colors hover:bg-emerald-500 disabled:opacity-50"
                          >
                            {syncingOrderId === p.order_id ? "Syncing..." : "Sync Status API"}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
