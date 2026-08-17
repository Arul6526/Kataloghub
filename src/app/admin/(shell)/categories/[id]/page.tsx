import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { CategoryForm } from "@/components/admin/category-form";
import { fetchCategory } from "@/lib/actions/category-actions";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const category = await fetchCategory(id).catch(() => null);
  if (!category) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link href="/admin/categories">
            <ChevronLeft className="h-4 w-4" />
            Kembali
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href={`/admin/spec-templates?category=${category.id}`}>
            Kelola template spesifikasi
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
      <PageHeader
        title={`Edit Kategori · ${category.name}`}
        description="Ubah data kategori di bawah ini."
      />
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <CategoryForm mode="edit" category={category} />
      </div>
    </div>
  );
}