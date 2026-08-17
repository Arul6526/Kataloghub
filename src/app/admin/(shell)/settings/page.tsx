import { PageHeader } from "@/components/admin/page-header";
import { SiteSettingsForm } from "@/components/admin/site-settings-form";
import { fetchSiteSettings } from "@/lib/actions/site-settings-actions";
import { fetchCurrentTemplateInfo } from "@/lib/actions/landing-actions";

export default async function SettingsPage() {
  const [settings, templateInfo] = await Promise.all([
    fetchSiteSettings(),
    fetchCurrentTemplateInfo().catch(() => ({ category_slug: null, language: "id" })),
  ]);

  return (
    <div className="space-y-6">
      {settings ? (
        <SiteSettingsForm initial={settings} templateInfo={templateInfo} />
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/30 py-16 text-center">
          <p className="text-sm font-medium text-foreground">Belum ada data pengaturan</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Jalankan migrasi seed terlebih dahulu untuk membuat baris site_settings.
          </p>
        </div>
      )}
    </div>
  );
}