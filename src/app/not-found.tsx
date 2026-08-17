import Link from "next/link";
import { Wrench } from "lucide-react";
import { PublicPageLayout } from "@/components/public/public-page-layout";

export default function NotFound() {
  return (
    <PublicPageLayout>
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary mb-6">
          <Wrench className="h-10 w-10" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Dalam Tahap Pengembangan
        </h1>
        <p className="text-muted-foreground mb-8 max-w-md">
          Maaf, halaman yang Anda tuju sedang dalam tahap pengembangan atau tidak ditemukan. Silakan kembali ke halaman utama.
        </p>
        <Link
          href="/"
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </PublicPageLayout>
  );
}
