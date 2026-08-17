import { createAdminClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  ShoppingBag,
  MessageCircle,
  Calendar,
  User,
  DollarSign,
  TrendingUp,
  PackageCheck
} from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

export const dynamic = "force-dynamic";

export interface OrderLeadItem {
  id: string;
  store_slug: string;
  customer_name: string | null;
  items_summary: string;
  total_price: number;
  created_at: string;
}

export default async function OrdersPage() {
  const current = await getCurrentUser();
  if (!current) {
    redirect("/login");
  }

  const supabase = createAdminClient();

  let leads: OrderLeadItem[] = [];
  try {
    // Ambil store_slug milik user saat ini dari site_settings
    const { data: userSettings } = await supabase
      .from("site_settings")
      .select("store_slug")
      .eq("user_id", current.userId)
      .maybeSingle();

    const userStoreSlug = userSettings?.store_slug;

    // Filter order_leads berdasarkan user_id ATAU store_slug toko milik pengguna
    let query = supabase.from("order_leads").select("*");

    if (userStoreSlug) {
      query = query.or(`user_id.eq.${current.userId},store_slug.eq.${userStoreSlug}`);
    } else {
      query = query.eq("user_id", current.userId);
    }

    const { data } = await query.order("created_at", { ascending: false });

    leads = (data ?? []) as OrderLeadItem[];
  } catch (e) {
    console.warn("Fetch order leads warning:", e);
  }

  const totalOrders = leads.length;
  const totalValue = leads.reduce((acc, curr) => acc + (curr.total_price || 0), 0);

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground font-space">
            Riwayat Pesanan & Lead WA
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Daftar rekapitulasi transaksi pembeli yang melakukan order WhatsApp dari katalog Anda.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0">
            <MessageCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider font-mono">
              Total Order WA Klik
            </p>
            <p className="text-2xl font-extrabold text-foreground font-mono mt-0.5">
              {totalOrders} <span className="text-xs text-muted-foreground font-sans font-normal">Transaksi</span>
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider font-mono">
              Total Nilai Estimasi Pesanan
            </p>
            <p className="text-2xl font-extrabold text-foreground font-mono mt-0.5">
              {formatRupiah(totalValue)}
            </p>
          </div>
        </div>
      </div>

      {/* Leads Table */}
      {leads.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag />}
          title="Belum Ada Pesanan WhatsApp"
          description="Riwayat pesanan akan otomatis tercatat di sini saat pembeli melakukan order barang melalui WhatsApp dari katalog toko Anda."
        />
      ) : (
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b bg-muted/30 flex items-center justify-between">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <PackageCheck className="h-4 w-4 text-primary" /> Daftar Rekap Pesanan ({totalOrders})
            </h3>
            <span className="text-xs text-muted-foreground font-mono">Terurut terbaru</span>
          </div>

          <div className="divide-y divide-border/60">
            {leads.map((lead) => (
              <div key={lead.id} className="p-5 hover:bg-muted/20 transition-colors space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                    <User className="h-3.5 w-3.5 text-primary" />
                    <span>{lead.customer_name || "Pelanggan Katalog"}</span>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(lead.created_at)}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      Dikirim via WA
                    </span>
                  </div>
                </div>

                <div className="rounded-lg bg-muted/40 p-3 text-xs text-foreground/90 font-mono whitespace-pre-line leading-relaxed border border-border/50">
                  {lead.items_summary}
                </div>

                <div className="flex justify-between items-center text-xs pt-1">
                  <span className="text-muted-foreground">Estimasi Total Harga:</span>
                  <span className="font-mono font-bold text-sm text-primary">
                    {lead.total_price > 0 ? formatRupiah(lead.total_price) : "Sesuai konfirmasi"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
