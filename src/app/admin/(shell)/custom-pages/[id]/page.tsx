import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/admin/page-header";
import { EditorClient } from "./editor-client";
import { fetchCustomLandingPage } from "@/lib/actions/custom-landing-actions";
import { fetchProducts } from "@/lib/actions/product-actions";

export default async function EditCustomPagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [page, { items: products }] = await Promise.all([
    fetchCustomLandingPage(id).catch(() => null),
    fetchProducts({ limit: 200 }).catch(() => ({ items: [], total: 0 })),
  ]);

  if (!page) notFound();

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
        title={`Edit · ${page.title}`}
        description="Edit source code HTML/CSS/JS dan koneksi produk untuk halaman ini."
      />
      <EditorClient
        mode="edit"
        initial={page}
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
