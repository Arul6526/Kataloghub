import { AnalyticsSection } from "./analytics-section";

import { createAdminClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { EmptyState } from "@/components/ui/empty-state";
import { Package, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

import { StarterTemplateSelector } from "@/components/admin/starter-template-selector";

export default async function AdminDashboardPage() {
  const current = await getCurrentUser();
  const userId = current?.userId;

  const supabase = createAdminClient();
  let productCount = 0;
  let storeSlug: string | undefined;

  if (userId) {
    const [{ count: pCount }, { data: settings }] = await Promise.all([
      supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId),
      supabase
        .from("site_settings")
        .select("store_slug")
        .eq("user_id", userId)
        .maybeSingle(),
    ]);
    productCount = pCount ?? 0;
    storeSlug = settings?.store_slug;
  }

  const hasNoProducts = productCount === 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Overview Dashboard Toko</h1>
        <p className="text-sm text-muted-foreground mt-1">Kelola toko dan pantau performa etalase katalog Anda.</p>
      </div>

      {hasNoProducts && (
        <div className="space-y-6">
          <StarterTemplateSelector />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <AnalyticsSection storeSlug={storeSlug} />
        <DashboardStats userId={userId} />
      </div>
    </div>
  );
}

async function DashboardStats({ userId }: { userId?: string }) {
  if (!userId) return null;

  const supabase = createAdminClient();

  const [{ count: categoryCount }, { count: productCount }, { count: visibleProducts }, { count: landingVisible }, settingsResult] =
    await Promise.all([
      supabase.from("categories").select("*", { count: "exact", head: true }).eq("user_id", userId),
      supabase.from("products").select("*", { count: "exact", head: true }).eq("user_id", userId),
      supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("is_visible", true)
        .not("main_image_path", "is", null),
      supabase
        .from("landing_sections")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("is_visible", true),
      supabase.from("site_settings").select("*").eq("user_id", userId).maybeSingle(),
    ]);

  const settings = settingsResult.data;
  const whatsappOk = Boolean(settings?.whatsapp_number && settings?.whatsapp_template);

  return (
    <div className="rounded-lg border bg-card/80 backdrop-blur-sm shadow-sm">
      <div className="border-b px-5 py-4">
        <h3 className="font-semibold tracking-tight">Kondisi Sistem</h3>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-6 p-5 xl:grid-cols-3">
        <LedgerItem label="Kategori" value={categoryCount ?? 0} hint="Total terdaftar" tooltipInfo="Jumlah total kategori produk yang ada di sistem." className="p-0 hover:bg-transparent" />
        <LedgerItem label="Produk" value={productCount ?? 0} hint="Total terdaftar" tooltipInfo="Jumlah semua produk, baik yang aktif maupun draft." className="p-0 hover:bg-transparent" />
        <LedgerItem label="Produk Tampil" value={visibleProducts ?? 0} hint="Sistem mendeteksi foto utama" tooltipInfo="Produk yang statusnya 'Visible' dan memiliki minimal foto utama, sehingga tampil di halaman publik." className="p-0 hover:bg-transparent" />
        
        <LedgerItem 
          label="Section Landing" 
          value={landingVisible ?? 0} 
          hint="Blok aktif di halaman utama" 
          tooltipInfo="Jumlah section/blok konten yang saat ini aktif di Landing Page bawaan."
          className="p-0 hover:bg-transparent"
        />
        <LedgerItem 
          label="WhatsApp CTA" 
          value={whatsappOk ? "Aktif" : "Belum"} 
          hint={whatsappOk ? "Rute integrasi siap" : "Perlu pengaturan nomor"} 
          status={whatsappOk ? "success" : "warning"} 
          tooltipInfo="Status integrasi tombol WhatsApp. Jika aktif, pengunjung dapat memesan langsung ke nomor Anda."
          className="p-0 hover:bg-transparent"
        />
        <LedgerItem 
          label="Brand" 
          value={settings?.brand_name ?? "—"} 
          hint={settings?.brand_tagline ?? "Tagline belum diatur"} 
          tooltipInfo="Nama brand yang muncul di header situs publik. Dapat diubah di menu Settings."
          className="p-0 hover:bg-transparent"
        />
      </div>
    </div>
  );
}

function LedgerItem({
  label,
  value,
  hint,
  status = "default",
  className = "",
  tooltipInfo,
}: {
  label: string;
  value: number | string;
  hint?: string;
  status?: "default" | "success" | "warning";
  className?: string;
  tooltipInfo?: string;
}) {
  const isNumber = typeof value === "number";
  const valueClass = isNumber ? "font-mono text-2xl" : "text-xl";
  const colorClass =
    status === "success"
      ? "text-emerald-500"
      : status === "warning"
        ? "text-amber-500"
        : "text-foreground";

  return (
    <div className={`group relative flex flex-col justify-between gap-6 p-5 transition-colors hover:bg-muted/30 ${className}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {tooltipInfo && (
          <div className="flex h-5 w-5 cursor-help items-center justify-center rounded-full bg-muted text-xs text-muted-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
            ?
          </div>
        )}
      </div>
      <div>
        <p className={`font-bold tracking-tight ${valueClass} ${colorClass}`}>{value}</p>
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </div>

      {/* Tooltip Content */}
      {tooltipInfo && (
        <div className="pointer-events-none absolute -top-12 left-1/2 z-50 w-48 -translate-x-1/2 translate-y-2 rounded-md bg-foreground px-3 py-2 text-center text-xs text-background opacity-0 shadow-md transition-all group-hover:-translate-y-1 group-hover:opacity-100">
          {tooltipInfo}
          <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-foreground"></div>
        </div>
      )}
    </div>
  );
}