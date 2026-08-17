import Link from "next/link";
import { Plus, FileCode } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { fetchCustomLandingPages } from "@/lib/actions/custom-landing-actions";
import { CustomPagesListClient } from "./list-client";

export default async function CustomPagesPage() {
  const pages = await fetchCustomLandingPages().catch(() => []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Custom Landing Page"
          description="Buat halaman landing custom dengan source code HTML/CSS/JS yang terhubung otomatis ke produk."
        />
        <Button asChild>
          <Link href="/admin/custom-pages/new">
            <Plus className="h-4 w-4" />
            Buat Halaman Baru
          </Link>
        </Button>
      </div>

      {pages.length === 0 ? (
        <EmptyState
          icon={<FileCode className="h-6 w-6" />}
          title="Belum ada custom landing page"
          description="Klik tombol 'Buat Halaman Baru' untuk mulai membuat halaman landing dengan source code kustom."
        />
      ) : (
        <CustomPagesListClient pages={pages} />
      )}
    </div>
  );
}
