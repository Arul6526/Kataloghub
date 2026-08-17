import { createAdminClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SidebarBrand, SidebarNav } from "@/components/admin/sidebar";
import { HeaderUser } from "@/components/admin/header-user";
import { MobileNav } from "@/components/admin/mobile-nav";
import { SidebarProvider, SidebarToggleButton } from "@/components/admin/sidebar-context";
import { AdminContentWrapper } from "@/components/admin/admin-content-wrapper";
import type { SiteSettings } from "@/lib/db/types";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { publicUrl } from "@/lib/storage-url";

export const dynamic = "force-dynamic";

export default async function AdminShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const current = await getCurrentUser();
  if (!current) {
    redirect("/login");
  }

  const supabase = createAdminClient();
  const { data: settings } = await supabase
    .from("site_settings")
    .select("*")
    .eq("user_id", current.userId)
    .maybeSingle();

  const brandName = (settings as SiteSettings | null)?.brand_name ?? "KatalogHub";
  const storeSlug = (settings as SiteSettings | null)?.store_slug ?? "";
  const brandLogoUrl = publicUrl("brand-assets", (settings as SiteSettings | null)?.brand_logo_path);

  return (
    <SidebarProvider>
      <AdminContentWrapper brandName={brandName} email={current.email} storeSlug={storeSlug} brandLogoUrl={brandLogoUrl}>
        {children}
      </AdminContentWrapper>
    </SidebarProvider>
  );
}