import Link from "next/link";
import { Plus, Package } from "lucide-react";

export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ImportProductButton } from "./import-product-button";
import { ProductsTableClient } from "./products-table-client";
import { fetchProducts } from "@/lib/actions/product-actions";
import { fetchCategories } from "@/lib/actions/category-actions";
import { ExportImportActions } from "./export-import-actions";

const PAGE_SIZE = 20;

import { StarterTemplateSelector } from "@/components/admin/starter-template-selector";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; visible?: string; page?: string }>;
}) {
  const { q, category, visible, page: pageParam } = await searchParams;

  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const [{ items: products, total }, categories] = await Promise.all([
    fetchProducts({
      search: q,
      categoryId: category,
      visible: visible === "true" ? true : visible === "false" ? false : undefined,
      limit: PAGE_SIZE,
      offset,
    }).catch((e) => { console.error("fetchProducts error:", e); return { items: [], total: 0 }; }),
    fetchCategories().catch((e) => { console.error("fetchCategories error:", e); return { items: [], total: 0 }; }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const categoryOptions = categories.items.map((c: { id: string; name: string }) => ({ value: c.id, label: c.name }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Produk Katalog"
        description="Kelola produk etalase toko. Pilih Template Siap Pakai di bawah jika ingin seeding instan."
        actions={
          <div className="flex gap-2">
            <ExportImportActions />
            <ImportProductButton />
            <Button asChild>
              <Link href="/admin/products/new">
                <Plus className="h-4 w-4" />
                Tambah Produk
              </Link>
            </Button>
          </div>
        }
      />

      {total === 0 ? (
        <div className="space-y-6">
          <StarterTemplateSelector />
        </div>
      ) : (
        <ProductsTableClient
          products={products}
          categoryOptions={categoryOptions}
          searchParams={{ q: q ?? "", category: category ?? "", visible: visible ?? "" }}
          pagination={{ page, totalPages, total, pageSize: PAGE_SIZE }}
        />
      )}
    </div>
  );
}