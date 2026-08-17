import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ProductForm } from "@/components/admin/product-form";
import { fetchCategories } from "@/lib/actions/category-actions";
import { createAdminClient } from "@/lib/supabase/server";
import type { CategorySpecField } from "@/lib/db/types";

export default async function NewProductPage() {
  const { items: categories } = await fetchCategories().catch(() => ({ items: [], total: 0 }));
  if (categories.length === 0) {
    return (
      <div className="space-y-6">
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link href="/admin/products">
            <ChevronLeft className="h-4 w-4" />
            Kembali
          </Link>
        </Button>
        <EmptyState
          title="Belum ada kategori"
          description="Buat kategori terlebih dahulu sebelum menambahkan produk."
        />
      </div>
    );
  }

  const fieldsByCategory = await loadFieldsByCategory(
    categories.map((c) => c.id),
  );

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href="/admin/products">
          <ChevronLeft className="h-4 w-4" />
          Kembali
        </Link>
      </Button>
      <PageHeader title="Tambah Produk" description="Lengkapi data produk baru di bawah ini." />
      <ProductForm
        mode="create"
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        fieldsByCategory={fieldsByCategory}
      />
    </div>
  );
}

async function loadFieldsByCategory(categoryIds: string[]) {
  const supabase = createAdminClient();
  const { data: templates } = await supabase
    .from("category_spec_templates")
    .select("id, category_id, is_active")
    .in("category_id", categoryIds);
  const tplList = (templates ?? []) as {
    id: string;
    category_id: string;
    is_active: boolean;
  }[];
  const tplIds = tplList.map((t) => t.id);

  let fields: CategorySpecField[] = [];
  if (tplIds.length > 0) {
    const { data: fieldsData } = await supabase
      .from("category_spec_fields")
      .select("*")
      .in("template_id", tplIds)
      .order("sort_order", { ascending: true });
    fields = (fieldsData ?? []) as CategorySpecField[];
  }

  const result: Record<string, { template_id: string; is_active: boolean; fields: CategorySpecField[] }> = {};
  for (const t of tplList) {
    result[t.category_id] = {
      template_id: t.id,
      is_active: t.is_active,
      fields: fields.filter((f) => f.template_id === t.id),
    };
  }
  return result;
}