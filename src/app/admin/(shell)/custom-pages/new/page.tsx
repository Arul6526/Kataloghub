import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/admin/page-header";
import { EditorClient } from "../[id]/editor-client";
import { fetchProducts } from "@/lib/actions/product-actions";

export default async function NewCustomPagePage() {
  const { items: products } = await fetchProducts({ limit: 200 }).catch(() => ({
    items: [],
    total: 0,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link href="/admin/custom-pages">
            <ChevronLeft className="h-4 w-4" />
            Kembali
          </Link>
        </Button>
      </div>
      <PageHeader
        title="Buat Custom Landing Page"
        description="Tulis source code HTML/CSS/JS dan sambungkan ke produk menggunakan token placeholder."
      />
      <EditorClient
        mode="new"
        initial={null}
        allProducts={products.map((p) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          category_name: p.category_name,
          main_image_path: p.main_image_path,
        }))}
      />
    </div>
  );
}
