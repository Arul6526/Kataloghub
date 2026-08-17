import { getSuperAdminStats, getStoreOwnersList, getSubscriptionPlans, getSuperAdminAnalytics, getPlatformAuditLogs } from "@/lib/actions/saas-actions";
import { SuperAdminAnalyticsCharts } from "./superadmin-analytics-chart";
import { AuditLogWidget } from "./audit-log-widget";
import Link from "next/link";
import {
  Users,
  CheckCircle2,
  AlertTriangle,
  Package,
  ArrowRight,
  Store,
  Clock,
  Ban,
  Crown,
  Sparkles,
  TrendingUp,
  ShieldAlert,
  Layers,
  Check,
  Eye,
  ExternalLink,
} from "lucide-react";

export default async function SuperAdminDashboard() {
  const stats = await getSuperAdminStats();
  const plans = await getSubscriptionPlans();
  const analyticsData = await getSuperAdminAnalytics();
  const auditLogs = await getPlatformAuditLogs();
  const recentOwners = await getStoreOwnersList();
  const topRecent = recentOwners.slice(0, 5);

  const activeRatio = stats.totalOwners > 0 ? Math.round((stats.activeSubscriptions / stats.totalOwners) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Top Header & Quick Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-mono font-medium mb-2">
            <Crown className="w-3.5 h-3.5" /> Platform Executive Summary
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            SaaS Control Center
          </h1>
          <p className="text-xs text-zinc-400 mt-1 max-w-xl">
            Pusat kendali operasional platform KatalogHub. Pantau pertumbuhan pemilik toko, kuota produk, dan konfirmasi perpanjangan langganan.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/superadmin/subscriptions"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 transition-all"
          >
            <Layers className="w-3.5 h-3.5 text-zinc-400" /> Atur Paket Langganan
          </Link>
          <Link
            href="/superadmin/owners"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Users className="w-3.5 h-3.5" /> Kelola Owners ({stats.totalOwners})
          </Link>
        </div>
      </div>

      {/* Asymmetric Metrics Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Metric 1: Total Owners & Active Ratio */}
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Toko Terdaftar & Rasio Aktif</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <Store className="w-4 h-4" />
            </div>
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-white">{stats.totalOwners}</span>
              <span className="text-xs text-zinc-400">Total Toko</span>
            </div>

            <div className="mt-3 space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-zinc-400">Langganan Aktif</span>
                <span className="font-mono font-semibold text-emerald-400">{stats.activeSubscriptions} toko ({activeRatio}%)</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${activeRatio}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Metric 2: Expiring Soon Alerts */}
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Perhatian Masa Aktif</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-amber-400">{stats.expiringSoon}</span>
              <span className="text-xs text-zinc-400">Toko Expired &lt; 7 Hari</span>
            </div>

            <p className="text-xs text-zinc-400 mt-2">
              {stats.expiringSoon > 0
                ? "Toko tersebut akan memerlukan perpanjangan atau approval manual oleh Super Admin."
                : "Semua toko memiliki masa aktif aman saat ini."}
            </p>
          </div>
        </div>

        {/* Metric 3: Total Platform Products & Infrastructure */}
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Total Katalog Produk</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Package className="w-4 h-4" />
            </div>
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-blue-400">{stats.totalProducts}</span>
              <span className="text-xs text-zinc-400">Produk Platform</span>
            </div>
            <p className="text-xs text-zinc-400 mt-2">
              Maksimal kuota per toko dikontrol secara dinamis sesuai paket langganan.
            </p>
          </div>
        </div>
      </div>

      {/* Analytics Charts & Growth Trends */}
      <SuperAdminAnalyticsCharts data={analyticsData} />

      {/* Plan Configuration Summary */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-400" /> Ringkasan Paket & Ketentuan Aktif
          </h2>
          <Link
            href="/superadmin/subscriptions"
            className="text-xs text-blue-400 hover:text-blue-300 font-medium"
          >
            Edit Konfigurasi →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {plans.map((p) => (
            <div key={p.id} className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-zinc-200">{p.name}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                  {p.billing_period}
                </span>
              </div>

              <div className="text-lg font-extrabold text-purple-300">
                {p.price_label || (p.price > 0 ? `Rp${p.price.toLocaleString("id-ID")}` : "Gratis")}
              </div>

              <div className="text-xs text-zinc-400 space-y-1 pt-1 border-t border-zinc-800">
                <p className="flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  Masa aktif: <span className="text-zinc-200 font-semibold">{p.duration_days} Hari</span>
                </p>
                <p className="flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  Kuota: <span className="text-zinc-200 font-semibold">{p.max_products} Produk</span>, {p.max_landing_pages} LP
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* High-Density Owners Table */}
      <div className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white">Store Owners Paling Baru</h2>
            <p className="text-xs text-zinc-400">Pendaftar toko terbaru di platform KatalogHub</p>
          </div>
          <Link
            href="/superadmin/owners"
            className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1"
          >
            Lihat Semua Owners ({stats.totalOwners}) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table aria-label="Store Owners Paling Baru" className="w-full text-left text-xs">
            <thead className="bg-zinc-950 text-zinc-400 text-[10px] font-mono font-semibold uppercase tracking-wider border-b border-zinc-800">
              <tr>
                <th className="px-4 py-3">Nama Toko & Email Owner</th>
                <th className="px-4 py-3">Slug Subdomain</th>
                <th className="px-4 py-3">Paket</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Produk</th>
                <th className="px-4 py-3">Terdaftar</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 text-zinc-300">
              {topRecent.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-zinc-400 text-xs">
                    Belum ada owner terdaftar.
                  </td>
                </tr>
              ) : (
                topRecent.map((owner) => {
                  const plan = owner.subscription?.plan_name || "free_trial";
                  const status = owner.subscription?.status || "active";

                  return (
                    <tr key={owner.userId} className="hover:bg-zinc-800/40 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-semibold text-white">{owner.brandName}</p>
                          <p className="text-[11px] text-zinc-400">{owner.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-purple-300">
                        {owner.storeSlug ? (
                          <Link
                            href={`/toko/${owner.storeSlug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline flex items-center gap-1"
                          >
                            /toko/{owner.storeSlug}
                            <ExternalLink className="w-3 h-3 text-zinc-400" />
                          </Link>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase bg-zinc-800 text-zinc-300 border border-zinc-700">
                          {plan.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                            status === "active"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : status === "suspended"
                              ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          }`}
                        >
                          {status}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono">
                        {owner.productCount} / {owner.subscription?.max_products ?? 5}
                      </td>
                      <td className="px-4 py-3 text-zinc-400 text-[11px]">
                        {new Date(owner.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {owner.storeSlug ? (
                          <Link
                            href={`/toko/${owner.storeSlug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 text-xs font-medium transition-all"
                            title="Lihat Toko Live"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Lihat</span>
                          </Link>
                        ) : (
                          <span className="text-zinc-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live System Audit & Activity Log */}
      <AuditLogWidget logs={auditLogs} />
    </div>
  );
}
