import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { ProductForm } from "@/components/admin/product-form";
import { DeleteProductButton } from "./delete-button";
import { fetchProductDetail } from "@/lib/actions/product-actions";
import { fetchCategories } from "@/lib/actions/category-actions";
import { createAdminClient } from "@/lib/supabase/server";
import type { CategorySpecField } from "@/lib/db/types";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await fetchProductDetail(id).catch(() => null);
  if (!detail) notFound();

  const { items: categories } = await fetchCategories().catch(() => ({ items: [], total: 0 }));
  const fieldsByCategory = await loadFieldsByCategory(categories.map((c) => c.id));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link href="/admin/products">
            <ChevronLeft className="h-4 w-4" />
            Kembali
          </Link>
        </Button>
        <DeleteProductButton id={detail.product.id} name={detail.product.name} />
      </div>
      <PageHeader
        title={`Edit Produk · ${detail.product.name}`}
        description="Ubah data, media, spesifikasi, dan dokumen produk."
      />
      <ProductForm
        mode="edit"
        initial={detail}
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
  const tplList = (templates ?? []) as { id: string; category_id: string; is_active: boolean }[];
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