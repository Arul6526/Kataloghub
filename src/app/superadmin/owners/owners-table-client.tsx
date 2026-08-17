"use client";

import { useState } from "react";
import type { OwnerOverviewItem } from "@/lib/actions/saas-actions";
import { quickExtendSubscriptionAction } from "@/lib/actions/saas-actions";
import { EditSubscriptionModal } from "@/components/saas/edit-subscription-modal";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import {
  Search,
  Settings2,
  ExternalLink,
  Package,
  Store,
  Calendar,
  Filter,
  Eye,
  AlertTriangle,
  Clock,
  Loader2,
  Download,
} from "lucide-react";
import Link from "next/link";

export function OwnersTableClient({ initialOwners }: { initialOwners: OwnerOverviewItem[] }) {
  const { toast } = useToast();
  const [owners, setOwners] = useState(initialOwners);
  const [searchLocal, setSearchLocal] = useState("");
  const [filterPlan, setFilterPlan] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterExpiringOnly, setFilterExpiringOnly] = useState(false);
  const [extendingId, setExtendingId] = useState<string | null>(null);

  const [selectedOwner, setSelectedOwner] = useState<OwnerOverviewItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  function handleExportCSV() {
    if (filtered.length === 0) {
      toast({ variant: "error", title: "Tidak ada data untuk diekspor" });
      return;
    }

    const headers = ["Nama Brand", "Email Owner", "Slug Subdomain", "Paket Langganan", "Status", "Jumlah Produk", "Tanggal Terdaftar", "Tanggal Expired"];
    const rows = filtered.map((o) => [
      `"${(o.brandName || "").replace(/"/g, '""')}"`,
      `"${(o.email || "").replace(/"/g, '""')}"`,
      `"${o.storeSlug || ""}"`,
      `"${(o.subscription?.plan_name || "free_trial").replace(/"/g, '""')}"`,
      `"${o.subscription?.status || "active"}"`,
      o.productCount,
      `"${new Date(o.createdAt).toLocaleDateString("id-ID")}"`,
      `"${o.subscription?.expires_at ? new Date(o.subscription.expires_at).toLocaleDateString("id-ID") : "-"}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `kataloghub-owners-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      variant: "success",
      title: "Export CSV Berhasil",
      description: `${filtered.length} data store owner berhasil diunduh.`,
    });
  }

  async function handleQuickExtend(userId: string, brandName: string) {
    setExtendingId(userId);
    try {
      const res = await quickExtendSubscriptionAction(userId, 30);
      if (!res.success) throw new Error(res.error || "Gagal memperpanjang");
      toast({
        variant: "success",
        title: "Berhasil memperpanjang",
        description: `Masa aktif ${brandName} ditambah 30 hari.`,
      });
      // Local optimistic update
      setOwners((prev) =>
        prev.map((o) => {
          if (o.userId !== userId) return o;
          const currentExp = o.subscription?.expires_at ? new Date(o.subscription.expires_at) : new Date();
          const base = currentExp > new Date() ? currentExp : new Date();
          const newExp = new Date(base.getTime() + 30 * 86400000).toISOString();
          return {
            ...o,
            subscription: o.subscription
              ? { ...o.subscription, status: "active", expires_at: newExp }
              : null,
          };
        })
      );
    } catch (err) {
      toast({
        variant: "error",
        title: "Gagal perpanjang",
        description: err instanceof Error ? err.message : "Terjadi kesalahan",
      });
    } finally {
      setExtendingId(null);
    }
  }

  const filtered = owners.filter((o) => {
    const searchMatch =
      !searchLocal ||
      o.email.toLowerCase().includes(searchLocal.toLowerCase()) ||
      (o.brandName ?? "").toLowerCase().includes(searchLocal.toLowerCase()) ||
      (o.fullName ?? "").toLowerCase().includes(searchLocal.toLowerCase()) ||
      (o.storeSlug ?? "").toLowerCase().includes(searchLocal.toLowerCase());

    const planMatch = filterPlan === "all" || o.subscription?.plan_name === filterPlan;
    const statusMatch = filterStatus === "all" || o.subscription?.status === filterStatus;

    const expiresAt = o.subscription?.expires_at;
    const isExpiringSoon =
      expiresAt &&
      o.subscription?.status === "active" &&
      new Date(expiresAt) > new Date() &&
      new Date(expiresAt) <= new Date(Date.now() + 7 * 86400000);

    const expiringMatch = !filterExpiringOnly || Boolean(isExpiringSoon);

    return searchMatch && planMatch && statusMatch && expiringMatch;
  });

  return (
    <>
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input
            aria-label="Cari toko, nama owner, atau email"
            placeholder="Cari nama toko, email owner, atau slug..."
            value={searchLocal}
            onChange={(e) => setSearchLocal(e.target.value)}
            className="pl-9 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-400 h-10 sm:h-9 text-xs focus-visible:ring-purple-500"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            onClick={() => setFilterExpiringOnly(!filterExpiringOnly)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg border text-xs font-semibold transition-all ${
              filterExpiringOnly
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm"
                : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            Hampir Expired (&lt;7 Hari)
          </button>

          <Select value={filterPlan} onValueChange={setFilterPlan}>
            <SelectTrigger aria-label="Filter berdasarkan paket langganan" className="w-[130px] bg-zinc-900 border-zinc-800 text-zinc-200 h-10 sm:h-9 text-xs focus:ring-purple-500">
              <SelectValue placeholder="Semua Paket" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
              <SelectItem value="all">Semua Paket</SelectItem>
              <SelectItem value="free_trial">Free Trial</SelectItem>
              <SelectItem value="pro">Pro Plan</SelectItem>
              <SelectItem value="enterprise">Enterprise</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger aria-label="Filter berdasarkan status langganan" className="w-[130px] bg-zinc-900 border-zinc-800 text-zinc-200 h-10 sm:h-9 text-xs focus:ring-purple-500">
              <SelectValue placeholder="Semua Status" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending_approval">Pending</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-all shrink-0"
            title="Unduh Data CSV Owners"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Meta count */}
      <div className="mb-3 flex items-center justify-between text-xs text-zinc-400 font-mono">
        <div>
          Menampilkan <span className="text-zinc-100 font-semibold">{filtered.length}</span> dari{" "}
          <span className="text-zinc-100 font-semibold">{owners.length}</span> store owners
        </div>
        {filterExpiringOnly && (
          <span className="text-amber-400 font-sans font-medium flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Menampilkan toko hampir expired saja
          </span>
        )}
      </div>

      {/* Responsive Container: Desktop Table & Mobile Card List */}
      <div className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden shadow-sm">
        
        {/* Mobile View: Card Stack (< sm) */}
        <div className="block sm:hidden divide-y divide-zinc-800">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-zinc-400 text-xs">
              <Store className="w-6 h-6 mx-auto mb-2 text-zinc-400" />
              Tidak ada store owner ditemukan sesuai filter.
            </div>
          ) : (
            filtered.map((owner) => {
              const plan = owner.subscription?.plan_name || "free_trial";
              const status = owner.subscription?.status || "active";

              return (
                <div key={owner.userId} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-sm text-zinc-100">{owner.brandName}</p>
                      <p className="text-xs text-zinc-400 font-mono">{owner.email}</p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {owner.storeSlug && (
                        <Link
                          href={`/toko/${owner.storeSlug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold"
                          title="Lihat Toko Live"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Live
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          setSelectedOwner(owner);
                          setModalOpen(true);
                        }}
                        aria-label={`Kelola langganan ${owner.brandName}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600/20 text-purple-300 border border-purple-500/30 text-xs font-semibold"
                      >
                        <Settings2 className="w-3.5 h-3.5" />
                        Kelola
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs pt-1 border-t border-zinc-800/60">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase bg-zinc-800 text-zinc-300 border border-zinc-700">
                      {plan.replace("_", " ")}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                        status === "active"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : status === "suspended"
                          ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          : status === "pending_approval"
                          ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      {status === "pending_approval" ? "pending" : status}
                    </span>
                    <span className="text-zinc-400 font-mono text-[11px] ml-auto">
                      Produk: {owner.productCount} / {owner.subscription?.max_products ?? 5}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop View: Full Table (>= sm) */}
        <div className="hidden sm:block overflow-x-auto">
          <table aria-label="Daftar Store Owners dan Langganan KatalogHub" className="w-full text-left text-xs">
            <thead className="bg-zinc-950 text-zinc-400 text-[10px] font-mono font-semibold uppercase tracking-wider border-b border-zinc-800">
              <tr>
                <th className="px-4 py-3">Brand & Email Owner</th>
                <th className="px-4 py-3">Slug Subdomain</th>
                <th className="px-4 py-3">Paket</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Produk / Kuota</th>
                <th className="px-4 py-3">Expired</th>
                <th className="px-4 py-3 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 text-zinc-300">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-zinc-400 text-xs">
                    <Store className="w-6 h-6 mx-auto mb-2 text-zinc-400" />
                    Tidak ada store owner ditemukan sesuai filter.
                  </td>
                </tr>
              ) : (
                filtered.map((owner) => {
                  const plan = owner.subscription?.plan_name || "free_trial";
                  const status = owner.subscription?.status || "active";
                  const expiresAt = owner.subscription?.expires_at;

                  const isExpiringSoon =
                    expiresAt &&
                    status === "active" &&
                    new Date(expiresAt) > new Date() &&
                    new Date(expiresAt) <= new Date(Date.now() + 7 * 86400000);

                  return (
                    <tr key={owner.userId} className="hover:bg-zinc-800/50 transition-colors group">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-semibold text-zinc-100">{owner.brandName}</p>
                          <p className="text-[11px] text-zinc-400 font-mono">{owner.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {owner.storeSlug ? (
                          <Link
                            href={`/toko/${owner.storeSlug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-mono text-[11px] text-purple-400 hover:text-purple-300 transition-colors"
                          >
                            /toko/{owner.storeSlug}
                            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </Link>
                        ) : (
                          <span className="text-xs text-zinc-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${
                            plan === "enterprise"
                              ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                              : plan === "pro"
                              ? "bg-purple-500/10 text-purple-300 border border-purple-500/20"
                              : "bg-zinc-800 text-zinc-300 border border-zinc-700"
                          }`}
                        >
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
                              : status === "pending_approval"
                              ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          }`}
                        >
                          {status === "pending_approval" ? "pending" : status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 font-mono text-[11px]">
                          <Package className="w-3 h-3 text-zinc-400" />
                          <span className="font-semibold text-zinc-200">{owner.productCount}</span>
                          <span className="text-zinc-400">/</span>
                          <span className="text-zinc-400">{owner.subscription?.max_products ?? 5}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px]">
                        {expiresAt ? (
                          <span
                            className={
                              isExpiringSoon
                                ? "text-amber-400 font-semibold"
                                : new Date(expiresAt) < new Date()
                                ? "text-rose-400 font-semibold"
                                : "text-zinc-400"
                            }
                          >
                            {new Date(expiresAt).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        ) : (
                          <span className="text-zinc-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {owner.storeSlug && (
                            <Link
                              href={`/toko/${owner.storeSlug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2 py-1 rounded bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 text-xs font-medium transition-all"
                              title="Lihat Toko Live"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span className="hidden lg:inline">Toko</span>
                            </Link>
                          )}
                          <button
                            onClick={() => handleQuickExtend(owner.userId, owner.brandName || "Toko")}
                            disabled={extendingId === owner.userId}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 text-xs font-medium transition-all disabled:opacity-50"
                            title="Perpanjang 30 Hari Instan"
                          >
                            {extendingId === owner.userId ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                            ) : (
                              <Clock className="w-3.5 h-3.5 text-amber-400" />
                            )}
                            <span className="hidden xl:inline">+30d</span>
                          </button>
                          <button
                            onClick={() => {
                              setSelectedOwner(owner);
                              setModalOpen(true);
                            }}
                            aria-label={`Kelola langganan ${owner.brandName}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-medium transition-all"
                          >
                            <Settings2 className="w-3.5 h-3.5 text-purple-400" />
                            Kelola
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedOwner && (
        <EditSubscriptionModal
          userId={selectedOwner.userId}
          brandName={selectedOwner.brandName || "Toko"}
          email={selectedOwner.email}
          subscription={selectedOwner.subscription}
          open={modalOpen}
          onOpenChange={setModalOpen}
        />
      )}
    </>
  );
}
