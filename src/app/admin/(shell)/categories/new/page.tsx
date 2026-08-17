import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { CategoryForm } from "@/components/admin/category-form";

export default function NewCategoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2">
          <Link href="/admin/categories">
            <ChevronLeft className="h-4 w-4" />
            Kembali
          </Link>
        </Button>
      </div>
      <PageHeader title="Tambah Kategori" description="Lengkapi data kategori baru di bawah ini." />
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <CategoryForm mode="create" />
      </div>
    </div>
  );
}